import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { constructWebhookEvent } from '@/lib/stripe';
import { getResend, fromEmail } from '@/lib/email';

// Garante runtime Node (precisamos do corpo bruto + crypto)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function markPaid(session) {
  const teamId = session?.metadata?.team_id || session?.client_reference_id;
  if (!teamId) return;

  const supabase = getSupabaseAdmin();

  // Evita reprocessar (idempotência)
  const { data: current } = await supabase
    .from('portal_teams')
    .select('id, club_name, email, payment_confirmed')
    .eq('id', teamId)
    .single();

  if (!current || current.payment_confirmed) return;

  await supabase
    .from('portal_teams')
    .update({
      payment_confirmed: true,
      payment_date: new Date().toISOString(),
      payment_amount: session.amount_total ?? null,
      stripe_payment_intent: session.payment_intent ?? null,
    })
    .eq('id', teamId);

  // E-mail de confirmação (best-effort, não bloqueia o webhook)
  try {
    const valor = ((session.amount_total ?? 0) / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
    await getResend().emails.send({
      from: fromEmail,
      to: current.email,
      subject: '✅ Pagamento confirmado — BFWC 2026',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#0a1628">
          <h2 style="color:#0a7d28">Pagamento confirmado!</h2>
          <p>Olá, <strong>${current.club_name}</strong>.</p>
          <p>Recebemos o pagamento da taxa de inscrição no valor de <strong>${valor}</strong>.
          Seu clube está confirmado no <strong>Brasil Flag World Championship 2026</strong>.</p>
          <p>Você já pode acompanhar tudo pelo portal do clube.</p>
          <p style="color:#667">Equipe BFWC 2026</p>
        </div>`,
    });
  } catch (e) {
    console.error('webhook: falha ao enviar e-mail de confirmação', e.message);
  }
}

export async function POST(req) {
  const payload = await req.text();
  const sig = req.headers.get('stripe-signature');

  let event;
  try {
    event = constructWebhookEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('webhook signature error', err.message);
    return NextResponse.json({ ok: false, message: err.message }, { status: 400 });
  }

  try {
    switch (event.type) {
      // Cartão: pagamento conclui na hora
      case 'checkout.session.completed': {
        const session = event.data.object;
        if (session.payment_status === 'paid') await markPaid(session);
        break;
      }
      // PIX: confirmação chega de forma assíncrona
      case 'checkout.session.async_payment_succeeded': {
        await markPaid(event.data.object);
        break;
      }
      case 'checkout.session.async_payment_failed': {
        console.warn('PIX falhou/expirou para', event.data.object?.metadata?.team_id);
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error('webhook handler error', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
