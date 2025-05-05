// BallController.ts
import { Mesh, MeshBuilder, Scene, StandardMaterial, Color3, Vector3 } from "@babylonjs/core";

interface BallState
{
  readonly firstSpeedFactor: number;
  readonly airResistanceFactor: number;
  minimumSpeed: number;
  readonly radius: number;
  speedIncreaseFactor: number;
  firstPedalHit: number;
  velocity: Vector3;
}

export class BallController
{
  private ball: Mesh;
  public state: BallState;

  constructor(scene: Scene) {
    this.state = {
      firstSpeedFactor: 0.15,
      airResistanceFactor: 0.998,
      minimumSpeed: 0.15,
      radius: 0.25,
      speedIncreaseFactor: 1.7,
      firstPedalHit: 0,
      velocity: new Vector3(0, 0, 0),
    };

    this.ball = MeshBuilder.CreateSphere("ball", { diameter: 2 * this.state.radius }, scene);
    const ballMaterial = new StandardMaterial("ballMaterial", scene);
    ballMaterial.diffuseColor = new Color3(0.7, 0.7, 0.7);
    this.ball.material = ballMaterial;
  }

  public getBall(): Mesh {
    return this.ball;
  }

  public setVelocity(velocity: Vector3) {
    this.state.velocity = velocity;
  }

  public getVelocity(): Vector3 {
    return this.state.velocity;
  }

  // Gerekirse ek işlevsellik eklenebilir (örneğin: updatePosition, applyResistance, vs.)
}
