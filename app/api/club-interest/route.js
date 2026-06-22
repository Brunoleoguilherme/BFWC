import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import {
  getResend,
  fromEmail,
  adminEmails,
  clubConfirmationHtml,
  adminValidationHtml,
} from '@/lib/email';
import { randomUUID } from 'crypto';

const required = ['club_name', 'country', 'city', 'contact_name', 'email', 'whatsapp'];

export async function POST(request) {
  try {
    const body = await request.json();

    const missing = required.filter(
      (field) => !body[field] || (Array.isArray(body[field]) && !body[field].length)
    );

    if (missing.length) {
      return NextResponse.json(
        { ok: false, message: 'Campos obrigatórios faltando', missing },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const token = randomUUID();

    const dbPayload = {
      club_name: body.club_name,
      country: body.country,
      city: body.city,
      contact_name: body.contact_name,
      email: body.email,
      whatsapp: body.whatsapp,
      category: Array.isArray(body.categories_interested) && body.categories_interested.length
        ? body.categories_interested.join(', ')
        : (body.category || 'Não informado'),
      contact_role: body.contact_role || null,
      athletes_count: body.athletes_count ? parseInt(body.athletes_count) : null,
      athletes_masc:  body.athletes_masc  ? parseInt(body.athletes_masc)  : null,
      athletes_fem:   body.athletes_fem   ? parseInt(body.athletes_fem)   : null,
      athletes_sub15: body.athletes_sub15 ? parseInt(body.athletes_sub15) : null,
      athletes_sub12: body.athletes_sub12 ? parseInt(body.athletes_sub12) : null,
      competitive_history: body.competitive_history || null,
      hosting_preference: body.hosting_preference || null,
      notes: body.notes || null,
      travel_support: body.travel_support || null,
      preferred_language: body.language || 'pt',
      status: 'aguardando_validacao',
      approval_token: token,
    };

    const { data: inserted, error: dbError } = await supabase
      .from('club_interests')
      .insert(dbPayload)
      .select('id')
      .single();

    if (dbError) {
      console.error('Supabase insert error:', dbError.message);
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const validateUrl = `${siteUrl}/api/validate-team?token=${token}`;

    const resend = getResend();
    await Promise.allSettled([
      // Email de confirmação para o clube
      resend.emails.send({
        from: fromEmail,
        to: body.email,
        subject: 'Brasil Flag World Championship 2026 — Inscrição recebida!',
        html: clubConfirmationHtml({
          club_name: body.club_name,
          contact_name: body.contact_name,
          language: body.language || 'pt',
        }),
      }),
      // Email para admins com botão de validação
      ...adminEmails.map((to) =>
        resend.emails.send({
          from: fromEmail,
          to,
          subject: `[BFWC 2026] ✅ Validar inscrição: ${body.club_name}`,
          html: adminValidationHtml({
            club_name: body.club_name,
            country: body.country,
            city: body.city,
            contact_name: body.contact_name,
            contact_role: body.contact_role,
            email: body.email,
            whatsapp: body.whatsapp,
            category: dbPayload.category,
            athletes_count: body.athletes_count,
            athletes_masc: body.athletes_masc,
            athletes_fem: body.athletes_fem,
            athletes_sub15: body.athletes_sub15,
            athletes_sub12: body.athletes_sub12,
            competitive_history: body.competitive_history,
            hosting_preference: body.hosting_preference,
            travel_support: body.travel_support,
            notes: body.notes,
            validateUrl,
          }),
        })
      ),
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('club-interest error', error);
    return NextResponse.json(
      { ok: false, message: error.message || 'Internal error' },
      { status: 500 }
    );
  }
}
