import { saveTrack } from "./api.js";
import { playTrack } from "./player.js";
import { states } from "./state.js";

export function createTrackElement(track) {
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

async function loadSavedTracks() {
	console.log(states);
	const resp = await fetch(`https://api.spotify.com/v1/me/tracks`, {
		headers: {
			Authorization: `Bearer ${states.token}`,
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

export async function render() {
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
