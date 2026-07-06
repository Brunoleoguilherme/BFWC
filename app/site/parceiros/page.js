'use client';

import { SitePageShell, PageHero } from '../SiteChrome';
import { PartnersSection } from '../sections';

export default function ParceirosPage() {
  return (
    <SitePageShell
      hero={({ lang, t }) => (
        <PageHero
          kicker="BFWC 2026"
          title={t.partnersTitle}
          subtitle={lang === 'en'
            ? 'The brands and institutions that make the championship possible.'
            : lang === 'es'
            ? 'Las marcas e instituciones que hacen posible el campeonato.'
            : 'As marcas e instituições que tornam o campeonato possível.'}
        />
      )}
    >
      {({ t }) => <PartnersSection t={t} />}
    </SitePageShell>
  );
}
