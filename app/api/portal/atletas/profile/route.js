import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function PATCH(req) {
  const body = await req.json();
  const { athlete_id, ...fields } = body;
  if (!athlete_id) return NextResponse.json({ ok: false, message: 'athlete_id obrigatório' }, { status: 400 });

  const supabase = getSupabaseAdmin();

  // Verifica se todos os termos foram aceitos
  const { data: current } = await supabase
    .from('portal_athletes')
    .select('terms_health,terms_image,terms_rules,terms_privacy,terms_conduct')
    .eq('id', athlete_id)
    .single();

  const merged = { ...current, ...fields };
  const allTerms = merged.terms_health && merged.terms_image && merged.terms_rules && merged.terms_privacy && merged.terms_conduct;

  // Campos obrigatórios para perfil completo
  const requiredFields = ['nationality', 'phone', 'document', 'emergency_name', 'emergency_phone', 'position'];
  const hasRequired = requiredFields.every(f => merged[f] && merged[f].toString().trim());

  const profileComplete = allTerms && hasRequired;
  const now = new Date().toISOString();

  const updates = {
    ...fields,
    ...(allTerms && !current?.terms_accepted_at ? { terms_accepted_at: now } : {}),
    profile_complete: profileComplete,
    ...(profileComplete && !current?.profile_completed_at ? { profile_completed_at: now } : {}),
    ...(profileComplete ? { status: 'approved' } : {}),
    updated_at: now,
  };

  const { data, error } = await supabase
    .from('portal_athletes')
    .update(updates)
    .eq('id', athlete_id)
    .select()
    .single();

  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });

  // Remove campos sensíveis
  const { password_hash, email_verification_token, ...safe } = data;
  return NextResponse.json({ ok: true, athlete: safe, profileComplete });
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const athlete_id = searchParams.get('athlete_id');
  if (!athlete_id) return NextResponse.json({ ok: false, message: 'athlete_id obrigatório' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('portal_athletes')
    .select('id,name,email,nationality,phone,whatsapp,document,emergency_name,emergency_phone,emergency_relation,position,shirt_size,photo_url,document_url,instagram,tiktok,birthdate,history,terms_health,terms_image,terms_rules,terms_privacy,terms_conduct,terms_accepted_at,profile_complete,profile_completed_at,status,team_id')
    .eq('id', athlete_id)
    .single();

  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 404 });

  // Se phone está vazio mas whatsapp foi preenchido no cadastro, usa whatsapp
  const athlete = { ...data };
  if (!athlete.phone && athlete.whatsapp) athlete.phone = athlete.whatsapp;

  return NextResponse.json({ ok: true, athlete });
}
