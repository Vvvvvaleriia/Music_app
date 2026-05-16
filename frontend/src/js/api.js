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
import proxy from "./proxy.js";

export async function authorize(code) {
	// const response = await fetch("http://127.0.0.1:5000/api/access", {
	// 	method: "POST",
	// 	headers: {
	// 		"Content-Type": "application/json",
	// 	},
	// 	body: JSON.stringify({ code }),
	// });
	const response = await proxy.request("http://127.0.0.1:5000/api/access", {
		method: "POST",
		body: JSON.stringify({ code }),
	});

	const data = await response.json();

	console.log(data);
	localStorage.setItem("acces_token", data.token);
	localStorage.setItem("refresh_token", data.refreshToken);

	return data.token;
}

export async function isTokenValid(token) {
	const res = await fetch(`https://api.spotify.com/v1/me`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

	return res.status == 200;
}

export async function getRefreshToken() {
	const refreshToken = localStorage.getItem("refresh_token");

	const resp = await fetch(`https://accounts.spotify.com/api/token`, {
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		method: "POST",
		body: new URLSearchParams({
			grant_type: "refresh_token",
			refresh_token: refreshToken,
			//client_id: clientId,
		}),
	});

	const data = await resp.json();

	localStorage.setItem("access_token", data.access_token);

	return data.access_token;
}

export async function searchForType(query, type) {
	const resp = await fetch(
		`https://api.spotify.com/v1/search?q=${query}&type=${type}`,
		{
			headers: {
				Authorization: `Bearer ${states.token}`,
			},
			method: "GET",
		},
	);

	const data = await resp.json();

	// if (resp.status == 401) {
	// 	window.alert("You need to re-authorize");
	// 	return;
	// }

	return data;
}

export async function playTrack(track) {
	const uri = track.uri;

	const resp = await fetch(
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

	// if (resp.status == 401) {
	// 	window.alert("You need to re-authorize");
	// 	return;
	// }

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
	const resp = await fetch(`https://api.spotify.com/v1/me/tracks`, {
		headers: {
			Authorization: `Bearer ${states.token}`,
		},
		method: "GET",
	});

	const savedSngs = await resp.json();

	// if (resp.status == 401) {
	// 	window.alert("You need to re-authorize");
	// 	return;
	// }

	return savedSngs.items;
}

export async function saveTrack(track) {
	const uris = `spotify:track:${track.id}`;
	const resp = await fetch(
		`https://api.spotify.com/v1/me/library?uris=${encodeURIComponent(uris)}`,
		{
			headers: {
				Authorization: `Bearer ${states.token}`,
				"Content-Type": "application/json",
			},
			method: "PUT",
		},
	);

	// if (resp.status == 401) {
	// 	window.alert("You need to re-authorize");
	// 	return;
	// }
}

export async function deleteSaved(track) {
	const uris = `spotify:track:${track.id}`;
	const resp = await fetch(
		`https://api.spotify.com/v1/me/library?uris=${encodeURIComponent(uris)}`,
		{
			headers: {
				Authorization: `Bearer ${states.token}`,
			},
			method: "DELETE",
		},
	);

	// if (resp.status == 401) {
	// 	window.alert("You need to re-authorize");
	// 	return;
	// }
}

export async function createPlaylist(name) {
	const resp = await fetch(`https://api.spotify.com/v1/me/playlists`, {
		headers: {
			Authorization: `Bearer ${states.token}`,
			"Content-Type": "application/json",
		},
		method: "POST",
		body: JSON.stringify({
			name: name,
			description: "For friends",
			public: false,
		}),
	});

	const data = await resp.json();
	return data;
}

export async function addItemsToPlaylist(playlistId, uris) {
	const resp = await fetch(
		`https://api.spotify.com/v1/playlists/${playlistId}/items`,
		{
			headers: {
				Authorization: `Bearer ${states.token}`,
				"Content-Type": "application/json",
			},
			method: "POST",
			body: JSON.stringify({ uris }),
		},
	);
}
