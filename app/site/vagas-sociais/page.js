'use client';

import { useState, useRef } from 'react';
import { SitePageShell, PageHero } from '../SiteChrome';

const inputStyle = {
  width: '100%', boxSizing: 'border-box', padding: '13px 16px',
  background: '#f8fafc', border: '1px solid #e2e8f0',
  borderRadius: 12, color: '#0f172a', fontSize: 14, outline: 'none',
  fontFamily: "'Inter', sans-serif",
};
const labelStyle = {
  display: 'block', fontSize: 11, fontWeight: 800, letterSpacing: 1.2,
  textTransform: 'uppercase', color: '#64748b', margin: '18px 0 7px',
};

function FormSection() {
  const [form, setForm] = useState({
    project_name: '', city: '', state: '', category: '',
    contact_name: '', email: '', whatsapp: '',
    summary: '', children_count: '', fee_info: '', links: '', registry_info: '',
  });
  const [files, setFiles] = useState([]);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  function handleFiles(e) {
    const list = [...(e.target.files || [])].slice(0, 8);
    const ok = list.filter(f => f.size <= 5 * 1024 * 1024);
    if (ok.length < list.length) setError('Alguns arquivos passam de 5 MB e foram ignorados.');
    else setError('');
    setFiles(ok);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.project_name || !form.category || !form.email || !form.summary || !form.contact_name) {
      setError('Preencha os campos obrigatórios (*).');
      return;
    }
    setSending(true); setError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      files.forEach(f => fd.append('files', f));
      const res = await fetch('/api/social', { method: 'POST', body: fd });
      const d = await res.json();
      if (d.ok) setSuccess(true);
      else setError(d.message || 'Erro ao enviar. Tente novamente.');
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: 'clamp(32px, 5vw, 56px) 20px 90px', fontFamily: "'Inter', sans-serif" }}>

      {/* Card branco: texto oficial */}
      <div style={{
        background: '#ffffff', color: '#0f172a', borderRadius: 22,
        padding: 'clamp(26px, 4vw, 40px)', boxShadow: '0 20px 60px rgba(0,0,0,.35)',
      }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 18 }}>
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', padding: '5px 12px', borderRadius: 8, background: 'rgba(0,156,59,.1)', color: '#009c3b', border: '1px solid rgba(0,156,59,.25)' }}>3 vagas · Sub-12</span>
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', padding: '5px 12px', borderRadius: 8, background: 'rgba(0,156,59,.1)', color: '#009c3b', border: '1px solid rgba(0,156,59,.25)' }}>3 vagas · Sub-15</span>
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', padding: '5px 12px', borderRadius: 8, background: 'rgba(217,119,6,.1)', color: '#d97706', border: '1px solid rgba(217,119,6,.25)' }}>⏰ Prazo: 08/07 · 23h59</span>
        </div>

        <div style={{ fontSize: 14.5, lineHeight: 1.75, color: '#334155' }}>
          <p style={{ marginTop: 0 }}>
            Primeiramente, muito obrigado pelo interesse do seu projeto em participar do <strong style={{ color: '#0f172a' }}>Brasil Flag World Championship</strong>.
          </p>
          <p>
            Estamos organizando o processo de análise para as vagas sociais/isentas das categorias de base. Para avaliarmos todos os projetos da forma mais justa possível, envie as informações e os documentos pelo formulário abaixo até <strong style={{ color: '#d97706' }}>08/07, às 23h59</strong>.
          </p>
          <p>
            Após o recebimento, nossa equipe fará a análise considerando a documentação enviada, o perfil social, a atuação do projeto, o público atendido, a forma de funcionamento e os critérios definidos para as vagas sociais. Assim que a análise for concluída, <strong style={{ color: '#0f172a' }}>todos os projetos serão informados sobre o resultado</strong>.
          </p>
          <p style={{ marginBottom: 0 }}>
            A intenção é conduzir esse processo com transparência e cuidado. Dúvidas: <a href="mailto:contato@brasilflag.com" style={{ color: '#0D4BFF', fontWeight: 700 }}>contato@brasilflag.com</a>
          </p>
        </div>
      </div>

      {/* Card branco: formulário */}
      {success ? (
        <div style={{
          marginTop: 26, background: '#ffffff', borderRadius: 22, textAlign: 'center',
          padding: '46px 34px', boxShadow: '0 20px 60px rgba(0,0,0,.35)',
        }}>
          <div style={{ fontSize: 46, marginBottom: 12 }}>✅</div>
          <h2 style={{ fontSize: 23, fontWeight: 900, color: '#0f172a', margin: '0 0 10px' }}>Candidatura enviada!</h2>
          <p style={{ fontSize: 14.5, color: '#475569', lineHeight: 1.7, margin: 0, maxWidth: 480, marginLeft: 'auto', marginRight: 'auto' }}>
            Recebemos as informações do seu projeto e enviamos uma confirmação para o e-mail cadastrado.
            Nossa equipe fará a análise e todos os projetos serão informados sobre o resultado.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{
          marginTop: 26, background: '#ffffff', color: '#0f172a', borderRadius: 22,
          padding: 'clamp(26px, 4vw, 40px)', boxShadow: '0 20px 60px rgba(0,0,0,.35)',
        }}>
          <h2 style={{ fontSize: 21, fontWeight: 900, margin: '0 0 4px', letterSpacing: -.5 }}>Formulário de candidatura</h2>
          <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>Campos com * são obrigatórios.</p>

          <label style={labelStyle}>Nome do projeto / instituição *</label>
          <input style={inputStyle} value={form.project_name} onChange={e => set('project_name', e.target.value)} placeholder="Ex: Instituto Flag do Bem" />

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14 }}>
            <div>
              <label style={labelStyle}>Cidade *</label>
              <input style={inputStyle} value={form.city} onChange={e => set('city', e.target.value)} placeholder="Ex: Leme" />
            </div>
            <div>
              <label style={labelStyle}>Estado *</label>
              <input style={inputStyle} value={form.state} onChange={e => set('state', e.target.value)} placeholder="Ex: SP" />
            </div>
          </div>

          <label style={labelStyle}>Categoria que pretende disputar *</label>
          <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.category} onChange={e => set('category', e.target.value)}>
            <option value="">Selecione...</option>
            <option value="Sub-12">Sub-12</option>
            <option value="Sub-15">Sub-15</option>
            <option value="Sub-12 e Sub-15">Ambas (Sub-12 e Sub-15)</option>
          </select>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={labelStyle}>Nome do responsável *</label>
              <input style={inputStyle} value={form.contact_name} onChange={e => set('contact_name', e.target.value)} placeholder="Nome completo" />
            </div>
            <div>
              <label style={labelStyle}>WhatsApp</label>
              <input style={inputStyle} value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} placeholder="+55 11 99999-0000" />
            </div>
          </div>

          <label style={labelStyle}>E-mail *</label>
          <input style={inputStyle} type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@projeto.org" />

          <label style={labelStyle}>Breve resumo da atuação social do projeto *</label>
          <textarea style={{ ...inputStyle, minHeight: 110, resize: 'vertical', lineHeight: 1.6 }} value={form.summary} onChange={e => set('summary', e.target.value)} placeholder="Conte como o projeto atua, há quanto tempo, em qual comunidade..." />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={labelStyle}>Crianças/adolescentes atendidos *</label>
              <input style={inputStyle} value={form.children_count} onChange={e => set('children_count', e.target.value)} placeholder="Ex: 80" />
            </div>
            <div>
              <label style={labelStyle}>Cobra mensalidade ou taxa? *</label>
              <input style={inputStyle} value={form.fee_info} onChange={e => set('fee_info', e.target.value)} placeholder="Ex: Não cobra / R$ 20 simbólicos..." />
            </div>
          </div>

          <label style={labelStyle}>Redes sociais, site, matérias (links)</label>
          <textarea style={{ ...inputStyle, minHeight: 70, resize: 'vertical', lineHeight: 1.6 }} value={form.links} onChange={e => set('links', e.target.value)} placeholder={'@instagram do projeto\nhttps://...'} />

          <label style={labelStyle}>Registro em conselho, secretaria, federação ou outro órgão</label>
          <input style={inputStyle} value={form.registry_info} onChange={e => set('registry_info', e.target.value)} placeholder="Se possuir, informe qual" />

          <label style={labelStyle}>Documentos e comprovantes</label>
          <p style={{ fontSize: 12.5, color: '#64748b', margin: '0 0 8px', lineHeight: 1.6 }}>
            Estatuto, CNPJ ou documento de constituição (caso possuam) e comprovantes de atuação social: registros, fotos, matérias etc.
            <br />Até 8 arquivos · PDF, imagem ou Word · máx. 5 MB cada.
          </p>
          <input ref={fileRef} type="file" multiple accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx" onChange={handleFiles} style={{ display: 'none' }} />
          <div
            onClick={() => fileRef.current?.click()}
            style={{ ...inputStyle, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, border: '1.5px dashed #cbd5e1', color: files.length ? '#0f172a' : '#94a3b8' }}
          >
            📎 {files.length ? `${files.length} arquivo${files.length !== 1 ? 's' : ''} selecionado${files.length !== 1 ? 's' : ''} — clique para trocar` : 'Clique para escolher os arquivos'}
          </div>
          {files.length > 0 && (
            <ul style={{ margin: '8px 0 0', paddingLeft: 20, fontSize: 12.5, color: '#475569', lineHeight: 1.8 }}>
              {files.map((f, i) => <li key={i}>{f.name}</li>)}
            </ul>
          )}

          {error && (
            <div style={{ marginTop: 18, padding: '12px 16px', borderRadius: 12, background: 'rgba(220,38,38,.08)', border: '1px solid rgba(220,38,38,.25)', fontSize: 13, fontWeight: 600, color: '#dc2626' }}>
              {error}
            </div>
          )}

          <button
            type="submit" disabled={sending}
            style={{
              marginTop: 24, width: '100%', padding: '17px', borderRadius: 12, border: 'none',
              background: sending ? '#e2e8f0' : '#f4ff00', color: '#031020',
              fontSize: 14, fontWeight: 950, letterSpacing: 1.5, textTransform: 'uppercase',
              cursor: sending ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontStyle: 'italic',
            }}
          >
            {sending ? 'Enviando...' : 'Enviar candidatura →'}
          </button>
          <p style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', marginTop: 12, marginBottom: 0 }}>
            Prazo: 08/07/2026, às 23h59 · 3 vagas no Sub-12 e 3 no Sub-15
          </p>
        </form>
      )}
    </div>
  );
}

export default function VagasSociaisPage() {
  return (
    <SitePageShell
      hero={({ lang }) => (
        <PageHero
          kicker="BFWC 2026 · Categorias de base"
          title={lang === 'en' ? 'SOCIAL SPOTS' : lang === 'es' ? 'CUPOS SOCIALES' : 'VAGAS SOCIAIS'}
          subtitle={lang === 'en'
            ? '3 guaranteed spots for social projects in U-12 and 3 in U-15, with registration fee exemption.'
            : lang === 'es'
            ? '3 cupos garantizados para proyectos sociales en Sub-12 y 3 en Sub-15, con exención de la tasa de inscripción.'
            : '3 vagas garantidas para projetos sociais no Sub-12 e 3 no Sub-15, com isenção da taxa de inscrição.'}
        />
      )}
    >
      {() => <FormSection />}
    </SitePageShell>
  );
}
