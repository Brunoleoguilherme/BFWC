import { NextResponse } from 'next/server';
import { isPortalTimesOpen, PORTAL_NOT_OPEN_MESSAGE } from '@/lib/registrationWindow';

const TERMS_VERSION = '2026-07-06';
const EVENT_DATE = '2026-10-31';

function clientIp(req) {
  return (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || req.headers.get('x-real-ip') || null;
}

function isMinorAtEvent(birthdate) {
  if (!birthdate) return false;
  const b = new Date(birthdate + 'T00:00:00');
  const e = new Date(EVENT_DATE + 'T00:00:00');
  let age = e.getFullYear() - b.getFullYear();
  const m = e.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && e.getDate() < b.getDate())) age--;
  return age < 18;
}
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { getResend, fromEmail, emailLogoImg } from '@/lib/email';
import { randomUUID, pbkdf2Sync, randomBytes } from 'crypto';
import { isPortalTimesOpen, PORTAL_NOT_OPEN_MESSAGE } from '@/lib/registrationWindow';

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

async function uploadPhoto(supabase, file, athleteId) {
  try {
    const allowed = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowed.includes(file.type)) return null;
    const bytes = await file.arrayBuffer();
    if (bytes.byteLength > 2 * 1024 * 1024) return null;
    const ext  = file.name.split('.').pop().toLowerCase() || 'jpg';
    const path = `athletes/${athleteId}/profile.${ext}`;
    const { error } = await supabase.storage
      .from('portal-media')
      .upload(path, bytes, { contentType: file.type, upsert: true });
    if (error) { console.error('photo upload error', error); return null; }
    const { data } = supabase.storage.from('portal-media').getPublicUrl(path);
    return data.publicUrl;
  } catch (e) {
    console.error('photo upload exception', e);
    return null;
  }
}

export async function POST(req) {
  try {
    // Portal fechado até 07/07/2026 10:00 (Brasília)
    if (!isPortalTimesOpen()) {
      return NextResponse.json({ ok: false, code: 'NOT_OPEN', message: PORTAL_NOT_OPEN_MESSAGE }, { status: 403 });
    }

    // Accept FormData (new) or JSON (legacy)
    const ct = req.headers.get('content-type') || '';
    let name, email, password, language, birthdate, nationality, whatsapp,
        instagram, position, history, photoFile, guardianFile,
        terms_health, terms_image, terms_rules, terms_privacy, terms_conduct;

    if (ct.includes('multipart/form-data')) {
      const fd   = await req.formData();
      name       = fd.get('name');
      email      = fd.get('email');
      password   = fd.get('password');
      language   = fd.get('language') || 'pt';
      birthdate  = fd.get('birthdate');
      nationality= fd.get('nationality');
      whatsapp   = fd.get('whatsapp');
      instagram  = fd.get('instagram');
      position   = fd.get('position');
      history    = fd.get('history');
      terms_health  = fd.get('terms_health')  === 'true';
      terms_image   = fd.get('terms_image')   === 'true';
      terms_rules   = fd.get('terms_rules')   === 'true';
      terms_privacy = fd.get('terms_privacy') === 'true';
      terms_conduct = fd.get('terms_conduct') === 'true';
      const photo = fd.get('photo');
      if (photo && photo.size > 0) photoFile = photo;
      const guardian = fd.get('guardian_auth');
      if (guardian && guardian.size > 0) guardianFile = guardian;
    } else {
      const body = await req.json();
      ({ name, email, password, language = 'pt', birthdate, nationality, whatsapp,
         instagram, position, history } = body);
    }

    if (!name || !email || !password)
      return NextResponse.json({ ok: false, message: 'Campos obrigatórios faltando.' }, { status: 400 });
    if (password.length < 8)
      return NextResponse.json({ ok: false, message: 'Senha deve ter pelo menos 8 caracteres.' }, { status: 400 });

    const supabase   = getSupabaseAdmin();
    const cleanEmail = email.toLowerCase().trim();

    // 1. Already registered?
    const { data: existing } = await supabase
      .from('portal_athletes').select('id').eq('email', cleanEmail).single();
    if (existing)
      return NextResponse.json({ ok: false, code: 'ALREADY_EXISTS', message: 'Este e-mail já está cadastrado.' }, { status: 409 });

    // 2. Email on roster?
    const { data: rosterEntry } = await supabase
      .from('team_athletes')
      .select('id, team_id, name, category, portal_teams(id, club_name, status)')
      .ilike('email', cleanEmail).single();

    if (!rosterEntry)
      return NextResponse.json({
        ok: false, code: 'NOT_IN_ROSTER',
        message: 'Seu e-mail não foi encontrado na lista de atletas de nenhum clube. Solicite ao responsável do seu clube que te adicione na lista.',
      }, { status: 403 });

    const teamStatus = rosterEntry.portal_teams?.status;
    if (teamStatus && teamStatus !== 'approved')
      return NextResponse.json({
        ok: false, code: 'TEAM_NOT_APPROVED',
        message: 'O clube ao qual você pertence ainda não foi aprovado no portal. Aguarde a aprovação.',
      }, { status: 403 });

    // Menores: a autorização do responsável é enviada depois, no portal (prazo 30/09/2026)

    // 3. Create account
    const password_hash        = hashPassword(password);
    const verification_token   = randomUUID();
    const token_expires        = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const { data: athlete, error } = await supabase.from('portal_athletes').insert({
      team_athlete_id: rosterEntry.id,
      team_id:         rosterEntry.team_id,
      name:            name.trim(),
      email:           cleanEmail,
      password_hash,
      email_verified:              false,
      email_verification_token:    verification_token,
      email_token_expires_at:      token_expires,
      status:          'pending_email',
      birthdate:       birthdate  || null,
      nationality:     nationality|| null,
      whatsapp:        whatsapp   || null,
      instagram:       instagram  || null,
      position:        position   || null,
      history:         history    || null,
      terms_health:    terms_health  || false,
      terms_image:     terms_image   || false,
      terms_rules:     terms_rules   || false,
      terms_privacy:   terms_privacy || false,
      terms_conduct:   terms_conduct || false,
      terms_version:   TERMS_VERSION,
      terms_accepted_at: new Date().toISOString(),
      terms_ip:        clientIp(req),
    }).select('id').single();

    if (error) throw error;

    // 4. Upload photo
    if (photoFile && athlete?.id) {
      const photo_url = await uploadPhoto(supabase, photoFile, athlete.id);
      if (photo_url) await supabase.from('portal_athletes').update({ photo_url }).eq('id', athlete.id);
    }

    // 4b. Upload da autorização do responsável (menores)
    if (guardianFile && athlete?.id) {
      try {
        const ext = (guardianFile.name || 'autorizacao.pdf').split('.').pop().toLowerCase();
        const path = `athletes/${athlete.id}/autorizacao-responsavel.${ext}`;
        const bytes = Buffer.from(await guardianFile.arrayBuffer());
        const { error: upErr } = await supabase.storage
          .from('portal-media')
          .upload(path, bytes, { contentType: guardianFile.type || 'application/pdf', upsert: true });
        if (!upErr) {
          const { data } = supabase.storage.from('portal-media').getPublicUrl(path);
          await supabase.from('portal_athletes').update({ guardian_auth_url: data?.publicUrl || null }).eq('id', athlete.id);
        } else {
          console.error('guardian auth upload error', upErr);
        }
      } catch (e) { console.error('guardian auth upload exception', e); }
    }

    // 5. Send verification email
    const siteUrl  = process.env.NEXT_PUBLIC_SITE_URL || 'https://brasilflagworldchampionship.com';
    const verifyUrl = `${siteUrl}/api/portal/atletas/verify-email?token=${verification_token}`;
    try {
      const resend = getResend();
      await resend.emails.send({
        from: fromEmail,
        to:   email,
        subject: 'BFWC 2026 — Confirme seu e-mail (Atleta)',
        html: `
        <div style="font-family:Inter,sans-serif;background:#031020;color:#fff;padding:40px 24px;max-width:560px;margin:0 auto;border-radius:16px">
          ${emailLogoImg(110, 'margin:0 0 10px')}
          <p style="color:rgba(255,255,255,.4);font-size:13px;margin:0 0 28px">Área dos Atletas</p>
          <h2 style="font-size:20px;font-weight:800;margin:0 0 12px">Confirme seu e-mail</h2>
          <p style="color:#c8d8f5;font-size:14px;line-height:1.6;margin:0 0 24px">
            Olá, <strong>${name}</strong>! Confirme seu e-mail para acessar o portal de atletas do BFWC 2026.
          </p>
          <a href="${verifyUrl}" style="display:inline-block;padding:14px 32px;background:#009c3b;color:#fff;font-weight:900;font-size:14px;text-decoration:none;border-radius:10px;letter-spacing:1px;text-transform:uppercase">
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
