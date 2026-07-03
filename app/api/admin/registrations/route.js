import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { getSupabaseServer } from '@/lib/supabaseServer';
import { totalCentsForTeam } from '@/lib/installments';

async function getAdminUser() {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from('admin_profiles')
    .select('name, role')
    .eq('id', user.id)
    .single();
  if (!profile || profile.role === 'pending') return null;
  return { ...user, profile };
}

// Funil por PAGAMENTO (portal_teams):
//  - Inscritos   = pagou ao menos a 1ª parcela (payment_confirmed) mas ainda não quitou
//  - Confirmados = pagamento completo (amount_paid >= total)
export async function GET() {
  const adminUser = await getAdminUser();
  if (!adminUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = getSupabaseAdmin();

  const { data: teams, error: tErr } = await supabase
    .from('portal_teams')
    .select('id, club_name, country, city, category, status, payment_confirmed, payment_option, athletes_paid_qty, payment_plan, amount_paid_cents, created_at');
  if (tErr) return NextResponse.json({ error: tErr.message }, { status: 500 });

  const { data: insts } = await supabase
    .from('payment_installments')
    .select('team_id, plan_size, status');

  const { data: roster } = await supabase
    .from('team_athletes')
    .select('id, team_id, name, category, jersey_number');

  // contagem real de atletas por time
  const athCount = {};
  (roster || []).forEach(a => { athCount[a.team_id] = (athCount[a.team_id] || 0) + 1; });

  const instBy = {};
  (insts || []).forEach(i => { (instBy[i.team_id] ||= []).push(i); });

  const enrich = (team) => {
    const paid = team.amount_paid_cents || 0;
    const total = totalCentsForTeam(team);
    const its = instBy[team.id] || [];
    const planSize = team.payment_plan || its[0]?.plan_size || null;
    const paidCount = its.filter(i => i.status === 'paid').length;
    const fully = total > 0 && paid >= total;
    return {
      id: team.id, club_name: team.club_name, country: team.country || '', city: team.city || '',
      category: team.category || '', option: String(team.payment_option || '1') === '2' ? '2' : '1',
      athletes: athCount[team.id] || 0,
      total_cents: total, paid_cents: paid, remaining_cents: Math.max(0, total - paid),
      plan_size: planSize, paid_count: paidCount, fully_paid: fully,
    };
  };

  const inscritos = [];
  const confirmados = [];
  const withRoster = []; // todos os times com atletas no roster (independente de pagamento)

  (teams || []).forEach(team => {
    const e = enrich(team);
    const stage = e.fully_paid ? 'confirmado' : team.payment_confirmed ? 'inscrito' : 'pendente';
    const row = { ...e, stage };

    if (team.payment_confirmed) {
      if (e.fully_paid) confirmados.push(e);
      else inscritos.push(e);
    }
    if (e.athletes > 0) withRoster.push(row);
  });

  inscritos.sort((a, b) => b.paid_cents - a.paid_cents);
  confirmados.sort((a, b) => a.club_name.localeCompare(b.club_name));
  // roster: confirmados > inscritos > pendentes, depois por nº de atletas
  const stageRank = { confirmado: 0, inscrito: 1, pendente: 2 };
  withRoster.sort((a, b) => (stageRank[a.stage] - stageRank[b.stage]) || (b.athletes - a.athletes));

  const athletesTotal = [...inscritos, ...confirmados].reduce((s, t) => s + t.athletes, 0);
  const rosterAthletesTotal = withRoster.reduce((s, t) => s + t.athletes, 0);

  // Mapa time → dados de exibição (para lista por atleta)
  const teamMap = {};
  (teams || []).forEach(team => {
    const e = enrich(team);
    teamMap[team.id] = {
      club_name: team.club_name || '', city: team.city || '', country: team.country || '',
      stage: e.fully_paid ? 'confirmado' : team.payment_confirmed ? 'inscrito' : 'pendente',
    };
  });

  // Lista de atletas individuais
  const athletes = (roster || []).map(a => {
    const tm = teamMap[a.team_id] || {};
    return {
      id: a.id, team_id: a.team_id,
      name: a.name || '', category: a.category || '', jersey_number: a.jersey_number ?? null,
      club_name: tm.club_name || '', city: tm.city || '', country: tm.country || '',
      stage: tm.stage || 'pendente',
    };
  }).sort((a, b) => a.club_name.localeCompare(b.club_name) || a.name.localeCompare(b.name));

  return NextResponse.json({
    ok: true,
    inscritos,
    confirmados,
    with_roster: withRoster,
    athletes,
    counts: {
      inscritos: inscritos.length,
      confirmados: confirmados.length,
      athletes_total: athletesTotal,
      roster_teams: withRoster.length,
      roster_athletes: rosterAthletesTotal,
    },
  });
}
