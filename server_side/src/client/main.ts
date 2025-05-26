import { createCamera, createPaddles, createGround, createWalls, createScene} from "./gameScene";
import {Mesh, Engine, Scene} from "@babylonjs/core";
import { startGameLoop} from "./gameLoop"
import { BallController } from "./ball";
import { initializeGameSettings, GameInfo, waitForGameInfoReady, waitForMatchReady, waitForRematchApproval, GameMode, info } from "./network";
import { createGame, endMsg } from "./ui";
import { newmatchButton } from "./eventListeners";

// 🎮 WebSocket bağlantısı
import {createSocket } from "./network";

export const socket = createSocket();

export const startButton = document.getElementById("start-button")!;


//game materials...
let engine: Engine | undefined = undefined;
let scene: Scene | undefined = undefined;
let gameInfo: GameInfo | null = null;
let canvas: HTMLCanvasElement;
let groundRef: Mesh;
let groundSizeRef: {width: number, height: number};
let paddle1Ref: Mesh;
let paddle2Ref: Mesh;
let ballRef: BallController;

export let gameStatus : {currentGameStarted: boolean, game_mode: GameMode, level?: string};
gameStatus = { currentGameStarted: false,  game_mode: null};
let reMatch = false;


initializeGameSettings(async (status) =>
{
    console.log(`status geldi, status = {${status.currentGameStarted}, ${status.game_mode}}`);
    gameStatus = status;
    socket.emit("start", gameStatus);

    if (gameStatus.game_mode === "remoteGame")
    {
      await waitForMatchReady(socket);
      console.log(`${socket.id} için maç HAZIR`);
    }


	// Oyun başlatma butonuna tıklanınca:
	startButton.addEventListener("click", async () =>
    {
      console.log(`START A TIKLANDI, içeriği : ${startButton.innerText}`);
      startButton.style.display = "none";
      endMsg.style.display = "none";
      
      info.style.opacity = "0";
      newmatchButton.style.display = "none";
      
      if (gameStatus.currentGameStarted)
      {
        reMatch = true;
        cleanOldGame();
      }
      socket.emit("ready", false);
      if (gameStatus.game_mode === "remoteGame" && reMatch)
        {
          const approval = await waitForRematchApproval(socket);
          if (approval)
            socket.emit("ready", true);
          else
          {
            newmatchButton.style.display = "block";
            return;
          }
        }
      gameInfo = new GameInfo(gameStatus.game_mode);
      await waitForGameInfoReady(gameInfo, socket);
      console.log(`${socket.id} için VERİLER HAZIR`);
		  createGame(socket, gameInfo);
		  startGame(gameInfo); // oyun kurulumuna geç
	  });
});

function cleanOldGame()
{
  scene!.dispose();
  engine!.dispose();

  scene = undefined;
  engine = undefined;

  socket.off("gameConstants");
  socket.off("gameState");
  socket.off("ballUpdate");
  socket.off("paddleUpdate");
  socket.off("ready");
  socket.off("rematch-ready");
  socket.off("start");
  socket.off("username");
  socket.off("player-move");
  socket.off("local-input");
  socket.off("game-state");
  socket.off("reset-match");
 
  gameInfo = null;

 
  gameStatus.currentGameStarted = false;
}

export function startGame(gameInfo: GameInfo)
{
    // 🎮 Canvas ve oyun motoru
  const sceneSetup = createScene();
  canvas = sceneSetup.canvas;
  engine = sceneSetup.engine;
  scene = sceneSetup.scene;

    // 🎮 Kamera & Işık
    const camera = createCamera(scene);


    // 🎮 Zemin
    groundRef = createGround(scene, gameInfo).ground;
    groundSizeRef = createGround(scene, gameInfo).groundSize;

    // 🎮 Paddle'lar ve top
    const {paddle1, paddle2} = createPaddles(scene, gameInfo);
    paddle1Ref = paddle1;
    paddle2Ref = paddle2;


    // 🎮 Top
    ballRef = new BallController(scene, gameInfo);


    // 🎮 Duvarlar
    const { bottomWall, topWall } = createWalls(scene);


    // 🎮 Oyun motoru döngüsü
        startGameLoop(engine, scene, gameInfo);

    canvas.focus();
    console.log("gamestatus true oldu");
    gameStatus.currentGameStarted = true;
}


export { groundRef as ground,
groundSizeRef as groundSize, paddle1Ref as paddle1, paddle2Ref as paddle2, ballRef as ball };