-- Adicionar status pre_inscrito ao constraint
ALTER TABLE public.club_interests
  DROP CONSTRAINT IF EXISTS club_interests_status_check;

ALTER TABLE public.club_interests
  ADD CONSTRAINT club_interests_status_check CHECK (
    status IN (
      'pre_inscrito',
      'pendente_analise',
      'em_revisao',
      'aprovado',
      'inscricao_confirmada',
      'rejeitado',
      'spam_descartado'
    )
  );

-- Mover os times importados para pré-inscritos
UPDATE public.club_interests
  SET status = 'pre_inscrito'
  WHERE status = 'inscricao_confirmada';

-- Confirmar
SELECT status, count(*) FROM public.club_interests GROUP BY status;
