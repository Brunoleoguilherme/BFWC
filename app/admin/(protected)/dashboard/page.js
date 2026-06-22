'use client';

import { useState, useEffect } from 'react';

const CATS = [
  { key: 'masc',  label: 'Masculino', match: 'masculino' },
  { key: 'fem',   label: 'Feminino',  match: 'feminino'  },
  { key: 'sub12', label: 'Sub 12',    match: 'sub 12'    },
  { key: 'sub15', label: 'Sub 15',    match: 'sub 15'    },
];

function hasCat(team, match) {
  return (team.category || '').toLowerCase().includes(match);
}

function catBreakdown(teams) {
  return CATS.map(c => ({
    label: c.label,
    teams: teams.filter(t => hasCat(t, c.match)).length,
    athletes: teams.filter(t => hasCat(t, c.match))
                   .reduce((s, t) => s + (parseInt(t.athletes_count) || 0), 0),
  }));
}

function StatBlock({ label, value, color = '#fff', dim = false }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        fontSize: 28, fontWeight: 900, letterSpacing: -1.5, lineHeight: 1,
        color: value > 0 ? color : 'rgba(255,255,255,.15)',
      }}>
        {value ?? '—'}
      </div>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,.28)', marginTop: 5 }}>
        {label}
      </div>
    </div>
  );
}

function Panel({ title, badge, badgeColor, total, totalLabel, cats, catKey, loading }) {
  return (
    <div style={{
      background: 'linear-gradient(145deg, rgba(6,27,58,.55), rgba(2,8,22,.5))',
      border: `1px solid ${badgeColor}22`,
      borderRadius: 22, padding: '28px 30px',
      boxShadow: `0 0 60px ${badgeColor}08`,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
        <span style={{
          fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase',
          padding: '4px 10px', borderRadius: 6,
          background: badgeColor + '18', color: badgeColor, border: `1px solid ${badgeColor}35`,
        }}>{badge}</span>
        <span style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>{title}</span>
      </div>

      {/* Big number */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, marginBottom: 24 }}>
        <div>
          <div style={{
            fontSize: 72, fontWeight: 900, letterSpacing: -4, lineHeight: 1,
            color: loading ? 'rgba(255,255,255,.1)' : (total > 0 ? badgeColor : 'rgba(255,255,255,.15)'),
          }}>
            {loading ? '—' : total}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.3)', marginTop: 4 }}>{totalLabel}</div>
        </div>
        {cats && (
          <div style={{}}>

            <div style={{
              fontSize: 72, fontWeight: 900, letterSpacing: -4, lineHeight: 1,
              color: loading ? 'rgba(255,255,255,.1)' : '#f4ff00',
            }}>
              {loading ? '—' : cats.reduce((s, c) => s + c[catKey], 0)}
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.2)', marginTop: 4, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>
              inscrições/categoria
            </div>
          </div>
        )}
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,.06)', paddingTop: 20 }}>
        <div className="dash-grid-cats">
          {cats.map(c => (
            <div key={c.label} style={{
              background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)',
              borderRadius: 12, padding: '14px 10px', textAlign: 'center',
            }}>
              <div style={{
                fontSize: 26, fontWeight: 900, letterSpacing: -1.5, lineHeight: 1,
                color: loading ? 'rgba(255,255,255,.1)' : (c[catKey] > 0 ? '#fff' : 'rgba(255,255,255,.15)'),
              }}>
                {loading ? '—' : c[catKey]}
              </div>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255,255,255,.25)', marginTop: 5 }}>
                {c.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [teams, setTeams] = useState(null);

  useEffect(() => {
    fetch('/api/admin/teams').then(r => r.json()).then(d => setTeams(d.teams || []));
  }, []);

  const loading = teams === null;

  const preInscritos  = (teams || []).filter(t => t.status === 'pre_inscrito');
  const confirmados   = (teams || []).filter(t => t.status === 'inscricao_confirmada');
  const pendentes     = (teams || []).filter(t => t.status === 'pendente_analise').length;
  const rejeitados    = (teams || []).filter(t => t.status === 'rejeitado').length;
  const emRevisao     = (teams || []).filter(t => t.status === 'em_revisao').length;

  const preCats  = catBreakdown(preInscritos);
  const confCats = catBreakdown(confirmados);

  const allAthletes = [...preInscritos, ...confirmados];
  const totalAthletes = allAthletes.reduce((s, t) => s + (parseInt(t.athletes_count) || 0), 0);

  // Per-category athlete counts (uses specific fields when available, else 0)
  const athByCat = {
    masc:  allAthletes.reduce((s, t) => s + (parseInt(t.athletes_masc)  || 0), 0),
    fem:   allAthletes.reduce((s, t) => s + (parseInt(t.athletes_fem)   || 0), 0),
    sub15: allAthletes.reduce((s, t) => s + (parseInt(t.athletes_sub15) || 0), 0),
    sub12: allAthletes.reduce((s, t) => s + (parseInt(t.athletes_sub12) || 0), 0),
  };
  const hasCatData = Object.values(athByCat).some(v => v > 0);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: '#fff' }}>
      <style>{`
        .dash-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
        .dash-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 28px; }
        .dash-grid-cats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
        @media (max-width: 640px) {
          .dash-grid-2 { grid-template-columns: 1fr !important; }
          .dash-grid-3 { grid-template-columns: 1fr 1fr !important; }
          .dash-grid-cats { grid-template-columns: repeat(2, 1fr) !important; }
          .dash-title { font-size: 32px !important; letter-spacing: -1px !important; }
          .dash-big-num { font-size: 52px !important; }
          .dash-panel { padding: 20px 18px !important; }
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', color: '#f4ff00', marginBottom: 8 }}>
          BFWC 2026 · Painel de Controle
        </div>
        <h1 className="dash-title" style={{ fontSize: 44, fontWeight: 900, letterSpacing: -2, lineHeight: 1, color: '#fff' }}>
          Dashboard
        </h1>
      </div>

      {/* Pré-inscritos + Confirmados */}
      <div className="dash-grid-2">
        <Panel
          title="Times Pré-inscritos"
          badge="Pré-inscritos"
          badgeColor="#a855f7"
          total={preInscritos.length}
          totalLabel="times registrados"
          cats={preCats}
          catKey="teams"
          loading={loading}
        />
        <Panel
          title="Times Confirmados"
          badge="Confirmados"
          badgeColor="#20e33f"
          total={confirmados.length}
          totalLabel="inscrições confirmadas"
          cats={confCats}
          catKey="teams"
          loading={loading}
        />
      </div>

      {/* Atletas */}
      <div style={{
        background: 'linear-gradient(145deg, rgba(6,27,58,.55), rgba(2,8,22,.5))',
        border: '1px solid rgba(13,75,255,.22)', borderRadius: 22, padding: '28px 30px',
        marginBottom: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
          <span style={{
            fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase',
            padding: '4px 10px', borderRadius: 6,
            background: 'rgba(13,75,255,.15)', color: '#4d8aff', border: '1px solid rgba(13,75,255,.35)',
          }}>Atletas</span>
          <span style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>Total de Atletas Registrados</span>
        </div>
        <div style={{
          fontSize: 72, fontWeight: 900, letterSpacing: -4, lineHeight: 1,
          color: loading ? 'rgba(255,255,255,.1)' : (totalAthletes > 0 ? '#4d8aff' : 'rgba(255,255,255,.15)'),
        }}>
          {loading ? '—' : totalAthletes}
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,.3)', marginTop: 6 }}>
          atletas entre pré-inscritos e confirmados
        </div>
      </div>

      {/* Pendentes + Rejeitados + Em Revisão */}
      <div className="dash-grid-3">
        {[
          { label: 'Pendentes de Análise', value: pendentes, color: '#f4ff00', href: '/admin/teams?status=pendente_analise' },
          { label: 'Em Revisão',           value: emRevisao, color: '#a855f7', href: '/admin/teams?status=em_revisao'       },
          { label: 'Rejeitados',           value: rejeitados, color: '#ff4444', href: '/admin/teams?status=rejeitado'        },
        ].map(s => (
          <a key={s.label} href={s.href} style={{ textDecoration: 'none' }}>
            <div style={{
              padding: '24px 26px',
              background: 'linear-gradient(145deg, rgba(6,27,58,.55), rgba(2,8,22,.5))',
              border: `1px solid ${s.value > 0 ? s.color + '30' : 'rgba(255,255,255,.07)'}`,
              borderRadius: 18, cursor: 'pointer', transition: 'border-color .2s',
            }}>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,.3)', marginBottom: 10 }}>
                {s.label}
              </div>
              <div style={{
                fontSize: 48, fontWeight: 900, letterSpacing: -3, lineHeight: 1,
                color: loading ? 'rgba(255,255,255,.1)' : (s.value > 0 ? s.color : 'rgba(255,255,255,.15)'),
              }}>
                {loading ? '—' : s.value}
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* Quick access */}
      <div style={{
        padding: '18px 22px', background: 'rgba(255,255,255,.02)',
        border: '1px solid rgba(255,255,255,.06)', borderRadius: 14,
        display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,.3)', fontWeight: 600 }}>Acesso rápido →</span>
        {[
          { href: '/admin/teams', label: 'Ver CRM' },
          { href: '/admin/crm',   label: 'Comunicação' },
        ].map(b => (
          <a key={b.href} href={b.href} style={{
            padding: '7px 16px', borderRadius: 9, fontSize: 12, fontWeight: 700,
            background: 'rgba(244,255,0,.08)', border: '1px solid rgba(244,255,0,.2)',
            color: '#f4ff00', textDecoration: 'none',
          }}>{b.label}</a>
        ))}
      </div>
    </div>
  );
}
