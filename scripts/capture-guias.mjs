// Captura telas do portal (v2, localhost) para os guias ilustrados — PT/EN/ES.
// Uso:  npm i -D puppeteer-core   (uma vez)
//       node scripts/capture-guias.mjs [porta]
// Saída: guias/src/img/_captures/<lang>-<tela>.png (página inteira)
// Requer: dev server rodando e guias/src/_captures/session.json (sessão do time de teste).
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
if (!chrome) { console.error('Chrome não encontrado'); process.exit(1); }

const LANGS = {
  pt: { tabPay: 'Pagamento', tabAth: 'Atletas', card: 'Cartão de crédito', addAth: '+ Atleta' },
  en: { tabPay: 'Payment', tabAth: 'Athletes', card: 'Credit card', addAth: '+ Athlete' },
  es: { tabPay: 'Pago', tabAth: 'Atletas', card: 'Tarjeta de crédito', addAth: '+ Atleta' },
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function clickByText(page, text) {
  const ok = await page.evaluate((t) => {
    const els = [...document.querySelectorAll('button, [role="button"], a, div')];
    // menor elemento cujo texto contém t
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
        // título grande do clube → "Time"; demais ocorrências (roster) → exemplo
        const fs = parseFloat(getComputedStyle(n.parentElement).fontSize || '0');
        n.nodeValue = n.nodeValue.replaceAll('Bruno Guilherme', fs >= 24 ? 'Time' : 'Atleta Exemplo');
      }
      if (/brunoleoguilherme|bruno@/i.test(n.nodeValue)) n.nodeValue = 'atleta@clube.com';
      if (n.nodeValue.trim() === 'BG') n.nodeValue = 'T';
      if (n.nodeValue.trim() === 'Bruni') n.nodeValue = 'Contato';
    }
  });
}

async function shot(page, name) {
  await sleep(400);
  await anonimizar(page);          // logo antes do screenshot (React pode re-renderizar)
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: true });
  console.log('  ✓', name);
}

const browser = await puppeteer.launch({ executablePath: chrome, headless: 'new', args: ['--window-size=1298,1000'] });
fs.mkdirSync(OUT, { recursive: true });

for (const [lang, L] of Object.entries(LANGS)) {
  console.log('──', lang.toUpperCase());
  const page = await browser.newPage();
  await page.setViewport({ width: 1278, height: 910, deviceScaleFactor: 1 });
  await page.goto(`${BASE}/portal/times/login`, { waitUntil: 'networkidle0' });
  await page.evaluate((sess, lg) => {
    sessionStorage.setItem('bfwc_team_session', JSON.stringify(sess));
    localStorage.setItem('bfwc_lang', lg);
    localStorage.setItem('bfwc_language', lg);
  }, SESSION, lang);
  await page.goto(`${BASE}/portal/times`, { waitUntil: 'networkidle0' });
  await sleep(1500);

  // ── Aba Pagamento (Pix é o padrão)
  await clickByText(page, L.tabPay);
  await sleep(1500);
  await shot(page, `${lang}-pagamento-pix`);

  // ── Cartão de crédito selecionado
  await clickByText(page, L.card);
  await sleep(800);
  await shot(page, `${lang}-pagamento-cartao`);

  // ── Aba Atletas
  await clickByText(page, L.tabAth);
  await sleep(1800);
  await shot(page, `${lang}-atletas`);

  // ── Formulário + Atleta aberto
  await clickByText(page, L.addAth);
  await sleep(800);
  await shot(page, `${lang}-atletas-form`);

  await page.close();
}

await browser.close();
console.log('Concluído →', OUT);
