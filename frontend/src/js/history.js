export function savePlayedTrack(track) {
	const date = new Date().toISOString().split("T")[0];

	const listOfPlayed =
		JSON.parse(localStorage.getItem("listenedHistory")) || [];

	const alreadyExists = listOfPlayed.some(
		(item) => item.trackId === track.id && item.playedAt === date,
	);

	if (alreadyExists) return;

	listOfPlayed.push({
		trackId: track.id,
		name: track.name,
		artist: track.artists[0].name,
		playedAt: date,
	});

	localStorage.setItem("listenedHistory", JSON.stringify(listOfPlayed));
	console.log(date);
}

export function renderHistory(date) {
	const listened = JSON.parse(localStorage.getItem("listenedHistory"));
	const filteredTracks = listened.filter((track) => track.playedAt === date);

	const historyList = document.querySelector(".history-container");
	for (const track of filteredTracks) {
		const liSaved = document.createElement("li");
		liSaved.innerHTML = `${track.name} - ${track.artist}`;

		historyList.appendChild(liSaved);
	}
}
