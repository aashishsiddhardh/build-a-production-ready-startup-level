import { Info } from 'lucide-react';
import { SAFETY_DISCLAIMER } from '@/lib/constants';
import { cn } from '@/lib/cn';

export function Disclaimer({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <div
      className={cn(
        'flex gap-3 rounded-xl border border-sage-200 bg-sage-50/60 p-4 text-sm text-ink-600',
        className,
      )}
    >
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-sage-600" />
      <p className={compact ? 'text-xs leading-relaxed' : 'leading-relaxed'}>{SAFETY_DISCLAIMER}</p>
    </div>
  );
}
