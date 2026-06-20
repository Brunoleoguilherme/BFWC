import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import {
  getResend,
  fromEmail,
  adminEmails,
  clubConfirmationHtml,
  adminClubHtml
} from '@/lib/email';

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

    // Payload mínimo com colunas confirmadas no banco
    const dbPayload = {
      club_name: body.club_name,
      country: body.country,
      city: body.city,
      contact_name: body.contact_name,
      whatsapp: body.whatsapp,
      category: Array.isArray(body.categories_interested) && body.categories_interested.length
        ? body.categories_interested.join(', ')
        : (body.category || 'Não informado'),
    };

    // Dados completos só para o email
    const fullData = {
      ...dbPayload,
      email: body.email,
      contact_role: body.contact_role || null,
      instagram: body.instagram || null,
      website: body.website || null,
      athletes_count: body.athletes_count || null,
      competitive_history: body.competitive_history || null,
      hosting_preference: body.hosting_preference || null,
      event_priorities: Array.isArray(body.event_priorities)
        ? body.event_priorities.join(', ')
        : null,
      notes: body.notes || null,
      travel_support: body.travel_support || null,
      language: body.language || 'pt'
    };

    // Salva no Supabase
    const { error: dbError } = await supabase
      .from('club_interests')
      .insert(dbPayload);

    if (dbError) {
      console.error('Supabase insert error:', dbError.message);
    }

    // Envia emails independente do resultado do banco
    const resend = getResend();
    const emailResults = await Promise.allSettled([
      resend.emails.send({
        from: fromEmail,
        to: body.email,
        subject: 'Brasil Flag World Championship 2026 — Inscrição recebida!',
        html: clubConfirmationHtml({
          club_name: body.club_name,
          contact_name: body.contact_name,
          language: body.language || 'pt'
        })
      }),
      ...adminEmails.map((to) =>
        resend.emails.send({
          from: fromEmail,
          to,
          subject: `[BFWC 2026] Nova equipe cadastrada: ${body.club_name}`,
          html: adminClubHtml(fullData)
        })
      )
    ]);

    emailResults.forEach((result, i) => {
      if (result.status === 'rejected') {
        console.error(`Email ${i} falhou:`, result.reason);
      } else if (result.value?.error) {
        console.error(`Email ${i} erro Resend:`, result.value.error);
      }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('club-interest error', error);
    return NextResponse.json(
      { ok: false, message: error.message || 'Internal error' },
      { status: 500 }
    );
  }
}
