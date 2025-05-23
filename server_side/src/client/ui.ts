
import { GameInfo, prepareScoreBoards} from "./network";
import { Socket } from "socket.io-client";
import { initializeEventListeners, newmatchButton } from "./eventListeners";
import { startButton } from "./main";

const scoreBoard = document.getElementById("scoreboard")!;
const setBoard = document.getElementById("setboard")!;
const scoreTable = document.getElementById("score-table")!;
const setTable = document.getElementById("set-table")!;
export const endMsg = document.getElementById("end-message")!;



// MAÇ VE SET AYARLAMA
type Player = 'player1' | 'player2';

export function updateScoreBoard(gameInfo: GameInfo)
{if (gameInfo.state?.isPaused) return;
   scoreTable.innerText = `${gameInfo.ballState!.points.leftPlayer}  :  ${gameInfo.ballState!.points.rightPlayer}`;
}

export function updateSetBoard(gameInfo: GameInfo)
{if (gameInfo.state?.isPaused) return;
    setTable.innerText = `${gameInfo.ballState!.sets.leftPlayer}  :  ${gameInfo.ballState!.sets.rightPlayer}`;
}




// OYUN FONKSİYONLARI

export function createGame(socket: Socket, gameInfo: GameInfo)
{
    endMsg.style.display = "none";
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


export function showSetToast(gameInfo: GameInfo, message: string): Promise<void>
{
  return new Promise((resolve) => {
    const toast = document.getElementById("set-toast")!;
    toast.textContent = message;
    toast.style.opacity = "1";
    

    setTimeout(() => {
      toast.style.opacity = "0";
     gameInfo.nextSetStartedFlag = false;
      resolve();
    }, 3000);
  });
}


export async function startNextSet(gameInfo: GameInfo)
{
  const winnerName = gameInfo.ballState!.points.leftPlayer > gameInfo.ballState!.points.rightPlayer ? gameInfo.ballState?.usernames.left : gameInfo.ballState?.usernames.right;
  console.log(`startNextSet fonksiyonuna geldik, winnerName = ${winnerName}`);
  await showSetToast(gameInfo, `Seti ${winnerName} kazandı !`);  // 3 saniye bekler
}




export function showEndMessage(gameInfo: GameInfo) {
  const winnerName = gameInfo.ballState!.points.leftPlayer > gameInfo.ballState!.points.rightPlayer ? gameInfo.ballState?.usernames.left : gameInfo.ballState?.usernames.right;
  console.log(`showEndMsg fonksiyonuna geldik, gameInfo.state?.matchOver = ${gameInfo.state?.matchOver}`);
  endMsg.textContent = `${winnerName} maçı kazandı !`;
  endMsg.style.display = "flex";
  if (startButton) {
    startButton.textContent = "Tekrar Oyna";
    startButton.style.display = "inline-block";
  }
  newmatchButton.style.display = "block";
}