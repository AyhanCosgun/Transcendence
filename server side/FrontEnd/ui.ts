// ui.ts

export function createGameUI(): void {
    const container = document.createElement("div");
    container.id = "game-container";
    container.style.position = "relative";
    container.style.width = "800px";
    container.style.height = "600px";
    container.style.border = "2px solid black";
    container.style.margin = "0 auto";
    container.style.backgroundColor = "black";
    document.body.appendChild(container);
  
    const playerPaddle = document.createElement("div");
    playerPaddle.id = "player-paddle";
    Object.assign(playerPaddle.style, {
      position: "absolute",
      width: "10px",
      height: "100px",
      left: "0",
      top: "250px",
      backgroundColor: "white",
    });
    container.appendChild(playerPaddle);
  
    const opponentPaddle = document.createElement("div");
    opponentPaddle.id = "opponent-paddle";
    Object.assign(opponentPaddle.style, {
      position: "absolute",
      width: "10px",
      height: "100px",
      right: "0",
      top: "250px",
      backgroundColor: "white",
    });
    container.appendChild(opponentPaddle);
  
    const ball = document.createElement("div");
    ball.id = "ball";
    Object.assign(ball.style, {
      position: "absolute",
      width: "10px",
      height: "10px",
      backgroundColor: "white",
      left: "395px",
      top: "295px",
    });
    container.appendChild(ball);
  }
  
  export function updatePaddlePosition(paddleId: string, y: number): void {
    const paddle = document.getElementById(paddleId);
    if (paddle) {
      paddle.style.top = `${y}px`;
    }
  }
  
  export function updateBallPosition(x: number, y: number): void {
    const ball = document.getElementById("ball");
    if (ball) {
      ball.style.left = `${x}px`;
      ball.style.top = `${y}px`;
    }
  }
  





  // Basit mesajları göstermek için kullanılan HTML öğesini seç
const statusElement = document.getElementById("status")!;
const resultElement = document.getElementById("result")!;

// Rakip bulunduğunda kullanıcıya bilgi ver
export function updateUIForMatchFound() {
  statusElement.textContent = "Rakip bulundu! Oyun hazırlanıyor...";
  resultElement.textContent = "";
}

// Rakip bekleniyorsa kullanıcıya göster
export function updateUIForWaiting() {
  statusElement.textContent = "Rakip bekleniyor...";
  resultElement.textContent = "";
}

// Oyun bittiğinde sonucu göster
export function showGameResult(payload: { winner: "player1" | "player2" | "draw" }) {
  if (payload.winner === "draw") {
    resultElement.textContent = "Berabere!";
  } else if (payload.winner === "player1") {
    resultElement.textContent = "Oyunu Kazandınız!";
  } else {
    resultElement.textContent = "Kaybettiniz.";
  }
}
