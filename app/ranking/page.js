'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

const MEDAL = ['🥇', '🥈', '🥉'];

// Colunas de estatística (chave no objeto do atleta + rótulo curto + descrição)
const STAT_COLS = [
  { k: 'td', l: 'TD', t: 'Touchdowns' },
  { k: 'conv1', l: 'C1', t: 'Conversão de 1 ponto' },
  { k: 'conv2', l: 'C2', t: 'Conversão de 2 pontos' },
  { k: 'int_td', l: 'TD def', t: 'Touchdown defensivo (interceptação retornada)' },
  { k: 'safety', l: 'SAF', t: 'Safety' },
  { k: 'int_conv1', l: 'C1 ret', t: 'Conversão de 1 ponto retornada (defesa)' },
  { k: 'int_conv2', l: 'C2 ret', t: 'Conversão de 2 pontos retornada (defesa)' },
  { k: 'games', l: 'JG', t: 'Jogos' },
];

export default function PublicRankingPage() {
  const [data, setData] = useState(null);
  const [cat, setCat] = useState('all');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    fetch('/api/rankings').then(r => r.json()).then(d => setData(d.ok ? d : { scorers: [], categories: [] })).catch(() => setData({ scorers: [], categories: [] }));
  }, []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const scorers = useMemo(() => {
    const s = data?.scorers || [];
    return cat === 'all' ? s : s.filter(x => x.category === cat);
  }, [data, cat]);
  const cats = ['Masculino', 'Feminino', 'Sub-15', 'Sub-12'];

  // grid: # | atleta/time | 8 stats | pts
  const gridCols = `44px minmax(180px,1fr) ${STAT_COLS.map(() => '52px').join(' ')} 64px`;

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(1200px 600px at 50% -10%, #0a2a6b 0%, #041027 55%, #020814 100%)', color: '#fff', fontFamily: "'Inter', system-ui, sans-serif", padding: '48px 16px 80px' }}>
      <a href="/site" style={{ position: 'fixed', top: isMobile ? 10 : 18, left: isMobile ? 10 : 18, zIndex: 20 }}>
        <img src="/assets/bfwc-logo.jpg" alt="BFWC 2026" width={isMobile ? 58 : 176} height={isMobile ? 58 : 176} style={{ borderRadius: isMobile ? 12 : 22, objectFit: 'cover', boxShadow: '0 10px 34px rgba(0,0,0,.4)', border: isMobile ? '2px solid rgba(255,255,255,.9)' : '3px solid rgba(255,255,255,.9)' }} />
      </a>
      <div style={{ maxWidth: 980, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 4, textTransform: 'uppercase', color: '#68ff8f', marginBottom: 10 }}>BFWC 2026 · Estatísticas</div>
          <h1 style={{ fontSize: 'clamp(30px,5vw,40px)', fontWeight: 900, letterSpacing: -1.5, margin: 0 }}>Ranking de Pontuadores</h1>
          <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 14, marginTop: 8 }}>Estatísticas completas — atualizadas conforme as partidas são confirmadas.</p>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 22 }}>
          {['all', ...cats].map(c => (
            <button key={c} onClick={() => setCat(c)} style={{
              padding: '8px 16px', borderRadius: 22, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              background: cat === c ? '#68ff8f' : 'rgba(255,255,255,.06)', color: cat === c ? '#04150a' : 'rgba(255,255,255,.7)',
              border: `1px solid ${cat === c ? '#68ff8f' : 'rgba(255,255,255,.12)'}`,
            }}>{c === 'all' ? 'Todas' : c}</button>
          ))}
        </div>

        <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 20, overflow: 'hidden' }}>
          <div className="tabScroll">
            <div style={{ minWidth: data === null || scorers.length === 0 ? 0 : 720 }}>
              {data !== null && scorers.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: gridCols, padding: '12px 18px', borderBottom: '1px solid rgba(255,255,255,.08)', fontSize: 9.5, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255,255,255,.4)' }}>
                <span>#</span>
                <span>Atleta / Time</span>
                {STAT_COLS.map(col => <span key={col.k} title={col.t} style={{ textAlign: 'center' }}>{col.l}</span>)}
                <span style={{ textAlign: 'right' }}>Pts</span>
              </div>
              )}
              {data === null ? <div style={{ padding: '48px 24px', textAlign: 'center', color: 'rgba(255,255,255,.4)', fontSize: 13 }}>Carregando...</div>
                : scorers.length === 0 ? <div style={{ padding: '48px 24px', textAlign: 'center', color: 'rgba(255,255,255,.4)', fontSize: 13 }}>Nenhuma pontuação registrada ainda.</div>
                : scorers.map((s, i) => (
                  <div key={(s.athlete_id || s.name) + i} style={{ display: 'grid', gridTemplateColumns: gridCols, padding: '13px 18px', alignItems: 'center', borderBottom: i < scorers.length - 1 ? '1px solid rgba(255,255,255,.05)' : 'none', background: i < 3 ? 'rgba(104,255,143,.05)' : 'transparent' }}>
                    <span style={{ fontSize: 15, fontWeight: 900, color: i < 3 ? '#68ff8f' : 'rgba(255,255,255,.4)' }}>{MEDAL[i] || i + 1}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                      {s.photo ? <img src={s.photo} alt="" style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.15)' }} /> : <span style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,.1)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, flexShrink: 0 }}>{(s.name || '?').split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()}</span>}
                      <span style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.jersey != null && s.jersey !== '' ? <span style={{ color: 'rgba(255,255,255,.4)', fontSize: 11, marginRight: 6 }}>#{s.jersey}</span> : null}{s.name}</div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', display: 'flex', alignItems: 'center', gap: 6 }}>{s.team_logo ? <img src={s.team_logo} alt="" style={{ width: 16, height: 16, borderRadius: 3, objectFit: 'contain', background: '#fff' }} /> : null}<span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.team_name}{s.category ? ` · ${s.category}` : ''}</span></div>
                      </span>
                    </span>
                    {STAT_COLS.map(col => {
                      const v = s[col.k] || 0;
                      return <span key={col.k} style={{ textAlign: 'center', fontSize: 13, fontWeight: 700, color: v ? '#fff' : 'rgba(255,255,255,.28)' }}>{v}</span>;
                    })}
                    <span style={{ textAlign: 'right', fontSize: 17, fontWeight: 900, color: '#68ff8f' }}>{s.points}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginTop: 14, lineHeight: 1.7 }}>
          <strong style={{ color: 'rgba(255,255,255,.6)' }}>Legenda:</strong> TD = touchdown (6) · C1 = conversão 1pt · C2 = conversão 2pts · TD def = touchdown defensivo (6) · SAF = safety (2) · C1 ret / C2 ret = conversão retornada pela defesa · JG = jogos · Pts = pontos totais.
        </div>

        <div style={{ textAlign: 'center', marginTop: 24, display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/jogos" style={{ color: '#68ff8f', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>Ver jogos →</Link>
          <Link href="/site" style={{ color: 'rgba(255,255,255,.5)', fontSi