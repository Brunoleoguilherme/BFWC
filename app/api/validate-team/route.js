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

  // Busca o time pelo token
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

  // Atualiza para pré-inscrito
  const { error: updateError } = await supabase
    .from('club_interests')
    .update({
      status: 'pre_inscrito',
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', team.id);

  if (updateError) {
    return new NextResponse(errorPage('Erro ao validar: ' + updateError.message), {
      status: 500, headers: { 'Content-Type': 'text/html' },
    });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  return new NextResponse(successPage(team.club_name, siteUrl), {
    status: 200, headers: { 'Content-Type': 'text/html' },
  });
}

function successPage(clubName, siteUrl) {
  return `<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Time Validado — BFWC 2026</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #031020; font-family: 'Inter', sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 24px; }
    .card { background: linear-gradient(145deg, rgba(6,27,58,.8), rgba(2,8,22,.9)); border: 1px solid rgba(32,227,63,.25); border-radius: 24px; padding: 48px 40px; max-width: 480px; width: 100%; text-align: center; box-shadow: 0 0 80px rgba(32,227,63,.08); }
    .icon { font-size: 56px; margin-bottom: 20px; }
    .badge { display: inline-block; font-size: 10px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: #20e33f; border: 1px solid rgba(32,227,63,.3); background: rgba(32,227,63,.08); padding: 4px 12px; border-radius: 6px; margin-bottom: 16px; }
    h1 { font-size: 28px; font-weight: 900; letter-spacing: -1px; color: #fff; margin-bottom: 10px; }
    p { font-size: 14px; color: rgba(255,255,255,.45); line-height: 1.6; margin-bottom: 28px; }
    .club { color: #fff; font-weight: 700; }
    a { display: inline-block; padding: 12px 28px; background: #f4ff00; color: #031020; border-radius: 10px; font-size: 13px; font-weight: 900; letter-spacing: 1px; text-transform: uppercase; text-decoration: none; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">✅</div>
    <div class="badge">Validado</div>
    <h1>Time adicionado!</h1>
    <p><span class="club">${clubName}</span> foi validado e adicionado ao sistema como <strong style="color:#a855f7">Pré-inscrito</strong>.</p>
    <a href="${siteUrl}/admin/teams">Ver no CRM →</a>
  </div>
</body>
</html>`;
}

function alreadyPage(clubName, status) {
  return `<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8">
  <title>Já validado — BFWC 2026</title>
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
    <p><strong style="color:#fff">${clubName}</strong> já foi validado anteriormente (status: ${status}).</p>
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
