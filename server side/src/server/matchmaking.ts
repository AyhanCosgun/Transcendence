// src/matchmaking.ts
import { Socket } from "socket.io";
import { Game, Paddle } from "./game"; // Oyunun mantığını yöneten sınıf
import { Server } from "socket.io";
import { LocalPlayerInput, RemotePlayerInput, AIPlayerInput } from "./inputProviders";

export interface Player
{
	socket: Socket;
	username: String;
}

const waitingPlayers = new Map<string, Player>();

export function addPlayerToQueue(player: Player, io: Server)
{
	waitingPlayers.set(player.socket.id, player);
	checkForMatch(io);
}

export function removePlayerFromQueue(player: Player)
{
	waitingPlayers.delete(player.socket.id);
}
  


  export function startGameWithAI(human: Player, level: "easy"|"medium"|"hard", io: Server)
  {
	const roomId = `game_${human.socket.id}_vs_AI_${level}`;
	human.socket.join(roomId);

	let getGame: () => Game;
	let getPaddle: () => Paddle;

  
	const leftInput = new RemotePlayerInput(human);
	const rightInput = new AIPlayerInput(() => getGame!(), () => getPaddle!(), "AI", level);


			// Yeni bir oyun başlat
	const game = new Game(leftInput, rightInput, io, roomId);
	game.startGameLoop();
  }



  export function startLocalGame(player1: Player, io: Server)
  {
	const leftInput = new LocalPlayerInput(player1.username);
	const rightInput = new LocalPlayerInput("friend");

	player1.socket.on("local-input", ({ player, direction }) =>
	{
		if (player === "left") leftInput.updateDirection(direction);
  		else if (player === "right") rightInput.updateDirection(direction);
	});


	const roomId = `game_${player1.socket.id}_vs_friend`;
	player1.socket.join(roomId);
  
	const game = new Game(leftInput, rightInput, io, roomId);
	game.startGameLoop();
  }

function mapShift<K, V>(map: Map<K, V>): V | undefined {
  const firstKeyValuCouple = map.entries().next();
  if (firstKeyValuCouple.done) return undefined;
  const [key, val] = firstKeyValuCouple.value;
  map.delete(key);
  return val;
}

function checkForMatch(io: Server)
{
	while (waitingPlayers.size >= 2) {
		const player1 = mapShift(waitingPlayers);
		const player2 = mapShift(waitingPlayers);

		if (player1 && player2) {
			const roomId = `game_${player1.socket.id}_${player2.socket.id}`;
			player1.socket.join(roomId);
			player2.socket.join(roomId);

			const leftInput = new RemotePlayerInput(player1);
			const rightInput = new RemotePlayerInput(player2);


			// Yeni bir oyun başlat
			const game = new Game(leftInput, rightInput, io, roomId);
			game.startGameLoop();

			//console.log(`Yeni oyun başlatıldı: ${roomId}`);
		}
	}
}
