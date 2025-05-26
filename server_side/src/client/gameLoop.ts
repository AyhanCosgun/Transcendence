import { Engine, Scene, Vector3 } from "@babylonjs/core";
import {startNextSet, updateScoreBoard, updateSetBoard, showEndMessage } from "./ui";
import { ball, paddle1, paddle2 } from "./main";
import { GameInfo } from "./network";

export function startGameLoop(engine: Engine, scene: Scene, gameInfo: GameInfo): void
{
    engine.runRenderLoop(() =>
      {
        if (gameInfo.state?.matchOver)
          {
            updateScoreBoard(gameInfo);
            updateSetBoard(gameInfo);
            showEndMessage(gameInfo);
            engine.stopRenderLoop();
            return;
          }
        if (gameInfo.state?.setOver)
          {
            if (!gameInfo.nextSetStartedFlag)
            {
              updateScoreBoard(gameInfo);
              startNextSet(gameInfo);
              gameInfo.nextSetStartedFlag = true;
            }
            return;
          }
        if (gameInfo.state?.isPaused) return;
     
        // Topu hareket ettir
        ball.ball.position = new Vector3(gameInfo.ballState?.bp!.x, gameInfo.ballState?.bp!.y, 0);
        ball.velocity = new Vector3(gameInfo.ballState?.bv.x, gameInfo.ballState?.bv.y, 0);
        ball.ball.position.addInPlace(ball.velocity);
        // pedalları hareket ettir
        paddle1.position.y = gameInfo.paddle?.p1y!;
        paddle2.position.y = gameInfo.paddle?.p2y!;

        //skor ve set güncellemesi
        updateScoreBoard(gameInfo);
        updateSetBoard(gameInfo);
   
        scene.render();
      });
}
  

