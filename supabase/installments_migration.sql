-- ════════════════════════════════════════════════════════════════
--  BFWC 2026 — Parcelamento (Pix em 1x/2x/3x)
--  Rode no SQL Editor do Supabase.
-- ════════════════════════════════════════════════════════════════

-- Plano escolhido pelo time (1, 2 ou 3) — trava após a 1ª parcela gerada
ALTER TABLE portal_teams
  ADD COLUMN IF NOT EXISTS payment_plan int,
  ADD COLUMN IF NOT EXISTS amount_paid_cents int DEFAULT 0;  -- total já pago (Pix + cartão)

-- Uma linha por parcela do Pix
CREATE TABLE IF NOT EXISTS payment_installments (
  id               uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id          uuid    REFERENCES portal_teams(id) ON DELETE CASCADE,
  plan_size        int     NOT NULL,            -- 1, 2 ou 3
  number           int     NOT NULL,            -- 1..plan_size
  amount_cents     int     NOT NULL,
  due_date         date,
  status           text    DEFAULT 'pending',   -- pending | paid
  cora_invoice_id  text,                         -- cobrança Cora dessa parcela
  paid_at          timestamptz,
  created_at       timestamptz DEFAULT now(),
  UNIQUE (team_id, number)
);

CREATE INDEX IF NOT EXISTS idx_installments_team ON payment_installments(team_id);
CREATE INDEX IF NOT EXISTS idx_installments_cora ON payment_installments(cora_invoice_id)
  WHERE cora_invoice_id IS NOT NULL;

ALTER TABLE payment_installments ENABLE ROW LEVEL SECURITY;
