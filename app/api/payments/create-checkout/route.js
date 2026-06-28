import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { createCheckoutSession } from '@/lib/stripe';

// Mesmas regras do front-end (app/portal/times/page.js)
const CATS = ['Masculino', 'Feminino', 'Sub-15', 'Sub-12'];
const PRICE_PER_CAT_BRL = 2000;                 // R$ por categoria
const PRICE_PER_CAT_CENTS = PRICE_PER_CAT_BRL * 100;

export async function POST(req) {
  try {
    const { team_id } = await req.json();
    if (!team_id) {
      return NextResponse.json({ ok: false, message: 'team_id obrigatório.' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data: team, error } = await supabase
      .from('portal_teams')
      .select('id, club_name, email, category, status, payment_confirmed')
      .eq('id', team_id)
      .single();

    if (error || !team) {
      return NextResponse.json({ ok: false, message: 'Time não encontrado.' }, { status: 404 });
    }
    if (team.status !== 'approved') {
      return NextResponse.json({ ok: false, message: 'O cadastro precisa estar aprovado antes do pagamento.' }, { status: 403 });
    }
    if (team.payment_confirmed) {
      return NextResponse.json({ ok: false, message: 'Pagamento já confirmado.' }, { status: 409 });
    }

    // Valor calculado no servidor (não confiar no cliente)
    const numCats = CATS.filter((c) => team.category?.includes(c)).length || 1;
    const totalCents = PRICE_PER_CAT_CENTS * numCats;

    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '');

    const session = await createCheckoutSession({
      mode: 'payment',
      // Sem payment_method_types: a Checkout Session mostra dinamicamente os métodos
      // ATIVOS no painel da Stripe (cartão agora; Pix aparece sozinho quando aprovado).
      client_reference_id: team.id,
      customer_email: team.email,
      locale: 'pt-BR',
      metadata: { team_id: team.id, club_name: team.club_name, categorias: String(numCats) },
      payment_intent_data: {
        metadata: { team_id: team.id },
      },
      // Parcelamento no cartão: o cliente escolhe 1x/2x/3x na tela da Stripe
      // (a Stripe mostra as opções válidas para o cartão dele).
      payment_method_options: { card: { installments: { enabled: true } } },
      line_items: [
        {
          quantity: numCats,
          price_data: {
            currency: 'brl',
            unit_amount: PRICE_PER_CAT_CENTS,
            product_data: {
              name: `Taxa de inscrição BFWC 2026 — ${team.club_name}`,
              description: `${numCats} categoria(s)`,
            },
          },
        },
      ],
      success_url: `${siteUrl}/portal/times?paid=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/portal/times?canceled=1`,
    });

    // Guarda o id da sessão para reconciliação
    await supabase
      .from('portal_teams')
      .update({ stripe_session_id: session.id, payment_amount: totalCents })
      .eq('id', team.id);

    return NextResponse.json({ ok: true, url: session.url, id: session.id });
  } catch (err) {
    console.error('create-checkout error', err);
    return NextResponse.json({ ok: false, message: err.message || 'Erro ao criar pagamento.' }, { status: 500 });
  }
}
