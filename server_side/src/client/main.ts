import { createCamera, createPaddles, createGround, createWalls, createScene } from "./gameScene";
import { startGameLoop} from "./gameLoop"
import { BallController } from "./ball";
import { initializeGameSettings, GameInfo } from "./network";
import { createGame } from "./ui";


// 🎮 WebSocket bağlantısı
import {createSocket } from "./network";

export const socket = createSocket();

const game_mode = initializeGameSettings();

const startButton = document.getElementById("start-button")!;
export let gameInfo : GameInfo;
 startButton.addEventListener("click", () => {
    gameInfo = createGame(socket, game_mode);
    });



// 🎮 Canvas ve oyun motoru
const { canvas, engine, scene } = createScene();

// 🎮 Kamera & Işık
const camera = createCamera(scene);


// 🎮 Zemin
export const {ground, groundSize} = createGround(scene);

// 🎮 Paddle'lar ve top
export const { paddle1, paddle2, paddleSize } = createPaddles(scene);



// 🎮 Top
export const ball = new BallController(scene);



// 🎮 Duvarlar
const { bottomWall, topWall } = createWalls(scene);


// 🎮 Oyun motoru döngüsü
    startGameLoop(engine, scene);

canvas.focus();
