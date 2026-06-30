-- Permite o papel 'pending' em admin_profiles.
-- Usado quando alguém solicita acesso de administrador e define a própria senha;
-- o usuário fica sem acesso ao painel até um admin aprovar (mudar o papel).

ALTER TABLE public.admin_profiles
  DROP CONSTRAINT IF EXISTS admin_profiles_role_check;

ALTER TABLE public.admin_profiles
  ADD CONSTRAINT admin_profiles_role_check
  CHECK (role IN ('admin', 'viewer', 'blue_panda', 'pending'));
