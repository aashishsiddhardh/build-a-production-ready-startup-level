import { EVIDENCE_META, type EvidenceLevel } from '@/lib/types';
import { cn } from '@/lib/cn';
import { FlaskConical } from 'lucide-react';

const TONE: Record<string, string> = {
  clay: 'bg-clay-50 text-clay-700 border-clay-200',
  turmeric: 'bg-turmeric-50 text-turmeric-700 border-turmeric-200',
  sage: 'bg-sage-50 text-sage-700 border-sage-200',
};

export function EvidenceBadge({
  level,
  className,
  withIcon = true,
}: {
  level: EvidenceLevel;
  className?: string;
  withIcon?: boolean;
}) {
  const meta = EVIDENCE_META[level];
  return (
    <span className={cn('chip', TONE[meta.tone], className)} title={meta.blurb}>
      {withIcon && <FlaskConical className="h-3.5 w-3.5" />}
      {meta.label}
      <span className="ml-0.5 flex gap-0.5" aria-hidden="true">
        {[1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={cn('h-1.5 w-1.5 rounded-full', i <= meta.rank ? 'bg-current' : 'bg-current/20')}
          />
        ))}
      </span>
    </span>
  );
}
