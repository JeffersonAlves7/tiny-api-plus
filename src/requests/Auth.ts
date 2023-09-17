import axios from "axios";
import qs from "qs";

interface UserData {
  email: string;
  password: string;
}

interface LoginData {
  uidLogin: string;
  idUsuario: number;
  TINYSESSID: string;
}

const doLoginDataExample = {
  response: [
    {
      cmd: "rt",
      val: {
        urlLogoEmpresa: "",
        verificar2FA: false,
        uidLogin: "",
        idUsuario: 0,
        login: "",
      },
    },
  ],
};

export class AuthRequests {
  static async initLogin(userData: UserData) {
    let data = qs.stringify({
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

    return axios.request<typeof doLoginDataExample>(config);
  }

  static async finishLogin(loginData: LoginData) {
    let data = qs.stringify({
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

    return axios.request(config);
  }

  static async verifyTINYSESSID(TINYSESSID: string): Promise<boolean> {
    try {
      let data = qs.stringify({
        type: "1",
        func: "obterDadosRelatorioSaldos",
      });

      let config = {
        method: "post",
        maxBodyLength: Infinity,
        url: "https://erp.tiny.com.br/services/estoque.relatorios.server.php",
        headers: {
          "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          cookie: `TINYSESSID=${TINYSESSID};`,
          "x-custom-request-for": "XAJAX",
        },
        data: data,
      };
      const response = await axios.request(config);
      return !response.data.response[0]?.src.includes("redirect-on-login");
    } catch (e){
      return true;
    }
  }
}
