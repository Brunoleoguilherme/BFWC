import { getSupabaseServer } from '@/lib/supabaseServer';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import LogoutButton from '../LogoutButton';
import Sidebar from '../Sidebar';

export const metadata = { title: 'Admin — BFWC 2026' };

const ROLE_COLORS = {
  admin:      '#f4ff00',
  viewer:     '#4d8aff',
  blue_panda: '#4d8aff',
};

export default async function ProtectedLayout({ children }) {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/admin/login');

  const { data: profile } = await supabase
    .from('admin_profiles')
    .select('name, role')
    .eq('id', user.id)
    .single();

  if (!profile) redirect('/admin/login?error=unauthorized');

  // Blue Panda users can only access /admin/blue-panda
  if (profile.role === 'blue_panda') {
    const headersList = await headers();
    const pathname = headersList.get('x-pathname') || '';
    if (pathname && !pathname.startsWith('/admin/blue-panda')) {
      redirect('/admin/blue-panda');
    }
  }

  const initials = profile.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'A';
  const roleColor = ROLE_COLORS[profile.role] || '#f4ff00';
  const isBluePanda = profile.role === 'blue_panda';

  const topbarStyle = {
    position: 'sticky', top: 0, zIndex: 100,
    height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 32px',
    background: 'rgba(3,16,32,.96)',
    borderBottom: '1px solid rgba(255,255,255,.07)',
    backdropFilter: 'blur(20px)',
    fontFamily: "'Inter', sans-serif",
  };

  return (
    <div style={{ minHeight: '100vh', background: '#031020', fontFamily: "'Inter', sans-serif", color: '#fff' }}>
      <header style={topbarStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <span style={{ fontSize: 16, fontWeight: 900, letterSpacing: -1, color: '#fff' }}>
            BFWC <span style={{ color: '#f4ff00' }}>2026</span>
          </span>
          <span style={{ width: 1, height: 20, background: 'rgba(255,255,255,.1)' }} />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,.3)' }}>
            {isBluePanda ? 'Blue Panda' : 'Painel Admin'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: roleColor,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 900, color: '#031020',
            }}>{initials}</div>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,.75)' }}>{profile.name}</span>
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase',
              color: roleColor, background: roleColor + '12',
              border: `1px solid ${roleColor}25`, borderRadius: 6, padding: '2px 8px',
            }}>{isBluePanda ? '🐼 Blue Panda' : profile.role}</span>
          </div>
          <LogoutButton />
        </div>
      </header>

      <div style={{ display: 'flex' }}>
        <Sidebar role={profile.role} />
        <main style={{ flex: 1, padding: '32px 36px', minWidth: 0 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
