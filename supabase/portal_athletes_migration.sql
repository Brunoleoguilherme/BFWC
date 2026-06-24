-- ════════════════════════════════════════════════════════════════
--  BFWC 2026 — Portal Athletes
--  Cole no Supabase > SQL Editor > New Query > Run
-- ════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS portal_athletes (
  id                        uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  team_athlete_id           uuid    REFERENCES team_athletes(id) ON DELETE SET NULL,
  team_id                   uuid    REFERENCES portal_teams(id)  ON DELETE CASCADE,

  name                      text    NOT NULL,
  email                     text    UNIQUE NOT NULL,
  password_hash             text    NOT NULL,

  email_verified            boolean DEFAULT false,
  email_verification_token  text,
  email_token_expires_at    timestamptz,

  status                    text    DEFAULT 'pending_email',
  -- pending_email | active

  created_at                timestamptz DEFAULT now(),
  updated_at                timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE portal_athletes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role only" ON portal_athletes
  USING (auth.role() = 'service_role');

-- Índices
CREATE INDEX IF NOT EXISTS idx_portal_athletes_email  ON portal_athletes(email);
CREATE INDEX IF NOT EXISTS idx_portal_athletes_token  ON portal_athletes(email_verification_token)
  WHERE email_verification_token IS NOT NULL;

-- Trigger updated_at
DROP TRIGGER IF EXISTS trg_portal_athletes_updated_at ON portal_athletes;
CREATE TRIGGER trg_portal_athletes_updated_at
  BEFORE UPDATE ON portal_athletes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
