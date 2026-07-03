-- BFWC 2026 — Novos papéis de usuário do painel:
--   arbitragem        → equipe de arbitragem
--   delegado_partida  → delegado da partida
-- Rode no SQL Editor do Supabase.

ALTER TABLE public.admin_profiles
  DROP CONSTRAINT IF EXISTS admin_profiles_role_check;

ALTER TABLE public.admin_profiles
  ADD CONSTRAINT admin_profiles_role_check
  CHECK (role IN ('admin', 'viewer', 'blue_panda', 'pending', 'arbitragem', 'delegado_partida'));

SELECT 'OK' as resultado;
