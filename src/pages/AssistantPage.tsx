import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { store } from '@/lib/storage';
import { logAudit } from '@/lib/audit';
import { generateAssistantReply, ASSISTANT_STARTERS } from '@/engine/assistant';
import type { ChatMessage } from '@/lib/types';
import { uid } from '@/lib/id';
import { cn } from '@/lib/cn';
import {
  Send,
  MessageCircleHeart,
  ShieldAlert,
  HeartPulse,
  Sparkles,
  BookOpen,
  Trash2,
} from 'lucide-react';

export default function AssistantPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) setMessages(store.getChats(user.id));
  }, [user]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const persist = (next: ChatMessage[]) => {
    setMessages(next);
    if (user) store.saveChats(user.id, next);
  };

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || typing) return;
    const userMsg: ChatMessage = { id: uid('msg'), role: 'user', content: trimmed, ts: new Date().toISOString() };
    const withUser = [...messages, userMsg];
    persist(withUser);
    setInput('');
    setTyping(true);

    if (user) logAudit('assistant.query', user, { len: trimmed.length });

    // Deterministic guardrails + RAG composition (simulated latency for UX).
    setTimeout(() => {
      const reply = generateAssistantReply(trimmed, { userName: user?.name.split(' ')[0] });
      persist([...withUser, reply]);
      setTyping(false);
    }, 500);
  };

  const clearChat = () => {
    persist([]);
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-4xl flex-col px-4 py-6 sm:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sage-700 text-white">
            <MessageCircleHeart className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-semibold text-ink-900">AI wellness assistant</h1>
            <p className="text-xs text-ink-500">Grounded in the knowledge base · safety guardrails always on</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button onClick={clearChat} className="btn-ghost text-sm text-ink-500">
            <Trash2 className="h-4 w-4" /> Clear
          </button>
        )}
      </div>

      <div className="mt-4 flex-1 overflow-y-auto rounded-2xl border border-sage-100 bg-white p-4 sm:p-6">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sage-100 text-sage-700">
              <Sparkles className="h-7 w-7" />
            </div>
            <h2 className="mt-4 font-serif text-xl font-semibold text-ink-900">How can I help today?</h2>
            <p className="mt-1 max-w-md text-sm text-ink-500">
              Ask about herbs, evidence, or gentle wellness practices. I won't diagnose, prescribe, or ever advise
              changing your medication.
            </p>
            <div className="mt-6 grid w-full max-w-lg gap-2 sm:grid-cols-2">
              {ASSISTANT_STARTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-xl border border-sage-200 bg-sage-50/50 p-3 text-left text-sm text-ink-700 transition hover:border-sage-300 hover:bg-sage-50"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}
            {typing && (
              <div className="flex items-center gap-2 text-sm text-ink-400">
                <span className="flex gap-1">
                  <Dot /> <Dot delay="150ms" /> <Dot delay="300ms" />
                </span>
                AyurSage is thinking…
              </div>
            )}
            <div ref={endRef} />
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="mt-3 flex items-center gap-2"
      >
        <input
          className="input flex-1"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about a herb, symptom, or practice…"
        />
        <button type="submit" className="btn-primary" disabled={!input.trim() || typing}>
          <Send className="h-4 w-4" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
      <p className="mt-2 text-center text-xs text-ink-400">
        In an emergency, contact your local emergency services. This assistant provides general education, not medical
        advice.
      </p>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div className={cn('max-w-[85%] space-y-2', isUser ? 'items-end' : 'items-start')}>
        {message.safetyBanner && message.safetyBanner !== 'general' && <SafetyBanner kind={message.safetyBanner} />}
        <div
          className={cn(
            'rounded-2xl px-4 py-3 text-sm leading-relaxed',
            isUser
              ? 'rounded-br-sm bg-sage-700 text-white'
              : 'rounded-bl-sm border border-sage-100 bg-sage-50/60 text-ink-800',
          )}
        >
          <FormattedText text={message.content} />
        </div>
        {message.citations && message.citations.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {message.citations.map((c, i) =>
              c.herbId ? (
                <Link
                  key={i}
                  to={`/knowledge/${c.herbId}`}
                  className="inline-flex items-center gap-1 rounded-full border border-sage-200 bg-white px-2.5 py-1 text-xs font-medium text-sage-700 hover:border-sage-300"
                >
                  <BookOpen className="h-3 w-3" /> {c.label}
                </Link>
              ) : (
                <span key={i} className="chip border-sage-200 bg-white text-ink-500">{c.label}</span>
              ),
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SafetyBanner({ kind }: { kind: 'emergency' | 'medication' }) {
  if (kind === 'emergency') {
    return (
      <div className="flex items-center gap-2 rounded-xl border-2 border-clay-400 bg-clay-50 px-3 py-2 text-sm font-semibold text-clay-800">
        <HeartPulse className="h-4 w-4" /> Possible emergency — please seek immediate care
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 rounded-xl border border-turmeric-300 bg-turmeric-50 px-3 py-2 text-sm font-semibold text-turmeric-800">
      <ShieldAlert className="h-4 w-4" /> Medication safety
    </div>
  );
}

function FormattedText({ text }: { text: string }) {
  // Lightweight markdown-ish rendering: **bold** and line breaks.
  const lines = text.split('\n');
  return (
    <>
      {lines.map((line, i) => (
        <p key={i} className={cn(line.trim() === '' ? 'h-2' : 'whitespace-pre-wrap')}>
          {line.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
            part.startsWith('**') && part.endsWith('**') ? (
              <strong key={j}>{part.slice(2, -2)}</strong>
            ) : (
              <span key={j}>{part}</span>
            ),
          )}
        </p>
      ))}
    </>
  );
}

function Dot({ delay = '0ms' }: { delay?: string }) {
  return (
    <span
      className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-sage-400"
      style={{ animationDelay: delay }}
    />
  );
}
