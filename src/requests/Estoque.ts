import qs from "qs";
import axios from "axios";

export class EstoqueRequests {
  /**
   *
   * @param dia dd/mm/yyyy
   */
  static async relatorioEstoqueDoDia(dia: string, TINYSESSID: string) {
    let data = qs.stringify({
      type: "1",
      func: "obterDadosRelatorioSaldos",
      duplicidade: "0",
      args: `[{"data":"${dia}","slot_tags":[],"idFornecedor":"0","ignorarParametroDesconsiderarSaldo":false,"filtroEstoque":"T","idCategoria":"","slot_variacoes":[],"exibirProdutosSobEncomenda":false,"exibirEstoqueDisponivel":false,"filtroAgrupar":"0"}]`,
    });

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://erp.tiny.com.br/services/estoque.relatorios.server.php",
      headers: {
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        cookie: `TINYSESSID=${TINYSESSID};`,
        "x-custom-request-for": "XAJAX",
      },
      data: data,
    };

    return axios.request(config);
  }

  /**
   *
   * @param diaInicio dd/mm/yyyy
   * @param dataFim dd/mm/yyyy
   */
  static async relatorioSaidasEntradas(
    diaInicio: string,
    diaFim: string,
    TINYSESSID: string
  ) {
    let data = qs.stringify({
      type: "1",
      func: "obterDadosRelatorioEntradasSaidas",
      duplicidade: "0",
      args: `["${diaInicio}","${diaFim}","",false,null,"","","N"]`,
    });

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://erp.tiny.com.br/services/estoque.relatorios.server.php",
      headers: {
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        cookie: `TINYSESSID=${TINYSESSID};`,
        "x-custom-request-for": "XAJAX",
      },
      data: data,
    };

    return axios.request(config);
  }
}
