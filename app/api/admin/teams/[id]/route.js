import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { getSupabaseServer } from '@/lib/supabaseServer';

async function getAdminUser() {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from('admin_profiles')
    .select('name, role, email')
    .eq('id', user.id)
    .single();
  if (!profile) return null;
  return { ...user, profile };
}

export async function PATCH(request, { params }) {
  const adminUser = await getAdminUser();
  if (!adminUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const supabase = getSupabaseAdmin();

  // Campos que podem ser atualizados
  const allowed = ['status', 'admin_notes', 'flagged_suspect'];
  const updates = {};
  for (const key of allowed) {
    if (key in body) updates[key] = body[key];
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Nenhum campo para atualizar' }, { status: 400 });
  }

  updates.updated_at = new Date().toISOString();

  // Busca status anterior para o evento
  const { data: current } = await supabase
    .from('club_interests')
    .select('status, club_name')
    .eq('id', id)
    .single();

  if ('status' in updates && updates.status === 'aprovado') {
    updates.approved_at = new Date().toISOString();
    updates.approved_by = adminUser.profile.name || adminUser.email;
  }

  const { error } = await supabase
    .from('club_interests')
    .update(updates)
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Registrar evento se status mudou
  if ('status' in updates && current && current.status !== updates.status) {
    await supabase.from('team_events').insert({
      team_id: id,
      event_type: 'status_changed',
      from_status: current.status,
      to_status: updates.status,
      description: `Status alterado de "${current.status}" para "${updates.status}"`,
      created_by: adminUser.profile.name || adminUser.email,
    });
  }

  if ('admin_notes' in updates) {
    await supabase.from('team_events').insert({
      team_id: id,
      event_type: 'note_added',
      description: 'Anotação atualizada',
      created_by: adminUser.profile.name || adminUser.email,
    });
  }

  return NextResponse.json({ ok: true });
}

export async function GET(request, { params }) {
  const adminUser = await getAdminUser();
  if (!adminUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const supabase = getSupabaseAdmin();

  const [teamResult, eventsResult] = await Promise.all([
    supabase.from('club_interests').select('*').eq('id', id).single(),
    supabase
      .from('team_events')
      .select('*')
      .eq('team_id', id)
      .order('created_at', { ascending: false }),
  ]);

  if (teamResult.error) return NextResponse.json({ error: teamResult.error.message }, { status: 404 });

  return NextResponse.json({
    team: teamResult.data,
    events: eventsResult.data || [],
  });
}
