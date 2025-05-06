"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.predictBallY = predictBallY;
var main_1 = require("./main");
/**
 * Bu fonksiyon, topun AI paddle'ının X konumuna vardığında hangi Y konumunda olacağını tahmin eder.
 */
function predictBallY(ball, paddleX) {
    var x = ball.getBall().position.x;
    var y = ball.getBall().position.y;
    var vx = ball.state.velocity._x;
    var vy = ball.state.velocity.y;
    var topBound = main_1.paddleSize.height / 2;
    var bottomBound = -topBound;
    while (Math.sign(vx) === Math.sign(paddleX - x)) {
        var timeToWallY = vy > 0 ? (topBound - y) / vy : (bottomBound - y) / vy;
        var timeToPaddleX = (paddleX - x) / vx;
        if (timeToPaddleX < Math.abs(timeToWallY)) {
            // Top paddle'a çarpmadan önce X'e ulaşacak
            y += vy * timeToPaddleX;
            break;
        }
        else {
            // Duvara çarpacak, yansıma yap
            y += vy * timeToWallY;
            vy *= -1;
            x += vx * timeToWallY;
        }
    }
    return y;
}
