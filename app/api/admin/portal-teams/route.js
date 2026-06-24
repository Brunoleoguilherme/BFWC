import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('portal_teams')
    .select('id, club_name, country, city, contact_name, contact_role, email, whatsapp, category, athletes_count, status, email_verified, preferred_language, admin_notes, approved_at, created_at')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, teams: data });
}
