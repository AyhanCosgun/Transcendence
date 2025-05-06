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
exports.endMsg = exports.gameState = void 0;
exports.updateScoreBoard = updateScoreBoard;
exports.updateSetBoard = updateSetBoard;
exports.resetBall = resetBall;
exports.startGame = startGame;
exports.resetScores = resetScores;
exports.resetSets = resetSets;
exports.showSetToast = showSetToast;
exports.startNextSet = startNextSet;
exports.showEndMessage = showEndMessage;
exports.scorePoint = scorePoint;
var core_1 = require("@babylonjs/core");
var main_1 = require("./main");
var main_2 = require("./main");
//   // Basit mesajları göstermek için kullanılan HTML öğesini seç
// const statusElement = document.getElementById("status")!;
// const resultElement = document.getElementById("result")!;
// // Rakip bulunduğunda kullanıcıya bilgi ver
// export function updateUIForMatchFound() {
//   statusElement.textContent = "Rakip bulundu! Oyun hazırlanıyor...";
//   resultElement.textContent = "";
// }
// // Rakip bekleniyorsa kullanıcıya göster
// export function updateUIForWaiting() {
//   statusElement.textContent = "Rakip bekleniyor...";
//   resultElement.textContent = "";
// }
var scoreTable = document.getElementById("score-table");
var setTable = document.getElementById("set-table");
exports.gameState = {
    points: { player1: 0, player2: 0 },
    sets: { player1: 0, player2: 0 },
    matchOver: false,
    setOver: false,
    isPaused: false,
};
function updateScoreBoard() {
    scoreTable.innerText = "".concat(exports.gameState.points.player1, "  :  ").concat(exports.gameState.points.player2);
}
function updateSetBoard() {
    setTable.innerText = "".concat(exports.gameState.sets.player1, "  :  ").concat(exports.gameState.sets.player2);
}
// //Bazı top sabitleri
// const ballFirstSpeedFactor = 0.15;
// let speedIncreaseFactor = 1.5;
// const airResistanceFactor = 0.998; // Her frame'de %0.2 hız kaybı
// const minimumSpeed = 0.2; // Top minimum bu hızın altına inemez
// let pedalHit = 0;
// let ballVelocity = new Vector3(0,0, 0); // top hızının tanımı
// OYUN FONKSİYONLARI
function resetBall(lastScorer) {
    main_1.ball.state.firstPedalHit = 0;
    main_1.ball.state.speedIncreaseFactor = 1.7;
    main_1.ball.state.minimumSpeed = main_1.ball.state.firstSpeedFactor;
    // 🎯 Önce topu durdur
    main_1.ball.state.velocity = new core_1.Vector3(0, 0, 0);
    // 🎯 Topu ortada sabitle
    main_1.ball.getBall().position = new core_1.Vector3(0, Math.random() * 8 - 4, 0);
    // 🎯 Belirli bir süre bekle ( 1 saniye)
    setTimeout(function () {
        var angle = lastScorer == 'player1' ? (Math.random() * 2 - 1) * Math.PI / 6 : Math.PI - (Math.random() * 2 - 1) * Math.PI / 6;
        // 2 saniye sonra yeni rastgele bir hız ver
        main_1.ball.state.velocity = new core_1.Vector3(Math.cos(angle) * main_1.ball.state.firstSpeedFactor, Math.sin(angle) * main_1.ball.state.firstSpeedFactor, 0);
    }, 1000); // 1000ms = 1 saniye
}
function startGame() {
    exports.gameState.matchOver = false;
    exports.gameState.isPaused = false;
    resetScores();
    resetSets();
    Math.random() <= 0.5 ? resetBall('player1') : resetBall('player2');
}
function resetScores() {
    exports.gameState.points.player1 = 0;
    exports.gameState.points.player2 = 0;
    updateScoreBoard();
}
function resetSets() {
    exports.gameState.sets.player1 = 0;
    exports.gameState.sets.player2 = 0;
    updateSetBoard();
}
function showSetToast(message) {
    return new Promise(function (resolve) {
        var toast = document.getElementById("set-toast");
        toast.textContent = message;
        toast.style.opacity = "1";
        exports.gameState.setOver = true;
        setTimeout(function () {
            toast.style.opacity = "0";
            exports.gameState.setOver = false;
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
exports.endMsg = document.getElementById("end-message");
function showEndMessage(message) {
    exports.endMsg.textContent = message;
    exports.endMsg.style.display = "flex";
    if (main_2.startButton) {
        main_2.startButton.style.display = "inline-block";
        main_2.startButton.textContent = "Yeni Maça Başla";
    }
}
function scorePoint(winner) {
    if (exports.gameState.matchOver)
        return;
    exports.gameState.points[winner]++;
    updateScoreBoard();
    var p1 = exports.gameState.points.player1;
    var p2 = exports.gameState.points.player2;
    // Kontrol: Set bitti mi?
    if ((p1 >= 11 || p2 >= 11) && Math.abs(p1 - p2) >= 2) {
        if (p1 > p2) {
            exports.gameState.sets.player1++;
        }
        else {
            exports.gameState.sets.player2++;
        }
        updateSetBoard();
        var matchControl_1 = (exports.gameState.sets.player1 === 3 || exports.gameState.sets.player2 === 3);
        if (!matchControl_1)
            startNextSet("Seti ".concat(winner, " kazand\u0131!"));
        setTimeout(function () {
            if (!matchControl_1)
                resetScores();
        }, 3000);
        resetBall(winner);
        // Kontrol: Maç bitti mi?
        if (matchControl_1) {
            showEndMessage("".concat(winner, " ma\u00E7\u0131 kazand\u0131 !"));
            exports.gameState.matchOver = true;
        }
    }
    else {
        resetBall(winner);
    }
}
