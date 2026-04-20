import { saveTrack, deleteSaved } from "./api.js";
import { playTrack } from "./player.js";
import { states } from "./state.js";
import { savePlayedTrack } from "./history.js";
import { events } from "./emitter.js";

export function createTrackElement(track) {
	const li = document.createElement("li");

	li.innerHTML = `
		${track.name} - ${track.artists[0].name}
		<button class="play-btn">play</button>
		<button class="save-btn">save</button>
	`;

	const btnPlay = li.querySelector(".play-btn");
	const btnSave = li.querySelector(".save-btn");

	btnPlay.addEventListener("click", () => {
		playTrack(track);
		savePlayedTrack(track);
	});
	btnSave.onclick = function () {
		events.emit("savedTrack", track);
	};

	return li;
}

async function loadSavedTracks() {
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
		console.log("stream", item);
	}
}

async function* asyncMap(iterator, asyncFn) {
	for await (const track of iterator) {
		const result = await asyncFn(track);
		console.log("map input", track);
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
	return `<div class="saved-items">
	<span>${item.track.name} - ${item.track.artists[0].name}</span> 
	<button class="play-saved">play</button> 
	<button class="delete-saved">delete</button>
	</div>`;
});

function htmlGenerator(asyncIterator, batchSize = 4) {
	return async function* () {
		let batch = [];

		for await (const data of asyncIterator) {
			const el = document.createElement("div");
			el.innerHTML = data.html;

			el.querySelector(".play-saved").addEventListener("click", () => {
				playTrack(data.item.track);
				savePlayedTrack(data.item.track);
			});

			el.querySelector(".delete-saved").onclick = function () {
				events.emit("deleteTrack", data.item.track);
			};

			batch.push(el);
			if (batch.length >= batchSize) {
				yield batch;
				batch = [];
			}
			console.log("batch add", data);
		}

		if (batch.length) {
			yield batch;
		}
	};
}

async function incrementalRender(container, iterator) {
	for await (const batch of iterator) {
		container.append(...batch);
	}
}

export async function render() {
	console.log("RENDER START");
	const tracksDiv = document.querySelector(".tracks");

	const tracks = await loadSavedTracks();
	console.log("tracks", tracks);

	if (tracks) {
		const streamTracks = streamArray(tracks);
		const mappedTracks = asyncMap(streamTracks, async (item) => ({
			html: renderTracks(item),
			item,
		}));
		const generator = htmlGenerator(mappedTracks);
		await incrementalRender(tracksDiv, generator());
	}
}
