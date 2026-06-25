'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { LANGS, detectLang, saveLang, t } from '@/lib/i18n';

const GREEN  = '#20e33f';
const YELLOW = '#f4ff00';
const ACCENT = '#0D4BFF';
const PURPLE = '#a855f7';

/* ── design tokens ───────────────────────────────────────────── */
const glass = (extra = {}) => ({
  background: 'rgba(3,16,32,.72)',
  backdropFilter: 'blur(18px)',
  border: '1px solid rgba(255,255,255,.1)',
  borderRadius: 16,
  ...extra,
});

const pill = (color) => ({
  display: 'inline-flex', alignItems: 'center', gap: 5,
  fontSize: 10, fontWeight: 800, letterSpacing: .6, textTransform: 'uppercase',
  padding: '4px 12px', borderRadius: 20,
  background: color + '15', color, border: `1px solid ${color}30`,
});

const inputSt = {
  width: '100%', boxSizing: 'border-box', padding: '13px 16px',
  background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.09)',
  borderRadius: 12, color: '#fff', fontSize: 14, outline: 'none', fontFamily: 'inherit',
  transition: 'border-color .15s',
};

const selectSt = {
  ...inputSt, cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='rgba(255,255,255,.35)' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center', paddingRight: 38,
};

const lbl = {
  fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.38)',
  letterSpacing: .8, textTransform: 'uppercase', display: 'block', marginBottom: 6,
};

const sectionHead = {
  fontSize: 11, fontWeight: 800, letterSpacing: 2.5, textTransform: 'uppercase',
  color: 'rgba(255,255,255,.25)', marginBottom: 16,
};

/* ── data ─────────────────────────────────────────────────── */
const POSITIONS = [
  'QB — Quarterback',
  'Center / Snapper',
  'WR — Wide Receiver',
  'Slot',
  'RB — Running Back',
  'Rusher',
  'Corner Back',
  'Safety',
  'Flex — Ataque e Defesa',
];
const SIZES = ['PP', 'P', 'M', 'G', 'GG', 'XG'];

/* ── Language switcher bar ───────────────────────────────────── */
function LangBar({ lang, onChange }) {
  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 200,
      background: 'rgba(2,8,20,.92)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255,255,255,.06)',
      display: 'flex', justifyContent: 'flex-end', alignItems: 'center',
      padding: '6px 14px', gap: 4,
    }}>
      <span style={{ fontSize: 10, color: 'rgba(255,255,255,.25)', fontWeight: 700, letterSpacing: 1, marginRight: 6 }}>🌐</span>
      {LANGS.map(l => (
        <button
          key={l.code}
          onClick={() => onChange(l.code)}
          style={{
            padding: '5px 10px', borderRadius: 8, border: 'none', cursor: 'pointer',
            fontFamily: 'inherit', fontSize: 11, fontWeight: 800, letterSpacing: .5,
            transition: 'all .15s',
            background: lang === l.code ? GREEN : 'rgba(255,255,255,.05)',
            color: lang === l.code ? '#031020' : 'rgba(255,255,255,.35)',
          }}
        >
          {l.flag} {l.label}
        </button>
      ))}
    </div>
  );
}

/* ── photo upload avatar ─────────────────────────────────────── */
function PhotoAvatar({ athleteId, photoUrl, onUpload, lang }) {
  const fileRef = useRef();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [hover, setHover]     = useState(false);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true); setError('');
    const fd = new FormData();
    fd.append('file', file);
    fd.append('athlete_id', athleteId);
    const r = await fetch('/api/portal/atletas/upload-photo', { method: 'POST', body: fd });
    const d = await r.json();
    setLoading(false);
    if (d.ok) onUpload(d.url);
    else setError(d.message || 'Erro no upload.');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <div
        onClick={() => !loading && fileRef.current?.click()}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          width: 96, height: 96, borderRadius: 48, cursor: loading ? 'wait' : 'pointer',
          border: `3px solid ${hover ? GREEN : 'rgba(255,255,255,.12)'}`,
          overflow: 'hidden', position: 'relative', flexShrink: 0,
          background: 'rgba(255,255,255,.04)', transition: 'border-color .2s',
          boxShadow: hover ? `0 0 20px ${GREEN}30` : 'none',
        }}
      >
        {photoUrl
          ? <img src={photoUrl} alt="foto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, color: 'rgba(255,255,255,.2)' }}>👤</div>
        }
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.55)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: hover || loading ? 1 : 0, transition: 'opacity .2s' }}>
          {loading
            ? <div style={{ width: 22, height: 22, border: `2px solid ${GREEN}`, borderTopColor: 'transparent', borderRadius: 11, animation: 'spin 1s linear infinite' }} />
            : <><div style={{ fontSize: 18 }}>📷</div><div style={{ fontSize: 9, fontWeight: 800, color: '#fff', marginTop: 3, letterSpacing: .5 }}>{t('photoAlter', lang)}</div></>
          }
        </div>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
      </div>
      {error && <div style={{ fontSize: 11, color: '#ff6666', textAlign: 'center', maxWidth: 160 }}>{error}</div>}
      {!error && <div style={{ fontSize: 11, color: 'rgba(255,255,255,.28)', textAlign: 'center' }}>
        {photoUrl ? t('photoChange', lang) : t('photoAdd', lang)}<br />
        <span style={{ fontSize: 10 }}>{t('photoHint', lang)}</span>
      </div>}
    </div>
  );
}

/* ── term card ───────────────────────────────────────────────── */
function TermCard({ term, checked, onToggle, lang }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderRadius: 14, border: `1px solid ${checked ? term.color + '35' : 'rgba(255,255,255,.06)'}`, overflow: 'hidden', background: checked ? term.color + '06' : 'rgba(255,255,255,.015)', transition: 'all .2s' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', cursor: 'pointer' }} onClick={() => setOpen(o => !o)}>
        <div
          onClick={e => { e.stopPropagation(); onToggle(); }}
          style={{ width: 22, height: 22, borderRadius: 7, flexShrink: 0, cursor: 'pointer', transition: 'all .15s',
            background: checked ? term.color : 'transparent',
            border: `2px solid ${checked ? term.color : 'rgba(255,255,255,.22)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#fff', fontWeight: 900 }}>
          {checked ? '✓' : ''}
        </div>
        <span style={{ fontSize: 18, flexShrink: 0 }}>{term.icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: checked ? '#fff' : 'rgba(255,255,255,.7)', lineHeight: 1.3 }}>{t(term.titleKey, lang)}</div>
          {!checked && <div style={{ fontSize: 10, color: '#ff6666', fontWeight: 700, marginTop: 2 }}>{t('termsRequired', lang)}</div>}
        </div>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,.25)', flexShrink: 0 }}>{open ? '▲' : '▼'}</span>
      </div>
      {open && (
        <div style={{ padding: '0 16px 16px' }}>
          <div style={{ padding: '14px 16px', borderRadius: 12, background: 'rgba(0,0,0,.3)', border: '1px solid rgba(255,255,255,.05)', fontSize: 13, color: 'rgba(255,255,255,.5)', lineHeight: 1.8, marginBottom: 12 }}>
            {t(term.textKey, lang)}
          </div>
          <button onClick={onToggle} style={{ width: '100%', padding: '12px', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 800, transition: 'all .15s',
            background: checked ? `${GREEN}15` : term.color, color: checked ? GREEN : '#fff' }}>
            {checked ? t('termsAccepted', lang) : `${t('termAcceptBtn', lang)} — ${t(term.titleKey, lang)}`}
          </button>
        </div>
      )}
    </div>
  );
}

const TERMS = [
  { key: 'terms_health',   icon: '🏥', color: '#ef4444', titleKey: 'termHealthTitle',   textKey: 'termHealthText'   },
  { key: 'terms_image',    icon: '📸', color: PURPLE,    titleKey: 'termImageTitle',    textKey: 'termImageText'    },
  { key: 'terms_rules',    icon: '📋', color: ACCENT,    titleKey: 'termRulesTitle',    textKey: 'termRulesText'    },
  { key: 'terms_privacy',  icon: '🔒', color: '#22d3ee', titleKey: 'termPrivacyTitle',  textKey: 'termPrivacyText'  },
  { key: 'terms_conduct',  icon: '🤝', color: GREEN,     titleKey: 'termConductTitle',  textKey: 'termConductText'  },
];

/* ── field helper ────────────────────────────────────────────── */
function Field({ label, children }) {
  return (
    <div>
      <label style={lbl}>{label}</label>
      {children}
    </div>
  );
}

/* ── progress step ───────────────────────────────────────────── */
function Step({ done, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', borderRadius: 10,
      background: done ? `${GREEN}08` : 'rgba(255,255,255,.025)',
      border: `1px solid ${done ? GREEN + '25' : 'rgba(255,255,255,.05)'}` }}>
      <div style={{ width: 18, height: 18, borderRadius: 5, flexShrink: 0, transition: 'all .2s',
        background: done ? GREEN : 'transparent',
        border: `2px solid ${done ? GREEN : 'rgba(255,255,255,.18)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#031020', fontWeight: 900 }}>
        {done ? '✓' : ''}
      </div>
      <span style={{ fontSize: 12, color: done ? 'rgba(255,255,255,.8)' : 'rgba(255,255,255,.35)', fontWeight: done ? 700 : 500 }}>{label}</span>
    </div>
  );
}

/* ── Venue Map Component ─────────────────────────────────────── */
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

    // BG
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

    // Roads
    g.fillStyle='#8a9272';g.fillRect(40,380,W-80,22);
    g.setLineDash([18,12]);g.strokeStyle='rgba(255,220,50,.4)';g.lineWidth=1.5;
    g.beginPath();g.moveTo(40,391);g.lineTo(W-40,391);g.stroke();g.setLineDash([]);
    [232,396,560,724,888].forEach(rx=>{g.fillStyle='#8a9272';g.fillRect(rx,40,18,H-80);});
    g.fillStyle='#8a9272';g.fillRect(490,H-80,120,80);
    g.setLineDash([10,8]);g.strokeStyle='rgba(255,220,50,.5)';g.lineWidth=1.5;
    g.beginPath();g.moveTo(550,H-80);g.lineTo(550,H-10);g.stroke();g.setLineDash([]);

    // Parking
    function drawParking(x,y,w,h,cols,rows,lbl){
      rrect(x,y,w,h,6,'#2a2f3a','#1a1f28',1);
      const cw=(w-10)/cols,rh=(h-10)/rows;
      for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
        const px=x+5+c*cw,py=y+5+r*rh;
        rrect(px+1,py+1,cw-2,rh-2,2,'#35404f','#25303e',0.5);
        if(Math.random()<0.6){rrect(px+cw/2-6,py+rh*0.25,12,rh*0.5,2,'#1e2a38',null);}
      }
      txt(lbl,x+w/2,y+h-12,9,'rgba(255,255,255,.35)','700');
    }
    drawParking(40,40,180,332,3,5,'🅿 ESTAC. OESTE');
    drawParking(880,40,180,332,3,5,'🅿 ESTAC. LESTE');
    drawParking(40,402,180,350,3,5,'🅿 ESTAC. OESTE');
    drawParking(880,402,180,350,3,5,'🅿 ESTAC. LESTE');

    // Warm-up strips
    function warmup(x,y,w,h,lbl){
      rrect(x,y,w,h,5,'#1a3d1a',null);
      g.setLineDash([8,5]);rrect(x,y,w,h,5,null,'#4caf50',1.2);g.setLineDash([]);
      for(let lx=x+20;lx<x+w-10;lx+=20){
        g.strokeStyle='rgba(255,255,255,.1)';g.lineWidth=0.8;
        g.beginPath();g.moveTo(lx,y);g.lineTo(lx,y+h);g.stroke();
      }
      txt(lbl,x+w/2,y+h/2+1,8,'rgba(100,220,100,.6)','700');
    }
    warmup(250,360,222,18,'⚡ AQUECIMENTO 1');
    warmup(480,360,222,18,'⚡ AQUECIMENTO 2');
    warmup(250,404,222,18,'⚡ AQUECIMENTO 3');
    warmup(480,404,222,18,'⚡ AQUECIMENTO 4');

    // Fields
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
      g.save();g.translate(x+FW/2,y+EZ/2);txt('BFWC 2026',0,0,7,'rgba(255,255,255,.15)','800');g.restore();
      g.save();g.translate(x+FW/2,y+FH-EZ/2);txt('BFWC 2026',0,0,7,'rgba(255,255,255,.15)','800');g.restore();
      g.strokeStyle='rgba(255,255,255,.18)';g.lineWidth=0.8;
      const fieldH=FH-EZ*2;
      [1,2,3,4].forEach(i=>{
        const ly=y+EZ+i*fieldH/5;
        g.beginPath();g.moveTo(x,ly);g.lineTo(x+FW,ly);g.stroke();
        txt(`${i*10}`,x+8,ly,6,'rgba(255,255,255,.2)');
        txt(`${i*10}`,x+FW-8,ly,6,'rgba(255,255,255,.2)');
      });
      g.setLineDash([5,4]);g.strokeStyle='rgba(255,255,255,.35)';g.lineWidth=1;
      const midY=y+FH/2;
      g.beginPath();g.moveTo(x,midY);g.lineTo(x+FW,midY);g.stroke();g.setLineDash([]);
      g.strokeStyle='rgba(255,255,255,.2)';g.lineWidth=0.8;
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

    // Support structures
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

    // Entrance
    rrect(456,H-34,188,28,6,'rgba(0,0,0,.65)','rgba(244,255,0,.3)',1);
    txt('▲  ENTRADA PRINCIPAL',550,H-20,11,'#f4ff00','800');

    // Scale
    g.fillStyle='rgba(255,255,255,.7)';g.fillRect(42,H-30,60,4);
    g.fillStyle='rgba(255,255,255,.35)';g.fillRect(102,H-30,60,4);
    txt('0        50m       100m',132,H-18,8,'rgba(255,255,255,.35)');

    // Header
    const hg=g.createLinearGradient(0,0,W,0);
    hg.addColorStop(0,'rgba(20,50,20,.8)');hg.addColorStop(0.5,'rgba(0,0,0,.85)');hg.addColorStop(1,'rgba(20,50,20,.8)');
    g.fillStyle=hg;g.fillRect(0,0,W,38);
    txt('🏈  BRASIL FLAG WORLD CHAMPIONSHIP 2026  —  MAPA DO VENUE  —  LEME, SP',W/2,20,12,'#f4ff00','800');

    // North arrow
    g.save();g.translate(W-32,58);
    g.beginPath();g.arc(0,0,18,0,Math.PI*2);
    const na=g.createRadialGradient(0,0,2,0,0,18);
    na.addColorStop(0,'rgba(255,255,255,.12)');na.addColorStop(1,'rgba(0,0,0,.4)');
    g.fillStyle=na;g.fill();
    g.strokeStyle='rgba(255,255,255,.2)';g.lineWidth=1;g.stroke();
    g.beginPath();g.moveTo(0,-13);g.lineTo(-5,2);g.lineTo(0,-1);g.lineTo(5,2);g.closePath();
    g.fillStyle='#f4ff00';g.fill();
    g.beginPath();g.moveTo(0,13);g.lineTo(-5,-2);g.lineTo(0,1);g.lineTo(5,-2);g.closePath();
    g.fillStyle='rgba(255,255,255,.2)';g.fill();
    txt('N',0,-18,8,'rgba(255,255,255,.6)','800');
    g.restore();
  }, []);

  return (
    <div style={{ borderRadius:14, overflow:'hidden', marginBottom:0 }}>
      <canvas ref={ref} style={{ width:'100%', borderRadius:14, display:'block' }} />
      <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginTop:10, padding:'8px 12px', background:'rgba(255,255,255,.03)', borderRadius:10, border:'1px solid rgba(255,255,255,.06)' }}>
        {[['#2a6e2a','Campos de jogo'],['#4caf50','Aquecimento'],['#c9a227','Palco/Cerimônias'],['#2a6fc9','Credenciamento'],['#c93a3a','Médico'],['#c97a2a','Alimentação'],['#8a3dcc','Organização'],['#0ea5e9','Vestiários'],['#2a2f3a','Estacionamento']].map(([col,lbl])=>(
          <div key={lbl} style={{ display:'flex', alignItems:'center', gap:5, fontSize:10, color:'rgba(255,255,255,.45)' }}>
            <span style={{ width:11,height:11,borderRadius:3,background:col,flexShrink:0,display:'inline-block' }}/>
            {lbl}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════ */
export default function AtletasPortalPage() {
  const router = useRouter();
  const [athlete, setAthlete]   = useState(null);
  const [tab, setTab]           = useState('perfil');
  const [isMobile, setIsMobile] = useState(false);
  const [lang, setLang]         = useState('pt');
  const [focused, setFocused]   = useState('');

  const [profile, setProfile] = useState({
    nationality: '', phone: '', whatsapp: '', document: '',
    emergency_name: '', emergency_phone: '', emergency_relation: '',
    position: '', shirt_size: '',
    photo_url: '', instagram: '', tiktok: '',
    birthdate: '', history: '',
    terms_health: false, terms_image: false, terms_rules: false,
    terms_privacy: false, terms_conduct: false,
  });
  const [saving, setSaving]   = useState(false);
  const [saveMsg, setSaveMsg] = useState({ text: '', type: '' });

  const [teams, setTeams]           = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [catFilter, setCatFilter]   = useState('all');
  const [campView, setCampView]     = useState('jogos');
  const [games, setGames]           = useState([]);
  const [loadingGames, setLoadingGames] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    setLang(detectLang());
  }, []);

  function changeLang(code) {
    saveLang(code);
    setLang(code);
  }

  useEffect(() => {
    const session = sessionStorage.getItem('bfwc_athlete_session');
    if (!session) { router.replace('/portal/atletas/login'); return; }
    try {
      const a = JSON.parse(session);
      setAthlete(a);
      fetch(`/api/portal/atletas/profile?athlete_id=${a.id}`)
        .then(r => r.json()).then(d => {
          if (!d.ok) return;
          const p = d.athlete;
          setProfile({
            nationality: p.nationality || '', phone: p.phone || '', whatsapp: p.whatsapp || '', document: p.document || '',
            emergency_name: p.emergency_name || '', emergency_phone: p.emergency_phone || '',
            emergency_relation: p.emergency_relation || '',
            position: p.position || '', shirt_size: p.shirt_size || '',
            photo_url: p.photo_url || '', instagram: p.instagram || '', tiktok: p.tiktok || '',
            birthdate: p.birthdate || '', history: p.history || '',
            terms_health: !!p.terms_health, terms_image: !!p.terms_image,
            terms_rules: !!p.terms_rules, terms_privacy: !!p.terms_privacy, terms_conduct: !!p.terms_conduct,
          });
          const merged = { ...a, ...p };
          sessionStorage.setItem('bfwc_athlete_session', JSON.stringify(merged));
          setAthlete(merged);
        });
    } catch { router.replace('/portal/atletas/login'); }
  }, []);

  useEffect(() => {
    if (tab !== 'campeonato') return;
    setLoadingTeams(true);
    fetch('/api/admin/teams').then(r => r.json()).then(d => {
      setTeams((d.teams || []).filter(tm => tm.status === 'inscricao_confirmada' || tm.status === 'aprovado'));
      setLoadingTeams(false);
    }).catch(() => setLoadingTeams(false));
    // carregar jogos do time do atleta
    if (athlete?.team_id) {
      setLoadingGames(true);
      fetch(`/api/portal/times/jogos?team_id=${athlete.team_id}`)
        .then(r => r.json()).then(d => { setGames(d.games || []); setLoadingGames(false); })
        .catch(() => setLoadingGames(false));
    }
  }, [tab]);

  function set(key, val) { setProfile(p => ({ ...p, [key]: val })); }

  async function save() {
    setSaving(true); setSaveMsg({ text: '', type: '' });
    const r = await fetch('/api/portal/atletas/profile', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ athlete_id: athlete.id, ...profile }),
    });
    const d = await r.json();
    setSaving(false);
    if (d.ok) {
      const updated = { ...athlete, ...d.athlete };
      setAthlete(updated);
      sessionStorage.setItem('bfwc_athlete_session', JSON.stringify(updated));
      setSaveMsg({ text: d.profileComplete ? t('savedComplete', lang) : t('savedPartial', lang), type: d.profileComplete ? 'ok' : 'warn' });
    } else {
      setSaveMsg({ text: '❌ ' + (d.message || 'Erro ao salvar.'), type: 'err' });
    }
  }

  if (!athlete) return (
    <div style={{ minHeight: '100vh', background: '#020814', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,.3)', fontFamily: 'Inter,sans-serif', fontSize: 14 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 32, height: 32, border: `2px solid ${GREEN}`, borderTopColor: 'transparent', borderRadius: 16, animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
        {t('loading', lang)}
      </div>
    </div>
  );

  const allTerms  = TERMS.every(tm => profile[tm.key]);
  const reqFields = ['nationality', 'phone', 'document', 'emergency_name', 'emergency_phone', 'position'];
  const hasReq    = reqFields.every(f => profile[f]?.trim());
  const complete  = athlete.profile_complete || (allTerms && hasReq);
  const termsCount = TERMS.filter(tm => profile[tm.key]).length;

  const steps = [
    { label: t('stepPersonal', lang),  done: !!(profile.nationality && profile.phone && profile.document) },
    { label: t('stepEmergency', lang), done: !!(profile.emergency_name && profile.emergency_phone) },
    { label: t('stepSport', lang),     done: !!profile.position },
    { label: `${t('stepTerms', lang)} (${termsCount}/${TERMS.length})`, done: allTerms },
  ];
  const doneCount = steps.filter(s => s.done).length;
  const pct       = Math.round((doneCount / steps.length) * 100);

  const inp = (key, extra = {}) => ({ ...inputSt, ...(focused === key ? { borderColor: ACCENT + '70' } : {}), ...extra });
  const ff  = (key) => ({ onFocus: () => setFocused(key), onBlur: () => setFocused('') });

  const totalAth = teams.reduce((s, tm) => s + (parseInt(tm.athletes_count) || 0), 0);
  const byCountry = Object.values(teams.reduce((acc, tm) => {
    const c = tm.country || 'Outros';
    if (!acc[c]) acc[c] = { country: c, times: 0, athletes: 0 };
    acc[c].times++; acc[c].athletes += parseInt(tm.athletes_count) || 0;
    return acc;
  }, {})).sort((a, b) => b.athletes - a.athletes);

  const filtered = teams.filter(tm =>
    catFilter === 'all' || (tm.category || '').toLowerCase().includes(catFilter.toLowerCase().replace('sub-', 'sub'))
  );

  const TABS = [
    { key: 'perfil', icon: '👤', label: t('tabProfile', lang) },
    { key: 'campeonato', icon: '🏆', label: t('tabChampionship', lang) },
  ];
  const RELATIONS = [
    t('relParent', lang), t('relSpouse', lang), t('relSibling', lang), t('relFriend', lang), t('relOther', lang),
  ];
  const CATS_FILTER = [
    { k: 'all', l: t('all', lang) }, { k: 'Masculino', l: 'Masculino' },
    { k: 'Feminino', l: 'Feminino' }, { k: 'Sub-15', l: 'Sub-15' }, { k: 'Sub-12', l: 'Sub-12' },
  ];

  const pad = isMobile ? '16px 14px 100px' : '32px 24px 100px';
  const W   = { maxWidth: 680, margin: '0 auto' };

  return (
    <div style={{ minHeight: '100vh', fontFamily: "'Inter',sans-serif", color: '#fff', position: 'relative' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        * { -webkit-tap-highlight-color: transparent; }
        input::placeholder, textarea::placeholder { color: rgba(255,255,255,.2) }
      `}</style>

      {/* Background — mesma imagem do site */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: "url('/assets/hero-rio-athletes.png')",
        backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }} />
      {/* Overlay escuro igual ao site */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 1,
        background: 'linear-gradient(180deg,rgba(3,16,32,.96) 0%,rgba(6,27,58,.92) 50%,rgba(3,16,32,.97) 100%)' }} />
      {/* Conteúdo acima do overlay */}
      <div style={{ position: 'relative', zIndex: 2 }}>

      {/* ── Language bar ── */}
      <LangBar lang={lang} onChange={changeLang} />

      {/* ── Hero ── */}
      <div style={{ padding: isMobile ? '32px 20px 28px' : '48px 24px 36px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,.07)', background: 'linear-gradient(180deg,rgba(32,227,63,.06) 0%,transparent 100%)' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 10, fontWeight: 900, letterSpacing: 3.5, textTransform: 'uppercase', color: GREEN, marginBottom: 16, padding: '5px 16px', borderRadius: 20, border: `1px solid ${GREEN}30`, background: `${GREEN}0d` }}>
          <span>🏈</span> {t('portalTitle', lang)}
        </div>
        <h1 style={{ fontSize: isMobile ? 30 : 44, fontWeight: 900, letterSpacing: -1.5, margin: '0 0 14px', lineHeight: 1.1 }}>{athlete.name}</h1>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
          {complete
            ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12, fontWeight: 800, letterSpacing: .8, textTransform: 'uppercase', padding: '7px 18px', borderRadius: 24, background: `${GREEN}18`, color: GREEN, border: `1px solid ${GREEN}40` }}>✓ {t('profileComplete', lang)}</span>
            : (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 800, letterSpacing: .5, padding: '7px 18px', borderRadius: 24, background: `${YELLOW}12`, color: YELLOW, border: `1px solid ${YELLOW}35` }}>
                ⚠ {t('profileIncomplete', lang)}
                <span style={{ fontSize: 18, fontWeight: 900, letterSpacing: -1 }}>{pct}%</span>
              </span>
            )
          }
          {athlete.category && <span style={{ fontSize: 13, color: 'rgba(255,255,255,.4)', fontWeight: 600 }}>• {athlete.category}</span>}
        </div>
      </div>

      {/* Alert */}
      {!complete && (
        <div onClick={() => setTab('perfil')} style={{ cursor: 'pointer', background: `linear-gradient(90deg,${YELLOW}0f,${YELLOW}18,${YELLOW}0f)`, borderBottom: `2px solid ${YELLOW}28`, padding: isMobile ? '14px 20px' : '16px 32px' }}>
          <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 20 }}>⚠️</span>
            <span style={{ fontSize: isMobile ? 13 : 15, fontWeight: 800, color: YELLOW, lineHeight: 1.4 }}>{t('alertBanner', lang)}</span>
            <span style={{ fontSize: 13, fontWeight: 900, color: '#031020', background: YELLOW, padding: '5px 14px', borderRadius: 8, whiteSpace: 'nowrap' }}>{t('alertCta', lang)}</span>
          </div>
        </div>
      )}

      {/* ── Tabs ── */}
      <div style={{ background: 'rgba(3,16,32,.6)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,.08)', overflowX: 'auto' }}>
        <div style={{ display: 'flex', maxWidth: 680, margin: '0 auto', alignItems: 'stretch' }}>
          {TABS.map(tb => (
            <button key={tb.key} onClick={() => setTab(tb.key)} style={{
              flex: 1,
              padding: isMobile ? '16px 8px' : '20px 32px',
              background: 'none', border: 'none',
              borderBottom: tab === tb.key ? `3px solid ${GREEN}` : '3px solid transparent',
              color: tab === tb.key ? '#fff' : 'rgba(255,255,255,.38)',
              fontFamily: 'inherit', fontSize: isMobile ? 12 : 15, fontWeight: 800, cursor: 'pointer',
              letterSpacing: .3, textTransform: isMobile ? 'none' : 'none',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, transition: 'all .2s',
            }}>
              <span style={{ fontSize: isMobile ? 22 : 24 }}>{tb.icon}</span>
              <span>{tb.label}</span>
            </button>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', paddingRight: 16, marginLeft: 'auto' }}>
            <button onClick={() => { sessionStorage.removeItem('bfwc_athlete_session'); router.push('/portal'); }} style={{ padding: '9px 18px', fontSize: 12, fontWeight: 800, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 10, color: 'rgba(255,255,255,.45)', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: .3, whiteSpace: 'nowrap' }}>
              {t('logout', lang)}
            </button>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ ...W, padding: pad }}>

        {/* ════════ PERFIL ════════ */}
        {tab === 'perfil' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, animation: 'fadeIn .3s ease' }}>

            {/* Progresso */}
            <div style={glass({ padding: '20px 22px' })}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <span style={{ fontSize: 14, fontWeight: 800 }}>{t('progressTitle', lang)}</span>
                <span style={{ fontSize: 13, fontWeight: 900, color: complete ? GREEN : YELLOW }}>{pct}%</span>
              </div>
              <div style={{ height: 5, borderRadius: 4, background: 'rgba(255,255,255,.07)', marginBottom: 14, overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 4, width: `${pct}%`, transition: 'width .5s ease',
                  background: complete ? GREEN : `linear-gradient(90deg,${ACCENT},${GREEN})` }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {steps.map(s => <Step key={s.label} {...s} />)}
              </div>
            </div>

            {/* Foto */}
            <div style={glass({ padding: '22px' })}>
              <div style={sectionHead}>{t('photoSection', lang)}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
                <PhotoAvatar athleteId={athlete.id} photoUrl={profile.photo_url} onUpload={url => set('photo_url', url)} lang={lang} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>{t('photoTitle', lang)}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,.4)', lineHeight: 1.65, marginBottom: 10 }}>{t('photoDesc', lang)}</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {['photoTagPro', 'photoTagBg', 'photoTagFace'].map(k => (
                      <span key={k} style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 6, background: `${GREEN}10`, color: GREEN, border: `1px solid ${GREEN}20` }}>✓ {t(k, lang)}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Dados pessoais */}
            <div style={glass({ padding: '22px' })}>
              <div style={sectionHead}>{t('personalSection', lang)} <span style={{ color: '#ff6666' }}>*</span></div>

              {/* Locked badge */}
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.3)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>🔒</span> Campos preenchidos no cadastro não podem ser alterados
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Row 1: Nome + E-mail (locked) */}
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
                  <Field label={t('fullName', lang)}>
                    <div style={{ position: 'relative' }}>
                      <input style={{ ...inp(''), opacity: .5, paddingRight: 32 }} value={athlete.name} readOnly />
                      <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12 }}>🔒</span>
                    </div>
                  </Field>
                  <Field label="E-mail">
                    <div style={{ position: 'relative' }}>
                      <input style={{ ...inp(''), opacity: .5, paddingRight: 32 }} value={athlete.email || ''} readOnly />
                      <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12 }}>🔒</span>
                    </div>
                  </Field>
                </div>

                {/* Row 2: Nascimento + WhatsApp (locked) */}
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
                  <Field label="Data de nascimento">
                    <div style={{ position: 'relative' }}>
                      <input style={{ ...inp(''), opacity: .5, paddingRight: 32 }} value={profile.birthdate || ''} readOnly />
                      <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12 }}>🔒</span>
                    </div>
                  </Field>
                  <Field label="WhatsApp">
                    <div style={{ position: 'relative' }}>
                      <input style={{ ...inp(''), opacity: .5, paddingRight: 32 }} value={profile.whatsapp || profile.phone || ''} readOnly />
                      <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12 }}>🔒</span>
                    </div>
                  </Field>
                </div>

                {/* Row 3: Nationality (editable) + Document */}
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
                  <Field label={t('nationality', lang)}>
                    <input style={inp('nat')} {...ff('nat')} value={profile.nationality} onChange={e => set('nationality', e.target.value)} placeholder={t('nationalityPh', lang)} />
                  </Field>
                  <Field label={t('document', lang)}>
                    <input style={inp('doc')} {...ff('doc')} value={profile.document} onChange={e => set('document', e.target.value)} placeholder={t('documentPh', lang)} />
                  </Field>
                </div>
              </div>
            </div>

            {/* Emergência */}
            <div style={glass({ padding: '22px' })}>
              <div style={sectionHead}>{t('emergencySection', lang)} <span style={{ color: '#ff6666' }}>*</span></div>
              <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(239,68,68,.06)', border: '1px solid rgba(239,68,68,.15)', fontSize: 12, color: 'rgba(255,255,255,.45)', lineHeight: 1.55, marginBottom: 14 }}>
                ⚕️ <strong style={{ color: '#fff' }}>⚠</strong> {t('emergencyNote', lang)}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
                  <Field label={t('emergencyName', lang)}>
                    <input style={inp('en')} {...ff('en')} value={profile.emergency_name} onChange={e => set('emergency_name', e.target.value)} placeholder={t('emergencyNamePh', lang)} />
                  </Field>
                  <Field label={t('emergencyPhone', lang)}>
                    <input style={inp('ep')} {...ff('ep')} value={profile.emergency_phone} onChange={e => set('emergency_phone', e.target.value)} placeholder="+55 61 9 9999-9999" />
                  </Field>
                </div>
                <Field label={t('emergencyRel', lang)}>
                  <select style={selectSt} value={profile.emergency_relation} onChange={e => set('emergency_relation', e.target.value)}>
                    <option value="" style={{ background: '#0a1628' }}>{t('select', lang)}</option>
                    {RELATIONS.map(r => <option key={r} value={r} style={{ background: '#0a1628' }}>{r}</option>)}
                  </select>
                </Field>
              </div>
            </div>

            {/* Esporte */}
            <div style={glass({ padding: '22px' })}>
              <div style={sectionHead}>{t('sportSection', lang)} <span style={{ color: '#ff6666' }}>*</span></div>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <Field label={t('position', lang)}>
                  <select style={selectSt} value={profile.position} onChange={e => set('position', e.target.value)}>
                    <option value="" style={{ background: '#0a1628' }}>{t('positionPh', lang)}</option>
                    {POSITIONS.map(p => <option key={p} value={p} style={{ background: '#0a1628' }}>{p}</option>)}
                  </select>
                </Field>
                <Field label={t('shirtSize', lang)}>
                  <select style={selectSt} value={profile.shirt_size} onChange={e => set('shirt_size', e.target.value)}>
                    <option value="" style={{ background: '#0a1628' }}>{t('shirtPh', lang)}</option>
                    {SIZES.map(s => <option key={s} value={s} style={{ background: '#0a1628' }}>{s}</option>)}
                  </select>
                </Field>
              </div>

              {/* Histórico esportivo */}
              <Field label="Histórico esportivo">
                <textarea
                  style={{ ...inp('history'), minHeight: 100, resize: 'vertical', lineHeight: 1.6 }}
                  value={profile.history}
                  onChange={e => set('history', e.target.value)}
                  placeholder="Conte sobre sua experiência com flag football: times que jogou, títulos, posições, tempo de prática..."
                />
              </Field>
            </div>

            {/* Redes sociais */}
            <div style={glass({ padding: '22px' })}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 16 }}>
                <div style={sectionHead}>{t('socialSection', lang)}</div>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,.22)', fontWeight: 600 }}>{t('optional', lang)}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
                <Field label="Instagram">
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: PURPLE, fontSize: 14, fontWeight: 800 }}>@</span>
                    <input style={{ ...inp('ig'), paddingLeft: 30 }} {...ff('ig')} value={profile.instagram} onChange={e => set('instagram', e.target.value.replace('@', ''))} placeholder="seuusuario" />
                  </div>
                </Field>
                <Field label="TikTok">
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,.35)', fontSize: 14, fontWeight: 800 }}>@</span>
                    <input style={{ ...inp('tt'), paddingLeft: 30 }} {...ff('tt')} value={profile.tiktok} onChange={e => set('tiktok', e.target.value.replace('@', ''))} placeholder="seuusuario" />
                  </div>
                </Field>
              </div>
            </div>

            {/* Termos */}
            <div style={glass({ padding: '22px' })}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div style={sectionHead}>{t('termsSection', lang)} <span style={{ color: '#ff6666' }}>*</span></div>
                <span style={{ fontSize: 12, fontWeight: 800, color: allTerms ? GREEN : 'rgba(255,255,255,.3)' }}>{termsCount}/{TERMS.length}</span>
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.32)', marginBottom: 16, lineHeight: 1.5 }}>{t('termsHint', lang)}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {TERMS.map(term => (
                  <TermCard key={term.key} term={term} checked={profile[term.key]} onToggle={() => set(term.key, !profile[term.key])} lang={lang} />
                ))}
              </div>
            </div>

            {/* Feedback */}
            {saveMsg.text && (
              <div style={{
                padding: '14px 18px', borderRadius: 14, fontSize: 13, fontWeight: 600, lineHeight: 1.5, animation: 'fadeIn .25s ease',
                background: saveMsg.type === 'ok' ? `${GREEN}10` : saveMsg.type === 'err' ? 'rgba(255,68,68,.1)' : `${YELLOW}08`,
                border: `1px solid ${saveMsg.type === 'ok' ? GREEN + '30' : saveMsg.type === 'err' ? 'rgba(255,68,68,.25)' : YELLOW + '18'}`,
                color: saveMsg.type === 'ok' ? GREEN : saveMsg.type === 'err' ? '#ff8888' : YELLOW,
              }}>{saveMsg.text}</div>
            )}

            <button onClick={save} disabled={saving} style={{
              padding: '16px', borderRadius: 14, border: 'none', cursor: saving ? 'wait' : 'pointer',
              fontFamily: 'inherit', fontSize: 15, fontWeight: 900, letterSpacing: .3, transition: 'all .2s',
              background: allTerms && hasReq ? `linear-gradient(135deg,${GREEN},#16c932)` : `linear-gradient(135deg,${ACCENT},#1a5fff)`,
              color: allTerms && hasReq ? '#031020' : '#fff', opacity: saving ? .7 : 1,
              boxShadow: allTerms && hasReq ? `0 6px 24px ${GREEN}30` : `0 6px 24px ${ACCENT}30`,
            }}>
              {saving ? t('saving', lang) : allTerms && hasReq ? t('finish', lang) : t('save', lang)}
            </button>

            {isMobile && (
              <button onClick={() => { sessionStorage.removeItem('bfwc_athlete_session'); router.push('/portal'); }} style={{ padding: '14px', borderRadius: 12, border: '1px solid rgba(255,255,255,.07)', background: 'rgba(255,255,255,.025)', color: 'rgba(255,255,255,.3)', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                {t('logout', lang)}
              </button>
            )}
          </div>
        )}

        {/* ════════ CAMPEONATO ════════ */}
        {tab === 'campeonato' && (() => {
          const upcomingGames = games.filter(g => g.status !== 'finished');
          const finishedGames = games.filter(g => g.status === 'finished');
          const totalAth2 = teams.reduce((s, tm) => s + (parseInt(tm.athletes_count) || 0), 0);
          const byCountry2 = Object.values(teams.reduce((acc, tm) => {
            const c = tm.country || 'Outros';
            if (!acc[c]) acc[c] = { country: c, times: 0, athletes: 0 };
            acc[c].times++; acc[c].athletes += parseInt(tm.athletes_count) || 0;
            return acc;
          }, {})).sort((a, b) => b.athletes - a.athletes);
          const filtered2 = teams.filter(tm => catFilter === 'all' || (tm.category || '').toLowerCase().includes(catFilter.toLowerCase()));

          const CAMP_TABS = [
            { k: 'jogos',      icon: '🗓',  label: 'Jogos' },
            { k: 'classif',    icon: '🏆',  label: 'Classificação' },
            { k: 'stats',      icon: '📊',  label: 'Estatísticas' },
            { k: 'venue',      icon: '🗺️',  label: 'Venue' },
            { k: 'times',      icon: '👥',  label: 'Times' },
          ];

          const comingSoon = (icon, title, desc) => (
            <div style={glass({ padding: '48px 24px', textAlign: 'center' })}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>{icon}</div>
              <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 8 }}>{title}</div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,.4)', lineHeight: 1.6, maxWidth: 340, margin: '0 auto' }}>{desc}</div>
              <div style={{ display: 'inline-block', marginTop: 20, padding: '6px 18px', borderRadius: 20, background: `${YELLOW}12`, color: YELLOW, fontSize: 11, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', border: `1px solid ${YELLOW}25` }}>Em breve</div>
            </div>
          );

          return (
            <div style={{ animation: 'fadeIn .3s ease' }}>

              {/* Contadores globais */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 18 }}>
                {[['Times', teams.length, YELLOW], ['Atletas', totalAth2, GREEN], ['Países', byCountry2.length, ACCENT]].map(([l, v, c]) => (
                  <div key={l} style={glass({ padding: '16px 10px', textAlign: 'center' })}>
                    <div style={{ fontSize: isMobile ? 28 : 36, fontWeight: 900, color: c, letterSpacing: -1.5, lineHeight: 1 }}>{loadingTeams ? '—' : v}</div>
                    <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,.3)', marginTop: 6 }}>{l}</div>
                  </div>
                ))}
              </div>

              {/* Sub-tabs */}
              <div style={{ display: 'flex', gap: 4, marginBottom: 20, overflowX: 'auto', paddingBottom: 2 }}>
                {CAMP_TABS.map(ct => (
                  <button key={ct.k} onClick={() => setCampView(ct.k)} style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px',
                    borderRadius: 12, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                    fontSize: 12, fontWeight: 800, whiteSpace: 'nowrap', transition: 'all .15s',
                    background: campView === ct.k ? YELLOW : 'rgba(255,255,255,.06)',
                    color: campView === ct.k ? '#031020' : 'rgba(255,255,255,.45)',
                    boxShadow: campView === ct.k ? `0 4px 14px ${YELLOW}25` : 'none',
                  }}>
                    <span>{ct.icon}</span> {ct.label}
                  </button>
                ))}
              </div>

              {/* ── JOGOS ── */}
              {campView === 'jogos' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {loadingGames && <div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,.3)', fontSize: 14 }}>Carregando jogos...</div>}
                  {!loadingGames && games.length === 0 && (
                    <div style={glass({ padding: '40px 24px', textAlign: 'center' })}>
                      <div style={{ fontSize: 44, marginBottom: 14 }}>🗓</div>
                      <div style={{ fontSize: 17, fontWeight: 900, marginBottom: 8 }}>Calendário em breve</div>
                      <div style={{ fontSize: 13, color: 'rgba(255,255,255,.4)', lineHeight: 1.65, maxWidth: 340, margin: '0 auto' }}>Os horários dos jogos serão divulgados após o fechamento das inscrições e sorteio dos grupos.</div>
                      <div style={{ display: 'inline-block', marginTop: 18, padding: '6px 18px', borderRadius: 20, background: `${YELLOW}12`, color: YELLOW, fontSize: 11, fontWeight: 800, letterSpacing: 1.5, border: `1px solid ${YELLOW}25` }}>BFWC 2026 — LEME, SP</div>
                    </div>
                  )}
                  {!loadingGames && upcomingGames.length > 0 && (
                    <div>
                      <div style={sectionHead}>Próximos jogos</div>
                      {upcomingGames.map(g => (
                        <div key={g.id} style={glass({ padding: '16px 20px', marginBottom: 10 })}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                            <div style={{ textAlign: 'center', minWidth: 56, background: 'rgba(255,255,255,.04)', borderRadius: 10, padding: '8px 6px' }}>
                              <div style={{ fontSize: 11, fontWeight: 800, color: YELLOW }}>{g.game_date ? new Date(g.game_date+'T12:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'short'}) : 'TBD'}</div>
                              <div style={{ fontSize: 18, fontWeight: 900 }}>{g.game_time?.slice(0,5)||'--:--'}</div>
                            </div>
                            <div style={{ flex: 1, textAlign: 'center' }}>
                              <div style={{ fontSize: 15, fontWeight: 800 }}>{g.team1_name} <span style={{ color: 'rgba(255,255,255,.3)', fontSize: 12 }}>vs</span> {g.team2_name}</div>
                              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', marginTop: 4 }}>📍 {g.field||'Campo TBD'} {g.category ? `· ${g.category}` : ''}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {!loadingGames && finishedGames.length > 0 && (
                    <div>
                      <div style={sectionHead}>Resultados</div>
                      {finishedGames.map(g => {
                        const isTeam1 = g.team1_id === athlete?.team_id;
                        const myScore = isTeam1 ? g.team1_score : g.team2_score;
                        const oppScore = isTeam1 ? g.team2_score : g.team1_score;
                        const result = myScore > oppScore ? 'win' : myScore < oppScore ? 'loss' : 'draw';
                        const rc = result==='win' ? GREEN : result==='loss' ? '#ff4444' : YELLOW;
                        const rl = result==='win' ? 'Vitória' : result==='loss' ? 'Derrota' : 'Empate';
                        return (
                          <div key={g.id} style={glass({ padding: '16px 20px', marginBottom: 10, borderLeft: `4px solid ${rc}` })}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                              <span style={{ fontSize: 11, fontWeight: 800, padding: '4px 12px', borderRadius: 8, background: rc+'18', color: rc, flexShrink: 0 }}>{rl}</span>
                              <div style={{ flex: 1, fontSize: 15, fontWeight: 800, textAlign: 'center' }}>
                                <span style={{ color: isTeam1?'#fff':'rgba(255,255,255,.4)' }}>{g.team1_name}</span>
                                <span style={{ color: YELLOW, margin: '0 10px', fontWeight: 900 }}>{g.team1_score} – {g.team2_score}</span>
                                <span style={{ color: !isTeam1?'#fff':'rgba(255,255,255,.4)' }}>{g.team2_name}</span>
                              </div>
                              <span style={{ fontSize: 11, color: 'rgba(255,255,255,.3)', flexShrink: 0 }}>{g.field}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ── CLASSIFICAÇÃO ── */}
              {campView === 'classif' && comingSoon('🏆', 'Classificação do Campeonato', 'A tabela de classificação por grupo e fase eliminatória será publicada após o sorteio oficial dos grupos do BFWC 2026.')}

              {/* ── ESTATÍSTICAS ── */}
              {campView === 'stats' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {/* Meu desempenho */}
                  <div style={glass({ padding: '20px 22px' })}>
                    <div style={sectionHead}>Meu desempenho</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 16 }}>
                      {[['Jogos', finishedGames.length, ACCENT], ['Vitórias', finishedGames.filter(g => { const i=g.team1_id===athlete?.team_id; return i?g.team1_score>g.team2_score:g.team2_score>g.team1_score; }).length, GREEN], ['Derrotas', finishedGames.filter(g => { const i=g.team1_id===athlete?.team_id; return i?g.team1_score<g.team2_score:g.team2_score<g.team1_score; }).length, '#ff4444']].map(([l,v,c]) => (
                        <div key={l} style={{ textAlign: 'center', padding: '14px 8px', borderRadius: 12, background: c+'0d', border: `1px solid ${c}20` }}>
                          <div style={{ fontSize: 28, fontWeight: 900, color: c }}>{v}</div>
                          <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,.35)', textTransform: 'uppercase', letterSpacing: 1 }}>{l}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', fontSize: 12, color: 'rgba(255,255,255,.35)', lineHeight: 1.5 }}>
                      ℹ️ Estatísticas individuais detalhadas (touchdowns, recepções, defesas) serão exibidas após o início do campeonato.
                    </div>
                  </div>
                  {/* Campeonato */}
                  <div style={glass({ padding: '20px 22px' })}>
                    <div style={sectionHead}>Campeonato — distribuição</div>
                    {[['Masculino','#3b9eff'],['Feminino',PURPLE],['Sub-15',GREEN],['Sub-12','#f97316']].map(([cat,c]) => {
                      const v = teams.filter(tm=>(tm.category||'').toLowerCase().includes(cat.toLowerCase())).reduce((s,tm)=>s+(parseInt(tm.athletes_count)||0),0);
                      const p2 = totalAth2 ? Math.round(v/totalAth2*100) : 0;
                      return (
                        <div key={cat} style={{ marginBottom: 14 }}>
                          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                            <span style={{ fontSize:13, fontWeight:700 }}>{cat}</span>
                            <span style={{ fontSize:13, color:'rgba(255,255,255,.4)' }}>{v} atletas · {p2}%</span>
                          </div>
                          <div style={{ height:7, borderRadius:4, background:'rgba(255,255,255,.06)', overflow:'hidden' }}>
                            <div style={{ height:'100%', width:`${p2}%`, background:c, borderRadius:4, transition:'width .6s' }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {/* Por país */}
                  <div style={glass({ overflow:'hidden', padding: 0 })}>
                    <div style={{ padding: '16px 20px 10px', ...sectionHead }}>Por país</div>
                    {byCountry2.slice(0,8).map((c,i) => (
                      <div key={c.country} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 20px', borderBottom: i<byCountry2.slice(0,8).length-1?'1px solid rgba(255,255,255,.04)':'none' }}>
                        <span style={{ fontSize:15, width:24, textAlign:'center', flexShrink:0 }}>{i===0?'🥇':i===1?'🥈':i===2?'🥉':<span style={{fontSize:11,color:'rgba(255,255,255,.25)'}}>{i+1}</span>}</span>
                        <span style={{ flex:1, fontSize:13, fontWeight:700 }}>{c.country}</span>
                        <span style={{ fontSize:11, color:'rgba(255,255,255,.3)' }}>{c.times} times</span>
                        <span style={{ fontSize:20, fontWeight:900, color:YELLOW, letterSpacing:-1 }}>{c.athletes}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── VENUE ── */}
              {campView === 'venue' && (
                <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                  {/* Mapa aéreo */}
                  <div style={glass({ padding:'22px', overflow:'hidden' })}>
                    <div style={sectionHead}>📍 Local do evento</div>
                    <div style={{ borderRadius:14, overflow:'hidden', marginBottom:14 }}>
                      <VenueMap />
                    </div>
                    <a href="https://maps.google.com/?q=Leme,SP,Brasil" target="_blank" rel="noreferrer" style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'9px 18px', borderRadius:10, background:`${ACCENT}18`, color:ACCENT, fontSize:12, fontWeight:800, textDecoration:'none', border:`1px solid ${ACCENT}30`, marginBottom:10 }}>
                      🌍 Ver no Google Maps
                    </a>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                      {[['🅿️','Estacionamento','Amplo estacionamento gratuito no venue'],['🍽️','Alimentação','Praça de alimentação com opções variadas no local'],['🚿','Vestiários','Vestiários com chuveiros para todos os times']].map(([ico,titulo,txt]) => (
                        <div key={titulo} style={{ padding:'14px', borderRadius:12, background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.07)' }}>
                          <div style={{ fontSize:22, marginBottom:6 }}>{ico}</div>
                          <div style={{ fontSize:12, fontWeight:800, marginBottom:4 }}>{titulo}</div>
                          <div style={{ fontSize:11, color:'rgba(255,255,255,.4)', lineHeight:1.5 }}>{txt}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Mapa do evento */}
                  <div style={glass({ padding:'22px' })}>
                    <div style={sectionHead}>🗺️ Mapa do evento</div>
                    <VenueMap />
                    <div style={{ display:'flex', flexDirection:'column', gap:8, marginTop:14 }}>
                      {[['🏥','Suporte médico','Equipe médica e posto de primeiros socorros em todos os dias'],['🔥','Aquecimento','Área de aquecimento disponível 45 min antes de cada jogo'],['🎤','Cerimônias','Palco principal para abertura, encerramento e premiações']].map(([ico,titulo,txt]) => (
                        <div key={titulo} style={{ display:'flex', gap:12, padding:'12px 14px', borderRadius:12, background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.06)' }}>
                          <span style={{ fontSize:20, flexShrink:0 }}>{ico}</span>
                          <div><div style={{ fontSize:12, fontWeight:800, marginBottom:3 }}>{titulo}</div><div style={{ fontSize:11, color:'rgba(255,255,255,.4)', lineHeight:1.5 }}>{txt}</div></div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Hospedagem */}
                  <div style={glass({ padding:'22px' })}>
                    <div style={sectionHead}>🏨 Hospedagem & Transfer</div>
                    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                      {[['🏨','Hotéis & Voos','Nossa agência parceira Blue Panda Travel entrará em contato com as equipes confirmadas. Dúvidas: contato@bluepandatravel.com.br'],['🚌','Transfer oficial','Transfer gratuito no dia 30/10, partindo de Guarulhos (GRU) com parada em Viracopos (VCP): 08h00 · 15h00 · 23h00.'],['🗺️','Guia do participante','Restaurantes, farmácias, bancos e dicas locais de Leme/SP no guia digital.']].map(([ico,titulo,txt]) => (
                        <div key={titulo} style={{ display:'flex', gap:12, padding:'14px', borderRadius:12, background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.06)' }}>
                          <span style={{ fontSize:22, flexShrink:0 }}>{ico}</span>
                          <div><div style={{ fontSize:13, fontWeight:800, marginBottom:4 }}>{titulo}</div><div style={{ fontSize:12, color:'rgba(255,255,255,.4)', lineHeight:1.6 }}>{txt}</div></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── TIMES ── */}
              {campView === 'times' && (
                <div>
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:14 }}>
                    {[{k:'all',l:'Todos'},{k:'masculino',l:'Masculino'},{k:'feminino',l:'Feminino'},{k:'sub-15',l:'Sub-15'},{k:'sub-12',l:'Sub-12'}].map(c => (
                      <button key={c.k} onClick={() => setCatFilter(c.k)} style={{ padding:'7px 14px', borderRadius:9, border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:12, fontWeight:800, transition:'all .15s', background:catFilter===c.k?YELLOW:'rgba(255,255,255,.06)', color:catFilter===c.k?'#031020':'rgba(255,255,255,.4)' }}>{c.l}</button>
                    ))}
                  </div>
                  <div style={glass({ overflow:'hidden', padding:0 })}>
                    {loadingTeams
                      ? <div style={{ padding:40, textAlign:'center', color:'rgba(255,255,255,.3)', fontSize:14 }}>Carregando...</div>
                      : filtered2.length===0
                        ? <div style={{ padding:40, textAlign:'center', color:'rgba(255,255,255,.2)', fontSize:13 }}>Nenhum time encontrado.</div>
                        : filtered2.sort((a,b)=>(parseInt(b.athletes_count)||0)-(parseInt(a.athletes_count)||0)).map((tm,i) => (
                          <div key={tm.id} style={{ display:'flex', alignItems:'center', gap:14, padding:'15px 20px', borderBottom:i<filtered2.length-1?'1px solid rgba(255,255,255,.05)':'none' }}>
                            <span style={{ fontSize:12, fontWeight:700, color:'rgba(255,255,255,.2)', width:24, textAlign:'right', flexShrink:0 }}>{i+1}</span>
                            <div style={{ flex:1, minWidth:0 }}>
                              <div style={{ fontSize:14, fontWeight:800, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{tm.club_name}</div>
                              <div style={{ fontSize:11, color:'rgba(255,255,255,.3)', marginTop:2 }}>{[tm.country, tm.city, tm.category].filter(Boolean).join(' · ')}</div>
                            </div>
                            <div style={{ textAlign:'right', flexShrink:0 }}>
                              <div style={{ fontSize:22, fontWeight:900, color:YELLOW, letterSpacing:-1, lineHeight:1 }}>{tm.athletes_count||'—'}</div>
                              <div style={{ fontSize:9, color:'rgba(255,255,255,.25)', textTransform:'uppercase', letterSpacing:1 }}>atletas</div>
                            </div>
                          </div>
                        ))
                    }
                  </div>
                </div>
              )}

            </div>
          );
        })()}
      </div>
      </div>{/* /zIndex wrapper */}
    </div>
  );
}
