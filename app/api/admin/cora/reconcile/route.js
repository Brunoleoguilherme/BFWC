import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { getInvoice } from '@/lib/cora';
import { getResend, fromEmail, emailLogoImg } from '@/lib/email';

export const runtime = 'nodejs';

// Reconciliação manual de um Pix da Cora (uso admin / diagnóstico).
// GET /api/admin/cora/reconcile?token=ADMIN_APPROVAL_TOKEN&email=<email do time>
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  if (!process.env.ADMIN_APPROVAL_TOKEN || token !== process.env.ADMIN_APPROVAL_TOKEN) {
    return NextResponse.json({ ok: false, message: 'Não autorizado.' }, { status: 401 });
  }
  const email = searchParams.get('email');
  if (!email) return NextResponse.json({ ok: false, message: 'email obrigatório' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data: team } = await supabase
    .from('portal_teams')
    .select('id, club_name, email, cora_invoice_id, payment_confirmed')
    .ilike('email', email.trim())
    .single();

  if (!team) return NextResponse.json({ ok: false, message: 'Time não encontrado' }, { status: 404 });
  if (!team.cora_invoice_id) {
    return NextResponse.json({ ok: false, message: 'Time sem cora_invoice_id (gere o Pix primeiro)' }, { status: 400 });
  }

  let invoice;
  try {
    invoice = await getInvoice(team.cora_invoice_id);
  } catch (e) {
    return NextResponse.json({ ok: false, step: 'getInvoice', error: e.message }, { status: 500 });
  }

  const isPaid =
    invoice?.status === 'PAID' ||
    (typeof invoice?.total_paid === 'number' &&
      typeof invoice?.total_amount === 'number' &&
      invoice.total_amount > 0 &&
      invoice.total_paid >= invoice.total_amount);

  let marked = false;
  if (isPaid && !team.payment_confirmed) {
    await supabase
      .from('portal_teams')
      .update({
        payment_confirmed: true,
        payment_date: new Date().toISOString(),
        payment_amount: invoice.total_amount ?? null,
      })
      .eq('id', team.id);
    marked = true;
    try {
      const valor = ((invoice.total_amount ?? 0) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      await getResend().emails.send({
        from: fromEmail,
        to: team.email,
        subject: '✅ Pagamento confirmado (Pix) — BFWC 2026',
        html: `<div style="font-family:Arial,sans-serif">${emailLogoImg(96, 'margin:0 0 14px')}<h2 style="color:#0a7d28">Pagamento confirmado!</h2><p>Olá, <strong>${team.club_name}</strong>. Recebemos seu Pix de <strong>${valor}</strong>. Seu clube está confirmado no BFWC 2026.</p></div>`,
      });
    } catch (e) {
      console.error('reconcile email error', e.message);
    }
  }

  return NextResponse.json({
    ok: true,
    invoice_status: invoice?.status ?? null,
    total_paid: invoice?.total_paid ?? null,
    total_amount: invoice?.total_amount ?? null,
    already_confirmed: team.payment_confirmed,
    marked_now: marked,
  });
}
