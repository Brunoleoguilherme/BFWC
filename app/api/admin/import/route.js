import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAdmin } from '@/lib/authAdmin';

export async function POST(request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await request.json();

    if (!body.club_name || !body.contact_name) {
      return NextResponse.json({ error: 'club_name e contact_name são obrigatórios' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const payload = {
      club_name: body.club_name,
      country: body.country || null,
      city: body.city || null,
      contact_name: body.contact_name,
      email: body.email || null,
      whatsapp: body.whatsapp || null,
      category: body.category || null,
      contact_role: body.contact_role || null,
      athletes_count: body.athletes_count ? parseInt(body.athletes_count) : null,
      competitive_history: body.competitive_history || null,
      hosting_preference: body.hosting_preference || null,
      notes: body.notes || null,
      travel_support: body.travel_support || null,
      preferred_language: body.language || 'pt',
      status: 'pendente_analise',
    };

    const { data, error } = await supabase
      .from('club_interests')
      .insert(payload)
      .select('id, club_name')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, team: data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
