'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

const STAGES = [
  { key: 'novo_lead',         label: 'Novo Lead',        color: '#a855f7', desc: 'Identificado' },
  { key: 'contato_feito',     label: 'Contato Feito',    color: '#4d8aff', desc: 'Primeiro contato' },
  { key: 'proposta_enviada',  label: 'Proposta Enviada', color: '#f4ff00', desc: 'Aguardando retorno' },
  { key: 'em_negociacao',     label: 'Em Negociação',    color: '#f97316', desc: 'Negociando valores' },
  { key: 'fechado',           label: 'Fechado ✓',        color: '#20e33f', desc: 'Venda concluída' },
  { key: 'perdido',           label: 'Perdido',          color: '#ff4444', desc: 'Não convertido' },
];

function whatsappLink(w) {
  if (!w) return null;
  const num = (w || '').replace(/\D/g, '');
  return `https://wa.me/${num.startsWith('55') ? num : '55' + num}`;
}

function fmt(val) {
  if (!val) return null;
  return Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/* ── Deal modal ── */
function DealModal({ deal, onClose, onUpdate, onRemove, readOnly = false }) {
  const [notes, setNotes]  = useState(deal.notes || '');
  const [value, setValue]  = useState(deal.deal_value || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);
  const t = deal.team || {};
  const wa = whatsappLink(t.whatsapp);
  const stage = STAGES.find(s => s.key === deal.status) || STAGES[0];

  async function save() {
    setSaving(true);
    await fetch(`/api/admin/blue-panda/deals/${deal.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes, deal_value: value ? Number(value) : null }),
    });
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    onUpdate();
  }

  async function moveTo(status) {
    await fetch(`/api/admin/blue-panda/deals/${deal.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    onUpdate(); onClose();
  }

  async function remove() {
    if (!confirm('Remover do pipeline?')) return;
    await fetch(`/api/admin/blue-panda/deals/${deal.id}`, { method: 'DELETE' });
    onRemove(); onClose();
  }

  const inp = {
    width: '100%', padding: '12px 16px', borderRadius: 12, fontSize: 13, boxSizing: 'border-box',
    background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)',
    color: '#fff', outline: 'none', fontFamily: 'inherit',
  };

  const fields = [
    ['Contato',    t.contact_name], ['Cargo',      t.contact_role],
    ['WhatsApp',   t.whatsapp],     ['E-mail',     t.email],
    ['Categorias', t.category],     ['Atletas',    t.athletes_count],
    ['Hospedagem', t.hosting_preference], ['Apoio', t.travel_support === 'yes' ? 'Sim' : t.travel_support === 'maybe' ? 'Talvez' : 'Não'],
    ['Histórico',  t.competitive_history],
  ].filter(([, v]) => v != null && v !== '');

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.85)',
      backdropFilter: 'blur(12px)', zIndex: 1000,
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      padding: '32px 16px', overflowY: 'auto', fontFamily: "'Inter', sans-serif",
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        width: '100%', maxWidth: 700, position: 'relative',
        background: 'linear-gradient(145deg, #030d1f, #020814)',
        border: '1px solid rgba(255,255,255,.1)', borderRadius: 28,
        padding: '44px 48px', boxShadow: '0 60px 180px rgba(0,0,0,.9)',
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: 20, right: 20, width: 34, height: 34, borderRadius: 10,
          background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)',
          color: 'rgba(255,255,255,.4)', fontSize: 15, cursor: 'pointer',
        }}>✕</button>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: -1, color: '#fff', margin: 0 }}>{t.club_name}</h2>
            <span style={{
              fontSize: 10, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase',
              padding: '3px 10px', borderRadius: 6,
              color: stage.color, background: stage.color + '14', border: `1px solid ${stage.color}30`,
            }}>{stage.label}</span>
          </div>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,.3)', margin: 0 }}>
            {[t.city, t.country].filter(Boolean).join(' · ')}
          </p>
        </div>

        {/* Team info grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 40px',
          padding: '20px 24px', borderRadius: 16,
          background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.06)',
          marginBottom: 24,
        }}>
          {fields.map(([label, value]) => (
            <div key={label} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,.28)', marginBottom: 2 }}>{label}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,.8)' }}>{String(value)}</div>
            </div>
          ))}
        </div>

        {readOnly ? (
          <div style={{ padding: '14px 18px', borderRadius: 12, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', fontSize: 12, color: 'rgba(255,255,255,.35)', textAlign: 'center', marginBottom: 20 }}>
            Modo somente leitura — apenas admins podem alterar dados
          </div>
        ) : (
          <>
            {/* Deal value */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,.3)', marginBottom: 6 }}>
                Valor do negócio (R$)
              </label>
              <input style={inp} type="number" placeholder="ex: 15000" value={value} onChange={e => setValue(e.target.value)} />
            </div>

            {/* Notes */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,.3)', marginBottom: 6 }}>
                Anotações / Andamento
              </label>
              <textarea
                style={{ ...inp, resize: 'vertical', minHeight: 90 }}
                value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="Registro de contatos, proposta, condições acordadas..."
              />
              <button onClick={save} disabled={saving} style={{
                marginTop: 8, padding: '11px 24px', borderRadius: 12, border: 'none',
                background: saved ? '#20e33f' : '#f4ff00', color: '#031020',
                fontSize: 12, fontWeight: 900, letterSpacing: 1.5, textTransform: 'uppercase',
                cursor: 'pointer', fontFamily: 'inherit',
              }}>
                {saving ? 'Salvando...' : saved ? '✓ Salvo!' : 'Salvar'}
              </button>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,.06)', margin: '20px 0' }} />

            {/* Move stage */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,.25)', marginBottom: 10 }}>Mover para</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {STAGES.filter(s => s.key !== deal.status).map(s => (
                  <button key={s.key} onClick={() => moveTo(s.key)} style={{
                    padding: '8px 16px', borderRadius: 10, fontSize: 12, fontWeight: 700,
                    cursor: 'pointer', background: s.color + '14', color: s.color,
                    border: `1px solid ${s.color}35`, fontFamily: 'inherit',
                  }}>{s.label}</button>
                ))}
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,.06)', margin: '20px 0' }} />
          </>
        )}

        {/* Actions row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {wa && (
            <a href={wa} target="_blank" rel="noopener noreferrer" style={{
              padding: '10px 20px', borderRadius: 10,
              background: 'rgba(37,211,102,.1)', border: '1px solid rgba(37,211,102,.3)',
              color: '#25d366', textDecoration: 'none', fontSize: 13, fontWeight: 700,
            }}>💬 WhatsApp</a>
          )}
          {!readOnly && (
            <button onClick={remove} style={{
              padding: '9px 16px', borderRadius: 10, border: '1px solid rgba(255,68,68,.2)',
              background: 'rgba(255,68,68,.06)', color: 'rgba(255,68,68,.7)',
              fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            }}>Remover do pipeline</button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Deal card ── */
function DealCard({ deal, onClick, isDragging, onDragStart, onDragEnd, readOnly = false }) {
  const [hov, setHov] = useState(false);
  const t = deal.team || {};
  const stage = STAGES.find(s => s.key === deal.status) || STAGES[0];
  const cats = (t.category || '').split(',').map(c => c.trim()).filter(Boolean);

  return (
    <div
      draggable={!readOnly}
      onDragStart={readOnly ? undefined : onDragStart}
      onDragEnd={readOnly ? undefined : onDragEnd}
      onClick={() => onClick(deal)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: '16px 18px', marginBottom: 10, borderRadius: 14,
        background: 'linear-gradient(145deg, rgba(6,27,58,.7), rgba(2,8,22,.6))',
        border: `1px solid ${hov && !isDragging ? stage.color + '40' : 'rgba(255,255,255,.08)'}`,
        boxShadow: hov && !isDragging ? '0 8px 30px rgba(0,0,0,.5)' : '0 2px 10px rgba(0,0,0,.3)',
        transform: hov && !isDragging ? 'translateY(-2px)' : 'none',
        opacity: isDragging ? 0.35 : 1,
        cursor: isDragging ? 'grabbing' : 'grab',
        transition: 'all .15s', userSelect: 'none',
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', marginBottom: 3 }}>{t.club_name}</div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,.3)', marginBottom: 10 }}>
        {[t.city, t.country].filter(Boolean).join(' · ')}
      </div>

      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 8 }}>
        {cats.slice(0, 2).map(c => (
          <span key={c} style={{
            fontSize: 9, fontWeight: 700, letterSpacing: .5, textTransform: 'uppercase',
            padding: '2px 7px', borderRadius: 5,
            color: '#4d8aff', background: 'rgba(77,138,255,.12)', border: '1px solid rgba(77,138,255,.25)',
          }}>{c}</span>
        ))}
        {t.athletes_count && (
          <span style={{
            fontSize: 9, fontWeight: 700, letterSpacing: .5, textTransform: 'uppercase',
            padding: '2px 7px', borderRadius: 5,
            color: 'rgba(255,255,255,.4)', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)',
          }}>{t.athletes_count} atletas</span>
        )}
      </div>

      {deal.deal_value && (
        <div style={{ fontSize: 13, fontWeight: 800, color: '#20e33f', marginBottom: 6 }}>
          {fmt(deal.deal_value)}
        </div>
      )}

      {deal.notes && (
        <div style={{
          fontSize: 11, color: 'rgba(255,255,255,.35)', lineHeight: 1.4,
          overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        }}>
          {deal.notes}
        </div>
      )}
    </div>
  );
}

export default function BluePandaCRMPage() {
  const [deals, setDeals]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [dragId, setDragId]   = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const [role, setRole]       = useState('viewer');

  const fetchDeals = useCallback(async () => {
    setLoading(true);
    const d = await fetch('/api/admin/blue-panda/deals').then(r => r.json());
    setDeals(d.deals || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch('/api/admin/me').then(r => r.json()).then(d => setRole(d.role || 'viewer'));
    fetchDeals();
  }, [fetchDeals]);

  const readOnly = role === 'viewer';

  async function handleDrop(stageKey) {
    if (!dragId || readOnly) return;
    const deal = deals.find(d => d.id === dragId);
    if (!deal || deal.status === stageKey) { setDragId(null); setDragOver(null); return; }

    // Optimistic
    setDeals(prev => prev.map(d => d.id === dragId ? { ...d, status: stageKey } : d));
    setDragId(null); setDragOver(null);

    await fetch(`/api/admin/blue-panda/deals/${dragId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: stageKey }),
    });
  }

  // Summary totals
  const totalValue = deals
    .filter(d => d.status === 'fechado')
    .reduce((s, d) => s + (Number(d.deal_value) || 0), 0);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: '#fff' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', color: '#4d8aff', marginBottom: 8 }}>Blue Panda · CRM</div>
        <h1 style={{ fontSize: 36, fontWeight: 900, letterSpacing: -1.5, color: '#fff', margin: 0 }}>Pipeline de Vendas</h1>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
        {[
          { label: 'Total no pipeline', value: deals.filter(d => d.status !== 'perdido').length, color: '#4d8aff' },
          { label: 'Fechados',          value: deals.filter(d => d.status === 'fechado').length, color: '#20e33f' },
          { label: 'Em negociação',     value: deals.filter(d => d.status === 'em_negociacao').length, color: '#f97316' },
          { label: 'Receita fechada',   value: totalValue > 0 ? fmt(totalValue) : '—', color: '#20e33f', big: false },
        ].map(s => (
          <div key={s.label} style={{
            flex: 1, minWidth: 140, padding: '18px 22px', borderRadius: 16,
            background: s.color + '08', border: `1px solid ${s.color}18`,
          }}>
            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: s.color, marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: typeof s.value === 'string' ? 20 : 36, fontWeight: 900, letterSpacing: -2, lineHeight: 1, color: '#fff' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Board */}
      {loading ? (
        <div style={{ color: 'rgba(255,255,255,.25)', textAlign: 'center', paddingTop: 80, fontSize: 14 }}>Carregando...</div>
      ) : (
        <div style={{ display: 'flex', overflowX: 'auto', alignItems: 'flex-start', paddingBottom: 32, gap: 0 }}>
          {STAGES.map((stage, idx) => {
            const items = deals.filter(d => d.status === stage.key);
            const isOver = dragOver === stage.key;
            const stageTotal = items.reduce((s, d) => s + (Number(d.deal_value) || 0), 0);

            return (
              <div key={stage.key} style={{ display: 'flex', flexShrink: 0 }}>
                {idx > 0 && (
                  <div style={{ width: 1, alignSelf: 'stretch', background: 'rgba(255,255,255,.05)', margin: '0 10px', flexShrink: 0 }} />
                )}
                <div
                  style={{ width: 252 }}
                  onDragOver={e => { if (!readOnly) { e.preventDefault(); setDragOver(stage.key); } }}
                  onDragEnter={e => { if (!readOnly) { e.preventDefault(); setDragOver(stage.key); } }}
                  onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget)) setDragOver(null); }}
                  onDrop={e => { e.preventDefault(); if (!readOnly) handleDrop(stage.key); }}
                >
                  {/* Column header */}
                  <div style={{ marginBottom: 14, padding: '0 2px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: stage.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,.55)' }}>{stage.label}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 20, background: 'rgba(255,255,255,.06)', color: 'rgba(255,255,255,.3)' }}>{items.length}</span>
                    </div>
                    {stageTotal > 0 && (
                      <div style={{ fontSize: 11, color: stage.color, paddingLeft: 16, fontWeight: 700 }}>{fmt(stageTotal)}</div>
                    )}
                  </div>

                  {/* Drop zone */}
                  <div style={{
                    minHeight: 80, borderRadius: 14,
                    background: isOver ? stage.color + '0a' : 'transparent',
                    border: isOver ? `1px dashed ${stage.color}50` : '1px solid transparent',
                    padding: isOver ? 6 : 0, transition: 'all .15s',
                  }}>
                    {items.map(d => (
                      <DealCard
                        key={d.id}
                        deal={d}
                        onClick={setSelected}
                        isDragging={dragId === d.id}
                        onDragStart={e => { e.dataTransfer.effectAllowed = 'move'; setDragId(d.id); }}
                        onDragEnd={() => { setDragId(null); setDragOver(null); }}
                        readOnly={readOnly}
                      />
                    ))}
                    {items.length === 0 && !isOver && (
                      <div style={{
                        border: '1px dashed rgba(255,255,255,.06)', borderRadius: 14,
                        padding: 28, textAlign: 'center', color: 'rgba(255,255,255,.14)', fontSize: 12,
                      }}>Nenhum lead</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selected && (
        <DealModal
          deal={selected}
          onClose={() => setSelected(null)}
          onUpdate={() => { fetchDeals(); setSelected(null); }}
          onRemove={fetchDeals}
          readOnly={readOnly}
        />
      )}
    </div>
  );
}
