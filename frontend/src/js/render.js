import { playTrack } from "./api.js";
import { states } from "./state.js";
import { savePlayedTrack } from "./history.js";
import { events } from "./emitter.js";
import { loadSavedTracks } from "./api.js";
import { loggedLoadSaved } from "./logging.js";
import { trackQueue } from "./queue.js";
import { withSpinner } from "./utils.js";

export function createTrackElement(track) {
	const li = document.createElement("li");

	li.innerHTML = `
		<span class="track-label">${track.artists[0].name} - ${track.name}</span>
		<div class="track-buttons">
			<button class="play-btn">play</button>
			<button class="save-btn">save</button>
		</div>
	`;

	const btnPlay = li.querySelector(".play-btn");
	const btnSave = li.querySelector(".save-btn");

	btnPlay.addEventListener("click", () => {
		events.emit("playTrack", track);
	});

	btnSave.onclick = function () {
		events.emit("savedTrack", track);
	};

	return li;
}

export async function* streamArray(array) {
	for (const item of array) {
		await new Promise((resolve) => setTimeout(resolve, 10));
		yield item;
	}
}

export async function* asyncMap(iterator, asyncFn) {
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
	return `<li class="saved-items">
	<span class="track-label">${item.track.artists[0].name} - ${item.track.name}</span>
	<div class="track-buttons">
		<button class="play-saved">play</button> 
		<button class="delete-saved">delete</button>
		<button class="queue-add-btn">Add to queue</button>
	</div>
	</li>`;
});

function htmlGenerator(asyncIterator, batchSize = 4) {
	return async function* () {
		let batch = [];

		for await (const data of asyncIterator) {
			const temp = document.createElement("ul");
			temp.innerHTML = data.html;
			const el = temp.firstElementChild;

			el.querySelector(".play-saved").addEventListener("click", () => {
				events.emit("playTrack", data.item.track);
			});

			el.querySelector(".queue-add-btn").onclick = function () {
				const history = JSON.parse(
					localStorage.getItem("listenedHistory") || "{}",
				);
				const id = data.item.track.id;
				let totalPlays = 0;
				for (const tracks of Object.values(history)) {
					const entry = tracks.find((t) => t.id === id);
					if (entry) {
						totalPlays += entry.playCount || 1;
					}
				}
				const priority = totalPlays;
				trackQueue.enqueue(data.item.track, priority);
				events.emit("queueUpdated");
			};

			el.querySelector(".delete-saved").onclick = function () {
				events.emit("deleteTrack", data.item.track);
			};

			batch.push(el);
			if (batch.length >= batchSize) {
				yield batch;
				batch = [];
			}
		}

		if (batch.length) {
			yield batch;
		}
	};
}

export async function incrementalRender(container, iterator) {
	for await (const batch of iterator) {
		container.append(...batch);
	}
}

export async function render() {
	const tracksDiv = document.querySelector(".tracks");

	await withSpinner(tracksDiv, async () => {
		const tracks = await loggedLoadSaved();

		if (tracks) {
			const streamTracks = streamArray(tracks);
			const mappedTracks = asyncMap(streamTracks, async (item) => ({
				html: renderTracks(item),
				item,
			}));
			const generator = htmlGenerator(mappedTracks);
			await incrementalRender(tracksDiv, generator());
		}
	});
}
