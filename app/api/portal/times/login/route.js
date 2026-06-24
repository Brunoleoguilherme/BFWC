import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { pbkdf2Sync } from 'crypto';

function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(':');
  const test = pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return test === hash;
}

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ ok: false, message: 'E-mail e senha obrigatórios.' }, { status: 400 });

    const supabase = getSupabaseAdmin();
    const { data: team } = await supabase
      .from('portal_teams')
      .select('id, club_name, contact_name, email, country, city, category, athletes_count, status, email_verified, password_hash, whatsapp')
      .ilike('email', email.trim())
      .single();

    if (!team) return NextResponse.json({ ok: false, code: 'NOT_FOUND', message: 'Nenhuma conta encontrada com este e-mail.' }, { status: 404 });

    if (!team.email_verified) return NextResponse.json({ ok: false, code: 'EMAIL_NOT_VERIFIED', message: 'E-mail não verificado. Verifique sua caixa de entrada.' }, { status: 403 });

    if (team.status === 'pending_approval') return NextResponse.json({ ok: false, code: 'PENDING_APPROVAL', message: 'Cadastro aguardando aprovação pelo administrador.' }, { status: 403 });

    if (team.status === 'rejected') return NextResponse.json({ ok: false, code: 'REJECTED', message: 'Cadastro recusado. Entre em contato com a organização.' }, { status: 403 });

    if (team.status !== 'approved') return NextResponse.json({ ok: false, code: 'NOT_APPROVED', message: 'Cadastro ainda não aprovado.' }, { status: 403 });

    const valid = verifyPassword(password, team.password_hash);
    if (!valid) return NextResponse.json({ ok: false, code: 'WRONG_PASSWORD', message: 'Senha incorreta.' }, { status: 401 });

    const { password_hash: _, ...safeTeam } = team;
    return NextResponse.json({ ok: true, team: safeTeam });
  } catch (err) {
    console.error('portal login error', err);
    return NextResponse.json({ ok: false, message: 'Erro interno.' }, { status: 500 });
  }
}
