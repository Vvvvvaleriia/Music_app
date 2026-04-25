import { savedTracks } from "./dom.js";
import { states } from "./state.js";

export async function authorize(code) {
	const response = await fetch("http://127.0.0.1:5000/api/access", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ code }),
	});

	const data = await response.json();
	//localStorage.setItem("token", data.token);
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
