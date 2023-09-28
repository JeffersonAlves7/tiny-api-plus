// @ts-check

import { increaseFetch } from "../utils/fetchUtils.js";

/**
 * Classe para fazer requisições relacionadas às vendas.
 * @class
 */
export class VendasRequests {
  /**
   *
   * @param {string} TINYSESSID
   * @param {number} page
   * @param {number} maxPage
   */
  static async vendaRelatorioVendas(TINYSESSID, page, maxPage) {
    var myHeaders = new Headers();

    myHeaders.append(
      "content-type",
      "application/x-www-form-urlencoded; charset=UTF-8"
    );
    myHeaders.append("cookie", `TINYSESSID=${TINYSESSID};`);
    myHeaders.append("x-custom-request-for", "XAJAX");

    var urlencoded = new URLSearchParams();
    urlencoded.append("type", "2");
    urlencoded.append("func[clss]", "Venda\\RelatorioVendas");
    urlencoded.append("func[metd]", "obterPacote");
    urlencoded.append("args", `[${page},${maxPage},"n",1]`);

    increaseFetch();
    // do the fetch and return response
    const response = await fetch(
      "https://erp.tiny.com.br/services/vendas.relatorios.server.php",
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
   * @param {string} dataInicio - Formato: YYYY-MM-DD
   * @param {string} dataFim - Formato: YYYY-MM-DD
   * @param {'matriz' | 'filial'} loja
   */
  static async obterDadosRelatorioGeralDeVendas(
    TINYSESSID,
    dataInicio,
    dataFim,
    loja
  ) {
    let operacoes = loja == 'matriz' ? '"628626110","713393608","497662225","x"' : '"664223454","631680758","x"'

    var myHeaders = new Headers();

    myHeaders.append(
      "content-type",
      "application/x-www-form-urlencoded; charset=UTF-8"
    );
    myHeaders.append("cookie", `TINYSESSID=${TINYSESSID};`);
    myHeaders.append("x-custom-request-for", "XAJAX");

    var raw = `type=1&func=obterDadosRelatorioGeralDeVendas&argsLength=494&timeInicio=1695774610895&versaoFront=3.55.22&location=https://erp.tiny.com.br/relatorio_vendas&duplicidade=0&args=[{"origemDados":"N","agrupamento":"p","subAgrupamento":"n","exibirDevolucoes":"N","ordem":"n","dataIni":"${dataInicio}","dataFim":"${dataFim}","tipoPeriodo":"i","mostrarFrete":"S","idContato":"0","idProduto":"0","idVendedor":"","idMunicipio":"","uf":"+","idTag":"0","idMarcador":"0","idEcommerce":"-1","idCanalVendaEstatico":"-1","tipoLucro":"N","tipoCusto":"M","idCategoria":"","idsSituacoes":["2"],"idsVariacoes":[],"operacoes":[${operacoes}],"camposParaExibir":null}]`;

    increaseFetch();
    const response = await fetch(
      "https://erp.tiny.com.br/services/vendas.relatorios.server.php",
      {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow",
      }
    );

    return response.json();
  }
}
