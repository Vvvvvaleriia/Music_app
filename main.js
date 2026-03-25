const btnLogin = document.querySelector("#login");
const musicTest = document.querySelector("#test-music");
const trackName = document.querySelector("#track-name");
const trackArtist = document.querySelector("#track-artist");
const trackInfo = document.querySelector("#track-info");
const toggleBtn = document.querySelector("#toggle-btn");
const volumeUp = document.querySelector("#volume-up");
const volumeDown = document.querySelector("#volume-down");
const searchBtn = document.querySelector(".srch-btn");

const clientId = "12304fbfa93a45008be04110a623ca46";
const redirectUrl = "http://127.0.0.1:5501/index.html";

let token;
let deviceId;
let player;
let trackId;

window.onSpotifyWebPlaybackSDKReady = () => {};

//AUTHORIZE
async function authorize(code) {
	const response = await fetch("http://127.0.0.1:3000/api/access", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ code }),
	});

	const data = await response.json();
	token = data.token;
}

//SEARCH
async function searchForItem(token, textInput, type) {
	const resp = await fetch(
		`https://api.spotify.com/v1/search?q=${textInput}&type=${type}`,
		{
			headers: {
				Authorization: `Bearer ${token}`,
			},
			method: "GET",
		},
	);

	const json = await resp.json();
	return json;
}

//GET TRACK
async function getTrack() {
	const resp = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
		method: "GET",
	});

	const json = await resp.json();
	return json.uri;
}

//INIT PLAYER
async function initSpotifyPlayer() {
	player = new Spotify.Player({
		name: "Web Playback SDK Quick Start Player",
		getOAuthToken: (cb) => {
			cb(token);
		},
		volume: 0.5,
	});

	player.addListener(
		"player_state_changed",
		({ track_window: { current_track } }) => {
			trackName.innerText = current_track.name;
			trackArtist.innerText = current_track.artists[0].name;
		},
	);

	player.addListener("ready", ({ device_id }) => {
		console.log("Ready with Device ID", device_id);
		deviceId = device_id;
	});

	player.connect();

	toggleBtn.onclick = () => {
		player.togglePlay().then(() => {
			console.log("Toggled playback");
		});
	};

	volumeUp.onclick = () => {
		player.getVolume().then((volume) => {
			player.setVolume(Math.min(volume + 0.1, 1));
		});
	};

	volumeDown.onclick = () => {
		player.getVolume().then((volume) => {
			player.setVolume(Math.max(volume - 0.1, 0));
		});
	};
}

//EVENTS
btnLogin.onclick = () => {
	window.location.href = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&scope=streaming user-read-email user-read-private user-modify-playback-state&redirect_uri=${encodeURIComponent(redirectUrl)}`;
};

searchBtn.onclick = async () => {
	const input = document.querySelector(".name-inp");
	const textInput = input.value;

	const result = await searchForItem(token, textInput, "track");
	const track = result.tracks.items[0];
	trackName.innerText = track.name;
	trackArtist.innerText = track.artists[0].name;

	trackId = track.id;
	console.log(trackId);
};

musicTest.onclick = async () => {
	const uri = await getTrack();

	fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
		method: "PUT",
		body: JSON.stringify({
			uris: [uri],
		}),
	});
};

// START APP
async function startApp() {
	const code = window.location.search.replace("?code=", "");

	if (!code) return;

	await authorize(code);
	await initSpotifyPlayer();
}
startApp();
