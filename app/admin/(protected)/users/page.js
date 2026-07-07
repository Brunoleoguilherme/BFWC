'use client';

import { useState, useEffect } from 'react';

const ROLES = [
  { value: 'admin',            label: 'Admin',            color: '#009c3b', desc: 'Acesso total — pode criar e remover usuários' },
  { value: 'viewer',           label: 'Viewer',           color: '#4d8aff', desc: 'Somente leitura — não pode editar nada' },
  { value: 'blue_panda',       label: '🐼 Blue Panda',    color: '#00b4d8', desc: 'Acesso à logística e hospedagem' },
  { value: 'arbitragem',       label: '🧑‍⚖️ Arbitragem',   color: '#a855f7', desc: 'Equipe de arbitragem — jogos e súmulas' },
  { value: 'delegado_partida', label: '📋 Delegado',      color: '#eab308', desc: 'Delegado da partida — validação e ocorrências no jogo' },
  { value: 'atleta',           label: '🏃 Atleta',        color: '#009c3b', desc: 'Acesso ao portal de atletas' },
  { value: 'times',            label: '🏈 Times',         color: '#f97316', desc: 'Acesso ao portal de times/clubes' },
];

const ADMIN_ROLES = ROLES.filter(r => ['admin', 'viewer', 'blue_panda', 'arbitragem', 'delegado_partida'].includes(r.value));

function initials(name) {
  return (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function Badge({ role }) {
  const r = ROLES.find(x => x.value === role) || ROLES[0];
  return (
    <span style={{
      fontSize: 10, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase',
      padding: '3px 10px', borderRadius: 6,
      color: r.color, background: r.color + '14', border: `1px solid ${r.color}30`,
    }}>{r.label}</span>
  );
}

function SectionHeader({ label, count }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8, marginBottom: 4 }}>
      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: '#1e293b' }}>{label}</div>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#334155', background: '#cbd5e1', borderRadius: 20, padding: '2px 8px' }}>{count}</div>
      <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
    </div>
  );
}

function CreateModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'admin' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function submit(e) {
    e.preventDefault();
    setLoading(true); setError('');
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || 'Erro ao criar usuário'); return; }
    onCreated();
    onClose();
  }

  const inp = {
    width: '100%', padding: '12px 16px', borderRadius: 12, fontSize: 13,
    background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)',
    color: '#fff', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,.82)',
        backdropFilter: 'blur(10px)', zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24, fontFamily: "'Inter', sans-serif",
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        width: '100%', maxWidth: 480,
        background: 'linear-gradient(145deg, #030d1f, #020814)',
        border: '1px solid rgba(255,255,255,.1)', borderRadius: 24,
        padding: '40px 44px',
        boxShadow: '0 60px 180px rgba(0,0,0,.9)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: '#009c3b', marginBottom: 4 }}>Novo Usuário</div>
            <h2 style={{ fontSize: 22, fontWeight: 900, letterSpacing: -1, color: '#fff', margin: 0 }}>Criar acesso ao painel</h2>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', color: 'rgba(255,255,255,.4)', fontSize: 14 }}>✕</button>
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,.3)', marginBottom: 6 }}>Nome</label>
            <input style={inp} placeholder="Nome completo" value={form.name} onChange={e => set('name', e.target.value)} required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,.3)', marginBottom: 6 }}>E-mail</label>
            <input style={inp} type="email" placeholder="email@exemplo.com" value={form.email} onChange={e => set('email', e.target.value)} required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,.3)', marginBottom: 6 }}>Senha</label>
            <input style={inp} type="password" placeholder="Mínimo 8 caracteres" value={form.password} onChange={e => set('password', e.target.value)} required minLength={8} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,.3)', marginBottom: 8 }}>Nível de Acesso</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {ADMIN_ROLES.map(r => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => set('role', r.value)}
                  style={{
                    padding: '12px 14px', borderRadius: 12, cursor: 'pointer',
                    textAlign: 'left', fontFamily: 'inherit',
                    background: form.role === r.value ? r.color + '14' : 'rgba(255,255,255,.03)',
                    border: `1px solid ${form.role === r.value ? r.color + '45' : 'rgba(255,255,255,.08)'}`,
                    transition: 'all .15s',
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 800, color: r.color, marginBottom: 3 }}>{r.label}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', lineHeight: 1.4 }}>{r.desc}</div>
                </button>
              ))}
            </div>
            <div style={{ marginTop: 8, fontSize: 10, color: 'rgba(255,255,255,.2)', lineHeight: 1.5 }}>
              Atletas e times se cadastram pelos próprios portais.
            </div>
          </div>

          {error && (
            <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(255,68,68,.08)', border: '1px solid rgba(255,68,68,.2)', color: '#ff6b6b', fontSize: 12 }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 4, padding: '14px', borderRadius: 12, border: 'none',
              background: '#009c3b', color: '#031020',
              fontSize: 13, fontWeight: 900, letterSpacing: 1.5, textTransform: 'uppercase',
              cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Criando...' : 'Criar usuário'}
          </button>
        </form>
      </div>
    </div>
  );
}

function DeleteModal({ user, onClose, onDeleted }) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setLoading(true); setError('');
    const res = await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: user.id, password, source: user.source }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || 'Erro ao excluir'); return; }
    onDeleted();
    onClose();
  }

  const rc = (ROLES.find(x => x.value === user.role) || ROLES[0]).color;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,.82)',
        backdropFilter: 'blur(10px)', zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24, fontFamily: "'Inter', sans-serif",
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        width: '100%', maxWidth: 420,
        background: 'linear-gradient(145deg, #030d1f, #020814)',
        border: '1px solid rgba(255,68,68,.25)', borderRadius: 24,
        padding: '40px 44px',
        boxShadow: '0 60px 180px rgba(0,0,0,.9)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: '#ff4444', marginBottom: 4 }}>Excluir usuário</div>
            <h2 style={{ fontSize: 20, fontWeight: 900, letterSpacing: -0.8, color: '#fff', margin: 0 }}>Confirmar exclusão</h2>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', color: 'rgba(255,255,255,.4)', fontSize: 14 }}>✕</button>
        </div>

        {/* User info card */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14,
          padding: '16px 18px', borderRadius: 14,
          background: 'rgba(255,68,68,.06)', border: '1px solid rgba(255,68,68,.18)',
          marginBottom: 24,
        }}>
          <div style={{
            width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
            background: rc + '18', border: `1px solid ${rc}35`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 900, color: rc,
          }}>
            {initials(user.name)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{user.name}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.45)' }}>{user.email}</div>
          </div>
          <Badge role={user.role} />
        </div>

        {/* Warning text */}
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,.45)', lineHeight: 1.6, marginBottom: 24 }}>
          Esta ação é <strong style={{ color: '#ff6b6b' }}>irreversível</strong>. O usuário perderá acesso imediatamente e todos os seus dados serão removidos permanentemente.
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,.3)', marginBottom: 8 }}>
              Confirme com sua senha de admin
            </label>
            <input
              type="password"
              placeholder="Sua senha de login"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoFocus
              style={{
                width: '100%', padding: '12px 16px', borderRadius: 12, fontSize: 13,
                background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.12)',
                color: '#fff', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
              }}
            />
          </div>

          {error && (
            <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(255,68,68,.08)', border: '1px solid rgba(255,68,68,.2)', color: '#ff6b6b', fontSize: 12 }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1, padding: '13px', borderRadius: 12,
                background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)',
                color: 'rgba(255,255,255,.5)', fontSize: 13, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !password}
              style={{
                flex: 1, padding: '13px', borderRadius: 12, border: 'none',
                background: loading || !password ? 'rgba(255,68,68,.3)' : '#ff4444',
                color: '#fff',
                fontSize: 13, fontWeight: 900, letterSpacing: 1, textTransform: 'uppercase',
                cursor: loading || !password ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
              }}
            >
              {loading ? 'Excluindo...' : 'Excluir'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function UserRow({ u, onDeleteClick }) {
  const rc = (ROLES.find(x => x.value === u.role) || ROLES[0]).color;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 18,
      padding: '18px 24px', borderRadius: 16,
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      boxShadow: '0 1px 4px rgba(0,0,0,.06)',
    }}>
      {/* Avatar */}
      <div style={{
        width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
        background: rc + '18', border: `1px solid ${rc}35`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, fontWeight: 900, color: rc,
      }}>
        {initials(u.name)}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 3, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{u.name}</span>
          <Badge role={u.role} />
          {u.status && u.status !== 'approved' && u.status !== 'active' && (
            <span style={{ fontSize: 10, fontWeight: 700, color: '#f97316', background: 'rgba(249,115,22,.1)', border: '1px solid rgba(249,115,22,.2)', borderRadius: 5, padding: '2px 7px' }}>
              {u.status === 'pending_approval' ? 'aguardando' : u.status}
            </span>
          )}
        </div>
        <div style={{ fontSize: 12, color: '#64748b' }}>{u.email}</div>
      </div>

      {/* Date */}
      <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'right', flexShrink: 0 }}>
        Criado em<br />
        {new Date(u.created_at).toLocaleDateString('pt-BR')}
      </div>

      {/* Delete button */}
      <button
        onClick={() => onDeleteClick(u)}
        title="Excluir usuário"
        style={{
          width: 34, height: 34, borderRadius: 8, flexShrink: 0,
          background: 'rgba(255,68,68,.07)', border: '1px solid rgba(255,68,68,.18)',
          color: 'rgba(255,68,68,.65)', fontSize: 15, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all .15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,68,68,.15)'; e.currentTarget.style.color = '#ff4444'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,68,68,.07)'; e.currentTarget.style.color = 'rgba(255,68,68,.65)'; }}
      >
        🗑
      </button>
    </div>
  );
}

function UserCard({ u, onDeleteClick }) {
  const rc = (ROLES.find(x => x.value === u.role) || ROLES[0]).color;
  const pending = u.status && u.status !== 'approved' && u.status !== 'active';
  return (
    <div style={{
      position: 'relative',
      display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
      gap: 8, padding: '20px 16px 16px', borderRadius: 16,
      background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,.06)',
    }}>
      <button
        onClick={() => onDeleteClick(u)} title="Excluir usuário"
        style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: 8, background: 'rgba(255,68,68,.07)', border: '1px solid rgba(255,68,68,.16)', color: 'rgba(255,68,68,.6)', fontSize: 12, cursor: 'pointer' }}
      >🗑</button>

      <div style={{ width: 52, height: 52, borderRadius: '50%', background: rc + '18', border: `1px solid ${rc}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 900, color: rc }}>
        {initials(u.name)}
      </div>
      <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0f172a', lineHeight: 1.25, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>{u.name}</div>
      <Badge role={u.role} />
      <div style={{ fontSize: 11, color: '#64748b', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>{u.email}</div>
      {pending && (
        <span style={{ fontSize: 9.5, fontWeight: 700, color: '#f97316', background: 'rgba(249,115,22,.1)', border: '1px solid rgba(249,115,22,.2)', borderRadius: 5, padding: '2px 7px' }}>
          {u.status === 'pending_approval' ? 'aguardando' : u.status}
        </span>
      )}
      {u.created_at && <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>{new Date(u.created_at).toLocaleDateString('pt-BR')}</div>}
    </div>
  );
}

function PendingRow({ u, onApprove, onDeleteClick, busy }) {
  const oc = '#f97316';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 18,
      padding: '18px 24px', borderRadius: 16,
      background: '#fffaf2', border: '1px solid #fed7aa',
      boxShadow: '0 1px 4px rgba(0,0,0,.06)',
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
        background: oc + '18', border: `1px solid ${oc}35`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, fontWeight: 900, color: oc,
      }}>{initials(u.name)}</div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 3, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{u.name}</span>
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', padding: '3px 10px', borderRadius: 6, color: oc, background: oc + '14', border: `1px solid ${oc}30` }}>Aguardando</span>
        </div>
        <div style={{ fontSize: 12, color: '#64748b' }}>{u.email}</div>
      </div>

      <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>
        <button onClick={() => onApprove(u, 'admin')} disabled={busy} style={{ padding: '9px 16px', borderRadius: 10, border: 'none', background: '#009c3b', color: '#fff', fontSize: 12, fontWeight: 800, cursor: busy ? 'wait' : 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>Aprovar Admin</button>
        <button onClick={() => onApprove(u, 'viewer')} disabled={busy} style={{ padding: '9px 16px', borderRadius: 10, border: 'none', background: '#4d8aff', color: '#fff', fontSize: 12, fontWeight: 800, cursor: busy ? 'wait' : 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>Viewer</button>
        <button onClick={() => onDeleteClick(u)} title="Recusar" style={{ width: 34, height: 34, borderRadius: 8, flexShrink: 0, background: 'rgba(255,68,68,.07)', border: '1px solid rgba(255,68,68,.18)', color: 'rgba(255,68,68,.65)', fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🗑</button>
      </div>
    </div>
  );
}

function Toast({ message, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
      zIndex: 2000,
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '14px 24px', borderRadius: 14,
      background: '#022a12', border: '1px solid #009c3b',
      boxShadow: '0 8px 40px rgba(0,0,0,.5)',
      fontFamily: "'Inter', sans-serif",
      animation: 'toastIn .25s cubic-bezier(.22,.61,.36,1) both',
    }}>
      <style>{`@keyframes toastIn { from { opacity:0; transform: translateX(-50%) translateY(12px); } to { opacity:1; transform: translateX(-50%) translateY(0); } }`}</style>
      <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#009c3b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>✓</div>
      <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' }}>{message}</span>
    </div>
  );
}

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [approving, setApproving] = useState(false);

  async function approve(u, role) {
    setApproving(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: u.id, role }),
      });
      const d = await res.json();
      if (!res.ok) { setToast(d.error || 'Erro ao aprovar'); return; }
      await fetchUsers();
      setToast(`${u.name} aprovado como ${role === 'admin' ? 'Admin' : 'Viewer'}`);
    } finally {
      setApproving(false);
    }
  }

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const d = await res.json();
      setUsers(d.users || []);
    } catch (err) {
      console.error('Erro ao buscar usuários:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchUsers(); }, []);

  const q = search.toLowerCase().trim();
  const filtered = users.filter(u => {
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const matchSearch = !q || (u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q);
    return matchRole && matchSearch;
  });

  const pendingUsers  = filtered.filter(u => u.source === 'admin' && u.role === 'pending');
  const adminUsers    = filtered.filter(u => u.source === 'admin' && u.role === 'admin');
  const viewerUsers   = filtered.filter(u => u.source === 'admin' && u.role === 'viewer');
  const pandaUsers    = filtered.filter(u => u.source === 'admin' && u.role === 'blue_panda');
  const arbUsers      = filtered.filter(u => u.source === 'admin' && u.role === 'arbitragem');
  const delegadoUsers = filtered.filter(u => u.source === 'admin' && u.role === 'delegado_partida');
  const timesUsers    = filtered.filter(u => u.source === 'times');
  const atletaUsers   = filtered.filter(u => u.source === 'atleta');

  const FILTERS = [
    { value: 'all',              label: `Todos (${users.length})` },
    { value: 'admin',            label: `Admin (${users.filter(u => u.role === 'admin').length})` },
    { value: 'viewer',           label: `Viewer (${users.filter(u => u.role === 'viewer').length})` },
    { value: 'blue_panda',       label: `Blue Panda (${users.filter(u => u.role === 'blue_panda').length})` },
    { value: 'arbitragem',       label: `Arbitragem (${users.filter(u => u.role === 'arbitragem').length})` },
    { value: 'delegado_partida', label: `Delegado (${users.filter(u => u.role === 'delegado_partida').length})` },
    { value: 'times',            label: `Times (${users.filter(u => u.role === 'times').length})` },
    { value: 'atleta',           label: `Atletas (${users.filter(u => u.role === 'atleta').length})` },
  ];

  const rowProps = { onDeleteClick: setDeleteTarget };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: '#0f172a', maxWidth: 820 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 36 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', color: '#64748b', marginBottom: 8 }}>Sistema</div>
          <h1 style={{ fontSize: 36, fontWeight: 900, letterSpacing: -1.5, color: '#0f172a', margin: 0 }}>Usuários do Painel</h1>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          style={{
            padding: '11px 22px', borderRadius: 12, border: 'none',
            background: '#009c3b', color: '#031020',
            fontSize: 12, fontWeight: 900, letterSpacing: 1.5, textTransform: 'uppercase',
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          + Novo Usuário
        </button>
      </div>

      {/* Search + filters */}
      <div style={{ marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input
          type="text"
          placeholder="🔍  Buscar por nome ou e-mail..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', padding: '12px 16px', borderRadius: 12, fontSize: 14,
            border: '1px solid #e2e8f0', background: '#fff', color: '#0f172a',
            outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
            boxShadow: '0 1px 3px rgba(0,0,0,.06)',
          }}
        />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setRoleFilter(f.value)}
              style={{
                padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit', border: 'none',
                background: roleFilter === f.value ? '#031020' : '#e2e8f0',
                color: roleFilter === f.value ? '#fff' : '#475569',
                transition: 'all .15s',
              }}
            >{f.label}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ color: '#94a3b8', paddingTop: 60, textAlign: 'center', fontSize: 14 }}>Carregando...</div>
      ) : (() => {
        const grid = (items, empty) => items.length === 0
          ? <div style={{ padding: '10px 4px', fontSize: 12, color: '#94a3b8' }}>{empty}</div>
          : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginTop: 4 }}>
              {items.map(u => <UserCard key={u.id} u={u} onDeleteClick={setDeleteTarget} />)}
            </div>;
        const GROUPS = [
          { label: 'Administradores', items: adminUsers,    empty: 'Nenhum admin.' },
          { label: 'Viewers',         items: viewerUsers,   empty: 'Nenhum viewer.' },
          { label: 'Blue Panda',      items: pandaUsers,    empty: 'Nenhum usuário Blue Panda.' },
          { label: 'Arbitragem',      items: arbUsers,      empty: 'Nenhum usuário de arbitragem.' },
          { label: 'Delegados da partida', items: delegadoUsers, empty: 'Nenhum delegado cadastrado.' },
          { label: 'Times / Clubes',  items: timesUsers,    empty: 'Nenhum time cadastrado no portal.' },
          { label: 'Atletas',         items: atletaUsers,   empty: 'Nenhum atleta cadastrado no portal.' },
        ];
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {pendingUsers.length > 0 && (
              <div>
                <SectionHeader label="Aguardando aprovação" count={pendingUsers.length} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                  {pendingUsers.map(u => (
                    <PendingRow key={u.id} u={u} onApprove={approve} onDeleteClick={setDeleteTarget} busy={approving} />
                  ))}
                </div>
              </div>
            )}
            {GROUPS.map(g => (
              <div key={g.label}>
                <SectionHeader label={g.label} count={g.items.length} />
                {grid(g.items, g.empty)}
              </div>
            ))}
          </div>
        );
      })()}

      {showCreate && (
        <CreateModal onClose={() => setShowCreate(false)} onCreated={fetchUsers} />
      )}

      {deleteTarget && (
        <DeleteModal
          user={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={() => {
            fetchUsers();
            setToast('Usuário excluído com sucesso');
          }}
        />
      )}

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  );
}
