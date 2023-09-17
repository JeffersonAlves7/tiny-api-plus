"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EstoqueRequests = void 0;
const qs_1 = __importDefault(require("qs"));
const axios_1 = __importDefault(require("axios"));
class EstoqueRequests {
    /**
     *
     * @param dia dd/mm/yyyy
     */
    static async relatorioEstoqueDoDia(dia, TINYSESSID) {
        let data = qs_1.default.stringify({
            type: "1",
            func: "obterDadosRelatorioSaldos",
            argsLength: "244",
            timeInicio: "1694884762880",
            versaoFront: "3.55.15",
            location: "https://erp.tiny.com.br/relatorio_estoque_saldos",
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
        return axios_1.default.request(config);
    }
}
exports.EstoqueRequests = EstoqueRequests;
