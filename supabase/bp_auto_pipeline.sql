-- 1. Inserir todos os times pre_inscrito já existentes
INSERT INTO public.blue_panda_deals (team_id, status)
SELECT id, 'novo_lead'
FROM public.club_interests
WHERE status = 'pre_inscrito'
  AND id NOT IN (SELECT team_id FROM public.blue_panda_deals);

-- 2. Trigger: toda vez que um time virar pre_inscrito, entra automaticamente
CREATE OR REPLACE FUNCTION auto_add_to_bp_pipeline()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'pre_inscrito' AND (OLD IS NULL OR OLD.status IS DISTINCT FROM 'pre_inscrito') THEN
    INSERT INTO public.blue_panda_deals (team_id, status)
    VALUES (NEW.id, 'novo_lead')
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS auto_bp_pipeline ON public.club_interests;
CREATE TRIGGER auto_bp_pipeline
  AFTER INSERT OR UPDATE OF status ON public.club_interests
  FOR EACH ROW EXECUTE FUNCTION auto_add_to_bp_pipeline();

SELECT COUNT(*) AS leads_inseridos
FROM public.blue_panda_deals;
