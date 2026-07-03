import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAdmin, verifyPassword } from '@/lib/authAdmin';

// Exclui um atleta do roster (confirmação por senha de login do admin)
export async function DELETE(req, { params }) {
  try {
    const { profile, error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;
    const { password } = await req.json().catch(() => ({}));

    const ok = await verifyPassword(profile.email, password);
    if (!ok) return NextResponse.json({ ok: false, message: 'Senha incorreta.' }, { status: 401 });

    const supabase = getSupabaseAdmin();
    const { data: ath } = await supabase
      .from('team_athletes').select('id, name').eq('id', id).single();
    if (!ath) return NextResponse.json({ ok: false, message: 'Atleta não encontrado.' }, { status: 404 });

    const { error: delErr } = await supabase.from('team_athletes').delete().eq('id', id);
    if (delErr) return NextResponse.json({ ok: false, message: delErr.message }, { status: 500 });

    return NextResponse.json({ ok: true, deleted: ath.name });
  } catch (err) {
    console.error('team-athletes delete error', err);
    return NextResponse.json({ ok: false, message: err.message }, { status: 500 });
  }
}
