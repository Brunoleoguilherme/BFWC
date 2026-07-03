-- Recuperação de senha do portal dos times ("esqueci a senha")
-- Rode no SQL Editor do Supabase.

alter table portal_teams
  add column if not exists password_reset_token text,
  add column if not exists password_reset_expires_at timestamptz;

create index if not exists idx_portal_teams_password_reset_token
  on portal_teams (password_reset_token)
  where password_reset_token is not null;
