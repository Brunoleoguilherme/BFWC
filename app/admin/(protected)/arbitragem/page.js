'use client';

import { useState, useEffect } from 'react';

export default function ArbitragemPage() {
  const [refs, setRefs] = useState(null);
  const [games, setGames] = useState(null);
  const [view, setView] = useState('escalacao'); // escalacao | arbitros
  const [form, setForm] = useState({ name: '', role: 'Referee' });
  const [msg, setMsg] = useState('');
  const [assignFor, setAssignFor] = useState(null); // jogo sendo escalado

  async function loadRefs() {
    const d = await fetch('/api/admin/referees').then(r => r.json());
    setRefs(d.ok ? d.referees : []);
  }
  async function loadGames() {
    const d = await fetch('/api/admin/games').then(r => r.json());
    setGames(d.ok ? d.games : []);
  }
  useEffect(() => { loadRefs(); loadGames(); }, []);

  async function addRef(e) {
    e.preventDefault();
    setMsg('');
    if (!form.name.trim()) { setMsg('Digite o nome do árbitro.'); return; }
    try {
      const res = await fetch('/api/admin/referees', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) { setMsg('Erro ao cadastrar: ' + (d.error || res.status)); return; }
      setForm({ name: '', role: 'Referee' });
      loadRefs();
    } catch (err) {
      setMsg('Falha de conexão: ' + err.message);
    }
  }
  async function delRef(id) {
    if (!confirm('Remover este árbitro?')) return;
    await fetch('/api/admin/referees', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    loadRefs();
  }

  async function saveAssignment(game, list) {
    await fetch(`/api/admin/games/${game.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ section: 'referees', data: list }) });
    setGames(gs => gs.map(g => g.id === game.id ? { ...g, referees: list } : g));
    if (assignFor && assignFor.id === game.id) setAssignFor(g => ({ ...g, referees: list }));
  }
  function toggleRefOnGame(game, ref) {
    const cur = game.referees || [];
    const has = cur.some(r => r.id === ref.id);
    const next = has ? cur.filter(r => r.id !== ref.id) : [...cur, { id: ref.id, name: ref.name, role: ref.role || '' }];
    saveAssignment(game, next);
  }

  const inp = { padding: '10px 12px', borderRadius: 10, fontSize: 13, background: '#f8fafc', border: '1px solid #e2e8f0', outline: 'none', fontFamily: 'inherit' };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: '#0f172a', maxWidth: 880 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
        <img src="/assets/bfwc-logo.jpg" alt="BFWC 2026" width={56} height={56} style={{ borderRadius: 12, objectFit: 'cover', boxShadow: '0 4px 14px rgba(0,0,0,.12)', flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', color: '#a855f7', marginBottom: 8 }}>Arbitragem</div>
          <h1 style={{ fontSize: 36, fontWeight: 900, letterSpacing: -1.5, margin: 0 }}>Arbitragem</h1>
          <p style={{ fontSize: 12.5, color: '#64748b', marginTop: 6 }}>Cadastre os árbitros e escale quem apita cada jogo. (A súmula é preenchida pelo delegado da partida.)</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[['escalacao', 'Escalação dos jogos'], ['arbitros', 'Árbitros cadastrados']].map(([k, l]) => (
          <button key={k} onClick={() => setView(k)} style={{ padding: '9px 16px', borderRadius: 10, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', border: 'none', background: view === k ? '#a855f7' : '#eef2f7', color: view === k ? '#fff' : '#475569' }}>{l}</button>
        ))}
      </div>

      {view === 'arbitros' && (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: 22, boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
          <form onSubmit={addRef} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
            <input style={{ ...inp, flex: 1, minWidth: 180 }} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nome do árbitro" />
            <select style={inp} value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
              {['Referee', 'Umpire', 'Line Judge', 'Field Judge', 'Back Judge', 'Mesa'].map(r => <option key={r}>{r}</option>)}
            </select>
            <button type="submit" style={{ padding: '10px 18px', borderRadius: 10, border: 'none', background: '#a855f7', color: '#fff', fontSize: 12.5, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>+ Cadastrar</button>
          </form>
          {msg ? <div style={{ fontSize: 12.5, color: '#dc2626', marginBottom: 12 }}>{msg}</div> : null}
          {refs === null ? <div style={{ color: '#94a3b8', fontSize: 13 }}>Carregando...</div>
            : refs.length === 0 ? <div style={{ color: '#94a3b8', fontSize: 13 }}>Nenhum árbitro cadastrado ainda.</div>
            : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
                {refs.map(r => (
                  <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(168,85,247,.12)', color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900, flexShrink: 0 }}>{r.name.slice(0, 2).toUpperCase()}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</div>
                      {r.role ? <div style={{ fontSize: 11, color: '#94a3b8' }}>{r.role}</div> : null}
                    </div>
                    <button onClick={() => delRef(r.id)} style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', fontSize: 14 }}>✕</button>
                  </div>
                ))}
              </div>}
        </div>
      )}

      {view === 'escalacao' && (
        <div>
          {games === null ? <div style={{ color: '#94a3b8', fontSize: 13 }}>Carregando...</div>
            : games.length === 0 ? <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 13, border: '1px dashed #e2e8f0', borderRadius: 16 }}>Nenhum jogo cadastrado ainda.</div>
            : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
                {games.map(g => {
                  const assigned = g.referees || [];
                  return (
                    <div key={g.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '16px 18px', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 4 }}>{g.game_date ? new Date(g.game_date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : 'S/ data'} {g.game_time ? g.game_time.slice(0, 5) : ''}{g.field ? ' · ' + g.field : ''}</div>
                      <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 8 }}>{g.team1_name} × {g.team2_name}</div>
                      <div style={{ minHeight: 24, marginBottom: 10, display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                        {assigned.length === 0 ? <span style={{ fontSize: 11.5, color: '#cbd5e1' }}>Sem árbitros escalados</span>
                          : assigned.map(r => <span key={r.id} style={{ fontSize: 10.5, fontWeight: 700, color: '#a855f7', background: 'rgba(168,85,247,.1)', border: '1px solid rgba(168,85,247,.2)', borderRadius: 6, padding: '2px 8px' }}>{r.name}{r.role ? ` · ${r.role}` : ''}</span>)}
                      </div>
                      <button onClick={() => setAssignFor(g)} style={{ width: '100%', padding: '8px', borderRadius: 9, border: '1px solid #a855f7', background: 'rgba(168,85,247,.08)', color: '#a855f7', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Escalar árbitros</button>
                    </div>
                  );
                })}
              </div>}
        </div>
      )}

      {/* Modal de escalação */}
      {assignFor ? (
        <div onClick={(e) => { if (e.target === e.currentTarget) setAssignFor(null); }} style={{ position: 'fixed', inset: 0, background: 'rgba(2,8,20,.55)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ width: '100%', maxWidth: 460, background: '#fff', borderRadius: 18, padding: 24, boxShadow: '0 20px 60px rgba(0,0,0,.25)' }}>
            <div style={{ fontSize: 16, fontWeight: 900 }}>Escalar arbitragem</div>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>{assignFor.team1_name} × {assignFor.team2_name}</div>
            {refs === null || refs.length === 0 ? (
              <div style={{ fontSize: 13, color: '#94a3b8', padding: '10px 0' }}>Cadastre árbitros primeiro na aba Árbitros.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 320, overflowY: 'auto' }}>
                {refs.map(r => {
                  const g = games.find(x => x.id === assignFor.id) || assignFor;
                  const on = (g.referees || []).some(x => x.id === r.id);
                  return (
                    <button key={r.id} onClick={() => toggleRefOnGame(g, r)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', background: on ? 'rgba(168,85,247,.08)' : '#f8fafc', border: `1px solid ${on ? 'rgba(168,85,247,.3)' : '#e2e8f0'}` }}>
                      <span style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0, background: on ? '#a855f7' : '#fff', border: `1px solid ${on ? '#a855f7' : '#cbd5e1'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 900 }}>{on ? '✓' : ''}</span>
                      <span style={{ flex: 1, fontSize: 13, fontWeight: 700 }}>{r.name}</span>
                      {r.role ? <span style={{ fontSize: 11, color: '#94a3b8' }}>{r.role}</span> : null}
                    </button>
                  );
                })}
              </div>
            )}
            <button onClick={() => setAssignFor(null)} style={{ marginTop: 16, width: '100%', padding: '12px', borderRadius: 10, border: 'none', background: '#0f172a', color: '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>Concluir</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
