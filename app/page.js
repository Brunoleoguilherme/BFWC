'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import {
  Globe2, CalendarDays, MapPin, Users, Star, Trophy,
  Mail, Plane, Newspaper, Menu, X, ArrowRight, CheckCircle2
} from 'lucide-react';

const langs = {
  pt: {
    home: 'HOME',
    about: 'SOBRE O EVENTO',
    info: 'INFORMAÇÕES',
    countries: 'PAÍSES & ATLETAS',
    news: 'NOTÍCIAS',
    partners: 'PARCEIROS',
    contact: 'CONTATO',
    newsletter: 'NEWSLETTER',
    heroTitle: 'O MUNDO SE ENCONTRA NO BRASIL.',
    heroSub: 'Um jogo. Uma paixão.',
    register: 'CADASTRAR INTERESSE',
    aboutTitle: 'UM NOVO CAPÍTULO PARA O FLAG FOOTBALL.',
    aboutText: 'O Brasil Flag World Championship 2026 conecta clubes, atletas, culturas e marcas em uma celebração global do esporte.',
    oneWorld: 'UM MUNDO. UMA CAMISA.',
    newsletterTitle: 'NÃO PERCA NENHUMA NOVIDADE!'
  },
  en: {
    home: 'HOME',
    about: 'ABOUT',
    info: 'INFO',
    countries: 'COUNTRIES',
    news: 'NEWS',
    partners: 'PARTNERS',
    contact: 'CONTACT',
    newsletter: 'NEWSLETTER',
    heroTitle: 'THE WORLD MEETS IN BRAZIL.',
    heroSub: 'One game. One passion.',
    register: 'REGISTER YOUR INTEREST',
    aboutTitle: 'A NEW CHAPTER FOR FLAG FOOTBALL.',
    aboutText: 'The Brazil Flag World Championship 2026 brings together clubs, athletes, cultures and brands in a global celebration of sport.',
    oneWorld: 'ONE WORLD. ONE JERSEY.',
    newsletterTitle: "DON'T MISS ANY NEWS!"
  },
  es: {
    home: 'HOME',
    about: 'SOBRE',
    info: 'INFO',
    countries: 'PAÍSES',
    news: 'NOTICIAS',
    partners: 'SOCIOS',
    contact: 'CONTACTO',
    newsletter: 'NEWSLETTER',
    heroTitle: 'EL MUNDO SE ENCUENTRA EN BRASIL.',
    heroSub: 'Un juego. Una pasión.',
    register: 'REGISTRAR INTERÉS',
    aboutTitle: 'UN NUEVO CAPÍTULO PARA EL FLAG FOOTBALL.',
    aboutText: 'El Brazil Flag World Championship 2026 conecta clubes, atletas, culturas y marcas en una celebración global del deporte.',
    oneWorld: 'UN MUNDO. UNA CAMISETA.',
    newsletterTitle: '¡NO TE PIERDAS NINGUNA NOTICIA!'
  }
};

export default function Home() {
  const [lang, setLang] = useState('pt');
  const [mobile, setMobile] = useState(false);
  const t = langs[lang];
  const targetDate = new Date('2026-08-28T00:00:00-03:00');

const [timeLeft, setTimeLeft] = useState({
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0
});

useState(() => {
  const timer = setInterval(() => {
    const now = new Date();
    const diff = targetDate - now;

    if (diff <= 0) return;

    setTimeLeft({
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60)
    });
  }, 1000);

  return () => clearInterval(timer);
});

  const menu = [
    ['01', t.home, 'Hero impactante com chamada principal e contagem regressiva.', '#top'],
    ['02', t.about, 'Apresentação do campeonato, propósito e impacto global.', '#about'],
    ['03', t.info, 'Data, local, categorias e o que esperar.', '#info'],
    ['04', t.countries, 'Conectando o mundo através do Flag Football.', '#countries'],
    ['05', t.news, 'Últimas novidades e atualizações.', '#news'],
    ['06', t.partners, 'Marcas e apoiadores que acreditam no evento.', '#partners'],
    ['07', t.contact, 'Fale conosco, patrocínios e imprensa.', '#contact'],
    ['08', t.newsletter, 'Inscrição para receber novidades por e-mail.', '#newsletter'],
    ['09', 'FOOTER', 'Links rápidos, redes sociais e informações institucionais.', '#footer']
  ];

  return (
    <main className="siteShell">
      
      <section className="mainSite">
        <header className="premiumTop">
          <Image src="/assets/bfwc-logo.jpg" alt="BFWC" width={86} height={86} />

          <nav>
            <a href="#top">{t.home}</a>
            <a href="#about">{t.about}</a>
            <a href="#info">{t.info}</a>
            <Link href="/noticias">{t.news}</Link>
            <a href="#partners">{t.partners}</a>
            <a href="#contact">{t.contact}</a>
          </nav>

          <div className="langSelect">
            <Globe2 size={16} />
            {['pt', 'en', 'es'].map((l) => (
              <button key={l} onClick={() => setLang(l)} className={lang === l ? 'on' : ''}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>

          <button className="mobileBtn" onClick={() => setMobile(!mobile)}>
            {mobile ? <X /> : <Menu />}
          </button>
        </header>

        {mobile && (
          <div className="mobileMenu">
            {menu.slice(0, 7).map((item) => <a href={item[3]} key={item[0]}>{item[1]}</a>)}
          </div>
        )}

        <section id="top" className="cinemaHero">
          <Image src="/assets/hero-rio-athletes.png" alt="Rio de Janeiro e atletas de Flag Football" fill priority className="heroPhoto" />

          <div className="heroDark" />
          <div className="heroRibbon" />

          <div className="heroInner">
            <h1>{t.heroTitle}</h1>
            <h2>{t.heroSub}</h2>

            <div className="heroMeta">
              <span><CalendarDays size={19} />2026</span>
              <span><MapPin size={19} />RIO DE JANEIRO, BRAZIL</span>
            </div>

            <Link href="/clubes" className="yellowBtn">
              {t.register}
              <ArrowRight size={18} />
            </Link>

            <div className="countdown">
  <p>COUNTDOWN TO 28/08/2026</p>

  <div>
    <strong>{timeLeft.days}</strong>
    <span>DAYS</span>
  </div>

  <div>
    <strong>{timeLeft.hours}</strong>
    <span>HOURS</span>
  </div>

  <div>
    <strong>{timeLeft.minutes}</strong>
    <span>MINUTES</span>
  </div>

  <div>
    <strong>{timeLeft.seconds}</strong>
    <span>SECONDS</span>
  </div>
</div>
          </div>
        </section>

        <section id="about" className="aboutBlock">
          <div>
            <p className="miniTag">SOBRE O EVENTO</p>
            <h2>{t.aboutTitle}</h2>
            <p>{t.aboutText}</p>
            <Link href="/clubes" className="outlineBtn">SAIBA MAIS</Link>
          </div>

          <div className="videoCard">
            <Image src="/assets/hero-rio-athletes.png" alt="Rio Experience" fill />
            <button>▶</button>
          </div>
        </section>

        <section id="info" className="infoGrid">
  {[
    [<CalendarDays key="1" />, 'DATA', '28 de agosto de 2026', 'Abertura oficial'],
    [<MapPin key="2" />, 'LOCAL', 'Rio de Janeiro', 'Brasil'],
    [<Users key="3" />, 'CATEGORIAS', 'Masculino • Feminino • Misto', 'Youth • Masters'],
    [<Star key="4" />, 'O QUE ESPERAR', 'Jogos de alto nível', 'cultura, praia e experiência']
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
      <p className="miniTag">ÚLTIMAS NOTÍCIAS</p>
      <h2>FIQUE POR DENTRO</h2>
    </div>

    <Link href="/noticias">VER TODAS</Link>
  </div>

  <div className="newsGrid">
    {[
      ['ANÚNCIO', 'Under Armour é a patrocinadora oficial do Championship', '/noticias/under-armour'],
      ['DESTINO', 'Rio de Janeiro será sede do Championship 2026', '/noticias/rio-de-janeiro'],
      ['GLOBAL', 'Países de todos os continentes já estão confirmados', '/noticias/paises-confirmados']
    ].map((n, i) => (
      <Link href={n[2]} className="newsCard" key={n[0]}>
        <Image
          src={i === 1 ? '/assets/hero-rio-athletes.png' : '/assets/bfwc-logo.jpg'}
          alt={n[1]}
          fill
        />

        <div>
          <span>{n[0]}</span>
          <h3>{n[1]}</h3>
          <p>18 de maio de 2026</p>
        </div>
      </Link>
    ))}
  </div>
</section>

        <section id="partners" className="officialPartners">
          <p className="miniTag">PARCEIROS</p>
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
            <p>Se inscreva para receber novidades sobre o campeonato.</p>
          </div>
          <form>
            <input placeholder="Your email" />
            <button>SE INSCREVER</button>
          </form>
        </section>

        <footer id="footer" className="premiumFooter">
          <Image src="/assets/bfwc-logo.jpg" alt="BFWC" width={80} height={80} />
          <p>The Brazil Flag World Championship connects cultures, people and passion through sport.</p>

          <div>
            <b>QUICK LINKS</b>
            <a href="#top">Home</a>
            <a href="#about">About</a>
            <a href="/clubes">Club Interest</a>
          </div>

          <div>
            <b>EVENT</b>
            <span>Rio de Janeiro, Brazil</span>
            <span>2026</span>
          </div>

          <div>
            <b>CONTACT</b>
            <span>Partnerships</span>
            <span>Media</span>
            <span>Travel</span>
          </div>
        </footer>
      </section>
    </main>
  );
}