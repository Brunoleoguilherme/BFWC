import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { getInvoice } from '@/lib/cora';
import { getBtgCollection, isBtgCollectionPaid } from '@/lib/btg';
import { getResend, fromEmail, emailLogoImg, notifyAdminsPayment } from '@/lib/email';
import { notifyVagaGarantida } from '@/lib/vagaGarantida';

// Cron (Vercel): reconcilia parcelas Pix pendentes consultando a Cora/BTG
// ativamente — sem depender do webhook (não confiável) nem de alguém abrir
// o portal (polling do payment-status). Protegido por CRON_SECRET.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function isInvoicePaid(invoiceId) {
  try {
    if (String(invoiceId).startsWith('btg:')) {
      return isBtgCollectionPaid(await getBtgCollection(invoiceId));
    }
    const inv = await getInvoice(invoiceId);
    return (
      inv?.status === 'PAID' ||
      (typeof inv?.total_paid === 'number' && typeof inv?.total_amount === 'number' &&
        inv.total_amount > 0 && inv.total_paid >= inv.total_amount)
    );
  } catch (e) {
    console.error('reconcile-pix getInvoice error', invoiceId, e.message);
    return false;
  }
}

export async function GET(req) {
  // Vercel Cron envia Authorization: Bearer <CRON_SECRET>
  const auth = req.headers.get('authorization') || '';
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  // Parcelas pendentes que já têm cobrança Pix gerada
  const { data: pending, error } = await supabase
    .from('payment_installments')
    .select('id, team_id, number, plan_size, amount_cents, status, cora_invoice_id')
    .neq('status', 'paid')
    .not('cora_invoice_id', 'is', null);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  let marked = 0;
  const log = [];

  // Agrupa por time para atualizar amount_paid_cents com consistência
  const byTeam = {};
  for (const inst of pending || []) (byTeam[inst.team_id] ||= []).push(inst);

  for (const [teamId, insts] of Object.entries(byTeam)) {
    const { data: team } = await supabase
      .from('portal_teams')
      .select('id, club_name, email, payment_confirmed, payment_date, amount_paid_cents')
      .eq('id', teamId)
      .single();
    if (!team) continue;

    let amountPaid = team.amount_paid_cents || 0;
    let teamConfirmed = !!team.payment_confirmed;
    let teamPaymentDate = team.payment_date;

    for (const inst of insts) {
      const paid = await isInvoicePaid(inst.cora_invoice_id);
      if (!paid) continue;

      await supabase
        .from('payment_installments')
        .update({ status: 'paid', paid_at: new Date().toISOString() })
        .eq('id', inst.id);

      amountPaid += inst.amount_cents || 0;
      const firstConfirm = !teamConfirmed;
      teamConfirmed = true;
      if (!teamPaymentDate) teamPaymentDate = new Date().toISOString();

      await supabase
        .from('portal_teams')
        .update({ payment_confirmed: true, payment_date: teamPaymentDate, amount_paid_cents: amountPaid })
        .eq('id', team.id);

      await notifyAdminsPayment({ club_name: team.club_name, number: inst.number, plan_size: inst.plan_size, amount_cents: inst.amount_cents, method: 'Pix' });
      await notifyVagaGarantida(team.id);

      try {
        const parcelaTxt = `parcela ${inst.number}${inst.plan_size ? `/${inst.plan_size}` : ''}`;
        const valorTxt = ((inst.amount_cents || 0) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        const { data: allInst } = await supabase
          .from('payment_installments')
          .select('status')
          .eq('team_id', team.id);
        const allPaid = !!allInst?.length && allInst.every((i) => i.status === 'paid');
        await getResend().emails.send({
          from: fromEmail,
          to: team.email,
          subject: allPaid ? '🏁 Pagamento concluído — inscrição confirmada no BFWC 2026' : `✅ Pagamento confirmado (${parcelaTxt}) — BFWC 2026`,
          html: `<div style="font-family:Arial,sans-serif">${emailLogoImg(90, 'margin:0 0 12px')}<h2 style="color:#0a7d28">${allPaid ? 'Pagamento concluído!' : 'Pagamento confirmado!'}</h2><p>Olá, <strong>${team.club_name}</strong>. Recebemos o pagamento da <strong>${parcelaTxt}</strong> no valor de <strong>${valorTxt}</strong>.</p>${allPaid ? '<p>🏆 <strong>Pagamento concluído!</strong> Sua inscrição está confirmada no <strong>BFWC 2026</strong>. Agora é cadastrar os atletas e enviar a escalação pelo portal.</p>' : (firstConfirm ? '<p>🎉 Sua vaga está garantida no <strong>BFWC 2026</strong>! A inscrição é concluída com o pagamento das demais parcelas.</p>' : '<p>Acompanhe o resumo das parcelas no portal do clube.</p>')}</div>`,
        });
      } catch (e) { console.error('reconcile-pix email error', e.message); }

      marked++;
      log.push(`${team.club_name} · parcela ${inst.number}/${inst.plan_size || '?'}`);
    }
  }

  console.log(`reconcile-pix: ${pending?.length || 0} pendente(s) verificada(s), ${marked} marcada(s)`, log);
  return NextResponse.json({ ok: true, checked: pending?.length || 0, marked, log });
}
