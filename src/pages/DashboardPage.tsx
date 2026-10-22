import { useEffect, useRef, useState } from 'react'
import type { Profile, Message } from '../types'
import { supabase } from '../lib/supabase'
import { AppHeader } from '../components/AppHeader'
import { MessageBubble } from '../components/MessageBubble'
import { MessageComposer } from '../components/MessageComposer'
import { QuickMessages } from '../components/QuickMessages'

const PAGE_SIZE = 40

export function DashboardPage({ profile, onSignOut }: { profile: Profile; onSignOut: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]); const [memberNames, setMemberNames] = useState<Record<string, string>>({}); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [online, setOnline] = useState(navigator.onLine); const [hasMore, setHasMore] = useState(false); const [sending, setSending] = useState(false); const listEnd = useRef<HTMLDivElement>(null)
  const markRead = async () => { await supabase?.from('message_reads').upsert({ user_id: profile.id, last_read_at: new Date().toISOString() }) }
  const load = async (older = false) => {
    if (!supabase) return
    setError(''); const before = older ? messages[0]?.created_at : undefined
    let query = supabase.from('messages').select('*').order('created_at', { ascending: false }).limit(PAGE_SIZE)
    if (before) query = query.lt('created_at', before)
    const { data, error } = await query
    if (error) { setError('Messages could not be loaded. Check your connection and try again.'); return }
    const page = (data ?? []).reverse() as Message[]
    setHasMore(page.length === PAGE_SIZE)
    setMessages(current => older ? [...page, ...current] : page)
    setLoading(false); void markRead()
  }
  useEffect(() => { void load(); if (supabase) void supabase.from('family_memberships').select('id, display_name').then(({ data }) => { if (data) setMemberNames(Object.fromEntries(data.map(member => [member.id, member.display_name]))) }); const updateOnline = () => setOnline(navigator.onLine); addEventListener('online', updateOnline); addEventListener('offline', updateOnline); const channel = supabase?.channel('family-messages').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => { const received = payload.new as Message; setMessages(current => current.some(m => m.id === received.id) ? current : [...current, received]); if (received.sender_id !== profile.id) void markRead() }).subscribe(); return () => { removeEventListener('online', updateOnline); removeEventListener('offline', updateOnline); if (channel) void supabase?.removeChannel(channel) } }, [])
  useEffect(() => { if (!loading) listEnd.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages.length, loading])
  const send = async (body: string) => {
    if (!supabase || sending || !online) return
    const optimistic: Message = { id: crypto.randomUUID(), sender_id: profile.id, body, created_at: new Date().toISOString(), pending: true }
    setMessages(current => [...current, optimistic]); setSending(true)
    const { data, error } = await supabase.from('messages').insert({ body }).select().single(); setSending(false)
    if (error) { setMessages(current => current.map(m => m.id === optimistic.id ? { ...m, pending: false, failed: true } : m)); return }
    // Realtime may have already inserted the server row before this response arrives.
    // Remove the temporary row and append the server row only when it is not present.
    setMessages(current => { const withoutOptimistic = current.filter(m => m.id !== optimistic.id); return withoutOptimistic.some(m => m.id === data.id) ? withoutOptimistic : [...withoutOptimistic, data as Message] })
  }
  const retry = (message: Message) => { setMessages(current => current.filter(m => m.id !== message.id)); void send(message.body) }
  return <main className="dashboard"><AppHeader profile={profile} unread={0} onSignOut={onSignOut}/>{!online && <div className="offline" role="status">You’re offline. Messages will send once you reconnect.</div>}<section className="conversation" aria-label="Family conversation"><div className="conversation-title"><div><p className="eyebrow">FAMILY CHAT</p><h2>Everyone’s here</h2></div><span className="secure">Private</span></div>{error && <div className="error-state"><p>{error}</p><button onClick={() => { setLoading(true); void load() }}>Try again</button></div>}{loading ? <div className="center-state">Loading messages…</div> : <><div className="messages">{hasMore && <button className="load-more" onClick={() => void load(true)}>Load earlier messages</button>}{messages.length === 0 && <div className="empty-state"><span>✦</span><h3>Start the conversation</h3><p>Send a message to let your family know you’re here.</p></div>}{messages.map(message => <MessageBubble key={message.id} message={message} profile={profile} senderName={memberNames[message.sender_id] ?? 'Family Member'} onRetry={() => retry(message)}/>) }<div ref={listEnd}/></div><QuickMessages onPick={send} disabled={sending || !online}/><MessageComposer onSend={send} disabled={sending || !online}/></>}</section></main>
}
