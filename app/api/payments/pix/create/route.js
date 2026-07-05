import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { createPixCharge } from '@/lib/cora';
import { countCategories, computeInstallments, optionTotalReais, activePlanSize, fullCategoryFor } from '@/lib/installments';

export const runtime = 'nodejs';

function classifyDocument(raw) {
  const digits = String(raw || '').replace(/\D/g, '');
  if (digits.length === 11) return { identity: digits, type: 'CPF' };
  if (digits.length === 14) return { identity: digits, type: 'CNPJ' };
  return null;
}

export async function POST(req) {
  try {
    const { team_id, number, document, option, athletes_qty } = await req.json();
    if (!team_id) return NextResponse.json({ ok: false, message: 'team_id obrigatório.' }, { status: 400 });

    const supabase = getSupabaseAdmin();
    const { data: team, error } = await supabase
      .from('portal_teams')
      .select('id, club_name, email, category, status, payer_document, payment_plan, payment_option, athletes_paid_qty, payment_confirmed')
      .eq('id', team_id)
      .single();

    if (error || !team) return NextResponse.json({ ok: false, message: 'Time não encontrado.' }, { status: 404 });
    if (team.status !== 'approved') {
      return NextResponse.json({ ok: false, message: 'O cadastro precisa estar aprovado antes do pagamento.' }, { status: 403 });
    }

    // Cota por categoria: bloqueia o 1º pagamento se a categoria já lotou
    if (!team.payment_confirmed) {
      const fullCat = await fullCategoryFor(supabase, team.id, team.category);
      if (fullCat) {
        return NextResponse.json({
          ok: false, code: 'CATEGORY_FULL',
          message: `Inscrições esgotadas para a categoria ${fullCat}. A cota de times foi preenchida.`,
        }, { status: 409 });
      }
    }

    // Opção: trava na primeira parcela
    const chosenOption = team.payment_option || (String(option) === '2' ? '2' : '1');
    if (team.payment_option && String(option) && team.payment_option !== String(option)) {
      return NextResponse.json({
        ok: false, code: 'OPTION_LOCKED',
        message: `A forma de pagamento já foi definida (Opção ${team.payment_option}). Continue por ela.`,
      }, { status: 409 });
    }

    // Quantidade de atletas (opção 2): trava na primeira parcela
    const athQty = chosenOption === '2'
      ? (team.payment_option ? (team.athletes_paid_qty || 0) : Math.max(parseInt(athletes_qty, 10) || 0, 0))
      : 0;

    // Plano: automático por data, travado na primeira parcela
    const planSize = team.payment_plan || activePlanSize(new Date());
    const num = Math.min(Math.max(parseInt(number, 10) || 1, 1), planSize);

    const doc = classifyDocument(document || team.payer_document);
    if (!doc) {
      return NextResponse.json({ ok: false, code: 'NEED_DOCUMENT', message: 'Informe um CPF ou CNPJ válido para gerar o Pix.' }, { status: 422 });
    }

    const numCats = countCategories(team.category);
    const totalReais = optionTotalReais(chosenOption, numCats, athQty);
    const plan = computeInstallments(totalReais, planSize);
    const parcela = plan.find((p) => p.number === num);
    if (!parcela) return NextResponse.json({ ok: false, message: 'Parcela inválida.' }, { status: 400 });

    // Já existe essa parcela paga?
    const { data: existing } = await supabase
      .from('payment_installments')
      .select('id, status')
      .eq('team_id', team.id)
      .eq('number', num)
      .maybeSingle();

    if (existing?.status === 'paid') {
      return NextResponse.json({ ok: false, code: 'ALREADY_PAID', message: 'Essa parcela já foi paga.' }, { status: 409 });
    }

    // Valor: override de teste (R$5 por parcela) para o e-mail de teste
    let amountCents = parcela.amount_cents;
    if (process.env.PAYMENT_TEST_MODE === '1') {
      amountCents = 100; // preview de teste: R$ 1 por parcela
    } else if (process.env.PIX_TEST_EMAIL && team.email?.toLowerCase() === process.env.PIX_TEST_EMAIL.toLowerCase()) {
      amountCents = 500;
    }

    const charge = await createPixCharge({
      code: `${team.id}-p${num}`,
      customer: { name: team.club_name, email: team.email, document: doc },
      amountCents,
      serviceName: `Inscrição BFWC 2026 — parcela ${num}/${planSize}`,
      dueDate: parcela.due_date,
    });

    // Trava opção/atletas/plano no time + salva documento
    await supabase
      .from('portal_teams')
      .update({
        payment_plan: planSize,
        payment_option: chosenOption,
        athletes_paid_qty: athQty,
        payer_document: doc.identity,
      })
      .eq('id', team.id);

    // Upsert da parcela
    await supabase
      .from('payment_installments')
      .upsert({
        team_id: team.id,
        plan_size: planSize,
        number: num,
        amount_cents: amountCents,
        due_date: parcela.due_date,
        status: 'pending',
        cora_invoice_id: charge.id,
      }, { onConflict: 'team_id,number' });

    return NextResponse.json({
      ok: true,
      number: num,
      plan_size: planSize,
      amount: amountCents,
      invoice_id: charge.id,
      emv: charge.emv,
      qrcode_url: charge.qrcodeUrl,
    });
  } catch (err) {
    console.error('pix/create error', err);
    return NextResponse.json({ ok: false, message: err.message || 'Erro ao gerar o Pix.' }, { status: 500 });
  }
}
