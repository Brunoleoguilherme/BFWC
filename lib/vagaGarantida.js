import { getSupabaseAdmin } from './supabaseAdmin';
import { getResend, fromEmail, emailLogoImg } from './email';
import { totalCentsForTeam } from './installments';
import { PORTAL_TIMES_OPEN_AT } from './registrationWindow';

// Destinatários internos do aviso de vaga garantida (MKT + organização)
const VAGA_RECIPIENTS = ['dayenenogueira5@gmail.com', 'brunoleoguilherme@gmail.com'];

const BRL = (cents) => ((cents || 0) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const fmtDate = (d) => new Date(d).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

/**
 * Dispara o e-mail interno quando um time garante a vaga (1ª parcela paga).
 * Idempotente: usa portal_teams.vaga_notified_at como trava atômica —
 * só o primeiro fluxo (Stripe, Pix webhook ou polling) envia.
 * Nunca lança erro (best-effort).
 */
export async function notifyVagaGarantida(teamId) {
  try {
    if (!teamId) return;
    const supabase = getSupabaseAdmin();

    // Precisa ter ao menos 1 parcela paga
    const { data: insts } = await supabase
      .from('payment_installments')
      .select('number, status, amount_cents, plan_size')
      .eq('team_id', teamId);
    const paid = (insts || []).filter(i => i.status === 'paid');
    if (paid.length === 0) {
      // Sem parcela paga: só segue se o time tiver isenção concedida
      const { data: chk } = await supabase
        .from('portal_teams').select('exempted_at').eq('id', teamId).single();
      if (!chk?.exempted_at) return;
    }

    // Trava atômica: marca vaga_notified_at somente se ainda for null
    const { data: team } = await supabase
      .from('portal_teams')
      .update({ vaga_notified_at: new Date().toISOString() })
      .eq('id', teamId)
      .is('vaga_notified_at', null)
      .select('*')
      .single();
    if (!team) return; // já notificado por outro fluxo

    // ── Dados extras para o e-mail ─────────────────────────────────────
    const [rosterRes, preRes, notifiedRes] = await Promise.all([
      supabase.from('team_athletes').select('id', { count: 'exact', head: true }).eq('team_id', teamId),
      team.email
        ? supabase.from('club_interests').select('id, created_at, athletes_count, competitive_history, notes').ilike('email', team.email).maybeSingle()
        : Promise.resolve({ data: null }),
      supabase.from('portal_teams').select('id, country').not('vaga_notified_at', 'is', null),
    ]);

    const roster = rosterRes.count || 0;
    let pre = preRes.data || null;
    // fallback: alguns times pagam com e-mail diferente da pré-inscrição — casa pelo nome
    if (!pre && team.club_name) {
      const { data: preByName } = await supabase
        .from('club_interests')
        .select('id, created_at, athletes_count, competitive_history, notes')
        .ilike('club_name', team.club_name.trim())
        .maybeSingle();
      pre = preByName || null;
    }
    const notified = notifiedRes.data || [];
    const ordem = notified.length; // inclui o próprio time (recém-marcado)

    const norm = (s) => (s || '').trim().toLowerCase();
    const firstOfCountry = !notified.some(t => t.id !== teamId && norm(t.country) === norm(team.country));

    const total = totalCentsForTeam(team);
    const pago = team.amount_paid_cents || 0;
    const planSize = team.payment_plan || paid[0]?.plan_size || null;
    const option = String(team.payment_option || '1') === '2' ? '2' : '1';

    // Horas desde a abertura das inscrições
    const horasDesdeAbertura = Math.max(0, Math.round((Date.now() - new Date(PORTAL_TIMES_OPEN_AT).getTime()) / 36e5));

    // ── Curiosidades (geradas dos dados) ───────────────────────────────
    const curiosidades = [];
    curiosidades.push(`É o <strong>${ordem}º time</strong> a garantir vaga no BFWC 2026.`);
    if (firstOfCountry && team.country) {
      curiosidades.push(`Primeiro time ${norm(team.country) === 'brasil' ? 'do Brasil' : `de ${team.country.trim()}`} a garantir vaga. 🌎`);
    }
    if (pre) {
      curiosidades.push(`Era pré-inscrito desde <strong>${new Date(pre.created_at).toLocaleDateString('pt-BR')}</strong> — estava esperando as inscrições abrirem.`);
    } else {
      curiosidades.push(`<strong>Não era pré-inscrito</strong> — chegou direto na abertura e já garantiu a vaga.`);
    }
    curiosidades.push(`Garantiu a vaga <strong>${horasDesdeAbertura < 48 ? `${horasDesdeAbertura}h` : `${Math.round(horasDesdeAbertura / 24)} dias`}</strong> depois da abertura das inscrições.`);
    if (roster > 0) curiosidades.push(`Já cadastrou <strong>${roster} atleta${roster !== 1 ? 's' : ''}</strong> no portal.`);

    const fields = [
      ['Time', team.club_name],
      ['Cidade / País', [team.city, team.country].filter(Boolean).join(' · ')],
      ['Categorias', team.category || '—'],
      ['Plano', `Opção ${option}${option === '2' && team.athletes_paid_qty ? ` · ${team.athletes_paid_qty} atletas contratados` : ''}${planSize ? ` · ${planSize}x` : ''}`],
      ['Pagamento', team.exempted_at
        ? `🎁 ISENTO — ${team.exemption_reason || 'isenção concedida'}`
        : `${BRL(pago)} de ${BRL(total)} (${paid.length}${planSize ? `/${planSize}` : ''} parcela${paid.length !== 1 ? 's' : ''} paga${paid.length !== 1 ? 's' : ''})`],
      ['Atletas no portal', String(roster)],
      ['Instagram', team.instagram ? `<a href="https://instagram.com/${String(team.instagram).replace(/^@/, '')}" style="color:#7fb2ff">${team.instagram}</a>` : '—'],
      ['Descrição do time', team.description || '—'],
      ...(pre?.competitive_history ? [['Histórico (pré-inscrição)', pre.competitive_history]] : []),
      ...(pre?.notes ? [['Observações (pré-inscrição)', pre.notes]] : []),
      ['Contato', team.contact_name || '—'],
      ['E-mail', team.email || '—'],
      ['WhatsApp', team.whatsapp || '—'],
      ['Idioma', (team.preferred_language || 'pt').toUpperCase()],
      ['Cadastro no portal', fmtDate(team.created_at)],
    ];

    const html = `
    <div style="font-family:Arial,sans-serif;background:#031020;color:#fff;padding:36px 26px;max-width:600px;margin:0 auto;border-radius:16px">
      ${emailLogoImg(100, 'margin:0 0 10px')}
      <p style="color:rgba(255,255,255,.4);font-size:12px;margin:0 0 22px">Aviso interno · Organização + Marketing</p>

      <h2 style="font-size:22px;font-weight:800;margin:0 0 4px">🎉 Vaga garantida #${ordem}</h2>
      <p style="font-size:16px;color:#f4ff00;font-weight:700;margin:0 0 22px">${team.club_name}</p>

      <table style="width:100%;border-collapse:collapse;background:#081733;border:1px solid #16294d;border-radius:12px;overflow:hidden">
        ${fields.map(([k, v]) => `
        <tr>
          <td style="padding:9px 14px;font-size:11px;color:rgba(255,255,255,.45);text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid #10203f;white-space:nowrap">${k}</td>
          <td style="padding:9px 14px;font-size:13px;color:#e3e9f2;border-bottom:1px solid #10203f">${v}</td>
        </tr>`).join('')}
      </table>

      <h3 style="font-size:14px;font-weight:800;margin:24px 0 10px;color:#f4ff00">💡 Curiosidades para o post</h3>
      <ul style="margin:0;padding-left:18px;color:#c8d8f5;font-size:13px;line-height:1.8">
        ${curiosidades.map(c => `<li>${c}</li>`).join('')}
      </ul>

      <div style="margin:26px 0 6px">
        ${team.logo_url
          ? `<a href="${team.logo_url}" style="display:inline-block;padding:12px 24px;background:#f4ff00;color:#031020;font-weight:900;font-size:13px;text-decoration:none;border-radius:10px;margin-right:10px">⬇ Baixar logo do time</a>`
          : `<span style="display:inline-block;padding:12px 24px;background:#10203f;color:rgba(255,255,255,.5);font-size:13px;border-radius:10px;margin-right:10px">Time não enviou logo</span>`}
        <a href="https://www.brasilflagworldchampionship.com/admin/teams" style="display:inline-block;padding:12px 24px;background:#0D4BFF;color:#fff;font-weight:800;font-size:13px;text-decoration:none;border-radius:10px">Ver no painel →</a>
      </div>

      <p style="color:rgba(255,255,255,.35);font-size:11px;margin-top:20px">E-mail automático enviado quando a 1ª parcela é confirmada.</p>
    </div>`;

    await getResend().emails.send({
      from: fromEmail,
      to: VAGA_RECIPIENTS,
      subject: `🎉 VAGA GARANTIDA #${ordem} — ${team.club_name}${team.country ? ` (${team.country.trim()})` : ''}`,
      html,
    });
  } catch (e) {
    console.error('notifyVagaGarantida error', e.message);
  }
}
