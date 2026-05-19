import { states } from "./state.js";
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
import proxy from "./apiProxy.js";

export async function authorize(code) {
	const response = await proxy.request("http://127.0.0.1:5000/api/access", {
		method: "POST",
		body: JSON.stringify({ code }),
	});

	const data = await response.json();

	console.log(data);
	localStorage.setItem("access_token", data.token);
	localStorage.setItem("refresh_token", data.refreshToken);

	return data.token;
}

export async function isTokenValid(token) {
	const res = await proxy.request(`https://api.spotify.com/v1/me`, {});

	return res.status == 200;
}

export async function getRefreshToken() {
	const refresh_token = localStorage.getItem("refresh_token");

	const resp = await fetch("http://127.0.0.1:5000/api/refresh", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ refresh_token }),
	});

	const data = await resp.json();

	// localStorage.setItem("access_token", data.token);

	// if (data.refreshToken) {
	// 	localStorage.setItem("refresh_token", data.refreshToken);
	// }

	return data.token;
}

export async function searchForType(query, type) {
	const resp = await proxy.request(
		`https://api.spotify.com/v1/search?q=${query}&type=${type}`,
	);

	const data = await resp.json();
	return data;
}

export async function playTrack(track) {
	const uri = track.uri;

	const resp = await proxy.request(
		`https://api.spotify.com/v1/me/player/play?device_id=${states.deviceId}`,
		{
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

	toggleBtn.textContent = "pause";

	trackName.innerText = track.name;
	trackArtist.innerHTML = track.artists[0].name;

	const imgUrl = track.album.images[0].url;
	trackImg.innerHTML = `<img src="${imgUrl}">`;
}

export async function loadSavedTracks() {
	const resp = await proxy.request(`https://api.spotify.com/v1/me/tracks`);

	const savedSngs = await resp.json();
	return savedSngs.items;
}

export async function saveTrack(track) {
	const uris = `spotify:track:${track.id}`;
	const resp = await proxy.request(
		`https://api.spotify.com/v1/me/library?uris=${encodeURIComponent(uris)}`,
		{
			method: "PUT",
		},
	);
}

export async function deleteSaved(track) {
	const uris = `spotify:track:${track.id}`;
	const resp = await proxy.request(
		`https://api.spotify.com/v1/me/library?uris=${encodeURIComponent(uris)}`,
		{
			method: "DELETE",
		},
	);
}

export async function createPlaylist(name) {
	const resp = await proxy.request(
		`https://api.spotify.com/v1/me/playlists`,
		{
			method: "POST",
			body: JSON.stringify({
				name: name,
				description: "For friends",
				public: false,
			}),
		},
	);

	const data = await resp.json();
	return data;
}

export async function addItemsToPlaylist(playlistId, uris) {
	const resp = await proxy.request(
		`https://api.spotify.com/v1/playlists/${playlistId}/items`,
		{
			method: "POST",
			body: JSON.stringify({ uris }),
		},
	);
}
