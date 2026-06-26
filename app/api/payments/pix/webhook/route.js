import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { getInvoice } from '@/lib/cora';
import { getResend, fromEmail } from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// A Cora envia as infos do evento nos HEADERS (corpo vazio):
//   webhook-event-type:  ex. "invoice.paid"
//   webhook-resource-id: ex. "inv_..."
//   user-agent:          "Cora-Webhook"
export async function POST(req) {
  const eventType = req.headers.get('webhook-event-type') || '';
  const resourceId = req.headers.get('webhook-resource-id') || '';

  // Só nos interessa pagamento confirmado
  if (!eventType.includes('paid') || !resourceId) {
    return NextResponse.json({ success: true }); // ack mesmo assim
  }

  try {
    // Segurança: não confiamos só no header. Confirmamos com a própria API da Cora.
    const invoice = await getInvoice(resourceId);
    const isPaid =
      invoice?.status === 'PAID' ||
      (typeof invoice?.total_paid === 'number' &&
        typeof invoice?.total_amount === 'number' &&
        invoice.total_paid >= invoice.total_amount && invoice.total_amount > 0);

    if (!isPaid) {
      // ainda não pago de fato — apenas confirma o recebimento
      return NextResponse.json({ success: true });
    }

    const supabase = getSupabaseAdmin();
    const { data: team } = await supabase
      .from('portal_teams')
      .select('id, club_name, email, payment_confirmed')
      .eq('cora_invoice_id', resourceId)
      .single();

    if (team && !team.payment_confirmed) {
      await supabase
        .from('portal_teams')
        .update({
          payment_confirmed: true,
          payment_date: new Date().toISOString(),
          payment_amount: invoice.total_amount ?? null,
        })
        .eq('id', team.id);

      // E-mail de confirmação (best-effort)
      try {
        const valor = ((invoice.total_amount ?? 0) / 100).toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        });
        await getResend().emails.send({
          from: fromEmail,
          to: team.email,
          subject: '✅ Pagamento confirmado (Pix) — BFWC 2026',
          html: `
            <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#0a1628">
              <h2 style="color:#0a7d28">Pagamento confirmado!</h2>
              <p>Olá, <strong>${team.club_name}</strong>.</p>
              <p>Recebemos seu Pix no valor de <strong>${valor}</strong>. Seu clube está
              confirmado no <strong>Brasil Flag World Championship 2026</strong>.</p>
              <p style="color:#667">Equipe BFWC 2026</p>
            </div>`,
        });
      } catch (e) {
        console.error('cora webhook: falha ao enviar e-mail', e.message);
      }
    }
  } catch (err) {
    console.error('cora webhook error', err);
    // Retorna 200 mesmo assim para a Cora não reenviar em loop por erro nosso transitório;
    // a reconciliação também pode ser feita por consulta posterior.
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ success: true });
}
