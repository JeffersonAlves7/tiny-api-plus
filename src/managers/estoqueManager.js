//@ts-check

import { EstoqueRequests } from "../requests/estoqueRequests.js";
import { formatarData } from "../utils/dateUtils.js";

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
   * Obtém o relatório de estoque para um dia específico.
   * @param {string} dia - A data no formato "dd/mm/yyyy".
   */
  async obterEstoqueDoDia(dia) {
    const data = await EstoqueRequests.relatorioEstoqueDoDia(
      dia,
      this.TINYSESSID
    );

    return { registros: data.response[0].val.registros, dia };
  }

  /**
   * Obtém o relatório de estoque para um periodo em dias.
   * @param {number} periodo - O periodo em quantidade de dias.
   */
  async obterEstoquesPorPeriodo(periodo) {
    const estoques = [];

    const hoje = new Date();
    for (let i = 0; i < periodo; i++) {
      const data = formatarData(hoje);
      const estoqueDoDia = await this.obterEstoqueDoDia(data);
      estoques.push(estoqueDoDia);

      // Subtrai um dia da data atual para obter a data do dia anterior
      hoje.setDate(hoje.getDate() - 1);
    }

    return estoques;
  }

  /**
   * Obtém o relatório de saidas e entradas do estoque para um periodo com inicio e fim.
   * @param {string} diaInicio - A data no formato "dd/mm/yyyy".
   * @param {string} diaFim - A data no formato "dd/mm/yyyy".
   */
  async obterRelatorioSaidasEntradas(diaInicio, diaFim) {
    const data = await EstoqueRequests.relatorioSaidasEntradas(
      diaInicio,
      diaFim,
      this.TINYSESSID
    );

    return { registros: data.response[0].val.registros };
  }

  /**
   * Obtém o relatório de giro considerando estoque para um periodo em meses.
   * @param {1 | 2 | 3} periodoEmMeses - A data no formato "dd/mm/yyyy".
   */
  async obterGiroConsiderandoEstoque(periodoEmMeses) {
    const hoje = new Date();
    const ultimoDiaMesAtual = new Date(
      hoje.getFullYear(),
      hoje.getMonth() + 1,
      0
    );

    // Calcular o primeiro dia do primeiro mês do período
    const primeiroDiaPeriodo = new Date(hoje);
    primeiroDiaPeriodo.setDate(1);
    primeiroDiaPeriodo.setMonth(hoje.getMonth() - (periodoEmMeses - 1));

    // Obter a quantidade de dias no período
    const quantidadeDias =
      Math.ceil(
        (hoje.valueOf() - primeiroDiaPeriodo.valueOf()) / (1000 * 60 * 60 * 24)
      ) + 1;

    // Agora você pode usar a quantidade de dias para obter o estoque
    const estoquesPorPeriodo = await this.obterEstoquesPorPeriodo(
      quantidadeDias
    );

    // Para a data de início e data fim do relatório de saídas/entradas
    const dataInicio = formatarData(primeiroDiaPeriodo);
    const dataFim = formatarData(ultimoDiaMesAtual);

    const relatorioSaidasEntradas = await this.obterRelatorioSaidasEntradas(
      dataInicio,
      dataFim
    );

    // Agora você tem os estoques por período e o relatório de saídas/entradas para o período
    // Faça o que for necessário com esses dados
    const relatorioPorItem = Object.values(
      relatorioSaidasEntradas.registros
    ).map((item) => {
      const diasNoEstoque = estoquesPorPeriodo.filter(
        (v) =>
          v.registros.find((i) => i.idProduto == item.idProduto).quantidade > 0
      ).length;

      return {
        idProduto: item.idProduto,
        codigo: item.codigo,
        nome: item.nome,
        diasNoEstoque,
        estoqueSaida: item.estoqueSaida,
        giro: item.estoqueSaida / diasNoEstoque,
      };
    });

    console.log({ relatorioPorItem });

    return relatorioPorItem;
  }

  // get all pages from obterPacoteDadosImpressao, the last page will return a empty array
  async getAllPagesFromObterPacoteDadosImpressao() {
    const products = [];

    for (let i = 0; true; i++) {
      const produtosResponse = await EstoqueRequests.obterPacoteDadosImpressao(
        this.TINYSESSID,
        i
      );

      const searchValue = /retornoPacote\((.*)\)/g.exec(
        produtosResponse.response[0].src
      );

      if (searchValue) {
        const productsValue = JSON.parse(searchValue[1]);
        if (productsValue.length == 0) return products;

        products.push(...productsValue)
      }
    }
  }

  /**
   *
   * @param {number} page
   * @returns
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
      if (productsValue.length < 0) return productsValue;

      return productsValue;
    }
  }
}
