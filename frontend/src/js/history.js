import { streamArray, asyncMap, incrementalRender } from "./render.js";
import { events } from "./emitter.js";
import { loggedButtonDownload } from "./logging.js";
import { withSpinner } from "./utils.js";

export function savePlayedTrack(track) {
	const date = new Date().toISOString().split("T")[0];

	let listOfPlayed = {};
	try {
		listOfPlayed =
			JSON.parse(localStorage.getItem("listenedHistory")) || {};
	} catch {
		listOfPlayed = {};
	}

	if (!listOfPlayed[date]) {
		listOfPlayed[date] = [];
	}

	const existing = listOfPlayed[date].find((song) => song.id === track.id);

	if (existing) {
		existing.playCount = (existing.playCount || 1) + 1;
	} else {
		listOfPlayed[date].push({ ...track, playCount: 1 });
	}
	localStorage.setItem("listenedHistory", JSON.stringify(listOfPlayed));
}

function renderListened(item) {
	return `<li class="history-tracks">
	<span class="track-label">${item.artists[0].name} - ${item.name}</span> 
	<div class="track-buttons">
		<button class="play-listened">play</button> 
	</div>
	</li>`;
}

function htmlGenerator(asyncIterator, batchSize = 1) {
	return async function* () {
		let batch = [];

		for await (const data of asyncIterator) {
			const temp = document.createElement("ul");
			temp.innerHTML = data.html;
			const el = temp.firstElementChild;

			el.querySelector(".play-listened").addEventListener("click", () => {
				events.emit("playTrack", data.item);
			});

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

export async function renderHistory(date) {
	const historyList = document.querySelector(".render-listened");
	let listened = {};
	try {
		listened = JSON.parse(localStorage.getItem("listenedHistory")) || {};
	} catch {
		listened = {};
	}

	date = date.trim();

	if (!listened || !listened[date]) {
		historyList.innerHTML = "";
		const notice = document.createElement("p");
		notice.textContent = "You didn't listen tracks on this date";

		historyList.appendChild(notice);
		return;
	}

	await withSpinner(historyList, async () => {
		const tracks = listened[date];
		const streamHistory = streamArray(tracks);
		const mappedHistory = asyncMap(streamHistory, async (item) => ({
			html: renderListened(item),
			item,
		}));

		const generator = htmlGenerator(mappedHistory);
		await incrementalRender(historyList, generator());

		loggedButtonDownload(historyList, tracks, date);
	});
}
