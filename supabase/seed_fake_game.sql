-- BFWC 2026 — Jogo FAKE para teste (súmula, delegado, rankings)
-- Cria um jogo entre os 2 primeiros clubes APROVADOS do portal,
-- já designando um delegado (se houver algum cadastrado).
-- Rode DEPOIS das migrações de games/súmula/delegado/referees.

INSERT INTO public.games
  (team1_id, team2_id, team1_name, team2_name, category, group_name, phase, game_date, game_time, field, status, delegate_id)
SELECT
  t1.id, t2.id, t1.club_name, t2.club_name,
  'Masculino', 'Grupo A', 'group',
  CURRENT_DATE, '15:00', 'Campo 1', 'scheduled',
  (SELECT id FROM public.admin_profiles WHERE role = 'delegado_partida' LIMIT 1)
FROM
  (SELECT id, club_name FROM public.portal_teams WHERE status = 'approved' ORDER BY created_at LIMIT 1) t1
CROSS JOIN
  (SELECT id, club_name FROM public.portal_teams WHERE status = 'approved' ORDER BY created_at OFFSET 1 LIMIT 1) t2;

SELECT id, team1_name, team2_name, delegate_id FROM public.games ORDER BY created_at DESC LIMIT 1;
