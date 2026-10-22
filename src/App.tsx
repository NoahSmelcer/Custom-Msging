import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { configured, supabase } from './lib/supabase'
import type { Profile } from './types'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'

export default function App() {
  const [session, setSession] = useState<Session | null>(null); const [profile, setProfile] = useState<Profile | null>(null); const [ready, setReady] = useState(false); const [accessError, setAccessError] = useState('')
  useEffect(() => { if (!supabase) { setReady(true); return } void supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true) }); const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next)); return () => data.subscription.unsubscribe() }, [])
  useEffect(() => { if (!session || !supabase) { setProfile(null); return } const client = supabase; void client.from('family_memberships').select('id, display_name, role').eq('id', session.user.id).single().then(({ data, error }) => { if (error || !data) { setAccessError('This account is not authorized for Our Family.'); void client.auth.signOut() } else setProfile(data as Profile) }) }, [session])
  if (!configured) return <main className="setup-screen"><div><div className="large-mark">♥</div><h1>Our Family</h1><p>This app needs its Supabase connection before it can be used.</p><p>Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to a local <code>.env</code> file, then restart the app.</p></div></main>
  if (!ready) return <main className="setup-screen">Opening Our Family…</main>
  if (!session) return <LoginPage />
  if (accessError) return <main className="setup-screen"><div><h1>Access unavailable</h1><p>{accessError}</p></div></main>
  if (!profile) return <main className="setup-screen">Checking family access…</main>
  return <DashboardPage profile={profile} onSignOut={() => void supabase?.auth.signOut()} />
}
