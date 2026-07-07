'use client';

import { useState, useEffect } from 'react';
import { PLAY_TYPES, PTS_BY_KEY } from '@/lib/sumula';

export default function DelegadoPage() {
  const [games, setGames] = useState(null);
  const [sel, setSel] = useState(null);       // { game, team1_roster, team2_roster }
  const [checkin, setCheckin] = useState({ team1: [], team2: [] });
  const [occs, setOccs] = useState([]);
  const [occText, setOccText] = useState('');
  const [scores, setScores] = useState([]);   // [{team, athlete_id, athlete_name, jersey, play_key}]
  const [jerseys, setJerseys] = useState({}); // { athlete_id: numero } — correções feitas pelo delegado
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  async function load() {
    const d = await fetch('/api/admin/games').then(r => r.json());
    setGames(d.ok ? d.games : []);
  }
  useEffect(() => { load(); }, []);

  async function open(g) {
    setMsg('');
    const d = await fetch(`/api/admin/games/${g.id}`).then(r => r.json());
    if (!d.ok) { setMsg('Erro ao carregar jogo.'); return; }
    const rep = d.game.delegate_report || {};
    setCheckin({ team1: rep.checkin?.team1 || [], team2: rep.checkin?.team2 || [] });
    setOccs(rep.occurrences || []);
    setScores(rep.scores || []);
    // números: começa do roster, sobrescreve com correções salvas
    const jmap = {};
    [...(d.team1_roster || []), ...(d.team2_roster || [])].forEach(a => { jmap[a.id] = a.jersey_number ?? ''; });
    Object.assign(jmap, rep.jerseys || {});
    setJerseys(jmap);
    setSel(d);
  }

  function toggle(team, id) {
    setCheckin(c => ({ ...c, [team]: c[team].includes(id) ? c[team].filter(x => x !== id) : [...c[team], id] }));
  }

  async function save(confirm) {
    setSaving(true); setMsg('');
    const res = await fetch(`/api/admin/games/${sel.game.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section: 'delegate', data: { checkin, occurrences: occs, scores, jerseys }, ...(confirm != null ? { confirm } : {}) }),
    });
    const d = await res.json();
    setSaving(false);
    if (!res.ok) { setMsg('❌ ' + (d.error || 'Erro ao salvar.')); return; }
    setMsg(confirm === true ? '✅ Partida confirmada.' : confirm === false ? '✏️ Partida reaberta para edição.' : '✅ Relatório salvo.');
    load();
    if (confirm != null) setSel(s => ({ ...s, game: { ...s.game, delegate_confirmed: confirm } }));
  }

  const lbl = { fontSize: 10, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', color: '#94a3b8', marginBottom: 8, display: 'block' };

  // ── Lista ──
  if (!sel) {
    return (
      <div style={{ fontFamily: "'Inter', sans-serif", color: '#0f172a', maxWidth: 820 }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', color: '#eab308', marginBottom: 8 }}>Delegado da partida</div>
          <h1 style={{ fontSize: 36, fontWeight: 900, letterSpacing: -1.5, margin: 0 }}>Partidas</h1>
          <p style={{ fontSize: 12.5, color: '#64748b', marginTop: 6 }}>Selecione um jogo para check-in, ocorrências e confirmação.</p>
        </div>
        {games === null ? <div style={{ color: '#94a3b8' }}>Carregando...</div>
          : games.length === 0 ? <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 13, border: '1px dashed #e2e8f0', borderRadius: 16 }}>Nenhum jogo cadastrado ainda.</div>
          : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
              {games.map(g => (
                <button key={g.id} onClick={() => open(g)} style={{ textAlign: 'left', cursor: 'pointer', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '16px 18px', boxShadow: '0 1px 4px rgba(0,0,0,.06)', fontFamily: 'inherit' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>{g.game_date ? new Date(g.game_date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : 'S/ data'} {g.game_time?.slice(0, 5) || ''}</span>
                    {g.delegate_confirmed ? <span style={{ fontSize: 10, fontWeight: 800, color: '#009c3b' }}>✓ CONFIRMADA</span> : <span style={{ fontSize: 10, fontWeight: 800, color: '#f97316' }}>PENDENTE</span>}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 800, textAlign: 'center' }}>{g.team1_name} × {g.team2_name}</div>
                  {g.category && <div style={{ textAlign: 'center', fontSize: 11, color: '#64748b', marginTop: 4 }}>{g.category}</div>}
                </button>
              ))}
            </div>}
      </div>
    );
  }

  const { game, team1_roster, team2_roster } = sel;
  const confirmed = game.delegate_confirmed;

  const RosterCol = ({ team, name, roster }) => (
    <div style={{ flex: 1, minWidth: 240 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: 14, fontWeight: 900 }}>{name}</span>
        <span style={{ fontSize: 12, fontWeight: 800, color: '#009c3b' }}>{checkin[team].length}/{roster.length}</span>
      </div>
      {roster.length === 0 ? <div style={{ fontSize: 12, color: '#94a3b8', padding: '8px 0' }}>Sem roster cadastrado para este time.</div>
        : <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {roster.map(a => {
              const on = checkin[team].includes(a.id);
              return (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 10, background: on ? 'rgba(0,156,59,.08)' : '#f8fafc', border: `1px solid ${on ? 'rgba(0,156,59,.3)' : '#e2e8f0'}` }}>
                  <div onClick={() => !confirmed && toggle(team, a.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0, cursor: confirmed ? 'default' : 'pointer' }}>
                    <span style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0, background: on ? '#009c3b' : '#fff', border: `1px solid ${on ? '#009c3b' : '#cbd5e1'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 900 }}>{on ? '✓' : ''}</span>
                    <span style={{ fontSize: 12.5, fontWeight: 700, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</span>
                    {a.category && <span style={{ fontSize: 10, color: '#94a3b8', flexShrink: 0 }}>{a.category}</span>}
                  </div>
                  <input type="number" disabled={confirmed} value={jerseys[a.id] ?? ''} onChange={e => setJerseys(j => ({ ...j, [a.id]: e.target.value }))} placeholder="nº" title="Número do atleta" style={{ width: 52, flexShrink: 0, padding: '6px 8px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#fff', fontSize: 12.5, fontWeight: 700, textAlign: 'center', outline: 'none', fontFamily: 'inherit' }} />
                </div>
              );
            })}
          </div>}
    </div>
  );

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: '#0f172a', maxWidth: 860 }}>
      <button onClick={() => setSel(null)} style={{ marginBottom: 14, background: 'none', border: 'none', color: '#64748b', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>← Voltar às partidas</button>
      <div style={{ marginBottom: 6 }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: '#eab308' }}>Delegado {confirmed ? '· CONFIRMADA' : ''}</div>
        <h1 style={{ fontSize: 26, fontWeight: 900, margin: '4px 0 0' }}>{game.team1_name} × {game.team2_name}</h1>
        <div style={{ fontSize: 12.5, color: '#64748b' }}>{game.category} {game.group_name ? `· ${game.group_name}` : ''}</div>
      </div>

      {confirmed && (
        <div style={{ margin: '14px 0', padding: '10px 14px', borderRadius: 10, background: 'rgba(0,156,59,.08)', border: '1px solid rgba(0,156,59,.25)', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ flex: 1, fontSize: 12.5, color: '#009c3b', fontWeight: 600 }}>Partida confirmada pelo delegado — somente leitura.</span>
          <button onClick={() => { if (confirm('Reabrir a partida para edição? Ela deixa de estar confirmada até você confirmar de novo.')) save(false); }} disabled={saving} style={{ padding: '8px 16px', borderRadius: 9, border: '1px solid #eab308', background: 'rgba(234,179,8,.12)', color: '#a16207', fontSize: 12.5, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>✏️ Reabrir para editar</button>
        </div>
      )}

      {/* Check-in */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,.06)', marginTop: 18 }}>
        <div style={{ fontSize: 13, fontWeight: 900, marginBottom: 14 }}>🪪 Check-in de atletas <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8' }}>(confirme presença/identidade)</span></div>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <RosterCol team="team1" name={game.team1_name} roster={team1_roster} />
          <div style={{ width: 1, background: '#e2e8f0', alignSelf: 'stretch' }} />
          <RosterCol team="team2" name={game.team2_name} roster={team2_roster} />
        </div>
      </div>

      {/* Pontuação por atleta */}
      {(() => {
        const t1 = scores.filter(s => s.team === 'team1').reduce((a, s) => a + (PTS_BY_KEY[s.play_key] || 0), 0);
        const t2 = scores.filter(s => s.team === 'team2').reduce((a, s) => a + (PTS_BY_KEY[s.play_key] || 0), 0);
        return (
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,.06)', marginTop: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 900 }}>🏈 Pontuação por atleta</div>
              <div style={{ fontSize: 16, fontWeight: 900 }}>
                <span style={{ color: '#009c3b' }}>{t1}</span> <span style={{ color: '#cbd5e1' }}>×</span> <span style={{ color: '#009c3b' }}>{t2}</span>
              </div>
            </div>
            {scores.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                {scores.map((s, i) => {
                  const pt = PLAY_TYPES.find(p => p.key === s.play_key);
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: 10, fontWeight: 800, color: s.team === 'team1' ? '#0D4BFF' : '#a855f7', minWidth: 70 }}>{s.team === 'team1' ? game.team1_name : game.team2_name}</span>
                      <span style={{ fontSize: 12.5, fontWeight: 700, flex: 1 }}>{s.jersey != null ? `#${s.jersey} ` : ''}{s.athlete_name}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>{pt?.short} · {pt?.pts}pt</span>
                      {!confirmed && <button onClick={() => setScores(x => x.filter((_, y) => y !== i))} style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', fontSize: 14 }}>✕</button>}
                    </div>
                  );
                })}
              </div>
            )}
            {!confirmed && <ScoreForm game={game} team1_roster={team1_roster} team2_roster={team2_roster} jerseys={jerseys} onAdd={s => setScores(x => [...x, s])} />}
          </div>
        );
      })()}

      {/* Ocorrências */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,.06)', marginTop: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 900, marginBottom: 12 }}>📋 Ocorrências do jogo</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: occs.length ? 12 : 0 }}>
          {occs.map((o, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '10px 12px', borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', flexShrink: 0, marginTop: 2 }}>{o.time}</span>
              <span style={{ fontSize: 12.5, flex: 1 }}>{o.text}</span>
              {!confirmed && <button onClick={() => setOccs(os => os.filter((_, x) => x !== i))} style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', fontSize: 14 }}>✕</button>}
            </div>
          ))}
        </div>
        {!confirmed && (
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <input value={occText} onChange={e => setOccText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && occText.trim()) { setOccs(os => [...os, { time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }), text: occText.trim() }]); setOccText(''); } }} placeholder="Descreva a ocorrência..." style={{ flex: 1, padding: '11px 13px', borderRadius: 10, fontSize: 13, background: '#f8fafc', border: '1px solid #e2e8f0', outline: 'none', fontFamily: 'inherit' }} />
            <button onClick={() => { if (occText.trim()) { setOccs(os => [...os, { time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }), text: occText.trim() }]); setOccText(''); } }} style={{ padding: '11px 18px', borderRadius: 10, border: 'none', background: '#0f172a', color: '#fff', fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>+ Registrar</button>
          </div>
        )}
      </div>

      {msg && <div style={{ marginTop: 14, fontSize: 13, fontWeight: 700, color: msg.startsWith('❌') ? '#dc2626' : '#009c3b' }}>{msg}</div>}

      {!confirmed && (
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button onClick={() => save(null)} disabled={saving} style={{ flex: 1, padding: '14px', borderRadius: 12, border: '1px solid #eab308', background: 'rgba(234,179,8,.1)', color: '#a16207', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>{saving ? 'Salvando...' : 'Salvar relatório'}</button>
          <button onClick={() => { if (confirm('Confirmar a partida? Isso valida o jogo, calcula o placar e trava o relatório.')) save(true); }} disabled={saving} style={{ flex: 1.3, padding: '14px', borderRadius: 12, border: 'none', background: '#009c3b', color: '#031020', fontSize: 13, fontWeight: 900, letterSpacing: 1, textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit' }}>✓ Confirmar partida</button>
        </div>
      )}
    </div>
  );
}

function ScoreForm({ game, team1_roster, team2_roster, jerseys = {}, onAdd }) {
  const [team, setTeam] = useState('team1');
  const [athleteId, setAthleteId] = useState('');
  const [play, setPlay] = useState('td');
  const roster = team === 'team1' ? team1_roster : team2_roster;
  const jerseyOf = (a) => (jerseys[a.id] !== undefined && jerseys[a.id] !== '' ? jerseys[a.id] : (a.jersey_number ?? null));
  const inp = { padding: '10px 11px', borderRadius: 9, fontSize: 12.5, background: '#f8fafc', border: '1px solid #e2e8f0', outline: 'none', fontFamily: 'inherit' };
  function add() {
    const a = roster.find(x => x.id === athleteId);
    if (!a) return;
    onAdd({ team, athlete_id: a.id, athlete_name: a.name, jersey: jerseyOf(a), play_key: play });
    setAthleteId('');
  }
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', paddingTop: 6 }}>
      <select style={inp} value={team} onChange={e => { setTeam(e.target.value); setAthleteId(''); }}>
        <option value="team1">{game.team1_name}</option>
        <option value="team2">{game.team2_name}</option>
      </select>
      <select style={{ ...inp, flex: 1, minWidth: 150 }} value={athleteId} onChange={e => setAthleteId(e.target.value)}>
        <option value="">Selecione o atleta...</option>
        {roster.map(a => <option key={a.id} value={a.id}>{jerseyOf(a) != null && jerseyOf(a) !== '' ? `#${jerseyOf(a)} ` : ''}{a.name}</option>)}
      </select>
      <select style={inp} value={play} onChange={e => setPlay(e.target.value)}>
        {PLAY_TYPES.map(p => <option key={p.key} value={p.key}>{p.label} ({p.pts})</option>)}
      </select>
      <button onClick={add} disabled={!athleteId} style={{ padding: '10px 16px', borderRadius: 9, border: 'none', background: athleteId ? '#009c3b' : '#a7f3c4', color: '#031020', fontSize: 12, fontWeight: 800, cursor: athleteId ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}>+ Ponto</button>
    </div>
  );
}
