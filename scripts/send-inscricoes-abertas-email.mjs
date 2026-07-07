/**
 * BFWC 2026 — E-mail "INSCRIÇÕES ABERTAS" para todos os pré-inscritos
 * (mesma lista do e-mail de abertura: club_interests, exceto rejeitados, dedupe por e-mail)
 *
 * Uso:
 *   node scripts/send-inscricoes-abertas-email.mjs --test [--lang=pt|en|es] [--to=email]
 *   node scripts/send-inscricoes-abertas-email.mjs --test-all
 *   node scripts/send-inscricoes-abertas-email.mjs --send
 */

import { readFileSync } from 'fs';
import { createInterface } from 'readline';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const env = {};
try {
  readFileSync(join(root, '.env.local'), 'utf8').split('\n').forEach(line => {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim();
  });
} catch { console.error('❌ .env.local não encontrado'); process.exit(1); }

const RESEND_KEY   = env.RESEND_API_KEY;
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const FROM_EMAIL   = env.EMAIL_FROM || 'Brasil Flag World Championship <noreply@brasilflagworldchampionship.com>';
const TEST_TO      = 'brunoleoguilherme@gmail.com';
const SITE         = 'https://www.brasilflagworldchampionship.com';

const LOGO_B64 = readFileSync(join(root, 'public', 'assets', 'bfwc-logo-email.png')).toString('base64');
const LOGO_CID = 'bfwc-logo';

const args = process.argv.slice(2);
const isTest    = args.includes('--test');
const isTestAll = args.includes('--test-all');
const isSend    = args.includes('--send');
const langArg = (args.find(a => a.startsWith('--lang=')) || '').replace('--lang=', '') || 'pt';
const toArg   = (args.find(a => a.startsWith('--to='))   || '').replace('--to=', '') || '';

if (!isTest && !isTestAll && !isSend) {
  console.log(`Uso:
  node scripts/send-inscricoes-abertas-email.mjs --test [--lang=pt|en|es] [--to=email]
  node scripts/send-inscricoes-abertas-email.mjs --test-all
  node scripts/send-inscricoes-abertas-email.mjs --send`);
  process.exit(0);
}
if (!RESEND_KEY) { console.error('❌ RESEND_API_KEY não definido'); process.exit(1); }

const COPY = {
  pt: {
    subject: '🏈 [BFWC 2026] INSCRIÇÕES ABERTAS — garanta a vaga da sua equipe',
    preheader: 'O portal oficial de inscrição está no ar. Vagas limitadas, até 20/07.',
    badge: 'BFWC 2026 · Inscrições Abertas',
    greeting: (n) => `Olá, <strong>${n}</strong>!`,
    p1: 'É oficial: <strong>as inscrições do Brasil Flag World Championship 2026 estão ABERTAS!</strong> O portal oficial já está no ar e a equipe <strong>{club}</strong> pode garantir sua vaga agora mesmo.',
    boxTitle: '⏳ Vagas limitadas',
    boxText: 'As inscrições vão até <strong>20/07</strong> ou enquanto houver vagas. Elas são limitadas por categoria e preenchidas por <strong>ordem de pagamento da 1ª parcela</strong> — quanto antes, melhor.',
    cta: 'INSCREVER MINHA EQUIPE →',
    p2: `Como sua equipe é pré-inscrita, este é o seu período de prioridade (até 12/07). Todo o passo a passo, o regulamento e os termos estão na página <a href="${SITE}/site/documentos" style="color:#22e06a;text-decoration:none;font-weight:700">Documentos</a> do site — e a notícia completa da abertura está <a href="${SITE}/noticias/inscricoes-abertas" style="color:#22e06a;text-decoration:none;font-weight:700">aqui</a>.`,
    contact: 'Qualquer dúvida, fale com a gente pelo e-mail <a href="mailto:contato@brasilflag.com" style="color:#22e06a;text-decoration:none;font-weight:700">contato@brasilflag.com</a> ou pelo WhatsApp <a href="https://wa.me/5516997754522" style="color:#22e06a;text-decoration:none;font-weight:700">(16) 99775-4522</a>.',
    sign: 'Nos vemos em Leme! 🏈',
    team: 'Equipe BFWC 2026',
  },
  en: {
    subject: '🏈 [BFWC 2026] REGISTRATION IS OPEN — secure your team\'s spot',
    preheader: 'The official registration portal is live. Limited spots, until July 20.',
    badge: 'BFWC 2026 · Registration Open',
    greeting: (n) => `Hello, <strong>${n}</strong>!`,
    p1: 'It\'s official: <strong>registration for the Brasil Flag World Championship 2026 is OPEN!</strong> The official portal is live and <strong>{club}</strong> can secure its spot right now.',
    boxTitle: '⏳ Limited spots',
    boxText: 'Registration runs until <strong>July 20</strong> or while spots last. Spots are limited per category and filled in <strong>order of 1st installment payment</strong> — the sooner, the better.',
    cta: 'REGISTER MY TEAM →',
    p2: `As a pre-registered team, this is your priority window (until July 12). The full step-by-step guides, regulations and terms are on the <a href="${SITE}/site/documentos" style="color:#22e06a;text-decoration:none;font-weight:700">Documents</a> page — and the full announcement is <a href="${SITE}/noticias/inscricoes-abertas" style="color:#22e06a;text-decoration:none;font-weight:700">here</a>.`,
    contact: 'Questions? Reach us at <a href="mailto:contato@brasilflag.com" style="color:#22e06a;text-decoration:none;font-weight:700">contato@brasilflag.com</a> or on WhatsApp at <a href="https://wa.me/5516997754522" style="color:#22e06a;text-decoration:none;font-weight:700">+55 16 99775-4522</a>.',
    sign: 'See you in Leme! 🏈',
    team: 'BFWC 2026 Team',
  },
  es: {
    subject: '🏈 [BFWC 2026] INSCRIPCIONES ABIERTAS — asegura el cupo de tu equipo',
    preheader: 'El portal oficial de inscripción está en línea. Cupos limitados, hasta el 20/07.',
    badge: 'BFWC 2026 · Inscripciones Abiertas',
    greeting: (n) => `¡Hola, <strong>${n}</strong>!`,
    p1: 'Es oficial: <strong>¡las inscripciones del Brasil Flag World Championship 2026 están ABIERTAS!</strong> El portal oficial ya está en línea y el equipo <strong>{club}</strong> puede asegurar su cupo ahora mismo.',
    boxTitle: '⏳ Cupos limitados',
    boxText: 'Las inscripciones van hasta el <strong>20/07</strong> o mientras haya cupos. Son limitados por categoría y se llenan por <strong>orden de pago de la 1.ª cuota</strong> — cuanto antes, mejor.',
    cta: 'INSCRIBIR MI EQUIPO →',
    p2: `Como equipo pre-inscrito, este es tu período de prioridad (hasta el 12/07). El paso a paso completo, el reglamento y los términos están en la página de <a href="${SITE}/site/documentos" style="color:#22e06a;text-decoration:none;font-weight:700">Documentos</a> — y la noticia completa está <a href="${SITE}/noticias/inscricoes-abertas" style="color:#22e06a;text-decoration:none;font-weight:700">aquí</a>.`,
    contact: 'Ante cualquier duda, escríbenos a <a href="mailto:contato@brasilflag.com" style="color:#22e06a;text-decoration:none;font-weight:700">contato@brasilflag.com</a> o por WhatsApp al <a href="https://wa.me/5516997754522" style="color:#22e06a;text-decoration:none;font-weight:700">+55 16 99775-4522</a>.',
    sign: '¡Nos vemos en Leme! 🏈',
    team: 'Equipo BFWC 2026',
  },
};

function buildHtml(c, name, club) {
  const p1 = c.p1.replace('{club}', club);
  return `<!DOCTYPE html>
<html lang="pt">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"><title>BFWC 2026</title></head>
<body style="margin:0;padding:0;background:#020a16;-webkit-text-size-adjust:100%">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0">${c.preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#020a16">
    <tr><td align="center" style="padding:28px 14px">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background:#050f22;border:1px solid #16233d;border-radius:22px;overflow:hidden">
        <tr><td style="height:5px;background:#009c3b;line-height:5px;font-size:5px">&nbsp;</td></tr>
        <tr><td align="center" style="padding:30px 36px 0"><img src="cid:${LOGO_CID}" width="110" alt="BFWC 2026" style="display:block;width:110px;height:auto;border:0;margin:0 auto"></td></tr>
        <tr><td align="center" style="padding:16px 36px 20px">
          <span style="display:inline-block;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#22e06a;padding:6px 16px;border:1px solid #22e06a33;border-radius:20px;font-family:Arial,sans-serif">${c.badge}</span>
        </td></tr>
        <tr><td style="padding:0 28px 8px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#081733;border:1px solid #16294d;border-radius:18px">
            <tr><td style="padding:28px 30px">
              <p style="margin:0 0 16px;font-size:17px;color:#ffffff;font-family:Arial,sans-serif;line-height:1.6">${c.greeting(name)}</p>
              <p style="margin:0 0 18px;font-size:15px;color:#e3e9f2;font-family:Arial,sans-serif;line-height:1.65">${p1}</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0d2412;border:1px solid #22e06a44;border-radius:14px;margin:0 0 22px">
                <tr><td style="padding:18px 22px">
                  <p style="margin:0 0 8px;font-size:13px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:#22e06a;font-family:Arial,sans-serif">${c.boxTitle}</p>
                  <p style="margin:0;font-size:14px;color:#d7e6dc;font-family:Arial,sans-serif;line-height:1.65">${c.boxText}</p>
                </td></tr>
              </table>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px">
                <tr><td align="center">
                  <a href="${SITE}/portal/times/cadastro" style="display:inline-block;background:#f4ff00;color:#031020;font-size:15px;font-weight:900;font-family:Arial,sans-serif;text-decoration:none;text-transform:uppercase;letter-spacing:1px;padding:16px 36px;border-radius:10px">${c.cta}</a>
                </td></tr>
              </table>
              <p style="margin:0 0 18px;font-size:14px;color:#c6d2e2;font-family:Arial,sans-serif;line-height:1.65">${c.p2}</p>
              <p style="margin:0 0 22px;font-size:14px;color:#c6d2e2;font-family:Arial,sans-serif;line-height:1.65">${c.contact}</p>
              <p style="margin:0 0 4px;font-size:14px;color:#8ea0ba;font-family:Arial,sans-serif">${c.sign}</p>
              <p style="margin:0;font-size:15px;font-weight:800;color:#22e06a;font-family:Arial,sans-serif">${c.team}</p>
            </td></tr>
          </table>
        </td></tr>
        <tr><td align="center" style="padding:22px 36px 30px">
          <p style="margin:0;font-size:11px;color:#3c4d68;font-family:Arial,sans-serif;line-height:1.7">Brasil Flag World Championship 2026 · Leme, SP · Brasil</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

const attachments = [{ filename: 'bfwc-logo.png', content: LOGO_B64, content_id: LOGO_CID }];

async function sendEmail(to, subject, html) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM_EMAIL, to, subject, html, attachments }),
  });
  return res.json();
}

async function fetchTeams() {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/club_interests?select=id,club_name,contact_name,email,preferred_language,status&status=neq.rejected&email=not.is.null`,
    { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
  );
  return res.json();
}

function dedupeByEmail(teams) {
  const seen = new Set();
  return teams.filter(t => {
    const e = (t.email || '').trim().toLowerCase();
    if (!e || seen.has(e)) return false;
    seen.add(e);
    return true;
  });
}

async function confirm(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(question, ans => { rl.close(); resolve(ans.trim().toLowerCase()); }));
}

async function main() {
  if (isTest || isTestAll) {
    const langs = isTestAll ? ['pt', 'en', 'es'] : [langArg];
    const dest = toArg || TEST_TO;
    for (const lang of langs) {
      const c = COPY[lang] || COPY.pt;
      console.log(`\n📧 Teste (${lang}) para ${dest}...`);
      const r = await sendEmail(dest, `[TESTE] ${c.subject}`, buildHtml(c, 'Bruno Guilherme', 'Leme Lions'));
      console.log(r.id ? `✅ Enviado! ${r.id}` : `❌ ${JSON.stringify(r)}`);
      if (langs.length > 1) await new Promise(r => setTimeout(r, 700));
    }
    return;
  }

  if (isSend) {
    console.log('\n🔍 Buscando pré-inscritos...');
    const teams = await fetchTeams();
    if (!Array.isArray(teams) || !teams.length) { console.log('Erro/vazio:', JSON.stringify(teams)); return; }
    const unique = dedupeByEmail(teams);
    console.log(`📋 ${unique.length} e-mails únicos (${teams.length} registros)`);
    const ans = await confirm(`⚠️  Enviar "INSCRIÇÕES ABERTAS" para ${unique.length} times? (sim/não): `);
    if (ans !== 'sim') { console.log('Cancelado.'); return; }

    let sent = 0, failed = 0;
    for (const team of unique) {
      const lang = COPY[team.preferred_language] ? team.preferred_language : 'pt';
      const c = COPY[lang];
      const r = await sendEmail(team.email, c.subject, buildHtml(c, team.contact_name || team.club_name, team.club_name || 'sua equipe'));
      if (r.id) { sent++; console.log(`✅ [${sent}/${unique.length}] ${team.club_name} [${lang}]`); }
      else { failed++; console.error(`❌ [${team.club_name}] ${JSON.stringify(r)}`); }
      await new Promise(r => setTimeout(r, 550));
    }
    console.log(`\n🏁 ${sent} enviados, ${failed} falhas.`);
  }
}

main().catch(e => { console.error('Erro fatal:', e); process.exit(1); });
