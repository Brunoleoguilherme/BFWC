import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import {
  getResend,
  fromEmail,
  adminEmail,
  clubConfirmationHtml,
  adminClubHtml
} from '@/lib/email';

const required = [
  'club_name',
  'country',
  'city',
  'contact_name',
  'contact_email',
  'whatsapp',
  'categories',
  'experience_level'
];

export async function POST(request) {
  try {
    const body = await request.json();

    const missing = required.filter(
      (field) => !body[field] || (Array.isArray(body[field]) && !body[field].length)
    );

    if (missing.length) {
      return NextResponse.json(
        { ok: false, message: 'Missing required fields', missing },
        { status: 400 }
      );
    }

    const payload = {
      club_name: body.club_name,
      country: body.country,
      city: body.city,
      federation: body.federation || null,
      website_instagram: body.website_instagram || null,
      contact_name: body.contact_name,
      contact_role: body.contact_role || null,
      contact_email: body.contact_email,
      whatsapp: body.whatsapp,
      categories: body.categories,
      roster_size: body.roster_size || null,
      experience_level: body.experience_level,
      achievements: body.achievements || null,
      why_join: body.why_join || null,
      travel_support: body.travel_support || 'not_sure',
      language: body.language || 'pt',
      status: 'pending_review',
      source: 'website'
    };

    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('club_interests')
      .insert(payload)
      .select('*')
      .single();

    if (error) throw error;

    const resend = getResend();

    await Promise.allSettled([
      resend.emails.send({
        from: fromEmail,
        to: payload.contact_email,
        subject: 'Brasil Flag World Championship 2026 - Interesse recebido',
        html: clubConfirmationHtml(payload)
      }),
      resend.emails.send({
        from: fromEmail,
        to: adminEmail,
        subject: `Novo clube interessado: ${payload.club_name}`,
        html: adminClubHtml(data)
      })
    ]);

    return NextResponse.json({
      ok: true,
      id: data.id,
      status: data.status
    });
  } catch (error) {
    console.error('club-interest error', error);

    return NextResponse.json(
      { ok: false, message: error.message || 'Internal error' },
      { status: 500 }
    );
  }
}