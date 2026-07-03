-- BFWC 2026 — Documento com foto do atleta (validação no dia dos jogos)
-- Guarda a URL do documento oficial com foto anexado pelo atleta.

ALTER TABLE public.portal_athletes
  ADD COLUMN IF NOT EXISTS document_url text;
