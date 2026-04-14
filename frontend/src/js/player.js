import {
	trackName,
	trackArtist,
	toggleBtn,
	volumeUp,
	volumeDown,
	volumePrs,
	trackImg,
	currentTime,
	durationTime,
	input,
	btn,
	playerBlock,
} from "./dom.js";
import { states } from "./state.js";
import { formatTime } from "./utils.js";

window.onSpotifyWebPlaybackSDKReady = () => {};

export async function playTrack(track) {
	const uri = track.uri;

	await fetch(
		`https://api.spotify.com/v1/me/player/play?device_id=${states.deviceId}`,
		{
			headers: {
				Authorization: `Bearer ${states.token}`,
				"Content-Type": "application/json",
			},
			method: "PUT",
			body: JSON.stringify({
				uris: [uri],
			}),
		},
	);

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

	const imgUrl = track.album.images[0].url;
	trackImg.innerHTML = `<img src="${imgUrl}">`;
}

export async function initSpotifyPlayer() {
	const player = new Spotify.Player({
		name: "Start Player",
		getOAuthToken: (cb) => {
			cb(states.token);
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
		states.deviceId = device_id;

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

		states.current = position;
		states.durationTimeValue = duration;

		if (!states.isActive && !state.paused) {
			states.isActive = true;
			states.idInterval = setInterval(() => {
				states.current += 1000;
				currentTime.textContent = formatTime(states.current);
			}, 1000);
		} else if (states.isActive && state.paused) {
			clearInterval(states.idInterval);
			states.isActive = false;
		}

		if (state.paused && state.position === 0) {
			clearInterval(states.idInterval);
			states.isActive = false;
			states.current = 0;
			currentTime.textContent = formatTime(states.current);
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
