import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { getResend, fromEmail, emailShell } from '@/lib/email';
import { randomUUID } from 'crypto';

const COPY = {
  pt: {
    subject: 'BFWC 2026 — Redefinir sua senha',
    badge: 'BFWC 2026 · Portal dos Atletas',
    title: 'Redefinir senha',
    subtitle: 'Recebemos um pedido para redefinir a senha da sua conta de atleta.',
    hello: (name) => `Olá, <strong>${name}</strong>!`,
    body: 'Clique no botão abaixo para criar uma nova senha. O link vale por <strong>1 hora</strong>.',
    btn: 'Criar nova senha',
    ignore: 'Se você não pediu a redefinição, ignore este e-mail — sua senha continua a mesma.',
    generic: 'Se este e-mail estiver cadastrado, enviamos um link de redefinição. Verifique sua caixa de entrada (e spam).',
  },
  en: {
    subject: 'BFWC 2026 — Reset your password',
    badge: 'BFWC 2026 · Athlete Portal',
    title: 'Reset password',
    subtitle: 'We received a request to reset your athlete account password.',
    hello: (name) => `Hello, <strong>${name}</strong>!`,
    body: 'Click the button below to create a new password. The link is valid for <strong>1 hour</strong>.',
    btn: 'Create new password',
    ignore: 'If you did not request this, ignore this email — your password remains unchanged.',
    generic: 'If this email is registered, we sent a reset link. Check your inbox (and spam).',
  },
  es: {
    subject: 'BFWC 2026 — Restablecer tu contraseña',
    badge: 'BFWC 2026 · Portal de Atletas',
    title: 'Restablecer contraseña',
    subtitle: 'Recibimos una solicitud para restablecer la contraseña de tu cuenta de atleta.',
    hello: (name) => `¡Hola, <strong>${name}</strong>!`,
    body: 'Haz clic en el botón para crear una nueva contraseña. El enlace vale por <strong>1 hora</strong>.',
    btn: 'Crear nueva contraseña',
    ignore: 'Si no solicitaste el cambio, ignora este correo — tu contraseña sigue igual.',
    generic: 'Si este correo está registrado, enviamos un enlace de restablecimiento. Revisa tu bandeja (y spam).',
  },
};

export async function POST(req) {
  try {
    const { email, language } = await req.json();
    const lang = ['pt', 'en', 'es'].includes(language) ? language : 'pt';
    const c = COPY[lang];

    if (!email || !email.includes('@')) {
      return NextResponse.json({ ok: false, message: 'E-mail inválido.' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data: athlete } = await supabase
      .from('portal_athletes')
      .select('id, name, email')
      .ilike('email', email.trim())
      .single();

    // Resposta sempre genérica para não revelar se o e-mail existe
    if (!athlete) return NextResponse.json({ ok: true, message: c.generic });

    const token = randomUUID();
    const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hora

    const { error: upErr } = await supabase
      .from('portal_athletes')
      .update({ password_reset_token: token, password_reset_expires_at: expires })
      .eq('id', athlete.id);
    if (upErr) throw upErr;

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.brasilflagworldchampionship.com';
    const resetUrl = `${siteUrl}/portal/atletas/recuperar-senha?token=${token}`;

    const inner = `<tr>
      <td style="padding:0 28px 8px">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#081733;border:1px solid #16294d;border-radius:18px">
          <tr><td style="padding:28px 30px">
            <p style="margin:0 0 12px;font-size:15px;color:#e3e9f2;font-family:Arial,sans-serif;line-height:1.6">${c.hello(athlete.name)}</p>
            <p style="margin:0 0 20px;font-size:14px;color:#9fb0c8;font-family:Arial,sans-serif;line-height:1.6">${c.body}</p>
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
              <tr><td align="center" style="border-radius:12px;background:#009c3b">
                <a href="${resetUrl}" style="display:inline-block;padding:15px 36px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;font-family:Arial,sans-serif;border-radius:12px">${c.btn}</a>
              </td></tr>
            </table>
            <p style="margin:20px 0 0;font-size:12px;color:#5c7091;font-family:Arial,sans-serif;line-height:1.6">${c.ignore}</p>
            <p style="margin:10px 0 0;font-size:11px;color:#3c4d68;font-family:Arial,sans-serif;word-break:break-all;line-height:1.5">${resetUrl}</p>
          </td></tr>
        </table>
      </td>
    </tr>`;

    const resend = getResend();
    await resend.emails.send({
      from: fromEmail,
      to: athlete.email,
      subject: c.subject,
      html: emailShell({
        preheader: c.subtitle,
        badge: c.badge,
        accent: '#4ade80',
        band: '#009c3b',
        title: c.title,
        subtitle: c.subtitle,
        innerHtml: inner,
      }),
    });

    return NextResponse.json({ ok: true, message: c.generic });
  } catch (err) {
    console.error('[atletas/forgot-password]', err);
    return NextResponse.json({ ok: false, message: 'Erro interno. Tente novamente.' }, { status: 500 });
  }
}
