import type { Dosha } from '@/types'
import { KEYS, read, write } from '@/lib/storage/db'
import { analyzeDosha } from '@/lib/dosha/analyze'
import type { DoshaAnalysis } from '@/lib/dosha/analyze'

interface DoshaProfile {
  answers: Record<string, Dosha>
  savedAt: string
}

type DoshaStore = Record<string, DoshaProfile>

export function saveDoshaProfile(userId: string, answers: Record<string, Dosha>): void {
  const store = read<DoshaStore>(KEYS.dosha, {})
  store[userId] = { answers, savedAt: new Date().toISOString() }
  write(KEYS.dosha, store)
}

export function getDoshaProfile(userId: string): { answers: Record<string, Dosha>; analysis: DoshaAnalysis; savedAt: string } | null {
  const store = read<DoshaStore>(KEYS.dosha, {})
  const p = store[userId]
  if (!p) return null
  return { answers: p.answers, analysis: analyzeDosha(p.answers), savedAt: p.savedAt }
}

export function clearDoshaProfile(userId: string): void {
  const store = read<DoshaStore>(KEYS.dosha, {})
  delete store[userId]
  write(KEYS.dosha, store)
}
