/**
 * BFWC 2026 — Contagem de pré-inscritos por categoria (Sub-12 / Sub-15 e demais)
 * Uso: node scripts/pre-inscritos-categorias.mjs
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

const res = await fetch(
  `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/club_interests?select=club_name,country,category,athletes_sub15,athletes_sub12&status=neq.rejected&email=not.is.null&order=club_name`,
  { headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}` } }
);
const teams = await res.json();
if (!Array.isArray(teams)) { console.error('Erro:', JSON.stringify(teams)); process.exit(1); }

const has = (t, re) => re.test(t.category || '');
const CATS = [
  ['Masculino', /masc/i],
  ['Feminino', /fem/i],
  ['Sub-15', /sub[\s-]?15/i],
  ['Sub-12', /sub[\s-]?12/i],
];

console.log(`\n📋 ${teams.length} pré-inscritos (exceto rejeitados)\n`);
for (const [label, re] of CATS) {
  const list = teams.filter(t => has(t, re));
  console.log(`${label}: ${list.length} times`);
}

for (const [label, re] of [['Sub-15', /sub[\s-]?15/i], ['Sub-12', /sub[\s-]?12/i]]) {
  const list = teams.filter(t => has(t, re));
  console.log(`\n─── ${label} (${list.length}) ───`);
  list.forEach(t => {
    const n = label === 'Sub-15' ? t.athletes_sub15 : t.athletes_sub12;
    console.log(`  ${t.club_name} — ${t.country || '—'}${n ? ` (${n} atletas)` : ''}`);
  });
}
