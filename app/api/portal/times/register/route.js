import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { getResend, fromEmail, adminEmails } from '@/lib/email';
import { randomUUID } from 'crypto';
import { createHash, pbkdf2Sync, randomBytes } from 'crypto';

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

function verifyEmailHtml({ club_name, contact_name, verifyUrl }) {
  return `
  <div style="font-family:Inter,sans-serif;background:#031020;color:#fff;padding:40px 24px;max-width:560px;margin:0 auto;border-radius:16px">
    <h1 style="font-size:28px;font-weight:900;margin:0 0 6px">BFWC <span style="color:#f4ff00">2026</span></h1>
    <p style="color:rgba(255,255,255,.4);font-size:13px;margin:0 0 28px">Brasil Flag World Championship</p>
    <h2 style="font-size:20px;font-weight:800;margin:0 0 12px">Confirme seu e-mail</h2>
    <p style="color:#c8d8f5;font-size:14px;line-height:1.6;margin:0 0 24px">
      Olá, <strong>${contact_name}</strong>! Para ativar o cadastro do clube <strong>${club_name}</strong> no portal, confirme seu e-mail clicando no botão abaixo.
    </p>
    <a href="${verifyUrl}" style="display:inline-block;padding:14px 32px;background:#f4ff00;color:#031020;font-weight:900;font-size:14px;text-decoration:none;border-radius:10px;letter-spacing:1px;text-transform:uppercase">
      Confirmar e-mail →
    </a>
    <p style="color:rgba(255,255,255,.3);font-size:12px;margin:24px 0 0">Este link expira em 24 horas. Se não foi você, ignore este e-mail.</p>
  </div>`;
}

function adminNewTeamHtml({ club_name, contact_name, email, country, city, category, approveUrl }) {
  return `
  <div style="font-family:Inter,sans-serif;background:#031020;color:#fff;padding:40px 24px;max-width:560px;margin:0 auto;border-radius:16px">
    <h1 style="font-size:28px;font-weight:900;margin:0 0 6px">BFWC <span style="color:#f4ff00">2026</span></h1>
    <p style="color:rgba(255,255,255,.4);font-size:13px;margin:0 0 28px">Novo cadastro no Portal</p>
    <h2 style="font-size:18px;font-weight:800;margin:0 0 16px">✅ Novo clube aguardando aprovação</h2>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
      ${[['Clube', club_name],['Contato', contact_name],['E-mail', email],['País', country],['Cidade', city],['Categoria', category]].map(([l,v]) => `
        <tr><td style="padding:8px 0;color:rgba(255,255,255,.4);font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;width:100px">${l}</td>
        <td style="padding:8px 0;color:#fff;font-size:14px">${v || '—'}</td></tr>`).join('')}
    </table>
    <a href="${approveUrl}" style="display:inline-block;padding:14px 32px;background:#20e33f;color:#031020;font-weight:900;font-size:14px;text-decoration:none;border-radius:10px;letter-spacing:1px;text-transform:uppercase">
      Aprovar cadastro →
    </a>
    <p style="color:rgba(255,255,255,.3);font-size:12px;margin:16px 0 0">Ou acesse o painel admin para gerenciar.</p>
  </div>`;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { club_name, country, city, contact_name, contact_role, email, whatsapp, category, athletes_count, password, language = 'pt' } = body;

    const required = { club_name, contact_name, email, password };
    const missing = Object.entries(required).filter(([,v]) => !v).map(([k]) => k);
    if (missing.length) return NextResponse.json({ ok: false, message: 'Campos obrigatórios faltando', missing }, { status: 400 });
    if (password.length < 8) return NextResponse.json({ ok: false, message: 'Senha deve ter pelo menos 8 caracteres' }, { status: 400 });

    const supabase = getSupabaseAdmin();

    // Check if email already exists
    const { data: existing } = await supabase.from('portal_teams').select('id').ilike('email', email).single();
    if (existing) return NextResponse.json({ ok: false, message: 'Este e-mail já está cadastrado.' }, { status: 409 });

    const password_hash = hashPassword(password);
    const verification_token = randomUUID();
    const token_expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const { data: team, error } = await supabase.from('portal_teams').insert({
      club_name, country, city, contact_name, contact_role,
      email: email.toLowerCase().trim(),
      whatsapp, category, athletes_count: athletes_count ? parseInt(athletes_count) : null,
      password_hash,
      email_verification_token: verification_token,
      email_token_expires_at: token_expires,
      status: 'pending_email',
      preferred_language: language,
    }).select('id').single();

    if (error) throw error;

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://brasilflagworldchampionship.com';
    const verifyUrl = `${siteUrl}/api/portal/times/verify-email?token=${verification_token}`;
    const approveUrl = `${siteUrl}/admin/portal-teams`;

    const resend = getResend();
    await Promise.allSettled([
      resend.emails.send({
        from: fromEmail,
        to: email,
        subject: 'BFWC 2026 — Confirme seu e-mail',
        html: verifyEmailHtml({ club_name, contact_name, verifyUrl }),
      }),
      ...adminEmails.map(to => resend.emails.send({
        from: fromEmail,
        to,
        subject: `[BFWC Portal] Novo clube aguardando aprovação: ${club_name}`,
        html: adminNewTeamHtml({ club_name, contact_name, email, country, city, category, approveUrl }),
      })),
    ]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('portal register error', err);
    return NextResponse.json({ ok: false, message: err.message || 'Erro interno' }, { status: 500 });
  }
}
