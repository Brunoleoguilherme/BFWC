import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { getInvoice } from '@/lib/cora';
import { getResend, fromEmail } from '@/lib/email';

export const runtime = 'nodejs';

async function isInvoicePaid(invoiceId) {
  try {
    const invoice = await getInvoice(invoiceId);
    const paid =
      invoice?.status === 'PAID' ||
      (typeof invoice?.total_paid === 'number' &&
        typeof invoice?.total_amount === 'number' &&
        invoice.total_amount > 0 &&
        invoice.total_paid >= invoice.total_amount);
    return paid;
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
    .select('id, club_name, email, payment_confirmed, payment_date, payment_plan')
    .eq('id', teamId)
    .single();

  if (error || !team) return NextResponse.json({ ok: false, message: 'Time não encontrado' }, { status: 404 });

  // Parcelas do time
  const { data: installments } = await supabase
    .from('payment_installments')
    .select('number, plan_size, amount_cents, due_date, status, cora_invoice_id')
    .eq('team_id', team.id)
    .order('number', { ascending: true });

  let teamConfirmed = !!team.payment_confirmed;
  let teamPaymentDate = team.payment_date;
  const list = installments || [];

  // Reconcilia parcelas pendentes que já têm cobrança gerada
  for (const inst of list) {
    if (inst.status !== 'paid' && inst.cora_invoice_id) {
      const paid = await isInvoicePaid(inst.cora_invoice_id);
      if (paid) {
        inst.status = 'paid';
        await supabase
          .from('payment_installments')
          .update({ status: 'paid', paid_at: new Date().toISOString() })
          .eq('team_id', team.id)
          .eq('number', inst.number);

        // Confirma o time na 1ª parcela paga
        if (!teamConfirmed) {
          teamConfirmed = true;
          teamPaymentDate = new Date().toISOString();
          await supabase
            .from('portal_teams')
            .update({ payment_confirmed: true, payment_date: teamPaymentDate })
            .eq('id', team.id);
          try {
            await getResend().emails.send({
              from: fromEmail,
              to: team.email,
              subject: '✅ Pagamento confirmado — BFWC 2026',
              html: `<div style="font-family:Arial,sans-serif"><h2 style="color:#0a7d28">Pagamento confirmado!</h2><p>Olá, <strong>${team.club_name}</strong>. Recebemos sua 1ª parcela e seu clube está confirmado no BFWC 2026.</p></div>`,
            });
          } catch (e) { console.error('email error', e.message); }
        }
      }
    }
  }

  const paidCount = list.filter((i) => i.status === 'paid').length;

  return NextResponse.json({
    ok: true,
    payment_confirmed: teamConfirmed,
    payment_date: teamPaymentDate,
    payment_plan: team.payment_plan,
    installments: list.map((i) => ({
      number: i.number,
      plan_size: i.plan_size,
      amount_cents: i.amount_cents,
      due_date: i.due_date,
      status: i.status,
      has_charge: !!i.cora_invoice_id,
    })),
    paid_count: paidCount,
    total_count: list.length || team.payment_plan || 0,
  });
}
