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
    expectDesc: 'cultura, praia e experiência',
    latestNews: 'ÚLTIMAS NOTÍCIAS',
    stayUpdated: 'FIQUE POR DENTRO',
    viewAll: 'VER TODAS',
    
    partnersTitle: 'PARCEIROS',
    partnerSponsor: 'PATROCINADOR',
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
    expectDesc: 'culture, beach and experience',
        stayUpdated: 'STAY UPDATED',
    viewAll: 'VIEW ALL',
        partnersTitle: 'PARTNERS',
    partnerSponsor: 'SPONSOR',
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
    expectDesc: 'cultura, playa y experiencia',
        stayUpdated: 'MANTENTE INFORMADO',
    viewAll: 'VER TODAS',
    
    partnersTitle: 'SOCIOS',
    partnerSponsor: 'PATROCINADOR',
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
    <form onSubmit={handleSubmit}>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={placeholder}
        type="email"
        required
      />

      <button type="submit" disabled={loading}>
        {loading ? 'Enviando...' : buttonText}
      </button>

      {success && (
        <span style={{ color: '#eaff00', marginLeft: 12, fontWeight: 800 }}>
          OK!
        </span>
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
          </div>

          <button className="mobileBtn" onClick={() => setMobile(!mobile)}>
            {mobile ? <X /> : <Menu />}
          </button>
        </header>

        {mobile && (
          <div className="mobileMenu">
            <a href="#top">{t.home}</a>
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
          <div className="heroRibbon" />

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

            <Link href={`/clubes?lang=${lang}`} className="yellowBtn">
              {t.register}
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

                <section id="partners" className="officialPartners">
          <div className="partnerGroups">
            <div className="partnerGroup">
              <span className="partnerGroupLabel">{t.partnerSponsor}</span>
              <div className="partnerGroupLogos">
                <Image src="/assets/underarmour-white.png" alt="Under Armour" width={130} height={80} />
                <Image src="/assets/blue-panda.png" alt="Blue Panda Travel" width={260} height={130} />
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
                <Image src="/assets/embaixada-eua.png" alt="U.S. Embassy" width={130} height={80} />
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
          </div>
        </footer>
      </section>
    </main>
  );
}