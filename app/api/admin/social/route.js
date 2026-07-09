import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAdmin } from '@/lib/authAdmin';

// Lista as candidaturas às vagas sociais (tabela social_applications).
export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const supabase = getSupabaseAdmin();
  const { data, error: dbErr } = await supabase
    .from('social_applications')
    .select('*')
    .order('created_at', { ascending: false });

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json({ ok: true, applications: data || [] });
}
