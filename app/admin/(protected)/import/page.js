'use client';

import { useState } from 'react';

const EMPTY = {
  club_name: '', country: 'Brasil', city: '', contact_name: '',
  email: '', whatsapp: '', category: '', athletes_count: '',
  contact_role: '', notes: '', travel_support: 'no',
  hosting_preference: '', competitive_history: '', language: 'pt',
};

export default function ImportPage() {
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null); // {ok, msg}
  const [history, setHistory] = useState([]);

  function set(field, val) {
    setForm(f => ({ ...f, [field]: val }));
  }

  async function submit(e) {
    e.preventDefault();
    if (!form.club_name || !form.contact_name) return;
    setSaving(true);
    setResult(null);

    try {
      const res = await fetch('/api/admin/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setResult({ ok: true, msg: `✓ ${form.club_name} inserido com sucesso!` });
        setHistory(h => [{ ...form, id: Date.now() }, ...h]);
        setForm({ ...EMPTY });
      } else {
        setResult({ ok: false, msg: data.error || 'Erro ao inserir' });
      }
    } catch (err) {
      setResult({ ok: false, msg: err.message });
    }
    setSaving(false);
  }

  const inputStyle = {
    width: '100%', padding: '11px 14px', boxSizing: 'border-box',
    background: '#f8fafc', border: '1px solid #e2e8f0',
    borderRadius: 10, color: '#0f172a', fontSize: 13, outline: 'none',
    fontFamily: "'Inter', sans-serif",
  };

  const labelStyle = {
    display: 'block', fontSize: 10, fontWeight: 800, letterSpacing: 2,
    textTransform: 'uppercase', color: '#94a3b8', marginBottom: 5,
  };

  const inp = (label, field, props = {}) => (
    <div style={{ marginBottom: 14 }}>
      <label style={labelStyle}>{label}</label>
      <input
        value={form[field]}
        onChange={e => set(field, e.target.value)}
        style={inputStyle}
        {...props}
      />
    </div>
  );

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: '#0f172a', maxWidth: 900 }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', color: '#009c3b', marginBottom: 8 }}>CRM</div>
        <h1 style={{ fontSize: 36, fontWeight: 900, letterSpacing: -1.5, color: '#0f172a' }}>Importar Time</h1>
        <p style={{ fontSize: 13, color: '#64748b', marginTop: 6 }}>
          Cadastre manualmente times que enviaram inscrição por e-mail ou outro canal.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'flex-start' }}>
        {/* Form */}
        <form onSubmit={submit} style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0', borderRadius: 20, padding: 28,
          boxShadow: '0 1px 4px rgba(0,0,0,.06)',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
            {inp('Nome do Clube *', 'club_name', { required: true })}
            {inp('País *', 'country', { required: true })}
            {inp('Cidade *', 'city', { required: true })}
            {inp('Nome do Contato *', 'contact_name', { required: true })}
            {inp('E-mail', 'email', { type: 'email' })}
            {inp('WhatsApp', 'whatsapp')}
            {inp('Cargo / Função', 'contact_role')}
            {inp('Nº de Atletas', 'athletes_count', { type: 'number', min: 0 })}
            {inp('Categoria (Flag, Touch, etc.)', 'category')}

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Apoio de Viagem</label>
              <select
                value={form.travel_support}
                onChange={e => set('travel_support', e.target.value)}
                style={inputStyle}
              >
                <option value="no">Não necessário</option>
                <option value="yes">Sim, precisa de apoio</option>
              </select>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Idioma</label>
              <select
                value={form.language}
                onChange={e => set('language', e.target.value)}
                style={inputStyle}
              >
                <option value="pt">Português</option>
                <option value="en">English</option>
                <option value="es">Español</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Histórico Competitivo</label>
            <textarea
              value={form.competitive_history}
              onChange={e => set('competitive_history', e.target.value)}
              rows={2}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Observações / Notas</label>
            <textarea
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              rows={2}
              style={{ ...inputStyle, resize: 'vertical' }}
              placeholder="Anotações internas sobre este time..."
            />
          </div>

          {result && (
            <div style={{
              padding: '12px 16px', borderRadius: 10, marginBottom: 16,
              background: result.ok ? 'rgba(32,227,63,.08)' : 'rgba(255,68,68,.08)',
              border: `1px solid ${result.ok ? 'rgba(32,227,63,.25)' : 'rgba(255,68,68,.25)'}`,
              color: result.ok ? '#009c3b' : '#ff6666', fontSize: 13, fontWeight: 600,
            }}>
              {result.msg}
            </div>
          )}

          <button
            type="submit"
            disabled={saving || !form.club_name}
            style={{
              width: '100%', padding: 14,
              background: saving ? 'rgba(244,255,0,.3)' : '#009c3b',
              color: '#031020', border: 'none', borderRadius: 12,
              fontSize: 13, fontWeight: 900, letterSpacing: 1.5, textTransform: 'uppercase',
              cursor: saving || !form.club_name ? 'not-allowed' : 'pointer',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {saving ? 'Salvando...' : 'Adicionar Time'}
          </button>
        </form>

        {/* History */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0', borderRadius: 20, overflow: 'hidden',
          boxShadow: '0 1px 4px rgba(0,0,0,.06)',
          position: 'sticky', top: 80,
        }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
              Adicionados nesta sessão ({history.length})
            </span>
          </div>
          {history.length === 0 ? (
            <div style={{ padding: 28, textAlign: 'center', color: '#94a3b8', fontSize: 12 }}>
              Nenhum time adicionado ainda
            </div>
          ) : (
            history.map(t => (
              <div key={t.id} style={{
                padding: '12px 20px', borderBottom: '1px solid #f1f5f9',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#009c3b', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{t.club_name}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{t.city}, {t.country}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
