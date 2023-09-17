"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Tiny_1 = require("./Tiny");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
async function main() {
    const tiny = new Tiny_1.Tiny(process.env.USER_EMAIL, process.env.USER_PASSWORD);
    await tiny.login();
    console.log({ TINYSESSID: tiny.TINYSESSID });
}
main();
