'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import '../../../admin/admin.css';

const T = {
  pt: {
    badge: 'Área dos Times',
    title: 'BFWC',
    sub: 'Acesso para clubes participantes',
    labelEmail: 'E-mail do responsável',
    placeholderEmail: 'email@seuclube.com',
    labelPassword: 'Senha',
    placeholderPassword: '••••••••',
    btn: 'Entrar na área do clube',
    loading: 'Verificando...',
    noAccount: 'Ainda não tem conta?',
    register: 'Criar conta',
    back: '← Voltar ao portal',
    verified: '✅ E-mail verificado! Aguarde a aprovação do administrador para acessar.',
  },
  en: {
    badge: 'Team Area',
    title: 'BFWC',
    sub: 'Access for participating clubs',
    labelEmail: 'Contact email',
    placeholderEmail: 'email@yourclub.com',
    labelPassword: 'Password',
    placeholderPassword: '••••••••',
    btn: 'Enter team area',
    loading: 'Verifying...',
    noAccount: "Don't have an account yet?",
    register: 'Create account',
    back: '← Back to portal',
    verified: '✅ Email verified! Awaiting admin approval to access.',
  },
  es: {
    badge: 'Área de Equipos',
    title: 'BFWC',
    sub: 'Acceso para clubes participantes',
    labelEmail: 'Correo del responsable',
    placeholderEmail: 'email@tuclub.com',
    labelPassword: 'Contraseña',
    placeholderPassword: '••••••••',
    btn: 'Entrar al área del equipo',
    loading: 'Verificando...',
    noAccount: '¿Aún no tienes cuenta?',
    register: 'Crear cuenta',
    back: '← Volver al portal',
    verified: '✅ Correo verificado. Esperando aprobación del administrador.',
  },
};

export default function TimesLoginPage() {
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
    if (sessionStorage.getItem('bfwc_team_session')) router.replace('/portal/times');
    // Check if redirected after email verification
    if (typeof window !== 'undefined' && window.location.search.includes('verified=1')) {
      setJustVerified(true);
    }
  }, []);

  const t = T[lang];

  async function handleLogin(e) {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/portal/times/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      setLoading(false);
      if (data.ok && data.team) {
        sessionStorage.setItem('bfwc_team_session', JSON.stringify(data.team));
        router.push('/portal/times');
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
      <div className="login-glow" style={{ background: 'radial-gradient(circle, rgba(13,75,255,.08) 0%, transparent 65%)' }} />

      <div className="login-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
          <Image src="/assets/bfwc-logo.jpg" alt="BFWC" width={52} height={52} style={{ borderRadius: 12, objectFit: 'cover' }} />
          <div>
            <div className="login-badge" style={{ marginBottom: 4 }}>{t.badge}</div>
            <h1 className="login-title" style={{ fontSize: 28, marginBottom: 0 }}>{t.title} <span>2026</span></h1>
          </div>
        </div>
        <p className="login-sub">{t.sub}</p>

        {justVerified && (
          <div style={{ marginBottom: 16, padding: '12px 14px', borderRadius: 10, background: 'rgba(32,227,63,.08)', border: '1px solid rgba(32,227,63,.2)', fontSize: 13, color: '#20e33f', lineHeight: 1.5 }}>
            {t.verified}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <label className="login-label">{t.labelEmail}</label>
          <input
            className="login-input"
            type="email" required
            value={email}
            onChange={e => { setEmail(e.target.value); setError(''); }}
            placeholder={t.placeholderEmail}
            autoComplete="email"
          />

          <label className="login-label" style={{ marginTop: 14 }}>{t.labelPassword}</label>
          <input
            className="login-input"
            type="password" required
            value={password}
            onChange={e => { setPassword(e.target.value); setError(''); }}
            placeholder={t.placeholderPassword}
            autoComplete="current-password"
          />

          {error && <div className="login-error">{error}</div>}

          <button
            className="login-btn" type="submit" disabled={loading}
            style={{ background: '#0D4BFF', color: '#fff', boxShadow: '0 8px 28px rgba(13,75,255,.35)' }}
          >
            {loading ? t.loading : t.btn}
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,.3)' }}>
          {t.noAccount}{' '}
          <a href="/portal/times/cadastro" style={{ color: '#0D4BFF', textDecoration: 'none', fontWeight: 700 }}>{t.register}</a>
        </div>

        <div style={{ marginTop: 14, textAlign: 'center' }}>
          <a href="/portal" style={{ fontSize: 12, color: 'rgba(255,255,255,.2)', textDecoration: 'none' }}>{t.back}</a>
        </div>
      </div>
    </div>
  );
}
