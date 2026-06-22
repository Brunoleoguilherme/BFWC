import { getSupabaseServer } from '@/lib/supabaseServer';
import { NextResponse } from 'next/server';

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
 * Requires the caller to NOT be a viewer (admin or blue_panda can write).
 */
export async function requireWriter() {
  const profile = await getCallerProfile();
  if (!profile) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  if (profile.role === 'viewer') return { error: NextResponse.json({ error: 'Permissão negada. Viewers não podem alterar dados.' }, { status: 403 }) };
  return { profile };
}
