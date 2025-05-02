import { startGame, endMsg } from "./ui";
import { groundSize, paddle1, paddle2, paddleSize } from "./main";
import { socket } from "./network";


export function createStartButton()
{
   // START BUTTON
   const startButton = document.getElementById("start-button")!;
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
  window.addEventListener("keydown", (event) => {
    const step = 1;
    let moved = false;

    if (event.key === "ArrowUp" && paddle2.position.y < upperLimit) {
      paddle2.position.y += step;
      moved = true;
    } else if (event.key === "ArrowDown" && paddle2.position.y > lowerLimit) {
      paddle2.position.y -= step;
      moved = true;
    }

    if (moved) {
      event.preventDefault();
      socket.emit("player-move", {
        paddlePosition: paddle2.position.y,
      });
    }
  });
}

