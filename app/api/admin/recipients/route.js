import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { getSupabaseServer } from '@/lib/supabaseServer';
import { totalCentsForTeam } from '@/lib/installments';

async function getAdminUser() {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from('admin_profiles').select('name, role').eq('id', user.id).single();
  if (!profile || profile.role === 'pending') return null;
  return { ...user, profile };
}

function todayBrasilia() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date());
}

// Audiências para envio de e-mail em lote:
//  - pre_inscritos: formulário de interesse (club_interests)
//  - inscritos:     portal_teams que pagaram ≥1 parcela (não quitado)
//  - confirmados:   portal_teams com pagamento completo
//  - em_atraso:     portal_teams com parcela pendente vencida
export async function GET() {
  const adminUser = await getAdminUser();
  if (!adminUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = getSupabaseAdmin();

  const { data: interests } = await supabase
    .from('club_interests')
    .select('id, club_name, contact_name, email, status')
    .neq('status', 'spam_descartado')
    .neq('status', 'rejeitado');

  const { data: pteams } = await supabase
    .from('portal_teams')
    .select('id, club_name, contact_name, email, category, payment_confirmed, payment_option, athletes_paid_qty, amount_paid_cents');

  const { data: insts } = await supabase
    .from('payment_installments')
    .select('team_id, status, due_date');

  const today = todayBrasilia();
  const instBy = {};
  (insts || []).forEach(i => { (instBy[i.team_id] ||= []).push(i); });

  const mk = (t) => ({ id: t.id, email: t.email || '', name: t.contact_name || '', club: t.club_name || '' });

  const pre_inscritos = (interests || []).filter(t => t.email).map(mk);

  const inscritos = [];
  const confirmados = [];
  const em_atraso = [];

  (pteams || []).forEach(t => {
    if (!t.payment_confirmed || !t.email) return;
    const paid = t.amount_paid_cents || 0;
    const total = totalCentsForTeam(t);
    const fully = total > 0 && paid >= total;
    if (fully) confirmados.push(mk(t));
    else inscritos.push(mk(t));

    const overdue = (instBy[t.id] || []).some(i => i.status !== 'paid' && i.due_date && i.due_date < today);
    if (overdue && !fully) em_atraso.push(mk(t));
  });

  const dedupe = (arr) => {
    const seen = new Set();
    return arr.filter(r => { const k = r.email.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; });
  };

  return NextResponse.json({
    ok: true,
    audiences: {
      pre_inscritos: dedupe(pre_inscritos),
      inscritos:     dedupe(inscritos),
      confirmados:   dedupe(confirmados),
      em_atraso:     dedupe(em_atraso),
    },
  });
}
