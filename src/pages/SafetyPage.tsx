import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  HeartPulse,
  Brain,
  FlaskConical,
  Ban,
  ArrowRight,
  Workflow,
  Lock,
} from 'lucide-react';
import { RED_FLAG_QUESTIONS } from '@/data/emergencyRules';
import { Disclaimer } from '@/components/Disclaimer';

const NEVER = [
  'Diagnose a medical condition',
  'Prescribe treatment or exact dosages',
  'Guarantee a cure or specific outcome',
  'Invent studies, citations, or evidence',
  'Recommend stopping or changing prescribed medication',
  'Give herbal advice in an emergency or high-risk situation',
];

export default function SafetyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <header className="max-w-2xl">
        <span className="chip border-sage-200 bg-sage-50 text-sage-700">
          <ShieldCheck className="h-3.5 w-3.5" /> Safety architecture
        </span>
        <h1 className="mt-4 section-title">Safety is deterministic. AI only explains.</h1>
        <p className="mt-3 text-ink-600">
          AyurSage separates medical safety from language. Hard safety decisions run on transparent, testable rules
          that AI can never override. AI is used only to understand your words and explain suggestions in plain
          language.
        </p>
      </header>

      {/* Pipeline */}
      <section className="mt-10">
        <h2 className="flex items-center gap-2 font-serif text-2xl font-semibold text-ink-900">
          <Workflow className="h-5 w-5 text-sage-600" /> The pipeline
        </h2>
        <div className="mt-5 space-y-3">
          {[
            { n: 1, t: 'Emergency triage (deterministic)', d: 'Structured red-flag questions and a broad keyword scan run first. Any emergency signal withholds all herbal suggestions and routes you to care.', icon: HeartPulse, tone: 'clay' },
            { n: 2, t: 'Constitution analysis (deterministic)', d: 'Your prakriti quiz is scored into vata / pitta / kapha and the likely current imbalance is inferred from your concerns.', icon: FlaskConical, tone: 'sage' },
            { n: 3, t: 'Safety gate (deterministic)', d: 'Each herb is checked against your pregnancy status, age, conditions and medications. Serious matches remove the herb entirely.', icon: ShieldCheck, tone: 'sage' },
            { n: 4, t: 'Explainable scoring (deterministic)', d: 'Remaining herbs get a transparent fit score with a full factor breakdown — reproducible and inspectable.', icon: Brain, tone: 'sage' },
            { n: 5, t: 'Language & explanation (AI)', d: 'Retrieval-augmented generation grounds the assistant in the curated knowledge base and explains results — it never sets safety.', icon: Brain, tone: 'turmeric' },
          ].map((s) => (
            <div key={s.n} className="card flex items-start gap-4 p-5">
              <div
                className={
                  s.tone === 'clay'
                    ? 'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-clay-100 text-clay-700'
                    : s.tone === 'turmeric'
                      ? 'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-turmeric-100 text-turmeric-700'
                      : 'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sage-100 text-sage-700'
                }
              >
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-ink-900">
                  <span className="mr-2 text-sage-400">{s.n}.</span>
                  {s.t}
                </h3>
                <p className="mt-1 text-sm text-ink-600">{s.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Never list */}
      <section className="mt-10">
        <div className="rounded-2xl border-2 border-clay-200 bg-clay-50/50 p-6">
          <h2 className="flex items-center gap-2 font-serif text-2xl font-semibold text-clay-800">
            <Ban className="h-5 w-5" /> What AyurSage will never do
          </h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {NEVER.map((n) => (
              <div key={n} className="flex items-center gap-2 rounded-xl bg-white/70 px-3 py-2 text-sm text-ink-700">
                <Ban className="h-4 w-4 shrink-0 text-clay-500" /> {n}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Red flags */}
      <section className="mt-10">
        <h2 className="flex items-center gap-2 font-serif text-2xl font-semibold text-ink-900">
          <HeartPulse className="h-5 w-5 text-clay-600" /> Emergency red flags we screen for
        </h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {RED_FLAG_QUESTIONS.map((q) => (
            <div key={q.id} className="flex items-center gap-2 rounded-xl border border-sage-100 bg-white px-3 py-2.5 text-sm">
              <span
                className={
                  q.level === 'emergency'
                    ? 'rounded-md bg-clay-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-clay-700'
                    : 'rounded-md bg-turmeric-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-turmeric-700'
                }
              >
                {q.level}
              </span>
              <span className="text-ink-700">{q.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Privacy */}
      <section className="mt-10">
        <div className="card flex items-start gap-4 p-6">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sage-100 text-sage-700">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-ink-900">Privacy &amp; auditability</h3>
            <p className="mt-1 text-sm text-ink-600">
              Passwords are salted + PBKDF2-hashed, health data is scoped to your account, and every safety- or
              privacy-relevant action is written to an append-only audit trail. You can export or delete your data
              anytime.
            </p>
            <Link to="/privacy" className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-sage-700 hover:text-sage-800">
              Manage your data <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      <div className="mt-10">
        <Disclaimer />
      </div>
    </div>
  );
}
