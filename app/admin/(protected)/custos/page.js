'use client';

import { useState } from 'react';
import { SHEETS } from './data';

// Valores da planilha estão em reais (R$), não em centavos.
const BRL = (v) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const NUM = (v) => Number(v).toLocaleString('pt-BR');

// Cor de destaque por aba
const TAB_COLORS = {
  'RESUMO':      '#009c3b',
  'TRANSMISSÃO': '#0D4BFF',
  'TORNEIO':     '#a855f7',
  'CAMPOS':      '#ea580c',
  'ÁRBITROS':    '#0891b2',
  'CUSTOS':      '#eab308',
};

const isStr = (v) => typeof v === 'string';
const nonEmpty = (row) => row.filter(c => c !== null && c !== '' && c !== undefined);
const isSection = (row) => isStr(row[0]) && row[0].trim().startsWith('▌');
const isNote    = (row) => isStr(row[0]) && row[0].startsWith('💙');
const isTotal   = (row) => isStr(row[0]) && /(^|\b)(TOTAL|SUBTOTAL|TOTAL GERAL)/i.test(row[0]);
// Linha de cabeçalho de tabela: todas as células preenchidas são texto e há >= 3 delas
const isHeader  = (row) => {
  const ne = nonEmpty(row);
  return ne.length >= 3 && ne.every(isStr) && !isSection(row) && !isNote(row) && !isTotal(row);
};

// Formata uma célula conforme o rótulo da coluna ativa
function fmt(val, colLabel) {
  if (val === null || val === undefined || val === '') return '';
  if (typeof val === 'number') {
    if (colLabel && /R\$/.test(colLabel)) return BRL(val);
    if (colLabel && colLabel.includes('%')) return (val * 100).toFixed(1).replace('.', ',') + '%';
    return NUM(val);
  }
  return String(val);
}

function SheetView({ sheet, color }) {
  const rows = sheet.rows;
  const cols = sheet.cols;
  const title = isStr(rows[0]?.[0]) ? rows[0][0] : sheet.name;

  // RESUMO: faixa de KPIs (linha de valores r4 + rótulos r5)
  const isResumo = sheet.name === 'RESUMO';
  const kpiVals = isResumo ? rows[3] : null;
  const kpiLabels = isResumo ? rows[4] : null;
  const startIdx = isResumo ? 5 : 1;
  const subtitle = (!isResumo && isStr(rows[1]?.[0]) && !isSection(rows[1])) ? rows[1][0] : (isResumo && isStr(rows[1]?.[0]) ? rows[1][0] : null);
  const subStart = (!isResumo && subtitle) ? 2 : startIdx;

  let activeHeader = [];
  const out = [];

  for (let i = subStart; i < rows.length; i++) {
    const row = rows[i];
    if (!row || nonEmpty(row).length === 0) { continue; }

    if (isSection(row)) {
      activeHeader = [];
      out.push(
        <div key={i} style={{
          margin: '22px 0 10px', padding: '9px 14px', borderRadius: 10,
          background: color + '14', border: `1px solid ${color}30`,
          fontSize: 12, fontWeight: 800, letterSpacing: .8, textTransform: 'uppercase', color,
        }}>{row[0].replace(/^▌\s*/, '')}</div>
      );
      continue;
    }
    if (isNote(row)) {
      out.push(
        <div key={i} style={{ margin: '14px 0 2px', fontSize: 11, color: '#94a3b8', lineHeight: 1.5 }}>{row[0]}</div>
      );
      continue;
    }
    if (isHeader(row)) {
      activeHeader = row.slice();
      out.push(
        <div key={i} className="cst-row cst-head" style={{ gridTemplateColumns: `1.6fr repeat(${cols - 1}, 1fr)` }}>
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} style={{ textAlign: c === 0 ? 'left' : 'right' }}>{row[c] != null ? String(row[c]) : ''}</div>
          ))}
        </div>
      );
      continue;
    }
    const total = isTotal(row);
    out.push(
      <div key={i} className={'cst-row' + (total ? ' cst-total' : '')}
        style={{ gridTemplateColumns: `1.6fr repeat(${cols - 1}, 1fr)`, ...(total ? { background: color + '12', borderColor: color + '30' } : {}) }}>
        {Array.from({ length: cols }).map((_, c) => {
          const v = row[c];
          const num = typeof v === 'number';
          return (
            <div key={c} style={{
              textAlign: c === 0 ? 'left' : (num ? 'right' : 'left'),
              fontWeight: total ? 800 : (c === 0 ? 600 : 400),
              color: total ? color : (c === 0 ? '#0f172a' : '#475569'),
              fontVariantNumeric: 'tabular-nums',
            }}>{fmt(v, activeHeader[c])}</div>
          );
        })}
      </div>
    );
  }

  return (
    <div>
      <div style={{ fontSize: 12.5, color: '#64748b', marginBottom: isResumo && kpiVals ? 18 : 14 }}>{title}</div>

      {isResumo && kpiVals && (
        <div className="cst-kpis">
          {kpiLabels.map((lab, idx) => (
            <div key={idx} style={{
              background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16,
              padding: '15px 16px', boxShadow: '0 1px 4px rgba(0,0,0,.06)', borderTop: `3px solid ${color}`,
            }}>
              <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', color: '#64748b', marginBottom: 8, lineHeight: 1.3 }}>{lab}</div>
              <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: -1.5, lineHeight: 1, color: '#0f172a' }}>
                {/R\$/.test(lab) ? BRL(kpiVals[idx] || 0) : NUM(kpiVals[idx] || 0)}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: '18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
        {out}
      </div>
    </div>
  );
}

export default function CustosPage() {
  const [tab, setTab] = useState(0);
  const sheet = SHEETS[tab];
  const color = TAB_COLORS[sheet.name] || '#009c3b';

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: '#0f172a' }}>
      <style>{`
        .cst-tabs { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 22px; }
        .cst-tab { padding: 9px 16px; border-radius: 10px; font-size: 12px; font-weight: 800; letter-spacing: .5px;
          text-transform: uppercase; cursor: pointer; border: 1px solid #e2e8f0; background: #fff; color: #64748b;
          font-family: inherit; transition: all .15s; }
        .cst-row { display: grid; gap: 10px; padding: 9px 10px; align-items: center; font-size: 12.5px; }
        .cst-row:not(:last-child) { border-bottom: 1px solid #f1f5f9; }
        .cst-head { font-size: 9.5px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; color: #94a3b8; border-bottom: 1px solid #e2e8f0 !important; }
        .cst-total { border-radius: 8px; border: 1px solid transparent; margin-top: 2px; }
        .cst-kpis { display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px; margin-bottom: 22px; }
        @media (max-width: 1000px) { .cst-kpis { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 640px) {
          .cst-kpis { grid-template-columns: repeat(2, 1fr); }
          .cst-row { font-size: 11px; gap: 6px; }
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', color: '#009c3b', marginBottom: 8 }}>BFWC 2026 · Financeiro</div>
        <h1 style={{ fontSize: 42, fontWeight: 900, letterSpacing: -2, lineHeight: 1, color: '#0f172a', margin: 0 }}>Custos do Evento</h1>
        <p style={{ fontSize: 13, color: '#64748b', marginTop: 8 }}>Painel de operação e custos — planilha completa por aba.</p>
      </div>

      {/* Tabs */}
      <div className="cst-tabs">
        {SHEETS.map((s, i) => {
          const c = TAB_COLORS[s.name] || '#009c3b';
          const active = i === tab;
          return (
            <button key={s.name} className="cst-tab" onClick={() => setTab(i)}
              style={active ? { background: c + '18', color: c, borderColor: c + '40' } : {}}>
              {s.name}
            </button>
          );
        })}
      </div>

      <SheetView sheet={sheet} color={color} />
    </div>
  );
}
