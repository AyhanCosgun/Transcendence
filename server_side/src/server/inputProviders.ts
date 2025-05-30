import { Socket } from "socket.io";
import {Game, Paddle } from "./game";
import { predictBallY } from "./aiPlayer";
import { Player } from "./matchmaking";

export interface InputProvider
{
  /**
   * Returns +1 for move up, -1 for move down, or 0 for no movement
   */
  getPaddleDelta(): number;
  getUsername(): string;
  getSocket?(): Socket;
  getPy?(): number;
}

/**
 * RemotePlayerInput listens to socket events for keydown/keyup
 */
export class RemotePlayerInput implements InputProvider
{
  private delta = 0;
  private player: Player;
  constructor(player: Player) {
    this.player = player;
    player.socket.on("player-move", ({ direction }: { direction: "up" | "down" | "stop" }) => {
      this.delta = direction === "up" ? +1 : direction === "down" ? -1 : 0;

    });
  }
  getPaddleDelta() { return this.delta; }
  getUsername() { return this.player.username; }
   getSocket() { return this.player.socket;}
}


export class AIPlayerInput implements InputProvider
{
  private username: string;
  private level: string = "medium";
  private lastDecisionTime = 0;
  private targetY = 0;
  private timePassed = 0;

  constructor(private readonly getGame: () => Game, private readonly getPaddle: () => Paddle, username: string, level: string)
  {
    this.username = username;
    this.level = level; /////Bunu işleyeceğiz ******************************************************************************************************************************************
  }

  getPaddleDelta(): number
  {
    const ball    = this.getGame().getBall();
    const groundWidth = this.getGame().getGround().width;
    const groundHeight = this.getGame().getGround().height;

    const paddle = this.getPaddle();
    const paddleSpeed = this.getGame().getPaddleSpeed();

     const now = Date.now();

    if (now - this.lastDecisionTime >= 1000) 
      {
        this.lastDecisionTime = now;
        this.targetY = predictBallY(ball, groundWidth/2, paddle);
        //this.timePassed = predictBallY(ball, groundWidth/2, paddle).timePassed;
      }
        
    const diff = this.targetY - paddle.position.y;
    //const time = Math.min(this.timePassed, 60); 
    //if(Math.abs(diff) < paddleSpeed)
       // return 0;
    //else
        return diff > 0 ? Math.abs(diff)/10 : -Math.abs(diff)/10;
  }

  getUsername() { return this.username; }
  getPy() { return this.targetY;}
}


export class LocalPlayerInput implements InputProvider
{
  private delta = 0;
   private player: Player;
   private side: string;

  constructor(player : Player, side: string)
  {
    this.player = player;
    this.side = side;
    player.socket.on("local-input", ({ player_side, direction }: { player_side: "left" | "right", direction: "up" | "down" | "stop" }) =>
	{
    
		if ((player_side === "left" && this.side === "left") || (player_side === "right" && this.side === "right"))
       this.delta = direction === "up" ? +1 : direction === "down" ? -1 : 0;

	});
  }

  getPaddleDelta(){
    return this.delta;
  }

  getUsername()
  {
    if (this.side ==="left")
      return this.player.username;
    else 
      return ("friend");
  }
  getSocket() { return this.player.socket;}
}
