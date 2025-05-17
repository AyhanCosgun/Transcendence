import { updateScoreBoard, updateSetBoard, endMsg } from "./ui";
import { socket, startButton } from "./main";
import { GameInfo } from "./network";


//const startButton = document.getElementById("start-button")!;
const scoreBoard = document.getElementById("scoreboard")!;
const setBoard = document.getElementById("setboard")!;


export function initializeEventListeners(gameInfo: GameInfo)
{
  // LIMITS
  //const upperLimit = (groundSize.height - paddleSize.height) / 2;
  //const lowerLimit = -upperLimit;

  if(gameInfo.mode === 'remoteGame' || 'vsAI')
    {
      window.addEventListener("keydown", (event) => {
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
          socket.emit("local-input", { player: "left", direction: "up" });
           moved = true;
        }
        else if (event.key === 's')
          {
            socket.emit("local-input", { player: "left", direction: "down" });
            moved = true;
          }


      if (event.key === 'ArrowUp')
        {
          socket.emit("local-input", { player: "right", direction: "up" });
           moved = true;
        }
        else if (event.key === 'ArrowDown')
          {
            socket.emit("local-input", { player: "right", direction: "down" });
            moved = true;
          }


       if (moved)
          event.preventDefault();
    });

      window.addEventListener("keyup", (e) =>
        {
          if (["w", "s"].includes(e.key))
              socket.emit("local-input", { player: "left", direction: "stop" });
          
          if (["ArrowUp", "ArrowDown"].includes(e.key))
              socket.emit("local-input", { player: "right", direction: "stop" });
        });
    }


  // ******************************************************************************************************************************************************************************
  

  const resumeButton = document.getElementById("resume-button") as HTMLButtonElement;
  const newmatchButton = document.getElementById("newmatch-button") as HTMLButtonElement;
 
  if(gameInfo.mode !== 'remoteGame')
  {
    document.addEventListener("keydown", (event) => {
    if (event.code === "Space" && startButton.style.display == "none") {
      gameInfo.state!.isPaused = !(gameInfo.state!.isPaused);
      socket.emit("game-state", gameInfo.state);

      if (gameInfo.state!.isPaused) {
        // Duraklatıldığında "devam et" butonunu göster
        resumeButton.style.display = "block";
        newmatchButton.style.display = "block";
      } else {
        // Devam edildiğinde butonu gizle
        resumeButton.style.display = "none";
        newmatchButton.style.display = "none";
      }

    }
  });


  resumeButton?.addEventListener("click", () => {
    gameInfo.state!.isPaused = false;
    socket.emit("game-state", gameInfo.state);
    resumeButton.style.display = "none";
    newmatchButton.style.display = "none";
  });



  newmatchButton?.addEventListener("click", () => {
    resumeButton.style.display = "none";
    newmatchButton.style.display = "none";
    
     endMsg.style.display = "none";
        startButton.style.display = "none";
        scoreBoard.style.display = "flex";
        setBoard.style.display = "flex";

         gameInfo.state!.matchOver = false;
          gameInfo.state!.isPaused = false;
          socket.emit("game-state", gameInfo.state);
          updateScoreBoard(gameInfo);
          updateSetBoard(gameInfo);
  });
  }
}


