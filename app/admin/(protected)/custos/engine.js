// Motor de cálculo que replica as fórmulas do Excel (SUM, COMBIN, CEILING, INT, IFERROR,
// referências entre abas). Verificado célula a célula contra a planilha original.
import { GRID } from './grid';

const RE_SHEETREF = /([A-Za-zÀ-ÿ]+)!(\$?[A-Z]+\$?\d+)/g;
const RE_REF = /\$?[A-Z]+\$?\d+/g;

function colToNum(c) { let n = 0; for (const ch of c) n = n * 26 + (ch.charCodeAt(0) - 64); return n; }
function numToCol(n) { let s = ''; while (n > 0) { const r = (n - 1) % 26; s = String.fromCharCode(65 + r) + s; n = (n - r - 1) / 26; } return s; }
function splitCoord(co) { const m = co.match(/^([A-Z]+)(\d+)$/); return [m[1], parseInt(m[2], 10)]; }

function COMBIN(n, k) { let r = 1; for (let i = 0; i < k; i++) r = r * (n - i) / (i + 1); return Math.round(r); }
function CEILING(x, sig) { sig = sig || 1; return Math.ceil(x / sig) * sig; }
function INT(x) { return Math.floor(x); }
const IFERROR = (a, b) => (a == null || Number.isNaN(a) || !Number.isFinite(a)) ? b : a;

// Retorna um contexto de cálculo para um dado conjunto de valores de entrada (overrides).
// inputs: mapa "SHEET!COORD" -> número (ou string numérica). Vazio => valores da planilha.
export function computeAll(inputs = {}) {
  const memo = {};

  function getCell(sheet, coRaw) {
    const co = coRaw.replace(/\$/g, '');
    const key = sheet + '!' + co;
    if (key in memo) return memo[key];
    memo[key] = 0; // guarda contra ciclos
    const cell = (GRID[sheet] || {})[co];
    const ov = inputs[key];
    const hasOv = ov !== undefined && ov !== null && ov !== '' && !Number.isNaN(Number(ov));
    let val = 0;
    if (cell && 'f' in cell) {
      val = evalFormula(sheet, cell.f);           // fórmula: sempre calculada
    } else if (hasOv) {
      val = Number(ov);                            // entrada preenchida pelo usuário
    } else if (cell && 'v' in cell) {
      val = cell.v;                                // constante da planilha
    } else {
      val = 0;                                     // vazio
    }
    memo[key] = val;
    return val;
  }

  function expandRange(sheet, rng) {
    let sh = sheet, r = rng.trim();
    const bang = r.indexOf('!');
    if (bang >= 0) { sh = r.slice(0, bang); r = r.slice(bang + 1); }
    const [a, b] = r.split(':').map(x => x.replace(/\$/g, ''));
    const [c1, r1] = splitCoord(a), [c2, r2] = splitCoord(b);
    const n1 = colToNum(c1), n2 = colToNum(c2);
    const out = [];
    for (let cc = Math.min(n1, n2); cc <= Math.max(n1, n2); cc++)
      for (let rr = Math.min(r1, r2); rr <= Math.max(r1, r2); rr++)
        out.push(getCell(sh, numToCol(cc) + rr));
    return out;
  }

  function evalFormula(sheet, f) {
    let s = f;
    // SUM(range) ou SUM(lista)
    s = s.replace(/SUM\(([^()]*)\)/g, (m, inner) => {
      if (inner.includes(':')) return '(' + expandRange(sheet, inner).reduce((a, b) => a + b, 0) + ')';
      const parts = inner.split(',').map(p => p.trim());
      let sum = 0;
      for (const p of parts) sum += /^[0-9.]+$/.test(p) ? parseFloat(p) : getCell(sheet, p);
      return '(' + sum + ')';
    });
    // referências com aba explícita
    s = s.replace(RE_SHEETREF, (m, sh, co) => '(' + getCell(sh, co) + ')');
    // referências simples da própria aba
    s = s.replace(RE_REF, (m) => '(' + getCell(sheet, m) + ')');
    let res;
    try {
      res = Function('COMBIN', 'CEILING', 'INT', 'IFERROR', '"use strict";return (' + s + ');')(COMBIN, CEILING, INT, IFERROR);
    } catch (e) { res = NaN; }
    return (res == null || Number.isNaN(res)) ? 0 : res;
  }

  const values = {};
  for (const sheet in GRID) for (const co in GRID[sheet]) values[sheet + '!' + co] = getCell(sheet, co);
  return { get: getCell, values };
}

// Uma célula é EDITÁVEL (entrada) quando NÃO é fórmula e está numa posição de entrada:
//  - constante numérica da planilha (premissa, quantidade, valor unitário), ou
//  - célula em branco nas colunas B/C de uma linha cujo Total (col D) é "B*C"
//    (ex.: preços unitários ainda não preenchidos).
export function isEditable(sheet, col, row) {
  const g = GRID[sheet] || {};
  const co = col + row;
  const cell = g[co];
  if (cell && 'f' in cell) return false;      // calculado -> travado
  if (cell && 'v' in cell) return true;       // constante numérica -> entrada
  if (cell && 's' in cell) return false;      // rótulo de texto
  if (col === 'B' || col === 'C') {
    const dcell = g['D' + row];
    if (dcell && 'f' in dcell && new RegExp('B' + row + '\\b').test(dcell.f) && new RegExp('C' + row + '\\b').test(dcell.f)) return true;
  }
  return false;
}
