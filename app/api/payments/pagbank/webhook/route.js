import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { getOrder, getLegacyNotification } from '@/lib/pagbank';
import { getResend, fromEmail } from '@/lib/email';

// Webhook de pagamento do PagBank (cartão).
// O PagBank envia o pedido (order) com as cobranças (charges). Por segurança,
// reconsultamos o pedido na API (fonte da verdade) antes de marcar como pago.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function markPaid({ teamId, chargeId, chargedCents }) {
  const supabase = getSupabaseAdmin();

  const { data: current } = await supabase
    .from('portal_teams')
    .select('id, club_name, email, payment_confirmed, amount_paid_cents, pagbank_charge_id')
    .eq('id', teamId)
    .single();

  if (!current) return;
  // Idempotência: se essa mesma cobrança já foi processada, ignora
  if (current.pagbank_charge_id && current.pagbank_charge_id === String(chargeId)) return;

  await supabase
    .from('portal_teams')
    .update({
      payment_confirmed: true,
      payment_date: new Date().toISOString(),
      amount_paid_cents: (current.amount_paid_cents || 0) + (chargedCents || 0),
      pagbank_charge_id: String(chargeId),
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
    const valor = ((chargedCents || 0) / 100).toLocaleString('pt-BR', {
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
    console.error('pagbank-webhook: falha ao enviar e-mail de confirmação', e.message);
  }
}

export async function POST(req) {
  try {
    const raw = await req.text();

    // ── Formato clássico (v2): form-urlencoded com notificationCode ──
    if (raw.includes('notificationCode=')) {
      const form = new URLSearchParams(raw);
      const code = form.get('notificationCode');
      if (code) {
        const tx = await getLegacyNotification(code);
        // 3 = Paga · 4 = Disponível
        if ((tx.status === 3 || tx.status === 4) && tx.reference) {
          await markPaid({ teamId: tx.reference, chargeId: tx.transactionCode, chargedCents: tx.grossAmountCents });
        } else {
          console.log('pagbank-webhook (legado): transação', tx.transactionCode, 'status', tx.status);
        }
      }
      return NextResponse.json({ received: true });
    }

    // ── Formato novo (Orders API) ──
    let body = {};
    try { body = JSON.parse(raw); } catch (_) {}

    // A notificação traz o pedido (ORDE_...) com reference_id e charges[]
    const orderId = body?.id || body?.order_id || null;
    if (!orderId || !String(orderId).startsWith('ORDE')) {
      return NextResponse.json({ received: true });
    }

    // Fonte da verdade: reconsulta o pedido na API do PagBank
    const order = await getOrder(orderId);
    const teamId = order?.reference_id;
    const paidCharge = (order?.charges || []).find((ch) => ch.status === 'PAID');

    if (teamId && paidCharge) {
      await markPaid({
        teamId,
        chargeId: paidCharge.id,
        chargedCents: paidCharge.amount?.value || 0,
      });
    } else {
      console.log('pagbank-webhook: pedido', orderId, 'sem cobrança paga ainda');
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('pagbank-webhook error', err);
    // 500 faz o PagBank reenviar a notificação depois
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

// Validação da URL
export async function GET() {
  return NextResponse.json({ ok: true });
}
