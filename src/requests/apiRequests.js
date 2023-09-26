// @ts-check

import { getEnv } from "../utils/envUtils";

export class ApiRequests {
  constructor() {
    this.token = "";
    this.restUrl = "https://api.tiny.com.br/api2/";
  }

  loadApiToken() {
    // Load the TOKEN from env
    this.token = getEnv("TOKEN");
  }

  /**
   * @param {string} id
   * @returns
   */
  async obterProduto(id) {
    const url = this.restUrl + "produto.obter.php";
    const params = {
      formato: "json",
      token: this.token,
      id: id,
    };

    const searchParams = new URLSearchParams(params);

    const response = await fetch(url, {
      method: "POST",
      body: searchParams,
    });

    const responseData = await response.json();
    return responseData;
  }

  /**
   * @param {string?} pesquisa
   * @param {string?} situacao
   * @param {string?} pagina
   * @returns
   */
  async pesquisarProdutos(pesquisa = "", situacao = "", pagina = "") {
    const url = this.restUrl + "produtos.pesquisa.php";
    const params = {
      token: this.token,
      formato: "json",
      pesquisa: pesquisa ?? "",
      situacao: situacao ?? "",
      pagina: pagina ?? "",
    };

    const searchParams = new URLSearchParams(params);

    const response = await fetch(url, {
      method: "POST",
      body: searchParams,
    });

    const responseData = await response.json();
    return responseData;
  }

  /**
   * @param {string} id
   * @returns
   */
  async obterEstoque(id) {
    const url = this.restUrl + "produto.obter.estoque.php";
    const params = {
      token: this.token,
      formato: "json",
      id: id,
    };

    const searchParams = new URLSearchParams(params);

    const response = await fetch(url, {
      method: "POST",
      body: searchParams,
    });

    const responseData = await response.json();
    return responseData;
  }
}
