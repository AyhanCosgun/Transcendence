import { startGame, endMsg, gameState } from "./ui";
import { groundSize, paddle1, paddle2, paddleSize } from "./main";
import { socket } from "./network";


const startButton = document.getElementById("start-button")!;

export function createStartButton()
{
   // START BUTTON
   startButton.addEventListener("click", () => {
     endMsg.style.display = "none";
     startButton.style.display = "none";
     startGame();
   });
   return startButton;
}

export function initializeEventListeners() {

  // LIMITS
  const upperLimit = (groundSize.height - paddleSize.height) / 2;
  const lowerLimit = -upperLimit;

  // PADDLE 1
  window.addEventListener("keydown", (event) => {
    const step = 1;
    let moved = false;

    if (event.key === 'w' && paddle1.position.y < upperLimit) {
      paddle1.position.y += step;
      moved = true;
    } else if (event.key === 's' && paddle1.position.y > lowerLimit) {
      paddle1.position.y -= step;
      moved = true;
    }

    if (moved) {
      event.preventDefault();
      socket.emit("player-move", {
        paddlePosition: paddle1.position.y,
      });
    }
  });

  // PADDLE 2
  // window.addEventListener("keydown", (event) => {
  //   const step = 1;
  //   let moved = false;

  //   if (event.key === "ArrowUp" && paddle2.position.y < upperLimit) {
  //     paddle2.position.y += step;
  //     moved = true;
  //   } else if (event.key === "ArrowDown" && paddle2.position.y > lowerLimit) {
  //     paddle2.position.y -= step;
  //     moved = true;
  //   }

  //   if (moved) {
  //     event.preventDefault();
  //     socket.emit("player-move", {
  //       paddlePosition: paddle2.position.y,
  //     });
  //   }
  // });


  const resumeButton = document.getElementById("resume-button") as HTMLButtonElement;
  const newmatchButton = document.getElementById("newmatch-button") as HTMLButtonElement;
 
  document.addEventListener("keydown", (event) => {
    if (event.code === "Space" && startButton.style.display == "none") {
      gameState.isPaused = !gameState.isPaused;

      if (gameState.isPaused) {
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
    gameState.isPaused = false;
    resumeButton.style.display = "none";
    newmatchButton.style.display = "none";
  });



  newmatchButton?.addEventListener("click", () => {
    resumeButton.style.display = "none";
    newmatchButton.style.display = "none";
    startGame();
  });
  


}



