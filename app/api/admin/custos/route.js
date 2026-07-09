import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { getSupabaseServer } from '@/lib/supabaseServer';

const ROW_ID = 'bfwc2026';

async function requireAdmin() {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from('admin_profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (!profile || profile.role === 'pending') return null;
  return { user, role: profile.role };
}

// Carrega os valores de entrada salvos (mapa "SHEET!COORD" -> valor).
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('event_costs')
    .select('data')
    .eq('id', ROW_ID)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, inputs: (data && data.data) || {} });
}

// Salva os valores de entrada. Somente admin (viewer não edita).
export async function PATCH(req) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (admin.role === 'viewer') return NextResponse.json({ error: 'Sem permissão para editar' }, { status: 403 });

  let body;
  try { body = await req.json(); } catch (_) { body = {}; }
  const inputs = (body && typeof body.inputs === 'object' && body.inputs) ? body.inputs : {};

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from('event_costs')
    .upsert({ id: ROW_ID, data: inputs, updated_at: new Date().toISOString() }, { onConflict: 'id' });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
