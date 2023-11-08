"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = __importDefault(require("../controller/auth.controller"));
class AuthRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.controller = new auth_controller_1.default();
        this.intializeRoutes();
    }
    intializeRoutes() {
        this.router.post("/login", this.controller.login);
    }
}
exports.default = new AuthRoutes().router;
