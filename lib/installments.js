// ════════════════════════════════════════════════════════════════
//  BFWC 2026 — Cálculo de pagamento (2 opções) e parcelas por data
// ════════════════════════════════════════════════════════════════
export const CATS = ['Masculino', 'Feminino', 'Sub-15', 'Sub-12'];

// Preços
export const OPTION1_PER_CAT = 2000; // Opção 1: R$ por categoria
export const OPTION2_PER_CAT = 800;  // Opção 2: R$ por categoria
export const PRICE_PER_ATHLETE = 100; // Opção 2: R$ por atleta

// Datas das parcelas (todas podem ser pagas a qualquer momento)
export const DUE_DATES = ['2026-07-20', '2026-08-20', '2026-09-20'];

export function countCategories(categoryStr) {
  return CATS.filter((c) => categoryStr?.includes(c)).length || 1;
}

// Cotas de times por categoria. Ao confirmar a 1ª parcela, o time ocupa 1 vaga
// em cada categoria em que está inscrito. Quando lota, novos times são bloqueados.
export const CATEGORY_QUOTAS = {
  'Masculino': 14,
  'Feminino': 14,
  'Sub-15': 11,
  'Sub-12': 11,
};

/**
 * Retorna a primeira categoria do time que já atingiu a cota (ou null se há vaga).
 * Conta times com pagamento confirmado (1ª parcela paga) em cada categoria.
 */
export async function fullCategoryFor(supabase, teamId, categoryStr) {
  const cats = CATS.filter((c) => categoryStr?.includes(c));
  if (cats.length === 0) return null;
  const { data: paidTeams } = await supabase
    .from('portal_teams')
    .select('id, category')
    .eq('payment_confirmed', true);
  for (const cat of cats) {
    const count = (paidTeams || []).filter((t) => t.id !== teamId && t.category?.includes(cat)).length;
    if (count >= (CATEGORY_QUOTAS[cat] ?? Infinity)) return cat;
  }
  return null;
}

/**
 * Valor total em REAIS conforme a opção escolhida.
 *  - Opção 1: 2000 × categorias
 *  - Opção 2: 800 × categorias + 100 × atletas
 */
export function optionTotalReais(option, numCats, athletes = 0) {
  const cats = Math.max(parseInt(numCats, 10) || 1, 1);
  if (String(option) === '2') {
    const ath = Math.max(parseInt(athletes, 10) || 0, 0);
    return OPTION2_PER_CAT * cats + PRICE_PER_ATHLETE * ath;
  }
  return OPTION1_PER_CAT * cats;
}

/** Total em centavos a partir do registro do time (usa opção/atletas salvos). */
export function totalCentsForTeam(team) {
  const numCats = countCategories(team?.category);
  return optionTotalReais(team?.payment_option, numCats, team?.athletes_paid_qty) * 100;
}

/**
 * Quantas parcelas estão ativas HOJE (muda automático por data):
 *  - até 20/07 → 3x (20/07, 20/08, 20/09)
 *  - depois de 20/07 até 20/08 → 2x (20/08, 20/09)
 *  - depois de 20/08 → 1x (20/09)  [continua liberado mesmo após 20/09]
 */
export function activePlanSize(today = new Date()) {
  const d = (today instanceof Date ? today : new Date(today)).toISOString().slice(0, 10);
  if (d <= DUE_DATES[0]) return 3;
  if (d <= DUE_DATES[1]) return 2;
  return 1;
}

/**
 * Parcelas para um total (em reais) e um plano (1, 2 ou 3).
 * As datas usadas são as ÚLTIMAS n datas de DUE_DATES, então:
 *  - 3x → 20/07, 20/08, 20/09
 *  - 2x → 20/08, 20/09
 *  - 1x → 20/09
 * A última parcela absorve o arredondamento.
 */
export function computeInstallments(totalReais, planSize) {
  const n = Math.min(Math.max(parseInt(planSize, 10) || 1, 1), 3);
  const total = Math.max(parseInt(totalReais, 10) || 0, 0);
  const dates = DUE_DATES.slice(DUE_DATES.length - n);
  const parcelaReais = Math.ceil(total / n);
  const out = [];
  for (let i = 1; i <= n; i++) {
    const reais = i < n ? parcelaReais : total - parcelaReais * (n - 1);
    out.push({
      number: i,
      amount_cents: reais * 100,
      due_date: dates[i - 1],
    });
  }
  return out;
}
