-- Pagamento por cartão via Mercado Pago (substitui a Stripe)
-- Rode no SQL Editor do Supabase.

alter table portal_teams
  add column if not exists mp_preference_id text,
  add column if not exists mp_payment_id text;
