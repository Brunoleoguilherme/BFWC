import { Resend } from 'resend';

export function getResend() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY missing');
  }

  return new Resend(process.env.RESEND_API_KEY);
}

export const fromEmail =
  process.env.FROM_EMAIL ||
  'Brasil Flag World Championship <onboarding@resend.dev>';

export const adminEmail =
  process.env.MUNDIAL_ADMIN_EMAIL ||
  'inscricoes@brasilflagworldchampionship.com';

export function clubConfirmationHtml({ club_name, contact_name, language = 'pt' }) {
  const copyByLang = {
    pt: [
      'Interesse recebido',
      `Olá, ${contact_name}. Recebemos o cadastro de interesse do ${club_name}.`,
      'Nossa equipe irá analisar as informações do clube e entrará em contato com os próximos passos. O envio do formulário não garante vaga automática no Mundial.'
    ],
    en: [
      'Interest received',
      `Hello, ${contact_name}. We received the interest registration from ${club_name}.`,
      'Our team will review the club information and contact you with the next steps. Submitting this form does not guarantee automatic entry into the Championship.'
    ],
    es: [
      'Interés recibido',
      `Hola, ${contact_name}. Recibimos el registro de interés de ${club_name}.`,
      'Nuestro equipo analizará la información del club y se pondrá en contacto con los próximos pasos. El envío del formulario no garantiza una plaza automática en el Mundial.'
    ]
  };

  const copy = copyByLang[language] || copyByLang.pt;

  return `
    <div style="font-family:Arial,sans-serif;background:#06184f;color:#fff;padding:28px">
      <div style="max-width:640px;margin:auto;background:#082574;border:1px solid #1b62ff;border-radius:24px;padding:28px">
        <h1 style="color:#eaff00">${copy[0]}</h1>
        <p>${copy[1]}</p>
        <p>${copy[2]}</p>
        <p style="color:#68ff5b;font-weight:700">Brasil Flag World Championship 2026</p>
      </div>
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