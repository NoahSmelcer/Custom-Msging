import type { Profile } from '../types'

export function AppHeader({ profile, unread, onSignOut }: { profile: Profile; unread: number; onSignOut: () => void }) {
  return <header className="app-header"><div className="brand-mark" aria-hidden="true">♥</div><div><h1>Our Family</h1><p>Private family messages</p></div><div className="header-actions">{unread > 0 && <span className="unread-badge" aria-label={`${unread} unread messages`}>{unread}</span>}<details><summary aria-label="Open account menu">{profile.display_name.slice(0, 1).toUpperCase()}</summary><div className="profile-menu"><strong>{profile.display_name}</strong><span>{profile.role === 'admin' ? 'Family admin' : 'Family member'}</span><button onClick={onSignOut}>Sign out</button></div></details></div></header>
}
