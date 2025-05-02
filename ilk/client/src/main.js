"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@babylonjs/core");
var socket_io_client_1 = require("socket.io-client");
// 🎮 WebSocket bağlantısı
var socket = (0, socket_io_client_1.io)("http://localhost:3000");
// 🎮 Canvas ve oyun motoru
var canvas = document.getElementById("game-canvas");
var engine = new core_1.Engine(canvas, true);
var scene = new core_1.Scene(engine);
// 🎮 Kamera & ışık
var core_2 = require("@babylonjs/core");
var camera = new core_2.FreeCamera("Camera", new core_1.Vector3(0, 0, -20), scene);
camera.setTarget(core_1.Vector3.Zero());
//camera.rotation.x = Math.PI / 2;
camera.inputs.clear();
new core_1.HemisphericLight("light", new core_1.Vector3(1, 1, 0), scene);
new core_1.HemisphericLight("light", new core_1.Vector3(-1, -1, 0), scene);
// 🎮 Paddle'lar ve top
var paddleSize = { width: 0.2, height: 3, depth: 0.5 };
var paddle1 = core_1.MeshBuilder.CreateBox("paddle1", paddleSize, scene);
paddle1.position.x = -10 + paddleSize.width;
paddle1.position.y = 0;
var paddle2 = core_1.MeshBuilder.CreateBox("paddle2", paddleSize, scene);
paddle2.position.x = 10 - paddleSize.width;
paddle2.position.y = 0;
//PADDLE MATERIALS
var core_3 = require("@babylonjs/core"); // Bu importu da ekle
var paddleMaterial = new core_3.StandardMaterial("paddleMaterial", scene);
paddleMaterial.diffuseColor = new core_1.Color3(0, 0, 0.7);
//paddleMaterial.specularColor = new Color3(1, 1, 1);
paddleMaterial.emissiveColor = new core_1.Color3(0, 0, 0.5);
//paddleMaterial.alpha = 0.9;
paddle1.material = paddleMaterial;
var paddle2Material = paddleMaterial.clone("paddle2Material");
paddle2Material.diffuseColor = new core_1.Color3(0.7, 0, 0);
paddle2Material.emissiveColor = new core_1.Color3(0.5, 0, 0);
paddle2.material = paddle2Material;
//TOP
var ballRadius = 0.25;
var ball = core_1.MeshBuilder.CreateSphere("ball", { diameter: 2 * ballRadius }, scene);
var ballMaterial = new core_3.StandardMaterial("ballMaterial", scene);
ballMaterial.diffuseColor = new core_1.Color3(0.7, 0.7, 0.7);
ball.material = ballMaterial;
//Bazı top sabitleri
var ballFirstSpeedFactor = 0.15;
var speedIncreaseFactor = 1.5;
var airResistanceFactor = 0.998; // Her frame'de %0.2 hız kaybı
var minimumSpeed = 0.2; // Top minimum bu hızın altına inemez
var pedalHit = 0;
var ballVelocity = new core_1.Vector3(0, 0, 0); // top hızının tanımı
// 🎯 Zemin (floor)
var groundSize = { width: 20, height: 10 };
var ground = core_1.MeshBuilder.CreatePlane("ground", groundSize, scene);
//ground.rotation.x = Math.PI; // Plane'i dikey çevir
var groundMaterial = new core_3.StandardMaterial("groundMaterial", scene);
groundMaterial.diffuseColor = new core_1.Color3(0.1, 0.1, 0.1); // Koyu gri
ground.material = groundMaterial;
// DUVARLAR
// Alt duvar
var wallSize = { width: 20, height: 0.3, depth: 0.5 };
var bottomWall = core_1.MeshBuilder.CreateBox("bottomWall", wallSize, scene);
bottomWall.position.y = -5 - wallSize.height / 2; // alt tarafa
bottomWall.position.x = 0; // Ortalanmış
var bottomWallMaterial = new core_3.StandardMaterial("bottomWallMaterial", scene);
bottomWallMaterial.diffuseColor = new core_1.Color3(0.1, 0.5, 0.1); // yeşil tonlu duvar
bottomWall.material = bottomWallMaterial;
// Üst Duvar
var topWall = core_1.MeshBuilder.CreateBox("topWall", wallSize, scene);
topWall.position.y = 5 + wallSize.height / 2; // üst tarafa
topWall.position.x = 0;
var topWallMaterial = bottomWallMaterial.clone("topWallMaterial");
topWall.material = topWallMaterial;
var scoreTable = document.getElementById("score-table");
var setTable = document.getElementById("set-table");
// OYUN FONKSİYONLARI
function startGame() {
    gameState.matchOver = false;
    resetScores();
    resetSets();
    Math.random() <= 0.5 ? resetBall('player1') : resetBall('player2');
}
function resetScores() {
    gameState.points.player1 = 0;
    gameState.points.player2 = 0;
    updateScoreBoard();
}
function resetSets() {
    gameState.sets.player1 = 0;
    gameState.sets.player2 = 0;
    updateSetBoard();
}
function updateScoreBoard() {
    scoreTable.innerText = "".concat(gameState.points.player1, "  :  ").concat(gameState.points.player2);
}
function updateSetBoard() {
    setTable.innerText = "".concat(gameState.sets.player1, "  :  ").concat(gameState.sets.player2);
}
function showSetToast(message) {
    return new Promise(function (resolve) {
        var toast = document.getElementById("set-toast");
        toast.textContent = message;
        toast.style.opacity = "1";
        gameState.setOver = true;
        setTimeout(function () {
            toast.style.opacity = "0";
            gameState.setOver = false;
            resolve();
        }, 3000);
    });
}
function startNextSet(message) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, showSetToast(message)];
                case 1:
                    _a.sent(); // 3 saniye bekler
                    return [2 /*return*/];
            }
        });
    });
}
var endMsg = document.getElementById("end-message");
function showEndMessage(message) {
    endMsg.textContent = message;
    endMsg.style.display = "flex";
    if (startButton) {
        startButton.style.display = "inline-block";
        startButton.textContent = "Yeni Maç Başlat";
    }
}
function resetBall(lastScorer) {
    pedalHit = 0;
    speedIncreaseFactor = 1.5;
    // 🎯 Önce topu durdur
    ballVelocity = new core_1.Vector3(0, 0, 0);
    // 🎯 Topu ortada sabitle
    ball.position = new core_1.Vector3(0, Math.random() * 8 - 4, 0);
    // 🎯 Belirli bir süre bekle ( 1 saniye)
    setTimeout(function () {
        var angle = lastScorer == 'player1' ? (Math.random() * 2 - 1) * Math.PI / 4 : Math.PI - (Math.random() * 2 - 1) * Math.PI / 4;
        // 2 saniye sonra yeni rastgele bir hız ver
        ballVelocity = new core_1.Vector3(Math.cos(angle) * ballFirstSpeedFactor, Math.sin(angle) * ballFirstSpeedFactor, 0);
    }, 1000); // 1000ms = 1 saniye
}
var gameState = {
    points: { player1: 0, player2: 0 },
    sets: { player1: 0, player2: 0 },
    matchOver: false,
    setOver: false,
};
function scorePoint(winner) {
    if (gameState.matchOver)
        return;
    gameState.points[winner]++;
    updateScoreBoard();
    var p1 = gameState.points.player1;
    var p2 = gameState.points.player2;
    // Kontrol: Set bitti mi?
    if ((p1 >= 11 || p2 >= 11) && Math.abs(p1 - p2) >= 2) {
        if (p1 > p2) {
            gameState.sets.player1++;
        }
        else {
            gameState.sets.player2++;
        }
        updateSetBoard();
        var matchControl = (gameState.sets.player1 === 3 || gameState.sets.player2 === 3);
        if (!matchControl)
            startNextSet("Seti ".concat(winner, " kazand\u0131!"));
        resetScores();
        resetBall(winner);
        // Kontrol: Maç bitti mi?
        if (matchControl) {
            showEndMessage("".concat(winner, " ma\u00E7\u0131 kazand\u0131 !"));
            gameState.matchOver = true;
        }
    }
    else {
        resetBall(winner);
    }
}
//EVENT LISTENERS
//START BUTTON  
var startButton = document.getElementById("start-button");
startButton.addEventListener("click", function () {
    endMsg.style.display = "none";
    startButton.style.display = "none";
    startGame();
});
// 🎮 Klavye ile paddle1 kontrolleri
var upperLimit = (groundSize.height - paddleSize.height) / 2; // Yukarı sınır
var lowerLimit = -upperLimit; // Aşağı sınır
//  PADDLE 1 KONTROLÜ
window.addEventListener("keydown", function (event) {
    var step = 1;
    var moved = false;
    if (event.key === 'w' && paddle1.position.y < upperLimit) {
        paddle1.position.y += step;
        moved = true;
    }
    else if (event.key === 's' && paddle1.position.y > lowerLimit) {
        paddle1.position.y -= step;
        moved = true;
    }
    if (moved) {
        event.preventDefault();
        socket.emit("player-move", {
            paddlePosition: paddle1.position.y,
        });
    }
});
//  PADDLE 2 KONTROLÜ
window.addEventListener("keydown", function (event) {
    var step = 1;
    var moved = false;
    if (event.key === "ArrowUp" && paddle2.position.y < upperLimit) {
        paddle2.position.y += step;
        moved = true;
    }
    else if (event.key === "ArrowDown" && paddle2.position.y > lowerLimit) {
        paddle2.position.y -= step;
        moved = true;
    }
    if (moved) {
        event.preventDefault();
        socket.emit("player-move", {
            paddlePosition: paddle2.position.y,
        });
    }
});
// 🎮 Karşı oyuncunun hareketini al
socket.on("opponent-move", function (data) {
    paddle2.position.y = data.paddlePosition;
});
// 🎮 Oyun döngüsü
engine.runRenderLoop(function () {
    if (gameState.matchOver)
        return;
    if (gameState.setOver)
        return;
    // Topu hareket ettir
    ball.position.addInPlace(ballVelocity);
    // 🎯 Duvar Çarpışması
    if (((ball.position.y > (groundSize.height / 2 - ballRadius) && ballVelocity.y > 0)
        || (ball.position.y < -(groundSize.height / 2 - ballRadius) && ballVelocity.y < 0))
        && Math.abs(ball.position.x) <= groundSize.width / 2 + ballRadius) {
        ballVelocity.y *= -1;
    }
    // 🎯 Paddle Çarpışması
    var paddleXThreshold = ballRadius + paddleSize.width; // çarpışma hassasiyeti
    var paddleYThreshold = (paddleSize.height + ballRadius) / 2; // paddle genişliğine göre
    // Paddle1 (Aşağıdaki oyuncu)
    if (Math.abs(ball.position.x - paddle1.position.x) < paddleXThreshold && ballVelocity.x < 0 &&
        Math.abs(ball.position.y - paddle1.position.y) < paddleYThreshold && ball.position.x > paddle1.position.x) {
        ballVelocity.x *= -1;
        // 🎯 Nereden çarptı?
        var offset = ball.position.y - paddle1.position.y;
        // 🎯 y yönüne ekstra açı ver
        ballVelocity.y += offset * 0.05;
        if (pedalHit++)
            speedIncreaseFactor = 1.2;
        // 🎯 HIZI ARTTIR
        ballVelocity.x *= speedIncreaseFactor;
        ballVelocity.y *= speedIncreaseFactor;
    }
    // pedalın köşesinden sektir
    if (Math.abs(ball.position.x - paddle1.position.x) < paddleXThreshold && ballVelocity.x < 0
        && Math.abs(ball.position.y - paddle1.position.y) >= paddleYThreshold
        && Math.abs(ball.position.y - paddle1.position.y) <= (paddleSize.height / 2 + ballRadius)
        && ball.position.x > paddle1.position.x
        && (ball.position.y - paddle1.position.y) * ballVelocity.y < 0) {
        ballVelocity.y *= -1;
    }
    // Paddle2 (Yukarıdaki oyuncu)
    if (Math.abs(ball.position.x - paddle2.position.x) < paddleXThreshold && ballVelocity.x > 0 &&
        Math.abs(ball.position.y - paddle2.position.y) < paddleYThreshold && ball.position.x < paddle2.position.x) {
        ballVelocity.x *= -1;
        var offset = ball.position.y - paddle2.position.y;
        // 🎯 y yönüne ekstra açı ver
        ballVelocity.y += offset * 0.05;
        if (pedalHit++)
            speedIncreaseFactor = 1.18;
        // 🎯 HIZI ARTTIR
        ballVelocity.x *= speedIncreaseFactor;
        ballVelocity.y *= speedIncreaseFactor;
    }
    // pedalın köşesinden sektir
    if (Math.abs(ball.position.x - paddle2.position.x) < paddleXThreshold && ballVelocity.x > 0
        && Math.abs(ball.position.y - paddle2.position.y) >= paddleYThreshold
        && Math.abs(ball.position.y - paddle2.position.y) <= (paddleSize.height / 2 + ballRadius)
        && ball.position.x < paddle2.position.x
        && (ball.position.y - paddle2.position.y) * ballVelocity.y < 0) {
        ballVelocity.y *= -1;
    }
    // 🎯 Skor kontrolü
    if (ball.position.x > groundSize.width / 2 + 5) {
        scorePoint('player1');
    }
    else if (ball.position.x < -groundSize.width / 2 - 5) {
        scorePoint('player2');
    }
    // 🎯 HAVA DİRENCİ UYGULA // her bir frame için hızları biraz azalt
    ballVelocity.x *= airResistanceFactor;
    ballVelocity.y *= airResistanceFactor;
    // 🎯 Hız minimumdan küçük olmasın, top durmasın
    if (ballVelocity.length() < minimumSpeed) {
        ballVelocity = ballVelocity.multiplyByFloats(1.01, 1.01, 1.01);
    }
    scene.render();
});
canvas.focus();
