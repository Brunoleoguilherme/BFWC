import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { getInvoice } from '@/lib/cora';
import { getResend, fromEmail, emailLogoImg, notifyAdminsPayment } from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// A Cora envia o evento nos headers (corpo vazio):
//   webhook-event-type: "invoice.paid" | webhook-resource-id: "inv_..."
export async function POST(req) {
  const eventType = req.headers.get('webhook-event-type') || '';
  const resourceId = req.headers.get('webhook-resource-id') || '';
  if (!eventType.includes('paid') || !resourceId) return NextResponse.json({ success: true });

  try {
    // Confirma de fato com a API da Cora (não confia só no header)
    const invoice = await getInvoice(resourceId);
    const isPaid =
      invoice?.status === 'PAID' ||
      (typeof invoice?.total_paid === 'number' && typeof invoice?.total_amount === 'number' &&
        invoice.total_amount > 0 && invoice.total_paid >= invoice.total_amount);
    if (!isPaid) return NextResponse.json({ success: true });

    const supabase = getSupabaseAdmin();
    const { data: inst } = await supabase
      .from('payment_installments')
      .select('id, team_id, number, status, amount_cents, plan_size')
      .eq('cora_invoice_id', resourceId)
      .maybeSingle();

    if (inst && inst.status !== 'paid') {
      await supabase
        .from('payment_installments')
        .update({ status: 'paid', paid_at: new Date().toISOString() })
        .eq('id', inst.id);

      const { data: team } = await supabase
        .from('portal_teams')
        .select('id, club_name, email, payment_confirmed, amount_paid_cents')
        .eq('id', inst.team_id)
        .single();

      if (team) {
        await supabase
          .from('portal_teams')
          .update({
            payment_confirmed: true,
            payment_date: new Date().toISOString(),
            amount_paid_cents: (team.amount_paid_cents || 0) + (inst.amount_cents || 0),
          })
          .eq('id', team.id);
      }
      if (team) {
        await notifyAdminsPayment({ club_name: team.club_name, number: inst.number, amount_cents: inst.amount_cents, method: 'Pix' });
      }
      if (team) {
        try {
          const parcelaTxt = `parcela ${inst.number}${inst.plan_size ? `/${inst.plan_size}` : ''}`;
          const valorTxt = ((inst.amount_cents || 0) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
          await getResend().emails.send({
            from: fromEmail,
            to: team.email,
            subject: `✅ Pagamento confirmado (${parcelaTxt}) — BFWC 2026`,
            html: `<div style="font-family:Arial,sans-serif">${emailLogoImg(96, 'margin:0 0 14px')}<h2 style="color:#0a7d28">Pagamento confirmado!</h2><p>Olá, <strong>${team.club_name}</strong>. Recebemos o pagamento da <strong>${parcelaTxt}</strong> no valor de <strong>${valorTxt}</strong>.</p>${!team.payment_confirmed ? '<p>🎉 Sua vaga está garantida no <strong>BFWC 2026</strong>! A inscrição é concluída com o pagamento das demais parcelas.</p>' : '<p>Acompanhe o resumo das parcelas no portal do clube.</p>'}</div>`,
          });
        } catch (e) { console.error('email error', e.message); }
      }
    }
  } catch (err) {
    console.error('cora webhook error', err);
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ success: true });
}
