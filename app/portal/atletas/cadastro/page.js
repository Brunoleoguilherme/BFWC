'use client';

import { useState, useEffect, useRef } from 'react';
import '../../../admin/admin.css';

const ACCENT = '#009c3b';
const GREEN   = '#22c55e';

/* ─── i18n ──────────────────────────────────────────────────── */
const TR = {
  pt: {
    badge: 'Cadastro de Atleta', title: 'BFWC',
    alertTitle: 'Atenção antes de continuar',
    alertText: 'Você só pode se cadastrar se o responsável do seu clube já cadastrou o seu e-mail no portal. Caso contrário, seu cadastro será recusado. Confirme com seu clube antes de prosseguir.',
    step1: 'Dados Pessoais', step2: 'Perfil', step3: 'Termos & Conta',
    name: 'Nome completo *', email: 'E-mail *',
    emailHint: 'Use o mesmo e-mail cadastrado pelo seu clube',
    birthdate: 'Data de nascimento *', nationality: 'Nacionalidade / País *',
    whatsapp: 'WhatsApp *', instagram: 'Instagram *',
    instagramPlaceholder: '@seuinstagram',
    position: 'Posição *', positionDefault: 'Selecione sua posição',
    photoLabel: 'Foto do atleta *', photoHint: 'PNG ou JPG · Máx. 2 MB · Foto de rosto nítida',
    photoBtn: 'Escolher foto', photoChange: 'Trocar foto',
    historyLabel: 'Histórico esportivo *',
    historyPlaceholder: 'Conte sobre sua experiência com flag football: times que jogou, títulos, posições, tempo de prática...',
    termsSection: 'Termos e aceites', termsHint: 'Leia cada termo clicando sobre ele. Todos são obrigatórios.',
    termAcceptBtn: 'Li e aceito', termsAccepted: '✓ Aceito', termsRequired: 'Obrigatório — clique para ler e aceitar',
    termHealthTitle: 'Declaração de Saúde e Responsabilidade',
    termHealthText: 'Declaro estar em plenas condições físicas para participar do campeonato e isento a organização do BFWC 2026 de responsabilidade por lesões esportivas. Declaro não ter contraindicação médica para a prática do flag football.',
    termImageTitle: 'Autorização de Uso de Imagem e Voz',
    termImageText: 'Autorizo a organização a captar e utilizar minha imagem, voz e likeness em fotografias, vídeos, transmissões ao vivo, redes sociais e materiais promocionais do BFWC 2026, sem ônus, por prazo indeterminado.',
    termRulesTitle: 'Regulamento do Torneio',
    termRulesText: 'Declaro que li e aceito integralmente o Regulamento Oficial do BFWC 2026. Estou ciente de que violações resultam em advertência, suspensão ou desclassificação, a critério da comissão técnica.',
    termPrivacyTitle: 'Política de Privacidade — LGPD',
    termPrivacyText: 'Consinto com o tratamento dos meus dados pessoais conforme a LGPD (Lei nº 13.709/2018) para fins de gestão da minha participação, credenciamento e divulgação de resultados do evento.',
    termConductTitle: 'Código de Conduta e Fair Play',
    termConductText: 'Comprometo-me a manter conduta esportiva exemplar. Declaro não usar substâncias proibidas e aceito submeter-me a controle antidoping. Estou ciente de que condutas discriminatórias resultam em punição imediata.',
    password: 'Senha *', confirmPassword: 'Confirmar senha *',
    btnNext: 'Continuar →', btnBack: '← Voltar', btnSubmit: 'Criar conta', btnLoading: 'Criando conta...',
    loginLink: 'Já tem conta?', login: 'Fazer login', back: '← Voltar ao portal',
    successTitle: 'Cadastro realizado!',
    successMsg: 'Enviamos um e-mail de confirmação para <strong>{email}</strong>. Clique no link para ativar sua conta.',
    required: 'Campo obrigatório', emailInvalid: 'E-mail inválido',
    passwordMin: 'Mínimo 8 caracteres', passwordMatch: 'As senhas não coincidem',
    photoRequired: 'Foto é obrigatória', historyRequired: 'Histórico é obrigatório',
    allTermsRequired: 'Você deve aceitar todos os termos',
    logoInvalidType: 'Use PNG ou JPG.', logoTooLarge: 'Máximo 2 MB.',
  },
  en: {
    badge: 'Athlete Registration', title: 'BFWC',
    alertTitle: 'Important before you continue',
    alertText: 'You can only register if your club has already added your email to the portal roster. If not, your registration will be rejected. Please confirm with your club before proceeding.',
    step1: 'Personal Info', step2: 'Profile', step3: 'Terms & Account',
    name: 'Full name *', email: 'Email *',
    emailHint: 'Use the same email your club registered',
    birthdate: 'Date of birth *', nationality: 'Nationality / Country *',
    whatsapp: 'WhatsApp *', instagram: 'Instagram *',
    instagramPlaceholder: '@yourinstagram',
    position: 'Position *', positionDefault: 'Select your position',
    photoLabel: 'Athlete photo *', photoHint: 'PNG or JPG · Max 2 MB · Clear face photo',
    photoBtn: 'Choose photo', photoChange: 'Change photo',
    historyLabel: 'Sports history *',
    historyPlaceholder: 'Tell us about your flag football experience: teams, titles, positions, years playing...',
    termsSection: 'Terms & agreements', termsHint: 'Read each term by clicking on it. All are required.',
    termAcceptBtn: 'I have read and accept', termsAccepted: '✓ Accepted', termsRequired: 'Required — click to read and accept',
    termHealthTitle: 'Health & Liability Declaration',
    termHealthText: 'I declare I am in full physical condition to participate in the championship and release the BFWC 2026 organization from liability for sports injuries. I declare I have no medical contraindication for practicing flag football.',
    termImageTitle: 'Image & Voice Usage Authorization',
    termImageText: 'I authorize the organization to capture and use my image, voice and likeness in photos, videos, live broadcasts, social media and promotional materials of BFWC 2026, without compensation, for an indefinite period.',
    termRulesTitle: 'Tournament Rules',
    termRulesText: 'I declare I have read and fully accept the Official Rules of BFWC 2026. I understand that violations result in warnings, suspension or disqualification, at the discretion of the technical committee.',
    termPrivacyTitle: 'Privacy Policy — LGPD',
    termPrivacyText: 'I consent to the processing of my personal data in accordance with LGPD (Law No. 13,709/2018) for the purposes of managing my participation, accreditation and publication of event results.',
    termConductTitle: 'Code of Conduct & Fair Play',
    termConductText: 'I commit to maintaining exemplary sportsmanship. I declare I do not use prohibited substances and accept anti-doping control. I understand that discriminatory conduct results in immediate punishment.',
    password: 'Password *', confirmPassword: 'Confirm password *',
    btnNext: 'Continue →', btnBack: '← Back', btnSubmit: 'Create account', btnLoading: 'Creating account...',
    loginLink: 'Already have an account?', login: 'Log in', back: '← Back to portal',
    successTitle: 'Registration complete!',
    successMsg: 'We sent a confirmation email to <strong>{email}</strong>. Click the link to activate your account.',
    required: 'Required field', emailInvalid: 'Invalid email',
    passwordMin: 'Minimum 8 characters', passwordMatch: 'Passwords do not match',
    photoRequired: 'Photo is required', historyRequired: 'Sports history is required',
    allTermsRequired: 'You must accept all terms',
    logoInvalidType: 'Use PNG or JPG.', logoTooLarge: 'Maximum 2 MB.',
  },
  es: {
    badge: 'Registro de Atleta', title: 'BFWC',
    alertTitle: 'Importante antes de continuar',
    alertText: 'Solo puedes registrarte si el responsable de tu club ya registró tu correo en el portal. De lo contrario, tu registro será rechazado. Confirma con tu club antes de continuar.',
    step1: 'Datos Personales', step2: 'Perfil', step3: 'Términos & Cuenta',
    name: 'Nombre completo *', email: 'Correo electrónico *',
    emailHint: 'Usa el mismo correo que tu club registró',
    birthdate: 'Fecha de nacimiento *', nationality: 'Nacionalidad / País *',
    whatsapp: 'WhatsApp *', instagram: 'Instagram *',
    instagramPlaceholder: '@tuinstagram',
    position: 'Posición *', positionDefault: 'Selecciona tu posición',
    photoLabel: 'Foto del atleta *', photoHint: 'PNG o JPG · Máx. 2 MB · Foto de rostro nítida',
    photoBtn: 'Elegir foto', photoChange: 'Cambiar foto',
    historyLabel: 'Historial deportivo *',
    historyPlaceholder: 'Cuéntanos sobre tu experiencia en flag football: equipos, títulos, posiciones, años jugando...',
    termsSection: 'Términos y aceptaciones', termsHint: 'Lee cada término haciendo clic. Todos son obligatorios.',
    termAcceptBtn: 'He leído y acepto', termsAccepted: '✓ Aceptado', termsRequired: 'Obligatorio — clic para leer y aceptar',
    termHealthTitle: 'Declaración de Salud y Responsabilidad',
    termHealthText: 'Declaro estar en plenas condiciones físicas para participar del campeonato y eximo a la organización del BFWC 2026 de responsabilidad por lesiones deportivas. Declaro no tener contraindicación médica para practicar flag football.',
    termImageTitle: 'Autorización de Uso de Imagen y Voz',
    termImageText: 'Autorizo a la organización a capturar y utilizar mi imagen, voz y apariencia en fotografías, videos, transmisiones en vivo, redes sociales y materiales promocionales del BFWC 2026, sin costo, por tiempo indefinido.',
    termRulesTitle: 'Reglamento del Torneo',
    termRulesText: 'Declaro haber leído y aceptado íntegramente el Reglamento Oficial del BFWC 2026. Soy consciente de que las violaciones resultan en advertencia, suspensión o descalificación, a criterio del comité técnico.',
    termPrivacyTitle: 'Política de Privacidad — LGPD',
    termPrivacyText: 'Consiento el tratamiento de mis datos personales conforme a la LGPD (Ley nº 13.709/2018) para la gestión de mi participación, acreditación y divulgación de resultados del evento.',
    termConductTitle: 'Código de Conducta y Fair Play',
    termConductText: 'Me comprometo a mantener una conducta deportiva ejemplar. Declaro no usar sustancias prohibidas y acepto el control antidopaje. Soy consciente de que la conducta discriminatoria resulta en sanción inmediata.',
    password: 'Contraseña *', confirmPassword: 'Confirmar contraseña *',
    btnNext: 'Continuar →', btnBack: '← Volver', btnSubmit: 'Crear cuenta', btnLoading: 'Creando cuenta...',
    loginLink: '¿Ya tienes cuenta?', login: 'Iniciar sesión', back: '← Volver al portal',
    successTitle: '¡Registro completado!',
    successMsg: 'Enviamos un correo de confirmación a <strong>{email}</strong>. Haz clic en el enlace para activar tu cuenta.',
    required: 'Campo obligatorio', emailInvalid: 'Correo inválido',
    passwordMin: 'Mínimo 8 caracteres', passwordMatch: 'Las contraseñas no coinciden',
    photoRequired: 'La foto es obligatoria', historyRequired: 'El historial es obligatorio',
    allTermsRequired: 'Debes aceptar todos los términos',
    logoInvalidType: 'Usa PNG o JPG.', logoTooLarge: 'Máximo 2 MB.',
  },
};

const TERMS_KEYS = ['Health', 'Image', 'Rules', 'Privacy', 'Conduct'];
const TERMS_META = [
  { key: 'Health',   icon: '🏥', color: '#ef4444' },
  { key: 'Image',    icon: '📸', color: '#a855f7' },
  { key: 'Rules',    icon: '📋', color: ACCENT     },
  { key: 'Privacy',  icon: '🔒', color: '#22d3ee'  },
  { key: 'Conduct',  icon: '🤝', color: GREEN       },
];

const POSITIONS = [
  'Quarterback (QB)', 'Wide Receiver (WR)', 'Running Back (RB)',
  'Center', 'Tight End (TE)', 'Blitzer',
  'Cornerback (CB)', 'Safety', 'Linebacker (LB)',
];

/* ─── TermCard ───────────────────────────────────────────────── */
function TermCard({ meta, t, accepted, onAccept }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      borderRadius: 12, overflow: 'hidden',
      border: accepted ? `1.5px solid ${meta.color}55` : '1px solid #e2e8f0',
      background: accepted ? `${meta.color}08` : '#f8fafc',
      marginBottom: 8, transition: 'all .2s',
    }}>
      <button type="button" onClick={() => setOpen(o => !o)} style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 14px', background: 'none', border: 'none', cursor: 'pointer',
        fontFamily: 'inherit',
      }}>
        <span style={{ fontSize: 18, flexShrink: 0 }}>{meta.icon}</span>
        <span style={{ flex: 1, textAlign: 'left', fontSize: 12, fontWeight: 700,
          color: accepted ? meta.color : '#374151', letterSpacing: '.2px' }}>
          {t[`term${meta.key}Title`]}
        </span>
        <span style={{ fontSize: 11, fontWeight: 700,
          color: accepted ? meta.color : '#94a3b8', flexShrink: 0 }}>
          {accepted ? t.termsAccepted : (open ? '▲' : '▼')}
        </span>
      </button>
      {open && (
        <div style={{ padding: '0 14px 14px' }}>
          <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.7, margin: '0 0 12px' }}>
            {t[`term${meta.key}Text`]}
          </p>
          {!accepted && (
            <button type="button" onClick={() => { onAccept(); setOpen(false); }} style={{
              fontSize: 11, fontWeight: 800, letterSpacing: '.5px', textTransform: 'uppercase',
              color: '#fff', padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: meta.color, fontFamily: 'inherit',
            }}>
              {t.termAcceptBtn}
            </button>
          )}
        </div>
      )}
      {!accepted && !open && (
        <div style={{ fontSize: 10, color: '#d97706', fontWeight: 700, padding: '0 14px 8px', letterSpacing: '.3px' }}>
          {t.termsRequired}
        </div>
      )}
    </div>
  );
}

/* ─── Main ───────────────────────────────────────────────────── */
// Portal abre em 07/07/2026 às 10:00 (Brasília)
const OPENS_AT = new Date('2026-07-07T10:00:00-03:00').getTime();

export default function AtletasCadastroPage() {
  const [locked, setLocked]         = useState(true);
  const [lang, setLang]             = useState('pt');
  const [step, setStep]             = useState(1);
  const [photoFile, setPhotoFile]   = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState({});
  const [form, setForm]             = useState({
    name: '', email: '', birthdate: '', nationality: '', whatsapp: '',
    instagram: '', position: '', history: '', password: '', confirm: '',
  });
  const [errors, setErrors]         = useState({});
  const [loading, setLoading]       = useState(false);
  const [serverError, setServerError] = useState('');
  const [success, setSuccess]       = useState(false);
  const [urlError, setUrlError]     = useState('');
  const [inviteBanner, setInviteBanner] = useState(null); // { club_name, category }
  const fileRef                     = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('bfwc_language');
    if (saved && TR[saved]) setLang(saved);
    const params = new URLSearchParams(window.location.search);
    const err = params.get('error');
    if (err === 'token_expired') setUrlError('O link de verificação expirou. Faça o cadastro novamente.');
    if (err === 'token_invalid') setUrlError('Link inválido. Faça o cadastro novamente.');

    // Pre-fill form from invite link (?ref=team_athlete_id)
    const ref = params.get('ref');
    if (ref) {
      fetch(`/api/portal/atletas/lookup?ref=${ref}`)
        .then(r => r.json())
        .then(d => {
          if (d.ok) {
            setForm(f => ({
              ...f,
              name:  d.name  || f.name,
              email: d.email || f.email,
            }));
            if (d.club_name) setInviteBanner({ club_name: d.club_name, category: d.category });
          }
        })
        .catch(() => {});
    }
    // Trava até 07/07 10h (Brasília); libera sozinha quando chegar a hora
    const check = () => setLocked(Date.now() < OPENS_AT);
    check();
    const iv = setInterval(check, 15000);
    return () => clearInterval(iv);
  }, []);

  const t = TR[lang];
  const allTermsOk = TERMS_KEYS.every(k => termsAccepted[k]);

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: '' }));
    setServerError('');
  }

  function handlePhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      setErrors(er => ({ ...er, photo: t.logoInvalidType })); return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setErrors(er => ({ ...er, photo: t.logoTooLarge })); return;
    }
    setPhotoFile(file);
    setErrors(er => ({ ...er, photo: '' }));
    const reader = new FileReader();
    reader.onload = ev => setPhotoPreview(ev.target.result);
    reader.readAsDataURL(file);
  }

  function validateStep1() {
    const errs = {};
    if (!form.name.trim())        errs.name       = t.required;
    if (!form.email.trim() || !form.email.includes('@')) errs.email = t.emailInvalid;
    if (!form.birthdate)          errs.birthdate   = t.required;
    if (!form.nationality.trim()) errs.nationality = t.required;
    if (!form.whatsapp.trim())    errs.whatsapp    = t.required;
    if (!form.instagram.trim())   errs.instagram   = t.required;
    if (!form.position)           errs.position    = t.required;
    return errs;
  }

  function validateStep2() {
    const errs = {};
    if (!photoFile)               errs.photo   = t.photoRequired;
    if (!form.history.trim())     errs.history = t.historyRequired;
    return errs;
  }

  function validateStep3() {
    const errs = {};
    if (!allTermsOk)              errs.terms    = t.allTermsRequired;
    if (!form.password)           errs.password = t.required;
    else if (form.password.length < 8) errs.password = t.passwordMin;
    if (form.password !== form.confirm) errs.confirm = t.passwordMatch;
    return errs;
  }

  function goNext(validate, nextN) {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setStep(nextN); window.scrollTo(0, 0);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validateStep3();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true); setServerError('');
    try {
      const fd = new FormData();
      fd.append('name',        form.name);
      fd.append('email',       form.email);
      fd.append('birthdate',   form.birthdate);
      fd.append('nationality', form.nationality);
      fd.append('whatsapp',    form.whatsapp);
      fd.append('instagram',   form.instagram);
      fd.append('position',    form.position);
      fd.append('history',     form.history);
      fd.append('password',    form.password);
      fd.append('language',    lang);
      fd.append('terms_health',   'true');
      fd.append('terms_image',    'true');
      fd.append('terms_rules',    'true');
      fd.append('terms_privacy',  'true');
      fd.append('terms_conduct',  'true');
      if (photoFile) fd.append('photo', photoFile);

      const res = await fetch('/api/portal/atletas/register', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.ok) setSuccess(true);
      else setServerError(data.message || 'Erro ao criar conta.');
    } catch {
      setServerError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  const iStyle = { width: '100%', boxSizing: 'border-box' };

  // Portal ainda não abriu: aviso trilíngue, sem acesso
  if (locked) return (
    <div style={{ minHeight: '100vh', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "'Inter', sans-serif", overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: "url('/assets/hero-rio-athletes.png')", backgroundSize: 'cover', backgroundPosition: 'center', zIndex: 0 }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(3,13,31,.80), rgba(3,13,31,.93))', zIndex: 1 }} />
      <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 480, background: 'rgba(10,20,40,.72)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,.14)', borderRadius: 28, padding: '44px 34px', textAlign: 'center', boxShadow: '0 40px 120px rgba(0,0,0,.7)' }}>
        <img src="/assets/bfwc-logo.jpg" alt="BFWC" width={92} height={92} style={{ borderRadius: 18, marginBottom: 20, objectFit: 'cover' }} />
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 9, fontWeight: 900, letterSpacing: 2.5, textTransform: 'uppercase', color: '#f4ff00', marginBottom: 14, padding: '5px 14px', borderRadius: 20, background: 'rgba(244,255,0,.08)', border: '1px solid rgba(244,255,0,.25)' }}>🔒 Em breve · Coming soon · Próximamente</div>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: '#fff', letterSpacing: -0.8, margin: '0 0 18px', lineHeight: 1.25 }}>Inscrições abrem dia 07/07 às 10h</h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,.75)', margin: '0 0 10px', lineHeight: 1.6 }}>🇧🇷 O cadastro dos atletas estará disponível <strong style={{ color: '#f4ff00' }}>dia 07/07 às 10h</strong> (horário de Brasília).</p>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,.75)', margin: '0 0 10px', lineHeight: 1.6 }}>🇺🇸 Athlete registration will be available on <strong style={{ color: '#f4ff00' }}>July 7 at 10 AM</strong> (Brasília time, GMT-3).</p>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,.75)', margin: '0 0 24px', lineHeight: 1.6 }}>🇪🇸 El registro de atletas estará disponible el <strong style={{ color: '#f4ff00' }}>07/07 a las 10h</strong> (hora de Brasilia).</p>
        <a href="/portal" style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', textDecoration: 'none', fontWeight: 600 }}>← Voltar · Back · Volver</a>
      </div>
    </div>
  );

  /* ── Success ── */
  if (success) return (
    <div className="login-root">
      <div className="login-card" style={{ maxWidth: 440, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
        <div className="login-badge">{t.badge}</div>
        <h1 className="login-title" style={{ justifyContent: 'center' }}>{t.successTitle}</h1>
        <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7, margin: '16px 0 24px' }}
          dangerouslySetInnerHTML={{ __html: t.successMsg.replace('{email}', form.email) }}
        />
        <a href="/portal/atletas/login" className="login-btn"
          style={{ display: 'block', textAlign: 'center', background: ACCENT, color: '#fff', textDecoration: 'none' }}>
          {t.login}
        </a>
        <div style={{ marginTop: 12 }}>
          <a href="/portal" style={{ fontSize: 12, color: '#94a3b8', textDecoration: 'none' }}>{t.back}</a>
        </div>
      </div>
    </div>
  );

  /* ── Form ── */
  return (
    <div className="login-root" style={{ alignItems: 'flex-start', paddingTop: 40, paddingBottom: 40 }}>
      <div style={{ width: '100%', maxWidth: 540, animation: 'cardIn .55s cubic-bezier(.22,.61,.36,1) both' }}>

        {/* Steps indicator */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 24, justifyContent: 'center', flexWrap: 'wrap', background: 'rgba(0,0,0,.45)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', borderRadius: 24, padding: '8px 20px', width: 'fit-content', margin: '0 auto 24px' }}>
          {[1, 2, 3].map(n => (
            <div key={n} style={{
              display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700,
              color: step === n ? '#fff' : step > n ? '#4ade80' : 'rgba(255,255,255,.6)',
            }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 900,
                background: step === n ? ACCENT : step > n ? ACCENT : 'rgba(255,255,255,.08)',
                color: '#fff', border: step === n ? `2px solid ${ACCENT}` : '1px solid rgba(255,255,255,.1)',
              }}>
                {step > n ? '✓' : n}
              </div>
              {[t.step1, t.step2, t.step3][n - 1]}
              {n < 3 && <div style={{ width: 16, height: 1, background: 'rgba(255,255,255,.1)' }} />}
            </div>
          ))}
        </div>

        <div className="login-card" style={{ maxWidth: '100%', overflow: 'hidden', paddingTop: 0 }}>
          <div style={{ height: 4, background: `linear-gradient(90deg, ${ACCENT}, #4ade80)`, margin: '0 -44px 32px', width: 'calc(100% + 88px)' }} />

          <div className="login-badge">{t.badge}</div>
          <h1 className="login-title">{t.title} <span style={{ color: ACCENT }}>2026</span></h1>

          {urlError && <div className="login-error" style={{ margin: '14px 0 0' }}>{urlError}</div>}

          {/* ══ STEP 1 — Dados pessoais ══ */}
          {step === 1 && (
            <div>
              {/* Invite banner (when coming from club invite link) */}
              {inviteBanner ? (
                <div style={{ margin: '14px 0 20px', padding: '14px 16px', borderRadius: 12, background: '#f0fdf4', border: '1.5px solid #86efac', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{ fontSize: 18, flexShrink: 0, lineHeight: 1.4 }}>🏈</div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#166534', marginBottom: 3 }}>
                      Convite de {inviteBanner.club_name}
                    </div>
                    <div style={{ fontSize: 12, color: '#166534', lineHeight: 1.65 }}>
                      Você foi adicionado ao roster do clube{inviteBanner.category ? ` na categoria ${inviteBanner.category}` : ''}. Complete o cadastro abaixo usando o mesmo e-mail em que recebeu o convite.
                    </div>
                  </div>
                </div>
              ) : (
                /* Generic alert — só no step 1 */
                <div style={{ margin: '14px 0 20px', padding: '14px 16px', borderRadius: 12, background: '#fefce8', border: '1px solid #fcd34d', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{ fontSize: 18, flexShrink: 0, lineHeight: 1.4 }}>⚠️</div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#92400e', marginBottom: 3 }}>{t.alertTitle}</div>
                    <div style={{ fontSize: 12, color: '#92400e', lineHeight: 1.65 }}>{t.alertText}</div>
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ gridColumn: '1/-1' }}>
                  <label className="login-label">{t.name}</label>
                  <input className="login-input" style={iStyle} value={form.name}
                    onChange={e => set('name', e.target.value)} placeholder="Seu nome completo" />
                  {errors.name && <div className="login-error" style={{ marginTop: 4 }}>{errors.name}</div>}
                </div>

                <div style={{ gridColumn: '1/-1' }}>
                  <label className="login-label">{t.email}</label>
                  <input className="login-input" style={iStyle} type="email" value={form.email}
                    onChange={e => set('email', e.target.value)} placeholder="email@seuclube.com" autoComplete="email" />
                  <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>ℹ️ {t.emailHint}</div>
                  {errors.email && <div className="login-error" style={{ marginTop: 4 }}>{errors.email}</div>}
                </div>

                <div>
                  <label className="login-label">{t.birthdate}</label>
                  <input className="login-input" style={iStyle} type="date" value={form.birthdate}
                    onChange={e => set('birthdate', e.target.value)} />
                  {errors.birthdate && <div className="login-error" style={{ marginTop: 4 }}>{errors.birthdate}</div>}
                </div>

                <div>
                  <label className="login-label">{t.nationality}</label>
                  <input className="login-input" style={iStyle} value={form.nationality}
                    onChange={e => set('nationality', e.target.value)} placeholder="Ex: Brasil, EUA..." />
                  {errors.nationality && <div className="login-error" style={{ marginTop: 4 }}>{errors.nationality}</div>}
                </div>

                <div>
                  <label className="login-label">{t.whatsapp}</label>
                  <input className="login-input" style={iStyle} value={form.whatsapp}
                    onChange={e => set('whatsapp', e.target.value)} placeholder="+55 11 99999-0000" />
                  {errors.whatsapp && <div className="login-error" style={{ marginTop: 4 }}>{errors.whatsapp}</div>}
                </div>

                <div>
                  <label className="login-label">{t.instagram}</label>
                  <input className="login-input" style={iStyle} value={form.instagram}
                    onChange={e => set('instagram', e.target.value)} placeholder={t.instagramPlaceholder} />
                  {errors.instagram && <div className="login-error" style={{ marginTop: 4 }}>{errors.instagram}</div>}
                </div>

                <div style={{ gridColumn: '1/-1' }}>
                  <label className="login-label">{t.position}</label>
                  <select className="login-input" style={{ ...iStyle, cursor: 'pointer' }}
                    value={form.position} onChange={e => set('position', e.target.value)}>
                    <option value="">{t.positionDefault}</option>
                    {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  {errors.position && <div className="login-error" style={{ marginTop: 4 }}>{errors.position}</div>}
                </div>
              </div>

              <button className="login-btn" onClick={() => goNext(validateStep1, 2)}
                style={{ background: ACCENT, color: '#fff', boxShadow: `0 8px 28px ${ACCENT}55`, marginTop: 16 }}>
                {t.btnNext}
              </button>
            </div>
          )}

          {/* ══ STEP 2 — Foto + Histórico ══ */}
          {step === 2 && (
            <div>
              {/* Photo upload */}
              <label className="login-label">{t.photoLabel}</label>
              <input ref={fileRef} type="file" accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                style={{ display: 'none' }} onChange={handlePhoto} />
              <div style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', borderRadius: 12,
                border: errors.photo ? '1px solid #fca5a5' : '1px solid #e2e8f0',
                background: '#f8fafc', cursor: 'pointer', marginBottom: 4,
              }} onClick={() => fileRef.current?.click()}>
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" style={{
                    width: 60, height: 60, borderRadius: '50%', objectFit: 'cover',
                    border: `2px solid ${ACCENT}`,
                  }} />
                ) : (
                  <div style={{
                    width: 60, height: 60, borderRadius: '50%', flexShrink: 0,
                    background: '#e2e8f0', border: '1.5px dashed #cbd5e1',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
                  }}>🧑</div>
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: photoPreview ? '#0f172a' : '#94a3b8', marginBottom: 2 }}>
                    {photoPreview ? photoFile?.name : 'Nenhuma foto selecionada'}
                  </div>
                  <div style={{ fontSize: 10, color: '#94a3b8', letterSpacing: '.4px' }}>{t.photoHint}</div>
                </div>
                <div style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: '.5px',
                  color: ACCENT, padding: '6px 12px', borderRadius: 8,
                  border: `1px solid ${ACCENT}55`, background: `${ACCENT}18`, flexShrink: 0,
                }}>
                  {photoPreview ? t.photoChange : t.photoBtn}
                </div>
              </div>
              {errors.photo && <div className="login-error" style={{ marginBottom: 12 }}>{errors.photo}</div>}

              {/* Histórico */}
              <label className="login-label" style={{ marginTop: 16 }}>{t.historyLabel}</label>
              <textarea className="login-input" style={{ ...iStyle, minHeight: 120, resize: 'vertical', lineHeight: 1.6 }}
                value={form.history} onChange={e => set('history', e.target.value)}
                placeholder={t.historyPlaceholder} />
              {errors.history && <div className="login-error" style={{ marginTop: 4 }}>{errors.history}</div>}

              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <button className="login-btn" onClick={() => setStep(1)}
                  style={{ background: '#f1f5f9', color: '#475569', boxShadow: 'none', border: '1px solid #e2e8f0', flex: 1 }}>
                  {t.btnBack}
                </button>
                <button className="login-btn" onClick={() => goNext(validateStep2, 3)}
                  style={{ background: ACCENT, color: '#fff', boxShadow: `0 8px 28px ${ACCENT}55`, flex: 2 }}>
                  {t.btnNext}
                </button>
              </div>
            </div>
          )}

          {/* ══ STEP 3 — Termos + Conta ══ */}
          {step === 3 && (
            <form onSubmit={handleSubmit}>
              {/* Terms */}
              <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 8 }}>
                {t.termsSection}
              </div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 14, lineHeight: 1.5 }}>{t.termsHint}</div>
              {TERMS_META.map(meta => (
                <TermCard key={meta.key} meta={meta} t={t}
                  accepted={!!termsAccepted[meta.key]}
                  onAccept={() => setTermsAccepted(prev => ({ ...prev, [meta.key]: true }))}
                />
              ))}
              {errors.terms && <div className="login-error" style={{ marginBottom: 12 }}>{errors.terms}</div>}

              {/* Progress pills */}
              <div style={{ display: 'flex', gap: 4, marginBottom: 20, marginTop: 4 }}>
                {TERMS_META.map(m => (
                  <div key={m.key} style={{
                    flex: 1, height: 3, borderRadius: 2,
                    background: termsAccepted[m.key] ? m.color : '#e2e8f0',
                    transition: 'background .3s',
                  }} />
                ))}
              </div>

              {/* Password */}
              <label className="login-label">{t.password}</label>
              <input className="login-input" style={iStyle} type="password" value={form.password}
                onChange={e => set('password', e.target.value)} placeholder="Mínimo 8 caracteres" autoComplete="new-password" />
              {errors.password && <div className="login-error" style={{ marginTop: 4 }}>{errors.password}</div>}

              <label className="login-label" style={{ marginTop: 14 }}>{t.confirmPassword}</label>
              <input className="login-input" style={iStyle} type="password" value={form.confirm}
                onChange={e => set('confirm', e.target.value)} placeholder="Repita a senha" autoComplete="new-password" />
              {errors.confirm && <div className="login-error" style={{ marginTop: 4 }}>{errors.confirm}</div>}

              {serverError && <div className="login-error" style={{ marginTop: 12 }}>{serverError}</div>}

              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <button type="button" className="login-btn" onClick={() => setStep(2)}
                  style={{ background: '#f1f5f9', color: '#475569', boxShadow: 'none', border: '1px solid #e2e8f0', flex: 1 }}>
                  {t.btnBack}
                </button>
                <button type="submit" className="login-btn" disabled={loading}
                  style={{ background: ACCENT, color: '#fff', boxShadow: `0 8px 28px ${ACCENT}55`, flex: 2 }}>
                  {loading ? t.btnLoading : t.btnSubmit}
                </button>
              </div>
            </form>
          )}

          <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: '#64748b' }}>
            {t.loginLink}{' '}
            <a href="/portal/atletas/login" style={{ color: ACCENT, textDecoration: 'none', fontWeight: 700 }}>{t.login}</a>
          </div>
          <div style={{ marginTop: 10, textAlign: 'center' }}>
            <a href="/portal" style={{ fontSize: 12, color: '#94a3b8', textDecoration: 'none' }}>{t.back}</a>
          </div>
        </div>
      </div>
    </div>
  );
}
