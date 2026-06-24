-- ════════════════════════════════════════════════════════════════
--  BFWC 2026 — Tabela de Jogos
--  Cole no Supabase > SQL Editor > New Query > Run
-- ════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS games (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Times (podem ser times do portal ou externos)
  team1_id      uuid        REFERENCES portal_teams(id) ON DELETE SET NULL,
  team2_id      uuid        REFERENCES portal_teams(id) ON DELETE SET NULL,
  team1_name    text        NOT NULL,
  team2_name    text        NOT NULL,

  -- Placar
  team1_score   int,
  team2_score   int,

  -- Classificação
  category      text,       -- Masculino | Feminino | Sub-15 | Sub-12
  group_name    text,       -- Grupo A, Grupo B...
  phase         text        DEFAULT 'group',
  -- group | quarterfinal | semifinal | final | 3rd_place

  -- Logística
  game_date     date,
  game_time     time,
  field         text,       -- Campo 1, Campo 2...
  warmup_time   time,       -- horário de aquecimento

  -- Status
  status        text        DEFAULT 'scheduled',
  -- scheduled | live | finished | cancelled

  notes         text,

  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_games_team1    ON games(team1_id);
CREATE INDEX IF NOT EXISTS idx_games_team2    ON games(team2_id);
CREATE INDEX IF NOT EXISTS idx_games_date     ON games(game_date);
CREATE INDEX IF NOT EXISTS idx_games_status   ON games(status);
CREATE INDEX IF NOT EXISTS idx_games_category ON games(category);

-- RLS
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

-- Leitura pública (atletas e times podem ver os jogos)
CREATE POLICY "public read games" ON games FOR SELECT USING (true);

-- Escrita somente service_role (admin)
CREATE POLICY "service_role write games" ON games FOR ALL
  USING (auth.role() = 'service_role');

-- Trigger updated_at
DROP TRIGGER IF EXISTS trg_games_updated_at ON games;
CREATE TRIGGER trg_games_updated_at
  BEFORE UPDATE ON games
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
