import { Socket } from "socket.io";
import {Game, Paddle } from "./game";
import { predictBallY } from "./aiPlayer";

export interface InputProvider
{
  /**
   * Returns +1 for move up, -1 for move down, or 0 for no movement
   */
  getPaddleDelta(): number;
  getUsername?(): String;
}

/**
 * RemotePlayerInput listens to socket events for keydown/keyup
 */
export class RemotePlayerInput implements InputProvider {
  private delta = 0;
  constructor(socket: Socket) {
    socket.on("player-move", ({ direction }: { direction: "up" | "down" | "stop" }) => {
      this.delta = direction === "up" ? -1 : direction === "down" ? 1 : 0;
    });
  }
  getPaddleDelta() { return this.delta; }
}


export class AIPlayerInput implements InputProvider
{
  constructor(private readonly getGame: () => Game, private readonly getPaddle: () => Paddle) {}

  getPaddleDelta(): number
  {
    const ball    = this.getGame().getBall();
    const groundWidth = this.getGame().getGround().width;
    const groundHeight = this.getGame().getGround().height;

    const paddle = this.getPaddle();
    const targetY = predictBallY(ball, groundWidth/2, paddle.height);
    
    const upperLimit = (groundHeight - paddle.height) / 2 + 5;
    const diff = targetY - paddle.position.y;

     if(Math.abs(diff) < paddle.speed)
        return 0;
    else
    {
        const nextY = paddle.position.y + paddle.speed * Math.sign(targetY - paddle.position.y);
        if (Math.abs(nextY) <= upperLimit)
            return diff > 0 ? 1 : -1;
        else return 0;
    }
  }
}


export class LocalPlayerInput implements InputProvider
{
  private delta: number = 0;

  updateDirection(direction: "up" | "down" | "stop") {
    this.delta = direction === "up" ? 1 : direction === "down" ? -1 : 0;
  }

  getPaddleDelta(): number {
    return this.delta;
  }
}






/**
 * For local two-player on same client, treat each player as a remote client via socket
 * Local input should be emitted from client as separate events, then handled by RemotePlayerInput
 */
// Note: Local input provider is not needed server-side; reuse RemotePlayerInput with distinct event names
