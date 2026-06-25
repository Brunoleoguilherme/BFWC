'use client';

import { useState, useEffect } from 'react';

export default function AthletesPage() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/teams').then(r => r.json()).then(d => {
      const confirmed = (d.teams || []).filter(t =>
        t.status === 'inscricao_confirmada' || t.status === 'aprovado'
      );
      setTeams(confirmed);
      setLoading(false);
    });
  }, []);

  const total = teams.reduce((s, t) => s + (parseInt(t.athletes_count) || 0), 0);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: '#0f172a' }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', color: '#009c3b', marginBottom: 8 }}>CRM</div>
        <h1 style={{ fontSize: 36, fontWeight: 900, letterSpacing: -1.5, color: '#0f172a' }}>Atletas Registrados</h1>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 32, flexWrap: 'wrap' }}>
        {[
          { label: 'Times', value: teams.length },
          { label: 'Total de Atletas', value: total },
        ].map(s => (
          <div key={s.label} style={{
            padding: '22px 28px', minWidth: 160,
            background: '#ffffff',
            border: '1px solid #e2e8f0', borderRadius: 20,
            boxShadow: '0 1px 4px rgba(0,0,0,.06)',
          }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: '#64748b', marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: 44, fontWeight: 900, letterSpacing: -2, lineHeight: 1, color: '#0f172a' }}>
              {loading ? '—' : s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0', borderRadius: 20, overflow: 'hidden',
        boxShadow: '0 1px 4px rgba(0,0,0,.06)',
      }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 100px',
          padding: '12px 22px', borderBottom: '1px solid #e2e8f0',
          fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase',
          color: '#94a3b8',
        }}>
          <span>Clube</span><span>Cidade</span><span>Status</span><span style={{ textAlign: 'right' }}>Atletas</span>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Carregando...</div>
        ) : teams.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
            Nenhum time confirmado ainda
          </div>
        ) : (
          teams.map((t, i) => {
            const isConfirmed = t.status === 'inscricao_confirmada';
            const color = isConfirmed ? '#009c3b' : '#0D4BFF';
            const label = isConfirmed ? 'Confirmado' : 'Aprovado';
            return (
              <div key={t.id} style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 100px',
                padding: '16px 22px', alignItems: 'center',
                borderBottom: i < teams.length - 1 ? '1px solid #f1f5f9' : 'none',
                background: i % 2 === 0 ? 'transparent' : '#f8fafc',
              }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{t.club_name}</span>
                <span style={{ fontSize: 12, color: '#64748b' }}>{[t.city, t.country].filter(Boolean).join(', ')}</span>
                <span>
                  <span style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: .5, textTransform: 'uppercase',
                    padding: '3px 9px', borderRadius: 6,
                    background: color + '18', color, border: `1px solid ${color}30`,
                  }}>{label}</span>
                </span>
                <span style={{ textAlign: 'right', fontSize: 22, fontWeight: 900, letterSpacing: -1, color: '#009c3b' }}>
                  {t.athletes_count || '—'}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
