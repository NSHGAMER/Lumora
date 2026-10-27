import { useCallback, useEffect, useRef, useState } from 'react';

interface RecognitionResult { results: { [index: number]: { [index: number]: { transcript: string } } } }
interface Recognition {
  lang: string; continuous: boolean; interimResults: boolean;
  onresult: ((event: RecognitionResult) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void; stop(): void; abort(): void;
}
type SpeechWindow = Window & { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };

export function useVoice(onTranscript: (value: string) => void) {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState('');
  const recognition = useRef<Recognition | null>(null);
  const transcript = useRef(onTranscript);
  useEffect(() => { transcript.current = onTranscript; }, [onTranscript]);
  const supported = Boolean((window as SpeechWindow).SpeechRecognition || (window as SpeechWindow).webkitSpeechRecognition);
  const stop = useCallback(() => { recognition.current?.stop(); setListening(false); }, []);
  const stopSpeech = useCallback(() => { window.speechSynthesis?.cancel(); }, []);
  function start() {
    const Constructor = (window as SpeechWindow).SpeechRecognition || (window as SpeechWindow).webkitSpeechRecognition;
    if (!Constructor) { setError('Speech recognition is unavailable in this browser. Please type your question.'); return; }
    if (!window.isSecureContext) { setError('Microphone input requires HTTPS or localhost.'); return; }
    recognition.current?.abort();
    const instance = new Constructor(); recognition.current = instance;
    instance.lang = navigator.language || 'en-IN'; instance.continuous = false; instance.interimResults = false;
    instance.onresult = event => transcript.current(event.results[0][0].transcript);
    instance.onerror = event => { setError(event.error === 'not-allowed' ? 'Microphone permission was denied. Allow it in browser settings or use text.' : `Voice input stopped (${event.error}). You can type your question.`); setListening(false); };
    instance.onend = () => setListening(false);
    setError('');
    try { instance.start(); setListening(true); } catch { setError('The microphone could not start. Please try again or use text.'); }
  }
  function speak(text: string) {
    if (!('speechSynthesis' in window)) { setError('Speech output is unavailable in this browser.'); return; }
    stopSpeech(); window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
  }
  useEffect(() => () => { recognition.current?.abort(); window.speechSynthesis?.cancel(); }, []);
  return { listening, error, supported, start, stop, speak, stopSpeech };
}
