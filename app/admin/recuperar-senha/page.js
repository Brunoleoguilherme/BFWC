'use client';

import { useState, useEffect, Suspense } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import '../admin.css';

function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();

  // verifying | ready | done | error
  const [phase, setPhase] = useState('verifying');
  const [msg, setMsg] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  // Valida o token do link e abre uma sessão de recuperação
  useEffect(() => {
    const token_hash = params.get('token_hash');
    const type = params.get('type') || 'recovery';
    if (!token_hash) {
      setPhase('error');
      setMsg('Link inválido ou incompleto. Peça um novo link de redefinição.');
      return;
    }
    (async () => {
      const { error } = await supabase.auth.verifyOtp({ type, token_hash });
      if (error) {
        setPhase('error');
        setMsg('Este link é inválido ou já expirou. Peça um novo link de redefinição.');
        return;
      }
      setPhase('ready');
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg('');
    if (password.length < 8) {
      setMsg('A senha deve ter no mínimo 8 caracteres.');
      return;
    }
    if (password !== confirm) {
      setMsg('As senhas não coincidem.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setMsg('Não foi possível salvar a nova senha. Tente novamente ou peça um novo link.');
      return;
    }
    setPhase('done');
    setTimeout(() => { router.push('/admin/login'); router.refresh(); }, 2500);
  }

  return (
    <div className="login-root">
      <div className="login-card" style={{ overflow: 'hidden', paddingTop: 0 }}>
        {/* Faixa de destaque — padrão admin escuro + amarelo */}
        <div style={{ height: 4, background: 'linear-gradient(90deg, #031020, #f4ff00, #031020)', margin: '0 -44px 36px', width: 'calc(100% + 88px)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, flexShrink: 0, border: '1.5px solid #e2e8f0', overflow: 'hidden' }}>
            <Image src="/assets/bfwc-logo.jpg" alt="BFWC" width={52} height={52} style={{ objectFit: 'cover' }} />
          </div>
          <div>
            <div className="login-badge" style={{ marginBottom: 4 }}>Área restrita</div>
            <h1 className="login-title" style={{ fontSize: 26, marginBottom: 0 }}>
              BFWC <span style={{ color: '#f4ff00', WebkitTextStroke: '0.5px #031020', textStroke: '0.5px #031020' }}>2026</span>
            </h1>
          </div>
        </div>
        <p className="login-sub" style={{ marginBottom: 28 }}>Redefinição de senha do painel</p>

        {phase === 'verifying' && (
          <div style={{ padding: '24px 0', textAlign: 'center', color: '#64748b', fontSize: 14 }}>
            Validando seu link...
          </div>
        )}

        {phase === 'error' && (
          <div>
            <div className="login-error" style={{ marginBottom: 20 }}>{msg}</div>
            <a href="/admin/login" className="login-btn"
              style={{ display: 'block', textAlign: 'center', textDecoration: 'none', background: '#f4ff00', color: '#031020' }}>
              Voltar ao login
            </a>
          </div>
        )}

        {phase === 'ready' && (
          <form onSubmit={handleSubmit}>
            <label className="login-label">Nova senha</label>
            <input
              className="login-input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              minLength={8}
              required
              autoFocus
            />
            <label className="login-label">Confirmar nova senha</label>
            <input
              className="login-input"
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="Repita a senha"
              minLength={8}
              required
            />
            {msg && <div className="login-error">{msg}</div>}
            <button className="login-btn" type="submit" disabled={loading}
              style={{ background: '#f4ff00', color: '#031020', boxShadow: '0 4px 18px rgba(244,255,0,.3)' }}>
              {loading ? 'Salvando...' : 'Salvar nova senha'}
            </button>
          </form>
        )}

        {phase === 'done' && (
          <div style={{ padding: '10px 0', textAlign: 'center' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0a7d28', marginBottom: 8 }}>Senha alterada com sucesso!</div>
            <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>Redirecionando para o login...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminResetPasswordPage() {
  return <Suspense><ResetForm /></Suspense>;
}
