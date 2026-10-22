import type { Message, Profile } from '../types'

export function MessageBubble({ message, profile, senderName, onRetry }: { message: Message; profile: Profile; senderName: string; onRetry: () => void }) {
  const mine = message.sender_id === profile.id
  const time = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(message.created_at))
  return <article className={`message-row ${mine ? 'mine' : ''}`}><div className="message-meta">{mine ? 'You' : senderName} · {time}</div><div className={`bubble ${mine ? 'sent' : 'received'} ${message.failed ? 'failed' : ''}`}>{message.body}</div>{message.pending && <span className="delivery">Sending…</span>}{message.failed && <button className="retry" onClick={onRetry}>Couldn’t send — retry</button>}</article>
}
