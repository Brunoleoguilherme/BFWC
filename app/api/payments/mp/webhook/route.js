import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { getPayment } from '@/lib/mercadopago';
import { getResend, fromEmail } from '@/lib/email';

// Webhook do Mercado Pago (cartão).
// O MP manda uma notificação com o id do pagamento; consultamos a API
// pra confirmar o status (fonte da verdade) e atualizamos o banco.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function markPaid(payment) {
  const teamId = payment?.metadata?.team_id || payment?.external_reference;
  if (!teamId) return;

  const supabase = getSupabaseAdmin();

  const { data: current } = await supabase
    .from('portal_teams')
    .select('id, club_name, email, payment_confirmed, amount_paid_cents, mp_payment_id')
    .eq('id', teamId)
    .single();

  if (!current) return;
  // Idempotência: se esse mesmo pagamento já foi processado, ignora
  if (current.mp_payment_id && current.mp_payment_id === String(payment.id)) return;

  // transaction_amount vem em reais → converte pra centavos
  const charged = Math.round((payment.transaction_amount || 0) * 100);

  await supabase
    .from('portal_teams')
    .update({
      payment_confirmed: true,
      payment_date: new Date().toISOString(),
      amount_paid_cents: (current.amount_paid_cents || 0) + charged,
      mp_payment_id: String(payment.id),
    })
    .eq('id', teamId);

  // Cartão quita o restante: marca todas as parcelas pendentes como pagas
  await supabase
    .from('payment_installments')
    .update({ status: 'paid', paid_at: new Date().toISOString() })
    .eq('team_id', teamId)
    .neq('status', 'paid');

  // E-mail de confirmação (best-effort, não bloqueia o webhook)
  try {
    const valor = ((charged || 0) / 100).toLocaleString('pt-BR', {
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
    console.error('mp-webhook: falha ao enviar e-mail de confirmação', e.message);
  }
}

export async function POST(req) {
  try {
    // O MP notifica de dois jeitos: query string (?type=payment&data.id=123)
    // e/ou corpo JSON ({ type: 'payment', data: { id } }).
    const url = new URL(req.url);
    let body = {};
    try { body = await req.json(); } catch (_) {}

    const type = body?.type || url.searchParams.get('type') || url.searchParams.get('topic');
    const paymentId = body?.data?.id || url.searchParams.get('data.id') || url.searchParams.get('id');

    if (type !== 'payment' || !paymentId) {
      // Outras notificações (merchant_order etc.) — confirma recebimento e ignora
      return NextResponse.json({ received: true });
    }

    const payment = await getPayment(paymentId);
    if (payment?.status === 'approved') {
      await markPaid(payment);
    } else {
      console.log('mp-webhook: pagamento', paymentId, 'status', payment?.status);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('mp-webhook error', err);
    // 500 faz o MP reenviar a notificação depois
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

// O MP pode validar a URL com GET
export async function GET() {
  return NextResponse.json({ ok: true });
}
