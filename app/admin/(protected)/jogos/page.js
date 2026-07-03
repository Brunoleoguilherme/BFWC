'use client';

import { useState, useEffect, useMemo } from 'react';

const CATS = ['Masculino', 'Feminino', 'Sub-15', 'Sub-12'];
const PHASES = [
  { v: 'group', l: 'Grupos' }, { v: 'quarterfinal', l: 'Quartas' },
  { v: 'semifinal', l: 'Semifinal' }, { v: 'final', l: 'Final' }, { v: '3rd_place', l: '3º lugar' },
];
const STATUSES = [
  { v: 'scheduled', l: 'Agendado', c: '#64748b' }, { v: 'live', l: 'Ao vivo', c: '#ef4444' },
  { v: 'finished', l: 'Encerrado', c: '#009c3b' }, { v: 'cancelled', l: 'Cancelado', c: '#94a3b8' },
];
const stInfo = (v) => STATUSES.find(s => s.v === v) || STATUSES[0];
const blank = { team1_name: '', team2_name: '', category: 'Masculino', group_name: '', phase: 'group', game_date: '', game_time: '', field: '', warmup_time: '', status: 'scheduled', notes: '', delegate_id: '' };

const inp = { width: '100%', padding: '10px 12px', borderRadius: 10, fontSize: 13, background: '#f8fafc', border: '1px solid #e2e8f0', color: '#0f172a', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' };
const lbl = { fontSize: 10, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', color: '#94a3b8', marginBottom: 5, display: 'block' };

export default function JogosPage() {
  const [games, setGames] = useState(null);
  const [teams, setTeams] = useState([]);
  const [delegates, setDelegates] = useState([]);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const [toast, setToast] = useState('');

  async function load() {
    const d = await fetch('/api/admin/games').then(r => r.json());
    setGames(d.ok ? d.games : []);
  }
  useEffect(() => {
    load();
    fetch('/api/admin/portal-teams').then(r => r.json()).then(d => setTeams((d.teams || []).filter(t => t.status === 'approved')));
    fetch('/api/admin/users').then(r => r.json()).then(d => setDelegates((d.users || []).filter(u => u.role === 'delegado_partida')));
  }, []);

  function showToast(m) { setToast(m); setTimeout(() => setToast(''), 2500); }
  function field(k, v) { setEditing(x => ({ ...x, [k]: v })); }

  async function save() {
    setSaving(true);
    setErr('');
    const isNew = !editing.id;
    const res = await fetch(isNew ? '/api/admin/games' : `/api/admin/games/${editing.id}`, {
      method: isNew ? 'POST' : 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(isNew ? editing : { section: 'details', data: editing }),
    });
    const d = await res.json();
    setSaving(false);
    if (!res.ok) { setErr(d.error || 'Erro ao salvar.'); return; }
    setEditing(null);
    showToast(isNew ? 'Jogo criado.' : 'Jogo atualizado.');
    load();
  }

  async function del(g) {
    if (!confirm(`Excluir o jogo ${g.team1_name} x ${g.team2_name}?`)) return;
    const res = await fetch(`/api/admin/games/${g.id}`, { method: 'DELETE' });
    if (res.ok) { showToast('Jogo excluído.'); load(); }
  }

  const byDate = useMemo(() => {
    const m = {};
    (games || []).forEach(g => {
      const k = g.game_date || 'Sem data';
      if (!m[k]) m[k] = [];
      m[k].push(g);
    });
    return Object.entries(m);
  }, [games]);

  const delegateName = (id) => {
    const d = delegates.find(x => x.id === id);
    return d ? d.name : 'Sem delegado designado';
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: '#0f172a', maxWidth: 900 }}>
      {toast ? (
        <div style={{ position: 'fixed', top: 20, right: 24, zIndex: 999, padding: '12px 20px', borderRadius: 12, fontSize: 13, fontWeight: 700, background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 8px 32px rgba(0,0,0,.12)' }}>{toast}</div>
      ) : null}

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', color: '#009c3b', marginBottom: 8 }}>Campeonato</div>
          <h1 style={{ fontSize: 36, fontWeight: 900, letterSpacing: -1.5, margin: 0 }}>Gestão de Jogos</h1>
        </div>
        <button onClick={() => { setEditing({ ...blank }); setErr(''); }} style={{ padding: '11px 20px', borderRadius: 12, border: 'none', background: '#009c3b', color: '#031020', fontSize: 12, fontWeight: 900, letterSpacing: 1, textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit' }}>+ Novo Jogo</button>
      </div>

      {games === null ? (
        <div style={{ color: '#94a3b8', fontSize: 14 }}>Carregando...</div>
      ) : games.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 13, border: '1px dashed #e2e8f0', borderRadius: 16 }}>Nenhum jogo cadastrado. Clique em Novo Jogo.</div>
      ) : (
        byDate.map(([date, list]) => (
          <div key={date} style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', color: '#475569', marginBottom: 10 }}>
              {date === 'Sem data' ? 'Sem data' : new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
              {list.map(g => {
                const s = stInfo(g.status);
                return (
                  <div key={g.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '16px 18px', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: .5, textTransform: 'uppercase', color: s.c, background: s.c + '18', border: '1px solid ' + s.c + '30', borderRadius: 6, padding: '2px 8px' }}>{s.l}</span>
                      <span style={{ fontSize: 12, fontWeight: 800, color: '#334155' }}>{(g.game_time ? g.game_time.slice(0, 5) : '--:--') + (g.field ? ' · ' + g.field : '')}</span>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 800, textAlign: 'center', margin: '8px 0' }}>
                      {g.team1_name} <span style={{ color: g.team1_score != null ? '#009c3b' : '#cbd5e1', margin: '0 6px' }}>{(g.team1_score == null ? '-' : g.team1_score) + ' x ' + (g.team2_score == null ? '-' : g.team2_score)}</span> {g.team2_name}
                    </div>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 8 }}>
                      {g.category ? <span style={{ fontSize: 10, fontWeight: 700, color: '#0D4BFF', background: 'rgba(13,75,255,.1)', borderRadius: 5, padding: '2px 8px' }}>{g.category}</span> : null}
                      {g.group_name ? <span style={{ fontSize: 10, fontWeight: 700, color: '#64748b', background: '#f1f5f9', borderRadius: 5, padding: '2px 8px' }}>{g.group_name}</span> : null}
                      {g.delegate_confirmed ? <span style={{ fontSize: 10, fontWeight: 700, color: '#009c3b' }}>confirmado</span> : null}
                    </div>
                    <div style={{ textAlign: 'center', fontSize: 10.5, color: g.delegate_id ? '#a16207' : '#cbd5e1', fontWeight: 700, marginBottom: 10 }}>
                      Delegado: {delegateName(g.delegate_id)}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => { setEditing({ ...g, game_date: g.game_date || '', game_time: g.game_time || '', warmup_time: g.warmup_time || '', delegate_id: g.delegate_id || '' }); setErr(''); }} style={{ flex: 1, padding: '8px', borderRadius: 9, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#475569', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Editar</button>
                      <button onClick={() => del(g)} style={{ padding: '8px 12px', borderRadius: 9, border: '1px solid rgba(255,68,68,.2)', background: 'rgba(255,68,68,.07)', color: '#ff4444', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Excluir</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}

      {editing ? (
        <div onClick={(e) => { if (e.target === e.currentTarget) setEditing(null); }} style={{ position: 'fixed', inset: 0, background: 'rgba(2,8,20,.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 24, overflowY: 'auto' }}>
          <div style={{ width: '100%', maxWidth: 520, background: '#fff', borderRadius: 20, padding: 26, boxShadow: '0 30px 80px rgba(0,0,0,.3)' }}>
            <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 18 }}>{editing.id ? 'Editar jogo' : 'Novo jogo'}</div>
            <datalist id="teamlist">
              {teams.map(t => <option key={t.id} value={t.club_name} />)}
            </datalist>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div><span style={lbl}>Time 1</span><input list="teamlist" style={inp} value={editing.team1_name} onChange={(e) => field('team1_name', e.target.value)} /></div>
              <div><span style={lbl}>Time 2</span><input list="teamlist" style={inp} value={editing.team2_name} onChange={(e) => field('team2_name', e.target.value)} /></div>
              <div><span style={lbl}>Categoria</span><select style={inp} value={editing.category} onChange={(e) => field('category', e.target.value)}>{CATS.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
              <div><span style={lbl}>Grupo</span><input style={inp} value={editing.group_name} onChange={(e) => field('group_name', e.target.value)} placeholder="Grupo A" /></div>
              <div><span style={lbl}>Fase</span><select style={inp} value={editing.phase} onChange={(e) => field('phase', e.target.value)}>{PHASES.map(p => <option key={p.v} value={p.v}>{p.l}</option>)}</select></div>
              <div><span style={lbl}>Status</span><select style={inp} value={editing.status} onChange={(e) => field('status', e.target.value)}>{STATUSES.map(x => <option key={x.v} value={x.v}>{x.l}</option>)}</select></div>
              <div><span style={lbl}>Data</span><input type="date" style={inp} value={editing.game_date} onChange={(e) => field('game_date', e.target.value)} /></div>
              <div><span style={lbl}>Horário</span><input type="time" style={inp} value={editing.game_time} onChange={(e) => field('game_time', e.target.value)} /></div>
              <div><span style={lbl}>Campo</span><input style={inp} value={editing.field} onChange={(e) => field('field', e.target.value)} placeholder="Campo 1" /></div>
              <div><span style={lbl}>Aquecimento</span><input type="time" style={inp} value={editing.warmup_time} onChange={(e) => field('warmup_time', e.target.value)} /></div>
            </div>
            <span style={lbl}>Delegado da partida</span>
            <select style={{ ...inp, marginBottom: 12 }} value={editing.delegate_id || ''} onChange={(e) => field('delegate_id', e.target.value)}>
              <option value="">Nao designado</option>
              {delegates.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <span style={lbl}>Observações</span>
            <textarea style={{ ...inp, minHeight: 60, resize: 'vertical', marginBottom: 12 }} value={editing.notes} onChange={(e) => field('notes', e.target.value)} />
            {err ? <div style={{ fontSize: 12.5, color: '#dc2626', fontWeight: 600, marginBottom: 12 }}>{err}</div> : null}
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setEditing(null)} style={{ flex: 1, padding: '12px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#f1f5f9', color: '#475569', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
              <button onClick={save} disabled={saving || !editing.team1_name || !editing.team2_name} style={{ flex: 1.4, padding: '12px', borderRadius: 10, border: 'none', background: (saving || !editing.team1_name || !editing.team2_name) ? '#a7f3c4' : '#009c3b', color: '#031020', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>{saving ? 'Salvando...' : 'Salvar'}</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
