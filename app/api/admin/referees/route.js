import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { requireRoles } from '@/lib/authAdmin';

// GET — lista os árbitros (admin ou arbitragem)
export async function GET() {
  const { error } = await requireRoles('arbitragem');
  if (error) return error;
  const supabase = getSupabaseAdmin();
  const { data, error: dbErr } = await supabase.from('referees').select('*').order('name', { ascending: true });
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json({ ok: true, referees: data || [] });
}

// POST — cadastra um árbitro
export async function POST(request) {
  const { error } = await requireRoles('arbitragem');
  if (error) return error;
  const b = await request.json();
  if (!b.name || !b.name.trim()) return NextResponse.json({ error: 'Nome obrigatório.' }, { status: 400 });
  const supabase = getSupabaseAdmin();
  const { data, error: dbErr } = await supabase.from('referees')
    .insert({ name: b.name.trim(), role: b.role || null, phone: b.phone || null })
    .select().single();
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json({ ok: true, referee: data });
}

// DELETE — remove um árbitro
export async function DELETE(request) {
  const { error } = await requireRoles('arbitragem');
  if (error) return error;
  const { id } = await request.json().catch(() => ({}));
  if (!id) return NextResponse.json({ error: 'ID obrigatório.' }, { status: 400 });
  const supabase = getSupabaseAdmin();
  const { error: dbErr } = await supabase.from('referees').delete().eq('id', id);
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
