import { NextResponse } from 'next/server';
import { getResend, fromEmail, emailShell } from '@/lib/email';
import { requireWriter } from '@/lib/authAdmin';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

// Envia uma mensagem personalizada (assunto + corpo) para uma lista de
// destinatários. Suporta placeholders {nome} e {clube} por destinatário.
export async function POST(request) {
  const { profile, error } = await requireWriter();
  if (error) return error;

  const { recipients, subject, message } = await request.json();

  if (!Array.isArray(recipients) || recipients.length === 0)
    return NextResponse.json({ error: 'Nenhum destinatário selecionado.' }, { status: 400 });
  const pickLang = (v, lang) => {
    if (v && typeof v === 'object') return v[lang] || v.pt || v.en || v.es || '';
    return v || '';
  };
  const hasContent = (v) => {
    if (v && typeof v === 'object') return !!(v.pt && String(v.pt).trim());
    return !!(v && String(v).trim());
  };
  if (!hasContent(subject) || !hasContent(message))
    return NextResponse.json({ error: 'Assunto e mensagem são obrigatórios.' }, { status: 400 });

  const resend = getResend();
  const valid = recipients.filter(r => r && r.email && /\S+@\S+\.\S+/.test(r.email));

  let sent = 0;
  const failed = [];
  const sentRows = [];

  // Corpo em parágrafos a partir das quebras de linha
  const bodyHtml = (msg) => msg
    .split(/\n{2,}/)
    .map(p => `<p style="margin:0 0 14px;font-size:15px;color:#e3e9f2;font-family:Arial,sans-serif;line-height:1.65">${p.replace(/\n/g, '<br>')}</p>`)
    .join('');

  for (const r of valid) {
    const lang = String(r.lang || 'pt').toLowerCase().slice(0, 2);
    const subj = pickLang(subject, lang) || pickLang(subject, 'pt');
    const msg = pickLang(message, lang) || pickLang(message, 'pt');
    const personalized = msg
      .replace(/\{nome\}/gi, r.name || '')
      .replace(/\{clube\}/gi, r.club || '');
    const inner = `<tr><td style="padding:0 28px 8px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#081733;border:1px solid #16294d;border-radius:18px">
        <tr><td style="padding:28px 30px">${bodyHtml(personalized)}</td></tr>
      </table></td></tr>`;
    const html = emailShell({
      preheader: subj,
      badge: 'BFWC 2026 · Comunicado',
      accent: '#22e06a',
      band: '#009c3b',
      title: '',
      innerHtml: inner,
    });
    try {
      const { data: sendData, error: sendErr } = await resend.emails.send({ from: fromEmail, to: r.email, subject: subj, html });
      if (sendErr) failed.push({ email: r.email, error: sendErr.message });
      else {
        sent++;
        sentRows.push({
          email: r.email.toLowerCase().trim(),
          name: r.name || null,
          club_name: r.club || null,
          language: lang,
          resend_id: sendData?.id || null,
        });
      }
    } catch (e) {
      failed.push({ email: r.email, error: e.message });
    }
  }

  // Registra o disparo no histórico (não bloqueia o envio em caso de erro)
  if (sentRows.length > 0) {
    try {
      const supabase = getSupabaseAdmin();
      const { data: blast } = await supabase.from('email_blasts')
        .insert({
          subject: pickLang(subject, 'pt'),
          description: `Comunicação do painel — por ${profile?.name || 'admin'}`,
          source: 'painel',
        })
        .select('id')
        .single();
      if (blast?.id) {
        await supabase.from('email_blast_recipients')
          .insert(sentRows.map(r => ({ ...r, blast_id: blast.id })));
      }
    } catch (e) {
      console.error('blast log error', e);
    }
  }

  return NextResponse.json({ ok: true, sent, failed, total: valid.length });
}
