import { getSupabaseServer } from '@/lib/supabaseServer';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

/**
 * Verifica a senha de login de um admin (para confirmar ações destrutivas).
 * Faz um sign-in isolado (sem persistir sessão) com email + senha.
 * Retorna true se a senha estiver correta.
 */
export async function verifyPassword(email, password) {
  if (!email || !password) return false;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return false;
  const client = createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } });
  const { error } = await client.auth.signInWithPassword({ email, password });
  return !error;
}

/**
 * Returns the authenticated admin profile, or null.
 */
export async function getCallerProfile() {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from('admin_profiles')
    .select('id, name, role, email')
    .eq('id', user.id)
    .single();
  return profile ? { ...profile, authId: user.id } : null;
}

/**
 * Requires the caller to be authenticated.
 * Returns { profile } or { error: NextResponse }.
 */
export async function requireAuth() {
  const profile = await getCallerProfile();
  if (!profile) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  return { profile };
}

/**
 * Requires the caller to have 'admin' role.
 * Viewers and blue_panda are blocked.
 */
export async function requireAdmin() {
  const profile = await getCallerProfile();
  if (!profile) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  if (profile.role !== 'admin') return { error: NextResponse.json({ error: 'Permissão negada. Apenas admins podem realizar esta ação.' }, { status: 403 }) };
  return { profile };
}

/**
 * Requires the caller to have one of the given roles (admin sempre passa).
 */
export async function requireRoles(...roles) {
  const profile = await getCallerProfile();
  if (!profile) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  const allowed = ['admin', ...roles];
  if (!allowed.includes(profile.role)) return { error: NextResponse.json({ error: 'Permissão negada.' }, { status: 403 }) };
  return { profile };
}

/**
 * Requires the caller to NOT be a viewer (admin or blue_panda can write).
 */
export async function requireWriter() {
  const profile = await getCallerProfile();
  if (!profile) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  if (profile.role === 'viewer') return { error: NextResponse.json({ error: 'Permissão negada. Viewers não podem alterar dados.' }, { status: 403 }) };
  return { profile };
}
