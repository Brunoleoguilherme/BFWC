import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) return NextResponse.redirect(new URL('/portal/atletas/cadastro?error=token_missing', req.url));

  const supabase = getSupabaseAdmin();
  const { data: athlete } = await supabase
    .from('portal_athletes')
    .select('id, status, email_token_expires_at')
    .eq('email_verification_token', token)
    .single();

  if (!athlete) return NextResponse.redirect(new URL('/portal/atletas/cadastro?error=token_invalid', req.url));
  if (athlete.status !== 'pending_email') return NextResponse.redirect(new URL('/portal/atletas/login?verified=1', req.url));

  const expired = new Date(athlete.email_token_expires_at) < new Date();
  if (expired) return NextResponse.redirect(new URL('/portal/atletas/cadastro?error=token_expired', req.url));

  await supabase
    .from('portal_athletes')
    .update({ status: 'active', email_verified: true, email_verification_token: null })
    .eq('id', athlete.id);

  return NextResponse.redirect(new URL('/portal/atletas/login?verified=1', req.url));
}
