'use client';

import { useState, useEffect, useMemo } from 'react';

const AUDIENCES = [
  { key: 'pre_inscritos', label: 'Pré-inscritos', color: '#a855f7' },
  { key: 'inscritos',     label: 'Inscritos',     color: '#ea580c' },
  { key: 'confirmados',   label: 'Confirmados',   color: '#009c3b' },
  { key: 'em_atraso',     label: 'Em atraso',     color: '#ef4444' },
];

const TEMPLATES = [
  { key: 'lembrete_parcela', label: 'Lembrete de parcela', subject: 'Lembrete: parcela da inscrição — BFWC 2026',
    message: 'Olá, {clube}!\n\nEste é um lembrete amigável sobre a parcela da inscrição da sua equipe no Brasil Flag World Championship 2026.\n\nAcesse o portal do clube para efetuar o pagamento e garantir sua vaga.\n\nQualquer dúvida, é só responder este e-mail.' },
  { key: 'boas_vindas', label: 'Boas-vindas', subject: 'Bem-vindos ao BFWC 2026!',
    message: 'Olá, {clube}!\n\nQue alegria ter vocês no Brasil Flag World Championship 2026. Fiquem atentos ao e-mail para novidades sobre o evento em Leme, SP.\n\nVamos juntos!' },
  { key: 'aviso_geral', label: 'Aviso geral', subject: 'Comunicado — BFWC 2026',
    message: 'Olá, {clube}!\n\n[escreva o comunicado aqui]\n\nEquipe BFWC 2026.' },
];

export default function CRMPage() {
  const [audiences, setAudiences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('viewer');

  const [activeFilters, setActiveFilters] = useState(['pre_inscritos']);
  const [selected, setSelected] = useState([]); // emails
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetch('/api/admin/me').then(r => r.json()).then(d => setRole(d.role || 'viewer'));
    fetch('/api/admin/recipients').then(r => r.json()).then(d => {
      if (d.ok) setAudiences(d.audiences);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Lista de destinatários combinada pelas audiências ativas (dedup por email)
  const list = useMemo(() => {
    if (!audiences) return [];
    const seen = new Map();
    activeFilters.forEach(f => {
      (audiences[f] || []).forEach(r => {
        const k = r.email.toLowerCase();
        if (!seen.has(k)) seen.set(k, { ...r, _aud: [f] });
        else seen.get(k)._aud.push(f);
      });
    });
    return [...seen.values()];
  }, [audiences, activeFilters]);

  function toggleFilter(k) {
    setActiveFilters(prev => prev.includes(k) ? prev.filter(x => x !== k) : [...prev, k]);
    setSelected([]);
  }
  function toggleOne(email) {
    setSelected(prev => prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]);
  }
  function selectAll() { setSelected(list.map(r => r.email)); }
  function clearAll() { setSelected([]); }

  function applyTemplate(t) { setSubject(t.subject); setMessage(t.message); }

  const chosen = useMemo(() => list.filter(r => selected.includes(r.email)), [list, selected]);

  async function send() {
    if (role === 'viewer' || chosen.length === 0 || !subject.trim() || !message.trim()) return;
    setSending(true); setResult(null);
    const r = await fetch('/api/admin/broadcast', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipients: chosen.map(c => ({ email: c.email, name: c.name, club: c.club })), subject, message }),
    });
    const d = await r.json();
    setSending(false);
    if (d.ok) { setResult({ ok: true, sent: d.sent, failed: d.failed?.length || 0 }); setSelected([]); }
    else setResult({ ok: false, error: d.error || 'Erro ao enviar.' });
  }

  const audColor = (k) => AUDIENCES.find(a => a.key === k)?.color || '#64748b';
  const S = {
    label: { fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: '#94a3b8', marginBottom: 10 },
    input: { width: '100%', padding: '12px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, color: '#0f172a', fontSize: 13, outline: 'none', fontFamily: "'Inter',sans-serif", boxSizing: 'border-box' },
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: '#0f172a' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', color: '#009c3b', marginBottom: 8 }}>E-mail</div>
        <h1 style={{ fontSize: 36, fontWeight: 900, letterSpacing: -1.5, color: '#0f172a' }}>Comunicação</h1>
      </div>

      {/* Filtros de audiência */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
        {AUDIENCES.map(a => {
          const on = activeFilters.includes(a.key);
          const count = audiences?.[a.key]?.length ?? 0;
          return (
            <button key={a.key} onClick={() => toggleFilter(a.key)} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px', borderRadius: 12,
              fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              background: on ? a.color + '18' : '#fff', color: on ? a.color : '#475569',
              border: `1px solid ${on ? a.color + '50' : '#e2e8f0'}`, transition: 'all .15s',
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: a.color }} />
              {a.label}
              <span style={{ fontSize: 11, fontWeight: 800, padding: '1px 8px', borderRadius: 20, background: on ? a.color + '25' : '#f1f5f9', color: on ? a.color : '#94a3b8' }}>{loading ? '·' : count}</span>
            </button>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 24, alignItems: 'flex-start' }}>
        {/* Lista de destinatários */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 20, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
          <div style={{ padding: '16px 22px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>Destinatários ({list.length})</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={selectAll} style={{ fontSize: 12, fontWeight: 600, color: '#009c3b', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Selecionar todos</button>
              <span style={{ color: '#e2e8f0' }}>·</span>
              <button onClick={clearAll} style={{ fontSize: 12, fontWeight: 600, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Limpar</button>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Carregando...</div>
          ) : list.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Nenhum destinatário nesta seleção de filtros.</div>
          ) : (
            <div style={{ maxHeight: 520, overflowY: 'auto' }}>
              {list.map(r => {
                const isSel = selected.includes(r.email);
                return (
                  <div key={r.email} onClick={() => toggleOne(r.email)} style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '13px 22px',
                    background: isSel ? 'rgba(0,156,59,.05)' : 'transparent',
                    borderBottom: '1px solid #f1f5f9', cursor: 'pointer',
                  }}>
                    <div style={{ width: 18, height: 18, borderRadius: 6, flexShrink: 0,
                      background: isSel ? '#009c3b' : '#f1f5f9', border: `1px solid ${isSel ? '#009c3b' : '#e2e8f0'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#fff', fontWeight: 900 }}>{isSel ? '✓' : ''}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{r.club || r.name || r.email}</div>
                      <div style={{ fontSize: 11, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.email}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                      {r._aud.map(a => (
                        <span key={a} style={{ width: 8, height: 8, borderRadius: '50%', background: audColor(a) }} title={AUDIENCES.find(x => x.key === a)?.label} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Composer */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 20, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,.06)', position: 'sticky', top: 80 }}>
          <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 6, letterSpacing: -.3 }}>Escrever mensagem</div>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 18 }}>
            <strong style={{ color: selected.length ? '#009c3b' : '#94a3b8' }}>{selected.length}</strong> selecionado{selected.length !== 1 ? 's' : ''} · use <code style={{ background: '#f1f5f9', padding: '1px 5px', borderRadius: 4 }}>{'{clube}'}</code> e <code style={{ background: '#f1f5f9', padding: '1px 5px', borderRadius: 4 }}>{'{nome}'}</code>
          </div>

          <div style={{ ...S.label, marginBottom: 8 }}>Modelos rápidos</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 18 }}>
            {TEMPLATES.map(t => (
              <button key={t.key} onClick={() => applyTemplate(t)} style={{ fontSize: 11.5, fontWeight: 700, padding: '7px 12px', borderRadius: 9, background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#475569', cursor: 'pointer', fontFamily: 'inherit' }}>{t.label}</button>
            ))}
          </div>

          <div style={S.label}>Assunto</div>
          <input style={{ ...S.input, marginBottom: 14 }} value={subject} onChange={e => setSubject(e.target.value)} placeholder="Assunto do e-mail" />

          <div style={S.label}>Mensagem</div>
          <textarea style={{ ...S.input, minHeight: 160, resize: 'vertical', marginBottom: 16, lineHeight: 1.5 }} value={message} onChange={e => setMessage(e.target.value)} placeholder="Escreva sua mensagem... (uma linha em branco separa parágrafos)" />

          {result && (
            <div style={{ padding: '11px 14px', borderRadius: 10, marginBottom: 12, fontSize: 12.5, fontWeight: 600,
              background: result.ok ? 'rgba(0,156,59,.1)' : 'rgba(239,68,68,.1)', color: result.ok ? '#009c3b' : '#dc2626',
              border: `1px solid ${result.ok ? 'rgba(0,156,59,.25)' : 'rgba(239,68,68,.25)'}` }}>
              {result.ok ? `✓ Enviado para ${result.sent} destinatário(s)${result.failed ? ` · ${result.failed} falha(s)` : ''}.` : `❌ ${result.error}`}
            </div>
          )}

          {role === 'viewer' ? (
            <div style={{ padding: '14px', borderRadius: 12, background: '#f1f5f9', border: '1px solid #e2e8f0', fontSize: 12, color: '#64748b', textAlign: 'center' }}>
              Somente leitura — apenas admins podem enviar
            </div>
          ) : (
            <button onClick={send} disabled={sending || chosen.length === 0 || !subject.trim() || !message.trim()} style={{
              width: '100%', padding: '14px', borderRadius: 12, border: 'none',
              background: (sending || chosen.length === 0 || !subject.trim() || !message.trim()) ? '#cbd5e1' : '#009c3b',
              color: '#fff', fontSize: 13, fontWeight: 900, letterSpacing: 1, textTransform: 'uppercase',
              cursor: (sending || chosen.length === 0 || !subject.trim() || !message.trim()) ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
            }}>
              {sending ? 'Enviando...' : `Enviar para ${chosen.length} destinatário${chosen.length !== 1 ? 's' : ''}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
