-- BFWC 2026 — Árbitros e escalação de arbitragem por jogo
-- Cole no SQL Editor do Supabase e rode.

CREATE TABLE IF NOT EXISTS public.referees (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name       text NOT NULL,
  role       text,            -- ex.: Principal, Auxiliar, Mesa
  phone      text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.referees ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public read referees" ON public.referees;
CREATE POLICY "public read referees" ON public.referees FOR SELECT USING (true);

-- Árbitros escalados para cada jogo: array de { id, name, role }
ALTER TABLE public.games
  ADD COLUMN IF NOT EXISTS referees jsonb;

SELECT 'OK' as resultado;
