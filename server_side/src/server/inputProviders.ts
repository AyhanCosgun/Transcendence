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
  getUsername(): String;
  getSocket(): Socket | null;
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
  private username: String;
  private level: String = "medium";
  constructor(private readonly getGame: () => Game, private readonly getPaddle: () => Paddle, username: String, level: string)
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

    const targetY = predictBallY(ball, groundWidth/2, paddle.height);
    
    const upperLimit = (groundHeight - paddle.height) / 2 + 5;
    const diff = targetY - paddle.position.y;

     if(Math.abs(diff) < paddleSpeed)
        return 0;
    else
    {
        const nextY = paddle.position.y + paddleSpeed * Math.sign(targetY - paddle.position.y);
        if (Math.abs(nextY) <= upperLimit)
            return diff > 0 ? 1 : -1;
        else return 0;
    }
  }

  getUsername() { return this.username; }
  getSocket() { return null;}
}


export class LocalPlayerInput implements InputProvider
{
  private delta: number = 0;
   private player: Player;
   private side: String;

  constructor(player : Player, side: String)
  {
    this.player = player;
    this.side = side;
    player.socket.on("local-input", ({ player, direction }) =>
	{
		if ((player === "left" && this.side === "left") || (player === "right" && this.side === "right"))
       this.delta = direction === "up" ? 1 : direction === "down" ? -1 : 0;
	});
  }

  getPaddleDelta(): number {
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
