import {
	btnLogin,
	welcomeText,
	inputSrch,
	searchBtn,
	savedTracks,
	searchDate,
	btnSearchListened,
	exitBtn,
} from "./dom.js";

export function formatTime(ms) {
	const totalSeconds = Math.floor(ms / 1000);
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;

	return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export async function visiblePanel() {
	document.querySelector(".login-page")?.remove();
	btnLogin.hidden = true;
	welcomeText.hidden = true;
	inputSrch.hidden = false;
	searchBtn.hidden = false;
	savedTracks.hidden = false;
	searchDate.hidden = false;
	btnSearchListened.hidden = false;
	exitBtn.hidden = false;
}
