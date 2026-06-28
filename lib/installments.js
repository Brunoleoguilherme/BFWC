// ════════════════════════════════════════════════════════════════
//  BFWC 2026 — Cálculo de parcelas
// ════════════════════════════════════════════════════════════════
export const CATS = ['Masculino', 'Feminino', 'Sub-15', 'Sub-12'];
export const PRICE_PER_CAT = 2000; // R$ por categoria

// Datas de referência das parcelas (todas podem ser pagas a qualquer momento)
const DUE_DATES = ['2026-07-15', '2026-08-15', '2026-09-15'];

export function countCategories(categoryStr) {
  return CATS.filter((c) => categoryStr?.includes(c)).length || 1;
}

/** Valor total da inscrição em centavos, a partir da string de categorias. */
export function totalCentsFor(categoryStr) {
  return PRICE_PER_CAT * countCategories(categoryStr) * 100;
}

/**
 * Calcula as parcelas para um time e um plano (1, 2 ou 3).
 * Retorna [{ number, amount_cents, due_date }]. Em reais arredondados,
 * a última parcela absorve a diferença (ex.: 4000 em 3x = 1334,1334,1332).
 */
export function computeInstallments(numCats, planSize) {
  const n = Math.min(Math.max(parseInt(planSize, 10) || 1, 1), 3);
  const totalReais = PRICE_PER_CAT * numCats;
  const parcelaReais = Math.ceil(totalReais / n);
  const out = [];
  for (let i = 1; i <= n; i++) {
    const reais = i < n ? parcelaReais : totalReais - parcelaReais * (n - 1);
    out.push({
      number: i,
      amount_cents: reais * 100,
      due_date: DUE_DATES[i - 1] || DUE_DATES[DUE_DATES.length - 1],
    });
  }
  return out;
}
