import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { fromEmail, adminEmails } from '@/lib/email';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  const { team_id } = await req.json();
  if (!team_id) return NextResponse.json({ ok: false, message: 'team_id obrigatório' }, { status: 400 });

  const supabase = getSupabaseAdmin();

  // Busca time
  const { data: team, error: teamErr } = await supabase
    .from('portal_teams')
    .select('*')
    .eq('id', team_id)
    .single();

  if (teamErr || !team) return NextResponse.json({ ok: false, message: 'Time não encontrado' }, { status: 404 });
  if (team.status !== 'approved') return NextResponse.json({ ok: false, message: 'Apenas times aprovados podem enviar escalação' }, { status: 403 });

  // Busca atletas do time
  const { data: athletes } = await supabase
    .from('team_athletes')
    .select('name, category, jersey_number')
    .eq('team_id', team_id)
    .order('category')
    .order('name');

  if (!athletes || athletes.length === 0)
    return NextResponse.json({ ok: false, message: 'Adicione pelo menos 1 atleta antes de enviar.' }, { status: 400 });

  // Marca lineup_submitted no banco
  const { error: updateErr } = await supabase
    .from('portal_teams')
    .update({ lineup_submitted: true, lineup_submitted_at: new Date().toISOString() })
    .eq('id', team_id);

  if (updateErr) return NextResponse.json({ ok: false, message: updateErr.message }, { status: 500 });

  // Monta lista de atletas para o e-mail
  const athRows = (athletes || []).map(a =>
    `<tr><td style="padding:8px 12px;border-bottom:1px solid #1a2a4a;color:#fff;font-size:13px">${a.jersey_number ?? '—'}</td><td style="padding:8px 12px;border-bottom:1px solid #1a2a4a;color:#fff;font-size:13px">${a.name}</td><td style="padding:8px 12px;border-bottom:1px solid #1a2a4a;color:#aab4cc;font-size:13px">${a.category || '—'}</td></tr>`
  ).join('');

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://brasilflagworldchampionship.com';

  // E-mail para admins
  await resend.emails.send({
    from: fromEmail,
    to: adminEmails,
    subject: `🏈 Escalação enviada — ${team.club_name}`,
    html: `
      <div style="background:#020814;padding:32px 24px;font-family:Inter,sans-serif;max-width:560px;margin:0 auto;border-radius:16px">
        <div style="text-align:center;margin-bottom:24px">
          <span style="background:#0D4BFF18;color:#0D4BFF;font-size:10px;font-weight:800;letter-spacing:3px;text-transform:uppercase;padding:4px 14px;border-radius:20px;border:1px solid #0D4BFF30">BFWC 2026 — Admin</span>
        </div>
        <h2 style="color:#fff;font-size:20px;font-weight:900;margin:0 0 8px">🏈 Nova escalação recebida</h2>
        <p style="color:#8899bb;font-size:14px;margin:0 0 20px">O time <strong style="color:#fff">${team.club_name}</strong> enviou sua escalação oficial com <strong style="color:#f4ff00">${athletes.length} atleta${athletes.length !== 1 ? 's' : ''}</strong>.</p>
        <table style="width:100%;border-collapse:collapse;background:#061122;border-radius:10px;overflow:hidden;margin-bottom:20px">
          <thead><tr style="border-bottom:1px solid #1a2a4a">
            <th style="padding:10px 12px;text-align:left;font-size:10px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:#445577">#</th>
            <th style="padding:10px 12px;text-align:left;font-size:10px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:#445577">Nome</th>
            <th style="padding:10px 12px;text-align:left;font-size:10px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:#445577">Categoria</th>
          </tr></thead>
          <tbody>${athRows}</tbody>
        </table>
        <div style="background:#0a1628;border-radius:10px;padding:16px;margin-bottom:20px">
          <div style="font-size:11px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:#445577;margin-bottom:8px">Dados do time</div>
          <div style="font-size:13px;color:#aab4cc;line-height:1.7">
            País: ${team.country || '—'}<br>
            Categorias: ${team.category || '—'}<br>
            Contato: ${team.contact_name || '—'} ${team.whatsapp ? '· ' + team.whatsapp : ''}
          </div>
        </div>
        <a href="${siteUrl}/admin/portal-teams" style="display:block;text-align:center;background:#0D4BFF;color:#fff;font-weight:800;font-size:14px;padding:14px;border-radius:10px;text-decoration:none">Ver no painel admin →</a>
      </div>`,
  });

  // E-mail de confirmação para o time
  await resend.emails.send({
    from: fromEmail,
    to: [team.email],
    subject: `✅ Escalação enviada — ${team.club_name}`,
    html: `
      <div style="background:#020814;padding:32px 24px;font-family:Inter,sans-serif;max-width:560px;margin:0 auto;border-radius:16px">
        <div style="text-align:center;margin-bottom:24px">
          <span style="background:#f4ff0008;color:#f4ff00;font-size:10px;font-weight:800;letter-spacing:3px;text-transform:uppercase;padding:4px 14px;border-radius:20px;border:1px solid #f4ff0025">BFWC 2026</span>
        </div>
        <h2 style="color:#fff;font-size:22px;font-weight:900;margin:0 0 8px">✅ Escalação recebida!</h2>
        <p style="color:#8899bb;font-size:14px;margin:0 0 20px">Olá, <strong style="color:#fff">${team.contact_name || team.club_name}</strong>! Recebemos a escalação do <strong style="color:#fff">${team.club_name}</strong> com <strong style="color:#20e33f">${athletes.length} atleta${athletes.length !== 1 ? 's' : ''}</strong>.</p>
        <div style="background:#20e33f0a;border:1px solid #20e33f25;border-radius:10px;padding:16px;margin-bottom:20px;font-size:13px;color:#20e33f;line-height:1.6">
          A organização analisará sua escalação e entrará em contato caso precise de ajustes. Fique atento ao e-mail cadastrado.
        </div>
        <a href="${siteUrl}/portal/times" style="display:block;text-align:center;background:#0D4BFF;color:#fff;font-weight:800;font-size:14px;padding:14px;border-radius:10px;text-decoration:none">Acessar portal do clube →</a>
      </div>`,
  });

  return NextResponse.json({ ok: true, message: 'Escalação enviada com sucesso.' });
}
