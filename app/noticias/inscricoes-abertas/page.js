import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, CalendarDays, Tag, ArrowRight } from 'lucide-react';
import '../noticia.css';

export const metadata = {
  title: 'INSCRIÇÕES ABERTAS — Brasil Flag World Championship 2026',
  description: 'As inscrições para o Brasil Flag World Championship 2026 estão oficialmente abertas. Garanta a vaga da sua equipe no maior campeonato internacional de Flag Football já realizado no Brasil.',
};

export default function InscricoesAbertasNewsPage() {
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
          INSCRIÇÕES ABERTAS
        </div>

        <h1 className="uaTitle">
          As inscrições para o Brasil Flag World Championship 2026 estão oficialmente abertas
        </h1>

        <div className="uaDate">
          <CalendarDays size={18} />
          7 de julho de 2026
        </div>

        <div className="uaLine" />

        <div className="uaText">
          <p>
            Chegou o momento que o flag football brasileiro e mundial estava
            esperando: a partir de hoje, as equipes já podem realizar a inscrição
            oficial no <strong>Brasil Flag World Championship 2026</strong>, o maior
            campeonato internacional de clubes de Flag Football 5x5 já realizado no
            Brasil — de 31 de outubro a 2 de novembro, em Leme/SP.
          </p>

          <p>
            As inscrições ficam abertas <strong>enquanto houver vagas</strong>. De 07 a 12/07, a prioridade é das equipes
            pré-inscritas; a partir de 13/07, qualquer equipe pode se inscrever. As
            vagas são limitadas por categoria — Masculino, Feminino, Sub-15 e
            Sub-12 — e preenchidas por ordem de pagamento da primeira parcela.
          </p>

          <p>
            Todo o processo é feito pelo portal oficial: a equipe cria a conta,
            aguarda a aprovação da organização, escolhe a forma de pagamento
            (cartão ou Pix, em até 3x) e passa a acompanhar tudo pelo portal —
            inclusive o cadastro dos atletas e o envio da escalação.
          </p>

          <p>
            Na página de <Link href="/site/documentos" style={{ color: '#f4ff00', fontWeight: 700 }}>Documentos</Link> você
            encontra os guias de inscrição passo a passo, o regulamento oficial e
            os termos de participação. Dúvidas? Fale com a organização pelo e-mail
            contato@brasilflag.com ou pelo WhatsApp (16) 99775-4522.
          </p>

          <div style={{ margin: '32px 0 8px' }}>
            <Link href="/portal/times/cadastro" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '16px 32px', borderRadius: 10, background: '#f4ff00', color: '#031020', fontSize: 15, fontWeight: 900, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '.5px' }}>
              Inscrever minha equipe
              <ArrowRight size={18} />
            </Link>
          </div>

          <p style={{ marginTop: 24 }}>
            Nos vemos em Leme. O mundial é logo ali. 🏈
          </p>
        </div>

      </div>
    </main>
  );
}
