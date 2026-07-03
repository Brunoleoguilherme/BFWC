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
  confirmado: { color: '#009c3b', label: 'Confirmado' },
  inscrito:   { color: '#ea580c', label: 'Inscrito' },
  pendente:   { color: '#64748b', label: 'Pré-inscrito' },
};
const STAGE_CHIPS = [
  { key: 'all', label: 'Todos' },
  { key: 'confirmado', label: 'Confirmados' },
  { key: 'inscrito', label: 'Inscritos' },
  { key: 'pendente', label: 'Pré-inscritos' },
];

export default function AthletesPage() {
  const searchParams = useSearchParams();
  const sidebarCat = searchParams.get('category'); // vindo da sidebar

  const [athletes, setAthletes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [stageFilter, setStageFilter] = useState('all');
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
      .then(d => { setAthletes(d.ok ? (d.athletes || []) : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // filtro da sidebar tem prioridade sobre os chips
  useEffect(() => {
    if (sidebarCat && CAT_MATCH[sidebarCat]) setCatFilter(sidebarCat);
  }, [sidebarCat]);

  const list = useMemo(() => {
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
        a.category?.toLowerCase().includes(q));
    }
    return rows;
  }, [athletes, catFilter, stageFilter, search]);

  const teamsCount = useMemo(() => new Set(list.map(a => a.team_id)).size, [list]);

  const chipStyle = (on, color = '#009c3b') => ({
    padding: '7px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
    background: on ? color + '18' : '#fff', color: on ? color : '#475569',
    border: `1px solid ${on ? color + '45' : '#e2e8f0'}`, transition: 'all .15s',
  });

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: '#0f172a' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', color: '#009c3b', marginBottom: 8 }}>CRM</div>
        <h1 style={{ fontSize: 36, fontWeight: 900, letterSpacing: -1.5, color: '#0f172a' }}>Atletas Registrados</h1>
        <p style={{ fontSize: 12.5, color: '#64748b', marginTop: 6 }}>
          Atletas cadastrados no roster dos clubes. O status indica o estágio de pagamento do time.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { label: 'Atletas', value: list.length },
          { label: 'Times', value: teamsCount },
        ].map(s => (
          <div key={s.label} style={{
            padding: '20px 26px', minWidth: 150,
            background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 18,
            boxShadow: '0 1px 4px rgba(0,0,0,.06)',
          }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: '#64748b', marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: 40, fontWeight: 900, letterSpacing: -2, lineHeight: 1, color: '#0f172a' }}>
              {loading ? '—' : s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por atleta, clube ou categoria..."
          style={{ width: '100%', padding: '12px 16px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
        />
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', color: '#94a3b8', marginRight: 2 }}>Categoria</span>
          {CAT_CHIPS.map(c => (
            <button key={c.key} onClick={() => setCatFilter(c.key)} style={chipStyle(catFilter === c.key, '#0D4BFF')}>{c.label}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', color: '#94a3b8', marginRight: 2 }}>Estágio</span>
          {STAGE_CHIPS.map(c => (
            <button key={c.key} onClick={() => setStageFilter(c.key)} style={chipStyle(stageFilter === c.key, c.key === 'all' ? '#009c3b' : (STAGE_INFO[c.key]?.color || '#009c3b'))}>{c.label}</button>
          ))}
        </div>
      </div>

      {/* Tabela por atleta */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 20, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 140px 130px 44px',
          padding: '12px 22px', borderBottom: '1px solid #e2e8f0',
          fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: '#94a3b8',
        }}>
          <span>Atleta</span><span>Time</span><span>Categoria</span><span style={{ textAlign: 'right' }}>Status</span><span></span>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Carregando...</div>
        ) : list.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
            Nenhum atleta encontrado
          </div>
        ) : (
          <div style={{ maxHeight: 600, overflowY: 'auto' }}>
            {list.map((a, i) => {
              const st = STAGE_INFO[a.stage] || STAGE_INFO.pendente;
              return (
                <div key={a.id} style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr 140px 130px 44px',
                  padding: '14px 22px', alignItems: 'center',
                  borderBottom: i < list.length - 1 ? '1px solid #f1f5f9' : 'none',
                  background: i % 2 === 0 ? 'transparent' : '#f8fafc',
                }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                    {a.jersey_number != null && a.jersey_number !== '' && (
                      <span style={{ display: 'inline-block', minWidth: 22, marginRight: 8, fontSize: 11, fontWeight: 800, color: '#94a3b8' }}>#{a.jersey_number}</span>
                    )}
                    {a.name || '—'}
                  </span>
                  <span style={{ fontSize: 12.5, color: '#475569', fontWeight: 600 }}>{a.club_name || '—'}</span>
                  <span>
                    {a.category ? (
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 6, background: 'rgba(13,75,255,.1)', color: '#0D4BFF', border: '1px solid rgba(13,75,255,.2)' }}>{a.category}</span>
                    ) : <span style={{ color: '#cbd5e1' }}>—</span>}
                  </span>
                  <span style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: .5, textTransform: 'uppercase', padding: '3px 9px', borderRadius: 6, background: st.color + '18', color: st.color, border: `1px solid ${st.color}30` }}>{st.label}</span>
                  </span>
                  <span style={{ textAlign: 'right' }}>
                    <button onClick={() => { setDelTarget(a); setDelPwd(''); setDelErr(''); }} title="Excluir atleta" style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid rgba(255,68,68,.2)', background: 'rgba(255,68,68,.07)', color: '#ff4444', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>🗑</button>
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

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
