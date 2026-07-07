'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';

const CAT_MATCH = {
  masculino: 'Masculino', feminino: 'Feminino', sub12: 'Sub-12', sub15: 'Sub-15',
};
const CAT_CHIPS = [
  { key: 'all', label: 'Todas' },
  { key: 'masculino', label: 'Masculino' },
  { key: 'feminino', label: 'Feminino' },
  { key: 'sub15', label: 'Sub-15' },
  { key: 'sub12', label: 'Sub-12' },
];
const STAGE_INFO = {
  confirmado: { color: '#009c3b', label: 'Pagamento total' },
  inscrito:   { color: '#ea580c', label: 'Vaga garantida' },
  pendente:   { color: '#64748b', label: 'Sem pagamento' },
};
const STAGE_CHIPS = [
  { key: 'all', label: 'Todos' },
  { key: 'confirmado', label: 'Pagamento total' },
  { key: 'inscrito', label: 'Vaga garantida' },
  { key: 'pendente', label: 'Sem pagamento' },
];

export default function AthletesPage() {
  const searchParams = useSearchParams();
  const sidebarCat = searchParams.get('category'); // vindo da sidebar

  const [athletes, setAthletes] = useState(null);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [stageFilter, setStageFilter] = useState('all');
  const [openTeam, setOpenTeam] = useState(null); // { team_id, club_name, ... }
  const [delTarget, setDelTarget] = useState(null);
  const [delPwd, setDelPwd] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [delErr, setDelErr] = useState('');

  async function confirmDelete() {
    if (!delTarget || !delPwd) return;
    setDeleting(true); setDelErr('');
    const res = await fetch(`/api/admin/team-athletes/${delTarget.id}`, {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: delPwd }),
    });
    const d = await res.json();
    setDeleting(false);
    if (d.ok) {
      setAthletes(prev => (prev || []).filter(a => a.id !== delTarget.id));
      setDelTarget(null); setDelPwd('');
    } else setDelErr(d.message || 'Erro ao excluir.');
  }

  useEffect(() => {
    fetch('/api/admin/registrations')
      .then(r => r.json())
      .then(d => { setAthletes(d.ok ? (d.athletes || []) : []); setMeta(d.teams_meta || {}); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // filtro da sidebar tem prioridade sobre os chips
  useEffect(() => {
    if (sidebarCat && CAT_MATCH[sidebarCat]) setCatFilter(sidebarCat);
  }, [sidebarCat]);

  // Atletas após filtros de categoria / estágio / busca
  const filteredAthletes = useMemo(() => {
    let rows = athletes || [];
    if (catFilter !== 'all' && CAT_MATCH[catFilter]) {
      rows = rows.filter(a => a.category?.includes(CAT_MATCH[catFilter]));
    }
    if (stageFilter !== 'all') rows = rows.filter(a => a.stage === stageFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(a =>
        a.name?.toLowerCase().includes(q) ||
        a.club_name?.toLowerCase().includes(q) ||
        a.email?.toLowerCase().includes(q) ||
        a.document?.toLowerCase().includes(q) ||
        a.category?.toLowerCase().includes(q));
    }
    return rows;
  }, [athletes, catFilter, stageFilter, search]);

  // Agrupa por time
  const teams = useMemo(() => {
    const map = new Map();
    filteredAthletes.forEach(a => {
      if (!map.has(a.team_id)) {
        map.set(a.team_id, {
          team_id: a.team_id,
          club_name: a.club_name || '—',
          city: a.city || '',
          country: a.country || '',
          stage: a.stage || 'pendente',
          categories: new Set(),
          catCounts: {},
          athletes: [],
        });
      }
      const t = map.get(a.team_id);
      if (a.category) {
        t.categories.add(a.category);
        t.catCounts[a.category] = (t.catCounts[a.category] || 0) + 1;
      }
      t.athletes.push(a);
    });
    const arr = [...map.values()].map(t => ({ ...t, categories: [...t.categories] }));
    const rank = { confirmado: 0, inscrito: 1, pendente: 2 };
    arr.sort((a, b) => (rank[a.stage] - rank[b.stage]) || (b.athletes.length - a.athletes.length) || a.club_name.localeCompare(b.club_name));
    return arr;
  }, [filteredAthletes]);

  // Atletas do time aberto (respeitando filtros atuais)
  const openList = useMemo(() => {
    if (!openTeam) return [];
    const t = teams.find(x => x.team_id === openTeam.team_id);
    return (t?.athletes || []).slice().sort((a, b) => (a.category || '').localeCompare(b.category || '') || (a.name || '').localeCompare(b.name || ''));
  }, [openTeam, teams]);

  const chipStyle = (on, color = '#009c3b') => ({
    padding: '7px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
    background: on ? color + '18' : '#fff', color: on ? color : '#475569',
    border: `1px solid ${on ? color + '45' : '#e2e8f0'}`, transition: 'all .15s',
  });

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: '#0f172a' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', color: '#009c3b', marginBottom: 8 }}>Atletas</div>
        <h1 style={{ fontSize: 36, fontWeight: 900, letterSpacing: -1.5, color: '#0f172a' }}>Atletas por Time</h1>
        <p style={{ fontSize: 12.5, color: '#64748b', marginTop: 6 }}>
          Clique em um time para ver o roster completo. O status indica o estágio de pagamento do time.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { label: 'Times', value: teams.length, sub: `${filteredAthletes.length} atletas`, color: '#0f172a' },
          ...['Masculino', 'Feminino', 'Sub-15', 'Sub-12'].map((cat, i) => {
            const catTeams = teams.filter(t => t.categories.includes(cat)).length;
            const catAth = filteredAthletes.filter(a => a.category?.includes(cat)).length;
            return {
              label: cat,
              value: catTeams,
              sub: `${catAth} atleta${catAth !== 1 ? 's' : ''}`,
              color: ['#0D4BFF', '#e84dff', '#009c3b', '#d97706'][i],
            };
          }),
        ].map(s => (
          <div key={s.label} style={{
            padding: '18px 22px', minWidth: 130, flex: '1 1 130px',
            background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 18,
            boxShadow: '0 1px 4px rgba(0,0,0,.06)',
          }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: '#64748b', marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: 36, fontWeight: 900, letterSpacing: -2, lineHeight: 1, color: loading ? '#e2e8f0' : s.color }}>
              {loading ? '—' : s.value}
            </div>
            <div style={{ fontSize: 10.5, color: '#94a3b8', marginTop: 6, fontWeight: 600 }}>
              {loading ? '' : (s.label === 'Times' ? s.sub : `time${s.value !== 1 ? 's' : ''} · ${s.sub}`)}
            </div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por time, atleta, e-mail, documento ou categoria..."
          style={{ width: '100%', padding: '12px 16px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
        />
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', color: '#94a3b8', marginRight: 2 }}>Categoria</span>
          {CAT_CHIPS.map(c => (
            <button key={c.key} onClick={() => setCatFilter(c.key)} style={chipStyle(catFilter === c.key, '#0D4BFF')}>{c.label}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', color: '#94a3b8', marginRight: 2 }}>Pagamento</span>
          {STAGE_CHIPS.map(c => (
            <button key={c.key} onClick={() => setStageFilter(c.key)} style={chipStyle(stageFilter === c.key, c.key === 'all' ? '#009c3b' : (STAGE_INFO[c.key]?.color || '#009c3b'))}>{c.label}</button>
          ))}
        </div>
      </div>

      {/* Lista de times */}
      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Carregando...</div>
      ) : teams.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 13, background: '#fff', border: '1px dashed #e2e8f0', borderRadius: 20 }}>
          Nenhum time com atletas cadastrados
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
          {teams.map(t => {
            const st = STAGE_INFO[t.stage] || STAGE_INFO.pendente;
            return (
              <div
                key={t.team_id}
                onClick={() => setOpenTeam(t)}
                style={{
                  padding: '18px 20px', background: '#ffffff',
                  border: '1px solid #e2e8f0', borderRadius: 18, cursor: 'pointer',
                  boxShadow: '0 1px 4px rgba(0,0,0,.06)', transition: 'transform .15s, box-shadow .15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,.06)'; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 4 }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>{t.club_name}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: .5, textTransform: 'uppercase', padding: '3px 9px', borderRadius: 6, background: st.color + '18', color: st.color, border: `1px solid ${st.color}30`, flexShrink: 0 }}>{st.label}</span>
                </div>
                <div style={{ fontSize: 11.5, color: '#64748b', marginBottom: 12 }}>
                  {[t.city, t.country].filter(Boolean).join(' · ') || '—'}
                </div>
                {(() => { const m = meta[t.team_id] || {}; return (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6, marginBottom: 10 }}>
                    {[
                      { label: 'Habilitados', value: m.enabled ?? '—', color: '#0D4BFF' },
                      { label: 'Cadastrados', value: m.registered ?? t.athletes.length, color: '#ea580c' },
                      { label: 'Finalizados', value: m.finalized ?? 0, color: '#009c3b' },
                    ].map(s => (
                      <div key={s.label} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '8px 6px', textAlign: 'center' }}>
                        <div style={{ fontSize: 19, fontWeight: 900, letterSpacing: -1, lineHeight: 1, color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: 8.5, fontWeight: 800, letterSpacing: .6, textTransform: 'uppercase', color: '#94a3b8', marginTop: 4 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                ); })()}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                  {t.categories.map(c => (
                    <span key={c} style={{ fontSize: 10.5, fontWeight: 700, padding: '3px 9px', borderRadius: 6, background: 'rgba(13,75,255,.1)', color: '#0D4BFF', border: '1px solid rgba(13,75,255,.2)' }}>
                      {c} · <strong>{t.catCounts[c] || 0}</strong> atleta{(t.catCounts[c] || 0) !== 1 ? 's' : ''}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: roster do time */}
      {openTeam && (
        <div
          onClick={e => e.target === e.currentTarget && setOpenTeam(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(6px)',
            zIndex: 900, display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
            padding: '32px 16px', overflowY: 'auto', fontFamily: "'Inter', sans-serif",
          }}
        >
          <div style={{
            width: '100%', maxWidth: 900, position: 'relative', padding: '36px 38px',
            background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 24,
            boxShadow: '0 20px 60px rgba(0,0,0,.15)',
          }}>
            <button style={{
              position: 'absolute', top: 18, right: 18, width: 34, height: 34, borderRadius: 10,
              background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#64748b',
              fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit',
            }} onClick={() => setOpenTeam(null)}>✕</button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 2 }}>
              <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: -1, color: '#0f172a', margin: 0 }}>{openTeam.club_name}</h2>
              {(() => { const st = STAGE_INFO[openTeam.stage] || STAGE_INFO.pendente; return (
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: .5, textTransform: 'uppercase', padding: '3px 9px', borderRadius: 6, background: st.color + '18', color: st.color, border: `1px solid ${st.color}30` }}>{st.label}</span>
              ); })()}
            </div>
            <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 20px' }}>
              {[openTeam.city, openTeam.country].filter(Boolean).join(' · ')}
              {(() => { const m = meta[openTeam.team_id] || {}; return (
                <> · <strong style={{ color: '#0D4BFF' }}>{m.enabled ?? '—'} habilitados</strong> · <strong style={{ color: '#ea580c' }}>{m.registered ?? openList.length} cadastrados</strong> · <strong style={{ color: '#009c3b' }}>{m.finalized ?? 0} finalizaram</strong></>
              ); })()}
            </p>

            <div style={{ border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'hidden' }}>
              <div style={{
                display: 'grid', gridTemplateColumns: '1.2fr 1.4fr 100px 90px 44px',
                padding: '11px 18px', borderBottom: '1px solid #e2e8f0',
                fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: '#94a3b8',
              }}>
                <span>Atleta</span><span>E-mail / Documento</span><span>Categoria</span><span>Nascimento</span><span></span>
              </div>
              <div style={{ maxHeight: 480, overflowY: 'auto' }}>
                {openList.map((a, i) => (
                  <div key={a.id} style={{
                    display: 'grid', gridTemplateColumns: '1.2fr 1.4fr 100px 90px 44px',
                    padding: '12px 18px', alignItems: 'center',
                    borderBottom: i < openList.length - 1 ? '1px solid #f1f5f9' : 'none',
                    background: i % 2 === 0 ? 'transparent' : '#f8fafc',
                  }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                      {a.jersey_number != null && a.jersey_number !== '' && (
                        <span style={{ display: 'inline-block', minWidth: 22, marginRight: 8, fontSize: 11, fontWeight: 800, color: '#94a3b8' }}>#{a.jersey_number}</span>
                      )}
                      {a.name || '—'}
                    </span>
                    <span style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12, color: '#475569', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={a.email || ''}>{a.email || <span style={{ color: '#cbd5e1' }}>sem e-mail</span>}</div>
                      {a.document && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{a.document}</div>}
                    </span>
                    <span>
                      {a.category ? (
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 6, background: 'rgba(13,75,255,.1)', color: '#0D4BFF', border: '1px solid rgba(13,75,255,.2)' }}>{a.category}</span>
                      ) : <span style={{ color: '#cbd5e1' }}>—</span>}
                    </span>
                    <span style={{ fontSize: 12, color: '#475569', fontWeight: 600 }}>
                      {a.birth_date ? new Date(a.birth_date + 'T12:00:00').toLocaleDateString('pt-BR') : <span style={{ color: '#cbd5e1' }}>—</span>}
                    </span>
                    <span style={{ textAlign: 'right' }}>
                      <button onClick={() => { setDelTarget(a); setDelPwd(''); setDelErr(''); }} title="Excluir atleta" style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid rgba(255,68,68,.2)', background: 'rgba(255,68,68,.07)', color: '#ff4444', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>🗑</button>
                    </span>
                  </div>
                ))}
                {openList.length === 0 && (
                  <div style={{ padding: 30, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Nenhum atleta com os filtros atuais</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: excluir atleta (confirmação por senha) */}
      {delTarget && (
        <div onClick={e => e.target === e.currentTarget && setDelTarget(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(2,8,20,.55)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ width: '100%', maxWidth: 420, background: '#fff', borderRadius: 18, padding: 26, boxShadow: '0 20px 60px rgba(0,0,0,.25)' }}>
            <div style={{ fontSize: 17, fontWeight: 900, color: '#0f172a', marginBottom: 6 }}>Excluir atleta</div>
            <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.55, marginTop: 0, marginBottom: 16 }}>
              Você vai remover <strong style={{ color: '#0f172a' }}>{delTarget.name || 'este atleta'}</strong> do roster de <strong style={{ color: '#0f172a' }}>{delTarget.club_name}</strong>. Esta ação é <strong style={{ color: '#ff4444' }}>irreversível</strong>. Digite sua senha de login para confirmar.
            </p>
            <input
              type="password" value={delPwd} onChange={e => setDelPwd(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && confirmDelete()}
              placeholder="Sua senha de login" autoFocus
              style={{ width: '100%', boxSizing: 'border-box', padding: '12px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 14, outline: 'none', fontFamily: 'inherit', marginBottom: delErr ? 8 : 16 }}
            />
            {delErr && <div style={{ fontSize: 12.5, color: '#dc2626', fontWeight: 600, marginBottom: 14 }}>❌ {delErr}</div>}
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setDelTarget(null)} style={{ flex: 1, padding: '12px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#f1f5f9', color: '#475569', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
              <button onClick={confirmDelete} disabled={deleting || !delPwd} style={{ flex: 1.4, padding: '12px', borderRadius: 10, border: 'none', background: (deleting || !delPwd) ? '#fca5a5' : '#dc2626', color: '#fff', fontSize: 13, fontWeight: 800, cursor: (deleting || !delPwd) ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                {deleting ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
