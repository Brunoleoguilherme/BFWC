import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAuth, requireAdmin, getCallerProfile } from '@/lib/authAdmin';

// GET — lista jogos. Delegado vê só os designados a ele.
export async function GET() {
  const caller = await getCallerProfile();
  if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = getSupabaseAdmin();
  let query = supabase
    .from('games')
    .select('*')
    .order('game_date', { ascending: true, nullsFirst: false })
    .order('game_time', { ascending: true, nullsFirst: false });

  if (caller.role === 'delegado_partida') query = query.eq('delegate_id', caller.id);

  const { data, error: dbErr } = await query;
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json({ ok: true, games: data || [] });
}

// POST — cria um jogo (admin)
export async function POST(request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const b = await request.json();
  if (!b.team1_name || !b.team2_name)
    return NextResponse.json({ error: 'Nomes dos dois times são obrigatórios.' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data, error: dbErr } = await supabase.from('games').insert({
    team1_id: b.team1_id || null, team2_id: b.team2_id || null,
    team1_name: b.team1_name, team2_name: b.team2_name,
    category: b.category || null, group_name: b.group_name || null, phase: b.phase || 'group',
    game_date: b.game_date || null, game_time: b.game_time || null,
    field: b.field || null, warmup_time: b.warmup_time || null,
    status: b.status || 'scheduled', notes: b.notes || null,
    delegate_id: b.delegate_id || null,
  }).select().single();
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json({ ok: true, game: data });
}
