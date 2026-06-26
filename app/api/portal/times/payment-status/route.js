import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get('team_id');
  if (!teamId) {
    return NextResponse.json({ ok: false, message: 'team_id obrigatório' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('portal_teams')
    .select('payment_confirmed, payment_date')
    .eq('id', teamId)
    .single();

  if (error || !data) {
    return NextResponse.json({ ok: false, message: 'Time não encontrado' }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    payment_confirmed: !!data.payment_confirmed,
    payment_date: data.payment_date,
  });
}
