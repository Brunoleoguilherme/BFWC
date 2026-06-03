import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

const content = {
  pt: {
    subject: 'Obrigado por se inscrever — Brasil Flag World Championship 2026',
    title: 'Obrigado por se inscrever!',
    intro: 'Você está oficialmente na equipe! A partir de agora, receberá em primeira mão todas as novidades sobre o Brasil Flag World Championship 2026.',
    updates: 'Atualizações',
    tickets: 'Ingressos & Pacotes',
    competition: 'Competição',
    final: 'Juntos, vamos fazer história. O mundo do flag é aqui.',
    button: 'Continuar acompanhando'
  },
  en: {
    subject: 'Thank you for subscribing — Brasil Flag World Championship 2026',
    title: 'Thank you for subscribing!',
    intro: 'You are now officially part of the team! From now on, you will receive all the latest updates about the Brasil Flag World Championship 2026 first-hand.',
    updates: 'Updates',
    tickets: 'Tickets & Packages',
    competition: 'Competition',
    final: 'Together, let’s make history. The flag world is here.',
    button: 'Stay tuned'
  },
  es: {
    subject: 'Gracias por suscribirte — Brasil Flag World Championship 2026',
    title: '¡Gracias por suscribirte!',
    intro: '¡Ya formas parte del equipo! A partir de ahora, recibirás todas las novedades del Brasil Flag World Championship 2026 en primera mano.',
    updates: 'Actualizaciones',
    tickets: 'Entradas & Paquetes',
    competition: 'Competición',
    final: 'Juntos, hagamos historia. El mundo del flag está aquí.',
    button: 'Sigue acompañando'
  }
};

function emailHtml(lang) {
  const t = content[lang] || content.pt;

  return `
  <div style="margin:0;padding:0;background:#020817;font-family:Arial,sans-serif;color:#ffffff;">
    <div style="max-width:760px;margin:0 auto;background:#06183a;border-radius:24px;overflow:hidden;border:1px solid #1f3b75;">
      
      <div style="padding:36px 28px;text-align:center;background:linear-gradient(135deg,#06183a,#020817);">
        <img src="https://brasilflagworldchampionship.com/assets/bfwc-logo.jpg" width="130" style="border-radius:24px;margin-bottom:24px;" />
        <p style="color:#eaff00;font-size:13px;font-weight:800;letter-spacing:4px;margin:0 0 14px;">
          BRASIL FLAG WORLD CHAMPIONSHIP 2026
        </p>
        <h1 style="font-size:42px;line-height:1;margin:0;color:#ffffff;">
          ${t.title}
        </h1>
        <p style="font-size:18px;line-height:1.6;color:#dbe7ff;margin:22px auto 0;max-width:600px;">
          ${t.intro}
        </p>
      </div>

      <div style="padding:30px 28px;background:#031020;">
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;text-align:center;">
          <div style="padding:20px;border:1px solid #263d71;border-radius:18px;">
            <div style="font-size:30px;">📅</div>
            <strong style="display:block;color:#eaff00;margin-top:10px;">${t.updates}</strong>
          </div>
          <div style="padding:20px;border:1px solid #263d71;border-radius:18px;">
            <div style="font-size:30px;">🎟️</div>
            <strong style="display:block;color:#eaff00;margin-top:10px;">${t.tickets}</strong>
          </div>
          <div style="padding:20px;border:1px solid #263d71;border-radius:18px;">
            <div style="font-size:30px;">🏆</div>
            <strong style="display:block;color:#eaff00;margin-top:10px;">${t.competition}</strong>
          </div>
        </div>

        <div style="margin-top:32px;padding:26px;border-radius:20px;background:linear-gradient(135deg,#003cff,#16e044);">
          <h2 style="margin:0;color:#ffffff;font-size:26px;line-height:1.1;">
            ${t.final}
          </h2>
        </div>

        <div style="text-align:center;margin-top:32px;">
          <a href="https://brasilflagworldchampionship.com/site?lang=${lang}"
            style="display:inline-block;background:#eaff00;color:#061018;font-weight:900;text-decoration:none;padding:16px 28px;border-radius:999px;">
            ${t.button}
          </a>
        </div>
      </div>

      <div style="padding:24px;text-align:center;background:#020817;color:#8fa7d8;font-size:13px;">
        © 2026 Brasil Flag World Championship. All rights reserved.
      </div>
    </div>
  </div>
  `;
}

export async function POST(request) {
  try {
    const body = await request.json();

    if (!body.email) {
      return NextResponse.json(
        { ok: false, message: 'Email obrigatório' },
        { status: 400 }
      );
    }

    const lang = body.language || 'pt';
    const t = content[lang] || content.pt;
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('newsletter_leads')
      .insert({
        email: body.email,
        language: lang,
        source_page: body.source_page || 'site'
      })
      .select('*')
      .single();

    if (error) throw error;

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM,
        to: body.email,
        subject: t.subject,
        html: emailHtml(lang)
      })
    });

    return NextResponse.json({ ok: true, lead: data });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error.message || 'Erro interno' },
      { status: 500 }
    );
  }
}