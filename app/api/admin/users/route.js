import { NextResponse } from 'next/server';
import { emailLogoImg } from '@/lib/email';
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
  // Solicitações pendentes não têm acesso a nada do painel
  if (!profile || profile.role === 'pending') return null;
  return { ...profile, id: user.id, email: user.email };
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
    admin.from('portal_teams').select('id, email, club_name, logo_url, created_at, status').order('created_at', { ascending: true }),
    admin.from('portal_athletes').select('id, email, name, photo_url, created_at, status').order('created_at', { ascending: true }),
  ]);

  const users = [
    ...(adminsRes.data || []).map(u => ({ ...u, avatar: null, source: 'admin' })),
    ...(teamsRes.data || []).map(u => ({
      id: u.id, email: u.email, name: u.club_name, avatar: u.logo_url || null,
      role: 'times', created_at: u.created_at, status: u.status, source: 'times',
    })),
    ...(athletesRes.data || []).map(u => ({
      id: u.id, email: u.email, name: u.name, avatar: u.photo_url || null,
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

// PATCH — editar dados de um usuário (nome, e-mail, papel/status) — admin-only
// Também usado para aprovar solicitações pendentes (muda o papel de 'pending').
export async function PATCH(request) {
  const caller = await getCallerProfile();
  if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (caller.role !== 'admin') return NextResponse.json({ error: 'Apenas admins podem editar usuários' }, { status: 403 });

  const { id, source = 'admin', name, email, role, status } = await request.json();
  if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 });

  // Normaliza e valida e-mail, se veio
  let cleanEmail;
  if (email !== undefined && email !== null && email !== '') {
    cleanEmail = String(email).trim().toLowerCase();
    if (!cleanEmail.includes('@')) {
      return NextResponse.json({ error: 'E-mail inválido' }, { status: 400 });
    }
  }

  const admin = getSupabaseAdmin();

  // ───────────────────────── USUÁRIO DO PAINEL ─────────────────────────
  if (source === 'admin') {
    const ALLOWED = ['admin', 'viewer', 'blue_panda', 'arbitragem', 'delegado_partida'];
    if (role !== undefined && !ALLOWED.includes(role)) {
      return NextResponse.json({ error: 'Papel inválido' }, { status: 400 });
    }

    // Estado anterior — para saber se é uma aprovação e se o e-mail mudou
    const { data: prev } = await admin
      .from('admin_profiles').select('role, email').eq('id', id).single();

    // Se o e-mail de login mudou, atualiza também no Supabase Auth
    if (cleanEmail && prev && cleanEmail !== String(prev.email || '').toLowerCase()) {
      const { error: authErr } = await admin.auth.admin.updateUserById(id, {
        email: cleanEmail,
        email_confirm: true,
      });
      if (authErr) {
        return NextResponse.json({ error: 'Não foi possível atualizar o e-mail de login: ' + authErr.message }, { status: 400 });
      }
    }

    const patch = {};
    if (name !== undefined) patch.name = name;
    if (cleanEmail !== undefined) patch.email = cleanEmail;
    if (role !== undefined) patch.role = role;
    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: 'Nada para atualizar' }, { status: 400 });
    }

    const { data: target, error: updErr } = await admin
      .from('admin_profiles').update(patch).eq('id', id).select('email, name').single();
    if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });

    // E-mail de "acesso liberado" apenas quando aprova um pendente
    const isApproval = prev?.role === 'pending' && role && role !== 'pending';
    if (isApproval) {
      try {
        const { getResend, fromEmail } = await import('@/lib/email');
        await getResend().emails.send({
          from: fromEmail,
          to: target.email,
          subject: '✅ Acesso ao painel BFWC 2026 liberado',
          html: `<div style="font-family:Arial,sans-serif">${emailLogoImg(96, 'margin:0 0 14px')}<h2 style="color:#0a7d28">Acesso liberado!</h2><p>Olá, <strong>${target.name}</strong>. Seu acesso ao painel administrativo do BFWC 2026 foi aprovado. Você já pode entrar com seu e-mail e a senha que você cadastrou.</p><p><a href="https://www.brasilflagworldchampionship.com/admin/login">Entrar no painel</a></p></div>`,
        });
      } catch (e) { console.error('approval email error', e.message); }
    }

    return NextResponse.json({ ok: true });
  }

  // ───────────────────────── PORTAL DE TIMES ─────────────────────────
  if (source === 'times') {
    const patch = {};
    if (name !== undefined) patch.club_name = name;
    if (cleanEmail !== undefined) patch.email = cleanEmail;
    if (status !== undefined) patch.status = status;
    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: 'Nada para atualizar' }, { status: 400 });
    }
    const { error } = await admin.from('portal_teams').update(patch).eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  // ───────────────────────── PORTAL DE ATLETAS ─────────────────────────
  if (source === 'atleta') {
    const patch = {};
    if (name !== undefined) patch.name = name;
    if (cleanEmail !== undefined) patch.email = cleanEmail;
    if (status !== undefined) patch.status = status;
    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: 'Nada para atualizar' }, { status: 400 });
    }
    const { error } = await admin.from('portal_athletes').update(patch).eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Origem de usuário inválida' }, { status: 400 });
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
