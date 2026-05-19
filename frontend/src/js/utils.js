import { addItemsToPlaylist, createPlaylist } from "./api.js";
import {
	btnLogin,
	welcomeText,
	inputSrch,
	searchBtn,
	savedTracks,
	searchDate,
	btnSearchListened,
	exitBtn,
	reloadBtn,
} from "./dom.js";

export function formatTime(ms) {
	const totalSeconds = Math.floor(ms / 1000);
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;

	return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export async function visiblePanel() {
	document.querySelector(".login-page")?.remove();
	btnLogin.hidden = true;
	welcomeText.hidden = true;
	inputSrch.hidden = false;
	searchBtn.hidden = false;
	savedTracks.hidden = false;
	searchDate.hidden = false;
	btnSearchListened.hidden = false;
	exitBtn.hidden = false;
	reloadBtn.hidden = false;
}

async function getPlaylistLink(playlistId) {
	return `https://open.spotify.com/playlist/${playlistId}`;
}

async function createPlaylistHistory(tracks, date) {
	const playlist = await createPlaylist(date);

	const uris = tracks.map((track) => track.uri);
	await addItemsToPlaylist(playlist.id, uris);

	const link = getPlaylistLink(playlist.id);

	return link;
}

export async function buttonDownload(container, tracks, date) {
	const oldBtn = document.querySelector(".share-btn");
	if (oldBtn) oldBtn.remove();

	const share = document.createElement("button");
	share.className = "share-btn";
	share.textContent = "share";

	share.addEventListener("click", async () => {
		const link = await createPlaylistHistory(tracks, date);

		await navigator.clipboard.writeText(link);
		alert("Link copied!");
	});

	container.appendChild(share);
}
