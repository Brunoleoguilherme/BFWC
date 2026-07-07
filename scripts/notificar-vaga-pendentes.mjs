#!/usr/bin/env node
// Backfill do aviso interno de VAGA GARANTIDA:
// encontra times com ≥1 parcela paga e vaga_notified_at NULL e envia o e-mail
// para MKT + organização (mesmo conteúdo do fluxo automático).
//
//   node scripts/notificar-vaga-pendentes.mjs          → dry-run (lista)
//   node scripts/notificar-vaga-pendentes.mjs --send   → envia de fato
//
// Requer no .env.local: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const env = {};
try {
  readFileSync(join(root, '.env.local'), 'utf8').split('\n').forEach(line => {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  });
} catch { console.error('❌ .env.local não encontrado'); process.exit(1); }

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const RESEND_KEY   = env.RESEND_API_KEY;
if (!SUPABASE_URL || !SUPABASE_KEY || !RESEND_KEY) { console.error('❌ Envs faltando no .env.local'); process.exit(1); }

const SEND = process.argv.includes('--send');
const VAGA_RECIPIENTS = ['dayenenogueira5@gmail.com', 'brunoleoguilherme@gmail.com'];
const FROM = env.EMAIL_FROM || 'Brasil Flag World Championship <noreply@brasilflagworldchampionship.com>';
const OPEN_AT = new Date('2026-07-07T09:50:00-03:00');
const LOGO = 'https://www.brasilflagworldchampionship.com/assets/bfwc-logo-email.png';

const BRL = c => ((c || 0) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const fmtDate = d => new Date(d).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

async function sb(path) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  });
  if (!r.ok) throw new Error(`${path} → ${r.status} ${await r.text()}`);
  return r.json();
}
async function sbPatch(path, body) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method: 'PATCH',
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`PATCH ${path} → ${r.status} ${await r.text()}`);
  return r.json();
}

// Preço (opção 1: 2000/categoria com 20 atletas; opção 2: 800/categoria + 90/atleta)
function totalCents(team) {
  const cats = (team.category || '').split(',').filter(s => s.trim()).length || 1;
  if (String(team.payment_option) === '2') {
    return (80000 * cats) + (9000 * (team.athletes_paid_qty || 0));
  }
  return 200000 * cats;
}

const teams = await sb('portal_teams?select=*&vaga_notified_at=is.null&order=created_at');
const insts = await sb('payment_installments?select=team_id,number,status,amount_cents,plan_size');
const interests = await sb('club_interests?select=email,created_at,competitive_history,notes');
const notified = await sb('portal_teams?select=id,country&vaga_notified_at=not.is.null');

const instBy = {};
insts.forEach(i => (instBy[i.team_id] ||= []).push(i));
const preByEmail = new Map(interests.filter(i => i.email).map(i => [i.email.toLowerCase().trim(), i]));
const norm = s => (s || '').trim().toLowerCase();

const pendentes = teams.filter(t => t.status !== 'rejected' && (instBy[t.id] || []).some(i => i.status === 'paid'));
console.log(`Times com vaga garantida ainda não notificados: ${pendentes.length}`);
pendentes.forEach(t => console.log(` · ${t.club_name} (${t.country || '?'})`));
if (!SEND) { console.log('\nDry-run. Use --send para enviar.'); process.exit(0); }

let ordem = notified.length;
const notifiedCountries = notified.map(t => norm(t.country));

for (const team of pendentes) {
  ordem += 1;
  const paid = (instBy[team.id] || []).filter(i => i.status === 'paid');
  const planSize = team.payment_plan || paid[0]?.plan_size || null;
  const option = String(team.payment_option || '1') === '2' ? '2' : '1';
  const total = totalCents(team);
  const pago = team.amount_paid_cents || 0;
  const pre = preByEmail.get(norm(team.email)) || null;
  const roster = (await sb(`team_athletes?select=id&team_id=eq.${team.id}`)).length;
  const firstOfCountry = !notifiedCountries.includes(norm(team.country));
  notifiedCountries.push(norm(team.country));
  const horas = Math.max(0, Math.round((Date.now() - OPEN_AT.getTime()) / 36e5));

  const curiosidades = [
    `É o <strong>${ordem}º time</strong> a garantir vaga no BFWC 2026.`,
    ...(firstOfCountry && team.country ? [`Primeiro time ${norm(team.country) === 'brasil' ? 'do Brasil' : `de ${team.country.trim()}`} a garantir vaga. 🌎`] : []),
    pre
      ? `Era pré-inscrito desde <strong>${new Date(pre.created_at).toLocaleDateString('pt-BR')}</strong> — estava esperando as inscrições abrirem.`
      : `<strong>Não era pré-inscrito</strong> — chegou direto na abertura e já garantiu a vaga.`,
    `Garantiu a vaga <strong>${horas < 48 ? `${horas}h` : `${Math.round(horas / 24)} dias`}</strong> depois da abertura das inscrições.`,
    ...(roster > 0 ? [`Já cadastrou <strong>${roster} atleta${roster !== 1 ? 's' : ''}</strong> no portal.`] : []),
  ];

  const fields = [
    ['Time', team.club_name],
    ['Cidade / País', [team.city, team.country].filter(Boolean).join(' · ')],
    ['Categorias', team.category || '—'],
    ['Plano', `Opção ${option}${option === '2' && team.athletes_paid_qty ? ` · ${team.athletes_paid_qty} atletas contratados` : ''}${planSize ? ` · ${planSize}x` : ''}`],
    ['Pagamento', `${BRL(pago)} de ${BRL(total)} (${paid.length}${planSize ? `/${planSize}` : ''} parcela${paid.length !== 1 ? 's' : ''} paga${paid.length !== 1 ? 's' : ''})`],
    ['Atletas no portal', String(roster)],
    ['Instagram', team.instagram ? `<a href="https://instagram.com/${String(team.instagram).replace(/^@/, '')}" style="color:#7fb2ff">${team.instagram}</a>` : '—'],
    ['Descrição do time', team.description || '—'],
    ...(pre?.competitive_history ? [['Histórico (pré-inscrição)', pre.competitive_history]] : []),
    ...(pre?.notes ? [['Observações (pré-inscrição)', pre.notes]] : []),
    ['Contato', team.contact_name || '—'],
    ['E-mail', team.email || '—'],
    ['WhatsApp', team.whatsapp || '—'],
    ['Idioma', (team.preferred_language || 'pt').toUpperCase()],
    ['Cadastro no portal', fmtDate(team.created_at)],
  ];

  const html = `
  <div style="font-family:Arial,sans-serif;background:#031020;color:#fff;padding:36px 26px;max-width:600px;margin:0 auto;border-radius:16px">
    <img src="${LOGO}" width="100" alt="BFWC 2026" style="display:block;width:100px;height:auto;border:0;margin:0 0 10px">
    <p style="color:rgba(255,255,255,.4);font-size:12px;margin:0 0 22px">Aviso interno · Organização + Marketing</p>
    <h2 style="font-size:22px;font-weight:800;margin:0 0 4px">🎉 Vaga garantida #${ordem}</h2>
    <p style="font-size:16px;color:#f4ff00;font-weight:700;margin:0 0 22px">${team.club_name}</p>
    <table style="width:100%;border-collapse:collapse;background:#081733;border:1px solid #16294d;border-radius:12px;overflow:hidden">
      ${fields.map(([k, v]) => `<tr><td style="padding:9px 14px;font-size:11px;color:rgba(255,255,255,.45);text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid #10203f;white-space:nowrap">${k}</td><td style="padding:9px 14px;font-size:13px;color:#e3e9f2;border-bottom:1px solid #10203f">${v}</td></tr>`).join('')}
    </table>
    <h3 style="font-size:14px;font-weight:800;margin:24px 0 10px;color:#f4ff00">💡 Curiosidades para o post</h3>
    <ul style="margin:0;padding-left:18px;color:#c8d8f5;font-size:13px;line-height:1.8">
      ${curiosidades.map(c => `<li>${c}</li>`).join('')}
    </ul>
    <div style="margin:26px 0 6px">
      ${team.logo_url
        ? `<a href="${team.logo_url}" style="display:inline-block;padding:12px 24px;background:#f4ff00;color:#031020;font-weight:900;font-size:13px;text-decoration:none;border-radius:10px;margin-right:10px">⬇ Baixar logo do time</a>`
        : `<span style="display:inline-block;padding:12px 24px;background:#10203f;color:rgba(255,255,255,.5);font-size:13px;border-radius:10px;margin-right:10px">Time não enviou logo</span>`}
      <a href="https://www.brasilflagworldchampionship.com/admin/teams" style="display:inline-block;padding:12px 24px;background:#0D4BFF;color:#fff;font-weight:800;font-size:13px;text-decoration:none;border-radius:10px">Ver no painel →</a>
    </div>
    <p style="color:rgba(255,255,255,.35);font-size:11px;margin-top:20px">E-mail automático enviado quando a 1ª parcela é confirmada.</p>
  </div>`;

  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: FROM,
      to: VAGA_RECIPIENTS,
      subject: `🎉 VAGA GARANTIDA #${ordem} — ${team.club_name}${team.country ? ` (${team.country.trim()})` : ''}`,
      html,
    }),
  });
  if (!r.ok) { console.error(`❌ ${team.club_name}: ${r.status} ${await r.text()}`); continue; }

  await sbPatch(`portal_teams?id=eq.${team.id}`, { vaga_notified_at: new Date().toISOString() });
  console.log(`✅ #${ordem} ${team.club_name} — enviado e marcado`);
  await new Promise(res => setTimeout(res, 600));
}
console.log('Concluído.');
