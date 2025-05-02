// server/server.ts
import { Server } from "socket.io";
import { createServer } from "http";
import { handleMatchmakingQueue, addPlayerToQueue } from "./matchmaking";
import { Game } from "./game"; // Game sınıfı burada kullanılıyor

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Oyuncuyu sıraya ekleyelim
  addPlayerToQueue(socket);

  // Gerekirse bağlantıdan çıkanları ele al
  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
    // Sıradan çıkarma veya oyunu iptal etme işlemleri burada yapılabilir
  });
});

// Bu fonksiyon Game başlatmak için matchmaking modülüne veriliyor
handleMatchmakingQueue((player1, player2) => {
  const game = new Game(player1, player2);
  game.start();
});

const PORT = 3000;
httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

