-- BFWC 2026 — Opções de pagamento (v2)
-- Opção 1: R$2000 por categoria
-- Opção 2: R$800 por categoria + R$100 por atleta (quantidade escolhida pelo time)

ALTER TABLE public.portal_teams
  ADD COLUMN IF NOT EXISTS payment_option    text,      -- '1' ou '2' (travado na 1ª parcela)
  ADD COLUMN IF NOT EXISTS athletes_paid_qty integer DEFAULT 0; -- atletas pagos na opção 2
