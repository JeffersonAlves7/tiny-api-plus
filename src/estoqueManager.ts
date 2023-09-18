// estoqueManager.ts

import { EstoqueRequests } from "./requests/Estoque";
import { format } from "date-fns";

export class EstoqueManager {
  constructor(private TINYSESSID: string) {}

  async obterEstoqueDoDia(dia: string) {
    const response = await EstoqueRequests.relatorioEstoqueDoDia(
      dia,
      this.TINYSESSID
    );

    const { data } = response;
    return { registros: data.response[0].val.registros, dia };
  }

  async obterEstoquesPorPeriodo(periodo: number) {
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
        (v: any) =>
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
