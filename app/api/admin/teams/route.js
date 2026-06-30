import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { getSupabaseServer } from '@/lib/supabaseServer';

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

export async function GET(request) {
  const adminUser = await getAdminUser();
  if (!adminUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  const supabase = getSupabaseAdmin();
  let query = supabase
    .from('club_interests')
    .select(`
      id, created_at,
      club_name, country, city,
      contact_name, contact_role, whatsapp, email,
      category, athletes_count,
      athletes_masc, athletes_fem, athletes_sub15, athletes_sub12,
      competitive_history, hosting_preference, travel_support, notes,
      status, admin_notes, flagged_suspect,
      approved_at, approved_by, preferred_language
    `)
    .order('created_at', { ascending: true });

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ teams: data });
}
