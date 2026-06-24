-- ════════════════════════════════════════════════════════════════
--  BFWC 2026 — Bucket de mídia do portal
--  Cole no Supabase > SQL Editor > New Query > Run
-- ════════════════════════════════════════════════════════════════

-- Cria bucket público para fotos dos atletas
INSERT INTO storage.buckets (id, name, public)
VALUES ('portal-media', 'portal-media', true)
ON CONFLICT (id) DO NOTHING;

-- Permite upload via service_role (API)
CREATE POLICY "service_role upload portal-media"
  ON storage.objects FOR INSERT
  TO service_role
  WITH CHECK (bucket_id = 'portal-media');

-- Leitura pública
CREATE POLICY "public read portal-media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'portal-media');

-- Update/delete via service_role
CREATE POLICY "service_role manage portal-media"
  ON storage.objects FOR ALL
  TO service_role
  USING (bucket_id = 'portal-media');
