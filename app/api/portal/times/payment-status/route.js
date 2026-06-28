import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { getInvoice } from '@/lib/cora';
import { getResend, fromEmail } from '@/lib/email';

export const runtime = 'nodejs';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get('team_id');
  if (!teamId) {
    return NextResponse.json({ ok: false, message: 'team_id obrigatório' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('portal_teams')
    .select('id, club_name, email, payment_confirmed, payment_date, cora_invoice_id')
    .eq('id', teamId)
    .single();

  if (error || !data) {
    return NextResponse.json({ ok: false, message: 'Time não encontrado' }, { status: 404 });
  }

  // Fallback resiliente: se ainda não confirmado mas há um Pix da Cora pendente,
  // consulta a Cora ativamente e confirma se já foi pago (não depende do webhook).
  if (!data.payment_confirmed && data.cora_invoice_id) {
    try {
      const invoice = await getInvoice(data.cora_invoice_id);
      const isPaid =
        invoice?.status === 'PAID' ||
        (typeof invoice?.total_paid === 'number' &&
          typeof invoice?.total_amount === 'number' &&
          invoice.total_amount > 0 &&
          invoice.total_paid >= invoice.total_amount);
      if (isPaid) {
        const paymentDate = new Date().toISOString();
        await supabase
          .from('portal_teams')
          .update({
            payment_confirmed: true,
            payment_date: paymentDate,
            payment_amount: invoice.total_amount ?? null,
          })
          .eq('id', data.id);
        // e-mail de confirmação (best-effort, só uma vez)
        try {
          const valor = ((invoice.total_amount ?? 0) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
          await getResend().emails.send({
            from: fromEmail,
            to: data.email,
            subject: '✅ Pagamento confirmado (Pix) — BFWC 2026',
            html: `<div style="font-family:Arial,sans-serif"><h2 style="color:#0a7d28">Pagamento confirmado!</h2><p>Olá, <strong>${data.club_name}</strong>. Recebemos seu Pix de <strong>${valor}</strong>. Seu clube está confirmado no BFWC 2026.</p></div>`,
          });
        } catch (e) {
          console.error('payment-status email error', e.message);
        }
        return NextResponse.json({ ok: true, payment_confirmed: true, payment_date: paymentDate });
      }
    } catch (e) {
      // Se a consulta à Cora falhar, apenas retorna o status atual (não quebra a página)
      console.error('payment-status cora check error', e.message);
    }
  }

  return NextResponse.json({
    ok: true,
    payment_confirmed: !!data.payment_confirmed,
    payment_date: data.payment_date,
  });
}
