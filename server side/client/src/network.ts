import { io } from "socket.io-client";
import { gameState } from "./ui";

// WebSocket bağlantısı oluşturuluyor
export const socket = io("http://localhost:3000");


// OYUN SEÇENEKLERİNİ PAYLAŞ //gameConstants, gameState, ballUpdate, paddleUpdate *****************************************************

const btnVsComp = document.getElementById("btn-vs-computer")!;
const btnFindRival = document.getElementById("btn-find-rival")!;
const diffDiv = document.getElementById("difficulty")!;

// 1) VS Computer’a basıldığında zorluk seçeneklerini göster
btnVsComp.addEventListener("click", () => {
  document.getElementById("menu")!.classList.add("hidden");
  diffDiv.classList.remove("hidden");
});

// 2) Zorluk seçildiğinde server’a emit et
diffDiv.querySelectorAll("button").forEach(btn => {
  btn.addEventListener("click", () => {
    const level = (btn as HTMLElement).dataset.level!;
    socket.emit("startWithAI", { level });  
  });
});

// 3) Find Rival butonuna basıldığında normal matchmaking
btnFindRival.addEventListener("click", () => {
  document.getElementById("menu")!.classList.add("hidden");
  socket.emit("findRival");
});

// OYUN BİLGİLERİNİ AL //gameConstants, gameState, ballUpdate, paddleUpdate *****************************************************


interface GameConstants {
  groundWidth: number;
  groundHeight: number;
  ballRadius: number;
  paddleWidth: number;
  paddleHeight: number;
}

interface GameState {
  matchOver: boolean;
  setOver: boolean;
  isPaused: boolean;
  aiPlayer: boolean;
}


interface BallState {
  bp: {x: number, y: number};
  bv: {x: number, y: number};
  points: { player1: number, player2: number };
  sets: { player1: number, player2: number };
}

interface PaddleState {
  p1y: number;
  p2y: number;
}

class GameInfo
{
  constants: GameConstants | null = null;
  state: GameState | null = null;
  ball: BallState | null = null;
  paddle: PaddleState | null = null;

  /** Constants geldiğinde ata */
  setConstants(c: GameConstants)
  {
    this.constants = c;
  }

  /** State geldiğinde ata */
  setState(g: GameState)
  {
    this.state = g;
  }

  setBall(b: BallState)
  {
    this.ball = b;
  }

  setPaddle(p: PaddleState)
  {
    this.paddle = p;
  }

  /** bilgiler hazır mı? */ // BUNA GÖRE GAME LOOP BAŞLATILACAK !!!!!!!!!!!!!!!!!!
  isReady() {
    return Boolean(this.constants && this.state && this.ball && this.paddle);
  }
}

export const gameInfo = new GameInfo();

socket.on("gameConstants", (constants: GameConstants) => {
  gameInfo.setConstants(constants);
});

socket.on("gameState", (state: GameState) => {
  gameInfo.setState(state);
});

socket.on("ballUpdate", (ball: BallState) => {
  gameInfo.setBall(ball);
});

socket.on("paddleUpdate", (paddle: PaddleState) => {
  gameInfo.setPaddle(paddle);
});

//********************************************************************************************************************************** */



  socket.addEventListener("close", () => {
    console.log("Sunucuyla bağlantı kapatıldı.");
  });

  socket.addEventListener("error", (err) => {
    console.error("WebSocket hatası:", err);
  });

