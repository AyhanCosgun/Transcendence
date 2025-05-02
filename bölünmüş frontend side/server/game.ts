// src/game.ts
import { Socket, Server } from "socket.io";

export class Game {
	private player1: Socket;
	private player2: Socket;
	private io: Server;
	private roomId: string;

	constructor(player1: Socket, player2: Socket, io: Server, roomId: string) {
		this.player1 = player1;
		this.player2 = player2;
		this.io = io;
		this.roomId = roomId;

		this.setupListeners();
	}

	public start() {
		this.io.to(this.roomId).emit("gameStart", {
			message: "Oyun başladı!",
			players: [this.player1.id, this.player2.id],
		});
	}

	private setupListeners() {
		this.player1.on("playerMove", (data) => {
			this.player2.emit("opponentMove", data);
		});

		this.player2.on("playerMove", (data) => {
			this.player1.emit("opponentMove", data);
		});

		this.player1.on("disconnect", () => {
			this.player2.emit("opponentDisconnected");
		});

		this.player2.on("disconnect", () => {
			this.player1.emit("opponentDisconnected");
		});
	}
}
