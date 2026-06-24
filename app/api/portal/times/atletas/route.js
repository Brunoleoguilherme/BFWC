import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const team_id = searchParams.get('team_id');
  if (!team_id) return NextResponse.json({ ok: false, message: 'team_id obrigatório' }, { status: 400 });

  const supabase = getSupabaseAdmin();

  // Roster do clube
  const { data: athletes, error } = await supabase
    .from('team_athletes')
    .select('*')
    .eq('team_id', team_id)
    .order('category', { ascending: true })
    .order('name', { ascending: true });

  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });

  // Contas criadas no portal para este time
  const { data: portalAthletes } = await supabase
    .from('portal_athletes')
    .select('team_athlete_id, email_verified, status')
    .eq('team_id', team_id);

  // Indexa por team_athlete_id
  const portalMap = {};
  (portalAthletes || []).forEach(pa => {
    if (pa.team_athlete_id) portalMap[pa.team_athlete_id] = pa;
  });

  const enriched = (athletes || []).map(a => {
    const pa = portalMap[a.id] || null;
    return {
      ...a,
      portal_registered:     !!pa,
      portal_email_verified: pa?.email_verified || false,
      portal_status:         pa?.status || null,
    };
  });

  return NextResponse.json({ ok: true, athletes: enriched });
}

export async function POST(req) {
  const body = await req.json();
  const { team_id, name, email, category, jersey_number, birth_date, document } = body;
  if (!team_id || !name) return NextResponse.json({ ok: false, message: 'team_id e name obrigatórios' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('team_athletes')
    .insert({ team_id, name, email: email || null, category: category || null, jersey_number: jersey_number ? parseInt(jersey_number) : null, birth_date: birth_date || null, document: document || null })
    .select()
    .single();

  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, athlete: { ...data, portal_registered: false, portal_email_verified: false, portal_status: null } });
}
