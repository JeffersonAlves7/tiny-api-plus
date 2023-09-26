// @ts-check

/**
 * Formata uma data para o formato "dd/MM/yyyy".
 * @param {Date} date - A data a ser formatada.
 * @returns {string} - A data formatada.
 */
export function formatarData(date) {
  const dia = String(date.getDate()).padStart(2, "0");
  const mes = String(date.getMonth() + 1).padStart(2, "0");
  const ano = date.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

