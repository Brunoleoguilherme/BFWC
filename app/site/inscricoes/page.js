'use client';

import { SitePageShell, PageHero } from '../SiteChrome';
import { RegistrationSection } from '../sections';

export default function InscricoesPage() {
  return (
    <SitePageShell
      hero={({ lang, t }) => (
        <PageHero
          kicker="BFWC 2026"
          title={t.registrations}
          subtitle={lang === 'en'
            ? 'Everything your team needs to secure a spot in the championship.'
            : lang === 'es'
            ? 'Todo lo que tu equipo necesita para asegurar su cupo en el campeonato.'
            : 'Tudo o que sua equipe precisa para garantir a vaga no campeonato.'}
        />
      )}
    >
      {({ t }) => <RegistrationSection t={t} />}
    </SitePageShell>
  );
}
