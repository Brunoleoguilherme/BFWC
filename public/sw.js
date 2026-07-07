// Service worker mínimo do BFWC 2026 — apenas para instalabilidade do PWA.
// NÃO faz cache de páginas nem de assets: todo request segue direto para a rede.
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Handler de fetch presente (critério de instalação), mas sem interceptar nada:
// não chamamos event.respondWith, então o navegador segue o fluxo normal de rede.
self.addEventListener('fetch', () => {});
