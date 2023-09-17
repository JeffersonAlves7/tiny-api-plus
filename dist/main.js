"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Tiny_1 = require("./Tiny");
const dotenv_1 = __importDefault(require("dotenv"));
const writeJsonFile_1 = __importDefault(require("./utils/writeJsonFile"));
dotenv_1.default.config();
async function main() {
    const tiny = new Tiny_1.Tiny(process.env.USER_EMAIL, process.env.USER_PASSWORD);
    await tiny.loadTINYSESSIDFromDatabase();
    if (!tiny.TINYSESSID) {
        console.log("Vai fazer login");
        await tiny.login();
    }
    console.log({ TINYSESSID: tiny.TINYSESSID });
    const diasParaRequisitar = ["15/09/2023", "16/09/2023", "17/09/2023"];
    const relatorios = await Promise.all(diasParaRequisitar.map((dia) => tiny.obterEstoqueDoDia(dia)));
    console.log({ relatorios });
    (0, writeJsonFile_1.default)("relatorios.json", relatorios);
}
main();
