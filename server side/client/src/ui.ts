import { Vector3} from "@babylonjs/core";
import {ball, groundSize} from "./main";
import { startButton } from "./main";
import { gameInfo } from "./network";


const scoreTable = document.getElementById("score-table")!;
const setTable = document.getElementById("set-table")!;


// MAÇ VE SET AYARLAMA
type Player = 'player1' | 'player2';

// export interface GameState {
//   points: { player1: number; player2: number };
//   sets: { player1: number; player2: number };
//   matchOver: boolean;
//   setOver: boolean;
//   isPaused: boolean;
// }


// export const gameState: GameState = {
//   points: { player1: 0, player2: 0 },
//   sets: { player1: 0, player2: 0 },
//   matchOver: false,
//   setOver: false,
//   isPaused: false,
// };


export function updateScoreBoard()
{
   scoreTable.innerText = `${gameInfo.ball!.points.player1}  :  ${gameInfo.ball!.points.player2}`;
}

export function updateSetBoard()
{
    setTable.innerText = `${gameInfo.ball!.sets.player1}  :  ${gameInfo.ball!.sets.player2}`;
}




// OYUN FONKSİYONLARI

export function resetBall(lastScorer: Player)
{
  ball.state.firstPedalHit = 0;
  ball.state.speedIncreaseFactor = 1.7;
  ball.state.minimumSpeed = ball.state.firstSpeedFactor;
  // 🎯 Önce topu durdur
  ball.state.velocity = new Vector3(0, 0, 0);

  // 🎯 Topu ortada sabitle
  ball.getBall().position = new Vector3(0, Math.random()*(0.8*groundSize.height)-0.4*groundSize.height, 0);
  

  // 🎯 Belirli bir süre bekle ( 1 saniye)
  setTimeout(() => {

    const angle = lastScorer == 'player1' ? (Math.random()*2-1)*Math.PI/6 : Math.PI - (Math.random()*2-1)*Math.PI/6;
    // 2 saniye sonra yeni rastgele bir hız ver
    ball.state.velocity = new Vector3( Math.cos(angle)*ball.state.firstSpeedFactor,
    Math.sin(angle)*ball.state.firstSpeedFactor,
      0);

  }, 1000); // 1000ms = 1 saniye
}

export function startGame()
{
  gameInfo.state!.matchOver = false;
  gameInfo.isPaused = false;
  resetScores();
  resetSets();
  Math.random() <= 0.5  ? resetBall('player1') : resetBall('player2');
}


export function resetScores()
{
  gameInfo.ball!.points.player1 = 0;

  
  gameInfo.ball!.points.player2 = 0;
  updateScoreBoard();
}

export function resetSets()
{
  gameInfo.ball!.sets.player1 = 0;
  gameInfo.ball!.sets.player2 = 0;
  updateSetBoard();
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



export function scorePoint(winner: Player)
{
  if (gameInfo.state?.matchOver) return;

  gameInfo.ball!.points[winner]++;

  updateScoreBoard();

  const p1 = gameInfo.ball!.points.player1;
  const p2 = gameInfo.ball!.points.player2;

  // Kontrol: Set bitti mi?
  if ((p1 >= 11 || p2 >= 11) && Math.abs(p1 - p2) >= 2)
    {
      if (p1 > p2) {
      gameInfo.ball!.sets.player1++;
    } else {
      gameInfo.ball!.sets.player2++;      
    }

    updateSetBoard();
    const matchControl = (gameInfo.ball!.sets.player1 === 3 || gameInfo.ball!.sets.player2 === 3);
    if (!matchControl)
        startNextSet(`Seti ${winner} kazandı!`);
    setTimeout(() => {
      if (!matchControl)
          resetScores();
    }, 3000);
    
    resetBall(winner);

    // Kontrol: Maç bitti mi?
    if (matchControl)
      {
        showEndMessage(`${winner} maçı kazandı !`);
        gameInfo.state!.matchOver = true;
      }
  }
  else
  {
    resetBall(winner);
  }
}