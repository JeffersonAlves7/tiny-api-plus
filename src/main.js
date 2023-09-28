// @ts-check

import { EstoqueManager } from "./managers/estoqueManager.js";
import { VendasManager } from "./managers/vendasManager.js";
import {
  formatCustomDate,
  getFirstAndLastDayOfPeriod,
} from "./utils/dateUtils.js";
import { getEnv } from "./utils/envUtils.js";
import fs from "fs";
import { numberOfFetchs, removeFetches } from "./utils/fetchUtils.js";
import { UserManager } from "./managers/userManager.js";

// Create a AppManager to manage all the application
/**
 * @class
 */
class AppManager {
  /**
   * @param {UserManager} userLojaMatriz
   * @param {UserManager} userLojaFilial 
   */
  constructor(userLojaMatriz, userLojaFilial) {
    /**
     * @private
     */
    this.userLojaMatriz = userLojaMatriz;
    this.userLojaFilial = userLojaFilial;
  }

  /**
   * Login in the tiny application
   * @param {boolean} saveTINYSESSID - If it should save the TINYSESSID in the database
   */
  async login(saveTINYSESSID = true) {
    if(saveTINYSESSID){
      await this.userLojaMatriz.loadTINYSESSID();
      await this.userLojaFilial.loadTINYSESSID();
    } 

    await this.userLojaMatriz.login();
    await this.userLojaFilial.login();
  }

  /**
   *
   * @param {number} period - Período em meses.
   * @returns
   */
  async getProductData(period) {
    const estoqueMatrizManager = new EstoqueManager(this.userLojaMatriz.getTINYSESSID());

    const produtos =
      await estoqueMatrizManager.getAllPagesFromObterPacoteDadosImpressao();

    const produtosEstoqueLojaMatriz =
      await estoqueMatrizManager.getAllPagesFromObterPacoteDadosImpressaoEstoque(
        "Loja 1"
      );

    const produtosEstoqueDepositoMatriz =
      await estoqueMatrizManager.getAllPagesFromObterPacoteDadosImpressaoEstoque(
        "Matriz"
      );

    const produtosEstoqueMultiempresa =
      await estoqueMatrizManager.getAllPagesFromEstoqueProdutosMultiEmpresa(
        produtos.map((produto) => produto.id)
      );

    const vendasLojaMatriz = await this.getSalesPerPeriod(period, this.userLojaMatriz);
    const vendasLojaFilial = await this.getSalesPerPeriod(period, this.userLojaFilial);

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

      const vendaLojaMatriz = vendasLojaMatriz.find(
        (venda) => venda.codigo === produto.codigo
      );

      const vendaLojaFilial = vendasLojaFilial.find(
        (venda) => venda.codigo === produto.codigo
      );

      const { estoque, ...allData } = {
        ...produto,
        ...(produtoEstoqueDepositoMatriz ?? {}),
        ...(produtoEstoqueLojaMatriz ?? {}),
        estoqueLojaMatriz: produtoEstoqueLojaMatriz?.estoque,
        estoqueDepositoMatriz: produtoEstoqueDepositoMatriz?.estoque,
        estoqueLojaFilial: `${produtoEstoqueMultiempresa?.estoque["628666680"].totalDisponivel}`,
        vendaLojaMatriz: vendaLojaMatriz?.quantidade ?? 0,
        vendaLojaFilial: vendaLojaFilial?.quantidade ?? 0,
      };

      return allData;
    });
  }

  /**
   * Retorna as vendas dentro de um periodo em meses
   * @param {number} periodo - Período em meses.
   * @param {UserManager} user
   */
  async getSalesPerPeriod(periodo, user) {
    const vendasManager = new VendasManager(user.getTINYSESSID());

    const dataPeloPeriodo = getFirstAndLastDayOfPeriod(periodo);
    const dataInicio = formatCustomDate(dataPeloPeriodo[0], "yyyy-MM-dd");
    const dataFim = formatCustomDate(dataPeloPeriodo[1], "yyyy-MM-dd");

    const vendas = await vendasManager.getAllPagesFromVendasRelatorioVendas(
      dataInicio,
      dataFim,
      user.nomeLoja
    );

    return vendas;
  }

  /**
   *
   * @param {string} diaInicio - dd/MM/yyyy
   * @param {string} diaFim - dd/MM/yyyy
   * @param {UserManager} user - dd/MM/yyyy
   * @returns
   */
  async getEstoquePorDiaPorPeriodo(diaInicio, diaFim, user) {
    const estoqueManager = new EstoqueManager(user.getTINYSESSID());

    const estoqueDoDiaLoja1 =
      await estoqueManager.getRelatorioSaldosPorDiaComEstoqueZeradoPerPeriod(
        diaInicio,
        diaFim,
        "Loja 1"
      );

    // const estoqueDoDiaLoja2 =
    //   await estoqueManager.getRelatorioSaldosPorDiaComEstoqueZeradoPerPeriod(
    //     diaInicio,
    //     diaFim,
    //     "Loja 1"
    //   );

    return {
      loja1: estoqueDoDiaLoja1,
      loja2: null,
    };
  }
}

async function main() {
  // get date when the script started
  const startDate = new Date();
  console.log(startDate);

  const emailUser1 = getEnv("USER1_EMAIL");
  const passwordUser1 = getEnv("USER1_PASSWORD");

  const emailUser2 = getEnv("USER2_EMAIL");
  const passwordUser2 = getEnv("USER2_PASSWORD");

  const User1 = new UserManager(emailUser1, passwordUser1, 'matriz');
  const User2 = new UserManager(emailUser2, passwordUser2, 'filial');

  removeFetches();

  // Get the product id, descricao, marca
  const appManager = new AppManager(User1, User2);

  await appManager.login(false);

  const produtos = await appManager.getProductData(1);

  fs.writeFileSync("produtos.json", JSON.stringify(produtos, null, 2));

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
