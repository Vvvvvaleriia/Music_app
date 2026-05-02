import { savedTracks } from "./dom.js";
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
	btn,
	playerBlock,
} from "./dom.js";

export async function authorize(code) {
	const response = await fetch("http://127.0.0.1:5000/api/access", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ code }),
	});

	const data = await response.json();
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
	return data;
}

export async function playTrack(track) {
	const uri = track.uri;

	await fetch(
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
	btn.hidden = false;

	toggleBtn.textContent = "pause";

	trackName.innerText = track.name;
	trackArtist.innerHTML = track.artists[0].name;

	const imgUrl = track.album.images[0].url; //|| track.image;
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
	return savedSngs.items;
}

export async function saveTrack(track) {
	const uris = `spotify:track:${track.id}`;
	await fetch(
		`https://api.spotify.com/v1/me/library?uris=${encodeURIComponent(uris)}`,
		{
			headers: {
				Authorization: `Bearer ${states.token}`,
				"Content-Type": "application/json",
			},
			method: "PUT",
		},
	);
}

export async function deleteSaved(track) {
	const uris = `spotify:track:${track.id}`;
	await fetch(
		`https://api.spotify.com/v1/me/library?uris=${encodeURIComponent(uris)}`,
		{
			headers: {
				Authorization: `Bearer ${states.token}`,
			},
			method: "DELETE",
		},
	);
}
