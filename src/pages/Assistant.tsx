import { useEffect, useRef, useState } from 'react'
import type { ChatMessage } from '@/types'
import { askAssistant } from '@/lib/assistant/engine'
import { useAuth } from '@/context/AuthContext'
import { KEYS, read, write } from '@/lib/storage/db'
import { logAudit } from '@/lib/audit/log'
import { uuid } from '@/lib/crypto'
import { EmergencyBanner } from '@/components/Disclaimer'
import { Spinner } from '@/components/ui'
import { Send, Sparkles, Bot, User as UserIcon, Trash2, BookOpen } from 'lucide-react'

const SUGGESTIONS = [
  'How can I wind down for better sleep?',
  'Tell me about ashwagandha',
  'Is turmeric safe with blood thinners?',
  'Gentle ideas for occasional bloating',
]

function loadChats(userId: string): ChatMessage[] {
  const store = read<Record<string, ChatMessage[]>>(KEYS.chats, {})
  return store[userId] ?? []
}
function saveChats(userId: string, msgs: ChatMessage[]) {
  const store = read<Record<string, ChatMessage[]>>(KEYS.chats, {})
  store[userId] = msgs.slice(-50)
  write(KEYS.chats, store)
}

function renderContent(text: string) {
  // Minimal markdown: **bold**, *italic*, line breaks, bullets.
  return text.split('\n').map((line, i) => {
    const bulleted = line.trim().startsWith('•')
    const html = line
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
    return (
      <p
        key={i}
        className={bulleted ? 'pl-3 -indent-3' : ''}
        dangerouslySetInnerHTML={{ __html: html || '&nbsp;' }}
      />
    )
  })
}

export function Assistant() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (user) setMessages(loadChats(user.id))
  }, [user])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, busy])

  const send = async (text: string) => {
    if (!text.trim() || busy || !user) return
    const userMsg: ChatMessage = { id: uuid(), role: 'user', content: text.trim(), createdAt: new Date().toISOString() }
    const next = [...messages, userMsg]
    setMessages(next)
    setInput('')
    setBusy(true)
    logAudit('assistant.query', { userId: user.id, actorEmail: user.email, meta: { length: text.length } })

    const reply = await askAssistant(text.trim(), next)
    const botMsg: ChatMessage = {
      id: uuid(),
      role: 'assistant',
      content: reply.content,
      createdAt: new Date().toISOString(),
      sources: reply.sources,
      triage: reply.triage.blockRecommendations ? reply.triage : undefined,
    }
    const updated = [...next, botMsg]
    setMessages(updated)
    saveChats(user.id, updated)
    setBusy(false)
  }

  const clear = () => {
    if (!user) return
    setMessages([])
    saveChats(user.id, [])
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold text-sage-900">
            <Sparkles className="h-6 w-6 text-turmeric-500" /> Wellness assistant
          </h1>
          <p className="text-sm text-sage-500">Grounded in the knowledge base. Never diagnoses or prescribes.</p>
        </div>
        {messages.length > 0 && (
          <button onClick={clear} className="btn-ghost text-sage-500">
            <Trash2 className="h-4 w-4" /> Clear
          </button>
        )}
      </div>

      <div ref={scrollRef} className="card flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-sage-100 text-sage-600">
              <Bot className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-semibold text-sage-900">Ask me about Ayurvedic wellness</h3>
            <p className="mt-1 max-w-sm text-sm text-sage-500">
              I can explain herbs, share gentle lifestyle ideas, and always keep safety first.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)} className="chip-off">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div
              className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${
                m.role === 'user' ? 'bg-sage-600 text-white' : 'bg-turmeric-100 text-turmeric-700'
              }`}
            >
              {m.role === 'user' ? <UserIcon className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>
            <div className={`max-w-[85%] ${m.role === 'user' ? 'items-end' : ''}`}>
              <div
                className={`space-y-1.5 rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  m.role === 'user' ? 'bg-sage-600 text-white' : 'border border-sage-100 bg-white text-sage-800'
                }`}
              >
                {renderContent(m.content)}
              </div>
              {m.triage && (
                <div className="mt-2">
                  <EmergencyBanner triage={m.triage} />
                </div>
              )}
              {m.sources && m.sources.length > 0 && (
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <span className="text-xs text-sage-400">
                    <BookOpen className="mr-1 -mt-0.5 inline h-3 w-3" /> Sources:
                  </span>
                  {m.sources.map((s) => (
                    <span key={s.id} className="rounded-md bg-sage-100 px-2 py-0.5 text-xs font-medium text-sage-600">
                      {s.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {busy && (
          <div className="flex gap-3">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-turmeric-100 text-turmeric-700">
              <Bot className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 rounded-2xl border border-sage-100 bg-white px-4 py-3 text-sm text-sage-400">
              <Spinner className="h-4 w-4" /> Thinking…
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          send(input)
        }}
        className="mt-4 flex items-end gap-2"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              send(input)
            }
          }}
          rows={1}
          placeholder="Ask about a herb, symptom, or lifestyle idea…"
          className="input max-h-32 flex-1 resize-none"
        />
        <button type="submit" disabled={busy || !input.trim()} className="btn-primary h-[46px] px-4">
          <Send className="h-4 w-4" />
        </button>
      </form>
      <p className="mt-2 text-center text-xs text-sage-400">
        Educational information only · not a substitute for professional medical advice.
      </p>
    </div>
  )
}
