import './globals.css';
import { Analytics } from '@vercel/analytics/next';

export const metadata = {
  title: 'Brasil Flag World Championship 2026',
  description: 'The world meets in Brazil for a premium international Flag Football championship.',
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
