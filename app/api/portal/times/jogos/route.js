import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const team_id = searchParams.get('team_id');

  const supabase = getSupabaseAdmin();

  // Get games where this team is team1 or team2
  const [r1, r2] = await Promise.all([
    supabase.from('games').select('*').eq('team1_id', team_id).order('game_date').order('game_time'),
    supabase.from('games').select('*').eq('team2_id', team_id).order('game_date').order('game_time'),
  ]);

  const all = [...(r1.data || []), ...(r2.data || [])];
  all.sort((a, b) => {
    const da = `${a.game_date} ${a.game_time}`;
    const db = `${b.game_date} ${b.game_time}`;
    return da < db ? -1 : 1;
  });

  return NextResponse.json({ ok: true, games: all });
}
