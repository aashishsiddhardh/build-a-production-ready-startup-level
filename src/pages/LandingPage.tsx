import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  Brain,
  FlaskConical,
  HeartPulse,
  Sparkles,
  Leaf,
  Lock,
  ListChecks,
  MessageCircleHeart,
} from 'lucide-react';
import { HERBS } from '@/data/herbs';
import { CONCERNS } from '@/data/conditions';
import { Disclaimer } from '@/components/Disclaimer';

export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 grain opacity-60" />
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-turmeric-100/50 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 top-40 h-80 w-80 rounded-full bg-sage-200/40 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-16 sm:px-6 sm:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-sage-200 bg-white/70 px-4 py-1.5 text-sm font-medium text-sage-700 shadow-soft">
              <ShieldCheck className="h-4 w-4" /> Safety-first · Explainable · Evidence-graded
            </span>
            <h1 className="mt-6 text-balance font-serif text-5xl font-semibold leading-[1.05] text-ink-900 sm:text-6xl">
              Ancient Ayurvedic wisdom, guided by a{' '}
              <span className="text-sage-700">safety-first</span> AI
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-balance text-lg leading-relaxed text-ink-600">
              AyurSage understands how you feel, screens for red flags with deterministic medical rules, and
              suggests evidence-graded herbs, diet and lifestyle — always transparent, never a diagnosis.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link to="/assessment" className="btn-primary text-base">
                Start your assessment <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/knowledge" className="btn-outline text-base">
                Browse the knowledge base
              </Link>
            </div>
            <p className="mt-4 text-xs text-ink-400">
              Try the demo · <span className="font-medium">demo@ayursage.demo</span> /{' '}
              <span className="font-medium">wellness123</span>
            </p>
          </div>

          {/* Stat strip */}
          <div className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { value: `${HERBS.length}`, label: 'Herbs & formulations' },
              { value: `${CONCERNS.length}`, label: 'Wellness concerns' },
              { value: '10', label: 'Emergency red-flag rules' },
              { value: '4', label: 'Evidence tiers' },
            ].map((s) => (
              <div key={s.label} className="card p-5 text-center">
                <div className="font-serif text-3xl font-semibold text-sage-700">{s.value}</div>
                <div className="mt-1 text-xs font-medium uppercase tracking-wide text-ink-400">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety-first architecture */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="section-title">Two systems, clear boundaries</h2>
          <p className="mt-3 text-ink-600">
            Medical safety is handled by deterministic rules that AI can never override. AI is used only for
            language understanding and transparent explanations.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="card relative overflow-hidden p-7">
            <div className="absolute right-4 top-4 rounded-full bg-sage-100 px-3 py-1 text-xs font-semibold text-sage-700">
              Deterministic
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sage-700 text-white">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-xl font-semibold text-ink-900">Rules keep you safe</h3>
            <ul className="mt-3 space-y-2 text-sm text-ink-600">
              <li className="flex gap-2"><HeartPulse className="mt-0.5 h-4 w-4 shrink-0 text-clay-600" /> Emergency triage screens for red flags first</li>
              <li className="flex gap-2"><FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-sage-600" /> Contraindication &amp; drug-interaction gates</li>
              <li className="flex gap-2"><ListChecks className="mt-0.5 h-4 w-4 shrink-0 text-sage-600" /> Transparent, reproducible fit scoring</li>
            </ul>
          </div>
          <div className="card relative overflow-hidden p-7">
            <div className="absolute right-4 top-4 rounded-full bg-turmeric-100 px-3 py-1 text-xs font-semibold text-turmeric-700">
              AI-assisted
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-turmeric-500 text-white">
              <Brain className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-xl font-semibold text-ink-900">AI explains, never decides safety</h3>
            <ul className="mt-3 space-y-2 text-sm text-ink-600">
              <li className="flex gap-2"><MessageCircleHeart className="mt-0.5 h-4 w-4 shrink-0 text-turmeric-600" /> Natural-language understanding of your concerns</li>
              <li className="flex gap-2"><Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-turmeric-600" /> RAG grounded in the curated knowledge base</li>
              <li className="flex gap-2"><Leaf className="mt-0.5 h-4 w-4 shrink-0 text-sage-600" /> Plain-language, cited explanations</li>
            </ul>
          </div>
        </div>
        <div className="mt-6 text-center">
          <Link to="/safety" className="inline-flex items-center gap-1 text-sm font-semibold text-sage-700 hover:text-sage-800">
            Read the full safety architecture <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-sage-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="section-title">How AyurSage works</h2>
            <p className="mt-3 text-ink-600">A guided, transparent path from how you feel to what you can try.</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-4">
            {[
              { n: '01', title: 'Share how you feel', body: 'Structured symptoms, constitution quiz and free-text — with an emergency screen.', icon: ClipboardIcon },
              { n: '02', title: 'Safety checks run', body: 'Deterministic triage, contraindication and interaction gates filter first.', icon: ShieldCheck },
              { n: '03', title: 'Get graded suggestions', body: 'Evidence-tiered herbs with an explainable fit score and personalized cautions.', icon: FlaskConical },
              { n: '04', title: 'Learn & discuss', body: 'Diet, routine and yoga guidance plus a cited AI assistant to explore further.', icon: MessageCircleHeart },
            ].map((s) => (
              <div key={s.n} className="relative">
                <div className="text-sm font-bold text-sage-300">{s.n}</div>
                <div className="mt-2 flex h-11 w-11 items-center justify-center rounded-xl bg-sage-100 text-sage-700">
                  <s.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-3 text-lg font-semibold text-ink-900">{s.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-600">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust / privacy */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: Lock, title: 'Privacy by design', body: 'Your health data stays in your control with export and one-click deletion. Every sensitive action is audit-logged.' },
            { icon: FlaskConical, title: 'Honest evidence', body: 'Each herb is graded from traditional use to moderate clinical — we never fabricate studies or promise cures.' },
            { icon: HeartPulse, title: 'Emergencies come first', body: 'If we detect a red flag, we stop and point you to appropriate care instead of suggesting herbs.' },
          ].map((c) => (
            <div key={c.title} className="card p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sage-100 text-sage-700">
                <c.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-ink-900">{c.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{c.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <Disclaimer />
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-sage-800 px-6 py-14 text-center shadow-card sm:px-12">
          <div className="pointer-events-none absolute inset-0 grain opacity-20" />
          <h2 className="relative font-serif text-3xl font-semibold text-white sm:text-4xl">
            Begin your personalized wellness assessment
          </h2>
          <p className="relative mx-auto mt-3 max-w-xl text-sage-100">
            Free, private, and transparent. Understand your constitution and get safety-checked suggestions in a few
            minutes.
          </p>
          <Link to="/assessment" className="btn-accent relative mt-6 text-base">
            Start now <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

function ClipboardIcon(props: { className?: string }) {
  return <ListChecks {...props} />;
}
