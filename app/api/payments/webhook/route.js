import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { constructWebhookEvent } from '@/lib/stripe';
import { getResend, fromEmail, emailLogoImg, notifyAdminsPayment } from '@/lib/email';
import { notifyVagaGarantida } from '@/lib/vagaGarantida';

// Garante runtime Node (precisamos do corpo bruto + crypto)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function markPaid(session) {
  const teamId = session?.metadata?.team_id || session?.client_reference_id;
  if (!teamId) return;

  const supabase = getSupabaseAdmin();

  const { data: current } = await supabase
    .from('portal_teams')
    .select('id, club_name, email, payment_confirmed, amount_paid_cents, stripe_payment_intent')
    .eq('id', teamId)
    .single();

  if (!current) return;
  // Idempotência: se esse mesmo PaymentIntent já foi processado, ignora
  if (current.stripe_payment_intent && current.stripe_payment_intent === session.payment_intent) return;

  const charged = session.amount_total ?? 0;
  await supabase
    .from('portal_teams')
    .update({
      payment_confirmed: true,
      payment_date: new Date().toISOString(),
      amount_paid_cents: (current.amount_paid_cents || 0) + charged,
      stripe_payment_intent: session.payment_intent ?? null,
    })
    .eq('id', teamId);

  const instNum = parseInt(session?.metadata?.installment_number, 10) || 0;
  if (instNum > 0) {
    // Pagamento de UMA parcela específica (cartão por parcela)
    await supabase
      .from('payment_installments')
      .update({ status: 'paid', paid_at: new Date().toISOString() })
      .eq('team_id', teamId)
      .eq('number', instNum);
  } else {
    // Compatibilidade: cobrança do saldo total quita todas as parcelas pendentes
    await supabase
      .from('payment_installments')
      .update({ status: 'paid', paid_at: new Date().toISOString() })
      .eq('team_id', teamId)
      .neq('status', 'paid');
  }

  // Aviso aos admins (best-effort)
  await notifyAdminsPayment({ club_name: current.club_name, number: instNum || null, amount_cents: charged, method: 'Cartão (Stripe)' });

  // Vaga garantida (1ª parcela) → aviso interno MKT + organização (idempotente)
  await notifyVagaGarantida(teamId);

  // E-mail de confirmação (best-effort, não bloqueia o webhook)
  try {
    const valor = ((session.amount_total ?? 0) / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
    // Situação das parcelas após este pagamento
    const { data: allInst } = await supabase
      .from('payment_installments')
      .select('number, status, plan_size')
      .eq('team_id', teamId);
    const planSize = allInst?.[0]?.plan_size || null;
    const allPaid = !!allInst?.length && allInst.every(i => i.status === 'paid');
    const parcelaTxt = instNum ? `parcela ${instNum}${planSize ? `/${planSize}` : ''}` : 'taxa de inscrição';
    await getResend().emails.send({
      from: fromEmail,
      to: current.email,
      subject: allPaid
        ? '🏁 Pagamento concluído — inscrição confirmada no BFWC 2026'
        : `✅ Pagamento confirmado${instNum ? ` (${parcelaTxt})` : ''} — BFWC 2026`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#0a1628">
          ${emailLogoImg(96, 'margin:0 0 14px')}
          <h2 style="color:#0a7d28">${allPaid ? 'Pagamento concluído!' : 'Pagamento confirmado!'}</h2>
          <p>Olá, <strong>${current.club_name}</strong>.</p>
          <p>Recebemos o pagamento da <strong>${parcelaTxt}</strong> no valor de <strong>${valor}</strong>.</p>
          ${allPaid
            ? '<p>🏆 <strong>Pagamento concluído!</strong> Sua inscrição está confirmada no <strong>Brasil Flag World Championship 2026</strong>. Agora é cadastrar os atletas e enviar a escalação pelo portal.</p>'
            : '<p>🎉 Sua vaga está garantida no <strong>Brasil Flag World Championship 2026</strong>. Acompanhe o resumo das parcelas no portal do clube.</p>'}
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
