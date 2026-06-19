import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import {
  getResend,
  fromEmail,
  newsletterConfirmationHtml,
  adminNewsletterHtml
} from '@/lib/email';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, language = 'pt', source_page = 'site' } = body;

    if (!email) {
      return NextResponse.json(
        { ok: false, message: 'E-mail obrigatório' },
        { status: 400 }
      );
    }

    // Salva no Supabase (ignora duplicados com upsert)
    const supabase = getSupabaseAdmin();
    await supabase
      .from('newsletter_subscribers')
      .upsert({ email, language, source_page, subscribed_at: new Date().toISOString() }, { onConflict: 'email', ignoreDuplicates: true });

    // Envia emails em paralelo (não bloqueia se falhar)
    const resend = getResend();

    await Promise.allSettled([
      // Boas-vindas para o inscrito
      resend.emails.send({
        from: fromEmail,
        to: email,
        subject: 'Bem-vindo ao Brasil Flag World Championship 2026!',
        html: newsletterConfirmationHtml({ email, language })
      }),
      // Notificação para BSB
      resend.emails.send({
        from: fromEmail,
        to: 'contato@brasilsportsbusiness.com',
        subject: '[BFWC 2026] Novo inscrito na newsletter',
        html: adminNewsletterHtml({ email })
      })
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('newsletter error', error);
    return NextResponse.json(
      { ok: false, message: error.message || 'Internal error' },
      { status: 500 }
    );
  }
}
