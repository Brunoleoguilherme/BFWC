import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { pbkdf2Sync } from 'crypto';
import { isPortalTimesOpen, PORTAL_NOT_OPEN_MESSAGE } from '@/lib/registrationWindow';

function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(':');
  const test = pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return test === hash;
}

export async function POST(req) {
  try {
    // Portal fechado até 07/07/2026 10:00 (Brasília)
    if (!isPortalTimesOpen()) {
      return NextResponse.json({ ok: false, code: 'NOT_OPEN', message: PORTAL_NOT_OPEN_MESSAGE }, { status: 403 });
    }

    const { email, password } = await req.json();
    if (!email || !password)
      return NextResponse.json({ ok: false, message: 'E-mail e senha obrigatórios.' }, { status: 400 });

    const supabase = getSupabaseAdmin();
    const { data: athlete } = await supabase
      .from('portal_athletes')
      .select('id, name, email, status, email_verified, password_hash, team_id, team_athlete_id, portal_teams(club_name)')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (!athlete)
      return NextResponse.json({ ok: false, code: 'NOT_FOUND', message: 'Nenhuma conta encontrada com este e-mail.' }, { status: 404 });

    if (!athlete.email_verified)
      return NextResponse.json({ ok: false, code: 'EMAIL_NOT_VERIFIED', message: 'E-mail não verificado. Verifique sua caixa de entrada.' }, { status: 403 });

    if (athlete.status !== 'active' && athlete.status !== 'approved')
      return NextResponse.json({ ok: false, code: 'INACTIVE', message: 'Conta inativa. Entre em contato com a organização.' }, { status: 403 });

    if (!verifyPassword(password, athlete.password_hash))
      return NextResponse.json({ ok: false, code: 'WRONG_PASSWORD', message: 'Senha incorreta.' }, { status: 401 });

    const { password_hash: _, ...safe } = athlete;
    return NextResponse.json({ ok: true, athlete: safe });
  } catch (err) {
    console.error('athlete login error', err);
    return NextResponse.json({ ok: false, message: 'Erro interno.' }, { status: 500 });
  }
}
