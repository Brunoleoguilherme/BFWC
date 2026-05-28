import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request) {
  try {
    const body = await request.json();

    if (!body.email) {
      return NextResponse.json(
        { ok: false, message: 'Email obrigatório' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('newsletter_leads')
      .insert({
        email: body.email,
        language: body.language || 'pt',
        source_page: body.source_page || 'site'
      })
      .select('*')
      .single();

    if (error) throw error;

    return NextResponse.json({
      ok: true,
      lead: data
    });
  } catch (error) {
    console.error('newsletter error', error);

    return NextResponse.json(
      { ok: false, message: error.message || 'Erro interno' },
      { status: 500 }
    );
  }
}