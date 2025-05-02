"use strict";
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.startButton = exports.groundSize = exports.ground = exports.ball = exports.paddleSize = exports.paddle2 = exports.paddle1 = void 0;
var gameScene_1 = require("./gameScene");
var gameLoop_1 = require("./gameLoop");
var ball_1 = require("./ball");
var eventListeners_1 = require("./eventListeners");
// 🎮 WebSocket bağlantısı
var network_1 = require("./network");
// 🎮 Canvas ve oyun motoru
var _c = (0, gameScene_1.createScene)(), canvas = _c.canvas, engine = _c.engine, scene = _c.scene;
// 🎮 Kamera & Işık
var camera = (0, gameScene_1.createCamera)(scene);
// 🎮 Paddle'lar ve top
exports.paddle1 = (_a = (0, gameScene_1.createPaddles)(scene), _a.paddle1), exports.paddle2 = _a.paddle2, exports.paddleSize = _a.paddleSize;
// 🎮 Top
exports.ball = new ball_1.BallController(scene);
// 🎮 Zemin
exports.ground = (_b = (0, gameScene_1.createGround)(scene), _b.ground), exports.groundSize = _b.groundSize;
// 🎮 Duvarlar
var _d = (0, gameScene_1.createWalls)(scene), bottomWall = _d.bottomWall, topWall = _d.topWall;
exports.startButton = (0, eventListeners_1.createStartButton)();
(0, eventListeners_1.initializeEventListeners)();
network_1.socket.on("opponent-move", function (data) {
    exports.paddle2.position.y = data.paddlePosition;
});
// 🎮 Oyun motoru döngüsü
(0, gameLoop_1.startGameLoop)(engine, scene);
canvas.focus();
