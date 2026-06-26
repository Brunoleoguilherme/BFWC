import { NextResponse } from 'next/server';
import { registerEndpoint } from '@/lib/cora';

export const runtime = 'nodejs';

// Rota administrativa de uso único: registra o webhook de Pix pago na Cora.
// Proteja com o ADMIN_APPROVAL_TOKEN. Chame uma vez após o deploy:
//   GET /api/admin/cora/register-webhook?token=SEU_ADMIN_APPROVAL_TOKEN
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  if (!process.env.ADMIN_APPROVAL_TOKEN || token !== process.env.ADMIN_APPROVAL_TOKEN) {
    return NextResponse.json({ ok: false, message: 'Não autorizado.' }, { status: 401 });
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '');
  const url = `${siteUrl}/api/payments/pix/webhook`;

  try {
    const endpoint = await registerEndpoint({ url, resource: 'invoice', trigger: 'paid' });
    return NextResponse.json({ ok: true, message: 'Webhook registrado na Cora.', endpoint });
  } catch (err) {
    console.error('register-webhook error', err);
    return NextResponse.json({ ok: false, message: err.message }, { status: 500 });
  }
}
