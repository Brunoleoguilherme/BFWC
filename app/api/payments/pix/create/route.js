import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { createPixCharge } from '@/lib/cora';
import { countCategories, computeInstallments } from '@/lib/installments';

export const runtime = 'nodejs';

function classifyDocument(raw) {
  const digits = String(raw || '').replace(/\D/g, '');
  if (digits.length === 11) return { identity: digits, type: 'CPF' };
  if (digits.length === 14) return { identity: digits, type: 'CNPJ' };
  return null;
}

export async function POST(req) {
  try {
    const { team_id, plan_size, number, document } = await req.json();
    if (!team_id) return NextResponse.json({ ok: false, message: 'team_id obrigatório.' }, { status: 400 });

    const planSize = Math.min(Math.max(parseInt(plan_size, 10) || 1, 1), 3);
    const num = Math.min(Math.max(parseInt(number, 10) || 1, 1), planSize);

    const supabase = getSupabaseAdmin();
    const { data: team, error } = await supabase
      .from('portal_teams')
      .select('id, club_name, email, category, status, payer_document, payment_plan')
      .eq('id', team_id)
      .single();

    if (error || !team) return NextResponse.json({ ok: false, message: 'Time não encontrado.' }, { status: 404 });
    if (team.status !== 'approved') {
      return NextResponse.json({ ok: false, message: 'O cadastro precisa estar aprovado antes do pagamento.' }, { status: 403 });
    }

    // Trava do plano: se já há um plano definido, tem que ser o mesmo
    if (team.payment_plan && team.payment_plan !== planSize) {
      return NextResponse.json({
        ok: false, code: 'PLAN_LOCKED',
        message: `O parcelamento já foi definido em ${team.payment_plan}x. Continue pagando as parcelas desse plano.`,
      }, { status: 409 });
    }

    const doc = classifyDocument(document || team.payer_document);
    if (!doc) {
      return NextResponse.json({ ok: false, code: 'NEED_DOCUMENT', message: 'Informe um CPF ou CNPJ válido para gerar o Pix.' }, { status: 422 });
    }

    const numCats = countCategories(team.category);
    const plan = computeInstallments(numCats, planSize);
    const parcela = plan.find((p) => p.number === num);
    if (!parcela) return NextResponse.json({ ok: false, message: 'Parcela inválida.' }, { status: 400 });

    // Já existe essa parcela?
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
    if (process.env.PIX_TEST_EMAIL && team.email?.toLowerCase() === process.env.PIX_TEST_EMAIL.toLowerCase()) {
      amountCents = 500;
    }

    const charge = await createPixCharge({
      code: `${team.id}-p${num}`,
      customer: { name: team.club_name, email: team.email, document: doc },
      amountCents,
      serviceName: `Inscrição BFWC 2026 — parcela ${num}/${planSize}`,
      dueDate: parcela.due_date,
    });

    // Trava o plano no time + salva documento
    await supabase
      .from('portal_teams')
      .update({ payment_plan: planSize, payer_document: doc.identity })
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
