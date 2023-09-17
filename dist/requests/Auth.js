"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRequests = void 0;
const axios_1 = __importDefault(require("axios"));
const qs_1 = __importDefault(require("qs"));
const doLoginDataExample = {
    response: [
        {
            cmd: "rt",
            val: {
                urlLogoEmpresa: "https://erp.tiny.com.br/exibe.logo.empresa?idEmpresa=751452427&logoMenor=N&nomeEmpresa=N",
                verificar2FA: false,
                uidLogin: "90d43f18726b4d843e789b98c0df9671ca785656",
                idUsuario: 751452431,
                login: "softhousesolutions23@gmail.com",
            },
        },
    ],
};
class AuthRequests {
    static async initLogin(userData) {
        let data = qs_1.default.stringify({
            type: "2",
            "func[clss]": "Login\\Login",
            "func[metd]": "efetuarLogin",
            timeInicio: "1694909856213",
            location: "https://erp.tiny.com.br/login/",
            args: `[{"login":"${userData.email}","senha":"${userData.password}","derrubarSessoes":true,"ehParceiro":false,"captchaResponse":"","sessionAccounts":{}}]`,
        });
        let config = {
            method: "post",
            maxBodyLength: Infinity,
            url: "https://erp.tiny.com.br/services/reforma.sistema.server.php",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                "X-Custom-Request-For": "XAJAX",
            },
            data: data,
        };
        return axios_1.default.request(config);
    }
    static async finishLogin(loginData) {
        let data = qs_1.default.stringify({
            type: "2",
            "func[clss]": "Login\\Login",
            "func[metd]": "finalizarLogin",
            timeInicio: "1694909856699",
            args: `["${loginData.uidLogin}",${loginData.idUsuario},null]`,
        });
        let config = {
            method: "post",
            maxBodyLength: Infinity,
            url: "https://erp.tiny.com.br/services/reforma.sistema.server.php",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                "X-Custom-Request-For": "XAJAX",
                Cookie: `TINYSESSID=${loginData.TINYSESSID}`,
            },
            data: data,
        };
        return axios_1.default.request(config);
    }
}
exports.AuthRequests = AuthRequests;
