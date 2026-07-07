/**
 * BFWC 2026 — Aviso de abertura das inscrições (07/07 às 10h) para os pré-inscritos
 *
 * Envia e-mail personalizado (nome + time) no idioma cadastrado, com os guias
 * de inscrição (texto + ilustrado) anexados no mesmo idioma.
 * A logo vai embutida no e-mail (inline via CID), pois o site no ar (main)
 * ainda não tem o arquivo bfwc-logo-email.png (só existe no branch v2).
 *
 * Uso:
 *   node scripts/send-abertura-email.mjs --preview             → gera previews HTML (pt/en/es) em scripts/previews/
 *   node scripts/send-abertura-email.mjs --list                → lista destinatários (time, país, idioma)
 *   node scripts/send-abertura-email.mjs --test                → envia teste (pt) para brunoleoguilherme@gmail.com
 *   node scripts/send-abertura-email.mjs --test --lang=en      → teste em inglês
 *   node scripts/send-abertura-email.mjs --test --to=x@y.com   → teste para outro e-mail
 *   node scripts/send-abertura-email.mjs --test-all            → 3 testes (pt, en, es) para o e-mail de teste
 *   node scripts/send-abertura-email.mjs --send                → envia para TODOS os pré-inscritos (requer confirmação)
 *
 * Requer: RESEND_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY no .env.local
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { createInterface } from 'readline';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const envPath = join(root, '.env.local');

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

// Logo embutida no e-mail (inline via CID)
const LOGO_PATH = join(root, 'public', 'assets', 'bfwc-logo-email.png');
const LOGO_B64  = readFileSync(LOGO_PATH).toString('base64');
const LOGO_CID  = 'bfwc-logo';

// ── Args ──────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const isPreview = args.includes('--preview');
const isTest    = args.includes('--test');
const isTestAll = args.includes('--test-all');
const isSend    = args.includes('--send');
const isList    = args.includes('--list');
const langArg = (args.find(a => a.startsWith('--lang=')) || '').replace('--lang=', '') || 'pt';
const toArg   = (args.find(a => a.startsWith('--to='))   || '').replace('--to=', '') || '';

if (!isPreview && !isTest && !isTestAll && !isSend && !isList) {
  console.log(`Uso:
  node scripts/send-abertura-email.mjs --preview
  node scripts/send-abertura-email.mjs --list
  node scripts/send-abertura-email.mjs --test [--lang=pt|en|es] [--to=email]
  node scripts/send-abertura-email.mjs --test-all
  node scripts/send-abertura-email.mjs --send`);
  process.exit(0);
}

if (!isPreview) {
  if (!RESEND_KEY && !isList) { console.error('❌ RESEND_API_KEY não definido'); process.exit(1); }
  if ((isSend || isList) && !SUPABASE_URL) { console.error('❌ NEXT_PUBLIC_SUPABASE_URL não definido'); process.exit(1); }
  if ((isSend || isList) && !SUPABASE_KEY) { console.error('❌ SUPABASE_SERVICE_ROLE_KEY não definido'); process.exit(1); }
}

// ── Anexos (guias por idioma) ─────────────────────────────────────
const GUIDES = {
  pt: ['Guia-de-Inscricao-dos-Times-BFWC2026-PT.pdf', 'Guia-Ilustrado-Inscricao-Times-BFWC2026-PT.pdf'],
  en: ['Team-Registration-Guide-BFWC2026-EN.pdf', 'Illustrated-Team-Registration-Guide-BFWC2026-EN.pdf'],
  es: ['Guia-de-Inscripcion-de-Equipos-BFWC2026-ES.pdf', 'Guia-Ilustrada-Inscripcion-Equipos-BFWC2026-ES.pdf'],
};

const attachmentsCache = {};
function getAttachments(lang) {
  const l = GUIDES[lang] ? lang : 'pt';
  if (!attachmentsCache[l]) {
    attachmentsCache[l] = [
      // Logo inline (não aparece como anexo; referenciada por cid: no HTML)
      { filename: 'bfwc-logo.png', content: LOGO_B64, content_id: LOGO_CID },
      ...GUIDES[l].map(f => ({
        filename: f,
        content: readFileSync(join(root, 'guias', f)).toString('base64'),
      })),
    ];
  }
  return attachmentsCache[l];
}

// ── Copy (pt / en / es) ───────────────────────────────────────────
const COPY = {
  pt: {
    subject: '[BFWC 2026] Inscrições abrem amanhã, 07/07 às 10h — prepare sua equipe',
    preheader: 'Vagas limitadas: inscrições de 07/07 (10h) até 20/07 ou enquanto houver vagas.',
    badge: 'BFWC 2026 · Abertura das Inscrições',
    greeting: (n) => `Olá, <strong>${n}</strong>!`,
    p1: 'Amanhã, dia <strong>07/07, às 10h</strong>, abrem oficialmente as inscrições do <strong>Brasil Flag World Championship 2026</strong>, com acesso liberado à plataforma oficial de inscrição a partir desse horário.',
    boxTitle: '⏳ Vagas limitadas',
    boxText: 'As vagas são limitadas e ficam disponíveis até o dia <strong>20/07</strong> ou até serem todas preenchidas, o que ocorrer primeiro. Recomendamos garantir a inscrição assim que o período abrir, para evitar o risco de ficar de fora.',
    p2: (club) => `Em anexo, segue o passo a passo completo do processo de inscrição, para que a equipe <strong>${club}</strong> já esteja preparada no momento da abertura.`,
    impTitle: '📄 Importante',
    impText: 'Faça a leitura completa do documento em anexo. Nele contém todos os detalhes sobre as etapas da inscrição, que podem sanar quaisquer dúvidas sobre cada passo.',
    contact: 'Qualquer dúvida sobre o processo, entre em contato pelo e-mail <a href="mailto:contato@brasilflag.com" style="color:#22e06a;text-decoration:none;font-weight:700">contato@brasilflag.com</a> ou pelo WhatsApp <a href="https://wa.me/5516997754522" style="color:#22e06a;text-decoration:none;font-weight:700">(16) 99775-4522</a>.',
    sign: 'Atenciosamente,',
    team: 'Equipe BFWC 2026',
  },
  en: {
    subject: '[BFWC 2026] Registration opens tomorrow, July 7 at 10 AM (BRT) — get your team ready',
    preheader: 'Limited spots: registration from July 7 (10 AM BRT) until July 20 or while spots last.',
    badge: 'BFWC 2026 · Registration Opening',
    greeting: (n) => `Hello, <strong>${n}</strong>!`,
    p1: 'Tomorrow, <strong>July 7, at 10 AM (Brasília time, GMT-3)</strong>, registration for the <strong>Brasil Flag World Championship 2026</strong> officially opens, with access to the official registration platform released at that time.',
    boxTitle: '⏳ Limited spots',
    boxText: 'Spots are limited and will be available until <strong>July 20</strong> or until they are all filled, whichever comes first. We recommend securing your registration as soon as the period opens, to avoid the risk of being left out.',
    p2: (club) => `Attached you will find the complete step-by-step guide to the registration process, so that <strong>${club}</strong> is fully prepared the moment registration opens.`,
    impTitle: '📄 Important',
    impText: 'Please read the attached document in full. It contains all the details about each stage of the registration process and should answer any questions about each step.',
    contact: 'If you have any questions about the process, contact us at <a href="mailto:contato@brasilflag.com" style="color:#22e06a;text-decoration:none;font-weight:700">contato@brasilflag.com</a> or via WhatsApp at <a href="https://wa.me/5516997754522" style="color:#22e06a;text-decoration:none;font-weight:700">+55 16 99775-4522</a>.',
    sign: 'Sincerely,',
    team: 'BFWC 2026 Team',
  },
  es: {
    subject: '[BFWC 2026] Las inscripciones abren mañana, 07/07 a las 10h (Brasilia) — prepara a tu equipo',
    preheader: 'Cupos limitados: inscripciones del 07/07 (10h Brasilia) hasta el 20/07 o hasta agotar cupos.',
    badge: 'BFWC 2026 · Apertura de Inscripciones',
    greeting: (n) => `¡Hola, <strong>${n}</strong>!`,
    p1: 'Mañana, <strong>07/07, a las 10h (hora de Brasilia, GMT-3)</strong>, abren oficialmente las inscripciones del <strong>Brasil Flag World Championship 2026</strong>, con acceso liberado a la plataforma oficial de inscripción a partir de ese horario.',
    boxTitle: '⏳ Cupos limitados',
    boxText: 'Los cupos son limitados y estarán disponibles hasta el <strong>20/07</strong> o hasta que se completen todos, lo que ocurra primero. Recomendamos asegurar la inscripción apenas se abra el período, para evitar el riesgo de quedar fuera.',
    p2: (club) => `Adjunto encontrarás el paso a paso completo del proceso de inscripción, para que el equipo <strong>${club}</strong> ya esté preparado en el momento de la apertura.`,
    impTitle: '📄 Importante',
    impText: 'Lee el documento adjunto completo. Contiene todos los detalles sobre las etapas de la inscripción y puede resolver cualquier duda sobre cada paso.',
    contact: 'Ante cualquier duda sobre el proceso, contáctanos por el correo <a href="mailto:contato@brasilflag.com" style="color:#22e06a;text-decoration:none;font-weight:700">contato@brasilflag.com</a> o por WhatsApp al <a href="https://wa.me/5516997754522" style="color:#22e06a;text-decoration:none;font-weight:700">+55 16 99775-4522</a>.',
    sign: 'Atentamente,',
    team: 'Equipo BFWC 2026',
  },
};

// ── HTML (padrão visual emailShell do BFWC) ───────────────────────
function buildHtml(c, name, club, logoSrc = `cid:${LOGO_CID}`) {
  return `<!DOCTYPE html>
<html lang="pt">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark">
<title>BFWC 2026</title>
</head>
<body style="margin:0;padding:0;background:#020a16;-webkit-text-size-adjust:100%">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0">${c.preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#020a16">
    <tr>
      <td align="center" style="padding:28px 14px">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background:#050f22;border:1px solid #16233d;border-radius:22px;overflow:hidden">

          <tr><td style="height:5px;background:#009c3b;line-height:5px;font-size:5px">&nbsp;</td></tr>

          <tr>
            <td align="center" style="padding:30px 36px 0">
              <img src="${logoSrc}" width="110" alt="BFWC 2026" style="display:block;width:110px;height:auto;border:0;margin:0 auto">
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:16px 36px 20px">
              <span style="display:inline-block;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#22e06a;padding:6px 16px;border:1px solid #22e06a33;border-radius:20px;font-family:Arial,sans-serif">${c.badge}</span>
            </td>
          </tr>

          <tr><td style="padding:0 28px 8px">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#081733;border:1px solid #16294d;border-radius:18px">
              <tr><td style="padding:28px 30px">
                <p style="margin:0 0 16px;font-size:17px;color:#ffffff;font-family:Arial,sans-serif;line-height:1.6">${c.greeting(name)}</p>
                <p style="margin:0 0 18px;font-size:15px;color:#e3e9f2;font-family:Arial,sans-serif;line-height:1.65">${c.p1}</p>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0d2412;border:1px solid #22e06a44;border-radius:14px;margin:0 0 18px">
                  <tr><td style="padding:18px 22px">
                    <p style="margin:0 0 8px;font-size:13px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:#22e06a;font-family:Arial,sans-serif">${c.boxTitle}</p>
                    <p style="margin:0;font-size:14px;color:#d7e6dc;font-family:Arial,sans-serif;line-height:1.65">${c.boxText}</p>
                  </td></tr>
                </table>

                <p style="margin:0 0 18px;font-size:15px;color:#e3e9f2;font-family:Arial,sans-serif;line-height:1.65">${c.p2(club)}</p>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#241d08;border:1px solid #f5d02f44;border-radius:14px;margin:0 0 18px">
                  <tr><td style="padding:18px 22px">
                    <p style="margin:0 0 8px;font-size:13px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:#f5d02f;font-family:Arial,sans-serif">${c.impTitle}</p>
                    <p style="margin:0;font-size:14px;color:#efe7cd;font-family:Arial,sans-serif;line-height:1.65">${c.impText}</p>
                  </td></tr>
                </table>

                <p style="margin:0 0 22px;font-size:14px;color:#c6d2e2;font-family:Arial,sans-serif;line-height:1.65">${c.contact}</p>

                <p style="margin:0 0 4px;font-size:14px;color:#8ea0ba;font-family:Arial,sans-serif">${c.sign}</p>
                <p style="margin:0;font-size:15px;font-weight:800;color:#22e06a;font-family:Arial,sans-serif">${c.team}</p>
              </td></tr>
            </table>
          </td></tr>

          <tr>
            <td align="center" style="padding:22px 36px 30px">
              <p style="margin:0;font-size:11px;color:#3c4d68;font-family:Arial,sans-serif;line-height:1.7">Brasil Flag World Championship 2026 · Leme, SP · Brasil</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ── Resend ────────────────────────────────────────────────────────
async function sendEmail(to, subject, html, attachments) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM_EMAIL, to, subject, html, attachments }),
  });
  return res.json();
}

async function fetchTeams() {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/club_interests?select=id,club_name,contact_name,email,country,preferred_language,status&status=neq.rejected&email=not.is.null&order=country,club_name`,
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

// ── Main ─────────────────────────────────────────────────────────
async function main() {
  if (isPreview) {
    const dir = join(__dirname, 'previews');
    mkdirSync(dir, { recursive: true });
    for (const lang of ['pt', 'en', 'es']) {
      const file = join(dir, `abertura-${lang}.html`);
      writeFileSync(file, buildHtml(COPY[lang], 'Bruno Guilherme', 'Leme Lions', `data:image/png;base64,${LOGO_B64}`));
      console.log(`✅ Preview: ${file}`);
    }
    return;
  }

  if (isList) {
    const teams = await fetchTeams();
    if (!Array.isArray(teams) || teams.length === 0) {
      console.log('Nenhum time encontrado ou erro:', JSON.stringify(teams));
      return;
    }
    const unique = dedupeByEmail(teams);
    console.log(`\n📋 Destinatários (${unique.length} e-mails únicos de ${teams.length} registros):\n`);
    const w = Math.max(...unique.map(t => (t.club_name || '').length)) + 2;
    unique.forEach((t, i) => {
      console.log(`${String(i + 1).padStart(3)}. ${(t.club_name || '—').padEnd(w)} ${t.country || '—'}  [${t.preferred_language || 'pt'}]`);
    });
    const byCountry = {};
    unique.forEach(t => { const c = t.country || '—'; byCountry[c] = (byCountry[c] || 0) + 1; });
    console.log('\nPor país: ' + Object.entries(byCountry).sort((a, b) => b[1] - a[1]).map(([c, n]) => `${c}: ${n}`).join('  |  '));

    // Registros descartados por e-mail repetido (só o 1º de cada e-mail recebe)
    const kept = new Set(unique.map(t => t.id));
    const dupes = teams.filter(t => !kept.has(t.id));
    if (dupes.length) {
      console.log(`\n🔁 ${dupes.length} registros com e-mail repetido (não recebem 2x):`);
      dupes.forEach(t => {
        const first = unique.find(u => (u.email || '').trim().toLowerCase() === (t.email || '').trim().toLowerCase());
        console.log(`   ${t.club_name} <${t.email}> — mesmo e-mail de "${first ? first.club_name : '?'}"`);
      });
    }
    return;
  }

  if (isTest || isTestAll) {
    const langs = isTestAll ? ['pt', 'en', 'es'] : [langArg];
    const dest = toArg || TEST_TO;
    for (const lang of langs) {
      const c = COPY[lang] || COPY.pt;
      const html = buildHtml(c, 'Bruno Guilherme', 'Leme Lions');
      console.log(`\n📧 Enviando teste (${lang}) para ${dest}...`);
      const result = await sendEmail(dest, `[TESTE] ${c.subject}`, html, getAttachments(lang));
      if (result.id) console.log(`✅ Enviado! ID Resend: ${result.id}`);
      else console.error('❌ Falhou:', JSON.stringify(result, null, 2));
      if (langs.length > 1) await new Promise(r => setTimeout(r, 800));
    }
    return;
  }

  if (isSend) {
    console.log('\n🔍 Buscando pré-inscritos no Supabase...');
    const teams = await fetchTeams();

    if (!Array.isArray(teams) || teams.length === 0) {
      console.log('Nenhum time encontrado ou erro:', JSON.stringify(teams));
      return;
    }

    // Dedupe por e-mail (mesmo e-mail não recebe duas vezes)
    const unique = dedupeByEmail(teams);

    const byLang = { pt: 0, en: 0, es: 0, other: 0 };
    unique.forEach(t => {
      const l = t.preferred_language || 'pt';
      byLang[l] !== undefined ? byLang[l]++ : byLang.other++;
    });

    console.log(`\n📋 ${teams.length} registros, ${unique.length} e-mails únicos:`);
    console.log(`   PT: ${byLang.pt}  |  EN: ${byLang.en}  |  ES: ${byLang.es}  |  Outros: ${byLang.other}`);
    console.log('\nPrimeiros 5:');
    unique.slice(0, 5).forEach(t => console.log(`   ${t.club_name} <${t.email}> [${t.preferred_language || 'pt'}]`));

    const ans = await confirm(`\n⚠️  Confirmar envio (com anexos) para TODOS os ${unique.length} times? (sim/não): `);
    if (ans !== 'sim') { console.log('Cancelado.'); return; }

    let sent = 0, failed = 0;
    const failures = [];
    for (const team of unique) {
      const lang = GUIDES[team.preferred_language] ? team.preferred_language : 'pt';
      const c = COPY[lang];
      const name = team.contact_name || team.club_name;
      const html = buildHtml(c, name, team.club_name || 'sua equipe');

      try {
        const result = await sendEmail(team.email, c.subject, html, getAttachments(lang));
        if (result.id) {
          sent++;
          console.log(`✅ [${sent}/${unique.length}] ${team.club_name} <${team.email}> [${lang}]`);
        } else {
          failed++;
          failures.push({ team: team.club_name, email: team.email, error: result });
          console.error(`❌ [${team.club_name}] ${JSON.stringify(result)}`);
        }
      } catch (e) {
        failed++;
        failures.push({ team: team.club_name, email: team.email, error: e.message });
        console.error(`❌ [${team.club_name}] ${e.message}`);
      }

      // Rate limit Resend: ~2/s
      await new Promise(r => setTimeout(r, 600));
    }

    console.log(`\n🏁 Concluído: ${sent} enviados, ${failed} falhas.`);
    if (failures.length) {
      const logFile = join(__dirname, `abertura-falhas-${Date.now()}.json`);
      writeFileSync(logFile, JSON.stringify(failures, null, 2));
      console.log(`   Falhas salvas em: ${logFile}`);
    }
  }
}

main().catch(e => { console.error('Erro fatal:', e); process.exit(1); });
