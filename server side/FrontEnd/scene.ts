import { Engine, Scene, Vector3, HemisphericLight, FreeCamera } from "@babylonjs/core";

export function createScene() {
  const canvas = document.createElement("canvas");
  canvas.id = "gameCanvas";
  document.body.appendChild(canvas);

  const engine = new Engine(canvas, true);
  const scene = new Scene(engine);

  const camera = new FreeCamera("camera1", new Vector3(0, 5, -10), scene);
  camera.setTarget(Vector3.Zero());
  camera.attachControl(canvas, true);

  new HemisphericLight("light", new Vector3(0, 1, 0), scene);

  return { engine, scene, canvas };
}