import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { getSupabaseServer } from '@/lib/supabaseServer';

async function getAdminUser() {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from('admin_profiles')
    .select('name, role')
    .eq('id', user.id)
    .single();
  if (!profile || profile.role === 'pending') return null;
  return { ...user, profile };
}

// Histórico de disparos de e-mail (com destinatários e abertura/clique)
export async function GET() {
  const adminUser = await getAdminUser();
  if (!adminUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = getSupabaseAdmin();

  const [blastRes, recRes] = await Promise.all([
    supabase.from('email_blasts')
      .select('id, subject, description, source, sent_at')
      .order('sent_at', { ascending: false }),
    supabase.from('email_blast_recipients')
      .select('id, blast_id, email, name, club_name, language, opened_at, clicked_at'),
  ]);
  if (blastRes.error) return NextResponse.json({ ok: false, message: blastRes.error.message }, { status: 500 });

  const byBlast = {};
  (recRes.data || []).forEach(r => { (byBlast[r.blast_id] ||= []).push(r); });

  const blasts = (blastRes.data || []).map(b => {
    const recipients = (byBlast[b.id] || []).sort((a, x) =>
      (a.club_name || a.name || a.email).localeCompare(x.club_name || x.name || x.email));
    return {
      ...b,
      recipients,
      counts: {
        total: recipients.length,
        opened: recipients.filter(r => r.opened_at || r.clicked_at).length,
        clicked: recipients.filter(r => r.clicked_at).length,
      },
    };
  });

  return NextResponse.json({ ok: true, blasts });
}
