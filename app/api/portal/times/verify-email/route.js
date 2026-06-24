import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { getResend, fromEmail, adminEmails } from '@/lib/email';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) return NextResponse.redirect(new URL('/portal/times/cadastro?error=token_missing', req.url));

  const supabase = getSupabaseAdmin();

  const { data: team, error } = await supabase
    .from('portal_teams')
    .select('id, club_name, contact_name, email, status, email_token_expires_at')
    .eq('email_verification_token', token)
    .single();

  if (error || !team) return NextResponse.redirect(new URL('/portal/times/cadastro?error=token_invalid', req.url));

  if (team.status !== 'pending_email') {
    // Already verified
    return NextResponse.redirect(new URL('/portal/times/login?verified=1', req.url));
  }

  const expired = new Date(team.email_token_expires_at) < new Date();
  if (expired) return NextResponse.redirect(new URL('/portal/times/cadastro?error=token_expired', req.url));

  await supabase
    .from('portal_teams')
    .update({ status: 'pending_approval', email_verified: true, email_verification_token: null })
    .eq('id', team.id);

  // Notify admins
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://brasilflagworldchampionship.com';
  try {
    const resend = getResend();
    await Promise.allSettled(
      adminEmails.map(to => resend.emails.send({
        from: fromEmail,
        to,
        subject: `[BFWC Portal] E-mail verificado — Aprovação pendente: ${team.club_name}`,
        html: `
          <div style="font-family:Inter,sans-serif;background:#031020;color:#fff;padding:40px 24px;max-width:560px;margin:0 auto;border-radius:16px">
            <h1 style="font-size:28px;font-weight:900;margin:0 0 6px">BFWC <span style="color:#f4ff00">2026</span></h1>
            <p style="color:rgba(255,255,255,.4);font-size:13px;margin:0 0 28px">Portal — E-mail verificado</p>
            <h2 style="font-size:18px;font-weight:800;margin:0 0 12px">✅ Clube aguardando aprovação</h2>
            <p style="color:#c8d8f5;font-size:14px">
              <strong>${team.contact_name}</strong> do clube <strong>${team.club_name}</strong> verificou o e-mail (<code>${team.email}</code>) e aguarda aprovação para acessar o portal.
            </p>
            <a href="${siteUrl}/admin/portal-teams" style="display:inline-block;margin-top:20px;padding:14px 32px;background:#f4ff00;color:#031020;font-weight:900;font-size:14px;text-decoration:none;border-radius:10px">
              Aprovar no painel →
            </a>
          </div>`,
      }))
    );
  } catch (_) {}

  return NextResponse.redirect(new URL('/portal/times/login?verified=1', req.url));
}
