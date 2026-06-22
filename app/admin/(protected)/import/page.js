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

  const inp = (label, field, props = {}) => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,.3)', marginBottom: 5 }}>
        {label}
      </label>
      <input
        value={form[field]}
        onChange={e => set(field, e.target.value)}
        style={{
          width: '100%', padding: '11px 14px', boxSizing: 'border-box',
          background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)',
          borderRadius: 10, color: '#fff', fontSize: 13, outline: 'none',
          fontFamily: "'Inter', sans-serif",
        }}
        {...props}
      />
    </div>
  );

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: '#fff', maxWidth: 900 }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', color: '#f4ff00', marginBottom: 8 }}>CRM</div>
        <h1 style={{ fontSize: 36, fontWeight: 900, letterSpacing: -1.5, color: '#fff' }}>Importar Time</h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,.3)', marginTop: 6 }}>
          Cadastre manualmente times que enviaram inscrição por e-mail ou outro canal.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'flex-start' }}>
        {/* Form */}
        <form onSubmit={submit} style={{
          background: 'linear-gradient(145deg, rgba(6,27,58,.5), rgba(2,8,22,.5))',
          border: '1px solid rgba(255,255,255,.07)', borderRadius: 20, padding: 28,
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
              <label style={{ display: 'block', fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,.3)', marginBottom: 5 }}>
                Apoio de Viagem
              </label>
              <select
                value={form.travel_support}
                onChange={e => set('travel_support', e.target.value)}
                style={{
                  width: '100%', padding: '11px 14px', boxSizing: 'border-box',
                  background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)',
                  borderRadius: 10, color: '#fff', fontSize: 13, outline: 'none',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                <option value="no">Não necessário</option>
                <option value="yes">Sim, precisa de apoio</option>
              </select>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,.3)', marginBottom: 5 }}>
                Idioma
              </label>
              <select
                value={form.language}
                onChange={e => set('language', e.target.value)}
                style={{
                  width: '100%', padding: '11px 14px', boxSizing: 'border-box',
                  background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)',
                  borderRadius: 10, color: '#fff', fontSize: 13, outline: 'none',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                <option value="pt">Português</option>
                <option value="en">English</option>
                <option value="es">Español</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,.3)', marginBottom: 5 }}>
              Histórico Competitivo
            </label>
            <textarea
              value={form.competitive_history}
              onChange={e => set('competitive_history', e.target.value)}
              rows={2}
              style={{
                width: '100%', padding: '11px 14px', boxSizing: 'border-box',
                background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)',
                borderRadius: 10, color: '#fff', fontSize: 13, outline: 'none', resize: 'vertical',
                fontFamily: "'Inter', sans-serif",
              }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,.3)', marginBottom: 5 }}>
              Observações / Notas
            </label>
            <textarea
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              rows={2}
              style={{
                width: '100%', padding: '11px 14px', boxSizing: 'border-box',
                background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)',
                borderRadius: 10, color: '#fff', fontSize: 13, outline: 'none', resize: 'vertical',
                fontFamily: "'Inter', sans-serif",
              }}
              placeholder="Anotações internas sobre este time..."
            />
          </div>

          {result && (
            <div style={{
              padding: '12px 16px', borderRadius: 10, marginBottom: 16,
              background: result.ok ? 'rgba(32,227,63,.08)' : 'rgba(255,68,68,.08)',
              border: `1px solid ${result.ok ? 'rgba(32,227,63,.25)' : 'rgba(255,68,68,.25)'}`,
              color: result.ok ? '#20e33f' : '#ff6666', fontSize: 13, fontWeight: 600,
            }}>
              {result.msg}
            </div>
          )}

          <button
            type="submit"
            disabled={saving || !form.club_name}
            style={{
              width: '100%', padding: 14,
              background: saving ? 'rgba(244,255,0,.3)' : '#f4ff00',
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
          background: 'linear-gradient(145deg, rgba(6,27,58,.5), rgba(2,8,22,.5))',
          border: '1px solid rgba(255,255,255,.07)', borderRadius: 20, overflow: 'hidden',
          position: 'sticky', top: 80,
        }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,.07)' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>
              Adicionados nesta sessão ({history.length})
            </span>
          </div>
          {history.length === 0 ? (
            <div style={{ padding: 28, textAlign: 'center', color: 'rgba(255,255,255,.18)', fontSize: 12 }}>
              Nenhum time adicionado ainda
            </div>
          ) : (
            history.map(t => (
              <div key={t.id} style={{
                padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,.04)',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#20e33f', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{t.club_name}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,.3)' }}>{t.city}, {t.country}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
