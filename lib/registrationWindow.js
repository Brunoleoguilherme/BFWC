// ════════════════════════════════════════════════════════════════
//  BFWC 2026 — Janelas de data do cadastro (horário de Brasília, UTC-3)
// ════════════════════════════════════════════════════════════════

// Pré-cadastro (formulário de interesse) encerra em 01/07/2026 23:59 (Brasília)
export const PRE_CADASTRO_CLOSE = new Date('2026-07-01T23:59:59-03:00');

// Janela em que o cadastro completo (acesso ao portal) fica restrito
// apenas a times já pré-inscritos: 07/07 23:59 → 12/07 23:59 (Brasília)
export const CADASTRO_WINDOW_START = new Date('2026-07-07T23:59:59-03:00');
export const CADASTRO_WINDOW_END   = new Date('2026-07-12T23:59:59-03:00');

/** true se as pré-inscrições já estão encerradas. */
export function isPreCadastroClosed(now = new Date()) {
  return now >= PRE_CADASTRO_CLOSE;
}

/** true se estamos na janela em que o cadastro completo é só para pré-inscritos. */
export function isCadastroRestricted(now = new Date()) {
  return now >= CADASTRO_WINDOW_START && now <= CADASTRO_WINDOW_END;
}
