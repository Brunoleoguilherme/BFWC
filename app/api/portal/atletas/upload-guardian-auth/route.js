import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

// Upload da autorização assinada do responsável legal (atletas menores de 18).
// Prazo de envio: 30/09/2026 (cobrado na UI; upload permanece aberto).
export async function POST(req) {
  try {
    const formData = await req.formData();
    const file      = formData.get('file');
    const athleteId = formData.get('athlete_id');

    if (!file || !athleteId)
      return NextResponse.json({ ok: false, message: 'file e athlete_id obrigatórios' }, { status: 400 });

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowed.includes(file.type))
      return NextResponse.json({ ok: false, message: 'Formato inválido. Use JPG, PNG, WebP ou PDF.' }, { status: 400 });

    const bytes = await file.arrayBuffer();
    if (bytes.byteLength > 8 * 1024 * 1024)
      return NextResponse.json({ ok: false, message: 'Arquivo muito grande. Máximo 8 MB.' }, { status: 400 });

    const supabase = getSupabaseAdmin();
    const ext  = (file.name.split('.').pop() || '').toLowerCase() || (file.type === 'application/pdf' ? 'pdf' : 'jpg');
    const path = `athletes/${athleteId}/autorizacao-responsavel.${ext}`;

    const { error: upErr } = await supabase.storage
      .from('portal-media')
      .upload(path, bytes, { contentType: file.type, upsert: true });

    if (upErr) return NextResponse.json({ ok: false, message: upErr.message }, { status: 500 });

    const { data: urlData } = supabase.storage.from('portal-media').getPublicUrl(path);
    const publicUrl = urlData.publicUrl + `?t=${Date.now()}`;

    await supabase.from('portal_athletes').update({ guardian_auth_url: publicUrl }).eq('id', athleteId);

    return NextResponse.json({ ok: true, url: publicUrl });
  } catch (e) {
    return NextResponse.json({ ok: false, message: e.message }, { status: 500 });
  }
}
