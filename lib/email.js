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

// URL absoluta da logo (o cliente de e-mail busca a imagem no site)
const emailSiteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.brasilflagworldchampionship.com').replace(/\/$/, '');
export const emailLogoUrl = `${emailSiteUrl}/assets/bfwc-logo-email.png`;

/** <img> da logo BFWC para os e-mails. */
export function emailLogoImg(width = 110, extraStyle = '') {
  return `<img src="${emailLogoUrl}" width="${width}" alt="BFWC 2026" style="display:block;width:${width}px;height:auto;border:0;${extraStyle}">`;
}

export const adminEmails = [
  'contato@brasilsportsbusiness.com',
  'brunoleoguilherme@gmail.com'
].filter((v, i, arr) => arr.indexOf(v) === i);

// ────────────────────────────────────────────────────────────────
//  Base visual dos e-mails (tabelas + inline styles — compatível
//  com Gmail, Outlook e Apple Mail). Padrão do BFWC 2026.
// ────────────────────────────────────────────────────────────────
export function emailShell({
  preheader = '',
  badge = 'BFWC 2026',
  accent = '#22e06a',
  band = '#009c3b',
  title = '',
  subtitle = '',
  innerHtml = '',
  footer = 'Brasil Flag World Championship 2026 · Leme, SP · Brasil',
}) {
  return `<!DOCTYPE html>
<html lang="pt">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark">
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#020a16;-webkit-text-size-adjust:100%">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0">${preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#020a16">
    <tr>
      <td align="center" style="padding:28px 14px">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background:#050f22;border:1px solid #16233d;border-radius:22px;overflow:hidden">

          <tr><td style="height:5px;background:${band};line-height:5px;font-size:5px">&nbsp;</td></tr>

          <tr>
            <td align="center" style="padding:30px 36px 0">${emailLogoImg(110, 'margin:0 auto')}</td>
          </tr>
          <tr>
            <td align="center" style="padding:16px 36px 8px">
              <span style="display:inline-block;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:${accent};padding:6px 16px;border:1px solid ${accent}33;border-radius:20px;font-family:Arial,sans-serif">${badge}</span>
            </td>
          </tr>
          ${title ? `<tr>
            <td align="center" style="padding:18px 36px 6px">
              <h1 style="margin:0;font-size:28px;font-weight:800;letter-spacing:-.5px;color:#ffffff;font-family:Arial,sans-serif;line-height:1.2">${title}</h1>
            </td>
          </tr>` : ''}
          ${subtitle ? `<tr>
            <td align="center" style="padding:0 44px 20px">
              <p style="margin:0;font-size:15px;color:#8ea0ba;font-family:Arial,sans-serif;line-height:1.55">${subtitle}</p>
            </td>
          </tr>` : ''}

          ${innerHtml}

          <tr>
            <td align="center" style="padding:22px 36px 30px">
              <p style="margin:0;font-size:11px;color:#3c4d68;font-family:Arial,sans-serif;line-height:1.7">${footer}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// Card interno padrão para o conteúdo
function emailCard(innerHtml) {
  return `<tr>
    <td style="padding:0 28px 8px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#081733;border:1px solid #16294d;border-radius:18px">
        <tr><td style="padding:28px 30px">${innerHtml}</td></tr>
      </table>
    </td>
  </tr>`;
}

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
  const badgeByLang = { pt: 'BFWC 2026 · Inscrição', en: 'BFWC 2026 · Application', es: 'BFWC 2026 · Inscripción' };

  const inner = emailCard(`
    <p style="margin:0 0 14px;font-size:15px;color:#e3e9f2;font-family:Arial,sans-serif;line-height:1.6">${copy[1]}</p>
    <p style="margin:0 0 18px;font-size:14px;color:#9fb0c8;font-family:Arial,sans-serif;line-height:1.6">${copy[2]}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#1f1405;border:1px solid #3a2708;border-radius:12px">
      <tr><td style="padding:12px 16px;font-size:12px;color:#d69a52;font-family:Arial,sans-serif;line-height:1.55">⚠️ ${copy[3]}</td></tr>
    </table>
  `);

  return emailShell({
    preheader: copy[0],
    badge: badgeByLang[language] || badgeByLang.pt,
    accent: '#5b8bff',
    band: '#0D4BFF',
    title: copy[0],
    innerHtml: inner,
    footer: 'Brasil Flag World Championship 2026 · Leme, SP · Brasil',
  });
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

  const inner = emailCard(`
    <p style="margin:0 0 14px;font-size:15px;color:#e3e9f2;font-family:Arial,sans-serif;line-height:1.6">${c.body}</p>
    <p style="margin:0;font-size:14px;color:#9fb0c8;font-family:Arial,sans-serif;line-height:1.6">${c.cta}</p>
  `);

  return emailShell({
    preheader: c.title,
    badge: 'BFWC 2026 · Newsletter',
    accent: '#22e06a',
    band: '#009c3b',
    title: c.title,
    innerHtml: inner,
    footer: c.footer,
  });
}

export function adminNewsletterHtml({ email }) {
  return `
    <div style="font-family:Arial,sans-serif">
      ${emailLogoImg(90, 'margin:0 0 14px')}
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
      ${emailLogoImg(90, 'margin:0 0 14px')}
      <h2>Novo clube interessado - BFWC 2026</h2>
      <p>Um novo clube realizou cadastro para análise.</p>
      <table style="border-collapse:collapse;width:100%">
        ${fields}
      </table>
      <p><strong>Status inicial:</strong> pendente de análise</p>
    </div>
  `;
}

export function athleteInviteHtml({ athlete_name, club_name, register_url }) {
  const step = (n, txt) => `
        <tr>
          <td valign="top" width="40" style="padding:0 0 14px">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td width="30" height="30" align="center" valign="middle" style="width:30px;height:30px;background:#0b3d20;border:1px solid #14e06422;border-radius:50%;color:#22e06a;font-size:13px;font-weight:800;font-family:Arial,sans-serif">${n}</td></tr></table>
          </td>
          <td valign="middle" style="padding:0 0 14px 4px;font-size:14px;color:#cdd7e5;font-family:Arial,sans-serif;line-height:1.4">${txt}</td>
        </tr>`;

  return `<!DOCTYPE html>
<html lang="pt">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark">
<title>Convocação BFWC 2026</title>
</head>
<body style="margin:0;padding:0;background:#020a16;-webkit-text-size-adjust:100%">
  <!-- preheader -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0">${club_name} convocou você para o Brasil Flag World Championship 2026. Crie sua conta de atleta.</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#020a16">
    <tr>
      <td align="center" style="padding:28px 14px">

        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background:#050f22;border:1px solid #16233d;border-radius:22px;overflow:hidden">

          <!-- Faixa de marca (verde→amarelo) -->
          <tr><td style="height:5px;background:#009c3b;line-height:5px;font-size:5px">&nbsp;</td></tr>

          <!-- Header -->
          <tr>
            <td align="center" style="padding:30px 36px 0">${emailLogoImg(110, 'margin:0 auto')}</td>
          </tr>
          <tr>
            <td align="center" style="padding:16px 36px 8px">
              <span style="display:inline-block;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#22e06a;padding:6px 16px;border:1px solid #14e06433;border-radius:20px;font-family:Arial,sans-serif">BFWC 2026 · Portal do Atleta</span>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:18px 36px 6px">
              <h1 style="margin:0;font-size:30px;font-weight:800;letter-spacing:-.5px;color:#ffffff;font-family:Arial,sans-serif;line-height:1.15">Você foi convocado! 🏈</h1>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:0 44px 26px">
              <p style="margin:0;font-size:15px;color:#8ea0ba;font-family:Arial,sans-serif;line-height:1.55">O clube <strong style="color:#ffffff">${club_name}</strong> adicionou você ao roster para o Brasil Flag World Championship 2026.</p>
            </td>
          </tr>

          <!-- Card interno -->
          <tr>
            <td style="padding:0 28px 8px">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#081733;border:1px solid #16294d;border-radius:18px">
                <tr>
                  <td style="padding:30px 30px 8px">
                    <p style="margin:0 0 12px;font-size:15px;color:#e3e9f2;font-family:Arial,sans-serif;line-height:1.6">Olá, <strong style="color:#ffffff">${athlete_name}</strong>! Para confirmar sua participação, crie sua conta no portal do atleta. É rápido:</p>
                  </td>
                </tr>

                <!-- Passos -->
                <tr>
                  <td style="padding:6px 30px 4px">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      ${step('1', 'Criar sua conta com este mesmo e-mail')}
                      ${step('2', 'Preencher seus dados pessoais')}
                      ${step('3', 'Enviar sua foto e assinar os termos')}
                    </table>
                  </td>
                </tr>

                <!-- Botão bulletproof -->
                <tr>
                  <td align="center" style="padding:20px 30px 8px">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center" bgcolor="#00b046" style="border-radius:12px">
                          <a href="${register_url}" target="_blank" style="display:inline-block;padding:16px 40px;font-size:14px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:#022013;text-decoration:none;font-family:Arial,sans-serif;border-radius:12px">Criar minha conta &nbsp;→</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding:0 30px 28px">
                    <p style="margin:0;font-size:11px;color:#5c6f8c;font-family:Arial,sans-serif">Use o mesmo e-mail em que recebeu este convite.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Link alternativo -->
          <tr>
            <td style="padding:14px 40px 6px" align="center">
              <p style="margin:0;font-size:11px;color:#4d5f7d;font-family:Arial,sans-serif;line-height:1.6">Se o botão não funcionar, copie e cole no navegador:<br><a href="${register_url}" target="_blank" style="color:#22e06a;word-break:break-all;text-decoration:none">${register_url}</a></p>
            </td>
          </tr>

          <!-- Aviso -->
          <tr>
            <td style="padding:14px 28px 8px">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#1f1405;border:1px solid #3a2708;border-radius:12px">
                <tr>
                  <td style="padding:13px 18px;font-size:12px;color:#d69a52;font-family:Arial,sans-serif;line-height:1.55">⚠️ Se você não conhece o clube <strong style="color:#f0b45f">${club_name}</strong> ou recebeu este e-mail por engano, basta ignorá-lo. Nenhuma ação é necessária.</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:22px 36px 30px">
              <p style="margin:0;font-size:11px;color:#3c4d68;font-family:Arial,sans-serif;line-height:1.7">Brasil Flag World Championship 2026 · Leme, SP · Brasil<br>Convite enviado automaticamente pelo clube ${club_name}.</p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function adminValidationHtml(data) {
  const {
    club_name, country, city, contact_name, contact_role,
    email, whatsapp, category,
    athletes_count, athletes_masc, athletes_fem, athletes_sub15, athletes_sub12,
    competitive_history, hosting_preference, travel_support, notes,
    validateUrl, rejectUrl,
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
      ${emailLogoImg(96, 'margin:0 0 14px')}
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

    <!-- CTA buttons -->
    <div style="text-align:center;margin-bottom:16px;display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
      <a href="${validateUrl}"
         style="display:inline-block;padding:16px 32px;background:#f4ff00;color:#031020;border-radius:12px;font-size:13px;font-weight:900;letter-spacing:2px;text-transform:uppercase;text-decoration:none">
        ✅ VALIDAR E ADICIONAR
      </a>
      ${rejectUrl ? `<a href="${rejectUrl}"
         style="display:inline-block;padding:16px 32px;background:rgba(255,68,68,.15);color:#ff4444;border:2px solid rgba(255,68,68,.4);border-radius:12px;font-size:13px;font-weight:900;letter-spacing:2px;text-transform:uppercase;text-decoration:none">
        ❌ NÃO VALIDAR
      </a>` : ''}
    </div>

    <p style="text-align:center;font-size:11px;color:rgba(255,255,255,.2)">
      Ao clicar em Validar, <strong style="color:rgba(255,255,255,.4)">${club_name}</strong> será adicionado como Pré-inscrito no CRM do BFWC 2026.<br>
      Ao clicar em Não Validar, a inscrição será rejeitada. Links de uso único.
    </p>
  </div>
</body>
</html>`;
}