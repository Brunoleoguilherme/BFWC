'use client';

import { useState, useEffect } from 'react';

const ROLES = [
  { value: 'admin',      label: 'Admin',      color: '#f4ff00', desc: 'Acesso total — pode criar e remover usuários' },
  { value: 'viewer',     label: 'Viewer',     color: '#4d8aff', desc: 'Somente leitura — não pode editar nada' },
  { value: 'blue_panda', label: '🐼 Blue Panda', color: '#4d8aff', desc: 'Acesso apenas à seção de logística e hospedagem' },
];

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
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: '#f4ff00', marginBottom: 4 }}>Novo Usuário</div>
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
            <div style={{ display: 'flex', gap: 8 }}>
              {ROLES.map(r => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => set('role', r.value)}
                  style={{
                    flex: 1, padding: '14px 12px', borderRadius: 12, cursor: 'pointer',
                    textAlign: 'left', fontFamily: 'inherit',
                    background: form.role === r.value ? r.color + '12' : 'rgba(255,255,255,.03)',
                    border: `1px solid ${form.role === r.value ? r.color + '40' : 'rgba(255,255,255,.08)'}`,
                    transition: 'all .15s',
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 800, color: r.color, marginBottom: 4 }}>{r.label}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', lineHeight: 1.4 }}>{r.desc}</div>
                </button>
              ))}
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
              background: '#f4ff00', color: '#031020',
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

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [confirm, setConfirm] = useState(null); // user to confirm delete

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

  async function deleteUser(id) {
    setDeleting(id);
    await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setDeleting(null);
    setConfirm(null);
    fetchUsers();
  }

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: '#fff', maxWidth: 700 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 36 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', color: '#f4ff00', marginBottom: 8 }}>Sistema</div>
          <h1 style={{ fontSize: 36, fontWeight: 900, letterSpacing: -1.5, color: '#fff', margin: 0 }}>Usuários do Painel</h1>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          style={{
            padding: '11px 22px', borderRadius: 12, border: 'none',
            background: '#f4ff00', color: '#031020',
            fontSize: 12, fontWeight: 900, letterSpacing: 1.5, textTransform: 'uppercase',
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          + Novo Usuário
        </button>
      </div>

      {/* User list */}
      {loading ? (
        <div style={{ color: 'rgba(255,255,255,.25)', paddingTop: 60, textAlign: 'center', fontSize: 14 }}>Carregando...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {users.map(u => (
            <div
              key={u.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 18,
                padding: '20px 24px', borderRadius: 16,
                background: 'linear-gradient(145deg, rgba(6,27,58,.55), rgba(2,8,22,.5))',
                border: '1px solid rgba(255,255,255,.07)',
              }}
            >
              {/* Avatar */}
              <div style={{
                width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                background: 'rgba(244,255,0,.12)', border: '1px solid rgba(244,255,0,.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 900, color: '#f4ff00',
              }}>
                {initials(u.name)}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 3 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{u.name}</span>
                  <Badge role={u.role} />
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,.35)' }}>{u.email}</div>
              </div>

              {/* Date */}
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.2)', textAlign: 'right', flexShrink: 0 }}>
                Criado em<br />
                {new Date(u.created_at).toLocaleDateString('pt-BR')}
              </div>

              {/* Delete */}
              {confirm === u.id ? (
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button
                    onClick={() => deleteUser(u.id)}
                    disabled={deleting === u.id}
                    style={{
                      padding: '7px 14px', borderRadius: 8, border: 'none',
                      background: '#ff4444', color: '#fff',
                      fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    {deleting === u.id ? '...' : 'Confirmar'}
                  </button>
                  <button
                    onClick={() => setConfirm(null)}
                    style={{
                      padding: '7px 12px', borderRadius: 8,
                      background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)',
                      color: 'rgba(255,255,255,.4)', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirm(u.id)}
                  style={{
                    width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                    background: 'rgba(255,68,68,.06)', border: '1px solid rgba(255,68,68,.15)',
                    color: 'rgba(255,68,68,.6)', fontSize: 13, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          {users.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,.2)', border: '1px dashed rgba(255,255,255,.07)', borderRadius: 16, fontSize: 13 }}>
              Nenhum usuário cadastrado
            </div>
          )}
        </div>
      )}

      {showCreate && (
        <CreateModal onClose={() => setShowCreate(false)} onCreated={fetchUsers} />
      )}
    </div>
  );
}
