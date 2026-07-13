import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, CalendarDays, Tag, ArrowRight } from 'lucide-react';
import '../noticia.css';

export const metadata = {
  title: 'Inscrições abertas para todas as equipes — Brasil Flag World Championship 2026',
  description: 'A partir de 13 de julho, qualquer equipe pode se inscrever no Brasil Flag World Championship 2026 — não é mais preciso ter feito a pré-inscrição. Veja quanto já foi preenchido em cada categoria.',
};

// Vagas garantidas por categoria no momento da publicação (13/07/2026).
const CATEGORIAS = [
  { nome: 'Masculino', pct: 'mais de 80%', barra: 83, status: 'Últimas vagas', destaque: true, cor: '#3b82f6' },
  { nome: 'Feminino', pct: '75%', barra: 75, status: 'Poucas vagas', destaque: true, cor: '#ec4899' },
  { nome: 'Sub-15', pct: '40%', barra: 40, status: 'Vagas disponíveis', destaque: false, cor: '#f59e0b' },
  { nome: 'Sub-12', pct: '50%', barra: 50, status: 'Vagas disponíveis', destaque: false, cor: '#10b981' },
];

export default function InscricoesAbertasTodosNewsPage() {
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
          Inscrições abertas para todas as equipes: veja quanto já foi preenchido em cada categoria
        </h1>

        <div className="uaDate">
          <CalendarDays size={18} />
          13 de julho de 2026
        </div>

        <div className="uaLine" />

        <div className="uaText">
          <p>
            A partir de hoje, <strong>13 de julho</strong>, a inscrição no
            <strong> Brasil Flag World Championship 2026</strong> está aberta para
            qualquer equipe — não é mais necessário ter feito a pré-inscrição. O
            maior campeonato internacional de clubes de Flag Football 5x5 já
            realizado no Brasil acontece de 31 de outubro a 2 de novembro, em
            Leme/SP, e as vagas seguem sendo preenchidas por ordem de pagamento da
            primeira parcela.
          </p>

          <p>
            Até agora, a resposta das equipes foi forte e algumas categorias já
            estão perto de fechar. Veja como está o preenchimento das vagas por
            categoria neste momento:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, margin: '28px 0 8px' }}>
            {CATEGORIAS.map((c) => (
              <div key={c.nome} style={{ background: 'rgba(4,16,39,.55)', border: '1px solid rgba(255,255,255,.14)', borderRadius: 16, padding: '20px 22px' }}>
                <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', color: c.cor }}>{c.nome}</span>
                <div style={{ fontSize: 34, fontWeight: 900, color: '#fff', lineHeight: 1.05, marginTop: 8 }}>
                  {c.pct}
                </div>
                <div style={{ marginTop: 14, height: 8, borderRadius: 999, background: 'rgba(255,255,255,.12)', overflow: 'hidden' }}>
                  <div style={{ width: `${c.barra}%`, height: '100%', borderRadius: 999, background: c.cor }} />
                </div>
              </div>
            ))}
          </div>

          <p style={{ fontSize: 13.5, color: 'rgba(220,230,255,.55)' }}>
            No geral, o campeonato já está com <strong>cerca de 65% das vagas
            preenchidas</strong>. Uma mesma equipe pode disputar mais de uma
            categoria, então os percentuais acima são por categoria.
          </p>

          <p>
            O <strong>Masculino</strong> e o <strong>Feminino</strong> estão nas
            últimas vagas — quem pretende disputar essas categorias precisa correr.
            Já o <strong>Sub-15</strong> e o <strong>Sub-12</strong> ainda têm espaço,
            e é a hora ideal para os projetos e escolinhas de base garantirem
            presença no mundial.
          </p>

          <p>
            Todo o processo é feito pelo portal oficial: a equipe cria a conta,
            aguarda a aprovação da organização, escolhe a forma de pagamento (cartão
            ou Pix, em até 3x) e passa a acompanhar tudo pelo portal — inclusive o
            cadastro dos atletas e o envio da escalação. Na página de{' '}
            <Link href="/site/documentos" style={{ color: '#f4ff00', fontWeight: 700 }}>Documentos</Link>{' '}
            estão os guias passo a passo, o regulamento e os termos de participação.
            Dúvidas? Fale com a organização pelo e-mail contato@brasilflag.com ou
            pelo WhatsApp (16) 99775-4522.
          </p>

          <div style={{ margin: '32px 0 8px' }}>
            <Link href="/portal/times/cadastro" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '16px 32px', borderRadius: 10, background: '#f4ff00', color: '#031020', fontSize: 15, fontWeight: 900, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '.5px' }}>
              Inscrever minha equipe
              <ArrowRight size={18} />
            </Link>
          </div>

          <p style={{ marginTop: 24 }}>
            As vagas são limitadas e não voltam. Garanta a sua e nos vemos em Leme. 🏈
          </p>
        </div>

      </div>
    </main>
  );
}
