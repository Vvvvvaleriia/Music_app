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
	playerBlock,
} from "./dom.js";
import { states } from "./state.js";
import { formatTime } from "./utils.js";
import { trackQueue } from "./queue.js";
import { events } from "./emitter.js";

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
		states.deviceId = device_id;

		const state = await player.getVolume();
		volumePrs.innerText = `Volume: ${Math.round(state * 100)}%`;
	});

	let autoPlayPending = false;

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
			autoPlayPending = false;
			states.idInterval = setInterval(() => {
				states.current += 1000;
				currentTime.textContent = formatTime(states.current);
				input.value = Math.floor(states.current / 1000);
			}, 1000);
		} else if (states.isActive && state.paused) {
			clearInterval(states.idInterval);
			states.isActive = false;
		}

		if (state.paused && state.position === 0 && !autoPlayPending) {
			clearInterval(states.idInterval);
			states.isActive = false;
			states.current = 0;
			currentTime.textContent = formatTime(states.current);

			const next = trackQueue.dequeue("oldest");
			if (next) {
				autoPlayPending = true;
				events.emit("playTrack", next);
				events.emit("queueUpdated");
			}
			return;
		}

		durationTime.textContent = formatTime(duration);
	});

	player.addListener("player_state_changed", (state) => {
		const isPaused = state.paused;

		if (isPaused) {
			toggleBtn.textContent = "▶";
		} else {
			toggleBtn.textContent = "⏸";
		}

		if (state.position === 0 && state.paused) {
			toggleBtn.textContent = "play";
		}
	});

	player.addListener("player_state_changed", (state) => {
		states.current = state.position;
		states.durationTimeValue = state.duration;

		input.max = Math.floor(states.durationTimeValue / 1000);

		input.value = Math.floor(states.current / 1000);

		currentTime.textContent = formatTime(states.current);

		durationTime.textContent = formatTime(states.durationTimeValue);
	});

	input.addEventListener("input", () => {
		player.seek(input.value * 1000);
	});

	player.connect();

	toggleBtn.onclick = () => {
		player.togglePlay().then(() => {});
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
