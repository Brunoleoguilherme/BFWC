-- ════════════════════════════════════════════════════════════════
--  BFWC 2026 — Perfil completo do atleta + aceite de termos
--  Cole no Supabase > SQL Editor > New Query > Run
-- ════════════════════════════════════════════════════════════════

ALTER TABLE portal_athletes
  -- Dados pessoais adicionais
  ADD COLUMN IF NOT EXISTS nationality          text,
  ADD COLUMN IF NOT EXISTS phone               text,
  ADD COLUMN IF NOT EXISTS whatsapp            text,

  -- Contato de emergência
  ADD COLUMN IF NOT EXISTS emergency_name      text,
  ADD COLUMN IF NOT EXISTS emergency_phone     text,
  ADD COLUMN IF NOT EXISTS emergency_relation  text,

  -- Esporte
  ADD COLUMN IF NOT EXISTS position            text,   -- QB | WR | Slot/RB | C | LB | CB | Safety
  ADD COLUMN IF NOT EXISTS shirt_size          text,   -- PP | P | M | G | GG | XG

  -- Foto e redes sociais
  ADD COLUMN IF NOT EXISTS photo_url           text,
  ADD COLUMN IF NOT EXISTS instagram           text,
  ADD COLUMN IF NOT EXISTS tiktok              text,

  -- Termos (cada um salvo separadamente para auditoria)
  ADD COLUMN IF NOT EXISTS terms_health        boolean DEFAULT false,   -- declaração de saúde e responsabilidade
  ADD COLUMN IF NOT EXISTS terms_image         boolean DEFAULT false,   -- uso de imagem e voz
  ADD COLUMN IF NOT EXISTS terms_rules         boolean DEFAULT false,   -- regulamento do torneio
  ADD COLUMN IF NOT EXISTS terms_privacy       boolean DEFAULT false,   -- LGPD / privacidade
  ADD COLUMN IF NOT EXISTS terms_conduct       boolean DEFAULT false,   -- código de conduta / antidoping
  ADD COLUMN IF NOT EXISTS terms_accepted_at   timestamptz,

  -- Status de perfil
  ADD COLUMN IF NOT EXISTS profile_complete    boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS profile_completed_at timestamptz;

-- Índice para facilitar busca por perfil completo
CREATE INDEX IF NOT EXISTS idx_portal_athletes_profile ON portal_athletes(profile_complete);
