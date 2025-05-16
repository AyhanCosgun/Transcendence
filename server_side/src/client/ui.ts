import {  gameInfo } from "./main";
import { GameInfo, prepareGameInfo, gameMode} from "./network";
import { Socket } from "socket.io-client";
import { initializeEventListeners } from "./eventListeners";

const scoreBoard = document.getElementById("scoreboard")!;
const setBoard = document.getElementById("setboard")!;
const scoreTable = document.getElementById("score-table")!;
const setTable = document.getElementById("set-table")!;
const startButton = document.getElementById("start-button")!;



// MAÇ VE SET AYARLAMA
type Player = 'player1' | 'player2';

export function updateScoreBoard()
{
   scoreTable.innerText = `${gameInfo.ballState!.points.player1}  :  ${gameInfo.ballState!.points.player2}`;
}

export function updateSetBoard()
{
    setTable.innerText = `${gameInfo.ballState!.sets.player1}  :  ${gameInfo.ballState!.sets.player2}`;
}




// OYUN FONKSİYONLARI

export function createGame(socket: Socket, mode: gameMode): GameInfo
{
    endMsg.style.display = "none";
    startButton.style.display = "none";
    scoreBoard.style.display = "flex";
    setBoard.style.display = "flex";
    
  const gameInfo = new GameInfo(mode);
  prepareGameInfo(socket);
  initializeEventListeners();
  gameInfo.state!.matchOver = false;
  gameInfo.state!.isPaused = false;
  updateScoreBoard();
  updateSetBoard();

  return gameInfo;
}


export function showSetToast(message: string): Promise<void>
{
  return new Promise((resolve) => {
    const toast = document.getElementById("set-toast")!;
    toast.textContent = message;
    toast.style.opacity = "1";
    gameInfo.state!.setOver = true;

    setTimeout(() => {
      toast.style.opacity = "0";
      gameInfo.state!.setOver = false;
      resolve();
    }, 3000);
  });
}


export async function startNextSet(message: string)
{
  await showSetToast(message);  // 3 saniye bekler
}



export const endMsg = document.getElementById("end-message")!;

export function showEndMessage(message: string) {
  
  endMsg.textContent = message;
  endMsg.style.display = "flex";
  if (startButton) {
    startButton.style.display = "inline-block";
    startButton.textContent = "Yeni Maça Başla";
  }
}