import {
	btnLogin,
	welcomeText,
	inputSrch,
	searchBtn,
	savedTracks,
	searchDate,
	btnSearchListened,
	playerBlock,
	trackName,
	trackArtist,
	toggleBtn,
	volumeUp,
	volumeDown,
	volumePrs,
	trackImg,
	durationTime,
	currentTime,
	input,
	btn,
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

/*
export function showBlock(track) {
	playerBlock.style.display = "flex";
	trackName.hidden = false;
	trackArtist.hidden = false;
	toggleBtn.hidden = false;
	volumeUp.hidden = false;
	volumeDown.hidden = false;
	volumePrs.hidden = false;
	trackImg.hidden = false;
	currentTime.hidden = false;
	durationTime.hidden = false;
	input.hidden = false;
	btn.hidden = false;

	toggleBtn.textContent = "pause";

	trackName.innerText = track.name;
	trackArtist.innerHTML = track.artists[0].name;

	const imgUrl = track.album.images[0].url; //|| track.image;
	trackImg.innerHTML = `<img src="${imgUrl}">`;
}
*/
