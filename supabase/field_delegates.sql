-- BFWC 2026 — Delegado responsável por cada campo (Campo 1..Campo 8)
-- O jogo herda o delegado do campo escolhido (pode ser trocado manualmente).
-- Cole no SQL Editor do Supabase e rode.

CREATE TABLE IF NOT EXISTS public.field_delegates (
  field       text PRIMARY KEY,   -- 'Campo 1' .. 'Campo 8'
  delegate_id uuid REFERENCES public.admin_profiles(id) ON DELETE SET NULL,
  updated_at  timestamptz DEFAULT now()
);

ALTER TABLE public.field_delegates ENABLE ROW LEVEL SECURITY;

SELECT 'OK' as resultado;
