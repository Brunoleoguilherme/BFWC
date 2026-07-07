// ════════════════════════════════════════════════════════════════
//  BFWC 2026 — Cliente PagBank/PagSeguro (REST API via fetch, sem SDK)
//  Checkout hospedado: cria o checkout e redireciona pro ambiente
//  de pagamento do PagBank. Confirmação via webhook + consulta do pedido.
//  Docs: https://developer.pagbank.com.br/reference/criar-checkout
// ════════════════════════════════════════════════════════════════

function apiBase() {
  return process.env.PAGBANK_ENV === 'production'
    ? 'https://api.pagseguro.com'
    : 'https://sandbox.api.pagseguro.com';
}

function token() {
  const t = process.env.PAGBANK_TOKEN;
  if (!t) throw new Error('PAGBANK_TOKEN ausente no ambiente');
  return t;
}

async function pagbankRequest(method, path, body) {
  const res = await fetch(`${apiBase()}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token()}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error_messages?.map?.((e) => e.description || e.error).join('; ')
      || data?.message || `PagBank HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

/**
 * Cria um checkout hospedado.
 * O retorno traz links[]; o link com rel "PAY" é a URL do checkout.
 */
export async function createCheckout(checkout) {
  const data = await pagbankRequest('POST', '/checkouts', checkout);
  const payLink = (data.links || []).find((l) => (l.rel || '').toUpperCase() === 'PAY')?.href || null;
  return { ...data, pay_url: payLink };
}

/** Consulta um pedido (order) — usado pelo webhook pra confirmar o pagamento. */
export function getOrder(orderId) {
  return pagbankRequest('GET', `/orders/${orderId}`);
}

/** Consulta um checkout pelo id. */
export function getCheckout(checkoutId) {
  return pagbankRequest('GET', `/checkouts/${checkoutId}`);
}

// ────────────────────────────────────────────────────────────────
//  Checkout clássico (v2 / "Pagamento via Formulário HTML")
//  Já habilitado em toda conta PagBank — não exige allowlist.
//  Usa e-mail da conta + token. Resposta em XML.
// ────────────────────────────────────────────────────────────────

const LEGACY_WS = 'https://ws.pagseguro.uol.com.br';
const LEGACY_PAY = 'https://pagseguro.uol.com.br/v2/checkout/payment.html';

function legacyCreds() {
  const email = process.env.PAGBANK_EMAIL;
  if (!email) throw new Error('PAGBANK_EMAIL ausente no ambiente (e-mail da conta PagBank)');
  return { email, token: token() };
}

function xmlTag(xml, tag) {
  const m = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
  return m ? m[1].trim() : null;
}

/**
 * Cria um checkout clássico. Retorna { code, pay_url }.
 * amountCents em centavos; reference = id do time.
 */
export async function createLegacyCheckout({ reference, description, amountCents, redirectUrl, notificationUrl }) {
  const { email, token: tk } = legacyCreds();
  const params = new URLSearchParams({
    email,
    token: tk,
    currency: 'BRL',
    itemId1: '1',
    itemDescription1: description.slice(0, 100),
    itemAmount1: (amountCents / 100).toFixed(2),
    itemQuantity1: '1',
    reference: String(reference),
    redirectURL: redirectUrl,
    notificationURL: notificationUrl,
    acceptPaymentMethodGroup: 'CREDIT_CARD',
    maxInstallmentNoInterest: '3', // até 3x sem juros (custo do parcelamento absorvido)
  });
  const res = await fetch(`${LEGACY_WS}/v2/checkout?${new URLSearchParams({ email, token: tk })}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
    body: params.toString(),
    cache: 'no-store',
  });
  const xml = await res.text();
  if (!res.ok) {
    const err = xmlTag(xml, 'message') || `PagBank legado HTTP ${res.status}`;
    throw new Error(err);
  }
  const code = xmlTag(xml, 'code');
  if (!code) throw new Error('PagBank legado não retornou o código do checkout.');
  return { code, pay_url: `${LEGACY_PAY}?code=${code}` };
}

/**
 * Consulta uma notificação de transação do checkout clássico.
 * Retorna { status, reference, grossAmountCents, transactionCode }.
 * Status: 1 aguardando · 2 em análise · 3 paga · 4 disponível · 7 cancelada
 */
export async function getLegacyNotification(notificationCode) {
  const { email, token: tk } = legacyCreds();
  const res = await fetch(
    `${LEGACY_WS}/v3/transactions/notifications/${notificationCode}?${new URLSearchParams({ email, token: tk })}`,
    { cache: 'no-store' }
  );
  const xml = await res.text();
  if (!res.ok) throw new Error(xmlTag(xml, 'message') || `PagBank legado HTTP ${res.status}`);
  return {
    status: parseInt(xmlTag(xml, 'status') || '0', 10),
    reference: xmlTag(xml, 'reference'),
    grossAmountCents: Math.round(parseFloat(xmlTag(xml, 'grossAmount') || '0') * 100),
    transactionCode: xmlTag(xml, 'code'),
  };
}
