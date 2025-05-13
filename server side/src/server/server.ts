// server/server.ts
import { Server } from "socket.io";
import { createServer } from "http";
import {Player, addPlayerToQueue, removePlayerFromQueue, startGameWithAI, startLocalGame} from "./matchmaking";
import { Socket } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: { origin: "*" },
});


// userId ⇒ Player
const players = new Map<string, Player>();

// Kayıt
//players.set(socket.id, { socket, username });

// Erişim
//const p = players.get(socket.id);


io.on("connection", socket =>
{
  socket.once("username", ({ username }) => {
    //oyuncuyu kaydet
    players.set(socket.id, { socket, username });
  });

  const player = players.get(socket.id);

  socket.on("startWithAI", ({ level }) => {
    // Direkt AI modu başlat
    startGameWithAI(player!, level, io);
  });

  socket.on("findRival", () => {
    addPlayerToQueue(player!, io);
  });

  socket.on("localGame", () => {
    startLocalGame(player!, io);
  });

  socket.on("disconnect", () => {
    removePlayerFromQueue(player!);
    players.delete(player!.socket.id);
  });

});


const PORT = 3000;
httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});