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
    <div style={{ fontFamily: "'Inter', sans-serif", color: '#fff' }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', color: '#f4ff00', marginBottom: 8 }}>CRM</div>
        <h1 style={{ fontSize: 36, fontWeight: 900, letterSpacing: -1.5, color: '#fff' }}>Atletas Registrados</h1>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 32, flexWrap: 'wrap' }}>
        {[
          { label: 'Times', value: teams.length },
          { label: 'Total de Atletas', value: total },
        ].map(s => (
          <div key={s.label} style={{
            padding: '22px 28px', minWidth: 160,
            background: 'linear-gradient(145deg, rgba(6,27,58,.6), rgba(2,8,22,.5))',
            border: '1px solid rgba(255,255,255,.07)', borderRadius: 20,
          }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,.32)', marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: 44, fontWeight: 900, letterSpacing: -2, lineHeight: 1, color: '#fff' }}>
              {loading ? '—' : s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{
        background: 'linear-gradient(145deg, rgba(6,27,58,.5), rgba(2,8,22,.5))',
        border: '1px solid rgba(255,255,255,.07)', borderRadius: 20, overflow: 'hidden',
      }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 100px',
          padding: '12px 22px', borderBottom: '1px solid rgba(255,255,255,.07)',
          fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase',
          color: 'rgba(255,255,255,.25)',
        }}>
          <span>Clube</span><span>Cidade</span><span>Status</span><span style={{ textAlign: 'right' }}>Atletas</span>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,.2)', fontSize: 13 }}>Carregando...</div>
        ) : teams.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,.2)', fontSize: 13 }}>
            Nenhum time confirmado ainda
          </div>
        ) : (
          teams.map((t, i) => {
            const isConfirmed = t.status === 'inscricao_confirmada';
            const color = isConfirmed ? '#20e33f' : '#0D4BFF';
            const label = isConfirmed ? 'Confirmado' : 'Aprovado';
            return (
              <div key={t.id} style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 100px',
                padding: '16px 22px', alignItems: 'center',
                borderBottom: i < teams.length - 1 ? '1px solid rgba(255,255,255,.04)' : 'none',
                background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,.01)',
              }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{t.club_name}</span>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,.4)' }}>{[t.city, t.country].filter(Boolean).join(', ')}</span>
                <span>
                  <span style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: .5, textTransform: 'uppercase',
                    padding: '3px 9px', borderRadius: 6,
                    background: color + '18', color, border: `1px solid ${color}30`,
                  }}>{label}</span>
                </span>
                <span style={{ textAlign: 'right', fontSize: 22, fontWeight: 900, letterSpacing: -1, color: '#f4ff00' }}>
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
