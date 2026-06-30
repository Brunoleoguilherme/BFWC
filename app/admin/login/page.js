'use client';

import { useState, Suspense } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import '../admin.css';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(
    params.get('error') === 'unauthorized' ? 'Acesso não autorizado para este e-mail.'
    : params.get('error') === 'pending' ? 'Sua solicitação de acesso ainda está aguardando aprovação de um administrador.'
    : ''
  );

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError('E-mail ou senha inválidos.');
      setLoading(false);
      return;
    }
    router.push('/admin');
    router.refresh();
  }

  return (
    <div className="login-root">
      <div className="login-card" style={{ overflow: 'hidden', paddingTop: 0 }}>
        {/* Accent stripe — admin dark + yellow */}
        <div style={{ height: 4, background: 'linear-gradient(90deg, #031020, #f4ff00, #031020)', margin: '0 -44px 36px', width: 'calc(100% + 88px)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, flexShrink: 0,
            border: '1.5px solid #e2e8f0', overflow: 'hidden',
          }}>
            <Image src="/assets/bfwc-logo.jpg" alt="BFWC" width={52} height={52} style={{ objectFit: 'cover' }} />
          </div>
          <div>
            <div className="login-badge" style={{ marginBottom: 4 }}>Área restrita</div>
            <h1 className="login-title" style={{ fontSize: 26, marginBottom: 0 }}>
              BFWC <span style={{ color: '#f4ff00', WebkitTextStroke: '0.5px #031020', textStroke: '0.5px #031020' }}>2026</span>
            </h1>
          </div>
        </div>
        <p className="login-sub" style={{ marginBottom: 28 }}>Painel de gestão de inscrições</p>

        <form onSubmit={handleSubmit}>
          <label className="login-label">E-mail</label>
          <input
            className="login-input"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="seu@email.com"
            required
          />
          <label className="login-label">Senha</label>
          <input
            className="login-input"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
          {error && <div className="login-error">{error}</div>}
          <button className="login-btn" type="submit" disabled={loading}
            style={{ background: '#f4ff00', color: '#031020', boxShadow: '0 4px 18px rgba(244,255,0,.3)' }}>
            {loading ? 'Entrando...' : 'Entrar no painel'}
          </button>
        </form>

        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <a href="/portal" style={{ fontSize: 12, color: '#94a3b8', textDecoration: 'none', transition: 'color .2s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#475569'}
            onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
          >← Voltar ao portal</a>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}
