import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { getResend, fromEmail, athleteInviteHtml } from '@/lib/email';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const team_id = searchParams.get('team_id');
  if (!team_id) return NextResponse.json({ ok: false, message: 'team_id obrigatório' }, { status: 400 });

  const supabase = getSupabaseAdmin();

  // Roster do clube
  const { data: athletes, error } = await supabase
    .from('team_athletes')
    .select('*')
    .eq('team_id', team_id)
    .order('category', { ascending: true })
    .order('name', { ascending: true });

  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });

  // Contas criadas no portal para este time
  const { data: portalAthletes } = await supabase
    .from('portal_athletes')
    .select('team_athlete_id, email_verified, status')
    .eq('team_id', team_id);

  // Indexa por team_athlete_id
  const portalMap = {};
  (portalAthletes || []).forEach(pa => {
    if (pa.team_athlete_id) portalMap[pa.team_athlete_id] = pa;
  });

  const enriched = (athletes || []).map(a => {
    const pa = portalMap[a.id] || null;
    return {
      ...a,
      portal_registered:     !!pa,
      portal_email_verified: pa?.email_verified || false,
      portal_status:         pa?.status || null,
    };
  });

  return NextResponse.json({ ok: true, athletes: enriched });
}

export async function POST(req) {
  const body = await req.json();
  const { team_id, name, email, category, jersey_number, birth_date, document } = body;
  if (!team_id || !name) return NextResponse.json({ ok: false, message: 'team_id e name obrigatórios' }, { status: 400 });

  const supabase = getSupabaseAdmin();

  // Get club name for the invite email
  const { data: team } = await supabase
    .from('portal_teams')
    .select('club_name')
    .eq('id', team_id)
    .single();

  const { data, error } = await supabase
    .from('team_athletes')
    .insert({ team_id, name, email: email || null, category: category || null, jersey_number: jersey_number ? parseInt(jersey_number) : null, birth_date: birth_date || null, document: document || null })
    .select()
    .single();

  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });

  // Send invite email to athlete if they have an email
  let emailSent = false;
  let emailError = null;
  if (email) {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://brasilflagworldchampionship.com';
      const registerUrl = `${baseUrl}/portal/atletas/cadastro?ref=${data.id}`;
      const clubName = team?.club_name || 'seu clube';

      const resend = getResend();
      const { data: sendData, error: sendError } = await resend.emails.send({
        from: fromEmail,
        to: email,
        subject: `${clubName} te convocou para o BFWC 2026! 🏈`,
        html: athleteInviteHtml({ athlete_name: name, club_name: clubName, register_url: registerUrl }),
      });
      // Resend returns { data, error } — error is non-null on failure (e.g. domain not verified)
      if (sendError) {
        emailError = sendError.message || String(sendError);
        console.error('[athlete-invite] resend error:', emailError);
      } else {
        emailSent = true;
      }
    } catch (emailErr) {
      // Don't fail the request if email sending throws — athlete was added successfully
      emailError = emailErr.message || String(emailErr);
      console.error('[athlete-invite] email error:', emailError);
    }
  }

  return NextResponse.json({
    ok: true,
    athlete: { ...data, portal_registered: false, portal_email_verified: false, portal_status: null },
    email_requested: !!email,
    email_sent: emailSent,
    email_error: emailError,
  });
}
