// ════════════════════════════════════════════════════════════════
//  BFWC 2026 — Cliente Mercado Pago (REST API via fetch, sem SDK)
//  Checkout Pro: cria a preferência e redireciona pro checkout
//  hospedado do MP. Confirmação via webhook + consulta do pagamento.
// ════════════════════════════════════════════════════════════════

const MP_API = 'https://api.mercadopago.com';

function accessToken() {
  const t = process.env.MP_ACCESS_TOKEN;
  if (!t) throw new Error('MP_ACCESS_TOKEN ausente no ambiente');
  return t;
}

async function mpRequest(method, path, body) {
  const res = await fetch(`${MP_API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken()}`,
      'Content-Type': 'application/json',
      // Idempotência exigida pelo MP em POSTs
      ...(method === 'POST' ? { 'X-Idempotency-Key': crypto.randomUUID() } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.message || data?.error || `Mercado Pago HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

/**
 * Cria uma preferência do Checkout Pro.
 * Retorna { id, init_point } — init_point é a URL do checkout hospedado.
 * https://api.mercadopago.com/checkout/preferences
 */
export function createPreference(preference) {
  return mpRequest('POST', '/checkout/preferences', preference);
}

/** Consulta um pagamento pelo id (usado pelo webhook). */
export function getPayment(paymentId) {
  return mpRequest('GET', `/v1/payments/${paymentId}`);
}

/** Consulta uma merchant order (agrupa pagamentos de uma preferência). */
export function getMerchantOrder(orderId) {
  return mpRequest('GET', `/merchant_orders/${orderId}`);
}
