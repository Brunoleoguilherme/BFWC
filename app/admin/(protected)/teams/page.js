'use client';

import { useState, useEffect, useCallback } from 'react';

const S = {
  card: {
    padding: '14px 15px', marginBottom: 10,
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: 14,
    boxShadow: '0 1px 4px rgba(0,0,0,.06)',
    cursor: 'pointer',
    transition: 'border-color .15s, transform .15s, box-shadow .15s',
    userSelect: 'none',
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
  mActionBtn: (color, solid = false) => ({
    padding: '10px 20px', borderRadius: 10, fontSize: 12, fontWeight: 800,
    cursor: 'pointer', letterSpacing: .5,
    background: solid ? color : color + '14',
    color: solid ? '#fff' : color,
    border: `1px solid ${solid ? color : color + '35'}`,
    fontFamily: 'inherit', transition: 'all .2s',
  }),
  label: {
    fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase',
    color: '#94a3b8', marginBottom: 10,
  },
};

const BRL = (cents) => ((cents || 0) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// Colunas da linha do tempo
const COLS = [
  { key: 'pre',        label: 'Pré-inscritos',         sub: 'ainda não se cadastraram',   color: '#a855f7' },
  { key: 'cadastro',   label: 'Cadastro realizado',    sub: 'sem parcela paga',           color: '#0D4BFF' },
  { key: 'vaga',       label: 'Vaga garantida',        sub: '≥ 1 parcela paga',           color: '#ea580c' },
  { key: 'pago',       label: 'Pagamento total',       sub: 'todas as parcelas',          color: '#009c3b' },
  { key: 'atletas',    label: 'Atletas inscritos',     sub: 'escalação enviada',          color: '#14b8a6' },
  { key: 'finalizada', label: 'Inscrição finalizada',  sub: 'documentos validados',       color: '#031020' },
  { key: 'rejeitados', label: 'Rejeitados',            sub: 'pré-inscrição ou cadastro',  color: '#ff4444' },
];

// Etapas do stepper no modal (sem a coluna de rejeitados)
const STAGES = COLS.slice(0, 6);

function stageIndex(t) {
  if (t.kind === 'interest') return 0;
  if (t.finalized) return 5;
  if (t.lineup_submitted) return 4;
  if (t.fully_paid) return 3;
  if (t.paid_count >= 1) return 2;
  return 1;
}

function Tag({ label, color }) {
  return <span style={S.tag(color)}>{label}</span>;
}

function PreBadge({ pre }) {
  return pre
    ? <Tag label="✔ Pré-inscrito" color="#009c3b" />
    : <Tag label="⚠ Não era pré-inscrito" color="#d97706" />;
}

// ── Card de pré-inscrição (club_interests) ─────────────────────────────
function InterestCard({ t, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      style={{ ...S.card, borderColor: hov ? '#334155' : '#e2e8f0', transform: hov ? 'translateY(-2px)' : 'none' }}
      onClick={() => onClick(t)} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{t.club_name}</span>
        {t.travel_support === 'yes' && <span style={{ fontSize: 12 }}>✈️</span>}
      </div>
      <div style={{ fontSize: 11, color: '#64748b', margin: '3px 0 9px' }}>
        {[t.city, t.country].filter(Boolean).join(' · ')}
      </div>
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 8 }}>
        {t.category && <Tag label={t.category.split(',')[0].trim()} color="#0D4BFF" />}
        {t.athletes_count && <Tag label={`${t.athletes_count} atletas`} color="#64748b" />}
        {(t.email_clicked_at || t.email_opened_at) && (
          <Tag label={t.email_clicked_at ? '🔗 Clicou no e-mail' : '📬 Abriu o e-mail'} color={t.email_clicked_at ? '#009c3b' : '#0D4BFF'} />
        )}
        {t.status === 'rejeitado' && <Tag label="✕ Rejeitado" color="#ff4444" />}
        {t.flagged_suspect && <Tag label="⚠ Suspeito" color="#ff4444" />}
      </div>
      <div style={{ fontSize: 10, color: '#94a3b8' }}>{new Date(t.created_at).toLocaleDateString('pt-BR')}</div>
    </div>
  );
}

// ── Card de time do portal ─────────────────────────────────────────────
function PortalCard({ t, color, onClick }) {
  const [hov, setHov] = useState(false);
  const pct = t.total_cents > 0 ? Math.min(100, Math.round((t.paid_cents / t.total_cents) * 100)) : 0;
  return (
    <div
      style={{ ...S.card, borderColor: hov ? '#334155' : '#e2e8f0', transform: hov ? 'translateY(-2px)' : 'none' }}
      onClick={() => onClick(t)} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>{t.club_name}</span>
        <span style={{ fontSize: 10, fontWeight: 800, color: t.option === '2' ? '#a855f7' : '#0D4BFF', flexShrink: 0 }}>Opção {t.option}</span>
      </div>
      <div style={{ fontSize: 11, color: '#64748b', margin: '3px 0 8px' }}>
        {[t.city, t.country].filter(Boolean).join(' · ')}
      </div>
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
        {t.category && <Tag label={t.category.split(',')[0].trim()} color="#0D4BFF" />}
        <Tag label={`${t.athletes} atletas`} color="#64748b" />
        {t.checkout_started && t.paid_count === 0 && <Tag label="💳 Chegou ao checkout" color="#ea580c" />}
        {t.lineup_submitted && <Tag label="✓ Escalação" color="#14b8a6" />}
        {!t.pre_inscrito && t.status !== 'rejected' && <Tag label="⚠ Novo" color="#d97706" />}
        {t.status === 'rejected' && <Tag label="✕ Rejeitado" color="#ff4444" />}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, marginBottom: 5 }}>
        <span style={{ color: '#64748b', fontWeight: 600 }}>{BRL(t.paid_cents)} <span style={{ color: '#cbd5e1' }}>/ {BRL(t.total_cents)}</span></span>
        <span style={{ fontWeight: 800, color }}>{t.plan_size ? `${t.paid_count}/${t.plan_size} parc.` : `${pct}%`}</span>
      </div>
      <div style={{ height: 6, borderRadius: 5, background: '#e2e8f0', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color }} />
      </div>
    </div>
  );
}

// ── Stepper da linha do tempo (dentro do modal) ────────────────────────
function Stepper({ current, rejected }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 26, overflowX: 'auto', paddingBottom: 4 }}>
      {STAGES.map((s, i) => {
        const done = !rejected && i <= current;
        const active = !rejected && i === current;
        return (
          <div key={s.key} style={{ display: 'flex', alignItems: 'flex-start', flex: 1, minWidth: 74 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <div style={{
                width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 800,
                background: rejected ? '#fee2e2' : done ? (active ? s.color : '#009c3b') : '#e2e8f0',
                color: rejected ? '#ff4444' : done ? '#fff' : '#94a3b8',
                border: active ? `2px solid ${s.color}` : '2px solid transparent',
              }}>
                {rejected ? '✕' : done && !active ? '✓' : i + 1}
              </div>
              <div style={{
                fontSize: 9.5, fontWeight: active ? 800 : 600, textAlign: 'center', marginTop: 6,
                color: active ? '#0f172a' : '#94a3b8', lineHeight: 1.25, padding: '0 3px',
              }}>{s.label}</div>
            </div>
            {i < STAGES.length - 1 && (
              <div style={{ height: 2, flex: '0 0 12px', background: !rejected && i < current ? '#009c3b' : '#e2e8f0', marginTop: 12 }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Modal: pré-inscrição ───────────────────────────────────────────────
function InterestModal({ team, onClose, onUpdate, readOnly }) {
  const [detail, setDetail] = useState(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/teams/${team.id}`).then(r => r.json()).then(d => {
      setDetail(d);
      setNotes(d.team?.admin_notes || '');
    }).catch(() => {});
  }, [team.id]);

  const t = detail?.team || team;
  const events = detail?.events || [];
  const rejected = t.status === 'rejeitado';

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
    setSaving(false);
  }

  const fields = [
    ['Clube', t.club_name], ['País', t.country], ['Cidade', t.city],
    ['Contato', t.contact_name], ['E-mail', t.email], ['WhatsApp', t.whatsapp],
    ['Categorias', t.category], ['Atletas', t.athletes_count],
    ['Apoio viagem', t.travel_support], ['Observações', t.notes],
    ['E-mails enviados', team.email_clicked_at
      ? `🔗 Clicou no link em ${new Date(team.email_clicked_at).toLocaleString('pt-BR')}`
      : team.email_opened_at
      ? `📬 Abriu em ${new Date(team.email_opened_at).toLocaleString('pt-BR')}`
      : 'Sem registro de abertura'],
  ].filter(([, v]) => v != null && v !== '');

  return (
    <ModalShell onClose={onClose}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4, flexWrap: 'wrap' }}>
        <h2 style={{ fontSize: 26, fontWeight: 900, letterSpacing: -1, color: '#0f172a' }}>{t.club_name}</h2>
        <Tag label={rejected ? '✕ Rejeitado' : 'Pré-inscrito'} color={rejected ? '#ff4444' : '#a855f7'} />
        {t.flagged_suspect && <Tag label="⚠ Suspeito" color="#ff4444" />}
      </div>
      <p style={{ fontSize: 12, color: '#64748b', marginBottom: 22 }}>
        Pré-inscrição em {new Date(t.created_at).toLocaleString('pt-BR')} · ainda não fez o cadastro no portal
      </p>

      <Stepper current={0} rejected={rejected} />

      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 40px',
        padding: '22px 24px', borderRadius: 16,
        background: '#f8fafc', border: '1px solid #e2e8f0', marginBottom: 24,
      }}>
        {fields.map(([label, value]) => (
          <div key={label}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', color: '#94a3b8', marginBottom: 3 }}>{label}</div>
            <div style={{ fontSize: 13, color: '#0f172a', marginBottom: 14, wordBreak: 'break-word' }}>{String(value)}</div>
          </div>
        ))}
      </div>

      {!readOnly && (
        <div style={{ marginBottom: 22 }}>
          <div style={S.label}>Ações</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {rejected
              ? <button style={S.mActionBtn('#009c3b')} onClick={() => { updateStatus('pre_inscrito'); onClose(); }}>↩ Reativar pré-inscrição</button>
              : <button style={S.mActionBtn('#ff4444')} onClick={() => { updateStatus('rejeitado'); onClose(); }}>✕ Rejeitar</button>}
            <button style={S.mActionBtn('#64748b')} onClick={() => { updateStatus('spam_descartado'); onClose(); }}>🗑 Spam</button>
          </div>
        </div>
      )}

      {!readOnly && (
        <div style={{ marginBottom: 8 }}>
          <div style={S.label}>Anotações internas</div>
          <textarea
            style={{ ...S.mInput, resize: 'vertical', minHeight: 70 }}
            value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="Notas visíveis apenas para admins..."
          />
          <button style={S.mActionBtn('#009c3b', true)} onClick={saveNotes} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar anotação'}
          </button>
        </div>
      )}

      {events.length > 0 && (
        <>
          <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '22px 0' }} />
          <div style={S.label}>Histórico</div>
          {events.map(ev => (
            <div key={ev.id} style={{
              padding: '12px 16px', borderRadius: 12, marginBottom: 8,
              background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: 12, color: '#475569',
            }}>
              <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 4 }}>
                {new Date(ev.created_at).toLocaleString('pt-BR')} · {ev.created_by}
              </div>
              {ev.description}
            </div>
          ))}
        </>
      )}
    </ModalShell>
  );
}

// ── Modal: time do portal ──────────────────────────────────────────────
function PortalModal({ team: t, onClose, onUpdate, readOnly }) {
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [ef, setEf] = useState(null);
  const [pwd, setPwd] = useState('');
  const [saving, setSaving] = useState(false);
  const [editErr, setEditErr] = useState('');
  const idx = stageIndex(t);
  const rejected = t.status === 'rejected';

  function startEdit() {
    setEf({
      club_name: t.club_name || '', city: t.city || '', country: t.country || '',
      contact_name: t.contact_name || '', email: t.email || '', whatsapp: t.whatsapp || '',
      instagram: t.instagram || '', description: t.description || '', category: t.category || '',
    });
    setPwd(''); setEditErr(''); setEditing(true);
  }

  async function saveEdit() {
    if (!pwd) { setEditErr('Digite sua senha de login para confirmar.'); return; }
    setSaving(true); setEditErr('');
    const res = await fetch(`/api/admin/portal-teams/${t.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'edit', password: pwd, fields: ef }),
    });
    const d = await res.json().catch(() => ({}));
    setSaving(false);
    if (d.ok) { onUpdate(); onClose(); }
    else setEditErr(d.message || 'Erro ao salvar.');
  }

  async function downloadLogo() {
    try {
      const r = await fetch(t.logo_url);
      const b = await r.blob();
      const url = URL.createObjectURL(b);
      const a = document.createElement('a');
      const ext = ((t.logo_url.split('?')[0].split('.').pop()) || 'png').toLowerCase();
      a.href = url;
      a.download = `logo-${(t.club_name || 'time').replace(/\s+/g, '-').toLowerCase()}.${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (_) {
      window.open(t.logo_url, '_blank');
    }
  }

  async function setFinalized(fin) {
    setBusy(true);
    const res = await fetch(`/api/admin/portal-teams/${t.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: fin ? 'finalize' : 'unfinalize' }),
    });
    setBusy(false);
    if (res.ok) { onUpdate(); onClose(); }
    else {
      const d = await res.json().catch(() => ({}));
      alert(d.message || 'Erro ao atualizar. A coluna registration_finalized existe no banco?');
    }
  }

  const fields = [
    ['Contato', t.contact_name], ['E-mail', t.email], ['WhatsApp', t.whatsapp],
    ['Instagram', t.instagram || null], ['Descrição', t.description || null],
    ['Categorias', t.category],
    ['Atletas cadastrados', `${t.athletes}${t.athletes_paid_qty ? ` / ${t.athletes_paid_qty} contratados` : ''}`],
    ['Plano', `Opção ${t.option}${t.plan_size ? ` · ${t.plan_size}x` : ''}`],
    ['Pago', `${BRL(t.paid_cents)} de ${BRL(t.total_cents)}${t.plan_size ? ` (${t.paid_count}/${t.plan_size} parcelas)` : ''}`],
    ['Checkout', t.paid_count > 0 ? '✓ Pagamento iniciado' : t.checkout_started ? '💳 Chegou ao checkout, não pagou' : 'Não chegou ao checkout'],
    ['Escalação', t.lineup_submitted ? '✓ Enviada' : 'Não enviada'],
    ['Cadastro em', new Date(t.created_at).toLocaleString('pt-BR')],
  ].filter(([, v]) => v != null && v !== '');

  return (
    <ModalShell onClose={onClose}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4, flexWrap: 'wrap' }}>
        {t.logo_url && (
          <img
            src={t.logo_url} alt={`Logo ${t.club_name}`}
            style={{ width: 54, height: 54, objectFit: 'contain', borderRadius: 12, border: '1px solid #e2e8f0', background: '#f8fafc', padding: 4, flexShrink: 0 }}
          />
        )}
        <h2 style={{ fontSize: 26, fontWeight: 900, letterSpacing: -1, color: '#0f172a' }}>{t.club_name}</h2>
        <PreBadge pre={t.pre_inscrito} />
        {rejected && <Tag label="✕ Rejeitado" color="#ff4444" />}
        {t.finalized && <Tag label="🏁 Finalizada" color="#009c3b" />}
      </div>
      <p style={{ fontSize: 12, color: '#64748b', marginBottom: 22 }}>
        {[t.city, t.country].filter(Boolean).join(' · ')}
      </p>

      <Stepper current={idx} rejected={rejected} />

      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 40px',
        padding: '22px 24px', borderRadius: 16,
        background: '#f8fafc', border: '1px solid #e2e8f0', marginBottom: 24,
      }}>
        {fields.map(([label, value]) => (
          <div key={label}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', color: '#94a3b8', marginBottom: 3 }}>{label}</div>
            <div style={{ fontSize: 13, color: '#0f172a', marginBottom: 14, wordBreak: 'break-word' }}>{String(value)}</div>
          </div>
        ))}
      </div>

      {t.logo_url && (
        <div style={{ marginBottom: 22 }}>
          <div style={S.label}>Logo do time</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <img
              src={t.logo_url} alt={`Logo ${t.club_name}`}
              style={{ width: 72, height: 72, objectFit: 'contain', borderRadius: 12, border: '1px solid #e2e8f0', background: '#f8fafc', padding: 6 }}
            />
            <button style={S.mActionBtn('#0D4BFF')} onClick={downloadLogo}>⬇ Baixar logo</button>
            <a href={t.logo_url} target="_blank" rel="noreferrer" style={{ ...S.mActionBtn('#64748b'), textDecoration: 'none', display: 'inline-block' }}>
              Abrir em nova aba →
            </a>
          </div>
        </div>
      )}

      {!readOnly && !rejected && !editing && (
        <div style={{ marginBottom: 10 }}>
          <div style={S.label}>Ações</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {t.finalized ? (
              <button style={S.mActionBtn('#64748b')} onClick={() => setFinalized(false)} disabled={busy}>
                {busy ? '...' : '↩ Desfazer finalização'}
              </button>
            ) : (
              <button style={S.mActionBtn('#009c3b', true)} onClick={() => setFinalized(true)} disabled={busy}>
                {busy ? 'Salvando...' : '🏁 Marcar inscrição finalizada'}
              </button>
            )}
            <button style={S.mActionBtn('#d97706')} onClick={startEdit}>✏️ Editar dados</button>
            <a href="/admin/portal-teams" style={{ ...S.mActionBtn('#0D4BFF'), textDecoration: 'none', display: 'inline-block' }}>
              Abrir em Aprovações →
            </a>
          </div>
          {!t.finalized && (
            <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 10 }}>
              Marque como finalizada após validar os documentos do time.
            </p>
          )}
        </div>
      )}

      {editing && ef && (
        <div style={{ marginBottom: 10, padding: '20px 22px', borderRadius: 16, background: '#fffbeb', border: '1px solid #fde68a' }}>
          <div style={{ ...S.label, color: '#b45309' }}>✏️ Editar dados do time</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 14px' }}>
            {[
              ['club_name', 'Nome do time'], ['category', 'Categorias'],
              ['city', 'Cidade'], ['country', 'País'],
              ['contact_name', 'Contato'], ['whatsapp', 'WhatsApp'],
              ['email', 'E-mail (login do time)'], ['instagram', 'Instagram'],
            ].map(([k, label]) => (
              <div key={k}>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', color: '#94a3b8', marginBottom: 4 }}>{label}</div>
                <input style={{ ...S.mInput, marginBottom: 0 }} value={ef[k]} onChange={e => setEf({ ...ef, [k]: e.target.value })} />
              </div>
            ))}
            <div style={{ gridColumn: '1 / -1' }}>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', color: '#94a3b8', marginBottom: 4 }}>Descrição</div>
              <textarea style={{ ...S.mInput, marginBottom: 0, resize: 'vertical', minHeight: 60 }} value={ef.description} onChange={e => setEf({ ...ef, description: e.target.value })} />
            </div>
          </div>
          <p style={{ fontSize: 11, color: '#b45309', margin: '12px 0 8px' }}>
            ⚠️ O e-mail é o login do time no portal — só altere se tiver certeza. Digite sua senha de login para confirmar as mudanças.
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="password" value={pwd} onChange={e => setPwd(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveEdit()}
              placeholder="Sua senha de login"
              style={{ ...S.mInput, marginBottom: 0, maxWidth: 220 }}
            />
            <button style={S.mActionBtn('#009c3b', true)} onClick={saveEdit} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar alterações'}
            </button>
            <button style={S.mActionBtn('#64748b')} onClick={() => setEditing(false)} disabled={saving}>Cancelar</button>
          </div>
          {editErr && <div style={{ fontSize: 12.5, color: '#dc2626', fontWeight: 600, marginTop: 10 }}>❌ {editErr}</div>}
        </div>
      )}
    </ModalShell>
  );
}

function ModalShell({ children, onClose }) {
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
        width: '100%', maxWidth: 760, position: 'relative', padding: '40px 44px',
        background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 28,
        boxShadow: '0 20px 60px rgba(0,0,0,.15)',
      }}>
        <button style={{
          position: 'absolute', top: 20, right: 20, width: 34, height: 34, borderRadius: 10,
          background: '#f1f5f9', border: '1px solid #e2e8f0',
          color: '#64748b', fontSize: 15, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit',
        }} onClick={onClose}>✕</button>
        {children}
      </div>
    </div>
  );
}

// ── Página ─────────────────────────────────────────────────────────────
export default function TeamsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('admin');

  useEffect(() => {
    fetch('/api/admin/me').then(r => r.json()).then(d => setRole(d.role || 'viewer')).catch(() => {});
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const d = await fetch('/api/admin/pipeline').then(r => r.json());
      if (d.ok) setData(d);
    } catch (_) {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const readOnly = role === 'viewer';

  const match = (t) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return t.club_name?.toLowerCase().includes(q) ||
      t.contact_name?.toLowerCase().includes(q) ||
      t.email?.toLowerCase().includes(q) ||
      t.city?.toLowerCase().includes(q) ||
      t.country?.toLowerCase().includes(q);
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: '#0f172a' }}>
      <style>{`
        .pipe-stats { display: grid; grid-template-columns: repeat(7, 1fr); gap: 10px; margin-bottom: 26px; }
        .pipe-board { display: flex; overflow-x: auto; align-items: flex-start; padding-bottom: 32px; gap: 13px; }
        .pipe-col { width: 246px; flex-shrink: 0; }
        @media (max-width: 1100px) {
          .pipe-stats { grid-template-columns: repeat(4, 1fr); }
        }
        @media (max-width: 640px) {
          .pipe-stats { grid-template-columns: repeat(2, 1fr); gap: 8px; }
          .pipe-stat-num { font-size: 26px !important; }
          .pipe-board { flex-direction: column; overflow-x: visible; padding-bottom: 16px; }
          .pipe-col { width: 100% !important; margin-bottom: 8px; }
          .pipe-title { font-size: 26px !important; }
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 26 }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', color: '#009c3b', marginBottom: 8 }}>Times</div>
        <h1 className="pipe-title" style={{ fontSize: 36, fontWeight: 900, letterSpacing: -1.5, color: '#0f172a', marginBottom: 6 }}>Inscrições</h1>
        <p style={{ fontSize: 13, color: '#64748b' }}>Linha do tempo dos times — da pré-inscrição à inscrição finalizada.</p>
      </div>

      {/* Stats */}
      <div className="pipe-stats">
        {COLS.map(c => (
          <div key={c.key} style={{
            padding: '14px 16px', background: '#ffffff',
            border: '1px solid #e2e8f0', borderRadius: 16,
            boxShadow: '0 1px 4px rgba(0,0,0,.06)', borderTop: `3px solid ${c.color}`,
          }}>
            <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: 1.2, textTransform: 'uppercase', color: '#64748b', marginBottom: 7, lineHeight: 1.3 }}>{c.label}</div>
            <div className="pipe-stat-num" style={{ fontSize: 32, fontWeight: 900, letterSpacing: -2, lineHeight: 1, color: '#0f172a' }}>
              {data ? (data.counts[c.key] ?? 0) : '—'}
            </div>
            <div style={{ fontSize: 9.5, color: '#94a3b8', marginTop: 6 }}>{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 22, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          style={{
            flex: 1, minWidth: 280, padding: '12px 18px',
            background: '#ffffff', border: '1px solid #e2e8f0',
            borderRadius: 12, color: '#0f172a', fontSize: 14, outline: 'none',
            fontFamily: "'Inter', sans-serif",
          }}
          placeholder="Buscar por clube, contato, e-mail, cidade, país..."
          value={search} onChange={e => setSearch(e.target.value)}
        />
        <button onClick={fetchData} style={{
          padding: '12px 18px', borderRadius: 12, fontSize: 12, fontWeight: 700,
          letterSpacing: 1, cursor: 'pointer', background: '#f1f5f9',
          border: '1px solid #e2e8f0', color: '#475569',
          textTransform: 'uppercase', fontFamily: "'Inter', sans-serif",
        }}>↻ Atualizar</button>
      </div>

      {/* Board */}
      {loading && !data ? (
        <div style={{ color: '#94a3b8', textAlign: 'center', paddingTop: 80, fontSize: 14 }}>Carregando...</div>
      ) : (
        <div className="pipe-board">
          {COLS.map(col => {
            const items = (data?.cols?.[col.key] || []).filter(match);
            return (
              <div key={col.key} className="pipe-col" style={{
                background: '#f1f5f9', border: '1px solid #e2e8f0',
                borderRadius: 16, padding: '12px 10px', alignSelf: 'flex-start', flexShrink: 0,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, padding: '2px 6px' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: col.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 1.2, textTransform: 'uppercase', color: '#475569', flex: 1, lineHeight: 1.3 }}>{col.label}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 20, background: '#e2e8f0', color: '#64748b' }}>{items.length}</span>
                </div>
                <div style={{ minHeight: 70 }}>
                  {items.map(t => t.kind === 'interest'
                    ? <InterestCard key={`i-${t.id}`} t={t} onClick={setSelected} />
                    : <PortalCard key={`p-${t.id}`} t={t} color={col.color} onClick={setSelected} />
                  )}
                  {items.length === 0 && (
                    <div style={{
                      border: '1px dashed #e2e8f0', borderRadius: 14,
                      padding: 26, textAlign: 'center', color: '#94a3b8', fontSize: 12,
                    }}>Nenhum time</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selected && (selected.kind === 'interest'
        ? <InterestModal team={selected} onClose={() => setSelected(null)} onUpdate={fetchData} readOnly={readOnly} />
        : <PortalModal team={selected} onClose={() => setSelected(null)} onUpdate={fetchData} readOnly={readOnly} />
      )}
    </div>
  );
}
