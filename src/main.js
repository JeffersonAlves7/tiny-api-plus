// @ts-check

import { AuthManager } from "./managers/authManager.js";
import { EstoqueManager } from "./managers/estoqueManager.js";
import { VendasManager } from "./managers/vendasManager.js";
import { formatCustomDate, getFirstAndLastDayOfPeriod } from "./utils/dateUtils.js";
import { getEnv } from "./utils/envUtils.js";
import fs from "fs";

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

    const produtosEstoque =
      await estoqueManager.getAllPagesFromObterPacoteDadosImpressaoEstoque("0");

    const produtosEstoqueMultiempresa =
      await estoqueManager.getAllPagesFromEstoqueProdutosMultiEmpresa(
        produtos.map((produto) => produto.id)
      );

    // Combinar campos dos produtos da matriz e da loja 1 com os protudos da variavel produtos
    return produtos.map((produto, index) => {
      let produtoEstoque =
        produtosEstoque[index].id == produto.id
          ? produtosEstoque[index]
          : produtosEstoque.find((v) => v.id === produto.id);

      let produtoEstoqueMultiempresa =
        produtosEstoqueMultiempresa[index].id == produto.id
          ? produtosEstoqueMultiempresa[index]
          : produtosEstoqueMultiempresa.find((v) => v.id === produto.id);

      const { estoque, ...allData } = {
        ...produto,
        ...(produtoEstoque ?? {}),
      };

      return { ...allData, estoque: produtoEstoqueMultiempresa?.estoque };
    });
  }

  /**
   * Retorna as vendas dentro de um periodo em meses
   * @param {number} periodo - Período em meses.
   */
  async getVendasPerPeriod(periodo) {
    const vendasManager = new VendasManager(this.authManager.getTINYSESSID());

    const dataPeloPeriodo = getFirstAndLastDayOfPeriod(periodo);
    const dataInicio = formatCustomDate(dataPeloPeriodo[0], 'yyyy-MM-dd');
    const dataFim = formatCustomDate(dataPeloPeriodo[1], "yyyy-MM-dd");

    const vendas = await vendasManager.getAllPagesFromVendasRelatorioVendas(dataInicio, dataFim);

    return vendas;
  }
}

async function main() {
  // Get the product id, descricao, marca
  const authManager = new AuthManager();
  const appManager = new AppManager(authManager);

  await appManager.login();

  // Coletar vendas por um período
  const vendas = appManager.getVendasPerPeriod(1);
  fs.writeFileSync("vendas.json", JSON.stringify(vendas, null, 2));

  // const produtos = await appManager.getProductData();
  // fs.writeFileSync("produtos.json", JSON.stringify(produtos, null, 2));

  // const estoqueManager = new EstoqueManager(authManager.getTINYSESSID());
  // const produtosPagina1 = await estoqueManager.getPageFromObterPacoteDadosImpressao(0);
  // const produtosEstoque = await estoqueManager.getAllPagesFromEstoqueProdutosMultiEmpresa(produtosPagina1.map((produto) => produto.id));

  // console.log({produtosEstoque})
}
main();
