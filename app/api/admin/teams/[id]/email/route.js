import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { getSupabaseServer } from '@/lib/supabaseServer';
import { getResend, fromEmail } from '@/lib/email';

async function getAdminUser() {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from('admin_profiles')
    .select('name, role')
    .eq('id', user.id)
    .single();
  if (!profile) return null;
  return { ...user, profile };
}

const templates = {
  aprovado: (team) => ({
    subject: `[BFWC 2026] Sua equipe foi aprovada! — ${team.club_name}`,
    html: `
      <div style="font-family:Arial,sans-serif;background:#06184f;color:#fff;padding:28px">
        <div style="max-width:640px;margin:auto;background:#082574;border:1px solid #1b62ff;border-radius:24px;padding:36px">
          <h1 style="color:#68ff5b;margin-top:0">🎉 Parabéns! Inscrição aprovada!</h1>
          <p style="font-size:16px">Olá, <strong>${team.contact_name}</strong>! A equipe <strong>${team.club_name}</strong> foi aprovada para o Brasil Flag World Championship 2026.</p>
          <p style="font-size:15px;color:#c8d8f5">Em breve entraremos em contato com os próximos passos e informações sobre o evento em Leme, SP.</p>
          <p style="color:#68ff5b;font-weight:700;margin-bottom:0">Brasil Flag World Championship 2026 — Leme, SP</p>
        </div>
      </div>
    `,
  }),
  info_adicional: (team) => ({
    subject: `[BFWC 2026] Precisamos de mais informações — ${team.club_name}`,
    html: `
      <div style="font-family:Arial,sans-serif;background:#06184f;color:#fff;padding:28px">
        <div style="max-width:640px;margin:auto;background:#082574;border:1px solid #1b62ff;border-radius:24px;padding:36px">
          <h1 style="color:#eaff00;margin-top:0">Informações adicionais necessárias</h1>
          <p style="font-size:16px">Olá, <strong>${team.contact_name}</strong>! Estamos analisando a inscrição da equipe <strong>${team.club_name}</strong>.</p>
          <p style="font-size:15px;color:#c8d8f5">Para prosseguir, precisamos de algumas informações adicionais. Por favor, responda este e-mail ou entre em contato pelo WhatsApp.</p>
          <p style="color:#68ff5b;font-weight:700;margin-bottom:0">Brasil Flag World Championship 2026 — Leme, SP</p>
        </div>
      </div>
    `,
  }),
  rejeitado: (team) => ({
    subject: `[BFWC 2026] Atualização sobre sua inscrição — ${team.club_name}`,
    html: `
      <div style="font-family:Arial,sans-serif;background:#06184f;color:#fff;padding:28px">
        <div style="max-width:640px;margin:auto;background:#082574;border:1px solid #1b62ff;border-radius:24px;padding:36px">
          <h1 style="color:#eaff00;margin-top:0">Atualização da sua inscrição</h1>
          <p style="font-size:16px">Olá, <strong>${team.contact_name}</strong>. Obrigado pelo interesse da equipe <strong>${team.club_name}</strong> no Brasil Flag World Championship 2026.</p>
          <p style="font-size:15px;color:#c8d8f5">Infelizmente não será possível confirmar a participação de vocês nesta edição. Agradecemos o interesse e esperamos contar com vocês em edições futuras.</p>
          <p style="color:#68ff5b;font-weight:700;margin-bottom:0">Brasil Flag World Championship 2026 — Leme, SP</p>
        </div>
      </div>
    `,
  }),
};

export async function POST(request, { params }) {
  const adminUser = await getAdminUser();
  if (!adminUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { template, customSubject, customHtml, teamEmail } = await request.json();

  if (!teamEmail) return NextResponse.json({ error: 'Email do time é obrigatório' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data: team } = await supabase
    .from('club_interests')
    .select('club_name, contact_name')
    .eq('id', id)
    .single();

  if (!team) return NextResponse.json({ error: 'Time não encontrado' }, { status: 404 });

  let subject, html;
  if (template && templates[template]) {
    const t = templates[template](team);
    subject = t.subject;
    html = t.html;
  } else if (customSubject && customHtml) {
    subject = customSubject;
    html = customHtml;
  } else {
    return NextResponse.json({ error: 'Template ou conteúdo customizado necessário' }, { status: 400 });
  }

  const resend = getResend();
  const { error: emailError } = await resend.emails.send({
    from: fromEmail,
    to: teamEmail,
    subject,
    html,
  });

  if (emailError) return NextResponse.json({ error: emailError.message }, { status: 500 });

  // Registrar evento
  await supabase.from('team_events').insert({
    team_id: id,
    event_type: 'email_sent',
    description: `E-mail enviado: "${subject}"`,
    created_by: adminUser.profile.name || adminUser.email,
  });

  return NextResponse.json({ ok: true });
}
