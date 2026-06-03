'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import './page.css';

const languages = [
  {
    code: 'pt',
    flag: '/assets/flag-br.png',
    short: 'BR',
    title: 'Entrar em Português',
    subtitle: 'Brasil Flag World Championship 2026'
  },
  {
    code: 'en',
    flag: '/assets/flag-us.png',
    short: 'US',
    title: 'Enter in English',
    subtitle: 'Brazil Flag World Championship 2026'
  },
  {
    code: 'es',
    flag: '/assets/flag-es.png',
    short: 'ES',
    title: 'Entrar en Español',
    subtitle: 'Brasil Flag World Championship 2026'
  }
];

export default function LanguagePage() {
  function saveLanguage(lang) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('bfwc_language', lang);
    }
  }

  return (
    <main className="languageLanding">
      {/* BACKGROUND */}
      <div
        className="languageBg"
        style={{
          backgroundImage: "url('/assets/hero-rio-athletes.png')"
        }}
      />

      {/* OVERLAY */}
      <div className="languageOverlay" />

      {/* CARD */}
      <section className="languageCard">
        <Image
          src="/assets/bfwc-logo.jpg"
          alt="Brasil Flag World Championship"
          width={150}
          height={150}
          priority
          className="languageLogo"
        />

        <h1>
          Brasil Flag World
          <br />
          Championship 2026
        </h1>

        <p>
          Selecione o idioma para acessar o site oficial do campeonato.
        </p>

        <div className="languageOptions">
          {languages.map((item) => (
            <Link
              key={item.code}
              href={`/site?lang=${item.code}`}
              className="languageOption"
              onClick={() => saveLanguage(item.code)}
            >
              <div className="languageLeft">
                {/* FLAG */}
                <div className="languageFlagIcon">
                  <Image
                    src={item.flag}
                    alt={item.short}
                    width={54}
                    height={54}
                    className="flagImage"
                  />
                </div>

                {/* TEXTS */}
                <div className="languageTexts">
                  <small>{item.short}</small>

                  <strong>
                    {item.title}
                  </strong>

                  <span>
                    {item.subtitle}
                  </span>
                </div>
              </div>

              <ArrowRight size={24} />
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}