'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import '../../../admin/admin.css';

const T = {
  pt: {
    badge: 'Recuperar senha',
    title: 'BFWC',
    subRequest: 'Informe o e-mail do responsável para receber o link de redefinição',
    subReset: 'Crie uma nova senha para a conta do seu clube',
    labelEmail: 'E-mail do responsável',
    placeholderEmail: 'email@seuclube.com',
    labelPassword: 'Nova senha',
    labelConfirm: 'Confirmar nova senha',
    placeholderPassword: 'Mínimo 8 caracteres',
    placeholderConfirm: 'Repita a senha',
    btnRequest: 'Enviar link de redefinição',
    btnReset: 'Salvar nova senha',
    loading: 'Enviando...',
    saving: 'Salvando...',
    passwordMin: 'A senha deve ter no mínimo 8 caracteres.',
    passwordMatch: 'As senhas não coincidem.',
    backLogin: '← Voltar ao login',
    goLogin: 'Fazer login',
    connError: 'Erro de conexão. Tente novamente.',
  },
  en: {
    badge: 'Reset password',
    title: 'BFWC',
    subRequest: 'Enter the contact email to receive the reset link',
    subReset: 'Create a new password for your club account',
    labelEmail: 'Contact email',
    placeholderEmail: 'email@yourclub.com',
    labelPassword: 'New password',
    labelConfirm: 'Confirm new password',
    placeholderPassword: 'At least 8 characters',
    placeholderConfirm: 'Repeat the password',
    btnRequest: 'Send reset link',
    btnReset: 'Save new password',
    loading: 'Sending...',
    saving: 'Saving...',
    passwordMin: 'Password must be at least 8 characters.',
    passwordMatch: 'Passwords do not match.',
    backLogin: '← Back to login',
    goLogin: 'Log in',
    connError: 'Connection error. Please try again.',
  },
  es: {
    badge: 'Recuperar contraseña',
    title: 'BFWC',
    subRequest: 'Ingresa el correo del responsable para recibir el enlace',
    subReset: 'Crea una nueva contraseña para la cuenta de tu club',
    labelEmail: 'Correo del responsable',
    placeholderEmail: 'email@tuclub.com',
    labelPassword: 'Nueva contraseña',
    labelConfirm: 'Confirmar nueva contraseña',
    placeholderPassword: 'Mínimo 8 caracteres',
    placeholderConfirm: 'Repite la contraseña',
    btnRequest: 'Enviar enlace',
    btnReset: 'Guardar nueva contraseña',
    loading: 'Enviando...',
    saving: 'Guardando...',
    passwordMin: 'La contraseña debe tener al menos 8 caracteres.',
    passwordMatch: 'Las contraseñas no coinciden.',
    backLogin: '← Volver al login',
    goLogin: 'Iniciar sesión',
    connError: 'Error de conexión. Inténtalo de nuevo.',
  },
};

const ACCENT = '#0D4BFF';

function RecuperarSenhaInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [lang, setLang] = useState('pt');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('bfwc_language') || localStorage.getItem('bfwc_lang');
    if (saved && T[saved]) setLang(saved);
  }, []);

  const t = T[lang];
  const isReset = !!token;

  async function handleRequest(e) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true); setError(''); setInfo('');
    try {
      const res = await fetch('/api/portal/times/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), language: lang }),
      });
      const data = await res.json();
      if (data.ok) { setInfo(data.message); setDone(true); }
      else setError(data.message || t.connError);
    } catch {
      setError(t.connError);
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e) {
    e.preventDefault();
    if (password.length < 8) { setError(t.passwordMin); return; }
    if (password !== confirm) { setError(t.passwordMatch); return; }
    setLoading(true); setError(''); setInfo('');
    try {
      const res = await fetch('/api/portal/times/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password, language: lang }),
      });
      const data = await res.json();
      if (data.ok) { setInfo(data.message); setDone(true); }
      else setError(data.message || t.connError);
    } catch {
      setError(t.connError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-root">
      <div className="login-card" style={{ overflow: 'hidden', paddingTop: 0 }}>
        <div style={{ height: 4, background: `linear-gradient(90deg, ${ACCENT}, #60a5fa)`, margin: '0 -44px 36px', width: 'calc(100% + 88px)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, flexShrink: 0,
            background: ACCENT + '12', border: `1.5px solid ${ACCENT}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
          }}>
            <Image src="/assets/bfwc-logo.jpg" alt="BFWC" width={52} height={52} style={{ objectFit: 'cover' }} />
          </div>
          <div>
            <div className="login-badge" style={{ marginBottom: 4, borderColor: ACCENT + '30', color: ACCENT }}>{t.badge}</div>
            <h1 className="login-title" style={{ fontSize: 26, marginBottom: 0 }}>
              {t.title} <span style={{ color: ACCENT }}>2026</span>
            </h1>
          </div>
        </div>
        <p className="login-sub" style={{ marginBottom: 28 }}>{isReset ? t.subReset : t.subRequest}</p>

        {info && (
          <div style={{ marginBottom: 16, padding: '12px 14px', borderRadius: 10, background: 'rgba(0,156,59,.08)', border: '1px solid rgba(0,156,59,.25)', fontSize: 13, color: '#009c3b', lineHeight: 1.5 }}>
            ✅ {info}
          </div>
        )}

        {done ? (
          <a href="/portal/times/login" className="login-btn" style={{ display: 'block', textAlign: 'center', background: ACCENT, color: '#fff', textDecoration: 'none', boxShadow: `0 4px 18px ${ACCENT}40` }}>
            {t.goLogin}
          </a>
        ) : isReset ? (
          <form onSubmit={handleReset}>
            <label className="login-label">{t.labelPassword}</label>
            <input
              className="login-input"
              type="password" required minLength={8}
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              placeholder={t.placeholderPassword}
              autoComplete="new-password"
            />

            <label className="login-label" style={{ marginTop: 14 }}>{t.labelConfirm}</label>
            <input
              className="login-input"
              type="password" required minLength={8}
              value={confirm}
              onChange={e => { setConfirm(e.target.value); setError(''); }}
              placeholder={t.placeholderConfirm}
              autoComplete="new-password"
            />

            {error && <div className="login-error">{error}</div>}

            <button
              className="login-btn" type="submit" disabled={loading}
              style={{ background: ACCENT, color: '#fff', boxShadow: `0 4px 18px ${ACCENT}40` }}
            >
              {loading ? t.saving : t.btnReset}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRequest}>
            <label className="login-label">{t.labelEmail}</label>
            <input
              className="login-input"
              type="email" required
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
              placeholder={t.placeholderEmail}
              autoComplete="email"
            />

            {error && <div className="login-error">{error}</div>}

            <button
              className="login-btn" type="submit" disabled={loading}
              style={{ background: ACCENT, color: '#fff', boxShadow: `0 4px 18px ${ACCENT}40` }}
            >
              {loading ? t.loading : t.btnRequest}
            </button>
          </form>
        )}

        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <a href="/portal/times/login" style={{ fontSize: 13, color: '#94a3b8', textDecoration: 'none', fontWeight: 600 }}>{t.backLogin}</a>
        </div>
      </div>
    </div>
  );
}

export default function RecuperarSenhaPage() {
  return (
    <Suspense fallback={null}>
      <RecuperarSenhaInner />
    </Suspense>
  );
}
