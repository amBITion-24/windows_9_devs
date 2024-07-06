const SUPPORTED_FILE_TYPES = {
	image: ["image/jpeg", "image/png", "image/webp"],
	video: ["video/mp4", "video/webm", "video/ogg"],
	audio: ["audio/mpeg", "audio/ogg", "audio/wav"],
};

async function getDataURL(file) {
	return new Promise((resolve) => {
		let reader = new FileReader();
		reader.onload = function () {
			resolve(reader.result);
		};
		reader.readAsDataURL(file);
	});
}

function handle_detect() {
	let input = document.createElement("input");
	input.type = "file";
	input.click();

	//once the user selects the file check if it is of image, video, or audio type and save it to a variable
	input.onchange = async function () {
		let file = input.files[0];

		const supported_types = Object.values(SUPPORTED_FILE_TYPES).flat();

		if (supported_types.includes(file.type)) {
			let dataURL = await getDataURL(file);
			chrome.runtime.sendMessage({
				from: "menu",
				subject: "detectionRequest",
				mediaUrl: dataURL,
				fileType: file.type,
				left: window.screenLeft + window.outerWidth,
				top: window.screenTop,
			});
			window.close();
		} else {
			alert("Unsupported file type.");
		}
	};
}

document.addEventListener("DOMContentLoaded", function () {
	document.getElementById("detect-btn").addEventListener("click", handle_detect);
	document.getElementById("protect-btn").addEventListener("click", handle_detect);
});
