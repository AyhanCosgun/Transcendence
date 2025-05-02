"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socket = void 0;
var socket_io_client_1 = require("socket.io-client");
// import { updateUIForMatchFound, updateUIForWaiting, showGameResult } from "./ui";
// import { startGame, handleOpponentMove } from "./gameLogic";
// import { updateUIForMatchFound, updateUIForWaiting, showGameResult } from "./ui";
// import { startGame, handleOpponentMove } from "./gameLogic";
// WebSocket bağlantısı oluşturuluyor
exports.socket = (0, socket_io_client_1.io)("http://localhost:3000");
// // 🎮 Karşı oyuncunun hareketini al
// socket.on("opponent-move", (data) => {
//   paddle2.position.y = data.paddlePosition;
// });
// export function setupSocketListeners() {
//   socket.addEventListener("open", () => {
//     console.log("Sunucuya bağlanıldı.");
//   });
//   socket.addEventListener("message", (event) => {
//     const data = JSON.parse(event.data);
//     switch (data.type) {
//       case "matchFound":
//         updateUIForMatchFound();
//         break;
//       case "waitingForOpponent":
//         updateUIForWaiting();
//         break;
//       case "startGame":
//         startGame(data.payload); // payload: { isPlayer1: true/false }
//         break;
//       case "opponentMove":
//         handleOpponentMove(data.payload); // payload: { x, y }
//         break;
//       case "gameOver":
//         showGameResult(data.payload); // payload: { winner: "player1"/"player2"/"draw" }
//         break;
//       default:
//         console.warn("Bilinmeyen mesaj tipi:", data);
//         break;
//     }
//   });
//   socket.addEventListener("close", () => {
//     console.log("Sunucuyla bağlantı kapatıldı.");
//   });
//   socket.addEventListener("error", (err) => {
//     console.error("WebSocket hatası:", err);
//   });
// }
// // Oyuncunun yaptığı hamleyi sunucuya gönder
// export function sendMove(move: { x: number; y: number }) {
//   socket.send(JSON.stringify({
//     type: "playerMove",
//     payload: move,
//   }));
// }
