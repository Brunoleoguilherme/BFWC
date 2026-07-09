'use client';

import './clubes.css';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Trophy,
  Plane,
  Users
} from 'lucide-react';

const categoriesMap = {
  pt: ['Masculino', 'Feminino', 'Sub 15 (misto)', 'Sub 12 (misto)'],
  en: ['Men', 'Women', 'U15 Mixed', 'U12 Mixed'],
  es: ['Masculino', 'Femenino', 'Sub 15 (mixto)', 'Sub 12 (mixto)']
};

const prioritiesMap = {
  pt: [
    'Nível técnico da arbitragem',
    'Qualidade do gramado/estrutura das quadras',
    'Troféus e medalhas de alto padrão',
    'Transmissão ao vivo dos jogos',
    'Festas oficiais / Eventos de integração',
    'Logística de transporte e proximidade dos hotéis'
  ],
  en: [
    'Referee technical level',
    'Field/court quality and infrastructure',
    'High-standard trophies and medals',
    'Live game streaming',
    'Official parties / Integration events',
    'Transport logistics and hotel proximity'
  ],
  es: [
    'Nivel técnico del arbitraje',
    'Calidad del campo/infraestructura de canchas',
    'Trofeos y medallas de alto nivel',
    'Transmisión en vivo de los juegos',
    'Fiestas oficiales / Eventos de integración',
    'Logística de transporte y proximidad de hoteles'
  ]
};

const hostingOptionsMap = {
  pt: [
    'Não precisamos de hospedagem / Somos locais',
    'Econômica / Hostels / Acomodações coletivas',
    'Intermediária / Hotéis 3 estrelas',
    'Premium / Hotéis 4 ou 5 estrelas'
  ],
  en: [
    "We don't need accommodation / We are locals",
    'Budget / Hostels / Shared accommodation',
    'Mid-range / 3-star hotels',
    'Premium / 4 or 5-star hotels'
  ],
  es: [
    'No necesitamos alojamiento / Somos locales',
    'Económica / Hostels / Alojamiento compartido',
    'Intermedia / Hoteles 3 estrellas',
    'Premium / Hoteles 4 o 5 estrellas'
  ]
};

const texts = {
  pt: {
    back: 'Voltar para o site',
    eyebrow: 'PROCESSO DE SELEÇÃO DE CLUBES',
    title: 'Sua equipe quer participar do Brasil Flag World Championship?',
    subtitle:
      'Preencha o formulário de candidatura abaixo. O Comitê Organizador vai avaliar o perfil do seu clube e enviará uma resposta oficial por e-mail.',
    review: 'Análise oficial para equipes selecionadas.',
    noGuarantee: 'O envio não garante participação automática.',
    steps: [
      ['1. Enviar interesse', 'A equipe envia informações institucionais, competitivas e de contato.'],
      ['2. Análise do comitê', 'A organização avalia o perfil das equipes e envia as informações para participação do torneio.'],
      ['3. Resposta oficial', 'O contato recebe aprovação ou próximos passos por e-mail.'],
      ['4. Apoio de viagem', 'Equipes aprovadas poderão receber suporte oficial da Blue Panda Travel.']
    ],
    official: 'INSCRIÇÃO OFICIAL',
    formTitle: 'Envie sua equipe para análise',
    formSubtitle:
      'Preencha com informações corretas. Este formulário será enviado à organização do BFWC e armazenado para análise.',
    firstStep:
      'Esse é seu primeiro passo para viver sua melhor experiência internacional do Flag Football em 2026.',
    clubInfo: 'Informações da equipe',
    contact: 'Contato responsável',
    clubName: 'Nome do clube / equipe',
    country: 'País',
    city: 'Cidade',
    category: 'Categoria / divisão principal',
    moreCategories: 'Deseja inscrever mais de uma categoria?',
    categoriesInterested: 'Quais categorias sua equipe deseja inscrever?',
    select: 'Selecione',
    instagram: 'Instagram',
    website: 'Site',
    fullName: 'Nome completo',
    role: 'Cargo / função',
    athletes: 'Número estimado de atletas/comissão (total)',
    athletesByCat: 'Atletas por categoria',
    athletesCatHint: 'Informe quantos atletas (incluindo comissão) em cada categoria selecionada:',
    travel: 'Assessoria para viagem e hospedagem?',
    yes: 'Sim, quero receber indicações e parcerias',
    no: 'Não',
    maybe: 'Talvez',
    hosting:
      'Se a sua equipe precisar de viagem, qual tipo de hospedagem vocês preferem?',
    priorities:
      'Quais são as 3 coisas mais importantes para você e sua equipe em um evento internacional de Flag?',
    history: 'Histórico competitivo',
    historyPlaceholder: 'Principais torneios, títulos, liga, federação, experiência internacional...',
    notes: 'Observações adicionais',
    notesPlaceholder: 'Informações relevantes sobre o clube, grupo de viagem, expectativas ou dúvidas...',
    consent:
      'Autorizo a organização a tratar estas informações para seleção de clubes, comunicação oficial e oportunidades relacionadas ao evento.',
    submit: 'Enviar para análise oficial',
    submitting: 'Enviando...',
    success:
      'Inscrição recebida. Sua equipe receberá uma confirmação por e-mail e a organização analisará sua solicitação.'
  },

  en: {
    back: 'Back to website',
    eyebrow: 'CLUB SELECTION PROCESS',
    title: 'Does your team want to join the Brasil Flag World Championship?',
    subtitle:
      'Complete the application form below. The Organizing Committee will review your club profile and send an official response by email.',
    review: 'Official review for selected teams.',
    noGuarantee: 'Submission does not guarantee automatic participation.',
    steps: [
      ['1. Submit interest', 'The team sends institutional, competitive and contact information.'],
      ['2. Committee review', 'The organization reviews the teams\' profiles and sends the information for tournament participation.'],
      ['3. Official response', 'The contact receives approval or next steps by email.'],
      ['4. Travel support', 'Approved teams may receive official Blue Panda Travel assistance.']
    ],
    official: 'OFFICIAL APPLICATION',
    formTitle: 'Submit your team for analysis',
    formSubtitle:
      'Please fill in accurate information. This form will be sent to the BFWC organization team and stored for review.',
    firstStep:
      'This is your first step toward living your best international Flag Football experience in 2026.',
    clubInfo: 'Team information',
    contact: 'Responsible contact',
    clubName: 'Club / Team name',
    country: 'Country',
    city: 'City',
    category: 'Main category / division',
    moreCategories: 'Would you like to register more than one category?',
    categoriesInterested: 'Categories of interest',
    select: 'Select',
    instagram: 'Instagram',
    website: 'Website',
    fullName: 'Full name',
    role: 'Role',
    athletes: 'Estimated number of athletes/staff (total)',
    athletesByCat: 'Athletes per category',
    athletesCatHint: 'How many athletes (including staff) in each selected category:',
    travel: 'Travel & accommodation support?',
    yes: 'Yes, I want to receive recommendations and partnerships',
    no: 'No',
    maybe: 'Maybe',
    hosting: 'If your team needs travel, what type of accommodation do you prefer?',
    priorities: 'What are the 3 most important things for your team in an international Flag event?',
    history: 'Competitive history',
    historyPlaceholder: 'Main tournaments, titles, league, federation, international experience...',
    notes: 'Additional notes',
    notesPlaceholder: 'Relevant information about your club, travel group, expectations or questions...',
    consent:
      'I authorize the organization to process this information for club selection, official communication and event-related opportunities.',
    submit: 'Submit for official review',
    submitting: 'Submitting...',
    success:
      'Application received. Your team will receive a confirmation email and the organization will analyze your request.'
  },

  es: {
    back: 'Volver al sitio',
    eyebrow: 'PROCESO DE SELECCIÓN DE CLUBES',
    title: '¿Tu equipo quiere participar en el Brasil Flag World Championship?',
    subtitle:
      'Complete el formulario de candidatura abajo. El Comité Organizador evaluará el perfil de su club y enviará una respuesta oficial por correo electrónico.',
    review: 'Revisión oficial para equipos seleccionados.',
    noGuarantee: 'El envío no garantiza participación automática.',
    steps: [
      ['1. Enviar interés', 'El equipo envía información institucional, competitiva y de contacto.'],
      ['2. Revisión del comité', 'La organización evalúa el perfil de los equipos y envía la información para participación en el torneo.'],
      ['3. Respuesta oficial', 'El contacto recibe aprobación o próximos pasos por e-mail.'],
      ['4. Apoyo de viaje', 'Los equipos aprobados podrán recibir asistencia oficial de Blue Panda Travel.']
    ],
    official: 'SOLICITUD OFICIAL',
    formTitle: 'Envíe su equipo para análisis',
    formSubtitle:
      'Complete la información con precisión. Este formulario será enviado al equipo organizador del BFWC y almacenado para revisión.',
    firstStep:
      'Este es el primer paso para vivir su mejor experiencia internacional de Flag Football en 2026.',
    clubInfo: 'Información del equipo',
    contact: 'Contacto responsable',
    clubName: 'Nombre del club / equipo',
    country: 'País',
    city: 'Ciudad',
    category: 'Categoría / división principal',
    moreCategories: '¿Desea inscribir más de una categoría?',
    categoriesInterested: 'Categorías de interés',
    select: 'Seleccione',
    instagram: 'Instagram',
    website: 'Sitio web',
    fullName: 'Nombre completo',
    role: 'Cargo / función',
    athletes: 'Número estimado de atletas/staff (total)',
    athletesByCat: 'Atletas por categoría',
    athletesCatHint: 'Indique cuántos atletas (incluyendo staff) en cada categoría seleccionada:',
    travel: '¿Apoyo de viaje y hospedaje?',
    yes: 'Sí, quiero recibir indicaciones y alianzas',
    no: 'No',
    maybe: 'Tal vez',
    hosting: 'Si su equipo necesita viajar, ¿qué tipo de hospedaje prefieren?',
    priorities: '¿Cuáles son las 3 cosas más importantes para su equipo en un evento internacional de Flag?',
    history: 'Historial competitivo',
    historyPlaceholder: 'Principales torneos, títulos, liga, federación, experiencia internacional...',
    notes: 'Notas adicionales',
    notesPlaceholder: 'Información relevante sobre el club, grupo de viaje, expectativas o dudas...',
    consent:
      'Autorizo a la organización a procesar esta información para selección de clubes, comunicación oficial y oportunidades relacionadas con el evento.',
    submit: 'Enviar para revisión oficial',
    submitting: 'Enviando...',
    success:
      'Solicitud recibida. Su equipo recibirá una confirmación por e-mail y la organización analizará su solicitud.'
  }
};

const initial = {
  club_name: '',
  country: '',
  city: '',
  category: '',
    categories_interested: [],
  contact_name: '',
  contact_role: '',
  email: '',
  whatsapp: '',
  instagram: '',
  website: '',
  athletes_count: '',
  athletes_masc: '',
  athletes_fem: '',
  athletes_sub15: '',
  athletes_sub12: '',
  competitive_history: '',
  travel_support: 'yes',
  hosting_preference: '',
  event_priorities: [],
  notes: '',
  language: 'pt',
  lgpd: false
};

export default function ClubInterestPage() {
  const [lang, setLang] = useState('pt');
  const [form, setForm] = useState({ ...initial, language: 'pt' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const t = texts[lang];
  const categories = categoriesMap[lang] || categoriesMap.pt;
  const prioritiesList = prioritiesMap[lang] || prioritiesMap.pt;
  const hostingOptions = hostingOptionsMap[lang] || hostingOptionsMap.pt;

  function changeLang(value) {
    setLang(value);
    setForm((prev) => ({ ...prev, language: value }));
    localStorage.setItem('bfwc_language', value);
  }

  function set(k, v) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  function toggleArray(field, value, limit = null) {
    setForm((prev) => {
      const current = prev[field] || [];
      const exists = current.includes(value);

      if (exists) {
        return {
          ...prev,
          [field]: current.filter((item) => item !== value)
        };
      }

      if (limit && current.length >= limit) {
        return prev;
      }

      return {
        ...prev,
        [field]: [...current, value]
      };
    });
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const res = await fetch('/api/club-interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || 'Submission failed.');
      }

      setSuccess(true);
      setForm({ ...initial, language: lang });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlLang = params.get('lang');
    const savedLang = localStorage.getItem('bfwc_language');
    const selectedLang = urlLang || savedLang || 'pt';

    if (texts[selectedLang]) {
      setLang(selectedLang);
      setForm((prev) => ({ ...prev, language: selectedLang }));
      localStorage.setItem('bfwc_language', selectedLang);
    }
  }, []);

  // ── Pré-inscrições encerradas em 01/07/2026 ──
  const closedCopy = {
    pt: { badge: 'Pré-inscrições encerradas', title: 'As pré-inscrições foram encerradas em 01/07.', text: 'As inscrições oficiais dos times abrem dia 07/07 às 10h (horário de Brasília) e ficam abertas enquanto houver vagas. De 07 a 12/07 a prioridade é dos times pré-inscritos; a partir de 13/07, abertas a todas as equipes.', cta: 'Ir para o cadastro oficial →', back: '← Voltar ao site' },
    en: { badge: 'Pre-registration closed', title: 'Pre-registration closed on July 1st.', text: 'Official team registration opens July 7 at 10 AM (Brasília time, GMT-3) and stay open while spots last. July 7–12 is priority for pre-registered teams; from July 13 it is open to all teams.', cta: 'Go to official registration →', back: '← Back to site' },
    es: { badge: 'Preinscripciones cerradas', title: 'Las preinscripciones cerraron el 01/07.', text: 'Las inscripciones oficiales abren el 07/07 a las 10h (hora de Brasilia) y permanecen abiertas mientras haya cupos. Del 07 al 12/07 la prioridad es de los equipos preinscritos; desde el 13/07, abiertas a todos los equipos.', cta: 'Ir a la inscripción oficial →', back: '← Volver al sitio' },
  };
  const cc = closedCopy[lang] || closedCopy.pt;

  return (
    <main style={{ minHeight: '100vh', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "'Inter', sans-serif", overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: "url('/assets/hero-rio-athletes.png')", backgroundSize: 'cover', backgroundPosition: 'center', zIndex: 0 }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(3,13,31,.80), rgba(3,13,31,.93))', zIndex: 1 }} />
      <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 520, background: 'rgba(10,20,40,.72)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,.14)', borderRadius: 28, padding: '44px 34px', textAlign: 'center', boxShadow: '0 40px 120px rgba(0,0,0,.7)' }}>
        <img src="/assets/bfwc-logo.jpg" alt="BFWC" width={92} height={92} style={{ borderRadius: 18, marginBottom: 20, objectFit: 'cover' }} />
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 9, fontWeight: 900, letterSpacing: 2.5, textTransform: 'uppercase', color: '#f4ff00', marginBottom: 14, padding: '5px 14px', borderRadius: 20, background: 'rgba(244,255,0,.08)', border: '1px solid rgba(244,255,0,.25)' }}>{cc.badge}</div>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: '#fff', letterSpacing: -0.8, margin: '0 0 14px', lineHeight: 1.25 }}>{cc.title}</h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,.78)', margin: '0 0 24px', lineHeight: 1.65 }}>{cc.text}</p>
        <a href="/portal/times/cadastro" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 24px', borderRadius: 10, background: '#f4ff00', color: '#031020', fontSize: 14, fontWeight: 900, textDecoration: 'none', textTransform: 'uppercase', marginBottom: 18 }}>{cc.cta}</a>
        <div><a href={`/site?lang=${lang}`} style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', textDecoration: 'none', fontWeight: 600 }}>{cc.back}</a></div>
      </div>
    </main>
  );

  // eslint-disable-next-line no-unreachable
  return (
    <main className="premiumClubPage">
      <div className="clubBackgroundImage" />

      <header className="clubHeader">
        <Link href={`/site?lang=${lang}`} className="backLink">
          <ArrowLeft size={18} />
          {t.back}
        </Link>

        <div className="clubLang">
          {['pt', 'en', 'es'].map((item) => (
            <button
              key={item}
              type="button"
              className={lang === item ? 'active' : ''}
              onClick={() => changeLang(item)}
            >
              {item.toUpperCase()}
            </button>
          ))}
        </div>
      </header>

      <section className="clubHero">
        <div className="clubHeroText">
          <p className="eyebrow">{t.eyebrow}</p>
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
        </div>

        <div className="clubHeroCard">
          <Image src="/assets/bfwc-logo.jpg" alt="BFWC 2026" width={220} height={220} priority />
          <span>2026</span>
          <h2>{t.review}</h2>
          <p>{t.noGuarantee}</p>
        </div>
      </section>

      <section className="selectionSteps">
        {t.steps.map((step, index) => {
          const icons = [Users, Trophy, CheckCircle2, Plane];
          const Icon = icons[index];

          return (
            <div className="stepCard" key={step[0]}>
              <Icon />
              <strong>{step[0]}</strong>
              <span>{step[1]}</span>
            </div>
          );
        })}
      </section>

      {success ? (
        <div className="successScreen">
          <div className="successIconWrap">
            <CheckCircle2 size={64} strokeWidth={1.5} />
          </div>
          <h2 className="successTitle">
            {lang === 'en' ? 'Application received!' : lang === 'es' ? '¡Solicitud recibida!' : 'Inscrição recebida!'}
          </h2>
          <p className="successMsg">{t.success}</p>
          <div className="successSteps">
            <div className="successStep">
              <span className="successStepNum">1</span>
              <span>{lang === 'en' ? 'Confirmation email sent to your inbox' : lang === 'es' ? 'E-mail de confirmación enviado' : 'E-mail de confirmação enviado para você'}</span>
            </div>
            <div className="successStep">
              <span className="successStepNum">2</span>
              <span>{lang === 'en' ? 'Our team will review your application' : lang === 'es' ? 'Nuestro equipo revisará tu solicitud' : 'Nossa equipe vai analisar sua inscrição'}</span>
            </div>
            <div className="successStep">
              <span className="successStepNum">3</span>
              <span>{lang === 'en' ? 'We will contact you with next steps' : lang === 'es' ? 'Te contactaremos con los próximos pasos' : 'Entraremos em contato com os próximos passos'}</span>
            </div>
          </div>
          <button className="successBackBtn" onClick={() => setSuccess(false)}>
            {lang === 'en' ? 'Register another team' : lang === 'es' ? 'Registrar otro equipo' : 'Inscrever outra equipe'}
          </button>
        </div>
      ) : (

      <form className="premiumForm" onSubmit={submit}>
        <div className="formTop">
          <div>
            <p className="tag">{t.official}</p>
            <h2>{t.formTitle}</h2>
            <p>{t.formSubtitle}</p>
            <p className="formIntroHighlight">{t.firstStep}</p>
          </div>
        </div>

        <div className="formSection">
          <h3>{t.clubInfo}</h3>

          <div className="formGrid">
            <Input label={t.clubName} value={form.club_name} onChange={(v) => set('club_name', v)} required />
            <Input label={t.country} value={form.country} onChange={(v) => set('country', v)} required />
            <Input label={t.city} value={form.city} onChange={(v) => set('city', v)} required />

            <label className="fullField">
  {t.categoriesInterested}
  <div className="checkboxGrid">
    {categories.map((cat) => {
      const checked = form.categories_interested.includes(cat);
      return (
        <label key={cat} className={`miniCheck${checked ? ' miniCheckActive' : ''}`}>
          <input
            type="checkbox"
            checked={checked}
            onChange={() => {
              setForm((prev) => {
                const current = prev.categories_interested;
                const updated = current.includes(cat)
                  ? current.filter((item) => item !== cat)
                  : [...current, cat];
                return {
                  ...prev,
                  categories_interested: updated,
                  category: updated.join(', ')
                };
              });
            }}
          />
          <span>{cat}</span>
        </label>
      );
    })}
  </div>
</label>

            <Input label={t.instagram} value={form.instagram} onChange={(v) => set('instagram', v)} />
            <Input label={t.website} value={form.website} onChange={(v) => set('website', v)} />
          </div>
        </div>

        <div className="formSection">
          <h3>{t.contact}</h3>

          <div className="formGrid">
            <Input label={t.fullName} value={form.contact_name} onChange={(v) => set('contact_name', v)} required />
            <Input label={t.role} value={form.contact_role} onChange={(v) => set('contact_role', v)} required />
            <Input label="Email" type="email" value={form.email} onChange={(v) => set('email', v)} required />
            <Input label="WhatsApp" value={form.whatsapp} onChange={(v) => set('whatsapp', v)} required />
            <Input label={t.athletes} type="number" value={form.athletes_count} onChange={(v) => set('athletes_count', v)} />

            {form.categories_interested.length > 0 && (
              <div className="fullField" style={{ marginBottom: 4 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>{t.athletesByCat}</label>
                <p style={{ fontSize: 13, opacity: 0.6, marginBottom: 12 }}>{t.athletesCatHint}</p>
                <div className="formGrid" style={{ gap: 12 }}>
                  {form.categories_interested.map((cat) => {
                    const catKey = cat.toLowerCase().includes('sub 12') || cat.toLowerCase().includes('u12') ? 'athletes_sub12'
                      : cat.toLowerCase().includes('sub 15') || cat.toLowerCase().includes('u15') ? 'athletes_sub15'
                      : cat.toLowerCase().includes('fem') || cat.toLowerCase() === 'women' ? 'athletes_fem'
                      : 'athletes_masc';
                    return (
                      <Input
                        key={cat}
                        label={cat}
                        type="number"
                        value={form[catKey]}
                        onChange={(v) => set(catKey, v)}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            <label>
              {t.travel}
              <select value={form.travel_support} onChange={(e) => set('travel_support', e.target.value)}>
                <option value="yes">{t.yes}</option>
                <option value="no">{t.no}</option>
                <option value="maybe">{t.maybe}</option>
              </select>
            </label>

            <label className="fullField">
              {t.hosting}
              <select
                value={form.hosting_preference}
                onChange={(e) => set('hosting_preference', e.target.value)}
              >
                <option value="">{t.select}</option>
                {hostingOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </label>

            <label className="fullField">
              {t.priorities}
              <div className="checkboxGrid">
                {prioritiesList.map((item) => {
                  const checked = form.event_priorities.includes(item);
                  const disabled = !checked && form.event_priorities.length >= 3;

                  return (
                    <label key={item} className={`miniCheck ${disabled ? 'disabled' : ''}`}>
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={disabled}
                        onChange={() => toggleArray('event_priorities', item, 3)}
                      />
                      <span>{item}</span>
                    </label>
                  );
                })}
              </div>
            </label>
          </div>
        </div>

        <label>
          {t.history}
          <textarea
            rows="5"
            value={form.competitive_history}
            onChange={(e) => set('competitive_history', e.target.value)}
            placeholder={t.historyPlaceholder}
            required
          />
        </label>

        <label>
          {t.notes}
          <textarea
            rows="4"
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            placeholder={t.notesPlaceholder}
          />
        </label>

        <label className="check">
          <input
            type="checkbox"
            checked={form.lgpd}
            onChange={(e) => set('lgpd', e.target.checked)}
            required
          />
          <span>{t.consent}</span>
        </label>

        {error && <p className="error">{error}</p>}

        <button className="primaryBtn submitBtn" disabled={loading}>
          {loading ? <Loader2 className="spin" size={18} /> : <ShieldCheck size={18} />}
          {loading ? t.submitting : t.submit}
        </button>
      </form>
      )}
    </main>
  );
}

function Input({ label, value, onChange, type = 'text', required = false }) {
  return (
    <label>
      {label}
      <input type={type} value={value} required={required} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}