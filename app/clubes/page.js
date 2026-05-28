'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Globe2,
  Trophy,
  Plane,
  Users,
  Mail,
  Sparkles
} from 'lucide-react';

const texts = {
  pt: {
    back: 'Voltar para o site',
    eyebrow: 'PROCESSO DE SELEÇÃO DE CLUBES',
    title: 'Inscrição de interesse do clube.',
    subtitle:
      'Preencha as informações abaixo. O comitê do campeonato irá analisar o perfil do clube e enviar uma resposta oficial por e-mail.',
    curated: 'Seleção criteriosa',
    email: 'Confirmação por e-mail',
    international: 'Clubes internacionais',
    review: 'Análise oficial para equipes selecionadas.',
    noGuarantee: 'O envio não garante participação automática.',
    steps: [
      ['1. Enviar interesse', 'O clube envia informações institucionais, competitivas e de contato.'],
      ['2. Análise do comitê', 'A organização avalia categoria, histórico, perfil e capacidade.'],
      ['3. Resposta oficial', 'O contato recebe aprovação ou próximos passos por e-mail.'],
      ['4. Apoio de viagem', 'Clubes aprovados poderão receber suporte oficial da Blue Panda Travel.']
    ],
    official: 'INSCRIÇÃO OFICIAL',
    formTitle: 'Envie seu clube para análise',
    formSubtitle:
      'Preencha com informações corretas. Este formulário será enviado à organização do BFWC e armazenado para análise.',
    premium: 'Evento internacional premium',
    clubInfo: 'Informações do clube',
    contact: 'Contato responsável',
    clubName: 'Nome do clube / equipe',
    country: 'País',
    city: 'Cidade',
    category: 'Categoria / divisão',
    select: 'Selecione',
    instagram: 'Instagram',
    website: 'Site',
    fullName: 'Nome completo',
    role: 'Cargo / função',
    athletes: 'Número estimado de atletas/comissão',
    travel: 'Precisa de apoio de viagem?',
    yes: 'Sim, apoio Blue Panda',
    no: 'Não',
    maybe: 'Talvez',
    history: 'Histórico competitivo',
    historyPlaceholder: 'Principais torneios, títulos, liga, federação, experiência internacional...',
    notes: 'Observações adicionais',
    notesPlaceholder: 'Informações relevantes sobre o clube, grupo de viagem, expectativas ou dúvidas...',
    consent:
      'Autorizo a organização a tratar estas informações para seleção de clubes, comunicação oficial e oportunidades relacionadas ao evento.',
    submit: 'Enviar para análise oficial',
    submitting: 'Enviando...',
    success:
      'Inscrição recebida. Seu clube receberá uma confirmação por e-mail e a organização analisará sua solicitação.'
  },
  en: {
    back: 'Back to website',
    eyebrow: 'CLUB SELECTION PROCESS',
    title: 'Club interest application.',
    subtitle:
      'Complete the information below. The championship committee will review your club profile and send an official response by email.',
    curated: 'Curated selection',
    email: 'Email confirmation',
    international: 'International clubs',
    review: 'Official review for selected teams.',
    noGuarantee: 'Submission does not guarantee automatic participation.',
    steps: [
      ['1. Submit interest', 'The club sends institutional, competitive and contact information.'],
      ['2. Committee review', 'The organization reviews category, history, profile and capacity.'],
      ['3. Official response', 'The contact receives the approval or next steps by email.'],
      ['4. Travel support', 'Approved clubs may receive official Blue Panda Travel assistance.']
    ],
    official: 'OFFICIAL APPLICATION',
    formTitle: 'Submit your club for analysis',
    formSubtitle:
      'Please fill in accurate information. This form will be sent to the BFWC organization team and stored for review.',
    premium: 'Premium international event',
    clubInfo: 'Club information',
    contact: 'Responsible contact',
    clubName: 'Club / Team name',
    country: 'Country',
    city: 'City',
    category: 'Category / Division',
    select: 'Select',
    instagram: 'Instagram',
    website: 'Website',
    fullName: 'Full name',
    role: 'Role',
    athletes: 'Estimated number of athletes/staff',
    travel: 'Needs travel support?',
    yes: 'Yes, Blue Panda support',
    no: 'No',
    maybe: 'Maybe',
    history: 'Competitive history',
    historyPlaceholder: 'Main tournaments, titles, league, federation, international experience...',
    notes: 'Additional notes',
    notesPlaceholder: 'Any relevant information about your club, travel group, expectations or questions...',
    consent:
      'I authorize the organization to process this information for club selection, official communication and event-related opportunities.',
    submit: 'Submit for official review',
    submitting: 'Submitting...',
    success:
      'Application received. Your club will receive a confirmation email and the organization will analyze your request.'
  },
  es: {
    back: 'Volver al sitio',
    eyebrow: 'PROCESO DE SELECCIÓN DE CLUBES',
    title: 'Solicitud de interés del club.',
    subtitle:
      'Complete la información abajo. El comité del campeonato revisará el perfil del club y enviará una respuesta oficial por correo electrónico.',
    curated: 'Selección criteriosa',
    email: 'Confirmación por e-mail',
    international: 'Clubes internacionales',
    review: 'Revisión oficial para equipos seleccionados.',
    noGuarantee: 'El envío no garantiza participación automática.',
    steps: [
      ['1. Enviar interés', 'El club envía información institucional, competitiva y de contacto.'],
      ['2. Revisión del comité', 'La organización revisa categoría, historial, perfil y capacidad.'],
      ['3. Respuesta oficial', 'El contacto recibe aprobación o próximos pasos por e-mail.'],
      ['4. Apoyo de viaje', 'Los clubes aprobados podrán recibir asistencia oficial de Blue Panda Travel.']
    ],
    official: 'SOLICITUD OFICIAL',
    formTitle: 'Envíe su club para análisis',
    formSubtitle:
      'Complete la información con precisión. Este formulario será enviado al equipo organizador del BFWC y almacenado para revisión.',
    premium: 'Evento internacional premium',
    clubInfo: 'Información del club',
    contact: 'Contacto responsable',
    clubName: 'Nombre del club / equipo',
    country: 'País',
    city: 'Ciudad',
    category: 'Categoría / división',
    select: 'Seleccione',
    instagram: 'Instagram',
    website: 'Sitio web',
    fullName: 'Nombre completo',
    role: 'Cargo / función',
    athletes: 'Número estimado de atletas/staff',
    travel: '¿Necesita apoyo de viaje?',
    yes: 'Sí, apoyo Blue Panda',
    no: 'No',
    maybe: 'Tal vez',
    history: 'Historial competitivo',
    historyPlaceholder: 'Principales torneos, títulos, liga, federación, experiencia internacional...',
    notes: 'Notas adicionales',
    notesPlaceholder: 'Información relevante sobre el club, grupo de viaje, expectativas o dudas...',
    consent:
      'Autorizo a la organización a procesar esta información para selección de clubes, comunicación oficial y oportunidades relacionadas con el evento.',
    submit: 'Enviar para revisión oficial',
    submitting: 'Enviando...',
    success:
      'Solicitud recibida. Su club recibirá una confirmación por e-mail y la organización analizará su solicitud.'
  }
};

const initial = {
  club_name: '',
  country: '',
  city: '',
  category: '',
  contact_name: '',
  contact_role: '',
  email: '',
  whatsapp: '',
  instagram: '',
  website: '',
  athletes_count: '',
  competitive_history: '',
  travel_support: 'yes',
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

  function changeLang(value) {
    setLang(value);
    setForm((prev) => ({ ...prev, language: value }));
  }

  function set(k, v) {
    setForm((prev) => ({ ...prev, [k]: v }));
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
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="clubPage premiumClubPage">
      <div className="clubBackgroundImage" />

      <header className="clubHeader">
        <Link href="/" className="backLink">
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

          <div className="clubHeroBadges">
            <span><ShieldCheck size={16} />{t.curated}</span>
            <span><Mail size={16} />{t.email}</span>
            <span><Globe2 size={16} />{t.international}</span>
          </div>
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

      {success && (
        <div className="successBox">
          <CheckCircle2 />
          {t.success}
        </div>
      )}

      <form className="premiumForm" onSubmit={submit}>
        <div className="formTop">
          <div>
            <p className="tag">{t.official}</p>
            <h2>{t.formTitle}</h2>
            <p>{t.formSubtitle}</p>
          </div>

          <div className="formSeal">
            <Sparkles />
            <span>{t.premium}</span>
          </div>
        </div>

        <div className="formSection">
          <h3>{t.clubInfo}</h3>

          <div className="formGrid">
            <Input label={t.clubName} value={form.club_name} onChange={(v) => set('club_name', v)} required />
            <Input label={t.country} value={form.country} onChange={(v) => set('country', v)} required />
            <Input label={t.city} value={form.city} onChange={(v) => set('city', v)} required />

            <label>
              {t.category}
              <select value={form.category} onChange={(e) => set('category', e.target.value)} required>
                <option value="">{t.select}</option>
                <option>Men</option>
                <option>Women</option>
                <option>Mixed</option>
                <option>U20 Men</option>
                <option>U20 Women</option>
                <option>Masters</option>
                <option>Other</option>
              </select>
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

            <label>
              {t.travel}
              <select value={form.travel_support} onChange={(e) => set('travel_support', e.target.value)}>
                <option value="yes">{t.yes}</option>
                <option value="no">{t.no}</option>
                <option value="maybe">{t.maybe}</option>
              </select>
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