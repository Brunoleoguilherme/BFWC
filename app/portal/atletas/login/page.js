'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import '../../../admin/admin.css';

const T = {
  pt: {
    badge: 'Área dos Atletas',
    title: 'BFWC',
    sub: 'Acesso para atletas participantes',
    labelEmail: 'E-mail',
    placeholderEmail: 'email@seuclube.com',
    labelPassword: 'Senha',
    btn: 'Entrar na área do atleta',
    loading: 'Verificando...',
    noAccount: 'Ainda não tem conta?',
    register: 'Criar conta',
    back: '← Voltar ao portal',
    verified: '✅ E-mail confirmado! Agora você já pode fazer login.',
  },
  en: {
    badge: 'Athlete Area',
    title: 'BFWC',
    sub: 'Access for participating athletes',
    labelEmail: 'Email',
    placeholderEmail: 'email@yourclub.com',
    labelPassword: 'Password',
    btn: 'Enter athlete area',
    loading: 'Verifying...',
    noAccount: "Don't have an account?",
    register: 'Create account',
    back: '← Back to portal',
    verified: '✅ Email confirmed! You can now log in.',
  },
  es: {
    badge: 'Área de Atletas',
    title: 'BFWC',
    sub: 'Acceso para atletas participantes',
    labelEmail: 'Correo electrónico',
    placeholderEmail: 'email@tuclub.com',
    labelPassword: 'Contraseña',
    btn: 'Entrar al área del atleta',
    loading: 'Verificando...',
    noAccount: '¿No tienes cuenta?',
    register: 'Crear cuenta',
    back: '← Volver al portal',
    verified: '✅ Correo confirmado. Ya puedes iniciar sesión.',
  },
};

export default function AtletasLoginPage() {
  const router = useRouter();
  const [lang, setLang] = useState('pt');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [justVerified, setJustVerified] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('bfwc_language');
    if (saved && T[saved]) setLang(saved);
    if (sessionStorage.getItem('bfwc_athlete_session')) router.replace('/portal/atletas');
    if (typeof window !== 'undefined' && window.location.search.includes('verified=1')) setJustVerified(true);
  }, []);

  const t = T[lang];

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/portal/atletas/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      setLoading(false);
      if (data.ok && data.athlete) {
        sessionStorage.setItem('bfwc_athlete_session', JSON.stringify(data.athlete));
        router.push('/portal/atletas');
      } else {
        setError(data.message || 'Erro ao fazer login.');
      }
    } catch {
      setLoading(false);
      setError('Erro de conexão.');
    }
  }

  return (
    <div className="login-root">
      <div className="login-glow" style={{ background: 'radial-gradient(circle, rgba(32,227,63,.07) 0%, transparent 65%)' }} />

      <div className="login-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
          <Image src="/assets/bfwc-logo.jpg" alt="BFWC" width={52} height={52} style={{ borderRadius: 12, objectFit: 'cover' }} />
          <div>
            <div className="login-badge" style={{ marginBottom: 4 }}>{t.badge}</div>
            <h1 className="login-title" style={{ fontSize: 28, marginBottom: 0 }}>{t.title} <span style={{ color: '#20e33f' }}>2026</span></h1>
          </div>
        </div>
        <p className="login-sub">{t.sub}</p>

        {justVerified && (
          <div style={{ marginBottom: 16, padding: '12px 14px', borderRadius: 10, background: 'rgba(32,227,63,.08)', border: '1px solid rgba(32,227,63,.2)', fontSize: 13, color: '#20e33f' }}>
            {t.verified}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <label className="login-label">{t.labelEmail}</label>
          <input
            className="login-input" type="email" required
            value={email} onChange={e => { setEmail(e.target.value); setError(''); }}
            placeholder={t.placeholderEmail} autoComplete="email"
          />

          <label className="login-label" style={{ marginTop: 14 }}>{t.labelPassword}</label>
          <input
            className="login-input" type="password" required
            value={password} onChange={e => { setPassword(e.target.value); setError(''); }}
            placeholder="••••••••" autoComplete="current-password"
          />

          {error && <div className="login-error">{error}</div>}

          <button className="login-btn" type="submit" disabled={loading}
            style={{ background: '#20e33f', color: '#031020', boxShadow: '0 8px 28px rgba(32,227,63,.3)' }}>
            {loading ? t.loading : t.btn}
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,.3)' }}>
          {t.noAccount}{' '}
          <a href="/portal/atletas/cadastro" style={{ color: '#20e33f', textDecoration: 'none', fontWeight: 700 }}>{t.register}</a>
        </div>
        <div style={{ marginTop: 14, textAlign: 'center' }}>
          <a href="/portal" style={{ fontSize: 12, color: 'rgba(255,255,255,.2)', textDecoration: 'none' }}>{t.back}</a>
        </div>
      </div>
    </div>
  );
}
