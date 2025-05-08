import { Ball } from "./game";

  //Bu fonksiyon, topun AI paddle'ının X konumuna vardığında hangi Y konumunda olacağını tahmin eder.

  export function predictBallY(ball: Ball, paddleX: number, paddleHeight: number): number
  {
    let x = ball.position.x;
    let y = ball.position.y;
    let vx = ball.velocity.x;
    let vy = ball.velocity.y;
  
    const topBound = paddleHeight / 2;
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