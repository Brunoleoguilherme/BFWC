'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CalendarDays, MapPin, ArrowRight } from 'lucide-react';
import './site.css';
import { TopBanner, SiteHeader, NewsletterBar, SiteFooter, useSiteLang, REG_OPENS_AT } from './SiteChrome';
import {
  RegistrationSection,
  AboutSection,
  InfoSection,
  VenueSection,
  StatsTeaserSection,
  NewsSection,
  PartnersSection,
} from './sections';

export default function SitePage() {
  const { lang, changeLang, t } = useSiteLang();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [regOpen, setRegOpen] = useState(false);

  useEffect(() => {
    const check = () => setRegOpen(Date.now() >= REG_OPENS_AT);
    check();
    const iv = setInterval(check, 1000);
    return () => clearInterval(iv);
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

  return (
    <main className="siteShell">
      <TopBanner lang={lang} />
      <section className="mainSite">
        <SiteHeader lang={lang} changeLang={changeLang} t={t} />

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
                30 OUT – 02 NOV · 2026
              </span>

              <span>
                <MapPin size={19} />
                LEME, SP — BRASIL
              </span>
            </div>

            {regOpen ? (
              <Link href="/portal/times/cadastro" className="yellowBtn">
                {t.regButton}
                <ArrowRight size={18} />
              </Link>
            ) : (
              <div className="yellowBtn" style={{ cursor: 'default' }}>
                {lang === 'en' ? 'Registration opens TODAY at 10 AM (BRT)' : lang === 'es' ? 'Inscripciones abren HOY a las 10h' : 'Inscrições abrem HOJE às 10h'}
              </div>
            )}

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

        <RegistrationSection t={t} />
        <AboutSection t={t} lang={lang} />
        <InfoSection t={t} />
        <VenueSection lang={lang} />
        <StatsTeaserSection lang={lang} />
        <NewsSection lang={lang} />
        <PartnersSection t={t} />
        <NewsletterBar lang={lang} t={t} />
        <SiteFooter lang={lang} t={t} />
      </section>
    </main>
  );
}
