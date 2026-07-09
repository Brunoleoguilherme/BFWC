import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, CalendarDays, Tag } from 'lucide-react';
import '../noticia.css';

export const metadata = {
  title: 'Pré-inscrições do BFWC 2026 entram em suas horas decisivas — Brasil Flag World Championship',
  description: 'Pré-inscrições abertas até 01/07 nas categorias Sub-12 (misto), Sub-15 (misto), Adulto Masculino e Adulto Feminino. O evento acontece de 30 de outubro a 2 de novembro de 2026, no Clube de Campo Empyreo, em Leme, SP.',
};

export default function PreInscricoesNewsPage() {
  return (
    <main className="uaNewsHero">

      <Image
        src="/assets/hero-rio-athletes.png"
        alt="Atletas de Flag Football"
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
          INSCRIÇÕES
        </div>

        <h1 className="uaTitle">
          Pré-inscrições do BFWC 2026 entram em suas horas decisivas
        </h1>

        <div className="uaDate">
          <CalendarDays size={18} />
          1º de julho de 2026
        </div>

        <div className="uaLine" />

        <div className="uaText">
          <p>
            As pré-inscrições para o Brasil Flag World Championship entram em
            suas horas decisivas: as equipes têm até <strong>1º de julho</strong>{' '}
            para garantir o lugar do seu time no maior evento internacional de
            flag football do Brasil.
          </p>

          <p>
            O BFWC 2026 possui quatro categorias: <strong>Sub-12 (misto)</strong>,{' '}
            <strong>Sub-15 (misto)</strong>, <strong>Adulto Masculino</strong> e{' '}
            <strong>Adulto Feminino</strong>. Nas categorias Sub-12 e Sub-15, os
            times serão mistos — meninos e meninas no mesmo time, ao mesmo tempo
            em campo.
          </p>

          <p>
            O cenário está montado. O palco está pronto: o campeonato acontece{' '}
            <strong>de 30 de outubro a 2 de novembro de 2026</strong>, no Clube
            de Campo Empyreo, em Leme, SP — com equipes de vários países e toda a
            infraestrutura de um evento internacional.
          </p>

          <p>
            E o próximo passo já tem data: encerradas as pré-inscrições, abre-se
            o período do cadastro oficial no portal — de 07 a 12/07 com
            prioridade para os times pré-inscritos, e a partir de 13/07 aberto a
            todas as equipes, enquanto houver vagas na categoria.
          </p>

          <p>
            Não fique de fora do maior evento internacional de flag football do
            Brasil em 2026. 🏈
          </p>

          <div style={{ marginTop: 28 }}>
            <a href="/portal/times/cadastro" style={{ display: 'inline-block', padding: '15px 34px', borderRadius: 12, background: '#f4ff00', color: '#031020', fontWeight: 900, fontStyle: 'italic', fontSize: 15, letterSpacing: '.03em', textTransform: 'uppercase', textDecoration: 'none' }}>
              Cadastrar minha equipe →
            </a>
          </div>
        </div>

      </div>
    </main>
  );
}
