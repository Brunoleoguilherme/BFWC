import { NextResponse } from 'next/server';
import { getResend, fromEmail, adminEmails } from '@/lib/email';

export async function POST(req) {
  try {
    const { name, email, role, justification } = await req.json();
    if (!name || !email || !justification)
      return NextResponse.json({ ok: false, message: 'Campos obrigatórios faltando.' }, { status: 400 });

    const resend = getResend();
    await Promise.allSettled(
      adminEmails.map(to => resend.emails.send({
        from: fromEmail,
        to,
        subject: `[BFWC Portal] Solicitação de acesso admin: ${name}`,
        html: `
        <div style="font-family:Inter,sans-serif;background:#031020;color:#fff;padding:40px 24px;max-width:560px;margin:0 auto;border-radius:16px">
          <h1 style="font-size:28px;font-weight:900;margin:0 0 6px">BFWC <span style="color:#f4ff00">2026</span></h1>
          <p style="color:rgba(255,255,255,.4);font-size:13px;margin:0 0 28px">Solicitação de Acesso Admin</p>
          <h2 style="font-size:18px;font-weight:800;margin:0 0 16px">🔐 Nova solicitação de acesso administrativo</h2>
          <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
            ${[['Nome', name], ['E-mail', email], ['Cargo', role || '—'], ['Justificativa', justification]].map(([l, v]) => `
              <tr>
                <td style="padding:8px 0;color:rgba(255,255,255,.4);font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;width:110px;vertical-align:top">${l}</td>
                <td style="padding:8px 0;color:#fff;font-size:14px">${v}</td>
              </tr>`).join('')}
          </table>
          <p style="color:rgba(255,255,255,.3);font-size:12px">Se aprovar, crie o acesso manualmente no painel do Supabase ou entre em contato com o solicitante pelo e-mail acima.</p>
        </div>`,
      }))
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('admin request error', err);
    return NextResponse.json({ ok: false, message: 'Erro ao enviar.' }, { status: 500 });
  }
}
