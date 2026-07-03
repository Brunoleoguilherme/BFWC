import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { createCheckout, createLegacyCheckout } from '@/lib/pagbank';
import { countCategories, optionTotalReais, activePlanSize, fullCategoryFor } from '@/lib/installments';

// Cartão de crédito via PagBank (checkout hospedado).
// Mantém o mesmo contrato: retorna { ok, url } e o portal redireciona.
export async function POST(req) {
  try {
    // Interruptor: NEXT_PUBLIC_CARD_ENABLED=0 desliga o cartão (mostra "em breve")
    if (process.env.NEXT_PUBLIC_CARD_ENABLED === '0') {
      return NextResponse.json({ ok: false, code: 'CARD_SOON', message: 'Pagamento por cartão estará disponível em breve. Por enquanto, use o Pix.' }, { status: 503 });
    }
    const { team_id, option, athletes_qty } = await req.json();
    if (!team_id) {
      return NextResponse.json({ ok: false, message: 'team_id obrigatório.' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data: team, error } = await supabase
      .from('portal_teams')
      .select('id, club_name, email, category, status, amount_paid_cents, payment_plan, payment_option, athletes_paid_qty')
      .eq('id', team_id)
      .single();

    if (error || !team) {
      return NextResponse.json({ ok: false, message: 'Time não encontrado.' }, { status: 404 });
    }
    if (team.status !== 'approved') {
      return NextResponse.json({ ok: false, message: 'O cadastro precisa estar aprovado antes do pagamento.' }, { status: 403 });
    }

    // Cota por categoria: bloqueia o 1º pagamento se a categoria já lotou
    if ((team.amount_paid_cents || 0) === 0) {
      const fullCat = await fullCategoryFor(supabase, team.id, team.category);
      if (fullCat) {
        return NextResponse.json({
          ok: false, code: 'CATEGORY_FULL',
          message: `Inscrições esgotadas para a categoria ${fullCat}. A cota de times foi preenchida.`,
        }, { status: 409 });
      }
    }

    // Opção: trava na primeira cobrança
    const chosenOption = team.payment_option || (String(option) === '2' ? '2' : '1');
    if (team.payment_option && String(option) && team.payment_option !== String(option)) {
      return NextResponse.json({
        ok: false, code: 'OPTION_LOCKED',
        message: `A forma de pagamento já foi definida (Opção ${team.payment_option}). Continue por ela.`,
      }, { status: 409 });
    }
    const athQty = chosenOption === '2'
      ? (team.payment_option ? (team.athletes_paid_qty || 0) : Math.max(parseInt(athletes_qty, 10) || 0, 0))
      : 0;

    const numCats = countCategories(team.category);
    const totalCents = optionTotalReais(chosenOption, numCats, athQty) * 100;
    const paidCents = team.amount_paid_cents || 0;
    const remaining = totalCents - paidCents;
    if (remaining <= 0) {
      return NextResponse.json({ ok: false, message: 'Pagamento já está quitado.' }, { status: 409 });
    }

    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '');

    // Override de teste: cobra R$ 1 só do time deste e-mail (igual ao PIX_TEST_EMAIL)
    const testEmail = (process.env.CARD_TEST_EMAIL || '').trim().toLowerCase();
    const chargeCents = testEmail && (team.email || '').toLowerCase() === testEmail ? 100 : remaining;

    const notifUrl = `${(process.env.PAGBANK_NOTIFICATION_BASE || siteUrl).replace(/\/$/, '')}/api/payments/pagbank/webhook`;

    let checkout;
    try {
      checkout = await createCheckout({
      reference_id: String(team.id),
      customer_modifiable: true,
      items: [
        {
          name: `Inscrição BFWC 2026 — ${team.club_name}`.slice(0, 100),
          quantity: 1,
          unit_amount: chargeCents, // centavos
        },
      ],
      // Só cartão de crédito neste fluxo (Pix já é feito pela Cora no portal)
      payment_methods: [{ type: 'CREDIT_CARD' }],
      payment_methods_configs: [
        {
          type: 'CREDIT_CARD',
          config_options: [{ option: 'INSTALLMENTS_LIMIT', value: '3' }], // até 3x
        },
      ],
      soft_descriptor: 'BFWC 2026',
      redirect_url: `${siteUrl}/portal/times?paid=1`,
      return_url: `${siteUrl}/portal/times?paid=1`,
      // IMPORTANTE: precisa ser o domínio com www (webhook não segue redirect).
      // Em teste, defina PAGBANK_NOTIFICATION_BASE com a URL do preview da Vercel.
      payment_notification_urls: [notifUrl],
      });
    } catch (err) {
      // API nova ainda não liberada pra conta (allowlist) → usa o checkout
      // clássico ("Pagamento via Formulário HTML"), habilitado por padrão.
      if (/allowlist/i.test(err.message || '')) {
        const legacy = await createLegacyCheckout({
          reference: team.id,
          description: `Inscricao BFWC 2026 - ${team.club_name}`,
          amountCents: chargeCents,
          redirectUrl: `${siteUrl}/portal/times?paid=1`,
          notificationUrl: notifUrl,
        });
        checkout = { id: legacy.code, pay_url: legacy.pay_url };
      } else {
        throw err;
      }
    }

    if (!checkout.pay_url) {
      throw new Error('PagBank não retornou a URL de pagamento.');
    }

    // Trava opção/atletas/plano e guarda o checkout
    await supabase
      .from('portal_teams')
      .update({
        pagbank_checkout_id: checkout.id,
        payment_option: chosenOption,
        athletes_paid_qty: athQty,
        payment_plan: team.payment_plan || activePlanSize(new Date()),
      })
      .eq('id', team.id);

    return NextResponse.json({ ok: true, url: checkout.pay_url, id: checkout.id, amount: chargeCents });
  } catch (err) {
    console.error('create-checkout (pagbank) error', err);
    return NextResponse.json({ ok: false, message: err.message || 'Erro ao criar pagamento.' }, { status: 500 });
  }
}
