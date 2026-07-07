'use client';

import { useEffect } from 'react';

// Registra o service worker mínimo do PWA (sem cache)
export default function SwRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);
  return null;
}
