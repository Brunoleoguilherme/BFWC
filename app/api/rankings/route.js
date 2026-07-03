import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { aggregateScorers } from '@/lib/rankings';

// Público — ranking de artilheiros a partir das partidas confirmadas pelo delegado.
// Só retorna dados agregados de pontuação (informação pública do campeonato).
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const team = searchParams.get('team');       // filtrar por nome de time (portal do time)
  const category = searchParams.get('category');

  const supabase = getSupabaseAdmin();
  const { data: games, error } = await supabase
    .from('games')
    .select('id, category, team1_name, team2_name, delegate_report, delegate_confirmed')
    .eq('delegate_confirmed', true);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  let scorers = aggregateScorers(games || [], category ? { category } : {});
  if (team) scorers = scorers.filter(s => s.team_name === team);

  // Enriquece com foto do atleta (portal_athletes.photo_url) e logo do time (portal_teams.logo_url)
  const { data: pAthletes } = await supabase.from('portal_athletes').select('team_athlete_id, photo_url');
  const { data: pTeams } = await supabase.from('portal_teams').select('club_name, logo_url');
  const photoByAthlete = {};
  (pAthletes || []).forEach(a => { if (a.team_athlete_id) photoByAthlete[a.team_athlete_id] = a.photo_url || null; });
  const logoByTeam = {};
  (pTeams || []).forEach(t => { if (t.club_name) logoByTeam[t.club_name] = t.logo_url || null; });
  scorers = scorers.map(s => ({
    ...s,
    photo: s.athlete_id ? (photoByAthlete[s.athlete_id] || null) : null,
    team_logo: logoByTeam[s.team_name] || null,
  }));

  const categories = [...new Set((games || []).map(g => g.category).filter(Boolean))];

  return NextResponse.json({ ok: true, scorers, categories });
}
