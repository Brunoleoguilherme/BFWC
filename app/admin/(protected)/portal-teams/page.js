'use client';

import { useState, useEffect } from 'react';

const STATUS_LABEL = {
  pending_email:    { label: 'Aguard. e-mail',  color: '#a855f7' },
  pending_approval: { label: 'Aguard. aprovação', color: '#009c3b' },
  approved:         { label: 'Aprovado',         color: '#009c3b' },
  rejected:         { label: 'Recusado',         color: '#ff4444' },
};

const FILTER_TABS = [
  { key: 'all',              label: 'Todos' },
  { key: 'pending_approval', label: 'Aguardando aprovação', color: '#009c3b' },
  { key: 'approved',         label: 'Aprovados',            color: '#009c3b' },
  { key: 'rejected',         label: 'Recusados',            color: '#ff4444' },
  { key: 'pending_email',    label: 'Aguard. e-mail',       color: '#a855f7' },
];

function Tag({ status }) {
  const s = STATUS_LABEL[status] || { label: status, color: '#888' };
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, letterSpacing: .5, textTransform: 'uppercase',
      padding: '3px 10px', borderRadius: 6,
      background: s.color + '18', color: s.color, border: `1px solid ${s.color}30`,
    }}>{s.label}</span>
  );
}

export default function PortalTeamsPage() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending_approval');
  const [expanded, setExpanded] = useState(null);
  const [notes, setNotes] = useState({});
  const [acting, setActing] = useState(null);
  const [toast, setToast] = useState('');

  async function load() {
    setLoading(true);
    const res = await fetch('/api/admin/portal-teams');
    const data = await res.json();
    setTeams(data.teams || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  async function act(id, action) {
    setActing(id + action);
    const res = await fetch(`/api/admin/portal-teams/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, admin_notes: notes[id] || '' }),
    });
    const data = await res.json();
    setActing(null);
    if (data.ok) {
      showToast(action === 'approve' ? '✅ Cadastro aprovado! E-mail enviado.' : '❌ Cadastro recusado.');
      setTeams(ts => ts.map(t => t.id === id ? { ...t, status: data.status } : t));
      setExpanded(null);
    } else {
      showToast('Erro: ' + data.message);
    }
  }

  const filtered = filter === 'all' ? teams : teams.filter(t => t.status === filter);
  const pendingCount = teams.filter(t => t.status === 'pending_approval').length;

  const cardStyle = {
    padding: '16px 20px', marginBottom: 10,
    background: '#ffffff',
    border: '1px solid #e2e8f0', borderRadius: 16,
    boxShadow: '0 1px 4px rgba(0,0,0,.06)',
  };

  return (
    <div style={{ padding: '28px 32px', maxWidth: 860, fontFamily: "'Inter', sans-serif" }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 24, zIndex: 999,
          padding: '12px 20px', borderRadius: 12, fontSize: 13, fontWeight: 700,
          background: '#ffffff', border: '1px solid #e2e8f0',
          color: '#0f172a', boxShadow: '0 8px 32px rgba(0,0,0,.12)',
          animation: 'cardIn .3s ease',
        }}>{toast}</div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', margin: 0 }}>Clubes do Portal</h1>
          {pendingCount > 0 && (
            <span style={{ padding: '3px 10px', borderRadius: 20, background: 'rgba(244,255,0,.12)', color: '#009c3b', fontSize: 11, fontWeight: 900, border: '1px solid rgba(244,255,0,.25)' }}>
              {pendingCount} aguardando
            </span>
          )}
        </div>
        <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>Gerencie as contas de clubes cadastrados no portal.</p>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {FILTER_TABS.map(tab => (
          <button key={tab.key} onClick={() => setFilter(tab.key)} style={{
            padding: '7px 14px', borderRadius: 9, fontSize: 12, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s',
            background: filter === tab.key ? (tab.color ? tab.color + '18' : '#e2e8f0') : '#f1f5f9',
            color: filter === tab.key ? (tab.color || '#0f172a') : '#64748b',
            border: filter === tab.key ? `1px solid ${tab.color ? tab.color + '35' : '#cbd5e1'}` : '1px solid #e2e8f0',
          }}>
            {tab.label}
            {tab.key !== 'all' && (
              <span style={{ marginLeft: 6, opacity: .6 }}>
                ({teams.filter(t => t.status === tab.key).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div style={{ color: '#94a3b8', fontSize: 13 }}>Carregando...</div>
      ) : filtered.length === 0 ? (
        <div style={{ ...cardStyle, textAlign: 'center', color: '#94a3b8', fontSize: 13, padding: '32px' }}>
          Nenhum clube neste filtro.
        </div>
      ) : filtered.map(team => {
        const isOpen = expanded === team.id;
        const isPending = team.status === 'pending_approval';
        return (
          <div key={team.id} style={cardStyle}>
            {/* Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 800, fontSize: 15, color: '#0f172a' }}>{team.club_name}</span>
                  <Tag status={team.status} />
                  {!team.email_verified && (
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#a855f7', background: 'rgba(168,85,247,.1)', border: '1px solid rgba(168,85,247,.2)', borderRadius: 6, padding: '2px 8px' }}>e-mail não verificado</span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: '#64748b', display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                  <span>👤 {team.contact_name}{team.contact_role ? ` · ${team.contact_role}` : ''}</span>
                  {team.country && <span>🌍 {team.country}{team.city ? `, ${team.city}` : ''}</span>}
                  <span>✉ {team.email}</span>
                  {team.whatsapp && <span>📱 {team.whatsapp}</span>}
                </div>
                {team.category && (
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                    🏷 {team.category}{team.athletes_count ? ` · ${team.athletes_count} atletas` : ''}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>
                {isPending && (
                  <>
                    <button onClick={() => act(team.id, 'approve')} disabled={!!acting} style={{
                      padding: '8px 16px', borderRadius: 9, fontSize: 12, fontWeight: 800,
                      background: '#009c3b', color: '#031020', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                      opacity: acting ? .5 : 1,
                    }}>
                      {acting === team.id + 'approve' ? '...' : '✓ Aprovar'}
                    </button>
                    <button onClick={() => setExpanded(isOpen ? null : team.id)} style={{
                      padding: '8px 16px', borderRadius: 9, fontSize: 12, fontWeight: 700,
                      background: 'rgba(255,68,68,.1)', color: '#ff4444', border: '1px solid rgba(255,68,68,.2)', cursor: 'pointer', fontFamily: 'inherit',
                    }}>
                      ✕ Recusar
                    </button>
                  </>
                )}
                {!isPending && (
                  <button onClick={() => setExpanded(isOpen ? null : team.id)} style={{
                    padding: '7px 12px', borderRadius: 9, fontSize: 11, fontWeight: 700,
                    background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0', cursor: 'pointer', fontFamily: 'inherit',
                  }}>
                    {isOpen ? '▲' : '▼'} Detalhes
                  </button>
                )}
              </div>
            </div>

            {/* Expanded: reject form or details */}
            {isOpen && (
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #e2e8f0' }}>
                {isPending ? (
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                      Motivo da recusa (opcional — será enviado ao clube)
                    </label>
                    <textarea
                      value={notes[team.id] || ''}
                      onChange={e => setNotes(n => ({ ...n, [team.id]: e.target.value }))}
                      placeholder="Ex: Documentação incompleta, clube já inscrito via outra rota..."
                      rows={3}
                      style={{
                        width: '100%', boxSizing: 'border-box', padding: '12px 14px',
                        background: '#f8fafc', border: '1px solid #e2e8f0',
                        borderRadius: 10, color: '#0f172a', fontSize: 13, resize: 'vertical',
                        fontFamily: 'inherit', outline: 'none', marginBottom: 10,
                      }}
                    />
                    <button onClick={() => act(team.id, 'reject')} disabled={!!acting} style={{
                      padding: '10px 22px', borderRadius: 10, fontSize: 12, fontWeight: 800,
                      background: 'rgba(255,68,68,.1)', color: '#ff4444', border: '1px solid rgba(255,68,68,.25)', cursor: 'pointer', fontFamily: 'inherit',
                      opacity: acting ? .5 : 1,
                    }}>
                      {acting === team.id + 'reject' ? 'Recusando...' : 'Confirmar recusa'}
                    </button>
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.8 }}>
                    <div><strong style={{ color: '#475569' }}>Status:</strong> {STATUS_LABEL[team.status]?.label}</div>
                    {team.admin_notes && <div><strong style={{ color: '#475569' }}>Notas admin:</strong> {team.admin_notes}</div>}
                    {team.approved_at && <div><strong style={{ color: '#475569' }}>Aprovado em:</strong> {new Date(team.approved_at).toLocaleString('pt-BR')}</div>}
                    <div><strong style={{ color: '#475569' }}>Cadastrado em:</strong> {new Date(team.created_at).toLocaleString('pt-BR')}</div>
                    <div><strong style={{ color: '#475569' }}>Idioma:</strong> {team.preferred_language?.toUpperCase()}</div>
                    {team.status === 'rejected' && (
                      <button onClick={() => act(team.id, 'approve')} style={{
                        marginTop: 10, padding: '8px 16px', borderRadius: 9, fontSize: 12, fontWeight: 800,
                        background: '#009c3b', color: '#031020', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                      }}>
                        ✓ Aprovar mesmo assim
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
