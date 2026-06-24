'use client';

import { useState, useEffect } from 'react';
import '../../../admin/admin.css';

const T = {
  pt: {
    badge: 'Cadastro de Atleta',
    title: 'BFWC',
    sub: 'Crie sua conta para acessar a área dos atletas',
    labelName: 'Nome completo *',
    labelEmail: 'E-mail *',
    placeholderEmail: 'email@seuclube.com',
    labelPassword: 'Senha *',
    labelConfirm: 'Confirmar senha *',
    btn: 'Criar conta',
    loading: 'Criando conta...',
    loginLink: 'Já tem conta?',
    login: 'Fazer login',
    back: '← Voltar ao portal',
    infoTitle: 'Como funciona?',
    infoText: 'Seu e-mail precisa estar na lista de atletas do seu clube. Solicite ao responsável do clube que faça o cadastro antes.',
    successTitle: 'Cadastro realizado!',
    successMsg: 'Enviamos um e-mail de confirmação para <strong>{email}</strong>. Clique no link para ativar sua conta.',
    errors: {
      required: 'Campo obrigatório',
      email: 'E-mail inválido',
      passwordMin: 'Mínimo 8 caracteres',
      passwordMatch: 'As senhas não coincidem',
    },
  },
  en: {
    badge: 'Athlete Registration',
    title: 'BFWC',
    sub: 'Create your account to access the athlete area',
    labelName: 'Full name *',
    labelEmail: 'Email *',
    placeholderEmail: 'email@yourclub.com',
    labelPassword: 'Password *',
    labelConfirm: 'Confirm password *',
    btn: 'Create account',
    loading: 'Creating account...',
    loginLink: 'Already have an account?',
    login: 'Log in',
    back: '← Back to portal',
    infoTitle: 'How it works',
    infoText: 'Your email must be on your club\'s athlete roster. Ask your club contact to add you first.',
    successTitle: 'Registration complete!',
    successMsg: 'We sent a confirmation email to <strong>{email}</strong>. Click the link to activate your account.',
    errors: {
      required: 'Required field',
      email: 'Invalid email',
      passwordMin: 'Minimum 8 characters',
      passwordMatch: 'Passwords do not match',
    },
  },
  es: {
    badge: 'Registro de Atleta',
    title: 'BFWC',
    sub: 'Crea tu cuenta para acceder al área de atletas',
    labelName: 'Nombre completo *',
    labelEmail: 'Correo electrónico *',
    placeholderEmail: 'email@tuclub.com',
    labelPassword: 'Contraseña *',
    labelConfirm: 'Confirmar contraseña *',
    btn: 'Crear cuenta',
    loading: 'Creando cuenta...',
    loginLink: '¿Ya tienes cuenta?',
    login: 'Iniciar sesión',
    back: '← Volver al portal',
    infoTitle: '¿Cómo funciona?',
    infoText: 'Tu correo debe estar en la lista de atletas de tu club. Pide al responsable del club que te agregue primero.',
    successTitle: '¡Registro completado!',
    successMsg: 'Enviamos un correo de confirmación a <strong>{email}</strong>. Haz clic en el enlace para activar tu cuenta.',
    errors: {
      required: 'Campo obligatorio',
      email: 'Correo inválido',
      passwordMin: 'Mínimo 8 caracteres',
      passwordMatch: 'Las contraseñas no coinciden',
    },
  },
};

export default function AtletasCadastroPage() {
  const [lang, setLang] = useState('pt');
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);
  const [urlError, setUrlError] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('bfwc_language');
    if (saved && T[saved]) setLang(saved);
    const params = new URLSearchParams(window.location.search);
    const err = params.get('error');
    if (err === 'token_expired') setUrlError('O link de verificação expirou. Faça o cadastro novamente.');
    if (err === 'token_invalid') setUrlError('Link inválido. Faça o cadastro novamente.');
  }, []);

  const t = T[lang];

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: '' }));
    setServerError('');
  }

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = t.errors.required;
    if (!form.email.trim() || !form.email.includes('@')) errs.email = t.errors.email;
    if (!form.password) errs.password = t.errors.required;
    else if (form.password.length < 8) errs.password = t.errors.passwordMin;
    if (form.password !== form.confirm) errs.confirm = t.errors.passwordMatch;
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true); setServerError('');
    try {
      const res = await fetch('/api/portal/atletas/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password, language: lang }),
      });
      const data = await res.json();
      if (data.ok) setSuccess(true);
      else setServerError(data.message || 'Erro ao criar conta.');
    } catch {
      setServerError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="login-root">
        <div className="login-glow" style={{ background: 'radial-gradient(circle, rgba(32,227,63,.07) 0%, transparent 65%)' }} />
        <div className="login-card" style={{ maxWidth: 440, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <div className="login-badge">{t.badge}</div>
          <h1 className="login-title" style={{ justifyContent: 'center' }}>{t.successTitle}</h1>
          <p style={{ fontSize: 14, color: '#c8d8f5', lineHeight: 1.7, margin: '16px 0 24px' }}
            dangerouslySetInnerHTML={{ __html: t.successMsg.replace('{email}', form.email) }}
          />
          <a href="/portal/atletas/login" className="login-btn" style={{ display: 'block', textAlign: 'center', background: '#20e33f', color: '#031020', textDecoration: 'none' }}>
            {t.login}
          </a>
          <div style={{ marginTop: 12 }}>
            <a href="/portal" style={{ fontSize: 12, color: 'rgba(255,255,255,.2)', textDecoration: 'none' }}>{t.back}</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-root">
      <div className="login-glow" style={{ background: 'radial-gradient(circle, rgba(32,227,63,.07) 0%, transparent 65%)' }} />

      <div className="login-card" style={{ animation: 'cardIn .55s cubic-bezier(.22,.61,.36,1) both' }}>
        <div className="login-badge">{t.badge}</div>
        <h1 className="login-title">{t.title} <span style={{ color: '#20e33f' }}>2026</span></h1>
        <p className="login-sub">{t.sub}</p>

        {/* Info box */}
        <div style={{ marginBottom: 20, padding: '12px 14px', borderRadius: 10, background: 'rgba(32,227,63,.05)', border: '1px solid rgba(32,227,63,.15)', fontSize: 12, color: 'rgba(255,255,255,.45)', lineHeight: 1.6 }}>
          <strong style={{ color: 'rgba(32,227,63,.8)', display: 'block', marginBottom: 4 }}>ℹ️ {t.infoTitle}</strong>
          {t.infoText}
        </div>

        {urlError && (
          <div className="login-error" style={{ marginBottom: 16 }}>{urlError}</div>
        )}

        <form onSubmit={handleSubmit}>
          <label className="login-label">{t.labelName}</label>
          <input className="login-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Seu nome completo" style={{ width: '100%', boxSizing: 'border-box' }} />
          {errors.name && <div className="login-error" style={{ marginTop: 4 }}>{errors.name}</div>}

          <label className="login-label" style={{ marginTop: 14 }}>{t.labelEmail}</label>
          <input className="login-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder={t.placeholderEmail} autoComplete="email" style={{ width: '100%', boxSizing: 'border-box' }} />
          {errors.email && <div className="login-error" style={{ marginTop: 4 }}>{errors.email}</div>}

          <label className="login-label" style={{ marginTop: 14 }}>{t.labelPassword}</label>
          <input className="login-input" type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Mínimo 8 caracteres" autoComplete="new-password" style={{ width: '100%', boxSizing: 'border-box' }} />
          {errors.password && <div className="login-error" style={{ marginTop: 4 }}>{errors.password}</div>}

          <label className="login-label" style={{ marginTop: 14 }}>{t.labelConfirm}</label>
          <input className="login-input" type="password" value={form.confirm} onChange={e => set('confirm', e.target.value)} placeholder="Repita a senha" autoComplete="new-password" style={{ width: '100%', boxSizing: 'border-box' }} />
          {errors.confirm && <div className="login-error" style={{ marginTop: 4 }}>{errors.confirm}</div>}

          {serverError && <div className="login-error" style={{ marginTop: 12 }}>{serverError}</div>}

          <button className="login-btn" type="submit" disabled={loading}
            style={{ background: '#20e33f', color: '#031020', boxShadow: '0 8px 28px rgba(32,227,63,.3)', marginTop: 8 }}>
            {loading ? t.loading : t.btn}
          </button>
        </form>

        <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,.3)' }}>
          {t.loginLink}{' '}
          <a href="/portal/atletas/login" style={{ color: '#20e33f', textDecoration: 'none', fontWeight: 700 }}>{t.login}</a>
        </div>
        <div style={{ marginTop: 10, textAlign: 'center' }}>
          <a href="/portal" style={{ fontSize: 12, color: 'rgba(255,255,255,.2)', textDecoration: 'none' }}>{t.back}</a>
        </div>
      </div>
    </div>
  );
}
