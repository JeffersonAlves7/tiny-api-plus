"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tiny = void 0;
const Auth_1 = require("./requests/Auth");
class Tiny {
    userEmail;
    userPassword;
    TINYSESSID = "";
    constructor(userEmail, userPassword) {
        this.userEmail = userEmail;
        this.userPassword = userPassword;
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
            return this.TINYSESSID;
        }
        catch (e) {
            console.error(e);
        }
    }
}
exports.Tiny = Tiny;
