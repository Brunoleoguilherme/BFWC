'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';

export default function AdminShell({ children, topbarContent, role }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar on navigation
  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .admin-topbar { padding: 0 16px !important; }
          .admin-topbar-title { display: none !important; }
          .admin-topbar-username { display: none !important; }
          .admin-sidebar-desktop { display: none !important; }
          .admin-main { padding: 20px 16px !important; }
          .hamburger { display: flex !important; }
        }
        @media (min-width: 769px) {
          .hamburger { display: none !important; }
          .admin-sidebar-overlay { display: none !important; }
        }
      `}</style>

      {/* Topbar */}
      <header className="admin-topbar" style={{
        position: 'sticky', top: 0, zIndex: 200, isolation: 'isolate',
        height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px',
        background: '#031020',
        borderBottom: '1px solid rgba(255,255,255,.08)',
        fontFamily: "'Inter', sans-serif",
      }}>
        {/* Left: hamburger + logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Hamburger — mobile only */}
          <button
            className="hamburger"
            onClick={() => setSidebarOpen(o => !o)}
            style={{
              display: 'none', // overridden by media query
              width: 36, height: 36, borderRadius: 10,
              background: sidebarOpen ? 'rgba(244,255,0,.1)' : 'rgba(255,255,255,.05)',
              border: `1px solid ${sidebarOpen ? 'rgba(244,255,0,.25)' : 'rgba(255,255,255,.1)'}`,
              alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexDirection: 'column', gap: 4, padding: '9px 8px',
              transition: 'all .2s',
            }}
            aria-label="Menu"
          >
            <span style={{ display: 'block', width: 16, height: 2, background: sidebarOpen ? '#f4ff00' : 'rgba(255,255,255,.7)', borderRadius: 2, transition: 'all .2s', transform: sidebarOpen ? 'translateY(5px) rotate(45deg)' : 'none' }} />
            <span style={{ display: 'block', width: 16, height: 2, background: sidebarOpen ? 'transparent' : 'rgba(255,255,255,.7)', borderRadius: 2, transition: 'all .2s' }} />
            <span style={{ display: 'block', width: 16, height: 2, background: sidebarOpen ? '#f4ff00' : 'rgba(255,255,255,.7)', borderRadius: 2, transition: 'all .2s', transform: sidebarOpen ? 'translateY(-5px) rotate(-45deg)' : 'none' }} />
          </button>

          {/* Logo */}
          <span style={{ fontSize: 16, fontWeight: 900, letterSpacing: -1, color: '#fff' }}>
            BFWC <span style={{ color: '#f4ff00' }}>2026</span>
          </span>
          {/* Divider + label — desktop only */}
          <span className="admin-topbar-title" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ width: 1, height: 20, background: 'rgba(255,255,255,.1)' }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,.3)' }}>
              {role === 'blue_panda' ? 'Blue Panda' : 'Painel Admin'}
            </span>
          </span>
        </div>

        {/* Right: user info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {topbarContent}
        </div>
      </header>

      {/* Body */}
      <div style={{ display: 'flex', position: 'relative', zIndex: 1 }}>
        {/* Sidebar — desktop */}
        <div className="admin-sidebar-desktop">
          <Sidebar role={role} />
        </div>

        {/* Sidebar overlay — mobile */}
        {sidebarOpen && (
          <div
            className="admin-sidebar-overlay"
            style={{
              position: 'fixed', inset: 0, zIndex: 150,
              display: 'flex',
            }}
          >
            {/* Backdrop */}
            <div
              onClick={() => setSidebarOpen(false)}
              style={{
                position: 'absolute', inset: 0,
                background: 'rgba(0,0,0,.7)',
                backdropFilter: 'blur(4px)',
              }}
            />
            {/* Sidebar panel */}
            <div style={{
              position: 'relative', zIndex: 1,
              width: 260, height: '100%',
              background: '#031020',
              borderRight: '1px solid rgba(255,255,255,.08)',
              overflowY: 'auto',
              animation: 'slideInLeft .2s ease',
            }}>
              {/* Mobile sidebar header */}
              <div style={{
                height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 16px', borderBottom: '1px solid rgba(255,255,255,.07)',
              }}>
                <span style={{ fontSize: 15, fontWeight: 900, letterSpacing: -0.5, color: '#fff' }}>
                  BFWC <span style={{ color: '#f4ff00' }}>2026</span>
                </span>
                <button
                  onClick={() => setSidebarOpen(false)}
                  style={{
                    width: 30, height: 30, borderRadius: 8,
                    background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)',
                    color: 'rgba(255,255,255,.5)', fontSize: 14, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >✕</button>
              </div>
              <Sidebar role={role} />
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="admin-main" style={{ flex: 1, padding: '32px 36px', minWidth: 0, overflowX: 'hidden', position: 'relative' }}>
          {/* Decorative hero — fixed to right edge, low opacity */}
          <div style={{
            position: 'fixed',
            right: 0, bottom: 0,
            width: '38vw', height: '80vh',
            backgroundImage: "url('/assets/hero-rio-athletes.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
            opacity: 0.35,
            pointerEvents: 'none',
            maskImage: 'linear-gradient(to left, rgba(0,0,0,.6) 0%, transparent 100%), linear-gradient(to top, rgba(0,0,0,.6) 0%, transparent 30%)',
            WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,.6) 0%, transparent 100%)',
            zIndex: 0,
          }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            {children}
          </div>
        </main>
      </div>

      <style>{`
        @keyframes slideInLeft {
          from { transform: translateX(-100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </>
  );
}
