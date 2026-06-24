-- ════════════════════════════════════════════════════════════════
--  BFWC 2026 — Portal Schema
--  Cole este SQL no Supabase > SQL Editor > New Query > Run
-- ════════════════════════════════════════════════════════════════

-- ── 1. Contas de times no portal ─────────────────────────────────
CREATE TABLE IF NOT EXISTS portal_teams (
  id                        uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  club_interest_id          uuid    REFERENCES club_interests(id) ON DELETE SET NULL,

  -- Dados do clube
  club_name                 text    NOT NULL,
  country                   text,
  city                      text,
  contact_name              text    NOT NULL,

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

  created_at                timestamptz DEFAULT now(),
  updated_at                timestamptz DEFAULT now()
);

-- ── 2. Lista de atletas cadastrados pelo time ─────────────────────
CREATE TABLE IF NOT EXISTS team_athletes (
  id            uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id       uuid    NOT NULL REFERENCES portal_teams(id) ON DELETE CASCADE,

  -- Dados do atleta
  name          text    NOT NULL,
  email         text,                  -- usado para o atleta criar a conta
  category      text,                  -- masculino | feminino | sub-15 | sub-12
  jersey_number int,
  birth_date    date,
  document      text,                  -- CPF ou passaporte

  created_at    timestamptz DEFAULT now()
);

-- ── 3. Contas de atletas no portal ───────────────────────────────
CREATE TABLE IF NOT EXISTS portal_athletes (
  id                        uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  team_athlete_id           uuid    REFERENCES team_athletes(id) ON DELETE SET NULL,
  team_id                   uuid    REFERENCES portal_teams(id)  ON DELETE SET NULL,

  -- Dados
  name                      text    NOT NULL,
  email                     text    UNIQUE NOT NULL,
  password_hash             text    NOT NULL,

  -- Verificação de e-mail
  email_verified            boolean DEFAULT false,
  email_verification_token  text,
  email_token_expires_at    timestamptz,

  -- Status: pending_email | active
  status                    text    DEFAULT 'pending_email',

  created_at                timestamptz DEFAULT now(),
  updated_at                timestamptz DEFAULT now()
);

-- ── Índices ───────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_portal_teams_email             ON portal_teams(email);
CREATE INDEX IF NOT EXISTS idx_portal_teams_status            ON portal_teams(status);
CREATE INDEX IF NOT EXISTS idx_portal_teams_verification_token ON portal_teams(email_verification_token);

CREATE INDEX IF NOT EXISTS idx_team_athletes_team_id          ON team_athletes(team_id);
CREATE INDEX IF NOT EXISTS idx_team_athletes_email            ON team_athletes(email);

CREATE INDEX IF NOT EXISTS idx_portal_athletes_email          ON portal_athletes(email);
CREATE INDEX IF NOT EXISTS idx_portal_athletes_team_id        ON portal_athletes(team_id);
CREATE INDEX IF NOT EXISTS idx_portal_athletes_verification_token ON portal_athletes(email_verification_token);

-- ── Auto-atualização de updated_at ───────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_portal_teams_updated_at
  BEFORE UPDATE ON portal_teams
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_portal_athletes_updated_at
  BEFORE UPDATE ON portal_athletes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── RLS (Row Level Security) ──────────────────────────────────────
ALTER TABLE portal_teams    ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_athletes   ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_athletes ENABLE ROW LEVEL SECURITY;

-- Apenas service_role (backend/admin) lê e escreve tudo
CREATE POLICY "service_role only — portal_teams"
  ON portal_teams FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "service_role only — team_athletes"
  ON team_athletes FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "service_role only — portal_athletes"
  ON portal_athletes FOR ALL
  USING (auth.role() = 'service_role');
