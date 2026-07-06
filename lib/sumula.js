// ════════════════════════════════════════════════════════════════
//  BFWC 2026 — Pontuação da súmula (flag football)
// ════════════════════════════════════════════════════════════════

// Tipos de pontuação e seus valores
export const PLAY_TYPES = [
  { key: 'td',        label: 'Touchdown',                     short: 'TD',        pts: 6 },
  { key: 'conv1',     label: 'Conversão de 1 ponto',          short: 'Conv 1',    pts: 1 },
  { key: 'conv2',     label: 'Conversão de 2 pontos',         short: 'Conv 2',    pts: 2 },
  { key: 'safety',    label: 'Safety',                        short: 'Safety',    pts: 2 },
  { key: 'int_td',    label: 'Interceptação para touchdown',  short: 'INT TD',    pts: 6 },
  { key: 'int_conv1', label: 'Interceptação de conversão 1pt',short: 'INT C1',    pts: 1 },
  { key: 'int_conv2', label: 'Interceptação de conversão 2pt',short: 'INT C2',    pts: 2 },
];

export const PTS_BY_KEY = Object.fromEntries(PLAY_TYPES.map(p => [p.key, p.pts]));

// Estrutura de contagem zerada por time
export function emptyCounts() {
  return Object.fromEntries(PLAY_TYPES.map(p => [p.key, 0]));
}

// Calcula o placar a partir das contagens de jogadas de um time
export function scoreFromCounts(counts = {}) {
  return PLAY_TYPES.reduce((s, p) => s + (parseInt(counts[p.key], 10) || 0) * p.pts, 0);
}

// Estrutura padrão de uma súmula
export function emptySumula() {
  return {
    plays: { team1: emptyCounts(), team2: emptyCounts() },
    coaches: { team1: '', team2: '' },
    referee: '',
    ejections: [],   // [{ team: 'team1'|'team2', name, reason }]
    notes: '',
  };
}
