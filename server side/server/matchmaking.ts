// src/matchmaking.ts
import { Socket } from "socket.io";
import { Game } from "./game"; // Oyunun mantığını yöneten sınıf
import { Server } from "socket.io";

interface Player
{
	socket: Socket;
	username: String;

}

const waitingPlayers: Player[] = [];

export function addPlayerToQueue(socket: Socket, username: String, io: Server)
{
	const newPlayer : Player = {socket, username};
	waitingPlayers.push(newPlayer);
	checkForMatch(io);
}

export function removePlayerFromQueue(socket: Socket) {
	const index = waitingPlayers.findIndex(player => player.socket.id === socket.id);
	if (index !== -1) {
	  waitingPlayers.splice(index, 1);
	  //console.log(`Player with socket id ${socket.id} removed from queue.`);
	}
  }
  


  export function startGameWithAI(human: Player, level: "easy"|"medium"|"hard", io: Server)
  {
	const roomId = `game_${human.socket.id}_AI_${level}`;
	human.socket.join(roomId);
  
	// Game sınıfındaki ikinci parametre null => AI modu
	const game = new Game(human.socket, null, io, roomId, level);
	game.startGameLoop();
  }



  export function startLocalGame(player1: Player, io: Server)
  {
	const roomId = `game_${player1.socket.id}_vs_friend`;
	player1.socket.join(roomId);
  
	const game = new Game(player1.socket, player1.socket, io, roomId);
	game.startGameLoop();
  }



function checkForMatch(io: Server) {
	while (waitingPlayers.length >= 2) {
		const player1 = waitingPlayers.shift();
		const player2 = waitingPlayers.shift();

		if (player1 && player2) {
			const roomId = `game_${player1.socket.socket.id}_${player2.socket.socket.id}`;
			player1.socket.socket.join(roomId);
			player2.socket.socket.join(roomId);

			// Yeni bir oyun başlat
			const game = new Game(player1.socket, player2.socket, io, roomId);
			game.startGameLoop();

			//console.log(`Yeni oyun başlatıldı: ${roomId}`);
		}
	}
}
