const btnLogin = document.querySelector("#login");
const trackName = document.querySelector("#track-name");
const trackArtist = document.querySelector("#track-artist");
const toggleBtn = document.querySelector("#toggle-btn");
const volumeUp = document.querySelector("#volume-up");
const volumeDown = document.querySelector("#volume-down");
const searchBtn = document.querySelector(".srch-btn");
const inputSrch = document.querySelector(".name-inp");
const volumePrs = document.querySelector("#volume-persent");
const trackImg = document.querySelector("#imgInfo");
const songsList = document.querySelector(".list-song");
const savedSongs = document.querySelector(".list-saved");
const savedTracks = document.querySelector(".save-track");
const currentTime = document.querySelector("#current-time");
const durationTime = document.querySelector("#duration");
const input = document.querySelector("#time-input");
const btn = document.querySelector("#set-time");

trackImg.hidden = true;

const clientId = "12304fbfa93a45008be04110a623ca46";
const redirectUrl = "http://127.0.0.1:3000/";

let token;
let deviceId;
let trackId;
let idInterval = null;
let current = 0;
let durationTimeValue = 0;
let isActive = false;

window.onSpotifyWebPlaybackSDKReady = () => {};

//AUTHORIZE
async function authorize(code) {
	const response = await fetch("http://127.0.0.1:5000/api/access", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ code }),
	});

	const data = await response.json();
	return data.token;
}

function formatTime(ms) {
	const totalSeconds = Math.floor(ms / 1000);
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;

	return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

//SEARCH
async function searchForType(query, type) {
	const resp = await fetch(
		`https://api.spotify.com/v1/search?q=${query}&type=${type}`,
		{
			headers: {
				Authorization: `Bearer ${token}`,
			},
			method: "GET",
		},
	);

	const data = await resp.json();
	return data;
}

//GET TRACK
async function getTrackURI() {
	const resp = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
		method: "GET",
	});

	const data = await resp.json();
	return data.uri;
}

//INIT PLAYER
async function initSpotifyPlayer() {
	const player = new Spotify.Player({
		name: "Start Player",
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

	player.addListener("ready", async ({ device_id }) => {
		console.log("Ready with Device ID", device_id);
		deviceId = device_id;

		const state = await player.getVolume();
		volumePrs.innerText = `Volume: ${Math.round(state * 100)}%`;
	});

	player.addListener("player_state_changed", (state) => {
		const {
			position,
			duration,
			track_window: { current_track },
			paused,
		} = state;

		current = position;
		durationTimeValue = duration;

		if (!isActive && !state.paused) {
			isActive = true;
			idInterval = setInterval(() => {
				current += 1000;
				currentTime.textContent = formatTime(current);
			}, 1000);
		} else if (isActive && state.paused) {
			clearInterval(idInterval);
			isActive = false;
		}

		if (state.paused && state.position === 0) {
			clearInterval(idInterval);
			isActive = false;
			current = 0;
			currentTime.textContent = formatTime(current);
			return;
		}

		durationTime.textContent = formatTime(duration);

		console.log("Currently Playing", current_track);
		console.log("Position in Song", position);
		console.log("Duration of Song", duration);
	});

	player.addListener("player_state_changed", (state) => {
		const isPaused = state.paused;

		if (isPaused) {
			toggleBtn.textContent = "play";
		} else {
			toggleBtn.textContent = "pause";
		}

		if (state.position === 0 && state.paused) {
			toggleBtn.textContent = "play";
		}
	});

	btn.addEventListener("click", () => {
		const seconds = Number(input.value);
		const ms = seconds * 1000;
		player.seek(ms).then(() => {
			console.log("Position changed");
		});
		setTrackTime(seconds);
	});

	player.connect();

	toggleBtn.onclick = () => {
		player.togglePlay().then(() => {
			console.log("Toggled playback");
		});
	};

	volumeUp.onclick = () => {
		player.getVolume().then((volume) => {
			let newVolume = Math.min(volume + 0.1, 1);
			player.setVolume(newVolume).then(() => {
				volumePrs.innerText = `Volume: ${Math.round(newVolume * 100)}%`;
			});
		});
	};

	volumeDown.onclick = () => {
		player.getVolume().then((volume) => {
			let newVolume = Math.max(volume - 0.1, 0);
			player.setVolume(newVolume).then(() => {
				volumePrs.innerText = `Volume: ${Math.round(newVolume * 100)}%`;
			});
		});
	};
}

function createTrackElement(track) {
	const li = document.createElement("li");

	li.innerHTML = `
		${track.name} - ${track.artists[0].name}
		<button class="play-btn">listen music</button>
		<button class="save-btn">save</button>
	`;

	const btnPlay = li.querySelector(".play-btn");
	const btnSave = li.querySelector(".save-btn");

	btnPlay.onclick = () => playTrack(track);
	btnSave.onclick = () => saveTrack(track);

	return li;
}

async function playTrack(track) {
	const uri = track.uri;

	await fetch(
		`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
		{
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
			method: "PUT",
			body: JSON.stringify({
				uris: [uri],
			}),
		},
	);

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

	const imgUrl = track.album.images[0].url;
	trackImg.innerHTML = `<img src="${imgUrl}">`;
}

async function saveTrack(track) {
	const uris = `spotify:track:${track.id}`;
	await fetch(
		`https://api.spotify.com/v1/me/library?uris=${encodeURIComponent(uris)}`,
		{
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
			method: "PUT",
		},
	);

	const liSaved = document.createElement("li");
	liSaved.innerText = `${track.name} - ${track.artists[0].name}`;

	savedSongs.appendChild(liSaved);
}

// START APP
async function startApp() {
	const code = window.location.search.replace("?code=", "");

	if (!code) return;

	token = await authorize(code);
	btnLogin.hidden = true;
	inputSrch.hidden = false;
	searchBtn.hidden = false;
	savedTracks.hidden = false;

	await initSpotifyPlayer();
	await render();
}

//EVENTS
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

//RENDER
async function loadSavedTracks() {
	const resp = await fetch(`https://api.spotify.com/v1/me/tracks`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
		method: "GET",
	});

	const savedSngs = await resp.json();
	return savedSngs.items;
}

async function* streamArray(array) {
	for (const item of array) {
		await new Promise((resolve) => setTimeout(resolve, 10));
		yield item;
	}
}

async function* asyncMap(iterator, asyncFn) {
	for await (const track of iterator) {
		const result = await asyncFn(track);
		yield result;
	}
}

function memoize(fn) {
	const cache = new Map();
	return function (...args) {
		const key = JSON.stringify(args);
		if (cache.has(key)) {
			return cache.get(key);
		}

		const res = fn(...args);
		cache.set(key, res);
		return res;
	};
}

const renderTracks = memoize((item) => {
	return `<p>${item.track.name} - ${item.track.artists[0].name}</p>`;
});

async function incrementalRender(container, iterator) {
	for await (const html of iterator) {
		container.insertAdjacentHTML("beforeend", html);
	}
}

async function render() {
	const tracksDiv = document.querySelector(".tracks");

	const tracks = await loadSavedTracks();

	if (tracks) {
		const streamTracks = streamArray(tracks);
		const mappedTracks = asyncMap(streamTracks, async (item) =>
			renderTracks(item),
		);
		await incrementalRender(tracksDiv, mappedTracks);
	}
}

startApp();
