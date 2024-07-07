const DETECTION_API_URL = "https://56d0-119-161-98-139.ngrok-free.app/";
const PROTECTION_API_URL = "https://api.cortex.cerebrium.ai/v4/p-04c3d2f4/import-prot/predict";

async function getDataURL(file) {
  return new Promise((resolve) => {
    let reader = new FileReader();
    reader.onload = function () {
      resolve(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

async function getBlobFromURL(url) {
  let res = await fetch(url);
  res = await res.blob();
  return res;
}

async function getFileFromURL(url, fileName) {
  let res = await fetch(url);
  res = await res.blob();
  const file = new File([res], fileName, { type: res.type });
  return file;
}

async function detectAI(file) {
  let fileType = file.type;

  let endpoint;
  if (fileType.includes("image")) {
    endpoint = "detect_image";
  } else if (fileType.includes("video")) {
    endpoint = "detect_video";
  } else {
    console.error("Invalid file type");
    return "Invalid file type";
  }

  const formData = new FormData();
  formData.append("file", file);

  console.log("Detection input", file);
  console.log(await getDataURL(file));
  let detectionResponse = await fetch(`${DETECTION_API_URL}/${endpoint}`, {
    method: "POST",
    body: formData,
    contentType: "multipart/form-data",
  });
  console.log("Detection response", detectionResponse);
  let detectionResponseText = await detectionResponse.text();

  return detectionResponseText;
}

async function protectMedia(blob) {
  const dataUrl = await getDataURL(blob);

  const dataUrlPrefix = dataUrl.split(",")[0];
  const rawData = dataUrl.split(",")[1];

  const payload = JSON.stringify({
    prompt: rawData,
  });

  const rawResponse = await fetch(PROTECTION_API_URL, {
    method: "POST",
    headers: {
      Authorization:
        "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcm9qZWN0SWQiOiJwLTA0YzNkMmY0IiwiaWF0IjoxNzIwMjU1NTM4LCJleHAiOjIwMzU4MzE1Mzh9.A0uXE5QLD7T1mZhkbW7hnand4_mb2dTJnXnU8RI0AQBPJ31TxMiqLZk5zp4lG8lvn8LIvw9zEEoGHRZRNw1UjdPq33yhANNW_0OIf0aOBW4QhAwpMg0oCLLk0fz73bNTmKF0N5ilFpwGsUB9svrWpftFrejq_F4hUXkRAfqhD8G_TXqQFTqZiroH_OZFEN2mQTVvgvKmSDn8c1js9pUvNcfAG9f2X3flX3rnnG6QF9urOukbZx9E6brQKrYezVPgalFJNNRJsB29q15dW_Igv5zCj3Lka2716Jhs5P8hFPu3nOAHuyEADyS-dNRki8oNNrnKf5JehE0dHEXjpl9A0A",
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: payload,
  });

  const jsonResponse = await rawResponse.json();

  const protectedBlob = await getBlobFromURL(`${dataUrlPrefix},${jsonResponse.result}`);

  return protectedBlob;
}

async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

async function createPopup(top, left, popupData) {
  return new Promise((resolve) => {
    chrome.windows.create(
      {
        url: "actionPopup.html",
        type: "popup",
        width: 350,
        height: 500,
        focused: true,
        top: top + 15,
        left: left - 400,
      },
      function (window) {
        var createdTabId = window.tabs[0].id;

        // Wait for the tab to load
        chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
          if (info.status === "complete" && tabId === createdTabId) {
            chrome.tabs.onUpdated.removeListener(listener);

            // Now the tab is ready, inject the result
            chrome.tabs.sendMessage(createdTabId, {
              from: "background",
              subject: "dataForPopup",
              popupType: popupData.popupType,
              data: popupData.data,
            });

            resolve(createdTabId);
          }
        });
      }
    );
  });
}

function updatePopup(popupTabId, popupData) {
  chrome.tabs.sendMessage(popupTabId, {
    from: "background",
    subject: "dataForPopup",
    popupType: popupData.popupType,
    data: popupData.data,
  });
}

chrome.runtime.onMessage.addListener(async (msg, sender) => {
  // First, validate the message's structure.
  const fromFilter = ["content", "menu"];
  if (!fromFilter.includes(msg.from)) return;

  // Handle the message
  console.log("Message recieved", msg);

  const blob = await getBlobFromURL(msg.mediaUrl);

  if (msg.subject === "detectionRequest") {
    let popupTabId = await createPopup(msg.top, msg.left, {
      popupType: "loader",
      data: { mediaUrl: msg.mediaUrl, mediaType: blob.type, text: "Detecting..." },
    });

    let file;
    if (blob.type.includes("image")) {
      file = new File([blob], "image.jpg", { type: blob.type });
    } else if (blob.type.includes("video")) {
      file = new File([blob], "video.mp4", { type: blob.type });
    }

    const res = await detectAI(file);
    //create popup to show results
    updatePopup(popupTabId, {
      popupType: "result",
      data: { mediaUrl: msg.mediaUrl, mediaType: blob.type, result: res },
    });
  } else if (msg.subject === "protectionRequest") {
    //create popup to show loading state
    let popupTabId = await createPopup(msg.top, msg.left, {
      popupType: "loader",
      data: {
        mediaUrl: msg.mediaUrl,
        mediaType: blob.type,
        text: "Protecting...",
      },
    });

    const protectedBlob = await protectMedia(blob);

    chrome.tabs.sendMessage(popupTabId, {
      from: "background",
      subject: "closePopup",
    });

    if (msg.from === "menu") {
      // create a popup to download file
      await createPopup(msg.top, msg.left, {
        popupType: "fileDownloadPopup",
        data: {
          mediaUrl: msg.mediaUrl,
          fileName: "protected.jpg",
        },
      });
    } else {
      // send result back to sender
      chrome.tabs.sendMessage(sender.tab.id, {
        from: "background",
        subject: "protectionResponse",
        result: await getDataURL(protectedBlob),
      });
    }
  }
});
