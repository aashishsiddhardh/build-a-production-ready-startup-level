import { Link } from 'react-router-dom'
import {
  ShieldCheck,
  Sparkles,
  Stethoscope,
  BookOpenText,
  MessageCircleHeart,
  Activity,
  Scale,
  Lock,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'
import { SectionTitle } from '@/components/ui'

const FEATURES = [
  {
    icon: Stethoscope,
    title: 'Emergency-first triage',
    body: 'Deterministic rules screen for red-flag symptoms before anything else. High-risk situations are routed to care — never to herbs.',
  },
  {
    icon: Scale,
    title: 'Contraindication & interaction checks',
    body: 'Every suggestion is filtered against your conditions, medications, and pregnancy status by an auditable rules engine.',
  },
  {
    icon: Sparkles,
    title: 'Explainable recommendations',
    body: 'See exactly why each herb was suggested — symptom match, constitutional fit, evidence tier, and safety margin.',
  },
  {
    icon: BookOpenText,
    title: 'Transparent evidence levels',
    body: 'From traditional use to moderate human evidence — clearly labelled, never overstated, never invented.',
  },
  {
    icon: MessageCircleHeart,
    title: 'Grounded AI assistant',
    body: 'Ask questions in plain language. Answers stay grounded in the knowledge base, with the same safety guardrails.',
  },
  {
    icon: Lock,
    title: 'Privacy by design',
    body: 'Your health inputs stay on your device. Export or erase everything at any time. Audit logs record actions, not content.',
  },
]

const SAFETY_POINTS = [
  'Never diagnoses, prescribes, or promises cures',
  'Never invents studies, citations, or evidence',
  'Never tells you to stop a prescribed medication',
  'Withholds herbal advice in emergencies and for children',
]

export function Landing() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-24 top-0 h-96 w-96 rounded-full bg-turmeric-200/40 blur-3xl" />
          <div className="absolute -right-24 top-24 h-96 w-96 rounded-full bg-sage-200/50 blur-3xl" />
        </div>
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-sage-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-sage-700 shadow-sm">
              <ShieldCheck className="h-4 w-4 text-sage-500" /> Safety-first architecture · rules protect, AI explains
            </span>
            <h1 className="mt-6 text-4xl font-semibold leading-[1.1] text-sage-900 sm:text-6xl">
              Ancient wisdom,
              <br />
              <span className="bg-gradient-to-r from-sage-600 to-turmeric-500 bg-clip-text text-transparent">
                responsibly guided.
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-sage-600">
              AyurSage blends an Ayurvedic knowledge base with modern safety engineering. Deterministic rules handle
              medical safety; AI handles natural language and explanations. Educational guidance — never a diagnosis.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link to="/register" className="btn-primary px-6 py-3 text-base">
                Start your wellness profile <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/knowledge" className="btn-secondary px-6 py-3 text-base">
                Explore the knowledge base
              </Link>
            </div>
            <p className="mt-4 text-xs text-sage-400">
              No credit card. Your health data stays on your device. Not a medical service.
            </p>
          </div>
        </div>
      </section>

      {/* Safety strip */}
      <section className="border-y border-sage-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SAFETY_POINTS.map((p) => (
              <div key={p} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-sage-500" />
                <p className="text-sm font-medium text-sage-700">{p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <SectionTitle
          eyebrow="How it works"
          title="A wellness companion built like medical software"
          subtitle="Six systems working together, with safety as the non-negotiable foundation."
          className="mx-auto max-w-2xl text-center"
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="card p-6 transition-shadow hover:shadow-md">
              <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-sage-100 text-sage-600">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-sage-900">{f.title}</h3>
              <p className="mt-2 text-sm text-sage-600">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Architecture band */}
      <section className="bg-sage-900 text-sage-50">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-turmeric-300">
                The safety boundary
              </p>
              <h2 className="text-3xl font-semibold sm:text-4xl">
                Rules decide what’s safe. <br />
                AI only decides how to say it.
              </h2>
              <p className="mt-4 text-sage-200">
                Medical-safety decisions — emergency triage, contraindications, drug interactions — run through
                deterministic, testable code. The language model can read those decisions to explain them, but it can
                never override them.
              </p>
              <Link to="/register" className="btn-primary mt-8 px-6 py-3 text-base">
                Try it now <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {[
                { icon: Activity, label: 'Deterministic', text: 'Triage · contraindications · interactions', accent: 'bg-turmeric-400 text-clay-950' },
                { icon: Sparkles, label: 'Probabilistic', text: 'NLU · retrieval · explanations', accent: 'bg-sage-400 text-sage-950' },
                { icon: ShieldCheck, label: 'Guardrails', text: 'Disclaimers · evidence honesty · no-diagnosis', accent: 'bg-clay-300 text-clay-950' },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-4 rounded-2xl bg-sage-800/60 p-4">
                  <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${row.accent}`}>
                    <row.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">{row.label}</p>
                    <p className="text-sm text-sage-300">{row.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
        <h2 className="text-3xl font-semibold text-sage-900 sm:text-4xl">Begin gently. Stay safe.</h2>
        <p className="mx-auto mt-3 max-w-xl text-sage-600">
          Create a private profile, complete a structured assessment, and get transparent, safety-checked wellness
          guidance in minutes.
        </p>
        <Link to="/register" className="btn-primary mt-8 px-6 py-3 text-base">
          Create your profile <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  )
}
