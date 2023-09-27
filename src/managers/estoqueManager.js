//@ts-check

import { EstoqueRequests } from "../requests/estoqueRequests.js";

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
   * @param {'Loja 1' | 'Matriz' | 'Loja 2' | '0' } estoque
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
   * @param {'Loja 1' | 'Matriz' | 'Loja 2' | '0'} estoque - 0 is all the stores combined in one
   * @param {number} page
   * @returns {Promise<ProducoPacoteDadosImpressaoEstoque[]>}
   */
  async getPageFromObterPacoteDadosImpressaoEstoque(page, estoque) {
    const estoques = { 
      'Loja 1': '497662283',
      'Matriz': '663192122',
      'Loja 2': '',
      '0': '0', // If it is 0, it will get all the products from all the stores
    }

    const produtosResponse =
      await EstoqueRequests.obterPacoteDadosImpressaoEstoque(
        this.TINYSESSID,
        page,
        estoques[estoque]
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
   * @typedef {Object} EstoqueMultiEmpresa
   */

  /**
   * @typedef {Object} ProdutoEstoqueMultiEmpresa
   * @property {string} id
   * @property {EstoqueMultiEmpresa} estoque
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
      const {response} =
        await EstoqueRequests.carregarLoteEstoqueProdutosMultiEmpresa(
          this.TINYSESSID,
          idsGroup
        );
      products.push(...response[0].val);
    }

    return products;
  }
}
