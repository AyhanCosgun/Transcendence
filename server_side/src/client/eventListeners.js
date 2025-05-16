"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStartButton = createStartButton;
exports.initializeEventListeners = initializeEventListeners;
var ui_1 = require("./ui");
var main_1 = require("./main");
var network_1 = require("./network");
var startButton = document.getElementById("start-button");
function createStartButton() {
    // START BUTTON
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
    var resumeButton = document.getElementById("resume-button");
    var newmatchButton = document.getElementById("newmatch-button");
    document.addEventListener("keydown", function (event) {
        if (event.code === "Space" && startButton.style.display == "none") {
            ui_1.gameState.isPaused = !ui_1.gameState.isPaused;
            if (ui_1.gameState.isPaused) {
                // Duraklatıldığında "devam et" butonunu göster
                resumeButton.style.display = "block";
                newmatchButton.style.display = "block";
            }
            else {
                // Devam edildiğinde butonu gizle
                resumeButton.style.display = "none";
                newmatchButton.style.display = "none";
            }
        }
    });
    resumeButton === null || resumeButton === void 0 ? void 0 : resumeButton.addEventListener("click", function () {
        ui_1.gameState.isPaused = false;
        resumeButton.style.display = "none";
        newmatchButton.style.display = "none";
    });
    newmatchButton === null || newmatchButton === void 0 ? void 0 : newmatchButton.addEventListener("click", function () {
        resumeButton.style.display = "none";
        newmatchButton.style.display = "none";
        (0, ui_1.startGame)();
    });
}
