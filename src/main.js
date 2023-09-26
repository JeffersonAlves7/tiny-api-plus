// @ts-check

import { AuthManager } from "./managers/authManager.js";
import { EstoqueManager } from "./managers/estoqueManager.js";
import { getEnv } from "./utils/envUtils.js";
import fs from "fs"

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
  // const produtos = await estoqueManager.getAllPagesFromObterPacoteDadosImpressao();
  // console.log({produtos})
  const produtosLoja1 = await estoqueManager.getAllPagesFromObterPacoteDadosImpressaoEstoque("Loja 1");
  console.log({produtos: produtosLoja1})
  fs.writeFileSync('produtosLoja1.json', JSON.stringify(produtosLoja1, null, 2))

  const produtosMatriz = await estoqueManager.getAllPagesFromObterPacoteDadosImpressaoEstoque("Matriz");
  console.log({produtos: produtosMatriz})
  fs.writeFileSync('produtosMatriz.json', JSON.stringify(produtosMatriz, null, 2))
}
main();
