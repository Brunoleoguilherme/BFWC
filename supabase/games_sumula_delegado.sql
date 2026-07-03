-- BFWC 2026 — Súmula (arbitragem) e relatório do delegado nos jogos
-- Cole no SQL Editor do Supabase e rode.

ALTER TABLE public.games
  ADD COLUMN IF NOT EXISTS sumula              jsonb,          -- pontuações, técnicos, árbitro, ejeções, obs
  ADD COLUMN IF NOT EXISTS sumula_closed       boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS delegate_report     jsonb,          -- check-in, ocorrências
  ADD COLUMN IF NOT EXISTS delegate_confirmed  boolean DEFAULT false;

SELECT 'OK' as resultado;
