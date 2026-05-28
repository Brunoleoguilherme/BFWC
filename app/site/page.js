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

const langs = {
  pt: {
    home: 'HOME',
    about: 'SOBRE',
    info: 'INFORMAÇÕES',
    news: 'NOTÍCIAS',
    partners: 'PARCEIROS',
    contact: 'CONTATO',
    heroTitle: 'O MUNDO SE ENCONTRA NO BRASIL.',
    heroSub: 'Um jogo. Uma paixão.',
    register: 'CADASTRAR INTERESSE',
    aboutTag: 'SOBRE O EVENTO',
    aboutTitle: 'UM NOVO CAPÍTULO PARA O FLAG FOOTBALL.',
    aboutText:
      'O Brasil Flag World Championship 2026 conecta clubes, atletas, culturas e marcas em uma celebração global do esporte.',
    learnMore: 'SAIBA MAIS',
    date: 'DATA',
    dateValue: '28 de agosto de 2026',
    dateDesc: 'Abertura oficial',
    location: 'LOCAL',
    locationValue: 'Rio de Janeiro',
    locationDesc: 'Brasil',
    categories: 'CATEGORIAS',
    categoriesValue: 'Masculino • Feminino • Misto',
    categoriesDesc: 'Youth • Masters',
    expect: 'O QUE ESPERAR',
    expectValue: 'Jogos de alto nível',
    expectDesc: 'cultura, praia e experiência',
    latestNews: 'ÚLTIMAS NOTÍCIAS',
    stayUpdated: 'FIQUE POR DENTRO',
    viewAll: 'VER TODAS',
    newsItems: [
      ['ANÚNCIO', 'Under Armour é a patrocinadora oficial do Championship'],
      ['DESTINO', 'Rio de Janeiro será sede do Championship 2026'],
      ['GLOBAL', 'Países de todos os continentes já estão confirmados']
    ],
    partnersTitle: 'PARCEIROS',
    newsletterTitle: 'NÃO PERCA NENHUMA NOVIDADE!',
    newsletterText: 'Se inscreva para receber novidades sobre o campeonato.',
    emailPlaceholder: 'Seu e-mail',
    subscribe: 'SE INSCREVER',
    footerText:
      'O Brasil Flag World Championship conecta culturas, pessoas e paixão por meio do esporte.',
    quickLinks: 'LINKS RÁPIDOS',
    event: 'EVENTO',
    countdown: 'CONTAGEM REGRESSIVA PARA 28/08/2026',
    days: 'DIAS',
    hours: 'HORAS',
    minutes: 'MINUTOS',
    seconds: 'SEGUNDOS'
  },

  en: {
    home: 'HOME',
    about: 'ABOUT',
    info: 'INFO',
    news: 'NEWS',
    partners: 'PARTNERS',
    contact: 'CONTACT',
    heroTitle: 'THE WORLD MEETS IN BRAZIL.',
    heroSub: 'One game. One passion.',
    register: 'REGISTER YOUR INTEREST',
    aboutTag: 'ABOUT THE EVENT',
    aboutTitle: 'A NEW CHAPTER FOR FLAG FOOTBALL.',
    aboutText:
      'The Brazil Flag World Championship 2026 brings together clubs, athletes, cultures and brands in a global celebration of sport.',
    learnMore: 'LEARN MORE',
    date: 'DATE',
    dateValue: 'August 28, 2026',
    dateDesc: 'Official opening',
    location: 'LOCATION',
    locationValue: 'Rio de Janeiro',
    locationDesc: 'Brazil',
    categories: 'CATEGORIES',
    categoriesValue: 'Men • Women • Mixed',
    categoriesDesc: 'Youth • Masters',
    expect: 'WHAT TO EXPECT',
    expectValue: 'High level games',
    expectDesc: 'culture, beach and experience',
    latestNews: 'LATEST NEWS',
    stayUpdated: 'STAY UPDATED',
    viewAll: 'VIEW ALL',
    newsItems: [
      ['ANNOUNCEMENT', 'Under Armour is the official sponsor of the Championship'],
      ['DESTINATION', 'Rio de Janeiro will host the 2026 Championship'],
      ['GLOBAL', 'Countries from all continents are already confirmed']
    ],
    partnersTitle: 'PARTNERS',
    newsletterTitle: "DON'T MISS ANY NEWS!",
    newsletterText: 'Subscribe to receive updates about the championship.',
    emailPlaceholder: 'Your email',
    subscribe: 'SUBSCRIBE',
    footerText:
      'The Brazil Flag World Championship connects cultures, people and passion through sport.',
    quickLinks: 'QUICK LINKS',
    event: 'EVENT',
    countdown: 'COUNTDOWN TO 08/28/2026',
    days: 'DAYS',
    hours: 'HOURS',
    minutes: 'MINUTES',
    seconds: 'SECONDS'
  },

  es: {
    home: 'HOME',
    about: 'SOBRE',
    info: 'INFO',
    news: 'NOTICIAS',
    partners: 'SOCIOS',
    contact: 'CONTACTO',
    heroTitle: 'EL MUNDO SE ENCUENTRA EN BRASIL.',
    heroSub: 'Un juego. Una pasión.',
    register: 'REGISTRAR INTERÉS',
    aboutTag: 'SOBRE EL EVENTO',
    aboutTitle: 'UN NUEVO CAPÍTULO PARA EL FLAG FOOTBALL.',
    aboutText:
      'El Brazil Flag World Championship 2026 conecta clubes, atletas, culturas y marcas en una celebración global del deporte.',
    learnMore: 'SABER MÁS',
    date: 'FECHA',
    dateValue: '28 de agosto de 2026',
    dateDesc: 'Apertura oficial',
    location: 'UBICACIÓN',
    locationValue: 'Rio de Janeiro',
    locationDesc: 'Brasil',
    categories: 'CATEGORÍAS',
    categoriesValue: 'Masculino • Femenino • Mixto',
    categoriesDesc: 'Youth • Masters',
    expect: 'QUÉ ESPERAR',
    expectValue: 'Juegos de alto nivel',
    expectDesc: 'cultura, playa y experiencia',
    latestNews: 'ÚLTIMAS NOTICIAS',
    stayUpdated: 'MANTENTE INFORMADO',
    viewAll: 'VER TODAS',
    newsItems: [
      ['ANUNCIO', 'Under Armour es patrocinadora oficial del Championship'],
      ['DESTINO', 'Rio de Janeiro será sede del Championship 2026'],
      ['GLOBAL', 'Países de todos los continentes ya están confirmados']
    ],
    partnersTitle: 'SOCIOS',
    newsletterTitle: '¡NO TE PIERDAS NINGUNA NOTICIA!',
    newsletterText: 'Suscríbete para recibir novedades del campeonato.',
    emailPlaceholder: 'Tu e-mail',
    subscribe: 'SUSCRIBIRSE',
    footerText:
      'El Brazil Flag World Championship conecta culturas, personas y pasión a través del deporte.',
    quickLinks: 'ENLACES RÁPIDOS',
    event: 'EVENTO',
    countdown: 'CUENTA REGRESIVA PARA 28/08/2026',
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

    try {
      setLoading(true);

      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          language: lang,
          source_page: 'site'
        })
      });

      const data = await response.json();

      if (data.ok) {
        setSuccess(true);
        setEmail('');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
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
        {loading ? '...' : buttonText}
      </button>

      {success && (
        <span
          style={{
            color: '#d7ff00',
            marginLeft: 12,
            fontWeight: 600
          }}
        >
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
    const targetDate = new Date('2026-08-28T00:00:00-03:00');

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
            <Link href="/noticias">{t.news}</Link>
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
            <a href="#news">{t.news}</a>
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
            <h1>{t.heroTitle}</h1>
            <h2>{t.heroSub}</h2>

            <div className="heroMeta">
              <span>
                <CalendarDays size={19} />
                2026
              </span>

              <span>
                <MapPin size={19} />
                RIO DE JANEIRO, BRAZIL
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

          <div className="videoCard">
            <Image
              src="/assets/hero-rio-athletes.png"
              alt="Rio Experience"
              fill
            />
            <button>▶</button>
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

        <section id="news" className="newsBlock">
          <div className="sectionTitle">
            <div>
              <p className="miniTag">{t.latestNews}</p>
              <h2>{t.stayUpdated}</h2>
            </div>

            <Link href="/noticias">{t.viewAll}</Link>
          </div>

          <div className="newsGrid">
            {[
              [t.newsItems[0][0], t.newsItems[0][1], '/noticias/under-armour'],
              [t.newsItems[1][0], t.newsItems[1][1], '/noticias/rio-de-janeiro'],
              [t.newsItems[2][0], t.newsItems[2][1], '/noticias/paises-confirmados']
            ].map((item, index) => (
              <Link href={item[2]} className="newsCard" key={item[0]}>
                <Image
                  src={index === 1 ? '/assets/hero-rio-athletes.png' : '/assets/bfwc-logo.jpg'}
                  alt={item[1]}
                  fill
                />

                <div>
                  <span>{item[0]}</span>
                  <h3>{item[1]}</h3>
                  <p>18 de maio de 2026</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section id="partners" className="officialPartners">
          <p className="miniTag">{t.partnersTitle}</p>

          <div className="partnerLine">
            <Image src="/assets/underarmour-white.png" alt="Under Armour" width={130} height={80} />
            <Image src="/assets/brasil-sports-business2.jpeg" alt="Brasil Sports Business" width={130} height={80} />
            <Image src="/assets/blue-panda.png" alt="Blue Panda Travel" width={190} height={90} />
            <Image src="/assets/embaixada-eua.png" alt="U.S. Embassy" width={130} height={80} />
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
            <span>Rio de Janeiro, Brazil</span>
            <span>2026</span>
          </div>

          <div>
            <b>{t.contact}</b>
            <span>Partnerships</span>
            <span>Media</span>
            <span>Travel</span>
          </div>
        </footer>
      </section>
    </main>
  );
}