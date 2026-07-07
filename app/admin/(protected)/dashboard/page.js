'use client';

import { useState, useEffect } from 'react';

// ── Country name → ISO-2 code ──────────────────────────────────────────────
function countryCode(name = '') {
  const map = {
    // Português
    'brasil': 'br', 'brazil': 'br',
    'estados unidos': 'us', 'eua': 'us',
    'méxico': 'mx', 'mexico': 'mx',
    'argentina': 'ar',
    'canadá': 'ca', 'canada': 'ca',
    'alemanha': 'de', 'germany': 'de',
    'japão': 'jp', 'japan': 'jp',
    'itália': 'it', 'italy': 'it',
    'espanha': 'es', 'spain': 'es',
    'austrália': 'au', 'australia': 'au',
    'chile': 'cl',
    'colômbia': 'co', 'colombia': 'co',
    'peru': 'pe', 'perú': 'pe',
    'venezuela': 've',
    'bolívia': 'bo', 'bolivia': 'bo',
    'paraguai': 'py', 'paraguay': 'py',
    'uruguai': 'uy', 'uruguay': 'uy',
    'equador': 'ec', 'ecuador': 'ec',
    'reino unido': 'gb', 'uk': 'gb', 'united kingdom': 'gb',
    'irlanda': 'ie', 'ireland': 'ie',
    'frança': 'fr', 'france': 'fr',
    'portugal': 'pt',
    'china': 'cn',
    'coreia do sul': 'kr', 'korea': 'kr', 'south korea': 'kr',
    'índia': 'in', 'india': 'in',
    'rússia': 'ru', 'russia': 'ru',
    'polônia': 'pl', 'poland': 'pl',
    'holanda': 'nl', 'netherlands': 'nl', 'países baixos': 'nl',
    'bélgica': 'be', 'belgium': 'be',
    'suíça': 'ch', 'switzerland': 'ch',
    'suécia': 'se', 'sweden': 'se',
    'noruega': 'no', 'norway': 'no',
    'dinamarca': 'dk', 'denmark': 'dk',
    'finlândia': 'fi', 'finland': 'fi',
    'áustria': 'at', 'austria': 'at',
    'nova zelândia': 'nz', 'new zealand': 'nz',
    'filipinas': 'ph', 'philippines': 'ph',
    'tailândia': 'th', 'thailand': 'th',
    'indonésia': 'id', 'indonesia': 'id',
    'guatemala': 'gt',
    'honduras': 'hn',
    'costa rica': 'cr',
    'panamá': 'pa', 'panama': 'pa',
    'porto rico': 'pr', 'puerto rico': 'pr',
    'república dominicana': 'do', 'dominican republic': 'do',
    'cuba': 'cu',
    'jamaica': 'jm',
    'nicarágua': 'ni', 'nicaragua': 'ni',
    'el salvador': 'sv',
    'israel': 'il',
    'turquia': 'tr', 'turkey': 'tr',
    'egito': 'eg', 'egypt': 'eg',
    'nigéria': 'ng', 'nigeria': 'ng',
    'africa do sul': 'za', 'south africa': 'za',
    'ghana': 'gh',
    'quênia': 'ke', 'kenya': 'ke',
    'haiti': 'ht',
    'trinidad e tobago': 'tt',
    'guiana': 'gy',
    'suriname': 'sr',
    'senegal': 'sn',
    'marrocos': 'ma', 'morocco': 'ma',
    'tunísia': 'tn', 'tunisia': 'tn',
    'angola': 'ao',
    'moçambique': 'mz',
    'cabo verde': 'cv',
    'taiwan': 'tw',
    'hong kong': 'hk',
    'singapura': 'sg', 'singapore': 'sg',
    'malásia': 'my', 'malaysia': 'my',
    'vietnã': 'vn', 'vietnam': 'vn',
    'nova caledônia': 'nc',
    'tahiti': 'pf', 'polinésia francesa': 'pf',
  };
  return map[name.trim().toLowerCase()] || null;
}

// ── Flag image component ───────────────────────────────────────────────────
function FlagImg({ country, size = 24 }) {
  const code = countryCode(country);
  if (!code) {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: size + 8, height: Math.round(size * 0.67),
        background: '#f1f5f9', borderRadius: 3,
        fontSize: 9, fontWeight: 800, color: '#94a3b8',
        letterSpacing: .5,
      }}>?</span>
    );
  }
  return (
    <img
      src={`https://flagcdn.com/w40/${code}.png`}
      srcSet={`https://flagcdn.com/w40/${code}.png 1x, https://flagcdn.com/w80/${code}.png 2x`}
      width={size + 8}
      height={Math.round((size + 8) * 0.67)}
      alt={country}
      style={{ borderRadius: 3, objectFit: 'cover', flexShrink: 0, display: 'block' }}
      onError={e => { e.target.style.display = 'none'; }}
    />
  );
}

// ── Normalize country name for grouping ────────────────────────────────────
function normalizeCountryDisplay(name = '') {
  const overrides = {
    'brasil': 'Brasil',
    'brazil': 'Brasil',
    'estados unidos': 'Estados Unidos',
    'eua': 'Estados Unidos',
    'usa': 'Estados Unidos',
    'united states': 'Estados Unidos',
    'méxico': 'México',
    'mexico': 'México',
    'irlanda': 'Irlanda',
    'ireland': 'Irlanda',
    'perú': 'Peru',
    'peru': 'Peru',
    'polônia': 'Polônia',
    'poland': 'Polônia',
    'alemanha': 'Alemanha',
    'germany': 'Alemanha',
    'argentina': 'Argentina',
    'chile': 'Chile',
    'portugal': 'Portugal',
    'canadá': 'Canadá',
    'canada': 'Canadá',
    'colômbia': 'Colômbia',
    'colombia': 'Colômbia',
    'venezuela': 'Venezuela',
    'paraguai': 'Paraguai',
    'uruguai': 'Uruguai',
    'equador': 'Equador',
    'bolívia': 'Bolívia',
    'coreia do sul': 'Coreia do Sul',
    'south korea': 'Coreia do Sul',
    'japão': 'Japão',
    'japan': 'Japão',
    'china': 'China',
    'itália': 'Itália',
    'italy': 'Itália',
    'espanha': 'Espanha',
    'spain': 'Espanha',
    'austrália': 'Austrália',
    'australia': 'Austrália',
    'reino unido': 'Reino Unido',
    'uk': 'Reino Unido',
    'united kingdom': 'Reino Unido',
    'frança': 'França',
    'france': 'França',
  };
  const key = name.trim().toLowerCase();
  return overrides[key] || name.trim();
}

// ── Group teams by country ─────────────────────────────────────────────────
function groupByCountry(teams) {
  const map = {};
  teams.forEach(t => {
    const raw = (t.country || 'Desconhecido').trim();
    const display = normalizeCountryDisplay(raw);
    const key = display.toLowerCase();
    if (!map[key]) map[key] = { country: display, total: 0, masc: 0, fem: 0, sub12: 0, sub15: 0 };
    const d = detectCats(t.category);
    const hasMasc  = d.masc  ? 1 : 0;
    const hasFem   = d.fem   ? 1 : 0;
    const hasSub12 = d.sub12 ? 1 : 0;
    const hasSub15 = d.sub15 ? 1 : 0;
    map[key].masc  += hasMasc;
    map[key].fem   += hasFem;
    map[key].sub12 += hasSub12;
    map[key].sub15 += hasSub15;
    map[key].total += hasMasc + hasFem + hasSub12 + hasSub15;
  });
  return Object.values(map).sort((a, b) => b.total - a.total);
}

// ── Category pill ──────────────────────────────────────────────────────────
const CAT_COLORS = {
  masc:  { bg: 'rgba(77,138,255,.15)',  border: 'rgba(77,138,255,.3)',  text: '#4d8aff',  label: 'Masc' },
  fem:   { bg: 'rgba(232,77,255,.15)',  border: 'rgba(232,77,255,.3)',  text: '#e84dff',  label: 'Fem'  },
  sub12: { bg: 'rgba(255,180,0,.12)',   border: 'rgba(255,180,0,.3)',   text: '#ffb400',  label: 'Sub 12' },
  sub15: { bg: 'rgba(32,227,63,.12)',   border: 'rgba(32,227,63,.28)',  text: '#009c3b',  label: 'Sub 15' },
};

function CatPill({ count, type }) {
  const c = CAT_COLORS[type];
  if (!count) return (
    <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, minWidth: 50, textAlign: 'center' }}>—</span>
  );
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4, minWidth: 50, justifyContent: 'center',
      padding: '3px 8px', borderRadius: 20,
      background: c.bg, border: `1px solid ${c.border}`,
      fontSize: 11, fontWeight: 800, color: c.text, letterSpacing: .3,
    }}>
      {count} <span style={{ fontSize: 9, fontWeight: 600, opacity: .8 }}>{c.label}</span>
    </span>
  );
}

// ── Shared helpers ─────────────────────────────────────────────────────────
const CATS = [
  { key: 'masc',  label: 'Masculino', match: 'masculino' },
  { key: 'fem',   label: 'Feminino',  match: 'feminino'  },
  { key: 'sub12', label: 'Sub 12',    match: 'sub 12'    },
  { key: 'sub15', label: 'Sub 15',    match: 'sub 15'    },
];

// Detecta categorias em PT / EN / ES (e Sub com hífen ou espaço)
function detectCats(category = '') {
  const c = (category || '').toLowerCase();
  return {
    masc:  /masculin|\bmen\b|\bmale\b|hombre/.test(c),
    fem:   /feminin|femenin|\bwomen\b|\bfemale\b|mujer/.test(c),
    sub12: /sub[\s-]?12|u-?12/.test(c),
    sub15: /sub[\s-]?15|u-?15/.test(c),
  };
}

function hasCat(team, key) {
  return !!detectCats(team.category)[key];
}

function catBreakdown(teams) {
  return CATS.map(c => ({
    label: c.label,
    teams: teams.filter(t => hasCat(t, c.key)).length,
    athletes: teams.filter(t => hasCat(t, c.key))
                   .reduce((s, t) => s + (parseInt(t.athletes_count) || 0), 0),
  }));
}

// ── Panel component ────────────────────────────────────────────────────────
function Panel({ title, badge, badgeColor, total, totalLabel, cats, catKey, loading }) {
  return (
    <div style={{
      background: '#ffffff',
      border: `1px solid ${badgeColor}22`,
      borderRadius: 22, padding: '28px 30px',
      boxShadow: '0 1px 4px rgba(0,0,0,.06)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
        <span style={{
          fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase',
          padding: '4px 10px', borderRadius: 6,
          background: badgeColor + '18', color: badgeColor, border: `1px solid ${badgeColor}35`,
        }}>{badge}</span>
        <span style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>{title}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, marginBottom: 24 }}>
        <div>
          <div style={{
            fontSize: 72, fontWeight: 900, letterSpacing: -4, lineHeight: 1,
            color: loading ? '#e2e8f0' : (total > 0 ? badgeColor : '#cbd5e1'),
          }}>
            {loading ? '—' : total}
          </div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>{totalLabel}</div>
        </div>
        {cats && (
          <div>
            <div style={{
              fontSize: 72, fontWeight: 900, letterSpacing: -4, lineHeight: 1,
              color: loading ? '#e2e8f0' : '#009c3b',
            }}>
              {loading ? '—' : cats.reduce((s, c) => s + c[catKey], 0)}
            </div>
            <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>
              inscrições/categoria
            </div>
          </div>
        )}
      </div>
      <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 20 }}>
        <div className="dash-grid-cats">
          {cats.map(c => (
            <div key={c.label} style={{
              background: '#f8fafc', border: '1px solid #e2e8f0',
              borderRadius: 12, padding: '14px 10px', textAlign: 'center',
            }}>
              <div style={{
                fontSize: 26, fontWeight: 900, letterSpacing: -1.5, lineHeight: 1,
                color: loading ? '#e2e8f0' : (c[catKey] > 0 ? '#0f172a' : '#cbd5e1'),
              }}>
                {loading ? '—' : c[catKey]}
              </div>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#94a3b8', marginTop: 5 }}>
                {c.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────
const BRL = (cents) => (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// Mesmas etapas da aba Times › Inscrições
const PIPE_COLS = [
  { key: 'pre',        label: 'Pré-inscritos',        sub: 'ainda não se cadastraram',  color: '#a855f7' },
  { key: 'cadastro',   label: 'Cadastro realizado',   sub: 'sem parcela paga',          color: '#0D4BFF' },
  { key: 'vaga',       label: 'Vaga garantida',       sub: '≥ 1 parcela paga',          color: '#ea580c' },
  { key: 'pago',       label: 'Pagamento total',      sub: 'todas as parcelas',         color: '#009c3b' },
  { key: 'atletas',    label: 'Atletas inscritos',    sub: 'escalação enviada',         color: '#14b8a6' },
  { key: 'finalizada', label: 'Inscrição finalizada', sub: 'documentos validados',      color: '#031020' },
  { key: 'rejeitados', label: 'Rejeitados',           sub: 'pré-inscrição ou cadastro', color: '#ff4444' },
];

export default function DashboardPage() {
  const [pipe, setPipe] = useState(null);
  const [fin, setFin]   = useState(null);

  useEffect(() => {
    fetch('/api/admin/pipeline').then(r => r.json()).then(d => { if (d.ok) setPipe(d); }).catch(() => {});
    fetch('/api/admin/financial').then(r => r.json()).then(d => { if (d.ok) setFin(d); }).catch(() => {});
  }, []);

  const loading = pipe === null;
  const cols = pipe?.cols || {};
  const counts = pipe?.counts || {};
  const portalTeams = ['cadastro', 'vaga', 'pago', 'atletas', 'finalizada'].flatMap(k => cols[k] || []);
  const rosterAthletes = portalTeams.reduce((s, t) => s + (t.athletes || 0), 0);
  const teamsWithRoster = portalTeams.filter(t => (t.athletes || 0) > 0).length;

  // Países: pré-inscritos ativos + todos os times do portal (linha do tempo, sem rejeitados)
  const countries = groupByCountry([...(cols.pre || []), ...portalTeams]);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: '#0f172a' }}>
      <style>{`
        .dash-grid-2    { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
        .dash-grid-3    { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; margin-bottom: 28px; }
        .dash-grid-cats { display: grid; grid-template-columns: repeat(4,1fr); gap: 8px; }
        .dash-pipe      { display: grid; grid-template-columns: repeat(7,1fr); gap: 8px; }
        @media (max-width: 1100px) { .dash-pipe { grid-template-columns: repeat(4,1fr); } }
        .dash-ctr { cursor: default; transition: background .15s; }
        .dash-ctr:hover { background: #f8fafc !important; }
        @media (max-width: 640px) {
          .dash-grid-2    { grid-template-columns: 1fr !important; }
          .dash-grid-3    { grid-template-columns: 1fr 1fr !important; }
          .dash-grid-cats { grid-template-columns: repeat(2,1fr) !important; }
          .dash-pipe      { grid-template-columns: repeat(2,1fr) !important; }
          .dash-title     { font-size: 32px !important; letter-spacing: -1px !important; }
          .hide-sm        { display: none !important; }
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', color: '#009c3b', marginBottom: 8 }}>
          BFWC 2026 · Painel de Controle
        </div>
        <h1 className="dash-title" style={{ fontSize: 44, fontWeight: 900, letterSpacing: -2, lineHeight: 1, color: '#0f172a' }}>
          Dashboard
        </h1>
      </div>

      {/* Linha do tempo das inscrições — mesma da aba Times */}
      <a href="/admin/teams" style={{ textDecoration: 'none', color: 'inherit' }}>
        <div style={{
          background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 22,
          padding: '26px 28px', marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,.06)',
          cursor: 'pointer', transition: 'border-color .2s',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <span style={{
              fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase',
              padding: '4px 10px', borderRadius: 6,
              background: 'rgba(13,75,255,.12)', color: '#0D4BFF', border: '1px solid rgba(13,75,255,.3)',
            }}>Times</span>
            <span style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Linha do tempo das inscrições</span>
            <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 700, color: '#0D4BFF' }}>Abrir Inscrições →</span>
          </div>
          <div className="dash-pipe">
            {PIPE_COLS.map(c => (
              <div key={c.key} style={{
                background: '#f8fafc', border: '1px solid #e2e8f0',
                borderRadius: 14, padding: '14px 14px', borderTop: `3px solid ${c.color}`,
              }}>
                <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', color: '#64748b', marginBottom: 8, lineHeight: 1.3 }}>{c.label}</div>
                <div style={{ fontSize: 30, fontWeight: 900, letterSpacing: -2, lineHeight: 1, color: loading ? '#e2e8f0' : ((counts[c.key] ?? 0) > 0 ? '#0f172a' : '#cbd5e1') }}>
                  {loading ? '—' : (counts[c.key] ?? 0)}
                </div>
                <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 6, lineHeight: 1.3 }}>{c.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </a>

      {/* Atletas */}
      <a href="/admin/athletes" style={{ textDecoration: 'none', color: 'inherit' }}>
        <div style={{
          background: '#ffffff',
          border: '1px solid rgba(13,75,255,.22)', borderRadius: 22, padding: '28px 30px', marginBottom: 16,
          boxShadow: '0 1px 4px rgba(0,0,0,.06)', cursor: 'pointer',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
            <span style={{
              fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase',
              padding: '4px 10px', borderRadius: 6,
              background: 'rgba(13,75,255,.15)', color: '#4d8aff', border: '1px solid rgba(13,75,255,.35)',
            }}>Atletas</span>
            <span style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Atletas no roster dos times</span>
            <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 700, color: '#4d8aff' }}>Ver por time →</span>
          </div>
          <div style={{
            fontSize: 72, fontWeight: 900, letterSpacing: -4, lineHeight: 1,
            color: loading ? '#e2e8f0' : (rosterAthletes > 0 ? '#4d8aff' : '#cbd5e1'),
          }}>
            {loading ? '—' : rosterAthletes}
          </div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 6 }}>
            atletas cadastrados em {loading ? '—' : teamsWithRoster} time{teamsWithRoster !== 1 ? 's' : ''} no portal
          </div>
        </div>
      </a>

      {/* ── Resumo Financeiro ─────────────────────────────────────────────── */}
      <a href="/admin/financeiro" style={{ textDecoration: 'none', color: 'inherit' }}>
        <div style={{
          background: '#ffffff', border: '1px solid rgba(0,156,59,.25)', borderRadius: 22,
          padding: '28px 30px', marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,.06)',
          cursor: 'pointer', transition: 'border-color .2s',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', padding: '4px 10px', borderRadius: 6, background: 'rgba(0,156,59,.15)', color: '#009c3b', border: '1px solid rgba(0,156,59,.35)' }}>Financeiro</span>
            <span style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Resumo de Pagamentos</span>
            <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 700, color: '#009c3b' }}>Ver detalhes →</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }} className="dash-grid-cats">
            {[
              { label: 'Arrecadado',  value: fin ? BRL(fin.totals.arrecadado_cents) : '—', color: '#009c3b' },
              { label: 'A receber',   value: fin ? BRL(fin.totals.a_receber_cents)  : '—', color: '#ea580c' },
              { label: 'Esperado',    value: fin ? BRL(fin.totals.esperado_cents)   : '—', color: '#0f172a' },
            ].map(s => (
              <div key={s.label} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '16px 14px' }}>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', color: '#94a3b8', marginBottom: 8 }}>{s.label}</div>
                <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: -1, color: fin ? s.color : '#e2e8f0', lineHeight: 1 }}>{s.value}</div>
              </div>
            ))}
          </div>
          {fin && (
            <div style={{ marginTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 700 }}>{fin.totals.pct}% arrecadado{fin.overdue.length ? ` · ${fin.overdue.length} parcela(s) em atraso` : ''}</span>
              </div>
              <div style={{ height: 8, borderRadius: 6, background: '#f1f5f9', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(fin.totals.pct, 100)}%`, height: '100%', background: 'linear-gradient(90deg,#009c3b,#22e06a)' }} />
              </div>
            </div>
          )}
        </div>
      </a>

      {/* ── Países ──────────────────────────────────────────────────────────── */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 22, padding: '28px 30px', marginBottom: 16,
        boxShadow: '0 1px 4px rgba(0,0,0,.06)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <span style={{
            fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase',
            padding: '4px 10px', borderRadius: 6,
            background: 'rgba(244,255,0,.1)', color: '#009c3b', border: '1px solid rgba(244,255,0,.25)',
          }}>Países</span>
          <span style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Times por País</span>
          {!loading && (
            <span style={{
              marginLeft: 'auto', fontSize: 12, fontWeight: 700,
              color: '#64748b', letterSpacing: .3,
            }}>
              {countries.length} {countries.length === 1 ? 'país' : 'países'}
            </span>
          )}
        </div>

        {loading ? (
          <div style={{ padding: '32px 0', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
            Carregando...
          </div>
        ) : countries.length === 0 ? (
          <div style={{ padding: '32px 0', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
            Nenhum time registrado
          </div>
        ) : (
          <>
            {/* Column headers */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 72px 120px 120px 120px 120px',
              padding: '6px 16px 10px',
              fontSize: 9, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase',
              color: '#94a3b8',
              borderBottom: '1px solid #e2e8f0',
              marginBottom: 6,
            }}>
              <span>País</span>
              <span style={{ textAlign: 'center' }}>Equipes</span>
              <span className="hide-sm" style={{ textAlign: 'center' }}>Masculino</span>
              <span className="hide-sm" style={{ textAlign: 'center' }}>Feminino</span>
              <span style={{ textAlign: 'center' }}>Sub 12</span>
              <span style={{ textAlign: 'center' }}>Sub 15</span>
            </div>

            {/* Rows */}
            {countries.map((c, i) => (
              <div
                key={c.country}
                className="dash-ctr"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 72px 120px 120px 120px 120px',
                  padding: '12px 16px',
                  borderRadius: 12,
                  alignItems: 'center',
                  background: i === 0
                    ? 'rgba(244,255,0,.04)'
                    : i % 2 === 0 ? '#f8fafc' : 'transparent',
                  borderLeft: i === 0 ? '2px solid rgba(244,255,0,.35)' : '2px solid transparent',
                  marginBottom: 2,
                }}
              >
                {/* Flag + name */}
                <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <FlagImg country={c.country} size={22} />
                  <span style={{
                    fontSize: 13, fontWeight: i === 0 ? 800 : 700,
                    color: '#0f172a',
                  }}>
                    {c.country}
                  </span>
                  {i === 0 && (
                    <span style={{
                      fontSize: 9, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase',
                      padding: '2px 7px', borderRadius: 4,
                      background: 'rgba(244,255,0,.12)', color: '#009c3b', border: '1px solid rgba(244,255,0,.25)',
                    }}>
                      #1
                    </span>
                  )}
                </span>

                {/* Total */}
                <span style={{
                  textAlign: 'center',
                  fontSize: i === 0 ? 22 : 18,
                  fontWeight: 900, letterSpacing: -1,
                  color: i === 0 ? '#009c3b' : '#0f172a',
                }}>
                  {c.total}
                </span>

                {/* Masc */}
                <span className="hide-sm" style={{ textAlign: 'center' }}>
                  <CatPill count={c.masc} type="masc" />
                </span>

                {/* Fem */}
                <span className="hide-sm" style={{ textAlign: 'center' }}>
                  <CatPill count={c.fem} type="fem" />
                </span>

                {/* Sub 12 */}
                <span style={{ textAlign: 'center' }}>
                  <CatPill count={c.sub12} type="sub12" />
                </span>

                {/* Sub 15 */}
                <span style={{ textAlign: 'center' }}>
                  <CatPill count={c.sub15} type="sub15" />
                </span>
              </div>
            ))}

            {/* Footer total */}
            <div style={{
              marginTop: 12, paddingTop: 12,
              borderTop: '1px solid #e2e8f0',
              display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8,
            }}>
              <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Total geral:</span>
              <span style={{ fontSize: 14, fontWeight: 900, color: '#009c3b', letterSpacing: -.5 }}>
                {countries.reduce((s, c) => s + c.total, 0)} equipes
              </span>
              <span style={{ fontSize: 11, color: '#94a3b8' }}>em</span>
              <span style={{ fontSize: 14, fontWeight: 900, color: '#0f172a', letterSpacing: -.5 }}>
                {countries.length} {countries.length === 1 ? 'país' : 'países'}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Quick access */}
      <div style={{
        padding: '18px 22px', background: '#f8fafc',
        border: '1px solid #e2e8f0', borderRadius: 14,
        display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Acesso rápido →</span>
        {[
          { href: '/admin/teams',    label: 'Inscrições'  },
          { href: '/admin/athletes', label: 'Atletas'     },
          { href: '/admin/crm',      label: 'Comunicação' },
        ].map(b => (
          <a key={b.href} href={b.href} style={{
            padding: '7px 16px', borderRadius: 9, fontSize: 12, fontWeight: 700,
            background: 'rgba(244,255,0,.08)', border: '1px solid rgba(244,255,0,.2)',
            color: '#009c3b', textDecoration: 'none',
          }}>{b.label}</a>
        ))}
      </div>
    </div>
  );
}
