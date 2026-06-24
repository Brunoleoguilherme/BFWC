/**
 * Atualiza email de um clube no Supabase
 * node scripts/update-email.mjs
 */
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const env = {};
readFileSync(join(__dirname, '..', '.env.local'), 'utf8').split('\n').forEach(line => {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim();
});

const URL  = env.NEXT_PUBLIC_SUPABASE_URL;
const KEY  = env.SUPABASE_SERVICE_ROLE_KEY;
const OLD  = 'mkt@tddobem.com.br';
const NEW  = 'dayenenogueira5@gmail.com';

const res = await fetch(
  `${URL}/rest/v1/club_interests?email=ilike.${encodeURIComponent(OLD)}`,
  { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } }
);
const rows = await res.json();
console.log('Encontrado:', rows.length, 'registro(s)', rows.map(r => `${r.club_name} <${r.email}>`));

if (!rows.length) { console.log('Nenhum registro encontrado.'); process.exit(0); }

const upd = await fetch(
  `${URL}/rest/v1/club_interests?email=ilike.${encodeURIComponent(OLD)}`,
  {
    method: 'PATCH',
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: JSON.stringify({ email: NEW }),
  }
);
const result = await upd.json();
console.log('✅ Atualizado:', result.map(r => `${r.club_name} <${r.email}>`));
