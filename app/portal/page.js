'use client';

import { useEffect, useState } from 'react';
import '../admin/admin.css';

const T = {
  pt: {
    badge: 'Portal Oficial',
    sub: 'Selecione sua área de acesso',
    back: 'Voltar ao site',
    teams:    { tag: 'Para Clubes',  title: 'BFWC', label: 'Área dos Times',    desc: 'Inscrição, tabelas e informações do clube', btn: 'Entrar',  register: 'Criar conta de clube' },
    athletes: { tag: 'Para Atletas', title: 'BFWC', label: 'Área dos Atletas',  desc: 'Estatísticas, classificações e rankings',   btn: 'Entrar',  register: 'Criar conta de atleta' },
    admin:    { tag: 'Organização',  title: 'BFWC', label: 'Administradores',   desc: 'Painel de gestão de inscrições',            btn: 'Entrar',  register: 'Solicitar acesso' },
    delegate: { tag: 'Arbitragem',   title: 'BFWC', label: 'Delegado da Partida', desc: 'Check-in, súmula e confirmação dos seus jogos', btn: 'Entrar', note: 'Acesso fornecido pela organização' },
  },
  en: {
    badge: 'Official Portal',
    sub: 'Select your access area',
    back: 'Back to site',
    teams:    { tag: 'For Clubs',    title: 'BFWC', label: 'Team Area',         desc: 'Registration, tables and club info',        btn: 'Enter',   register: 'Create club account' },
    athletes: { tag: 'For Athletes', title: 'BFWC', label: 'Athlete Area',      desc: 'Statistics, standings and rankings',        btn: 'Enter',   register: 'Create athlete account' },
    admin:    { tag: 'Organization', title: 'BFWC', label: 'Administrators',    desc: 'Registration management panel',             btn: 'Enter',   register: 'Request access' },
    delegate: { tag: 'Officiating', title: 'BFWC', label: 'Match Delegate', desc: 'Check-in, score sheet and confirmation of your games', btn: 'Enter', note: 'Access provided by the organization' },
  },
  es: {
    badge: 'Portal Oficial',
    sub: 'Selecciona tu área de acceso',
    back: 'Volver al sitio',
    teams:    { tag: 'Para Clubes',  title: 'BFWC', label: 'Área de Equipos',   desc: 'Inscripción, tablas e información del club',btn: 'Entrar',  register: 'Crear cuenta de club' },
    athletes: { tag: 'Para Atletas', title: 'BFWC', label: 'Área de Atletas',   desc: 'Estadísticas, clasificaciones y rankings',  btn: 'Entrar',  register: 'Crear cuenta de atleta' },
    admin:    { tag: 'Organización', title: 'BFWC', label: 'Administradores',   desc: 'Panel de gestión de inscripciones',         btn: 'Entrar',  register: 'Solicitar acceso' },
    delegate: { tag: 'Arbitraje',   title: 'BFWC', label: 'Delegado del Partido', desc: 'Check-in, acta y confirmación de tus partidos', btn: 'Entrar', note: 'Acceso proporcionado por la organización' },
  },
};

const CARDS = [
  { key: 'teams',    loginHref: '/portal/times/login',   registerHref: '/portal/times/cadastro',    accent: '#0D4BFF', glow: 'rgba(13,75,255,.12)',  btnColor: '#fff',    btnBg: '#0D4BFF' },
  { key: 'athletes', loginHref: '/portal/atletas/login',  registerHref: '/portal/atletas/cadastro',  accent: '#009c3b', glow: 'rgba(0,156,59,.1)',    btnColor: '#fff',    btnBg: '#009c3b' },
  { key: 'admin',    loginHref: '/admin/login',            registerHref: '/portal/admin/solicitar',   accent: '#f4ff00', glow: 'rgba(244,255,0,.1)',   btnColor: '#031020', btnBg: '#f4ff00' },
  { key: 'delegate', loginHref: '/admin/login',            registerHref: null,                        accent: '#eab308', glow: 'rgba(234,179,8,.12)',  btnColor: '#031020', btnBg: '#eab308' },
];

export default function PortalPage() {
  const [lang, setLang] = useState('pt');

  useEffect(() => {
    const saved = localStorage.getItem('bfwc_language');
    if (saved && T[saved]) setLang(saved);
  }, []);

  const t = T[lang];

  function chooseLang(code) {
    setLang(code);
    if (typeof window !== 'undefined') {
      localStorage.setItem('bfwc_language', code);
      localStorage.setItem('bfwc_lang', code);
    }
  }

  return (
    <div className="login-root" style={{ alignItems: 'center', overflowY: 'auto', minHeight: '100vh' }}>
      <style>{`
        .portal-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; align-items: stretch; }
        .portal-wrap { width: 100%; max-width: 1040px; padding: 32px 16px 24px; animation: cardIn .55s cubic-bezier(.22,.61,.36,1) both; }
        @media (max-width: 900px) { .portal-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 768px) {
          .portal-grid { grid-template-columns: 1fr; gap: 12px; }
          .portal-wrap { padding: 20px 16px 16px; }
          .portal-title { font-size: 32px !important; }
        }
      `}</style>

      <div className="portal-wrap">
        {/* Seletor de idioma */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
          {[['pt', '/assets/flag-br.png', 'PT'], ['en', '/assets/flag-us.png', 'EN'], ['es', '/assets/flag-es.png', 'ES']].map(([code, flag, label]) => (
            <button key={code} onClick={() => chooseLang(code)} style={{
              display: 'flex', alignItems: 'center', gap: 7, padding: '6px 14px', borderRadius: 22,
              border: `1px solid ${lang === code ? 'rgba(255,255,255,.95)' : 'rgba(255,255,255,.4)'}`,
              background: lang === code ? 'rgba(255,255,255,.92)' : 'rgba(3,13,31,.45)',
              color: lang === code ? '#0f172a' : '#fff', cursor: 'pointer', fontFamily: 'inherit',
              fontSize: 12, fontWeight: 800, backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', transition: 'all .15s',
            }}>
              <span style={{ width: 20, height: 20, borderRadius: '50%', overflow: 'hidden', display: 'inline-block', flexShrink: 0, border: '1px solid rgba(0,0,0,.15)' }}>
                <img src={flag} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.15)', display: 'block' }} />
              </span>
              {label}
            </button>
          ))}
        </div>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div className="login-badge" style={{ background: 'rgba(255,255,255,.85)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}>{t.badge}</div>
          <h1 className="login-title portal-title" style={{
            fontSize: 42, justifyContent: 'center', display: 'flex', gap: 10,
            textShadow: '0 2px 12px rgba(255,255,255,.9), 0 0 32px rgba(255,255,255,.7)',
          }}>
            BFWC <span>2026</span>
          </h1>
          <p className="login-sub" style={{
            marginBottom: 0, color: '#1e293b', fontWeight: 600,
            textShadow: '0 1px 8px rgba(255,255,255,.9)',
          }}>{t.sub}</p>
        </div>

        {/* Three cards */}
        <div className="portal-grid">
          {CARDS.map(card => {
            const info = t[card.key];
            return (
              <div key={card.key} style={{
                padding: '28px 24px',
                background: 'linear-gradient(145deg, rgba(5,18,55,.96), rgba(2,8,22,.95))',
                border: '1px solid rgba(255,255,255,.18)',
                borderRadius: 20,
                boxShadow: '0 24px 80px rgba(0,0,0,.5)',
                transition: 'border-color .2s, transform .2s, box-shadow .2s',
                display: 'flex', flexDirection: 'column',
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,.35)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = `0 32px 100px rgba(0,0,0,.6), 0 0 40px ${card.glow}`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,.18)';
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 24px 80px rgba(0,0,0,.5)';
                }}
              >
                {/* Tag */}
                <div style={{
                  display: 'inline-block', fontSize: 10, fontWeight: 700, letterSpacing: '2px',
                  textTransform: 'uppercase', color: card.accent,
                  border: `1px solid ${card.accent}70`, borderRadius: 20,
                  padding: '3px 12px', marginBottom: 16, background: card.accent + '25',
                  alignSelf: 'flex-start',
                }}>{info.tag}</div>

                {/* Title + Label + Desc */}
                <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-1px', color: '#fff', marginBottom: 4, lineHeight: 1 }}>
                  {info.title} <span style={{ color: card.accent }}>2026</span>
                </h2>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,.9)', marginBottom: 6 }}>{info.label}</div>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,.65)', lineHeight: 1.6, marginBottom: 20, flexGrow: 1 }}>{info.desc}</p>

                {/* Login button */}
                <a href={card.loginHref} style={{
                  display: 'block', width: '100%', padding: '12px',
                  background: card.btnBg, color: card.btnColor,
                  border: 'none', borderRadius: 10, boxSizing: 'border-box',
                  fontSize: 13, fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase',
                  cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'none', textAlign: 'center',
                  boxShadow: `0 6px 20px ${card.accent}35`,
                }}>
                  {info.btn} →
                </a>

                {/* Divider */}
                <div style={{ margin: '14px 0 12px', borderTop: '1px solid rgba(255,255,255,.06)' }} />

                {/* Register link OU nota (delegado não se cadastra) */}
                {card.registerHref ? (
                  <a href={card.registerHref} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    fontSize: 11, fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase',
                    color: card.accent, textDecoration: 'none',
                    padding: '8px', borderRadius: 8,
                    border: `1px solid ${card.accent}50`,
                    background: card.accent + '18',
                    transition: 'all .15s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = card.accent + '30'; e.currentTarget.style.borderColor = card.accent + '80'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = card.accent + '18'; e.currentTarget.style.borderColor = card.accent + '50'; }}
                  >
                    + {info.register}
                  </a>
                ) : (
                  <div style={{ textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,.35)', padding: '8px', lineHeight: 1.4 }}>
                    {info.note}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Back to site */}
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <a href="/site" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '10px 22px', borderRadius: 10,
            fontSize: 12, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase',
            color: '#64748b', textDecoration: 'none',
            border: '1px solid #cbd5e1',
            background: 'rgba(255,255,255,.7)',
            transition: 'all .2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#94a3b8'; e.currentTarget.style.color = '#0f172a'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#64748b'; }}
          >
            ← {t.back}
          </a>
        </div>
      </div>
    </div>
  );
}
