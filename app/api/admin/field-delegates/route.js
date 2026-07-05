import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAuth, requireAdmin } from '@/lib/authAdmin';

// Mapeamento delegado ↔ campo (Campo 1..8).
// O jogo herda o delegado do campo escolhido; pode ser trocado manualmente.

// GET — lista o mapeamento
export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;
  const supabase = getSupabaseAdmin();
  const { data, error: dbErr } = await supabase
    .from('field_delegates')
    .select('field, delegate_id')
    .order('field', { ascending: true });
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json({ ok: true, mapping: data || [] });
}

// POST — define o delegado de um campo ({ field, delegate_id|null })
export async function POST(request) {
  const { error } = await requireAdmin();
  if (error) return error;
  const b = await request.json().catch(() => ({}));
  if (!b.field) return NextResponse.json({ error: 'Campo obrigatório.' }, { status: 400 });
  const supabase = getSupabaseAdmin();
  const { error: dbErr } = await supabase
    .from('field_delegates')
    .upsert({ field: b.field, delegate_id: b.delegate_id || null, updated_at: new Date().toISOString() }, { onConflict: 'field' });
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
