import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { pbkdf2Sync, randomBytes } from 'crypto';

// Mesmo formato de hash usado no cadastro de atletas (register/route.js)
function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

const MSG = {
  pt: {
    missing: 'Token e nova senha são obrigatórios.',
    short: 'A senha deve ter no mínimo 8 caracteres.',
    invalid: 'Link inválido ou já utilizado. Peça um novo link.',
    expired: 'Link expirado. Peça um novo link de redefinição.',
    ok: 'Senha alterada com sucesso! Faça login com a nova senha.',
  },
  en: {
    missing: 'Token and new password are required.',
    short: 'Password must be at least 8 characters.',
    invalid: 'Invalid or already used link. Request a new one.',
    expired: 'Link expired. Request a new reset link.',
    ok: 'Password changed successfully! Log in with your new password.',
  },
  es: {
    missing: 'El token y la nueva contraseña son obligatorios.',
    short: 'La contraseña debe tener al menos 8 caracteres.',
    invalid: 'Enlace inválido o ya utilizado. Solicita uno nuevo.',
    expired: 'Enlace expirado. Solicita un nuevo enlace.',
    ok: '¡Contraseña cambiada con éxito! Inicia sesión con la nueva contraseña.',
  },
};

export async function POST(req) {
  try {
    const { token, password, language } = await req.json();
    const m = MSG[['pt', 'en', 'es'].includes(language) ? language : 'pt'];

    if (!token || !password) return NextResponse.json({ ok: false, message: m.missing }, { status: 400 });
    if (password.length < 8) return NextResponse.json({ ok: false, message: m.short }, { status: 400 });

    const supabase = getSupabaseAdmin();
    const { data: athlete } = await supabase
      .from('portal_athletes')
      .select('id, password_reset_expires_at')
      .eq('password_reset_token', token)
      .single();

    if (!athlete) return NextResponse.json({ ok: false, message: m.invalid }, { status: 404 });

    if (!athlete.password_reset_expires_at || new Date(athlete.password_reset_expires_at) < new Date()) {
      return NextResponse.json({ ok: false, message: m.expired }, { status: 410 });
    }

    const { error } = await supabase
      .from('portal_athletes')
      .update({
        password_hash: hashPassword(password),
        password_reset_token: null,
        password_reset_expires_at: null,
      })
      .eq('id', athlete.id);
    if (error) throw error;

    return NextResponse.json({ ok: true, message: m.ok });
  } catch (err) {
    console.error('[atletas/reset-password]', err);
    return NextResponse.json({ ok: false, message: 'Erro interno. Tente novamente.' }, { status: 500 });
  }
}
