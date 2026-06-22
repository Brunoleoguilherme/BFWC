-- Adicionar colunas de atletas por categoria
ALTER TABLE public.club_interests
  ADD COLUMN IF NOT EXISTS athletes_masc   integer,
  ADD COLUMN IF NOT EXISTS athletes_fem    integer,
  ADD COLUMN IF NOT EXISTS athletes_sub15  integer,
  ADD COLUMN IF NOT EXISTS athletes_sub12  integer;

-- Confirmar
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'club_interests' AND table_schema = 'public'
ORDER BY ordinal_position;
