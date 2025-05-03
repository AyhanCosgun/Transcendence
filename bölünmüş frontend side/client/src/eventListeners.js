"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStartButton = createStartButton;
exports.initializeEventListeners = initializeEventListeners;
var ui_1 = require("./ui");
var main_1 = require("./main");
var network_1 = require("./network");
function createStartButton() {
    // START BUTTON
    var startButton = document.getElementById("start-button");
    startButton.addEventListener("click", function () {
        ui_1.endMsg.style.display = "none";
        startButton.style.display = "none";
        (0, ui_1.startGame)();
    });
    return startButton;
}
function initializeEventListeners() {
    // LIMITS
    var upperLimit = (main_1.groundSize.height - main_1.paddleSize.height) / 2;
    var lowerLimit = -upperLimit;
    // PADDLE 1
    window.addEventListener("keydown", function (event) {
        var step = 1;
        var moved = false;
        if (event.key === 'w' && main_1.paddle1.position.y < upperLimit) {
            main_1.paddle1.position.y += step;
            moved = true;
        }
        else if (event.key === 's' && main_1.paddle1.position.y > lowerLimit) {
            main_1.paddle1.position.y -= step;
            moved = true;
        }
        if (moved) {
            event.preventDefault();
            network_1.socket.emit("player-move", {
                paddlePosition: main_1.paddle1.position.y,
            });
        }
    });
    // PADDLE 2
    // window.addEventListener("keydown", (event) => {
    //   const step = 1;
    //   let moved = false;
    //   if (event.key === "ArrowUp" && paddle2.position.y < upperLimit) {
    //     paddle2.position.y += step;
    //     moved = true;
    //   } else if (event.key === "ArrowDown" && paddle2.position.y > lowerLimit) {
    //     paddle2.position.y -= step;
    //     moved = true;
    //   }
    //   if (moved) {
    //     event.preventDefault();
    //     socket.emit("player-move", {
    //       paddlePosition: paddle2.position.y,
    //     });
    //   }
    // });
}
