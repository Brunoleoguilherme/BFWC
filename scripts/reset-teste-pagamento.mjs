/**
 * BFWC — Zera os pagamentos do TIME DE TESTE para permitir novo teste ponta a ponta.
 * Apaga as parcelas (payment_installments) e reseta os campos de pagamento do time.
 *
 * Uso: node scripts/reset-teste-pagamento.mjs [email-do-time]
 * Padrão: bruno@brasilsportsbusiness.com
 */
import { readFileSync } from 'fs';
import { createInterface } from 'readline';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const env = {};
readFileSync(join(__dirname, '..', '.env.local'), 'utf8').split('\n').forEach(l => {
  const m = l.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim();
});

const URL = env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };

const email = (process.argv[2] || 'bruno@brasilsportsbusiness.com').toLowerCase();

const res = await fetch(`${URL}/rest/v1/portal_teams?select=id,club_name,email,payment_confirmed,amount_paid_cents&email=ilike.${encodeURIComponent(email)}`, { headers: H });
const teams = await res.json();
if (!teams?.length) { console.error('❌ Time não encontrado:', email); process.exit(1); }
const team = teams[0];
console.log(`Time: ${team.club_name} <${team.email}> | pago: ${((team.amount_paid_cents || 0) / 100).toFixed(2)}`);

const inst = await fetch(`${URL}/rest/v1/payment_installments?select=id,number,status,amount_cents&team_id=eq.${team.id}`, { headers: H }).then(r => r.json());
console.log(`Parcelas: ${inst.length}` + (inst.length ? ' → ' + inst.map(i => `#${i.number}:${i.status}`).join(' ') : ''));

const rl = createInterface({ input: process.stdin, output: process.stdout });
const ans = await new Promise(r => rl.question(`\n⚠️  ZERAR pagamentos de "${team.club_name}"? (sim/não): `, a => { rl.close(); r(a.trim().toLowerCase()); }));
if (ans !== 'sim') { console.log('Cancelado.'); process.exit(0); }

// 1. apaga as parcelas
const d = await fetch(`${URL}/rest/v1/payment_installments?team_id=eq.${team.id}`, { method: 'DELETE', headers: H });
console.log('Parcelas apagadas:', d.status);

// 2. reseta os campos de pagamento do time
const u = await fetch(`${URL}/rest/v1/portal_teams?id=eq.${team.id}`, {
  method: 'PATCH', headers: H,
  body: JSON.stringify({
    payment_confirmed: false,
    payment_date: null,
    amount_paid_cents: 0,
    payment_plan: null,
    payment_option: null,
    payment_selection: null,
    athletes_paid_qty: null,
  }),
});
console.log('Time resetado:', u.status, u.ok ? '✅' : await u.text());
console.log('\nRecarregue a aba Pagamento no portal — deve voltar a oferecer as opções de inscrição.');
