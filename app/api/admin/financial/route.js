import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { getSupabaseServer } from '@/lib/supabaseServer';
import { totalCentsForTeam, countCategories, CATS, CATEGORY_QUOTAS, paidCategoriesOf } from '@/lib/installments';

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

// Data de hoje no fuso de Brasília (YYYY-MM-DD)
function todayBrasilia() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date());
  return parts; // en-CA => YYYY-MM-DD
}

export async function GET() {
  const adminUser = await getAdminUser();
  if (!adminUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = getSupabaseAdmin();

  const { data: teams, error: tErr } = await supabase
    .from('portal_teams')
    .select('id, club_name, email, country, category, status, payment_confirmed, payment_option, athletes_paid_qty, payment_plan, amount_paid_cents, stripe_payment_intent, payment_date, exempted_at, exemption_reason, payment_selection');
  if (tErr) return NextResponse.json({ error: tErr.message }, { status: 500 });

  const { data: installments, error: iErr } = await supabase
    .from('payment_installments')
    .select('team_id, plan_size, number, amount_cents, due_date, status, cora_invoice_id, paid_at');
  if (iErr) return NextResponse.json({ error: iErr.message }, { status: 500 });

  const today = todayBrasilia();
  const instByTeam = {};
  (installments || []).forEach(i => {
    (instByTeam[i.team_id] ||= []).push(i);
  });

  // ── Totais ──
  let arrecadado = 0;       // tudo que já entrou (Pix + Cartão)
  let esperado = 0;         // total esperado dos times comprometidos (1ª parcela paga)
  let pixCents = 0;         // parcelas pagas via Cora (Pix)

  // ── Por categoria / opção ──
  const byCategory = CATS.map(c => ({ category: c, quota: CATEGORY_QUOTAS[c] ?? null, paid_teams: 0 }));
  const byOption = {
    '1': { teams: 0, esperado_cents: 0, arrecadado_cents: 0 },
    '2': { teams: 0, esperado_cents: 0, arrecadado_cents: 0 },
  };

  const overdue = [];
  const teamRows = [];

  // ── Previsão de recebíveis: parcelas pendentes (não pagas) de times confirmados,
  //    agregadas por mês de vencimento. Vencidas e sem data ganham baldes próprios. ──
  const forecastMap = {};        // 'YYYY-MM' | 'overdue' | 'nodate' -> { amount_cents, count }
  const bumpForecast = (key, cents) => {
    (forecastMap[key] ||= { amount_cents: 0, count: 0 });
    forecastMap[key].amount_cents += cents;
    forecastMap[key].count += 1;
  };

  let isencoesCount = 0;
  let isencoesWaived = 0;

  (teams || []).forEach(team => {
    const exempt = !!team.exempted_at && team.status !== 'rejected';
    const paid = team.amount_paid_cents || 0;
    // Isento: o "esperado" vira só o que já entrou — nada a receber, nada em atraso
    const total = exempt ? paid : totalCentsForTeam(team);
    const committed = !!team.payment_confirmed || exempt;
    arrecadado += paid;
    if (exempt) {
      isencoesCount += 1;
      isencoesWaived += Math.max(0, totalCentsForTeam(team) - paid);
    }

    const insts = instByTeam[team.id] || [];
    const paidInsts = insts.filter(i => i.status === 'paid');
    const paidPix = paidInsts.filter(i => i.cora_invoice_id).reduce((s, i) => s + (i.amount_cents || 0), 0);
    pixCents += Math.min(paidPix, paid); // não ultrapassa o pago real
    const planSize = team.payment_plan || (insts[0]?.plan_size) || null;
    const paidCount = paidInsts.length;

    // método predominante
    const hasPix = paidInsts.some(i => i.cora_invoice_id);
    const hasCard = !!team.stripe_payment_intent || paidInsts.some(i => !i.cora_invoice_id);
    const method = hasPix && hasCard ? 'misto' : hasPix ? 'pix' : hasCard ? 'cartao' : '—';

    const opt = String(team.payment_option || '1') === '2' ? '2' : '1';

    if (committed) {
      esperado += total;
      byOption[opt].teams += 1;
      byOption[opt].esperado_cents += total;
      byOption[opt].arrecadado_cents += paid;

      // Conta a vaga na(s) categoria(s) que o time realmente pagou (isento = todas as inscritas).
      const paidCats = exempt ? CATS.filter((c) => team.category?.includes(c)) : paidCategoriesOf(team);
      CATS.forEach((c, idx) => {
        if (paidCats.includes(c)) byCategory[idx].paid_teams += 1;
      });

      // parcelas em atraso: pendentes com vencimento passado (isentos não têm atraso)
      insts.filter(i => !exempt && i.status !== 'paid' && i.due_date && i.due_date < today).forEach(i => {
        overdue.push({
          team_id: team.id, club_name: team.club_name,
          number: i.number, amount_cents: i.amount_cents, due_date: i.due_date,
        });
      });

      // previsão de recebíveis: todas as parcelas pendentes (isentos não têm parcelas a receber)
      if (!exempt) {
        insts.filter(i => i.status !== 'paid').forEach(i => {
          const cents = i.amount_cents || 0;
          if (!i.due_date) bumpForecast('nodate', cents);
          else if (i.due_date < today) bumpForecast('overdue', cents);
          else bumpForecast(i.due_date.slice(0, 7), cents);
        });
      }
    }

    if (paid > 0 || committed) {
      teamRows.push({
        id: team.id, club_name: team.club_name, country: team.country || '',
        category: team.category || '', option: opt,
        total_cents: total, paid_cents: paid,
        plan_size: planSize, paid_count: paidCount,
        method, status: team.status,
        payment_confirmed: committed,
        exempted: exempt,
        fully_paid: exempt || (paid >= total && total > 0) || (!!planSize && paidCount >= planSize),
      });
    }
  });

  const cardCents = Math.max(0, arrecadado - pixCents);
  const aReceber = Math.max(0, esperado - arrecadado);
  const pct = esperado > 0 ? Math.round((arrecadado / esperado) * 100) : 0;

  overdue.sort((a, b) => a.due_date.localeCompare(b.due_date));
  teamRows.sort((a, b) => b.paid_cents - a.paid_cents);

  // Monta a previsão: baldes de mês em ordem cronológica; overdue e nodate à parte.
  const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  const forecast = Object.keys(forecastMap)
    .filter(k => k !== 'overdue' && k !== 'nodate')
    .sort()
    .map(k => {
      const [y, m] = k.split('-');
      return {
        key: k,
        label: `${MESES[parseInt(m, 10) - 1]}/${y.slice(2)}`,
        amount_cents: forecastMap[k].amount_cents,
        count: forecastMap[k].count,
      };
    });
  const forecast_future_cents = forecast.reduce((s, f) => s + f.amount_cents, 0);
  const forecast_overdue_cents = forecastMap.overdue?.amount_cents || 0;
  const forecast_nodate_cents = forecastMap.nodate?.amount_cents || 0;
  const forecast_total_cents = forecast_future_cents + forecast_overdue_cents + forecast_nodate_cents;

  return NextResponse.json({
    ok: true,
    today,
    totals: {
      arrecadado_cents: arrecadado,
      esperado_cents: esperado,
      a_receber_cents: aReceber,
      pct,
      isencoes_count: isencoesCount,
      isencoes_waived_cents: isencoesWaived,
    },
    byMethod: { pix_cents: pixCents, card_cents: cardCents },
    byCategory,
    byOption,
    overdue,
    overdue_total_cents: overdue.reduce((s, o) => s + (o.amount_cents || 0), 0),
    forecast,
    forecast_future_cents,
    forecast_overdue_cents,
    forecast_nodate_cents,
    forecast_total_cents,
    teams: teamRows,
    committed_count: teamRows.filter(t => t.payment_confirmed).length,
  });
}
