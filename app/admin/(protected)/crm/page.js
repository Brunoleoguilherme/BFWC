'use client';

import { useState, useEffect, useMemo } from 'react';

const AUDIENCES = [
  { key: 'pre_inscritos', label: 'Pré-inscritos', color: '#a855f7' },
  { key: 'inscritos',     label: 'Inscritos',     color: '#ea580c' },
  { key: 'sem_pagamento', label: 'Sem pagamento', color: '#eab308' },
  { key: 'confirmados',   label: 'Confirmados',   color: '#009c3b' },
  { key: 'em_atraso',     label: 'Em atraso',     color: '#ef4444' },
  { key: 'newsletter',    label: 'Newsletter',    color: '#0ea5e9' },
];

const TEMPLATES = [
  { key: 'lembrete_parcela', label: 'Lembrete de parcela', subject: 'Lembrete: parcela da inscrição — BFWC 2026',
    message: 'Olá, {clube}!\n\nEste é um lembrete amigável sobre a parcela da inscrição da sua equipe no Brasil Flag World Championship 2026.\n\nAcesse o portal do clube para efetuar o pagamento e garantir sua vaga.\n\nQualquer dúvida, é só responder este e-mail.' },
  { key: 'boas_vindas', label: 'Boas-vindas', subject: 'Bem-vindos ao BFWC 2026!',
    message: 'Olá, {clube}!\n\nQue alegria ter vocês no Brasil Flag World Championship 2026. Fiquem atentos ao e-mail para novidades sobre o evento em Leme, SP.\n\nVamos juntos!' },
  { key: 'aviso_geral', label: 'Aviso geral', subject: 'Comunicado — BFWC 2026',
    message: 'Olá, {clube}!\n\n[escreva o comunicado aqui]\n\nEquipe BFWC 2026.' },
  { key: 'checkin', label: 'Check-in inscritos (PT/ES/EN)', i18n: {
    pt: { subject: 'Podemos ajudar com sua inscrição no BFWC 2026?',
      message: 'Olá, {clube}!\n\nVimos que vocês começaram a inscrição no Brasil Flag World Championship 2026 e passamos só para saber se está tudo tranquilo por aí. 🏈\n\nFicou alguma dúvida? Seja sobre o processo de inscrição, as categorias, o pagamento ou qualquer outro detalhe, é só falar com a gente — estamos por aqui para ajudar.\n\nFale pelo canal que for mais fácil pra você:\nWhatsApp: +55 16 99775-4522\nE-mail: contato@brasilflag.com\n\nSerá um prazer ajudar no que precisarem.\n\nUm abraço,\nEquipe Brasil Flag World Championship 2026' },
    es: { subject: '¿Podemos ayudarte con tu inscripción al BFWC 2026?',
      message: '¡Hola, {clube}!\n\nVimos que comenzaron la inscripción en el Brasil Flag World Championship 2026 y pasamos solo para saber si todo va bien por ahí. 🏈\n\n¿Les quedó alguna duda? Ya sea sobre el proceso de inscripción, las categorías, el pago o cualquier otro detalle, escríbannos — estamos aquí para ayudar.\n\nContáctennos por el canal que les resulte más fácil:\nWhatsApp: +55 16 99775-4522\nCorreo: contato@brasilflag.com\n\nSerá un gusto ayudarlos en lo que necesiten.\n\nUn abrazo,\nEquipo Brasil Flag World Championship 2026' },
    en: { subject: 'Can we help with your BFWC 2026 registration?',
      message: 'Hi, {clube}!\n\nWe noticed your team started the registration for the Brasil Flag World Championship 2026, and we\'re just checking in to make sure everything is going smoothly. 🏈\n\nDo you have any questions? Whether it\'s about the registration process, the categories, the payment, or anything else, just reach out — we\'re here to help.\n\nContact us through whichever channel is easiest for you:\nWhatsApp: +55 16 99775-4522\nEmail: contato@brasilflag.com\n\nWe\'re happy to help with anything you need.\n\nBest regards,\nBrasil Flag World Championship 2026 Team' } } },
];

const LANGS = [
  { key: 'pt', label: 'PT', flag: '🇧🇷' },
  { key: 'es', label: 'ES', flag: '🇪🇸' },
  { key: 'en', label: 'EN', flag: '🇬🇧' },
];

export default function CRMPage() {
  const [audiences, setAudiences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('viewer');

  const [activeFilters, setActiveFilters] = useState(['pre_inscritos']);
  const [selected, setSelected] = useState([]); // emails
  const [lang, setLang] = useState('pt');
  const [subjects, setSubjects] = useState({ pt: '', es: '', en: '' });
  const [messages, setMessages] = useState({ pt: '', es: '', en: '' });
  const [manualList, setManualList] = useState([]);
  const [manual, setManual] = useState({ email: '', name: '', club: '', lang: 'pt' });
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [blasts, setBlasts] = useState(null);
  const [openBlast, setOpenBlast] = useState(null);

  function fetchBlasts() {
    fetch('/api/admin/blasts').then(r => r.json()).then(d => {
      if (d.ok) setBlasts(d.blasts || []);
    }).catch(() => {});
  }

  useEffect(() => {
    fetch('/api/admin/me').then(r => r.json()).then(d => setRole(d.role || 'viewer'));
    fetch('/api/admin/recipients').then(r => r.json()).then(d => {
      if (d.ok) setAudiences(d.audiences);
      setLoading(false);
    }).catch(() => setLoading(false));
    fetchBlasts();
  }, []);

  // Lista de destinatários combinada pelas audiências ativas (dedup por email)
  const list = useMemo(() => {
    const seen = new Map();
    activeFilters.forEach(f => {
      (audiences?.[f] || []).forEach(r => {
        const k = r.email.toLowerCase();
        if (!seen.has(k)) seen.set(k, { ...r, lang: r.lang || 'pt', _aud: [f] });
        else seen.get(k)._aud.push(f);
      });
    });
    manualList.forEach(r => {
      const k = r.email.toLowerCase();
      if (!seen.has(k)) seen.set(k, { ...r, lang: r.lang || 'pt', _aud: ['manual'] });
      else seen.get(k)._aud.push('manual');
    });
    return [...seen.values()];
  }, [audiences, activeFilters, manualList]);

  function toggleFilter(k) {
    setActiveFilters(prev => prev.includes(k) ? prev.filter(x => x !== k) : [...prev, k]);
    setSelected([]);
  }
  function toggleOne(email) {
    setSelected(prev => prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]);
  }
  function selectAll() { setSelected(list.map(r => r.email)); }
  function clearAll() { setSelected([]); }

  function applyTemplate(t) {
    if (t.i18n) {
      setSubjects({ pt: t.i18n.pt.subject, es: t.i18n.es.subject, en: t.i18n.en.subject });
      setMessages({ pt: t.i18n.pt.message, es: t.i18n.es.message, en: t.i18n.en.message });
    } else {
      setSubjects(s => ({ ...s, pt: t.subject }));
      setMessages(m => ({ ...m, pt: t.message }));
      setLang('pt');
    }
  }

  const chosen = useMemo(() => list.filter(r => selected.includes(r.email)), [list, selected]);
  const canSend = chosen.length > 0 && subjects.pt.trim() && messages.pt.trim();
  const langCounts = useMemo(() => {
    const c = {};
    chosen.forEach(r => { const l = (r.lang || 'pt'); c[l] = (c[l] || 0) + 1; });
    return c;
  }, [chosen]);

  function addManual() {
    const email = manual.email.trim();
    if (!/\S+@\S+\.\S+/.test(email)) return;
    setManualList(prev => prev.some(m => m.email.toLowerCase() === email.toLowerCase())
      ? prev
      : [...prev, { id: 'manual:' + email, email, name: manual.name.trim(), club: manual.club.trim(), lang: manual.lang }]);
    setSelected(prev => prev.includes(email) ? prev : [...prev, email]);
    setManual({ email: '', name: '', club: '', lang: manual.lang });
  }

  async function send() {
    if (role === 'viewer' || !canSend) return;
    setSending(true); setResult(null);
    const r = await fetch('/api/admin/broadcast', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipients: chosen.map(c => ({ email: c.email, name: c.name, club: c.club, lang: c.lang || 'pt' })),
        subject: subjects, message: messages,
      }),
    });
    const d = await r.json();
    setSending(false);
    if (d.ok) { setResult({ ok: true, sent: d.sent, failed: d.failed?.length || 0 }); setSelected([]); fetchBlasts(); }
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

          {/* Adicionar e-mail manualmente */}
          <div style={{ padding: '12px 22px', borderBottom: '1px solid #f1f5f9', background: '#fbfdff', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <input value={manual.email} onChange={e => setManual(m => ({ ...m, email: e.target.value }))} onKeyDown={e => { if (e.key === 'Enter') addManual(); }} placeholder="Adicionar e-mail manual" style={{ flex: '2 1 170px', padding: '9px 12px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 12.5, color: '#0f172a', outline: 'none', fontFamily: 'inherit' }} />
            <input value={manual.club} onChange={e => setManual(m => ({ ...m, club: e.target.value }))} placeholder="Time (opcional)" style={{ flex: '1 1 110px', padding: '9px 12px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 12.5, color: '#0f172a', outline: 'none', fontFamily: 'inherit' }} />
            <select value={manual.lang} onChange={e => setManual(m => ({ ...m, lang: e.target.value }))} style={{ padding: '9px 8px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 12.5, color: '#0f172a', fontFamily: 'inherit' }}>
              <option value="pt">PT</option>
              <option value="es">ES</option>
              <option value="en">EN</option>
            </select>
            <button onClick={addManual} style={{ padding: '9px 16px', borderRadius: 10, border: 'none', background: '#0f172a', color: '#fff', fontSize: 12.5, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>Adicionar</button>
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
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0, alignItems: 'center' }}>
                      <span style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>{r.lang || 'pt'}</span>
                      {r._aud.map(a => (
                        <span key={a} style={{ width: 8, height: 8, borderRadius: '50%', background: a === 'manual' ? '#0f172a' : audColor(a) }} title={a === 'manual' ? 'Manual' : AUDIENCES.find(x => x.key === a)?.label} />
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

          <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
            {LANGS.map(L => {
              const on = lang === L.key;
              const filled = subjects[L.key].trim() || messages[L.key].trim();
              const n = langCounts[L.key] || 0;
              return (
                <button key={L.key} onClick={() => setLang(L.key)} style={{
                  flex: 1, padding: '8px 6px', borderRadius: 9, fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit',
                  background: on ? '#0f172a' : '#f1f5f9', color: on ? '#fff' : '#475569',
                  border: `1px solid ${on ? '#0f172a' : '#e2e8f0'}`,
                }}>{L.flag} {L.label}{filled ? ' ✓' : ''}{n ? ` · ${n}` : ''}</button>
              );
            })}
          </div>

          <div style={S.label}>Assunto ({lang.toUpperCase()})</div>
          <input style={{ ...S.input, marginBottom: 14 }} value={subjects[lang]} onChange={e => setSubjects(s => ({ ...s, [lang]: e.target.value }))} placeholder={`Assunto do e-mail (${lang.toUpperCase()})`} />

          <div style={S.label}>Mensagem ({lang.toUpperCase()})</div>
          <textarea style={{ ...S.input, minHeight: 160, resize: 'vertical', marginBottom: 8, lineHeight: 1.5 }} value={messages[lang]} onChange={e => setMessages(m => ({ ...m, [lang]: e.target.value }))} placeholder="Escreva sua mensagem... (uma linha em branco separa parágrafos)" />

          <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 16, lineHeight: 1.5 }}>
            Cada time recebe no idioma dele automaticamente. Preencha ao menos o <strong>Português</strong> (padrão para quem não tem idioma definido).
          </div>

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
            <button onClick={send} disabled={sending || !canSend} style={{
              width: '100%', padding: '14px', borderRadius: 12, border: 'none',
              background: (sending || !canSend) ? '#cbd5e1' : '#009c3b',
              color: '#fff', fontSize: 13, fontWeight: 900, letterSpacing: 1, textTransform: 'uppercase',
              cursor: (sending || !canSend) ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
            }}>
              {sending ? 'Enviando...' : `Enviar para ${chosen.length} destinatário${chosen.length !== 1 ? 's' : ''}`}
            </button>
          )}
        </div>
      </div>

      {/* ── Disparos realizados ─────────────────────────────────────────── */}
      <div style={{ marginTop: 28, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 20, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
        <div style={{ padding: '16px 22px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 800 }}>Disparos realizados</span>
          <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 20, background: '#f1f5f9', color: '#64748b' }}>{blasts ? blasts.length : '·'}</span>
          <span style={{ marginLeft: 'auto', fontSize: 11, color: '#94a3b8' }}>clique para ver os destinatários</span>
        </div>

        {!blasts ? (
          <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Carregando...</div>
        ) : blasts.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
            Nenhum disparo registrado ainda.
          </div>
        ) : (
          blasts.map((b, i) => (
            <div
              key={b.id}
              onClick={() => setOpenBlast(b)}
              style={{
                display: 'flex', alignItems: 'center', gap: 16, padding: '15px 22px', cursor: 'pointer',
                borderBottom: i < blasts.length - 1 ? '1px solid #f1f5f9' : 'none',
                background: i % 2 === 0 ? 'transparent' : '#f8fafc',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.subject}</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>
                  {new Date(b.sent_at).toLocaleString('pt-BR')}{b.description ? ` · ${b.description}` : ''}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 6, background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }}>✉ {b.counts.total}</span>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 6, background: 'rgba(13,75,255,.08)', color: '#0D4BFF', border: '1px solid rgba(13,75,255,.2)' }}>📬 {b.counts.opened}</span>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 6, background: 'rgba(0,156,59,.08)', color: '#009c3b', border: '1px solid rgba(0,156,59,.2)' }}>🔗 {b.counts.clicked}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: destinatários do disparo */}
      {openBlast && (
        <div
          onClick={e => e.target === e.currentTarget && setOpenBlast(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(6px)',
            zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
            padding: '32px 16px', overflowY: 'auto', fontFamily: "'Inter', sans-serif",
          }}
        >
          <div style={{
            width: '100%', maxWidth: 780, position: 'relative', padding: '34px 36px',
            background: '#fff', border: '1px solid #e2e8f0', borderRadius: 24,
            boxShadow: '0 20px 60px rgba(0,0,0,.15)',
          }}>
            <button style={{
              position: 'absolute', top: 18, right: 18, width: 34, height: 34, borderRadius: 10,
              background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#64748b',
              fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit',
            }} onClick={() => setOpenBlast(null)}>✕</button>

            <h2 style={{ fontSize: 19, fontWeight: 900, letterSpacing: -.5, color: '#0f172a', margin: '0 0 4px', paddingRight: 40 }}>{openBlast.subject}</h2>
            <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 18px' }}>
              {new Date(openBlast.sent_at).toLocaleString('pt-BR')} · {openBlast.counts.total} destinatário{openBlast.counts.total !== 1 ? 's' : ''} · {openBlast.counts.opened} abriram · {openBlast.counts.clicked} clicaram
            </p>

            <div style={{ border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden' }}>
              <div style={{
                display: 'grid', gridTemplateColumns: '1.3fr 1.3fr 70px 130px',
                padding: '10px 18px', borderBottom: '1px solid #e2e8f0',
                fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: '#94a3b8',
              }}>
                <span>Time / Contato</span><span>E-mail</span><span>Idioma</span><span style={{ textAlign: 'right' }}>Abertura</span>
              </div>
              <div style={{ maxHeight: 440, overflowY: 'auto' }}>
                {openBlast.recipients.map((r, i) => (
                  <div key={r.id} style={{
                    display: 'grid', gridTemplateColumns: '1.3fr 1.3fr 70px 130px',
                    padding: '11px 18px', alignItems: 'center',
                    borderBottom: i < openBlast.recipients.length - 1 ? '1px solid #f1f5f9' : 'none',
                    background: i % 2 === 0 ? 'transparent' : '#f8fafc',
                  }}>
                    <span style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.club_name || r.name || '—'}</div>
                      {r.name && r.club_name && <div style={{ fontSize: 10.5, color: '#94a3b8' }}>{r.name}</div>}
                    </span>
                    <span style={{ fontSize: 12, color: '#475569', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={r.email}>{r.email}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>{r.language || '—'}</span>
                    <span style={{ textAlign: 'right', fontSize: 11, fontWeight: 700 }}>
                      {r.clicked_at
                        ? <span style={{ color: '#009c3b' }}>🔗 Clicou</span>
                        : r.opened_at
                        ? <span style={{ color: '#0D4BFF' }}>📬 Abriu</span>
                        : <span style={{ color: '#cbd5e1' }}>—</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
