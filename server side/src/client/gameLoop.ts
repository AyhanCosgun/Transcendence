import { Engine, Scene } from "@babylonjs/core";
import {updateScoreBoard, updateSetBoard } from "./ui";
import { ball, paddle1, paddle2  } from "./main";
import { gameInfo } from "./network";

export function startGameLoop(engine: Engine, scene: Scene): void
{
    engine.runRenderLoop(() => {
        if(!gameInfo.isReady()) return;
        if (gameInfo.state?.matchOver) return;
        if (gameInfo.state?.setOver) return;
        if (gameInfo.state?.isPaused) return;
     
        // Topu hareket ettir
      ball.ball.position.addInPlace(ball.velocity);

      // pedalları hareket ettir
      paddle1.position.y = gameInfo.paddle?.p1y!;
      paddle2.position.y = gameInfo.paddle?.p2y!;

      //skor ve set güncellemesi
      updateScoreBoard();
      updateSetBoard();
   
        scene.render();
      });
}
  

