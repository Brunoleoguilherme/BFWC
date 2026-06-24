/**
 * BFWC 2026 — Envio de email de boas-vindas para times cadastrados
 *
 * Uso:
 *   node scripts/send-welcome-email.mjs --test          → envia teste para brunoleoguilherme@gmail.com
 *   node scripts/send-welcome-email.mjs --test --lang=en → envia teste em inglês
 *   node scripts/send-welcome-email.mjs --send           → envia para TODOS os times (requer confirmação)
 *
 * Requer: RESEND_API_KEY e NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local
 */

import { readFileSync } from 'fs';
import { createInterface } from 'readline';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '..', '.env.local');

// ── Load .env.local ───────────────────────────────────────────────
const env = {};
try {
  readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim();
  });
} catch { console.error('❌ .env.local não encontrado'); process.exit(1); }

const RESEND_KEY   = env.RESEND_API_KEY;
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const FROM_EMAIL   = env.EMAIL_FROM || 'Brasil Flag World Championship <noreply@brasilflagworldchampionship.com>';
const TEST_TO      = 'brunoleoguilherme@gmail.com';

if (!RESEND_KEY)   { console.error('❌ RESEND_API_KEY não definido'); process.exit(1); }
if (!SUPABASE_URL) { console.error('❌ NEXT_PUBLIC_SUPABASE_URL não definido'); process.exit(1); }
if (!SUPABASE_KEY) { console.error('❌ SUPABASE_SERVICE_ROLE_KEY não definido'); process.exit(1); }

// ── Args ──────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const isTest = args.includes('--test');
const isSend = args.includes('--send');
const langArg = (args.find(a => a.startsWith('--lang=')) || '').replace('--lang=', '') || 'pt';
const toArg   = (args.find(a => a.startsWith('--to='))   || '').replace('--to=', '') || '';

if (!isTest && !isSend) {
  console.log('Uso:\n  node scripts/send-welcome-email.mjs --test [--lang=pt|en|es]\n  node scripts/send-welcome-email.mjs --send');
  process.exit(0);
}

// ── Email copy ────────────────────────────────────────────────────
const COPY = {
  pt: {
    subject: 'Brasil Flag World Championship 2026 — Próximos passos da sua candidatura',
    greeting: (n) => `Olá, ${n}!`,
    p1: 'Obrigado por enviar a candidatura da sua equipe para participar do <strong>Brasil Flag World Championship 2026</strong>.',
    p2: 'Recebemos suas informações e queremos informar que o processo de análise dos clubes já está em andamento. Nossa equipe está avaliando todas as candidaturas recebidas para construir uma competição de alto nível, reunindo equipes nacionais e internacionais.',
    p3title: 'Nos próximos dias, divulgaremos informações oficiais importantes sobre o evento, incluindo:',
    bullets: ['Processo de inscrição oficial das equipes','Valores de participação','Datas e prazos do campeonato','Categorias confirmadas','Formato da competição','Indicações de hospedagem e pacotes especiais por meio do parceiro oficial de viagens do campeonato','Próximos passos do processo seletivo'],
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
    greeting: (n) => `Hello, ${n}!`,
    p1: 'Thank you for submitting your team\'s application to participate in the <strong>Brasil Flag World Championship 2026</strong>.',
    p2: 'We have received your information and are pleased to inform you that the club evaluation process is already underway. Our team is reviewing all applications received to build a high-level competition, bringing together national and international teams.',
    p3title: 'In the coming days, we will publish important official information about the event, including:',
    bullets: ['Official team registration process','Participation fees','Championship dates and deadlines','Confirmed categories','Competition format','Accommodation suggestions and special packages through the championship\'s official travel partner','Next steps of the selection process'],
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
    greeting: (n) => `¡Hola, ${n}!`,
    p1: 'Gracias por enviar la candidatura de tu equipo para participar en el <strong>Brasil Flag World Championship 2026</strong>.',
    p2: 'Hemos recibido tu información y queremos comunicarte que el proceso de evaluación de los clubes ya está en marcha. Nuestro equipo está evaluando todas las candidaturas recibidas para construir una competición de alto nivel, reuniendo equipos nacionales e internacionales.',
    p3title: 'En los próximos días publicaremos información oficial importante sobre el evento, incluyendo:',
    bullets: ['Proceso de inscripción oficial de los equipos','Valores de participación','Fechas y plazos del campeonato','Categorías confirmadas','Formato de la competición','Recomendaciones de alojamiento y paquetes especiales a través del socio oficial de viajes del campeonato','Próximos pasos del proceso de selección'],
    p4: 'Mientras tanto, recomendamos que tu equipo siga nuestros canales oficiales para estar al tanto de todas las novedades y anuncios:',
    site: '🌐 Sitio Oficial: brasilflagworldchampionship.com',
    social: '📱 Redes Sociales Oficiales: @brasilflagworldchampionship',
    closing: 'Este es solo el primer paso hacia una experiencia que promete reunir atletas, clubes y culturas en uno de los mayores encuentros de Flag Football realizados en Brasil.',
    thanks: 'Agradecemos tu interés y la confianza en ser parte de este proyecto.',
    seeYou: 'Nos vemos pronto.',
    sign: 'Atentamente,',
  },
};

function buildHtml(c, name) {
  return `<!DOCTYPE html>
<html lang="pt">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>BFWC 2026</title></head>
<body style="margin:0;padding:0;background:#020c1a;font-family:Inter,Arial,sans-serif">
<div style="max-width:620px;margin:0 auto;padding:32px 16px">
  <div style="text-align:center;margin-bottom:32px">
    <div style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#031020,#061830);border:1px solid rgba(244,255,0,.25);border-radius:14px">
      <div style="font-size:11px;font-weight:800;letter-spacing:4px;text-transform:uppercase;color:#f4ff00;margin-bottom:4px">BRASIL FLAG WORLD CHAMPIONSHIP</div>
      <div style="font-size:36px;font-weight:900;color:#fff;letter-spacing:-2px;line-height:1">2026</div>
      <div style="font-size:11px;color:rgba(255,255,255,.35);margin-top:4px;letter-spacing:1px">LEME, SP — BRASIL</div>
    </div>
  </div>
  <div style="background:linear-gradient(145deg,rgba(6,27,58,.95),rgba(2,8,22,.98));border:1px solid rgba(255,255,255,.1);border-radius:20px;overflow:hidden;margin-bottom:20px">
    <div style="height:4px;background:linear-gradient(90deg,#f4ff00,#20e33f)"></div>
    <div style="padding:36px 32px">
      <p style="margin:0 0 20px;font-size:22px;font-weight:900;color:#fff">${c.greeting(name)}</p>
      <p style="margin:0 0 16px;font-size:15px;color:#c8d8f5;line-height:1.7">${c.p1}</p>
      <p style="margin:0 0 24px;font-size:14px;color:rgba(200,216,245,.8);line-height:1.75">${c.p2}</p>
      <div style="background:rgba(244,255,0,.05);border:1px solid rgba(244,255,0,.15);border-radius:14px;padding:22px 24px;margin-bottom:24px">
        <p style="margin:0 0 16px;font-size:13px;font-weight:800;color:#f4ff00;text-transform:uppercase;letter-spacing:1px">${c.p3title}</p>
        <ul style="margin:0;padding:0 0 0 4px;list-style:none">
          ${c.bullets.map(b => `<li style="display:flex;align-items:flex-start;gap:10px;margin-bottom:10px;font-size:13px;color:#c8d8f5;line-height:1.5"><span style="color:#20e33f;font-weight:900;flex-shrink:0;margin-top:1px">›</span>${b}</li>`).join('')}
        </ul>
      </div>
      <p style="margin:0 0 16px;font-size:14px;color:rgba(200,216,245,.8);line-height:1.7">${c.p4}</p>
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
  <div style="text-align:center;padding:0 16px">
    <p style="font-size:11px;color:rgba(255,255,255,.2);line-height:1.6;margin:0">Brasil Flag World Championship 2026 · Leme, SP · Brasil<br>
    <a href="https://brasilflagworldchampionship.com" style="color:rgba(255,255,255,.25);text-decoration:none">brasilflagworldchampionship.com</a></p>
  </div>
</div>
</body></html>`;
}

async function sendEmail(to, subject, html) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
  });
  return res.json();
}

async function fetchTeams() {
  // club_interests = pré-inscritos (formulário do site, 59 times)
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/club_interests?select=id,club_name,contact_name,email,preferred_language,status&status=neq.rejected&email=not.is.null`,
    { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
  );
  return res.json();
}

async function confirm(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(question, ans => { rl.close(); resolve(ans.trim().toLowerCase()); }));
}

// ── Main ─────────────────────────────────────────────────────────
async function main() {
  if (isTest) {
    const c = COPY[langArg] || COPY.pt;
    const subject = `[TESTE] ${c.subject}`;
    const html = buildHtml(c, 'Bruno');
    const dest = toArg || TEST_TO;
    console.log(`\n📧 Enviando email para ${dest} (idioma: ${langArg})...`);
    const result = await sendEmail(dest, subject, html);
    if (result.id) {
      console.log(`✅ Enviado! ID Resend: ${result.id}`);
    } else {
      console.error('❌ Falhou:', JSON.stringify(result, null, 2));
    }
    return;
  }

  if (isSend) {
    console.log('\n🔍 Buscando times no Supabase...');
    const teams = await fetchTeams();

    if (!Array.isArray(teams) || teams.length === 0) {
      console.log('Nenhum time encontrado ou erro:', JSON.stringify(teams));
      return;
    }

    const byLang = { pt: 0, en: 0, es: 0, other: 0 };
    teams.forEach(t => {
      const l = t.preferred_language || 'pt';
      byLang[l] !== undefined ? byLang[l]++ : byLang.other++;
    });

    console.log(`\n📋 ${teams.length} times encontrados:`);
    console.log(`   PT: ${byLang.pt}  |  EN: ${byLang.en}  |  ES: ${byLang.es}  |  Outros: ${byLang.other}`);
    console.log('\nPrimeiros 5:');
    teams.slice(0, 5).forEach(t => console.log(`   ${t.club_name} <${t.email}> [${t.preferred_language || 'pt'}]`));

    const ans = await confirm(`\n⚠️  Confirmar envio para TODOS os ${teams.length} times? (sim/não): `);
    if (ans !== 'sim') { console.log('Cancelado.'); return; }

    let sent = 0, failed = 0;
    for (const team of teams) {
      const lang = team.preferred_language || 'pt';
      const c = COPY[lang] || COPY.pt;
      const name = team.contact_name || team.club_name;
      const html = buildHtml(c, name);

      try {
        const result = await sendEmail(team.email, c.subject, html);
        if (result.id) {
          sent++;
          console.log(`✅ [${sent}/${teams.length}] ${team.club_name} <${team.email}>`);
        } else {
          failed++;
          console.error(`❌ [${team.club_name}] ${JSON.stringify(result)}`);
        }
      } catch (e) {
        failed++;
        console.error(`❌ [${team.club_name}] ${e.message}`);
      }

      // Rate limit: ~2/s
      await new Promise(r => setTimeout(r, 550));
    }

    console.log(`\n✅ Concluído: ${sent} enviados, ${failed} com erro.`);
  }
}

main().catch(e => { console.error('Erro fatal:', e); process.exit(1); });
