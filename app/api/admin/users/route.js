import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { getSupabaseServer } from '@/lib/supabaseServer';

// Verify caller is an authenticated admin (returns email too)
async function getCallerProfile() {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from('admin_profiles').select('role').eq('id', user.id).single();
  return profile ? { ...profile, id: user.id, email: user.email } : null;
}

// Verify the caller's password by signing in with anon client
async function verifyPassword(email, password) {
  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  const { error } = await anonClient.auth.signInWithPassword({ email, password });
  return !error;
}

// GET — list all users (admin panel + portal teams + portal athletes)
export async function GET() {
  const caller = await getCallerProfile();
  if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = getSupabaseAdmin();

  const [adminsRes, teamsRes, athletesRes] = await Promise.all([
    admin.from('admin_profiles').select('id, email, name, role, created_at').order('created_at', { ascending: true }),
    admin.from('portal_teams').select('id, email, club_name, created_at, status').order('created_at', { ascending: true }),
    admin.from('portal_athletes').select('id, email, name, created_at, status').order('created_at', { ascending: true }),
  ]);

  const users = [
    ...(adminsRes.data || []).map(u => ({ ...u, source: 'admin' })),
    ...(teamsRes.data || []).map(u => ({
      id: u.id, email: u.email, name: u.club_name,
      role: 'times', created_at: u.created_at, status: u.status, source: 'times',
    })),
    ...(athletesRes.data || []).map(u => ({
      id: u.id, email: u.email, name: u.name,
      role: 'atleta', created_at: u.created_at, status: u.status, source: 'atleta',
    })),
  ];

  return NextResponse.json({ users });
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

// DELETE — remove user (admin panel, portal atleta or portal times)
// Requires the caller's login password as confirmation
export async function DELETE(request) {
  const caller = await getCallerProfile();
  if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (caller.role !== 'admin') return NextResponse.json({ error: 'Apenas admins podem remover usuários' }, { status: 403 });

  const { id, password, source } = await request.json();
  if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 });
  if (!password) return NextResponse.json({ error: 'Senha obrigatória para excluir' }, { status: 400 });
  if (id === caller.id) return NextResponse.json({ error: 'Você não pode remover a si mesmo' }, { status: 400 });

  // Verify admin password before proceeding
  const passwordOk = await verifyPassword(caller.email, password);
  if (!passwordOk) return NextResponse.json({ error: 'Senha incorreta. Tente novamente.' }, { status: 401 });

  const admin = getSupabaseAdmin();

  // Delete based on source
  if (source === 'atleta') {
    const { error } = await admin.from('portal_athletes').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else if (source === 'times') {
    const { error } = await admin.from('portal_teams').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    // Admin panel user — delete from Supabase Auth (cascades admin_profiles)
    const { error } = await admin.auth.admin.deleteUser(id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
