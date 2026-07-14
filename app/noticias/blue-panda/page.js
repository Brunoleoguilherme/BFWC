import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, CalendarDays, Tag } from 'lucide-react';
import '../noticia.css';

export const metadata = {
  title: 'Blue Panda Travel é a agência de viagem oficial do BFWC 2026',
  description: 'A Blue Panda Travel é a agência de viagem oficial do Brasil Flag World Championship 2026, buscando as melhores condições possíveis de hospedagem e passagens para as equipes.',
};

export default function BluePandaNewsPage() {
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
            src="/assets/blue-panda.png"
            alt="Blue Panda Travel"
            width={360}
            height={360}
            priority
            style={{ width: 'min(340px, 80%)', height: 'auto', filter: 'drop-shadow(0 10px 30px rgba(0,0,0,.45))' }}
          />
        </div>

        <div className="uaBadge">
          <Tag size={16} />
          ANÚNCIO OFICIAL
        </div>

        <h1 className="uaTitle">
          Blue Panda Travel é a agência de viagem oficial do Brasil Flag World Championship 2026
        </h1>

        <div className="uaDate">
          <CalendarDays size={18} />
          14 de julho de 2026
        </div>

        <div className="uaLine" />

        <div className="uaText">
          <p>
            O Brasil Flag World Championship tem o prazer de anunciar a
            <strong> Blue Panda Travel</strong> como agência de viagem oficial do evento.
          </p>

          <p>
            A Blue Panda Travel será a parceira responsável por apoiar as equipes
            e delegações na organização da viagem até Leme/SP, trabalhando para
            buscar <strong>as melhores condições possíveis de hospedagem e
            passagens</strong> para as equipes confirmadas no campeonato.
          </p>

          <p>
            A agência entrará em contato com as equipes confirmadas para apresentar
            as melhores opções de hospedagem e deslocamento durante os dias de
            competição, de <strong>31 de outubro a 2 de novembro de 2026</strong>.
          </p>

          <p>
            Com atletas e delegações de vários países a caminho de Leme, a parceria
            garante que cada equipe possa focar no que importa dentro de campo, com
            o suporte de quem entende de viagem e logística esportiva.
          </p>

          <p>
            Dúvidas sobre viagem, hospedagem e traslados podem ser enviadas para{' '}
            <a href="mailto:contato@bluepandatravel.com.br" style={{ color: '#f4ff00', fontWeight: 700 }}>contato@bluepandatravel.com.br</a>.
          </p>

          <p>
            Seja bem-vinda, Blue Panda Travel. Nos vemos em Leme. 🏈
          </p>
        </div>

      </div>
    </main>
  );
}
