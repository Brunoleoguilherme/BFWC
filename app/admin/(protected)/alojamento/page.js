"use client";

import { useState, useEffect, useMemo } from 'react';

const CATS = [
  { key: 'sub12', label: 'Sub-12', color: '#10b981' },
  { key: 'sub15', label: 'Sub-15', color: '#f59e0b' },
  { key: 'feminino', label: 'Feminino', color: '#db2777' },
];

export default function AlojamentoPage() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [role, setRole] = useState('viewer');
  const [saving, setSaving] = useState(null);

  useEffect(() => {
    fetch('/api/admin/me').then(r => r.json()).then(d => setRole(d.role || 'viewer')).catch(() => {});
    fetch('/api/admin/alojamento')
      .then(r => r.json())
      .then(d => { if (d.ok) setTeams(d.teams || []); else setErr(d.error || 'Erro ao carregar.'); })
      .catch(e => setErr(e.message))
      .finally(() => setLoading(false));
  }, []);

  const totals = useMemo(() => {
    const t = { sub12: 0, sub15: 0, feminino: 0, total: 0, teams: 0 };
    teams.forEach(x => {
      if (!x.alojamento) return;
      t.sub12 += x.sub12; t.sub15 += x.sub15; t.feminino += x.feminino;
      t.total += x.total; t.teams += 1;
    });
    return t;
  }, [teams]);

  const canWrite = role !== 'viewer';

  async function toggle(team) {
    if (!canWrite || saving) return;
    const enabled = !team.alojamento;
    setSaving(team.id); setErr('');
    setTeams(prev => prev.map(t => t.id === team.id ? { ...t, alojamento: enabled } : t));
    try {
      const r = await fetch('/api/admin/alojamento', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: team.id, enabled }),
      });
      const d = await r.json();
      if (!d.ok) throw new Error(d.error || 'Erro');
    } catch (e) {
      setTeams(prev => prev.map(t => t.id === team.id ? { ...t, alojamento: !enabled } : t));
      setErr('Nao foi possivel salvar. Tente de novo.');
    } finally {
      setSaving(null);
    }
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: 980, fontFamily: "'Inter', sans-serif" }}>
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', color: '#009c3b', marginBottom: 8 }}>Times</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', margin: 0 }}>Alojamento</h1>
          {!loading && <span style={{ padding: '3px 10px', borderRadius: 20, background: 'rgba(0,156,59,.1)', color: '#009c3b', fontSize: 11, fontWeight: 900, border: '1px solid rgba(0,156,59,.25)' }}>{totals.teams} time{totals.teams === 1 ? '' : 's'} habilitado{totals.teams === 1 ? '' : 's'}</span>}
        </div>
        <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>Habilite os times que vao usar o alojamento. Disponivel para Sub-12, Sub-15 e Feminino.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {CATS.map(c => (
          <div key={c.key} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '16px 18px', boxShadow: '0 1px 4px rgba(0,0,0,.06)', borderTop: `3px solid ${c.color}` }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', color: '#64748b', marginBottom: 8 }}>{c.label}</div>
            <div style={{ fontSize: 30, fontWeight: 900, letterSpacing: -1.5, color: '#0f172a', lineHeight: 1 }}>{totals[c.key]}</div>
            <div style={{ fontSize: 10.5, color: '#94a3b8', marginTop: 3 }}>atletas no alojamento</div>
          </div>
        ))}
        <div style={{ background: '#0f172a', borderRadius: 16, padding: '16px 18px', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', color: '#94a3b8', marginBottom: 8 }}>Total</div>
          <div style={{ fontSize: 30, fontWeight: 900, letterSpacing: -1.5, color: '#fff', lineHeight: 1 }}>{totals.total}</div>
          <div style={{ fontSize: 10.5, color: '#64748b', marginTop: 3 }}>atletas em {totals.teams} time{totals.teams === 1 ? '' : 's'}</div>
        </div>
      </div>

      {err && <div style={{ padding: 14, borderRadius: 12, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 13, fontWeight: 600, marginBottom: 16 }}>{err}</div>}

      {loading ? (
        <div style={{ color: '#94a3b8', fontSize: 13 }}>Carregando...</div>
      ) : teams.length === 0 ? (
        <div style={{ color: '#94a3b8', fontSize: 13 }}>Nenhum time elegivel (Sub-12, Sub-15 ou Feminino).</div>
      ) : teams.map(t => {
        const on = t.alojamento;
        return (
          <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', marginBottom: 10, background: '#fff', border: `1px solid ${on ? 'rgba(0,156,59,.35)' : '#e2e8f0'}`, borderRadius: 14, boxShadow: '0 1px 4px rgba(0,0,0,.05)' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 5 }}>
                <span style={{ fontWeight: 800, fontSize: 14.5, color: '#0f172a' }}>{t.club_name}</span>
                {t.country && t.country !== 'Brasil' && <span style={{ fontSize: 10.5, color: '#64748b' }}>{t.country}</span>}
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {CATS.map(c => t[c.key] > 0 ? (
                  <span key={c.key} style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 7, color: c.color, background: c.color + '14', border: `1px solid ${c.color}30` }}>{c.label}: {t[c.key]}</span>
                ) : null)}
                <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 9px', borderRadius: 7, color: '#334155', background: '#f1f5f9', border: '1px solid #e2e8f0' }}>Total: {t.total}</span>
              </div>
            </div>
            <button onClick={() => toggle(t)} disabled={!canWrite || saving === t.id} style={{
              flexShrink: 0, padding: '9px 18px', borderRadius: 10, fontSize: 12.5, fontWeight: 800, fontFamily: 'inherit',
              cursor: (!canWrite || saving === t.id) ? 'not-allowed' : 'pointer',
              border: `1px solid ${on ? '#009c3b' : '#e2e8f0'}`,
              background: on ? '#009c3b' : '#fff', color: on ? '#fff' : '#475569',
              opacity: canWrite ? 1 : 0.5,
            }}>
              {saving === t.id ? '...' : on ? '✓ No alojamento' : 'Habilitar'}
            </button>
          </div>
        );
      })}

      {role === 'viewer' && !loading && (
        <div style={{ marginTop: 8, fontSize: 12, color: '#94a3b8' }}>Somente leitura — apenas admins podem habilitar.</div>
      )}
    </div>
  );
}
