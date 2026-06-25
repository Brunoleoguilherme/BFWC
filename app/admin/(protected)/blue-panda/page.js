'use client';

import { useState, useEffect } from 'react';

const HOSTING_GROUPS = [
  { key: 'premium',      label: 'Premium',      sublabel: 'Hotéis 4 ou 5 estrelas',          color: '#009c3b', match: v => v?.toLowerCase().includes('premium') || v?.toLowerCase().includes('4') || v?.toLowerCase().includes('5') },
  { key: 'intermediaria',label: 'Intermediária', sublabel: 'Hotéis 3 estrelas',               color: '#4d8aff', match: v => v?.toLowerCase().includes('intermedi') || v?.toLowerCase().includes('3 estrela') },
  { key: 'economica',    label: 'Econômica',     sublabel: 'Hostels / Acomodações coletivas', color: '#009c3b', match: v => v?.toLowerCase().includes('econôm') || v?.toLowerCase().includes('hostel') || v?.toLowerCase().includes('economica') },
  { key: 'local',        label: 'Locais',        sublabel: 'Não precisam de hospedagem',      color: '#a855f7', match: v => v?.toLowerCase().includes('local') || v?.toLowerCase().includes('não precisa') },
];

const STATUS_LABELS = {
  pre_inscrito:         { label: 'Pré-inscrito',  color: '#a855f7' },
  inscricao_confirmada: { label: 'Confirmado',    color: '#009c3b' },
  aprovado:             { label: 'Aprovado',      color: '#0D4BFF' },
  pendente_analise:     { label: 'Pendente',      color: '#94a3b8' },
  em_revisao:           { label: 'Em Revisão',    color: '#009c3b' },
  rejeitado:            { label: 'Rejeitado',     color: '#ff4444' },
};

function whatsappLink(w) {
  if (!w) return null;
  const num = w.replace(/\D/g, '');
  return `https://wa.me/${num.startsWith('55') ? num : '55' + num}`;
}

function Tag({ label, color }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, letterSpacing: .5, textTransform: 'uppercase',
      padding: '3px 9px', borderRadius: 6,
      color, background: color + '18', border: `1px solid ${color}30`,
    }}>{label}</span>
  );
}

/* ── Full info modal ── */
function TeamModal({ team, onClose }) {
  const status = STATUS_LABELS[team.status] || { label: team.status, color: '#64748b' };
  const wa = whatsappLink(team.whatsapp);

  const fields = [
    ['Clube',       team.club_name],
    ['País',        team.country],
    ['Cidade',      team.city],
    ['Contato',     team.contact_name],
    ['Cargo',       team.contact_role],
    ['WhatsApp',    team.whatsapp],
    ['E-mail',      team.email],
    ['Categorias',  team.category],
    ['Atletas',     team.athletes_count],
    ['Hospedagem',  team.hosting_preference],
    ['Apoio viagem',team.travel_support === 'yes' ? 'Sim' : team.travel_support === 'no' ? 'Não' : 'Talvez'],
    ['Histórico',   team.competitive_history],
    ['Observações', team.notes],
  ].filter(([, v]) => v != null && v !== '' && v !== '-');

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)',
        backdropFilter: 'blur(6px)', zIndex: 1000,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '32px 16px', overflowY: 'auto', fontFamily: "'Inter', sans-serif",
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        width: '100%', maxWidth: 680, position: 'relative',
        padding: '44px 48px',
        background: '#ffffff',
        border: '1px solid #e2e8f0', borderRadius: 28,
        boxShadow: '0 20px 60px rgba(0,0,0,.15)',
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: 20, right: 20, width: 34, height: 34, borderRadius: 10,
          background: '#f1f5f9', border: '1px solid #e2e8f0',
          color: '#64748b', fontSize: 15, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>✕</button>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
            <h2 style={{ fontSize: 26, fontWeight: 900, letterSpacing: -1, color: '#0f172a', margin: 0 }}>{team.club_name}</h2>
            <Tag label={status.label} color={status.color} />
          </div>
          <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>
            {[team.city, team.country].filter(Boolean).join(' · ')} · Cadastrado em {new Date(team.created_at).toLocaleDateString('pt-BR')}
          </p>
        </div>

        {/* Fields grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 40px',
          padding: '22px 24px', borderRadius: 16,
          background: '#f8fafc', border: '1px solid #e2e8f0',
          marginBottom: 24,
        }}>
          {fields.map(([label, value]) => (
            <div key={label} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', color: '#94a3b8', marginBottom: 3 }}>{label}</div>
              <div style={{ fontSize: 13, color: '#0f172a', lineHeight: 1.5 }}>{String(value)}</div>
            </div>
          ))}
        </div>

        {/* WhatsApp CTA */}
        {wa && (
          <a href={wa} target="_blank" rel="noopener noreferrer" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '12px 24px', borderRadius: 12,
            background: 'rgba(37,211,102,.12)', border: '1px solid rgba(37,211,102,.3)',
            color: '#25d366', textDecoration: 'none',
            fontSize: 13, fontWeight: 700,
          }}>
            💬 Contatar via WhatsApp
          </a>
        )}
      </div>
    </div>
  );
}

/* ── Team card ── */
function TeamCard({ team, onClick, inPipeline, adding, addToCRM, readOnly = false }) {
  const [hov, setHov] = useState(false);
  const status = STATUS_LABELS[team.status] || { label: team.status, color: '#94a3b8' };
  const travelColor = team.travel_support === 'yes' ? '#009c3b' : team.travel_support === 'maybe' ? '#f97316' : '#94a3b8';
  const travelLabel = team.travel_support === 'yes' ? '✈ Precisa de apoio' : team.travel_support === 'maybe' ? '✈ Talvez' : 'Sem apoio';
  const wa = whatsappLink(team.whatsapp);

  const cats = (team.category || '').split(',').map(c => c.trim()).filter(Boolean);

  return (
    <div
      onClick={() => onClick(team)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: '20px 22px', borderRadius: 16, cursor: 'pointer',
        background: '#ffffff',
        border: `1px solid ${hov ? '#334155' : '#e2e8f0'}`,
        boxShadow: hov ? '0 6px 20px rgba(0,0,0,.1)' : '0 1px 4px rgba(0,0,0,.06)',
        transform: hov ? 'translateY(-2px)' : 'none',
        transition: 'all .15s',
      }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginBottom: 3 }}>{team.club_name}</div>
          <div style={{ fontSize: 11, color: '#64748b' }}>{[team.city, team.country].filter(Boolean).join(' · ')}</div>
        </div>
        <Tag label={status.label} color={status.color} />
      </div>

      {/* Category + athletes tags */}
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
        {cats.map(c => <Tag key={c} label={c} color="#4d8aff" />)}
        {team.athletes_count && <Tag label={`${team.athletes_count} atletas`} color="#64748b" />}
      </div>

      {/* Hosting */}
      {team.hosting_preference && (
        <div style={{ fontSize: 11, color: '#64748b', marginBottom: 10 }}>
          🏨 {team.hosting_preference}
        </div>
      )}

      {/* Bottom row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: travelColor }}>{travelLabel}</span>
        <div style={{ display: 'flex', gap: 6 }}>
          {wa && (
            <a
              href={wa} target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              style={{
                padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                background: 'rgba(37,211,102,.1)', border: '1px solid rgba(37,211,102,.25)',
                color: '#25d366', textDecoration: 'none',
              }}
            >WhatsApp</a>
          )}
          {!readOnly && (
            <button
              onClick={e => !inPipeline.has(team.id) && addToCRM(e, team.id)}
              style={{
                padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                background: inPipeline.has(team.id) ? 'rgba(32,227,63,.06)' : 'rgba(77,138,255,.1)',
                border: `1px solid ${inPipeline.has(team.id) ? 'rgba(32,227,63,.2)' : 'rgba(77,138,255,.25)'}`,
                color: inPipeline.has(team.id) ? '#009c3b' : '#4d8aff',
                cursor: inPipeline.has(team.id) ? 'default' : 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {adding === team.id ? '...' : inPipeline.has(team.id) ? '✓ No CRM' : '+ CRM'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title, count, color, sublabel }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 14 }}>
      <span style={{ width: 9, height: 9, borderRadius: '50%', background: color, flexShrink: 0, display: 'inline-block' }} />
      <span style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>{title}</span>
      {sublabel && <span style={{ fontSize: 11, color: '#64748b' }}>{sublabel}</span>}
      <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 20, background: color + '14', color, border: `1px solid ${color}28` }}>{count}</span>
    </div>
  );
}

export default function BluePandaPage() {
  const [teams, setTeams]       = useState(null);
  const [selected, setSelected] = useState(null);
  const [inPipeline, setInPipeline] = useState(new Set());
  const [adding, setAdding]     = useState(null);
  const [role, setRole]         = useState('viewer');

  useEffect(() => {
    fetch('/api/admin/me').then(r => r.json()).then(d => setRole(d.role || 'viewer'));
    fetch('/api/admin/teams').then(r => r.json()).then(d => setTeams(d.teams || []));
    fetch('/api/admin/blue-panda/deals').then(r => r.json()).then(d => {
      setInPipeline(new Set((d.deals || []).map(x => x.team_id)));
    });
  }, []);

  async function addToCRM(e, teamId) {
    e.stopPropagation();
    if (role === 'viewer') return;
    setAdding(teamId);
    await fetch('/api/admin/blue-panda/deals', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ team_id: teamId }),
    });
    setInPipeline(prev => new Set([...prev, teamId]));
    setAdding(null);
  }

  const loading = teams === null;

  const active = (teams || []).filter(t =>
    t.status === 'pre_inscrito' || t.status === 'inscricao_confirmada' || t.status === 'aprovado'
  );

  const needsTravel = active.filter(t => t.travel_support === 'yes');
  const maybeTravel = active.filter(t => t.travel_support === 'maybe');
  const noTravel    = active.filter(t => t.travel_support === 'no' || !t.travel_support);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: '#0f172a' }}>
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', color: '#4d8aff', marginBottom: 8 }}>Blue Panda</div>
        <h1 style={{ fontSize: 36, fontWeight: 900, letterSpacing: -1.5, color: '#0f172a', marginBottom: 4 }}>Logística & Hospedagem</h1>
        <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
          Clique em qualquer time para ver todas as informações
        </p>
      </div>

      {loading ? (
        <div style={{ color: '#94a3b8', paddingTop: 80, textAlign: 'center', fontSize: 14 }}>Carregando...</div>
      ) : (
        <>
          {/* ── Seção 1: Apoio na viagem ── */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0', borderRadius: 20,
            padding: '28px 28px', marginBottom: 20,
            boxShadow: '0 1px 4px rgba(0,0,0,.06)',
          }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: '#94a3b8', marginBottom: 20 }}>
              SEÇÃO 1 · APOIO NA VIAGEM
            </div>

            {/* Summary */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
              {[
                { label: 'Precisam',     value: needsTravel.length, color: '#009c3b' },
                { label: 'Talvez',       value: maybeTravel.length, color: '#f97316' },
                { label: 'Não precisam', value: noTravel.length,    color: '#94a3b8' },
              ].map(s => (
                <div key={s.label} style={{
                  flex: 1, padding: '16px 20px', borderRadius: 14,
                  background: s.color + '08', border: `1px solid ${s.color}20`,
                }}>
                  <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', color: s.color, marginBottom: 6 }}>{s.label}</div>
                  <div style={{ fontSize: 38, fontWeight: 900, letterSpacing: -2, lineHeight: 1, color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>

            {needsTravel.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <SectionHeader title="Precisam de apoio" count={needsTravel.length} color="#009c3b" />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 10 }}>
                  {needsTravel.map(t => <TeamCard key={t.id} team={t} onClick={setSelected} inPipeline={inPipeline} adding={adding} addToCRM={addToCRM} readOnly={role === 'viewer'} />)}
                </div>
              </div>
            )}

            {maybeTravel.length > 0 && (
              <div>
                <SectionHeader title="Talvez precisem" count={maybeTravel.length} color="#009c3b" />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 10 }}>
                  {maybeTravel.map(t => <TeamCard key={t.id} team={t} onClick={setSelected} inPipeline={inPipeline} adding={adding} addToCRM={addToCRM} readOnly={role === 'viewer'} />)}
                </div>
              </div>
            )}
          </div>

          {/* ── Seção 2: Hospedagem ── */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0', borderRadius: 20,
            padding: '28px 28px',
            boxShadow: '0 1px 4px rgba(0,0,0,.06)',
          }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: '#94a3b8', marginBottom: 24 }}>
              SEÇÃO 2 · PREFERÊNCIAS DE HOSPEDAGEM — TODOS OS TIMES
            </div>

            {HOSTING_GROUPS.map(group => {
              const items = active.filter(t => group.match(t.hosting_preference));
              if (items.length === 0) return null;
              return (
                <div key={group.key} style={{ marginBottom: 28 }}>
                  <SectionHeader title={group.label} sublabel={group.sublabel} count={items.length} color={group.color} />
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 10 }}>
                    {items.map(t => <TeamCard key={t.id} team={t} onClick={setSelected} inPipeline={inPipeline} adding={adding} addToCRM={addToCRM} readOnly={role === 'viewer'} />)}
                  </div>
                </div>
              );
            })}

            {/* Sem preferência */}
            {(() => {
              const matched = new Set(HOSTING_GROUPS.flatMap(g => active.filter(t => g.match(t.hosting_preference)).map(t => t.id)));
              const unmatched = active.filter(t => !matched.has(t.id));
              if (unmatched.length === 0) return null;
              return (
                <div>
                  <SectionHeader title="Não informado" count={unmatched.length} color="#94a3b8" />
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 10 }}>
                    {unmatched.map(t => <TeamCard key={t.id} team={t} onClick={setSelected} inPipeline={inPipeline} adding={adding} addToCRM={addToCRM} readOnly={role === 'viewer'} />)}
                  </div>
                </div>
              );
            })()}
          </div>
        </>
      )}

      {selected && <TeamModal team={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
