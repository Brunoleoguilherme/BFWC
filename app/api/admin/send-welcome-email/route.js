import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { getResend, fromEmail } from '@/lib/email';

/* ── Email copy by language ─────────────────────────────────── */
const COPY = {
  pt: {
    subject: 'Brasil Flag World Championship 2026 — Próximos passos da sua candidatura',
    greeting: (name) => `Olá, ${name}!`,
    p1: 'Obrigado por enviar a candidatura da sua equipe para participar do <strong>Brasil Flag World Championship 2026</strong>.',
    p2: 'Recebemos suas informações e queremos informar que o processo de análise dos clubes já está em andamento. Nossa equipe está avaliando todas as candidaturas recebidas para construir uma competição de alto nível, reunindo equipes nacionais e internacionais.',
    p3title: 'Nos próximos dias, divulgaremos informações oficiais importantes sobre o evento, incluindo:',
    bullets: [
      'Processo de inscrição oficial das equipes',
      'Valores de participação',
      'Datas e prazos do campeonato',
      'Categorias confirmadas',
      'Formato da competição',
      'Indicações de hospedagem e pacotes especiais por meio do parceiro oficial de viagens do campeonato',
      'Próximos passos do processo seletivo',
    ],
    p4: 'Enquanto isso, recomendamos que sua equipe acompanhe nossos canais oficiais para ficar por dentro de todas as novidades e anúncios:',
    site: '🌐 Site Oficial: brasilflagworldchampionship.com',
    social: '📱 Redes Sociais Oficiais: @brasilflagworldchampionship',
    closing: 'Este é apenas o primeiro passo para uma experiência que promete reunir atletas, clubes e culturas em um dos maiores encontros de Flag Football já realizados no Brasil.',
    thanks: 'Agradecemos pelo interesse e pela confiança em fazer parte deste projeto.',
    seeYou: 'Nos vemos em breve.',
    sign: 'Atenciosamente,',
  },
  en: {
    subject: 'Brasil Flag World Championship 2026 — Next steps for your application',
    greeting: (name) => `Hello, ${name}!`,
    p1: 'Thank you for submitting your team\'s application to participate in the <strong>Brasil Flag World Championship 2026</strong>.',
    p2: 'We have received your information and are pleased to inform you that the club evaluation process is already underway. Our team is reviewing all applications received to build a high-level competition, bringing together national and international teams.',
    p3title: 'In the coming days, we will publish important official information about the event, including:',
    bullets: [
      'Official team registration process',
      'Participation fees',
      'Championship dates and deadlines',
      'Confirmed categories',
      'Competition format',
      'Accommodation suggestions and special packages through the championship\'s official travel partner',
      'Next steps of the selection process',
    ],
    p4: 'In the meantime, we recommend that your team follow our official channels to stay up to date with all news and announcements:',
    site: '🌐 Official Website: brasilflagworldchampionship.com',
    social: '📱 Official Social Media: @brasilflagworldchampionship',
    closing: 'This is just the first step toward an experience that promises to bring together athletes, clubs and cultures in one of the greatest Flag Football gatherings ever held in Brazil.',
    thanks: 'We appreciate your interest and your trust in being part of this project.',
    seeYou: 'See you soon.',
    sign: 'Sincerely,',
  },
  es: {
    subject: 'Brasil Flag World Championship 2026 — Próximos pasos de tu candidatura',
    greeting: (name) => `¡Hola, ${name}!`,
    p1: 'Gracias por enviar la candidatura de tu equipo para participar en el <strong>Brasil Flag World Championship 2026</strong>.',
    p2: 'Hemos recibido tu información y queremos comunicarte que el proceso de evaluación de los clubes ya está en marcha. Nuestro equipo está evaluando todas las candidaturas recibidas para construir una competición de alto nivel, reuniendo equipos nacionales e internacionales.',
    p3title: 'En los próximos días publicaremos información oficial importante sobre el evento, incluyendo:',
    bullets: [
      'Proceso de inscripción oficial de los equipos',
      'Valores de participación',
      'Fechas y plazos del campeonato',
      'Categorías confirmadas',
      'Formato de la competición',
      'Recomendaciones de alojamiento y paquetes especiales a través del socio oficial de viajes del campeonato',
      'Próximos pasos del proceso de selección',
    ],
    p4: 'Mientras tanto, recomendamos que tu equipo siga nuestros canales oficiales para estar al tanto de todas las novedades y anuncios:',
    site: '🌐 Sitio Oficial: brasilflagworldchampionship.com',
    social: '📱 Redes Sociales Oficiales: @brasilflagworldchampionship',
    closing: 'Este es solo el primer paso hacia una experiencia que promete reunir atletas, clubes y culturas en uno de los mayores encuentros de Flag Football realizados en Brasil.',
    thanks: 'Agradecemos tu interés y la confianza en ser parte de este proyecto.',
    seeYou: 'Nos vemos pronto.',
    sign: 'Atentamente,',
  },
};

function buildHtml(c, club_name) {
  return `<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>BFWC 2026</title>
</head>
<body style="margin:0;padding:0;background:#020c1a;font-family:'Inter',Arial,sans-serif">
  <div style="max-width:620px;margin:0 auto;padding:32px 16px">

    <!-- Logo Header -->
    <div style="text-align:center;margin-bottom:32px">
      <div style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#031020,#061830);border:1px solid rgba(244,255,0,.25);border-radius:14px">
        <div style="font-size:11px;font-weight:800;letter-spacing:4px;text-transform:uppercase;color:#f4ff00;margin-bottom:4px">BRASIL FLAG WORLD CHAMPIONSHIP</div>
        <div style="font-size:36px;font-weight:900;color:#fff;letter-spacing:-2px;line-height:1">2026</div>
        <div style="font-size:11px;color:rgba(255,255,255,.35);margin-top:4px;letter-spacing:1px">LEME, SP — BRASIL</div>
      </div>
    </div>

    <!-- Main card -->
    <div style="background:linear-gradient(145deg,rgba(6,27,58,.95),rgba(2,8,22,.98));border:1px solid rgba(255,255,255,.1);border-radius:20px;overflow:hidden;margin-bottom:20px">

      <!-- Yellow top bar -->
      <div style="height:4px;background:linear-gradient(90deg,#f4ff00,#20e33f)"></div>

      <div style="padding:36px 32px">
        <p style="margin:0 0 20px;font-size:22px;font-weight:900;color:#fff">${c.greeting(club_name)}</p>

        <p style="margin:0 0 16px;font-size:15px;color:#c8d8f5;line-height:1.7">${c.p1}</p>
        <p style="margin:0 0 24px;font-size:14px;color:rgba(200,216,245,.8);line-height:1.75">${c.p2}</p>

        <!-- Upcoming info list -->
        <div style="background:rgba(244,255,0,.05);border:1px solid rgba(244,255,0,.15);border-radius:14px;padding:22px 24px;margin-bottom:24px">
          <p style="margin:0 0 16px;font-size:13px;font-weight:800;color:#f4ff00;text-transform:uppercase;letter-spacing:1px">${c.p3title}</p>
          <ul style="margin:0;padding:0 0 0 4px;list-style:none">
            ${c.bullets.map(b => `
            <li style="display:flex;align-items:flex-start;gap:10px;margin-bottom:10px;font-size:13px;color:#c8d8f5;line-height:1.5">
              <span style="color:#20e33f;font-weight:900;flex-shrink:0;margin-top:1px">›</span>
              ${b}
            </li>`).join('')}
          </ul>
        </div>

        <p style="margin:0 0 16px;font-size:14px;color:rgba(200,216,245,.8);line-height:1.7">${c.p4}</p>

        <!-- Social links -->
        <div style="background:rgba(13,75,255,.08);border:1px solid rgba(13,75,255,.2);border-radius:12px;padding:16px 20px;margin-bottom:24px">
          <p style="margin:0 0 8px;font-size:13px;color:#7ab4ff">${c.site}</p>
          <p style="margin:0;font-size:13px;color:#7ab4ff">${c.social}</p>
        </div>

        <p style="margin:0 0 12px;font-size:14px;color:rgba(200,216,245,.7);line-height:1.7;border-top:1px solid rgba(255,255,255,.07);padding-top:20px">${c.closing}</p>
        <p style="margin:0 0 24px;font-size:14px;color:rgba(200,216,245,.7);line-height:1.7">${c.thanks}</p>

        <p style="margin:0 0 4px;font-size:14px;color:rgba(200,216,245,.6)">${c.seeYou}</p>
        <p style="margin:0 0 4px;font-size:13px;color:rgba(255,255,255,.4)">${c.sign}</p>
        <p style="margin:0;font-size:14px;font-weight:800;color:#20e33f">Brasil Flag World Championship 2026</p>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align:center;padding:0 16px">
      <p style="font-size:11px;color:rgba(255,255,255,.2);line-height:1.6;margin:0">
        Brasil Flag World Championship 2026 · Leme, SP · Brasil<br>
        <a href="https://brasilflagworldchampionship.com" style="color:rgba(255,255,255,.25);text-decoration:none">brasilflagworldchampionship.com</a>
      </p>
    </div>

  </div>
</body>
</html>`;
}

/* ── POST /api/admin/send-welcome-email ─────────────────────── */
// Body: { secret, test?: true, testEmail?: string }
// - test=true → sends only to testEmail (or WORLD_ADMIN_EMAIL[0])
// - otherwise → sends to all portal_teams where status != 'banned'
export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { secret, test = false, testEmail } = body;

    // Simple secret gate (use the admin approval token or a dedicated env var)
    const validSecret = process.env.ADMIN_APPROVAL_TOKEN || process.env.EMAIL_BLAST_SECRET;
    if (!validSecret || secret !== validSecret) {
      return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const resend = getResend();

    if (test) {
      // ── TEST MODE: send to a single address ───────────────────
      const toAddr = testEmail || 'brunoleoguilherme@gmail.com';
      const lang = body.lang || 'pt';
      const c = COPY[lang] || COPY.pt;
      const html = buildHtml(c, 'BFWC Test Club');

      const result = await resend.emails.send({
        from: fromEmail,
        to: toAddr,
        subject: `[TESTE] ${c.subject}`,
        html,
      });

      return NextResponse.json({ ok: true, mode: 'test', to: toAddr, id: result?.data?.id });
    }

    // ── BULK MODE: fetch all active teams ────────────────────────
    const { data: teams, error } = await supabase
      .from('portal_teams')
      .select('id, club_name, contact_name, email, preferred_language, status')
      .neq('status', 'banned')
      .not('email', 'is', null);

    if (error) throw error;
    if (!teams?.length) return NextResponse.json({ ok: true, sent: 0, message: 'No teams found' });

    const results = [];
    let sent = 0, failed = 0;

    // Resend free tier: max 2 req/s — batch with small delay
    for (const team of teams) {
      const lang = team.preferred_language || 'pt';
      const c = COPY[lang] || COPY.pt;
      const html = buildHtml(c, team.contact_name || team.club_name);

      try {
        const r = await resend.emails.send({
          from: fromEmail,
          to: team.email,
          subject: c.subject,
          html,
        });
        results.push({ id: team.id, email: team.email, status: 'sent', resendId: r?.data?.id });
        sent++;
      } catch (e) {
        results.push({ id: team.id, email: team.email, status: 'failed', error: e.message });
        failed++;
      }

      // ~2 emails/sec to stay within rate limits
      await new Promise(r => setTimeout(r, 500));
    }

    return NextResponse.json({ ok: true, mode: 'bulk', sent, failed, total: teams.length, results });
  } catch (err) {
    console.error('send-welcome-email error', err);
    return NextResponse.json({ ok: false, message: err.message || 'Erro interno' }, { status: 500 });
  }
}
