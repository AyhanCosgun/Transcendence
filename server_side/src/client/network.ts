import { io, Socket } from "socket.io-client";
import { gameStatus, startButton } from "./main";
//import { Socket } from "socket.io";

export function createSocket(): Socket
{
// WebSocket bağlantısı oluşturuluyor
const socket = io("http://localhost:3001");
//const socket = io("http://127.0.0.1:3001");

//ilk önce kullanıcı adını yolla //Şimdilik socket.id !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
socket.on("connect", () => {
  console.log("Socket connected with ID:", socket.id);
  socket.emit("username", { username: "Ayhan" });
});

//ilerde böyle olacak:
// export const socket = io("http://localhost:3001", {
//   auth: { userId: myUserId }
// });

  return socket;
}


export type GameMode = 'vsAI' | 'localGame' | 'remoteGame' | null;

export const info = document.getElementById("info")!;


// OYUN SEÇENEKLERİNİ PAYLAŞ //gameConstants, gameState, ballUpdate, paddleUpdate *****************************************************

export function initializeGameSettings(onModeSelected: (status: {currentGameStarted: boolean, game_mode: GameMode}) => void)
{console.log(`initializeGame settings içindeyiz, gameStatus.currentGameStarted = ${gameStatus.currentGameStarted}`);
  if(gameStatus.currentGameStarted)
  {
    onModeSelected(gameStatus);
    return;
  }
  let status : {currentGameStarted: boolean, game_mode: GameMode, level?: string};
  status = {currentGameStarted: false, game_mode: null};

  const btnVsComp = document.getElementById("btn-vs-computer")!;
  const btnFindRival = document.getElementById("btn-find-rival")!;
  const diffDiv = document.getElementById("difficulty")!;
  const btnLocal = document.getElementById("btn-local")!;

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
    //socket.emit("startWithAI", { level });
    status.game_mode = 'vsAI';
    status.level = level; 
     diffDiv.classList.add("hidden"); 
    startButton.style.display = "block";
    onModeSelected(status);
  });
});

// 3) Find Rival butonuna basıldığında normal matchmaking
btnFindRival.addEventListener("click", () => {
  document.getElementById("menu")!.classList.add("hidden"); 
  info.textContent = "Online bir rakip için bekleniyor  ...";
  info.style.opacity = "1";
  status.game_mode = 'remoteGame';
  onModeSelected(status);
});

// 4) local game e tıklanırsa 

btnLocal.addEventListener("click", () => {
  document.getElementById("menu")!.classList.add("hidden");
  //socket.emit("localGame");
  status.game_mode = 'localGame';
  startButton.style.display = "block";
  onModeSelected(status);

});
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
}


interface BallState {
  bp: {x: number, y: number};
  bv: {x: number, y: number};
  points: { leftPlayer: number, rightPlayer: number };
  sets: { leftPlayer: number, rightPlayer: number };
  usernames: {left: String, right: String}
  py: number;
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
  mode: GameMode;
  nextSetStartedFlag: boolean = false;
  constructor(mode: GameMode)
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


interface Player
{
  socket: Socket;
  username: string;
}


export function waitForMatchReady(socket: Socket): Promise<string>
{
   return new Promise((resolve) =>
    {
    	socket.on("match-ready", (matchPlayers : {left: string, right: string}) =>
        {console.log("match-ready emiti geldi");
          //const rival = matchPlayers.left.socket.id === socket.id ? matchPlayers.right.username : matchPlayers.left.username;
          let rival = matchPlayers.right;
          info.textContent = `${rival} ile eşleştin`;
          startButton.innerHTML = `${rival} ile oyna !`;
           startButton.style.display = "block";
           resolve(rival);
        });
    });
}


export function waitForRematchApproval(socket: Socket, rival: string): Promise<boolean>
{
  return new Promise((resolve) =>
    {
      info.textContent = `Talebiniz ${rival} oyuncusuna iletildi.`;
      info.style.opacity = "1";
      setTimeout(() => { info.textContent = `${rival} oyuncusunun onayı bekleniyor ...`; }, 1000);
      
      socket.on("rematch-ready", () =>
        {console.log("rematch-ready emiti geldi");
          info.textContent = `Maç başlıyor`;
          setTimeout(() =>
            {
              info.style.opacity = "0";
              resolve(true);
            }, 1000);
        });

      setTimeout(() =>
      {
        info.textContent = `${rival} oyuncusundan onay gelmedi !`;
        setTimeout(() =>
        {
          info.style.opacity = "0";
        }, 2000);
        resolve(false);
      }, 20000);   
  });
}


export function waitForGameInfoReady(gameInfo: GameInfo, socket: Socket): Promise<void>
{
	return new Promise((resolve) => {
		const tryResolve = () => {
			if (gameInfo.isReady()) {
				resolve();
			}
		};

		socket.on("gameConstants", (constants: GameConstants) => {
      console.log(`cliente  gameConstants geldi :
      groundWidth: ${constants.groundWidth},
       groundHeight: ${constants.groundHeight},
       ballRadius: ${constants.ballRadius},
       paddleWidth: ${constants.paddleWidth},
       paddleHeight: ${constants.paddleHeight}`);
			gameInfo.setConstants(constants);
			tryResolve();
		});

		socket.on("gameState", (state: GameState) => {
      console.log(`client e gameState geldi:
      matchOver: ${state.matchOver},
      setOver: ${state.setOver},
      isPaused: ${state.isPaused}`);
      if (state.matchOver)
        console.log(`matchOver TRUE geldi..........`);
			gameInfo.setState(state);
			tryResolve();
		});

		socket.on("ballUpdate", (ballState: BallState) => {
			gameInfo.setBall(ballState);
			tryResolve();
		});

		socket.on("paddleUpdate", (data) => {
      const paddle:PaddleState = data;
			gameInfo.setPaddle(paddle);
			tryResolve();
		});
	});
}


export function prepareScoreBoards(gameInfo: GameInfo)
{
const blueTeam = document.getElementById("blue-team")!;
const redTeam = document.getElementById("red-team")!;

const blueTeam_s = document.getElementById("blue-team-s")!;
const redTeam_s = document.getElementById("red-team-s")!;

blueTeam.innerText = `${gameInfo.ballState?.usernames.left}`;
redTeam.innerText = `${gameInfo.ballState?.usernames.right}`;

blueTeam_s.innerText = `${gameInfo.ballState?.usernames.left}`;
redTeam_s.innerText = `${gameInfo.ballState?.usernames.right}`;
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
