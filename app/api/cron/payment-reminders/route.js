import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { getResend, fromEmail } from '@/lib/email';
import { computeInstallments, totalCentsForTeam } from '@/lib/installments';

// Cron diário (Vercel): lembra os times de parcelas que vencem em 7 dias,
// 3 dias e no dia do vencimento. Roda 1x/dia, então cada aviso sai no máximo
// uma vez por faixa. Protegido por CRON_SECRET.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const REMIND_AT_DAYS = [7, 3, 0];

const COPY = {
  pt: {
    subject: (n, d) => `⏰ Lembrete: ${n}ª parcela da inscrição vence ${d === 0 ? 'HOJE' : `em ${d} dia${d > 1 ? 's' : ''}`} — BFWC 2026`,
    title: 'Lembrete de pagamento',
    body: (club, n, plan, valor, date, d) =>
      `Olá, <strong>${club}</strong>! A <strong>${n}ª parcela</strong> (de ${plan}) da sua inscrição no BFWC 2026, no valor de <strong>${valor}</strong>, vence ${d === 0 ? '<strong>hoje</strong>' : `em <strong>${date}</strong>`}. Pague pelo portal com Pix ou cartão.`,
    btn: 'Pagar agora no portal',
    foot: 'As vagas são garantidas apenas para times com pagamento em dia.',
  },
  en: {
    subject: (n, d) => `⏰ Reminder: registration installment ${n} due ${d === 0 ? 'TODAY' : `in ${d} day${d > 1 ? 's' : ''}`} — BFWC 2026`,
    title: 'Payment reminder',
    body: (club, n, plan, valor, date, d) =>
      `Hello, <strong>${club}</strong>! Installment <strong>${n}</strong> (of ${plan}) of your BFWC 2026 registration, in the amount of <strong>${valor}</strong>, is due ${d === 0 ? '<strong>today</strong>' : `on <strong>${date}</strong>`}. Pay through the portal with Pix or card.`,
    btn: 'Pay now on the portal',
    foot: 'Spots are only guaranteed for teams with payments up to date.',
  },
  es: {
    subject: (n, d) => `⏰ Recordatorio: la cuota ${n} de la inscripción vence ${d === 0 ? 'HOY' : `en ${d} día${d > 1 ? 's' : ''}`} — BFWC 2026`,
    title: 'Recordatorio de pago',
    body: (club, n, plan, valor, date, d) =>
      `¡Hola, <strong>${club}</strong>! La cuota <strong>${n}</strong> (de ${plan}) de tu inscripción al BFWC 2026, por <strong>${valor}</strong>, vence ${d === 0 ? '<strong>hoy</strong>' : `el <strong>${date}</strong>`}. Paga por el portal con Pix o tarjeta.`,
    btn: 'Pagar ahora en el portal',
    foot: 'Las plazas solo se garantizan para equipos con pagos al día.',
  },
};

function daysUntil(dateStr, today) {
  const due = new Date(dateStr + 'T12:00:00-03:00');
  const now = new Date(today + 'T12:00:00-03:00');
  return Math.round((due - now) / 86400000);
}

function fmtDate(dateStr, lang) {
  const [y, m, d] = dateStr.split('-');
  return lang === 'en' ? `${m}/${d}/${y}` : `${d}/${m}/${y}`;
}

export async function GET(req) {
  // Vercel Cron envia Authorization: Bearer <CRON_SECRET>
  const auth = req.headers.get('authorization') || '';
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.brasilflagworldchampionship.com').replace(/\/$/, '');
  // Data de hoje em Brasília
  const today = new Date(Date.now() - 3 * 3600 * 1000).toISOString().slice(0, 10);

  // Times aprovados com plano definido (começaram o processo de pagamento)
  const { data: teams } = await supabase
    .from('portal_teams')
    .select('id, club_name, email, category, preferred_language, payment_plan, payment_option, athletes_paid_qty, amount_paid_cents')
    .eq('status', 'approved')
    .not('payment_plan', 'is', null);

  const resend = getResend();
  let sent = 0;
  const log = [];

  for (const team of teams || []) {
    const totalCents = totalCentsForTeam(team);
    if ((team.amount_paid_cents || 0) >= totalCents) continue; // quitado

    const { data: rows } = await supabase
      .from('payment_installments')
      .select('number, status')
      .eq('team_id', team.id);
    const paidNums = new Set((rows || []).filter((r) => r.status === 'paid').map((r) => r.number));

    const plan = computeInstallments(totalCents / 100, team.payment_plan);
    for (const parcela of plan) {
      if (paidNums.has(parcela.number)) continue;
      const d = daysUntil(parcela.due_date, today);
      if (!REMIND_AT_DAYS.includes(d)) continue;

      const lang = ['pt', 'en', 'es'].includes(team.preferred_language) ? team.preferred_language : 'pt';
      const t = COPY[lang];
      const valor = (parcela.amount_cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      const dateFmt = fmtDate(parcela.due_date, lang);

      try {
        await resend.emails.send({
          from: fromEmail,
          to: team.email,
          subject: t.subject(parcela.number, d),
          html: `
            <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#0a1628">
              <h2 style="color:#0D4BFF">${t.title}</h2>
              <p style="font-size:14px;line-height:1.6">${t.body(team.club_name, parcela.number, team.payment_plan, valor, dateFmt, d)}</p>
              <p style="margin:24px 0">
                <a href="${siteUrl}/portal/times/login" style="display:inline-block;padding:14px 32px;background:#0D4BFF;color:#fff;font-weight:700;font-size:14px;text-decoration:none;border-radius:10px">${t.btn}</a>
              </p>
              <p style="font-size:12px;color:#667">${t.foot}</p>
            </div>`,
        });
        sent++;
        log.push(`${team.club_name} · parcela ${parcela.number} · D-${d}`);
      } catch (e) {
        console.error('payment-reminders: falha ao enviar para', team.email, e.message);
      }
    }
  }

  console.log(`payment-reminders: ${sent} lembrete(s) enviado(s)`, log);
  return NextResponse.json({ ok: true, sent, log });
}
