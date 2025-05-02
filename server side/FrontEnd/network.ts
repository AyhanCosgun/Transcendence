// client/network.ts
import { Socket } from "socket.io-client";
import { socket } from "./socket";
import { Mesh } from "@babylonjs/core";

export function setupSocketListeners(
  ball: Mesh,
  paddle1: Mesh,
  paddle2: Mesh,
  updateScore: (s1: number, s2: number) => void
) {
  socket.on("ballUpdate", (data: { x: number; y: number; score: { player1: number; player2: number } }) => {
    const SCALE = 0.025;
    const worldX = (data.x - 400) * SCALE;
    const worldY = (data.y - 300) * SCALE;

    ball.position.x = worldX;
    ball.position.y = worldY;

    updateScore(data.score.player1, data.score.player2);
  });

  socket.on("paddleUpdate", (data: { p1: number; p2: number }) => {
    const SCALE = 0.025;
    paddle1.position.y = (data.p1 - 300) * SCALE;
    paddle2.position.y = (data.p2 - 300) * SCALE;
  });

  socket.on("opponentDisconnected", () => {
    alert("Rakibiniz bağlantıyı kesti.");
    window.location.reload();
  });
}

export { socket };




