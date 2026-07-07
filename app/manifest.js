// PWA manifest — gerado pelo Next em /manifest.webmanifest
export default function manifest() {
  return {
    name: 'Brasil Flag World Championship 2026',
    short_name: 'BFWC 2026',
    description: 'O maior campeonato internacional de clubes de Flag Football 5x5 do Brasil — 30/10 a 02/11/2026, Leme/SP.',
    start_url: '/portal?source=pwa',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#031020',
    theme_color: '#031020',
    lang: 'pt-BR',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
