import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { createPixCharge } from '@/lib/cora';

export const runtime = 'nodejs';

const CATS = ['Masculino', 'Feminino', 'Sub-15', 'Sub-12'];
const PRICE_PER_CAT_CENTS = 2000 * 100; // R$ 2.000 por categoria, em centavos

// valida CPF/CNPJ só pelo tamanho (11 = CPF, 14 = CNPJ)
function classifyDocument(raw) {
  const digits = String(raw || '').replace(/\D/g, '');
  if (digits.length === 11) return { identity: digits, type: 'CPF' };
  if (digits.length === 14) return { identity: digits, type: 'CNPJ' };
  return null;
}

export async function POST(req) {
  try {
    const { team_id, document } = await req.json();
    if (!team_id) {
      return NextResponse.json({ ok: false, message: 'team_id obrigatório.' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data: team, error } = await supabase
      .from('portal_teams')
      .select('id, club_name, email, category, status, payment_confirmed, payer_document, cora_invoice_id')
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

    // Documento do pagador: usa o enviado agora ou o já salvo
    const doc = classifyDocument(document || team.payer_document);
    if (!doc) {
      return NextResponse.json({ ok: false, code: 'NEED_DOCUMENT', message: 'Informe um CPF ou CNPJ válido para gerar o Pix.' }, { status: 422 });
    }

    const numCats = CATS.filter((c) => team.category?.includes(c)).length || 1;
    let totalCents = PRICE_PER_CAT_CENTS * numCats;

    // Override de TESTE: cobra apenas R$ 1,00 do time definido em PIX_TEST_EMAIL.
    // Não afeta nenhum outro clube. Remover/limpar essa env var após validar.
    if (
      process.env.PIX_TEST_EMAIL &&
      team.email?.toLowerCase() === process.env.PIX_TEST_EMAIL.toLowerCase()
    ) {
      totalCents = 500; // R$ 5,00 — mínimo aceito pela Cora
    }

    // Vencimento: 3 dias a partir de hoje (o Pix pode ser pago a qualquer momento antes)
    const due = new Date();
    due.setDate(due.getDate() + 3);
    const dueDate = due.toISOString().slice(0, 10);

    const charge = await createPixCharge({
      code: team.id,
      customer: {
        name: team.club_name,
        email: team.email,
        document: doc,
      },
      amountCents: totalCents,
      serviceName: `Taxa de inscrição BFWC 2026 — ${numCats} categoria(s)`,
      dueDate,
    });

    // Salva referência + documento para reconciliação e reuso
    await supabase
      .from('portal_teams')
      .update({
        cora_invoice_id: charge.id,
        payer_document: doc.identity,
        payment_amount: totalCents,
      })
      .eq('id', team.id);

    return NextResponse.json({
      ok: true,
      invoice_id: charge.id,
      emv: charge.emv,         // Pix copia-e-cola
      qrcode_url: charge.qrcodeUrl, // imagem do QR
      amount: totalCents,
    });
  } catch (err) {
    console.error('pix/create error', err);
    return NextResponse.json({ ok: false, message: err.message || 'Erro ao gerar o Pix.' }, { status: 500 });
  }
}
