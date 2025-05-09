import { createCamera, createPaddles, createGround, createWalls, createScene } from "./gameScene";
import { startGameLoop} from "./gameLoop"
import { BallController } from "./ball";
import { initializeEventListeners, createStartButton } from "./eventListeners";


// 🎮 WebSocket bağlantısı
import {socket } from "./network";

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

export const startButton = createStartButton();
initializeEventListeners();

socket.on("opponent-move", (data) => {
  paddle2.position.y = data.paddlePosition;
});

// 🎮 Oyun motoru döngüsü
startGameLoop(engine, scene);

canvas.focus();
