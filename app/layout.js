import './globals.css';
import { Analytics } from '@vercel/analytics/next';

export const metadata = {
  title: 'Brasil Flag World Championship 2026',
  description: 'The world meets in Brazil for a premium international Flag Football championship.',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'BFWC 2026',
  },
};

export const viewport = {
  themeColor: '#031020',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" data-scroll-behavior="smooth">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
