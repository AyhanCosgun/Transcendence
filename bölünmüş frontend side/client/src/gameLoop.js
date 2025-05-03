"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startGameLoop = startGameLoop;
var ui_1 = require("./ui");
var main_1 = require("./main");
var ai_1 = require("./ai");
var network_1 = require("./network");
function startGameLoop(engine, scene) {
    engine.runRenderLoop(function () {
        if (ui_1.gameState.matchOver)
            return;
        if (ui_1.gameState.setOver)
            return;
        // Topu hareket ettir
        main_1.ball.getBall().position.addInPlace(main_1.ball.state.velocity);
        // 🎯 Duvar Çarpışması
        if (((main_1.ball.getBall().position.y > (main_1.groundSize.height / 2 - main_1.ball.state.radius) && main_1.ball.state.velocity.y > 0)
            || (main_1.ball.getBall().position.y < -(main_1.groundSize.height / 2 - main_1.ball.state.radius) && main_1.ball.state.velocity.y < 0))
            && Math.abs(main_1.ball.getBall().position.x) <= main_1.groundSize.width / 2 + main_1.ball.state.radius) {
            main_1.ball.state.velocity.y *= -1;
        }
        // 🎯 Paddle Çarpışması
        var paddleXThreshold = main_1.ball.state.radius + main_1.paddleSize.width; // çarpışma hassasiyeti
        var paddleYThreshold = (main_1.paddleSize.height + main_1.ball.state.radius) / 2; // paddle genişliğine göre
        // Paddle1 (Aşağıdaki oyuncu)
        if (Math.abs(main_1.ball.getBall().position.x - main_1.paddle1.position.x) < paddleXThreshold && main_1.ball.state.velocity.x < 0 &&
            Math.abs(main_1.ball.getBall().position.y - main_1.paddle1.position.y) < paddleYThreshold && main_1.ball.getBall().position.x > main_1.paddle1.position.x) {
            main_1.ball.state.velocity.x *= -1;
            // 🎯 Nereden çarptı?
            var offset = main_1.ball.getBall().position.y - main_1.paddle1.position.y;
            // 🎯 y yönüne ekstra açı ver
            main_1.ball.state.velocity.y += offset * 0.05;
            if (main_1.ball.state.firstPedalHit++)
                main_1.ball.state.speedIncreaseFactor = 1.2;
            // 🎯 HIZI ARTTIR
            main_1.ball.state.velocity.x *= main_1.ball.state.speedIncreaseFactor;
            main_1.ball.state.velocity.y *= main_1.ball.state.speedIncreaseFactor;
        }
        // pedalın köşesinden sektir
        if (Math.abs(main_1.ball.getBall().position.x - main_1.paddle1.position.x) < paddleXThreshold && main_1.ball.state.velocity.x < 0
            && Math.abs(main_1.ball.getBall().position.y - main_1.paddle1.position.y) >= paddleYThreshold
            && Math.abs(main_1.ball.getBall().position.y - main_1.paddle1.position.y) <= (main_1.paddleSize.height / 2 + main_1.ball.state.radius)
            && main_1.ball.getBall().position.x > main_1.paddle1.position.x
            && (main_1.ball.getBall().position.y - main_1.paddle1.position.y) * main_1.ball.state.velocity.y < 0) {
            main_1.ball.state.velocity.y *= -1;
        }
        // Paddle2 (Yukarıdaki oyuncu)
        if (Math.abs(main_1.ball.getBall().position.x - main_1.paddle2.position.x) < paddleXThreshold && main_1.ball.state.velocity.x > 0 &&
            Math.abs(main_1.ball.getBall().position.y - main_1.paddle2.position.y) < paddleYThreshold && main_1.ball.getBall().position.x < main_1.paddle2.position.x) {
            main_1.ball.state.velocity.x *= -1;
            var offset = main_1.ball.getBall().position.y - main_1.paddle2.position.y;
            // 🎯 y yönüne ekstra açı ver
            main_1.ball.state.velocity.y += offset * 0.05;
            // ilk pedal çarpmasından sonra topu çok hızlandır, daha sonra az arttır 
            if (main_1.ball.state.firstPedalHit++)
                main_1.ball.state.speedIncreaseFactor = 1.18;
            // 🎯 HIZI ARTTIR
            main_1.ball.state.velocity.x *= main_1.ball.state.speedIncreaseFactor;
            main_1.ball.state.velocity.y *= main_1.ball.state.speedIncreaseFactor;
        }
        // pedalın köşesinden sektir
        if (Math.abs(main_1.ball.getBall().position.x - main_1.paddle2.position.x) < paddleXThreshold && main_1.ball.state.velocity.x > 0
            && Math.abs(main_1.ball.getBall().position.y - main_1.paddle2.position.y) >= paddleYThreshold
            && Math.abs(main_1.ball.getBall().position.y - main_1.paddle2.position.y) <= (main_1.paddleSize.height / 2 + main_1.ball.state.radius)
            && main_1.ball.getBall().position.x < main_1.paddle2.position.x
            && (main_1.ball.getBall().position.y - main_1.paddle2.position.y) * main_1.ball.state.velocity.y < 0) {
            main_1.ball.state.velocity.y *= -1;
        }
        // 🎯 Skor kontrolü
        if (main_1.ball.getBall().position.x > main_1.groundSize.width / 2 + 5) {
            (0, ui_1.scorePoint)('player1');
        }
        else if (main_1.ball.getBall().position.x < -main_1.groundSize.width / 2 - 5) {
            (0, ui_1.scorePoint)('player2');
        }
        // 🎯 HAVA DİRENCİ UYGULA // her bir frame için hızları biraz azalt
        main_1.ball.state.velocity.x *= main_1.ball.state.airResistanceFactor;
        main_1.ball.state.velocity.y *= main_1.ball.state.airResistanceFactor;
        // 🎯 Hız minimumdan küçük olmasın, top durmasın
        if (main_1.ball.state.velocity.length() < main_1.ball.state.minimumSpeed) {
            main_1.ball.state.velocity = main_1.ball.state.velocity.multiplyByFloats(1.01, 1.01, 1.01);
        }
        scene.render();
        var moved = false;
        var upperLimit = (main_1.groundSize.height - main_1.paddleSize.height) / 2;
        var step = 0.2;
        var targetY = (0, ai_1.predictBallY)(main_1.ball, main_1.groundSize.width / 2);
        if (Math.abs(main_1.paddle2.position.y - targetY) >= step) {
            var nextY = main_1.paddle2.position.y + step * Math.sign(targetY - main_1.paddle2.position.y);
            if (Math.abs(nextY) <= upperLimit)
                main_1.paddle2.position.y = nextY;
            moved = true;
        }
        if (moved) {
            network_1.socket.emit("player-move", {
                paddlePosition: main_1.paddle2.position.y,
            });
        }
    });
}
