import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email')?.toLowerCase().trim();

  if (!email) {
    return NextResponse.json({ ok: false, message: 'Email obrigatório' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('club_interests')
    .select('id, club_name, country, city, category, athletes_count, status, created_at, approved_at')
    .ilike('email', email)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    return NextResponse.json({ ok: false, message: 'Nenhuma inscrição encontrada com este e-mail.' }, { status: 404 });
  }

  return NextResponse.json({ ok: true, team: data });
}
