import { Resend } from 'resend';

export function getResend() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY missing');
  }

  return new Resend(process.env.RESEND_API_KEY);
}

export const fromEmail =
  process.env.EMAIL_FROM ||
  'Brasil Flag World Championship <noreply@brasilflagworldchampionship.com>';

export const adminEmails = [
  'contato@brasilsportsbusiness.com',
  'brunoleoguilherme@gmail.com'
].filter((v, i, arr) => arr.indexOf(v) === i);

export function clubConfirmationHtml({ club_name, contact_name, language = 'pt' }) {
  const copyByLang = {
    pt: [
      'Inscrição recebida com sucesso!',
      `Olá, ${contact_name}! Recebemos a inscrição da equipe <strong>${club_name}</strong> para o Brasil Flag World Championship 2026.`,
      'Nossa equipe analisará o perfil da sua equipe e entraremos em contato em breve com os próximos passos. Fique atento ao seu e-mail.',
      'O envio do formulário não garante vaga automática no campeonato.'
    ],
    en: [
      'Application received!',
      `Hello, ${contact_name}! We received the application from <strong>${club_name}</strong> for the Brasil Flag World Championship 2026.`,
      'Our team will review your team\'s profile and we will get in touch soon with the next steps. Keep an eye on your email.',
      'Submitting this form does not guarantee automatic entry into the championship.'
    ],
    es: [
      '¡Solicitud recibida!',
      `¡Hola, ${contact_name}! Recibimos la solicitud del equipo <strong>${club_name}</strong> para el Brasil Flag World Championship 2026.`,
      'Nuestro equipo revisará el perfil de su equipo y nos pondremos en contacto pronto con los próximos pasos. Esté atento a su correo electrónico.',
      'El envío del formulario no garantiza una plaza automática en el campeonato.'
    ]
  };

  const copy = copyByLang[language] || copyByLang.pt;

  return `
    <div style="font-family:Arial,sans-serif;background:#06184f;color:#fff;padding:28px">
      <div style="max-width:640px;margin:auto;background:#082574;border:1px solid #1b62ff;border-radius:24px;padding:36px">
        <h1 style="color:#eaff00;margin-top:0">${copy[0]}</h1>
        <p style="font-size:16px">${copy[1]}</p>
        <p style="font-size:15px;color:#c8d8f5">${copy[2]}</p>
        <p style="font-size:13px;color:#8fa8d0;border-top:1px solid rgba(255,255,255,.15);padding-top:14px;margin-top:20px">${copy[3]}</p>
        <p style="color:#68ff5b;font-weight:700;margin-bottom:0">Brasil Flag World Championship 2026 — Leme, SP</p>
      </div>
    </div>
  `;
}

export function newsletterConfirmationHtml({ email, language = 'pt' }) {
  const copyByLang = {
    pt: {
      title: 'Bem-vindo ao Brasil Flag World Championship 2026!',
      body: 'Você foi inscrito na nossa lista de novidades. Fique de olho no seu e-mail para receber atualizações sobre o maior campeonato mundial de Flag Football do Brasil.',
      cta: 'Estamos felizes em ter você por aqui. Em breve, novidades incríveis chegam para você!',
      footer: 'Você receberá informações sobre o Brasil Flag World Championship 2026 — Leme, SP — Brasil.'
    },
    en: {
      title: 'Welcome to Brasil Flag World Championship 2026!',
      body: 'You have been added to our newsletter. Keep an eye on your inbox for updates about the biggest Flag Football World Championship in Brazil.',
      cta: 'We are thrilled to have you here. Amazing news is coming your way soon!',
      footer: 'You will receive information about the Brasil Flag World Championship 2026 — Leme, SP — Brasil.'
    },
    es: {
      title: '¡Bienvenido al Brasil Flag World Championship 2026!',
      body: 'Has sido añadido a nuestra lista de novedades. Estate atento a tu correo para recibir actualizaciones sobre el mayor campeonato mundial de Flag Football de Brasil.',
      cta: '¡Estamos felices de tenerte aquí. ¡Pronto llegarán noticias increíbles!',
      footer: 'Recibirás información sobre el Brasil Flag World Championship 2026 — Leme, SP — Brasil.'
    }
  };

  const c = copyByLang[language] || copyByLang.pt;

  return `
    <div style="font-family:Arial,sans-serif;background:#06184f;color:#fff;padding:28px">
      <div style="max-width:640px;margin:auto;background:#082574;border:1px solid #1b62ff;border-radius:24px;padding:36px">
        <h1 style="color:#eaff00;margin-top:0;font-size:24px">${c.title}</h1>
        <p style="font-size:16px;line-height:1.6">${c.body}</p>
        <p style="font-size:15px;color:#c8d8f5;line-height:1.6">${c.cta}</p>
        <p style="font-size:13px;color:#8fa8d0;border-top:1px solid rgba(255,255,255,.15);padding-top:14px;margin-top:20px">${c.footer}</p>
        <p style="color:#68ff5b;font-weight:700;margin-bottom:0">Brasil Flag World Championship 2026 — Leme, SP</p>
      </div>
    </div>
  `;
}

export function adminNewsletterHtml({ email }) {
  return `
    <div style="font-family:Arial,sans-serif">
      <h2>Novo inscrito na newsletter — BFWC 2026</h2>
      <p>Um novo e-mail foi cadastrado na lista de novidades do site.</p>
      <table style="border-collapse:collapse;width:100%;max-width:480px">
        <tr>
          <td style="padding:10px;border-bottom:1px solid #ddd;font-weight:700">E-mail</td>
          <td style="padding:10px;border-bottom:1px solid #ddd">${email}</td>
        </tr>
        <tr>
          <td style="padding:10px;font-weight:700">Data</td>
          <td style="padding:10px">${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</td>
        </tr>
      </table>
    </div>
  `;
}

export function adminClubHtml(data) {
  const fields = Object.entries(data)
    .map(([key, value]) => {
      const formattedValue = Array.isArray(value)
        ? value.join(', ')
        : value || '-';

      return `
        <tr>
          <td style="padding:8px;border-bottom:1px solid #ddd;font-weight:700">${key}</td>
          <td style="padding:8px;border-bottom:1px solid #ddd">${formattedValue}</td>
        </tr>
      `;
    })
    .join('');

  return `
    <div style="font-family:Arial,sans-serif">
      <h2>Novo clube interessado - BFWC 2026</h2>
      <p>Um novo clube realizou cadastro para análise.</p>
      <table style="border-collapse:collapse;width:100%">
        ${fields}
      </table>
      <p><strong>Status inicial:</strong> pendente de análise</p>
    </div>
  `;
}

export function adminValidationHtml(data) {
  const {
    club_name, country, city, contact_name, contact_role,
    email, whatsapp, category,
    athletes_count, athletes_masc, athletes_fem, athletes_sub15, athletes_sub12,
    competitive_history, hosting_preference, travel_support, notes,
    validateUrl,
  } = data;

  const row = (label, value) => value
    ? `<tr>
        <td style="padding:9px 12px;border-bottom:1px solid #1a2a40;color:#8899aa;font-size:12px;font-weight:700;white-space:nowrap;vertical-align:top">${label}</td>
        <td style="padding:9px 12px;border-bottom:1px solid #1a2a40;color:#fff;font-size:13px">${value}</td>
       </tr>`
    : '';

  const catAthletes = [
    athletes_masc  ? `Masculino: ${athletes_masc}`  : '',
    athletes_fem   ? `Feminino: ${athletes_fem}`    : '',
    athletes_sub15 ? `Sub 15: ${athletes_sub15}`    : '',
    athletes_sub12 ? `Sub 12: ${athletes_sub12}`    : '',
  ].filter(Boolean).join(' · ');

  return `<!DOCTYPE html>
<html lang="pt">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#020c1a;font-family:'Inter',Arial,sans-serif">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px">

    <!-- Header -->
    <div style="margin-bottom:28px">
      <div style="font-size:10px;font-weight:800;letter-spacing:3px;text-transform:uppercase;color:#f4ff00;margin-bottom:8px">BFWC 2026 · Nova Inscrição</div>
      <h1 style="margin:0;font-size:26px;font-weight:900;letter-spacing:-1px;color:#fff">${club_name}</h1>
      <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,.4)">${city} · ${country}</p>
    </div>

    <!-- Info table -->
    <div style="background:linear-gradient(145deg,rgba(6,27,58,.8),rgba(2,8,22,.9));border:1px solid rgba(255,255,255,.08);border-radius:16px;overflow:hidden;margin-bottom:24px">
      <table style="width:100%;border-collapse:collapse">
        ${row('Contato', contact_name + (contact_role ? ` · ${contact_role}` : ''))}
        ${row('E-mail', email)}
        ${row('WhatsApp', whatsapp)}
        ${row('Categorias', category)}
        ${row('Atletas (total)', athletes_count)}
        ${catAthletes ? row('Atletas por categoria', catAthletes) : ''}
        ${row('Histórico', competitive_history)}
        ${row('Hospedagem', hosting_preference)}
        ${row('Apoio de viagem', travel_support === 'yes' ? 'Sim' : travel_support === 'no' ? 'Não' : 'Talvez')}
        ${row('Observações', notes)}
      </table>
    </div>

    <!-- CTA button -->
    <div style="text-align:center;margin-bottom:20px">
      <a href="${validateUrl}"
         style="display:inline-block;padding:16px 40px;background:#f4ff00;color:#031020;border-radius:12px;font-size:14px;font-weight:900;letter-spacing:2px;text-transform:uppercase;text-decoration:none">
        ✅ Validar e Adicionar ao Sistema
      </a>
    </div>

    <p style="text-align:center;font-size:11px;color:rgba(255,255,255,.2)">
      Ao clicar no botão, <strong style="color:rgba(255,255,255,.4)">${club_name}</strong> será adicionado como Pré-inscrito no CRM do BFWC 2026.<br>
      Este link é de uso único.
    </p>
  </div>
</body>
</html>`;
}