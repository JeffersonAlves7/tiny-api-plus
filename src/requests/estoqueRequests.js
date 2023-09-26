// @ts-check

/**
 * Classe para fazer requisições relacionadas ao estoque.
 * @class
 */
export class EstoqueRequests {
  /**
   * Obtém o relatório de estoque para um dia específico ou a quantidade páginas.
   * @param {string} dia - A data no formato "dd/mm/yyyy".
   * @param {string} TINYSESSID - O TINYSESSID da sessão.
   * @returns {Promise<any>} - A resposta da requisição.
   */
  static async relatorioEstoqueDoDia(dia, TINYSESSID) {
    const payload = {
      type: "1",
      func: "obterDadosRelatorioSaldos",
      duplicidade: "0",
      args: `[{"data":"${dia}","slot_tags":[],"idFornecedor":"0","idDeposito":"0","ignorarParametroDesconsiderarSaldo":false,"filtroEstoque":"T","idCategoria":"","slot_variacoes":[],"exibirProdutosSobEncomenda":false,"exibirEstoqueDisponivel":false,"filtroAgrupar":"0"}]`,
    };

    const config = {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        Cookie: `TINYSESSID=${TINYSESSID};`,
        "X-Custom-Request-For": "XAJAX",
      },
      body: new URLSearchParams(payload).toString(),
    };

    const response = await fetch(
      "https://erp.tiny.com.br/services/estoque.relatorios.server.php",
      config
    );

    return await response.json();
  }

  /**
   * Obtém o relatório de estoque para um dia específico.
   * @param {number} page - A página atual".
   * @param {number} maxPages - A página máxima".
   * @param {string} TINYSESSID - O TINYSESSID da sessão.
   * @returns {Promise<any>} - A resposta da requisição.
   */
  static async obterPacoteRelatorioSaldos(page, maxPages, TINYSESSID) {
    const payload = {
      type: "1",
      func: "obterDadosRelatorioSaldos",
      duplicidade: "0",
      args: `[${page}, ${maxPages}]`,
    };

    const config = {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        Cookie: `TINYSESSID=${TINYSESSID};`,
        "X-Custom-Request-For": "XAJAX",
      },
      body: new URLSearchParams(payload).toString(),
    };

    const response = await fetch(
      "https://erp.tiny.com.br/services/estoque.relatorios.server.php",
      config
    );

    return await response.json();
  }

  /**
   * Obtém o relatório de saídas e entradas de estoque em um período específico.
   * @param {string} diaInicio - A data de início no formato "dd/mm/yyyy".
   * @param {string} diaFim - A data de fim no formato "dd/mm/yyyy".
   * @param {string} TINYSESSID - O TINYSESSID da sessão.
   * @returns {Promise<any>} - A resposta da requisição.
   */
  static async relatorioSaidasEntradas(diaInicio, diaFim, TINYSESSID) {
    const payload = {
      type: "1",
      func: "obterDadosRelatorioEntradasSaidas",
      duplicidade: "0",
      args: `["${diaInicio}","${diaFim}","",false,null,"","","N"]`,
    };

    const config = {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        Cookie: `TINYSESSID=${TINYSESSID};`,
        "X-Custom-Request-For": "XAJAX",
      },
      body: new URLSearchParams(payload).toString(),
    };

    const response = await fetch(
      "https://erp.tiny.com.br/services/estoque.relatorios.server.php",
      config
    );

    return await response.json();
  }
}
