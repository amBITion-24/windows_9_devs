const wrapper = document.body;

//function that calls protection api and replaces the image with the protected image
function handle_protection(document, event, listner_function) {
	event.stopPropagation();

	const file = event.target.files[0];
	const reader = new FileReader();

	reader.readAsDataURL(file);

	reader.onload = async function (readerEvent) {
		chrome.runtime.sendMessage({
			from: "content",
			subject: "protectionRequest",
			mediaUrl: readerEvent.target.result,
			left: window.screenLeft + window.outerWidth,
			top: window.screenTop,
		});
		let dataTransfer = new DataTransfer();
		const url = "https://api.cortex.cerebrium.ai/v4/p-574cb281/image-protection/predict";

		const payload = JSON.stringify({
			prompt: `${reader?.result?.split("base64,")[1]}`,
		});

		const headers = {
			Authorization:
				"Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcm9qZWN0SWQiOiJwLTU3NGNiMjgxIiwiaWF0IjoxNzE5MjIzOTMxLCJleHAiOjIwMzQ3OTk5MzF9.hzbpNocushgQE7n0w__0FlpLqTpIG2Lv8Iz_rd7R8Sk03KOAKWzTWaaJZXgPFP3lIQWwkSfK-8QC6_dlVXEFx1D5MK-R58B05KzfhF5q3JjC1AoDw-Bds474VtBjXQO_ntbUUUtLEocKoYgdLvH13GP4G82InGNLHsvIYDqvpyq-eyyf7-XeU0dlcwB4DumKADrWQh9D0ZfZbXDLg6GdbcesmRSctvqvVNJxwD_R-94NHVj02G-98PbAiw1EiMUgzxk5iPLy9-JEGboDS7xkE8_yOSO9wXNbvseZjuYgGktrTQBnw4Dn29fRiyc0-ThGkRrJ0-uyw-W3r-jExGc-UQ",
			"Content-Type": "application/json",
			Accept: "application/json",
		};
		const rawResponse = await fetch(url, {
			method: "POST",
			headers: headers,
			body: payload,
		});

		const content = await rawResponse.json();
		const blob = await fetch("data:image/png;base64," + content?.result).then((res) => res.blob());
		dataTransfer.items.add(
			new File([blob], "protected.png", {
				type: "image/png",
			})
		);

		//close loading tab
		chrome.runtime.sendMessage({
			from: "content",
			subject: "protectionRequestClose",
		});

		// Modify the files property
		event.target.files = dataTransfer.files;

		// Create and dispatch a new event
		document.removeEventListener("change", listner_function, { capture: true });
		const newEvent = new Event("change", { bubbles: true });
		event.target.dispatchEvent(newEvent);
	};
}

function sendMessageToBackground(eventName, mediaUrl, fileType) {
	chrome.runtime.sendMessage({
		from: "content",
		subject: eventName,
		mediaUrl,
		fileType,
		left: window.screenLeft + window.outerWidth,
		top: window.screenTop,
	});
}

//Event listener to listen for changes in the DOM and call the protection api for file uploads
document.addEventListener(
	"change",
	async function hack(event) {
		let consent = document.getElementById("consent");
		if (consent && !consent.checked) return;
		if (event?.target?.files[0]?.type?.split("/")[0] != "image") return;
		//instagram
		if (event.target.className == "_ac69") {
			event.stopPropagation();
			await handle_protection(document, event, hack);
			//whatsapp
		} else if (
			event.target.parentElement.className ==
			"x1c4vz4f xs83m0k xdl72j9 x1g77sc7 x78zum5 xozqiw3 x1oa3qoh x12fk4p8 xeuugli x2lwn1j x1nhvcw1 x1q0g3np x6s0dn4 x1ypdohk x1vqgdyp x1i64zmx x1gja9t"
		) {
			event.stopPropagation();
			await handle_protection(document, event, hack);
			//discord
		} else if (event.target.className == "file-input") {
			event.stopPropagation();
			await handle_protection(document, event, hack);
		}
	},
	true
);

wrapper.addEventListener("click", async (event) => {
	//checks if button click was detection button click and sends message to background.js
	//instagram
	if (event.target.id.startsWith("button-insta-image")) {
		value = event.target.parentElement?.children[0]?.children[0]?.children[0]?.children[0]?.src;
		if (!value) return;
		sendMessageToBackground("detectionRequest", value, "image/jpeg");
		//whatsapp audio
	} else if (event.target.id.startsWith("button-whatsapp-audio")) {
		console.log("send audio to https://ubiquitous-cod-9g575xr4x7gc764g-5000.app.github.dev/detect_audio");
	} else if (event.target.id.startsWith("button-insta-video")) {
		value = event.target.parentElement?.parentElement?.parentElement?.children[0]?.src;
		if (!value) return;
		sendMessageToBackground("detectionRequest", value, "video/mp4");
	} else if (event.target.id.startsWith("button-whatsapp-common")) {
    let fileType = "video/mp4";
		value = document.querySelector("video")?.src;
		if (!value) {
			//incase the modal was for an image and not a video, use the image
			img = document.getElementsByClassName(
				"x6s0dn4 x78zum5 x5yr21d xl56j7k x6ikm8r x10wlt62 x1n2onr6 xh8yej3 xhtitgo _ao3e"
			)[0];
			value = img?.src;
			fileType = "image/jpeg";
		}
		if (!value) return;
		sendMessageToBackground("detectionRequest", value, fileType);
	} else if (event.target.id.startsWith("button-discord-video")) {
		value = event.target?.parentElement?.children[0]?.children[0]?.children[0]?.children[0]?.src;
		if (!value) return;
		sendMessageToBackground("detectionRequest", value, "video/mp4");
	}
});

//function to append the button to the image
function inject_2() {
	//instagram
	appendDetectButton("_aagu");
	//whatsapp (not working completly, so hidden for the moment)
	//appendDetectButton("x9f619 xyqdw3p x10ogl3i xg8j3zb x1k2j06m x1n2onr6");
	appendDetectButton("_ak4r");
	//whatsapp video
	appendDetectButton("_ajv3 _ajv1");
	appendConsentButton(
		"insta",
		"x9f619 xjbqb8w x78zum5 x168nmei x13lgxp2 x5pf9jr xo71vjh x1p5oq8j xxbr6pl xwxc41k xbbxn1n x1n2onr6 x1plvlek xryxfnj x1c4vz4f x2lah0s xdt5ytf xqjyukv x6s0dn4 x1oa3qoh xl56j7k"
	);
	appendConsentButton("discord", "scroller_d90b3d thin_c49869 scrollerBase_c49869");
	//discord video
	appendDetectButton("mosaicItem_ab8b23 mosaicItemNoJustify_ab8b23 mosaicItemMediaMosaic_ab8b23 hideOverflow_ab8b23");
	//insta video
	appendDetectButton("x5yr21d x10l6tqk x13vifvy xh8yej3");
	//whatsapp
	appendConsentButton("whatsapp", "_ak5b");
	if (chrome.tabs) {
		//inject the css
		chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
			chrome.scripting.executeScript({
				target: { tabId: tabs[0].id },
				files: ["styles.css"],
			});
		});
	}
}

//function that is run everytime dom is manipulated to check for new loaded images
MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

var observer = new MutationObserver(function (mutations, observer) {
	// Add the actions to be done here if a changes on DOM happened
	inject_2();
});
// Register the element root you want to look for changes
observer.observe(document, {
	subtree: true,
	attributes: true,
});

//function to append the button to the image
function appendDetectButton(elementId) {
	var targetElements = document.getElementsByClassName(elementId);
	if (targetElements.length == 0) return;
	for (var i = 0; i < targetElements.length; i++) {
		var buttonEl = document.createElement("img");
		buttonEl.className = "verify-image-button";
		if (elementId == "_aagu") buttonEl.id = `button-insta-image`;
		else if (elementId == "x9f619 xyqdw3p x10ogl3i xg8j3zb x1k2j06m x1n2onr6")
			buttonEl.id = `button-whatsapp-image`;
		else if (elementId == "_ak4r") {
			buttonEl.id = `button-whatsapp-audio`;
			buttonEl.className = "verify-audio-button";
		} else if (elementId == "x5yr21d x10l6tqk x13vifvy xh8yej3") {
			buttonEl.id = `button-insta-video`;
			buttonEl.className = "verify-video-button";
		} else if (elementId == "_ajv3 _ajv1") {
			buttonEl.id = `button-whatsapp-common`;
			buttonEl.className = "verify-video-button-whatsapp";
		} else if (
			elementId == "mosaicItem_ab8b23 mosaicItemNoJustify_ab8b23 mosaicItemMediaMosaic_ab8b23 hideOverflow_ab8b23"
		) {
			buttonEl.id = `button-discord-video`;
			buttonEl.className = "verify-video-button-discord";
		}
		buttonEl.src = "https://iili.io/dH9heJs.png";
		//instagram
		if (
			!targetElements[i]?.parentElement?.parentElement?.querySelector("#button-insta-image") &&
			elementId == "_aagu"
		) {
			targetElements[i]?.parentElement?.parentElement?.appendChild(buttonEl);
		}

		//insta video
		if (
			targetElements[i]?.children?.length == 2 &&
			targetElements[i]?.children[0]?.className == "x5yr21d x19kjcj4 x6ikm8r x10wlt62 x1n2onr6 xh8yej3" &&
			elementId == "x5yr21d x10l6tqk x13vifvy xh8yej3"
		) {
			targetElements[i]?.appendChild(buttonEl);
		}

		//whastapp video (and images now on the topbar of the modal)
		if (
			!targetElements[i]?.querySelector("#button-whatsapp-common") &&
			targetElements[i]?.className == "_ajv3 _ajv1"
		) {
			targetElements[i]?.insertBefore(buttonEl, targetElements[i]?.children[0]);
		}

		//discord video
		if (
			!targetElements[i]?.querySelector("#button-discord-video") &&
			elementId ==
				"mosaicItem_ab8b23 mosaicItemNoJustify_ab8b23 mosaicItemMediaMosaic_ab8b23 hideOverflow_ab8b23" &&
			targetElements[i]?.children.length >= 2
		) {
			targetElements[i]?.appendChild(buttonEl);
		}
	}
}

function appendConsentButton(media, elementId) {
	if (media == "insta") {
		var targetElement = document.getElementsByClassName(elementId)[0];
		if (!targetElement) return;
		if (!document.getElementById("consent")) {
			var container = document.createElement("div");
			container.className = "consent-container-insta";
			var button = document.createElement("input");
			button.type = "checkbox";
			button.id = "consent";
			button.className = "consent-button";
			container.appendChild(button);
			var label = document.createElement("label");
			label.htmlFor = "consent";
			label.appendChild(document.createTextNode("Enable image protection"));
			label.className = "consent-label";
			container.appendChild(label);
			targetElement.appendChild(container);
		}
	}
	if (media == "whatsapp") {
		let parentElement = document.getElementsByClassName(elementId)[0];
		if (!parentElement) return;
		var targetParentElement = parentElement.children[0];
		if (!document.getElementById("consent") && targetParentElement.children.length == 6) {
			var container = document.createElement("div");
			container.className = "consent-container-whatsapp";
			var button = document.createElement("input");
			button.type = "checkbox";
			button.id = "consent";
			button.className = "consent-button";
			container.appendChild(button);
			var label = document.createElement("label");
			label.htmlFor = "consent";
			label.appendChild(document.createTextNode("Enable image protection"));
			label.className = "consent-label";
			container.appendChild(label);
			targetParentElement.insertBefore(container, targetParentElement.children[2]);
		}
	}
	if (media == "discord") {
		let targetParentElement = document.getElementsByClassName(elementId)[0];
		if (!targetParentElement) return;
		if (!document.getElementById("consent") && targetParentElement.children.length == 4) {
			var container = document.createElement("div");
			container.className = "consent-container-whatsapp";
			var button = document.createElement("input");
			button.type = "checkbox";
			button.id = "consent";
			button.className = "consent-button";
			container.appendChild(button);
			var label = document.createElement("label");
			label.htmlFor = "consent";
			label.appendChild(document.createTextNode("Enable image protection"));
			label.className = "consent-label";
			container.appendChild(label);
			targetParentElement.insertBefore(container, targetParentElement.children[1]);
		}
	}
}

//whatsapp broken code (appendButton)
/*if (
      !targetElements[i]?.children[0]?.querySelector("#button-whatsapp-image") &&
      elementId == "x9f619 xyqdw3p x10ogl3i xg8j3zb x1k2j06m x1n2onr6"
    ) {
      targetElements[i]?.children[0]?.appendChild(buttonEl);
    }
    //whastapp audio
    if (!targetElements[i]?.querySelector("#button-whatsapp-audio") && elementId == "_ak4r") {
      targetElements[i]?.appendChild(buttonEl);
    }*/

//code for broken whatsapp image buttons (on click listener)
/* else if (event.target.id.startsWith("button-whatsapp-image")) {
    value = "";
    //values depending on type of message (image, forwarded image, image with text)
    if (event.target.parentElement?.children[1]?.children?.length == 3) {
      value = event.target.parentElement?.children[1]?.children[1]?.children[1]?.children[0]?.src;
    } else if (event.target.parentElement?.children[0]?.children?.length > 1) {
      value = event.target.parentElement?.children[0]?.children[1]?.children[1]?.children[0]?.src;
    } else {
      value = event.target.parentElement?.children[2]?.children[1]?.children[1]?.children[0]?.src;
    }
    if (!value) return;
    //sending image to background.js to create popup
    sendMessageToBackground("detectionRequest", value, "image.jpg");
  }
*/
