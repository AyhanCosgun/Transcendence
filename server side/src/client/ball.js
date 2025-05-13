"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BallController = void 0;
// BallController.ts
var core_1 = require("@babylonjs/core");
var BallController = /** @class */ (function () {
    function BallController(scene) {
        this.state = {
            firstSpeedFactor: 0.15,
            airResistanceFactor: 0.998,
            minimumSpeed: 0.15,
            radius: 0.25,
            speedIncreaseFactor: 1.7,
            firstPedalHit: 0,
            velocity: new core_1.Vector3(0, 0, 0),
        };
        this.ball = core_1.MeshBuilder.CreateSphere("ball", { diameter: 2 * this.state.radius }, scene);
        var ballMaterial = new core_1.StandardMaterial("ballMaterial", scene);
        ballMaterial.diffuseColor = new core_1.Color3(0.7, 0.7, 0.7);
        this.ball.material = ballMaterial;
    }
    BallController.prototype.getBall = function () {
        return this.ball;
    };
    BallController.prototype.setVelocity = function (velocity) {
        this.state.velocity = velocity;
    };
    BallController.prototype.getVelocity = function () {
        return this.state.velocity;
    };
    return BallController;
}());
exports.BallController = BallController;
