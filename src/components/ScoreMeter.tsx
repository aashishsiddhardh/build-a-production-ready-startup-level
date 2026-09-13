import { cn } from '@/lib/cn';

/** A small radial "fit score" gauge. This is a fit-to-your-profile signal, NOT a medical certainty. */
export function ScoreMeter({ score, className }: { score: number; className?: string }) {
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score));
  const offset = circumference - (clamped / 100) * circumference;
  const color = clamped >= 66 ? '#4c683c' : clamped >= 40 ? '#d9861f' : '#a85e4d';

  return (
    <div className={cn('relative inline-flex h-16 w-16 items-center justify-center', className)}>
      <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={radius} fill="none" stroke="#e5ecdf" strokeWidth="6" />
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>
      <span className="absolute text-sm font-bold tabular-nums text-ink-900">{clamped}</span>
    </div>
  );
}
