import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { getResend, fromEmail, emailLogoImg } from '@/lib/email';

const content = {
  pt: {
    subject: 'Bem-vindo ao Brasil Flag World Championship 2026!',
    title: 'Você está dentro!',
    intro: 'Sua inscrição foi confirmada. A partir de agora, você receberá em primeira mão todas as novidades sobre o maior campeonato mundial de Flag Football do Brasil.',
    col1title: 'Atualizações',
    col1text: 'Datas, resultados e novidades do campeonato.',
    col2title: 'Inscrições',
    col2text: 'Informações sobre como participar.',
    col3title: 'Competição',
    col3text: 'Categorias, equipes e formato do torneio.',
    final: 'Juntos, vamos fazer história. O mundo do flag é aqui.',
    button: 'Acessar o site',
    footer: 'Você recebeu este e-mail por se inscrever em brasilflagworldchampionship.com'
  },
  en: {
    subject: 'Welcome to Brasil Flag World Championship 2026!',
    title: "You're in!",
    intro: 'Your subscription is confirmed. From now on, you will receive all the latest updates about the biggest Flag Football World Championship in Brazil.',
    col1title: 'Updates',
    col1text: 'Dates, results and championship news.',
    col2title: 'Registration',
    col2text: 'Information on how to participate.',
    col3title: 'Competition',
    col3text: 'Categories, teams and tournament format.',
    final: "Together, let's make history. The flag world is here.",
    button: 'Visit the site',
    footer: 'You received this email for subscribing at brasilflagworldchampionship.com'
  },
  es: {
    subject: '¡Bienvenido al Brasil Flag World Championship 2026!',
    title: '¡Ya estás dentro!',
    intro: 'Tu suscripción ha sido confirmada. A partir de ahora, recibirás todas las novedades del mayor campeonato mundial de Flag Football de Brasil.',
    col1title: 'Actualizaciones',
    col1text: 'Fechas, resultados y novedades del campeonato.',
    col2title: 'Inscripciones',
    col2text: 'Información sobre cómo participar.',
    col3title: 'Competición',
    col3text: 'Categorías, equipos y formato del torneo.',
    final: 'Juntos, hagamos historia. El mundo del flag está aquí.',
    button: 'Visitar el sitio',
    footer: 'Recibiste este correo por suscribirte en brasilflagworldchampionship.com'
  }
};

function emailHtml(lang) {
  const t = content[lang] || content.pt;

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#04101f;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#04101f;padding:40px 16px;">
  <tr><td align="center">
    <table width="580" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;width:100%;">

      <!-- HERO -->
      <tr>
        <td align="center" style="background:linear-gradient(175deg,#0a2255 0%,#061333 60%,#020c1e 100%);border-radius:24px 24px 0 0;padding:52px 40px 44px;border:1px solid #1a3566;border-bottom:none;">
          <img src="https://brasilflagworldchampionship.com/assets/bfwc-logo.jpg" width="100" height="100" style="border-radius:20px;display:block;margin:0 auto 28px;box-shadow:0 0 40px rgba(0,80,255,0.35);" />
          <!-- Linha decorativa -->
          <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 24px;">
            <tr>
              <td width="40" height="2" style="background:#eaff00;border-radius:2px;"></td>
              <td width="12"></td>
              <td style="color:#eaff00;font-size:10px;font-weight:800;letter-spacing:5px;white-space:nowrap;">BRASIL FLAG WORLD CHAMPIONSHIP</td>
              <td width="12"></td>
              <td width="40" height="2" style="background:#eaff00;border-radius:2px;"></td>
            </tr>
          </table>
          <h1 style="margin:0 0 18px;color:#ffffff;font-size:42px;font-weight:900;line-height:1.05;letter-spacing:-1px;">${t.title}</h1>
          <p style="margin:0;color:#9db8e8;font-size:16px;line-height:1.75;max-width:440px;">${t.intro}</p>
        </td>
      </tr>

      <!-- DIVIDER amarelo -->
      <tr>
        <td height="4" style="background:linear-gradient(90deg,#eaff00,#b8ff00);border-left:1px solid #1a3566;border-right:1px solid #1a3566;"></td>
      </tr>

      <!-- CORPO -->
      <tr>
        <td style="background:#040f1e;padding:40px 32px;border:1px solid #1a3566;border-top:none;border-bottom:none;">

          <!-- 3 cards -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:32px;">
            <tr>
              <td width="31%" valign="top" style="background:#071628;border:1px solid #1a3566;border-radius:16px;padding:20px 14px;text-align:center;">
                <div style="font-size:30px;margin-bottom:12px;">📅</div>
                <strong style="display:block;color:#eaff00;font-size:12px;font-weight:800;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">${t.col1title}</strong>
                <span style="color:#6a8ab8;font-size:12px;line-height:1.6;">${t.col1text}</span>
              </td>
              <td width="3%"></td>
              <td width="31%" valign="top" style="background:#071628;border:1px solid #1a3566;border-radius:16px;padding:20px 14px;text-align:center;">
                <div style="font-size:30px;margin-bottom:12px;">🏈</div>
                <strong style="display:block;color:#eaff00;font-size:12px;font-weight:800;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">${t.col2title}</strong>
                <span style="color:#6a8ab8;font-size:12px;line-height:1.6;">${t.col2text}</span>
              </td>
              <td width="3%"></td>
              <td width="31%" valign="top" style="background:#071628;border:1px solid #1a3566;border-radius:16px;padding:20px 14px;text-align:center;">
                <div style="font-size:30px;margin-bottom:12px;">🏆</div>
                <strong style="display:block;color:#eaff00;font-size:12px;font-weight:800;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">${t.col3title}</strong>
                <span style="color:#6a8ab8;font-size:12px;line-height:1.6;">${t.col3text}</span>
              </td>
            </tr>
          </table>

          <!-- Quote banner -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:32px;">
            <tr>
              <td style="background:linear-gradient(120deg,#0033cc 0%,#0a6e2e 100%);border-radius:16px;padding:28px 32px;">
                <p style="margin:0 0 4px;color:rgba(255,255,255,0.5);font-size:11px;letter-spacing:3px;text-transform:uppercase;">2026 · Leme, SP · Brasil</p>
                <h2 style="margin:8px 0 0;color:#ffffff;font-size:22px;font-weight:800;line-height:1.4;">${t.final}</h2>
              </td>
            </tr>
          </table>

          <!-- CTA -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td align="center">
                <a href="https://brasilflagworldchampionship.com/site?lang=${lang}"
                  style="display:inline-block;background:#eaff00;color:#04101f;font-weight:900;text-decoration:none;font-size:14px;padding:16px 44px;border-radius:999px;letter-spacing:2px;text-transform:uppercase;">
                  ${t.button} &rarr;
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- FOOTER -->
      <tr>
        <td align="center" style="background:#020917;border-radius:0 0 24px 24px;padding:24px 32px;border:1px solid #1a3566;border-top:none;">
          <p style="margin:0 0 6px;color:#2e4870;font-size:11px;">${t.footer}</p>
          <p style="margin:0;color:#1e3050;font-size:11px;">© 2026 Brasil Flag World Championship &mdash; Leme, SP &mdash; Brasil</p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}

function adminNewsletterHtml(email, lang) {
  return `
    <div style="font-family:Arial,sans-serif;padding:20px;">
      ${emailLogoImg(90, 'margin:0 0 14px')}
      <h2 style="color:#061018;">📧 Novo inscrito na newsletter — BFWC 2026</h2>
      <table style="border-collapse:collapse;width:100%;max-width:480px;margin-top:16px;">
        <tr style="background:#f5f5f5;">
          <td style="padding:10px 14px;font-weight:700;border:1px solid #ddd;">E-mail</td>
          <td style="padding:10px 14px;border:1px solid #ddd;">${email}</td>
        </tr>
        <tr>
          <td style="padding:10px 14px;font-weight:700;border:1px solid #ddd;">Idioma</td>
          <td style="padding:10px 14px;border:1px solid #ddd;">${lang.toUpperCase()}</td>
        </tr>
        <tr style="background:#f5f5f5;">
          <td style="padding:10px 14px;font-weight:700;border:1px solid #ddd;">Data/Hora</td>
          <td style="padding:10px 14px;border:1px solid #ddd;">${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</td>
        </tr>
      </table>
    </div>
  `;
}

export async function POST(request) {
  try {
    const body = await request.json();

    if (!body.email) {
      return NextResponse.json({ ok: false, message: 'Email obrigatório' }, { status: 400 });
    }

    const lang = body.language || 'pt';
    const t = content[lang] || content.pt;
    const supabase = getSupabaseAdmin();

    // Salva no Supabase (ignora duplicados silenciosamente)
    const { error } = await supabase
      .from('newsletter_leads')
      .insert({ email: body.email, language: lang, source_page: body.source_page || 'site' });

    // 23505 = unique violation (email já cadastrado) — ok, continua e envia email
    if (error && error.code !== '23505') throw error;

    // Envia emails em paralelo
    const resend = getResend();
    await Promise.allSettled([
      // Boas-vindas para o inscrito
      resend.emails.send({
        from: fromEmail,
        to: body.email,
        subject: t.subject,
        html: emailHtml(lang)
      }),
      // Notificação para admins
      ...['contato@brasilsportsbusiness.com', 'brunoleoguilherme@gmail.com'].map((to) =>
        resend.emails.send({
          from: fromEmail,
          to,
          subject: '[BFWC 2026] Novo inscrito na newsletter',
          html: adminNewsletterHtml(body.email, lang)
        })
      )
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('newsletter error', error);
    return NextResponse.json(
      { ok: false, message: error.message || 'Erro interno' },
      { status: 500 }
    );
  }
}
