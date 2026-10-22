import { useState } from 'react'

export function MessageComposer({ onSend, disabled }: { onSend: (body: string) => void; disabled: boolean }) {
  const [body, setBody] = useState('')
  const submit = () => { const clean = body.trim(); if (clean && !disabled) { onSend(clean); setBody('') } }
  return <div className="composer"><textarea value={body} onChange={e => setBody(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() } }} placeholder="Write a message…" maxLength={1000} rows={1} aria-label="Message" disabled={disabled}/><button className="send-button" onClick={submit} disabled={disabled || !body.trim()}>{disabled ? 'Sending…' : 'Send'}</button></div>
}
