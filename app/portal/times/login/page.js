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

// Portal abre em 07/07/2026 às 10:00 (Brasília)
const OPENS_AT = new Date('2026-07-07T10:00:00-03:00').getTime();

export default function TimesLoginPage() {
  const router = useRouter();
  const [locked, setLocked] = useState(true);
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
    if (typeof window !== 'undefined' && window.location.search.includes('verified=1')) {
      setJustVerified(true);
    }
    // Trava até 07/07 10h (Brasília); libera sozinha quando chegar a hora
    const check = () => setLocked(Date.now() < OPENS_AT);
    check();
    const iv = setInterval(check, 15000);
    return () => clearInterval(iv);
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

  const ACCENT = '#0D4BFF';

  // Portal ainda não abriu: aviso trilíngue, sem acesso
  if (locked) return (
    <div style={{ minHeight: '100vh', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "'Inter', sans-serif", overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: "url('/assets/hero-rio-athletes.png')", backgroundSize: 'cover', backgroundPosition: 'center', zIndex: 0 }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(3,13,31,.80), rgba(3,13,31,.93))', zIndex: 1 }} />
      <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 480, background: 'rgba(10,20,40,.72)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,.14)', borderRadius: 28, padding: '44px 34px', textAlign: 'center', boxShadow: '0 40px 120px rgba(0,0,0,.7)' }}>
        <img src="/assets/bfwc-logo.jpg" alt="BFWC" width={92} height={92} style={{ borderRadius: 18, marginBottom: 20, objectFit: 'cover' }} />
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 9, fontWeight: 900, letterSpacing: 2.5, textTransform: 'uppercase', color: '#f4ff00', marginBottom: 14, padding: '5px 14px', borderRadius: 20, background: 'rgba(244,255,0,.08)', border: '1px solid rgba(244,255,0,.25)' }}>🔒 Em breve · Coming soon · Próximamente</div>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: '#fff', letterSpacing: -0.8, margin: '0 0 18px', lineHeight: 1.25 }}>Inscrições abrem dia 07/07 às 10h</h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,.75)', margin: '0 0 10px', lineHeight: 1.6 }}>🇧🇷 O acesso ao portal dos times estará disponível <strong style={{ color: '#f4ff00' }}>dia 07/07 às 10h</strong> (horário de Brasília).</p>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,.75)', margin: '0 0 10px', lineHeight: 1.6 }}>🇺🇸 Team portal access will be available on <strong style={{ color: '#f4ff00' }}>July 7 at 10 AM</strong> (Brasília time, GMT-3).</p>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,.75)', margin: '0 0 24px', lineHeight: 1.6 }}>🇪🇸 El acceso al portal de equipos estará disponible el <strong style={{ color: '#f4ff00' }}>07/07 a las 10h</strong> (hora de Brasilia).</p>
        <a href="/portal" style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', textDecoration: 'none', fontWeight: 600 }}>← Voltar · Back · Volver</a>
      </div>
    </div>
  );

  return (
    <div className="login-root">
      <div className="login-card" style={{ overflow: 'hidden', paddingTop: 0 }}>
        {/* Accent stripe */}
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
        <p className="login-sub" style={{ marginBottom: 28 }}>{t.sub}</p>

        {justVerified && (
          <div style={{ marginBottom: 16, padding: '12px 14px', borderRadius: 10, background: 'rgba(0,156,59,.08)', border: '1px solid rgba(0,156,59,.25)', fontSize: 13, color: '#009c3b', lineHeight: 1.5 }}>
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
            style={{ background: ACCENT, color: '#fff', boxShadow: `0 4px 18px ${ACCENT}40` }}
          >
            {loading ? t.loading : t.btn}
          </button>
        </form>

        <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: '#64748b' }}>
          {t.noAccount}{' '}
          <a href="/portal/times/cadastro" style={{ color: ACCENT, textDecoration: 'none', fontWeight: 700 }}>{t.register}</a>
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
