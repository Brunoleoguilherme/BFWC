import { PTS_BY_KEY } from './sumula';

// Agrega artilheiros a partir das pontuações por atleta registradas pelo delegado.
// games: array de jogos (com delegate_report.scores). Considera só o que existir.
export function aggregateScorers(games, { category } = {}) {
  const map = {};
  for (const g of (games || [])) {
    if (category && g.category !== category) continue;
    const scores = g.delegate_report?.scores || [];
    for (const s of scores) {
      const key = s.athlete_id || `name:${s.athlete_name}`;
      const teamName = s.team === 'team1' ? g.team1_name : g.team2_name;
      if (!map[key]) map[key] = {
        athlete_id: s.athlete_id || null, name: s.athlete_name || '—', jersey: s.jersey ?? null,
        team_name: teamName, category: g.category || null,
        points: 0, td: 0, conv1: 0, conv2: 0, safety: 0, int_td: 0, int_conv1: 0, int_conv2: 0,
        _games: new Set(),
      };
      const m = map[key];
      m.points += PTS_BY_KEY[s.play_key] || 0;
      if (m[s.play_key] !== undefined) m[s.play_key] += 1; // td, conv1, conv2, safety, int_td, int_conv1, int_conv2
      m._games.add(g.id);
    }
  }
  return Object.values(map)
    .map(m => ({
      athlete_id: m.athlete_id, name: m.name, jersey: m.jersey, team_name: m.team_name, category: m.category,
      points: m.points, td: m.td, conv1: m.conv1, conv2: m.conv2, safety: m.safety,
      int_td: m.int_td, int_conv1: m.int_conv1, int_conv2: m.int_conv2,
      conv: m.conv1 + m.conv2, def: m.int_td + m.int_conv1 + m.int_conv2,
      games: m._games.size,
    }))
    .sort((a, b) => b.points - a.points || b.td - a.td || a.name.localeCompare(b.name));
}

// Pontos por time (marcados nas partidas confirmadas)
export function aggregateTeamScorers(games, teamName) {
  return aggregateScorers(games).filter(s => s.team_name === teamName);
}
