'use client';

import { useState, useEffect } from 'react';

const fmtDate = (d) => d ? new Date(d).toLocaleString('pt-BR') : '';

export default function VagasSociaisPage() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [open, setOpen] = useState(null);

  useEffect(() => {
    fetch('/api/admin/social')
      .then(r => r.json())
      .then(d => { if (d.ok) setApps(d.applications || []); else setErr(d.error || 'Erro ao carregar.'); })
      .catch(e => setErr(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: '28px 32px', maxWidth: 900, fontFamily: "'Inter', sans-serif" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', color: '#009c3b', marginBottom: 8 }}>Times</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', margin: 0 }}>Vagas Sociais</h1>
          {!loading && !err && (
            <span style={{ padding: '3px 10px', borderRadius: 20, background: 'rgba(0,156,59,.1)', color: '#009c3b', fontSize: 11, fontWeight: 900, border: '1px solid rgba(0,156,59,.25)' }}>
              {apps.length} candidatura{apps.length === 1 ? '' : 's'}
            </span>
          )}
        </div>
        <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>Projetos sociais candidatos às vagas das categorias de base.</p>
      </div>

      {err && <div style={{ padding: 16, borderRadius: 12, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 13, fontWeight: 600, marginBottom: 16 }}>{err}</div>}

      {loading ? (
        <div style={{ color: '#94a3b8', fontSize: 13 }}>Carregando...</div>
      ) : apps.length === 0 ? (
        <div style={{ color: '#94a3b8', fontSize: 13 }}>Nenhuma candidatura ainda.</div>
      ) : apps.map(a => {
        const isOpen = open === a.id;
        return (
          <div key={a.id} style={{ padding: '16px 20px', marginBottom: 10, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 800, fontSize: 15, color: '#0f172a' }}>{a.project_name}</span>
                  {a.category && <span style={{ fontSize: 10, fontWeight: 800, color: '#0D4BFF', background: 'rgba(13,75,255,.1)', border: '1px solid rgba(13,75,255,.2)', borderRadius: 6, padding: '2px 8px' }}>{a.category}</span>}
                </div>
                <div style={{ fontSize: 12, color: '#64748b', display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                  {a.contact_name && <span>👤 {a.contact_name}</span>}
                  {(a.city || a.state) && <span>📍 {[a.city, a.state].filter(Boolean).join(' / ')}</span>}
                  {a.email && <span>✉ {a.email}</span>}
                  {a.whatsapp && <span>📱 {a.whatsapp}</span>}
                  {a.children_count && <span>🧒 {a.children_count}</span>}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>{fmtDate(a.created_at)}</span>
                <button onClick={() => setOpen(isOpen ? null : a.id)} style={{ padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0', cursor: 'pointer', fontFamily: 'inherit' }}>
                  {isOpen ? '▲' : '▼'} Detalhes
                </button>
              </div>
            </div>
            {isOpen && (
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #e2e8f0', fontSize: 13, color: '#475569', lineHeight: 1.7 }}>
                {a.summary && <div style={{ marginBottom: 8 }}><strong style={{ color: '#334155' }}>Resumo:</strong> {a.summary}</div>}
                {a.fee_info && <div><strong style={{ color: '#334155' }}>Mensalidade / taxa:</strong> {a.fee_info}</div>}
                {a.registry_info && <div><strong style={{ color: '#334155' }}>Registro / CNPJ:</strong> {a.registry_info}</div>}
                {a.links && <div style={{ wordBreak: 'break-word' }}><strong style={{ color: '#334155' }}>Links:</strong> {a.links}</div>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
