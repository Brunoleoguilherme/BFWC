-- Pagamento por cartão via PagBank (substitui Stripe/Mercado Pago)
-- Rode no SQL Editor do Supabase.

alter table portal_teams
  add column if not exists pagbank_checkout_id text,
  add column if not exists pagbank_charge_id text;
