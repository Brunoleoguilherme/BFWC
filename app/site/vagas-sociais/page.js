'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';

const GREEN = '#009c3b';
const YELLOW = '#f4ff00';

const inputStyle = {
  width: '100%', boxSizing: 'border-box', padding: '13px 16px',
  background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.14)',
  borderRadius: 12, color: '#fff', fontSize: 14, outline: 'none',
  fontFamily: "'Inter', sans-serif",
};
const labelStyle = {
  display: 'block', fontSize: 11, fontWeight: 800, letterSpacing: 1.5,
  textTransform: 'uppercase', color: 'rgba(255,255,255,.55)', margin: '18px 0 7px',
};

export default function VagasSociaisPage() {
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
    <div style={{ minHeight: '100vh', background: '#031020', fontFamily: "'Inter', sans-serif", color: '#fff' }}>
      {/* Hero */}
      <div style={{ position: 'relative', overflow: 'hidden', padding: 'clamp(48px, 8vw, 80px) 24px clamp(32px, 5vw, 56px)', background: '#031020', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
        <div style={{ maxWidth: 780, margin: '0 auto' }}>
          <Link href="/site" style={{ color: 'rgba(255,255,255,.5)', fontSize: 13, textDecoration: 'none', fontWeight: 600 }}>← Voltar ao site</Link>
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', color: YELLOW, margin: '26px 0 12px' }}>BFWC 2026 · Categorias de base</div>
          <h1 style={{ fontSize: 'clamp(30px, 5vw, 48px)', fontWeight: 950, fontStyle: 'italic', textTransform: 'uppercase', letterSpacing: '-0.03em', lineHeight: 1.05, margin: 0 }}>
            Vagas Sociais
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(220,230,255,.75)', lineHeight: 1.65, maxWidth: 640, marginTop: 14 }}>
            Serão <strong style={{ color: '#fff' }}>3 vagas garantidas para projetos sociais no Sub-12</strong> e <strong style={{ color: '#fff' }}>3 vagas garantidas no Sub-15</strong>, com isenção da taxa de inscrição.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 780, margin: '0 auto', padding: '36px 24px 80px' }}>
        {/* Texto oficial */}
        <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 18, padding: '26px 28px', fontSize: 14, lineHeight: 1.75, color: 'rgba(220,230,255,.85)' }}>
          <p style={{ marginTop: 0 }}>
            Primeiramente, muito obrigado pelo interesse do seu projeto em participar do <strong style={{ color: '#fff' }}>Brasil Flag World Championship</strong>.
          </p>
          <p>
            Estamos organizando o processo de análise para as vagas sociais/isentas das categorias de base. Para que possamos avaliar todos os projetos da forma mais justa possível, pedimos que enviem as informações e documentos pelo formulário abaixo <strong style={{ color: YELLOW }}>até 08/07, às 23h59</strong>.
          </p>
          <p>
            Após o recebimento, nossa equipe fará a análise considerando a documentação enviada, o perfil social, a atuação do projeto, o público atendido, a forma de funcionamento e os critérios definidos para as vagas sociais. Assim que a análise for concluída, <strong style={{ color: '#fff' }}>todos os projetos serão informados sobre o resultado</strong>.
          </p>
          <p style={{ marginBottom: 0 }}>
            Reforçamos que a intenção é conduzir esse processo com transparência e cuidado, garantindo que as vagas sejam destinadas aos projetos que mais se enquadram nesse perfil. Dúvidas: <a href="mailto:contato@brasilflag.com" style={{ color: YELLOW, fontWeight: 700 }}>contato@brasilflag.com</a>
          </p>
        </div>

        {/* Formulário */}
        {success ? (
          <div style={{ marginTop: 32, background: 'rgba(0,156,59,.12)', border: '1px solid rgba(0,156,59,.4)', borderRadius: 18, padding: '38px 32px', textAlign: 'center' }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>✅</div>
            <h2 style={{ fontSize: 22, fontWeight: 900, margin: '0 0 10px' }}>Candidatura enviada!</h2>
            <p style={{ fontSize: 14, color: 'rgba(220,230,255,.8)', lineHeight: 1.7, margin: 0 }}>
              Recebemos as informações do seu projeto e enviamos uma confirmação para o e-mail cadastrado.
              Nossa equipe fará a análise e todos os projetos serão informados sobre o resultado.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ marginTop: 32 }}>
            <h2 style={{ fontSize: 19, fontWeight: 900, margin: '0 0 4px' }}>Formulário de candidatura</h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', margin: '0 0 8px' }}>Campos com * são obrigatórios.</p>

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
              <option value="" style={{ color: '#031020' }}>Selecione...</option>
              <option value="Sub-12" style={{ color: '#031020' }}>Sub-12</option>
              <option value="Sub-15" style={{ color: '#031020' }}>Sub-15</option>
              <option value="Sub-12 e Sub-15" style={{ color: '#031020' }}>Ambas (Sub-12 e Sub-15)</option>
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
                <label style={labelStyle}>Nº aproximado de crianças/adolescentes atendidos *</label>
                <input style={inputStyle} value={form.children_count} onChange={e => set('children_count', e.target.value)} placeholder="Ex: 80" />
              </div>
              <div>
                <label style={labelStyle}>Cobra mensalidade, taxa ou contribuição? *</label>
                <input style={inputStyle} value={form.fee_info} onChange={e => set('fee_info', e.target.value)} placeholder="Ex: Não cobra / R$ 20 simbólicos..." />
              </div>
            </div>

            <label style={labelStyle}>Redes sociais, site, matérias (links)</label>
            <textarea style={{ ...inputStyle, minHeight: 70, resize: 'vertical', lineHeight: 1.6 }} value={form.links} onChange={e => set('links', e.target.value)} placeholder={'@instagram do projeto\nhttps://...'} />

            <label style={labelStyle}>Registro em conselho municipal, secretaria, federação ou outro órgão</label>
            <input style={inputStyle} value={form.registry_info} onChange={e => set('registry_info', e.target.value)} placeholder="Se possuir, informe qual" />

            <label style={labelStyle}>Documentos e comprovantes</label>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,.45)', margin: '0 0 8px', lineHeight: 1.6 }}>
              Estatuto, CNPJ ou documento de constituição (caso possuam) e comprovantes de atuação social: registros, fotos, matérias etc. Até 8 arquivos · PDF, imagem ou Word · máx. 5 MB cada.
            </p>
            <input ref={fileRef} type="file" multiple accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx" onChange={handleFiles} style={{ display: 'none' }} />
            <div
              onClick={() => fileRef.current?.click()}
              style={{ ...inputStyle, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, color: files.length ? '#fff' : 'rgba(255,255,255,.45)' }}
            >
              📎 {files.length ? `${files.length} arquivo${files.length !== 1 ? 's' : ''} selecionado${files.length !== 1 ? 's' : ''}` : 'Clique para escolher os arquivos'}
            </div>
            {files.length > 0 && (
              <ul style={{ margin: '8px 0 0', paddingLeft: 20, fontSize: 12, color: 'rgba(220,230,255,.7)', lineHeight: 1.8 }}>
                {files.map((f, i) => <li key={i}>{f.name}</li>)}
              </ul>
            )}

            {error && (
              <div style={{ marginTop: 18, padding: '12px 16px', borderRadius: 12, background: 'rgba(255,68,68,.12)', border: '1px solid rgba(255,68,68,.35)', fontSize: 13, fontWeight: 600, color: '#ff8888' }}>
                {error}
              </div>
            )}

            <button
              type="submit" disabled={sending}
              style={{
                marginTop: 24, width: '100%', padding: '17px', borderRadius: 12, border: 'none',
                background: sending ? 'rgba(244,255,0,.4)' : YELLOW, color: '#031020',
                fontSize: 14, fontWeight: 950, letterSpacing: 1.5, textTransform: 'uppercase',
                cursor: sending ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontStyle: 'italic',
              }}
            >
              {sending ? 'Enviando...' : 'Enviar candidatura →'}
            </button>
            <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,.35)', textAlign: 'center', marginTop: 12 }}>
              Prazo: 08/07/2026, às 23h59 · Vagas: 3 no Sub-12 e 3 no Sub-15
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
