// src/matchmaking.ts
import { Socket } from "socket.io";
import { Game } from "./game"; // Oyunun mantığını yöneten sınıf
import { Server } from "socket.io";

interface Player {
	socket: Socket;
}

const waitingPlayers: Player[] = [];

export function addPlayerToQueue(socket: Socket, io: Server) {
	waitingPlayers.push({ socket });
	checkForMatch(io);
}

function checkForMatch(io: Server) {
	while (waitingPlayers.length >= 2) {
		const player1 = waitingPlayers.shift();
		const player2 = waitingPlayers.shift();

		if (player1 && player2) {
			const roomId = `game_${player1.socket.id}_${player2.socket.id}`;
			player1.socket.join(roomId);
			player2.socket.join(roomId);

			// Yeni bir oyun başlat
			const game = new Game(player1.socket, player2.socket, io, roomId);
			game.start();

			console.log(`Yeni oyun başlatıldı: ${roomId}`);
		}
	}
}
