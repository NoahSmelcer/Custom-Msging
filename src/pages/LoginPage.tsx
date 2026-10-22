import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'

export function LoginPage() {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false)
  const signIn = async (e: FormEvent) => { e.preventDefault(); if (!supabase) return; setBusy(true); setError(''); const { error } = await supabase.auth.signInWithPassword({ email, password }); setBusy(false); if (error) setError(error.message) }
  return <main className="login-page"><section className="login-card"><div className="large-mark">♥</div><p className="eyebrow">WELCOME HOME</p><h1>Our Family</h1><p className="intro">A quiet, private place to keep in touch.</p><form onSubmit={signIn}><label>Email<input type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required /></label><label>Password<input type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required /></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="primary" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button></form><p className="login-note">Your family administrator sets up accounts. There is no public sign-up.</p></section></main>
}
