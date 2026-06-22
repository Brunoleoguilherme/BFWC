'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';

const CATS = [
  { label: 'Masculino', value: 'masculino' },
  { label: 'Feminino',  value: 'feminino'  },
  { label: 'Sub 12',    value: 'sub12'     },
  { label: 'Sub 15',    value: 'sub15'     },
];

const GROUPS = [
  {
    section: null,
    items: [
      { href: '/admin/dashboard', label: 'Dashboard', icon: '▦', matchPath: '/admin/dashboard' },
    ],
  },
  {
    section: 'CRM',
    items: [
      {
        href: '/admin/teams',
        label: 'Pré-inscritos',
        icon: '○',
        matchPath: '/admin/teams',
        matchStatus: 'pre_inscrito',
        color: '#a855f7',
        withCats: true,
      },
      {
        href: '/admin/teams?status=inscricao_confirmada',
        label: 'Confirmados',
        icon: '✓',
        matchPath: '/admin/teams',
        matchStatus: 'inscricao_confirmada',
        color: '#20e33f',
        withCats: true,
      },
      {
        href: '/admin/teams?status=pendente_analise',
        label: 'Pendentes',
        icon: '⏳',
        matchPath: '/admin/teams',
        matchStatus: 'pendente_analise',
        color: '#f4ff00',
      },
      {
        href: '/admin/teams?status=em_revisao',
        label: 'Em Revisão',
        icon: '◎',
        matchPath: '/admin/teams',
        matchStatus: 'em_revisao',
        color: '#f97316',
      },
      {
        href: '/admin/athletes',
        label: 'Atletas',
        icon: '🏃',
        matchPath: '/admin/athletes',
        matchStatus: null,
        color: '#4d8aff',
        withCats: true,
      },
      {
        href: '/admin/teams?status=rejeitado',
        label: 'Rejeitados',
        icon: '✕',
        matchPath: '/admin/teams',
        matchStatus: 'rejeitado',
        color: '#ff4444',
      },
    ],
  },
  {
    section: 'E-mail',
    items: [
      { href: '/admin/crm', label: 'Comunicação', icon: '✉', matchPath: '/admin/crm', matchStatus: null },
    ],
  },
  {
    section: 'Blue Panda',
    items: [
      { href: '/admin/blue-panda',     label: 'Logística & Hospedagem', icon: '🐼', matchPath: '/admin/blue-panda',     matchStatus: null, color: '#4d8aff' },
      { href: '/admin/blue-panda/crm', label: 'Pipeline de Vendas',     icon: '📋', matchPath: '/admin/blue-panda/crm', matchStatus: null, color: '#20e33f' },
    ],
  },
  {
    section: 'Dados',
    items: [
      { href: '/admin/import', label: 'Importar Time', icon: '＋', matchPath: '/admin/import', matchStatus: null },
    ],
  },
  {
    section: 'Sistema',
    items: [
      { href: '/admin/users', label: 'Usuários', icon: '👤', matchPath: '/admin/users', matchStatus: null },
    ],
  },
];

export default function Sidebar({ role = 'admin' }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentStatus = searchParams.get('status');
  const currentCat = searchParams.get('category');

  // Blue Panda users only see the Blue Panda section
  const visibleGroups = role === 'blue_panda'
    ? GROUPS.filter(g => g.section === 'Blue Panda')
    : GROUPS;

  // Track which items are expanded
  const [expanded, setExpanded] = useState({});

  function isActive(item) {
    if (pathname !== item.matchPath) return false;
    if (item.matchStatus === null && item.matchPath === '/admin/teams') return currentStatus === null;
    if (item.matchStatus === null) return true;
    return currentStatus === item.matchStatus;
  }

  function toggleExpand(label) {
    setExpanded(e => ({ ...e, [label]: !e[label] }));
  }

  const linkBase = (active, color) => ({
    display: 'flex', alignItems: 'center', gap: 9,
    padding: '8px 12px', borderRadius: 9,
    fontSize: 12.5, fontWeight: active ? 700 : 500,
    color: active ? '#fff' : 'rgba(255,255,255,.42)',
    textDecoration: 'none',
    background: active ? (color ? color + '12' : 'rgba(244,255,0,.08)') : 'transparent',
    border: active ? `1px solid ${color ? color + '28' : 'rgba(244,255,0,.18)'}` : '1px solid transparent',
    transition: 'all .15s',
    cursor: 'pointer',
  });

  return (
    <aside style={{
      width: 222, flexShrink: 0,
      minHeight: 'calc(100vh - 58px)',
      padding: '18px 12px',
      borderRight: '1px solid rgba(255,255,255,.06)',
      background: 'rgba(3,16,32,.4)',
      fontFamily: "'Inter', sans-serif",
      display: 'flex', flexDirection: 'column',
      overflowY: 'auto',
    }}>
      {visibleGroups.map(({ section, items }, gi) => (
        <div key={gi} style={{ marginBottom: 16 }}>
          {section && (
            <div style={{
              fontSize: 9.5, fontWeight: 800, letterSpacing: 2,
              textTransform: 'uppercase', color: 'rgba(255,255,255,.2)',
              padding: '0 12px', marginBottom: 5,
            }}>{section}</div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {items.map((item, i) => {
              const active = isActive(item);
              const isExpanded = expanded[item.label] ?? active;
              const hasCats = item.withCats;

              return (
                <div key={i}>
                  {/* Main link row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Link href={item.href} style={{ ...linkBase(active, item.color), flex: 1 }}>
                      <span style={{ fontSize: 12, opacity: active ? 1 : 0.45, flexShrink: 0 }}>{item.icon}</span>
                      <span style={{ flex: 1 }}>{item.label}</span>
                      {active && (
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: item.color || '#f4ff00', flexShrink: 0 }} />
                      )}
                    </Link>
                    {hasCats && (
                      <button
                        onClick={() => toggleExpand(item.label)}
                        style={{
                          width: 22, height: 22, flexShrink: 0, borderRadius: 6,
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: 'rgba(255,255,255,.25)', fontSize: 10,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'transform .2s',
                          transform: isExpanded ? 'rotate(180deg)' : 'none',
                        }}
                      >▾</button>
                    )}
                  </div>

                  {/* Category sub-items */}
                  {hasCats && isExpanded && (
                    <div style={{ paddingLeft: 22, marginTop: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {CATS.map(cat => {
                        const catHref = item.matchStatus
                          ? `/admin/teams?status=${item.matchStatus}&category=${cat.value}`
                          : item.matchPath === '/admin/athletes'
                          ? `/admin/athletes?category=${cat.value}`
                          : `/admin/teams?category=${cat.value}`;
                        const catActive = active && currentCat === cat.value;
                        return (
                          <Link key={cat.value} href={catHref} style={{
                            ...linkBase(catActive, item.color),
                            fontSize: 11.5,
                            padding: '6px 10px',
                          }}>
                            <span style={{ width: 4, height: 4, borderRadius: '50%', background: catActive ? (item.color || '#f4ff00') : 'rgba(255,255,255,.2)', flexShrink: 0 }} />
                            {cat.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div style={{ marginTop: 'auto', paddingTop: 14, borderTop: '1px solid rgba(255,255,255,.05)' }}>
        <p style={{ fontSize: 9.5, color: 'rgba(255,255,255,.15)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 }}>BFWC 2026 Admin</p>
        <p style={{ fontSize: 9.5, color: 'rgba(255,255,255,.1)' }}>v1.0</p>
      </div>
    </aside>
  );
}
