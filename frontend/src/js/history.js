import { streamArray, asyncMap, incrementalRender } from "./render.js";
import { playTrack } from "./player.js";

export function savePlayedTrack(track) {
	const date = new Date().toISOString().split("T")[0];

	const listOfPlayed =
		JSON.parse(localStorage.getItem("listenedHistory")) || {};

	if (!listOfPlayed[date]) {
		listOfPlayed[date] = [];
	}

	const alreadyExists = listOfPlayed[date].some(
		(song) => song.trackId === track.id,
	);

	if (!alreadyExists) {
		listOfPlayed[date].push({
			trackId: track.id,
			name: track.name,
			artist: track.artists[0].name,
			playedAt: date,
		});
	}
	localStorage.setItem("listenedHistory", JSON.stringify(listOfPlayed));
	console.log(date);
}

function renderListened(item) {
	return `<div class="history-tracks">
	<span>${item.name} - ${item.artist}</span> 
	<button class="play-listened">play</button> 
	</div>`;
}

function htmlGenerator(asyncIterator, batchSize = 4) {
	return async function* () {
		let batch = [];

		for await (const data of asyncIterator) {
			const el = document.createElement("div");
			el.innerHTML = data.html;

			el.querySelector(".play-listened").addEventListener("click", () => {
				playTrack(data.item.track);
				savePlayedTrack(data.item.track);
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
	const historyList = document.querySelector(".history-container");
	const listened = JSON.parse(localStorage.getItem("listenedHistory"));

	const tracks = listened[date];

	if (!listened[date]) {
		const notice = document.createElement("p");
		notice.textContent = "You didn't listen tracks on this date";

		historyList.appendChild(notice);
		return;
	}

	if (!tracks) {
		return;
	} else {
		const streamHistory = streamArray(tracks);
		const mappedHistory = asyncMap(streamHistory, async (item) => ({
			html: renderListened(item),
			item,
		}));

		const generator = htmlGenerator(mappedHistory);
		await incrementalRender(historyList, generator());

		//for (const track of tracks) {
		//const liSaved = document.createElement("li");
		//liSaved.innerHTML = `${track.name} - ${track.artist}`;

		//historyList.appendChild(liSaved);
	}
}
