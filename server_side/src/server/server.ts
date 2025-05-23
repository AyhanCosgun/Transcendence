import { Server } from "socket.io";
import { createServer } from "http";
import {Player, addPlayerToQueue, removePlayerFromQueue, startGameWithAI, startLocalGame} from "./matchmaking";
//import { Socket } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: { origin: "*" },
});


const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

type GameMode = 'vsAI' | 'localGame' | 'remoteGame';
interface GameStatus {currentGameStarted: boolean; game_mode: GameMode, level?: string};

// userId ⇒ Player
const players = new Map<string, Player>();

// Kayıt
//players.set(socket.id, { socket, username });

// Erişim
//const p = players.get(socket.id);


io.on("connection", socket =>
{
  console.log(`Bağlatı sağlandı: socket.id = ${socket.id}`);
  socket.once("username", ({ username }) =>
  {
   
    const player: Player = { socket, username };
    players.set(socket.id, player);
    console.log(`oyuncu players a kaydedildi, player.socket.id = ${player.socket.id}`);

    socket.on("start", (gameStatus : GameStatus) =>
      {console.log(`status SERVER A geldi, status = {${gameStatus.currentGameStarted}, ${gameStatus.game_mode}}`);
        if (gameStatus.game_mode === "vsAI")
            startGameWithAI(player, gameStatus.level!, io);
        else if (gameStatus.game_mode === "localGame")
            startLocalGame(player, io);
        else if (gameStatus.game_mode === "remoteGame")
            addPlayerToQueue(player, io);
      });

      // socket.on("startWithAI", ({ level }) => {
      //   // Direkt AI modu başlat
      //   startGameWithAI(player, level, io);
      // });

      // socket.on("findRival", () => {
      //   addPlayerToQueue(player, io);
      // });

      // socket.on("localGame", () => {
      //   startLocalGame(player, io);
      // });

    socket.on("disconnect", () => {
    removePlayerFromQueue(player);
    players.delete(player.socket.id);
    });

  });

  socket.on("disconnect", () =>
    {
    if (players.has(socket.id)) return; // Zaten yukarıda temizlenecek
    console.log(`[Server] Unregistered socket disconnected: ${socket.id}`);
    });
});
