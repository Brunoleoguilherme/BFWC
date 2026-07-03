'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  Globe2,
  CalendarDays,
  MapPin,
  Users,
  Star,
  Menu,
  X,
  ArrowRight
} from 'lucide-react';
import './site.css';

const langs = {
  pt: {
    home: 'HOME',
    about: 'SOBRE',
    info: 'INFORMAÇÕES',
    
    registrations: 'INSCRIÇÕES',
    games: 'JOGOS',
    ranking: 'ESTATÍSTICAS',
    venue: 'LOCAL',
    partners: 'PARCEIROS',
    contact: 'CONTATO',
    heroTitle: 'O FLAG FOOTBALL MUNDIAL\nVAI SE ENCONTRAR NO BRASIL.',
heroSub: 'O PRÓXIMO NÍVEL NO ESPORTE!',
register: 'CADASTRAR INTERESSE DA MINHA EQUIPE',
    aboutTag: 'SOBRE O EVENTO',
    aboutTitle: 'UM NOVO CAPÍTULO PARA O FLAG FOOTBALL.',
    aboutText:
      'O Brasil Flag World Championship 2026 é o maior campeonato internacional de flag football já realizado no Brasil. Com categorias masculina, feminina, Sub 15 e Sub 12, o evento reúne clubes, atletas e delegações de todo o mundo na cidade de Leme, SP. Uma celebração do esporte, da cultura e do espírito competitivo — tudo em um único lugar.',
    learnMore: 'SAIBA MAIS',
    date: 'DATA',
    dateValue: '31 de outubro de 2026',
    dateDesc: 'Abertura oficial',
    location: 'LOCAL',
    locationValue: 'Leme, SP',
    locationDesc: 'Brasil',
    categories: 'CATEGORIAS',
    categoriesValue: 'Masculino • Feminino',
    categoriesDesc: 'Sub 15 (misto) • Sub 12 (misto)',
    expect: 'O QUE ESPERAR',
    expectValue: 'Jogos de alto nível',
    expectDesc: 'cultura, competitividade e experiência',
    regTitle: 'INSCRIÇÃO DE EQUIPES',
    regPref: 'Times já pré-inscritos têm preferência na inscrição.',
    regLimited: 'Vagas limitadas por categoria — garanta a sua.',
    regDates: 'Inscrição: 07 a 12/07 (pré-inscritos) · 13 a 20/07 (aberta a todos).',
    regCtaBefore: 'As equipes devem clicar',
    regHere: 'AQUI',
    regCtaAfter: 'para fazer o cadastro oficial da equipe. Depois, a equipe acessa todas as informações do campeonato no portal.',
    regButton: 'Cadastrar minha equipe',
    regScarcity: 'Vagas limitadas por categoria — garanta a sua',
    regIntro: 'O cadastro oficial é onde sua equipe cria a conta no portal, escolhe a forma de pagamento e passa a acessar todas as informações do campeonato. As vagas são limitadas por categoria e preenchidas por ordem de pagamento da 1ª parcela.',
    regPreTag: '07 a 12/07 · Prioridade',
    regPreTitle: 'Times pré-inscritos',
    regPreText: 'Já fez a pré-inscrição? Sua equipe tem prioridade para confirmar o cadastro oficial neste período.',
    regOpenTag: '13 a 20/07 · Aberto a todos',
    regOpenTitle: 'Demais equipes',
    regOpenText: 'A partir de 13/07, qualquer equipe pode fazer o cadastro oficial, enquanto houver vagas na categoria.',
    latestNews: 'ÚLTIMAS NOTÍCIAS',
    stayUpdated: 'FIQUE POR DENTRO',
    viewAll: 'VER TODAS',
    
    partnersTitle: 'PARCEIROS',
    partnerSponsor: 'PATROCINADORES',
    partnerOrganizer: 'REALIZAÇÃO',
    partnerSupport: 'APOIO',
    newsletterTitle: 'NÃO PERCA NENHUMA NOVIDADE!',
    newsletterText: 'Se inscreva para receber novidades sobre o campeonato.',
    emailPlaceholder: 'Seu e-mail',
    subscribe: 'SE INSCREVER',
    footerText:
      'O Brasil Flag World Championship conecta culturas, pessoas e paixão por meio do esporte.',
    quickLinks: 'LINKS RÁPIDOS',
    event: 'EVENTO',
    countdown: 'CONTAGEM REGRESSIVA PARA 31/10/2026',
    days: 'DIAS',
    hours: 'HORAS',
    minutes: 'MINUTOS',
    seconds: 'SEGUNDOS'
  },

  en: {
    home: 'HOME',
    about: 'ABOUT',
    info: 'INFO',
    
    registrations: 'REGISTRATION',
    games: 'GAMES',
    ranking: 'STATISTICS',
    venue: 'VENUE',
    partners: 'PARTNERS',
    contact: 'CONTACT',
    heroTitle: 'THE WORLD MEETS IN BRAZIL.',
    heroSub: 'One game. One passion.',
    latestNews: 'LATEST NEWS',
    register: 'REGISTER YOUR INTEREST',
    aboutTag: 'ABOUT THE EVENT',
    aboutTitle: 'A NEW CHAPTER FOR FLAG FOOTBALL.',
    aboutText:
      'The Brasil Flag World Championship 2026 is the biggest international flag football championship ever held in Brazil. Featuring men\'s, women\'s, U15 and U12 categories, the event brings together clubs, athletes and delegations from around the world in Leme, SP. A celebration of sport, culture and competitive spirit — all in one place.',
    learnMore: 'LEARN MORE',
    date: 'DATE',
    dateValue: 'October 31, 2026',
    dateDesc: 'Official opening',
    location: 'LOCATION',
    locationValue: 'Leme, SP',
    locationDesc: 'Brazil',
    categories: 'CATEGORIES',
    categoriesValue: 'Men • Women',
    categoriesDesc: 'U15 Mixed • U12 Mixed',
    expect: 'WHAT TO EXPECT',
    expectValue: 'High level games',
    expectDesc: 'culture, competitiveness and experience',
    regTitle: 'TEAM REGISTRATION',
    regPref: 'Already pre-registered teams have priority in registration.',
    regLimited: 'Limited spots per category — secure yours.',
    regDates: 'Registration: Jul 7–12 (pre-registered) · Jul 13–20 (open to all).',
    regCtaBefore: 'Teams should click',
    regHere: 'HERE',
    regCtaAfter: 'to complete the official team registration. Afterwards, the team can access all championship information in the portal.',
    regButton: 'Register my team',
    regScarcity: 'Limited spots per category — secure yours',
    regIntro: 'The official registration is where your team creates its portal account, chooses a payment method and gains access to all championship information. Spots are limited per category and filled in order of 1st installment payment.',
    regPreTag: 'Jul 7–12 · Priority',
    regPreTitle: 'Pre-registered teams',
    regPreText: 'Already pre-registered? Your team has priority to confirm the official registration during this window.',
    regOpenTag: 'Jul 13–20 · Open to all',
    regOpenTitle: 'Other teams',
    regOpenText: 'From Jul 13, any team can complete the official registration, while category spots last.',
        stayUpdated: 'STAY UPDATED',
    viewAll: 'VIEW ALL',
        partnersTitle: 'PARTNERS',
    partnerSponsor: 'SPONSORS',
    partnerOrganizer: 'ORGANIZER',
    partnerSupport: 'SUPPORT',
    newsletterTitle: "DON'T MISS ANY NEWS!",
    newsletterText: 'Subscribe to receive updates about the championship.',
    emailPlaceholder: 'Your email',
    subscribe: 'SUBSCRIBE',
    footerText:
      'The Brazil Flag World Championship connects cultures, people and passion through sport.',
    quickLinks: 'QUICK LINKS',
    event: 'EVENT',
    countdown: 'COUNTDOWN TO 10/31/2026',
    days: 'DAYS',
    hours: 'HOURS',
    minutes: 'MINUTES',
    seconds: 'SECONDS'
  },

  es: {
    home: 'HOME',
    about: 'SOBRE',
    info: 'INFO',
    registrations: 'INSCRIPCIONES',
    games: 'PARTIDOS',
    ranking: 'ESTADÍSTICAS',
    venue: 'SEDE',
    partners: 'SOCIOS',
    contact: 'CONTACTO',
    heroTitle: 'EL MUNDO SE ENCUENTRA EN BRASIL.',
    heroSub: 'Un juego. Una pasión.',
    latestNews: 'ÚLTIMAS NOTICIAS',
    register: 'REGISTRAR INTERÉS',
    aboutTag: 'SOBRE EL EVENTO',
    aboutTitle: 'UN NUEVO CAPÍTULO PARA EL FLAG FOOTBALL.',
    aboutText:
      'El Brasil Flag World Championship 2026 es el mayor campeonato internacional de flag football realizado en Brasil. Con categorías masculina, femenina, Sub 15 y Sub 12, el evento reúne clubes, atletas y delegaciones de todo el mundo en Leme, SP. Una celebración del deporte, la cultura y el espíritu competitivo — todo en un solo lugar.',
    learnMore: 'SABER MÁS',
    date: 'FECHA',
    dateValue: '31 de octubre de 2026',
    dateDesc: 'Apertura oficial',
    location: 'UBICACIÓN',
    locationValue: 'Leme, SP',
    locationDesc: 'Brasil',
    categories: 'CATEGORÍAS',
    categoriesValue: 'Masculino • Femenino',
    categoriesDesc: 'Sub 15 (mixto) • Sub 12 (mixto)',
    expect: 'QUÉ ESPERAR',
    expectValue: 'Juegos de alto nivel',
    expectDesc: 'cultura, competitividad y experiencia',
    regTitle: 'INSCRIPCIÓN DE EQUIPOS',
    regPref: 'Los equipos ya pre-inscritos tienen preferencia en la inscripción.',
    regLimited: 'Cupos limitados por categoría — asegura el tuyo.',
    regDates: 'Inscripción: 07 al 12/07 (pre-inscritos) · 13 al 20/07 (abierta a todos).',
    regCtaBefore: 'Los equipos deben hacer clic',
    regHere: 'AQUÍ',
    regCtaAfter: 'para completar el registro oficial del equipo. Luego, el equipo accede a toda la información del campeonato en el portal.',
    regButton: 'Inscribir mi equipo',
    regScarcity: 'Cupos limitados por categoría — asegura el tuyo',
    regIntro: 'El registro oficial es donde tu equipo crea su cuenta en el portal, elige la forma de pago y accede a toda la información del campeonato. Los cupos son limitados por categoría y se llenan por orden de pago de la 1.ª cuota.',
    regPreTag: '07 al 12/07 · Prioridad',
    regPreTitle: 'Equipos pre-inscritos',
    regPreText: '¿Ya te pre-inscribiste? Tu equipo tiene prioridad para confirmar el registro oficial en este período.',
    regOpenTag: '13 al 20/07 · Abierto a todos',
    regOpenTitle: 'Demás equipos',
    regOpenText: 'A partir del 13/07, cualquier equipo puede completar el registro oficial, mientras haya cupos en la categoría.',
        stayUpdated: 'MANTENTE INFORMADO',
    viewAll: 'VER TODAS',
    
    partnersTitle: 'SOCIOS',
    partnerSponsor: 'PATROCINADORES',
    partnerOrganizer: 'ORGANIZACIÓN',
    partnerSupport: 'APOYO',
    newsletterTitle: '¡NO TE PIERDAS NINGUNA NOTICIA!',
    newsletterText: 'Suscríbete para recibir novedades del campeonato.',
    emailPlaceholder: 'Tu e-mail',
    subscribe: 'SUSCRIBIRSE',
    footerText:
      'El Brazil Flag World Championship conecta culturas, personas y pasión a través del deporte.',
    quickLinks: 'ENLACES RÁPIDOS',
    event: 'EVENTO',
    countdown: 'CUENTA REGRESIVA PARA 31/10/2026',
    days: 'DÍAS',
    hours: 'HORAS',
    minutes: 'MINUTOS',
    seconds: 'SEGUNDOS'
  }
};

function getInitialLang() {
  if (typeof window === 'undefined') return 'pt';

  const params = new URLSearchParams(window.location.search);
  const urlLang = params.get('lang');
  const savedLang = localStorage.getItem('bfwc_language');

  return urlLang || savedLang || 'pt';
}

function NewsletterForm({ lang, placeholder, buttonText }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!email) return;

    setLoading(true);

    const response = await fetch('/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        language: lang,
        source_page: 'site'
      })
    });

    const data = await response.json();

    setLoading(false);

    if (data.ok) {
      setSuccess(true);
      setEmail('');
    } else {
      alert(data.message || 'Erro ao cadastrar e-mail.');
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
        <div style={{
          marginTop: 16,
          background: 'rgba(104,255,91,0.12)',
          border: '1px solid #68ff5b',
          borderRadius: 12,
          padding: '14px 20px',
          color: '#68ff5b',
          fontWeight: 700,
          fontSize: 15,
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}>
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
    </form>
  );
}

export default function SitePage() {
  const [lang, setLang] = useState('pt');
  const [mobile, setMobile] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const t = langs[lang] || langs.pt;

  useEffect(() => {
    const initialLang = getInitialLang();

    if (langs[initialLang]) {
      setLang(initialLang);
      localStorage.setItem('bfwc_language', initialLang);
    }
  }, []);

  useEffect(() => {
    const targetDate = new Date('2026-10-31T00:00:00-03:00');

    function updateCountdown() {
      const now = new Date();
      const diff = targetDate - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60)
      });
    }

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);

    return () => clearInterval(timer);
  }, []);

  function changeLang(value) {
    setLang(value);
    localStorage.setItem('bfwc_language', value);

    const url = new URL(window.location.href);
    url.searchParams.set('lang', value);
    window.history.replaceState({}, '', url);
  }

  return (
    <main className="siteShell">
      <section className="mainSite">
        <header className="premiumTop">
          <Image
            src="/assets/bfwc-logo.jpg"
            alt="BFWC"
            width={86}
            height={86}
            priority
          />

          <nav>
            <a href="#top">{t.home}</a>
            <a href="#team-registration">{t.registrations}</a>
            <a href="/jogos">{t.games}</a>
            <a href="/ranking">{t.ranking}</a>
            <a href="#venue-local">{t.venue}</a>
            <a href="#about">{t.about}</a>
            <a href="#info">{t.info}</a>
                        <a href="#partners">{t.partners}</a>
            <a href="#footer">{t.contact}</a>
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

          <button className="mobileBtn" onClick={() => setMobile(!mobile)}>
            {mobile ? <X /> : <Menu />}
          </button>
        </header>

        {mobile && (
          <div className="mobileMenu">
            <a href="#top">{t.home}</a>
            <a href="#team-registration">{t.registrations}</a>
            <a href="/jogos">{t.games}</a>
            <a href="/ranking">{t.ranking}</a>
            <a href="#venue-local">{t.venue}</a>
            <a href="#about">{t.about}</a>
            <a href="#info">{t.info}</a>
           
            <a href="#partners">{t.partners}</a>
          </div>
        )}

        <section id="top" className="cinemaHero">
          <Image
            src="/assets/hero-rio-athletes.png"
            alt="Rio de Janeiro e atletas de Flag Football"
            fill
            priority
            loading="eager"
            className="heroPhoto"
          />

          <div className="heroDark" />

          <div className="heroInner">
            <h1 className="heroTitleSplit">
  {lang === 'pt' ? (
    <>
      <span>O FLAG FOOTBALL MUNDIAL</span>
      <strong>VAI SE ENCONTRAR NO BRASIL.</strong>
    </>
  ) : lang === 'en' ? (
    <>
      <span>WORLD FLAG FOOTBALL</span>
      <strong>WILL MEET IN BRAZIL.</strong>
    </>
  ) : (
    <>
      <span>EL FLAG FOOTBALL MUNDIAL</span>
      <strong>SE ENCONTRARÁ EN BRASIL.</strong>
    </>
  )}
</h1>

<h2>{t.heroSub}</h2>

            <div className="heroMeta">
              <span>
                <CalendarDays size={19} />
                2026
              </span>

              <span>
                <MapPin size={19} />
                LEME, SP — BRASIL
              </span>
            </div>

            <Link href="/portal/times/cadastro" className="yellowBtn">
              {t.regButton}
              <ArrowRight size={18} />
            </Link>

            <div className="countdown">
              <p>{t.countdown}</p>

              <div>
                <strong>{timeLeft.days}</strong>
                <span>{t.days}</span>
              </div>

              <div>
                <strong>{timeLeft.hours}</strong>
                <span>{t.hours}</span>
              </div>

              <div>
                <strong>{timeLeft.minutes}</strong>
                <span>{t.minutes}</span>
              </div>

              <div>
                <strong>{timeLeft.seconds}</strong>
                <span>{t.seconds}</span>
              </div>
            </div>
          </div>
        </section>


        {/* Inscrição de equipes */}
        <section id="team-registration" style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px 20px' }}>
          <div style={{ background: 'linear-gradient(145deg, #06183f, #030d1f)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 24, padding: '44px 36px', textAlign: 'center' }}>
            <div style={{ fontSize: 'clamp(34px, 4.6vw, 60px)', fontWeight: 950, fontStyle: 'italic', textTransform: 'uppercase', letterSpacing: '-.045em', color: '#f4ff00', marginBottom: 16, lineHeight: .92 }}>{t.regTitle}</div>
            <div style={{ display: 'inline-block', padding: '10px 24px', borderRadius: 100, background: 'rgba(244,255,0,.14)', border: '2px solid rgba(244,255,0,.65)', color: '#f4ff00', fontWeight: 950, fontStyle: 'italic', textTransform: 'uppercase', fontSize: 'clamp(13px, 1.5vw, 19px)', letterSpacing: '.02em', marginBottom: 22, lineHeight: 1.15 }}>{t.regScarcity}</div>
            <p style={{ fontSize: 'clamp(15px, 1.4vw, 19px)', color: '#d5e1f7', lineHeight: 1.6, fontStyle: 'italic', fontWeight: 600, maxWidth: 820, margin: '0 auto 30px' }}>{t.regIntro}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, textAlign: 'left', marginBottom: 30 }}>
              <div style={{ background: 'rgba(244,255,0,.05)', border: '1px solid rgba(244,255,0,.35)', borderRadius: 16, padding: '22px 24px' }}>
                <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: 1.5, color: '#f4ff00', textTransform: 'uppercase', marginBottom: 8 }}>{t.regPreTag}</div>
                <div style={{ fontSize: 'clamp(22px, 2.4vw, 32px)', fontWeight: 950, fontStyle: 'italic', textTransform: 'uppercase', color: '#fff', marginBottom: 8, lineHeight: 1 }}>{t.regPreTitle}</div>
                <div style={{ fontSize: 'clamp(14px, 1.3vw, 17px)', color: 'rgba(255,255,255,.82)', lineHeight: 1.5, fontStyle: 'italic', fontWeight: 600 }}>{t.regPreText}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.15)', borderRadius: 16, padding: '22px 24px' }}>
                <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: 1.5, color: 'rgba(255,255,255,.6)', textTransform: 'uppercase', marginBottom: 8 }}>{t.regOpenTag}</div>
                <div style={{ fontSize: 'clamp(22px, 2.4vw, 32px)', fontWeight: 950, fontStyle: 'italic', textTransform: 'uppercase', color: '#fff', marginBottom: 8, lineHeight: 1 }}>{t.regOpenTitle}</div>
                <div style={{ fontSize: 'clamp(14px, 1.3vw, 17px)', color: 'rgba(255,255,255,.82)', lineHeight: 1.5, fontStyle: 'italic', fontWeight: 600 }}>{t.regOpenText}</div>
              </div>
            </div>
            <a href="/portal/times/cadastro" style={{ display: 'inline-block', padding: '16px 38px', borderRadius: 12, background: '#f4ff00', color: '#031020', fontWeight: 950, fontStyle: 'italic', fontSize: 'clamp(15px, 1.4vw, 18px)', letterSpacing: '.03em', textTransform: 'uppercase', textDecoration: 'none' }}>{t.regButton} →</a>
          </div>
        </section>

        <section id="about" className="aboutBlock">
          <div>
            <p className="miniTag">{t.aboutTag}</p>
            <h2>{t.aboutTitle}</h2>
            <p>{t.aboutText}</p>

            <Link href={`/clubes?lang=${lang}`} className="outlineBtn">
              {t.learnMore}
            </Link>
          </div>

        </section>

        <section id="info" className="infoGrid">
          {[
            [<CalendarDays key="1" />, t.date, t.dateValue, t.dateDesc],
            [<MapPin key="2" />, t.location, t.locationValue, t.locationDesc],
            [<Users key="3" />, t.categories, t.categoriesValue, t.categoriesDesc],
            [<Star key="4" />, t.expect, t.expectValue, t.expectDesc]
          ].map((card) => (
            <div className="infoCard" key={card[1]}>
              <div className="infoIcon">{card[0]}</div>
              <b>{card[1]}</b>
              <strong>{card[2]}</strong>
              <span>{card[3]}</span>
            </div>
          ))}
        </section>

        {/* ── LOCAL / VENUE ─────────────────────────────────────────── */}
        <section id="venue-local" style={{ maxWidth: 1180, margin: '0 auto', padding: '56px 24px 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', color: '#f4ff00', marginBottom: 10 }}>
              {lang === 'en' ? 'The Venue' : lang === 'es' ? 'La Sede' : 'O Local'}
            </div>
            <h2 style={{ fontSize: 'clamp(28px, 5vw, 46px)', fontWeight: 900, letterSpacing: -1.5, color: '#fff', margin: 0, lineHeight: 1.05 }}>
              {lang === 'en' ? 'WHERE THE CHAMPIONSHIP HAPPENS' : lang === 'es' ? 'DONDE SUCEDE EL CAMPEONATO' : 'ONDE O MUNDIAL ACONTECE'}
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,.65)', maxWidth: 640, margin: '14px auto 0', lineHeight: 1.6 }}>
              {lang === 'en'
                ? 'A complete sports complex in Leme, SP — flag football fields, leisure structure and full infrastructure for the world championship.'
                : lang === 'es'
                ? 'Un complejo deportivo completo en Leme, SP — campos de flag football, estructura de ocio e infraestructura completa para el mundial.'
                : 'Um complexo esportivo completo em Leme, SP — campos de flag football, estrutura de lazer e toda a infraestrutura para o mundial.'}
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {['/assets/local-1.jpg', '/assets/local-2.jpg', '/assets/local-3.jpg'].map((src, i) => (
              <div key={src} style={{ borderRadius: 18, overflow: 'hidden', border: '1px solid rgba(255,255,255,.12)', background: 'rgba(255,255,255,.04)', boxShadow: '0 20px 60px rgba(0,0,0,.4)', gridColumn: i === 0 ? '1 / -1' : 'auto' }}>
                <img src={src} alt="Local do evento" style={{ width: '100%', height: i === 0 ? 380 : 260, objectFit: 'cover', display: 'block' }} />
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <a href="https://maps.google.com/?q=Leme,SP,Brasil" target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 26px', borderRadius: 12, background: '#f4ff00', color: '#031020', fontSize: 13, fontWeight: 900, letterSpacing: 1, textTransform: 'uppercase', textDecoration: 'none' }}>
              🌍 {lang === 'en' ? 'View on Google Maps' : lang === 'es' ? 'Ver en Google Maps' : 'Ver no Google Maps'}
            </a>
          </div>
        </section>

        {/* ── ESTATÍSTICAS TEASER ───────────────────────────────────── */}
        <section id="stats-teaser" style={{ maxWidth: 1180, margin: '0 auto', padding: '40px 24px 24px' }}>
          <a href="/ranking" style={{ textDecoration: 'none', display: 'block' }}>
            <div style={{ borderRadius: 22, overflow: 'hidden', border: '1px solid rgba(244,255,0,.25)', background: 'linear-gradient(135deg, rgba(10,42,107,.6), rgba(4,16,39,.85))', padding: 'clamp(28px,5vw,44px)', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', gap: 24, alignItems: 'center', boxShadow: '0 20px 60px rgba(0,0,0,.4)' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', color: '#f4ff00', marginBottom: 10 }}>
                  {lang === 'en' ? 'Live Statistics' : lang === 'es' ? 'Estadísticas en Vivo' : 'Estatísticas ao Vivo'}
                </div>
                <h2 style={{ fontSize: 'clamp(24px,4vw,38px)', fontWeight: 900, letterSpacing: -1, color: '#fff', margin: 0, lineHeight: 1.08 }}>
                  {lang === 'en' ? 'FOLLOW EVERY SCORE, GAME BY GAME' : lang === 'es' ? 'SIGUE CADA PUNTUACIÓN, JUEGO A JUEGO' : 'ACOMPANHE CADA PONTUAÇÃO, JOGO A JOGO'}
                </h2>
                <p style={{ fontSize: 15, color: 'rgba(255,255,255,.7)', maxWidth: 620, margin: '12px 0 20px', lineHeight: 1.6 }}>
                  {lang === 'en'
                    ? 'Scorer rankings, touchdowns, conversions and defensive plays updated as the delegates confirm each game. See who is leading the championship.'
                    : lang === 'es'
                    ? 'Ranking de anotadores, touchdowns, conversiones y jugadas defensivas actualizados a medida que los delegados confirman cada juego. Mira quién lidera el campeonato.'
                    : 'Ranking de pontuadores, touchdowns, conversões e jogadas defensivas atualizados conforme os delegados confirmam cada jogo. Veja quem lidera o campeonato.'}
                </p>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 26px', borderRadius: 12, background: '#f4ff00', color: '#031020', fontSize: 13, fontWeight: 900, letterSpacing: 1, textTransform: 'uppercase' }}>
                  {lang === 'en' ? 'View statistics →' : lang === 'es' ? 'Ver estadísticas →' : 'Ver estatísticas →'}
                </span>
              </div>
              <div style={{ fontSize: 'clamp(56px,10vw,110px)', lineHeight: 1 }}>🏈</div>
            </div>
          </a>
        </section>

                <section id="partners" className="officialPartners">
          <div className="partnerGroups">
            <div className="partnerGroup">
              <span className="partnerGroupLabel">{t.partnerSponsor}</span>
              <div className="partnerGroupLogos">
                <Image src="/assets/underarmour-white.png" alt="Under Armour" width={140} height={70} />
                <Image src="/assets/blue-panda.png" alt="Blue Panda Travel" width={600} height={282} className="logoBluePanda" />
                <Image src="/assets/new-players.png" alt="New Players Sports" width={120} height={70} />
                <Image src="/assets/incentivou.png" alt="Incentivou" width={260} height={70} className="logoIncentivou" />
              </div>
            </div>

            <div className="partnerDivider" />

            <div className="partnerGroup">
              <span className="partnerGroupLabel">{t.partnerOrganizer}</span>
              <div className="partnerGroupLogos">
                <Image src="/assets/brasil-sports-business2.jpeg" alt="Brasil Sports Business" width={130} height={80} />
              </div>
            </div>

            <div className="partnerDivider" />

            <div className="partnerGroup">
              <span className="partnerGroupLabel">{t.partnerSupport}</span>
              <div className="partnerGroupLogos">
                <Image src="/assets/embaixada-eua.png" alt="U.S. Embassy" width={375} height={225} className="logoEmbaixada" />
              </div>
            </div>
          </div>
        </section>

        <section id="newsletter" className="newsletterBar">
  <div>
    <h2>{t.newsletterTitle}</h2>
    <p>{t.newsletterText}</p>
  </div>

  <NewsletterForm
    lang={lang}
    placeholder={t.emailPlaceholder}
    buttonText={t.subscribe}
  />
</section>

        <footer id="footer" className="premiumFooter">
          <Image src="/assets/bfwc-logo.jpg" alt="BFWC" width={80} height={80} />

          <p>{t.footerText}</p>

          <div>
            <b>{t.quickLinks}</b>
            <a href="#top">{t.home}</a>
            <a href="#team-registration">{t.registrations}</a>
            <a href="/jogos">{t.games}</a>
            <a href="/ranking">{t.ranking}</a>
            <a href="#venue-local">{t.venue}</a>
            <a href="#about">{t.about}</a>
            <Link href={`/clubes?lang=${lang}`}>{t.register}</Link>
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

            <a
              href="mailto:contato@brasilsportsbusiness.com"
              className="emailBtn"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
              E-mail
            </a>
          </div>
        </footer>
      </section>
    </main>
  );
}