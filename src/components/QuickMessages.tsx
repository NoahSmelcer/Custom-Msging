const options = ["I'm ready.", 'Can you help me?', 'Please call me.', 'Where are you?', "I'm on my way."]
export function QuickMessages({ onPick, disabled }: { onPick: (text: string) => void; disabled: boolean }) { return <section className="quick"><p>Quick messages</p><div>{options.map(text => <button key={text} onClick={() => onPick(text)} disabled={disabled}>{text}</button>)}</div></section> }
