import type { SafetyCheck } from '@/lib/types';
import { cn } from '@/lib/cn';
import { ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';

const STYLES = {
  ok: {
    className: 'border-sage-200 bg-sage-50 text-sage-700',
    Icon: ShieldCheck,
    label: 'No flags for you',
  },
  caution: {
    className: 'border-turmeric-200 bg-turmeric-50 text-turmeric-700',
    Icon: ShieldAlert,
    label: 'Use with caution',
  },
  blocked: {
    className: 'border-clay-300 bg-clay-50 text-clay-700',
    Icon: ShieldX,
    label: 'Not suitable for you',
  },
} as const;

export function SafetyPill({ status, className }: { status: SafetyCheck['status']; className?: string }) {
  const style = STYLES[status];
  return (
    <span
      className={cn('chip font-semibold', style.className, className)}
      role="status"
      aria-label={`Safety check: ${style.label}`}
    >
      <style.Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /> {style.label}
    </span>
  );
}
