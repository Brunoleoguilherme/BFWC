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
  ...(process.env.WORLD_ADMIN_EMAIL
    ? process.env.WORLD_ADMIN_EMAIL.split(',').map((e) => e.trim())
    : ['contato@brasilflagworldchampionship.com']),
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