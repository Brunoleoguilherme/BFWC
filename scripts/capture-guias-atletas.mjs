// Captura telas do PORTAL DO ATLETA (produção) para o guia ilustrado — PT.
// Uso:  npm i -D puppeteer-core   (uma vez, se ainda não tiver)
//       node scripts/capture-guias-atletas.mjs
// Config: guias/src/_captures-atletas/atletas.json  ->  { "base": "...", "adultId": "...", "minorId": "..." }
//   - adultId: id de uma conta de atleta de TESTE (ideal SEM foto/documento enviados)
//   - minorId: id de uma conta de atleta de TESTE MENOR de idade (para a tela de autorização)
// Saída: guias/src/img/_captures-atletas/*.png (1278x910, fullPage)
import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer-core';

const ROOT = process.cwd();
const CFG_DIR = path.join(ROOT, 'guias', 'src', '_captures-atletas');
const OUT = path.join(ROOT, 'guias', 'src', 'img', '_captures-atletas');
const cfg = JSON.parse(fs.readFileSync(path.join(CFG_DIR, 'atletas.json'), 'utf8'));
const BASE = (cfg.base || 'https://www.brasilflagworldchampionship.com').replace(/\/$/, '');

const CHROME_PATHS = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  (process.env.LOCALAPPDATA || '') + '\\Google\\Chrome\\Application\\chrome.exe',
];
const chrome = CHROME_PATHS.find((p) => p && fs.existsSync(p));
if (!chrome) { console.error('Chrome nao encontrado'); process.exit(1); }

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function clickByText(page, text) {
  return page.evaluate((t) => {
    const els = [...document.querySelectorAll('button,[role="button"],a,div,span')];
    const hits = els.filter((e) => (e.innerText || '').trim() === t || (e.innerText || '').includes(t))
                    .sort((a, b) => (a.innerText || '').length - (b.innerText || '').length);
    if (hits[0]) { hits[0].click(); return true; }
    return false;
  }, text);
}

async function anon(page) {
  await page.evaluate(() => {
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = w.nextNode())) {
      const v = n.nodeValue;
      if (/@/.test(v) && /\./.test(v) && v.length < 60 && /[a-z]@/i.test(v)) n.nodeValue = 'atleta@clube.com';
    }
  });
}

async function shot(page, name) {
  await sleep(500); await anon(page);
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: true });
  console.log('  OK', name);
}

async function restore(page, id) {
  await page.goto(`${BASE}/portal/atletas/login`, { waitUntil: 'networkidle0' });
  await page.evaluate((aid) => {
    sessionStorage.setItem('bfwc_athlete_session', JSON.stringify({ id: aid }));
    localStorage.setItem('bfwc_lang', 'pt'); localStorage.setItem('bfwc_language', 'pt');
  }, id);
  await page.goto(`${BASE}/portal/atletas`, { waitUntil: 'networkidle0' });
  await sleep(2000);
}

const browser = await puppeteer.launch({ executablePath: chrome, headless: 'new', args: ['--window-size=1298,1000'] });
fs.mkdirSync(OUT, { recursive: true });
const page = await browser.newPage();
await page.setViewport({ width: 1278, height: 910, deviceScaleFactor: 1 });

// ── PÚBLICAS ─────────────────────────────────────────────
console.log('-- publicas');
await page.goto(`${BASE}/portal/atletas/cadastro`, { waitUntil: 'networkidle0' }); await sleep(1200);
await shot(page, '01-idioma');
await clickByText(page, 'Entrar em Português'); await sleep(1600);
await shot(page, '02-cadastro-dados');
await page.evaluate(() => window.scrollTo(0, 700)); await sleep(500);
await shot(page, '03-cadastro-foto');
await page.goto(`${BASE}/portal/atletas/login`, { waitUntil: 'networkidle0' }); await sleep(1200);
await shot(page, '04-login');

// ── LOGADAS (adulto) ────────────────────────────────────
if (cfg.adultId) {
  console.log('-- perfil (adulto)');
  await restore(page, cfg.adultId);
  await shot(page, '05-perfil-topo');
  await page.evaluate(() => window.scrollTo(0, 520)); await sleep(500);
  await shot(page, '06-documento');
  await page.evaluate(() => window.scrollTo(0, 1050)); await sleep(500);
  await shot(page, '07-perfil-baixo');
} else { console.log('  (sem adultId — pulei telas logadas)'); }

// ── LOGADAS (menor) — tela de autorização do responsável ─
if (cfg.minorId) {
  console.log('-- autorizacao (menor)');
  await restore(page, cfg.minorId);
  await page.evaluate(() => window.scrollTo(0, 780)); await sleep(500);
  await shot(page, '08-autorizacao-responsavel');
} else { console.log('  (sem minorId — a tela de autorizacao ficara sem print)'); }

await browser.close();
console.log('Concluido ->', OUT);
