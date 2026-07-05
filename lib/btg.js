// ════════════════════════════════════════════════════════════════
//  BFWC 2026 — Pix via BTG Pactual Empresas
//  Docs: https://developers.empresas.btgpactual.com
//  Env:  BTG_ENV=sandbox|production · BTG_CLIENT_ID · BTG_CLIENT_SECRET
//        BTG_COMPANY_ID (CNPJ, só números) · BTG_PIX_KEY
//  Os ids de cobrança são gravados com prefixo "btg:" para conviver
//  com cobranças antigas da Cora na mesma coluna (cora_invoice_id).
// ════════════════════════════════════════════════════════════════

const SCOPE = 'openid empresas.btgpactual.com/pix-cash-in';

function bases() {
  const sandbox = (process.env.BTG_ENV || 'production') !== 'production';
  return sandbox
    ? { id: 'https://id.sandbox.btgpactual.com', api: 'https://api.sandbox.empresas.btgpactual.com' }
    : { id: 'https://id.btgpactual.com', api: 'https://api.empresas.btgpactual.com' };
}

function companyId() {
  // Sandbox usa a empresa dedicada do ambiente (doc: docs/sandbox)
  if ((process.env.BTG_ENV || 'production') !== 'production') return '30306294000145';
  const cnpj = String(process.env.BTG_COMPANY_ID || '').replace(/\D/g, '');
  if (!cnpj) throw new Error('BTG_COMPANY_ID (CNPJ) não configurado');
  return cnpj;
}

let tokenCache = { token: null, exp: 0 };

export async function getBtgToken() {
  if (tokenCache.token && Date.now() < tokenCache.exp - 60_000) return tokenCache.token;
  const { id } = bases();
  const clientId = process.env.BTG_CLIENT_ID;
  const clientSecret = process.env.BTG_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error('BTG_CLIENT_ID/BTG_CLIENT_SECRET não configurados');
  const res = await fetch(`${id}/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ grant_type: 'client_credentials', scope: SCOPE }),
    cache: 'no-store',
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.access_token) {
    throw new Error(`Falha no token do BTG (${res.status}): ${JSON.stringify(json).slice(0, 300)}`);
  }
  tokenCache = { token: json.access_token, exp: Date.now() + (json.expires_in ? json.expires_in * 1000 : 300_000) };
  return tokenCache.token;
}

/**
 * Cria uma cobrança Pix dinâmica (QR Code + copia e cola).
 * Retorna { id: "btg:<uuid>", txId, status, emv, qrcodeUrl }.
 */
export async function createBtgPixCharge({ code, customer, amountCents, serviceName, expiresInSeconds }) {
  const token = await getBtgToken();
  const { api } = bases();
  const pixKey = process.env.BTG_PIX_KEY;
  if (!pixKey) throw new Error('BTG_PIX_KEY não configurada');

  const payerTaxId = customer?.document?.identity || null;
  const body = {
    pixKey,
    expiresIn: Math.max(3600, parseInt(expiresInSeconds, 10) || 60 * 60 * 24 * 30), // padrão: 30 dias
    amount: { original: Math.round(amountCents) / 100, allowCustomerChangeValue: false },
    displayText: String(serviceName || 'Inscricao BFWC 2026').slice(0, 40),
    ...(customer?.name ? { payer: { name: String(customer.name).slice(0, 100), ...(payerTaxId ? { taxId: payerTaxId } : {}) } } : {}),
    tags: { code: String(code || '') },
  };

  const res = await fetch(`${api}/v1/companies/${companyId()}/pix-cash-in/instant-collections`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.emv) {
    throw new Error(`Falha ao criar cobrança Pix no BTG (${res.status}): ${JSON.stringify(json).slice(0, 300)}`);
  }
  return {
    id: `btg:${json.id}`,
    txId: json.txId,
    status: json.status,
    emv: json.emv,
    qrcodeUrl: json.location?.url || null,
  };
}

/** Lista as cobranças do período (janela padrão: últimos 120 dias). */
export async function listBtgCollections({ days = 120 } = {}) {
  const token = await getBtgToken();
  const { api } = bases();
  const fmt = (d) => d.toISOString().slice(0, 10);
  const now = new Date();
  const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const url = `${api}/v1/companies/${companyId()}/pix-cash-in/instant-collections?initialDate=${fmt(from)}&finalDate=${fmt(now)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Falha ao consultar cobranças no BTG (${res.status}): ${JSON.stringify(json).slice(0, 300)}`);
  }
  return json.data || [];
}

/** Consulta uma cobrança pelo id (aceita com ou sem o prefixo "btg:"). */
export async function getBtgCollection(id) {
  const clean = String(id || '').replace(/^btg:/, '');
  const list = await listBtgCollections();
  return list.find((c) => c.id === clean) || null;
}

export function isBtgCollectionPaid(col) {
  if (!col) return false;
  return String(col.status || '').toUpperCase() === 'PAID' || (col.paymentInfo?.paidAmount ?? 0) > 0;
}

/** true quando o BTG é o provedor de Pix ativo. */
export function btgEnabled() {
  return (process.env.PIX_PROVIDER || 'cora').toLowerCase() === 'btg';
}
