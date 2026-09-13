import type { ReactNode } from 'react'
import type { EvidenceLevel, InteractionSeverity } from '@/types'
import { EVIDENCE_LABEL } from '@/lib/recommend/scoring'
import { Leaf, ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react'

export function Logo({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <span className={`inline-grid place-items-center rounded-xl bg-sage-600 text-turmeric-200 ${className}`}>
      <Leaf className="h-[60%] w-[60%]" strokeWidth={2.2} />
    </span>
  )
}

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <Logo className="h-9 w-9" />
      {!compact && (
        <span className="leading-tight">
          <span className="block font-display text-lg font-semibold text-sage-900">AyurSage</span>
          <span className="block text-[11px] font-medium uppercase tracking-widest text-sage-500">
            Wellness Companion
          </span>
        </span>
      )}
    </span>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`card ${className}`}>{children}</div>
}

export function SectionTitle({
  eyebrow,
  title,
  subtitle,
  className = '',
}: {
  eyebrow?: string
  title: string
  subtitle?: string
  className?: string
}) {
  return (
    <div className={className}>
      {eyebrow && (
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-turmeric-600">{eyebrow}</p>
      )}
      <h2 className="text-2xl font-semibold text-sage-900 sm:text-3xl">{title}</h2>
      {subtitle && <p className="mt-2 max-w-2xl text-sage-600">{subtitle}</p>}
    </div>
  )
}

const EVIDENCE_STYLES: Record<EvidenceLevel, string> = {
  traditional: 'bg-clay-100 text-clay-700 border-clay-200',
  preclinical: 'bg-clay-100 text-clay-700 border-clay-200',
  preliminary: 'bg-turmeric-100 text-turmeric-800 border-turmeric-200',
  moderate: 'bg-sage-100 text-sage-800 border-sage-300',
  strong: 'bg-sage-600 text-white border-sage-600',
}

export function EvidenceBadge({ level }: { level: EvidenceLevel }) {
  const dots: Record<EvidenceLevel, number> = {
    traditional: 1,
    preclinical: 2,
    preliminary: 3,
    moderate: 4,
    strong: 5,
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${EVIDENCE_STYLES[level]}`}
      title={EVIDENCE_LABEL[level]}
    >
      <span className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className={`h-1.5 w-1.5 rounded-full ${i <= dots[level] ? 'bg-current opacity-100' : 'bg-current opacity-25'}`}
          />
        ))}
      </span>
      {EVIDENCE_LABEL[level]}
    </span>
  )
}

const SEVERITY_STYLES: Record<InteractionSeverity, { cls: string; icon: ReactNode; label: string }> = {
  info: { cls: 'bg-sage-50 text-sage-700 border-sage-200', icon: <ShieldCheck className="h-3.5 w-3.5" />, label: 'Info' },
  caution: {
    cls: 'bg-turmeric-50 text-turmeric-800 border-turmeric-200',
    icon: <ShieldAlert className="h-3.5 w-3.5" />,
    label: 'Caution',
  },
  avoid: { cls: 'bg-red-50 text-red-700 border-red-200', icon: <ShieldX className="h-3.5 w-3.5" />, label: 'Avoid' },
}

export function SeverityBadge({ severity }: { severity: InteractionSeverity }) {
  const s = SEVERITY_STYLES[severity]
  return (
    <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-semibold ${s.cls}`}>
      {s.icon}
      {s.label}
    </span>
  )
}

export function ScoreRing({ score }: { score: number }) {
  const radius = 26
  const circ = 2 * Math.PI * radius
  const offset = circ - (score / 100) * circ
  const color = score >= 70 ? '#45673a' : score >= 45 ? '#c26a16' : '#9d634b'
  return (
    <div className="relative h-16 w-16 shrink-0">
      <svg viewBox="0 0 64 64" className="h-16 w-16 -rotate-90">
        <circle cx="32" cy="32" r={radius} fill="none" stroke="#e3ecdf" strokeWidth="6" />
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-sm font-bold text-sage-900">{score}</span>
    </div>
  )
}

export function Bar({ value, className = 'bg-sage-500' }: { value: number; className?: string }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-sage-100">
      <div
        className={`h-full rounded-full transition-all duration-700 ${className}`}
        style={{ width: `${Math.round(Math.max(0, Math.min(1, value)) * 100)}%` }}
      />
    </div>
  )
}

export function Spinner({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  )
}

export function EmptyState({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-sage-200 bg-sage-50/50 px-6 py-14 text-center">
      <div className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-sage-100 text-sage-600">{icon}</div>
      <h3 className="text-lg font-semibold text-sage-900">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-sage-600">{body}</p>
    </div>
  )
}
