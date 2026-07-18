import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { getSupabaseServer } from '@/lib/supabaseServer';
import { getResend, fromEmail, emailShell } from '@/lib/email';
import { randomUUID } from 'crypto';

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.brasilflagworldchampionship.com').replace(/\/$/, '');

// Confirma que o chamador é um admin autenticado do painel
async function getCaller() {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from('admin_profiles').select('role').eq('id', user.id).single();
  if (!profile || profile.role === 'pending') return null;
  return { id: user.id, role: profile.role, email: user.email };
}

// Corpo do e-mail de redefinição, no padrão visual do BFWC
function resetEmailHtml({ name, url, badge, band, accent }) {
  const inner = `<tr>
    <td style="padding:0 28px 8px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#081733;border:1px solid #16294d;border-radius:18px">
        <tr><td style="padding:28px 30px">
          <p style="margin:0 0 12px;font-size:15px;color:#e3e9f2;font-family:Arial,sans-serif;line-height:1.6">Olá, <strong>${name}</strong>!</p>
          <p style="margin:0 0 20px;font-size:14px;color:#9fb0c8;font-family:Arial,sans-serif;line-height:1.6">Recebemos um pedido para redefinir a senha da sua conta. Clique no botão abaixo para criar uma nova senha. O link vale por <strong>1 hora</strong>.</p>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
            <tr><td align="center" style="border-radius:12px;background:${band}">
              <a href="${url}" style="display:inline-block;padding:15px 36px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;font-family:Arial,sans-serif;border-radius:12px">Criar nova senha</a>
            </td></tr>
          </table>
          <p style="margin:20px 0 0;font-size:12px;color:#5c7091;font-family:Arial,sans-serif;line-height:1.6">Se você não pediu a redefinição, ignore este e-mail — sua senha continua a mesma.</p>
          <p style="margin:10px 0 0;font-size:11px;color:#3c4d68;font-family:Arial,sans-serif;word-break:break-all;line-height:1.5">${url}</p>
        </td></tr>
      </table>
    </td>
  </tr>`;

  return emailShell({
    preheader: 'Redefina sua senha do BFWC 2026',
    badge,
    accent,
    band,
    title: 'Redefinir senha',
    subtitle: 'Recebemos um pedido para redefinir a senha da sua conta.',
    innerHtml: inner,
  });
}

// POST — envia e-mail de redefinição de senha para um usuário (admin-only)
export async function POST(request) {
  const caller = await getCaller();
  if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (caller.role !== 'admin') return NextResponse.json({ error: 'Apenas admins podem redefinir senhas' }, { status: 403 });

  const { id, source = 'admin' } = await request.json();
  if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 });

  const admin = getSupabaseAdmin();

  try {
    // ── Portal de times / atletas: token próprio + link do portal ──
    if (source === 'times' || source === 'atleta') {
      const table = source === 'times' ? 'portal_teams' : 'portal_athletes';
      const nameCol = source === 'times' ? 'club_name' : 'name';
      const path = source === 'times' ? 'times' : 'atletas';

      const { data: row } = await admin
        .from(table).select(`id, email, ${nameCol}`).eq('id', id).single();
      if (!row || !row.email) {
        return NextResponse.json({ error: 'Usuário sem e-mail cadastrado.' }, { status: 404 });
      }

      const token = randomUUID();
      const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hora
      const { error: upErr } = await admin
        .from(table)
        .update({ password_reset_token: token, password_reset_expires_at: expires })
        .eq('id', id);
      if (upErr) throw upErr;

      const url = `${SITE}/portal/${path}/recuperar-senha?token=${token}`;
      const html = resetEmailHtml({
        name: row[nameCol] || (source === 'times' ? 'clube' : 'atleta'),
        url,
        badge: source === 'times' ? 'BFWC 2026 · Portal dos Times' : 'BFWC 2026 · Portal dos Atletas',
        band: '#0D4BFF',
        accent: '#5aafff',
      });

      await getResend().emails.send({
        from: fromEmail,
        to: row.email,
        subject: 'BFWC 2026 — Redefinir sua senha',
        html,
      });

      return NextResponse.json({ ok: true, email: row.email });
    }

    // ── Usuário do painel: recovery do Supabase Auth via token_hash ──
    const { data: prof } = await admin
      .from('admin_profiles').select('email, name').eq('id', id).single();
    if (!prof || !prof.email) {
      return NextResponse.json({ error: 'Usuário sem e-mail cadastrado.' }, { status: 404 });
    }

    const { data: link, error: linkErr } = await admin.auth.admin.generateLink({
      type: 'recovery',
      email: prof.email,
    });
    if (linkErr) return NextResponse.json({ error: linkErr.message }, { status: 400 });

    const tokenHash = link?.properties?.hashed_token;
    if (!tokenHash) {
      return NextResponse.json({ error: 'Não foi possível gerar o link de redefinição.' }, { status: 500 });
    }

    const url = `${SITE}/admin/recuperar-senha?token_hash=${tokenHash}&type=recovery`;
    const html = resetEmailHtml({
      name: prof.name || 'Administrador',
      url,
      badge: 'BFWC 2026 · Painel Admin',
      band: '#0b1b39',
      accent: '#f4ff00',
    });

    await getResend().emails.send({
      from: fromEmail,
      to: prof.email,
      subject: 'BFWC 2026 — Redefinir senha do painel',
      html,
    });

    return NextResponse.json({ ok: true, email: prof.email });
  } catch (err) {
    console.error('[users/reset-password]', err);
    return NextResponse.json({ error: 'Erro ao enviar o e-mail de redefinição.' }, { status: 500 });
  }
}
