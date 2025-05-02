import { Engine, Scene } from "@babylonjs/core";
import { createCamera, createPaddles, createBall, createGround, createWalls } from "./gameScene";
import { createGameUI, updatePaddlePosition, updateBallPosition } from "./ui";
import { createInitialBall, updateBall, BallState } from "./gameLogic";

// 🎮 WebSocket bağlantısı
import { setupSocketListeners } from "./network";


// 🎮 Canvas ve oyun motoru
const canvas = document.getElementById("game-canvas") as HTMLCanvasElement;
const engine = new Engine(canvas, true);
const scene = new Scene(engine);

// 🎮 Kamera & Işık
const camera = createCamera(scene);

// 🎮 Paddle'lar ve top
const { paddle1, paddle2 } = createPaddles(scene);

// 🎮 Top
const ball = createBall(scene);

// 🎮 Zemin
const ground = createGround(scene);

// 🎮 Duvarlar
const { bottomWall, topWall } = createWalls(scene);

// 🎮 WebSocket ve oyun dinleyicilerini ayarla
const updateScore = (p1: number, p2: number) => {
  const scoreEl = document.getElementById("score-table");
  if (scoreEl) scoreEl.textContent = `${p1} : ${p2}`;
};

setupSocketListeners(ball, paddle1, paddle2, updateScore);


// 🎮 Oyun motoru döngüsü
engine.runRenderLoop(() => {
  scene.render();
});

canvas.focus();
