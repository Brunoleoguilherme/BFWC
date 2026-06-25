'use client';

import LogoutButton from './LogoutButton';

const ROLE_COLORS = {
  admin:      '#eab308',
  viewer:     '#60a5fa',
  blue_panda: '#60a5fa',
};

export default function TopbarUser({ name, role, initials }) {
  const roleColor = ROLE_COLORS[role] || '#f4ff00';
  const isBluePanda = role === 'blue_panda';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        background: roleColor,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, fontWeight: 900, color: '#031020', flexShrink: 0,
      }}>{initials}</div>
      {/* Name — hidden on mobile via CSS */}
      <span className="admin-topbar-username" style={{
        fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,.75)',
      }}>{name}</span>
      <span style={{
        fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase',
        color: roleColor, background: roleColor + '12',
        border: `1px solid ${roleColor}25`, borderRadius: 6, padding: '2px 8px',
        whiteSpace: 'nowrap',
      }}>{isBluePanda ? '🐼 BP' : role}</span>
      <LogoutButton />
    </div>
  );
}
