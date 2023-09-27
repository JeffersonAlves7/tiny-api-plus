// @ts-check

import { AuthManager } from "./managers/authManager.js";
import { EstoqueManager } from "./managers/estoqueManager.js";
import { VendasManager } from "./managers/vendasManager.js";
import {
  formatCustomDate,
  getFirstAndLastDayOfPeriod,
} from "./utils/dateUtils.js";
import { getEnv } from "./utils/envUtils.js";
import fs from "fs";
import { numberOfFetchs, removeFetches } from "./utils/fetchUtils.js";

// Create a AppManager to manage all the application
/**
 * @class
 */
class AppManager {
  /**
   *
   * @param {AuthManager} authManager
   */
  constructor(authManager) {
    /**
     * @private
     */
    this.authManager = authManager;
  }

  /**
   * Login in the tiny application
   */
  async login() {
    await this.authManager.loadTINYSESSIDFromDatabase();
    await this.authManager.login(getEnv("USER_EMAIL"), getEnv("USER_PASSWORD"));
  }

  async getProductData() {
    const estoqueManager = new EstoqueManager(this.authManager.getTINYSESSID());

    const produtos =
      await estoqueManager.getAllPagesFromObterPacoteDadosImpressao();

    const produtosEstoqueLojaMatriz =
      await estoqueManager.getAllPagesFromObterPacoteDadosImpressaoEstoque(
        "Loja 1"
      );

    const produtosEstoqueDepositoMatriz =
      await estoqueManager.getAllPagesFromObterPacoteDadosImpressaoEstoque(
        "Matriz"
      );

    const produtosEstoqueMultiempresa =
      await estoqueManager.getAllPagesFromEstoqueProdutosMultiEmpresa(
        produtos.map((produto) => produto.id)
      );

    // Combinar campos dos produtos da matriz e da loja 1 com os protudos da variavel produtos
    return produtos.map((produto, index) => {
      let produtoEstoqueLojaMatriz =
        produtosEstoqueLojaMatriz[index].id == produto.id
          ? produtosEstoqueLojaMatriz[index]
          : produtosEstoqueLojaMatriz.find((v) => v.id === produto.id);

      let produtoEstoqueDepositoMatriz =
        produtosEstoqueDepositoMatriz[index].id == produto.id
          ? produtosEstoqueDepositoMatriz[index]
          : produtosEstoqueDepositoMatriz.find((v) => v.id === produto.id);

      let produtoEstoqueMultiempresa =
        produtosEstoqueMultiempresa[index].id == produto.id
          ? produtosEstoqueMultiempresa[index]
          : produtosEstoqueMultiempresa.find((v) => v.id === produto.id);

      const { estoque, ...allData } = {
        ...produto,
        ...(produtoEstoqueDepositoMatriz ?? {}),
        ...(produtoEstoqueLojaMatriz ?? {}),
        estoqueLojaMatriz: produtoEstoqueLojaMatriz?.estoque,
        estoqueDepositoMatriz: produtoEstoqueDepositoMatriz?.estoque,
        estoqueLojaFilial: `${produtoEstoqueMultiempresa?.estoque["628666680"].totalDisponivel}`,
      };

      return allData;
    });
  }

  /**
   * Retorna as vendas dentro de um periodo em meses
   * @param {number} periodo - Período em meses.
   */
  async getSalesPerPeriod(periodo) {
    const vendasManager = new VendasManager(this.authManager.getTINYSESSID());

    const dataPeloPeriodo = getFirstAndLastDayOfPeriod(periodo);
    const dataInicio = formatCustomDate(dataPeloPeriodo[0], "yyyy-MM-dd");
    const dataFim = formatCustomDate(dataPeloPeriodo[1], "yyyy-MM-dd");

    const vendas = await vendasManager.getAllPagesFromVendasRelatorioVendas(
      dataInicio,
      dataFim
    );

    return vendas;
  }

  /**
   *
   * @param {number} period - Período em meses.
   * @returns
   */
  async getProductDataWithSales(period) {
    const vendas = await this.getSalesPerPeriod(period);
    const produtos = await this.getProductData();

    return produtos.map((produto) => {
      const venda = vendas.find((venda) => venda.codigo === produto.codigo);

      return {
        ...produto,
        vendaLojaMatriz: venda?.quantidade ?? 0,
      };
    });
  }
}

async function main() {
  // get date when the script started
  const startDate = new Date();

  removeFetches();

  // Get the product id, descricao, marca
  const authManager = new AuthManager();
  const appManager = new AppManager(authManager);

  await appManager.login();

  const estoqueManager = new EstoqueManager(authManager.getTINYSESSID());

  const estoqueDoDiaLoja1 =
    await estoqueManager.getRelatorioSaldosPorDiaComEstoqueZeradoPerPeriod(
      "27/08/2023",
      "27/09/2023",
      "Loja 1"
    );

  fs.writeFileSync(
    "produtosDia-1-7-2021.json",
    JSON.stringify(estoqueDoDiaLoja1, null, 2)
  );

  // const produtos = await appManager.getProductDataWithSales(3);
  // fs.writeFileSync("produtos.json", JSON.stringify(produtos, null, 2));

  const fetches = await numberOfFetchs();
  console.log({ fetches });

  // get date when script ended
  const endDate = new Date();

  // calculate the time difference in seconds
  const timeDiff = (endDate.getTime() - startDate.getTime()) / 1000;

  // calculate the time difference in minutes
  const timeDiffInMinutes = timeDiff / 60;

  // calculate the time difference in hours
  const timeDiffInHours = timeDiffInMinutes / 60;

  // print time difference in seconds
  console.log(`Time taken to execute the script: ${timeDiff} seconds`);
  console.log(`Time taken to execute the script: ${timeDiffInMinutes} minutes`);
  // log the time taken to execute the script in hours
  console.log(`Time taken to execute the script: ${timeDiffInHours} hours`);

  process.exit(0);
}
main();
