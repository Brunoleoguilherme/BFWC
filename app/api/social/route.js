import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { getResend, fromEmail, emailLogoImg } from '@/lib/email';
import { randomUUID } from 'crypto';

export const runtime = 'nodejs';

// Candidaturas às vagas sociais/isentas das categorias de base (Sub-12 e Sub-15)
const NOTIFY = ['brunoleoguilherme@gmail.com', 'contato@brasilflag.com'];

const ALLOWED_TYPES = [
  'application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const MAX_FILE = 5 * 1024 * 1024; // 5 MB por arquivo
const MAX_FILES = 8;

async function uploadFile(supabase, file, appId) {
  try {
    if (!ALLOWED_TYPES.includes(file.type)) return null;
    const bytes = await file.arrayBuffer();
    if (bytes.byteLength > MAX_FILE) return null;
    const safeName = (file.name || 'arquivo').replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80);
    const path = `social/${appId}/${randomUUID().slice(0, 8)}-${safeName}`;
    const { error } = await supabase.storage
      .from('portal-media')
      .upload(path, bytes, { contentType: file.type, upsert: true });
    if (error) { console.error('social upload error', error); return null; }
    const { data } = supabase.storage.from('portal-media').getPublicUrl(path);
    return { name: file.name, url: data.publicUrl };
  } catch (e) {
    console.error('social upload exception', e);
    return null;
  }
}

function esc(s) {
  return String(s || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function adminHtml(app, files) {
  const fields = [
    ['Projeto / Instituição', app.project_name],
    ['Cidade / Estado', `${app.city || '—'} / ${app.state || '—'}`],
    ['Categoria pretendida', app.category],
    ['Responsável', app.contact_name],
    ['E-mail', app.email],
    ['WhatsApp', app.whatsapp],
    ['Resumo da atuação social', app.summary],
    ['Crianças/adolescentes atendidos', app.children_count],
    ['Cobrança de mensalidade/taxa', app.fee_info],
    ['Links (redes, site, matérias)', app.links],
    ['Registro em conselho/órgão', app.registry_info],
  ];
  return `
  <div style="font-family:Arial,sans-serif;background:#031020;color:#fff;padding:36px 26px;max-width:620px;margin:0 auto;border-radius:16px">
    ${emailLogoImg(100, 'margin:0 0 10px')}
    <p style="color:rgba(255,255,255,.4);font-size:12px;margin:0 0 22px">Vagas sociais · Categorias de base</p>
    <h2 style="font-size:21px;font-weight:800;margin:0 0 4px">📋 Nova candidatura à vaga social</h2>
    <p style="font-size:15px;color:#f4ff00;font-weight:700;margin:0 0 22px">${esc(app.project_name)} — ${esc(app.category)}</p>
    <table style="width:100%;border-collapse:collapse;background:#081733;border:1px solid #16294d;border-radius:12px;overflow:hidden">
      ${fields.map(([k, v]) => `
      <tr>
        <td style="padding:9px 14px;font-size:11px;color:rgba(255,255,255,.45);text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid #10203f;white-space:nowrap;vertical-align:top">${k}</td>
        <td style="padding:9px 14px;font-size:13px;color:#e3e9f2;border-bottom:1px solid #10203f">${esc(v) || '—'}</td>
      </tr>`).join('')}
    </table>
    ${files.length ? `
    <h3 style="font-size:14px;font-weight:800;margin:22px 0 10px;color:#f4ff00">📎 Documentos enviados (${files.length})</h3>
    <ul style="margin:0;padding-left:18px;color:#c8d8f5;font-size:13px;line-height:1.9">
      ${files.map(f => `<li><a href="${f.url}" style="color:#7fb2ff">${esc(f.name)}</a></li>`).join('')}
    </ul>` : '<p style="color:rgba(255,255,255,.4);font-size:13px;margin-top:18px">Nenhum documento anexado.</p>'}
    <p style="color:rgba(255,255,255,.35);font-size:11px;margin-top:22px">Responda diretamente este e-mail para falar com o projeto (reply-to configurado).</p>
  </div>`;
}

function ackHtml(app) {
  return `
  <div style="font-family:Arial,sans-serif;max-width:540px;margin:auto;color:#0a1628;padding:8px">
    ${emailLogoImg(96, 'margin:0 0 14px')}
    <h2 style="color:#0a7d28">Candidatura recebida! ✅</h2>
    <p>Olá, <strong>${esc(app.contact_name || app.project_name)}</strong>!</p>
    <p>Recebemos a candidatura do projeto <strong>${esc(app.project_name)}</strong> às vagas sociais das categorias de base do <strong>Brasil Flag World Championship 2026</strong> (${esc(app.category)}).</p>
    <p>Nossa equipe fará a análise considerando a documentação enviada, o perfil social, a atuação do projeto, o público atendido e os critérios definidos para as vagas. Assim que a análise for concluída, todos os projetos serão informados sobre o resultado.</p>
    <p>Se precisar complementar alguma informação, basta responder este e-mail.</p>
    <p style="color:#667">Equipe BFWC 2026 · contato@brasilflag.com</p>
  </div>`;
}

export async function POST(req) {
  try {
    const fd = await req.formData();

    const app = {
      project_name: (fd.get('project_name') || '').toString().trim().slice(0, 200),
      city: (fd.get('city') || '').toString().trim().slice(0, 100),
      state: (fd.get('state') || '').toString().trim().slice(0, 60),
      category: (fd.get('category') || '').toString().trim().slice(0, 40),
      contact_name: (fd.get('contact_name') || '').toString().trim().slice(0, 150),
      email: (fd.get('email') || '').toString().trim().toLowerCase().slice(0, 150),
      whatsapp: (fd.get('whatsapp') || '').toString().trim().slice(0, 40),
      summary: (fd.get('summary') || '').toString().trim().slice(0, 3000),
      children_count: (fd.get('children_count') || '').toString().trim().slice(0, 100),
      fee_info: (fd.get('fee_info') || '').toString().trim().slice(0, 500),
      links: (fd.get('links') || '').toString().trim().slice(0, 1500),
      registry_info: (fd.get('registry_info') || '').toString().trim().slice(0, 500),
    };

    if (!app.project_name || !app.category || !app.email || !app.summary) {
      return NextResponse.json({ ok: false, message: 'Preencha os campos obrigatórios.' }, { status: 400 });
    }
    if (!/\S+@\S+\.\S+/.test(app.email)) {
      return NextResponse.json({ ok: false, message: 'E-mail inválido.' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const appId = randomUUID();

    // Uploads (documentos + comprovantes)
    const rawFiles = fd.getAll('files').filter(f => f && typeof f === 'object' && f.size > 0).slice(0, MAX_FILES);
    const files = [];
    for (const f of rawFiles) {
      const up = await uploadFile(supabase, f, appId);
      if (up) files.push(up);
    }

    // Persiste (best-effort: o e-mail é a fonte principal)
    try {
      await supabase.from('social_applications').insert({
        id: appId, ...app, file_urls: files,
      });
    } catch (e) {
      console.error('social insert error', e);
    }

    const resend = getResend();
    await Promise.allSettled([
      resend.emails.send({
        from: fromEmail,
        to: NOTIFY,
        reply_to: app.email,
        subject: `📋 Vaga social — ${app.project_name} (${app.category})`,
        html: adminHtml(app, files),
      }),
      resend.emails.send({
        from: fromEmail,
        to: app.email,
        subject: 'BFWC 2026 — Recebemos a candidatura do seu projeto às vagas sociais',
        html: ackHtml(app),
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('social route error', err);
    return NextResponse.json({ ok: false, message: 'Erro ao enviar. Tente novamente.' }, { status: 500 });
  }
}
