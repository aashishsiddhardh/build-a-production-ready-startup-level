import type { ChatMessage, Herb, TriageResult } from '@/types'
import { HERBS } from '@/data/herbs'
import { runTriage } from '@/lib/safety/triage'
import { retrieve } from '@/lib/recommend/retrieval'
import { EVIDENCE_LABEL } from '@/lib/recommend/scoring'
import { extractConcepts, normalize } from '@/lib/text'

// ─────────────────────────────────────────────────────────────────────────────
// Conversational assistant.
//
// SAFETY MODEL: the assistant is grounded ONLY in the local knowledge base and
// runs the same deterministic triage gate on every message. It never diagnoses,
// prescribes, promises cures, or invents citations. When an LLM key is present
// it is used ONLY to phrase an answer around retrieved, verified facts — with a
// strict system prompt — and any failure falls back to the on-device responder.
// ─────────────────────────────────────────────────────────────────────────────

const GENERIC_DISCLAIMER =
  'This is general educational information, not medical advice — please check with a qualified clinician, especially regarding medications, pregnancy, or ongoing conditions.'

function findHerbMentions(text: string): Herb[] {
  const norm = normalize(text)
  const out: Herb[] = []
  for (const h of HERBS) {
    const names = [h.name, h.sanskrit, h.latin]
      .map((n) => normalize(n))
      .filter((n) => n && n !== '—')
    if (names.some((n) => n.length > 2 && norm.includes(n))) out.push(h)
  }
  return out
}

function describeHerb(h: Herb): string {
  const lines: string[] = []
  lines.push(`**${h.name}** (*${h.latin}*) — ${h.summary}`)
  lines.push(`• Traditionally used for: ${h.indications.map((i) => i.replace(/_/g, ' ')).join(', ')}.`)
  lines.push(`• Evidence: ${EVIDENCE_LABEL[h.evidenceLevel].toLowerCase()} — ${h.evidenceNote}`)
  lines.push(`• Typical form: ${h.typicalForm}`)
  lines.push(`• Safety: ${h.safetyNotes}`)
  if (h.drugInteractions.length) {
    lines.push(
      `• Watch for interactions with: ${h.drugInteractions.map((d) => d.drugClass.toLowerCase()).join('; ')}.`,
    )
  }
  return lines.join('\n')
}

function emergencyReply(triage: TriageResult): string {
  const rule = triage.matched[0]
  const lines = [
    '⚠️ I need to pause our conversation about herbs here.',
    triage.message,
  ]
  if (rule) lines.push(`\n**${rule.title}:** ${rule.guidance}`)
  lines.push('\nOnce you are safe and have been evaluated, I’m glad to share general wellness information.')
  return lines.join('\n')
}

function symptomReply(message: string): { content: string; sources: { id: string; name: string }[] } {
  const concepts = extractConcepts(message)
  const hits = retrieve(concepts, { kind: 'herb', topK: 4 })
  if (hits.length === 0) {
    return {
      content:
        `I can share general Ayurvedic wellness information. Could you tell me a bit more about what you’re experiencing (for example: sleep, digestion, stress, energy, or skin)?\n\nFor a personalised, safety-checked set of suggestions, try the structured **Assessment** — it screens for contraindications and drug interactions based on your profile.\n\n${GENERIC_DISCLAIMER}`,
      sources: [],
    }
  }
  const top = hits.slice(0, 3)
  const names = top.map((h) => (h.doc.ref as Herb).name)
  const lines: string[] = []
  lines.push(
    `Based on what you described, some herbs traditionally associated with these concerns include **${names.join('**, **')}**. Here’s a quick, non-personalised overview:`,
  )
  for (const hit of top) {
    const h = hit.doc.ref as Herb
    lines.push(`\n${describeHerb(h)}`)
  }
  lines.push(
    `\nThese are general associations, not a recommendation for you specifically. The **Assessment** tool will check these against your conditions, medications, and constitution before suggesting anything.`,
  )
  lines.push(`\n${GENERIC_DISCLAIMER}`)
  return {
    content: lines.join('\n'),
    sources: top.map((h) => ({ id: h.doc.id, name: (h.doc.ref as Herb).name })),
  }
}

function isGreeting(norm: string): boolean {
  return /^(hi|hello|hey|namaste|good (morning|afternoon|evening)|thanks|thank you)\b/.test(norm)
}

function isSafetyQuestion(norm: string): boolean {
  return /(safe|interact|interaction|medication|medicine|drug|pregnan|breastfeed|contraindicat|side effect)/.test(
    norm,
  )
}

export interface AssistantReply {
  content: string
  sources: { id: string; name: string }[]
  triage: TriageResult
}

/** Fully on-device (no network) grounded responder. Always available. */
export function localAssistant(message: string): AssistantReply {
  const triage = runTriage({ freeText: message })
  if (triage.blockRecommendations || triage.level === 'emergency') {
    return { content: emergencyReply(triage), sources: [], triage }
  }

  const norm = normalize(message)

  if (isGreeting(norm) && norm.length < 40) {
    return {
      content:
        'Namaste 🙏 I’m your Ayurvedic wellness companion. I can explain herbs and formulations, share general lifestyle guidance, and help you think about balance for concerns like sleep, digestion, stress, energy, or skin.\n\nWhat would you like to explore? (I don’t diagnose or prescribe — for anything urgent, please see a clinician.)',
      sources: [],
      triage,
    }
  }

  const mentioned = findHerbMentions(message)
  if (mentioned.length) {
    const lines = mentioned.slice(0, 2).map(describeHerb)
    if (isSafetyQuestion(norm)) {
      lines.push(
        '\nFor your specific situation, run the **Assessment** so I can check contraindications and drug interactions against your profile before suggesting anything.',
      )
    }
    lines.push(`\n${GENERIC_DISCLAIMER}`)
    return {
      content: lines.join('\n'),
      sources: mentioned.slice(0, 2).map((h) => ({ id: h.id, name: h.name })),
      triage,
    }
  }

  if (isSafetyQuestion(norm)) {
    return {
      content:
        'Great question — safety first. I can’t clear a specific herb-and-medication combination for you here. The **Assessment** applies a deterministic safety layer that checks each herb against the conditions and medications you enter, and it will hide anything contraindicated.\n\nAs a rule: never stop a prescribed medication to take an herb, and always confirm combinations with your pharmacist or clinician.\n\n' +
        GENERIC_DISCLAIMER,
      sources: [],
      triage,
    }
  }

  const { content, sources } = symptomReply(message)
  return { content, sources, triage }
}

// ── Optional LLM phrasing layer (used only if a key is configured) ───────────

function apiKey(): string | undefined {
  const k = import.meta.env.VITE_OPENAI_API_KEY as string | undefined
  return k && k.trim() ? k.trim() : undefined
}

const SYSTEM_PROMPT = `You are AyurSage, a cautious Ayurvedic wellness educator.
Rules you must NEVER break:
- Never diagnose, prescribe, or promise cures.
- Never invent studies, citations, or evidence. Only use the CONTEXT provided.
- Never recommend stopping or changing prescribed medication.
- For any emergency or high-risk situation, tell the user to seek medical care and do not give herbal advice.
- Always include a brief reminder that this is general education, not medical advice.
- Keep answers grounded ONLY in the provided CONTEXT about herbs; if the context is empty, encourage using the structured Assessment.
Write warmly and concisely.`

export async function askAssistant(
  message: string,
  history: ChatMessage[],
): Promise<AssistantReply> {
  // Triage always runs locally first and can hard-stop the LLM path.
  const triage = runTriage({ freeText: message })
  if (triage.blockRecommendations || triage.level === 'emergency') {
    return { content: emergencyReply(triage), sources: [], triage }
  }

  const key = apiKey()
  if (!key) return localAssistant(message)

  // Build grounding context from local retrieval — the LLM only rephrases facts.
  const concepts = extractConcepts(message)
  const mentioned = findHerbMentions(message)
  const hits = retrieve(concepts, { kind: 'herb', topK: 4 })
  const contextHerbs = [...new Map([...mentioned, ...hits.map((h) => h.doc.ref as Herb)].map((h) => [h.id, h])).values()].slice(0, 5)
  const context = contextHerbs.map(describeHerb).join('\n\n') || '(no matching herbs in knowledge base)'
  const sources = contextHerbs.map((h) => ({ id: h.id, name: h.name }))

  const baseUrl = (import.meta.env.VITE_OPENAI_BASE_URL as string) || 'https://api.openai.com/v1'
  const model = (import.meta.env.VITE_OPENAI_MODEL as string) || 'gpt-4o-mini'

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model,
        temperature: 0.3,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...history.slice(-6).map((m) => ({ role: m.role, content: m.content })),
          { role: 'user', content: `CONTEXT:\n${context}\n\nUSER QUESTION: ${message}` },
        ],
      }),
    })
    if (!res.ok) throw new Error(`LLM ${res.status}`)
    const data = await res.json()
    const content = data?.choices?.[0]?.message?.content?.trim()
    if (!content) throw new Error('empty LLM response')
    return { content, sources, triage }
  } catch {
    // Graceful degradation — the on-device responder always works.
    return localAssistant(message)
  }
}
