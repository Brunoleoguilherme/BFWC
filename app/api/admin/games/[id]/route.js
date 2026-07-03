import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAuth, requireAdmin, requireRoles } from '@/lib/authAdmin';
import { scoreFromCounts, PTS_BY_KEY } from '@/lib/sumula';

// GET — um jogo + rosters dos dois times (para check-in do delegado)
export async function GET(_req, { params }) {
  const { error } = await requireAuth();
  if (error) return error;
  const { id } = await params;
  const supabase = getSupabaseAdmin();

  const { data: game, error: gErr } = await supabase.from('games').select('*').eq('id', id).single();
  if (gErr || !game) return NextResponse.json({ error: 'Jogo não encontrado.' }, { status: 404 });

  const ids = [game.team1_id, game.team2_id].filter(Boolean);
  let roster = [];
  if (ids.length) {
    const { data } = await supabase
      .from('team_athletes')
      .select('id, team_id, name, jersey_number, category')
      .in('team_id', ids);
    roster = data || [];
  }
  const team1_roster = roster.filter(a => a.team_id === game.team1_id);
  const team2_roster = roster.filter(a => a.team_id === game.team2_id);

  return NextResponse.json({ ok: true, game, team1_roster, team2_roster });
}

// PATCH — atualiza detalhes | súmula | relatório do delegado
export async function PATCH(request, { params }) {
  const { id } = await params;
  const { section, data, close, confirm } = await request.json();
  const supabase = getSupabaseAdmin();

  if (section === 'details') {
    const { error } = await requireAdmin();
    if (error) return error;
    const b = data || {};
    const { error: dbErr } = await supabase.from('games').update({
      team1_id: b.team1_id ?? undefined, team2_id: b.team2_id ?? undefined,
      team1_name: b.team1_name, team2_name: b.team2_name,
      category: b.category ?? null, group_name: b.group_name ?? null, phase: b.phase ?? 'group',
      game_date: b.game_date || null, game_time: b.game_time || null,
      field: b.field ?? null, warmup_time: b.warmup_time || null,
      status: b.status || 'scheduled', notes: b.notes ?? null,
      delegate_id: b.delegate_id ?? null,
    }).eq('id', id);
    if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (section === 'sumula') {
    const { error } = await requireRoles('arbitragem');
    if (error) return error;
    const sumula = data || {};
    const t1 = scoreFromCounts(sumula?.plays?.team1);
    const t2 = scoreFromCounts(sumula?.plays?.team2);
    const upd = {
      sumula,
      team1_score: t1,
      team2_score: t2,
      sumula_closed: !!close,
    };
    if (close) upd.status = 'finished';
    const { error: dbErr } = await supabase.from('games').update(upd).eq('id', id);
    if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
    return NextResponse.json({ ok: true, team1_score: t1, team2_score: t2 });
  }

  if (section === 'referees') {
    const { error } = await requireRoles('arbitragem');
    if (error) return error;
    const list = Array.isArray(data) ? data : [];
    const { error: dbErr } = await supabase.from('games').update({ referees: list }).eq('id', id);
    if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (section === 'delegate') {
    const { error } = await requireRoles('delegado_partida');
    if (error) return error;
    const report = data || {};
    // Placar calculado a partir das pontuações por atleta
    const scores = Array.isArray(report.scores) ? report.scores : [];
    let t1 = 0, t2 = 0;
    for (const s of scores) {
      const pts = PTS_BY_KEY[s.play_key] || 0;
      if (s.team === 'team1') t1 += pts; else if (s.team === 'team2') t2 += pts;
    }
    const upd = { delegate_report: report, team1_score: t1, team2_score: t2 };
    if (typeof confirm === 'boolean') {
      upd.delegate_confirmed = confirm;
      if (confirm) upd.status = 'finished';
    }
    const { error: dbErr } = await supabase.from('games').update(upd).eq('id', id);
    if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
    return NextResponse.json({ ok: true, team1_score: t1, team2_score: t2 });
  }

  return NextResponse.json({ error: 'Seção inválida.' }, { status: 400 });
}

// DELETE — remove um jogo (admin)
export async function DELETE(_req, { params }) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;
  const supabase = getSupabaseAdmin();
  const { error: dbErr } = await supabase.from('games').delete().eq('id', id);
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
