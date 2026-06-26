// ════════════════════════════════════════════════════════════════
//  BFWC 2026 — Cliente Cora (Pix via Integração Direta, mTLS)
//  A Cora autentica com certificado + private key (mutual TLS).
//  Usamos o módulo nativo `https` do Node (funciona no runtime Node da Vercel).
//
//  Variáveis de ambiente necessárias:
//    CORA_ENV            = "stage" | "production"   (default: stage)
//    CORA_CLIENT_ID      = seu client_id da Cora
//    CORA_CERT_BASE64    = conteúdo do certificate.pem em base64
//    CORA_KEY_BASE64     = conteúdo da private-key.key em base64
// ════════════════════════════════════════════════════════════════
import https from 'https';
import { randomUUID } from 'crypto';

function bases() {
  const env = (process.env.CORA_ENV || 'stage').toLowerCase();
  return env === 'production'
    ? { api: 'matls-clients.api.cora.com.br' }
    : { api: 'matls-clients.api.stage.cora.com.br' };
}

function credentials() {
  const clientId = process.env.CORA_CLIENT_ID;
  const certB64 = process.env.CORA_CERT_BASE64;
  const keyB64 = process.env.CORA_KEY_BASE64;
  if (!clientId || !certB64 || !keyB64) {
    throw new Error('Credenciais Cora ausentes (CORA_CLIENT_ID / CORA_CERT_BASE64 / CORA_KEY_BASE64)');
  }
  return {
    clientId,
    cert: Buffer.from(certB64, 'base64').toString('utf8'),
    key: Buffer.from(keyB64, 'base64').toString('utf8'),
  };
}

/**
 * Faz uma requisição HTTPS com mTLS (cert+key do cliente).
 * @returns {Promise<{status:number, json:any, raw:string}>}
 */
function mtlsRequest({ hostname, path, method = 'GET', headers = {}, body = null }) {
  const { cert, key } = credentials();
  return new Promise((resolve, reject) => {
    const req = https.request(
      { hostname, path, method, headers, cert, key, port: 443 },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          let json = null;
          try { json = data ? JSON.parse(data) : null; } catch { /* não-JSON */ }
          resolve({ status: res.statusCode, json, raw: data });
        });
      }
    );
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

// Cache simples do token em memória (válido por ~24h)
let _tokenCache = { token: null, expiresAt: 0 };

/** Obtém (ou reutiliza) um access token via client_credentials + mTLS. */
export async function getCoraToken() {
  const now = Date.now();
  if (_tokenCache.token && now < _tokenCache.expiresAt - 60_000) {
    return _tokenCache.token;
  }
  const { api } = bases();
  const { clientId } = credentials();
  const form = `grant_type=client_credentials&client_id=${encodeURIComponent(clientId)}`;

  const res = await mtlsRequest({
    hostname: api,
    path: '/token',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(form),
    },
    body: form,
  });

  if (res.status !== 200 || !res.json?.access_token) {
    throw new Error(`Falha ao autenticar na Cora (${res.status}): ${res.raw?.slice(0, 200)}`);
  }
  _tokenCache = {
    token: res.json.access_token,
    expiresAt: now + (res.json.expires_in || 86400) * 1000,
  };
  return _tokenCache.token;
}

/**
 * Cria uma cobrança Pix (QR Code) na Cora.
 * @param {object} p
 * @param {string} p.code          id do recurso no seu sistema (ex: team_id)
 * @param {object} p.customer      { name, email, document:{identity,type} }
 * @param {number} p.amountCents   valor total em centavos
 * @param {string} p.serviceName   descrição do serviço
 * @param {string} p.dueDate       'YYYY-MM-DD'
 * @returns {Promise<{id:string, status:string, emv:string, qrcodeUrl:string, raw:any}>}
 */
export async function createPixCharge({ code, customer, amountCents, serviceName, dueDate }) {
  const token = await getCoraToken();
  const { api } = bases();

  const payload = JSON.stringify({
    code,
    customer,
    services: [{ name: serviceName, amount: amountCents }],
    payment_terms: { due_date: dueDate },
    payment_forms: ['PIX'],
  });

  const res = await mtlsRequest({
    hostname: api,
    path: '/v2/invoices',
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': randomUUID(),
      'Content-Length': Buffer.byteLength(payload),
    },
    body: payload,
  });

  if (res.status >= 300 || !res.json?.id) {
    throw new Error(`Falha ao criar cobrança Pix na Cora (${res.status}): ${res.raw?.slice(0, 300)}`);
  }
  return {
    id: res.json.id,
    status: res.json.status,
    emv: res.json.pix?.emv || '',
    qrcodeUrl: res.json.pix?.qrcode || '',
    raw: res.json,
  };
}

/**
 * Registra um endpoint de webhook na Cora.
 * @param {object} p { url, resource='invoice', trigger='paid' }
 * @returns {Promise<object>} o endpoint criado ({ id, url, resource, trigger, active, ... })
 */
export async function registerEndpoint({ url, resource = 'invoice', trigger = 'paid' }) {
  const token = await getCoraToken();
  const { api } = bases();
  const payload = JSON.stringify({ url, resource, trigger });
  const res = await mtlsRequest({
    hostname: api,
    path: '/endpoints',
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': randomUUID(),
      'Content-Length': Buffer.byteLength(payload),
    },
    body: payload,
  });
  if (res.status >= 300 || !res.json?.id) {
    throw new Error(`Falha ao registrar webhook na Cora (${res.status}): ${res.raw?.slice(0, 300)}`);
  }
  return res.json;
}

/** Consulta os detalhes de uma cobrança/invoice na Cora (para confirmar pagamento). */
export async function getInvoice(invoiceId) {
  const token = await getCoraToken();
  const { api } = bases();
  const res = await mtlsRequest({
    hostname: api,
    path: `/v2/invoices/${encodeURIComponent(invoiceId)}`,
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status >= 300 || !res.json) {
    throw new Error(`Falha ao consultar invoice Cora (${res.status})`);
  }
  return res.json;
}
