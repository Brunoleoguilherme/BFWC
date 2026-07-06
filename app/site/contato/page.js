'use client';

import { SitePageShell, PageHero } from '../SiteChrome';
import { ContactSection } from '../sections';

export default function ContatoPage() {
  return (
    <SitePageShell
      hero={({ lang, t }) => (
        <PageHero
          kicker="BFWC 2026"
          title={t.contact}
          subtitle={lang === 'en'
            ? 'Talk to the organization — we reply on WhatsApp and email.'
            : lang === 'es'
            ? 'Habla con la organización — respondemos por WhatsApp y correo.'
            : 'Fale com a organização — respondemos por WhatsApp e e-mail.'}
        />
      )}
    >
      {({ lang }) => <ContactSection lang={lang} />}
    </SitePageShell>
  );
}
