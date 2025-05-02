// gameLogic.ts

export interface BallState {
    x: number;
    y: number;
    vx: number;
    vy: number;
  }
  
  const BALL_SPEED = 5;
  
  export function createInitialBall(): BallState {
    return {
      x: 395,
      y: 295,
      vx: BALL_SPEED,
      vy: BALL_SPEED,
    };
  }
  
  export function updateBall(ball: BallState, playerY: number, opponentY: number): BallState {
    // Hareket
    ball.x += ball.vx;
    ball.y += ball.vy;
  
    // Yukarı-aşağı çarpışma
    if (ball.y <= 0 || ball.y >= 590) {
      ball.vy *= -1;
    }
  
    // Paddle çarpışması
    if (
      (ball.x <= 10 && ball.y >= playerY && ball.y <= playerY + 100) ||
      (ball.x >= 780 && ball.y >= opponentY && ball.y <= opponentY + 100)
    ) {
      ball.vx *= -1;
    }
  
    return ball;
  }
  




  export type Move = "rock" | "paper" | "scissors";

export type GameResult = {
  winner: "player1" | "player2" | "draw";
};

// Basit taş-kağıt-makas kuralı
function determineWinner(p1: Move, p2: Move): GameResult {
  if (p1 === p2) {
    return { winner: "draw" };
  }

  if (
    (p1 === "rock" && p2 === "scissors") ||
    (p1 === "scissors" && p2 === "paper") ||
    (p1 === "paper" && p2 === "rock")
  ) {
    return { winner: "player1" };
  }

  return { winner: "player2" };
}

// Oyun durumunu yöneten sınıf
export class Game {
  private moves: { [playerId: string]: Move } = {};

  setMove(playerId: string, move: Move) {
    this.moves[playerId] = move;
  }

  isReady(): boolean {
    return Object.keys(this.moves).length === 2;
  }

  getResult(): GameResult | null {
    const players = Object.keys(this.moves);
    if (players.length !== 2) return null;

    const [p1, p2] = players;
    const result = determineWinner(this.moves[p1], this.moves[p2]);

    return result;
  }

  reset() {
    this.moves = {};
  }
}

// client/gameLogic.ts
import { Socket } from "socket.io-client";

export function startGameLoop(socket: Socket) {
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      socket.emit("move", { direction: e.key });
    }
  });
}

