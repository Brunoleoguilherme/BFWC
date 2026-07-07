import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { listBtgCollections, isBtgCollectionPaid } from '@/lib/btg';
import { getResend, fromEmail, emailLogoImg, notifyAdminsPayment } from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Webhook do BTG Empresas (configurado na Área do Desenvolvedor).
// O header Authorization vem com o secret do webhook. Não confiamos no
// payload: a cada evento reconciliamos as parcelas BTG pendentes
// consultando a API (mesma abordagem do webhook da Cora).
export async function POST(req) {
  const secret = process.env.BTG_WEBHOOK_SECRET || '';
  if (secret) {
    const auth = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
    if (auth !== secret) return NextResponse.json({ success: true }); // 200 para não gerar retentativas
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data: pending } = await supabase
      .from('payment_installments')
      .select('id, team_id, number, status, amount_cents, cora_invoice_id')
      .neq('status', 'paid')
      .like('cora_invoice_id', 'btg:%');

    if (!pending?.length) return NextResponse.json({ success: true });

    const collections = await listBtgCollections();
    const byId = Object.fromEntries(collections.map((c) => [c.id, c]));

    for (const inst of pending) {
      const col = byId[String(inst.cora_invoice_id).replace(/^btg:/, '')];
      if (!isBtgCollectionPaid(col)) continue;

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
        await notifyAdminsPayment({ club_name: team.club_name, number: inst.number, amount_cents: inst.amount_cents, method: 'Pix (BTG)' });
        await supabase
          .from('portal_teams')
          .update({
            payment_confirmed: true,
            payment_date: new Date().toISOString(),
            amount_paid_cents: (team.amount_paid_cents || 0) + (inst.amount_cents || 0),
          })
          .eq('id', team.id);

        if (!team.payment_confirmed) {
          try {
            await getResend().emails.send({
              from: fromEmail,
              to: team.email,
              subject: '✅ Pagamento confirmado — BFWC 2026',
              html: `<div style="font-family:Arial,sans-serif">${emailLogoImg(96, 'margin:0 0 14px')}<h2 style="color:#0a7d28">Pagamento confirmado!</h2><p>Olá, <strong>${team.club_name}</strong>. Recebemos sua parcela e seu clube está confirmado no BFWC 2026.</p></div>`,
            });
          } catch (e) { console.error('email error', e.message); }
        }
      }
    }
  } catch (err) {
    console.error('btg webhook error', err);
  }
  return NextResponse.json({ success: true });
}
