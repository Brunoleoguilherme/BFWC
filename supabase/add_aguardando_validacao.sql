ALTER TABLE public.club_interests
  DROP CONSTRAINT IF EXISTS club_interests_status_check;

ALTER TABLE public.club_interests
  ADD CONSTRAINT club_interests_status_check CHECK (
    status IN (
      'aguardando_validacao',
      'pre_inscrito',
      'pendente_analise',
      'em_revisao',
      'aprovado',
      'inscricao_confirmada',
      'rejeitado',
      'spam_descartado'
    )
  );

SELECT 'OK' as resultado;
