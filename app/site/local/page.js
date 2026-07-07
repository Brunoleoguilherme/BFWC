'use client';

import { SitePageShell, PageHero } from '../SiteChrome';
import { VenueSection, InfoSection } from '../sections';

export default function LocalPage() {
  return (
    <SitePageShell
      hero={({ lang }) => (
        <PageHero
          kicker="BFWC 2026"
          title={lang === 'en' ? 'THE VENUE' : lang === 'es' ? 'LA SEDE' : 'O LOCAL'}
          subtitle={lang === 'en'
            ? 'A complete sports complex in Leme, SP — flag football fields, leisure structure and full infrastructure.'
            : lang === 'es'
            ? 'Un complejo deportivo completo en Leme, SP — campos, estructura de ocio e infraestructura completa.'
            : 'Um complexo esportivo completo em Leme, SP — campos, estrutura de lazer e infraestrutura completa.'}
        />
      )}
    >
      {({ lang, t }) => (
        <>
          <VenueSection lang={lang} />
          <InfoSection t={t} />
        </>
      )}
    </SitePageShell>
  );
}
