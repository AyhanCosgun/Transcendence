// BallController.ts
import { Mesh, MeshBuilder, Scene, StandardMaterial, Color3, Vector3 } from "@babylonjs/core";
import { gameInfo } from "./main";


export class BallController
{
  ball: Mesh;
  velocity: Vector3;
  position: {x: number, y: number};


  constructor(scene: Scene)
  {
    this.ball = MeshBuilder.CreateSphere("ball", { diameter: 2 * gameInfo.constants?.ballRadius! }, scene);
    const ballMaterial = new StandardMaterial("ballMaterial", scene);
    ballMaterial.diffuseColor = new Color3(0.7, 0.7, 0.7);
    this.ball.material = ballMaterial;

    this.velocity = new Vector3(gameInfo.ballState?.bv.x, gameInfo.ballState?.bv.y, 0);
    this.position = gameInfo.ballState?.bp!;
  }
}
