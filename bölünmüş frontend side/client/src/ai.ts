import { BallController } from "./ball";
import { groundSize, ball, paddleSize, paddle1, paddle2  } from "./main";
  /**
   * Bu fonksiyon, topun AI paddle'ının X konumuna vardığında hangi Y konumunda olacağını tahmin eder.
   */
  export function predictBallY(ball: BallController, paddleX: number): number
  {
    let x = ball.getBall().position.x;
    let y = ball.getBall().position.y;
    let vx = ball.state.velocity._x;
    let vy = ball.state.velocity.y;
  
    const topBound = paddleSize.height / 2;
    const bottomBound = -topBound;
  
    while (Math.sign(vx) === Math.sign(paddleX - x))
    {
      const timeToWallY = vy > 0 ? (topBound - y) / vy : (bottomBound - y) / vy;
  
      const timeToPaddleX = (paddleX - x) / vx;
  
      if (timeToPaddleX < Math.abs(timeToWallY)) {
        // Top paddle'a çarpmadan önce X'e ulaşacak
        y += vy * timeToPaddleX;
        break;
      } else {
        // Duvara çarpacak, yansıma yap
        y += vy * timeToWallY;
        vy *= -1;
        x += vx * timeToWallY;
      }
    }
  
    return y;
  }
  