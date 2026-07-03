'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

const CATS = ['Masculino', 'Feminino', 'Sub-15', 'Sub-12'];
const PHASES = { group: 'Grupos', quarterfinal: 'Quartas', semifinal: 'Semifinal', final: 'Final', '3rd_place': '3º lugar' };
const STATUS = {
  scheduled: { l: 'Agendado', c: '#94a3b8' }, live: { l: 'Ao vivo', c: '#ef4444' },
  finished: { l: 'Encerrado', c: '#68ff8f' }, cancelled: { l: 'Cancelado', c: '#64748b' },
};

function mono(name, sz = 30) {
  const init = (name || '?').split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  return <span style={{ width: sz, height: sz, borderRadius: 8, background: 'rgba(255,255,255,.1)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: Math.round(sz * 0.38), fontWeight: 900, flexShrink: 0 }}>{init}</span>;
}

export default function JogosPublicPage() {
  const [games, setGames] = useState(null);
  const [cat, setCat] = useState('all');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    fetch('/api/games').then(r => r.json()).then(d => setGames(d.ok ? d.games : [])).catch(() => setGames([]));
  }, []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const filtered = useMemo(() => (games || []).filter(g => cat === 'all' || g.category === cat), [games, cat]);

  // Agrupa por Grupo (Grupo A, B...) quando definido. Jogos sem grupo caem em
  // seções de fase (Quartas/Semi/Final) ou "A definir". Pronto para receber os grupos depois.
  const sections = useMemo(() => {
    const m = {};
    filtered.forEach(g => {
      let key;
      if (g.group_name) key = `grp:${g.group_name}`;
      else if (g.phase && g.phase !== 'group') key = `phase:${PHASES[g.phase] || g.phase}`;
      else key = 'todef';
      (m[key] ||= []).push(g);
    });
    // ordena: grupos (alfabético) → fases → a definir
    const rank = (k) => k.startsWith('grp:') ? 0 : k.startsWith('phase:') ? 1 : 2;
    return Object.entries(m).sort((a, b) => rank(a[0]) - rank(b[0]) || a[0].localeCompare(b[0]));
  }, [filtered]);

  const sectionLabel = (key) => {
    if (key.startsWith('grp:')) return key.slice(4);
    if (key.startsWith('phase:')) return key.slice(6);
    return 'A definir';
  };

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(1200px 600px at 50% -10%, #0a2a6b 0%, #041027 55%, #020814 100%)', color: '#fff', fontFamily: "'Inter', system-ui, sans-serif", padding: '48px 16px 80px' }}>
      <a href="/site" style={{ position: 'fixed', top: isMobile ? 10 : 18, left: isMobile ? 10 : 18, zIndex: 20 }}>
        <img src="/assets/bfwc-logo.jpg" alt="BFWC 2026" width={isMobile ? 58 : 176} height={isMobile ? 58 : 176} style={{ borderRadius: isMobile ? 12 : 22, objectFit: 'cover', boxShadow: '0 10px 34px rgba(0,0,0,.4)', border: isMobile ? '2px solid rgba(255,255,255,.9)' : '3px solid rgba(255,255,255,.9)' }} />
      </a>
      <div style={{ maxWidth: 820, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 4, textTransform: 'uppercase', color: '#f4ff00', marginBottom: 10 }}>BFWC 2026 · Jogos</div>
          <h1 style={{ fontSize: 'clamp(30px,5vw,44px)', fontWeight: 900, letterSpacing: -1.5, margin: 0 }}>Tabela de Jogos</h1>
          <p style={{ color: 'rgba(255,255,255,.55)', fontSize: 14, marginTop: 8 }}>Horários, resultados e arbitragem de todas as partidas.</p>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 24 }}>
          {['all', ...CATS].map(c => (
            <button key={c} onClick={() => setCat(c)} style={{ padding: '8px 16px', borderRadius: 22, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', background: cat === c ? '#f4ff00' : 'rgba(255,255,255,.06)', color: cat === c ? '#031020' : 'rgba(255,255,255,.7)', border: `1px solid ${cat === c ? '#f4ff00' : 'rgba(255,255,255,.12)'}` }}>{c === 'all' ? 'Todas' : c}</button>
          ))}
        </div>

        {games === null ? <div style={{ textAlign: 'center', color: 'rgba(255,255,255,.4)', padding: 40 }}>Carregando...</div>
          : sections.length === 0 ? <div style={{ textAlign: 'center', color: 'rgba(255,255,255,.4)', padding: 48, border: '1px dashed rgba(255,255,255,.12)', borderRadius: 18 }}>Calendário em breve. As partidas aparecem aqui após a definição da tabela.</div>
          : sections.map(([key, list]) => (
            <div key={key} style={{ marginBottom: 26 }}>
              <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', color: '#f4ff00', marginBottom: 12 }}>
                {sectionLabel(key)}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {list.map(g => {
                  const st = STATUS[g.status] || STATUS.scheduled;
                  const finished = g.status === 'finished';
                  return (
                    <div key={g.id} style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 16, padding: '16px 18px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 12, fontWeight: 800, color: '#fff' }}>
                          {g.game_date ? new Date(g.game_date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) + ' · ' : ''}
                          {g.game_time ? g.game_time.slice(0, 5) : '--:--'}{g.field ? ` · ${g.field}` : ''}
                        </span>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                          {g.category && <span style={{ fontSize: 10, fontWeight: 700, color: '#8ab4ff', background: 'rgba(120,160,255,.12)', borderRadius: 5, padding: '2px 8px' }}>{g.category}</span>}
                          <span style={{ fontSize: 10, fontWeight: 800, color: st.c, background: st.c + '22', borderRadius: 5, padding: '2px 8px' }}>{st.l}</span>
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, justifyContent: 'flex-end' }}>
                          {mono(g.team1_name)}
                          <span style={{ fontSize: 14, fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'right' }}>{g.team1_name}</span>
                        </div>
                        <div style={{ fontSize: 22, fontWeight: 900, color: finished ? '#68ff8f' : 'rgba(255,255,255,.3)', whiteSpace: 'nowrap', padding: '0 6px' }}>
                          {finished ? `${g.team1_score ?? 0} – ${g.team2_score ?? 0}` : 'vs'}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, justifyContent: 'flex-end', flexDirection: 'row-reverse' }}>
                          {mono(g.team2_name)}
                          <span style={{ fontSize: 14, fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'right' }}>{g.team2_name}</span>
                        </div>
                      </div>
                      {Array.isArray(g.referees) && g.referees.length > 0 && (
                        <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,.08)' }}>
                          <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255,255,255,.35)', marginBottom: 7 }}>🧑‍⚖️ Arbitragem</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {g.referees.map((r, ri) => (
                              <span key={ri} style={{ display: 'inline-flex', alignItems: 'baseline', gap: 5, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 7, padding: '4px 9px', fontSize: 11.5 }}>
                                {r.role && <span style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: .5, color: '#8ab4ff' }}>{r.role}</span>}
                                <span style={{ fontWeight: 700, color: 'rgba(255,255,255,.85)' }}>{r.name}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

        <div style={{ textAlign: 'center', marginTop: 28, display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/ranking" style={{ color: '#f4ff00', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>Ver estatísticas →</Link>
          <Link href="/site" style={{ color: 'rgba(255,255,255,.5)', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>← Voltar ao site</Link>
        </div>
      </div>
    </div>
  );
}
