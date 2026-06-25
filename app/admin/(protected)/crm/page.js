'use client';

import { useState, useEffect } from 'react';

export default function CRMPage() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [emailTpl, setEmailTpl] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [role, setRole] = useState('viewer');

  useEffect(() => {
    fetch('/api/admin/me').then(r => r.json()).then(d => setRole(d.role || 'viewer'));
    fetch('/api/admin/teams').then(r => r.json()).then(d => {
      setTeams((d.teams || []).filter(t => t.status !== 'spam_descartado'));
      setLoading(false);
    });
  }, []);

  function toggleTeam(id) {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  }

  function selectAll() { setSelected(teams.map(t => t.id)); }
  function clearAll() { setSelected([]); }

  async function sendBulk() {
    if (!emailTpl || selected.length === 0 || role === 'viewer') return;
    setSending(true);
    await Promise.all(selected.map(id =>
      fetch(`/api/admin/teams/${id}/email`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template: emailTpl }),
      })
    ));
    setSending(false);
    setDone(true);
    setTimeout(() => { setDone(false); setSelected([]); }, 3000);
  }

  const S = {
    label: { fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: '#94a3b8', marginBottom: 10 },
    tplBtn: (sel) => ({
      padding: '10px 20px', borderRadius: 12, fontSize: 13, fontWeight: 700,
      cursor: 'pointer', fontFamily: 'inherit',
      background: sel ? '#031020' : '#f1f5f9',
      border: `1px solid ${sel ? '#031020' : '#e2e8f0'}`,
      color: sel ? '#fff' : '#475569',
      transition: 'all .2s',
    }),
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: '#0f172a' }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', color: '#009c3b', marginBottom: 8 }}>E-mail</div>
        <h1 style={{ fontSize: 36, fontWeight: 900, letterSpacing: -1.5, color: '#0f172a' }}>Comunicação</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'flex-start' }}>
        {/* Lista de times */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0', borderRadius: 20, overflow: 'hidden',
          boxShadow: '0 1px 4px rgba(0,0,0,.06)',
        }}>
          <div style={{ padding: '18px 22px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Times ({teams.length})</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={selectAll} style={{ fontSize: 12, fontWeight: 600, color: '#009c3b', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Selecionar todos</button>
              <span style={{ color: '#e2e8f0' }}>·</span>
              <button onClick={clearAll} style={{ fontSize: 12, fontWeight: 600, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Limpar</button>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Carregando...</div>
          ) : (
            <div style={{ maxHeight: 520, overflowY: 'auto' }}>
              {teams.map(t => {
                const isSel = selected.includes(t.id);
                const st = {
                  pre_inscrito: { color: '#a855f7', label: 'Pré-inscrito' },
                  pendente_analise: { color: '#94a3b8', label: 'Pendente' },
                  em_revisao: { color: '#009c3b', label: 'Em Revisão' },
                  aprovado: { color: '#009c3b', label: 'Aprovado' },
                  inscricao_confirmada: { color: '#0D4BFF', label: 'Confirmado' },
                  rejeitado: { color: '#ff4444', label: 'Rejeitado' },
                }[t.status] || { color: '#64748b', label: t.status };

                return (
                  <div
                    key={t.id}
                    onClick={() => toggleTeam(t.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '14px 22px',
                      background: isSel ? 'rgba(244,255,0,.04)' : 'transparent',
                      borderBottom: '1px solid #f1f5f9',
                      cursor: 'pointer', transition: 'background .15s',
                    }}
                  >
                    <div style={{
                      width: 18, height: 18, borderRadius: 6, flexShrink: 0,
                      background: isSel ? '#009c3b' : '#f1f5f9',
                      border: `1px solid ${isSel ? '#009c3b' : '#e2e8f0'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, color: '#031020', fontWeight: 900,
                    }}>{isSel ? '✓' : ''}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>{t.club_name}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{t.email || 'Sem e-mail'} · {t.city}</div>
                    </div>
                    <span style={{
                      fontSize: 10, fontWeight: 700, letterSpacing: .5, textTransform: 'uppercase',
                      padding: '3px 9px', borderRadius: 6,
                      background: st.color + '18', color: st.color, border: `1px solid ${st.color}30`,
                    }}>{st.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Painel de envio */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0', borderRadius: 20, padding: 24,
          boxShadow: '0 1px 4px rgba(0,0,0,.06)',
          position: 'sticky', top: 80,
        }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 20, letterSpacing: -.3 }}>Envio em lote</div>

          <div style={S.label}>Selecionados</div>
          <div style={{
            fontSize: 40, fontWeight: 900, letterSpacing: -2, color: selected.length > 0 ? '#009c3b' : '#94a3b8',
            marginBottom: 24, lineHeight: 1,
          }}>{selected.length}</div>

          <div style={{ ...S.label, marginBottom: 10 }}>Template</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
            {[['aprovado','✓ Inscrição Aprovada'],['info_adicional','? Solicitar Informações'],['rejeitado','✕ Inscrição Rejeitada']].map(([k,l]) => (
              <button key={k} style={S.tplBtn(emailTpl === k)} onClick={() => setEmailTpl(emailTpl === k ? '' : k)}>{l}</button>
            ))}
          </div>

          {role === 'viewer' ? (
            <div style={{
              width: '100%', padding: '14px', borderRadius: 12,
              background: '#f1f5f9', border: '1px solid #e2e8f0',
              fontSize: 12, color: '#64748b', textAlign: 'center',
              fontFamily: "'Inter', sans-serif",
            }}>
              Somente leitura — apenas admins podem enviar e-mails
            </div>
          ) : (
            <>
              <button
                onClick={sendBulk}
                disabled={sending || selected.length === 0 || !emailTpl}
                style={{
                  width: '100%', padding: '14px',
                  background: done ? '#009c3b' : (sending || !emailTpl || selected.length === 0) ? 'rgba(244,255,0,.3)' : '#009c3b',
                  color: '#031020', border: 'none', borderRadius: 12,
                  fontSize: 13, fontWeight: 900, letterSpacing: 1.5, textTransform: 'uppercase',
                  cursor: sending || selected.length === 0 || !emailTpl ? 'not-allowed' : 'pointer',
                  fontFamily: "'Inter', sans-serif", transition: 'all .2s',
                }}
              >
                {done ? '✓ Enviado!' : sending ? 'Enviando...' : `Enviar para ${selected.length} time${selected.length !== 1 ? 's' : ''}`}
              </button>
              {(!emailTpl || selected.length === 0) && (
                <p style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', marginTop: 10 }}>
                  Selecione times e um template para enviar.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
