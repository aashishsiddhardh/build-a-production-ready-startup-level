import { cn } from '@/lib/cn';

export function Logo({ className, showText = true }: { className?: string; showText?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-sage-700 shadow-soft">
        <svg viewBox="0 0 64 64" className="h-6 w-6" aria-hidden="true">
          <path d="M32 12c0 10-8 14-8 22a8 8 0 0 0 16 0c0-8-8-12-8-22Z" fill="#e2a238" />
          <path
            d="M32 44c-6-2-10-7-10-14 4 3 7 7 10 14Zm0 0c6-2 10-7 10-14-4 3-7 7-10 14Z"
            fill="#a7bf98"
          />
        </svg>
      </span>
      {showText && (
        <span className="font-serif text-xl font-semibold tracking-tight text-ink-900">
          Ayur<span className="text-sage-700">Sage</span>
        </span>
      )}
    </span>
  );
}
