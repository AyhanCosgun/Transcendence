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
	console.log(`oyuncu waitingP layers a kaydedildi, player.socket.id = ${player.socket.id}`);
	console.log(`şu anda waitingPlayers size = ${waitingPlayers.size}`);
	checkForMatch(io);
}

export function removePlayerFromQueue(player: Player)
{
	 const checkPlayer = waitingPlayers.get(player.socket.id);
  if (typeof(checkPlayer) === 'undefined') {
    return;
  }
	waitingPlayers.delete(player.socket.id);
}
  


  export function startGameWithAI(human: Player, level: string, io: Server)
  {
	const roomId = `game_${human.socket.id}_vs_AI_${level}`;
	human.socket.join(roomId);
	
	let getGame: () => Game;
	let getPaddle: () => Paddle;

  
	const leftInput = new RemotePlayerInput(human);
	const rightInput = new AIPlayerInput(() => getGame!(), () => getPaddle!(), "AI", level);


			// Yeni bir oyun başlat
	human.socket.on("ready", () => 
	{console.log("vs AI modunda ready geldi");
	const game = new Game(leftInput, rightInput, io, roomId);
	getGame = () => game;
	getPaddle = () => game.getPaddle2();
	game.startGameLoop();
	});
  }



  export function startLocalGame(player1: Player, io: Server)
  {
	const leftInput = new LocalPlayerInput(player1, "left");
	const rightInput = new LocalPlayerInput(player1, "right");


	const roomId = `game_${player1.socket.id}_vs_friend`;
	player1.socket.join(roomId);
	
	player1.socket.on("ready", () =>
	{
	const game = new Game(leftInput, rightInput, io, roomId);
	game.startGameLoop();
	});
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
	while (waitingPlayers.size >= 2)
	{
		const player1 = mapShift(waitingPlayers);
		const player2 = mapShift(waitingPlayers);

		if (player1 && player2)
		{
			const roomId = `game_${player1.socket.id}_${player2.socket.id}`;
			player1.socket.join(roomId);
			player2.socket.join(roomId);

			const leftInput = new RemotePlayerInput(player1);
			const rightInput = new RemotePlayerInput(player2);

			console.log(`checkforMatch içindeyiz, roomid  =  ${roomId}`);
			console.log(`iki oyuncunun socketleri aynı mı ? : ${player1.socket === player2.socket}`);
			// Yeni bir oyun başlat


			let socket1Ready = false;
			let socket2Ready = false;

			function checkBothReady()
			{
			if (socket1Ready && socket2Ready)
				{
				console.log("Her iki socket de hazır!");
				const game = new Game(leftInput, rightInput, io, roomId);
				game.startGameLoop();
				}
			}

			player1.socket.on("ready", () => {
			socket1Ready = true;
			console.log("player1 hazır");
			checkBothReady();
			});

			player2.socket.on("ready", () => {
			socket2Ready = true;
			console.log("player2 hazır");
			checkBothReady();
			});

		}
	}
}
