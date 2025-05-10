import { Ball, Paddle } from "./game";

const UNIT = 40;

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

  export function aiPaddleMovement(level: String, ball: Ball, paddle: Paddle, ground: {width: number, height: number} )
     {
       let step  = 0.2*UNIT;
      if (level === 'easy')
        step = 0.1*UNIT;
      else if (level === 'hard')
        step = 0.5*UNIT;


          const upperLimit = (ground.height - paddle.height) / 2 + 5;
          const targetY = predictBallY(ball, ground.width/2, paddle.height);
          if(Math.abs(paddle.position.y - targetY) >= step)
          {
            const nextY = paddle.position.y + step * Math.sign(targetY - paddle.position.y);
            if (Math.abs(nextY) <= upperLimit)
              paddle.position.y = nextY;

            //if (desiredY - currentY > 0) return W
            //else if (desiredY - currentY < 0) return S
          }
      }