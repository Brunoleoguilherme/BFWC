'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Globe2, Menu, X } from 'lucide-react';
import { langs, getInitialLang } from './i18n';
import './site.css';

/* Hook de idioma compartilhado entre home e subpáginas */
export function useSiteLang() {
  const [lang, setLang] = useState('pt');

  useEffect(() => {
    const initialLang = getInitialLang();
    if (langs[initialLang]) {
      setLang(initialLang);
      localStorage.setItem('bfwc_language', initialLang);
    }
  }, []);

  function changeLang(value) {
    setLang(value);
    localStorage.setItem('bfwc_language', value);
    const url = new URL(window.location.href);
    url.searchParams.set('lang', value);
    window.history.replaceState({}, '', url);
  }

  const t = langs[lang] || langs.pt;
  return { lang, changeLang, t };
}

/* Itens de navegação — cada aba tem página própria */
export function navItems(t) {
  return [
    { href: '/site', label: t.home },
    { href: '/site/inscricoes', label: t.registrations },
    { href: '/jogos', label: t.games },
    { href: '/ranking', label: t.ranking },
    { href: '/site/local', label: t.venue },
    { href: '/site/sobre', label: t.about },
    { href: '/site/informacoes', label: t.info },
    { href: '/site/noticias', label: t.news },
    { href: '/site/parceiros', label: t.partners },
    { href: '/site/documentos', label: t.docs },
    { href: '/site/vagas-sociais', label: t.social },
    { href: '/site/contato', label: t.contact },
  ];
}

/* Inscrições abrem em 07/07/2026 às 10:00 (Brasília) */
export const REG_OPENS_AT = new Date('2026-07-07T09:50:00-03:00').getTime();

/* Faixa amarela: countdown até a abertura; vira "inscrições abertas" sozinha às 10h */
export function TopBanner({ lang }) {
  const [left, setLeft] = useState(null); // null até montar (evita mismatch SSR)

  useEffect(() => {
    const tick = () => setLeft(Math.max(0, REG_OPENS_AT - Date.now()));
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, []);

  const open = left !== null && left <= 0;

  if (!open) {
    const h = left == null ? '--' : String(Math.floor(left / 3600000)).padStart(2, '0');
    const m = left == null ? '--' : String(Math.floor(left / 60000) % 60).padStart(2, '0');
    const s = left == null ? '--' : String(Math.floor(left / 1000) % 60).padStart(2, '0');
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 12, background: '#f4ff00', color: '#031020', textAlign: 'center', padding: '13px 16px', lineHeight: 1.3 }}>
        <span style={{ fontWeight: 950, fontStyle: 'italic', textTransform: 'uppercase', fontSize: 'clamp(14px, 1.6vw, 19px)', letterSpacing: '.2px' }}>
          {lang === 'en' ? 'Registration opens TODAY at 10 AM (BRT)' : lang === 'es' ? 'Inscripciones abren HOY a las 10h (Brasilia)' : 'Inscrições abrem HOJE às 10h'}
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#031020', color: '#f4ff00', fontWeight: 900, padding: '8px 18px', borderRadius: 8, textTransform: 'uppercase', fontSize: 'clamp(12px, 1.3vw, 15px)', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
          ⏳ {h}:{m}:{s}
        </span>
      </div>
    );
  }

  return (
    <a href="/portal/times/cadastro" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 12, background: '#f4ff00', color: '#031020', textAlign: 'center', padding: '13px 16px', textDecoration: 'none', lineHeight: 1.3 }}>
      <span style={{ fontWeight: 950, fontStyle: 'italic', textTransform: 'uppercase', fontSize: 'clamp(14px, 1.6vw, 19px)', letterSpacing: '.2px' }}>
        {lang === 'en' ? 'Registration open for pre-registered teams' : lang === 'es' ? 'Inscripciones abiertas para pre-inscritos' : 'Inscrições abertas para pré-inscritos'}
      </span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#031020', color: '#f4ff00', fontWeight: 900, padding: '8px 18px', borderRadius: 8, textTransform: 'uppercase', fontSize: 'clamp(12px, 1.3vw, 15px)', whiteSpace: 'nowrap' }}>
        {lang === 'en' ? 'Click here →' : lang === 'es' ? 'Clic aquí →' : 'Clique aqui →'}
      </span>
    </a>
  );
}

/* Header com abas (desktop + hambúrguer mobile) e aba ativa destacada */
export function SiteHeader({ lang, changeLang, t }) {
  const [mobile, setMobile] = useState(false);
  const pathname = usePathname();

  const items = navItems(t);
  const isActive = (href) =>
    href === '/site' ? pathname === '/site' : pathname.startsWith(href);

  return (
    <header className="premiumTop">
      <Link href="/site">
        <Image src="/assets/bfwc-logo.jpg" alt="BFWC" width={86} height={86} priority />
      </Link>

      <nav>
        {items.map((item) => (
          <a key={item.href} href={item.href} className={isActive(item.href) ? 'on' : ''}>
            {item.label}
          </a>
        ))}
      </nav>

      <div className="langSelect">
        <Globe2 size={16} />
        {['pt', 'en', 'es'].map((item) => (
          <button
            key={item}
            onClick={() => changeLang(item)}
            className={lang === item ? 'on' : ''}
          >
            {item.toUpperCase()}
          </button>
        ))}
        <a href="/portal" className="adminLoginBtn">Login</a>
      </div>

      <button className="mobileBtn" onClick={() => setMobile(!mobile)} aria-label="Menu" aria-expanded={mobile}>
        {mobile ? <X /> : <Menu />}
      </button>

      {mobile && (
        <div className="mobileMenu" onClick={() => setMobile(false)}>
          {items.map((item) => (
            <a key={item.href} href={item.href} className={isActive(item.href) ? 'on' : ''}>
              {item.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}

/* Hero compacto das subpáginas */
export function PageHero({ kicker, title, subtitle }) {
  return (
    <section className="pageHero">
      <Image
        src="/assets/hero-rio-athletes.png"
        alt=""
        fill
        priority
        className="heroPhoto"
      />
      <div className="heroDark" />
      <div className="pageHeroInner">
        {kicker && <div className="pageHeroKicker">{kicker}</div>}
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
    </section>
  );
}

/* Formulário de newsletter (erro inline + try/catch) */
export function NewsletterForm({ lang, placeholder, buttonText }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, language: lang, source_page: 'site' })
      });
      const data = await response.json();

      if (data.ok) {
        setSuccess(true);
        setEmail('');
      } else {
        setError(data.message || (lang === 'en' ? 'Error subscribing. Please try again.' : lang === 'es' ? 'Error al registrar. Inténtalo de nuevo.' : 'Erro ao cadastrar e-mail. Tente novamente.'));
      }
    } catch {
      setError(lang === 'en' ? 'Connection error. Please try again.' : lang === 'es' ? 'Error de conexión. Inténtalo de nuevo.' : 'Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="nlForm">
      <div className="nlRow">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={placeholder}
          type="email"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? '...' : buttonText}
        </button>
      </div>

      {success && (
        <div style={{ marginTop: 16, background: 'rgba(104,255,91,0.12)', border: '1px solid #68ff5b', borderRadius: 12, padding: '14px 20px', color: '#68ff5b', fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#68ff5b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {lang === 'en'
            ? 'Subscribed! Check your email for a confirmation.'
            : lang === 'es'
            ? '¡Inscrito! Revisa tu correo para confirmación.'
            : 'Inscrito com sucesso! Verifique seu e-mail.'}
        </div>
      )}

      {error && (
        <div style={{ marginTop: 16, background: 'rgba(255,102,102,0.1)', border: '1px solid rgba(255,102,102,.5)', borderRadius: 12, padding: '14px 20px', color: '#ff8484', fontWeight: 700, fontSize: 14 }}>
          {error}
        </div>
      )}
    </form>
  );
}

export function NewsletterBar({ lang, t }) {
  return (
    <section id="newsletter" className="newsletterBar">
      <div>
        <h2>{t.newsletterTitle}</h2>
        <p>{t.newsletterText}</p>
      </div>
      <NewsletterForm lang={lang} placeholder={t.emailPlaceholder} buttonText={t.subscribe} />
    </section>
  );
}

/* Rodapé */
export function SiteFooter({ lang, t }) {
  return (
    <footer id="footer" className="premiumFooter">
      <Image src="/assets/bfwc-logo.jpg" alt="BFWC" width={80} height={80} />

      <p>{t.footerText}</p>

      <div>
        <b>{t.quickLinks}</b>
        <a href="/site">{t.home}</a>
        <a href="/site/inscricoes">{t.registrations}</a>
        <a href="/jogos">{t.games}</a>
        <a href="/ranking">{t.ranking}</a>
        <a href="/site/local">{t.venue}</a>
        <a href="/site/sobre">{t.about}</a>
        <a href="/site/noticias">{t.news}</a>
        <Link href="/portal/times/cadastro">{t.regButton}</Link>
      </div>

      <div>
        <b>{t.event}</b>
        <span>Leme, SP — Brasil</span>
        <span>2026</span>
      </div>

      <div>
        <b>{t.contact}</b>
        <a
          href="https://wa.me/5516997754522"
          target="_blank"
          rel="noopener noreferrer"
          className="whatsappBtn"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.123 1.532 5.855L0 24l6.335-1.51A11.933 11.933 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.017-1.376l-.36-.214-3.732.889.928-3.64-.235-.374A9.818 9.818 0 112 12 9.818 9.818 0 0121.818 12c0 5.423-4.395 9.818-9.818 9.818z"/>
          </svg>
          WhatsApp
        </a>

        <a href="mailto:contato@brasilsportsbusiness.com" className="emailBtn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2"/>
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
          </svg>
          E-mail
        </a>
      </div>
    </footer>
  );
}

/* Casca completa das subpáginas: banner + header + hero + conteúdo + newsletter + footer */
export function SitePageShell({ hero, children }) {
  const { lang, changeLang, t } = useSiteLang();

  return (
    <main className="siteShell">
      <TopBanner lang={lang} />
      <section className="mainSite">
        <SiteHeader lang={lang} changeLang={changeLang} t={t} />
        {hero && hero({ lang, t })}
        {children({ lang, t })}
        <NewsletterBar lang={lang} t={t} />
        <SiteFooter lang={lang} t={t} />
      </section>
    </main>
  );
}
