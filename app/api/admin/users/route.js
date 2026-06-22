import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { getSupabaseServer } from '@/lib/supabaseServer';

// Verify caller is an authenticated admin
async function getCallerProfile() {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from('admin_profiles').select('role').eq('id', user.id).single();
  return profile ? { ...profile, id: user.id } : null;
}

// GET — list all admin users
export async function GET() {
  const caller = await getCallerProfile();
  if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from('admin_profiles')
    .select('id, email, name, role, created_at')
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ users: data });
}

// POST — create new admin user
export async function POST(request) {
  const caller = await getCallerProfile();
  if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (caller.role !== 'admin') return NextResponse.json({ error: 'Apenas admins podem criar usuários' }, { status: 403 });

  const { name, email, password, role } = await request.json();
  if (!name || !email || !password) {
    return NextResponse.json({ error: 'Nome, e-mail e senha são obrigatórios' }, { status: 400 });
  }

  const admin = getSupabaseAdmin();

  // Create auth user
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) return NextResponse.json({ error: authError.message }, { status: 400 });

  // Insert profile
  const { error: profileError } = await admin.from('admin_profiles').insert({
    id: authData.user.id,
    email,
    name,
    role: role || 'admin',
  });

  if (profileError) {
    // Rollback auth user
    await admin.auth.admin.deleteUser(authData.user.id);
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: authData.user.id });
}

// DELETE — remove admin user
export async function DELETE(request) {
  const caller = await getCallerProfile();
  if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (caller.role !== 'admin') return NextResponse.json({ error: 'Apenas admins podem remover usuários' }, { status: 403 });

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 });
  if (id === caller.id) return NextResponse.json({ error: 'Você não pode remover a si mesmo' }, { status: 400 });

  const admin = getSupabaseAdmin();
  const { error } = await admin.auth.admin.deleteUser(id); // cascades admin_profiles
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
