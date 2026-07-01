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
  const [langChosen, setLangChosen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [justVerified, setJustVerified] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('bfwc_language') || localStorage.getItem('bfwc_lang');
    if (saved && T[saved]) setLang(saved); // padrão; a tela de escolha ainda aparece
    if (sessionStorage.getItem('bfwc_athlete_session')) router.replace('/portal/atletas');
    if (typeof window !== 'undefined' && window.location.search.includes('verified=1')) setJustVerified(true);
  }, []);

  function chooseLang(code) {
    setLang(code);
    setLangChosen(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('bfwc_language', code);
      localStorage.setItem('bfwc_lang', code);
    }
  }

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

  const ACCENT = '#009c3b';

  // Tela de escolha de idioma (entrada do login de atletas)
  if (!langChosen) return (
    <div style={{ minHeight: '100vh', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "'Inter', sans-serif", overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: "url('/assets/hero-rio-athletes.png')", backgroundSize: 'cover', backgroundPosition: 'center', zIndex: 0 }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(3,13,31,.80), rgba(3,13,31,.93))', zIndex: 1 }} />
      <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 460, background: 'rgba(10,20,40,.72)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,.14)', borderRadius: 28, padding: '44px 34px', textAlign: 'center', boxShadow: '0 40px 120px rgba(0,0,0,.7)' }}>
        <Image src="/assets/bfwc-logo.jpg" alt="BFWC" width={92} height={92} style={{ borderRadius: 18, marginBottom: 20, objectFit: 'cover' }} />
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 9, fontWeight: 900, letterSpacing: 2.5, textTransform: 'uppercase', color: 'rgba(255,255,255,.65)', marginBottom: 12, padding: '5px 14px', borderRadius: 20, background: 'rgba(255,255,255,.08)' }}>🏃 Área dos Atletas</div>
        <h1 style={{ fontSize: 25, fontWeight: 900, color: '#fff', letterSpacing: -0.8, margin: '0 0 8px', lineHeight: 1.2 }}>Brasil Flag World Championship 2026</h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', margin: '0 0 26px', lineHeight: 1.6 }}>Selecione o idioma · Select your language · Selecciona el idioma</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[['pt', '/assets/flag-br.png', 'BR', 'Entrar em Português'], ['en', '/assets/flag-us.png', 'US', 'Enter in English'], ['es', '/assets/flag-es.png', 'ES', 'Entrar en Español']].map(([code, flag, short, title]) => (
            <button key={code} onClick={() => chooseLang(code)} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 18px', borderRadius: 16, border: '1px solid rgba(255,255,255,.14)', background: 'rgba(255,255,255,.06)', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'all .18s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,.13)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,.06)'; e.currentTarget.style.transform = 'none'; }}>
              <Image src={flag} alt={short} width={44} height={44} style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '1px solid rgba(255,255,255,.25)' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, color: '#2fe36a' }}>{short}</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>{title}</div>
              </div>
              <span style={{ color: '#2fe36a', fontSize: 22, fontWeight: 900 }}>→</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="login-root">
      <div className="login-card" style={{ overflow: 'hidden', paddingTop: 0 }}>
        {/* Accent stripe */}
        <div style={{ height: 4, background: `linear-gradient(90deg, ${ACCENT}, #4ade80)`, margin: '0 -44px 36px', width: 'calc(100% + 88px)' }} />

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
        <p className="login-sub" style={{ marginBottom: 28 }}>{t.sub}</p>

        {justVerified && (
          <div style={{ marginBottom: 16, padding: '12px 14px', borderRadius: 10, background: 'rgba(0,156,59,.08)', border: '1px solid rgba(0,156,59,.25)', fontSize: 13, color: ACCENT }}>
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
            style={{ background: ACCENT, color: '#fff', boxShadow: `0 4px 18px ${ACCENT}40` }}>
            {loading ? t.loading : t.btn}
          </button>
        </form>

        <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: '#64748b' }}>
          {t.noAccount}{' '}
          <a href="/portal/atletas/cadastro" style={{ color: ACCENT, textDecoration: 'none', fontWeight: 700 }}>{t.register}</a>
        </div>
        <div style={{ marginTop: 12, textAlign: 'center' }}>
          <a href="/portal" style={{ fontSize: 12, color: '#94a3b8', textDecoration: 'none', transition: 'color .2s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#475569'}
            onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
          >{t.back}</a>
        </div>
      </div>
    </div>
  );
}
