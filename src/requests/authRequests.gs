//@ts-check

/**
 * @typedef {Object} UserData - Dados de usuário para login.
 * @property {string} email - Endereço de e-mail do usuário.
 * @property {string} password - Senha do usuário.
 */

/**
 * @typedef {Object} LoginData - Dados de login após a autenticação.
 * @property {string} uidLogin - UID de login.
 * @property {number} idUsuario - ID do usuário.
 * @property {string} TINYSESSID - TINYSESSID da sessão.
 */

class AuthRequests {
  /**
   * Inicia uma sessão de login.
   * @param {UserData} userData - Dados do usuário para login.
   */
  static initLogin(userData) {
    const data = {
      type: "2",
      "func[clss]": "Login\\Login",
      "func[metd]": "efetuarLogin",
      timeInicio: "1694909856213",
      location: "https://erp.tiny.com.br/login/",
      args: `[{"login":"${userData.email}","senha":"${userData.password}","derrubarSessoes":true,"ehParceiro":false,"captchaResponse":"","sessionAccounts":{}}]`,
    };

    const response = UrlFetchApp.fetch(
      "https://erp.tiny.com.br/services/reforma.sistema.server.php",
      {
        method: "post",
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        headers: {
          "X-Custom-Request-For": "XAJAX",
        },
        payload: data,
      }
    );

    const headers = response.getAllHeaders(); // Obter todos os headers da resposta
    const responseData = JSON.parse(response.getContentText());

    return { headers, data: responseData };
  }

  /**
   * Finaliza uma sessão de login.
   * @param {LoginData} loginData - Dados de login.
   */
  static finishLogin(loginData) {
    const data = {
      type: "2",
      "func[clss]": "Login\\Login",
      "func[metd]": "finalizarLogin",
      timeInicio: "1694909856699",
      args: `["${loginData.uidLogin}",${loginData.idUsuario},null]`,
    };

    const response = UrlFetchApp.fetch(
      "https://erp.tiny.com.br/services/reforma.sistema.server.php",
      {
        method: "post",
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        headers: {
          "X-Custom-Request-For": "XAJAX",
          Cookie: `TINYSESSID=${loginData.TINYSESSID}`,
        },
        payload: data,
      }
    );

    const headers = response.getAllHeaders(); // Obter todos os headers da resposta
    /**
     * @type {any}
     */
    const responseData = JSON.parse(response.getContentText());

    return { headers, data: responseData };
  }

  /**
   * Verifica TINYSESSID.
   * @param {string} TINYSESSID - TINYSESSID a ser verificado.
   */
  static verifyTINYSESSID(TINYSESSID) {
    try {
      const data = {
        type: "1",
        func: "obterDadosRelatorioSaldos",
      };

      const response = UrlFetchApp.fetch(
        "https://erp.tiny.com.br/services/estoque.relatorios.server.php",
        {
          method: "post",
          contentType: "application/x-www-form-urlencoded; charset=UTF-8",
          headers: {
            Cookie: `TINYSESSID=${TINYSESSID};`,
            "X-Custom-Request-For": "XAJAX",
          },
          payload: data,
        }
      );

      // Trate a resposta aqui
      const responseData = JSON.parse(response.getContentText());
      const isAuth =
        !responseData?.response[0]?.src.includes("redirect-on-login");
      return isAuth;
    } catch (e) {
      return true;
    }
  }
}

