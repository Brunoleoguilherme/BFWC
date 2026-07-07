// ════════════════════════════════════════════════════════════════
//  BFWC 2026 — Janelas de data do cadastro (horário de Brasília, UTC-3)
// ════════════════════════════════════════════════════════════════

// Pré-cadastro (formulário de interesse) encerra em 01/07/2026 23:59 (Brasília)
export const PRE_CADASTRO_CLOSE = new Date('2026-07-01T23:59:59-03:00');

// Janela em que o cadastro completo (acesso ao portal) fica restrito
// apenas a times já pré-inscritos: 07/07 00:00 → 12/07 23:59 (Brasília)
export const CADASTRO_WINDOW_START = new Date('2026-07-06T23:59:59-03:00');
export const CADASTRO_WINDOW_END   = new Date('2026-07-12T23:59:59-03:00');

/** true se as pré-inscrições já estão encerradas. */
export function isPreCadastroClosed(now = new Date()) {
  return now >= PRE_CADASTRO_CLOSE;
}

/** true se estamos na janela em que o cadastro completo é só para pré-inscritos. */
export function isCadastroRestricted(now = new Date()) {
  return now >= CADASTRO_WINDOW_START && now <= CADASTRO_WINDOW_END;
}

// Portal dos times (login + cadastro) abre em 07/07/2026 às 10:00 (Brasília)
export const PORTAL_TIMES_OPEN_AT = new Date('2026-07-07T09:50:00-03:00');

/** true se o portal dos times já está aberto (07/07 10h Brasília em diante). */
export function isPortalTimesOpen(now = new Date()) {
  return now >= PORTAL_TIMES_OPEN_AT;
}

/** Mensagem trilíngue para quando o portal ainda não abriu. */
export const PORTAL_NOT_OPEN_MESSAGE =
  'O acesso ao portal estará disponível dia 07/07 às 10h (horário de Brasília). · Portal access opens July 7 at 10 AM (Brasília time, GMT-3). · El acceso al portal estará disponible el 07/07 a las 10h (hora de Brasilia).';
