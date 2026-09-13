import type { SafetyCheck } from '@/lib/types';
import { cn } from '@/lib/cn';
import { ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';

export function SafetyPill({ status, className }: { status: SafetyCheck['status']; className?: string }) {
  if (status === 'ok') {
    return (
      <span className={cn('chip border-sage-200 bg-sage-50 text-sage-700', className)}>
        <ShieldCheck className="h-3.5 w-3.5" /> No flags for you
      </span>
    );
  }
  if (status === 'caution') {
    return (
      <span className={cn('chip border-turmeric-200 bg-turmeric-50 text-turmeric-700', className)}>
        <ShieldAlert className="h-3.5 w-3.5" /> Use with caution
      </span>
    );
  }
  return (
    <span className={cn('chip border-clay-300 bg-clay-50 text-clay-700', className)}>
      <ShieldX className="h-3.5 w-3.5" /> Not suitable for you
    </span>
  );
}
