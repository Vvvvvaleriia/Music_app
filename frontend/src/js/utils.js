import { addItemsToPlaylist, createPlaylist, getUserEmail } from "./api.js";
import {
	btnLogin,
	welcomeText,
	inputSrch,
	searchBtn,
	savedTracks,
	searchDate,
	btnSearchListened,
	exitBtn,
	userEmail,
} from "./dom.js";

function showToast(message) {
	const toast = document.createElement("div");
	toast.className = "toast";
	toast.textContent = message;
	document.body.appendChild(toast);

	setTimeout(() => {
		toast.classList.add("hide");
		toast.addEventListener("transitionend", () => toast.remove());
	}, 3000);
}

export function withSpinner(container, asyncFn) {
	const spinner = document.createElement("div");
	spinner.className = "mini-spinner";
	container.innerHTML = "";
	container.appendChild(spinner);
	return asyncFn().finally(() => spinner.remove());
}

export function formatTime(ms) {
	const totalSeconds = Math.floor(ms / 1000);
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;

	return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export async function visiblePanel() {
	document.querySelector(".loader-screen")?.classList.add("hidden");
	document.querySelector(".login-page")?.remove();
	document.querySelector(".app-mode").hidden = false;
	btnLogin.hidden = true;
	welcomeText.hidden = true;
	inputSrch.hidden = false;
	searchBtn.hidden = false;
	savedTracks.hidden = false;
	searchDate.hidden = false;
	btnSearchListened.hidden = false;
	exitBtn.hidden = false;

	const email = await getUserEmail();
	if (email) {
		userEmail.textContent = email;
		userEmail.hidden = false;
	}
}

export function showLoginScreen() {
	document.querySelector(".loader-screen")?.classList.add("hidden");
	document.querySelector(".login-page").hidden = false;
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
		try {
			const link = await createPlaylistHistory(tracks, date);
			await navigator.clipboard.writeText(link);
			showToast("Link copied! Playlist created in Spotify");
		} catch {
			showToast("Failed to create playlist. Try again.");
		}
	});

	container.parentElement.appendChild(share);
}
