import { useMemo, useState } from 'react'
import type { AssessmentInput, Dosha } from '@/types'
import { SYMPTOMS, HEALTH_CONDITIONS, MEDICATIONS, WELLNESS_GOALS, DOSHA_LABELS } from '@/data/reference'
import { DOSHA_QUESTIONS } from '@/data/doshaQuestions'
import { analyzeDosha } from '@/lib/dosha/analyze'
import { runTriage } from '@/lib/safety/triage'
import { generateRecommendations } from '@/lib/recommend/engine'
import { addHistory } from '@/lib/storage/history'
import { saveDoshaProfile } from '@/lib/storage/profile'
import { logAudit } from '@/lib/audit/log'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { ResultsView } from '@/components/ResultsView'
import { EmergencyBanner } from '@/components/Disclaimer'
import { Spinner } from '@/components/ui'
import {
  ClipboardList,
  ShieldAlert,
  HeartPulse,
  Flower2,
  Target,
  ArrowRight,
  ArrowLeft,
  Check,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react'

// Emergency screening questions (keys == triage rule ids → matched deterministically).
const EMERGENCY_SCREEN: { key: string; label: string }[] = [
  { key: 'cardiac', label: 'Chest pain, pressure, or tightness' },
  { key: 'stroke', label: 'Sudden weakness, face drooping, or slurred speech' },
  { key: 'breathing', label: 'Severe difficulty breathing' },
  { key: 'anaphylaxis', label: 'Swelling of the throat or tongue' },
  { key: 'bleeding', label: 'Heavy/uncontrolled bleeding or vomiting blood' },
  { key: 'neuro', label: 'Fainting, seizure, or a sudden “worst-ever” headache' },
  { key: 'abdomen', label: 'Sudden, severe abdominal pain' },
  { key: 'mental_health', label: 'Thoughts of harming yourself' },
]

const STEPS = [
  { id: 'concern', label: 'Your concern', icon: ClipboardList },
  { id: 'safety', label: 'Safety screen', icon: ShieldAlert },
  { id: 'context', label: 'Health context', icon: HeartPulse },
  { id: 'dosha', label: 'Constitution', icon: Flower2 },
  { id: 'goals', label: 'Goals & review', icon: Target },
]

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={active ? 'chip-on' : 'chip-off'}>
      {active && <Check className="h-3.5 w-3.5" />}
      {children}
    </button>
  )
}

export function Assessment() {
  const { user } = useAuth()
  const { notify } = useToast()
  const [step, setStep] = useState(0)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<ReturnType<typeof generateRecommendations> | null>(null)

  const [symptoms, setSymptoms] = useState<string[]>([])
  const [freeText, setFreeText] = useState('')
  const [durationDays, setDurationDays] = useState(3)
  const [severity, setSeverity] = useState<1 | 2 | 3 | 4 | 5>(2)
  const [emergency, setEmergency] = useState<string[]>([])
  const [conditions, setConditions] = useState<string[]>([])
  const [medications, setMedications] = useState<string[]>([])
  const [pregnant, setPregnant] = useState(false)
  const [age, setAge] = useState(35)
  const [doshaAnswers, setDoshaAnswers] = useState<Record<string, Dosha>>({})
  const [goals, setGoals] = useState<string[]>([])

  const toggle = (arr: string[], set: (v: string[]) => void, key: string) =>
    set(arr.includes(key) ? arr.filter((k) => k !== key) : [...arr, key])

  const liveTriage = useMemo(
    () => runTriage({ redFlagSelections: emergency, freeText }),
    [emergency, freeText],
  )

  const doshaAnalysis = useMemo(() => analyzeDosha(doshaAnswers), [doshaAnswers])
  const symptomsBySystem = useMemo(() => {
    const map: Record<string, typeof SYMPTOMS> = {}
    for (const s of SYMPTOMS) (map[s.system] ??= []).push(s)
    return map
  }, [])

  const generate = () => {
    if (!user) return
    setBusy(true)
    const input: AssessmentInput = {
      // emergency rule keys share the symptom channel used by triage
      symptoms: [...symptoms, ...emergency],
      freeText,
      durationDays,
      severity,
      conditions,
      medications,
      pregnant,
      age,
      goals,
      doshaScores: Object.keys(doshaAnswers).length ? doshaAnalysis.scores : undefined,
    }
    // Simulate a brief compute for UX; logic itself is synchronous & deterministic.
    setTimeout(() => {
      const res = generateRecommendations(input)
      if (Object.keys(doshaAnswers).length) saveDoshaProfile(user.id, doshaAnswers)
      addHistory(user.id, input, res)
      logAudit(res.triage.blockRecommendations ? 'assessment.blocked_emergency' : 'assessment.run', {
        userId: user.id,
        actorEmail: user.email,
        meta: {
          symptomCount: symptoms.length,
          conditionCount: conditions.length,
          medicationCount: medications.length,
          triage: res.triage.level,
          results: res.recommendations.length,
        },
      })
      setResult(res)
      setBusy(false)
      notify(
        res.triage.blockRecommendations ? 'Safety guidance ready — please review.' : 'Your guidance is ready.',
        res.triage.blockRecommendations ? 'info' : 'success',
      )
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 450)
  }

  const reset = () => {
    setResult(null)
    setStep(0)
    setSymptoms([])
    setFreeText('')
    setEmergency([])
    setConditions([])
    setMedications([])
    setPregnant(false)
    setGoals([])
    setDoshaAnswers({})
  }

  if (result) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-turmeric-600">Assessment complete</p>
            <h1 className="text-3xl font-semibold text-sage-900">Your guidance</h1>
          </div>
          <button onClick={reset} className="btn-secondary">
            <RotateCcw className="h-4 w-4" /> New assessment
          </button>
        </div>
        <ResultsView result={result} />
      </div>
    )
  }

  const canProceed = step === 0 ? symptoms.length > 0 || freeText.trim().length > 3 : true

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-sage-900">Wellness assessment</h1>
        <p className="mt-1 text-sage-600">A few structured questions. Safety checks run automatically.</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex flex-1 items-center gap-1">
            <button
              onClick={() => i <= step && setStep(i)}
              className={`flex min-w-max items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                i === step
                  ? 'bg-sage-600 text-white'
                  : i < step
                    ? 'bg-sage-100 text-sage-700'
                    : 'bg-white text-sage-400'
              }`}
            >
              <s.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{s.label}</span>
            </button>
            {i < STEPS.length - 1 && <div className={`h-0.5 flex-1 ${i < step ? 'bg-sage-300' : 'bg-sage-100'}`} />}
          </div>
        ))}
      </div>

      <div className="card p-6 sm:p-8">
        {/* Step 0: concern */}
        {step === 0 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-xl font-semibold text-sage-900">What’s on your mind?</h2>
              <p className="mt-1 text-sm text-sage-500">Select any that apply, and add detail in your own words.</p>
            </div>
            {Object.entries(symptomsBySystem).map(([system, list]) => (
              <div key={system}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-sage-400">{system}</p>
                <div className="flex flex-wrap gap-2">
                  {list.map((s) => (
                    <Chip key={s.key} active={symptoms.includes(s.key)} onClick={() => toggle(symptoms, setSymptoms, s.key)}>
                      {s.label}
                    </Chip>
                  ))}
                </div>
              </div>
            ))}
            <div>
              <label className="label" htmlFor="freetext">Describe it in your own words (optional)</label>
              <textarea
                id="freetext"
                value={freeText}
                onChange={(e) => setFreeText(e.target.value)}
                rows={3}
                className="input resize-none"
                placeholder="e.g. Trouble winding down at night for the past two weeks, mind feels busy…"
              />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="label">How long has this been going on?</label>
                <select value={durationDays} onChange={(e) => setDurationDays(Number(e.target.value))} className="input">
                  <option value={1}>Today / 1 day</option>
                  <option value={3}>A few days</option>
                  <option value={10}>1–2 weeks</option>
                  <option value={30}>About a month</option>
                  <option value={90}>Several months</option>
                </select>
              </div>
              <div>
                <label className="label">How intense is it? ({severity}/5)</label>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={severity}
                  onChange={(e) => setSeverity(Number(e.target.value) as 1 | 2 | 3 | 4 | 5)}
                  className="mt-3 w-full accent-sage-600"
                />
                <div className="mt-1 flex justify-between text-xs text-sage-400">
                  <span>Mild</span>
                  <span>Severe</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 1: safety */}
        {step === 1 && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <h2 className="text-xl font-semibold text-sage-900">Quick safety screen</h2>
              <p className="mt-1 text-sm text-sage-500">
                Please tell us if any of these apply <strong>right now</strong>. This keeps you safe — it’s the most
                important step.
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {EMERGENCY_SCREEN.map((e) => (
                <label
                  key={e.key}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors ${
                    emergency.includes(e.key) ? 'border-red-300 bg-red-50' : 'border-sage-200 hover:bg-sage-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={emergency.includes(e.key)}
                    onChange={() => toggle(emergency, setEmergency, e.key)}
                    className="mt-0.5 h-4 w-4 rounded border-sage-300 text-red-600 focus:ring-red-400"
                  />
                  <span className="text-sm text-sage-800">{e.label}</span>
                </label>
              ))}
            </div>
            {liveTriage.matched.length > 0 ? (
              <EmergencyBanner triage={liveTriage} />
            ) : (
              <div className="flex items-center gap-2 rounded-xl border border-sage-200 bg-sage-50 p-3 text-sm text-sage-600">
                <Check className="h-4 w-4 text-sage-500" /> No emergency signs selected. You can continue.
              </div>
            )}
          </div>
        )}

        {/* Step 2: context */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-xl font-semibold text-sage-900">Your health context</h2>
              <p className="mt-1 text-sm text-sage-500">
                This powers the contraindication and drug-interaction checks. Nothing here leaves your device.
              </p>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-sage-800">Existing conditions</p>
              <div className="flex flex-wrap gap-2">
                {HEALTH_CONDITIONS.map((c) => (
                  <Chip key={c.key} active={conditions.includes(c.key)} onClick={() => toggle(conditions, setConditions, c.key)}>
                    {c.label}
                  </Chip>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-sage-800">Current medications</p>
              <div className="flex flex-wrap gap-2">
                {MEDICATIONS.map((m) => (
                  <Chip key={m.key} active={medications.includes(m.key)} onClick={() => toggle(medications, setMedications, m.key)}>
                    {m.label}
                  </Chip>
                ))}
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="label">Age</label>
                <input
                  type="number"
                  min={0}
                  max={120}
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="input"
                />
              </div>
              <div className="flex items-end">
                <label className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-sage-200 p-3">
                  <input
                    type="checkbox"
                    checked={pregnant}
                    onChange={(e) => setPregnant(e.target.checked)}
                    className="h-4 w-4 rounded border-sage-300 text-sage-600 focus:ring-sage-400"
                  />
                  <span className="text-sm text-sage-800">I am pregnant</span>
                </label>
              </div>
            </div>
            {(medications.length > 0 || pregnant) && (
              <div className="flex items-start gap-2 rounded-xl border border-turmeric-200 bg-turmeric-50 p-3 text-sm text-turmeric-900">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  Good to know: we’ll automatically hide anything unsafe for your medications
                  {pregnant ? ' or pregnancy' : ''}, and clearly flag cautions on the rest.
                </span>
              </div>
            )}
          </div>
        )}

        {/* Step 3: dosha */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-xl font-semibold text-sage-900">Your constitution (optional)</h2>
              <p className="mt-1 text-sm text-sage-500">
                Answer what you can — it personalises the “constitutional fit” of each suggestion. Skip anytime.
              </p>
            </div>
            {DOSHA_QUESTIONS.map((q) => (
              <div key={q.id}>
                <p className="mb-2 text-sm font-medium text-sage-800">{q.prompt}</p>
                <div className="grid gap-2 sm:grid-cols-3">
                  {q.options.map((opt) => (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => setDoshaAnswers((a) => ({ ...a, [q.id]: opt.dosha }))}
                      className={`rounded-xl border p-3 text-left text-sm transition-colors ${
                        doshaAnswers[q.id] === opt.dosha
                          ? 'border-sage-500 bg-sage-50 text-sage-900'
                          : 'border-sage-200 text-sage-600 hover:bg-sage-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {doshaAnalysis.dominant && (
              <div className="rounded-xl bg-sage-50 p-4 text-sm text-sage-700">
                Emerging profile: <strong className="text-sage-900">{DOSHA_LABELS[doshaAnalysis.dominant].name}</strong>
                {doshaAnalysis.isDual && doshaAnalysis.secondary
                  ? `–${DOSHA_LABELS[doshaAnalysis.secondary].name} (dual)`
                  : ' dominant'}
                . {DOSHA_LABELS[doshaAnalysis.dominant].blurb}
              </div>
            )}
          </div>
        )}

        {/* Step 4: goals + review */}
        {step === 4 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-xl font-semibold text-sage-900">Your goals</h2>
              <p className="mt-1 text-sm text-sage-500">What would you like to move toward?</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {WELLNESS_GOALS.map((g) => (
                  <Chip key={g.key} active={goals.includes(g.key)} onClick={() => toggle(goals, setGoals, g.key)}>
                    {g.label}
                  </Chip>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-sage-100 bg-sage-50/50 p-5">
              <h3 className="mb-3 font-semibold text-sage-900">Review</h3>
              <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                <Review label="Concerns" value={symptoms.map((s) => SYMPTOMS.find((x) => x.key === s)?.label ?? s).join(', ') || (freeText ? 'Described in text' : 'None')} />
                <Review label="Safety flags" value={emergency.length ? `${emergency.length} selected` : 'None'} />
                <Review label="Conditions" value={conditions.length ? `${conditions.length} noted` : 'None'} />
                <Review label="Medications" value={medications.length ? `${medications.length} noted` : 'None'} />
                <Review label="Pregnancy" value={pregnant ? 'Yes' : 'No'} />
                <Review label="Constitution" value={doshaAnalysis.dominant ? DOSHA_LABELS[doshaAnalysis.dominant].name : 'Not assessed'} />
              </dl>
            </div>
            {liveTriage.blockRecommendations && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                Note: because a safety flag is selected, results will show escalation guidance instead of herbal
                suggestions.
              </div>
            )}
          </div>
        )}

        {/* Nav */}
        <div className="mt-8 flex items-center justify-between border-t border-sage-100 pt-5">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="btn-ghost disabled:opacity-40"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep((s) => s + 1)} disabled={!canProceed} className="btn-primary">
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button onClick={generate} disabled={busy} className="btn-primary">
              {busy ? <><Spinner /> Analysing…</> : <>Get my guidance <ArrowRight className="h-4 w-4" /></>}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function Review({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-sage-100 py-1.5 last:border-0">
      <dt className="text-sage-500">{label}</dt>
      <dd className="text-right font-medium text-sage-800">{value}</dd>
    </div>
  )
}
