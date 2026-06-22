-- ============================================================
-- BFWC 2026 — Admin Panel Migration
-- Execute no Supabase SQL Editor
-- ============================================================

-- 1. Atualizar club_interests: novos campos admin + novo status constraint
ALTER TABLE public.club_interests
  ADD COLUMN IF NOT EXISTS admin_notes      text,
  ADD COLUMN IF NOT EXISTS flagged_suspect  boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS approved_at      timestamptz,
  ADD COLUMN IF NOT EXISTS approved_by      text;

-- Atualizar constraint de status para os valores do funil
ALTER TABLE public.club_interests
  DROP CONSTRAINT IF EXISTS club_interests_status_check;

ALTER TABLE public.club_interests
  ALTER COLUMN status SET DEFAULT 'pendente_analise';

-- Migrar valores antigos para os novos
UPDATE public.club_interests SET status = 'pendente_analise'   WHERE status = 'pending_review';
UPDATE public.club_interests SET status = 'aprovado'           WHERE status = 'approved';
UPDATE public.club_interests SET status = 'rejeitado'          WHERE status = 'rejected';
UPDATE public.club_interests SET status = 'inscricao_confirmada' WHERE status = 'waiting_list';
UPDATE public.club_interests SET status = 'em_revisao'         WHERE status = 'contacted';

ALTER TABLE public.club_interests
  ADD CONSTRAINT club_interests_status_check CHECK (
    status IN (
      'pendente_analise',
      'em_revisao',
      'aprovado',
      'inscricao_confirmada',
      'rejeitado',
      'spam_descartado'
    )
  );

-- 2. Tabela de histórico / auditoria
CREATE TABLE IF NOT EXISTS public.team_events (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id      uuid NOT NULL REFERENCES public.club_interests(id) ON DELETE CASCADE,
  event_type   text NOT NULL CHECK (event_type IN (
                  'status_changed', 'note_added', 'email_sent', 'duplicate_merged'
                )),
  from_status  text,
  to_status    text,
  description  text,
  created_by   text NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.team_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service role manages team_events"
  ON public.team_events FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- 3. Tabela de admins (profile vinculado ao Supabase Auth)
CREATE TABLE IF NOT EXISTS public.admin_profiles (
  id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      text NOT NULL UNIQUE,
  name       text NOT NULL,
  role       text NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'viewer')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

-- Admin pode ler o próprio perfil
CREATE POLICY "admins can read own profile"
  ON public.admin_profiles FOR SELECT
  USING (auth.uid() = id);

-- Service role gerencia tudo
CREATE POLICY "service role manages admin_profiles"
  ON public.admin_profiles FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- 4. Policy para club_interests: admins autenticados podem ler/editar
CREATE POLICY "authenticated admins read club_interests"
  ON public.club_interests FOR SELECT
  USING (
    auth.role() = 'service_role'
    OR EXISTS (
      SELECT 1 FROM public.admin_profiles WHERE id = auth.uid()
    )
  );

-- ============================================================
-- Após rodar, crie o primeiro admin no Supabase Auth:
--   Authentication → Users → Add user
--   Email: brunoleoguilherme@gmail.com  (ou o que preferir)
-- Depois insira na tabela admin_profiles:
--   INSERT INTO admin_profiles (id, email, name, role)
--   VALUES ('<uuid-do-user-criado>', 'brunoleoguilherme@gmail.com', 'Bruno', 'admin');
-- ============================================================
