// @ts-check

import { increaseFetch } from "../utils/fetchUtils.js";

/**
 * Classe para fazer requisições relacionadas ao estoque.
 * @class
 */
export class EstoqueRequests {
  /**
   * Obtém o relatório dos produtos com dados atuais.
   * @param {string} TINYSESSID - O TINYSESSID da sessão.
   * @param {number} page - O TINYSESSID da sessão.
   * @returns {Promise<any>} - A resposta da requisição.
   */
  static async obterPacoteDadosImpressao(TINYSESSID, page) {
    var myHeaders = new Headers();
    myHeaders.append(
      "content-type",
      "application/x-www-form-urlencoded; charset=UTF-8"
    );
    myHeaders.append("cookie", `TINYSESSID=${TINYSESSID};`);
    myHeaders.append("x-custom-request-for", "XAJAX");

    var urlencoded = new URLSearchParams();
    urlencoded.append("type", "1");
    urlencoded.append("func", "obterPacoteDadosImpressao");
    urlencoded.append(
      "args",
      `[{"criterio":"opc-ativo","pesquisa":"","idTag":"0","pagina":${page},"tipo":"","tipoCadastroProduto":"P","classeProduto":"","codigoProduto":"","idCategoria":"0","tipoOrdenacao":"","idEcommerce":"-1","parametroImpressao":"N","idFornecedorFiltro":"0","dataAtualizacaoKitPsq":"","dataAtualizacaoProdutoPsq":""}]`
    );

    increaseFetch();
    const response = await fetch(
      "https://erp.tiny.com.br/services/produtos.server.php",
      {
        method: "POST",
        headers: myHeaders,
        body: urlencoded,
        redirect: "follow",
      }
    );

    return response.json();
  }

  /**
   *
   * @param {string} TINYSESSID
   * @param {number} page
   * @param {string} estoqueId
   */
  static async obterPacoteDadosImpressaoEstoque(TINYSESSID, page, estoqueId) {
    var myHeaders = new Headers();
    myHeaders.append(
      "content-type",
      "application/x-www-form-urlencoded; charset=UTF-8"
    );
    myHeaders.append("cookie", `TINYSESSID=${TINYSESSID};`);
    myHeaders.append("x-custom-request-for", "XAJAX");

    var urlencoded = new URLSearchParams();
    urlencoded.append("type", "1");
    urlencoded.append("func", "obterPacoteDadosImpressaoEstoque");
    urlencoded.append(
      "args",
      `[${page},{"idTag":"0","pesquisa":"","campoPesquisa":"","idCategoria":"","idFornecedorFiltro":"0","idDeposito":"${estoqueId}","classeProduto":"","idsVariacoes":"","agruparEstoqueMultiEmp":"false","iframe-page":"1"}]`
    );

    increaseFetch();
    const response = await fetch(
      "https://erp.tiny.com.br/services/estoques.server.php",
      {
        method: "POST",
        headers: myHeaders,
        body: urlencoded,
        redirect: "follow",
      }
    );

    return response.json();
  }

  /**
   *
   * @param {string} TINYSESSID
   * @param {string[]} productsIds
   */
  static async carregarLoteEstoqueProdutosMultiEmpresa(
    TINYSESSID,
    productsIds
  ) {
    var myHeaders = new Headers();
    myHeaders.append(
      "content-type",
      "application/x-www-form-urlencoded; charset=UTF-8"
    );
    myHeaders.append("cookie", `TINYSESSID=${TINYSESSID};`);
    myHeaders.append("x-custom-request-for", "XAJAX");

    var urlencoded = new URLSearchParams();
    urlencoded.append("type", "1");
    urlencoded.append("func", "carregarLoteEstoqueProdutosMultiEmpresa");
    urlencoded.append(
      "args",
      `[[${productsIds.map((id) => `"${id}"`).join(",")}],"0","F"]`
    );

    increaseFetch();
    const response = await fetch(
      "https://erp.tiny.com.br/services/estoque.relatorios.server.php",
      {
        method: "POST",
        headers: myHeaders,
        body: urlencoded,
        redirect: "follow",
      }
    );

    try {
      return response.json();
    } catch (e) {
      console.log(await response.text(), null, 2);
      throw e;
    }
  }


  /**
   * @typedef {Object} RelatorioSaldosArgs
   * @property {string} data - dd/MM/yyyy
   * @property {string} idDeposito
   * @property { 'Z' | 'T' | 'D' } filtroEstoque - D = Saldo Positivo, T = Todos, Z = Zerado
   */

  /**
   * @param {string} TINYSESSID
   * @param {RelatorioSaldosArgs} args - dd/MM/yyyy
   * @returns
   */
  static async obterDadosRelatorioSaldos(TINYSESSID, args) {
    var myHeaders = new Headers();
    myHeaders.append("x-custom-request-for", "XAJAX");
    myHeaders.append("Cookie", `TINYSESSID=${TINYSESSID};`);
    myHeaders.append(
      "content-type",
      "application/x-www-form-urlencoded; charset=UTF-8"
    );

    var urlencoded = new URLSearchParams();
    urlencoded.append("type", "1");
    urlencoded.append("func", "obterDadosRelatorioSaldos");
    urlencoded.append(
      "args",
      `[{"data":"${args.data}","slot_tags":[],"idFornecedor":"0","idDeposito":"${args.idDeposito}","ignorarParametroDesconsiderarSaldo":false,"filtroEstoque":"${args.filtroEstoque}","idCategoria":"","slot_variacoes":[],"exibirProdutosSobEncomenda":false,"exibirEstoqueDisponivel":false,"filtroAgrupar":"0"}]`
    );
    urlencoded.append("duplicidade", "0");

    increaseFetch();
    const response = await fetch(
      "https://erp.tiny.com.br/services/estoque.relatorios.server.php",
      {
        method: "POST",
        headers: myHeaders,
        body: urlencoded,
        redirect: "follow",
      }
    );

    try{
      return response.json();
    }
    catch(e){
      console.log(await response.text())
      throw e
    }
  }

  /**
   *
   * @param {string} TINYSESSID
   * @param {number} page
   * @param {number} maxPage
   * @returns
   */
  static async obterPacoteDadosRelatorioSaldos(TINYSESSID, page, maxPage) {
    var myHeaders = new Headers();
    myHeaders.append("x-custom-request-for", "XAJAX");
    myHeaders.append("Cookie", `TINYSESSID=${TINYSESSID};`);
    myHeaders.append(
      "content-type",
      "application/x-www-form-urlencoded; charset=UTF-8"
    );

    var urlencoded = new URLSearchParams();
    urlencoded.append("type", "1");
    urlencoded.append("func", "obterPacoteDadosRelatorioSaldos");
    urlencoded.append("args", `[${page}, ${maxPage}]`);
    urlencoded.append("duplicidade", "0");

    increaseFetch();
    const response = await fetch(
      "https://erp.tiny.com.br/services/estoque.relatorios.server.php",
      {
        method: "POST",
        headers: myHeaders,
        body: urlencoded,
        redirect: "follow",
      }
    );

    return response.json();
  }
}
