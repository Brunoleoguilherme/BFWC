import { NextResponse } from 'next/server';
import { getResend, fromEmail, adminEmails, emailLogoImg } from '@/lib/email';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req) {
  try {
    const { name, email, role, justification, password } = await req.json();
    if (!name || !email || !justification || !password)
      return NextResponse.json({ ok: false, message: 'Campos obrigatórios faltando.' }, { status: 400 });
    if (String(password).length < 8)
      return NextResponse.json({ ok: false, message: 'A senha deve ter no mínimo 8 caracteres.' }, { status: 400 });

    const admin = getSupabaseAdmin();

    // Cria o usuário no Supabase Auth com a senha escolhida pelo próprio solicitante.
    // A senha fica guardada (com hash) apenas pelo Supabase — nunca por nós.
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      const dup = /already|registered|exists|duplicate/i.test(authError.message || '');
      return NextResponse.json(
        { ok: false, message: dup ? 'Já existe uma conta com esse e-mail.' : authError.message },
        { status: 400 }
      );
    }

    // Perfil pendente — sem acesso ao painel até um admin aprovar.
    const { error: profErr } = await admin.from('admin_profiles').insert({
      id: authData.user.id,
      email,
      name,
      role: 'pending',
    });

    if (profErr) {
      // desfaz o usuário de auth se o perfil falhar
      await admin.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ ok: false, message: profErr.message }, { status: 500 });
    }

    // Notifica os admins para aprovarem
    const resend = getResend();
    await Promise.allSettled(
      adminEmails.map(to => resend.emails.send({
        from: fromEmail,
        to,
        subject: `[BFWC Portal] Solicitação de acesso admin: ${name}`,
        html: `
        <div style="font-family:Inter,sans-serif;background:#031020;color:#fff;padding:40px 24px;max-width:560px;margin:0 auto;border-radius:16px">
          ${emailLogoImg(110, 'margin:0 0 10px')}
          <p style="color:rgba(255,255,255,.4);font-size:13px;margin:0 0 28px">Solicitação de Acesso Admin</p>
          <h2 style="font-size:18px;font-weight:800;margin:0 0 16px">🔐 Nova solicitação de acesso administrativo</h2>
          <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
            ${[['Nome', name], ['E-mail', email], ['Cargo', role || '—'], ['Justificativa', justification]].map(([l, v]) => `
              <tr>
                <td style="padding:8px 0;color:rgba(255,255,255,.4);font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;width:110px;vertical-align:top">${l}</td>
                <td style="padding:8px 0;color:#fff;font-size:14px">${v}</td>
              </tr>`).join('')}
          </table>
          <p style="color:rgba(255,255,255,.55);font-size:13px;line-height:1.6">O solicitante já definiu a própria senha. Para liberar o acesso, abra o painel em <strong>Usuários</strong> e clique em <strong>Aprovar</strong> na seção "Aguardando aprovação".</p>
        </div>`,
      }))
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('admin request error', err);
    return NextResponse.json({ ok: false, message: 'Erro ao enviar.' }, { status: 500 });
  }
}
