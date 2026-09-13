import type { AssessmentInput, HistoryEntry, RecommendationResult } from '@/types'
import { KEYS, read, write } from '@/lib/storage/db'
import { uuid } from '@/lib/crypto'

const MAX_PER_USER = 100

export function getHistory(userId: string): HistoryEntry[] {
  return read<HistoryEntry[]>(KEYS.history, [])
    .filter((h) => h.userId === userId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
}

export function addHistory(
  userId: string,
  input: AssessmentInput,
  result: RecommendationResult,
): HistoryEntry {
  const all = read<HistoryEntry[]>(KEYS.history, [])
  const entry: HistoryEntry = {
    id: uuid(),
    userId,
    createdAt: new Date().toISOString(),
    input,
    result,
  }
  const userEntries = all.filter((h) => h.userId === userId)
  const others = all.filter((h) => h.userId !== userId)
  const trimmed = [entry, ...userEntries].slice(0, MAX_PER_USER)
  write(KEYS.history, [...others, ...trimmed])
  return entry
}

export function deleteHistoryEntry(userId: string, id: string): void {
  const all = read<HistoryEntry[]>(KEYS.history, [])
  write(
    KEYS.history,
    all.filter((h) => !(h.userId === userId && h.id === id)),
  )
}

export function clearHistory(userId: string): void {
  const all = read<HistoryEntry[]>(KEYS.history, [])
  write(
    KEYS.history,
    all.filter((h) => h.userId !== userId),
  )
}

export function allHistoryCount(): number {
  return read<HistoryEntry[]>(KEYS.history, []).length
}
