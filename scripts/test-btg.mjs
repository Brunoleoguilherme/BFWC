// Testa a integração BTG (token + criação de cobrança Pix) usando o .env.local.
// Uso: node scripts/test-btg.mjs
import fs from 'fs';
import path from 'path';

const envFile = path.join(process.cwd(), '.env.local');
for (const line of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
  if (m && !line.trim().startsWith('#')) process.env[m[1]] = m[2];
}

const sandbox = (process.env.BTG_ENV || 'production') !== 'production';
const ID_BASE = sandbox ? 'https://id.sandbox.btgpactual.com' : 'https://id.btgpactual.com';
const API_BASE = sandbox ? 'https://api.sandbox.empresas.btgpactual.com' : 'https://api.empresas.btgpactual.com';
const cnpj = sandbox ? '30306294000145' : String(process.env.BTG_COMPANY_ID || '').replace(/\D/g, ''); // sandbox usa a empresa dedicada do ambiente

console.log(`Ambiente: ${sandbox ? 'SANDBOX' : 'PRODUÇÃO'} · CNPJ ${cnpj}`);

// 1) Token
const tokenRes = await fetch(`${ID_BASE}/oauth2/token`, {
  method: 'POST',
  headers: {
    Authorization: `Basic ${Buffer.from(`${process.env.BTG_CLIENT_ID}:${process.env.BTG_CLIENT_SECRET}`).toString('base64')}`,
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: new URLSearchParams({ grant_type: 'client_credentials', scope: 'openid empresas.btgpactual.com/pix-cash-in' }),
});
const tokenJson = await tokenRes.json().catch(() => ({}));
if (!tokenRes.ok || !tokenJson.access_token) {
  console.error(`✕ Token FALHOU (${tokenRes.status}):`, JSON.stringify(tokenJson).slice(0, 400));
  process.exit(1);
}
console.log(`✓ Token OK (expira em ${tokenJson.expires_in}s)`);

// 2) Criar cobrança de R$ 5
const chargeRes = await fetch(`${API_BASE}/v1/companies/${cnpj}/pix-cash-in/instant-collections`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${tokenJson.access_token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    pixKey: process.env.BTG_PIX_KEY,
    expiresIn: 3600,
    amount: { original: 5.0, allowCustomerChangeValue: false },
    displayText: 'Teste BFWC',
    tags: { code: 'teste-integracao' },
  }),
});
const chargeJson = await chargeRes.json().catch(() => ({}));
if (!chargeRes.ok || !chargeJson.emv) {
  console.error(`✕ Cobrança FALHOU (${chargeRes.status}):`, JSON.stringify(chargeJson).slice(0, 600));
  process.exit(1);
}
console.log('✓ Cobrança criada!');
console.log('  id:  ', chargeJson.id);
console.log('  txId:', chargeJson.txId);
console.log('  emv: ', String(chargeJson.emv).slice(0, 60) + '...');
console.log('  QR:  ', chargeJson.location?.url || '(sem url)');

// 3) Listar cobranças (consulta usada na reconciliação)
const fmt = (d) => d.toISOString().slice(0, 10);
const now = new Date(); const from = new Date(now.getTime() - 7 * 864e5);
const listRes = await fetch(`${API_BASE}/v1/companies/${cnpj}/pix-cash-in/instant-collections?initialDate=${fmt(from)}&finalDate=${fmt(now)}`, {
  headers: { Authorization: `Bearer ${tokenJson.access_token}` },
});
const listJson = await listRes.json().catch(() => ({}));
console.log(listRes.ok ? `✓ Listagem OK (${(listJson.data || []).length} cobrança(s) no período)` : `✕ Listagem falhou (${listRes.status})`);
console.log('\nTudo certo — integração BTG validada.');
