// Sonda da API de Pedidos do PagBank.
// Cria um pedido de R$ 1 com QR Code Pix (ninguém paga; expira sozinho)
// só pra verificar se a conta tem o produto liberado.
// Rodar:  node scripts/probe-pagbank.mjs
import { readFileSync } from 'fs';

const env = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
const token = env.match(/PAGBANK_TOKEN=(\S+)/)?.[1];
if (!token || token.startsWith('cole_aqui')) {
  console.error('PAGBANK_TOKEN não encontrado no .env.local');
  process.exit(1);
}

const res = await fetch('https://api.pagseguro.com/orders', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    reference_id: 'probe-orders-api',
    customer: { name: 'Teste Integracao', email: 'bruno@brasilsportsbusiness.com' },
    items: [{ name: 'Probe', quantity: 1, unit_amount: 100 }],
    qr_codes: [{ amount: { value: 100 } }],
  }),
});

const data = await res.json().catch(() => ({}));
console.log('HTTP', res.status);

if (res.ok && data.id) {
  console.log('✅ API DE PEDIDOS LIBERADA! Pedido criado:', data.id);
  console.log('   (pode ignorar — o QR de R$ 1 expira sozinho)');
} else {
  console.log('❌ Resposta:', JSON.stringify(data, null, 2).slice(0, 800));
}
