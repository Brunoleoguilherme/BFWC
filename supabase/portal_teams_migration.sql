-- ════════════════════════════════════════════════════════════════
--  BFWC 2026 — Portal Teams Migration
--  Se portal_teams JÁ EXISTE: rode apenas este bloco ALTER.
--  Se ainda não criou: rode portal_schema.sql DEPOIS deste arquivo.
-- ════════════════════════════════════════════════════════════════

-- Adiciona colunas extras que o formulário de cadastro envia
ALTER TABLE portal_teams
  ADD COLUMN IF NOT EXISTS contact_role        text,
  ADD COLUMN IF NOT EXISTS whatsapp            text,
  ADD COLUMN IF NOT EXISTS category            text,
  ADD COLUMN IF NOT EXISTS athletes_count      int,
  ADD COLUMN IF NOT EXISTS preferred_language  text DEFAULT 'pt';

-- Caso você ainda NÃO rodou portal_schema.sql, use o CREATE TABLE completo abaixo:
-- (comentado — descomente se for criar do zero)

/*
CREATE TABLE IF NOT EXISTS portal_teams (
  id                        uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  club_interest_id          uuid    REFERENCES club_interests(id) ON DELETE SET NULL,

  -- Dados do clube
  club_name                 text    NOT NULL,
  country                   text,
  city                      text,
  contact_name              text    NOT NULL,
  contact_role              text,
  whatsapp                  text,
  category                  text,
  athletes_count            int,

  -- Auth
  email                     text    UNIQUE NOT NULL,
  password_hash             text    NOT NULL,

  -- Verificação de e-mail
  email_verified            boolean DEFAULT false,
  email_verification_token  text,
  email_token_expires_at    timestamptz,

  -- Aprovação pelo admin
  status                    text    DEFAULT 'pending_email',
  -- pending_email | pending_approval | approved | rejected

  admin_notes               text,
  approved_at               timestamptz,
  approved_by               text,

  preferred_language        text DEFAULT 'pt',

  created_at                timestamptz DEFAULT now(),
  updated_at                timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE portal_teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role only" ON portal_teams
  USING (auth.role() = 'service_role');

-- Índices
CREATE INDEX IF NOT EXISTS idx_portal_teams_email  ON portal_teams(email);
CREATE INDEX IF NOT EXISTS idx_portal_teams_status ON portal_teams(status);
CREATE INDEX IF NOT EXISTS idx_portal_teams_token  ON portal_teams(email_verification_token)
  WHERE email_verification_token IS NOT NULL;

-- Trigger updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS trg_portal_teams_updated_at ON portal_teams;
CREATE TRIGGER trg_portal_teams_updated_at
  BEFORE UPDATE ON portal_teams
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
*/
