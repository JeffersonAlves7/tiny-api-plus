// @ts-check

/// <reference path="managers/authManager.js"/>
/// <reference path="managers/estoqueManager.js"/>
/// <reference path="requests/apiRequests.js"/>

// Create a class to Manage all the application, this class will be the main class
class AppManager {
  // Add the ApiREquests and AuthManager to the constructor
  /**
   *
   * @param {ApiRequests} apiRequests
   * @param {AuthManager} authManager
   */
  constructor(apiRequests, authManager) {
    this.apiRequests = apiRequests;
    this.authManager = authManager;
  }

  // Get all the products from the API
  /**
   *
   * @returns
   */
  getAllProducts() {
    const products = [];
    let page = 1;
    let maxPages = 1;

    // Do a loop to get all the products from the API
    do {
      const data = this.apiRequests.pesquisarProdutos("", "", page.toString());
      products.push(...data.retorno.produtos);
      maxPages = data.retorno.numero_paginas;
      page++;
      break;
    } while (page <= maxPages);

    return products;
  }

  // Get the products by pesquisa and situacao
  /**
   * This function will return the products by pesquisa and situacao
   * @param {string} pesquisa
   * @param {string} situacao
   * @returns
   */
  getProductsByPesquisaAndSituacao(pesquisa = "", situacao = "") {
    const products = [];
    let page = 1;
    let maxPages = 1;

    // Do a loop to get all the products from the API
    do {
      const data = this.apiRequests.pesquisarProdutos(
        pesquisa,
        situacao,
        page.toString()
      );
      products.push(...data.retorno.produtos);
      maxPages = data.retorno.numero_paginas;
      page++;
      break; // Remove to get more than one page
    } while (page <= maxPages);

    return products;
  }

  // Get all the products from the API and save it to the spreadsheet
  /**
   *
   * @returns
   */
  getAllProductsAndSave() {
    const products = this.getAllProducts();
    const sheet =
      SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Produtos");

    // Clear the contents of the sheet but ignore the row 1
    sheet
      ?.getRange(2, 1, sheet.getLastRow(), sheet.getLastColumn())
      .clearContent();

    sheet
      ?.getRange(2, 1, products.length, 9)
      .setValues(
        products.map((product) => [
          product.produto.id,
          product.produto.codigo,
          product.produto.nome,
          product.produto.preco,
          product.produto.preco_promocional,
          product.produto.preco_custo,
          product.produto.preco_custo_medio,
          product.produto.unidade,
          product.produto.tipoVariacao,
        ])
      );

    return products;
  }

  // Receive the products and save it to the spreadsheet
  /**
   *
   * @param {any[]} products
   * @returns
   */
  saveProducts(products) {
    const sheet =
      SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Produtos");

    // Clear the contents of the sheet but ignore the row 1
    sheet
      ?.getRange(2, 1, sheet.getLastRow(), sheet.getLastColumn())
      .clearContent();

    sheet
      ?.getRange(2, 1, products.length, 9)
      .setValues(
        products.map((product) => [
          product.produto.id,
          product.produto.codigo,
          product.produto.nome,
          product.produto.preco,
          product.produto.preco_promocional,
          product.produto.preco_custo,
          product.produto.preco_custo_medio,
          product.produto.unidade,
          product.produto.tipoVariacao,
        ])
      );

    return products;
  }
}

//Create a function to get the products from the API and save it to the spreadsheet with the AppManager
/**
 *
 */
function main() {
  const authManager = new AuthManager();

  const apiRequests = new ApiRequests();
  apiRequests.loadApiToken();
  const appManager = new AppManager(apiRequests, authManager);

  // Save the products with status active to the spreadsheet
  const products = appManager.getProductsByPesquisaAndSituacao('', 'A');
  appManager.saveProducts(products);
}

// authManager.loadTINYSESSIDFromScriptProperties();
// console.log({ TINYSESSID: authManager.getTINYSESSID() });
// const scriptProperties = PropertiesService.getScriptProperties();

// const email = scriptProperties.getProperty("USER_EMAIL") || "";
// const password = scriptProperties.getProperty("USER_PASSWORD") || "";

// if (!email || !password) {
//   throw new Error("Cannot find User's email address and User's password");
// }

// authManager.login(email, password);
// const estoqueManager = new EstoqueManager(authManager.getTINYSESSID());
