'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

const ACCENT = '#0D4BFF';
const YELLOW = '#b8860b';
const GREEN  = '#009c3b';
const INK    = '#0f172a';   // texto principal (cards brancos, padrão do admin)

const card = (extra = {}) => ({
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  boxShadow: '0 1px 4px rgba(0,0,0,.06)',
  borderRadius: 18, padding: '20px 20px', ...extra,
});

const miniCard = (extra = {}) => ({
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: 12, padding: '12px 14px', ...extra,
});

const tag = (color) => ({
  fontSize: 10, fontWeight: 800, letterSpacing: .5, textTransform: 'uppercase',
  padding: '3px 10px', borderRadius: 6,
  background: color + '18', color, border: `1px solid ${color}30`,
  display: 'inline-block', whiteSpace: 'nowrap',
});

const lbl = {
  fontSize: 10, fontWeight: 700, color: 'rgba(15,23,42,.5)',
  letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 5,
};

const inputSt = {
  width: '100%', boxSizing: 'border-box', padding: '12px 14px',
  background: '#ffffff', border: '1px solid #cbd5e1',
  borderRadius: 10, color: '#0f172a', fontSize: 14, outline: 'none',
  fontFamily: "'Inter', sans-serif",
};

const selectSt = {
  ...inputSt, cursor: 'pointer',
  appearance: 'none', WebkitAppearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='rgba(15,23,42,.45)' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: 36,
};

const btnPrimary = (bg = ACCENT, fg = '#fff') => ({
  padding: '13px 20px', borderRadius: 12, border: 'none',
  background: bg, color: fg, fontSize: 14, fontWeight: 800,
  letterSpacing: .3, cursor: 'pointer', fontFamily: 'inherit',
  display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
});

const PORTAL_STATUS = {
  pending_email:    { label: 'Aguard. e-mail', color: '#a855f7' },
  pending_approval: { label: 'Em análise',     color: YELLOW },
  approved:         { label: 'Aprovado ✓',     color: GREEN },
  rejected:         { label: 'Não aprovado',   color: '#ff4444' },
};

const CATS = ['Masculino', 'Feminino', 'Sub-15', 'Sub-12'];

const DATES = [
  { date: '15/07', label: '1ª parcela do pagamento de inscrição', highlight: true },
  { date: '15/08', label: '2ª parcela do pagamento de inscrição', highlight: true },
  { date: '15/09', label: '3ª parcela do pagamento de inscrição', highlight: true },
  { date: '15/10', label: 'Aprovação de documentos dos atletas' },
  { date: '20/10', label: 'Prazo de envio do roster completo' },
  { date: '30/10', label: 'Cerimônia de abertura' },
  { date: '30/10', label: 'Início das rodadas da fase de grupos' },
];

const DOCS = [
  { id: 'roster',  label: 'Roster completo de atletas enviado' },
  { id: 'rg',      label: 'Documentos de identificação (RG/Passaporte)' },
  { id: 'payment', label: 'Pagamento da taxa de inscrição confirmado' },
  { id: 'uniform', label: 'Uniformes em conformidade com o regulamento' },
];

const REGS = [
  { icon: '🏈', title: 'Formato de jogo', text: '5×5 flag football. 2 tempos de 20 min com 2 min de intervalo.' },
  { icon: '👥', title: 'Roster', text: 'Mín. 10 / máx. 20 atletas por categoria. Entrega até a data limite.' },
  { icon: '👕', title: 'Uniformes', text: 'Camisas numeradas obrigatórias. Calções sem bolsos. Cleats de borracha.' },
  { icon: '🚩', title: 'Flags', text: 'Proibido amarrar ou esconder as flags. Rush flag obrigatória.' },
  { icon: '📋', title: 'Elegibilidade', text: 'E-mail do atleta deve estar na lista do clube. Documento válido exigido.' },
  { icon: '⚖️', title: 'Fair Play', text: 'Conduta antidesportiva resulta em punição. Decisão da comissão é final.' },
];

const TRAVEL = [
  { icon: '🏨', title: 'Hotéis & Voos', text: 'Nossa agência parceira Blue Panda Travel entrará em contato com as equipes confirmadas para oferecer pacotes com tarifas especiais. Dúvidas: contato@bluepandatravel.com.br' },
  { icon: '🚌', title: 'Transfer oficial', text: 'Transfer gratuito no dia 30/10, partindo de Guarulhos (GRU) e com parada em Viracopos (VCP), nos horários: 08h00 · 15h00 · 23h00.' },
  { icon: '🗺️', title: 'Guia do Participante', text: 'Mapa do evento, restaurantes e dicas locais de Leme/SP enviados às equipes confirmadas.' },
];

const EQUIP = [
  { type: 'ok',  item: 'Camisas numeradas (frente e verso, mín. 5cm)' },
  { type: 'ok',  item: 'Calções sem bolsos externos' },
  { type: 'ok',  item: 'Calçado esportivo (turf, grama ou tênis)' },
  { type: 'ok',  item: 'Flags oficiais (trazer o próprio cinto de flags)' },
  { type: 'opt', item: 'Protetor bucal (recomendado)' },
  { type: 'opt', item: 'Luvas de receptor (permitido)' },
  { type: 'opt', item: 'Joelheira e cotoveleira (permitido)' },
  { type: 'no',  item: 'Cleats com travas de metal — PROIBIDO' },
  { type: 'no',  item: 'Capacete ou proteção rígida — PROIBIDO' },
];

const PHASE_LABELS = {
  group: 'Fase de Grupos', quarterfinal: 'Quartas', semifinal: 'Semifinal',
  final: 'Final', '3rd_place': '3º Lugar',
};

// ── Portal status badge (4 etapas) ───────────────────────────────
// ATIVO só aparece quando o atleta finalizou o cadastro (approved)
function PortalBadge({ a }) {
  if (!a.portal_registered)
    return <span style={tag('rgba(15,23,42,.3)')}>Sem conta</span>;

  if (!a.portal_email_verified)
    return <span style={tag('#f4ff00')}>📧 Verificar e-mail</span>;

  if (a.portal_status === 'approved')
    return (
      <div>
        <span style={tag(GREEN)}>✓ Aprovado</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 5 }}>
          <div style={{ width: 6, height: 6, borderRadius: 3, background: GREEN, flexShrink: 0 }} />
          <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: .5, color: GREEN }}>ATIVO</span>
        </div>
      </div>
    );

  // email verificado mas perfil incompleto
  return (
    <div>
      <span style={tag('#3b9eff')}>✉️ Verificado</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 5 }}>
        <div style={{ width: 6, height: 6, borderRadius: 3, background: '#ff6666', flexShrink: 0 }} />
        <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: .5, color: '#ff6666' }}>INATIVO</span>
      </div>
    </div>
  );
}

// ── Athlete card (mobile) ─────────────────────────────────────────
function AthleteCard({ a, onEdit, onDelete, deletingId }) {
  return (
    <div style={{ ...miniCard(), marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: INK, marginBottom: 4 }}>
            {a.jersey_number ? <span style={{ color: ACCENT, marginRight: 6 }}>#{a.jersey_number}</span> : null}
            {a.name}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {a.category && <span style={tag(ACCENT)}>{a.category}</span>}
            <PortalBadge a={a} />
          </div>
        </div>
      </div>
      {(a.email || a.birth_date || a.document) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
          {a.email && (
            <div style={{ gridColumn: '1 / -1' }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(15,23,42,.25)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 }}>E-mail</div>
              <div style={{ fontSize: 12, color: 'rgba(15,23,42,.5)', wordBreak: 'break-all' }}>{a.email}</div>
            </div>
          )}
          {a.birth_date && (
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(15,23,42,.25)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 }}>Nascimento</div>
              <div style={{ fontSize: 12, color: 'rgba(15,23,42,.5)' }}>{new Date(a.birth_date + 'T00:00:00').toLocaleDateString('pt-BR')}</div>
            </div>
          )}
          {a.document && (
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(15,23,42,.25)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 }}>Documento</div>
              <div style={{ fontSize: 12, color: 'rgba(15,23,42,.5)' }}>{a.document}</div>
            </div>
          )}
        </div>
      )}
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => onEdit(a)} style={{ flex: 1, padding: '9px', borderRadius: 9, border: `1px solid ${ACCENT}40`, background: `${ACCENT}12`, color: ACCENT, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
          ✎ Editar
        </button>
        <button onClick={() => onDelete(a.id)} disabled={deletingId === a.id} style={{ flex: 1, padding: '9px', borderRadius: 9, border: '1px solid rgba(255,68,68,.2)', background: 'rgba(255,68,68,.08)', color: '#ff6666', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
          {deletingId === a.id ? '...' : '✕ Excluir'}
        </button>
      </div>
    </div>
  );
}

// ── Validação de idade por categoria ─────────────────────────────
function checkCategoryAge(birthDate, category) {
  if (!birthDate || !category) return null;
  const EVENT_YEAR = 2026;
  const limits = { 'Sub-15': 15, 'Sub-12': 12 };
  const maxAge = limits[category];
  if (!maxAge) return null;
  const minBirthYear = EVENT_YEAR - maxAge;
  const birthYear = new Date(birthDate + 'T00:00:00').getFullYear();
  if (birthYear < minBirthYear)
    return `${category}: nascimento deve ser a partir de ${minBirthYear} (atleta nascido em ${birthYear} é muito velho para esta categoria).`;
  return null;
}

// ── Edit modal (mobile-friendly overlay) ─────────────────────────
function EditModal({ athlete, onSave, onCancel, cats = [] }) {
  const [data, setData] = useState({
    name: athlete.name || '', email: athlete.email || '',
    category: athlete.category || '', jersey_number: athlete.jersey_number || '',
    birth_date: athlete.birth_date || '', document: athlete.document || '',
  });
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState('');

  // Validação de idade em tempo real
  const ageError = checkCategoryAge(data.birth_date, data.category);

  async function save() {
    if (ageError) { setSaveErr(ageError); return; }
    setSaving(true); setSaveErr('');
    await onSave(athlete.id, data);
    setSaving(false);
  }

  const subCategory = ['Sub-15', 'Sub-12'].includes(data.category);
  const minBirthYear = data.category === 'Sub-15' ? 2011 : data.category === 'Sub-12' ? 2014 : null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(2,8,20,.92)', zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', backdropFilter: 'blur(6px)' }}>
      <div style={{ width: '100%', maxWidth: 520, background: '#ffffff', borderRadius: '24px 24px 0 0', padding: '24px 20px 40px', boxShadow: '0 -20px 60px rgba(0,0,0,.3)' }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(15,23,42,.15)', margin: '0 auto 20px' }} />
        <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 18 }}>Editar atleta</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
          <div><label style={lbl}>Nome completo *</label><input style={inputSt} value={data.name} onChange={e => setData(p => ({ ...p, name: e.target.value }))} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div><label style={lbl}>Nº camisa</label><input style={inputSt} type="number" value={data.jersey_number} onChange={e => setData(p => ({ ...p, jersey_number: e.target.value }))} placeholder="10" /></div>
            <div>
              <label style={lbl}>Categoria</label>
              <select style={selectSt} value={data.category} onChange={e => setData(p => ({ ...p, category: e.target.value }))}>
                <option value="" style={{ background: '#ffffff' }}>—</option>
                {cats.map(c => <option key={c} value={c} style={{ background: '#ffffff' }}>{c}</option>)}
              </select>
            </div>
          </div>
          <div><label style={lbl}>E-mail</label><input style={inputSt} type="email" value={data.email} onChange={e => setData(p => ({ ...p, email: e.target.value }))} placeholder="email@atleta.com" /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={lbl}>
                Nascimento{subCategory && <span style={{ color: '#f97316', marginLeft: 4 }}>≥ {minBirthYear}</span>}
              </label>
              <input
                style={{ ...inputSt, borderColor: ageError ? '#ff4444' : 'rgba(15,23,42,.1)' }}
                type="date"
                value={data.birth_date}
                onChange={e => setData(p => ({ ...p, birth_date: e.target.value }))}
              />
            </div>
            <div><label style={lbl}>CPF / Passaporte</label><input style={inputSt} value={data.document} onChange={e => setData(p => ({ ...p, document: e.target.value }))} placeholder="000.000.000-00" /></div>
          </div>
          {ageError && (
            <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(255,68,68,.1)', border: '1px solid rgba(255,68,68,.25)', fontSize: 12, color: '#ff8888', lineHeight: 1.5 }}>
              🚫 {ageError}
            </div>
          )}
        </div>
        {(saveErr && !ageError) && <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(255,68,68,.1)', border: '1px solid rgba(255,68,68,.2)', fontSize: 12, color: '#ff8888', marginBottom: 10 }}>{saveErr}</div>}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: '14px', borderRadius: 12, border: '1px solid rgba(15,23,42,.1)', background: 'rgba(15,23,42,.05)', color: 'rgba(15,23,42,.5)', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            Cancelar
          </button>
          <button onClick={save} disabled={saving || !!ageError} style={{ flex: 2, padding: '14px', borderRadius: 12, border: 'none', background: ageError ? 'rgba(255,68,68,.3)' : GREEN, color: ageError ? '#ff8888' : '#fff', fontSize: 14, fontWeight: 800, cursor: ageError ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
            {saving ? 'Salvando...' : '✓ Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Venue Map Component ──────────────────────────────────────── */
function VenueMap() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const W = 1100, H = 800;
    canvas.width = W; canvas.height = H;
    const g = canvas.getContext('2d');

    function rrect(x,y,w,h,r,fill,stroke,lw=1){
      g.beginPath();
      if(g.roundRect){g.roundRect(x,y,w,h,r);}else{
        g.moveTo(x+r,y);g.lineTo(x+w-r,y);g.arcTo(x+w,y,x+w,y+r,r);
        g.lineTo(x+w,y+h-r);g.arcTo(x+w,y+h,x+w-r,y+h,r);
        g.lineTo(x+r,y+h);g.arcTo(x,y+h,x,y+h-r,r);
        g.lineTo(x,y+r);g.arcTo(x,y,x+r,y,r);g.closePath();
      }
      if(fill!==null){g.fillStyle=fill;g.fill();}
      if(stroke){g.strokeStyle=stroke;g.lineWidth=lw;g.stroke();}
    }
    function txt(t,x,y,sz,col,wt='600',al='center',bl='middle'){
      g.textAlign=al;g.textBaseline=bl;
      g.font=`${wt} ${sz}px Inter,system-ui,sans-serif`;
      g.fillStyle=col;g.fillText(t,x,y);
    }
    function ns(){g.shadowBlur=0;g.shadowColor='transparent';}

    const sky=g.createLinearGradient(0,0,0,H);
    sky.addColorStop(0,'#5c6b4a');sky.addColorStop(1,'#4a5839');
    g.fillStyle=sky;g.fillRect(0,0,W,H);
    g.globalAlpha=0.13;
    for(let i=0;i<350;i++){
      const nx=Math.random()*W,ny=Math.random()*H,nr=Math.random()*3+1;
      g.beginPath();g.arc(nx,ny,nr,0,Math.PI*2);
      g.fillStyle=Math.random()>0.5?'#7a8a5a':'#3a4a2a';g.fill();
    }
    g.globalAlpha=1;
    rrect(10,10,W-20,H-20,18,'#6e7d58','#5a6948',2);
    rrect(28,28,W-56,H-56,14,'#6e7d58',null);

    g.fillStyle='#8a9272';g.fillRect(40,380,W-80,22);
    g.setLineDash([18,12]);g.strokeStyle='rgba(255,220,50,.4)';g.lineWidth=1.5;
    g.beginPath();g.moveTo(40,391);g.lineTo(W-40,391);g.stroke();g.setLineDash([]);
    [232,396,560,724,888].forEach(rx=>{g.fillStyle='#8a9272';g.fillRect(rx,40,18,H-80);});
    g.fillStyle='#8a9272';g.fillRect(490,H-80,120,80);
    g.setLineDash([10,8]);g.strokeStyle='rgba(255,220,50,.5)';g.lineWidth=1.5;
    g.beginPath();g.moveTo(550,H-80);g.lineTo(550,H-10);g.stroke();g.setLineDash([]);

    function drawParking(x,y,w,h,cols,rows,lbl){
      rrect(x,y,w,h,6,'#2a2f3a','#1a1f28',1);
      const cw=(w-10)/cols,rh=(h-10)/rows;
      for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
        const px=x+5+c*cw,py=y+5+r*rh;
        rrect(px+1,py+1,cw-2,rh-2,2,'#35404f','#25303e',0.5);
        if(Math.random()<0.6){rrect(px+cw/2-6,py+rh*0.25,12,rh*0.5,2,'#1e2a38',null);}
      }
      txt(lbl,x+w/2,y+h-12,9,'rgba(15,23,42,.35)','700');
    }
    drawParking(40,40,180,332,3,5,'🅿 ESTAC. OESTE');
    drawParking(880,40,180,332,3,5,'🅿 ESTAC. LESTE');
    drawParking(40,402,180,350,3,5,'🅿 ESTAC. OESTE');
    drawParking(880,402,180,350,3,5,'🅿 ESTAC. LESTE');

    function warmup(x,y,w,h,lbl){
      rrect(x,y,w,h,5,'#1a3d1a',null);
      g.setLineDash([8,5]);rrect(x,y,w,h,5,null,'#4caf50',1.2);g.setLineDash([]);
      for(let lx=x+20;lx<x+w-10;lx+=20){
        g.strokeStyle='rgba(15,23,42,.1)';g.lineWidth=0.8;
        g.beginPath();g.moveTo(lx,y);g.lineTo(lx,y+h);g.stroke();
      }
      txt(lbl,x+w/2,y+h/2+1,8,'rgba(100,220,100,.6)','700');
    }
    warmup(250,360,222,18,'⚡ AQUECIMENTO 1');
    warmup(480,360,222,18,'⚡ AQUECIMENTO 2');
    warmup(250,404,222,18,'⚡ AQUECIMENTO 3');
    warmup(480,404,222,18,'⚡ AQUECIMENTO 4');

    const FW=166,FH=296,EZ=28;
    function drawField(x,y,num,cat,catColor){
      g.shadowColor='rgba(0,0,0,.5)';g.shadowBlur=14;
      rrect(x+3,y+3,FW,FH,8,'rgba(0,0,0,.3)',null);ns();
      rrect(x,y,FW,FH,8,'#246024',null);
      const stripes=8,stripeH=(FH-EZ*2)/stripes;
      for(let i=0;i<stripes;i++){
        g.fillStyle=i%2===0?'#236023':'#1d561d';
        g.fillRect(x,y+EZ+i*stripeH,FW,stripeH);
      }
      rrect(x,y,FW,EZ,8,'#1c4a1c',null);
      g.fillStyle='#1c4a1c';g.fillRect(x,y+8,FW,EZ-8);
      rrect(x,y+FH-EZ,FW,EZ,8,'#1c4a1c',null);
      g.fillStyle='#1c4a1c';g.fillRect(x,y+FH-EZ,FW,EZ-8);
      g.save();g.translate(x+FW/2,y+EZ/2);txt('BFWC 2026',0,0,7,'rgba(15,23,42,.15)','800');g.restore();
      g.save();g.translate(x+FW/2,y+FH-EZ/2);txt('BFWC 2026',0,0,7,'rgba(15,23,42,.15)','800');g.restore();
      g.strokeStyle='rgba(15,23,42,.18)';g.lineWidth=0.8;
      const fieldH=FH-EZ*2;
      [1,2,3,4].forEach(i=>{
        const ly=y+EZ+i*fieldH/5;
        g.beginPath();g.moveTo(x,ly);g.lineTo(x+FW,ly);g.stroke();
        txt(`${i*10}`,x+8,ly,6,'rgba(15,23,42,.2)');
        txt(`${i*10}`,x+FW-8,ly,6,'rgba(15,23,42,.2)');
      });
      g.setLineDash([5,4]);g.strokeStyle='rgba(15,23,42,.35)';g.lineWidth=1;
      const midY=y+FH/2;
      g.beginPath();g.moveTo(x,midY);g.lineTo(x+FW,midY);g.stroke();g.setLineDash([]);
      g.strokeStyle='rgba(15,23,42,.2)';g.lineWidth=0.8;
      g.beginPath();g.arc(x+FW/2,midY,12,0,Math.PI*2);g.stroke();
      g.shadowColor='rgba(0,200,0,.3)';g.shadowBlur=6;
      rrect(x,y,FW,FH,8,null,'#3dba3d',1.8);ns();
      rrect(x+FW/2-14,y+FH/2-10,28,20,6,'rgba(0,0,0,.7)',null);
      txt(`C${num}`,x+FW/2,y+FH/2,12,'#20e33f','900');
      const catW=FW-16;
      rrect(x+8,y+FH-EZ+4,catW,15,4,catColor+'33',catColor,0.8);
      txt(cat,x+FW/2,y+FH-EZ+12,7,catColor,'700');
    }
    const COL=[250,434,618,802],ROW=[44,424];
    const FIELDS=[
      {num:1,cat:'MASCULINO',color:'#20e33f'},
      {num:2,cat:'FEMININO',color:'#f472b6'},
      {num:3,cat:'SUB-15 ♂',color:'#60a5fa'},
      {num:4,cat:'SUB-12 ♂',color:'#34d399'},
      {num:5,cat:'MASCULINO B',color:'#20e33f'},
      {num:6,cat:'FEMININO B',color:'#f472b6'},
      {num:7,cat:'SUB-15 ♀',color:'#f9a8d4'},
      {num:8,cat:'ABERTO/MISTO',color:'#fbbf24'},
    ];
    FIELDS.forEach((f,i)=>{
      drawField(COL[i%4],ROW[Math.floor(i/4)],f.num,f.cat,f.color);
    });

    g.shadowColor='rgba(200,160,0,.4)';g.shadowBlur=16;
    rrect(350,H-105,400,68,10,'#1a1500',null);ns();
    rrect(350,H-105,400,68,10,'#1a1500','#c9a227',2);
    g.fillStyle='#c9a227';g.beginPath();g.moveTo(365,H-75);g.lineTo(378,H-58);g.lineTo(352,H-58);g.closePath();g.fill();
    txt('🎤  PALCO PRINCIPAL',550,H-90,12,'#f4e27a','800');
    txt('Abertura · Encerramento · Premiações — 30/10',550,H-73,9,'rgba(255,200,50,.5)','600');
    txt('Leme, SP',550,H-58,8,'rgba(255,200,50,.3)','600');

    rrect(40,H-105,140,68,8,'#0d1e38','#2a6fc9',2);
    txt('🪪',70,H-74,18,'#3b9eff','400');
    txt('CREDENCIAMENTO',110,H-88,8,'#5aafff','700');
    txt('Entrada principal',110,H-75,7.5,'rgba(160,200,255,.4)','500');
    txt('Identidade obrigatória',110,H-62,7,'rgba(160,200,255,.3)','500');

    rrect(192,H-105,140,68,8,'#200808','#c93a3a',2);
    txt('🏥',222,H-74,18,'#ff5555','400');
    txt('SUPORTE MÉDICO',262,H-88,8,'#ff7a7a','700');
    txt('Primeiros socorros',262,H-75,7.5,'rgba(255,160,160,.4)','500');

    rrect(762,H-105,150,68,8,'#1a0e02','#c97a2a',2);
    txt('🍽️',792,H-74,18,'#f97316','400');
    txt('ALIMENTAÇÃO',837,H-88,9,'#fb923c','700');
    txt('Food trucks · Lanchonetes',837,H-75,7.5,'rgba(255,180,100,.4)','500');

    rrect(924,H-105,136,68,8,'#100820','#8a3dcc',2);
    txt('📋',950,H-74,18,'#a855f7','400');
    txt('ORGANIZAÇÃO',992,H-88,8,'#c084fc','700');
    txt('Info · Protestos',992,H-75,7.5,'rgba(200,150,255,.4)','500');

    rrect(924,H-185,136,68,8,'#041018','#0ea5e9',2);
    txt('🚿',950,H-154,18,'#38bdf8','400');
    txt('VESTIÁRIOS',992,H-168,8,'#7dd3fc','700');
    txt('M · F — Chuveiros',992,H-155,7.5,'rgba(150,220,255,.4)','500');

    rrect(456,H-34,188,28,6,'rgba(0,0,0,.65)','rgba(244,255,0,.3)',1);
    txt('▲  ENTRADA PRINCIPAL',550,H-20,11,'#f4ff00','800');

    g.fillStyle='rgba(15,23,42,.7)';g.fillRect(42,H-30,60,4);
    g.fillStyle='rgba(15,23,42,.35)';g.fillRect(102,H-30,60,4);
    txt('0        50m       100m',132,H-18,8,'rgba(15,23,42,.35)');

    const hg=g.createLinearGradient(0,0,W,0);
    hg.addColorStop(0,'rgba(20,50,20,.8)');hg.addColorStop(0.5,'rgba(0,0,0,.85)');hg.addColorStop(1,'rgba(20,50,20,.8)');
    g.fillStyle=hg;g.fillRect(0,0,W,38);
    txt('🏈  BRASIL FLAG WORLD CHAMPIONSHIP 2026  —  MAPA DO VENUE  —  LEME, SP',W/2,20,12,'#f4ff00','800');

    g.save();g.translate(W-32,58);
    g.beginPath();g.arc(0,0,18,0,Math.PI*2);
    const na=g.createRadialGradient(0,0,2,0,0,18);
    na.addColorStop(0,'rgba(15,23,42,.12)');na.addColorStop(1,'rgba(0,0,0,.4)');
    g.fillStyle=na;g.fill();
    g.strokeStyle='rgba(15,23,42,.2)';g.lineWidth=1;g.stroke();
    g.beginPath();g.moveTo(0,-13);g.lineTo(-5,2);g.lineTo(0,-1);g.lineTo(5,2);g.closePath();
    g.fillStyle='#f4ff00';g.fill();
    g.beginPath();g.moveTo(0,13);g.lineTo(-5,-2);g.lineTo(0,1);g.lineTo(5,-2);g.closePath();
    g.fillStyle='rgba(15,23,42,.2)';g.fill();
    txt('N',0,-18,8,'rgba(15,23,42,.6)','800');
    g.restore();
  }, []);

  return (
    <div>
      <canvas ref={ref} style={{ width:'100%', borderRadius:12, display:'block' }} />
      <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginTop:10, padding:'8px 12px', background:'rgba(15,23,42,.03)', borderRadius:10, border:'1px solid rgba(15,23,42,.06)' }}>
        {[['#2a6e2a','Campos'],['#4caf50','Aquecimento'],['#c9a227','Palco'],['#2a6fc9','Credenciamento'],['#c93a3a','Médico'],['#c97a2a','Alimentação'],['#8a3dcc','Organização'],['#0ea5e9','Vestiários'],['#2a2f3a','Estacionamento']].map(([col,lbl])=>(
          <div key={lbl} style={{ display:'flex', alignItems:'center', gap:5, fontSize:10, color:'rgba(15,23,42,.45)' }}>
            <span style={{ width:11,height:11,borderRadius:3,background:col,flexShrink:0,display:'inline-block' }}/>
            {lbl}
          </div>
        ))}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
export default function TimesPortalPage() {
  const router = useRouter();
  const [team, setTeam]   = useState(null);
  const [tab, setTab]     = useState('inscricao');
  const [docs, setDocs]   = useState({});
  const [isMobile, setIsMobile] = useState(false);

  const [athletes, setAthletes]     = useState([]);
  const [athLoading, setAthLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAth, setNewAth]           = useState({ name: '', email: '', category: '', jersey_number: '', birth_date: '', document: '' });
  const [athSaving, setAthSaving]     = useState(false);
  const [athError, setAthError]       = useState('');
  const [deletingId, setDeletingId]   = useState(null);
  const [editingAth, setEditingAth]   = useState(null); // athlete object being edited

  const [games, setGames]           = useState([]);
  const [gamesLoading, setGamesLoading] = useState(false);
  const [gamesTab, setGamesTab]       = useState('schedule');
  const [lineupSubmitted, setLineupSubmitted] = useState(false);
  const [sendingLineup, setSendingLineup]     = useState(false);
  const [lineupMsg, setLineupMsg]             = useState('');
  const [catFilter, setCatFilter]             = useState('all');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutErr, setCheckoutErr]         = useState('');
  const [payPolling, setPayPolling]           = useState(false);
  const [payMethod, setPayMethod]             = useState('pix');
  const [planSize, setPlanSize]               = useState(null);   // 1, 2 ou 3 escolhido
  const [payOption, setPayOption]             = useState(null);   // '1' ou '2' (escolha do time)
  const [athleteQty, setAthleteQty]           = useState(12);     // atletas pagos na opção 2
  const [payInfo, setPayInfo]                 = useState(null);   // resposta de /payment-status
  const [activePix, setActivePix]             = useState(null);   // { number, emv, qrcode_url }
  const [pixLoadingNum, setPixLoadingNum]     = useState(0);      // nº da parcela gerando (0 = nenhuma)
  const [pixErr, setPixErr]                   = useState('');
  const [needDoc, setNeedDoc]                 = useState(false);
  const [docInput, setDocInput]               = useState('');
  const [emvCopied, setEmvCopied]             = useState(false);
  const qrRef = useRef(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const session = sessionStorage.getItem('bfwc_team_session');
    if (!session) { router.replace('/portal/times/login'); return; }
    try {
      const t = JSON.parse(session);
      setTeam(t);
      setLineupSubmitted(!!t.lineup_submitted);
      const saved = localStorage.getItem(`bfwc_docs_${t.id}`);
      if (saved) setDocs(JSON.parse(saved));
    } catch { router.replace('/portal/times/login'); }
  }, []);

  const loadAthletes = useCallback(async (tid) => {
    setAthLoading(true);
    const r = await fetch(`/api/portal/times/atletas?team_id=${tid}`);
    const d = await r.json();
    setAthletes(d.athletes || []);
    setAthLoading(false);
  }, []);

  const loadGames = useCallback(async (tid) => {
    setGamesLoading(true);
    const r = await fetch(`/api/portal/times/jogos?team_id=${tid}`);
    const d = await r.json();
    setGames(d.games || []);
    setGamesLoading(false);
  }, []);

  useEffect(() => {
    if (!team) return;
    if (tab === 'atletas')    loadAthletes(team.id);
    if (tab === 'campeonato') loadGames(team.id);
  }, [tab, team]);

  // Atualiza o status de pagamento + parcelas a partir do servidor
  const refreshPaymentStatus = useCallback(async (tid) => {
    try {
      const r = await fetch(`/api/portal/times/payment-status?team_id=${tid}`);
      const d = await r.json();
      if (d.ok) {
        setPayInfo(d);
        if (d.payment_plan) setPlanSize(d.payment_plan);
        if (d.payment_confirmed) {
          setTeam(prev => {
            if (!prev || prev.payment_confirmed) return prev;
            const updated = { ...prev, payment_confirmed: true, payment_date: d.payment_date };
            sessionStorage.setItem('bfwc_team_session', JSON.stringify(updated));
            return updated;
          });
        }
        // "pronto" para o polling = todas as parcelas pagas (ou confirmado no cartão)
        const allPaid = d.total_count > 0 && d.paid_count >= d.total_count;
        return allPaid || (d.payment_confirmed && d.total_count === 0);
      }
    } catch {}
    return false;
  }, []);

  // Ao abrir a aba de pagamento, carrega status/parcelas. Se voltou do Stripe (?paid=1),
  // faz polling alguns segundos pois a confirmação do cartão pode levar um instante.
  useEffect(() => {
    if (!team || tab !== 'pagamento') return;
    const justPaid = new URLSearchParams(window.location.search).get('paid') === '1';
    let active = true;
    let tries = 0;
    const maxTries = justPaid ? 12 : 1;
    if (justPaid) setPayPolling(true);
    const tick = async () => {
      if (!active) return;
      tries++;
      const done = await refreshPaymentStatus(team.id);
      if (done || tries >= maxTries) { if (active) setPayPolling(false); return; }
      setTimeout(tick, 4000);
    };
    tick();
    return () => { active = false; };
  }, [tab, team, refreshPaymentStatus]);

  // Enquanto há um Pix gerado e exibido, consulta o status até cair o pagamento.
  useEffect(() => {
    if (!team || !activePix) return;
    let active = true;
    const tick = async () => {
      if (!active) return;
      await refreshPaymentStatus(team.id);
      if (active) setTimeout(tick, 5000);
    };
    const id = setTimeout(tick, 5000);
    return () => { active = false; clearTimeout(id); };
  }, [activePix, team, refreshPaymentStatus]);

  // Ao abrir o portal (qualquer aba), sincroniza o status de pagamento com o servidor,
  // pra "Inscrição" não ficar mostrando dado velho do login.
  useEffect(() => {
    if (team) refreshPaymentStatus(team.id);
  }, [team?.id, refreshPaymentStatus]);

  // Gera a imagem do QR Code a partir do "copia e cola" (independente da Cora)
  useEffect(() => {
    const emv = activePix?.emv;
    if (!emv) return;
    let cancelled = false;
    const render = () => {
      if (cancelled || !qrRef.current || !window.QRCode) return;
      qrRef.current.innerHTML = '';
      new window.QRCode(qrRef.current, {
        text: emv, width: 180, height: 180,
        correctLevel: window.QRCode.CorrectLevel.M,
      });
    };
    if (window.QRCode) { render(); return () => { cancelled = true; }; }
    let s = document.getElementById('qrcodejs-cdn');
    if (!s) {
      s = document.createElement('script');
      s.id = 'qrcodejs-cdn';
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
      document.body.appendChild(s);
    }
    s.addEventListener('load', render);
    return () => { cancelled = true; s && s.removeEventListener('load', render); };
  }, [activePix]);

  async function startCheckout() {
    if (!team) return;
    const effOption = payInfo?.payment_option || payOption;
    if (!effOption) { setCheckoutErr('Escolha uma opção de pagamento.'); return; }
    const effAth = payInfo?.payment_option ? (payInfo.athletes_paid_qty || 0) : athleteQty;
    setCheckoutErr(''); setCheckoutLoading(true);
    try {
      const r = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team_id: team.id, option: effOption, athletes_qty: effAth }),
      });
      const d = await r.json();
      if (!d.ok || !d.url) throw new Error(d.message || 'Não foi possível iniciar o pagamento.');
      window.location.href = d.url; // redireciona para o Checkout hospedado da Stripe
    } catch (e) {
      setCheckoutErr(e.message);
      setCheckoutLoading(false);
    }
  }

  // Gera o Pix de uma parcela específica
  async function generateParcela(number) {
    const effOption = payInfo?.payment_option || payOption;
    if (!team || !effOption) return;
    const effAth = payInfo?.payment_option ? (payInfo.athletes_paid_qty || 0) : athleteQty;
    setPixErr(''); setPixLoadingNum(number);
    try {
      const body = { team_id: team.id, number, option: effOption, athletes_qty: effAth };
      if (docInput) body.document = docInput;
      const r = await fetch('/api/payments/pix/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const d = await r.json();
      if (r.status === 422 || d.code === 'NEED_DOCUMENT') {
        setNeedDoc(true);
        setPixErr('Informe um CPF ou CNPJ para gerar o Pix.');
        return;
      }
      if (!d.ok) throw new Error(d.message || 'Não foi possível gerar o Pix.');
      setNeedDoc(false);
      setActivePix({ number, emv: d.emv, qrcode_url: d.qrcode_url });
      refreshPaymentStatus(team.id);
    } catch (e) {
      setPixErr(e.message);
    } finally {
      setPixLoadingNum(0);
    }
  }

  function copyEmv() {
    if (!activePix?.emv) return;
    navigator.clipboard.writeText(activePix.emv).then(() => {
      setEmvCopied(true);
      setTimeout(() => setEmvCopied(false), 2500);
    });
  }

  function toggleDoc(id) {
    setDocs(prev => {
      const next = { ...prev, [id]: !prev[id] };
      if (team) localStorage.setItem(`bfwc_docs_${team.id}`, JSON.stringify(next));
      return next;
    });
  }

  function validateCategoryAge(birthDate, category) {
    if (!birthDate || !category) return null;
    const EVENT_YEAR = 2026;
    const limits = { 'Sub-15': 15, 'Sub-12': 12 };
    const maxAge = limits[category];
    if (!maxAge) return null;
    const minBirthYear = EVENT_YEAR - maxAge;
    const birthYear = new Date(birthDate + 'T00:00:00').getFullYear();
    if (birthYear < minBirthYear) {
      return `Categoria ${category}: nascimento deve ser a partir de ${minBirthYear}. Este atleta (${birthYear}) é muito velho para esta categoria.`;
    }
    return null;
  }

  async function addAthlete(e) {
    e.preventDefault();
    if (!newAth.name.trim()) { setAthError('Nome obrigatório.'); return; }
    const ageErr = validateCategoryAge(newAth.birth_date, newAth.category);
    if (ageErr) { setAthError(ageErr); return; }
    setAthSaving(true); setAthError('');
    const r = await fetch('/api/portal/times/atletas', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newAth, team_id: team.id }),
    });
    const d = await r.json();
    setAthSaving(false);
    if (d.ok) {
      setAthletes(prev => [...prev, d.athlete]);
      setNewAth({ name: '', email: '', category: '', jersey_number: '', birth_date: '', document: '' });
      setShowAddForm(false);
    } else setAthError(d.message || 'Erro ao adicionar.');
  }

  async function deleteAthlete(id) {
    if (!confirm('Remover atleta?')) return;
    setDeletingId(id);
    await fetch(`/api/portal/times/atletas/${id}?team_id=${team.id}`, { method: 'DELETE' });
    setAthletes(prev => prev.filter(a => a.id !== id));
    setDeletingId(null);
  }

  async function submitLineup() {
    if (!confirm(`Confirmar envio da escalação com ${athletes.length} atleta${athletes.length !== 1 ? 's' : ''}?\n\nApós o envio, alterações no roster precisarão de aprovação da organização.`)) return;
    setSendingLineup(true); setLineupMsg('');
    const r = await fetch('/api/portal/times/enviar-escalacao', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ team_id: team.id }),
    });
    const d = await r.json();
    setSendingLineup(false);
    if (d.ok) {
      setLineupSubmitted(true);
      setLineupMsg('Escalação enviada com sucesso! A organização foi notificada.');
      const updated = { ...team, lineup_submitted: true };
      setTeam(updated);
      sessionStorage.setItem('bfwc_team_session', JSON.stringify(updated));
    } else setLineupMsg(d.message || 'Erro ao enviar escalação.');
  }

  async function saveEdit(id, data) {
    const r = await fetch(`/api/portal/times/atletas/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ team_id: team.id, ...data, jersey_number: data.jersey_number ? parseInt(data.jersey_number) : null }),
    });
    const d = await r.json();
    if (d.ok) {
      setAthletes(prev => prev.map(a => a.id === id ? { ...d.athlete, portal_registered: a.portal_registered, portal_email_verified: a.portal_email_verified, portal_status: a.portal_status } : a));
      setEditingAth(null);
    }
  }

  if (!team) return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(15,23,42,.5)', fontFamily: 'Inter,sans-serif', fontSize: 14 }}>
      Carregando...
    </div>
  );

  const ps = PORTAL_STATUS[team.status] || { label: team.status, color: INK };
  const athByCat = CATS.reduce((acc, c) => { acc[c] = athletes.filter(a => a.category === c); return acc; }, {});

  // Só as categorias que o clube escolheu na pré-inscrição
  const registeredCats = CATS.filter(c => team.category?.includes(c));

  const MIN_ATH = 10, MAX_ATH = 20;
  const activeCats = registeredCats.filter(c => athByCat[c].length > 0);
  const catStatus = (cat) => {
    const n = athByCat[cat]?.length || 0;
    if (n === 0) return 'empty';       // não participando
    if (n < MIN_ATH) return 'low';     // faltam atletas
    if (n > MAX_ATH) return 'over';    // excede o máximo
    return 'ok';                       // válido
  };
  const catColor = (cat) => {
    const s = catStatus(cat);
    if (s === 'empty')  return 'rgba(15,23,42,.18)';
    if (s === 'low')    return '#f97316';   // laranja — faltam
    if (s === 'over')   return '#ff4444';   // vermelho — excede
    return GREEN;                           // verde — ok
  };
  const catIcon = (cat) => {
    const s = catStatus(cat);
    if (s === 'empty')  return '—';
    if (s === 'low')    return '⚠️';
    if (s === 'over')   return '🚫';
    return '✓';
  };
  const lineupBlocked = activeCats.some(c => catStatus(c) !== 'ok');
  const lineupBlockReason = (() => {
    const low  = activeCats.filter(c => catStatus(c) === 'low');
    const over = activeCats.filter(c => catStatus(c) === 'over');
    const parts = [];
    if (low.length)  parts.push(`${low.join(', ')}: faltam atletas (mín. ${MIN_ATH})`);
    if (over.length) parts.push(`${over.join(', ')}: excede o máximo (máx. ${MAX_ATH})`);
    return parts.join(' · ');
  })();

  const visibleAthletes = catFilter === 'all'
    ? [...athletes].sort((a, b) => (a.category||'').localeCompare(b.category||'') || (a.name||'').localeCompare(b.name||''))
    : [...athByCat[catFilter] || []].sort((a, b) => (a.name||'').localeCompare(b.name||''));
  const finishedGames = games.filter(g => g.status === 'finished');
  const upcomingGames = games.filter(g => g.status !== 'finished');
  const myResult = (g) => {
    const me = g.team1_id === team.id;
    const ms = me ? g.team1_score : g.team2_score;
    const os = me ? g.team2_score : g.team1_score;
    if (g.team1_score == null) return { me, result: null };
    return { me, ms, os, result: ms > os ? 'win' : ms < os ? 'loss' : 'draw' };
  };

  const TABS = [
    { key: 'inscricao',   icon: '📋', label: 'Inscrição' },
    { key: 'pagamento',   icon: '💳', label: 'Pagamento' },
    { key: 'atletas',     icon: '👥', label: 'Atletas' },
    { key: 'campeonato',  icon: '🏟️', label: 'Campeonato' },
    { key: 'informacoes', icon: 'ℹ️', label: 'Info' },
  ];

  const pad = isMobile ? '16px 14px 80px' : '28px 20px 80px';
  const cpad = isMobile ? '16px' : '24px 28px';

  return (
    <div style={{ minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: INK, position: 'relative', background: '#f1f5f9' }}>
      {/* imagem de fundo removida para um visual mais limpo */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 1, background: 'linear-gradient(90deg,#031020 0%,#009c3b 50%,#031020 100%)', height: 4, bottom: 'auto' }} />
      <div style={{ position: 'relative', zIndex: 2 }}>

      {/* Edit modal */}
      {editingAth && <EditModal athlete={editingAth} onSave={saveEdit} onCancel={() => setEditingAth(null)} cats={registeredCats} />}

      {/* ── Hero ── */}
      <div style={{ padding: isMobile ? '32px 20px 28px' : '48px 24px 36px', textAlign: 'center', borderBottom: '1px solid rgba(15,23,42,.08)' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 10, fontWeight: 900, letterSpacing: 3.5, textTransform: 'uppercase', color: '#fff', marginBottom: 16, padding: '6px 16px', borderRadius: 20, background: '#0f172a' }}>
          🏈 Portal dos Times
        </div>
        <h1 style={{ fontSize: isMobile ? 30 : 44, fontWeight: 900, letterSpacing: -1.5, margin: '0 0 14px', lineHeight: 1.1, color: '#0f172a' }}>{team.club_name}</h1>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12, fontWeight: 800, letterSpacing: .8, textTransform: 'uppercase', padding: '7px 18px', borderRadius: 24, background: ps.color, color: '#fff', border: 'none' }}>{ps.label}</span>
          {team.country && <span style={{ fontSize: 13, color: 'rgba(15,23,42,.6)', fontWeight: 600 }}>🌍 {team.country}{team.city ? `, ${team.city}` : ''}</span>}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', overflowX: 'auto' }}>
        <div style={{ display: 'flex', maxWidth: 960, margin: '0 auto', alignItems: 'stretch' }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              flex: isMobile ? 1 : undefined,
              padding: isMobile ? '16px 8px' : '20px 28px',
              background: 'none', border: 'none',
              borderBottom: tab === t.key ? `3px solid ${ACCENT}` : '3px solid transparent',
              color: tab === t.key ? '#0f172a' : 'rgba(15,23,42,.45)',
              fontFamily: 'inherit', fontSize: isMobile ? 12 : 15, fontWeight: 800, cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, transition: 'all .2s',
            }}>
              <span style={{ fontSize: isMobile ? 22 : 24 }}>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', paddingRight: 16 }}>
            <button onClick={() => { sessionStorage.removeItem('bfwc_team_session'); router.push('/portal'); }} style={{ padding: '9px 18px', fontSize: 12, fontWeight: 800, background: 'rgba(15,23,42,.05)', border: '1px solid rgba(15,23,42,.15)', borderRadius: 10, color: 'rgba(15,23,42,.6)', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
              Sair
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: pad }}>

        {/* ══════ TAB INSCRIÇÃO ══════ */}
        {tab === 'inscricao' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* ── Stepper de fases ── */}
            {(() => {
              const isEmailVerified  = team.status !== 'pending_email';
              const isApproved       = team.status === 'approved';
              const isRejected       = team.status === 'rejected';
              const paymentConfirmed = !!team.payment_confirmed;
              const hasAthletes      = athletes.length >= MIN_ATH || lineupSubmitted;
              const allDone          = isApproved && paymentConfirmed && lineupSubmitted;

              // Qual é a fase atual (0-based)
              const currentStep = allDone ? 4
                : lineupSubmitted ? 4
                : paymentConfirmed ? 3
                : isApproved ? 2
                : isEmailVerified ? 1
                : 0;

              const STEPS = [
                {
                  icon: '📋', label: 'Pré-inscrição',
                  done: isEmailVerified,
                  active: !isEmailVerified,
                  desc: isEmailVerified ? 'Formulário enviado e e-mail confirmado.' : '📧 Confirme seu e-mail para avançar.',
                },
                {
                  icon: '✍️', label: 'Inscrição',
                  done: isApproved,
                  active: isEmailVerified && !isApproved && !isRejected,
                  desc: isRejected ? '❌ Inscrição não aprovada. Entre em contato.' : isApproved ? 'Inscrição aprovada pela organização.' : '⏳ Aguardando aprovação da organização.',
                  error: isRejected,
                },
                {
                  icon: '💳', label: 'Pagamento',
                  done: paymentConfirmed,
                  active: isApproved && !paymentConfirmed,
                  desc: (() => {
                    const plan = payInfo?.payment_plan;
                    const paidN = payInfo?.paid_count || 0;
                    if (payInfo?.fully_paid) return 'Pagamento confirmado.';
                    if (plan && plan > 1) return `${paidN} de ${plan} parcelas pagas.`;
                    return paymentConfirmed ? 'Pagamento confirmado.' : 'Instruções enviadas por e-mail após aprovação.';
                  })(),
                },
                {
                  icon: '👥', label: 'Inscrição de atletas',
                  done: lineupSubmitted,
                  active: isApproved && !lineupSubmitted,
                  desc: lineupSubmitted ? `Escalação enviada com ${athletes.length} atleta${athletes.length !== 1 ? 's' : ''}.` : `Cadastre seus atletas e envie a escalação (mín. ${MIN_ATH} por categoria).`,
                },
                {
                  icon: '🏆', label: 'Aprovado',
                  done: allDone,
                  active: lineupSubmitted && !allDone,
                  desc: allDone ? '🎉 Tudo pronto! Você está credenciado no BFWC 2026.' : 'Conclusão de todas as etapas anteriores.',
                },
              ];

              return (
                <div style={{ ...card(), padding: cpad }}>
                  <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(15,23,42,.28)', marginBottom: 20 }}>Situação da inscrição</div>

                  {/* Steps */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {STEPS.map((s, i) => {
                      const isLast = i === STEPS.length - 1;
                      const color  = s.error ? '#ff4444' : s.done ? GREEN : s.active ? YELLOW : 'rgba(15,23,42,.15)';
                      const bgDot  = s.error ? '#ff444420' : s.done ? GREEN + '20' : s.active ? YELLOW + '15' : 'rgba(15,23,42,.04)';
                      const isCurrent = i === currentStep;

                      return (
                        <div key={s.label} style={{ display: 'flex', gap: 0, position: 'relative' }}>
                          {/* Linha vertical conectora */}
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: 44 }}>
                            {/* Dot */}
                            <div style={{
                              width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                              background: bgDot,
                              border: `2px solid ${color}`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: s.done ? 15 : 17,
                              boxShadow: isCurrent ? `0 0 0 4px ${color}18` : 'none',
                              transition: 'all .3s',
                              zIndex: 1, position: 'relative',
                            }}>
                              {s.done && !s.error ? <span style={{ fontSize: 15, fontWeight: 900, color: GREEN }}>✓</span> : s.icon}
                            </div>
                            {/* Connector line */}
                            {!isLast && (
                              <div style={{ width: 2, flex: 1, minHeight: 28, background: s.done ? GREEN + '40' : 'rgba(15,23,42,.07)', marginTop: 2, marginBottom: 2 }} />
                            )}
                          </div>

                          {/* Content */}
                          <div style={{ flex: 1, paddingBottom: isLast ? 0 : 20, paddingLeft: 14, paddingTop: 6 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                              <span style={{ fontSize: 14, fontWeight: 800, color: s.done || s.active ? INK : 'rgba(15,23,42,.4)' }}>{s.label}</span>
                              {s.done && !s.error && <span style={{ fontSize: 9, fontWeight: 900, padding: '2px 8px', borderRadius: 6, background: GREEN + '18', color: GREEN, letterSpacing: 1 }}>CONCLUÍDO</span>}
                              {s.active && !s.done && <span style={{ fontSize: 9, fontWeight: 900, padding: '2px 8px', borderRadius: 6, background: YELLOW + '15', color: YELLOW, letterSpacing: 1 }}>EM ANDAMENTO</span>}
                              {s.error  && <span style={{ fontSize: 9, fontWeight: 900, padding: '2px 8px', borderRadius: 6, background: 'rgba(255,68,68,.12)', color: '#ff4444', letterSpacing: 1 }}>ATENÇÃO</span>}
                            </div>
                            <div style={{ fontSize: 12, color: s.active || s.done ? 'rgba(15,23,42,.55)' : 'rgba(15,23,42,.25)', lineHeight: 1.55 }}>{s.desc}</div>
                            {/* Botão de ação inline */}
                            {s.active && i === 3 && !lineupSubmitted && (
                              <button onClick={() => setTab('atletas')} style={{ marginTop: 8, padding: '7px 16px', borderRadius: 9, border: `1px solid ${YELLOW}40`, background: YELLOW + '10', color: YELLOW, fontSize: 11, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>
                                Ir para Atletas →
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Dados do clube */}
                  <div style={{ borderTop: '1px solid rgba(15,23,42,.06)', marginTop: 20, paddingTop: 16 }}>
                    <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(15,23,42,.2)', marginBottom: 10 }}>Dados do cadastro</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 8 }}>
                      {[['País', team.country],['Cidade', team.city],['Contato', team.contact_name],['WhatsApp', team.whatsapp],['Categorias', team.category],['Atletas est.', team.athletes_count]]
                        .filter(([,v]) => v).map(([l, v]) => (
                        <div key={l} style={miniCard()}>
                          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1.5, color: 'rgba(15,23,42,.22)', textTransform: 'uppercase', marginBottom: 2 }}>{l}</div>
                          <div style={{ fontSize: 12, fontWeight: 700 }}>{v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Datas */}
            <div style={{ ...card(), padding: cpad }}>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(15,23,42,.28)', marginBottom: 14 }}>Datas importantes</div>
              {DATES.map((d, i) => {
                const c = d.highlight ? '#3b9eff' : YELLOW;
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: i < DATES.length - 1 ? '1px solid rgba(15,23,42,.05)' : 'none' }}>
                    <div style={{ width: 52, flexShrink: 0, fontSize: 10, fontWeight: 800, color: c, textAlign: 'center', padding: '5px 0', borderRadius: 7, background: c+'0a', border: `1px solid ${c}25` }}>
                      {d.date}
                    </div>
                    <div style={{ flex: 1, fontSize: 13, color: 'rgba(15,23,42,.7)' }}>{d.label}</div>
                    {d.highlight && <span style={{ fontSize: 9, fontWeight: 800, padding: '3px 8px', borderRadius: 6, background: '#3b9eff18', color: '#3b9eff', letterSpacing: .8, flexShrink: 0 }}>💳 PGTO</span>}
                  </div>
                );
              })}
            </div>

            {/* Checklist */}
            <div style={{ ...card(), padding: cpad }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(15,23,42,.28)' }}>Checklist de documentos</div>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(15,23,42,.35)' }}>{Object.values(docs).filter(Boolean).length}/{DOCS.length}</span>
              </div>
              <div style={{ height: 4, borderRadius: 4, background: 'rgba(15,23,42,.08)', marginBottom: 14, overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 4, background: GREEN, width: `${(Object.values(docs).filter(Boolean).length / DOCS.length) * 100}%`, transition: 'width .4s' }} />
              </div>
              {DOCS.map(d => (
                <div key={d.id} onClick={() => toggleDoc(d.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 12px', borderRadius: 10, cursor: 'pointer', marginBottom: 4, background: docs[d.id] ? `${GREEN}08` : 'rgba(15,23,42,.02)', border: `1px solid ${docs[d.id] ? GREEN + '20' : 'rgba(15,23,42,.05)'}`, transition: 'all .15s' }}>
                  <div style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0, background: docs[d.id] ? GREEN : 'transparent', border: `2px solid ${docs[d.id] ? GREEN : 'rgba(15,23,42,.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#fff', fontWeight: 900 }}>
                    {docs[d.id] ? '✓' : ''}
                  </div>
                  <span style={{ fontSize: 13, color: docs[d.id] ? 'rgba(15,23,42,.85)' : 'rgba(15,23,42,.5)', lineHeight: 1.4 }}>{d.label}</span>
                </div>
              ))}
            </div>

            {isMobile && (
              <button onClick={() => { sessionStorage.removeItem('bfwc_team_session'); router.push('/portal'); }} style={{ padding: '14px', borderRadius: 12, border: '1px solid rgba(15,23,42,.1)', background: 'rgba(15,23,42,.03)', color: 'rgba(15,23,42,.3)', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                Sair do portal
              </button>
            )}
          </div>
        )}

        {/* ══════ TAB PAGAMENTO ══════ */}
        {tab === 'pagamento' && (() => {
          const numCats = registeredCats.length || 1;
          const paid    = !!team.payment_confirmed;

          // Opção: travada após o 1º pagamento (payInfo) ou escolhida agora (payOption)
          const lockedOption = payInfo?.payment_option || null;
          const effOption    = lockedOption || payOption;            // '1' | '2' | null
          const effAthletes  = lockedOption ? (payInfo?.athletes_paid_qty || 0) : athleteQty;

          // Total conforme a opção escolhida
          const totalFor = (opt, ath) => opt === '2' ? (800 * numCats + 100 * (parseInt(ath, 10) || 0)) : (2000 * numCats);
          const total    = effOption ? totalFor(effOption, effAthletes) : 0;

          // Parcelamento automático por data: 3x até 20/07, 2x até 20/08, depois 1x
          const todayStr  = new Date().toISOString().slice(0, 10);
          const autoPlan  = todayStr <= '2026-07-20' ? 3 : todayStr <= '2026-08-20' ? 2 : 1;
          const lockedPlan = payInfo?.payment_plan || null;
          const chosenPlan = lockedPlan || autoPlan;
          const ALL_DUES  = ['20 de julho de 2026', '20 de agosto de 2026', '20 de setembro de 2026'];
          const planDues  = ALL_DUES.slice(ALL_DUES.length - chosenPlan);

          const buildParcelas = (n) => {
            const parcela = Math.ceil(total / n);
            return Array.from({ length: n }, (_, i) => ({
              number: i + 1,
              value: i < n - 1 ? parcela : total - parcela * (n - 1),
              date: planDues[i],
            }));
          };
          const instByNum = {};
          (payInfo?.installments || []).forEach((it) => { instByNum[it.number] = it; });
          const paidCount = payInfo?.paid_count || 0;
          const remainingReais = payInfo?.remaining_cents != null ? Math.round(payInfo.remaining_cents / 100) : total;
          const allPaid = payInfo?.fully_paid || (lockedPlan && paidCount >= lockedPlan);

          const qrBlock = (
            <div style={{ marginTop: 12, display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 18, alignItems: isMobile ? 'stretch' : 'flex-start', padding: '14px', borderRadius: 12, background: 'rgba(15,23,42,.03)', border: '1px solid rgba(15,23,42,.07)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <div ref={qrRef} style={{ width: 170, height: 170, borderRadius: 14, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 10 }} />
                <div style={{ fontSize: 10, color: 'rgba(15,23,42,.3)', textAlign: 'center' }}>Escaneie no app do seu banco</div>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, color: 'rgba(15,23,42,.3)', textTransform: 'uppercase' }}>Pix copia e cola</div>
                <div style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(15,23,42,.04)', border: '1px solid rgba(15,23,42,.1)', fontSize: 11, fontWeight: 600, wordBreak: 'break-all', lineHeight: 1.5, maxHeight: 80, overflow: 'auto' }}>{activePix?.emv}</div>
                <button onClick={copyEmv} style={{ padding: '11px 16px', borderRadius: 10, border: `1px solid ${emvCopied ? GREEN+'50' : 'rgba(15,23,42,.12)'}`, background: emvCopied ? GREEN+'12' : 'rgba(15,23,42,.05)', color: emvCopied ? GREEN : 'rgba(15,23,42,.6)', fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', width: '100%' }}>
                  {emvCopied ? '✓ Copiado!' : '📋 Copiar código Pix'}
                </button>
                <div style={{ fontSize: 11, color: 'rgba(15,23,42,.45)', lineHeight: 1.55 }}>⏳ Assim que o Pix cair, esta página confirma sozinha.</div>
              </div>
            </div>
          );

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, animation: 'fadeIn .3s ease' }}>

              {/* Status geral */}
              {paid ? (
                <div style={{ ...card(), padding: cpad, display: 'flex', alignItems: 'center', gap: 16, border: `1px solid ${GREEN}55` }}>
                  <div style={{ width: 52, height: 52, borderRadius: '50%', background: GREEN + '18', border: `2px solid ${GREEN}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>✅</div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: GREEN, marginBottom: 4 }}>Inscrição confirmada</div>
                    <div style={{ fontSize: 13, color: 'rgba(15,23,42,.5)' }}>
                      {chosenPlan && chosenPlan > 1 && !allPaid
                        ? `Você está confirmado no BFWC 2026. Parcelas pagas: ${paidCount} de ${chosenPlan}.`
                        : 'Taxa de inscrição recebida. Você está confirmado no BFWC 2026.'}
                    </div>
                  </div>
                </div>
              ) : !effOption ? (
                <div style={{ ...card(), padding: cpad }}>
                  <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(15,23,42,.28)', marginBottom: 14 }}>Escolha a forma de inscrição</div>
                  <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 12 }}>
                    <button onClick={() => setPayOption('1')} style={{ flex: 1, textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', padding: '18px', borderRadius: 16, border: `2px solid ${YELLOW}55`, background: YELLOW + '0c' }}>
                      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', color: YELLOW, marginBottom: 8 }}>Opção 1 · Pacote</div>
                      <div style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', letterSpacing: -1 }}>R$ {(2000 * numCats).toLocaleString('pt-BR')}</div>
                      <div style={{ fontSize: 12, color: 'rgba(15,23,42,.55)', marginTop: 6, lineHeight: 1.5 }}>R$ 2.000 por categoria{numCats > 1 ? ` × ${numCats}` : ''}. Atletas inclusos. Parcele em até 3x.</div>
                      <div style={{ marginTop: 12, fontSize: 12, fontWeight: 800, color: YELLOW }}>Escolher →</div>
                    </button>
                    <button onClick={() => setPayOption('2')} style={{ flex: 1, textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', padding: '18px', borderRadius: 16, border: `2px solid ${ACCENT}55`, background: ACCENT + '0c' }}>
                      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', color: ACCENT, marginBottom: 8 }}>Opção 2 · Por atleta</div>
                      <div style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', letterSpacing: -1 }}>R$ {(800 * numCats).toLocaleString('pt-BR')} <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(15,23,42,.5)' }}>+ R$100/atleta</span></div>
                      <div style={{ fontSize: 12, color: 'rgba(15,23,42,.55)', marginTop: 6, lineHeight: 1.5 }}>R$ 800 por categoria{numCats > 1 ? ` × ${numCats}` : ''} + R$ 100 por atleta (você escolhe a quantidade). Parcele em até 3x.</div>
                      <div style={{ marginTop: 12, fontSize: 12, fontWeight: 800, color: ACCENT }}>Escolher →</div>
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ ...card(), padding: cpad, border: `1px solid ${YELLOW}45` }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(15,23,42,.28)', marginBottom: 6 }}>
                        Opção {effOption} {effOption === '2' ? '· por atleta' : '· pacote'}
                        {!lockedOption && <span onClick={() => { setPayOption(null); setPayMethod('pix'); }} style={{ marginLeft: 10, color: ACCENT, cursor: 'pointer', fontWeight: 800, textTransform: 'none', letterSpacing: 0 }}>trocar</span>}
                      </div>
                      <div style={{ fontSize: 13, color: 'rgba(15,23,42,.5)', marginBottom: 4 }}>
                        {effOption === '2' ? `R$ 800 × ${numCats} cat. + R$ 100 × ${effAthletes} atletas` : `${numCats} categoria${numCats !== 1 ? 's' : ''} × R$ 2.000`}
                      </div>
                      <div style={{ fontSize: 11, color: 'rgba(15,23,42,.3)' }}>{registeredCats.join(' · ')}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 32, fontWeight: 900, color: YELLOW, letterSpacing: -1.5 }}>R$ {total.toLocaleString('pt-BR')}</div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(15,23,42,.3)', letterSpacing: 1 }}>TOTAL</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bloco de pagamento (some quando todas as parcelas estão pagas ou sem opção) */}
              {!allPaid && effOption && (
                <div style={{ ...card(), padding: cpad }}>
                  <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(15,23,42,.28)', marginBottom: 16 }}>
                    {paid ? 'Pagar parcelas restantes' : 'Pagar taxa de inscrição'}
                  </div>

                  {/* Opção 2: quantidade de atletas */}
                  {effOption === '2' && (
                    <div style={{ marginBottom: 16, padding: '14px', borderRadius: 12, background: ACCENT + '08', border: `1px solid ${ACCENT}22` }}>
                      <div style={{ fontSize: 12, fontWeight: 800, color: 'rgba(15,23,42,.6)', marginBottom: 8 }}>Quantos atletas vai pagar? (R$ 100 cada)</div>
                      {lockedOption ? (
                        <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>{effAthletes} atletas · R$ {(100 * effAthletes).toLocaleString('pt-BR')}</div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <button type="button" onClick={() => setAthleteQty(q => Math.max(1, (parseInt(q, 10) || 1) - 1))} style={{ width: 38, height: 38, borderRadius: 10, border: '1px solid #cbd5e1', background: '#fff', fontSize: 18, fontWeight: 900, cursor: 'pointer', color: '#0f172a' }}>−</button>
                          <input type="number" min={1} value={athleteQty} onChange={e => setAthleteQty(Math.max(1, parseInt(e.target.value, 10) || 1))} style={{ ...inputSt, width: 90, textAlign: 'center', fontWeight: 800 }} />
                          <button type="button" onClick={() => setAthleteQty(q => (parseInt(q, 10) || 1) + 1)} style={{ width: 38, height: 38, borderRadius: 10, border: '1px solid #cbd5e1', background: '#fff', fontSize: 18, fontWeight: 900, cursor: 'pointer', color: '#0f172a' }}>+</button>
                          <div style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 800, color: ACCENT }}>+ R$ {(100 * athleteQty).toLocaleString('pt-BR')}</div>
                        </div>
                      )}
                    </div>
                  )}

                  {payPolling && (
                    <div style={{ padding: '12px 14px', borderRadius: 10, background: ACCENT+'10', border: `1px solid ${ACCENT}25`, fontSize: 12, color: 'rgba(15,23,42,.6)', lineHeight: 1.5, marginBottom: 14 }}>⏳ Confirmando seu pagamento...</div>
                  )}

                  {/* Seletor de método */}
                  <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                    {[['pix','🏦','PIX'],['card','💳','Cartão de crédito']].map(([k,ic,lb]) => (
                      <button key={k} onClick={() => setPayMethod(k)} style={{
                        flex: 1, padding: '14px 12px', borderRadius: 14, cursor: 'pointer', fontFamily: 'inherit',
                        border: `2px solid ${payMethod===k ? YELLOW : 'rgba(15,23,42,.08)'}`,
                        background: payMethod===k ? YELLOW+'10' : 'rgba(15,23,42,.04)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, transition: 'all .18s',
                      }}>
                        <span style={{ fontSize: 24 }}>{ic}</span>
                        <span style={{ fontSize: 12, fontWeight: 800, color: payMethod===k ? YELLOW : 'rgba(15,23,42,.55)' }}>{lb}</span>
                      </button>
                    ))}
                  </div>

                  {/* ── PIX parcelado ── */}
                  {payMethod === 'pix' && (
                    <div>
                      {/* Parcelamento automático por data */}
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(15,23,42,.5)', marginBottom: 12, lineHeight: 1.5 }}>
                        Parcelamento automático: <span style={{ color: GREEN, fontWeight: 800 }}>{chosenPlan}x</span>
                        <span style={{ color: 'rgba(15,23,42,.4)' }}> · vencimentos {planDues.join(', ')}</span>
                      </div>

                      {needDoc && (
                        <div style={{ marginBottom: 12 }}>
                          <label style={lbl}>CPF ou CNPJ do pagador</label>
                          <input style={inputSt} placeholder="Somente números" value={docInput}
                            onChange={e => setDocInput(e.target.value.replace(/\D/g,'').slice(0,14))} inputMode="numeric" />
                        </div>
                      )}
                      {pixErr && (
                        <div style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(255,68,68,.08)', border: '1px solid rgba(255,68,68,.25)', fontSize: 12, color: '#ff8080', lineHeight: 1.5, marginBottom: 12 }}>{pixErr}</div>
                      )}

                      {!chosenPlan ? (
                        <div style={{ fontSize: 12, color: 'rgba(15,23,42,.4)' }}>Escolha o parcelamento acima para ver as parcelas.</div>
                      ) : (
                        buildParcelas(chosenPlan).map((p) => {
                          const st = instByNum[p.number];
                          const isPaid = st?.status === 'paid';
                          const isActive = activePix?.number === p.number;
                          return (
                            <div key={p.number} style={{ borderRadius: 12, marginBottom: 8, background: isPaid ? GREEN+'08' : 'rgba(15,23,42,.025)', border: `1px solid ${isPaid ? GREEN+'25' : 'rgba(15,23,42,.07)'}`, padding: '13px 14px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 34, height: 34, borderRadius: 10, background: (isPaid?GREEN:YELLOW)+'15', border: `1.5px solid ${(isPaid?GREEN:YELLOW)}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0, fontWeight: 900, color: isPaid?GREEN:YELLOW }}>{isPaid ? '✓' : p.number}</div>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: 13, fontWeight: 800 }}>{chosenPlan>1 ? `${p.number}ª parcela` : 'Pagamento'}</div>
                                  <div style={{ fontSize: 11, color: 'rgba(15,23,42,.38)' }}>📅 {p.date}</div>
                                </div>
                                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                  <div style={{ fontSize: 15, fontWeight: 900, color: isPaid?GREEN:YELLOW }}>R$ {p.value.toLocaleString('pt-BR')}</div>
                                </div>
                                {!isPaid && (
                                  <button onClick={() => generateParcela(p.number)} disabled={pixLoadingNum === p.number} style={{ padding: '10px 16px', borderRadius: 10, border: 'none', background: `linear-gradient(135deg,${GREEN},#0a9d4a)`, color: '#fff', fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0, opacity: pixLoadingNum === p.number ? 0.7 : 1 }}>
                                    {pixLoadingNum===p.number ? '...' : (isActive ? 'Novo QR' : 'Pagar')}
                                  </button>
                                )}
                                {isPaid && <span style={{ fontSize: 10, fontWeight: 900, color: GREEN, letterSpacing: 1 }}>PAGO</span>}
                              </div>
                              {isActive && !isPaid && qrBlock}
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}

                  {/* ── CARTÃO (Stripe, parcelado na própria Stripe) ── */}
                  {payMethod === 'card' && (
                    <div>
                      {checkoutErr && (
                        <div style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(255,68,68,.08)', border: '1px solid rgba(255,68,68,.25)', fontSize: 12, color: '#ff8080', lineHeight: 1.5, marginBottom: 12 }}>{checkoutErr}</div>
                      )}
                      <button onClick={startCheckout} disabled={checkoutLoading} style={{ width: '100%', padding: '16px', borderRadius: 12, border: 'none', background: `linear-gradient(135deg,${ACCENT},#1a5fff)`, color: '#fff', fontSize: 15, fontWeight: 800, cursor: checkoutLoading ? 'wait' : 'pointer', fontFamily: 'inherit', opacity: checkoutLoading ? .7 : 1 }}>
                        {checkoutLoading ? 'Redirecionando...' : `Pagar R$ ${remainingReais.toLocaleString('pt-BR')} no cartão`}
                      </button>
                      <div style={{ textAlign: 'center', fontSize: 11, color: 'rgba(15,23,42,.3)', lineHeight: 1.5, marginTop: 10 }}>
                        {remainingReais < total ? `Saldo restante (já pago: R$ ${(total - remainingReais).toLocaleString('pt-BR')}). ` : ''}💳 Parcele em até 3x no cartão na tela da Stripe · 🔒 seguro
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Resumo */}
              <div style={{ ...card(), padding: cpad }}>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(15,23,42,.28)', marginBottom: 14 }}>Resumo da cobrança</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {!effOption ? (
                    <div style={{ fontSize: 12, color: 'rgba(15,23,42,.4)', padding: '4px 0' }}>Escolha uma opção acima para ver o detalhamento.</div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 0', borderBottom: '1px solid rgba(15,23,42,.05)' }}>
                        <span style={{ fontSize: 13, color: 'rgba(15,23,42,.6)' }}>{registeredCats.length} categoria{registeredCats.length !== 1 ? 's' : ''} × R$ {(effOption === '2' ? 800 : 2000).toLocaleString('pt-BR')}</span>
                        <span style={{ fontSize: 13, fontWeight: 700 }}>R$ {((effOption === '2' ? 800 : 2000) * numCats).toLocaleString('pt-BR')}</span>
                      </div>
                      {effOption === '2' && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 0' }}>
                          <span style={{ fontSize: 13, color: 'rgba(15,23,42,.6)' }}>{effAthletes} atleta{effAthletes !== 1 ? 's' : ''} × R$ 100</span>
                          <span style={{ fontSize: 13, fontWeight: 700 }}>R$ {(100 * effAthletes).toLocaleString('pt-BR')}</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0 0', marginTop: 4, borderTop: `2px solid ${YELLOW}20` }}>
                        <span style={{ fontSize: 15, fontWeight: 900 }}>Total</span>
                        <span style={{ fontSize: 15, fontWeight: 900, color: YELLOW }}>R$ {total.toLocaleString('pt-BR')}</span>
                      </div>
                    </>
                  )}
                </div>
                <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 10, background: 'rgba(15,23,42,.025)', border: '1px solid rgba(15,23,42,.05)', fontSize: 11, color: 'rgba(15,23,42,.4)', lineHeight: 1.6 }}>
                  Status: <span style={{ fontWeight: 800, color: paid ? GREEN : YELLOW }}>{paid ? '✅ Confirmado' : '⏳ Aguardando pagamento'}</span>
                  {chosenPlan ? <span style={{ marginLeft: 8 }}>· Parcelas pagas: {paidCount}/{chosenPlan}</span> : null}
                </div>
              </div>

            </div>
          );
        })()}

        {/* ══════ TAB ATLETAS ══════ */}
        {tab === 'atletas' && (
          <div style={{ ...card(), padding: cpad }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 10 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(15,23,42,.28)', marginBottom: 4 }}>Roster do clube</div>
                <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 900 }}>{athletes.length} atleta{athletes.length !== 1 ? 's' : ''}</div>
              </div>
              <button onClick={() => setShowAddForm(!showAddForm)} style={btnPrimary()}>
                {showAddForm ? '✕ Cancelar' : '+ Atleta'}
              </button>
            </div>

            {/* Add form */}
            {showAddForm && (
              <div style={{ ...card({ marginBottom: 16, border: `1px solid ${ACCENT}35`, padding: cpad }) }}>
                <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 14 }}>Novo atleta</div>
                <form onSubmit={addAthlete}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
                    <div><label style={lbl}>Nome completo *</label><input style={inputSt} value={newAth.name} onChange={e => setNewAth(p => ({ ...p, name: e.target.value }))} placeholder="Nome do atleta" /></div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div><label style={lbl}>Nº camisa</label><input style={inputSt} type="number" value={newAth.jersey_number} onChange={e => setNewAth(p => ({ ...p, jersey_number: e.target.value }))} placeholder="10" /></div>
                      <div>
                        <label style={lbl}>Categoria</label>
                        <select style={selectSt} value={newAth.category} onChange={e => setNewAth(p => ({ ...p, category: e.target.value }))}>
                          <option value="" style={{ background: '#ffffff' }}>Selecionar...</option>
                          {registeredCats.map(c => <option key={c} value={c} style={{ background: '#ffffff' }}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                    <div><label style={lbl}>E-mail</label><input style={inputSt} type="email" value={newAth.email} onChange={e => setNewAth(p => ({ ...p, email: e.target.value }))} placeholder="email@atleta.com" /></div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div><label style={lbl}>Nascimento</label><input style={inputSt} type="date" value={newAth.birth_date} onChange={e => setNewAth(p => ({ ...p, birth_date: e.target.value }))} /></div>
                      <div><label style={lbl}>CPF / Passaporte</label><input style={inputSt} value={newAth.document} onChange={e => setNewAth(p => ({ ...p, document: e.target.value }))} placeholder="000.000.000-00" /></div>
                    </div>
                  </div>
                  {athError && <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(255,68,68,.1)', border: '1px solid rgba(255,68,68,.2)', fontSize: 12, color: '#ff8888', marginBottom: 10 }}>{athError}</div>}
                  <button type="submit" disabled={athSaving} style={{ ...btnPrimary(GREEN, '#fff'), width: '100%', justifyContent: 'center' }}>
                    {athSaving ? 'Salvando...' : '✓ Adicionar atleta'}
                  </button>
                </form>
              </div>
            )}

            {athLoading ? (
              <div style={{ textAlign: 'center', padding: 40, color: 'rgba(15,23,42,.3)', fontSize: 13 }}>Carregando...</div>
            ) : athletes.length === 0 ? (
              <div style={{ ...card({ textAlign: 'center', padding: '40px 24px' }) }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>👥</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'rgba(15,23,42,.5)', marginBottom: 6 }}>Nenhum atleta cadastrado</div>
                <div style={{ fontSize: 13, color: 'rgba(15,23,42,.3)' }}>Clique em "+ Atleta" para começar.</div>
              </div>
            ) : (
              <>
                {/* ── Contadores por categoria — clicáveis ── */}
                <div style={{ marginBottom: 6 }}>
                  <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(15,23,42,.28)', marginBottom: 10 }}>
                    Atletas por categoria — clique para filtrar
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${registeredCats.length + 1}, 1fr)`, gap: 8, marginBottom: 8 }}>
                    {registeredCats.map(c => {
                      const n   = athByCat[c]?.length || 0;
                      const st  = catStatus(c);
                      const cc  = catColor(c);
                      const ic  = catIcon(c);
                      const sel = catFilter === c;
                      return (
                        <button key={c} onClick={() => setCatFilter(sel ? 'all' : c)} style={{
                          all: 'unset', cursor: 'pointer', textAlign: 'center',
                          padding: isMobile ? '12px 6px' : '16px 10px', borderRadius: 14,
                          background: sel ? cc + '26' : 'rgba(15,23,42,.07)',
                          border: `2px solid ${sel ? cc : st !== 'empty' ? cc + '55' : 'rgba(15,23,42,.16)'}`,
                          transition: 'all .18s', boxShadow: sel ? `0 4px 18px ${cc}30` : 'none',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                          position: 'relative',
                        }}>
                          {/* status dot */}
                          {st !== 'empty' && (
                            <div style={{ position: 'absolute', top: 8, right: 8, width: 7, height: 7, borderRadius: '50%', background: cc }} />
                          )}
                          <div style={{ fontSize: isMobile ? 20 : 26, fontWeight: 900, color: st === 'empty' ? 'rgba(15,23,42,.2)' : cc, lineHeight: 1 }}>{n}</div>
                          <div style={{ fontSize: isMobile ? 8 : 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: st === 'empty' ? 'rgba(15,23,42,.22)' : 'rgba(15,23,42,.7)', lineHeight: 1.3 }}>{c}</div>
                          {st !== 'empty' && (
                            <div style={{ fontSize: 9, fontWeight: 800, color: cc, letterSpacing: .5 }}>
                              {st === 'ok' ? `${ic} ${MIN_ATH}–${MAX_ATH}` : st === 'low' ? `${ic} mín. ${MIN_ATH}` : `${ic} máx. ${MAX_ATH}`}
                            </div>
                          )}
                          {st === 'empty' && <div style={{ fontSize: 9, color: 'rgba(15,23,42,.18)', letterSpacing: .5 }}>não inscrita</div>}
                        </button>
                      );
                    })}
                    {/* Total */}
                    <button onClick={() => setCatFilter('all')} style={{
                      all: 'unset', cursor: 'pointer', textAlign: 'center',
                      padding: isMobile ? '12px 6px' : '16px 10px', borderRadius: 14,
                      background: catFilter === 'all' ? `${ACCENT}26` : 'rgba(15,23,42,.07)',
                      border: `2px solid ${catFilter === 'all' ? ACCENT : 'rgba(15,23,42,.16)'}`,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, transition: 'all .18s',
                      boxShadow: catFilter === 'all' ? `0 4px 18px ${ACCENT}25` : 'none',
                    }}>
                      <div style={{ fontSize: isMobile ? 20 : 26, fontWeight: 900, color: catFilter === 'all' ? ACCENT : 'rgba(15,23,42,.6)', lineHeight: 1 }}>{athletes.length}</div>
                      <div style={{ fontSize: isMobile ? 8 : 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(15,23,42,.5)', lineHeight: 1.3 }}>Total</div>
                      <div style={{ fontSize: 9, color: 'rgba(15,23,42,.3)', letterSpacing: .5 }}>ver todos</div>
                    </button>
                  </div>

                  {/* Legenda de regras */}
                  <div style={{ display: 'flex', gap: 14, padding: '10px 14px', borderRadius: 10, background: 'rgba(15,23,42,.06)', border: '1px solid rgba(15,23,42,.12)', flexWrap: 'wrap' }}>
                    {[[GREEN, `✓ OK (${MIN_ATH}–${MAX_ATH} atletas)`], ['#f97316', `⚠️ Faltam atletas (mín. ${MIN_ATH})`], ['#ff4444', `🚫 Excede limite (máx. ${MAX_ATH})`]].map(([c, txt]) => (
                      <span key={txt} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 700, color: 'rgba(15,23,42,.5)' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: c, display: 'inline-block', flexShrink: 0 }} />{txt}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Filtro ativo — header */}
                {catFilter !== 'all' && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderRadius: 10, background: catColor(catFilter) + '10', border: `1px solid ${catColor(catFilter)}25`, marginBottom: 10 }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: catColor(catFilter) }}>
                      {catIcon(catFilter)} {catFilter} — {athByCat[catFilter]?.length || 0} atleta{(athByCat[catFilter]?.length || 0) !== 1 ? 's' : ''}
                      {catStatus(catFilter) === 'low' && <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(15,23,42,.5)', marginLeft: 8 }}>({MIN_ATH - (athByCat[catFilter]?.length||0)} faltando)</span>}
                      {catStatus(catFilter) === 'over' && <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(15,23,42,.5)', marginLeft: 8 }}>({(athByCat[catFilter]?.length||0) - MAX_ATH} além do limite)</span>}
                    </span>
                    <button onClick={() => setCatFilter('all')} style={{ fontSize: 11, fontWeight: 800, color: 'rgba(15,23,42,.35)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>✕ Limpar filtro</button>
                  </div>
                )}

                {/* Enviar escalação */}
                {lineupMsg && (
                  <div style={{ padding: '12px 16px', borderRadius: 12, background: lineupMsg.includes('sucesso') ? `${GREEN}10` : 'rgba(255,68,68,.1)', border: `1px solid ${lineupMsg.includes('sucesso') ? GREEN + '30' : 'rgba(255,68,68,.25)'}`, fontSize: 13, fontWeight: 600, color: lineupMsg.includes('sucesso') ? GREEN : '#ff8888', marginBottom: 12 }}>
                    {lineupMsg}
                  </div>
                )}
                {lineupSubmitted ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderRadius: 14, background: `${GREEN}0a`, border: `1px solid ${GREEN}25`, marginBottom: 14 }}>
                    <span style={{ fontSize: 22 }}>✅</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: GREEN }}>Escalação enviada!</div>
                      <div style={{ fontSize: 12, color: 'rgba(15,23,42,.4)', marginTop: 2 }}>A organização recebeu seu roster com {athletes.length} atleta{athletes.length !== 1 ? 's' : ''}.</div>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'stretch', flexDirection: 'column', gap: 10, padding: '16px 18px', borderRadius: 14, background: lineupBlocked ? 'rgba(255,68,68,.05)' : `${ACCENT}08`, border: `1px solid ${lineupBlocked ? 'rgba(255,68,68,.2)' : ACCENT + '25'}`, marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', flexDirection: isMobile ? 'column' : 'row', gap: 12, justifyContent: 'space-between' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                          <span style={{ fontSize: 13, fontWeight: 800, color: INK }}>
                            {lineupBlocked ? '⚠️ Escalação incompleta' : '🏈 Pronto para enviar sua escalação?'}
                          </span>
                          <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 9px', borderRadius: 7, background: 'rgba(255,180,0,.12)', color: '#ffb400', border: '1px solid rgba(255,180,0,.25)', letterSpacing: .5, whiteSpace: 'nowrap' }}>
                            📅 Prazo: 20/10
                          </span>
                        </div>
                        <div style={{ fontSize: 12, color: 'rgba(15,23,42,.45)', lineHeight: 1.5 }}>
                          {lineupBlocked
                            ? lineupBlockReason || 'Corrija as categorias antes de enviar.'
                            : `Confirme que todos os atletas estão cadastrados. ${activeCats.map(c=>`${c}: ${athByCat[c].length}`).join(' · ')}`}
                        </div>
                      </div>
                      <button
                        onClick={submitLineup}
                        disabled={sendingLineup || athletes.length === 0 || lineupBlocked}
                        title={lineupBlocked ? lineupBlockReason : 'Enviar escalação'}
                        style={{ ...btnPrimary(lineupBlocked ? 'rgba(255,68,68,.2)' : YELLOW, lineupBlocked ? '#ff8888' : '#fff'), flexShrink: 0, justifyContent: 'center', opacity: lineupBlocked ? 1 : 1, cursor: lineupBlocked ? 'not-allowed' : 'pointer', border: lineupBlocked ? '1px solid rgba(255,68,68,.3)' : 'none' }}>
                        {sendingLineup ? 'Enviando...' : lineupBlocked ? '🔒 Bloqueado' : '✅ Enviar Escalação'}
                      </button>
                    </div>
                    {lineupBlocked && (
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {activeCats.filter(c => catStatus(c) !== 'ok').map(c => {
                          const n = athByCat[c].length; const st = catStatus(c);
                          return (
                            <button key={c} onClick={() => setCatFilter(c)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, background: catColor(c) + '12', border: `1px solid ${catColor(c)}30`, cursor: 'pointer', fontFamily: 'inherit', color: catColor(c), fontSize: 11, fontWeight: 800 }}>
                              {st === 'low' ? `${c}: ${n}/${MIN_ATH} (faltam ${MIN_ATH-n})` : `${c}: ${n}/${MAX_ATH} (remover ${n-MAX_ATH})`}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Mobile: cards | Desktop: table */}
                {isMobile ? (
                  <div>
                    {visibleAthletes.map(a => (
                      <AthleteCard key={a.id} a={a} onEdit={setEditingAth} onDelete={deleteAthlete} deletingId={deletingId} />
                    ))}
                  </div>
                ) : (
                  <div style={card({ padding: 0, overflow: 'hidden' })}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, tableLayout: 'fixed' }}>
                      <colgroup>
                        <col style={{ width: 46 }} />
                        <col />
                        <col style={{ width: 112 }} />
                        <col style={{ width: 170 }} />
                        <col style={{ width: 150 }} />
                        <col style={{ width: 90 }} />
                      </colgroup>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(15,23,42,.06)', background: 'rgba(15,23,42,.015)' }}>
                          {['#', 'Nome', 'Categoria', 'E-mail', 'Portal', ''].map(h => (
                            <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: 10, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(15,23,42,.22)' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {visibleAthletes.map(a => (
                          <tr key={a.id} style={{ borderBottom: '1px solid rgba(15,23,42,.04)', transition: 'background .1s' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(15,23,42,.025)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <td style={{ padding: '13px 14px', color: 'rgba(15,23,42,.35)', fontWeight: 700, fontSize: 12 }}>{a.jersey_number || '—'}</td>
                            <td style={{ padding: '13px 14px', fontWeight: 700, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</td>
                            <td style={{ padding: '13px 14px' }}>{a.category ? <span style={tag(ACCENT)}>{a.category}</span> : <span style={{ color: 'rgba(15,23,42,.2)' }}>—</span>}</td>
                            <td style={{ padding: '13px 14px', color: 'rgba(15,23,42,.38)', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.email || '—'}</td>
                            <td style={{ padding: '10px 14px', verticalAlign: 'middle' }}><PortalBadge a={a} /></td>
                            <td style={{ padding: '13px 10px' }}>
                              <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                                <button
                                  onClick={() => setEditingAth(a)}
                                  title="Editar"
                                  style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${ACCENT}35`, background: `${ACCENT}10`, color: ACCENT, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                  ✎
                                </button>
                                <button
                                  onClick={() => deleteAthlete(a.id)}
                                  disabled={deletingId === a.id}
                                  title="Excluir"
                                  style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid rgba(255,68,68,.2)', background: 'rgba(255,68,68,.07)', color: '#ff6666', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                  {deletingId === a.id ? '…' : '✕'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ══════ TAB CAMPEONATO ══════ */}
        {tab === 'campeonato' && (
          <div style={{ ...card(), padding: cpad }}>
            <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto', paddingBottom: 2 }}>
              {[{ key: 'schedule', label: '🗓 Próximos' }, { key: 'results', label: '📊 Resultados' }, { key: 'venue', label: '🗺️ Venue' }].map(t => (
                <button key={t.key} onClick={() => setGamesTab(t.key)} style={{ padding: '9px 14px', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: isMobile ? 12 : 13, fontWeight: 700, whiteSpace: 'nowrap', background: gamesTab === t.key ? ACCENT : 'rgba(15,23,42,.05)', color: gamesTab === t.key ? '#fff' : 'rgba(15,23,42,.4)', transition: 'all .15s' }}>{t.label}</button>
              ))}
            </div>

            {gamesLoading && <div style={{ textAlign: 'center', padding: 40, color: 'rgba(15,23,42,.3)', fontSize: 13 }}>Carregando...</div>}

            {!gamesLoading && gamesTab === 'schedule' && (
              upcomingGames.length === 0
                ? <div style={{ ...card({ textAlign: 'center', padding: 48 }) }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>🗓</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'rgba(15,23,42,.5)', marginBottom: 8 }}>Tabela de jogos em breve</div>
                    <div style={{ fontSize: 13, color: 'rgba(15,23,42,.3)' }}>Horários divulgados após fechamento das inscrições.</div>
                  </div>
                : <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {upcomingGames.map(g => {
                      const { me } = myResult(g);
                      return (
                        <div key={g.id} style={{ ...card({ padding: cpad }) }}>
                          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
                            <div style={{ textAlign: 'center', minWidth: 64 }}>
                              <div style={{ fontSize: 11, fontWeight: 800, color: YELLOW }}>{g.game_date ? new Date(g.game_date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : 'TBD'}</div>
                              <div style={{ fontSize: 20, fontWeight: 900 }}>{g.game_time?.slice(0,5) || '--:--'}</div>
                              {g.warmup_time && <div style={{ fontSize: 10, color: 'rgba(15,23,42,.3)' }}>🏃 {g.warmup_time?.slice(0,5)}</div>}
                            </div>
                            <div style={{ flex: 1, textAlign: 'center' }}>
                              <div style={{ fontSize: 14, fontWeight: 800 }}>
                                <span style={{ color: me ? '#fff' : 'rgba(15,23,42,.45)' }}>{g.team1_name}</span>
                                <span style={{ color: 'rgba(15,23,42,.3)', margin: '0 8px', fontSize: 11 }}>vs</span>
                                <span style={{ color: !me ? '#fff' : 'rgba(15,23,42,.45)' }}>{g.team2_name}</span>
                              </div>
                              <div style={{ marginTop: 6, display: 'flex', justifyContent: 'center', gap: 6, flexWrap: 'wrap' }}>
                                {g.category && <span style={tag(ACCENT)}>{g.category}</span>}
                                {g.phase && g.phase !== 'group' && <span style={tag(YELLOW)}>{PHASE_LABELS[g.phase]}</span>}
                              </div>
                            </div>
                            <div style={{ textAlign: isMobile ? 'left' : 'right', fontSize: 12, color: 'rgba(15,23,42,.4)', whiteSpace: 'nowrap' }}>
                              📍 {g.field || 'TBD'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
            )}

            {!gamesLoading && gamesTab === 'results' && (
              finishedGames.length === 0
                ? <div style={{ ...card({ textAlign: 'center', padding: 48 }) }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'rgba(15,23,42,.5)' }}>Nenhum resultado ainda</div>
                  </div>
                : <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {finishedGames.map(g => {
                      const { me, ms, os, result } = myResult(g);
                      const rc = result === 'win' ? GREEN : result === 'loss' ? '#ff4444' : YELLOW;
                      const rl = result === 'win' ? 'Vitória' : result === 'loss' ? 'Derrota' : 'Empate';
                      return (
                        <div key={g.id} style={{ ...card({ padding: cpad }), borderLeft: `4px solid ${rc}` }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                            <span style={{ ...tag(rc), fontSize: 11 }}>{rl}</span>
                            <div style={{ flex: 1, fontWeight: 800, fontSize: 15, textAlign: 'center' }}>
                              <span style={{ color: me ? '#fff' : 'rgba(15,23,42,.4)' }}>{g.team1_name}</span>
                              <span style={{ color: YELLOW, margin: '0 10px' }}>{g.team1_score} – {g.team2_score}</span>
                              <span style={{ color: !me ? '#fff' : 'rgba(15,23,42,.4)' }}>{g.team2_name}</span>
                            </div>
                            <span style={{ fontSize: 11, color: 'rgba(15,23,42,.3)' }}>{g.field}</span>
                          </div>
                        </div>
                      );
                    })}
                    {(() => {
                      const w = finishedGames.filter(g => myResult(g).result === 'win').length;
                      const l = finishedGames.filter(g => myResult(g).result === 'loss').length;
                      const d = finishedGames.filter(g => myResult(g).result === 'draw').length;
                      return (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginTop: 4 }}>
                          {[['Vitórias', w, GREEN],['Derrotas', l,'#ff4444'],['Empates', d, YELLOW],['Jogos', finishedGames.length, INK]].map(([k,v,c]) => (
                            <div key={k} style={miniCard({ textAlign: 'center' })}>
                              <div style={{ fontSize: 20, fontWeight: 900, color: c }}>{v}</div>
                              <div style={{ fontSize: 9, color: 'rgba(15,23,42,.3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>{k}</div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
            )}

            {!gamesLoading && gamesTab === 'venue' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ ...card({ padding: cpad }) }}>
                  <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 12 }}>🗺️ Mapa do Venue</div>
                  <VenueMap />
                </div>
                {[
                  { icon: '🔥', title: 'Aquecimento', text: '45 min antes de cada jogo. Localização no mapa do venue.' },
                  { icon: '🚿', title: 'Vestiários', text: 'Disponíveis com chuveiros para todos os times.' },
                  { icon: '🏥', title: 'Suporte médico', text: 'Equipe médica presente todos os dias. Posto de primeiros socorros no mapa.' },
                  { icon: '📞', title: 'Emergências', text: 'Contato de emergência fornecido no guia do participante.' },
                  { icon: '🍽️', title: 'Alimentação', text: 'Praça de alimentação no venue + lista de restaurantes no guia.' },
                  { icon: '🅿️', title: 'Estacionamento', text: 'Disponível no venue. Instruções enviadas com o guia.' },
                ].map(i => (
                  <div key={i.title} style={{ ...card({ display: 'flex', gap: 14, padding: cpad }) }}>
                    <div style={{ fontSize: 22, flexShrink: 0 }}>{i.icon}</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 3 }}>{i.title}</div>
                      <div style={{ fontSize: 13, color: 'rgba(15,23,42,.45)', lineHeight: 1.55 }}>{i.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══════ TAB INFORMAÇÕES ══════ */}
        {tab === 'informacoes' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            <div style={{ ...card(), padding: cpad }}>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(15,23,42,.28)', marginBottom: 14 }}>Regulamento</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {REGS.map(r => (
                  <div key={r.title} style={{ ...miniCard(), display: 'flex', gap: 12 }}>
                    <span style={{ fontSize: 20, flexShrink: 0 }}>{r.icon}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 3 }}>{r.title}</div>
                      <div style={{ fontSize: 12, color: 'rgba(15,23,42,.45)', lineHeight: 1.55 }}>{r.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ ...card(), padding: cpad }}>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(15,23,42,.28)', marginBottom: 14 }}>Equipamentos</div>
              {EQUIP.map(e => (
                <div key={e.item} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 0', borderBottom: '1px solid rgba(15,23,42,.04)' }}>
                  <span style={{ fontSize: 13, flexShrink: 0, marginTop: 1 }}>{e.type === 'ok' ? '✅' : e.type === 'opt' ? '🔵' : '🚫'}</span>
                  <span style={{ fontSize: 13, color: e.type === 'no' ? '#ff6666' : 'rgba(15,23,42,.65)', lineHeight: 1.4 }}>{e.item}</span>
                </div>
              ))}
            </div>

            <div style={{ ...card(), padding: cpad }}>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(15,23,42,.28)', marginBottom: 14 }}>Hospedagem & Logística</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {TRAVEL.map(t => (
                  <div key={t.title} style={{ ...miniCard(), display: 'flex', gap: 12 }}>
                    <span style={{ fontSize: 20, flexShrink: 0 }}>{t.icon}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 3 }}>{t.title}</div>
                      <div style={{ fontSize: 12, color: 'rgba(15,23,42,.45)', lineHeight: 1.55 }}>{t.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {isMobile && (
              <button onClick={() => { sessionStorage.removeItem('bfwc_team_session'); router.push('/portal'); }} style={{ padding: '14px', borderRadius: 12, border: '1px solid rgba(15,23,42,.1)', background: 'rgba(15,23,42,.03)', color: 'rgba(15,23,42,.3)', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                Sair do portal
              </button>
            )}
          </div>
        )}

      </div>
      </div>
    </div>
  );
}
