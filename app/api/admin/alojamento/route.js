import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAdmin, requireWriter } from '@/lib/authAdmin';

export const dynamic = 'force-dynamic';

// Extrai a quantidade de atletas declarada por categoria no campo "category"
// (ex.: "Feminino (20), Sub-15 (15)" -> feminino=20, sub15=15).
const RE = {
  sub12: /sub\s*-?\s*12\s*\((\d+)\)/i,
  sub15: /sub\s*-?\s*15\s*\((\d+)\)/i,
  feminino: /feminino\s*\((\d+)\)/i,
};
const grab = (str, re) => { const m = (str || '').match(re); return m ? (parseInt(m[1], 10) || 0) : 0; };

// Lista times elegiveis ao alojamento (aprovados com Sub-12, Sub-15 ou Feminino).
export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const supabase = getSupabaseAdmin();
  const { data, error: dbErr } = await supabase
    .from('portal_teams')
    .select('id, club_name, contact_name, country, category, alojamento, status')
    .eq('status', 'approved')
    .order('club_name');
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });

  const teams = (data || [])
    .map((t) => {
      const sub12 = grab(t.category, RE.sub12);
      const sub15 = grab(t.category, RE.sub15);
      const feminino = grab(t.category, RE.feminino);
      return {
        id: t.id,
        club_name: t.club_name,
        contact_name: t.contact_name,
        country: t.country,
        category: t.category,
        sub12, sub15, feminino,
        total: sub12 + sub15 + feminino,
        alojamento: !!t.alojamento,
      };
    })
    .filter((t) => t.sub12 > 0 || t.sub15 > 0 || t.feminino > 0);

  return NextResponse.json({ ok: true, teams });
}

// Habilita/desabilita o alojamento de um time.
export async function POST(request) {
  const { error } = await requireWriter();
  if (error) return error;

  const { id, enabled } = await request.json();
  if (!id) return NextResponse.json({ error: 'id obrigatorio.' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { error: dbErr } = await supabase
    .from('portal_teams')
    .update({ alojamento: !!enabled })
    .eq('id', id);
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
