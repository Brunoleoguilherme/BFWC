'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';

const S = {
  card: {
    padding: '16px 18px', marginBottom: 10,
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: 16,
    boxShadow: '0 1px 4px rgba(0,0,0,.06)',
    transition: 'border-color .15s, transform .15s, box-shadow .15s, opacity .15s',
  },
  tag: (color) => ({
    fontSize: 10, fontWeight: 700, letterSpacing: .5,
    padding: '3px 9px', borderRadius: 6, textTransform: 'uppercase',
    background: color + '18', color, border: `1px solid ${color}30`,
  }),
  mInput: {
    width: '100%', padding: '13px 16px',
    background: '#f8fafc', border: '1px solid #e2e8f0',
    borderRadius: 12, color: '#0f172a', fontSize: 13, outline: 'none', marginBottom: 12,
    fontFamily: "'Inter', sans-serif",
  },
  mSaveBtn: (sent) => ({
    padding: '11px 24px', borderRadius: 12,
    fontSize: 12, fontWeight: 900, letterSpacing: 1.5, textTransform: 'uppercase',
    background: sent ? '#009c3b' : '#009c3b',
    color: '#031020', border: 'none', cursor: 'pointer',
    fontFamily: "'Inter', sans-serif",
  }),
  mActionBtn: (color) => ({
    padding: '9px 18px', borderRadius: 10, fontSize: 12, fontWeight: 700,
    cursor: 'pointer', letterSpacing: .5,
    background: color + '14', color, border: `1px solid ${color}35`,
    fontFamily: 'inherit', transition: 'all .2s',
  }),
  mEmailOpt: (sel) => ({
    padding: '9px 16px', borderRadius: 10, fontSize: 12, fontWeight: 600,
    cursor: 'pointer', fontFamily: 'inherit',
    background: sel ? '#031020' : '#f1f5f9',
    border: `1px solid ${sel ? '#031020' : '#e2e8f0'}`,
    color: sel ? '#fff' : '#475569',
    transition: 'all .2s',
  }),
};

const STATUSES = [
  { key: 'pre_inscrito',         label: 'Pré-inscritos', color: '#a855f7' },
  { key: 'pendente_analise',     label: 'Pendente',      color: '#94a3b8' },
  { key: 'em_revisao',           label: 'Em Revisão',    color: '#009c3b' },
  { key: 'aprovado',             label: 'Aprovado',      color: '#009c3b' },
  { key: 'inscricao_confirmada', label: 'Confirmado',    color: '#0D4BFF' },
  { key: 'rejeitado',            label: 'Rejeitado',     color: '#ff4444' },
];
const STATUS_MAP = Object.fromEntries(STATUSES.map(s => [s.key, s]));

function Tag({ label, color }) {
  return <span style={S.tag(color)}>{label}</span>;
}

function Card({ team, onClick, isDragging, onDragStart, onDragEnd }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      style={{
        ...S.card,
        cursor: isDragging ? 'grabbing' : 'grab',
        opacity: isDragging ? 0.35 : 1,
        borderColor: hov && !isDragging ? '#334155' : '#e2e8f0',
        transform: hov && !isDragging ? 'translateY(-2px)' : 'none',
        boxShadow: hov && !isDragging ? '0 6px 20px rgba(0,0,0,.1)' : '0 1px 4px rgba(0,0,0,.06)',
        userSelect: 'none',
      }}
      onClick={() => !isDragging && onClick(team)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{team.club_name}</span>
        {team.travel_support === 'yes' && <span style={{ fontSize: 12 }}>✈️</span>}
      </div>
      <div style={{ fontSize: 11, color: '#64748b', margin: '4px 0 10px' }}>
        {[team.city, team.country].filter(Boolean).join(' · ')}
      </div>
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 8 }}>
        {team.category && <Tag label={team.category.split(',')[0].trim()} color="#0D4BFF" />}
        {team.athletes_count && <Tag label={`${team.athletes_count} atletas`} color="#64748b" />}
        {team.flagged_suspect && <Tag label="⚠ Suspeito" color="#ff4444" />}
      </div>
      <div style={{ fontSize: 10, color: '#94a3b8' }}>
        {new Date(team.created_at).toLocaleDateString('pt-BR')}
      </div>
    </div>
  );
}

function Modal({ team, onClose, onUpdate, readOnly = false }) {
  const [detail, setDetail] = useState(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [emailTpl, setEmailTpl] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [teamEmail, setTeamEmail] = useState('');

  useEffect(() => {
    fetch(`/api/admin/teams/${team.id}`).then(r => r.json()).then(d => {
      setDetail(d);
      setNotes(d.team?.admin_notes || '');
      setTeamEmail(d.team?.email || '');
    });
  }, [team.id]);

  const t = detail?.team || team;
  const events = detail?.events || [];
  const statusInfo = STATUS_MAP[t.status] || { color: '#94a3b8', label: t.status };

  async function updateStatus(s) {
    await fetch(`/api/admin/teams/${t.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: s }),
    });
    onUpdate();
  }

  async function saveNotes() {
    setSaving(true);
    await fetch(`/api/admin/teams/${t.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ admin_notes: notes }),
    });
    const d = await fetch(`/api/admin/teams/${t.id}`).then(r => r.json());
    setDetail(d); setSaving(false);
  }

  async function toggleSuspect() {
    await fetch(`/api/admin/teams/${t.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ flagged_suspect: !detail?.team?.flagged_suspect }),
    });
    onUpdate();
  }

  async function sendEmail() {
    if (!emailTpl) return;
    setSendingEmail(true);
    const res = await fetch(`/api/admin/teams/${t.id}/email`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ template: emailTpl, teamEmail }),
    });
    setSendingEmail(false);
    if (res.ok) {
      setEmailSent(true);
      const d = await fetch(`/api/admin/teams/${t.id}`).then(r => r.json());
      setDetail(d);
      setTimeout(() => setEmailSent(false), 3000);
    }
  }

  const fields = [
    ['Clube', t.club_name], ['País', t.country], ['Cidade', t.city],
    ['Contato', t.contact_name], ['Cargo', t.contact_role], ['WhatsApp', t.whatsapp],
    ['Categorias', t.category], ['Atletas', t.athletes_count],
    ['Hospedagem', t.hosting_preference], ['Apoio viagem', t.travel_support],
    ['Histórico', t.competitive_history], ['Observações', t.notes],
  ].filter(([, v]) => v != null && v !== '');

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
        width: '100%', maxWidth: 760, position: 'relative', padding: '44px 48px',
        background: '#ffffff',
        border: '1px solid #e2e8f0', borderRadius: 28,
        boxShadow: '0 20px 60px rgba(0,0,0,.15)',
      }}>
        <button style={{
          position: 'absolute', top: 20, right: 20, width: 34, height: 34, borderRadius: 10,
          background: '#f1f5f9', border: '1px solid #e2e8f0',
          color: '#64748b', fontSize: 15, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit',
        }} onClick={onClose}>✕</button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4, flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: 26, fontWeight: 900, letterSpacing: -1, color: '#0f172a' }}>{t.club_name}</h2>
          <Tag label={statusInfo.label} color={statusInfo.color} />
          {t.flagged_suspect && <Tag label="⚠ Suspeito" color="#ff4444" />}
        </div>
        <p style={{ fontSize: 12, color: '#64748b', marginBottom: 28 }}>
          Cadastro em {new Date(t.created_at).toLocaleString('pt-BR')}
        </p>

        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 40px',
          padding: '22px 24px', borderRadius: 16,
          background: '#f8fafc', border: '1px solid #e2e8f0',
          marginBottom: 24,
        }}>
          {fields.map(([label, value]) => (
            <div key={label}>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', color: '#94a3b8', marginBottom: 3 }}>{label}</div>
              <div style={{ fontSize: 13, color: '#0f172a', marginBottom: 14 }}>{String(value)}</div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: '#94a3b8', marginBottom: 10 }}>E-mail do clube</div>
          <input style={S.mInput} value={teamEmail} onChange={e => setTeamEmail(e.target.value)} placeholder="email@clube.com" />
        </div>

        {!readOnly && (
          <>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: '#94a3b8', marginBottom: 10 }}>Mover para</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {STATUSES.filter(s => s.key !== t.status).map(s => (
                  <button key={s.key} style={S.mActionBtn(s.color)} onClick={() => { updateStatus(s.key); onClose(); }}>{s.label}</button>
                ))}
                <button style={S.mActionBtn('#ff4444')} onClick={() => { updateStatus('spam_descartado'); onClose(); }}>🗑 Spam</button>
                <button style={S.mActionBtn('#009c3b')} onClick={toggleSuspect}>{t.flagged_suspect ? '✓ Desmarcar' : '⚠ Suspeito'}</button>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '24px 0' }} />

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: '#94a3b8', marginBottom: 10 }}>Enviar e-mail</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                {[['aprovado','✓ Aprovado'],['info_adicional','? Pedir info'],['rejeitado','✕ Rejeitado']].map(([k,l]) => (
                  <button key={k} style={S.mEmailOpt(emailTpl === k)} onClick={() => setEmailTpl(emailTpl === k ? '' : k)}>{l}</button>
                ))}
              </div>
              {emailTpl && (
                <button style={S.mSaveBtn(emailSent)} onClick={sendEmail} disabled={sendingEmail || !teamEmail}>
                  {sendingEmail ? 'Enviando...' : emailSent ? '✓ Enviado!' : 'Enviar e-mail'}
                </button>
              )}
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '24px 0' }} />

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: '#94a3b8', marginBottom: 10 }}>Anotações internas</div>
              <textarea
                style={{ ...S.mInput, resize: 'vertical', minHeight: 80 }}
                value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="Notas visíveis apenas para admins..."
              />
              <button style={S.mSaveBtn(false)} onClick={saveNotes} disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar anotação'}
              </button>
            </div>
          </>
        )}

        {readOnly && (
          <div style={{ padding: '14px 18px', borderRadius: 12, background: '#f1f5f9', border: '1px solid #e2e8f0', fontSize: 12, color: '#64748b', textAlign: 'center', marginBottom: 20 }}>
            Modo somente leitura — apenas admins podem alterar dados
          </div>
        )}

        {events.length > 0 && (
          <>
            <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '24px 0' }} />
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: '#94a3b8', marginBottom: 10 }}>Histórico</div>
            {events.map(ev => (
              <div key={ev.id} style={{
                padding: '12px 16px', borderRadius: 12, marginBottom: 8,
                background: '#f8fafc', border: '1px solid #e2e8f0',
                fontSize: 12, color: '#475569',
              }}>
                <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 4 }}>
                  {new Date(ev.created_at).toLocaleString('pt-BR')} · {ev.created_by}
                </div>
                {ev.description}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

export default function TeamsPage() {
  const searchParams = useSearchParams();
  const filterStatus = searchParams.get('status');

  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [showSpam, setShowSpam] = useState(false);
  const [role, setRole] = useState('admin');

  useEffect(() => {
    fetch('/api/admin/me').then(r => r.json()).then(d => setRole(d.role || 'viewer'));
  }, []);

  // Drag state
  const [dragId, setDragId] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const dragCounter = useRef({});

  const fetchTeams = useCallback(async () => {
    setLoading(true);
    const d = await fetch('/api/admin/teams').then(r => r.json());
    setTeams(d.teams || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchTeams(); }, [fetchTeams]);

  async function handleDrop(colKey) {
    if (!dragId || role === 'viewer') return;
    const team = teams.find(t => t.id === dragId);
    if (!team || team.status === colKey) { setDragId(null); setDragOver(null); return; }

    // Optimistic update
    setTeams(prev => prev.map(t => t.id === dragId ? { ...t, status: colKey } : t));
    setDragId(null);
    setDragOver(null);

    await fetch(`/api/admin/teams/${dragId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: colKey }),
    });
  }

  const filtered = teams.filter(t => {
    if (!showSpam && t.status === 'spam_descartado') return false;
    if (filterStatus && t.status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      return t.club_name?.toLowerCase().includes(q) ||
        t.contact_name?.toLowerCase().includes(q) ||
        t.city?.toLowerCase().includes(q) ||
        t.country?.toLowerCase().includes(q);
    }
    return true;
  });

  const confirmed = teams.filter(t => t.status === 'inscricao_confirmada');
  const total = teams.filter(t => t.status !== 'spam_descartado').length;
  const totalAthletes = confirmed.reduce((s, t) => s + (parseInt(t.athletes_count) || 0), 0);
  const pendingCount = teams.filter(t => t.status === 'pendente_analise').length;

  const cols = showSpam
    ? [...STATUSES, { key: 'spam_descartado', label: 'Spam', color: '#ff4444' }]
    : STATUSES;

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: '#0f172a' }}>
      <style>{`
        .teams-stats { display: flex; gap: 12px; margin-bottom: 28px; flex-wrap: wrap; }
        .teams-stat-card { flex: 1; min-width: 100px; padding: 18px 20px; border-radius: 16px; }
        .teams-board { display: flex; overflow-x: auto; align-items: flex-start; padding-bottom: 32px; gap: 0; }
        .teams-col { width: 252px; flex-shrink: 0; }
        @media (max-width: 640px) {
          .teams-stats { gap: 8px; }
          .teams-stat-card { padding: 14px 16px !important; min-width: 80px; }
          .teams-stat-num { font-size: 28px !important; }
          .teams-board { flex-direction: column; overflow-x: visible; padding-bottom: 16px; }
          .teams-col { width: 100% !important; margin-bottom: 8px; }
          .teams-col-divider { display: none !important; }
          .teams-title { font-size: 26px !important; }
        }
      `}</style>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', color: '#009c3b', marginBottom: 8 }}>CRM</div>
        <h1 className="teams-title" style={{ fontSize: 36, fontWeight: 900, letterSpacing: -1.5, color: '#0f172a', marginBottom: 0 }}>
          {filterStatus ? (STATUS_MAP[filterStatus]?.label || filterStatus) : 'Times Inscritos'}
        </h1>
        {filterStatus && (
          <a href="/admin/teams" style={{ display: 'inline-block', marginTop: 8, fontSize: 12, color: '#64748b', textDecoration: 'none' }}>
            ← Ver todos
          </a>
        )}
      </div>

      {/* Stats */}
      <div className="teams-stats">
        {[
          { label: 'Total',       value: total,            alert: false },
          { label: 'Confirmados', value: confirmed.length, alert: false },
          { label: 'Atletas',     value: totalAthletes,    alert: false },
          { label: 'Pendentes',   value: pendingCount,     alert: pendingCount > 0 },
        ].map(s => (
          <div key={s.label} style={{
            flex: 1, minWidth: 130, padding: '18px 22px',
            background: s.alert ? '#fffde7' : '#ffffff',
            border: `1px solid ${s.alert ? 'rgba(244,255,0,.4)' : '#e2e8f0'}`,
            borderRadius: 16,
            boxShadow: '0 1px 4px rgba(0,0,0,.06)',
          }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: s.alert ? '#009c3b' : '#64748b', marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: 38, fontWeight: 900, letterSpacing: -2, lineHeight: 1, color: '#0f172a' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          style={{
            flex: 1, minWidth: 280, padding: '12px 18px',
            background: '#ffffff', border: '1px solid #e2e8f0',
            borderRadius: 12, color: '#0f172a', fontSize: 14, outline: 'none',
            fontFamily: "'Inter', sans-serif",
          }}
          placeholder="Buscar por clube, cidade, país..."
          value={search} onChange={e => setSearch(e.target.value)}
        />
        {[
          { label: showSpam ? '✓ Spam visível' : 'Mostrar spam', active: showSpam, fn: () => setShowSpam(!showSpam) },
          { label: '↻ Atualizar', active: false, fn: fetchTeams },
        ].map(b => (
          <button key={b.label} onClick={b.fn} style={{
            padding: '12px 18px', borderRadius: 12, fontSize: 12, fontWeight: 700,
            letterSpacing: 1, cursor: 'pointer',
            background: b.active ? '#031020' : '#f1f5f9',
            border: `1px solid ${b.active ? '#031020' : '#e2e8f0'}`,
            color: b.active ? '#fff' : '#475569',
            textTransform: 'uppercase', fontFamily: "'Inter', sans-serif",
          }}>{b.label}</button>
        ))}
      </div>

      {/* Board / List */}
      {loading ? (
        <div style={{ color: '#94a3b8', textAlign: 'center', paddingTop: 80, fontSize: 14 }}>Carregando...</div>
      ) : filterStatus ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
          {filtered.length === 0 ? (
            <div style={{ border: '1px dashed #e2e8f0', borderRadius: 14, padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
              Nenhum time com este status
            </div>
          ) : (
            filtered.map(t => <Card key={t.id} team={t} onClick={setSelected} isDragging={false} onDragStart={() => {}} onDragEnd={() => {}} />)
          )}
        </div>
      ) : (
        /* Kanban with drag-and-drop */
        <div className="teams-board">
          {cols.map((col, idx) => {
            const items = filtered.filter(t => t.status === col.key);
            const isOver = dragOver === col.key;

            return (
              <div key={col.key} style={{ display: 'flex', flexShrink: 0, width: '100%' }}>
                {/* Divider between columns */}
                {idx > 0 && (
                  <div className="teams-col-divider" style={{
                    width: 1,
                    alignSelf: 'stretch',
                    background: '#e2e8f0',
                    margin: '0 10px',
                    flexShrink: 0,
                  }} />
                )}

                {/* Column */}
                <div
                  className="teams-col"
                  style={{ width: 252 }}
                  onDragOver={e => { e.preventDefault(); if (dragOver !== col.key) setDragOver(col.key); }}
                  onDragEnter={e => { e.preventDefault(); setDragOver(col.key); }}
                  onDragLeave={e => {
                    if (!e.currentTarget.contains(e.relatedTarget)) setDragOver(null);
                  }}
                  onDrop={e => { e.preventDefault(); handleDrop(col.key); }}
                >
                  {/* Column header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, padding: '0 2px' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: col.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', color: '#475569' }}>{col.label}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 20, background: '#e2e8f0', color: '#64748b' }}>{items.length}</span>
                  </div>

                  {/* Drop zone */}
                  <div style={{
                    minHeight: 80,
                    borderRadius: 14,
                    background: isOver ? `${col.color}0a` : 'transparent',
                    border: isOver ? `1px dashed ${col.color}50` : '1px solid transparent',
                    padding: isOver ? 6 : 0,
                    transition: 'all .15s',
                  }}>
                    {items.map(t => (
                      <Card
                        key={t.id}
                        team={t}
                        onClick={setSelected}
                        isDragging={dragId === t.id}
                        onDragStart={(e) => {
                          e.dataTransfer.effectAllowed = 'move';
                          setDragId(t.id);
                        }}
                        onDragEnd={() => { setDragId(null); setDragOver(null); }}
                      />
                    ))}
                    {items.length === 0 && !isOver && (
                      <div style={{
                        border: '1px dashed #e2e8f0', borderRadius: 14,
                        padding: 28, textAlign: 'center', color: '#94a3b8', fontSize: 12,
                      }}>
                        Nenhum time
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selected && (
        <Modal team={selected} onClose={() => setSelected(null)} onUpdate={() => { fetchTeams(); setSelected(null); }} readOnly={role === 'viewer'} />
      )}
    </div>
  );
}
