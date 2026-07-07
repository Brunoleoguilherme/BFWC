'use client';

import { useState, useEffect, useMemo } from 'react';

const BRL = (cents) => (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const CAT_COLORS = {
  'Masculino': '#4d8aff',
  'Feminino':  '#e84dff',
  'Sub-15':    '#009c3b',
  'Sub-12':    '#ffb400',
};

function Card({ children, style }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 20, padding: '24px 26px', boxShadow: '0 1px 4px rgba(0,0,0,.06)', ...style }}>
      {children}
    </div>
  );
}

function SectionTitle({ badge, badgeColor = '#009c3b', title, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
      <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', padding: '4px 10px', borderRadius: 6, background: badgeColor + '18', color: badgeColor, border: `1px solid ${badgeColor}35` }}>{badge}</span>
      <span style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>{title}</span>
      {right && <span style={{ marginLeft: 'auto' }}>{right}</span>}
    </div>
  );
}

export default function FinanceiroPage() {
  const [data, setData] = useState(null);
  const [err, setErr]   = useState('');
  const [q, setQ]       = useState('');

  useEffect(() => {
    fetch('/api/admin/financial')
      .then(r => r.json())
      .then(d => { if (d.ok) setData(d); else setErr(d.error || 'Erro ao carregar.'); })
      .catch(e => setErr(e.message));
  }, []);

  const loading = !data && !err;
  const t = data?.totals || {};
  const method = data?.byMethod || {};

  const filteredTeams = useMemo(() => {
    if (!data) return [];
    const s = q.trim().toLowerCase();
    if (!s) return data.teams;
    return data.teams.filter(tm => tm.club_name?.toLowerCase().includes(s) || tm.category?.toLowerCase().includes(s));
  }, [data, q]);

  const methodTotal = (method.pix_cents || 0) + (method.card_cents || 0);
  const pixPct  = methodTotal > 0 ? Math.round((method.pix_cents  / methodTotal) * 100) : 0;
  const cardPct = methodTotal > 0 ? Math.round((method.card_cents / methodTotal) * 100) : 0;

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: '#0f172a' }}>
      <style>{`
        .fin-grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; margin-bottom: 16px; }
        .fin-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
        .fin-cats   { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; }
        .fin-tbl th, .fin-tbl td { padding: 11px 12px; text-align: left; font-size: 12.5px; }
        .fin-tbl th { font-size: 9.5px; font-weight: 800; letter-spacing: 1.2px; text-transform: uppercase; color: #94a3b8; border-bottom: 1px solid #e2e8f0; }
        .fin-tbl tr:not(:last-child) td { border-bottom: 1px solid #f1f5f9; }
        @media (max-width: 720px) {
          .fin-grid-3 { grid-template-columns: 1fr; }
          .fin-grid-2 { grid-template-columns: 1fr; }
          .fin-cats   { grid-template-columns: 1fr 1fr; }
          .hide-sm    { display: none !important; }
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', color: '#009c3b', marginBottom: 8 }}>BFWC 2026 · Financeiro</div>
        <h1 style={{ fontSize: 42, fontWeight: 900, letterSpacing: -2, lineHeight: 1, color: '#0f172a', margin: 0 }}>Dashboard Financeiro</h1>
      </div>

      {err && <Card style={{ borderColor: '#fecaca', background: '#fef2f2', marginBottom: 16 }}><span style={{ color: '#dc2626', fontSize: 13, fontWeight: 600 }}>{err}</span></Card>}

      {/* Totais */}
      <div className="fin-grid-3">
        <Card style={{ borderColor: 'rgba(0,156,59,.25)' }}>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: '#64748b', marginBottom: 10 }}>Arrecadado</div>
          <div style={{ fontSize: 34, fontWeight: 900, letterSpacing: -1.5, color: loading ? '#e2e8f0' : '#009c3b', lineHeight: 1 }}>{loading ? '—' : BRL(t.arrecadado_cents)}</div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>parcelas já pagas (Pix + Cartão)</div>
        </Card>
        <Card style={{ borderColor: 'rgba(249,115,22,.25)' }}>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: '#64748b', marginBottom: 10 }}>A receber</div>
          <div style={{ fontSize: 34, fontWeight: 900, letterSpacing: -1.5, color: loading ? '#e2e8f0' : '#ea580c', lineHeight: 1 }}>{loading ? '—' : BRL(t.a_receber_cents)}</div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>saldo dos times confirmados</div>
        </Card>
        <Card style={{ borderColor: 'rgba(13,75,255,.22)' }}>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: '#64748b', marginBottom: 10 }}>Esperado (confirmados)</div>
          <div style={{ fontSize: 34, fontWeight: 900, letterSpacing: -1.5, color: loading ? '#e2e8f0' : '#0f172a', lineHeight: 1 }}>{loading ? '—' : BRL(t.esperado_cents)}</div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>{loading ? '' : `${data.committed_count} times · ${t.pct}% arrecadado`}</div>
        </Card>
      </div>

      {/* Barra de progresso arrecadação */}
      {!loading && (
        <Card style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: '#475569' }}>Progresso da arrecadação</span>
            <span style={{ fontSize: 12, fontWeight: 900, color: '#009c3b' }}>{t.pct}%</span>
          </div>
          <div style={{ height: 12, borderRadius: 8, background: '#f1f5f9', overflow: 'hidden' }}>
            <div style={{ width: `${Math.min(t.pct, 100)}%`, height: '100%', background: 'linear-gradient(90deg,#009c3b,#22e06a)', borderRadius: 8, transition: 'width .4s' }} />
          </div>
        </Card>
      )}

      {/* Por método + Por opção */}
      <div className="fin-grid-2">
        <Card>
          <SectionTitle badge="Método" badgeColor="#0D4BFF" title="Pix vs Cartão" />
          {loading ? <div style={{ color: '#94a3b8', fontSize: 13 }}>Carregando...</div> : (
            <>
              {[
                { label: 'Pix (Cora)', cents: method.pix_cents, pct: pixPct, color: '#009c3b' },
                { label: 'Cartão (Stripe)', cents: method.card_cents, pct: cardPct, color: '#0D4BFF' },
              ].map(m => (
                <div key={m.label} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>{m.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: m.color }}>{BRL(m.cents || 0)} <span style={{ color: '#94a3b8', fontWeight: 600 }}>· {m.pct}%</span></span>
                  </div>
                  <div style={{ height: 8, borderRadius: 6, background: '#f1f5f9', overflow: 'hidden' }}>
                    <div style={{ width: `${m.pct}%`, height: '100%', background: m.color, borderRadius: 6 }} />
                  </div>
                </div>
              ))}
              <div style={{ fontSize: 10.5, color: '#94a3b8', marginTop: 4, lineHeight: 1.5 }}>Split estimado: parcelas com cobrança Cora contam como Pix; o restante do arrecadado é atribuído ao cartão.</div>
            </>
          )}
        </Card>

        <Card>
          <SectionTitle badge="Opção" badgeColor="#a855f7" title="Por opção de pagamento" />
          {loading ? <div style={{ color: '#94a3b8', fontSize: 13 }}>Carregando...</div> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { k: '1', label: 'Opção 1 · pacote (R$ 2.000/cat.)' },
                { k: '2', label: 'Opção 2 · R$ 800/cat. + R$ 90/atleta' },
              ].map(o => {
                const b = data.byOption[o.k];
                return (
                  <div key={o.k} style={{ padding: '12px 14px', borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: 12.5, fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>{o.label}</div>
                    <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 12, color: '#64748b' }}>Times: <strong style={{ color: '#0f172a' }}>{b.teams}</strong></span>
                      <span style={{ fontSize: 12, color: '#64748b' }}>Arrecadado: <strong style={{ color: '#009c3b' }}>{BRL(b.arrecadado_cents)}</strong></span>
                      <span style={{ fontSize: 12, color: '#64748b' }}>Esperado: <strong style={{ color: '#0f172a' }}>{BRL(b.esperado_cents)}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Por categoria */}
      <Card style={{ marginBottom: 16 }}>
        <SectionTitle badge="Categorias" badgeColor="#009c3b" title="Inscrições pagas por categoria" />
        {loading ? <div style={{ color: '#94a3b8', fontSize: 13 }}>Carregando...</div> : (
          <div className="fin-cats">
            {data.byCategory.map(c => {
              const color = CAT_COLORS[c.category] || '#0f172a';
              const pct = c.quota ? Math.round((c.paid_teams / c.quota) * 100) : 0;
              return (
                <div key={c.category} style={{ padding: '16px 14px', borderRadius: 14, background: '#f8fafc', border: `1px solid ${color}22`, textAlign: 'center' }}>
                  <div style={{ fontSize: 30, fontWeight: 900, letterSpacing: -1.5, color, lineHeight: 1 }}>{c.paid_teams}<span style={{ fontSize: 15, color: '#cbd5e1' }}>{c.quota ? `/${c.quota}` : ''}</span></div>
                  <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', color: '#94a3b8', marginTop: 6 }}>{c.category}</div>
                  {c.quota != null && (
                    <div style={{ height: 5, borderRadius: 4, background: '#e2e8f0', overflow: 'hidden', marginTop: 8 }}>
                      <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: color }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Parcelas em atraso */}
      <Card style={{ marginBottom: 16, borderColor: data && data.overdue.length ? 'rgba(239,68,68,.3)' : '#e2e8f0' }}>
        <SectionTitle badge="Atraso" badgeColor="#ef4444" title="Parcelas em atraso"
          right={!loading && <span style={{ fontSize: 13, fontWeight: 800, color: data.overdue.length ? '#ef4444' : '#94a3b8' }}>{data.overdue.length ? `${BRL(data.overdue_total_cents)} em ${data.overdue.length} parcela(s)` : 'Nenhuma'}</span>} />
        {loading ? <div style={{ color: '#94a3b8', fontSize: 13 }}>Carregando...</div> : data.overdue.length === 0 ? (
          <div style={{ color: '#94a3b8', fontSize: 13 }}>Nenhuma parcela vencida entre os times confirmados. 🎉</div>
        ) : (
          <table className="fin-tbl" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr><th>Time</th><th>Parcela</th><th>Vencimento</th><th style={{ textAlign: 'right' }}>Valor</th></tr></thead>
            <tbody>
              {data.overdue.map((o, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 700 }}>{o.club_name}</td>
                  <td>{o.number}ª</td>
                  <td style={{ color: '#ef4444', fontWeight: 700 }}>{o.due_date.split('-').reverse().join('/')}</td>
                  <td style={{ textAlign: 'right', fontWeight: 800 }}>{BRL(o.amount_cents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {/* Tabela por time */}
      <Card>
        <SectionTitle badge="Times" badgeColor="#0f172a" title="Pagamentos por time"
          right={<input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar time ou categoria..." style={{ padding: '8px 12px', borderRadius: 9, border: '1px solid #e2e8f0', fontSize: 12.5, fontFamily: 'inherit', width: 220, outline: 'none' }} />} />
        {loading ? <div style={{ color: '#94a3b8', fontSize: 13 }}>Carregando...</div> : filteredTeams.length === 0 ? (
          <div style={{ color: '#94a3b8', fontSize: 13 }}>Nenhum time com pagamento ainda.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="fin-tbl" style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
              <thead>
                <tr>
                  <th>Time</th>
                  <th className="hide-sm">Opção</th>
                  <th>Pago / Total</th>
                  <th>Parcelas</th>
                  <th className="hide-sm">Método</th>
                  <th style={{ textAlign: 'right' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeams.map(tm => {
                  const remaining = Math.max(0, tm.total_cents - tm.paid_cents);
                  return (
                    <tr key={tm.id}>
                      <td>
                        <div style={{ fontWeight: 700 }}>{tm.club_name}</div>
                        <div style={{ fontSize: 10.5, color: '#94a3b8' }}>{tm.category}</div>
                      </td>
                      <td className="hide-sm"><span style={{ fontSize: 11, fontWeight: 800, color: tm.option === '2' ? '#a855f7' : '#0D4BFF' }}>Opção {tm.option}</span></td>
                      <td>
                        <div style={{ fontWeight: 800, color: '#009c3b' }}>{BRL(tm.paid_cents)}</div>
                        <div style={{ fontSize: 10.5, color: '#94a3b8' }}>de {BRL(tm.total_cents)}{remaining > 0 ? ` · falta ${BRL(remaining)}` : ''}</div>
                      </td>
                      <td>{tm.plan_size ? `${tm.paid_count}/${tm.plan_size}` : (tm.paid_count || '—')}</td>
                      <td className="hide-sm" style={{ textTransform: 'capitalize' }}>{tm.method}</td>
                      <td style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: 10.5, fontWeight: 800, padding: '3px 10px', borderRadius: 20,
                          background: tm.fully_paid ? 'rgba(0,156,59,.12)' : tm.payment_confirmed ? 'rgba(249,115,22,.12)' : 'rgba(148,163,184,.15)',
                          color: tm.fully_paid ? '#009c3b' : tm.payment_confirmed ? '#ea580c' : '#64748b' }}>
                          {tm.fully_paid ? 'Quitado' : tm.payment_confirmed ? 'Parcial' : 'Pendente'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
