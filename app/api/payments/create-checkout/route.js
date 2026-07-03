import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { createCheckout, createLegacyCheckout } from '@/lib/pagbank';
import { createCheckoutSession } from '@/lib/stripe';
import { countCategories, optionTotalReais, activePlanSize, fullCategoryFor, computeInstallments } from '@/lib/installments';

// Cartão de crédito via checkout hospedado.
// Provedor escolhido pela env CARD_PROVIDER: 'stripe' (padrão) ou 'pagbank'.
// Contrato: retorna { ok, url } e o portal redireciona.
export async function POST(req) {
  try {
    // Interruptor: NEXT_PUBLIC_CARD_ENABLED=0 desliga o cartão (mostra "em breve")
    if (process.env.NEXT_PUBLIC_CARD_ENABLED === '0') {
      return NextResponse.json({ ok: false, code: 'CARD_SOON', message: 'Pagamento por cartão estará disponível em breve. Por enquanto, use o Pix.' }, { status: 503 });
    }
    const { team_id, option, athletes_qty, installment_number } = await req.json();
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

    // Parcela específica (igual ao Pix): plano automático por data, travado na 1ª cobrança
    const planSize = team.payment_plan || activePlanSize(new Date());
    const num = Math.min(Math.max(parseInt(installment_number, 10) || 0, 0), planSize);
    let parcela = null;
    if (num > 0) {
      const plan = computeInstallments(totalCents / 100, planSize);
      parcela = plan.find((p) => p.number === num);
      if (!parcela) return NextResponse.json({ ok: false, message: 'Parcela inválida.' }, { status: 400 });
      const { data: existingInst } = await supabase
        .from('payment_installments')
        .select('id, status')
        .eq('team_id', team.id)
        .eq('number', num)
        .maybeSingle();
      if (existingInst?.status === 'paid') {
        return NextResponse.json({ ok: false, code: 'ALREADY_PAID', message: 'Essa parcela já foi paga.' }, { status: 409 });
      }
    }

    // Valor: parcela escolhida ou saldo restante (compatibilidade)
    const baseCents = parcela ? parcela.amount_cents : remaining;

    // Override de teste: cobra R$ 1 só do time deste e-mail (igual ao PIX_TEST_EMAIL)
    const testEmail = (process.env.CARD_TEST_EMAIL || '').trim().toLowerCase();
    const chargeCents = testEmail && (team.email || '').toLowerCase() === testEmail ? 100 : baseCents;

    const notifUrl = `${(process.env.PAGBANK_NOTIFICATION_BASE || siteUrl).replace(/\/$/, '')}/api/payments/pagbank/webhook`;

    const provider = (process.env.CARD_PROVIDER || 'stripe').toLowerCase();

    let checkout;
    if (provider === 'stripe') {
      const session = await createCheckoutSession({
        mode: 'payment',
        client_reference_id: team.id,
        customer_email: team.email,
        locale: 'pt-BR',
        metadata: { team_id: team.id, club_name: team.club_name, ...(parcela ? { installment_number: String(num), plan_size: String(planSize) } : {}) },
        payment_intent_data: { metadata: { team_id: team.id, ...(parcela ? { installment_number: String(num) } : {}) } },
        // Parcelamento no cartão na própria tela da Stripe
        payment_method_options: { card: { installments: { enabled: true } } },
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: 'brl',
              unit_amount: chargeCents,
              product_data: {
                name: parcela ? `Inscrição BFWC 2026 — parcela ${num}/${planSize} — ${team.club_name}` : `Inscrição BFWC 2026 — ${team.club_name}`,
                description: parcela ? `Parcela ${num} de ${planSize} · vencimento ${parcela.due_date}` : (paidCents > 0 ? 'Saldo restante da inscrição' : 'Taxa de inscrição'),
              },
            },
          },
        ],
        success_url: `${siteUrl}/portal/times?paid=1&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${siteUrl}/portal/times?canceled=1`,
      });
      checkout = { id: session.id, pay_url: session.url };
    } else {
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
    }

    if (!checkout.pay_url) {
      throw new Error('PagBank não retornou a URL de pagamento.');
    }

    // Trava opção/atletas/plano e guarda o checkout
    await supabase
      .from('portal_teams')
      .update({
        ...(provider === 'stripe' ? { stripe_session_id: checkout.id } : { pagbank_checkout_id: checkout.id }),
        payment_option: chosenOption,
        athletes_paid_qty: athQty,
        payment_plan: planSize,
      })
      .eq('id', team.id);

    // Registra a parcela pendente (mesma tabela do Pix; preserva cobrança Cora existente)
    if (parcela) {
      await supabase
        .from('payment_installments')
        .upsert({
          team_id: team.id,
          plan_size: planSize,
          number: num,
          amount_cents: chargeCents,
          due_date: parcela.due_date,
          status: 'pending',
        }, { onConflict: 'team_id,number' });
    }

    return NextResponse.json({ ok: true, url: checkout.pay_url, id: checkout.id, amount: chargeCents });
  } catch (err) {
    console.error('create-checkout error', err);
    return NextResponse.json({ ok: false, message: err.message || 'Erro ao criar pagamento.' }, { status: 500 });
  }
}
