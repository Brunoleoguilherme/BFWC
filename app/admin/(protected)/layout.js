import { getSupabaseServer } from '@/lib/supabaseServer';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import AdminShell from '../AdminShell';
import TopbarUser from '../TopbarUser';

export const metadata = { title: 'Admin — BFWC 2026' };

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

  return (
    <div style={{
      minHeight: '100vh', fontFamily: "'Inter', sans-serif",
      background: '#f1f5f9', color: '#0f172a',
    }}>
      <AdminShell
        role={profile.role}
        topbarContent={
          <TopbarUser name={profile.name} role={profile.role} initials={initials} />
        }
      >
        {children}
      </AdminShell>
    </div>
  );
}
