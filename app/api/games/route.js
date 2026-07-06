import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

// Público — lista de jogos do campeonato (informação pública).
export async function GET() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('games')
    .select('id, team1_name, team2_name, team1_score, team2_score, category, group_name, phase, game_date, game_time, field, status, referees, delegate_confirmed')
    .order('game_date', { ascending: true, nullsFirst: false })
    .order('game_time', { ascending: true, nullsFirst: false });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, games: data || [] });
}
