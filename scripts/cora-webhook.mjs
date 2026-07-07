/**
 * BFWC 2026 — Gerencia o webhook de Pix pago na Cora (mTLS, direto da máquina local)
 *
 * Uso:
 *   node scripts/cora-webhook.mjs --list                 → lista endpoints registrados
 *   node scripts/cora-webhook.mjs --register             → registra o webhook de PRODUÇÃO (www)
 *   node scripts/cora-webhook.mjs --register --url=URL   → registra uma URL específica
 *   node scripts/cora-webhook.mjs --delete=ENDPOINT_ID   → remove um endpoint
 *
 * Requer no .env.local: CORA_ENV, CORA_CLIENT_ID, CORA_CERT_BASE64, CORA_KEY_BASE64
 */

import https from 'https';
import { randomUUID } from 'crypto';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// URL oficial de produção — sempre com www (o apex redireciona e a Cora não segue redirect)
const PROD_URL = 'https://www.brasilflagworldchampionship.com/api/payments/pix/webhook';

// ── .env.local ────────────────────────────────────────────────────
const env = {};
try {
  readFileSync(join(__dirname, '..', '.env.local'), 'utf8').split('\n').forEach(line => {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim();
  });
} catch { console.error('❌ .env.local não encontrado'); process.exit(1); }

const CORA_ENV = (env.CORA_ENV || 'stage').toLowerCase();
const API = CORA_ENV === 'production' ? 'matls-clients.api.cora.com.br' : 'matls-clients.api.stage.cora.com.br';
const CLIENT_ID = env.CORA_CLIENT_ID;
const CERT = env.CORA_CERT_BASE64 ? Buffer.from(env.CORA_CERT_BASE64, 'base64').toString('utf8') : null;
const KEY  = env.CORA_KEY_BASE64  ? Buffer.from(env.CORA_KEY_BASE64, 'base64').toString('utf8')  : null;

if (!CLIENT_ID || !CERT || !KEY) { console.error('❌ CORA_CLIENT_ID / CORA_CERT_BASE64 / CORA_KEY_BASE64 ausentes no .env.local'); process.exit(1); }

const args = process.argv.slice(2);
const isList = args.includes('--list');
const isRegister = args.includes('--register');
const delId = (args.find(a => a.startsWith('--delete=')) || '').replace('--delete=', '');
const urlArg = (args.find(a => a.startsWith('--url=')) || '').replace('--url=', '');

if (!isList && !isRegister && !delId) {
  console.log(`Uso:
  node scripts/cora-webhook.mjs --list
  node scripts/cora-webhook.mjs --register [--url=https://...]
  node scripts/cora-webhook.mjs --delete=ENDPOINT_ID

Ambiente Cora: ${CORA_ENV} (${API})`);
  process.exit(0);
}

function mtls({ path, method = 'GET', headers = {}, body = null }) {
  return new Promise((resolve, reject) => {
    const req = https.request({ hostname: API, path, method, headers, cert: CERT, key: KEY, port: 443 }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        let json = null;
        try { json = data ? JSON.parse(data) : null; } catch { /* não-JSON */ }
        resolve({ status: res.statusCode, json, raw: data });
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function token() {
  const form = `grant_type=client_credentials&client_id=${encodeURIComponent(CLIENT_ID)}`;
  const res = await mtls({ path: '/token', method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(form) }, body: form });
  if (res.status !== 200 || !res.json?.access_token) throw new Error(`Auth Cora falhou (${res.status}): ${res.raw?.slice(0, 200)}`);
  return res.json.access_token;
}

async function main() {
  console.log(`🔐 Autenticando na Cora (${CORA_ENV})...`);
  const t = await token();
  const auth = { Authorization: `Bearer ${t}` };

  if (isList) {
    const res = await mtls({ path: '/endpoints', headers: auth });
    if (res.status >= 300) throw new Error(`Falha ao listar (${res.status}): ${res.raw?.slice(0, 300)}`);
    const items = res.json?.items || res.json || [];
    const list = Array.isArray(items) ? items : [items];
    if (!list.length) { console.log('Nenhum endpoint registrado.'); return; }
    console.log(`\n📋 ${list.length} endpoint(s):`);
    list.forEach(e => console.log(`  id=${e.id}\n    url=${e.url}\n    resource=${e.resource} trigger=${e.trigger} active=${e.active}\n`));
    return;
  }

  if (delId) {
    const res = await mtls({ path: `/endpoints/${encodeURIComponent(delId)}`, method: 'DELETE', headers: auth });
    if (res.status >= 300) throw new Error(`Falha ao remover (${res.status}): ${res.raw?.slice(0, 300)}`);
    console.log(`✅ Endpoint ${delId} removido.`);
    return;
  }

  if (isRegister) {
    const url = urlArg || PROD_URL;
    if (!url.startsWith('https://www.')) {
      console.log(`⚠️  Atenção: URL sem www (${url}). A produção redireciona apex→www e a Cora pode não seguir redirect.`);
    }
    const payload = JSON.stringify({ url, resource: 'invoice', trigger: 'paid' });
    const res = await mtls({ path: '/endpoints', method: 'POST', headers: { ...auth, 'Content-Type': 'application/json', 'Idempotency-Key': randomUUID(), 'Content-Length': Buffer.byteLength(payload) }, body: payload });
    if (res.status >= 300 || !res.json?.id) throw new Error(`Falha ao registrar (${res.status}): ${res.raw?.slice(0, 300)}`);
    console.log(`✅ Webhook registrado:\n  id=${res.json.id}\n  url=${res.json.url}`);
  }
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
