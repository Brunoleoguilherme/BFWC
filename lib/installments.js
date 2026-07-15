// ════════════════════════════════════════════════════════════════
//  BFWC 2026 — Cálculo de pagamento (2 opções) e parcelas por data
// ════════════════════════════════════════════════════════════════
export const CATS = ['Masculino', 'Feminino', 'Sub-15', 'Sub-12'];

// Preços
export const OPTION1_PER_CAT = 2000; // Opção 1: R$ por categoria
export const OPTION2_PER_CAT = 800;  // Opção 2: R$ por categoria
export const PRICE_PER_ATHLETE = 90; // Opção 2: R$ por atleta

// Datas das parcelas (todas podem ser pagas a qualquer momento)
export const DUE_DATES = ['2026-07-20', '2026-08-20', '2026-09-20'];

export function countCategories(categoryStr) {
  return CATS.filter((c) => categoryStr?.includes(c)).length || 1;
}

// Cotas de times por categoria. Ao confirmar a 1ª parcela, o time ocupa 1 vaga
// em cada categoria em que está inscrito. Quando lota, novos times são bloqueados.
export const CATEGORY_QUOTAS = {
  'Masculino': 20,
  'Feminino': 20,
  'Sub-15': 20,
  'Sub-12': 20,
};

/**
 * Retorna a primeira categoria do time que já atingiu a cota (ou null se há vaga).
 * Conta times com pagamento confirmado (1ª parcela paga) em cada categoria.
 */
/**
 * Categorias que um time REALMENTE pagou/garantiu.
 * Usa a payment_selection (permite pagamento parcial). Sem seleção (modelo antigo
 * por opção única, ou time isento) -> todas as categorias inscritas.
 */
export function paidCategoriesOf(team) {
  let sel = team?.payment_selection;
  if (typeof sel === 'string') { try { sel = JSON.parse(sel); } catch { sel = null; } }
  if (sel && typeof sel === 'object' && !Array.isArray(sel)) {
    const keys = CATS.filter((c) => sel[c]);
    if (keys.length) return keys;
  }
  return CATS.filter((c) => team?.category?.includes(c));
}

export async function fullCategoryFor(supabase, teamId, categoryStr) {
  const cats = CATS.filter((c) => categoryStr?.includes(c));
  if (cats.length === 0) return null;
  const { data: paidTeams } = await supabase
    .from('portal_teams')
    .select('id, category, payment_selection')
    .eq('payment_confirmed', true);
  for (const cat of cats) {
    const count = (paidTeams || []).filter((t) => t.id !== teamId && paidCategoriesOf(t).includes(cat)).length;
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

/**
 * Seleção por categoria: { [categoria]: { option: '1' | '2', qty? } }.
 * Valida contra as categorias inscritas. Ignora categorias ausentes (pagamento parcial);
 * retorna null so se NENHUMA categoria valida for escolhida.
 * Opção 2 exige qty entre 12 e 20 (clampado).
 */
export function normalizeSelection(sel, categoryStr) {
  const cats = CATS.filter((c) => categoryStr?.includes(c));
  if (!cats.length || !sel || typeof sel !== 'object') return null;
  const out = {};
  for (const c of cats) {
    const s = sel[c];
    if (!s) continue; // categoria nao incluida no pagamento (o time optou por nao pagar agora)
    const opt = String(s.option);
    if (opt !== '1' && opt !== '2') return null;
    if (opt === '2') {
      const q = Math.min(20, Math.max(12, parseInt(s.qty, 10) || 12));
      out[c] = { option: '2', qty: q };
    } else {
      out[c] = { option: '1' };
    }
  }
  return Object.keys(out).length ? out : null; // precisa de ao menos 1 categoria escolhida
}

/** Total em REAIS de uma seleção por categoria (soma das categorias). */
export function selectionTotalReais(sel) {
  return Object.values(sel || {}).reduce((sum, s) => {
    if (String(s.option) === '2') return sum + OPTION2_PER_CAT + PRICE_PER_ATHLETE * (parseInt(s.qty, 10) || 0);
    return sum + OPTION1_PER_CAT;
  }, 0);
}

/** Resumo p/ colunas legadas: option '1' | '2' | 'mix' e total de atletas (opção 2). */
export function selectionSummary(sel) {
  const opts = new Set(Object.values(sel || {}).map((s) => String(s.option)));
  const option = opts.size === 1 ? [...opts][0] : 'mix';
  const qty = Object.values(sel || {}).reduce((s, x) => s + (String(x.option) === '2' ? (parseInt(x.qty, 10) || 0) : 0), 0);
  return { option, qty };
}

/** Total em centavos a partir do registro do time (seleção por categoria ou legado). */
export function totalCentsForTeam(team) {
  const sel = normalizeSelection(team?.payment_selection, team?.category);
  if (sel) return selectionTotalReais(sel) * 100;
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
