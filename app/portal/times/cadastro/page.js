'use client';

import { useState, useEffect, useRef } from 'react';
import '../../../admin/admin.css';

const CATEGORIES = [
  { value: 'Masculino',  label: 'Masculino' },
  { value: 'Feminino',   label: 'Feminino' },
  { value: 'Sub-15',     label: 'Sub-15' },
  { value: 'Sub-12',     label: 'Sub-12' },
];

const COUNTRIES = [
  'Brasil',
  'Afeganistão', 'África do Sul', 'Albânia', 'Alemanha', 'Andorra', 'Angola', 'Antígua e Barbuda', 'Arábia Saudita', 'Argélia', 'Argentina', 'Armênia', 'Austrália', 'Áustria', 'Azerbaijão',
  'Bahamas', 'Bangladesh', 'Barbados', 'Barein', 'Bélgica', 'Belize', 'Benin', 'Bielorrússia', 'Bolívia', 'Bósnia e Herzegovina', 'Botsuana', 'Brunei', 'Bulgária', 'Burquina Faso', 'Burundi', 'Butão',
  'Cabo Verde', 'Camarões', 'Camboja', 'Canadá', 'Catar', 'Cazaquistão', 'Chade', 'Chile', 'China', 'Chipre', 'Cingapura', 'Colômbia', 'Comores', 'Congo', 'Coreia do Norte', 'Coreia do Sul', 'Costa do Marfim', 'Costa Rica', 'Croácia', 'Cuba',
  'Dinamarca', 'Djibuti', 'Dominica',
  'Egito', 'El Salvador', 'Emirados Árabes Unidos', 'Equador', 'Eritreia', 'Eslováquia', 'Eslovênia', 'Espanha', 'Estados Unidos', 'Estônia', 'Eswatini', 'Etiópia',
  'Fiji', 'Filipinas', 'Finlândia', 'França',
  'Gabão', 'Gâmbia', 'Gana', 'Geórgia', 'Granada', 'Grécia', 'Guatemala', 'Guiana', 'Guiné', 'Guiné Equatorial', 'Guiné-Bissau',
  'Haiti', 'Holanda', 'Honduras', 'Hungria',
  'Iêmen', 'Ilhas Marshall', 'Ilhas Salomão', 'Índia', 'Indonésia', 'Irã', 'Iraque', 'Irlanda', 'Islândia', 'Israel', 'Itália',
  'Jamaica', 'Japão', 'Jordânia',
  'Kiribati', 'Kuwait',
  'Laos', 'Lesoto', 'Letônia', 'Líbano', 'Libéria', 'Líbia', 'Liechtenstein', 'Lituânia', 'Luxemburgo',
  'Macedônia do Norte', 'Madagascar', 'Malásia', 'Malaui', 'Maldivas', 'Mali', 'Malta', 'Marrocos', 'Maurício', 'Mauritânia', 'México', 'Mianmar', 'Micronésia', 'Moçambique', 'Moldávia', 'Mônaco', 'Mongólia', 'Montenegro',
  'Namíbia', 'Nauru', 'Nepal', 'Nicarágua', 'Níger', 'Nigéria', 'Noruega', 'Nova Zelândia',
  'Omã',
  'Palau', 'Panamá', 'Papua-Nova Guiné', 'Paquistão', 'Paraguai', 'Peru', 'Polônia', 'Portugal',
  'Quênia', 'Quirguistão',
  'Reino Unido', 'República Centro-Africana', 'República Dominicana', 'República Tcheca', 'Romênia', 'Ruanda', 'Rússia',
  'Samoa', 'San Marino', 'Santa Lúcia', 'São Cristóvão e Névis', 'São Tomé e Príncipe', 'São Vicente e Granadinas', 'Seicheles', 'Senegal', 'Serra Leoa', 'Sérvia', 'Síria', 'Somália', 'Sri Lanka', 'Sudão', 'Sudão do Sul', 'Suécia', 'Suíça', 'Suriname',
  'Tailândia', 'Taiwan', 'Tajiquistão', 'Tanzânia', 'Timor-Leste', 'Togo', 'Tonga', 'Trinidad e Tobago', 'Tunísia', 'Turcomenistão', 'Turquia', 'Tuvalu',
  'Ucrânia', 'Uganda', 'Uruguai', 'Uzbequistão',
  'Vanuatu', 'Vaticano', 'Venezuela', 'Vietnã',
  'Zâmbia', 'Zimbábue',
  'Outro',
];

const TERMS_PT = `1. DADOS DO CLUBE
As informações fornecidas neste cadastro devem ser verdadeiras e corresponder ao clube/organização representada.

2. APROVAÇÃO
O cadastro no portal está sujeito à aprovação pela organização do BFWC 2026. A inscrição não garante vaga automática no campeonato.

3. RESPONSABILIDADE
O responsável pelo cadastro assume a veracidade das informações e o cumprimento das regras do campeonato.

4. PRIVACIDADE
Os dados serão utilizados exclusivamente para comunicações relacionadas ao BFWC 2026 e gestão das inscrições.

5. CONDUTA
O clube compromete-se a manter conduta esportiva e respeito durante todos os eventos do campeonato.`;

const T = {
  pt: {
    badge: 'Cadastro de Clube',
    title: 'BFWC',
    sub: 'Crie sua conta para acessar o portal',
    step1: 'Dados do Clube',
    step2: 'Categorias',
    step3: 'Conta & Termos',
    clubName: 'Nome do clube *',
    country: 'País *',
    city: 'Cidade',
    contactName: 'Nome do responsável *',
    contactRole: 'Cargo / Função',
    email: 'E-mail *',
    whatsapp: 'WhatsApp',
    logoLabel: 'Logo do clube',
    logoHint: 'PNG, JPG ou JPEG · Máx. 2 MB',
    logoBtn: 'Escolher arquivo',
    logoChange: 'Trocar imagem',
    categories: 'Categorias que pretende participar *',
    athletesPerCat: 'Número de atletas por categoria',
    password: 'Senha *',
    confirmPassword: 'Confirmar senha *',
    terms: 'Termos e Condições',
    acceptTerms: 'Li e aceito os termos e condições',
    btnNext: 'Continuar →',
    btnBack: '← Voltar',
    btnSubmit: 'Criar conta',
    btnLoading: 'Criando conta...',
    loginLink: 'Já tem conta?',
    login: 'Fazer login',
    back: '← Voltar ao portal',
    successTitle: 'Cadastro realizado!',
    successMsg: 'Enviamos um e-mail de confirmação para <strong>{email}</strong>. Verifique sua caixa de entrada (e spam) e clique no link para ativar sua conta.',
    successNote: 'Após a verificação, o administrador analisará seu cadastro. Você receberá um e-mail quando for aprovado.',
    required: 'Campo obrigatório',
    passwordMin: 'Senha deve ter no mínimo 8 caracteres',
    passwordMatch: 'As senhas não coincidem',
    categoryMin: 'Selecione ao menos uma categoria',
    termsRequired: 'Você deve aceitar os termos',
    logoInvalidType: 'Formato inválido. Use PNG, JPG ou JPEG.',
    logoTooLarge: 'Arquivo muito grande. Máximo 2 MB.',
    deadlinesTitle: '📅 Prazos de inscrição',
    deadlinesText: 'De <strong>08/07 a 12/07</strong> a inscrição é exclusiva para times <strong>já pré-inscritos</strong>. A partir de <strong>13/07</strong>, aberta para qualquer time.',
    sameEmail: '⚠️ Use o <strong>mesmo e-mail</strong> cadastrado na pré-inscrição para concluir o cadastro.',
    contactLabel: 'Dúvidas? E-mail',
    selectCountry: 'Selecione o país',
  },
  en: {
    badge: 'Club Registration',
    title: 'BFWC',
    sub: 'Create your account to access the portal',
    step1: 'Club Info',
    step2: 'Categories',
    step3: 'Account & Terms',
    clubName: 'Club name *',
    country: 'Country *',
    city: 'City',
    contactName: 'Contact name *',
    contactRole: 'Role / Position',
    email: 'Email *',
    whatsapp: 'WhatsApp',
    logoLabel: 'Club logo',
    logoHint: 'PNG, JPG or JPEG · Max 2 MB',
    logoBtn: 'Choose file',
    logoChange: 'Change image',
    categories: 'Categories you plan to enter *',
    athletesPerCat: 'Number of athletes per category',
    password: 'Password *',
    confirmPassword: 'Confirm password *',
    terms: 'Terms and Conditions',
    acceptTerms: 'I have read and accept the terms and conditions',
    btnNext: 'Continue →',
    btnBack: '← Back',
    btnSubmit: 'Create account',
    btnLoading: 'Creating account...',
    loginLink: 'Already have an account?',
    login: 'Log in',
    back: '← Back to portal',
    successTitle: 'Registration complete!',
    successMsg: 'We sent a confirmation email to <strong>{email}</strong>. Check your inbox (and spam) and click the link to activate your account.',
    successNote: 'After verification, the administrator will review your registration. You will receive an email when approved.',
    required: 'Required field',
    passwordMin: 'Password must be at least 8 characters',
    passwordMatch: 'Passwords do not match',
    categoryMin: 'Select at least one category',
    termsRequired: 'You must accept the terms',
    logoInvalidType: 'Invalid format. Use PNG, JPG or JPEG.',
    logoTooLarge: 'File too large. Maximum 2 MB.',
    deadlinesTitle: '📅 Registration deadlines',
    deadlinesText: 'From <strong>Jul 8–12</strong>, registration is exclusive to <strong>already pre-registered</strong> teams. From <strong>Jul 13</strong>, open to any team.',
    sameEmail: '⚠️ Use the <strong>same email</strong> from your pre-registration to complete sign-up.',
    contactLabel: 'Questions? Email',
    selectCountry: 'Select country',
  },
  es: {
    badge: 'Registro de Club',
    title: 'BFWC',
    sub: 'Crea tu cuenta para acceder al portal',
    step1: 'Datos del Club',
    step2: 'Categorías',
    step3: 'Cuenta y Términos',
    clubName: 'Nombre del club *',
    country: 'País *',
    city: 'Ciudad',
    contactName: 'Nombre del responsable *',
    contactRole: 'Cargo / Función',
    email: 'Correo electrónico *',
    whatsapp: 'WhatsApp',
    logoLabel: 'Logo del club',
    logoHint: 'PNG, JPG o JPEG · Máx. 2 MB',
    logoBtn: 'Elegir archivo',
    logoChange: 'Cambiar imagen',
    categories: 'Categorías en las que planea participar *',
    athletesPerCat: 'Número de atletas por categoría',
    password: 'Contraseña *',
    confirmPassword: 'Confirmar contraseña *',
    terms: 'Términos y Condiciones',
    acceptTerms: 'He leído y acepto los términos y condiciones',
    btnNext: 'Continuar →',
    btnBack: '← Volver',
    btnSubmit: 'Crear cuenta',
    btnLoading: 'Creando cuenta...',
    loginLink: '¿Ya tienes cuenta?',
    login: 'Iniciar sesión',
    back: '← Volver al portal',
    successTitle: '¡Registro completado!',
    successMsg: 'Enviamos un correo de confirmación a <strong>{email}</strong>. Revisa tu bandeja (y spam) y haz clic en el enlace para activar tu cuenta.',
    successNote: 'Tras la verificación, el administrador revisará tu registro. Recibirás un correo cuando sea aprobado.',
    required: 'Campo obligatorio',
    passwordMin: 'La contraseña debe tener al menos 8 caracteres',
    passwordMatch: 'Las contraseñas no coinciden',
    categoryMin: 'Selecciona al menos una categoría',
    termsRequired: 'Debes aceptar los términos',
    logoInvalidType: 'Formato inválido. Usa PNG, JPG o JPEG.',
    logoTooLarge: 'Archivo demasiado grande. Máximo 2 MB.',
    deadlinesTitle: '📅 Plazos de inscripción',
    deadlinesText: 'Del <strong>08/07 al 12/07</strong> la inscripción es exclusiva para equipos <strong>ya pre-inscritos</strong>. A partir del <strong>13/07</strong>, abierta para cualquier equipo.',
    sameEmail: '⚠️ Usa el <strong>mismo correo</strong> registrado en la pre-inscripción para completar el registro.',
    contactLabel: '¿Dudas? Correo',
    selectCountry: 'Selecciona el país',
  },
};

export default function CadastroPage() {
  const [lang, setLang] = useState('pt');
  const [langChosen, setLangChosen] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState('');
  const [errors, setErrors] = useState({});
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    club_name: '', country: '', city: '',
    contact_name: '', contact_role: '',
    email: '', whatsapp: '',
    categories: [],
    athletes_per_category: {},
    password: '', confirmPassword: '',
    terms: false,
  });

  useEffect(() => {
    const saved = localStorage.getItem('bfwc_language') || localStorage.getItem('bfwc_lang');
    if (saved && T[saved]) setLang(saved); // usa como padrão, mas a tela de escolha ainda aparece
  }, []);

  function chooseLang(code) {
    setLang(code);
    setLangChosen(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('bfwc_language', code);
      localStorage.setItem('bfwc_lang', code);
    }
  }

  const t = T[lang];

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: '' }));
  }

  function handleLogoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowed.includes(file.type)) {
      setErrors(er => ({ ...er, logo: t.logoInvalidType }));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setErrors(er => ({ ...er, logo: t.logoTooLarge }));
      return;
    }
    setLogoFile(file);
    setErrors(er => ({ ...er, logo: '' }));
    const reader = new FileReader();
    reader.onload = ev => setLogoPreview(ev.target.result);
    reader.readAsDataURL(file);
  }

  function toggleCategory(val) {
    setForm(f => {
      const next = f.categories.includes(val)
        ? f.categories.filter(c => c !== val)
        : [...f.categories, val];
      const apc = { ...f.athletes_per_category };
      if (!next.includes(val)) delete apc[val];
      return { ...f, categories: next, athletes_per_category: apc };
    });
    setErrors(e => ({ ...e, categories: '' }));
  }

  function setAthleteCount(cat, val) {
    setForm(f => ({ ...f, athletes_per_category: { ...f.athletes_per_category, [cat]: val } }));
  }

  function validateStep(n) {
    const errs = {};
    if (n === 1) {
      if (!form.club_name.trim()) errs.club_name = t.required;
      if (!form.country) errs.country = t.required;
      if (!form.contact_name.trim()) errs.contact_name = t.required;
      if (!form.email.trim() || !form.email.includes('@')) errs.email = t.required;
    }
    if (n === 2) {
      if (!form.categories.length) errs.categories = t.categoryMin;
    }
    if (n === 3) {
      if (!form.password) errs.password = t.required;
      else if (form.password.length < 8) errs.password = t.passwordMin;
      if (form.password !== form.confirmPassword) errs.confirmPassword = t.passwordMatch;
      if (!form.terms) errs.terms = t.termsRequired;
    }
    return errs;
  }

  function nextStep() {
    const errs = validateStep(step);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setStep(s => s + 1);
    window.scrollTo(0, 0);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validateStep(3);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true); setServerError('');
    try {
      const fd = new FormData();
      fd.append('club_name', form.club_name);
      fd.append('country', form.country);
      fd.append('city', form.city);
      fd.append('contact_name', form.contact_name);
      fd.append('contact_role', form.contact_role);
      fd.append('email', form.email);
      fd.append('whatsapp', form.whatsapp);
      fd.append('category', form.categories.map(c => {
        const n = form.athletes_per_category[c];
        return n ? `${c} (${n})` : c;
      }).join(', '));
      fd.append('athletes_count', Object.values(form.athletes_per_category).reduce((s, v) => s + (parseInt(v) || 0), 0) || '');
      fd.append('password', form.password);
      fd.append('language', lang);
      if (logoFile) fd.append('logo', logoFile);

      const res = await fetch('/api/portal/times/register', {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();
      if (data.ok) setSuccess(true);
      else setServerError(data.message || 'Erro ao criar conta.');
    } catch {
      setServerError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = { width: '100%', boxSizing: 'border-box' };

  // Tela de escolha de idioma (entrada do cadastro)
  if (!langChosen) return (
    <div style={{ minHeight: '100vh', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "'Inter', sans-serif", overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: "url('/assets/hero-rio-athletes.png')", backgroundSize: 'cover', backgroundPosition: 'center', zIndex: 0 }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(3,13,31,.80), rgba(3,13,31,.93))', zIndex: 1 }} />
      <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 460, background: 'rgba(10,20,40,.72)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,.14)', borderRadius: 28, padding: '44px 34px', textAlign: 'center', boxShadow: '0 40px 120px rgba(0,0,0,.7)' }}>
        <img src="/assets/bfwc-logo.jpg" alt="BFWC" width={92} height={92} style={{ borderRadius: 18, marginBottom: 20, objectFit: 'cover' }} />
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 9, fontWeight: 900, letterSpacing: 2.5, textTransform: 'uppercase', color: 'rgba(255,255,255,.65)', marginBottom: 12, padding: '5px 14px', borderRadius: 20, background: 'rgba(255,255,255,.08)' }}>🏈 Cadastro de Clube</div>
        <h1 style={{ fontSize: 25, fontWeight: 900, color: '#fff', letterSpacing: -0.8, margin: '0 0 8px', lineHeight: 1.2 }}>Brasil Flag World Championship 2026</h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', margin: '0 0 26px', lineHeight: 1.6 }}>Selecione o idioma · Select your language · Selecciona el idioma</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[['pt', '/assets/flag-br.png', 'BR', 'Entrar em Português'], ['en', '/assets/flag-us.png', 'US', 'Enter in English'], ['es', '/assets/flag-es.png', 'ES', 'Entrar en Español']].map(([code, flag, short, title]) => (
            <button key={code} onClick={() => chooseLang(code)} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 18px', borderRadius: 16, border: '1px solid rgba(255,255,255,.14)', background: 'rgba(255,255,255,.06)', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'all .18s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,.13)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,.06)'; e.currentTarget.style.transform = 'none'; }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '1px solid rgba(255,255,255,.25)' }}>
                <img src={flag} alt={short} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.15)', display: 'block' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, color: '#f4ff00' }}>{short}</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>{title}</div>
              </div>
              <span style={{ color: '#f4ff00', fontSize: 22, fontWeight: 900 }}>→</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // Success screen
  if (success) {
    return (
      <div className="login-root">
        <div className="login-card" style={{ maxWidth: 480, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <div className="login-badge">{t.badge}</div>
          <h1 className="login-title" style={{ justifyContent: 'center' }}>{t.successTitle}</h1>
          <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7, margin: '16px 0' }}
            dangerouslySetInnerHTML={{ __html: t.successMsg.replace('{email}', form.email) }}
          />
          <div style={{ padding: '14px 16px', borderRadius: 10, background: 'rgba(13,75,255,.05)', border: '1px solid rgba(13,75,255,.15)', fontSize: 12, color: '#64748b', lineHeight: 1.6 }}>
            💡 {t.successNote}
          </div>
          <a href="/portal/times/login" className="login-btn" style={{ display: 'block', textAlign: 'center', marginTop: 24, background: '#0D4BFF', color: '#fff', textDecoration: 'none' }}>
            {t.login}
          </a>
          <div style={{ marginTop: 12, textAlign: 'center' }}>
            <a href="/portal" style={{ fontSize: 12, color: '#94a3b8', textDecoration: 'none' }}>{t.back}</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-root" style={{ alignItems: 'flex-start', paddingTop: 40, paddingBottom: 40 }}>
      <div style={{ width: '100%', maxWidth: 560, animation: 'cardIn .55s cubic-bezier(.22,.61,.36,1) both' }}>
        {/* Steps indicator */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, justifyContent: 'center', background: 'rgba(0,0,0,.45)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', borderRadius: 24, padding: '8px 20px', width: 'fit-content', margin: '0 auto 24px' }}>
          {[1, 2, 3].map(n => (
            <div key={n} style={{
              display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700,
              color: step === n ? '#fff' : step > n ? '#4ade80' : 'rgba(255,255,255,.6)',
            }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 900,
                background: step === n ? '#0D4BFF' : step > n ? '#009c3b' : 'rgba(255,255,255,.08)',
                color: step > n ? '#fff' : '#fff',
                border: step === n ? '2px solid #0D4BFF' : '1px solid rgba(255,255,255,.1)',
              }}>
                {step > n ? '✓' : n}
              </div>
              {[t.step1, t.step2, t.step3][n - 1]}
              {n < 3 && <div style={{ width: 20, height: 1, background: 'rgba(255,255,255,.1)' }} />}
            </div>
          ))}
        </div>

        <div className="login-card" style={{ maxWidth: '100%', overflow: 'hidden', paddingTop: 0 }}>
          {/* Accent stripe */}
          <div style={{ height: 4, background: 'linear-gradient(90deg, #0D4BFF, #60a5fa)', margin: '0 -44px 36px', width: 'calc(100% + 88px)' }} />

          <div className="login-badge">{t.badge}</div>
          <h1 className="login-title">{t.title} <span style={{ color: '#0D4BFF' }}>2026</span></h1>
          <p className="login-sub">{t.sub}</p>

          {/* Aviso: prazos de inscrição + contato */}
          <div style={{ marginBottom: 24, padding: '14px 16px', borderRadius: 12, background: '#eff6ff', border: '1px solid #bfdbfe' }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#1e3a8a', marginBottom: 6 }}>{t.deadlinesTitle}</div>
            <div style={{ fontSize: 12.5, color: '#1e40af', lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: t.deadlinesText }} />
            <div style={{ fontSize: 12.5, color: '#1e40af', lineHeight: 1.6, marginTop: 8 }} dangerouslySetInnerHTML={{ __html: t.sameEmail }} />
            <div style={{ fontSize: 12.5, color: '#1e40af', lineHeight: 1.6, marginTop: 8 }}>
              {t.contactLabel} <a href="mailto:contato@brasilflag.com" style={{ color: '#1d4ed8', fontWeight: 700 }}>contato@brasilflag.com</a> · WhatsApp <a href="https://wa.me/5516997754522" target="_blank" rel="noopener noreferrer" style={{ color: '#1d4ed8', fontWeight: 700 }}>(16) 99775-4522</a>.
            </div>
          </div>

          {/* Step 1: Club info */}
          {step === 1 && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="login-label">{t.clubName}</label>
                  <input className="login-input" style={inputStyle} value={form.club_name} onChange={e => set('club_name', e.target.value)} placeholder="Ex: Clube Bandeirante" />
                  {errors.club_name && <div className="login-error" style={{ marginTop: 4 }}>{errors.club_name}</div>}
                </div>
                <div>
                  <label className="login-label">{t.country}</label>
                  <select className="login-input" style={{ ...inputStyle, cursor: 'pointer' }} value={form.country} onChange={e => set('country', e.target.value)}>
                    <option value="">{t.selectCountry}</option>
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.country && <div className="login-error" style={{ marginTop: 4 }}>{errors.country}</div>}
                </div>
                <div>
                  <label className="login-label">{t.city}</label>
                  <input className="login-input" style={inputStyle} value={form.city} onChange={e => set('city', e.target.value)} placeholder="Ex: São Paulo" />
                </div>
                <div>
                  <label className="login-label">{t.contactName}</label>
                  <input className="login-input" style={inputStyle} value={form.contact_name} onChange={e => set('contact_name', e.target.value)} placeholder="Nome completo" />
                  {errors.contact_name && <div className="login-error" style={{ marginTop: 4 }}>{errors.contact_name}</div>}
                </div>
                <div>
                  <label className="login-label">{t.contactRole}</label>
                  <input className="login-input" style={inputStyle} value={form.contact_role} onChange={e => set('contact_role', e.target.value)} placeholder="Ex: Presidente, Técnico" />
                </div>
                <div>
                  <label className="login-label">{t.email}</label>
                  <input className="login-input" style={inputStyle} type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@clube.com" />
                  {errors.email && <div className="login-error" style={{ marginTop: 4 }}>{errors.email}</div>}
                </div>
                <div>
                  <label className="login-label">{t.whatsapp}</label>
                  <input className="login-input" style={inputStyle} value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} placeholder="+55 11 99999-0000" />
                </div>

                {/* Logo upload */}
                <div style={{ gridColumn: '1 / -1', marginTop: 4 }}>
                  <label className="login-label">{t.logoLabel}</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                    style={{ display: 'none' }}
                    onChange={handleLogoChange}
                  />
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '12px 14px', borderRadius: 12,
                    border: errors.logo ? '1px solid #fca5a5' : '1px solid #e2e8f0',
                    background: '#f8fafc',
                    cursor: 'pointer',
                  }} onClick={() => fileInputRef.current?.click()}>
                    {logoPreview ? (
                      <img src={logoPreview} alt="Preview" style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'contain', background: '#e2e8f0' }} />
                    ) : (
                      <div style={{
                        width: 48, height: 48, borderRadius: 8, flexShrink: 0,
                        background: '#e2e8f0', border: '1.5px dashed #cbd5e1',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 20,
                      }}>🏟</div>
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: logoPreview ? '#0f172a' : '#94a3b8', marginBottom: 2 }}>
                        {logoPreview ? logoFile?.name : 'Nenhuma imagem selecionada'}
                      </div>
                      <div style={{ fontSize: 10, color: '#94a3b8', letterSpacing: '.5px' }}>{t.logoHint}</div>
                    </div>
                    <div style={{
                      fontSize: 11, fontWeight: 700, letterSpacing: '.5px',
                      color: '#0D4BFF', padding: '6px 12px', borderRadius: 8,
                      border: '1px solid rgba(13,75,255,.35)', background: 'rgba(13,75,255,.1)',
                      flexShrink: 0,
                    }}>
                      {logoPreview ? t.logoChange : t.logoBtn}
                    </div>
                  </div>
                  {errors.logo && <div className="login-error" style={{ marginTop: 4 }}>{errors.logo}</div>}
                </div>
              </div>

              <button className="login-btn" onClick={nextStep} style={{ background: '#0D4BFF', color: '#fff', boxShadow: '0 8px 28px rgba(13,75,255,.35)', marginTop: 16 }}>
                {t.btnNext}
              </button>
            </div>
          )}

          {/* Step 2: Categories */}
          {step === 2 && (
            <div>
              <label className="login-label">{t.categories}</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                {CATEGORIES.map(cat => {
                  const checked = form.categories.includes(cat.value);
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => toggleCategory(cat.value)}
                      style={{
                        padding: '14px 16px', borderRadius: 12, cursor: 'pointer',
                        border: checked ? '2px solid #0D4BFF' : '1px solid #e2e8f0',
                        background: checked ? 'rgba(13,75,255,.08)' : '#f8fafc',
                        color: checked ? '#0D4BFF' : '#64748b',
                        fontSize: 13, fontWeight: 700, fontFamily: 'inherit',
                        display: 'flex', alignItems: 'center', gap: 10,
                        transition: 'all .15s',
                      }}
                    >
                      <div style={{
                        width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                        border: checked ? '2px solid #0D4BFF' : '2px solid #cbd5e1',
                        background: checked ? '#0D4BFF' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, color: '#fff',
                      }}>
                        {checked ? '✓' : ''}
                      </div>
                      {cat.label}
                    </button>
                  );
                })}
              </div>
              {errors.categories && <div className="login-error">{errors.categories}</div>}

              {form.categories.length > 0 && (
                <div style={{ marginTop: 20 }}>
                  <label className="login-label">{t.athletesPerCat}</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 8 }}>
                    {form.categories.map(cat => (
                      <div key={cat}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 4 }}>{cat}</div>
                        <input
                          className="login-input"
                          style={{ width: '100%', boxSizing: 'border-box' }}
                          type="number" min={1} max={500}
                          value={form.athletes_per_category[cat] || ''}
                          onChange={e => setAthleteCount(cat, e.target.value)}
                          placeholder="Nº de atletas"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <button className="login-btn" onClick={() => setStep(1)} style={{ background: '#f1f5f9', color: '#475569', boxShadow: 'none', border: '1px solid #e2e8f0', flex: 1 }}>
                  {t.btnBack}
                </button>
                <button className="login-btn" onClick={nextStep} style={{ background: '#0D4BFF', color: '#fff', boxShadow: '0 8px 28px rgba(13,75,255,.35)', flex: 2 }}>
                  {t.btnNext}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Account + Terms */}
          {step === 3 && (
            <form onSubmit={handleSubmit}>
              <label className="login-label">{t.password}</label>
              <input className="login-input" style={inputStyle} type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Mínimo 8 caracteres" autoComplete="new-password" />
              {errors.password && <div className="login-error" style={{ marginTop: 4 }}>{errors.password}</div>}

              <label className="login-label" style={{ marginTop: 14 }}>{t.confirmPassword}</label>
              <input className="login-input" style={inputStyle} type="password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} placeholder="Repita a senha" autoComplete="new-password" />
              {errors.confirmPassword && <div className="login-error" style={{ marginTop: 4 }}>{errors.confirmPassword}</div>}

              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 8 }}>{t.terms}</div>
                <div style={{
                  height: 140, overflowY: 'auto', padding: '12px 14px', borderRadius: 10,
                  background: '#f8fafc', border: '1px solid #e2e8f0',
                  fontSize: 11, color: '#64748b', lineHeight: 1.7, whiteSpace: 'pre-line',
                }}>
                  {TERMS_PT}
                </div>
              </div>

              <label style={{
                display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: 14, cursor: 'pointer',
                fontSize: 13, color: form.terms ? '#0f172a' : '#94a3b8',
              }}>
                <div
                  onClick={() => set('terms', !form.terms)}
                  style={{
                    width: 18, height: 18, borderRadius: 4, flexShrink: 0, marginTop: 1,
                    border: form.terms ? '2px solid #0D4BFF' : '2px solid #cbd5e1',
                    background: form.terms ? '#0D4BFF' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, color: '#fff', transition: 'all .15s', cursor: 'pointer',
                  }}
                >
                  {form.terms ? '✓' : ''}
                </div>
                <span onClick={() => set('terms', !form.terms)}>{t.acceptTerms}</span>
              </label>
              {errors.terms && <div className="login-error" style={{ marginTop: 4 }}>{errors.terms}</div>}

              {serverError && <div className="login-error" style={{ marginTop: 12 }}>{serverError}</div>}

              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <button type="button" className="login-btn" onClick={() => setStep(2)} style={{ background: '#f1f5f9', color: '#475569', boxShadow: 'none', border: '1px solid #e2e8f0', flex: 1 }}>
                  {t.btnBack}
                </button>
                <button type="submit" className="login-btn" disabled={loading} style={{ background: '#0D4BFF', color: '#fff', boxShadow: '0 8px 28px rgba(13,75,255,.35)', flex: 2 }}>
                  {loading ? t.btnLoading : t.btnSubmit}
                </button>
              </div>
            </form>
          )}

          <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: '#94a3b8' }}>
            {t.loginLink}{' '}
            <a href="/portal/times/login" style={{ color: '#0D4BFF', textDecoration: 'none', fontWeight: 700 }}>{t.login}</a>
          </div>
          <div style={{ marginTop: 10, textAlign: 'center' }}>
            <a href="/portal" style={{ fontSize: 12, color: '#94a3b8', textDecoration: 'none' }}>{t.back}</a>
          </div>
        </div>
      </div>
    </div>
  );
}
