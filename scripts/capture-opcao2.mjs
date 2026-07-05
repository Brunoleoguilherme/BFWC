// Captura a tela da Opção 2 (contador de atletas) sem alterar o banco:
// intercepta a resposta de payment-status para "desbloquear" a escolha
// de opção apenas no navegador headless.
// Uso: node scripts/capture-opcao2.mjs [porta]
import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer-core';

const PORT = process.argv[2] || '3003';
const BASE = `http://localhost:${PORT}`;
const ROOT = process.cwd();
const OUT = path.join(ROOT, 'guias', 'src', 'img', '_captures');
const SESSION = JSON.parse(fs.readFileSync(path.join(ROOT, 'guias', 'src', '_captures', 'session.json'), 'utf8'));

const CHROME_PATHS = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  (process.env.LOCALAPPDATA || '') + '\\Google\\Chrome\\Application\\chrome.exe',
];
const chrome = CHROME_PATHS.find((p) => p && fs.existsSync(p));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const LANGS = {
  pt: { tabPay: 'Pagamento', opt2: 'Opção 2' },
  en: { tabPay: 'Payment', opt2: 'Option 2' },
  es: { tabPay: 'Pago', opt2: 'Opción 2' },
};

async function clickByText(page, text) {
  const ok = await page.evaluate((t) => {
    const els = [...document.querySelectorAll('button, [role="button"], a, div')];
    const hits = els.filter((e) => (e.innerText || '').includes(t))
                    .sort((a, b) => (a.innerText || '').length - (b.innerText || '').length);
    if (hits[0]) { hits[0].click(); return true; }
    return false;
  }, text);
  if (!ok) console.warn('  ! não achei:', text);
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
      if (/brunoleoguilherme|bruno@/i.test(n.nodeValue)) n.nodeValue = 'atleta@clube.com';
      if (n.nodeValue.trim() === 'BG') n.nodeValue = 'T';
    }
  });
}

const browser = await puppeteer.launch({ executablePath: chrome, headless: 'new' });

for (const [lang, L] of Object.entries(LANGS)) {
  console.log('──', lang.toUpperCase());
  const page = await browser.newPage();
  await page.setViewport({ width: 1278, height: 910, deviceScaleFactor: 1 });
  // monkeypatch: payment-status volta sem opção definida (só no headless)
  await page.evaluateOnNewDocument(() => {
    const orig = window.fetch;
    window.fetch = async (...args) => {
      const res = await orig(...args);
      const url = String(args[0] || '');
      if (url.includes('payment-status')) {
        try {
          const data = await res.clone().json();
          data.payment_option = null;
          if (data.team) data.team.payment_option = null;
          return new Response(JSON.stringify(data), { status: res.status, headers: { 'Content-Type': 'application/json' } });
        } catch { return res; }
      }
      return res;
    };
  });
  await page.goto(`${BASE}/portal/times/login`, { waitUntil: 'networkidle0' });
  await page.evaluate((sess, lg) => {
    sessionStorage.setItem('bfwc_team_session', JSON.stringify(sess));
    localStorage.setItem('bfwc_lang', lg);
    localStorage.setItem('bfwc_language', lg);
  }, SESSION, lang);
  await page.goto(`${BASE}/portal/times`, { waitUntil: 'networkidle0' });
  await sleep(1500);
  await clickByText(page, L.tabPay);
  await sleep(1500);
  await anonimizar(page);
  await page.screenshot({ path: path.join(OUT, `${lang}-pagamento-escolha.png`), fullPage: true });
  console.log('  ✓', `${lang}-pagamento-escolha`);
  await page.mouse.click(857, 489);  // card "Opção 2 · Por atleta" (estado só do navegador)
  await sleep(1200);
  await anonimizar(page);
  await page.screenshot({ path: path.join(OUT, `${lang}-pagamento-opcao2.png`), fullPage: true });
  console.log('  ✓', `${lang}-pagamento-opcao2`);
  await page.close();
}

await browser.close();
console.log('Concluído →', OUT);
