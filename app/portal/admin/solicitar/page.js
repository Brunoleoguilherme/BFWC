'use client';

import { useState, useEffect } from 'react';
import '../../../admin/admin.css';

export default function AdminSolicitarPage() {
  const [form, setForm] = useState({ name: '', email: '', role: '', justification: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }));
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.email || !form.justification || !form.password) { setError('Preencha todos os campos obrigatórios.'); return; }
    if (form.password.length < 8) { setError('A senha deve ter no mínimo 8 caracteres.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/portal/admin/solicitar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.ok) setSuccess(true);
      else setError(data.message || 'Erro ao enviar solicitação.');
    } catch {
      setError('Erro de conexão.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="login-root">
        <div className="login-glow" />
        <div className="login-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📨</div>
          <div className="login-badge">Administradores</div>
          <h1 className="login-title" style={{ justifyContent: 'center' }}>Solicitação enviada!</h1>
          <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.7, margin: '16px 0 24px' }}>
            Sua solicitação foi enviada ao administrador responsável. Você receberá uma resposta pelo e-mail informado.
          </p>
          <a href="/portal" style={{ display: 'block', textAlign: 'center', padding: '13px', background: '#009c3b', color: '#fff', fontWeight: 900, fontSize: 13, letterSpacing: '1px', textTransform: 'uppercase', textDecoration: 'none', borderRadius: 10 }}>
            Voltar ao portal
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="login-root">
      <div className="login-glow" />
      <div className="login-card" style={{ animation: 'cardIn .55s cubic-bezier(.22,.61,.36,1) both' }}>
        <div className="login-badge">Organização</div>
        <h1 className="login-title">BFWC <span>2026</span></h1>
        <p className="login-sub">Solicitar acesso de administrador</p>

        <div style={{ marginBottom: 20, padding: '12px 14px', borderRadius: 10, background: '#fef9c3', border: '1px solid #fde68a', fontSize: 12, color: '#854d0e', lineHeight: 1.6 }}>
          ⚠️ O acesso administrativo é concedido apenas a membros da organização BFWC. Sua solicitação será analisada manualmente.
        </div>

        <form onSubmit={handleSubmit}>
          <label className="login-label">Nome completo *</label>
          <input className="login-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Seu nome" style={{ width: '100%', boxSizing: 'border-box' }} />

          <label className="login-label" style={{ marginTop: 14 }}>E-mail *</label>
          <input className="login-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@organizacao.com" style={{ width: '100%', boxSizing: 'border-box' }} />

          <label className="login-label" style={{ marginTop: 14 }}>Senha *</label>
          <input className="login-input" type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Mínimo 8 caracteres" minLength={8} style={{ width: '100%', boxSizing: 'border-box' }} />
          <div style={{ fontSize: 11, color: 'rgba(15,23,42,.45)', marginTop: 6 }}>Você usará essa senha para entrar no painel após a aprovação.</div>

          <label className="login-label" style={{ marginTop: 14 }}>Cargo / Função na organização</label>
          <input className="login-input" value={form.role} onChange={e => set('role', e.target.value)} placeholder="Ex: Diretor Técnico, Coordenador..." style={{ width: '100%', boxSizing: 'border-box' }} />

          <label className="login-label" style={{ marginTop: 14 }}>Justificativa *</label>
          <textarea
            className="login-input"
            value={form.justification}
            onChange={e => set('justification', e.target.value)}
            placeholder="Descreva brevemente por que precisa de acesso administrativo..."
            rows={4}
            style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical', minHeight: 90 }}
          />

          {error && <div className="login-error">{error}</div>}

          <button className="login-btn" type="submit" disabled={loading}
            style={{ background: '#009c3b', color: '#fff', boxShadow: '0 8px 28px rgba(0,156,59,.25)', marginTop: 8 }}>
            {loading ? 'Enviando...' : 'Enviar solicitação'}
          </button>
        </form>

        <div style={{ marginTop: 14, textAlign: 'center' }}>
          <a href="/portal" style={{ fontSize: 12, color: 'rgba(15,23,42,.45)', textDecoration: 'none' }}>← Voltar ao portal</a>
        </div>
      </div>
    </div>
  );
}
