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

inputSrch.hidden = true;
searchBtn.hidden = true;
trackName.hidden = true;
trackArtist.hidden = true;
toggleBtn.hidden = true;
volumeUp.hidden = true;
volumeDown.hidden = true;
volumePrs.hidden = true;
trackImg.hidden = true;

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

	player.addListener("ready", async ({ device_id }) => {
		console.log("Ready with Device ID", device_id);
		deviceId = device_id;

		const state = await player.getVolume(); //не працює
		volumePrs.innerText = `Volume: ${Math.round(state * 100)}%`;
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

//EVENTS
btnLogin.onclick = () => {
	window.location.href = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&scope=streaming user-read-email user-read-private user-modify-playback-state user-library-modify user-follow-modify playlist-modify-public&redirect_uri=${encodeURIComponent(redirectUrl)}`;
};

searchBtn.onclick = async () => {
	const input = document.querySelector(".name-inp");
	const textInput = input.value;

	const result = await searchForItem(token, textInput, "track");

	const track = result.tracks.items[0];
	const li = document.createElement("li");
	li.innerHTML = `${track.name} - ${track.artists[0].name} <button class="play-btn">listen music</button> <button class="save-btn">save</button>`;
	const btnPlay = li.querySelector(".play-btn");
	const btnSave = li.querySelector(".save-btn");
	input.value = "";

	trackId = track.id;
	console.log(trackId);

	btnPlay.onclick = async () => {
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

		trackName.innerText = track.name;
		trackArtist.innerHTML = track.artists[0].name;

		const imgUrl = track.album.images[0].url;
		trackImg.innerHTML = `<img src="${imgUrl}">`;
	};

	btnSave.onclick = async () => {
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
		const trackData = {
			name: track.name,
			artist: track.artists[0].name,
		};
		const songs = localStorage.getItem("listOfSaved");
		const songsJson = JSON.parse(songs);
		for (const track of songsJson) {
			const li = `<li>${track.name} - ${track.artist}</li>`;
			savedSongs.insertAdjacentHTML("beforeend", li);
		}

		let listOfSaved = localStorage.getItem("listOfSaved");
		listOfSaved = JSON.parse(listOfSaved);
		listOfSaved.push(trackData);
		const jsonlistOfSaved = JSON.stringify(listOfSaved);
		localStorage.setItem("listOfSaved", jsonlistOfSaved);

		savedSongs.appendChild(liSaved);
	};

	songsList.appendChild(li);
};

// START APP
async function startApp() {
	const code = window.location.search.replace("?code=", "");

	if (!code) return;

	await authorize(code);
	btnLogin.hidden = true;
	inputSrch.hidden = false;
	searchBtn.hidden = false;
	await initSpotifyPlayer();
}
startApp();
