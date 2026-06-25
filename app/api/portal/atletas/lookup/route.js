import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

// GET /api/portal/atletas/lookup?ref=TEAM_ATHLETE_ID
// Returns limited athlete info to pre-fill the registration form
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const ref = searchParams.get('ref');
  if (!ref) return NextResponse.json({ ok: false }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('team_athletes')
    .select('name, email, category, portal_teams(club_name)')
    .eq('id', ref)
    .single();

  if (error || !data) return NextResponse.json({ ok: false }, { status: 404 });

  return NextResponse.json({
    ok: true,
    name:      data.name,
    email:     data.email,
    category:  data.category,
    club_name: data.portal_teams?.club_name || null,
  });
}
