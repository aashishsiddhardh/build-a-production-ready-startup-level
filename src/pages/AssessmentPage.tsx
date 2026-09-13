import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { CONCERNS } from '@/data/conditions';
import { PRAKRITI_QUESTIONS, DOSHA_META } from '@/data/doshas';
import { RED_FLAG_QUESTIONS } from '@/data/emergencyRules';
import { CONDITION_OPTIONS, MEDICATION_OPTIONS } from '@/data/profileOptions';
import type {
  AssessmentInput,
  HealthProfile,
  Dosha,
  ContraindicationFlag,
  DrugClass,
  StoredAssessment,
} from '@/lib/types';
import { generateRecommendations } from '@/engine/recommender';
import { store } from '@/lib/storage';
import { logAudit } from '@/lib/audit';
import { Disclaimer } from '@/components/Disclaimer';
import { cn } from '@/lib/cn';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  ShieldCheck,
  HeartPulse,
  ClipboardList,
  Sparkles,
  Stethoscope,
  MessageSquareText,
  Loader2,
} from 'lucide-react';

const STEPS = ['Consent', 'About you', 'Constitution', 'Concerns', 'In your words', 'Safety screen', 'Review'];

const emptyProfile: HealthProfile = {
  age: null,
  sexAtBirth: null,
  pregnant: false,
  breastfeeding: false,
  conditions: [],
  medications: [],
  allergies: '',
};

export default function AssessmentPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [step, setStep] = useState(0);
  const [consent, setConsent] = useState(false);
  const [profile, setProfile] = useState<HealthProfile>(emptyProfile);
  const [prakritiAnswers, setPrakritiAnswers] = useState<Record<string, Dosha>>({});
  const [concerns, setConcerns] = useState<string[]>([]);
  const [narrative, setNarrative] = useState('');
  const [redFlagAnswers, setRedFlagAnswers] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);

  const progress = ((step + 1) / STEPS.length) * 100;

  const canContinue = useMemo(() => {
    if (step === 0) return consent;
    if (step === 3) return concerns.length > 0;
    return true;
  }, [step, consent, concerns]);

  const toggleFlag = (flag: ContraindicationFlag) =>
    setProfile((p) => ({
      ...p,
      conditions: p.conditions.includes(flag)
        ? p.conditions.filter((f) => f !== flag)
        : [...p.conditions, flag],
    }));

  const toggleMed = (drug: DrugClass) =>
    setProfile((p) => ({
      ...p,
      medications: p.medications.includes(drug)
        ? p.medications.filter((f) => f !== drug)
        : [...p.medications, drug],
    }));

  const toggleConcern = (id: string) =>
    setConcerns((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const submit = async () => {
    if (!user) return;
    setSubmitting(true);
    const input: AssessmentInput = {
      profile,
      prakritiAnswers,
      concerns,
      narrative,
      redFlagAnswers,
      consentAccepted: consent,
    };

    // Deterministic pipeline (kept off the main paint frame for the spinner).
    await new Promise((r) => setTimeout(r, 350));
    const result = generateRecommendations(input);
    const stored: StoredAssessment = { ...result, userId: user.id };
    store.addAssessment(stored);

    logAudit('assessment.create', user, {
      id: result.id,
      concerns: concerns.join(','),
      triage: result.triage.level,
    });
    if (result.triage.level === 'emergency') {
      logAudit('triage.emergency', user, { id: result.id, flags: result.triage.matchedFlags.length });
    } else {
      logAudit('recommendation.generated', user, {
        id: result.id,
        count: result.recommendations.length,
        withheld: result.withheldForSafety.length,
      });
    }

    navigate(`/results/${result.id}`);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-sage-700">
            Step {step + 1} of {STEPS.length}
          </span>
          <span className="text-ink-500">{STEPS[step]}</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-sage-100">
          <div className="h-full rounded-full bg-sage-600 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="card p-6 sm:p-8 animate-fade-in" key={step}>
        {step === 0 && <ConsentStep consent={consent} setConsent={setConsent} />}
        {step === 1 && (
          <ProfileStep
            profile={profile}
            setProfile={setProfile}
            toggleFlag={toggleFlag}
            toggleMed={toggleMed}
          />
        )}
        {step === 2 && <ConstitutionStep answers={prakritiAnswers} setAnswers={setPrakritiAnswers} />}
        {step === 3 && <ConcernsStep concerns={concerns} toggle={toggleConcern} />}
        {step === 4 && <NarrativeStep narrative={narrative} setNarrative={setNarrative} />}
        {step === 5 && <SafetyStep answers={redFlagAnswers} setAnswers={setRedFlagAnswers} />}
        {step === 6 && (
          <ReviewStep
            profile={profile}
            concerns={concerns}
            prakritiAnswers={prakritiAnswers}
            redFlagAnswers={redFlagAnswers}
          />
        )}
      </div>

      {/* Nav */}
      <div className="mt-6 flex items-center justify-between">
        <button onClick={back} disabled={step === 0} className="btn-ghost disabled:opacity-40">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        {step < STEPS.length - 1 ? (
          <button onClick={next} disabled={!canContinue} className="btn-primary">
            Continue <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button onClick={submit} disabled={submitting} className="btn-primary">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Generate my guidance
          </button>
        )}
      </div>

      {step === 3 && concerns.length === 0 && (
        <p className="mt-3 text-center text-sm text-turmeric-700">Select at least one concern to continue.</p>
      )}
    </div>
  );
}

/* ----------------------------- Steps ----------------------------- */

function StepHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: typeof ClipboardList;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-6 flex items-start gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sage-100 text-sage-700">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h2 className="font-serif text-2xl font-semibold text-ink-900">{title}</h2>
        <p className="mt-0.5 text-sm text-ink-500">{subtitle}</p>
      </div>
    </div>
  );
}

function ConsentStep({ consent, setConsent }: { consent: boolean; setConsent: (v: boolean) => void }) {
  return (
    <div>
      <StepHeader
        icon={ShieldCheck}
        title="Before we begin"
        subtitle="A quick note on what AyurSage is — and isn't."
      />
      <div className="space-y-3 text-sm leading-relaxed text-ink-700">
        <p>
          AyurSage offers <strong>educational Ayurvedic wellness guidance</strong>. It does not diagnose conditions,
          prescribe treatment, or replace a licensed healthcare professional.
        </p>
        <ul className="space-y-2">
          {[
            'We screen for emergency warning signs and will withhold herbal suggestions if any are present.',
            'We never advise stopping or changing prescribed medication.',
            'Every suggestion shows its evidence level and any safety cautions for you.',
            'Your responses are stored privately in your account and you can export or delete them anytime.',
          ].map((t) => (
            <li key={t} className="flex gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-sage-600" /> {t}
            </li>
          ))}
        </ul>
      </div>
      <Disclaimer className="mt-5" compact />
      <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-sage-200 bg-sage-50/50 p-4">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 h-5 w-5 rounded border-sage-300 text-sage-700 focus:ring-sage-400"
        />
        <span className="text-sm text-ink-700">
          I understand this is educational wellness information, not medical advice, and I consent to my responses being
          processed and stored to generate my guidance.
        </span>
      </label>
    </div>
  );
}

function ProfileStep({
  profile,
  setProfile,
  toggleFlag,
  toggleMed,
}: {
  profile: HealthProfile;
  setProfile: React.Dispatch<React.SetStateAction<HealthProfile>>;
  toggleFlag: (f: ContraindicationFlag) => void;
  toggleMed: (d: DrugClass) => void;
}) {
  return (
    <div>
      <StepHeader
        icon={Stethoscope}
        title="About you"
        subtitle="This lets us screen every suggestion against your health profile. All fields are optional but improve safety."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="age">Age</label>
          <input
            id="age"
            type="number"
            min={0}
            max={120}
            className="input"
            value={profile.age ?? ''}
            onChange={(e) => setProfile((p) => ({ ...p, age: e.target.value ? Number(e.target.value) : null }))}
            placeholder="e.g. 34"
          />
        </div>
        <div>
          <label className="label" htmlFor="sex">Sex at birth</label>
          <select
            id="sex"
            className="input"
            value={profile.sexAtBirth ?? ''}
            onChange={(e) => setProfile((p) => ({ ...p, sexAtBirth: (e.target.value || null) as HealthProfile['sexAtBirth'] }))}
          >
            <option value="">Prefer not to say</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="intersex">Intersex</option>
          </select>
        </div>
      </div>

      {profile.sexAtBirth === 'female' && (
        <div className="mt-4 flex flex-wrap gap-3">
          <CheckPill checked={profile.pregnant} onClick={() => setProfile((p) => ({ ...p, pregnant: !p.pregnant }))}>
            Currently pregnant
          </CheckPill>
          <CheckPill checked={profile.breastfeeding} onClick={() => setProfile((p) => ({ ...p, breastfeeding: !p.breastfeeding }))}>
            Breastfeeding
          </CheckPill>
        </div>
      )}

      <fieldset className="mt-6">
        <legend className="label">Do you have any of these conditions?</legend>
        <div className="flex flex-wrap gap-2">
          {CONDITION_OPTIONS.map((c) => (
            <CheckPill key={c.flag} checked={profile.conditions.includes(c.flag)} onClick={() => toggleFlag(c.flag)}>
              {c.label}
            </CheckPill>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-6">
        <legend className="label">Are you taking any of these medications?</legend>
        <div className="flex flex-wrap gap-2">
          {MEDICATION_OPTIONS.map((m) => (
            <CheckPill
              key={m.drugClass}
              checked={profile.medications.includes(m.drugClass)}
              onClick={() => toggleMed(m.drugClass)}
              title={m.hint}
            >
              {m.label}
            </CheckPill>
          ))}
        </div>
        <p className="mt-2 text-xs text-ink-400">
          We use this only to flag possible interactions — we will never tell you to change any medication.
        </p>
      </fieldset>

      <div className="mt-6">
        <label className="label" htmlFor="allergies">Known allergies (optional)</label>
        <input
          id="allergies"
          className="input"
          value={profile.allergies}
          onChange={(e) => setProfile((p) => ({ ...p, allergies: e.target.value }))}
          placeholder="e.g. nuts, ragweed"
        />
      </div>
    </div>
  );
}

function ConstitutionStep({
  answers,
  setAnswers,
}: {
  answers: Record<string, Dosha>;
  setAnswers: React.Dispatch<React.SetStateAction<Record<string, Dosha>>>;
}) {
  const answered = Object.keys(answers).length;
  return (
    <div>
      <StepHeader
        icon={Sparkles}
        title="Your constitution (Prakriti)"
        subtitle={`Pick what feels most true. Answered ${answered} of ${PRAKRITI_QUESTIONS.length}.`}
      />
      <div className="space-y-6">
        {PRAKRITI_QUESTIONS.map((q) => (
          <div key={q.id}>
            <p className="mb-2 text-sm font-medium text-ink-800">{q.prompt}</p>
            <div className="grid gap-2 sm:grid-cols-3">
              {q.options.map((opt) => {
                const active = answers[q.id] === opt.dosha;
                return (
                  <button
                    key={opt.dosha}
                    onClick={() => setAnswers((a) => ({ ...a, [q.id]: opt.dosha }))}
                    className={cn(
                      'rounded-xl border p-3 text-left text-sm transition',
                      active
                        ? 'border-sage-500 bg-sage-50 ring-1 ring-sage-300'
                        : 'border-sage-200 bg-white hover:border-sage-300',
                    )}
                  >
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide" style={{ color: DOSHA_META[opt.dosha].color }}>
                      <span className="h-2 w-2 rounded-full" style={{ background: DOSHA_META[opt.dosha].color }} />
                      {DOSHA_META[opt.dosha].name}
                    </span>
                    <span className="mt-1 block text-ink-700">{opt.text}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ConcernsStep({ concerns, toggle }: { concerns: string[]; toggle: (id: string) => void }) {
  return (
    <div>
      <StepHeader
        icon={ClipboardList}
        title="What would you like support with?"
        subtitle="Select all that apply. These drive your personalized suggestions."
      />
      <div className="grid gap-2 sm:grid-cols-2">
        {CONCERNS.map((c) => {
          const active = concerns.includes(c.id);
          return (
            <button
              key={c.id}
              onClick={() => toggle(c.id)}
              className={cn(
                'flex items-start gap-3 rounded-xl border p-3 text-left transition',
                active ? 'border-sage-500 bg-sage-50 ring-1 ring-sage-300' : 'border-sage-200 bg-white hover:border-sage-300',
              )}
            >
              <span
                className={cn(
                  'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border',
                  active ? 'border-sage-600 bg-sage-600 text-white' : 'border-sage-300',
                )}
              >
                {active && <Check className="h-3.5 w-3.5" />}
              </span>
              <span>
                <span className="block text-sm font-medium text-ink-900">{c.label}</span>
                <span className="block text-xs text-ink-500">{c.description}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function NarrativeStep({ narrative, setNarrative }: { narrative: string; setNarrative: (v: string) => void }) {
  return (
    <div>
      <StepHeader
        icon={MessageSquareText}
        title="In your own words"
        subtitle="Optional. Describe how you've been feeling — our AI reads this and it's also scanned for safety."
      />
      <textarea
        className="input min-h-[160px] resize-y"
        value={narrative}
        onChange={(e) => setNarrative(e.target.value)}
        placeholder="e.g. I've been feeling wired but tired, with poor sleep and bloating after dinner for the past couple of weeks…"
      />
      <p className="mt-2 text-xs text-ink-400">
        Please don't include others' personal information. If you're in crisis or danger, contact emergency services.
      </p>
    </div>
  );
}

function SafetyStep({
  answers,
  setAnswers,
}: {
  answers: Record<string, boolean>;
  setAnswers: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}) {
  return (
    <div>
      <StepHeader
        icon={HeartPulse}
        title="Quick safety screen"
        subtitle="Please answer honestly. If any apply, we'll prioritize your safety over suggestions."
      />
      <div className="space-y-3">
        {RED_FLAG_QUESTIONS.map((q) => {
          const val = answers[q.id];
          return (
            <div key={q.id} className="rounded-xl border border-sage-200 p-4">
              <p className="text-sm text-ink-800">{q.prompt}</p>
              <div className="mt-3 flex gap-2">
                <YesNo active={val === true} tone="danger" onClick={() => setAnswers((a) => ({ ...a, [q.id]: true }))}>
                  Yes
                </YesNo>
                <YesNo active={val === false} tone="ok" onClick={() => setAnswers((a) => ({ ...a, [q.id]: false }))}>
                  No
                </YesNo>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ReviewStep({
  profile,
  concerns,
  prakritiAnswers,
  redFlagAnswers,
}: {
  profile: HealthProfile;
  concerns: string[];
  prakritiAnswers: Record<string, Dosha>;
  redFlagAnswers: Record<string, boolean>;
}) {
  const flaggedCount = Object.values(redFlagAnswers).filter(Boolean).length;
  return (
    <div>
      <StepHeader
        icon={Check}
        title="Review & generate"
        subtitle="Here's a summary. Generating runs the deterministic safety checks first, then the explainable recommender."
      />
      <dl className="space-y-3 text-sm">
        <Row label="Concerns">
          {concerns.length ? concerns.map((c) => CONCERNS.find((x) => x.id === c)?.label).join(', ') : '—'}
        </Row>
        <Row label="Constitution answers">{Object.keys(prakritiAnswers).length} / {PRAKRITI_QUESTIONS.length}</Row>
        <Row label="Conditions">
          {profile.conditions.length
            ? profile.conditions.map((c) => CONDITION_OPTIONS.find((x) => x.flag === c)?.label).join(', ')
            : 'None reported'}
        </Row>
        <Row label="Medications">
          {profile.medications.length
            ? profile.medications.map((m) => MEDICATION_OPTIONS.find((x) => x.drugClass === m)?.label).join(', ')
            : 'None reported'}
        </Row>
        <Row label="Safety screen">
          {flaggedCount > 0 ? (
            <span className="font-medium text-clay-700">{flaggedCount} item(s) flagged — will be reviewed first</span>
          ) : (
            <span className="text-sage-700">No red flags marked</span>
          )}
        </Row>
      </dl>
      <Disclaimer className="mt-5" compact />
    </div>
  );
}

/* --------------------------- Small parts --------------------------- */

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-xl bg-sage-50/60 p-3 sm:flex-row sm:items-center sm:justify-between">
      <dt className="font-medium text-ink-500">{label}</dt>
      <dd className="text-ink-800 sm:text-right">{children}</dd>
    </div>
  );
}

function CheckPill({
  checked,
  onClick,
  children,
  title,
}: {
  checked: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition',
        checked ? 'border-sage-600 bg-sage-700 text-white' : 'border-sage-200 bg-white text-ink-700 hover:border-sage-300',
      )}
    >
      {checked && <Check className="h-3.5 w-3.5" />}
      {children}
    </button>
  );
}

function YesNo({
  active,
  tone,
  onClick,
  children,
}: {
  active: boolean;
  tone: 'ok' | 'danger';
  onClick: () => void;
  children: React.ReactNode;
}) {
  const activeClass =
    tone === 'danger' ? 'border-clay-500 bg-clay-500 text-white' : 'border-sage-600 bg-sage-700 text-white';
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex-1 rounded-lg border px-4 py-2 text-sm font-semibold transition',
        active ? activeClass : 'border-sage-200 bg-white text-ink-600 hover:border-sage-300',
      )}
    >
      {children}
    </button>
  );
}
