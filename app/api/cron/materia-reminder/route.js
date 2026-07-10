import { NextResponse } from 'next/server';
import { getResend, fromEmail, emailShell } from '@/lib/email';

// Cron semanal (Vercel): toda sexta lembra o Bruno de passar a pauta da
// matéria da semana. Não busca dados do sistema nem dispara newsletter —
// é só um lembrete. Protegido por CRON_SECRET.
//
// Guarda de dia da semana: o cron do vercel.json já roda só às sextas, mas
// a checagem deixa a rota segura caso o schedule precise virar diário
// (plano Hobby da Vercel só permite cron 1x/dia). Use ?force=1 para testar
// em qualquer dia.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TO = 'brunoleoguilherme@gmail.com';
const SUBJECT = '🗞️ Lembrete: matéria da semana — BFWC 2026';

/** Dia da semana em Brasília (0 = domingo … 5 = sexta). */
function weekdayInSaoPaulo() {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo',
    weekday: 'short',
  });
  const map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return map[fmt.format(new Date())];
}

function buildHtml() {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.brasilflagworldchampionship.com').replace(/\/$/, '');

  const innerHtml = `<tr>
    <td style="padding:0 28px 8px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#081733;border:1px solid #16294d;border-radius:18px">
        <tr><td style="padding:28px 30px;font-family:Arial,sans-serif">
          <p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:#c8d4e6">
            Lembrete semanal: se quiser publicar a matéria desta semana no site e
            disparar para a newsletter, abra o <strong style="color:#fff">Claude (Cowork)</strong>
            e me passe a pauta.
          </p>
          <p style="margin:0 0 22px;font-size:15px;line-height:1.65;color:#c8d4e6">
            Eu escrevo a matéria, coloco na home e deixo o e-mail da newsletter
            pronto para você aprovar e enviar.
          </p>
          <p style="margin:0">
            <a href="${siteUrl}" style="display:inline-block;padding:13px 30px;background:#22e06a;color:#04121f;font-weight:700;font-size:14px;text-decoration:none;border-radius:10px;font-family:Arial,sans-serif">Ver o site</a>
          </p>
        </td></tr>
      </table>
    </td>
  </tr>`;

  return emailShell({
    preheader: 'Sexta é dia de matéria — me passe a pauta quando quiser.',
    title: 'Sexta é dia de matéria',
    subtitle: 'Seu lembrete semanal de conteúdo do BFWC 2026',
    innerHtml,
  });
}

export async function GET(req) {
  // Vercel Cron envia Authorization: Bearer <CRON_SECRET>
  const auth = req.headers.get('authorization') || '';
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const force = new URL(req.url).searchParams.get('force') === '1';
  if (!force && weekdayInSaoPaulo() !== 5) {
    return NextResponse.json({ ok: true, skipped: 'not friday' });
  }

  try {
    const { data, error } = await getResend().emails.send({
      from: fromEmail,
      to: TO,
      subject: SUBJECT,
      html: buildHtml(),
    });

    if (error) {
      console.error('materia-reminder: resend error', error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 502 });
    }

    console.log('materia-reminder: enviado', data?.id);
    return NextResponse.json({ ok: true, id: data?.id });
  } catch (e) {
    console.error('materia-reminder: falha ao enviar', e.message);
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
