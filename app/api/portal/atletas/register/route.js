import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { getResend, fromEmail } from '@/lib/email';
import { randomUUID, pbkdf2Sync, randomBytes } from 'crypto';

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, password, language = 'pt' } = body;

    if (!name || !email || !password)
      return NextResponse.json({ ok: false, message: 'Campos obrigatórios faltando.' }, { status: 400 });
    if (password.length < 8)
      return NextResponse.json({ ok: false, message: 'Senha deve ter pelo menos 8 caracteres.' }, { status: 400 });

    const supabase = getSupabaseAdmin();
    const cleanEmail = email.toLowerCase().trim();

    // 1. Check if already registered
    const { data: existing } = await supabase
      .from('portal_athletes')
      .select('id')
      .eq('email', cleanEmail)
      .single();
    if (existing)
      return NextResponse.json({ ok: false, code: 'ALREADY_EXISTS', message: 'Este e-mail já está cadastrado.' }, { status: 409 });

    // 2. Check if athlete email is on any approved team's roster
    const { data: rosterEntry } = await supabase
      .from('team_athletes')
      .select('id, team_id, name, category, portal_teams(id, club_name, status)')
      .ilike('email', cleanEmail)
      .single();

    if (!rosterEntry)
      return NextResponse.json({
        ok: false,
        code: 'NOT_IN_ROSTER',
        message: 'Seu e-mail não foi encontrado na lista de atletas de nenhum clube. Solicite ao responsável do seu clube que te adicione na lista.',
      }, { status: 403 });

    const teamStatus = rosterEntry.portal_teams?.status;
    if (teamStatus && teamStatus !== 'approved')
      return NextResponse.json({
        ok: false,
        code: 'TEAM_NOT_APPROVED',
        message: 'O clube ao qual você pertence ainda não foi aprovado no portal. Aguarde a aprovação.',
      }, { status: 403 });

    // 3. Create athlete account
    const password_hash = hashPassword(password);
    const verification_token = randomUUID();
    const token_expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const { error } = await supabase.from('portal_athletes').insert({
      team_athlete_id: rosterEntry.id,
      team_id: rosterEntry.team_id,
      name: name.trim(),
      email: cleanEmail,
      password_hash,
      email_verified: false,
      email_verification_token: verification_token,
      email_token_expires_at: token_expires,
      status: 'pending_email',
    });
    if (error) throw error;

    // 4. Send verification email
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://brasilflagworldchampionship.com';
    const verifyUrl = `${siteUrl}/api/portal/atletas/verify-email?token=${verification_token}`;

    try {
      const resend = getResend();
      await resend.emails.send({
        from: fromEmail,
        to: email,
        subject: 'BFWC 2026 — Confirme seu e-mail (Atleta)',
        html: `
        <div style="font-family:Inter,sans-serif;background:#031020;color:#fff;padding:40px 24px;max-width:560px;margin:0 auto;border-radius:16px">
          <h1 style="font-size:28px;font-weight:900;margin:0 0 6px">BFWC <span style="color:#20e33f">2026</span></h1>
          <p style="color:rgba(255,255,255,.4);font-size:13px;margin:0 0 28px">Área dos Atletas</p>
          <h2 style="font-size:20px;font-weight:800;margin:0 0 12px">Confirme seu e-mail</h2>
          <p style="color:#c8d8f5;font-size:14px;line-height:1.6;margin:0 0 24px">
            Olá, <strong>${name}</strong>! Confirme seu e-mail para acessar o portal de atletas do BFWC 2026.
          </p>
          <a href="${verifyUrl}" style="display:inline-block;padding:14px 32px;background:#20e33f;color:#031020;font-weight:900;font-size:14px;text-decoration:none;border-radius:10px;letter-spacing:1px;text-transform:uppercase">
            Confirmar e-mail →
          </a>
          <p style="color:rgba(255,255,255,.3);font-size:12px;margin:24px 0 0">Este link expira em 24 horas.</p>
        </div>`,
      });
    } catch (_) {}

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('athlete register error', err);
    return NextResponse.json({ ok: false, message: err.message || 'Erro interno.' }, { status: 500 });
  }
}
