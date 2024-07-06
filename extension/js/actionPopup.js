chrome.runtime.onMessage.addListener((msg) => {
	const fromFilter = ["background"];
	if (!fromFilter.includes(msg.from)) return;

	let popupImage = document.getElementsByClassName("popup-image")[0];
	let resultSpan = document.getElementsByClassName("popup-result")[0];
	if (!resultSpan) {
		resultSpan = document.createElement("span");
		resultSpan.className = "popup-result";
		document.getElementsByClassName("popup-body")[0].appendChild(resultSpan);
	}

	if (msg.subject === "dataForPopup") {
		if (msg.popupType == "result") {
			popupImage.src = msg.data.mediaUrl;
			resultSpan.innerHTML = msg.data.result;
		} else if (msg.popupType == "loader") {
			popupImage.src = msg.data.mediaUrl;
			resultSpan.innerHTML = msg.data.text;
		}
	} else if (msg.subject === "closePopup") {
		window.close();
	}
});
