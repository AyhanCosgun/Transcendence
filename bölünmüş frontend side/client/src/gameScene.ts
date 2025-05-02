import {FreeCamera, Scene, ArcRotateCamera, HemisphericLight, MeshBuilder, Vector3, Color3,
  StandardMaterial, Engine} from "@babylonjs/core";

// 🎮 Kamera ve ışık
export function createCamera(scene: Scene)
{
  const camera = new FreeCamera("Camera", new Vector3(0,0 , -20), scene);
  camera.setTarget(Vector3.Zero());
  //camera.rotation.x = Math.PI / 2;
  camera.inputs.clear();
  
  new HemisphericLight("light", new Vector3(1, 1, 0), scene);
  new HemisphericLight("light", new Vector3(-1, -1, 0), scene);

  return camera;
}



export function createScene()
{
  const canvas = document.getElementById("game-canvas") as HTMLCanvasElement;
  const engine = new Engine(canvas, true);
  const scene = new Scene(engine);

  return { canvas, engine, scene };
}




// 🎮 Paddle'lar ve top
export function createPaddles(scene: Scene)
{
  const paddleSize = { width: 0.2, height: 3, depth: 0.5 };
  const paddle1 = MeshBuilder.CreateBox("paddle1", paddleSize, scene);
  paddle1.position.x = -10 + paddleSize.width;
  paddle1.position.y = 0;

  const paddle2 = MeshBuilder.CreateBox("paddle2", paddleSize, scene);
  paddle2.position.x = 10 - paddleSize.width;
  paddle2.position.y = 0;

  // Paddle material
  const paddleMaterial = new StandardMaterial("paddleMaterial", scene);
  paddleMaterial.diffuseColor = new Color3(0, 0, 0.7);
  paddleMaterial.emissiveColor = new Color3(0, 0, 0.5);
  paddle1.material = paddleMaterial;

  const paddle2Material = paddleMaterial.clone("paddle2Material") as StandardMaterial;
  paddle2Material.diffuseColor = new Color3(0.7, 0, 0);
  paddle2Material.emissiveColor = new Color3(0.5, 0, 0);
  paddle2.material = paddle2Material;

  return { paddle1, paddle2, paddleSize };
}




// 🎮 Zemin
export function createGround(scene: Scene)
{
  const groundSize = { width: 20, height: 10 };
  const ground = MeshBuilder.CreatePlane("ground", groundSize, scene);
  const groundMaterial = new StandardMaterial("groundMaterial", scene);
  groundMaterial.diffuseColor = new Color3(0.1, 0.1, 0.1); // Koyu gri
  ground.material = groundMaterial;

  return {ground, groundSize};
}

// 🎮 Duvarlar
export function createWalls(scene: Scene) 
{
  const wallSize = { width: 20, height: 0.3, depth: 0.5 };

  const bottomWall = MeshBuilder.CreateBox("bottomWall", wallSize, scene);
  bottomWall.position.x = 0;  // Ortalanmış
  bottomWall.position.y = -5 - wallSize.height / 2;

  const bottomWallMaterial = new StandardMaterial("bottomWallMaterial", scene);
  bottomWallMaterial.diffuseColor = new Color3(0.1, 0.5, 0.1); // yeşil tonlu duvar
  bottomWall.material = bottomWallMaterial;

  const topWall = MeshBuilder.CreateBox("topWall", wallSize, scene);
  topWall.position.x = 0;
  topWall.position.y = 5 + wallSize.height / 2;

  const topWallMaterial = bottomWallMaterial.clone("topWallMaterial");
  topWall.material = topWallMaterial;

  return { bottomWall, topWall };
}
