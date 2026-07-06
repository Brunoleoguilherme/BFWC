-- Termos v2026-07-06: registro de aceite + autorização de menores
alter table portal_teams
  add column if not exists terms_version text,
  add column if not exists terms_accepted_at timestamptz,
  add column if not exists terms_ip text;

alter table portal_athletes
  add column if not exists terms_version text,
  add column if not exists terms_accepted_at timestamptz,
  add column if not exists terms_ip text,
  add column if not exists guardian_auth_url text;
