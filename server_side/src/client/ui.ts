
import { GameInfo, prepareScoreBoards} from "./network";
import { Socket } from "socket.io-client";
import { initializeEventListeners } from "./eventListeners";
import { startButton } from "./main";

const scoreBoard = document.getElementById("scoreboard")!;
const setBoard = document.getElementById("setboard")!;
const scoreTable = document.getElementById("score-table")!;
const setTable = document.getElementById("set-table")!;
export const endMsg = document.getElementById("end-message")!;



// MAÇ VE SET AYARLAMA
type Player = 'player1' | 'player2';

export function updateScoreBoard(gameInfo: GameInfo)
{
   scoreTable.innerText = `${gameInfo.ballState!.points.leftPlayer}  :  ${gameInfo.ballState!.points.rightPlayer}`;
}

export function updateSetBoard(gameInfo: GameInfo)
{
    setTable.innerText = `${gameInfo.ballState!.sets.leftPlayer}  :  ${gameInfo.ballState!.sets.rightPlayer}`;
}




// OYUN FONKSİYONLARI

export function createGame(socket: Socket, gameInfo: GameInfo)
{
    endMsg.style.display = "none";
    startButton.style.display = "none";
    scoreBoard.style.display = "flex";
    setBoard.style.display = "flex";
    
  
  //prepareGameInfo(gameInfo, socket);
  prepareScoreBoards(gameInfo);
  initializeEventListeners(gameInfo);
  gameInfo.state!.matchOver = false;
  gameInfo.state!.isPaused = false;
  socket.emit("game-state", {state: gameInfo.state, status: "stable"}); // ????????? şu anda bunu alan yok !!
  updateScoreBoard(gameInfo);
  updateSetBoard(gameInfo);
}


// export function showSetToast(gameInfo: GameInfo, message: string): Promise<void>
// {
//   return new Promise((resolve) => {
//     const toast = document.getElementById("set-toast")!;
//     toast.textContent = message;
//     toast.style.opacity = "1";
//     gameInfo.state!.setOver = true;

//     setTimeout(() => {
//       toast.style.opacity = "0";
//       gameInfo.state!.setOver = false;
//       resolve();
//     }, 3000);
//   });
// }


// export async function startNextSet(message: string)
// {
//   await showSetToast(message);  // 3 saniye bekler
// }




// export function showEndMessage(message: string) {
  
//   endMsg.textContent = message;
//   endMsg.style.display = "flex";
//   if (startButton) {
//     startButton.style.display = "inline-block";
//     startButton.textContent = "Yeni Maça Başla";
//   }
// }