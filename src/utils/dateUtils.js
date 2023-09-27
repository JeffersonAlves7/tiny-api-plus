// @ts-check

/**
 * Formata uma data para o formato "dd/MM/yyyy".
 * @param {Date} date - A data a ser formatada.
 * @returns {string} - A data formatada.
 */
export function formatDate(date) {
  const dia = String(date.getDate()).padStart(2, "0");
  const mes = String(date.getMonth() + 1).padStart(2, "0");
  const ano = date.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

/**
 * Formata uma data para o formato "yyyy-MM-dd".
 * @param {Date} date - A data a ser formatada.
 * @returns {string} - A data formatada.
 */
export function formatTinyDate(date) {
  const dia = String(date.getDate()).padStart(2, "0");
  const mes = String(date.getMonth() + 1).padStart(2, "0");
  const ano = date.getFullYear();
  return `${ano}-${mes}-${dia}`;
}

/**
 * Formata uma data para o formato especificado.
 * @param {Date} date - A data a ser formatada.
 * @param {string} format - O formato da data.
 * @returns {string} - A data formatada.
 */
export function formatCustomDate(date, format) {
  const dia = String(date.getDate()).padStart(2, "0");
  const mes = String(date.getMonth() + 1).padStart(2, "0");
  const ano = date.getFullYear();

  switch (format) {
    case "dd/MM/yyyy":
      return `${dia}/${mes}/${ano}`;
    case "yyyy-MM-dd":
      return `${ano}-${mes}-${dia}`;
    default:
      return `${dia}/${mes}/${ano}`;
  }
}

/**
 * Retorna o dia 1 do primeiro mês e o último dia do último mês.
 * @param {number} periodo - O período em meses.
 * @returns {Date[]} - Um array com o primeiro dia do primeiro mês e o último dia do último mês.
 */
export function getFirstAndLastDayOfPeriod(periodo) {
  const firstDay = new Date();
  const lastDay = new Date();

  firstDay.setMonth(firstDay.getMonth() - periodo);
  firstDay.setDate(1);

  lastDay.setDate(0);

  return [firstDay, lastDay];
}


/**
 * Function to transform a string dd/MM/yyyy to Date
 * @param {string} dateString - A string to be transformed to Date dd/MM/yyyy
 * @returns {Date}
 */
export function stringToDate(dateString) {
  const [dia, mes, ano] = dateString.split("/");
  return new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
}

