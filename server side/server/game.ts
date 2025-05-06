// server/game.ts
import { Server, Socket } from "socket.io";

const UNIT = 40;

interface Position
{
  x : number;
  y : number;
}


interface Ball
{
  readonly firstSpeedFactor: number;
  readonly airResistanceFactor: number;
  minimumSpeed: number;
  readonly radius: number;
  speedIncreaseFactor: number;
  firstPedalHit: number;
  position: Position;
  velocity: Position;
}


interface Paddle
{
  readonly width: number;
  readonly height: number;
  position : Position;
}




export class Game
{
  private ball: Ball;
  private paddle1: Paddle;
  private paddle2: Paddle;
  private ground: {width: number; height : number};
  points: { player1: number; player2: number };
  sets: { player1: number; player2: number };
  matchOver: boolean;
  setOver: boolean;
  isPaused: boolean;
  constructor()
  {
    this.ball = 
    {
        firstSpeedFactor: 0.15*UNIT,
        airResistanceFactor: 0.998,
        minimumSpeed: 0.15*UNIT,
        radius: 0.25*UNIT,
        speedIncreaseFactor: 1.7,
        firstPedalHit: 0,
        position : { x:0 , y:0},
        velocity : {x:0.14*UNIT, y:0.15*UNIT},
    };
    this.paddle1 = 
    {
      width:0.2*UNIT ,
      height:,
      position: {}
    };
    this.velocity = {x:2, y:2};
  }

  // Gerekirse ek işlevsellik eklenebilir (örneğin: updatePosition, applyResistance, vs.)
}







export class Gamennnn {
  private ball = { x: 0, y: 0, vx: 2, vy: 2, radius: 5 };
  private paddle1Y = 250;
  private paddle2Y = 250;
  private readonly paddleHeight = 100;
  private readonly canvasHeight = 600;
  private readonly canvasWidth = 800;
  private score = { player1: 0, player2: 0 };

  private roomId: string;
  private io: Server;
  private interval: NodeJS.Timer;

  constructor(
    private player1: Socket,
    private player2: Socket,
    io: Server,
    roomId: string
  ) {
    this.io = io;
    this.roomId = roomId;
    this.listenForMoves();
  }

  public start() {
    this.interval = setInterval(() => this.update(), 1000 / 60); // 60 FPS
  }

  private listenForMoves() {
    this.player1.on("move", (data) => {
      this.paddle1Y = data.y;
    });

    this.player2.on("move", (data) => {
      this.paddle2Y = data.y;
    });
  }

  private update() {
    const b = this.ball;

    // Top hareketi
    b.x += b.vx;
    b.y += b.vy;

    // Duvarlara çarpma
    if (b.y <= 0 || b.y + b.radius >= this.canvasHeight) {
      b.vy *= -1;
    }

    // Paddle çarpışması
    const paddle1Bounds = { x: 10, y: this.paddle1Y, w: 10, h: this.paddleHeight };
    const paddle2Bounds = { x: this.canvasWidth - 20, y: this.paddle2Y, w: 10, h: this.paddleHeight };

    if (this.collides(b, paddle1Bounds)) {
      b.vx *= -1;
      b.x = paddle1Bounds.x + paddle1Bounds.w;
    }
    if (this.collides(b, paddle2Bounds)) {
      b.vx *= -1;
      b.x = paddle2Bounds.x - b.radius;
    }

    // Skor
    if (b.x < 0) {
      this.score.player2++;
      this.resetBall("player2");
    } else if (b.x > this.canvasWidth) {
      this.score.player1++;
      this.resetBall("player1");
    }

    // Pozisyonları yayınla
    this.io.to(this.roomId).emit("ballUpdate", {
      x: b.x,
      y: b.y,
      score: this.score
    });

    this.io.to(this.roomId).emit("paddleUpdate", {
      p1: this.paddle1Y,
      p2: this.paddle2Y
    });
  }

  private resetBall(lastScorer: "player1" | "player2") {
    this.ball.x = this.canvasWidth / 2;
    this.ball.y = this.canvasHeight / 2;
    const direction = lastScorer === "player1" ? -1 : 1;
    this.ball.vx = 2 * direction;
    this.ball.vy = 2;
  }

  private collides(ball: typeof this.ball, rect: { x: number; y: number; w: number; h: number }) {
    return (
      ball.x < rect.x + rect.w &&
      ball.x + ball.radius > rect.x &&
      ball.y < rect.y + rect.h &&
      ball.y + ball.radius > rect.y
    );
  }
}


