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

export class AuthRequests {
  /**
   * Inicia uma sessão de login.
   * @param {UserData} userData - Dados do usuário para login.
   */
  static async initLogin(userData) {
    const data = {
      type: "2",
      "func[clss]": "Login\\Login",
      "func[metd]": "efetuarLogin",
      args: `[{"login":"${userData.email}","senha":"${userData.password}","derrubarSessoes":true,"ehParceiro":false,"captchaResponse":"","sessionAccounts":{}}]`,
    };

    const response = await fetch(
      "https://erp.tiny.com.br/services/reforma.sistema.server.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "X-Custom-Request-For": "XAJAX",
        },
        body: new URLSearchParams(data).toString(),
      }
    );

    const headers = response.headers; // Obter todos os headers da resposta
    const responseData = await response.json();

    return { headers, data: responseData };
  }

  /**
   * Finaliza uma sessão de login.
   * @param {LoginData} loginData - Dados de login.
   */
  static async finishLogin(loginData) {
    const data = {
      type: "2",
      "func[clss]": "Login\\Login",
      "func[metd]": "finalizarLogin",
      args: `["${loginData.uidLogin}",${loginData.idUsuario},null]`,
    };

    const response = await fetch(
      "https://erp.tiny.com.br/services/reforma.sistema.server.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "X-Custom-Request-For": "XAJAX",
          Cookie: `TINYSESSID=${loginData.TINYSESSID}`,
        },
        body: new URLSearchParams(data).toString(),
      }
    );

    const headers = response.headers; // Obter todos os headers da resposta
    const responseData = await response.json();

    return { headers, data: responseData };
  }

  /**
   * Verifica TINYSESSID.
   * @param {string} TINYSESSID - TINYSESSID a ser verificado.
   */
  static async verifyTINYSESSID(TINYSESSID) {
    try {
      const data = {
        type: "1",
        func: "obterDadosRelatorioSaldos",
      };

      const response = await fetch(
        "https://erp.tiny.com.br/services/estoque.relatorios.server.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            Cookie: `TINYSESSID=${TINYSESSID};`,
            "X-Custom-Request-For": "XAJAX",
          },
          body: new URLSearchParams(data).toString(),
        }
      );

      // Trate a resposta aqui
      const responseData = await response.json();
      const isAuth =
        !responseData?.response[0]?.src.includes("redirect-on-login");
      return isAuth;
    } catch (e) {
      return true;
    }
  }
}

// // Exemplo de uso:
// async function testAuth() {
//   const userData = {
//     email: "seu-email@example.com",
//     password: "sua-senha",
//   };

//   const loginData = await AuthRequests.initLogin(userData);
//   console.log("Login Data:", loginData);

//   if (loginData.data.success) {
//     const verifyResult = await AuthRequests.verifyTINYSESSID(
//       loginData.data.session.TINYSESSID
//     );
//     console.log("TINYSESSID Verification:", verifyResult);

//     const finishResult = await AuthRequests.finishLogin(loginData.data.session);
//     console.log("Finish Login Data:", finishResult);
//   }
// }

// // Chamada de teste
// testAuth();
