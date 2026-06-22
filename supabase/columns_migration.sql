-- ============================================================
-- BFWC 2026 — Migration: adicionar colunas que faltam
-- Execute no Supabase SQL Editor:
-- https://supabase.com/dashboard/project/ptgebiynkuejmgxcqulb/sql/new
-- ============================================================

ALTER TABLE public.club_interests
  ADD COLUMN IF NOT EXISTS email               text,
  ADD COLUMN IF NOT EXISTS category            text,
  ADD COLUMN IF NOT EXISTS athletes_count      integer,
  ADD COLUMN IF NOT EXISTS competitive_history text,
  ADD COLUMN IF NOT EXISTS hosting_preference  text,
  ADD COLUMN IF NOT EXISTS notes               text;

-- Confirmar colunas criadas
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'club_interests'
  AND table_schema = 'public'
ORDER BY ordinal_position;
