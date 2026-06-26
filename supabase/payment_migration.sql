-- ════════════════════════════════════════════════════════════════
--  BFWC 2026 — Migração de Pagamento (Stripe)
--  Adiciona colunas para controlar o pagamento da taxa de inscrição.
--  Rode este bloco no SQL Editor do Supabase.
-- ════════════════════════════════════════════════════════════════

ALTER TABLE portal_teams
  ADD COLUMN IF NOT EXISTS payment_confirmed     boolean     DEFAULT false,
  ADD COLUMN IF NOT EXISTS payment_date          timestamptz,
  ADD COLUMN IF NOT EXISTS payment_amount        int,            -- valor pago em centavos (BRL)
  ADD COLUMN IF NOT EXISTS stripe_session_id     text,           -- id da Checkout Session
  ADD COLUMN IF NOT EXISTS stripe_payment_intent text;           -- id do PaymentIntent

CREATE INDEX IF NOT EXISTS idx_portal_teams_stripe_session
  ON portal_teams(stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;

-- ─── Pix via Cora ───
ALTER TABLE portal_teams
  ADD COLUMN IF NOT EXISTS cora_invoice_id text,    -- id da cobrança Pix na Cora (inv_...)
  ADD COLUMN IF NOT EXISTS payer_document  text;    -- CPF/CNPJ do pagador (apenas dígitos)

CREATE INDEX IF NOT EXISTS idx_portal_teams_cora_invoice
  ON portal_teams(cora_invoice_id)
  WHERE cora_invoice_id IS NOT NULL;
