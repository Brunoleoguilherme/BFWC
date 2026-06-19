import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, CalendarDays, Tag } from 'lucide-react';

export default function UnderArmourNewsPage() {
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

        <Link href="/#news" className="uaBackBtn">
          <ArrowLeft size={18} />
          Voltar para notícias
        </Link>

        <div className="uaBadge">
          <Tag size={16} />
          ANÚNCIO OFICIAL
        </div>

        <h1 className="uaTitle">
          Under Armour é a patrocinadora oficial do Brasil Flag World Championship 2026
        </h1>

        <div className="uaDate">
          <CalendarDays size={18} />
          18 de maio de 2026
        </div>

        <div className="uaLine" />

        <div className="uaText">
          <p>
            O Brasil Flag World Championship tem o orgulho de anunciar a chegada da
            Under Armour como patrocinadora oficial do evento.
          </p>

          <p>
            Reconhecida mundialmente por sua conexão com atletas de alta
            performance, inovação esportiva e tecnologia aplicada ao esporte,
            a marca passa agora a integrar oficialmente o maior projeto
            internacional de flag football da América Latina.
          </p>

          <p>
            A parceria reforça o posicionamento global do campeonato e amplia
            a conexão entre esporte, lifestyle, cultura, entretenimento e
            experiência premium para atletas, clubes e fãs do mundo inteiro.
          </p>

          <p>
            O Brasil Flag World Championship 2026 será realizado em Leme, SP,
            e reunirá delegações nacionais e internacionais em uma celebração
            histórica do flag football mundial.
          </p>

          <p>
            A entrada da Under Armour representa mais um passo importante na
            consolidação do evento como uma plataforma internacional de esporte,
            turismo, marcas e experiências globais.
          </p>

          <p>
            Juntos, estamos construindo um novo capítulo para o flag football no Brasil.
          </p>
        </div>

        <div className="uaLogoWrap">
          <Image
            src="/assets/underarmour-white.png"
            alt="Under Armour"
            width={420}
            height={180}
            className="uaLogo"
          />
        </div>

      </div>
    </main>
  );
}