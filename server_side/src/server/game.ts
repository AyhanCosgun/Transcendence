import { Server} from "socket.io";
import { InputProvider } from "./inputProviders";
import { predictBallY } from "./aiPlayer";

const UNIT = 40; let counter = 0;

type Side = 'leftPlayer' | 'rightPlayer';




interface GameConstants
{
  groundWidth: number;
  groundHeight: number;
  ballRadius: number;
  paddleWidth: number;
  paddleHeight: number;
}

interface GameState
{
  matchOver: boolean;
  setOver: boolean;
  isPaused: boolean;
}


interface BallState
{
  bp: {x: number, y: number};
  bv: {x: number, y: number};
  points: { leftPlayer: number, rightPlayer: number };
  sets: { leftPlayer: number, rightPlayer: number };
  usernames: {left: string, right: string}
  py: number;
}

interface PaddleState
{
  p1y: number;
  p2y: number;
}

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
  maximumSpeed: number;
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
  private paddleSpeed: number;
  private ground: {width: number; height : number};
  private points: { leftPlayer: number, rightPlayer: number };
  private sets: { leftPlayer: number, rightPlayer: number };
  private groundWidth = 20*UNIT;
  private matchOver = true;
  private setOver = true;
  private isPaused = true;
  private lastUpdatedTime: number | undefined = undefined; /* ms */

  private roomId: string;
  private io: Server;
  private interval!: NodeJS.Timeout | undefined;



  constructor( private leftInput: InputProvider, private rightInput: InputProvider, io: Server, roomId: string)
  {
    this.ball = 
    {
        firstSpeedFactor: 0.18*UNIT,
        airResistanceFactor: 0.998,
        minimumSpeed: 0.18*UNIT,
        maximumSpeed: 0.4*UNIT,
        radius: 0.25*UNIT,
        speedIncreaseFactor: 1.7,
        firstPedalHit: 0,
        position : { x:0 , y:0},
        velocity : {x:0, y:0},
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
        y : 0 }
    };

    this.paddle2 = 
    {
      width:0.2*UNIT ,
      height: this.ground.height*(0.3),
      position: {
        x : this.groundWidth/2 - this.paddle1.width,
        y : 0 }
    };

    this.paddleSpeed = 0.2*UNIT;

    this.points = { leftPlayer: 0, rightPlayer: 0 };
    this.sets = { leftPlayer: 0, rightPlayer: 0 };

    this.io = io;
    this.roomId = roomId;
  }

  public getBall()
  {
    return this.ball;
  }

  public getGround()
  {
    return this.ground;
  }

  public getPaddleSpeed()
  {
    return this.paddleSpeed;
  }

    public getPaddle2()
  {
    return this.paddle2;
  }


  private resetScores()
  {
    this.points.leftPlayer = 0;
    this.points.rightPlayer = 0;
  }

  

  private startNextSet()
  {
    this.lastUpdatedTime = undefined;
    this.setOver = true;

    this.exportBallState();
    this.exportGameState();
  
    setTimeout(() =>
    {
      this.resetScores();
      this.setOver = false;

   this.exportGameState();

      this.lastUpdatedTime = Date.now();

    }, 3000);
  }


  private resetBall(lastScorer: "leftPlayer" | "rightPlayer")
  {
    this.lastUpdatedTime = undefined;
    this.ball.firstPedalHit = 0;
    this.ball.speedIncreaseFactor = 1.7;
    this.ball.minimumSpeed = this.ball.firstSpeedFactor;
    // 🎯 Önce topu durdur
    this.ball.velocity = {x:0, y:0};
  
    // 🎯 Topu ortada sabitle
    this.ball.position = {x:0, y: Math.random()*(0.8*this.ground.height)-0.4*this.ground.height};     
  
    // 🎯 Belirli bir süre bekle ( 1 saniye)
     setTimeout(() =>
    {
      const angle = lastScorer == 'leftPlayer' ? (Math.random()*2-1)*Math.PI/6 : Math.PI - (Math.random()*2-1)*Math.PI/6;
      // 2 saniye sonra yeni rastgele bir hız ver
      this.ball.velocity = {x: Math.cos(angle)*this.ball.firstSpeedFactor, y: Math.sin(angle)*this.ball.firstSpeedFactor};
      this.lastUpdatedTime = Date.now();
    }, 1000); // 1000ms = 1 saniye
  }


   private scorePoint(winner: Side)
  {
    if (this.matchOver || this.isPaused) return;
  
    this.points[winner]++;
  
  
    const p1 = this.points.leftPlayer;
    const p2 = this.points.rightPlayer;
  
    // Kontrol: Set bitti mi?
    if ((p1 >= 11 || p2 >= 11) && Math.abs(p1 - p2) >= 2)
      {
          if (p1 > p2) {
          this.sets.leftPlayer++;
        } else {
          this.sets.rightPlayer++;      
        }
    
        const matchControl = (this.sets.leftPlayer === 3 || this.sets.rightPlayer === 3);
        if (!matchControl)
            this.startNextSet();
              
        this.resetBall(winner);
    
        // Kontrol: Maç bitti mi?
        if (matchControl)
        {console.log(`SKORPOINT İÇİNDE MAÇ yeni BİTTİ, ŞU AN : ${this.matchOver}`);
          this.matchOver = true; ///////////////////////////////////////////////////////////////////////////////// ??????????????????????????????????????????????????????????
          this.exportBallState();
          this.exportGameState();
          console.log(`SKORPOINT İÇİNDE maç bitti cliente export ettik , ŞU AN : ${this.matchOver}`);
          
        }
     }
    else   //set bitmedi
    {
      this.resetBall(winner);
    }
  }

 

public pauseGameLoop()
{console.log(`pauseGameLoop a girdi, this.matchOver = ${this.matchOver}`);
  if (!this.matchOver)
    this.isPaused = true;
  this.lastUpdatedTime = undefined;
  if (this.interval) {console.log(`interval varmış girdik, this.matchOver = ${this.matchOver}`);
    clearInterval(this.interval);
    this.interval = undefined;
    console.log(`İnterval silindi... şu anda this.matchOver = ${this.matchOver}`);
    // if (this.matchOver)
    // {
    //   if (typeof this.leftInput.getSocket === 'function')
    //       this.leftInput.getSocket().off;
    //   if (typeof this.rightInput.getSocket === 'function')
    //       this.rightInput.getSocket().off;
    // }
  }
  console.log(`Pauseloop ta gönderilecek olan GameState --->  matchOver: ${this.matchOver}, setOver: ${this.setOver}, isPaused: ${this.isPaused},`)
  //this.exportGameState();
}

public resumeGameLoop() {
  this.isPaused = false;
  if (!this.interval) {
    this.interval = setInterval(() => this.update(), 1000 / 120);
  }
  
//this.exportGameState();

  this.lastUpdatedTime = Date.now();
}


   private exportGameConstants()
  {
     const gameConstants: GameConstants = 
     {
       groundWidth: this.ground.width/UNIT,
       groundHeight: this.ground.height/UNIT,
       ballRadius: this.ball.radius/UNIT,
       paddleWidth: this.paddle1.width/UNIT,
       paddleHeight: this.paddle1.height/UNIT
      };

      this.io.to(this.roomId).emit("gameConstants", gameConstants);
      // console.log(`room a gönderilen gameConstants 
      // groundWidth: ${this.ground.width/UNIT},
      //  groundHeight: ${this.ground.height/UNIT},
      //  ballRadius: ${this.ball.radius/UNIT},
      //  paddleWidth: ${this.paddle1.width/UNIT},
      //  paddleHeight: ${this.paddle1.height/UNIT}`);
  }

  private exportGameState()
  {
       const gameState : GameState = 
    {
      matchOver: this.matchOver,
      setOver: this.setOver,
      isPaused: this.isPaused,
     };

     this.io.to(this.roomId).emit("gameState", gameState);
     console.log(`room a gönderilen gameState
      matchOver: ${this.matchOver},
      setOver: ${this.setOver},
      isPaused: ${this.isPaused}`);
  }


   private exportBallState()
  {
    let pyy = 0;
      
      if (typeof this.rightInput.getPy === 'function')
       pyy = this.rightInput.getPy() / UNIT;
  
       const ballState: BallState =
        {
          bp: { x: this.ball.position.x / UNIT, y : this.ball.position.y / UNIT},
          bv: {x: this.ball.velocity.x / UNIT, y : this.ball.velocity.y /UNIT},
          points: this.points,
          sets: this.sets,
          usernames: {left: this.leftInput.getUsername(), right: this.rightInput.getUsername()},
          py: pyy
        };

        this.io.to(this.roomId).emit("ballUpdate", ballState);
        // console.log(`room a gönderilen ballUpdate
        //  bp: { x: ${this.ball.position.x / UNIT}, y : ${this.ball.position.y / UNIT}},
        //  bv: {x: ${this.ball.velocity.x / UNIT}, y : ${this.ball.velocity.y /UNIT}},
        //  points: ${this.points},
        //  sets: ${this.sets},
        //  usernames: {left: ${this.leftInput.getUsername()}, right: ${this.rightInput.getUsername()}}`);
  }

    private exportPaddleState()
  {
     const paddleState: PaddleState =
        {
          p1y: this.paddle1.position.y/UNIT,
          p2y: this.paddle2.position.y/UNIT
        }

        this.io.to(this.roomId).emit("paddleUpdate", paddleState);
        // console.log(`room a gönderilen paddleUpdate
        //  p1y: ${this.paddle1.position.y/UNIT},
        //   p2y: ${this.paddle2.position.y/UNIT}`);
  }


  public startGameLoop()
  {console.log(`startGameLoop a girildi: maç adı : ${this.roomId}__${++counter}`);
    this.exportGameConstants();

    this.matchOver = false;
    this.setOver = false;
    this.isPaused = false;

this.exportGameState();
    
//this.leftInput.getSocket()!.on("disconnect", () => {
//     
//     });
    


     if (typeof this.leftInput.getSocket === 'function')
      {
        this.leftInput.getSocket()!.on("pause-resume", (data: {status: string}) =>
        {console.log(`pause-resume emiti server a geldi: status = ${data.status}`);
        if (data.status === "pause" && !this.isPaused)
            this.pauseGameLoop();
        else if (data.status === "resume" && this.isPaused)
            this.resumeGameLoop();
        });

        this.leftInput.getSocket()!.on("disconnect", () => {this.matchOver = true;  console.log("GELDİ, EVET, sol"); return;}); //bu varsa alttakine gerek yok, (window.reoload olduğu sürece)
        this.leftInput.getSocket()!.on("reset-match", () => {return;});
      }

      if (typeof this.rightInput.getSocket === 'function')
      {
        this.rightInput.getSocket()!.on("pause-resume", (data: {status: string}) =>
        {console.log(`pause-resume emiti server a geldi: status = ${data.status}`);
        if (data.status === "pause" && !this.isPaused)
            this.pauseGameLoop();
        else if (data.status === "resume" && this.isPaused)
            this.resumeGameLoop();
        });

        this.rightInput.getSocket()!.on("disconnect", () => {this.matchOver = true; console.log("GELDİ, EVET, sağ"); return;}); //bu varsa alttakine gerek yok, (window.reoload olduğu sürece)
        this.rightInput.getSocket()!.on("reset-match", () => {return;});
      }


     if(this.isPaused === false)
       {
         Math.random() <= 0.5  ? this.resetBall('leftPlayer') : this.resetBall('rightPlayer');
       }


      //  if (typeof this.leftInput.getSocket === 'function')
      // {
      //     this.leftInput.getSocket()!.on("reset-match", () => {return;});
      // }


      //  if (typeof this.rightInput.getSocket === 'function')
      // {
      //     this.rightInput.getSocket()!.on("reset-match", () => {return;});
      // }



    this.interval = setInterval(() => this.update(), 1000 / 120); // 120 FPS
    
  }


  private update()
  { 
    if (this.matchOver)
    {
        this.pauseGameLoop();
        return;
    }

    if (this.setOver || this.isPaused) return;

    let timeDifferenceMultiplier = 1;

    const now = Date.now(); // ms cinsinden zaman damgası (number)
    
    // Eğer lastUpdatedTime tanımlıysa, farkı hesapla
    if (this.lastUpdatedTime !== undefined) {
      const delta = now - this.lastUpdatedTime; // ms cinsinden fark
      timeDifferenceMultiplier = delta*60/1000; // ya da delta / bazı referans değer
    }
    
    // Zamanı güncelle
    this.lastUpdatedTime = now;
    
    
    // Top hareketi
    this.ball.position.x += this.ball.velocity.x*timeDifferenceMultiplier;
    this.ball.position.y += this.ball.velocity.y*timeDifferenceMultiplier;

    //pedal hareketi
    const upperBound = this.ground.height/2 - this.paddle1.height/2 + 40;
    const deltaY1 = this.leftInput.getPaddleDelta() * this.paddleSpeed;
    const deltaY2 = this.rightInput.getPaddleDelta() * this.paddleSpeed;
    if (Math.abs(this.paddle1.position.y + deltaY1) <= upperBound)
        this.paddle1.position.y += deltaY1;
    if (Math.abs(this.paddle2.position.y + deltaY2) <= upperBound)
        this.paddle2.position.y += deltaY2;



    // 🎯 Duvar Çarpışması
    if (((this.ball.position.y > (this.ground.height/2 - this.ball.radius) && this.ball.velocity.y > 0)
      || (this.ball.position.y < -(this.ground.height/2 - this.ball.radius) && this.ball.velocity.y < 0))
      && Math.abs(this.ball.position.x) <= this.ground.width/2 + this.ball.radius) 
      {
         this.ball.velocity.y *= -1; 
      }
    
    
    
    // 🎯 Paddle Çarpışması
    const paddleXThreshold = (this.ball.radius + this.paddle1.width + 1);  // çarpışma hassasiyeti
    const paddleYThreshold = (this.paddle1.height + this.ball.radius)/2 +1;  // paddle genişliğine göre
    
    
    // Paddle1 (soldaki oyuncu)
      if (Math.abs(this.ball.position.x - this.paddle1.position.x) < paddleXThreshold && this.ball.velocity.x < 0 &&
      Math.abs(this.ball.position.y - this.paddle1.position.y) < paddleYThreshold && this.ball.position.x > this.paddle1.position.x)
      {
        this.ball.velocity.x *= -1; 
    
      // 🎯 Nereden çarptı?
      const offset = this.ball.position.y - this.paddle1.position.y;
      
      // 🎯 y yönüne ekstra açı ver
      this.ball.velocity.y += offset * 0.03;
      if (this.ball.firstPedalHit++)
        {
          this.ball.speedIncreaseFactor = 1.2;
          this.ball.minimumSpeed = 0.25*UNIT;
        }
    
        // 🎯 HIZI ARTTIR
        this.ball.velocity.x *= this.ball.speedIncreaseFactor;
        this.ball.velocity.y *= this.ball.speedIncreaseFactor;
    }
    
    // pedalın köşesinden sektir
    if (Math.abs(this.ball.position.x - this.paddle1.position.x) < paddleXThreshold && this.ball.velocity.x < 0
      && Math.abs(this.ball.position.y - this.paddle1.position.y) >= paddleYThreshold
      && Math.abs(this.ball.position.y - this.paddle1.position.y) <= (this.paddle1.height/2 + this.ball.radius + 1)
      && this.ball.position.x > this.paddle1.position.x
      && (this.ball.position.y - this.paddle1.position.y) * this.ball.velocity.y < 0 )
      {
        this.ball.velocity.y *= -1;
      }
    
    
    // Paddle2 (sağdaki oyuncu)
      if (
      Math.abs(this.ball.position.x - this.paddle2.position.x) < paddleXThreshold && this.ball.velocity.x > 0 &&
      Math.abs(this.ball.position.y - this.paddle2.position.y) < paddleYThreshold && this.ball.position.x < this.paddle2.position.x 
    ) {
      this.ball.velocity.x *= -1;
    
      const offset = this.ball.position.y - this.paddle2.position.y;
      
      // 🎯 y yönüne ekstra açı ver
      this.ball.velocity.y += offset * 0.03;
      // ilk pedal çarpmasından sonra topu çok hızlandır, daha sonra az arttır 
      if (this.ball.firstPedalHit++)
      {
        this.ball.speedIncreaseFactor = 1.2;
        this.ball.minimumSpeed = 0.25*UNIT;
      }
    
        // 🎯 HIZI ARTTIR
        this.ball.velocity.x *= this.ball.speedIncreaseFactor;
        this.ball.velocity.y *= this.ball.speedIncreaseFactor;
        
    }
  
    
    
    // pedalın köşesinden sektir
    if (Math.abs(this.ball.position.x - this.paddle2.position.x) < paddleXThreshold && this.ball.velocity.x > 0
      && Math.abs(this.ball.position.y - this.paddle2.position.y) >= paddleYThreshold
      && Math.abs(this.ball.position.y - this.paddle2.position.y) <= (this.paddle1.height/2 + this.ball.radius + 1)
      && this.ball.position.x < this.paddle2.position.x
      && (this.ball.position.y - this.paddle2.position.y) * this.ball.velocity.y < 0 )
      {
        this.ball.velocity.y *= -1;
      }



      // 🎯 Skor kontrolü
     if (this.ball.position.x > this.ground.width/2 + 5*UNIT)
        {console.log("skor oldu, left");
          this.scorePoint('leftPlayer');
        }
      else if (this.ball.position.x < -this.ground.width/2 - 5*UNIT)
        {console.log("skor oldu, right");
          this.scorePoint('rightPlayer');
        }
      
      
      
      // 🎯 HAVA DİRENCİ UYGULA // her bir frame için hızları biraz azalt
      this.ball.velocity.x *=this.ball.airResistanceFactor;
      this.ball.velocity.y *=this.ball.airResistanceFactor;
      
      // 🎯 Hız minimumdan küçük olmasın, top durmasın
      if (Math.sqrt(Math.pow(this.ball.velocity.x, 2) + Math.pow(this.ball.velocity.y, 2) ) < this.ball.minimumSpeed)
        {
            this.ball.velocity.x *= 1.02;
            this.ball.velocity.y *= 1.02;
        }

          // 🎯 Hız maximum dan büyükük olmasın, top uçmasın
      if (Math.sqrt(Math.pow(this.ball.velocity.x, 2) + Math.pow(this.ball.velocity.y, 2) ) > this.ball.maximumSpeed)
        {
            this.ball.velocity.x *= 1/1.02;
            this.ball.velocity.y *= 1/1.02;
        }


    // Pozisyonları yayınla
       this.exportBallState();
       this.exportPaddleState();    
  }


}


