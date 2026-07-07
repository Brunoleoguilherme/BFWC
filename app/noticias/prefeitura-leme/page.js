import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, CalendarDays, Tag } from 'lucide-react';
import '../noticia.css';

export const metadata = {
  title: 'Prefeitura de Leme é apoiadora oficial do BFWC 2026 — Brasil Flag World Championship',
  description: 'A Prefeitura de Leme é apoiadora oficial do Brasil Flag World Championship 2026, o maior campeonato internacional de Flag Football já realizado no Brasil.',
};

export default function PrefeituraLemeNewsPage() {
  return (
    <main className="uaNewsHero">

      <Image
        src="/assets/local-1.jpg"
        alt="Complexo esportivo em Leme, SP"
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

        <div className="uaBadge">
          <Tag size={16} />
          APOIO OFICIAL
        </div>

        <h1 className="uaTitle">
          Prefeitura de Leme é apoiadora oficial do Brasil Flag World Championship 2026
        </h1>

        <div className="uaDate">
          <CalendarDays size={18} />
          6 de julho de 2026
        </div>

        <div className="uaLine" />

        <div className="uaText">
          <p>
            A cidade de Leme entra em campo com a gente! O Brasil Flag World
            Championship 2026 tem o orgulho de anunciar a Prefeitura de Leme como
            apoiadora oficial do evento — um passo importante para consolidar o
            município como palco do maior campeonato internacional de Flag
            Football já realizado no Brasil, entre os dias 30 de outubro e 2 de
            novembro de 2026, no Clube de Campo Empyreo, com equipes de vários
            países do mundo.
          </p>

          <div className="uaArtWrap">
            <Image
              src="/assets/noticia-prefeitura-leme.png"
              alt="A Prefeitura de Leme é apoiadora oficial do BFWC 2026"
              width={900}
              height={1125}
              className="uaArt"
            />
          </div>

          <p>
            A parceria envolve diretamente as Secretarias Municipais de Esportes
            e Lazer e de Cultura e Turismo, que trabalharão ao lado da organização
            para receber mais de 1.000 participantes diretos e um público estimado
            em mais de 3.000 visitantes durante os quatro dias de programação —
            com movimentação econômica projetada entre R$ 1 milhão e R$ 3 milhões
            para hotéis, restaurantes, comércio, transporte e serviços locais.
          </p>

          <p>
            Segundo o Prefeito Municipal de Leme, Claudemir Borges, "receber o
            Brasil Flag World Championship é um marco histórico para Leme. Estamos
            falando de um evento internacional, de uma modalidade que estará nos
            Jogos Olímpicos de Los Angeles 2028, escolhendo a nossa cidade como
            palco. Além da visibilidade, o campeonato movimenta nossa economia,
            gera oportunidades para o comércio, hotelaria e serviços, e deixa um
            legado esportivo e social para nossas crianças e jovens. Leme está de
            portas abertas para o mundo."
          </p>

          <p>
            Para o Secretário Municipal de Esportes e Lazer, Ricardo de Moraes
            Canata, o mais importante é o legado: "as oficinas e treinos abertos
            com atletas e técnicos do campeonato, a integração com as escolas e o
            incentivo à prática vão apresentar essa modalidade a centenas de
            crianças e adolescentes lemenses. É esporte de alto nível chegando à
            nossa cidade e, ao mesmo tempo, semente plantada para as futuras
            gerações de atletas."
          </p>

          <p>
            A Secretária Municipal de Cultura e Turismo, Patrícia Cunha, destaca o
            turismo de eventos: "mais de três mil visitantes circularão por Leme
            durante quatro dias, conhecendo nossa história, nossa hospitalidade e
            nossos atrativos. É uma vitrine extraordinária, e a Secretaria de
            Cultura e Turismo trabalhará junto à organização para que cada
            delegação e cada turista tenha a melhor experiência possível — e volte
            outras vezes."
          </p>

          <p>
            Além da competição, a parceria com a Prefeitura viabiliza ações de
            legado para a comunidade: clínicas esportivas, integração com escolas,
            capacitação de voluntários e iniciativas de incentivo à prática do
            Flag Football na região — benefícios que permanecem na cidade muito
            depois do apito final.
          </p>

          <p>
            A organização registra um agradecimento especial ao Prefeito
            Claudemir Borges, à Secretária de Cultura e Turismo Patrícia Cunha e
            ao Secretário de Esportes Ricardo de Moraes Canata pela parceria e
            por acreditarem nesse projeto.
          </p>

          <p>
            Juntos, estamos construindo algo histórico para o Flag Football no
            Brasil. 🇧🇷🏈
          </p>
        </div>

      </div>
    </main>
  );
}
