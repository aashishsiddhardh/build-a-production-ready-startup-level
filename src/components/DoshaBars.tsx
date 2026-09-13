import type { DoshaScores, Dosha } from '@/lib/types';
import { DOSHA_META } from '@/data/doshas';
import { cn } from '@/lib/cn';

export function DoshaBars({
  scores,
  dominant,
  className,
}: {
  scores: DoshaScores;
  dominant?: Dosha;
  className?: string;
}) {
  const order: Dosha[] = ['vata', 'pitta', 'kapha'];
  return (
    <div className={cn('space-y-4', className)}>
      {order.map((d) => {
        const meta = DOSHA_META[d];
        const value = scores[d];
        const isDominant = dominant === d;
        return (
          <div key={d}>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 font-medium text-ink-800">
                <span className="h-2.5 w-2.5 rounded-full ring-2 ring-white" style={{ background: meta.color }} />
                {meta.name}
                {isDominant && (
                  <span className="rounded-full bg-sage-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sage-700">
                    dominant
                  </span>
                )}
              </span>
              <span className="tabular-nums font-semibold text-ink-700">{value}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-sage-100">
              <div
                className={cn('h-full rounded-full transition-all duration-700', isDominant && 'shadow-sm')}
                style={{ width: `${value}%`, background: meta.color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
