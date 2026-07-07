import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { getInvoice } from '@/lib/cora';
import { getBtgCollection, isBtgCollectionPaid } from '@/lib/btg';
import { getResend, fromEmail, emailLogoImg, notifyAdminsPayment } from '@/lib/email';
import { totalCentsForTeam } from '@/lib/installments';

export const runtime = 'nodejs';

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
    console.error('getInvoice error', e.message);
    return false;
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get('team_id');
  if (!teamId) return NextResponse.json({ ok: false, message: 'team_id obrigatório' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data: team, error } = await supabase
    .from('portal_teams')
    .select('id, club_name, email, category, payment_confirmed, payment_date, payment_plan, amount_paid_cents, payment_option, athletes_paid_qty, payment_selection')
    .eq('id', teamId)
    .single();

  if (error || !team) return NextResponse.json({ ok: false, message: 'Time não encontrado' }, { status: 404 });

  const { data: installments } = await supabase
    .from('payment_installments')
    .select('number, plan_size, amount_cents, due_date, status, cora_invoice_id')
    .eq('team_id', team.id)
    .order('number', { ascending: true });

  const list = installments || [];
  let teamConfirmed = !!team.payment_confirmed;
  let teamPaymentDate = team.payment_date;
  let amountPaid = team.amount_paid_cents || 0;

  // Reconcilia parcelas pendentes (consulta a Cora ativamente)
  for (const inst of list) {
    if (inst.status !== 'paid' && inst.cora_invoice_id) {
      const paid = await isInvoicePaid(inst.cora_invoice_id);
      if (paid) {
        inst.status = 'paid';
        amountPaid += inst.amount_cents || 0;
        await supabase
          .from('payment_installments')
          .update({ status: 'paid', paid_at: new Date().toISOString() })
          .eq('team_id', team.id).eq('number', inst.number);

        await notifyAdminsPayment({ club_name: team.club_name, number: inst.number, plan_size: inst.plan_size, amount_cents: inst.amount_cents, method: 'Pix' });
        const firstConfirm = !teamConfirmed;
        teamConfirmed = true;
        if (!teamPaymentDate) teamPaymentDate = new Date().toISOString();
        await supabase
          .from('portal_teams')
          .update({ payment_confirmed: true, payment_date: teamPaymentDate, amount_paid_cents: amountPaid })
          .eq('id', team.id);

        try {
          const parcelaTxt = `parcela ${inst.number}${inst.plan_size ? `/${inst.plan_size}` : ''}`;
          const valorTxt = ((inst.amount_cents || 0) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
          const allPaidNow = list.every((i) => i.status === 'paid');
          await getResend().emails.send({
            from: fromEmail, to: team.email,
            subject: allPaidNow ? '🏁 Pagamento concluído — inscrição confirmada no BFWC 2026' : `✅ Pagamento confirmado (${parcelaTxt}) — BFWC 2026`,
            html: `<div style="font-family:Arial,sans-serif">${emailLogoImg(90, 'margin:0 0 12px')}<h2 style="color:#0a7d28">${allPaidNow ? 'Pagamento concluído!' : 'Pagamento confirmado!'}</h2><p>Olá, <strong>${team.club_name}</strong>. Recebemos o pagamento da <strong>${parcelaTxt}</strong> no valor de <strong>${valorTxt}</strong>.</p>${allPaidNow ? '<p>🏆 <strong>Pagamento concluído!</strong> Sua inscrição está confirmada no <strong>BFWC 2026</strong>. Agora é cadastrar os atletas e enviar a escalação pelo portal.</p>' : (firstConfirm ? '<p>🎉 Sua vaga está garantida no <strong>BFWC 2026</strong>! A inscrição é concluída com o pagamento das demais parcelas.</p>' : '<p>Acompanhe o resumo das parcelas no portal do clube.</p>')}</div>`,
          });
        } catch (e) { console.error('email error', e.message); }
      }
    }
  }

  const totalCents = totalCentsForTeam(team);
  const remaining = Math.max(0, totalCents - amountPaid);
  const fullyPaid = remaining <= 0 && (teamConfirmed || amountPaid > 0);
  const paidCount = list.filter((i) => i.status === 'paid').length;

  return NextResponse.json({
    ok: true,
    payment_confirmed: teamConfirmed,
    payment_date: teamPaymentDate,
    payment_plan: team.payment_plan,
    payment_option: team.payment_option || null,
    payment_selection: team.payment_selection || null,
    athletes_paid_qty: team.athletes_paid_qty || 0,
    amount_paid_cents: amountPaid,
    total_cents: totalCents,
    remaining_cents: remaining,
    fully_paid: fullyPaid,
    installments: list.map((i) => ({
      number: i.number, plan_size: i.plan_size, amount_cents: i.amount_cents,
      due_date: i.due_date, status: i.status, has_charge: !!i.cora_invoice_id,
    })),
    paid_count: paidCount,
    total_count: list.length || team.payment_plan || 0,
  });
}
