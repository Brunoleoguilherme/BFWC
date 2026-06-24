-- ════════════════════════════════════════════════════════════════
--  BFWC 2026 — Escalação e Aceite de Termos
--  Cole no Supabase > SQL Editor > New Query > Run
-- ════════════════════════════════════════════════════════════════

-- 1. Envio de escalação pelo time
ALTER TABLE portal_teams
  ADD COLUMN IF NOT EXISTS lineup_submitted     boolean     DEFAULT false,
  ADD COLUMN IF NOT EXISTS lineup_submitted_at  timestamptz;

-- 2. Aceite de termos pelo atleta (muda status para 'approved')
--    O status 'approved' é setado quando o atleta aceita os termos no portal
--    Valores possíveis: pending_email | active | approved
--    (nenhuma alteração de schema necessária, apenas novo valor de status)

-- Confirmar que a coluna status existe com o default correto
ALTER TABLE portal_athletes
  ALTER COLUMN status SET DEFAULT 'pending_email';
