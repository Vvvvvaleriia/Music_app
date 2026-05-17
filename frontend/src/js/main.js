import {
	btnLogin,
	searchBtn,
	inputSrch,
	songsList,
	searchDate,
	btnSearchListened,
	exitBtn,
} from "./dom.js";
import { clientId, redirectUrl } from "./config.js";
import { states } from "./state.js";
import { getRefreshToken, isTokenValid } from "./api.js";
import { initSpotifyPlayer } from "./player.js";
import { createTrackElement, render } from "./render.js";
import { renderHistory, savePlayedTrack } from "./history.js";
import { events } from "./emitter.js";
import { visiblePanel } from "./utils.js";
import {
	loggedSearch,
	loggedDeleteTrack,
	loggedHistoryRender,
	loggedPlayTrack,
	loggedRender,
	loggedSaveTrack,
	loggedAuthorize,
} from "./logging.js";

events.on("pageLoaded", loggedRender);
events.on("pageLoaded", visiblePanel);
events.on("playTrack", loggedPlayTrack);
events.on("playTrack", savePlayedTrack);
events.on("savedTrack", loggedSaveTrack);
events.on("savedTrack", loggedRender);
events.on("deleteTrack", loggedDeleteTrack);
events.on("deleteTrack", loggedRender);

events.on("search", async (textInput) => {
	const result = await loggedSearch(textInput, "track");
	const tracks = result.tracks.items;

	events.emit("showTrack", tracks);
});
events.on("showTrack", (tracks) => {
	songsList.innerHTML = "";

	tracks.forEach((track) => {
		const li = createTrackElement(track);
		songsList.appendChild(li);
	});

	inputSrch.value = "";
});

let appReady = false;

btnLogin.onclick = () => {
	window.location.href = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&scope=streaming user-read-email user-read-private user-modify-playback-state user-library-modify user-follow-modify playlist-modify-public playlist-modify-private user-library-read&redirect_uri=${encodeURIComponent(redirectUrl)}`;
};

searchBtn.onclick = async function () {
	const textInput = inputSrch.value;
	events.emit("search", textInput);
};

btnSearchListened.onclick = function () {
	const date = searchDate.value;
	const listened = loggedHistoryRender(date);
	searchDate.value = "";

	return listened;
};

exitBtn.onclick = function logout() {
	localStorage.removeItem("access_token");
	states.token = null;
	window.location.href = "http://localhost:3000/";
};

async function startApp() {
	const savedToken = localStorage.getItem("access_token");
	const code = window.location.search.replace("?code=", "");

	if (savedToken) {
		const valid = await isTokenValid(savedToken);
		if (valid) {
			states.token = savedToken;
			events.emit("pageLoaded");
		} else {
			try {
				const newToken = await getRefreshToken();
				states.token = newToken;
				events.emit("pageLoaded");
			} catch {
				localStorage.removeItem("access_token");
				localStorage.removeItem("refresh_token");
			}
		}
	} else {
		if (code) {
			states.token = await loggedAuthorize(code);
			localStorage.setItem("access_token", states.token);

			events.emit("pageLoaded");
		}
	}

	appReady = true;
	initIfPossible();
}

function initIfPossible() {
	if (appReady && states.token) {
		initSpotifyPlayer();
	}
}

startApp();
window.onSpotifyWebPlaybackSDKReady = () => {
	initIfPossible();
};
