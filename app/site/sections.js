'use client';

import Image from 'next/image';
import Link from 'next/link';
import { CalendarDays, MapPin, Users, Star } from 'lucide-react';

/* Seções do site compartilhadas entre a home e as subpáginas das abas.
   Conteúdo idêntico ao da home — mesma fonte, sem duplicação. */

export function RegistrationSection({ t }) {
  return (
    <section id="team-registration" style={{ maxWidth: 1180, margin: '0 auto', padding: '48px 24px 20px' }}>
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
  );
}

export function AboutSection({ t, lang }) {
  return (
    <section id="about" className="aboutBlock">
      <div>
        <p className="miniTag">{t.aboutTag}</p>
        <h2>{t.aboutTitle}</h2>
        <p>{t.aboutText}</p>

        <Link href="/site/sobre" className="outlineBtn">
          {t.learnMore}
        </Link>
      </div>
    </section>
  );
}

export function InfoSection({ t }) {
  return (
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
  );
}

export function VenueSection({ lang }) {
  return (
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
  );
}

export function StatsTeaserSection({ lang }) {
  return (
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
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 26px', borderRadius: 12, background: '#f4ff00', color: '#031020', fontSize: 13, fontWeight: 900, letterSpacing: 1, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
              {lang === 'en' ? 'View statistics →' : lang === 'es' ? 'Ver estadísticas →' : 'Ver estatísticas →'}
            </span>
          </div>
          <div style={{ fontSize: 'clamp(56px,10vw,110px)', lineHeight: 1 }}>🏈</div>
        </div>
      </a>
    </section>
  );
}

export function NewsSection({ lang, showHeading = true }) {
  return (
    <section id="news" style={{ maxWidth: 1180, margin: '0 auto', padding: '40px 24px 24px' }}>
      {showHeading && (
        <>
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', color: '#f4ff00', marginBottom: 10 }}>
            {lang === 'en' ? 'News' : 'Notícias'}
          </div>
          <h2 style={{ fontSize: 'clamp(26px,4vw,38px)', fontWeight: 900, letterSpacing: -1, margin: '0 0 24px', color: '#fff' }}>
            {lang === 'en' ? 'Latest from the championship' : lang === 'es' ? 'Lo último del campeonato' : 'Últimas do campeonato'}
          </h2>
        </>
      )}
      <div style={{ display: 'grid', gap: 16 }}>
        {[
          {
            href: '/noticias/prefeitura-leme',
            badge: lang === 'en' ? 'Official support' : lang === 'es' ? 'Apoyo oficial' : 'Apoio oficial',
            title: lang === 'en'
              ? 'City of Leme is an official supporter of the Brasil Flag World Championship 2026'
              : lang === 'es'
              ? 'La Municipalidad de Leme es apoyadora oficial del Brasil Flag World Championship 2026'
              : 'Prefeitura de Leme é apoiadora oficial do Brasil Flag World Championship 2026',
            date: lang === 'en' ? 'July 6, 2026' : lang === 'es' ? '6 de julio de 2026' : '6 de julho de 2026',
            media: <img src="/assets/noticia-prefeitura-leme.png" alt="Prefeitura de Leme apoiadora oficial" style={{ width: 120, height: 140, objectFit: 'cover', objectPosition: 'top', borderRadius: 12, border: '1px solid rgba(255,255,255,.15)', background: '#fff' }} />,
          },
          {
            href: '/noticias/pre-inscricoes',
            badge: lang === 'en' ? 'Registration' : lang === 'es' ? 'Inscripciones' : 'Inscrições',
            title: lang === 'en'
              ? 'BFWC 2026 pre-registration enters its decisive hours'
              : lang === 'es'
              ? 'Las preinscripciones del BFWC 2026 entran en sus horas decisivas'
              : 'Pré-inscrições do BFWC 2026 entram em suas horas decisivas',
            date: lang === 'en' ? 'July 1, 2026' : lang === 'es' ? '1 de julio de 2026' : '1º de julho de 2026',
            media: <img src="/assets/local-2.jpg" alt="Campos do BFWC 2026" style={{ width: 120, height: 140, objectFit: 'cover', borderRadius: 12, border: '1px solid rgba(255,255,255,.15)' }} />,
          },
          {
            href: '/noticias/under-armour',
            badge: lang === 'en' ? 'Official announcement' : lang === 'es' ? 'Anuncio oficial' : 'Anúncio oficial',
            title: lang === 'en'
              ? 'Under Armour is the official sponsor of the Brasil Flag World Championship 2026'
              : lang === 'es'
              ? 'Under Armour es el patrocinador oficial del Brasil Flag World Championship 2026'
              : 'Under Armour é a patrocinadora oficial do Brasil Flag World Championship 2026',
            date: lang === 'en' ? 'May 18, 2026' : lang === 'es' ? '18 de mayo de 2026' : '18 de maio de 2026',
            media: <Image src="/assets/underarmour-white.png" alt="Under Armour" width={140} height={70} style={{ opacity: .9 }} />,
          },
        ].map((n) => (
          <a key={n.href} href={n.href} style={{ textDecoration: 'none', display: 'block' }}>
            <div className="newsTeaserCard" style={{ borderRadius: 22, overflow: 'hidden', border: '1px solid rgba(255,255,255,.12)', background: 'linear-gradient(135deg, rgba(10,42,107,.55), rgba(4,16,39,.85))', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', gap: 24, alignItems: 'center', padding: 'clamp(24px,4.5vw,40px)', boxShadow: '0 20px 60px rgba(0,0,0,.4)' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 10.5, fontWeight: 900, letterSpacing: 2, textTransform: 'uppercase', color: '#031020', background: '#f4ff00', padding: '5px 12px', borderRadius: 7, marginBottom: 14 }}>
                  {n.badge}
                </div>
                <div style={{ fontSize: 'clamp(18px,2.6vw,26px)', fontWeight: 900, letterSpacing: -0.6, color: '#fff', lineHeight: 1.25, marginBottom: 10 }}>
                  {n.title}
                </div>
                <div style={{ fontSize: 13, color: 'rgba(220,230,255,.55)', fontWeight: 600, marginBottom: 16 }}>
                  {n.date}
                </div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 900, letterSpacing: 1, textTransform: 'uppercase', color: '#f4ff00', whiteSpace: 'nowrap' }}>
                  {lang === 'en' ? 'Read more →' : lang === 'es' ? 'Leer más →' : 'Ler matéria →'}
                </span>
              </div>
              {n.media}
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

export function PartnersSection({ t }) {
  return (
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
            <div className="logoPrefeituraWrap">
              <Image src="/assets/prefeitura-leme.png" alt="Prefeitura de Leme" width={302} height={310} className="logoPrefeitura" />
              <span>Prefeitura de Leme</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* Bloco de contato para a página /site/contato (mesmos canais do rodapé) */
export function ContactSection({ lang }) {
  const cards = [
    {
      href: 'https://wa.me/5516997754522',
      label: 'WhatsApp',
      value: '+55 16 99775-4522',
      desc: lang === 'en' ? 'Fastest way to reach the organization' : lang === 'es' ? 'La forma más rápida de hablar con la organización' : 'O jeito mais rápido de falar com a organização',
      icon: '💬',
      accent: '#25d366',
    },
    {
      href: 'mailto:contato@brasilsportsbusiness.com',
      label: 'E-mail',
      value: 'contato@brasilsportsbusiness.com',
      desc: lang === 'en' ? 'For documents, partnerships and formal requests' : lang === 'es' ? 'Para documentos, alianzas y solicitudes formales' : 'Para documentos, parcerias e solicitações formais',
      icon: '✉️',
      accent: '#4d8aff',
    },
  ];

  return (
    <section id="contact" style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px 24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {cards.map((c) => (
          <a key={c.label} href={c.href} target={c.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block', background: 'rgba(255,255,255,.04)', border: `1px solid ${c.accent}40`, borderRadius: 20, padding: '28px 26px', boxShadow: '0 20px 60px rgba(0,0,0,.35)' }}>
            <div style={{ fontSize: 34, marginBottom: 12 }}>{c.icon}</div>
            <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: 2, textTransform: 'uppercase', color: c.accent, marginBottom: 6 }}>{c.label}</div>
            <div style={{ fontSize: 'clamp(15px,1.8vw,19px)', fontWeight: 800, color: '#fff', marginBottom: 8, overflowWrap: 'anywhere' }}>{c.value}</div>
            <div style={{ fontSize: 13.5, color: 'rgba(220,230,255,.6)', lineHeight: 1.55 }}>{c.desc}</div>
          </a>
        ))}
      </div>
      <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13.5, color: 'rgba(220,230,255,.55)', lineHeight: 1.6 }}>
        {lang === 'en' ? 'Event: Leme, SP — Brazil · October 31, 2026' : lang === 'es' ? 'Evento: Leme, SP — Brasil · 31 de octubre de 2026' : 'Evento: Leme, SP — Brasil · 31 de outubro de 2026'}
      </div>
    </section>
  );
}
