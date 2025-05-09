// server/game.ts
import { Server, Socket } from "socket.io";
import { predictBallY, aiPaddleMovement } from "./aiPlayer";

const UNIT = 40;


type Player = 'player1' | 'player2';


interface Position
{
  x : number;
  y : number;
}


export interface Ball
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


export interface Paddle
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
  private points: { player1: number, player2: number };
  private sets: { player1: number, player2: number };
  private groundWidth = 20*UNIT;
  private matchOver = true;
  private setOver = true;
  private isPaused = true;
  private aiPlayer = false;
  private level : String;

  private roomId: string;
  private io: Server;
  private interval: NodeJS.Timeout;

  constructor( private player1: Socket, private player2: Socket, io: Server, roomId: string, level?: string)
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
    this.ground =
    {
      width: this.groundWidth,
      height: this.groundWidth*(152.5)/274,
    };

    const w = 0.2*UNIT;
    this.paddle1 = 
    {
      width:w ,
      height: this.ground.height*(0.3),
      position: {
        x : -this.groundWidth/2 + w,
        y : 0 },
    };

    this.paddle2 = 
    {
      width:0.2*UNIT ,
      height: this.ground.height*(0.3),
      position: {
        x : this.groundWidth/2 - this.paddle1.width,
        y : 0 },
    };


    this.points = { player1: 0, player2: 0 };
    this.sets = { player1: 0, player2: 0 };
    if (level)
      this.level = level;
    else
      this.level = 'medium';
    if (!player2)
      this.aiPlayer = true;

    this.io = io;
    this.roomId = roomId;
    this.exportGameConstants();
    this.listenForMoves();
  }


  private exportGameConstants()
  {
     const gameConstants = 
     {
       groundWidth: this.ground.width/UNIT,
       groundHeight: this.ground.height/UNIT,
       ballRadius: this.ball.radius/UNIT,
       paddleWidth: this.paddle1.width/UNIT,
       paddleHeight: this.paddle1.height/UNIT
      };

      this.io.to(this.roomId).emit("gameConstants", gameConstants);
  }



  public startGameLoop() {
    this.matchOver = false;
    this.setOver = false;
    this.isPaused = false;

    const gameState = 
    {
      matchOver: this.matchOver,
      setOver: this.setOver,
      isPaused: this.isPaused,
      aiPlayer : this.aiPlayer
     };

     this.io.to(this.roomId).emit("gameState", gameState);

    this.interval = setInterval(() => this.update(), 1000 / 60); // 60 FPS
  }

  private listenForMoves() {
    this.player1.on("move", (data) => {
      this.paddle1.position.y = data.y;
    });

    this.player2.on("move", (data) => {
      this.paddle2.position.y = data.y;
    });
  }

  private resetScores()
  {
    this.points.player1 = 0;
    this.points.player2 = 0;
  }


  private startNextSet()
  {
    this.setOver = true;
  
      setTimeout(() => {
        this.resetScores();
        this.setOver = false;

      }, 3000);
  }



  private resetBall(lastScorer: "player1" | "player2")
  {
    this.ball.firstPedalHit = 0;
    this.ball.speedIncreaseFactor = 1.7*UNIT;
    this.ball.minimumSpeed = this.ball.firstSpeedFactor;
    // 🎯 Önce topu durdur
    this.ball.velocity = {x:0, y:0};
  
    // 🎯 Topu ortada sabitle
    this.ball.position = {x:0, y: Math.random()*(0.8*this.ground.height)-0.4*this.ground.height};
    
  
    // 🎯 Belirli bir süre bekle ( 1 saniye)
    setTimeout(() => {
  
      const angle = lastScorer == 'player1' ? (Math.random()*2-1)*Math.PI/6 : Math.PI - (Math.random()*2-1)*Math.PI/6;
      // 2 saniye sonra yeni rastgele bir hız ver
      this.ball.velocity = {x: Math.cos(angle)*this.ball.firstSpeedFactor, y: Math.sin(angle)*this.ball.firstSpeedFactor};
  
    }, 1000); // 1000ms = 1 saniye
  }


   private scorePoint(winner: Player)
  {
    if (this.matchOver) return;
  
    this.points[winner]++;
  
   // updateScoreBoard();
  
    const p1 = this.points.player1;
    const p2 = this.points.player2;
  
    // Kontrol: Set bitti mi?
    if ((p1 >= 11 || p2 >= 11) && Math.abs(p1 - p2) >= 2)
      {
        if (p1 > p2) {
        this.sets.player1++;
      } else {
        this.sets.player2++;      
      }
  
      //updateSetBoard();
      const matchControl = (this.sets.player1 === 3 || this.sets.player2 === 3);
      if (!matchControl)
          this.startNextSet();
            
      this.resetBall(winner);
  
      // Kontrol: Maç bitti mi?
      if (matchControl)
        this.matchOver = true;
     }
    else   //set bitmedi
    {
      this.resetBall(winner);
    }
  }

  private update()
  {
    if (this.matchOver) return;
    if (this.setOver) return;
    if (this.isPaused) return;


//Ai pedal hareketi
    if (this.aiPlayer)
      aiPaddleMovement(this.level, this.ball, this.paddle2, this.ground);

       
    // Top hareketi
    this.ball.position.x += this.ball.velocity.x;
    this.ball.position.y += this.ball.velocity.y;


    // 🎯 Duvar Çarpışması
    if (((this.ball.position.y > (this.ground.height/2 - this.ball.radius) && this.ball.velocity.y > 0)
      || (this.ball.position.y < -(this.ground.height/2 - this.ball.radius) && this.ball.velocity.y < 0))
      && Math.abs(this.ball.position.x) <= this.ground.width/2 + this.ball.radius) 
      {
         this.ball.velocity.y *= -1; 
      }
    
    
    
    // 🎯 Paddle Çarpışması
    const paddleXThreshold = this.ball.radius + this.paddle1.width;  // çarpışma hassasiyeti
    const paddleYThreshold = (this.paddle1.height + this.ball.radius)/2;  // paddle genişliğine göre
    
    
    // Paddle1 (soldaki oyuncu)
    if (Math.abs(this.ball.position.x - this.paddle1.position.x) < paddleXThreshold && this.ball.velocity.x < 0 &&
      Math.abs(this.ball.position.y - this.paddle1.position.y) < paddleYThreshold && this.ball.position.x > this.paddle1.position.x)
      {
        this.ball.velocity.x *= -1; 
    
      // 🎯 Nereden çarptı?
      const offset = this.ball.position.y - this.paddle1.position.y;
      
      // 🎯 y yönüne ekstra açı ver
      this.ball.velocity.y += offset * 0.05;
      if (this.ball.firstPedalHit++)
        {
          this.ball.speedIncreaseFactor = 1.2;
          this.ball.minimumSpeed = 0.2;
        }
    
        // 🎯 HIZI ARTTIR
        this.ball.velocity.x *= this.ball.speedIncreaseFactor;
        this.ball.velocity.y *= this.ball.speedIncreaseFactor;
    }
    
    // pedalın köşesinden sektir
    if (Math.abs(this.ball.position.x - this.paddle1.position.x) < paddleXThreshold && this.ball.velocity.x < 0
      && Math.abs(this.ball.position.y - this.paddle1.position.y) >= paddleYThreshold
      && Math.abs(this.ball.position.y - this.paddle1.position.y) <= (this.paddle1.height/2 + this.ball.radius)
      && this.ball.position.x > this.paddle1.position.x
      && (this.ball.position.y - this.paddle1.position.y) * this.ball.velocity.y < 0 )
      {
        this.ball.velocity.y *= -1;
      }
    
    
    // Paddle2 (sağdaki oyuncu)
   if (!this.aiPlayer) 
  {
      if (
      Math.abs(this.ball.position.x - this.paddle2.position.x) < paddleXThreshold && this.ball.velocity.x > 0 &&
      Math.abs(this.ball.position.y - this.paddle2.position.y) < paddleYThreshold && this.ball.position.x < this.paddle2.position.x 
    ) {
      this.ball.velocity.x *= -1;
    
      const offset = this.ball.position.y - this.paddle2.position.y;
      
      // 🎯 y yönüne ekstra açı ver
      this.ball.velocity.y += offset * 0.05;
      // ilk pedal çarpmasından sonra topu çok hızlandır, daha sonra az arttır 
      if (this.ball.firstPedalHit++)
      {
        this.ball.speedIncreaseFactor = 1.2;
        this.ball.minimumSpeed = 0.2*UNIT;
      }
    
        // 🎯 HIZI ARTTIR
        this.ball.velocity.x *= this.ball.speedIncreaseFactor;
        this.ball.velocity.y *= this.ball.speedIncreaseFactor;
    }
  
    
    
    // pedalın köşesinden sektir
    if (Math.abs(this.ball.position.x - this.paddle2.position.x) < paddleXThreshold && this.ball.velocity.x > 0
      && Math.abs(this.ball.position.y - this.paddle2.position.y) >= paddleYThreshold
      && Math.abs(this.ball.position.y - this.paddle2.position.y) <= (this.paddle1.height/2 + this.ball.radius)
      && this.ball.position.x < this.paddle2.position.x
      && (this.ball.position.y - this.paddle2.position.y) * this.ball.velocity.y < 0 )
      {
        this.ball.velocity.y *= -1;
      }
    }



      // 🎯 Skor kontrolü
      if (this.ball.position.x > this.ground.width/2 + 5)
        {
          this.scorePoint('player1');
        }
      else if (this.ball.position.x < -this.ground.width/2 - 5)
        {
          this.scorePoint('player2');
        }
      
      
      
      // 🎯 HAVA DİRENCİ UYGULA // her bir frame için hızları biraz azalt
      this.ball.velocity.x *=this.ball. airResistanceFactor;
      this.ball.velocity.y *=this.ball. airResistanceFactor;
      
      // 🎯 Hız minimumdan küçük olmasın, top durmasın
      if (Math.sqrt(Math.pow(this.ball.velocity.x, 2) + Math.pow(this.ball.velocity.y, 2) ) < this.ball.minimumSpeed)
        {
            this.ball.velocity.x *= 1.02;
            this.ball.velocity.y *= 1.02;
        }


    // Pozisyonları yayınla
    this.io.to(this.roomId).emit("ballUpdate", {
      bp: { x: this.ball.position.x / UNIT, y : this.ball.position.y / UNIT},
      bv: {x: this.ball.velocity.x / UNIT, y : this.ball.velocity.y /UNIT},
      score: this.points,
      sets: this.sets,
    });

    this.io.to(this.roomId).emit("paddleUpdate", {
      p1y: this.paddle1.position.y/UNIT,
      p2y: this.paddle2.position.y/UNIT
    });
  }

}


