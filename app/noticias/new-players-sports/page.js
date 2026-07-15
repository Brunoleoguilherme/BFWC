import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, CalendarDays, Tag } from 'lucide-react';
import '../noticia.css';

export const metadata = {
  title: 'New Players Sports é a nova patrocinadora oficial do BFWC 2026',
  description: 'A New Players Sports é a nova patrocinadora oficial do Brasil Flag World Championship 2026.',
};

export default function NewPlayersNewsPage() {
  return (
    <main className="uaNewsHero">

      <Image
        src="/assets/rio-news-bg.jpg"
        alt="Rio de Janeiro"
        fill
        priority
        className="uaHeroBg"
      />

      <div className="uaOverlay" />

      <div className="uaContent">

        <Link href="/site/noticias" className="uaBackBtn">
          <ArrowLeft size={18} />
          Voltar para notícias
        </Link>

        <div style={{ margin: '12px 0 24px' }}>
          <Image
            src="/assets/new-players.png"
            alt="New Players Sports"
            width={440}
            height={248}
            priority
            style={{ width: 'min(420px, 82%)', height: 'auto', filter: 'drop-shadow(0 10px 30px rgba(0,0,0,.45))' }}
          />
        </div>

        <div className="uaBadge">
          <Tag size={16} />
          ANÚNCIO OFICIAL
        </div>

        <h1 className="uaTitle">
          New Players Sports é a nova patrocinadora oficial do Brasil Flag World Championship 2026
        </h1>

        <div className="uaDate">
          <CalendarDays size={18} />
          15 de julho de 2026
        </div>

        <div className="uaLine" />

        <div className="uaText">
          <p>
            O Brasil Flag World Championship tem a satisfação de anunciar a{' '}
            <strong>New Players Sports</strong> como nova <strong>patrocinadora
            oficial</strong> do evento.
          </p>

          <p>
            A chegada da New Players Sports reforça o time de marcas que apoiam o
            maior projeto internacional de flag football da América Latina e
            fortalece o posicionamento global do campeonato.
          </p>

          <p>
            A parceria amplia as experiências oferecidas a atletas, clubes e
            torcedores ao longo da competição, somando-se aos parceiros que
            constroem esta edição histórica.
          </p>

          <p>
            O Brasil Flag World Championship 2026 será realizado em Leme/SP, de{' '}
            <strong>31 de outubro a 2 de novembro de 2026</strong>, reunindo
            delegações nacionais e internacionais em uma celebração do flag
            football mundial.
          </p>

          <p>
            Seja bem-vinda, New Players Sports. Nos vemos em Leme. 🏈
          </p>
        </div>

      </div>
    </main>
  );
}
