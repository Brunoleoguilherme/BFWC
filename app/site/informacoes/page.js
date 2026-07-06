'use client';

import { SitePageShell, PageHero } from '../SiteChrome';
import { InfoSection, VenueSection, StatsTeaserSection } from '../sections';

export default function InformacoesPage() {
  return (
    <SitePageShell
      hero={({ lang, t }) => (
        <PageHero
          kicker="BFWC 2026"
          title={t.info}
          subtitle={lang === 'en'
            ? 'Dates, venue, categories and what to expect from the championship.'
            : lang === 'es'
            ? 'Fechas, sede, categorías y qué esperar del campeonato.'
            : 'Datas, local, categorias e o que esperar do campeonato.'}
        />
      )}
    >
      {({ lang, t }) => (
        <>
          <InfoSection t={t} />
          <VenueSection lang={lang} />
          <StatsTeaserSection lang={lang} />
        </>
      )}
    </SitePageShell>
  );
}
