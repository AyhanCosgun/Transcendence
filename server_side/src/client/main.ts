import { createCamera, createPaddles, createGround, createWalls, createScene } from "./gameScene";
import {Mesh} from "@babylonjs/core";
import { startGameLoop} from "./gameLoop"
import { BallController } from "./ball";
import { initializeGameSettings, GameInfo, waitForGameInfoReady } from "./network";
import { createGame } from "./ui";


// 🎮 WebSocket bağlantısı
import {createSocket } from "./network";

export const socket = createSocket();

export const startButton = document.getElementById("start-button")!;


initializeGameSettings((game_mode) => {
	// Oyun başlatma butonuna tıklanınca:
	startButton.addEventListener("click", async () => {
        console.log("STARTTA TIKLANDI");
        socket.emit("start");
        const gameInfo = new GameInfo(game_mode);
        await waitForGameInfoReady(gameInfo, socket);
       console.log("VERİLER HAZIR");
		createGame(socket, gameInfo);
		startGame(gameInfo); // oyun kurulumuna geç
	});
});

let groundRef: Mesh;
let groundSizeRef: {width: number, height: number};
let paddle1Ref: Mesh;
let paddle2Ref: Mesh;
let ballRef: BallController;


export function startGame(gameInfo: GameInfo)
{

// 🎮 Canvas ve oyun motoru
const { canvas, engine, scene } = createScene();

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
    //socket.emit("start");
    startGameLoop(engine, scene, gameInfo);

canvas.focus();

}


export { groundRef as ground,
groundSizeRef as groundSize, paddle1Ref as paddle1, paddle2Ref as paddle2, ballRef as ball };