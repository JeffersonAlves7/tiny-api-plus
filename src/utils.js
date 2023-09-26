//@ts-check

/**
 * Formata uma data para o formato "dd/MM/yyyy".
 * @param {Date} date - A data a ser formatada.
 * @returns {string} - A data formatada.
 */
function formatarData(date) {
  const dia = String(date.getDate()).padStart(2, "0");
  const mes = String(date.getMonth() + 1).padStart(2, "0");
  const ano = date.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

/** Tipo genérico que representa informações da loja.
 * @typedef {{
 *   Vendas: number,
 *   "Dias em Estoque": number,
 *   "Saldo em Estoque": number
 * }} Loja
 */

/**
 * Adiciona um produto à planilha com base nas informações fornecidas.
 * @param {{
 *   SKU: string,
 *   Descricao: string,
 *   Marca: string,
 *   Fornecedor: string,
 *   loja1: Loja,
 *   loja2: Loja,
 *   "Depósito Matriz": number,
 *   "Custo Médio": number,
 *   "Custo Médio Valor Médio Pedido": number,
 *   "Ponto de pedido": number
 * }} item - As informações do produto a serem adicionadas à planilha.
 */
function addProduct(item) {
  var sheet = SpreadsheetApp.getActiveSheet();

  /**
   * Função para arredondar números para um número específico de casas decimais
   * @param {number} number
   * @param {number} decimalPlaces
   * @returns
   */
  function roundNumber(number, decimalPlaces) {
    var factor = Math.pow(10, decimalPlaces);
    return Math.round(number * factor) / factor;
  }

  //estoque atual - soma do deposito matriz + saldo em estoque das duas lojas
  var estoqueAtual =
    item.loja1["Saldo em Estoque"] +
    item.loja2["Saldo em Estoque"] +
    item["Depósito Matriz"];

  //o giro medio da loja 1 tem que ser calculado pelas vendas da propria loja, dividido pelos dias em estoque da propria loja
  var giroMedio1 = roundNumber(
    item.loja1["Vendas"] / item.loja1["Dias em Estoque"],
    2
  );

  //o giro medio da loja 2 tem que ser calculado pelas vendas da propria loja, dividido pelos dias em estoque da propria loja
  var giroMedio2 = roundNumber(
    item.loja2["Vendas"] / item.loja2["Dias em Estoque"],
    2
  );

  //o giro medio da loja 1 e da loja 2 tem que ser calculado vendas da propria loja, dividido pelos dias em estoque da propria loja
  var vendasTotais = roundNumber(
    item.loja1["Vendas"] + item.loja2["Vendas"],
    2
  );

  //giro medio diario - soma do giro diario da loja 1 e loja 2
  var giroMedioDiario = roundNumber(
    item.loja1["Vendas"] / item.loja1["Dias em Estoque"] +
      item.loja2["Vendas"] / item.loja2["Dias em Estoque"],
    2
  );

  //giro medio mensal - giro medio diario * 30
  var giroMedioMensal = roundNumber(giroMedioDiario * 30, 2);

  //previsao de venda total = mesma quantidade do giro medio mensal
  var previsaoVendaTotal = giroMedioMensal;

  //sugestao de compra = giro medio mensal - estoque atual
  var sugestaoCompra = roundNumber(giroMedioMensal - estoqueAtual, 2);

  sheet.appendRow([
    item["SKU"],
    item.Descricao,
    item.Marca,
    item.Fornecedor,
    item.loja1.Vendas,
    item.loja1["Dias em Estoque"],
    giroMedio1,
    item.loja1["Saldo em Estoque"],
    item.loja2.Vendas,
    item.loja2["Dias em Estoque"],
    giroMedio2,
    item.loja2["Saldo em Estoque"],
    item["Depósito Matriz"],
    estoqueAtual,
    vendasTotais,
    giroMedioDiario,
    giroMedioMensal,
    previsaoVendaTotal,
    sugestaoCompra,
    item["Custo Médio"],
    item["Custo Médio Valor Médio Pedido"],
    item["Ponto de pedido"],
  ]);
}
