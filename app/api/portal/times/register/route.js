import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { getResend, fromEmail, adminEmails, emailLogoImg } from '@/lib/email';
import { randomUUID } from 'crypto';
import { pbkdf2Sync, randomBytes } from 'crypto';
import { isCadastroRestricted, isPortalTimesOpen, PORTAL_NOT_OPEN_MESSAGE } from '@/lib/registrationWindow';

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

function verifyEmailHtml({ club_name, contact_name, verifyUrl }) {
  return `
  <div style="font-family:Inter,sans-serif;background:#031020;color:#fff;padding:40px 24px;max-width:560px;margin:0 auto;border-radius:16px">
    ${emailLogoImg(110, 'margin:0 0 10px')}
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

function adminNewTeamHtml({ club_name, contact_name, email, country, city, category, logo_url, approveUrl }) {
  return `
  <div style="font-family:Inter,sans-serif;background:#031020;color:#fff;padding:40px 24px;max-width:560px;margin:0 auto;border-radius:16px">
    ${emailLogoImg(110, 'margin:0 0 10px')}
    <p style="color:rgba(255,255,255,.4);font-size:13px;margin:0 0 28px">Novo cadastro no Portal</p>
    <h2 style="font-size:18px;font-weight:800;margin:0 0 16px">✅ Novo clube aguardando aprovação</h2>
    ${logo_url ? `<img src="${logo_url}" alt="Logo do clube" style="width:64px;height:64px;object-fit:contain;border-radius:8px;background:rgba(255,255,255,.05);margin-bottom:16px;display:block">` : ''}
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
      ${[['Clube', club_name],['Contato', contact_name],['E-mail', email],['País', country],['Cidade', city],['Categoria', category]].map(([l,v]) => `
        <tr><td style="padding:8px 0;color:rgba(255,255,255,.4);font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;width:100px">${l}</td>
        <td style="padding:8px 0;color:#fff;font-size:14px">${v || '—'}</td></tr>`).join('')}
    </table>
    <a href="${approveUrl}" style="display:inline-block;padding:14px 32px;background:#009c3b;color:#fff;font-weight:900;font-size:14px;text-decoration:none;border-radius:10px;letter-spacing:1px;text-transform:uppercase">
      Aprovar cadastro →
    </a>
    <p style="color:rgba(255,255,255,.3);font-size:12px;margin:16px 0 0">Ou acesse o painel admin para gerenciar.</p>
  </div>`;
}

async function uploadLogo(supabase, file, teamId) {
  try {
    const allowed = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowed.includes(file.type)) return null;

    const bytes = await file.arrayBuffer();
    if (bytes.byteLength > 2 * 1024 * 1024) return null;

    const ext = file.name.split('.').pop().toLowerCase() || 'png';
    const path = `teams/${teamId}/logo.${ext}`;

    const { error } = await supabase.storage
      .from('portal-media')
      .upload(path, bytes, { contentType: file.type, upsert: true });

    if (error) { console.error('logo upload error', error); return null; }

    const { data } = supabase.storage.from('portal-media').getPublicUrl(path);
    return data.publicUrl;
  } catch (e) {
    console.error('logo upload exception', e);
    return null;
  }
}

const TERMS_VERSION = '2026-07-06';

function clientIp(req) {
  return (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || req.headers.get('x-real-ip') || null;
}

export async function POST(req) {
  try {
    // Portal fechado até 07/07/2026 10:00 (Brasília)
    if (!isPortalTimesOpen()) {
      return NextResponse.json({ ok: false, code: 'NOT_OPEN', message: PORTAL_NOT_OPEN_MESSAGE }, { status: 403 });
    }

    // Support both FormData (new) and JSON (legacy)
    const contentType = req.headers.get('content-type') || '';
    let club_name, country, city, contact_name, contact_role, email, whatsapp,
        category, athletes_count, password, language, logoFile;

    if (contentType.includes('multipart/form-data')) {
      const fd = await req.formData();
      club_name     = fd.get('club_name');
      country       = fd.get('country');
      city          = fd.get('city');
      contact_name  = fd.get('contact_name');
      contact_role  = fd.get('contact_role');
      email         = fd.get('email');
      whatsapp      = fd.get('whatsapp');
      category      = fd.get('category');
      athletes_count= fd.get('athletes_count');
      password      = fd.get('password');
      language      = fd.get('language') || 'pt';
      const logo    = fd.get('logo');
      if (logo && logo.size > 0) logoFile = logo;
    } else {
      const body = await req.json();
      ({ club_name, country, city, contact_name, contact_role, email, whatsapp,
         category, athletes_count, password, language = 'pt' } = body);
    }

    const required = { club_name, contact_name, email, password };
    const missing = Object.entries(required).filter(([,v]) => !v).map(([k]) => k);
    if (missing.length) return NextResponse.json({ ok: false, message: 'Campos obrigatórios faltando', missing }, { status: 400 });
    if (password.length < 8) return NextResponse.json({ ok: false, message: 'Senha deve ter pelo menos 8 caracteres' }, { status: 400 });

    const supabase = getSupabaseAdmin();

    // Janela 07/07 00:00 → 12/07 23:59 (Brasília): só times já pré-inscritos podem se cadastrar
    if (isCadastroRestricted()) {
      const { data: pre } = await supabase
        .from('club_interests')
        .select('id')
        .ilike('email', email)
        .maybeSingle();
      if (!pre) {
        return NextResponse.json({
          ok: false, code: 'NEEDS_PRE',
          message: 'Neste período, o cadastro está liberado apenas para times já pré-inscritos. Verifique se usou o mesmo e-mail da pré-inscrição.',
        }, { status: 403 });
      }
    }

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
      terms_version: TERMS_VERSION,
      terms_accepted_at: new Date().toISOString(),
      terms_ip: clientIp(req),
    }).select('id').single();

    if (error) throw error;

    // Upload logo if provided
    let logo_url = null;
    if (logoFile && team?.id) {
      logo_url = await uploadLogo(supabase, logoFile, team.id);
      if (logo_url) {
        await supabase.from('portal_teams').update({ logo_url }).eq('id', team.id);
      }
    }

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
        html: adminNewTeamHtml({ club_name, contact_name, email, country, city, category, logo_url, approveUrl }),
      })),
    ]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('portal register error', err);
    return NextResponse.json({ ok: false, message: err.message || 'Erro interno' }, { status: 500 });
  }
}
