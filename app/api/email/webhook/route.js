import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

// Webhook do Resend (assinado via Svix): registra abertura e clique de e-mails.
// Configurar no Resend → Webhooks → endpoint /api/email/webhook
// eventos: email.opened, email.clicked · secret em RESEND_WEBHOOK_SECRET

function verifySvix(secret, headers, payload) {
  const id = headers.get('svix-id');
  const ts = headers.get('svix-timestamp');
  const sigHeader = headers.get('svix-signature');
  if (!id || !ts || !sigHeader) return false;
  // tolerância de 5 minutos
  if (Math.abs(Date.now() / 1000 - Number(ts)) > 300) return false;
  const secretBytes = Buffer.from(secret.replace(/^whsec_/, ''), 'base64');
  const expected = crypto.createHmac('sha256', secretBytes)
    .update(`${id}.${ts}.${payload}`)
    .digest('base64');
  return sigHeader.split(' ').some(part => {
    const v = part.split(',')[1];
    if (!v) return false;
    try {
      const a = Buffer.from(v);
      const b = Buffer.from(expected);
      return a.length === b.length && crypto.timingSafeEqual(a, b);
    } catch { return false; }
  });
}

export async function POST(req) {
  try {
    const raw = await req.text();

    const secret = process.env.RESEND_WEBHOOK_SECRET || '';
    if (secret && !verifySvix(secret, req.headers, raw)) {
      return NextResponse.json({ ok: false, message: 'Assinatura inválida' }, { status: 401 });
    }

    let evt;
    try { evt = JSON.parse(raw); } catch {
      return NextResponse.json({ ok: false, message: 'JSON inválido' }, { status: 400 });
    }

    const type = evt?.type || '';
    if (type !== 'email.opened' && type !== 'email.clicked') {
      return NextResponse.json({ ok: true, ignored: type });
    }

    const opened = type === 'email.opened';
    const blastField = opened ? 'opened_at' : 'clicked_at';
    const ciField = opened ? 'email_opened_at' : 'email_clicked_at';
    const now = new Date().toISOString();

    const supabase = getSupabaseAdmin();
    const emailId = evt?.data?.email_id || null;
    const tos = Array.isArray(evt?.data?.to) ? evt.data.to : [evt?.data?.to].filter(Boolean);

    // 1) Disparo específico (quando temos o id do Resend gravado no envio)
    if (emailId) {
      await supabase.from('email_blast_recipients')
        .update({ [blastField]: now })
        .eq('resend_id', emailId)
        .is(blastField, null);
    }

    // 2) Selo no pré-inscrito (primeiro registro vence)
    for (const to of tos) {
      const email = String(to).toLowerCase().trim();
      if (!email) continue;
      await supabase.from('club_interests')
        .update({ [ciField]: now })
        .ilike('email', email)
        .is(ciField, null);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('email webhook error', err);
    return NextResponse.json({ ok: false, message: err.message }, { status: 500 });
  }
}
