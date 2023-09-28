// @ts-check

import { VendasRequests } from "../requests/vendasRequests.js";

/**
 * Estoque Manager
 * @class
 */
export class VendasManager {
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
   * @param {string} dataInicio - Formato: YYYY-MM-DD
   * @param {string} dataFim - Formato: YYYY-MM-DD
   * @param {'matriz' | 'filial'} loja 
   * @returns
   */
  async getAllPagesFromVendasRelatorioVendas(dataInicio, dataFim, loja) {
    const pageResponse = await VendasRequests.obterDadosRelatorioGeralDeVendas(
      this.TINYSESSID,
      dataInicio,
      dataFim,
      loja
    );

    const maxPage = pageResponse.response[0].val.pacotes.vendas;
    const vendas = [];

    for (let i = 0; i < maxPage; i++) {
      const vendasResponse = await this.getPageFromVendasRelatorioVendas(
        i,
        maxPage
      );
      if (vendasResponse.length == 0) return vendas;

      vendas.push(...vendasResponse);
    }

    return vendas;
  }

  /**
   * @private
   * @param {number} page
   * @param {number} maxPage
   */
  async getPageFromVendasRelatorioVendas(page, maxPage) {
    const { response } = await VendasRequests.vendaRelatorioVendas(
      this.TINYSESSID,
      page,
      maxPage
    );

    return response[0].val;
  }
}
