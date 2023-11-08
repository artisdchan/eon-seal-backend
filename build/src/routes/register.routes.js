"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const register_controller_1 = __importDefault(require("../controller/register.controller"));
class RegisterRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.controller = new register_controller_1.default();
        this.intializeRoutes();
    }
    intializeRoutes() {
        this.router.post("/register", this.controller.register);
    }
}
exports.default = new RegisterRoutes().router;
