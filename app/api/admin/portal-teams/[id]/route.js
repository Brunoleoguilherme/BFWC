import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { getResend, fromEmail, emailLogoImg } from '@/lib/email';
import { requireAdmin, verifyPassword } from '@/lib/authAdmin';

function approvedHtml({ club_name, contact_name }) {
  return `
  <div style="font-family:Inter,sans-serif;background:#031020;color:#fff;padding:40px 24px;max-width:560px;margin:0 auto;border-radius:16px">
    ${emailLogoImg(110, 'margin:0 0 10px')}
    <p style="color:rgba(255,255,255,.4);font-size:13px;margin:0 0 28px">Portal Oficial</p>
    <h2 style="font-size:20px;font-weight:800;margin:0 0 12px">✅ Cadastro aprovado!</h2>
    <p style="color:#c8d8f5;font-size:14px;line-height:1.6;margin:0 0 24px">
      Olá, <strong>${contact_name}</strong>! O cadastro do clube <strong>${club_name}</strong> foi <strong style="color:#20e33f">aprovado</strong>. Acesse o portal com seu e-mail e senha.
    </p>
    <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://brasilflagworldchampionship.com'}/portal/times/login"
       style="display:inline-block;padding:14px 32px;background:#0D4BFF;color:#fff;font-weight:900;font-size:14px;text-decoration:none;border-radius:10px;letter-spacing:1px;text-transform:uppercase">
      Acessar portal →
    </a>
  </div>`;
}

function rejectedHtml({ club_name, contact_name, admin_notes }) {
  return `
  <div style="font-family:Inter,sans-serif;background:#031020;color:#fff;padding:40px 24px;max-width:560px;margin:0 auto;border-radius:16px">
    ${emailLogoImg(110, 'margin:0 0 10px')}
    <p style="color:rgba(255,255,255,.4);font-size:13px;margin:0 0 28px">Portal Oficial</p>
    <h2 style="font-size:20px;font-weight:800;margin:0 0 12px">❌ Cadastro não aprovado</h2>
    <p style="color:#c8d8f5;font-size:14px;line-height:1.6;margin:0 0 16px">
      Olá, <strong>${contact_name}</strong>. Após análise, o cadastro de <strong>${club_name}</strong> não foi aprovado neste momento.
    </p>
    ${admin_notes ? `<div style="padding:12px 16px;border-radius:10px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);font-size:13px;color:rgba(255,255,255,.6);margin-bottom:16px"><strong>Motivo:</strong> ${admin_notes}</div>` : ''}
    <p style="color:rgba(255,255,255,.35);font-size:13px">Em caso de dúvidas, entre em contato com a organização do BFWC 2026.</p>
  </div>`;
}

export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    const { action, admin_notes, password, fields } = await req.json();
    if (!['approve', 'reject', 'finalize', 'unfinalize', 'edit'].includes(action))
      return NextResponse.json({ ok: false, message: 'Ação inválida.' }, { status: 400 });

    const supabase = getSupabaseAdmin();
    const { data: team } = await supabase
      .from('portal_teams')
      .select('id, club_name, contact_name, email, status')
      .eq('id', id)
      .single();

    if (!team) return NextResponse.json({ ok: false, message: 'Time não encontrado.' }, { status: 404 });

    // Edição manual dos dados do time (confirmação por senha de login do admin)
    if (action === 'edit') {
      const { profile, error: authErr } = await requireAdmin();
      if (authErr) return authErr;
      const okPwd = await verifyPassword(profile.email, password);
      if (!okPwd) return NextResponse.json({ ok: false, message: 'Senha incorreta.' }, { status: 401 });

      const allowed = ['club_name', 'city', 'country', 'contact_name', 'contact_role', 'email', 'whatsapp', 'instagram', 'description', 'category'];
      const updates = {};
      for (const k of allowed) {
        if (fields && fields[k] !== undefined) {
          const v = typeof fields[k] === 'string' ? fields[k].trim() : fields[k];
          updates[k] = v === '' ? null : v;
        }
      }
      if (updates.email) updates.email = String(updates.email).toLowerCase().trim();
      if (!updates.club_name) delete updates.club_name; // nome não pode ficar vazio
      if (!Object.keys(updates).length)
        return NextResponse.json({ ok: false, message: 'Nada para atualizar.' }, { status: 400 });

      // E-mail é o login do time: bloqueia colisão com outro cadastro
      if (updates.email) {
        const { data: clash } = await supabase
          .from('portal_teams').select('id').ilike('email', updates.email).neq('id', id).maybeSingle();
        if (clash) return NextResponse.json({ ok: false, message: 'Já existe outro time com este e-mail.' }, { status: 409 });
      }

      const { error: upErr } = await supabase.from('portal_teams').update(updates).eq('id', id);
      if (upErr) return NextResponse.json({ ok: false, message: upErr.message }, { status: 500 });
      return NextResponse.json({ ok: true, updated: Object.keys(updates) });
    }

    // Marcação manual de "Inscrição finalizada" (pós-análise de documentos) — sem e-mail
    if (action === 'finalize' || action === 'unfinalize') {
      const { error: upErr } = await supabase.from('portal_teams')
        .update({ registration_finalized: action === 'finalize' })
        .eq('id', id);
      if (upErr) return NextResponse.json({ ok: false, message: upErr.message }, { status: 500 });
      return NextResponse.json({ ok: true, registration_finalized: action === 'finalize' });
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    await supabase.from('portal_teams').update({
      status: newStatus,
      admin_notes: admin_notes || null,
      approved_at: action === 'approve' ? new Date().toISOString() : null,
    }).eq('id', id);

    // Notify team
    try {
      const resend = getResend();
      await resend.emails.send({
        from: fromEmail,
        to: team.email,
        subject: action === 'approve'
          ? `BFWC 2026 — Cadastro aprovado! Bem-vindo ao portal`
          : `BFWC 2026 — Atualização sobre seu cadastro`,
        html: action === 'approve'
          ? approvedHtml({ club_name: team.club_name, contact_name: team.contact_name })
          : rejectedHtml({ club_name: team.club_name, contact_name: team.contact_name, admin_notes }),
      });
    } catch (_) {}

    return NextResponse.json({ ok: true, status: newStatus });
  } catch (err) {
    console.error('portal-teams patch error', err);
    return NextResponse.json({ ok: false, message: err.message }, { status: 500 });
  }
}

// Exclui um clube do portal (confirmação por senha de login do admin)
export async function DELETE(req, { params }) {
  try {
    const { profile, error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;
    const { password } = await req.json().catch(() => ({}));

    const ok = await verifyPassword(profile.email, password);
    if (!ok) return NextResponse.json({ ok: false, message: 'Senha incorreta.' }, { status: 401 });

    const supabase = getSupabaseAdmin();
    const { data: team } = await supabase
      .from('portal_teams').select('id, club_name').eq('id', id).single();
    if (!team) return NextResponse.json({ ok: false, message: 'Time não encontrado.' }, { status: 404 });

    // Remove dependências antes do time (roster, contas de atleta, parcelas)
    await supabase.from('team_athletes').delete().eq('team_id', id);
    await supabase.from('portal_athletes').delete().eq('team_id', id);
    await supabase.from('payment_installments').delete().eq('team_id', id);
    const { error: delErr } = await supabase.from('portal_teams').delete().eq('id', id);
    if (delErr) return NextResponse.json({ ok: false, message: delErr.message }, { status: 500 });

    return NextResponse.json({ ok: true, deleted: team.club_name });
  } catch (err) {
    console.error('portal-teams delete error', err);
    return NextResponse.json({ ok: false, message: err.message }, { status: 500 });
  }
}
