/**
 * BFWC — Gera o snippet de sessão de teste do portal do time (produção)
 * Uso: node scripts/sessao-teste.mjs [email-do-time]
 * Padrão: bruno@brasilsportsbusiness.com
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const env = {};
readFileSync(join(__dirname, '..', '.env.local'), 'utf8').split('\n').forEach(l => {
  const m = l.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim();
});

const email = (process.argv[2] || 'bruno@brasilsportsbusiness.com').toLowerCase();

const res = await fetch(
  `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/portal_teams?select=id,club_name,contact_name,email,country,city,category,athletes_count,status,email_verified,whatsapp,payment_confirmed,payment_date,logo_url&email=ilike.${encodeURIComponent(email)}`,
  { headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}` } }
);
const teams = await res.json();
if (!Array.isArray(teams) || !teams.length) {
  console.error(`❌ Nenhum time encontrado com e-mail ${email}`);
  process.exit(1);
}
const team = teams[0];
console.log(`\n✅ Time: ${team.club_name} (status: ${team.status})\n`);
console.log('Cole no Console do navegador em www.brasilflagworldchampionship.com/portal/times :\n');
console.log(`sessionStorage.setItem('bfwc_team_session', ${JSON.stringify(JSON.stringify(team))}); location.reload();`);
