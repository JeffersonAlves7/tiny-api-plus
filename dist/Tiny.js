"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tiny = void 0;
const Auth_1 = require("./requests/Auth");
const Estoque_1 = require("./requests/Estoque");
const sqlite3_1 = __importDefault(require("sqlite3"));
class Tiny {
    userEmail;
    userPassword;
    TINYSESSID = "";
    constructor(userEmail, userPassword) {
        this.userEmail = userEmail;
        this.userPassword = userPassword;
    }
    async loadTINYSESSIDFromDatabase() {
        return new Promise(resolve => {
            const db = new sqlite3_1.default.Database("temp/tiny.db");
            db.serialize(() => {
                db.get("SELECT TINYSESSID FROM session ORDER BY rowid DESC LIMIT 1", (err, row) => {
                    if (!err && row) {
                        this.TINYSESSID = row.TINYSESSID;
                    }
                    resolve(true);
                });
            });
            db.close();
        });
    }
    async saveTINYSESSIDToDatabase() {
        const db = new sqlite3_1.default.Database("temp/tiny.db");
        db.serialize(() => {
            db.run("CREATE TABLE IF NOT EXISTS session (TINYSESSID TEXT)");
            const stmt = db.prepare("INSERT INTO session VALUES (?)");
            stmt.run(this.TINYSESSID);
            stmt.finalize();
        });
        db.close();
    }
    async login() {
        try {
            const email = this.userEmail;
            const password = this.userPassword;
            const response = await Auth_1.AuthRequests.initLogin({ email, password });
            // This cookie is temporary, after finish login that will be invalid.
            let regexExec = /TINYSESSID=(?<TINYSESSID>.+?);/g.exec(response.headers["set-cookie"].find((v) => v.includes("TINYSESSID")));
            const TINYSESSID_TEMP = regexExec.groups["TINYSESSID"];
            const { idUsuario, uidLogin } = response.data.response[0].val;
            const finalizeResponse = await Auth_1.AuthRequests.finishLogin({
                uidLogin,
                idUsuario,
                TINYSESSID: TINYSESSID_TEMP,
            });
            // Here I catch the final TINYSESSID
            regexExec = /TINYSESSID=(?<TINYSESSID>.+?);/g.exec(finalizeResponse.headers["set-cookie"].find((v) => v.includes("TINYSESSID")));
            this.TINYSESSID = regexExec.groups["TINYSESSID"];
            this.saveTINYSESSIDToDatabase();
            return this.TINYSESSID;
        }
        catch (e) {
            console.error(e);
        }
    }
    /**
     *
     * @param dia dd/mm/yyyy
     */
    async obterEstoqueDoDia(dia) {
        const response = await Estoque_1.EstoqueRequests.relatorioEstoqueDoDia(dia, this.TINYSESSID);
        const { data } = response;
        return { registros: data.response[0].val.registros };
    }
}
exports.Tiny = Tiny;
