-- BFWC 2026 — Designação de delegado por jogo
-- Cole no SQL Editor do Supabase e rode.

ALTER TABLE public.games
  ADD COLUMN IF NOT EXISTS delegate_id uuid REFERENCES public.admin_profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_games_delegate ON public.games(delegate_id);

SELECT 'OK' as resultado;
