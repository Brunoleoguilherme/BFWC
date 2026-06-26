// ════════════════════════════════════════════════════════════════
//  BFWC 2026 — Cliente Stripe (REST API via fetch, sem SDK)
//  Mantém zero dependências. Funciona em qualquer runtime Node.
// ════════════════════════════════════════════════════════════════
import { createHmac, timingSafeEqual } from 'crypto';

const STRIPE_API = 'https://api.stripe.com/v1';

function secretKey() {
  const k = process.env.STRIPE_SECRET_KEY;
  if (!k) throw new Error('STRIPE_SECRET_KEY ausente no ambiente');
  return k;
}

/**
 * Codifica um objeto (com aninhamento) no formato form-urlencoded que a Stripe espera.
 * Ex: { line_items: [{ price_data: { currency: 'brl' } }] }
 *   → line_items[0][price_data][currency]=brl
 */
function encodeForm(obj, prefix = '', out = []) {
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null) continue;
    const k = prefix ? `${prefix}[${key}]` : key;
    if (Array.isArray(value)) {
      value.forEach((item, i) => {
        if (item !== null && typeof item === 'object') encodeForm(item, `${k}[${i}]`, out);
        else out.push(`${encodeURIComponent(`${k}[${i}]`)}=${encodeURIComponent(item)}`);
      });
    } else if (value !== null && typeof value === 'object') {
      encodeForm(value, k, out);
    } else {
      out.push(`${encodeURIComponent(k)}=${encodeURIComponent(value)}`);
    }
  }
  return out;
}

async function stripeRequest(path, params) {
  const res = await fetch(`${STRIPE_API}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: encodeForm(params).join('&'),
  });
  const data = await res.json();
  if (!res.ok) {
    const msg = data?.error?.message || `Stripe API error (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

/** Cria uma Checkout Session hospedada (PIX + cartão). */
export function createCheckoutSession(params) {
  return stripeRequest('/checkout/sessions', params);
}

/**
 * Verifica a assinatura de um webhook da Stripe.
 * @param {string} payload  corpo bruto (string) da requisição
 * @param {string} sigHeader valor do header `stripe-signature`
 * @param {string} secret   o webhook signing secret (whsec_...)
 * @param {number} toleranceSec janela de tolerância (default 5 min)
 * @returns {object} o evento JSON, se válido. Lança erro caso contrário.
 */
export function constructWebhookEvent(payload, sigHeader, secret, toleranceSec = 300) {
  if (!sigHeader) throw new Error('Header stripe-signature ausente');
  if (!secret) throw new Error('STRIPE_WEBHOOK_SECRET ausente no ambiente');

  const parts = Object.fromEntries(
    sigHeader.split(',').map((p) => p.split('=').map((s) => s.trim()))
  );
  const timestamp = parts.t;
  const signature = parts.v1;
  if (!timestamp || !signature) throw new Error('Assinatura malformada');

  const expected = createHmac('sha256', secret)
    .update(`${timestamp}.${payload}`, 'utf8')
    .digest('hex');

  const a = Buffer.from(expected, 'hex');
  const b = Buffer.from(signature, 'hex');
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw new Error('Assinatura do webhook inválida');
  }

  const ageSec = Math.floor(Date.now() / 1000) - Number(timestamp);
  if (Math.abs(ageSec) > toleranceSec) {
    throw new Error('Timestamp do webhook fora da janela de tolerância');
  }

  return JSON.parse(payload);
}
