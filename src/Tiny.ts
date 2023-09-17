import { AuthRequests } from "./requests/Auth";
import { EstoqueRequests } from "./requests/Estoque";
import sqlite3 from "sqlite3";
import { format } from "date-fns";
import writeJsonFile from "./utils/writeJsonFile";

export class Tiny {
  TINYSESSID: string = "";

  constructor(public userEmail: string, public userPassword: string) {}

  async loadTINYSESSIDFromDatabase() {
    return new Promise((resolve) => {
      const db = new sqlite3.Database("temp/tiny.db");

      db.serialize(() => {
        db.get(
          "SELECT TINYSESSID FROM session ORDER BY rowid DESC LIMIT 1",
          (err, row: any) => {
            if (!err && row) {
              this.TINYSESSID = row.TINYSESSID;
            }
            resolve(true);
          }
        );
      });

      db.close();
    });
  }

  private async saveTINYSESSIDToDatabase() {
    const db = new sqlite3.Database("temp/tiny.db");

    db.serialize(() => {
      db.run("CREATE TABLE IF NOT EXISTS session (TINYSESSID TEXT)");
      const stmt = db.prepare("INSERT INTO session VALUES (?)");
      stmt.run(this.TINYSESSID);
      stmt.finalize();
    });

    db.close();
  }

  async login() {
    try {
      if (this.TINYSESSID) {
        const isAuth = await AuthRequests.verifyTINYSESSID(this.TINYSESSID);
        console.log({ isAuth });
        if (isAuth) return;
      }

      const email = this.userEmail;
      const password = this.userPassword;

      const response = await AuthRequests.initLogin({ email, password });

      // This cookie is temporary, after finish login that will be invalid.
      let regexExec: any = /TINYSESSID=(?<TINYSESSID>.+?);/g.exec(
        (response.headers["set-cookie"] as string[]).find((v) =>
          v.includes("TINYSESSID")
        ) as string
      );
      const TINYSESSID_TEMP = regexExec.groups["TINYSESSID"];

      const { idUsuario, uidLogin } = response.data.response[0].val;

      const finalizeResponse = await AuthRequests.finishLogin({
        uidLogin,
        idUsuario,
        TINYSESSID: TINYSESSID_TEMP,
      });

      // Here I catch the final TINYSESSID
      regexExec = /TINYSESSID=(?<TINYSESSID>.+?);/g.exec(
        (finalizeResponse.headers["set-cookie"] as string[]).find((v) =>
          v.includes("TINYSESSID")
        ) as string
      );
      this.TINYSESSID = regexExec.groups["TINYSESSID"];

      this.saveTINYSESSIDToDatabase();

      return this.TINYSESSID;
    } catch (e) {
      console.error(e);
    }
  }

  /**
   *
   * @param dia dd/mm/yyyy
   */
  async obterEstoqueDoDia(
    dia: string
  ): Promise<{ registros: any; dia: string }> {
    const response = await EstoqueRequests.relatorioEstoqueDoDia(
      dia,
      this.TINYSESSID
    );

    const { data } = response;
    return { registros: data.response[0].val.registros, dia };
  }

  async obterEstoquesPorPeriodo(periodo: number): Promise<any[]> {
    const estoques = [];

    const hoje = new Date();
    for (let i = 0; i < periodo; i++) {
      const data = format(hoje, "dd/MM/yyyy");
      const estoqueDoDia = await this.obterEstoqueDoDia(data);
      estoques.push(estoqueDoDia);

      // Subtrai um dia da data atual para obter a data do dia anterior
      hoje.setDate(hoje.getDate() - 1);
    }

    return estoques;
  }

  async obterRelatorioSaidasEntradas(diaInicio: string, diaFim: string) {
    const response = await EstoqueRequests.relatorioSaidasEntradas(
      diaInicio,
      diaFim,
      this.TINYSESSID
    );

    const { data } = response;
    return { registros: data.response[0].val.registros };
  }

  /**
   *
   * @param periodoEmMeses Para filtrar de 1 a 3 meses
   */
  async obterGiroConsiderandoEstoque(periodoEmMeses: 1 | 2 | 3) {
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
    const dataInicio = `${format(primeiroDiaPeriodo, "dd/MM/yyyy")}`;
    const dataFim = `${format(ultimoDiaMesAtual, "dd/MM/yyyy")}`;

    const relatorioSaidasEntradas = await this.obterRelatorioSaidasEntradas(
      dataInicio,
      dataFim
    );

    // Agora você tem os estoques por período e o relatório de saídas/entradas para o período
    // Faça o que for necessário com esses dados
    const relatorioPorItem = Object.values(
      relatorioSaidasEntradas.registros
    ).map((item: any) => {
      const diasNoEstoque = estoquesPorPeriodo.filter(
        (v) =>
          v.registros.find((i: any) => i.idProduto == item.idProduto)
            .quantidade > 0
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
}
