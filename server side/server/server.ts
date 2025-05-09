// server/server.ts
import { Server } from "socket.io";
import { createServer } from "http";
import { addPlayerToQueue, removePlayerFromQueue, startGameWithAI} from "./matchmaking";
import { Socket } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: { origin: "*" },
});

io.on("connection", socket =>
{
  socket.on("startWithAI", ({ level }) => {
    // Direkt AI modu başlat
    startGameWithAI({ socket, alias: socket.id }, level, io);
  });

  socket.on("findRival", () => {
    addPlayerToQueue(socket, socket.id, io);
  });

  socket.on("disconnect", () => {
    removePlayerFromQueue(socket);
  });
});


const PORT = 3000;
httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

