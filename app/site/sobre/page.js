'use client';

import { SitePageShell, PageHero } from '../SiteChrome';
import { AboutSection, InfoSection, PartnersSection } from '../sections';

export default function SobrePage() {
  return (
    <SitePageShell
      hero={({ t }) => (
        <PageHero
          kicker={t.aboutTag}
          title={t.about}
        />
      )}
    >
      {({ lang, t }) => (
        <>
          <AboutSection t={t} lang={lang} />
          <InfoSection t={t} />
          <PartnersSection t={t} />
        </>
      )}
    </SitePageShell>
  );
}
