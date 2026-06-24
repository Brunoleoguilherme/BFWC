'use client';

import { useState, Suspense } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter, useSearchParams } from 'next/navigation';
import '../admin.css';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(
    params.get('error') === 'unauthorized' ? 'Acesso não autorizado para este e-mail.' : ''
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
        <div className="login-glow" />
        <div className="login-card">
          <div className="login-badge">Área restrita</div>
          <h1 className="login-title">BFWC <span>2026</span></h1>
          <p className="login-sub">Painel de gestão de inscrições</p>

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
            <button className="login-btn" type="submit" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar no painel'}
            </button>
          </form>

          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <a href="/portal" style={{ fontSize: 12, color: 'rgba(255,255,255,.22)', textDecoration: 'none', letterSpacing: '.5px', transition: 'color .2s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,.5)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,.22)'}
            >← Voltar ao portal</a>
          </div>
        </div>
      </div>
  );
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}
