import {
	btnLogin,
	welcomeText,
	searchBtn,
	inputSrch,
	songsList,
	savedTracks,
	searchDate,
	btnSearchListened,
	exitBtn,
} from "./dom.js";
import { clientId, redirectUrl } from "./config.js";
import { states } from "./state.js";
import {
	authorize,
	searchForType,
	saveTrack,
	deleteSaved,
	isTokenValid,
	playTrack,
} from "./api.js";
import { initSpotifyPlayer } from "./player.js";
import { createTrackElement, render } from "./render.js";
import { renderHistory, savePlayedTrack } from "./history.js";
import { events } from "./emitter.js";
import { visiblePanel } from "./utils.js";

events.on("pageLoaded", render);
events.on("pageLoaded", visiblePanel);

//events.on("playTrack", showBlock);
events.on("playTrack", playTrack);
events.on("playTrack", savePlayedTrack);
events.on("savedTrack", saveTrack);
events.on("savedTrack", render);
events.on("deleteTrack", deleteSaved);
events.on("deleteTrack", render);
//events.on("playSaved", playTrack);
//events.on("playSaved", savePlayedTrack);

let appReady = false;
//events.on("historyOfListened", renderHistory);

btnLogin.onclick = () => {
	window.location.href = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&scope=streaming user-read-email user-read-private user-modify-playback-state user-library-modify user-follow-modify playlist-modify-public user-library-read&redirect_uri=${encodeURIComponent(redirectUrl)}`;
};

searchBtn.onclick = async function () {
	const textInput = inputSrch.value;

	const result = await searchForType(textInput, "track");
	const track = result.tracks.items[0];

	const li = createTrackElement(track);
	inputSrch.value = "";
	songsList.appendChild(li);
};

btnSearchListened.onclick = function () {
	const date = searchDate.value;
	const listened = renderHistory(date);
	//events.emit("historyOfListened", date);
	searchDate.value = "";

	return listened;
};

exitBtn.onclick = function () {
	localStorage.removeItem("token");
	states.token = null;
	window.location.href = "http://localhost:3000/";
};

async function startApp() {
	const savedToken = localStorage.getItem("token");
	const code = window.location.search.replace("?code=", "");

	if (savedToken) {
		const valid = await isTokenValid(savedToken);
		if (valid) {
			//await visiblePanel();
			states.token = savedToken;
			events.emit("pageLoaded");
		} else {
			localStorage.removeItem("token");
		}
	} else {
		if (code) {
			states.token = await authorize(code);
			localStorage.setItem("token", states.token);
			//await visiblePanel();
			events.emit("pageLoaded");
		}
	}

	appReady = true;
	initIfPossible();
}

function initIfPossible() {
	if (appReady && states.token) {
		console.log("INIT PLAYER");
		initSpotifyPlayer();
	}
}

startApp();
window.onSpotifyWebPlaybackSDKReady = () => {
	console.log("TRY INIT");
	initIfPossible();
};
