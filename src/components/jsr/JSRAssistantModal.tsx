import { useEffect, useRef, useState } from 'react';
import { Sparkles, X, Send, Mic, Volume2 } from 'lucide-react';
import { useAuth } from '../../auth';
import { campusApi } from '../../api/campus';
import type { JSRAnswer } from '../../api/campus';
import { useVoice } from '../../hooks/useVoice';
import { Feedback, inputClass, buttonClass } from '../portal/PortalUI';

type Message = { id: string; role: 'user' | 'assistant'; content: string; response?: JSRAnswer };
export function JSRAssistantModal({ isOpen, onClose, initialQuery = '' }: { isOpen: boolean; onClose: () => void; initialQuery?: string }) {
  const { user } = useAuth();
  const [input, setInput] = useState(initialQuery);
  const [messages, setMessages] = useState<Message[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);
  const end = useRef<HTMLDivElement>(null);
  const voice = useVoice(setInput);
  const { stop, stopSpeech } = voice;
  useEffect(() => {
    if (isOpen) { setInput(initialQuery); dialog.current?.showModal(); }
    else { dialog.current?.close(); stop(); stopSpeech(); }
  }, [isOpen, initialQuery, stop, stopSpeech]);
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, [messages, busy]);
  async function send() {
    if (!input.trim() || busy || !user) return;
    const question = input.trim(); setBusy(true); setError(''); setInput('');
    const history = messages.slice(-6).map(m => ({ role: m.role, content: m.content.slice(0, 4000) }));
    setMessages(previous => [...previous, { id: crypto.randomUUID(), role: 'user', content: question }]);
    try {
      const response = await campusApi.mutate<JSRAnswer>('/jsr/chat', { message: question, history });
      setMessages(previous => [...previous, { id: crypto.randomUUID(), role: 'assistant', content: response.answer, response }]);
    } catch (err) { setError(err instanceof Error ? err.message : 'JSR is unavailable. Please try again.'); setInput(question); }
    finally { setBusy(false); }
  }
  return <dialog ref={dialog} onCancel={onClose} className="fixed m-auto w-[min(760px,95vw)] max-h-[90vh] rounded-2xl border border-cyan-500/25 bg-[#0A1019] text-slate-100 p-0 shadow-2xl backdrop:bg-black/70" aria-labelledby="jsr-title">
    <header className="p-5 border-b border-white/10 flex justify-between items-center"><div><h2 id="jsr-title" className="font-heading text-xl flex items-center gap-2"><Sparkles className="text-cyan-400 w-5" />JSR</h2><p className="text-xs text-slate-400">Justified Semantic Reasoning</p></div><button aria-label="Close JSR" className={buttonClass} onClick={onClose}><X className="w-4" /></button></header>
    <div className="p-5 space-y-4 max-h-[52vh] overflow-y-auto" aria-live="polite" role="log">
      {!user ? <p>Sign in to ask JSR about your authorized campus information.</p> : messages.length === 0 && <div className="space-y-3"><p className="text-slate-300">Ask about your published timetable, campus notices, faculty or approved institutional documents.</p><p className="text-xs text-slate-500">Answers identify their sources. JSR cannot make reservations or change institutional records.</p><div className="flex flex-wrap gap-2">{['What is my timetable?', 'What are the latest announcements?', 'What does Lumora mean?'].map(q => <button key={q} className={buttonClass} onClick={() => setInput(q)}>{q}</button>)}</div></div>}
      {messages.map(m => <article key={m.id} className={`rounded-xl p-4 border ${m.role === 'user' ? 'border-white/10 bg-white/5 ml-6' : 'border-cyan-500/20 mr-6'}`}><p className="text-xs text-cyan-300 mb-2">{m.role === 'user' ? 'You' : m.response?.kind === 'suggestion' ? 'JSR · AI suggestion' : m.response?.generated ? 'JSR · AI-generated answer — check the sources' : 'JSR · Information unavailable'}</p><p className="whitespace-pre-wrap text-sm leading-relaxed">{m.content}</p>
        {m.response?.sources.map(source => <details key={source.id} className="mt-3 text-xs text-slate-400"><summary className="cursor-pointer text-cyan-200">Source: {source.title}</summary><pre className="whitespace-pre-wrap break-words mt-2 font-sans">{source.text}</pre></details>)}
        {m.role === 'assistant' && <button className="text-xs text-cyan-200 mt-3" onClick={() => voice.speak(m.content)}><Volume2 className="inline w-3 mr-1" />Read aloud / replay</button>}
      </article>)}
      {busy && <p className="text-cyan-300 animate-pulse" role="status">Retrieving permitted sources and preparing an answer…</p>}<div ref={end} />
    </div>
    <form onSubmit={e => { e.preventDefault(); void send(); }} className="p-5 border-t border-white/10 space-y-3"><Feedback error={error || voice.error} />
      <label className="sr-only" htmlFor="jsr-question">Ask JSR</label><textarea id="jsr-question" autoFocus className={inputClass} rows={2} maxLength={2000} disabled={!user} value={input} onChange={e => setInput(e.target.value)} placeholder="Ask a campus question…" />
      <div className="flex flex-wrap gap-2"><button disabled={!user || busy || !input.trim()} className={buttonClass}><Send className="inline w-4 mr-2" />{busy ? 'Thinking…' : 'Send'}</button><button type="button" disabled={!user || !voice.supported} className={buttonClass} onClick={voice.listening ? voice.stop : voice.start}><Mic className="inline w-4 mr-2" />{voice.listening ? 'Stop microphone' : 'Use microphone'}</button><button type="button" className={buttonClass} onClick={voice.stopSpeech}>Stop speech</button></div>
      <p className="text-xs text-slate-500">{voice.supported ? 'Microphone use requires permission; your browser may send audio to its speech service.' : 'Speech recognition is not supported by this browser. Text chat remains available.'}</p>
    </form>
  </dialog>;
}
