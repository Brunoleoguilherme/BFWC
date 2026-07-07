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

// Linha do tempo das inscrições — cada time aparece na etapa mais avançada:
//  pre        → pré-inscrito (club_interests) que ainda não fez o cadastro no portal
//  cadastro   → cadastro no portal, nenhuma parcela paga
//  vaga       → vaga garantida: pelo menos 1 parcela paga
//  pago       → pagamento total realizado
//  atletas    → escalação completa enviada pelo time
//  finalizada → inscrição finalizada (marcação manual do admin, pós-análise de documentos)
//  rejeitados → pré-inscrições rejeitadas + cadastros do portal rejeitados
export async function GET() {
  const adminUser = await getAdminUser();
  if (!adminUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = getSupabaseAdmin();

  const [intRes, portalRes, instRes, rosterRes] = await Promise.all([
    supabase.from('club_interests')
      .select('id, club_name, city, country, email, category, athletes_count, status, contact_name, travel_support, flagged_suspect, created_at'),
    supabase.from('portal_teams').select('*'),
    supabase.from('payment_installments').select('team_id, plan_size, status'),
    supabase.from('team_athletes').select('team_id'),
  ]);
  if (portalRes.error) return NextResponse.json({ error: portalRes.error.message }, { status: 500 });

  const interests = intRes.data || [];
  const portal = portalRes.data || [];

  const athCount = {};
  (rosterRes.data || []).forEach(a => { athCount[a.team_id] = (athCount[a.team_id] || 0) + 1; });

  const instBy = {};
  (instRes.data || []).forEach(i => { (instBy[i.team_id] ||= []).push(i); });

  const norm = (e) => (e || '').toLowerCase().trim();
  const preEmails = new Set(interests.map(i => norm(i.email)).filter(Boolean));
  const portalEmails = new Set(portal.map(t => norm(t.email)).filter(Boolean));

  const cols = { pre: [], cadastro: [], vaga: [], pago: [], atletas: [], finalizada: [], rejeitados: [] };

  // ── Times do portal (cadastro em diante) ─────────────────────────────
  portal.forEach(t => {
    const paid = t.amount_paid_cents || 0;
    const total = totalCentsForTeam(t);
    const its = instBy[t.id] || [];
    const planSize = t.payment_plan || its[0]?.plan_size || null;
    const paidCount = its.filter(i => i.status === 'paid').length;
    const fully = (total > 0 && paid >= total) || (!!planSize && paidCount >= planSize);

    const card = {
      kind: 'portal',
      id: t.id,
      club_name: t.club_name || '',
      city: t.city || '',
      country: t.country || '',
      category: t.category || '',
      email: t.email || '',
      contact_name: t.contact_name || '',
      whatsapp: t.whatsapp || '',
      option: String(t.payment_option || '1') === '2' ? '2' : '1',
      athletes: athCount[t.id] || 0,
      athletes_paid_qty: t.athletes_paid_qty || null,
      total_cents: total,
      paid_cents: paid,
      plan_size: planSize,
      paid_count: paidCount,
      fully_paid: fully,
      lineup_submitted: !!t.lineup_submitted,
      finalized: !!t.registration_finalized,
      status: t.status || '',
      pre_inscrito: preEmails.has(norm(t.email)),
      created_at: t.created_at,
    };

    if (t.status === 'rejected') cols.rejeitados.push(card);
    else if (card.finalized) cols.finalizada.push(card);
    else if (card.lineup_submitted) cols.atletas.push(card);
    else if (fully) cols.pago.push(card);
    else if (paidCount >= 1 || t.payment_confirmed) cols.vaga.push(card);
    else cols.cadastro.push(card);
  });

  // ── Pré-inscritos que ainda não avançaram para o portal ─────────────
  interests.forEach(i => {
    if (i.status === 'spam_descartado') return;
    if (portalEmails.has(norm(i.email))) return; // já progrediu na linha do tempo

    const card = {
      kind: 'interest',
      id: i.id,
      club_name: i.club_name || '',
      city: i.city || '',
      country: i.country || '',
      category: i.category || '',
      email: i.email || '',
      contact_name: i.contact_name || '',
      athletes_count: i.athletes_count || null,
      travel_support: i.travel_support || null,
      flagged_suspect: !!i.flagged_suspect,
      status: i.status || '',
      created_at: i.created_at,
    };

    if (i.status === 'rejeitado') cols.rejeitados.push(card);
    else cols.pre.push(card);
  });

  const byDate = (a, b) => new Date(b.created_at) - new Date(a.created_at);
  Object.values(cols).forEach(list => list.sort(byDate));

  const counts = Object.fromEntries(Object.entries(cols).map(([k, v]) => [k, v.length]));

  return NextResponse.json({ ok: true, cols, counts });
}
