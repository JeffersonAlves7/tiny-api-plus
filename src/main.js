// @ts-check

import { AuthManager } from "./managers/authManager.js";
import { EstoqueManager } from "./managers/estoqueManager.js";
import { getEnv } from "./utils/envUtils.js";

// Create a AppManager to manage all the application
/**
 * @class
 */
class AppManager {
  /**
   *
   * @param {AuthManager} authManager
   */
  constructor(authManager) {
    /**
     * @private
     */
    this.authManager = authManager;
  }

  async login() {
    await this.authManager.loadTINYSESSIDFromDatabase();
    await this.authManager.login(getEnv("USER_EMAIL"), getEnv("USER_PASSWORD"));
  }
}

async function main() {
  // Get the product id, descricao, marca
  const authManager = new AuthManager();
  const appManager = new AppManager(authManager);

  await appManager.login();

  const estoqueManager = new EstoqueManager(authManager.getTINYSESSID());

  // Get the product id, descricao, marca
  //   const teste = await EstoqueRequests.relatorioEstoqueDoDia(
  //     "10/04/2023",
  //     authManager.getTINYSESSID(),
  //   );
  //   console.log(JSON.stringify(teste, null, 2));

  const produtos = await estoqueManager.getAllPagesFromObterPacoteDadosImpressao();
  console.log({produtos})
}
main();
