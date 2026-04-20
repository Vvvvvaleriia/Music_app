import {
	btnLogin,
	searchBtn,
	inputSrch,
	songsList,
	savedTracks,
	searchDate,
	btnSearchListened,
	loginBlock,
} from "./dom.js";
import { clientId, redirectUrl } from "./config.js";
import { states } from "./state.js";
import { authorize, searchForType, saveTrack, deleteSaved } from "./api.js";
import { initSpotifyPlayer } from "./player.js";
import { createTrackElement, render } from "./render.js";
import { renderHistory } from "./history.js";
import { events } from "./emitter.js";

events.on("savedTrack", saveTrack);
events.on("savedTrack", render);

events.on("deleteTrack", deleteSaved);
events.on("historyOfListened", renderHistory);

window.onSpotifyWebPlaybackSDKReady = () => {
	initSpotifyPlayer();
};

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
	events.emit("historyOfListened", date);
	searchDate.value = "";
};

async function startApp() {
	const code = window.location.search.replace("?code=", "");
	const savedToken = localStorage.getItem("token");

	if (savedToken) {
		states.token = savedToken;

		btnLogin.hidden = true;
		inputSrch.hidden = false;
		searchBtn.hidden = false;
		savedTracks.hidden = false;
		searchDate.hidden = false;
		btnSearchListened.hidden = false;

		//await initSpotifyPlayer();
		await render();
		return;
	}

	if (code) {
		states.token = await authorize(code);

		btnLogin.hidden = true;
		inputSrch.hidden = false;
		searchBtn.hidden = false;
		savedTracks.hidden = false;
		searchDate.hidden = false;
		btnSearchListened.hidden = false;

		//await initSpotifyPlayer();
		await render();
		return;
	}

	btnLogin.hidden = false;
}

startApp();
