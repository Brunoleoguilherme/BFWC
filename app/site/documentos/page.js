'use client';

import { SitePageShell, PageHero } from '../SiteChrome';

const COPY = {
  pt: {
    kicker: 'Documentos oficiais',
    title: 'DOCUMENTOS',
    intro: 'Documentos que regem a inscrição e a participação no Brasil Flag World Championship 2026. A versão em português é a oficial para fins jurídicos.',
    soon: 'Em breve',
    ethicsChannel: 'Canal de ética e denúncias',
    ethicsText: 'Para comunicar violações ao Código de Ética, irregularidades ou qualquer situação que comprometa a integridade do campeonato, escreva para',
    ethicsNote: 'Toda comunicação de boa-fé é tratada com confidencialidade, sem retaliação ao comunicante.',
    docs: [
      { file: 'termo-adesao-times-bfwc2026-pt.pdf', title: 'Termo de Adesão às Condições Gerais de Inscrição e Participação', desc: 'Condições gerais aplicáveis às equipes: inscrição, responsabilidades financeiras, documentação, imagem e cancelamento.' },
      { file: 'codigo-de-etica-bfwc2026-pt.pdf', title: 'Código de Ética, Integridade e Conduta', desc: 'Princípios, padrões de conduta, integridade esportiva, proteção de crianças e adolescentes e medidas disciplinares.' },
      { file: 'anexo-i-termo-atleta-bfwc2026-pt.pdf', title: 'Anexo I — Termo de Adesão, Responsabilidade e Participação (Atleta)', desc: 'Termo individual do atleta maior de idade: saúde, riscos, imagem, dados pessoais e adesão às normas.' },
      { file: 'anexo-ii-termo-atleta-menor-bfwc2026-pt.pdf', title: 'Anexo II — Termo de Adesão, Responsabilidade e Participação (Atleta Menor de Idade)', desc: 'Termo assinado pelo pai, mãe ou responsável legal do atleta menor de 18 anos. Obrigatório para categorias Sub-15 e Sub-12.' },
      { file: 'regulamento-oficial-bfwc2026-pt.pdf', title: 'Regulamento Oficial da Competição', desc: 'Regras da competição: inscrições, elenco, sistema de disputa, critérios de desempate, WO, uniformes, equipamentos, arbitragem e disciplina.' },
      { file: 'politica-de-privacidade-bfwc2026-pt.pdf', title: 'Política de Privacidade e Proteção de Dados Pessoais', desc: 'Como tratamos os dados pessoais de atletas, equipes e participantes, em conformidade com a LGPD: coleta, finalidades, compartilhamento, direitos dos titulares e segurança.' },
      { file: 'Guia-de-Inscricao-dos-Times-BFWC2026-PT.pdf', title: 'Guia de Inscrição dos Times', desc: 'Passo a passo completo do processo de inscrição no portal: cadastro, aprovação, pagamento e inscrição de atletas.' },
      { file: 'Guia-Ilustrado-Inscricao-Times-BFWC2026-PT.pdf', title: 'Guia Ilustrado de Inscrição (com capturas de tela)', desc: 'A mesma jornada de inscrição, tela a tela, com imagens de cada etapa do portal.' },
      { file: 'Guia-de-Inscricao-dos-Atletas-BFWC2026-PT.pdf', title: 'Guia de Inscrição dos Atletas', desc: 'Passo a passo para o atleta: convite do time, criação da conta, confirmação de e-mail, login e envio dos documentos (e autorização do responsável, para menores de 18).' },
      { file: 'Guia-Ilustrado-Inscricao-Atletas-BFWC2026-PT.pdf', title: 'Guia Ilustrado de Inscrição dos Atletas (com capturas de tela)', desc: 'A mesma jornada do atleta, tela a tela, com imagens de cada etapa do portal.' },
    ],
    pending: [],
    open: 'Abrir PDF →',
  },
  en: {
    kicker: 'Official documents',
    title: 'DOCUMENTS',
    intro: 'Documents governing registration and participation in the Brasil Flag World Championship 2026. The Portuguese version is the official one for legal purposes.',
    soon: 'Coming soon',
    ethicsChannel: 'Ethics and reporting channel',
    ethicsText: 'To report violations of the Code of Ethics, irregularities or any situation compromising the integrity of the championship, write to',
    ethicsNote: 'All good-faith reports are treated confidentially, with no retaliation against the reporter.',
    docs: [
      { file: 'termo-adesao-times-bfwc2026-pt.pdf', title: 'Adhesion Term — General Registration and Participation Conditions', desc: 'General conditions for teams: registration, financial responsibilities, documentation, image rights and cancellation.' },
      { file: 'codigo-de-etica-bfwc2026-pt.pdf', title: 'Code of Ethics, Integrity and Conduct', desc: 'Principles, standards of conduct, sports integrity, safeguarding of children and adolescents, and disciplinary measures.' },
      { file: 'anexo-i-termo-atleta-bfwc2026-pt.pdf', title: 'Annex I — Adhesion, Responsibility and Participation Term (Athlete)', desc: 'Individual term for adult athletes: health, risks, image, personal data and adherence to the rules.' },
      { file: 'anexo-ii-termo-atleta-menor-bfwc2026-pt.pdf', title: 'Annex II — Adhesion, Responsibility and Participation Term (Underage Athlete)', desc: 'Term signed by the parent or legal guardian of athletes under 18. Mandatory for U-15 and U-12 categories.' },
      { file: 'regulamento-oficial-bfwc2026-pt.pdf', title: 'Official Competition Regulations', desc: 'Competition rules: registration, rosters, competition system, tiebreakers, forfeits, uniforms, equipment, officiating and discipline.' },
      { file: 'politica-de-privacidade-bfwc2026-pt.pdf', title: 'Privacy and Data Protection Policy', desc: 'How we process personal data of athletes, teams and participants, in compliance with the Brazilian LGPD: collection, purposes, sharing, data subject rights and security.' },
      { file: 'Team-Registration-Guide-BFWC2026-EN.pdf', title: 'Team Registration Guide', desc: 'Complete step-by-step of the registration process on the portal: sign-up, approval, payment and athlete registration.' },
      { file: 'Illustrated-Team-Registration-Guide-BFWC2026-EN.pdf', title: 'Illustrated Registration Guide (with screenshots)', desc: 'The same registration journey, screen by screen, with images of each step of the portal.' },
      { file: 'Athlete-Registration-Guide-BFWC2026-EN.pdf', title: 'Athlete Registration Guide', desc: 'Step by step for the athlete: team invite, account creation, e-mail verification, login and document upload (and guardian authorization for minors).' },
      { file: 'Illustrated-Athlete-Registration-Guide-BFWC2026-EN.pdf', title: 'Illustrated Athlete Registration Guide (with screenshots)', desc: 'The same athlete journey, screen by screen, with images of each step of the portal.' },
    ],
    pending: [],
    open: 'Open PDF →',
  },
  es: {
    kicker: 'Documentos oficiales',
    title: 'DOCUMENTOS',
    intro: 'Documentos que rigen la inscripción y la participación en el Brasil Flag World Championship 2026. La versión en portugués es la oficial para fines legales.',
    soon: 'Próximamente',
    ethicsChannel: 'Canal de ética y denuncias',
    ethicsText: 'Para comunicar violaciones al Código de Ética, irregularidades o cualquier situación que comprometa la integridad del campeonato, escribe a',
    ethicsNote: 'Toda comunicación de buena fe se trata con confidencialidad, sin represalias contra el comunicante.',
    docs: [
      { file: 'termo-adesao-times-bfwc2026-pt.pdf', title: 'Término de Adhesión — Condiciones Generales de Inscripción y Participación', desc: 'Condiciones generales para los equipos: inscripción, responsabilidades financieras, documentación, imagen y cancelación.' },
      { file: 'codigo-de-etica-bfwc2026-pt.pdf', title: 'Código de Ética, Integridad y Conducta', desc: 'Principios, estándares de conducta, integridad deportiva, protección de niños y adolescentes y medidas disciplinarias.' },
      { file: 'anexo-i-termo-atleta-bfwc2026-pt.pdf', title: 'Anexo I — Término de Adhesión, Responsabilidad y Participación (Atleta)', desc: 'Término individual del atleta mayor de edad: salud, riesgos, imagen, datos personales y adhesión a las normas.' },
      { file: 'anexo-ii-termo-atleta-menor-bfwc2026-pt.pdf', title: 'Anexo II — Término de Adhesión, Responsabilidad y Participación (Atleta Menor de Edad)', desc: 'Término firmado por el padre, madre o responsable legal del atleta menor de 18 años. Obligatorio para Sub-15 y Sub-12.' },
      { file: 'regulamento-oficial-bfwc2026-pt.pdf', title: 'Reglamento Oficial de la Competición', desc: 'Reglas de la competición: inscripciones, plantillas, sistema de disputa, criterios de desempate, WO, uniformes, equipamiento, arbitraje y disciplina.' },
      { file: 'politica-de-privacidade-bfwc2026-pt.pdf', title: 'Política de Privacidad y Protección de Datos Personales', desc: 'Cómo tratamos los datos personales de atletas, equipos y participantes, en conformidad con la LGPD brasileña: recolección, finalidades, compartición, derechos de los titulares y seguridad.' },
      { file: 'Guia-de-Inscripcion-de-Equipos-BFWC2026-ES.pdf', title: 'Guía de Inscripción de Equipos', desc: 'Paso a paso completo del proceso de inscripción en el portal: registro, aprobación, pago e inscripción de atletas.' },
      { file: 'Guia-Ilustrada-Inscripcion-Equipos-BFWC2026-ES.pdf', title: 'Guía Ilustrada de Inscripción (con capturas de pantalla)', desc: 'El mismo recorrido de inscripción, pantalla por pantalla, con imágenes de cada etapa del portal.' },
      { file: 'Guia-de-Inscripcion-de-Atletas-BFWC2026-ES.pdf', title: 'Guía de Inscripción de Atletas', desc: 'Paso a paso para el atleta: invitación del equipo, creación de la cuenta, confirmación de correo, inicio de sesión y envío de documentos (y autorización del responsable para menores).' },
      { file: 'Guia-Ilustrada-Inscripcion-Atletas-BFWC2026-ES.pdf', title: 'Guía Ilustrada de Inscripción de Atletas (con capturas de pantalla)', desc: 'El mismo recorrido del atleta, pantalla por pantalla, con imágenes de cada etapa del portal.' },
    ],
    pending: [],
    open: 'Abrir PDF →',
  },
};

export default function DocumentosPage() {
  return (
    <SitePageShell
      hero={({ lang }) => {
        const c = COPY[lang] || COPY.pt;
        return <PageHero kicker={c.kicker} title={c.title} subtitle={c.intro} />;
      }}
    >
      {({ lang }) => {
        const c = COPY[lang] || COPY.pt;
        return (
          <section style={{ padding: '48px var(--band) 72px', background: '#031020' }}>
            <div style={{ maxWidth: 1132, margin: '0 auto' }}>
              <div style={{ display: 'grid', gap: 14 }}>
                {c.docs.map(d => (
                  <a key={d.file} href={`/docs/${d.file}`} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16, padding: '22px 24px', borderRadius: 14, border: '1px solid rgba(255,255,255,.12)', background: 'rgba(255,255,255,.04)', textDecoration: 'none', transition: 'border-color .2s' }}>
                    <span style={{ fontSize: 28, flexShrink: 0 }}>📄</span>
                    <span style={{ flex: 1, minWidth: 240 }}>
                      <span style={{ display: 'block', fontSize: 16, fontWeight: 900, color: '#fff', lineHeight: 1.3 }}>{d.title}</span>
                      <span style={{ display: 'block', fontSize: 13, color: 'rgba(220,230,255,.65)', marginTop: 6, lineHeight: 1.55 }}>{d.desc}</span>
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 900, color: '#f4ff00', whiteSpace: 'nowrap' }}>{c.open}</span>
                  </a>
                ))}

                {c.pending.map(d => (
                  <div key={d.title} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16, padding: '22px 24px', borderRadius: 14, border: '1px dashed rgba(255,255,255,.15)', background: 'rgba(255,255,255,.02)' }}>
                    <span style={{ fontSize: 28, flexShrink: 0, opacity: .5 }}>📄</span>
                    <span style={{ flex: 1, minWidth: 240 }}>
                      <span style={{ display: 'block', fontSize: 16, fontWeight: 900, color: 'rgba(255,255,255,.5)', lineHeight: 1.3 }}>{d.title}</span>
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(244,255,0,.55)', whiteSpace: 'nowrap' }}>{c.soon}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 36, padding: '24px 26px', borderRadius: 14, border: '1px solid rgba(244,255,0,.25)', background: 'rgba(244,255,0,.05)' }}>
                <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: 2, textTransform: 'uppercase', color: '#f4ff00', marginBottom: 10 }}>🛡️ {c.ethicsChannel}</div>
                <p style={{ margin: 0, fontSize: 14, color: 'rgba(220,230,255,.85)', lineHeight: 1.65 }}>
                  {c.ethicsText} <a href="mailto:contato@brasilflag.com" style={{ color: '#f4ff00', fontWeight: 800, textDecoration: 'none' }}>contato@brasilflag.com</a>.
                </p>
                <p style={{ margin: '8px 0 0', fontSize: 12.5, color: 'rgba(220,230,255,.55)', lineHeight: 1.6 }}>{c.ethicsNote}</p>
              </div>
            </div>
          </section>
        );
      }}
    </SitePageShell>
  );
}
