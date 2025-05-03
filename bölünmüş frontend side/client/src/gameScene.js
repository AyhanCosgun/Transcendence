"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCamera = createCamera;
exports.createScene = createScene;
exports.createPaddles = createPaddles;
exports.createGround = createGround;
exports.createWalls = createWalls;
var core_1 = require("@babylonjs/core");
// 🎮 Kamera ve ışık
function createCamera(scene) {
    var camera = new core_1.FreeCamera("Camera", new core_1.Vector3(0, 0, -20), scene);
    camera.setTarget(core_1.Vector3.Zero());
    camera.rotation.x = Math.PI / -32;
    camera.inputs.clear();
    new core_1.HemisphericLight("light", new core_1.Vector3(1, 1, 0), scene);
    new core_1.HemisphericLight("light", new core_1.Vector3(-1, -1, 0), scene);
    return camera;
}
function createScene() {
    var canvas = document.getElementById("game-canvas");
    var engine = new core_1.Engine(canvas, true);
    var scene = new core_1.Scene(engine);
    return { canvas: canvas, engine: engine, scene: scene };
}
// 🎮 Paddle'lar ve top
function createPaddles(scene) {
    var paddleSize = { width: 0.2, height: 3, depth: 0.5 };
    var paddle1 = core_1.MeshBuilder.CreateBox("paddle1", paddleSize, scene);
    paddle1.position.x = -10 + paddleSize.width;
    paddle1.position.y = 0;
    var paddle2 = core_1.MeshBuilder.CreateBox("paddle2", paddleSize, scene);
    paddle2.position.x = 10 - paddleSize.width;
    paddle2.position.y = 0;
    // Paddle material
    var paddleMaterial = new core_1.StandardMaterial("paddleMaterial", scene);
    paddleMaterial.diffuseColor = new core_1.Color3(0, 0, 0.7);
    paddleMaterial.emissiveColor = new core_1.Color3(0, 0, 0.5);
    paddle1.material = paddleMaterial;
    var paddle2Material = paddleMaterial.clone("paddle2Material");
    paddle2Material.diffuseColor = new core_1.Color3(0.7, 0, 0);
    paddle2Material.emissiveColor = new core_1.Color3(0.5, 0, 0);
    paddle2.material = paddle2Material;
    return { paddle1: paddle1, paddle2: paddle2, paddleSize: paddleSize };
}
// 🎮 Zemin
function createGround(scene) {
    var groundSize = { width: 20, height: 10 };
    var ground = core_1.MeshBuilder.CreatePlane("ground", groundSize, scene);
    var groundMaterial = new core_1.StandardMaterial("groundMaterial", scene);
    groundMaterial.diffuseColor = new core_1.Color3(0.1, 0.1, 0.1); // Koyu gri
    ground.material = groundMaterial;
    return { ground: ground, groundSize: groundSize };
}
// 🎮 Duvarlar
function createWalls(scene) {
    var wallSize = { width: 20, height: 0.3, depth: 10 };
    var bottomWall = core_1.MeshBuilder.CreateBox("bottomWall", wallSize, scene);
    bottomWall.position.x = 0; // Ortalanmış
    bottomWall.position.y = -5 - wallSize.height / 2;
    var bottomWallMaterial = new core_1.StandardMaterial("bottomWallMaterial", scene);
    bottomWallMaterial.diffuseColor = new core_1.Color3(0.1, 0.5, 0.1); // yeşil tonlu duvar
    bottomWall.material = bottomWallMaterial;
    var topWall = core_1.MeshBuilder.CreateBox("topWall", wallSize, scene);
    topWall.position.x = 0;
    topWall.position.y = 5 + wallSize.height / 2;
    var topWallMaterial = bottomWallMaterial.clone("topWallMaterial");
    topWall.material = topWallMaterial;
    return { bottomWall: bottomWall, topWall: topWall };
}
