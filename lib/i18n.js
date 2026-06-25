// ── BFWC i18n — shared translations ──────────────────────────────

export const LANGS = [
  { code: 'pt', label: 'PT', flag: '🇧🇷', name: 'Português' },
  { code: 'en', label: 'EN', flag: '🇺🇸', name: 'English'   },
  { code: 'es', label: 'ES', flag: '🇦🇷', name: 'Español'   },
];

/** Detect language: localStorage > URL ?lang= > browser > 'pt' */
export function detectLang() {
  if (typeof window === 'undefined') return 'pt';
  const saved = localStorage.getItem('bfwc_lang');
  if (saved && ['pt','en','es'].includes(saved)) return saved;
  const param = new URLSearchParams(window.location.search).get('lang');
  if (param && ['pt','en','es'].includes(param)) return param;
  const nav = (navigator.language || '').toLowerCase();
  if (nav.startsWith('es')) return 'es';
  if (nav.startsWith('en')) return 'en';
  return 'pt';
}

export function saveLang(code) {
  if (typeof window !== 'undefined') localStorage.setItem('bfwc_lang', code);
}

/** t(key, lang) → translated string */
export function t(key, lang = 'pt') {
  const entry = translations[lang]?.[key] ?? translations['pt']?.[key];
  return entry ?? key;
}

// ── All translations ──────────────────────────────────────────────
export const translations = {

  /* ══════════════════════════════════════════════════════════
     LANDING PAGE
  ══════════════════════════════════════════════════════════ */
  pt: {
    navEvent: 'Evento', navClubs: 'Clubes', navTravel: 'Viagem', navPartners: 'Parceiros', navContact: 'Contato',
    heroEyebrow: 'Brasil Flag World Championship',
    heroTitle: 'O Mundial de Flag Football no Brasil.',
    heroText: 'Uma experiência internacional premium para clubes, atletas, delegações, marcas e fãs, conectando competição, turismo esportivo e cultura brasileira.',
    ctaPrimary: 'Cadastrar interesse do clube', ctaSecondary: 'Conhecer pacotes de viagem',
    clubTitle: 'Inscrição de interesse para clubes',
    clubText: 'O cadastro não garante vaga automática. A organização analisará perfil, categoria, país, histórico competitivo e capacidade de participação para aprovação oficial.',
    travelTitle: 'Blue Panda Travel', travelText: 'Agência oficial de viagens do Mundial, responsável por apoiar delegações com hotéis, transfers, experiências no Rio e suporte internacional.',

    /* ── Common ── */
    save: 'Salvar progresso', finish: '🏁 Finalizar inscrição', saving: 'Salvando...', loading: 'Carregando...',
    logout: 'Sair', cancel: 'Cancelar', optional: 'opcional', select: 'Selecionar...',

    /* ── Header ── */
    portalTitle: 'Portal dos Atletas',
    profileComplete: '✓ Inscrição finalizada',
    profileIncomplete: '⚠ Perfil incompleto',
    alertBanner: 'Complete seu perfil e aceite os termos para finalizar',
    alertCta: '→ Agora',

    /* ── Tabs ── */
    tabProfile: 'Meu Perfil', tabChampionship: 'Campeonato',

    /* ── Progress ── */
    progressTitle: 'Progresso da inscrição',
    stepPersonal: 'Dados pessoais', stepEmergency: 'Contato de emergência',
    stepSport: 'Dados esportivos', stepTerms: 'Termos',

    /* ── Photo ── */
    photoSection: 'Foto de perfil',
    photoTitle: 'Sua foto no campeonato',
    photoDesc: 'Use uma foto nítida do seu rosto com fundo branco. De preferência com a camisa do seu time. Ela será usada na credencial do evento e no perfil público.',
    photoChange: 'Clique para alterar', photoAdd: 'Clique para adicionar foto',
    photoHint: 'JPG / PNG / WebP · máx. 5 MB', photoAlter: 'ALTERAR',
    photoTagPro: 'Fundo branco', photoTagBg: 'Camisa do time', photoTagFace: 'Rosto centralizado',

    /* ── Personal ── */
    personalSection: 'Dados pessoais',
    fullName: 'Nome completo', nationality: 'Nacionalidade *',
    nationalityPh: 'Ex: Brasileiro, Americano...',
    phone: 'Telefone / WhatsApp *',
    document: 'CPF ou Passaporte *',
    documentPh: '000.000.000-00 ou nº do passaporte',

    /* ── Emergency ── */
    emergencySection: 'Contato de emergência',
    emergencyNote: 'Acionado apenas em emergências médicas durante o evento.',
    emergencyName: 'Nome do contato *', emergencyNamePh: 'Nome completo',
    emergencyPhone: 'Telefone do contato *', emergencyRel: 'Relação com o atleta',
    relParent: 'Pai / Mãe', relSpouse: 'Cônjuge / Companheiro(a)',
    relSibling: 'Irmão / Irmã', relFriend: 'Amigo(a)', relOther: 'Outro',

    /* ── Sports ── */
    sportSection: 'Dados esportivos',
    position: 'Posição principal *', positionPh: 'Selecionar posição...',
    shirtSize: 'Tamanho de camiseta', shirtPh: 'Selecionar tamanho...',

    /* ── Social ── */
    socialSection: 'Redes sociais',

    /* ── Terms ── */
    termsSection: 'Termos e aceites',
    termsHint: 'Leia cada termo clicando sobre ele. Todos são obrigatórios para finalizar sua inscrição.',
    termsRequired: 'Obrigatório — clique para ler e aceitar',
    termsAccepted: '✓ Aceito', termAcceptBtn: 'Li e aceito',

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

    /* ── Messages ── */
    savedComplete: '✅ Perfil completo! Inscrição finalizada.',
    savedPartial: '✓ Progresso salvo! Complete os campos obrigatórios e aceite todos os termos.',

    /* ── Championship ── */
    teams: 'Times', athletes: 'Atletas', countries: 'Países',
    tabTeams: '🏆 Times', tabStats: '📊 Stats', tabCountries: '🌍 Países',
    all: 'Todos', noTeams: 'Nenhum time', athletesLbl: 'atletas',
    distribution: 'Distribuição por categoria', noData: 'Nenhum dado',
  },

  en: {
    navEvent: 'Event', navClubs: 'Clubs', navTravel: 'Travel', navPartners: 'Partners', navContact: 'Contact',
    heroEyebrow: 'Brazil Flag World Championship',
    heroTitle: 'The global flag football stage in Brazil.',
    heroText: 'A premium international experience for clubs, athletes, delegations, brands and fans, connecting competition, sports tourism and Brazilian culture.',
    ctaPrimary: 'Submit club interest', ctaSecondary: 'Explore travel packages',
    clubTitle: 'Club interest application',
    clubText: 'Submission does not guarantee automatic entry. The organization will review profile, category, country, competitive history and participation capacity for official approval.',
    travelTitle: 'Blue Panda Travel', travelText: 'Official travel agency of the championship, supporting delegations with hotels, transfers, Rio experiences and international assistance.',

    /* ── Common ── */
    save: 'Save progress', finish: '🏁 Complete registration', saving: 'Saving...', loading: 'Loading...',
    logout: 'Log out', cancel: 'Cancel', optional: 'optional', select: 'Select...',

    /* ── Header ── */
    portalTitle: 'Athletes Portal',
    profileComplete: '✓ Registration complete',
    profileIncomplete: '⚠ Incomplete profile',
    alertBanner: 'Complete your profile and accept the terms to finish',
    alertCta: '→ Now',

    /* ── Tabs ── */
    tabProfile: 'My Profile', tabChampionship: 'Championship',

    /* ── Progress ── */
    progressTitle: 'Registration progress',
    stepPersonal: 'Personal info', stepEmergency: 'Emergency contact',
    stepSport: 'Sports data', stepTerms: 'Terms',

    /* ── Photo ── */
    photoSection: 'Profile photo',
    photoTitle: 'Your championship photo',
    photoDesc: 'Use a clear face photo with a white background. Preferably wearing your team jersey. It will be used on your event credential and public profile.',
    photoChange: 'Click to change', photoAdd: 'Click to add photo',
    photoHint: 'JPG / PNG / WebP · max 5 MB', photoAlter: 'CHANGE',
    photoTagPro: 'White background', photoTagBg: 'Team jersey', photoTagFace: 'Centered face',

    /* ── Personal ── */
    personalSection: 'Personal data',
    fullName: 'Full name', nationality: 'Nationality *',
    nationalityPh: 'Ex: Brazilian, American...',
    phone: 'Phone / WhatsApp *',
    document: 'CPF or Passport *',
    documentPh: '000.000.000-00 or passport number',

    /* ── Emergency ── */
    emergencySection: 'Emergency contact',
    emergencyNote: 'Only contacted in medical emergencies during the event.',
    emergencyName: 'Contact name *', emergencyNamePh: 'Full name',
    emergencyPhone: 'Contact phone *', emergencyRel: 'Relation to athlete',
    relParent: 'Father / Mother', relSpouse: 'Spouse / Partner',
    relSibling: 'Brother / Sister', relFriend: 'Friend', relOther: 'Other',

    /* ── Sports ── */
    sportSection: 'Sports data',
    position: 'Main position *', positionPh: 'Select position...',
    shirtSize: 'Shirt size', shirtPh: 'Select size...',

    /* ── Social ── */
    socialSection: 'Social media',

    /* ── Terms ── */
    termsSection: 'Terms & agreements',
    termsHint: 'Read each term by clicking on it. All are required to complete your registration.',
    termsRequired: 'Required — click to read and accept',
    termsAccepted: '✓ Accepted', termAcceptBtn: 'I have read and accept',

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

    /* ── Messages ── */
    savedComplete: '✅ Profile complete! Registration finished.',
    savedPartial: '✓ Progress saved! Complete the required fields and accept all terms.',

    /* ── Championship ── */
    teams: 'Teams', athletes: 'Athletes', countries: 'Countries',
    tabTeams: '🏆 Teams', tabStats: '📊 Stats', tabCountries: '🌍 Countries',
    all: 'All', noTeams: 'No teams', athletesLbl: 'athletes',
    distribution: 'Distribution by category', noData: 'No data',
  },

  es: {
    navEvent: 'Evento', navClubs: 'Clubes', navTravel: 'Viaje', navPartners: 'Socios', navContact: 'Contacto',
    heroEyebrow: 'Brasil Flag World Championship',
    heroTitle: 'El escenario mundial del flag football en Brasil.',
    heroText: 'Una experiencia internacional premium para clubes, atletas, delegaciones, marcas y fanáticos, conectando competencia, turismo deportivo y cultura brasileña.',
    ctaPrimary: 'Registrar interés del club', ctaSecondary: 'Ver paquetes de viaje',
    clubTitle: 'Solicitud de interés para clubes',
    clubText: 'El registro no garantiza cupo automático. La organización analizará perfil, categoría, país, historial competitivo y capacidad de participación para aprobación oficial.',
    travelTitle: 'Blue Panda Travel', travelText: 'Agencia oficial de viajes del Mundial, apoyando delegaciones con hoteles, traslados, experiencias en Río y asistencia internacional.',

    /* ── Common ── */
    save: 'Guardar progreso', finish: '🏁 Finalizar inscripción', saving: 'Guardando...', loading: 'Cargando...',
    logout: 'Salir', cancel: 'Cancelar', optional: 'opcional', select: 'Seleccionar...',

    /* ── Header ── */
    portalTitle: 'Portal de Atletas',
    profileComplete: '✓ Inscripción finalizada',
    profileIncomplete: '⚠ Perfil incompleto',
    alertBanner: 'Completa tu perfil y acepta los términos para finalizar',
    alertCta: '→ Ahora',

    /* ── Tabs ── */
    tabProfile: 'Mi Perfil', tabChampionship: 'Campeonato',

    /* ── Progress ── */
    progressTitle: 'Progreso de inscripción',
    stepPersonal: 'Datos personales', stepEmergency: 'Contacto de emergencia',
    stepSport: 'Datos deportivos', stepTerms: 'Términos',

    /* ── Photo ── */
    photoSection: 'Foto de perfil',
    photoTitle: 'Tu foto en el campeonato',
    photoDesc: 'Usa una foto clara de tu rostro con fondo blanco. De preferencia con la camiseta de tu equipo. Se usará en la credencial del evento y perfil público.',
    photoChange: 'Clic para cambiar', photoAdd: 'Clic para agregar foto',
    photoHint: 'JPG / PNG / WebP · máx. 5 MB', photoAlter: 'CAMBIAR',
    photoTagPro: 'Fondo blanco', photoTagBg: 'Camiseta del equipo', photoTagFace: 'Rostro centrado',

    /* ── Personal ── */
    personalSection: 'Datos personales',
    fullName: 'Nombre completo', nationality: 'Nacionalidad *',
    nationalityPh: 'Ej: Brasileiro, Americano...',
    phone: 'Teléfono / WhatsApp *',
    document: 'CPF o Pasaporte *',
    documentPh: '000.000.000-00 o número de pasaporte',

    /* ── Emergency ── */
    emergencySection: 'Contacto de emergencia',
    emergencyNote: 'Solo se contacta en emergencias médicas durante el evento.',
    emergencyName: 'Nombre del contacto *', emergencyNamePh: 'Nombre completo',
    emergencyPhone: 'Teléfono del contacto *', emergencyRel: 'Relación con el atleta',
    relParent: 'Padre / Madre', relSpouse: 'Cónyuge / Pareja',
    relSibling: 'Hermano / Hermana', relFriend: 'Amigo(a)', relOther: 'Otro',

    /* ── Sports ── */
    sportSection: 'Datos deportivos',
    position: 'Posición principal *', positionPh: 'Seleccionar posición...',
    shirtSize: 'Talla de camiseta', shirtPh: 'Seleccionar talla...',

    /* ── Social ── */
    socialSection: 'Redes sociales',

    /* ── Terms ── */
    termsSection: 'Términos y aceptaciones',
    termsHint: 'Lee cada término haciendo clic. Todos son obligatorios para finalizar tu inscripción.',
    termsRequired: 'Obligatorio — clic para leer y aceptar',
    termsAccepted: '✓ Aceptado', termAcceptBtn: 'He leído y acepto',

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

    /* ── Messages ── */
    savedComplete: '✅ ¡Perfil completo! Inscripción finalizada.',
    savedPartial: '✓ ¡Progreso guardado! Completa los campos obligatorios y acepta todos los términos.',

    /* ── Championship ── */
    teams: 'Equipos', athletes: 'Atletas', countries: 'Países',
    tabTeams: '🏆 Equipos', tabStats: '📊 Stats', tabCountries: '🌍 Países',
    all: 'Todos', noTeams: 'Ningún equipo', athletesLbl: 'atletas',
    distribution: 'Distribución por categoría', noData: 'Sin datos',
  },
};
