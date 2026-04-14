import {
	btnLogin,
	searchBtn,
	inputSrch,
	songsList,
	savedTracks,
} from "./dom.js";
import { clientId, redirectUrl } from "./config.js";
import { states } from "./state.js";
import { authorize, searchForType } from "./api.js";
import { initSpotifyPlayer } from "./player.js";
import { createTrackElement, render } from "./render.js";

//window.onSpotifyWebPlaybackSDKReady = () => {
//		initSpotifyPlayer();
//	};

btnLogin.onclick = () => {
	window.location.href = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&scope=streaming user-read-email user-read-private user-modify-playback-state user-library-modify user-follow-modify playlist-modify-public user-library-read&redirect_uri=${encodeURIComponent(redirectUrl)}`;
};

searchBtn.onclick = async () => {
	const textInput = inputSrch.value;

	const result = await searchForType(textInput, "track");
	const track = result.tracks.items[0];

	const li = createTrackElement(track);
	inputSrch.value = "";
	songsList.appendChild(li);
};

async function startApp() {
	const code = window.location.search.replace("?code=", "");

	if (!code) return;

	states.token = await authorize(code);
	console.log(states);

	btnLogin.hidden = true;
	inputSrch.hidden = false;
	searchBtn.hidden = false;
	savedTracks.hidden = false;

	await initSpotifyPlayer();
	await render();
}

startApp();
