// Captura as telas NOVAS da aba Pagamento (escolha por categoria, contador,
// à vista/parcelado, pix, cartão, status) sem alterar o banco:
// - payment-status é interceptado para simular time "zerado"
// - pix/create é interceptado para devolver um QR fictício
// Uso: node scripts/capture-pagamento.mjs [porta]   (padrão 3003)
import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer-core';

const PORT = process.argv[2] || '3003';
const BASE = `http://localhost:${PORT}`;
const ROOT = process.cwd();
const OUT = path.join(ROOT, 'guias', 'src', 'img', '_captures');
fs.mkdirSync(OUT, { recursive: true });
const SESSION = JSON.parse(fs.readFileSync(path.join(ROOT, 'guias', 'src', '_captures', 'session.json'), 'utf8'));

const CHROME_PATHS = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  (process.env.LOCALAPPDATA || '') + '\\Google\\Chrome\\Application\\chrome.exe',
];
const chrome = CHROME_PATHS.find((p) => p && fs.existsSync(p));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const LANGS = {
  pt: { tabPay: 'Pagamento', opt1: 'Opção 1', opt2: 'Opção 2', card: 'Cartão de crédito', pay: 'Pagar' },
  en: { tabPay: 'Payment',   opt1: 'Option 1', opt2: 'Option 2', card: 'Credit card', pay: 'Pay' },
  es: { tabPay: 'Pago',      opt1: 'Opción 1', opt2: 'Opción 2', card: 'Tarjeta de crédito', pay: 'Pagar' },
};

async function clickNth(page, text, nth = 0) {
  const ok = await page.evaluate((t, n) => {
    const q = t.toLowerCase();
    // botões na ordem do DOM (CSS uppercase muda o innerText → compara em minúsculas)
    const btns = [...document.querySelectorAll('button')]
      .filter((e) => (e.innerText || '').toLowerCase().includes(q));
    if (btns[n]) { btns[n].click(); return true; }
    // fallback: qualquer elemento clicável, preferindo o de texto mais curto
    const els = [...document.querySelectorAll('[role="button"], a, div')]
      .filter((e) => (e.innerText || '').toLowerCase().includes(q))
      .sort((a, b) => (a.innerText || '').length - (b.innerText || '').length);
    if (els[n]) { els[n].click(); return true; }
    return false;
  }, text, nth);
  if (!ok) console.warn(`  ! não achei (${nth}):`, text);
  return ok;
}

async function anonimizar(page) {
  await page.evaluate(() => {
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = w.nextNode())) {
      if (n.nodeValue.includes('Bruno Guilherme')) {
        const fs2 = parseFloat(getComputedStyle(n.parentElement).fontSize || '0');
        n.nodeValue = n.nodeValue.replaceAll('Bruno Guilherme', fs2 >= 24 ? 'Time' : 'Atleta Exemplo');
      }
      if (n.nodeValue.includes('Teste 01')) {
        const fs2 = parseFloat(getComputedStyle(n.parentElement).fontSize || '0');
        if (fs2 >= 24) n.nodeValue = n.nodeValue.replaceAll('Teste 01', 'Time');
      }
      if (/brunoleoguilherme|bruno@/i.test(n.nodeValue)) n.nodeValue = 'atleta@clube.com';
      if (n.nodeValue.trim() === 'BG') n.nodeValue = 'T';
    }
  });
}

async function shot(page, name) {
  await anonimizar(page);
  await page.screenshot({ path: path.join(OUT, name), fullPage: true });
  console.log('  ✓', name);
}

const FAKE_EMV = '00020126580014br.gov.bcb.pix0136aaaaaaaa-bbbb-cccc-dddd-eeeeffff00005204000053039865405100.005802BR5920BFWC 2026 EXEMPLO6009LEME SP62070503***6304ABCD';

const browser = await puppeteer.launch({ executablePath: chrome, headless: 'new' });

for (const [lang, L] of Object.entries(LANGS)) {
  console.log('──', lang.toUpperCase());
  const page = await browser.newPage();
  await page.setViewport({ width: 1278, height: 910, deviceScaleFactor: 1 });

  // monkeypatch: time "zerado" + pix fake (só no navegador headless)
  await page.evaluateOnNewDocument((fakeEmv) => {
    const orig = window.fetch;
    window.fetch = async (...args) => {
      const url = String(args[0] || '');
      if (url.includes('/api/payments/pix/create')) {
        return new Response(JSON.stringify({
          ok: true, number: 1, plan_size: 3, amount: 500,
          invoice_id: 'fake', emv: fakeEmv, qrcode_url: null,
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
      const res = await orig(...args);
      if (url.includes('payment-status')) {
        try {
          const data = await res.clone().json();
          Object.assign(data, {
            payment_option: null, payment_selection: null, payment_plan: null,
            payment_confirmed: false, amount_paid_cents: 0, total_cents: 0,
            remaining_cents: 0, fully_paid: false, installments: [],
            paid_count: 0, total_count: 0,
          });
          return new Response(JSON.stringify(data), { status: res.status, headers: { 'Content-Type': 'application/json' } });
        } catch { return res; }
      }
      return res;
    };
  }, FAKE_EMV);

  await page.goto(`${BASE}/portal/times/login`, { waitUntil: 'networkidle0' });
  await page.evaluate((sess, lg) => {
    sessionStorage.setItem('bfwc_team_session', JSON.stringify(sess));
    localStorage.setItem('bfwc_lang', lg);
    localStorage.setItem('bfwc_language', lg);
  }, SESSION, lang);
  await page.goto(`${BASE}/portal/times`, { waitUntil: 'networkidle0' });
  await sleep(1500);
  await clickNth(page, L.tabPay);
  await sleep(1500);

  // S1: escolha por categoria (nada selecionado)
  await shot(page, `${lang}-p11-escolha.png`);

  // S2: Opção 2 na 1ª categoria (contador)
  await clickNth(page, L.opt2, 0); await sleep(600);
  await shot(page, `${lang}-p21-contador.png`);

  // S3: 1ª categoria Opção 1 + 2ª categoria Opção 2 → seletor de plano + parcelas + resumo
  await clickNth(page, L.opt1, 0); await sleep(400);
  await clickNth(page, L.opt2, 1); await sleep(800);
  await shot(page, `${lang}-p23-planos.png`);

  // S4 (só PT): Pix com QR fictício
  if (lang === 'pt') {
    await clickNth(page, L.pay, 0); await sleep(1800);
    await shot(page, `${lang}-p13-pix.png`);
  }

  // S5: cartão
  await clickNth(page, L.card, 0); await sleep(800);
  await shot(page, `${lang}-p14-cartao.png`);

  await page.close();

  // S6: estado REAL (sem monkeypatch) — resumo com status confirmado
  const page2 = await browser.newPage();
  await page2.setViewport({ width: 1278, height: 910, deviceScaleFactor: 1 });
  await page2.goto(`${BASE}/portal/times/login`, { waitUntil: 'networkidle0' });
  await page2.evaluate((sess, lg) => {
    sessionStorage.setItem('bfwc_team_session', JSON.stringify(sess));
    localStorage.setItem('bfwc_lang', lg);
    localStorage.setItem('bfwc_language', lg);
  }, SESSION, lang);
  await page2.goto(`${BASE}/portal/times`, { waitUntil: 'networkidle0' });
  await sleep(1500);
  await clickNth(page2, L.tabPay);
  await sleep(2500);
  await anonimizar(page2);
  await page2.screenshot({ path: path.join(OUT, `${lang}-p15-status.png`), fullPage: true });
  console.log('  ✓', `${lang}-p15-status.png`);
  await page2.close();
}

await browser.close();
console.log('Concluído →', OUT);
