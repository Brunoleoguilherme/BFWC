import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

// GET — list all deals with team info
export async function GET() {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from('blue_panda_deals')
    .select(`
      id, status, notes, deal_value, created_at, updated_at,
      team:team_id (
        id, club_name, country, city, contact_name, contact_role,
        whatsapp, email, category, athletes_count,
        hosting_preference, travel_support, competitive_history, notes
      )
    `)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ deals: data });
}

// POST — create deal (add team to pipeline)
export async function POST(request) {
  const { team_id } = await request.json();
  if (!team_id) return NextResponse.json({ error: 'team_id obrigatório' }, { status: 400 });

  const admin = getSupabaseAdmin();

  // Prevent duplicates
  const { data: existing } = await admin
    .from('blue_panda_deals')
    .select('id')
    .eq('team_id', team_id)
    .single();

  if (existing) return NextResponse.json({ error: 'Time já está no pipeline', existing_id: existing.id }, { status: 409 });

  const { data, error } = await admin
    .from('blue_panda_deals')
    .insert({ team_id, status: 'novo_lead' })
    .select('id')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, id: data.id });
}
