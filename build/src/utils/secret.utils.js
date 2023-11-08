"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWT_SECRET = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
if (fs_1.default.existsSync(".env")) {
    dotenv_1.default.config({ path: ".env" });
}
else {
    console.error(".env file not found.");
}
exports.JWT_SECRET = process.env.JWT_SECRET;
