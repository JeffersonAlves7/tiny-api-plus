"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
function writeJsonFile(fileName, content) {
    fs_1.default.writeFileSync("temp/" + fileName, JSON.stringify(content, null, 2));
}
exports.default = writeJsonFile;
