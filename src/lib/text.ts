// Lightweight, dependency-free NLP helpers used by the retrieval and assistant
// layers. Kept deterministic and testable.

const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'be', 'been',
  'to', 'of', 'in', 'on', 'for', 'with', 'at', 'by', 'from', 'up', 'about', 'into',
  'i', 'me', 'my', 'we', 'our', 'you', 'your', 'it', 'this', 'that', 'these', 'those',
  'have', 'has', 'had', 'do', 'does', 'did', 'can', 'could', 'would', 'should', 'will',
  'am', 'so', 'if', 'then', 'than', 'also', 'just', 'get', 'got', 'feel', 'feeling',
  'some', 'any', 'more', 'very', 'really', 'been', 'having', 'help', 'need', 'want',
])

// Map common lay terms to canonical concept tokens so retrieval matches the KB.
const SYNONYMS: Record<string, string> = {
  sleepless: 'insomnia',
  sleeplessness: 'insomnia',
  'cant sleep': 'insomnia',
  'cannot sleep': 'insomnia',
  sleep: 'insomnia',
  tired: 'fatigue',
  tiredness: 'fatigue',
  exhausted: 'fatigue',
  exhaustion: 'fatigue',
  lethargy: 'fatigue',
  lethargic: 'fatigue',
  worried: 'anxiety',
  worry: 'anxiety',
  nervous: 'anxiety',
  restless: 'anxiety',
  stressed: 'stress',
  overwhelmed: 'stress',
  bloated: 'indigestion',
  bloating: 'indigestion',
  gas: 'indigestion',
  gassy: 'indigestion',
  gastric: 'indigestion',
  dyspepsia: 'indigestion',
  heartburn: 'acidity',
  acid: 'acidity',
  acidic: 'acidity',
  reflux: 'acidity',
  constipated: 'constipation',
  diarrhea: 'loose_stools',
  diarrhoea: 'loose_stools',
  focus: 'brain_fog',
  concentration: 'brain_fog',
  foggy: 'brain_fog',
  forgetful: 'brain_fog',
  memory: 'brain_fog',
  cold: 'congestion',
  stuffy: 'congestion',
  blocked: 'congestion',
  phlegm: 'congestion',
  mucus: 'congestion',
  sneezing: 'seasonal_allergy',
  allergies: 'seasonal_allergy',
  allergy: 'seasonal_allergy',
  cough: 'cough',
  coughing: 'cough',
  throat: 'sore_throat',
  immunity: 'low_immunity',
  immune: 'low_immunity',
  joints: 'joint_stiffness',
  joint: 'joint_stiffness',
  stiff: 'joint_stiffness',
  arthritis: 'joint_stiffness',
  ache: 'muscle_ache',
  aches: 'muscle_ache',
  sore: 'muscle_ache',
  skin: 'skin_breakouts',
  acne: 'skin_breakouts',
  pimples: 'skin_breakouts',
  rash: 'skin_breakouts',
  dry: 'dry_skin',
  cravings: 'sugar_cravings',
  sugar: 'sugar_cravings',
  bloat: 'water_retention',
  puffy: 'water_retention',
  headache: 'headache_tension',
  headaches: 'headache_tension',
  migraine: 'headache_tension',
  cramps: 'menstrual_cramps',
  period: 'menstrual_cramps',
  menstrual: 'menstrual_cramps',
  menopause: 'hot_flashes',
  hotflash: 'hot_flashes',
  nausea: 'nausea',
  nauseous: 'nausea',
  queasy: 'nausea',
  mood: 'low_mood',
  sad: 'low_mood',
  down: 'low_mood',
  appetite: 'low_appetite',
  energy: 'fatigue',
}

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/['’`]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function tokenize(text: string): string[] {
  const norm = normalize(text)
  if (!norm) return []
  const raw = norm.split(' ')
  const out: string[] = []
  for (const w of raw) {
    if (!w || STOPWORDS.has(w) || w.length < 2) continue
    out.push(SYNONYMS[w] ?? w)
  }
  return out
}

/** Expand a free-text query into canonical concept tokens, incl. multi-word synonyms. */
export function extractConcepts(text: string): string[] {
  const norm = normalize(text)
  const found = new Set<string>()
  for (const [phrase, concept] of Object.entries(SYNONYMS)) {
    if (phrase.includes(' ') && norm.includes(phrase)) found.add(concept)
  }
  for (const t of tokenize(text)) found.add(t)
  return [...found]
}
