const DETECTION_API_URL = "https://ubiquitous-cod-9g575xr4x7gc764g-5000.app.github.dev";

async function getFileFromURL(url, fileName) {
	let res = await fetch(url);
	res = await res.blob();
	const file = new File([res], fileName, { type: res.type });
	return file;
}

async function detectAI(url, fileType) {
	let fileName, endpoint;
	if (fileType.includes("image")) {
		fileName = "image.jpg";
		endpoint = "detect_image";
	} else if (fileType.includes("video")) {
		fileName = "video.mp4";
		endpoint = "detect_video";
	}

	const file = await getFileFromURL(url, fileName);

	const formData = new FormData();
	formData.append("file", file);

	let detectionResponse = await fetch(`${DETECTION_API_URL}/${endpoint}`, {
		method: "POST",
		body: formData,
		contentType: "multipart/form-data",
	});
	let detectionResponseText = await detectionResponse.text();

	return detectionResponseText;
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

chrome.runtime.onMessage.addListener(async (msg) => {
	// First, validate the message's structure.
	const fromFilter = ["content", "menu"];
	if (!fromFilter.includes(msg.from)) return;

	// Handle the message
	if (msg.subject === "detectionRequest") {
		let popupTabId = await createPopup(msg.top, msg.left, {
			popupType: "loader",
			data: { mediaUrl: msg.mediaUrl, text: "Detecting..." },
		});

		// run the image through detection api
		const res = await detectAI(msg.mediaUrl, msg.fileType);

		//create popup to show results
		updatePopup(popupTabId, { popupType: "result", data: { mediaUrl: msg.mediaUrl, result: res } });
	} else if (msg.subject === "protectionRequest") {
		//create popup to show loading state
		createPopup(msg.top, msg.left, {
			popupType: "loader",
			data: {
				mediaUrl: msg.mediaUrl,
				text: "Protecting...",
			},
		});
	} else if (msg.subject === "protectionRequestClose") {
		//create popup to show results
		getCurrentTab().then((tab) => {
			chrome.tabs.sendMessage(tab.id, {
				from: "background",
				subject: "closePopup",
			});
		});
	}
});
