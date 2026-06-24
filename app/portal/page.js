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
  },
  en: {
    badge: 'Official Portal',
    sub: 'Select your access area',
    back: 'Back to site',
    teams:    { tag: 'For Clubs',    title: 'BFWC', label: 'Team Area',         desc: 'Registration, tables and club info',        btn: 'Enter',   register: 'Create club account' },
    athletes: { tag: 'For Athletes', title: 'BFWC', label: 'Athlete Area',      desc: 'Statistics, standings and rankings',        btn: 'Enter',   register: 'Create athlete account' },
    admin:    { tag: 'Organization', title: 'BFWC', label: 'Administrators',    desc: 'Registration management panel',             btn: 'Enter',   register: 'Request access' },
  },
  es: {
    badge: 'Portal Oficial',
    sub: 'Selecciona tu área de acceso',
    back: 'Volver al sitio',
    teams:    { tag: 'Para Clubes',  title: 'BFWC', label: 'Área de Equipos',   desc: 'Inscripción, tablas e información del club',btn: 'Entrar',  register: 'Crear cuenta de club' },
    athletes: { tag: 'Para Atletas', title: 'BFWC', label: 'Área de Atletas',   desc: 'Estadísticas, clasificaciones y rankings',  btn: 'Entrar',  register: 'Crear cuenta de atleta' },
    admin:    { tag: 'Organización', title: 'BFWC', label: 'Administradores',   desc: 'Panel de gestión de inscripciones',         btn: 'Entrar',  register: 'Solicitar acceso' },
  },
};

const CARDS = [
  { key: 'teams',    loginHref: '/portal/times/login',   registerHref: '/portal/times/cadastro',    accent: '#0D4BFF', glow: 'rgba(13,75,255,.12)',  btnColor: '#fff',    btnBg: '#0D4BFF' },
  { key: 'athletes', loginHref: '/portal/atletas/login',  registerHref: '/portal/atletas/cadastro',  accent: '#20e33f', glow: 'rgba(32,227,63,.1)',   btnColor: '#031020', btnBg: '#20e33f' },
  { key: 'admin',    loginHref: '/admin/login',            registerHref: '/portal/admin/solicitar',   accent: '#f4ff00', glow: 'rgba(244,255,0,.1)',   btnColor: '#031020', btnBg: '#f4ff00' },
];

export default function PortalPage() {
  const [lang, setLang] = useState('pt');

  useEffect(() => {
    const saved = localStorage.getItem('bfwc_language');
    if (saved && T[saved]) setLang(saved);
  }, []);

  const t = T[lang];

  return (
    <div className="login-root" style={{ alignItems: 'center', overflowY: 'auto', minHeight: '100vh' }}>
      <div className="login-glow" />

      <div style={{ width: '100%', maxWidth: 900, animation: 'cardIn .55s cubic-bezier(.22,.61,.36,1) both', padding: '32px 0 24px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div className="login-badge">{t.badge}</div>
          <h1 className="login-title" style={{ fontSize: 42, justifyContent: 'center', display: 'flex', gap: 10 }}>
            BFWC <span>2026</span>
          </h1>
          <p className="login-sub" style={{ marginBottom: 0 }}>{t.sub}</p>
        </div>

        {/* Three cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, alignItems: 'stretch' }}>
          {CARDS.map(card => {
            const info = t[card.key];
            return (
              <div key={card.key} style={{
                padding: '28px 24px',
                background: 'linear-gradient(145deg, rgba(5,18,55,.96), rgba(2,8,22,.95))',
                border: '1px solid rgba(255,255,255,.1)',
                borderRadius: 20,
                boxShadow: '0 24px 80px rgba(0,0,0,.5)',
                transition: 'border-color .2s, transform .2s, box-shadow .2s',
                display: 'flex', flexDirection: 'column',
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = card.accent + '55';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = `0 32px 100px rgba(0,0,0,.6), 0 0 40px ${card.glow}`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,.1)';
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 24px 80px rgba(0,0,0,.5)';
                }}
              >
                {/* Tag */}
                <div style={{
                  display: 'inline-block', fontSize: 10, fontWeight: 700, letterSpacing: '2px',
                  textTransform: 'uppercase', color: card.accent,
                  border: `1px solid ${card.accent}35`, borderRadius: 20,
                  padding: '3px 12px', marginBottom: 16, background: card.accent + '12',
                  alignSelf: 'flex-start',
                }}>{info.tag}</div>

                {/* Title + Label + Desc */}
                <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-1px', color: '#fff', marginBottom: 4, lineHeight: 1 }}>
                  {info.title} <span style={{ color: card.accent }}>2026</span>
                </h2>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,.65)', marginBottom: 6 }}>{info.label}</div>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,.35)', lineHeight: 1.6, marginBottom: 20, flexGrow: 1 }}>{info.desc}</p>

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

                {/* Register link */}
                <a href={card.registerHref} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  fontSize: 11, fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase',
                  color: card.accent + 'bb', textDecoration: 'none',
                  padding: '8px', borderRadius: 8,
                  border: `1px solid ${card.accent}20`,
                  background: card.accent + '08',
                  transition: 'all .15s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = card.accent + '18'; e.currentTarget.style.borderColor = card.accent + '45'; e.currentTarget.style.color = card.accent; }}
                  onMouseLeave={e => { e.currentTarget.style.background = card.accent + '08'; e.currentTarget.style.borderColor = card.accent + '20'; e.currentTarget.style.color = card.accent + 'bb'; }}
                >
                  + {info.register}
                </a>
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
            color: 'rgba(255,255,255,.35)', textDecoration: 'none',
            border: '1px solid rgba(255,255,255,.08)',
            background: 'rgba(255,255,255,.03)',
            transition: 'all .2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.2)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.08)'; e.currentTarget.style.color = 'rgba(255,255,255,.35)'; }}
          >
            ← {t.back}
          </a>
        </div>
      </div>
    </div>
  );
}
