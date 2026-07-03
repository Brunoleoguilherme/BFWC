'use client';

import { useState, useEffect, useMemo } from 'react';

const MEDAL = ['🥇', '🥈', '🥉'];

export default function RankingsPage() {
  const [data, setData] = useState(null);
  const [cat, setCat] = useState('all');
  const [q, setQ] = useState('');

  useEffect(() => {
    fetch('/api/rankings').then(r => r.json()).then(d => setData(d.ok ? d : { scorers: [], categories: [] }));
  }, []);

  const scorers = useMemo(() => {
    let s = data?.scorers || [];
    if (cat !== 'all') s = s.filter(x => x.category === cat);
    if (q.trim()) { const t = q.toLowerCase(); s = s.filter(x => x.name.toLowerCase().includes(t) || x.team_name?.toLowerCase().includes(t)); }
    return s;
  }, [data, cat, q]);

  const cats = ['Masculino', 'Feminino', 'Sub-15', 'Sub-12'];
  const COLS = '40px minmax(150px,1.6fr) minmax(110px,1fr) 46px 46px 46px 52px 48px 52px 52px 60px';
  const STAT_COLS = [['TD', 'td'], ['C1', 'conv1'], ['C2', 'conv2'], ['Int TD', 'int_td'], ['SAF', 'safety'], ['C1 ret', 'int_conv1'], ['C2 ret', 'int_conv2']];

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: '#0f172a', maxWidth: 860 }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', color: '#eab308', marginBottom: 8 }}>Campeonato</div>
        <h1 style={{ fontSize: 36, fontWeight: 900, letterSpacing: -1.5, margin: 0 }}>Ranking de Pontuadores</h1>
        <p style={{ fontSize: 12.5, color: '#64748b', marginTop: 6 }}>Alimentado pelas partidas confirmadas pelos delegados.</p>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 18, alignItems: 'center' }}>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar atleta ou time..." style={{ flex: 1, minWidth: 220, padding: '11px 14px', borderRadius: 10, fontSize: 13.5, border: '1px solid #e2e8f0', outline: 'none', fontFamily: 'inherit' }} />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['all', ...cats].map(c => (
            <button key={c} onClick={() => setCat(c)} style={{ padding: '8px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', border: 'none', background: cat === c ? '#031020' : '#e2e8f0', color: cat === c ? '#fff' : '#475569' }}>{c === 'all' ? 'Todas' : c}</button>
          ))}
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
        <div style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: 720 }}>
            <div style={{ display: 'grid', gridTemplateColumns: COLS, padding: '12px 18px', borderBottom: '1px solid #e2e8f0', fontSize: 9.5, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', color: '#94a3b8' }}>
              <span>#</span><span>Atleta</span><span>Time</span>
              {STAT_COLS.map(([lb]) => <span key={lb} style={{ textAlign: 'center' }}>{lb}</span>)}
              <span style={{ textAlign: 'right' }}>Pts</span>
            </div>
            {data === null ? <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Carregando...</div>
              : scorers.length === 0 ? <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Nenhuma pontuação registrada ainda. Os números aparecem conforme os delegados confirmam as partidas.</div>
              : scorers.map((s, i) => (
                <div key={(s.athlete_id || s.name) + i} style={{ display: 'grid', gridTemplateColumns: COLS, padding: '13px 18px', alignItems: 'center', borderBottom: i < scorers.length - 1 ? '1px solid #f1f5f9' : 'none', background: i < 3 ? 'rgba(234,179,8,.04)' : (i % 2 ? '#f8fafc' : 'transparent') }}>
                  <span style={{ fontSize: 15, fontWeight: 900, color: i < 3 ? '#eab308' : '#94a3b8' }}>{MEDAL[i] || i + 1}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                    {s.photo ? <img src={s.photo} alt="" style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, background: '#e2e8f0', border: '1px solid #e2e8f0' }} /> : <span style={{ width: 26, height: 26, borderRadius: '50%', background: '#0f172a', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900, flexShrink: 0 }}>{(s.name || '?').split(' ').filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase()}</span>}
                    <span style={{ fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.jersey != null ? <span style={{ color: '#94a3b8', fontSize: 11, marginRight: 6 }}>#{s.jersey}</span> : ''}{s.name}</span>
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#64748b', minWidth: 0 }}>
                    {s.team_logo ? <img src={s.team_logo} alt="" style={{ width: 22, height: 22, borderRadius: 5, objectFit: 'contain', flexShrink: 0, background: '#fff', border: '1px solid #e2e8f0' }} /> : null}
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.team_name}</span>
                  </span>
                  {STAT_COLS.map(([lb, k]) => <span key={k} style={{ textAlign: 'center', fontSize: 13, fontWeight: (s[k] || 0) > 0 ? 800 : 400, color: (s[k] || 0) > 0 ? '#0f172a' : '#cbd5e1' }}>{s[k] || 0}</span>)}
                  <span style={{ textAlign: 'right', fontSize: 16, fontWeight: 900, color: '#009c3b' }}>{s.points}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
