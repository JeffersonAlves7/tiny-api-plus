//@ts-check

import { EstoqueRequests } from "../requests/estoqueRequests.js";
import { formatCustomDate, stringToDate } from "../utils/dateUtils.js";

const ESTOQUES = {
  "Loja 1": "497662283",
  Matriz: "663192122",
  0: "0", // If it is 0, it will get all the products from all the stores
};

/**
 * @typedef {'Loja 1' | 'Matriz' | '0'} Estoque
 */

/**
 * Estoque Manager
 * @class
 */
export class EstoqueManager {
  /**
   * @param {string} TINYSESSID
   */
  constructor(TINYSESSID) {
    /**
     * @private
     * @type {string}
     */
    this.TINYSESSID = TINYSESSID;
  }

  /**
   * @typedef {Object} ProducoPacoteDadosImpressao
   * @property {string} id
   * @property {string} nome
   * @property {string} unidade
   * @property {string} preco
   * @property {string} precoPromocional
   * @property {string} codigo
   * @property {string} tipo
   * @property {string} estoqueMinimo
   * @property {string} precoCusto
   * @property {string} idProdutoPai
   * @property {string} produtoVariacaoPai
   * @property {string} gerenciarEstoque
   * @property {string} situacao
   * @property {string} classeProduto
   * @property {string} codigoNoFabricante
   * @property {string} idMarca
   * @property {string} marca
   * @property {string} localizacao
   * @property {string} cf
   * @property {string} dataAlteracao
   */

  /**
   *
   * @returns {Promise<ProducoPacoteDadosImpressao[]>}}
   */
  async getAllPagesFromObterPacoteDadosImpressao() {
    const products = [];

    for (let i = 0; true; i++) {
      const response = await this.getPageFromObterPacoteDadosImpressao(i);
      if (response.length == 0) return products;

      products.push(...response);
    }
  }

  /**
   *
   * @param {number} page
   * @returns {Promise<ProducoPacoteDadosImpressao[]>}}
   */
  async getPageFromObterPacoteDadosImpressao(page) {
    const produtosResponse = await EstoqueRequests.obterPacoteDadosImpressao(
      this.TINYSESSID,
      page
    );

    const searchValue = /retornoPacote\((.*)\)/g.exec(
      produtosResponse.response[0].src
    );

    if (searchValue) {
      const productsValue = JSON.parse(searchValue[1]);
      return productsValue;
    }
    return [];
  }

  /**
   * @typedef {Object} ProducoPacoteDadosImpressaoEstoque
   * @property {string} id
   * @property {string} nome
   * @property {string} unidade
   * @property {string} preco
   * @property {string} precoPromocional
   * @property {string} precoCusto
   * @property {string?} idLinhaProduto
   * @property {string} codigo
   * @property {string} localizacao
   * @property {string} spedTipoItem
   * @property {string} cf
   * @property {string} classeProduto
   * @property {string} tipo
   * @property {string} produtoVariacaoPai
   * @property {string} idProdutoPai
   * @property {string} pesoBruto
   * @property {string} pesoLiq
   * @property {string} gerenciarEstoque
   * @property {string} gtin
   * @property {string} controlarLotes
   * @property {string} idCatProd
   * @property {string} estoque
   */

  // Obter todas as paginas de pacote dados impressao estoque
  /**
   *
   * @param {Estoque} estoque
   * @returns {Promise<ProducoPacoteDadosImpressaoEstoque[]>}
   */
  async getAllPagesFromObterPacoteDadosImpressaoEstoque(estoque) {
    const products = [];

    for (let i = 0; true; i++) {
      const { values } = await this.getPageFromObterPacoteDadosImpressaoEstoque(
        i,
        estoque
      );
      if (values[0].length == 0) return products;

      products.push(...values[0]);
    }
  }

  /**
   *
   * @param {Estoque} estoque - 0 is all the stores combined in one
   * @param {number} page
   * @returns {Promise<ProducoPacoteDadosImpressaoEstoque[]>}
   */
  async getPageFromObterPacoteDadosImpressaoEstoque(page, estoque) {
    const produtosResponse =
      await EstoqueRequests.obterPacoteDadosImpressaoEstoque(
        this.TINYSESSID,
        page,
        ESTOQUES[estoque]
      );

    const searchValue = /retornoPacote\((.*)\)/g.exec(
      produtosResponse.response[0].src
    );

    if (searchValue) {
      // Fiz isso porque ele estava retornando algo assim [], {}. Dai eu fiz isso  {values: [[], {}]} e agora funcoina
      const productsValue = JSON.parse(`{\"values\": [${searchValue[1]}]}`);
      return productsValue;
    }
    return [];
  }

  /**
   * @typedef {Object} ProdutoEstoqueMultiEmpresa
   * @property {string} id
   * @property {Object} estoque
   *
   */

  /**
   * @param {string[]} ids
   * @returns {Promise<ProdutoEstoqueMultiEmpresa[]>}
   */
  async getAllPagesFromEstoqueProdutosMultiEmpresa(ids) {
    // Separe the ids in group of 100
    const idsGroups = [];
    for (let i = 0; i < ids.length; i += 100) {
      idsGroups.push(ids.slice(i, i + 100));
    }

    // Get all the products from the ids
    const products = [];
    for (const idsGroup of idsGroups) {
      const { response } =
        await EstoqueRequests.carregarLoteEstoqueProdutosMultiEmpresa(
          this.TINYSESSID,
          idsGroup
        );
      products.push(...response[0].val);
    }

    return products;
  }

  /**
   * Esta retornando apenas o id dos produtos
   * @param {string} dataInicio - dd/MM/yyyy
   * @param {string} dataFim - dd/MM/yyyy
   * @param {Estoque} estoque
   */
  async getRelatorioSaldosPorDiaComEstoqueZeradoPerPeriod(
    dataInicio,
    dataFim,
    estoque
  ) {
    // Create a Map object to save the ID of the products and count the occurences
    const productsMap = new Map();

    for (
      let date = stringToDate(dataInicio);
      date <= stringToDate(dataFim);
      date.setDate(date.getDate() + 1)
    ) {
      const products =
        await this.getAllPagesFromRelatorioSaldosPorDiaComEstoqueZerado(
          formatCustomDate(date, "dd/MM/yyyy"),
          estoque
        );

      // Add the products to the map, this will return the ids products array
      products.forEach((product) => {
        productsMap.set(
          product.idProduto,
          (productsMap.get(product.idProduto) ?? 0) + 1
        );
      });
    }

    const json = {};

    // do a loop to the map keys
    for (const key of productsMap.keys()) {
      // get the value from the map
      const value = productsMap.get(key);

      // add the key and value to the json
      json[key] = value;
    }

    return json;
  }

  /**
   *
   * @param {string} data - dd/MM/yyyy
   * @param {Estoque} estoque
   * @returns
   */
  async getAllPagesFromRelatorioSaldosPorDiaComEstoqueZerado(data, estoque) {
    console.log(data);

    const pagesResponse = await EstoqueRequests.obterDadosRelatorioSaldos(
      this.TINYSESSID,
      {
        data: data,
        filtroEstoque: "Z", // Apenas estoque zerado
        idDeposito: ESTOQUES[estoque],
      }
    );

    const numOfPages = pagesResponse.response[0].val.pacotes;
    const productsZ = [];

    for (let i = 0; i < numOfPages; i++) {
      const response = await this.getPageFromRelatorioSaldosPorDia(
        i,
        numOfPages
      );
      productsZ.push(...response);
    }

    return productsZ;
  }

  /**
   *
   * @param {number} page
   * @param {number} maxPage
   */
  async getPageFromRelatorioSaldosPorDia(page, maxPage) {
    const { response } = await EstoqueRequests.obterPacoteDadosRelatorioSaldos(
      this.TINYSESSID,
      page,
      maxPage
    );
    return response[0].val;
  }
}
