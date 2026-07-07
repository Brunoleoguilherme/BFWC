'use client';

import { SitePageShell, PageHero } from '../SiteChrome';
import { NewsSection } from '../sections';

export default function NoticiasPage() {
  return (
    <SitePageShell
      hero={({ lang, t }) => (
        <PageHero
          kicker="BFWC 2026"
          title={t.news}
          subtitle={lang === 'en'
            ? 'Official announcements and the latest from the championship.'
            : lang === 'es'
            ? 'Anuncios oficiales y lo último del campeonato.'
            : 'Anúncios oficiais e as últimas do campeonato.'}
        />
      )}
    >
      {({ lang }) => <NewsSection lang={lang} showHeading={false} />}
    </SitePageShell>
  );
}
