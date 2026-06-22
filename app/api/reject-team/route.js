import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return new NextResponse(errorPage('Token não encontrado.'), {
      status: 400, headers: { 'Content-Type': 'text/html' },
    });
  }

  const supabase = getSupabaseAdmin();

  const { data: team, error } = await supabase
    .from('club_interests')
    .select('id, club_name, status')
    .eq('approval_token', token)
    .single();

  if (error || !team) {
    return new NextResponse(errorPage('Token inválido ou expirado.'), {
      status: 404, headers: { 'Content-Type': 'text/html' },
    });
  }

  if (team.status !== 'aguardando_validacao') {
    return new NextResponse(alreadyPage(team.club_name, team.status), {
      status: 200, headers: { 'Content-Type': 'text/html' },
    });
  }

  const { error: updateError } = await supabase
    .from('club_interests')
    .update({
      status: 'rejeitado',
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', team.id);

  if (updateError) {
    return new NextResponse(errorPage('Erro ao rejeitar: ' + updateError.message), {
      status: 500, headers: { 'Content-Type': 'text/html' },
    });
  }

  return new NextResponse(successPage(team.club_name), {
    status: 200, headers: { 'Content-Type': 'text/html' },
  });
}

function successPage(clubName) {
  return `<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Inscrição Rejeitada — BFWC 2026</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #031020; font-family: 'Inter', sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 24px; }
    .card { background: linear-gradient(145deg, rgba(6,27,58,.8), rgba(2,8,22,.9)); border: 1px solid rgba(255,68,68,.2); border-radius: 24px; padding: 48px 40px; max-width: 480px; width: 100%; text-align: center; box-shadow: 0 0 80px rgba(255,68,68,.06); }
    .icon { font-size: 56px; margin-bottom: 20px; }
    .badge { display: inline-block; font-size: 10px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: #ff4444; border: 1px solid rgba(255,68,68,.3); background: rgba(255,68,68,.08); padding: 4px 12px; border-radius: 6px; margin-bottom: 16px; }
    h1 { font-size: 28px; font-weight: 900; letter-spacing: -1px; color: #fff; margin-bottom: 10px; }
    p { font-size: 14px; color: rgba(255,255,255,.45); line-height: 1.6; margin-bottom: 28px; }
    .club { color: #fff; font-weight: 700; }
    a { display: inline-block; padding: 12px 28px; background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1); color: rgba(255,255,255,.6); border-radius: 10px; font-size: 13px; font-weight: 700; text-decoration: none; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">❌</div>
    <div class="badge">Rejeitado</div>
    <h1>Inscrição rejeitada</h1>
    <p><span class="club">${clubName}</span> foi marcado como <strong style="color:#ff4444">Rejeitado</strong> no CRM do BFWC 2026.</p>
    <a href="https://brasilflagworldchampionship.com/admin/teams?status=rejeitado">Ver no CRM →</a>
  </div>
</body>
</html>`;
}

function alreadyPage(clubName, status) {
  return `<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8">
  <title>Já processado — BFWC 2026</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #031020; font-family: 'Inter', sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 24px; }
    .card { background: linear-gradient(145deg, rgba(6,27,58,.8), rgba(2,8,22,.9)); border: 1px solid rgba(255,255,255,.1); border-radius: 24px; padding: 48px 40px; max-width: 480px; width: 100%; text-align: center; }
    .icon { font-size: 56px; margin-bottom: 20px; }
    h1 { font-size: 28px; font-weight: 900; color: #fff; margin-bottom: 10px; }
    p { font-size: 14px; color: rgba(255,255,255,.45); }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">ℹ️</div>
    <h1>Já processado</h1>
    <p><strong style="color:#fff">${clubName}</strong> já foi processado anteriormente (status: ${status}).</p>
  </div>
</body>
</html>`;
}

function errorPage(msg) {
  return `<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8">
  <title>Erro — BFWC 2026</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #031020; font-family: 'Inter', sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 24px; }
    .card { background: linear-gradient(145deg, rgba(6,27,58,.8), rgba(2,8,22,.9)); border: 1px solid rgba(255,68,68,.2); border-radius: 24px; padding: 48px 40px; max-width: 480px; width: 100%; text-align: center; }
    .icon { font-size: 56px; margin-bottom: 20px; }
    h1 { font-size: 28px; font-weight: 900; color: #fff; margin-bottom: 10px; }
    p { font-size: 14px; color: rgba(255,255,255,.45); }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">❌</div>
    <h1>Erro</h1>
    <p>${msg}</p>
  </div>
</body>
</html>`;
}
