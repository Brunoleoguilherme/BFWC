import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file      = formData.get('file');
    const athleteId = formData.get('athlete_id');

    if (!file || !athleteId)
      return NextResponse.json({ ok: false, message: 'file e athlete_id obrigatórios' }, { status: 400 });

    // Valida tipo
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type))
      return NextResponse.json({ ok: false, message: 'Formato inválido. Use JPG, PNG ou WebP.' }, { status: 400 });

    // Limita 5MB
    const bytes = await file.arrayBuffer();
    if (bytes.byteLength > 5 * 1024 * 1024)
      return NextResponse.json({ ok: false, message: 'Imagem muito grande. Máximo 5 MB.' }, { status: 400 });

    const supabase = getSupabaseAdmin();
    const ext      = file.name.split('.').pop().toLowerCase() || 'jpg';
    const path     = `athletes/${athleteId}/profile.${ext}`;

    // Faz upload no bucket 'portal-media'
    const { error: upErr } = await supabase.storage
      .from('portal-media')
      .upload(path, bytes, { contentType: file.type, upsert: true });

    if (upErr) return NextResponse.json({ ok: false, message: upErr.message }, { status: 500 });

    // URL pública
    const { data: urlData } = supabase.storage.from('portal-media').getPublicUrl(path);
    const publicUrl = urlData.publicUrl + `?t=${Date.now()}`; // cache bust

    // Salva no registro do atleta
    await supabase.from('portal_athletes').update({ photo_url: publicUrl }).eq('id', athleteId);

    return NextResponse.json({ ok: true, url: publicUrl });
  } catch (e) {
    return NextResponse.json({ ok: false, message: e.message }, { status: 500 });
  }
}
