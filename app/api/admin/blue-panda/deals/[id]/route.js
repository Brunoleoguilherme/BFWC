import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { requireWriter } from '@/lib/authAdmin';

// PATCH — update deal status / notes / value
export async function PATCH(request, { params }) {
  const { error } = await requireWriter();
  if (error) return error;
  const { id } = await params;
  const body = await request.json();
  const admin = getSupabaseAdmin();

  const allowed = {};
  if (body.status     !== undefined) allowed.status     = body.status;
  if (body.notes      !== undefined) allowed.notes      = body.notes;
  if (body.deal_value !== undefined) allowed.deal_value = body.deal_value;

  const { error } = await admin
    .from('blue_panda_deals')
    .update(allowed)
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// DELETE — remove deal from pipeline
export async function DELETE(request, { params }) {
  const { error } = await requireWriter();
  if (error) return error;
  const { id } = await params;
  const admin = getSupabaseAdmin();
  const { error } = await admin.from('blue_panda_deals').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
