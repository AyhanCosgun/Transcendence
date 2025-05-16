import { io, Socket } from "socket.io-client";
import { gameInfo, socket } from "./main";
//import { Socket } from "socket.io";

export function createSocket(): Socket
{
// WebSocket bağlantısı oluşturuluyor
const socket = io("http://localhost:3000");

//ilk önce kullanıcı adını yolla //Şimdilik socket.id !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
socket.on("connect", () => {
  socket.emit("username", { username: socket.id });
});

//ilerde böyle olacak:
// export const socket = io("http://localhost:3000", {
//   auth: { userId: myUserId }
// });

  return socket;
}


export type gameMode = 'vsAI' | 'localGame' | 'remoteGame' | null;

// OYUN SEÇENEKLERİNİ PAYLAŞ //gameConstants, gameState, ballUpdate, paddleUpdate *****************************************************

export function initializeGameSettings(): gameMode
{
  let game_mode: gameMode = null;

  const btnVsComp = document.getElementById("btn-vs-computer")!;
  const btnFindRival = document.getElementById("btn-find-rival")!;
  const diffDiv = document.getElementById("difficulty")!;
  const btnLocal = document.getElementById("btn-local")!;
  const startButton = document.getElementById("start-button")!;

// 1) VS Computer’a basıldığında zorluk seçeneklerini göster
btnVsComp.addEventListener("click", () =>
  {
  document.getElementById("menu")!.classList.add("hidden");
  diffDiv.classList.remove("hidden");
});

// 2) Zorluk seçildiğinde server’a emit et
diffDiv.querySelectorAll("button").forEach(btn => {
  btn.addEventListener("click", () => {
    const level = (btn as HTMLElement).dataset.level!;
    socket.emit("startWithAI", { level });
    console.log(`${level} a TIKLANMIŞ`);
    game_mode = 'vsAI'; 
     diffDiv.classList.add("hidden"); 
    startButton.style.display = "block";
  });
});

// 3) Find Rival butonuna basıldığında normal matchmaking
btnFindRival.addEventListener("click", () => {
  document.getElementById("menu")!.classList.add("hidden");
  socket.emit("findRival");
  game_mode = 'remoteGame';
});

// 4) local game e tıklanırsa 

btnLocal.addEventListener("click", () => {
  document.getElementById("menu")!.classList.add("hidden");
  socket.emit("localGame");
  game_mode = 'localGame';

});
  return game_mode;
}


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
  usernames: {left: string, right: string}
}

interface PaddleState {
  p1y: number;
  p2y: number;
}

export class GameInfo
{
  constants: GameConstants | null = null;
  state: GameState | null = null;
  ballState: BallState | null = null;
  paddle: PaddleState | null = null;
  mode: gameMode;
  constructor(mode: gameMode)
  {
    this.mode = mode;
  }
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
    this.ballState = b;
  }

  setPaddle(p: PaddleState)
  {
    this.paddle = p;
  }

  /** bilgiler hazır mı? */ // BUNA GÖRE GAME LOOP BAŞLATILACAK !!!!!!!!!!!!!!!!!!
  isReady() {
    return Boolean(this.constants && this.state && this.ballState && this.paddle);
  }
}


export function prepareGameInfo(socket: Socket)
{

socket.on("gameConstants", (constants: GameConstants) => {
  gameInfo.setConstants(constants);
});

socket.on("gameState", (state: GameState) => {
  gameInfo.setState(state);
});

socket.on("ballUpdate", (ballState: BallState) => {
  gameInfo.setBall(ballState);
});

socket.on("paddleUpdate", (paddle: PaddleState) => {
  gameInfo.setPaddle(paddle);
});

const blueTeam = document.getElementById("blue-team")!;
const redTeam = document.getElementById("red-team")!;

blueTeam.innerText = `${gameInfo.ballState?.usernames.left}`;
redTeam.innerText = `${gameInfo.ballState?.usernames.right}`;
}

//********************************************************************************************************************************** */


// ???????????????????????????????????????????????????????????????????????????????????????????


  // socket.addEventListener("close", () => {
  //   console.log("Sunucuyla bağlantı kapatıldı.");
  // });

  // socket.addEventListener("error", (err) => {
  //   console.error("WebSocket hatası:", err);
  // });


// ???????????????????????????????????????????????????????????????????????????????????????????
