import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function DELETE(req, { params }) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const team_id = searchParams.get('team_id');

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from('team_athletes')
    .delete()
    .eq('id', id)
    .eq('team_id', team_id); // garante que só deleta do próprio time

  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function PATCH(req, { params }) {
  const { id } = await params;
  const body = await req.json();
  const { team_id, ...updates } = body;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('team_athletes')
    .update(updates)
    .eq('id', id)
    .eq('team_id', team_id)
    .select()
    .single();

  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, athlete: data });
}
