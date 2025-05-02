import { Engine, Scene } from "@babylonjs/core";
import {gameState, scorePoint } from "./ui";
import { groundSize, ball, paddleSize, paddle1, paddle2  } from "./main";

export function startGameLoop(engine: Engine, scene: Scene): void
{
    engine.runRenderLoop(() => {
        if (gameState.matchOver) return;
        if (gameState.setOver) return;
      
        // Topu hareket ettir
      ball.getBall().position.addInPlace(ball.state.velocity);
      
      // 🎯 Duvar Çarpışması
      if (((ball.getBall().position.y > (groundSize.height/2 - ball.state.radius) && ball.state.velocity.y > 0)
        || (ball.getBall().position.y < -(groundSize.height/2 - ball.state.radius) && ball.state.velocity.y < 0))
        && Math.abs(ball.getBall().position.x) <= groundSize.width/2 + ball.state.radius) 
        {
           ball.state.velocity.y *= -1; 
        }
      
      
      
      // 🎯 Paddle Çarpışması
      const paddleXThreshold = ball.state.radius + paddleSize.width;  // çarpışma hassasiyeti
      const paddleYThreshold = (paddleSize.height + ball.state.radius)/2;  // paddle genişliğine göre
      
      
      // Paddle1 (Aşağıdaki oyuncu)
      if (Math.abs(ball.getBall().position.x - paddle1.position.x) < paddleXThreshold && ball.state.velocity.x < 0 &&
        Math.abs(ball.getBall().position.y - paddle1.position.y) < paddleYThreshold && ball.getBall().position.x > paddle1.position.x)
        {
          ball.state.velocity.x *= -1; 
      
        // 🎯 Nereden çarptı?
        const offset = ball.getBall().position.y - paddle1.position.y;
        
        // 🎯 y yönüne ekstra açı ver
        ball.state.velocity.y += offset * 0.05;
        if (ball.state.firstPedalHit++)
          ball.state.speedIncreaseFactor = 1.2;
      
          // 🎯 HIZI ARTTIR
          ball.state.velocity.x *= ball.state.speedIncreaseFactor;
          ball.state.velocity.y *= ball.state.speedIncreaseFactor;
      }
      
      // pedalın köşesinden sektir
      if (Math.abs(ball.getBall().position.x - paddle1.position.x) < paddleXThreshold && ball.state.velocity.x < 0
        && Math.abs(ball.getBall().position.y - paddle1.position.y) >= paddleYThreshold
        && Math.abs(ball.getBall().position.y - paddle1.position.y) <= (paddleSize.height/2 + ball.state.radius)
        && ball.getBall().position.x > paddle1.position.x
        && (ball.getBall().position.y - paddle1.position.y) * ball.state.velocity.y < 0 )
        {
          ball.state.velocity.y *= -1;
        }
      
      
      // Paddle2 (Yukarıdaki oyuncu)
      if (
        Math.abs(ball.getBall().position.x - paddle2.position.x) < paddleXThreshold && ball.state.velocity.x > 0 &&
        Math.abs(ball.getBall().position.y - paddle2.position.y) < paddleYThreshold && ball.getBall().position.x < paddle2.position.x 
      ) {
        ball.state.velocity.x *= -1;
      
        const offset = ball.getBall().position.y - paddle2.position.y;
        
        // 🎯 y yönüne ekstra açı ver
        ball.state.velocity.y += offset * 0.05;
        if (ball.state.firstPedalHit++)
          ball.state.speedIncreaseFactor = 1.18;
      
          // 🎯 HIZI ARTTIR
          ball.state.velocity.x *= ball.state.speedIncreaseFactor;
          ball.state.velocity.y *= ball.state.speedIncreaseFactor;
      }
      
      
      // pedalın köşesinden sektir
      if (Math.abs(ball.getBall().position.x - paddle2.position.x) < paddleXThreshold && ball.state.velocity.x > 0
        && Math.abs(ball.getBall().position.y - paddle2.position.y) >= paddleYThreshold
        && Math.abs(ball.getBall().position.y - paddle2.position.y) <= (paddleSize.height/2 + ball.state.radius)
        && ball.getBall().position.x < paddle2.position.x
        && (ball.getBall().position.y - paddle2.position.y) * ball.state.velocity.y < 0 )
        {
          ball.state.velocity.y *= -1;
        }
      
      
      // 🎯 Skor kontrolü
      if (ball.getBall().position.x > groundSize.width/2 + 5)
        {
          scorePoint('player1');
        }
      else if (ball.getBall().position.x < -groundSize.width/2 - 5)
        {
          scorePoint('player2');
        }
      
      
      
      // 🎯 HAVA DİRENCİ UYGULA // her bir frame için hızları biraz azalt
      ball.state.velocity.x *=ball.state. airResistanceFactor;
      ball.state.velocity.y *=ball.state. airResistanceFactor;
      
      // 🎯 Hız minimumdan küçük olmasın, top durmasın
      if (ball.state.velocity.length() < ball.state.minimumSpeed)
        {
            ball.state.velocity = ball.state.velocity.multiplyByFloats(1.01, 1.01, 1.01);
        }
      
        scene.render();
      });
  }
  

