'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { GRID, META, SHEET_ORDER } from './grid';
import { computeAll, isEditable } from './engine';

const BRL = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const NUM = (v) => Number(v || 0).toLocaleString('pt-BR');

const TAB_COLORS = {
  'RESUMO': '#009c3b', 'TRANSMISSÃO': '#0D4BFF', 'TORNEIO': '#a855f7',
  'TABELA': '#db2777',
  'CAMPOS': '#ea580c', 'ÁRBITROS': '#0891b2', 'CUSTOS': '#eab308',
};

// Ordem das abas exibidas. TABELA é uma aba virtual (chaveamento/grupos),
// posicionada entre TORNEIO e CAMPOS — não é uma planilha do GRID.
const TABS = ['RESUMO', 'TRANSMISSÃO', 'TORNEIO', 'TABELA', 'CAMPOS', 'ÁRBITROS', 'CUSTOS'];

// Categorias do chaveamento e a célula da premissa (nº de times) na aba TORNEIO.
const TABELA_CATS = [
  { cell: 'B3', row: 11, label: 'Masculino', emoji: '⚡', color: '#0D4BFF' },
  { cell: 'B4', row: 12, label: 'Feminino',  emoji: '🌸', color: '#db2777' },
  { cell: 'B5', row: 13, label: 'Sub-15',    emoji: '🌟', color: '#f59e0b' },
  { cell: 'B6', row: 14, label: 'Sub-12',    emoji: '🌱', color: '#10b981' },
];

// Monta os grupos a partir do nº de times e do tamanho do grupo.
// Ex.: 12 times, 4/grupo -> Grupo 1: 1-A,1-B,1-C,1-D · Grupo 2: 2-A... · Grupo 3: 3-A...
function buildGroups(nTeams, perGroup) {
  const teams = Math.max(0, Math.floor(Number(nTeams) || 0));
  const size = Math.max(1, Math.floor(Number(perGroup) || 1));
  const nGroups = Math.ceil(teams / size);
  const groups = [];
  let placed = 0;
  for (let g = 1; g <= nGroups; g++) {
    const slots = [];
    for (let sIdx = 0; sIdx < size && placed < teams; sIdx++) {
      slots.push(g + '-' + String.fromCharCode(65 + sIdx));
      placed++;
    }
    groups.push({ n: g, slots });
  }
  return groups;
}

function letterOf(i) { return String.fromCharCode(65 + i); }

// Monta o mata-mata a partir das premissas do TORNEIO:
//  - 1º de cada grupo vão direto às quartas;
//  - repescagem (wild card / play-in) decide as vagas restantes das quartas;
//  - semifinais, 3º lugar e final saem dos vencedores/perdedores das fases anteriores.
function buildBracket(nTeams, nGroups, groups, qf, sf, tp, fn) {
  const L = letterOf;
  const maxPlace = groups.reduce((m, g) => Math.max(m, g.slots.length), 0);
  const ranking = [];
  for (let p = 1; p <= maxPlace; p++)
    for (let gi = 0; gi < nGroups; gi++)
      if (groups[gi].slots.length >= p) ranking.push(p + 'º ' + L(gi));

  const quarterSpots = Math.max(0, qf * 2);
  const winners = ranking.slice(0, Math.min(nGroups, quarterSpots));
  let wcGames = Math.max(0, quarterSpots - winners.length);
  wcGames = Math.min(wcGames, Math.floor(Math.max(0, ranking.length - winners.length) / 2));
  const wcPool = ranking.slice(winners.length, winners.length + 2 * wcGames);
  const wcMatches = [];
  for (let i = 0; i < wcGames; i++)
    wcMatches.push({ home: wcPool[i], away: wcPool[wcPool.length - 1 - i], win: 'Venc. WC' + (i + 1) });

  const qfMatches = [];
  for (let i = 0; i < qf; i++) {
    const home = i < winners.length ? winners[i] : 'Classificado';
    const away = i < wcGames ? 'Venc. WC' + (i + 1) : 'Classificado';
    qfMatches.push({ home, away, win: 'Venc. QF' + (i + 1) });
  }
  const sfMatches = [];
  for (let i = 0; i < sf; i++) sfMatches.push({ home: 'Venc. Quartas', away: 'Venc. Quartas', win: 'Venc. SF' + (i + 1) });
  const tpMatches = [];
  for (let i = 0; i < Math.max(1, tp); i++) tpMatches.push({ home: 'Perdedor Semifinal', away: 'Perdedor Semifinal' });
  const fnMatches = [];
  for (let i = 0; i < Math.max(1, fn); i++) fnMatches.push({ home: 'Vencedor Semifinal', away: 'Vencedor Semifinal' });

  const inKnockout = winners.length + 2 * wcGames;
  const consol = Math.max(0, nTeams - inKnockout);
  return { winners, wcMatches, qfMatches, sfMatches, tpMatches, fnMatches, consol, wcGames };
}

// Card de uma fase do mata-mata, com os confrontos.
function PhaseCard({ title, color, matches, showWin }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,.05)' }}>
      <div style={{ padding: '8px 12px', background: color + '12', borderBottom: `1px solid ${color}25`, fontSize: 11, fontWeight: 800, letterSpacing: .5, textTransform: 'uppercase', color, display: 'flex', justifyContent: 'space-between', gap: 8 }}>
        <span>{title}</span><span>{matches.length} jogo{matches.length === 1 ? '' : 's'}</span>
      </div>
      <div style={{ padding: '8px 10px' }}>
        {matches.map((m, i) => (
          <div key={i} style={{ padding: '6px 4px', borderBottom: '1px solid #f8fafc' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
              <span style={{ fontWeight: 800, color, fontSize: 10.5, minWidth: 18 }}>{i + 1}</span>
              <span style={{ color: '#334155', fontWeight: 600 }}>{m.home}</span>
              <span style={{ color: '#cbd5e1', fontWeight: 700, fontSize: 11 }}>×</span>
              <span style={{ color: '#334155', fontWeight: 600 }}>{m.away}</span>
            </div>
            {showWin && m.win ? <div style={{ fontSize: 10, color: '#94a3b8', marginLeft: 24, marginTop: 1 }}>→ {m.win} vai às quartas</div> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

// Aba TABELA: grupos + repescagem (wild card) + mata-mata com confrontos + agenda dos 3 dias.
// Tudo recalculado das premissas do TORNEIO (somente leitura).
function GruposTabela({ ctx }) {
  const g = (co) => Number(ctx.get('TORNEIO', co)) || 0;
  const perGroup = g('B7');
  const DIAS = [
    { d: '31/10', t: 'Sex', fases: 'Fase de grupos' },
    { d: '01/11', t: 'Sáb', fases: 'Repescagem · Quartas · Semifinais · Colocação' },
    { d: '02/11', t: 'Dom', fases: 'Disputa de 3º lugar · Finais · Colocação' },
  ];
  const SUB = { fontSize: 10.5, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', color: '#94a3b8', margin: '4px 2px 10px' };
  return (
    <div>
      <div style={{ fontSize: 12.5, color: '#64748b', marginBottom: 18, lineHeight: 1.6 }}>
        Chaveamento gerado das premissas do <strong>TORNEIO</strong>{perGroup ? ` — ${perGroup} times por grupo` : ''}. Torneio em 3 dias (<strong>31/10, 01/11 e 02/11</strong>). Os <strong>1º de cada grupo vão direto às quartas</strong>; a <strong>repescagem (wild card)</strong> decide as vagas restantes. <strong>Todo time joga no mínimo 5 jogos</strong> (quem cai nos grupos entra na chave de colocação). Edite os números no TORNEIO que tudo se refaz.
      </div>

      {TABELA_CATS.map((cat) => {
        const nTeams = g(cat.cell);
        const groups = buildGroups(nTeams, perGroup);
        const nGroups = groups.length;
        const qf = g('G' + cat.row);
        const sf = g('H' + cat.row);
        const tp = Math.max(1, g('I' + cat.row));
        const fn = Math.max(1, g('J' + cat.row));
        const groupGames = g('E' + cat.row);
        const bk = buildBracket(nTeams, nGroups, groups, qf, sf, tp, fn);
        const d2 = bk.wcGames + qf + sf;
        const d3 = tp + fn;

        return (
          <div key={cat.cell} style={{ marginBottom: 34, paddingBottom: 22, borderBottom: '1px dashed #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0 14px', padding: '9px 14px', borderRadius: 10, background: cat.color + '14', border: `1px solid ${cat.color}30`, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 14 }}>{cat.emoji}</span>
              <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: .5, textTransform: 'uppercase', color: cat.color }}>{cat.label}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginLeft: 6 }}>{nTeams} times · {nGroups} grupo{nGroups === 1 ? '' : 's'}</span>
            </div>

            {nGroups === 0 ? (
              <div style={{ fontSize: 12, color: '#94a3b8', padding: '4px 6px' }}>Defina a quantidade de times na aba TORNEIO.</div>
            ) : (
              <>
                <div style={SUB}>Fase de grupos · 3 jogos por time</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(168px, 1fr))', gap: 12, marginBottom: 20 }}>
                  {groups.map((grp) => (
                    <div key={grp.n} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,.05)' }}>
                      <div style={{ padding: '8px 12px', background: cat.color + '12', borderBottom: `1px solid ${cat.color}25`, fontSize: 11.5, fontWeight: 800, letterSpacing: .5, textTransform: 'uppercase', color: cat.color }}>Grupo {grp.n}</div>
                      <div style={{ padding: '6px 8px' }}>
                        {grp.slots.map((slot) => (
                          <div key={slot} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 8px', borderBottom: '1px solid #f8fafc' }}>
                            <span style={{ minWidth: 38, textAlign: 'center', fontWeight: 800, color: cat.color, background: cat.color + '14', borderRadius: 6, padding: '3px 4px', fontSize: 11.5 }}>{slot}</span>
                            <span style={{ color: '#cbd5e1', fontSize: 12.5 }}>a definir</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={SUB}>Vão direto às quartas (1º de cada grupo)</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 20 }}>
                  {bk.winners.map((w, i) => (
                    <span key={i} style={{ fontSize: 11.5, fontWeight: 800, padding: '5px 10px', borderRadius: 8, color: cat.color, background: cat.color + '14', border: `1px solid ${cat.color}30` }}>{w}</span>
                  ))}
                </div>

                {bk.wcMatches.length > 0 && (
                  <>
                    <div style={SUB}>🎟️ Repescagem — Wild Card (quem ganha vai às quartas)</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 12, marginBottom: 16 }}>
                      <PhaseCard title="Wild Card" color="#b45309" matches={bk.wcMatches} showWin={true} />
                    </div>
                  </>
                )}

                <div style={SUB}>🏆 Mata-mata — chave do título</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 12, marginBottom: 16 }}>
                  <PhaseCard title="Quartas de final" color={cat.color} matches={bk.qfMatches} showWin={false} />
                  <PhaseCard title="Semifinais" color="#7c3aed" matches={bk.sfMatches} showWin={false} />
                  <PhaseCard title="Disputa de 3º lugar" color="#f59e0b" matches={bk.tpMatches} showWin={false} />
                  <PhaseCard title="Final" color="#059669" matches={bk.fnMatches} showWin={false} />
                </div>

                <div style={{ fontSize: 12, color: '#475569', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 14px', lineHeight: 1.6, marginBottom: 14 }}>
                  <strong>Garantia de 5 jogos:</strong> os {bk.consol} time{bk.consol === 1 ? '' : 's'} que caem na fase de grupos entram na <strong>chave de colocação</strong> (2 rodadas) → todos completam <strong>3 (grupos) + 2 = 5 jogos</strong>. Quem avança no título joga 6 ou 7.
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {[
                    { dia: '31/10', txt: `Grupos · ${groupGames} jogos`, c: '#009c3b' },
                    { dia: '01/11', txt: `Repescagem + Quartas + Semis · ${d2} jogos`, c: '#0D4BFF' },
                    { dia: '02/11', txt: `3º lugar + Final · ${d3} jogos`, c: '#eab308' },
                  ].map((x, i) => (
                    <div key={i} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '8px 10px', borderLeft: `3px solid ${x.c}` }}>
                      <div style={{ fontSize: 12, fontWeight: 900, color: '#0f172a' }}>{x.dia}</div>
                      <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.4, marginTop: 2 }}>{x.txt}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        );
      })}

      <div style={SUB}>📅 Agenda dos 3 dias</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        {DIAS.map((dia, i) => (
          <div key={i} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,.05)', borderTop: `3px solid ${['#009c3b', '#0D4BFF', '#eab308'][i]}` }}>
            <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: -1, color: '#0f172a' }}>{dia.d}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 8 }}>{dia.t} · Dia {i + 1}</div>
            <div style={{ fontSize: 12.5, color: '#475569', lineHeight: 1.5 }}>{dia.fases}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 12, lineHeight: 1.6 }}>
        Semifinais e finais nos dias 01/11 e 02/11. Se a fase de grupos não fechar em 31/10, ela avança para 01/11 e a decisão fica em 02/11. Os confrontos das fases seguintes são preenchidos conforme os resultados.
      </div>
    </div>
  );
}

function numToCol(n) { let s = ''; while (n > 0) { const r = (n - 1) % 26; s = String.fromCharCode(65 + r) + s; n = (n - r - 1) / 26; } return s; }
const cell = (sheet, co) => (GRID[sheet] || {})[co];
const cellStr = (sheet, co) => { const c = cell(sheet, co); return c && 's' in c ? c.s : null; };
const isFormula = (sheet, co) => { const c = cell(sheet, co); return !!(c && 'f' in c); };

const isSectionRow = (sheet, r) => { const s = cellStr(sheet, 'A' + r); return !!s && s.trim().startsWith('▌'); };
const isNoteRow = (sheet, r) => { const s = cellStr(sheet, 'A' + r); return !!s && s.startsWith('💙'); };
const isTotalRow = (sheet, r) => { const s = cellStr(sheet, 'A' + r); return !!s && /(TOTAL|SUBTOTAL)/i.test(s); };
function isHeaderRow(sheet, r, cols) {
  let strs = 0, nums = 0;
  for (let c = 1; c <= cols; c++) { const cc = cell(sheet, numToCol(c) + r); if (!cc) continue; if ('s' in cc) strs++; else nums++; }
  return strs >= 3 && nums === 0 && !isSectionRow(sheet, r) && !isNoteRow(sheet, r) && !isTotalRow(sheet, r);
}
function rowIsEmpty(sheet, r, cols) {
  for (let c = 1; c <= cols; c++) if (cell(sheet, numToCol(c) + r)) return false;
  return true;
}

// formata célula calculada conforme o rótulo da coluna ativa
function fmtComputed(val, colLabel) {
  if (colLabel && /R\$/.test(colLabel)) return BRL(val);
  if (colLabel && colLabel.includes('%')) return (val * 100).toFixed(1).replace('.', ',') + '%';
  return NUM(val);
}

export default function CustosPage() {
  const [tab, setTab] = useState(0);
  const [inputs, setInputs] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [saveState, setSaveState] = useState('idle'); // idle | saving | saved | error
  const timer = useRef(null);

  useEffect(() => {
    fetch('/api/admin/custos')
      .then(r => r.json())
      .then(d => { if (d && d.ok && d.inputs) setInputs(d.inputs); })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const ctx = useMemo(() => computeAll(inputs), [inputs]);

  function save(next) {
    setSaveState('saving');
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try {
        const res = await fetch('/api/admin/custos', {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ inputs: next }),
        });
        const d = await res.json().catch(() => ({}));
        setSaveState(d.ok ? 'saved' : 'error');
      } catch (_) { setSaveState('error'); }
    }, 700);
  }

  function onEdit(key, value) {
    setInputs(prev => { const next = { ...prev, [key]: value }; save(next); return next; });
  }

  function resetAll() {
    if (!window.confirm('Restaurar todos os valores da planilha original? As edições salvas serão apagadas.')) return;
    setInputs({}); save({});
  }

  const sheet = TABS[tab];
  const color = TAB_COLORS[sheet] || '#009c3b';
  const isTabela = sheet === 'TABELA';
  const { rows, cols } = isTabela ? { rows: 0, cols: 0 } : META[sheet];
  const title = isTabela ? 'BFWC 2026 — CHAVEAMENTO / GRUPOS' : (cellStr(sheet, 'A1') || sheet);
  const isResumo = sheet === 'RESUMO';

  // faixa de KPIs do RESUMO (linha 4 = valores calculados, linha 5 = rótulos)
  const kpis = isResumo
    ? Array.from({ length: cols }, (_, i) => ({
        label: cellStr(sheet, numToCol(i + 1) + '5') || '',
        value: ctx.get(sheet, numToCol(i + 1) + '4'),
      })).filter(k => k.label)
    : null;

  function inputBox(key, defVal) {
    const has = Object.prototype.hasOwnProperty.call(inputs, key);
    const val = has ? inputs[key] : (defVal === undefined || defVal === null ? '' : defVal);
    return (
      <input
        type="number" inputMode="decimal" value={val}
        onChange={e => onEdit(key, e.target.value)}
        style={{
          width: '100%', maxWidth: 130, textAlign: 'right', padding: '5px 8px',
          fontSize: 12.5, fontFamily: 'inherit', color: '#0f172a', fontWeight: 600,
          background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 7, outline: 'none',
        }}
      />
    );
  }

  // renderiza o corpo de uma aba (linhas 1..rows)
  const body = [];
  let activeHeader = [];
  const startRow = isResumo ? 6 : 2; // RESUMO: pula título/subtítulo/KPIs (1-5)
  for (let r = startRow; r <= rows; r++) {
    if (rowIsEmpty(sheet, r, cols)) continue;
    if (isSectionRow(sheet, r)) {
      activeHeader = [];
      body.push(<div key={r} style={{ margin: '22px 0 10px', padding: '9px 14px', borderRadius: 10, background: color + '14', border: `1px solid ${color}30`, fontSize: 12, fontWeight: 800, letterSpacing: .8, textTransform: 'uppercase', color }}>{cellStr(sheet, 'A' + r).replace(/^▌\s*/, '')}</div>);
      continue;
    }
    if (isNoteRow(sheet, r)) {
      body.push(<div key={r} style={{ margin: '14px 0 2px', fontSize: 11, color: '#94a3b8', lineHeight: 1.5 }}>{cellStr(sheet, 'A' + r)}</div>);
      continue;
    }
    const gridTemplate = `1.7fr repeat(${cols - 1}, 1fr)`;
    if (isHeaderRow(sheet, r, cols)) {
      activeHeader = Array.from({ length: cols }, (_, c) => cellStr(sheet, numToCol(c + 1) + r) || '');
      body.push(
        <div key={r} className="cst-row cst-head" style={{ gridTemplateColumns: gridTemplate }}>
          {activeHeader.map((h, c) => <div key={c} style={{ textAlign: c === 0 ? 'left' : 'right' }}>{h}</div>)}
        </div>
      );
      continue;
    }
    const total = isTotalRow(sheet, r);
    body.push(
      <div key={r} className={'cst-row' + (total ? ' cst-total' : '')} style={{ gridTemplateColumns: gridTemplate, ...(total ? { background: color + '12', borderColor: color + '30' } : {}) }}>
        {Array.from({ length: cols }, (_, ci) => {
          const col = numToCol(ci + 1);
          const co = col + r;
          const c = cell(sheet, co);
          const label = activeHeader[ci];
          const editable = isEditable(sheet, col, r);
          let content = null, align = ci === 0 ? 'left' : 'right';
          if (c && 's' in c) { content = c.s; align = 'left'; }
          else if (editable) { content = inputBox(sheet + '!' + co, c && 'v' in c ? c.v : ''); }
          else if (c && 'f' in c) { content = fmtComputed(ctx.get(sheet, co), label); }
          else { content = ''; }
          return (
            <div key={ci} style={{
              textAlign: align,
              fontWeight: total ? 800 : (ci === 0 ? 600 : 400),
              color: total ? color : (ci === 0 ? '#0f172a' : '#475569'),
              fontVariantNumeric: 'tabular-nums',
              display: 'flex', justifyContent: align === 'right' ? 'flex-end' : 'flex-start', alignItems: 'center',
            }}>{content}</div>
          );
        })}
      </div>
    );
  }

  const saveLabel = { idle: '', saving: '💾 Salvando…', saved: '✓ Salvo', error: '⚠ Erro ao salvar' }[saveState];
  const saveColor = saveState === 'error' ? '#dc2626' : saveState === 'saved' ? '#009c3b' : '#94a3b8';

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: '#0f172a' }}>
      <style>{`
        .cst-tabs { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 22px; }
        .cst-tab { padding: 9px 16px; border-radius: 10px; font-size: 12px; font-weight: 800; letter-spacing: .5px; text-transform: uppercase; cursor: pointer; border: 1px solid #e2e8f0; background: #fff; color: #64748b; font-family: inherit; transition: all .15s; }
        .cst-row { display: grid; gap: 10px; padding: 8px 10px; align-items: center; font-size: 12.5px; }
        .cst-row:not(:last-child) { border-bottom: 1px solid #f1f5f9; }
        .cst-head { font-size: 9.5px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; color: #94a3b8; border-bottom: 1px solid #e2e8f0 !important; }
        .cst-total { border-radius: 8px; border: 1px solid transparent; margin-top: 2px; }
        .cst-kpis { display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px; margin-bottom: 22px; }
        @media (max-width: 1000px) { .cst-kpis { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 640px) { .cst-kpis { grid-template-columns: repeat(2, 1fr); } .cst-row { font-size: 11px; gap: 6px; } }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 22, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', color: '#009c3b', marginBottom: 8 }}>BFWC 2026 · Financeiro</div>
          <h1 style={{ fontSize: 42, fontWeight: 900, letterSpacing: -2, lineHeight: 1, color: '#0f172a', margin: 0 }}>Custos do Evento</h1>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 8 }}>Planilha viva — edite as células amarelas (entradas) que os totais se calculam e salvam sozinhos.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: saveColor, minWidth: 90, textAlign: 'right' }}>{loaded ? saveLabel : 'carregando…'}</span>
          <button onClick={resetAll} style={{ padding: '9px 14px', borderRadius: 10, fontSize: 11.5, fontWeight: 700, cursor: 'pointer', background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#475569', fontFamily: 'inherit' }}>↺ Restaurar planilha</button>
        </div>
      </div>

      <div className="cst-tabs">
        {TABS.map((s, i) => {
          const c = TAB_COLORS[s] || '#009c3b';
          const active = i === tab;
          return (
            <button key={s} className="cst-tab" onClick={() => setTab(i)} style={active ? { background: c + '18', color: c, borderColor: c + '40' } : {}}>{s}</button>
          );
        })}
      </div>

      <div style={{ fontSize: 12.5, color: '#64748b', marginBottom: (isResumo && kpis) ? 18 : 14 }}>{title}</div>

      {isResumo && kpis && (
        <div className="cst-kpis">
          {kpis.map((k, i) => (
            <div key={i} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '15px 16px', boxShadow: '0 1px 4px rgba(0,0,0,.06)', borderTop: `3px solid ${color}` }}>
              <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', color: '#64748b', marginBottom: 8, lineHeight: 1.3 }}>{k.label}</div>
              <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: -1.5, lineHeight: 1, color: '#0f172a' }}>{/R\$/.test(k.label) ? BRL(k.value) : NUM(k.value)}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: '18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
        {isTabela ? <GruposTabela ctx={ctx} /> : body}
      </div>
    </div>
  );
}
