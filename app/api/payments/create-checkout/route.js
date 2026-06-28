import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { createCheckoutSession } from '@/lib/stripe';
import { totalCentsFor } from '@/lib/installments';

export async function POST(req) {
  try {
    const { team_id } = await req.json();
    if (!team_id) {
      return NextResponse.json({ ok: false, message: 'team_id obrigatório.' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data: team, error } = await supabase
      .from('portal_teams')
      .select('id, club_name, email, category, status, amount_paid_cents')
      .eq('id', team_id)
      .single();

    if (error || !team) {
      return NextResponse.json({ ok: false, message: 'Time não encontrado.' }, { status: 404 });
    }
    if (team.status !== 'approved') {
      return NextResponse.json({ ok: false, message: 'O cadastro precisa estar aprovado antes do pagamento.' }, { status: 403 });
    }

    // Cobra apenas o SALDO RESTANTE (total - o que já foi pago em Pix/cartão)
    const totalCents = totalCentsFor(team.category);
    const paidCents = team.amount_paid_cents || 0;
    const remaining = totalCents - paidCents;
    if (remaining <= 0) {
      return NextResponse.json({ ok: false, message: 'Pagamento já está quitado.' }, { status: 409 });
    }

    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '');

    const session = await createCheckoutSession({
      mode: 'payment',
      client_reference_id: team.id,
      customer_email: team.email,
      locale: 'pt-BR',
      metadata: { team_id: team.id, club_name: team.club_name },
      payment_intent_data: { metadata: { team_id: team.id } },
      // Parcelamento no cartão na própria tela da Stripe
      payment_method_options: { card: { installments: { enabled: true } } },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'brl',
            unit_amount: remaining,
            product_data: {
              name: `Inscrição BFWC 2026 — ${team.club_name}`,
              description: paidCents > 0 ? 'Saldo restante da inscrição' : 'Taxa de inscrição',
            },
          },
        },
      ],
      success_url: `${siteUrl}/portal/times?paid=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/portal/times?canceled=1`,
    });

    await supabase
      .from('portal_teams')
      .update({ stripe_session_id: session.id })
      .eq('id', team.id);

    return NextResponse.json({ ok: true, url: session.url, id: session.id, amount: remaining });
  } catch (err) {
    console.error('create-checkout error', err);
    return NextResponse.json({ ok: false, message: err.message || 'Erro ao criar pagamento.' }, { status: 500 });
  }
}
