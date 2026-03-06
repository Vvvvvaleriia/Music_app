const songsList = document.querySelector(".list-song");
const btnSend = document.querySelector("button");

const songs = localStorage.getItem("playlist");
const songsJSON = JSON.parse(songs);
for (const song of songsJSON){
    const li = `<li>${song}</li>`
    songsList.insertAdjacentHTML("beforeend", li);
}

btnSend.onclick = function(){
    const input = document.querySelector("input");
    const textInput = input.value;
    const li = `<li>${textInput} <button>on</button></li>`
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
        if (event.target.textContent === "on"){
            event.target.textContent = "off";
        } else {
            const btns = document.querySelectorAll(".list-song button");
            let onExists = false;

            for (const btn of btns){
                if (btn.textContent === "on"){
                    onExists = true;
                    break;
                }
            }
            if (!onExists){
                event.target.textContent = "on";
            }
        }
    }
}