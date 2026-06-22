CREATE TABLE IF NOT EXISTS public.blue_panda_deals (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id     uuid NOT NULL REFERENCES public.club_interests(id) ON DELETE CASCADE,
  status      text NOT NULL DEFAULT 'novo_lead' CHECK (status IN (
    'novo_lead', 'contato_feito', 'proposta_enviada', 'em_negociacao', 'fechado', 'perdido'
  )),
  notes       text,
  deal_value  numeric,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS bp_deals_updated_at ON public.blue_panda_deals;
CREATE TRIGGER bp_deals_updated_at
  BEFORE UPDATE ON public.blue_panda_deals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE public.blue_panda_deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service role manages bp_deals"
  ON public.blue_panda_deals FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "authenticated admins read bp_deals"
  ON public.blue_panda_deals FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.admin_profiles WHERE id = auth.uid()));

CREATE POLICY "authenticated admins write bp_deals"
  ON public.blue_panda_deals FOR ALL
  USING (EXISTS (SELECT 1 FROM public.admin_profiles WHERE id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_profiles WHERE id = auth.uid()));

SELECT 'OK' as resultado;
