const songsList = document.querySelector(".list-song");
const btnSend = document.querySelector("button");

const songs = localStorage.getItem("playlist");
const songsJSON = JSON.parse(songs);
console.log(songsJSON);
for (const song of songsJSON){
    const li = `<li>${song} <button data-song="${song}">on</li>`
    songsList.insertAdjacentHTML("beforeend", li);
}

btnSend.onclick = function(){
    const input = document.querySelector("input");
    const textInput = input.value;
    const li = `<li>${textInput} <button data-song="${textInput}">on</button></li>`
    songsList.insertAdjacentHTML("beforeend", li);
    input.value = "";
    let playlist = localStorage.getItem("playlist");
    playlist = JSON.parse(playlist);
    playlist.push(textInput);
    const jsonPlayList = JSON.stringify(playlist);
    localStorage.setItem("playlist", jsonPlayList);
}

songsList.onclick = function(event){
    if (event.target.tagName === "BUTTON"){
        let clickedBtn = event.target;

        if (clickedBtn.textContent === "on"){
            let allButtons = songsList.querySelectorAll("BUTTON");
            for (const btn of allButtons){
                btn.textContent = "on";
            }
            clickedBtn.textContent = "off";

             if (!localStorage.getItem("historyListen")){
            localStorage.setItem("historyListen", JSON.stringify([]));
        }
        const songName = clickedBtn.dataset.song;
        let historyListen = JSON.parse(localStorage.getItem("historyListen"));
        historyListen.push(songName);
        localStorage.setItem("historyListen", JSON.stringify(historyListen));

        } else {
            clickedBtn.textContent = "on";
        }
    }
}