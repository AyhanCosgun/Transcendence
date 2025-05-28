import { updateScoreBoard, updateSetBoard, endMsg } from "./ui";
import { socket, startButton } from "./main";
import { GameInfo } from "./network";

const scoreBoard = document.getElementById("scoreboard")!;
const setBoard = document.getElementById("setboard")!;
export const newmatchButton = document.getElementById("newmatch-button") as HTMLButtonElement;


export function initializeEventListeners(gameInfo: GameInfo)
{
  if(gameInfo.mode === 'remoteGame' || gameInfo.mode === 'vsAI')
    {
      window.addEventListener("keydown", (event) =>
        {
          let moved = false;

          if (event.key === 'w')
            {
              socket.emit("player-move", { direction: "up" });
              moved = true;
            }
            else if (event.key === 's')
              {
                socket.emit("player-move", { direction: "down" });
                moved = true;
              }

          if (moved)
              event.preventDefault();
        });

      window.addEventListener("keyup", (e) =>
        {
          if (["w", "s"].includes(e.key))
              socket.emit("player-move", { direction: "stop" });
        });
    }


    else if(gameInfo.mode === 'localGame')
    {
      window.addEventListener("keydown", (event) => {
      let moved = false;

      if (event.key === 'w')
        {
          socket.emit("local-input", { player_side: "left", direction: "up" });
           moved = true;
        }
        else if (event.key === 's')
          {
            socket.emit("local-input", { player_side: "left", direction: "down" });
            moved = true;
          }


      if (event.key === 'ArrowUp')
        {
          socket.emit("local-input", { player_side: "right", direction: "up" });
           moved = true;
        }
        else if (event.key === 'ArrowDown')
          {
            socket.emit("local-input", { player_side: "right", direction: "down" });
            moved = true;
          }


       if (moved)
          event.preventDefault();
      });

      window.addEventListener("keyup", (e) =>
        {
          if (["w", "s"].includes(e.key))
              socket.emit("local-input", { player_side: "left", direction: "stop" });
          
          if (["ArrowUp", "ArrowDown"].includes(e.key))
              socket.emit("local-input", { player_side: "right", direction: "stop" });
        });
    }


  // ******************************************************************************************************************************************************************************
  

  const resumeButton = document.getElementById("resume-button") as HTMLButtonElement;
 
  if(gameInfo.mode !== 'remoteGame')
  {
    document.addEventListener("keydown", (event) =>
    {
    if (event.code === "Space" && startButton.style.display == "none")
      {
      gameInfo.state!.isPaused = !(gameInfo.state!.isPaused);
      
      if (gameInfo.state!.isPaused) {
        
        socket.emit("pause-resume", {status: "pause"});
        // Duraklatıldığında "devam et" butonunu göster
        resumeButton.style.display = "block";
        newmatchButton.style.display = "block";
      } else {
        socket.emit("pause-resume", {status: "resume"});
        // Devam edildiğinde butonu gizle
        resumeButton.style.display = "none";
        newmatchButton.style.display = "none";
      }

      }
    });


    resumeButton?.addEventListener("click", () =>
    {
      gameInfo.state!.isPaused = false;
      socket.emit("pause-resume", {status: "resume"});
      resumeButton.style.display = "none";
      newmatchButton.style.display = "none";
    });
  }



  newmatchButton?.addEventListener("click", () =>
    {console.log(`yeni maça başlaya tıklandı, içerik : ${newmatchButton.innerText}`);
    resumeButton.style.display = "none";
    newmatchButton.style.display = "none";
    if (startButton)
      startButton.style.display = "none";
    
    if(!gameInfo.state?.matchOver)
        socket.emit("reset-match");
    window.location.reload();

    //document.getElementById("menu")!.classList.remove("hidden");
    
    //  endMsg.style.display = "none";
    //     startButton.style.display = "none";
    //     scoreBoard.style.display = "flex";
    //     setBoard.style.display = "flex";

        //  gameInfo.state!.matchOver = false;
        //   gameInfo.state!.isPaused = false;
        //   socket.emit("pause-resume", {state: gameInfo.state, status: "stable"});
         
          // updateScoreBoard(gameInfo);
          // updateSetBoard(gameInfo);
    });
}


