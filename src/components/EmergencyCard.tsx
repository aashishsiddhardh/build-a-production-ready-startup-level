import { AlertTriangle, Phone, HeartPulse } from 'lucide-react';
import type { TriageResult } from '@/lib/types';

export function EmergencyCard({ triage }: { triage: TriageResult }) {
  const isEmergency = triage.level === 'emergency';
  return (
    <div
      className={
        isEmergency
          ? 'rounded-2xl border-2 border-clay-400 bg-clay-50 p-5 shadow-card sm:p-6'
          : 'rounded-2xl border-2 border-turmeric-300 bg-turmeric-50 p-5 shadow-card sm:p-6'
      }
      role="alert"
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <div
          className={
            isEmergency
              ? 'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-clay-600 text-white'
              : 'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-turmeric-500 text-white'
          }
        >
          {isEmergency ? <HeartPulse className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
        </div>
        <div className="min-w-0 flex-1">
          <span
            className={
              isEmergency
                ? 'text-[11px] font-bold uppercase tracking-wider text-clay-600'
                : 'text-[11px] font-bold uppercase tracking-wider text-turmeric-700'
            }
          >
            {isEmergency ? 'Urgent — seek care now' : 'Please check with a professional'}
          </span>
          <h3
            className={
              isEmergency
                ? 'text-lg font-semibold text-clay-900 sm:text-xl'
                : 'text-lg font-semibold text-turmeric-900 sm:text-xl'
            }
          >
            {triage.headline}
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-700">{triage.guidance}</p>

          {triage.matchedFlags.length > 0 && (
            <ul className="mt-4 space-y-2">
              {triage.matchedFlags.map((f) => (
                <li key={f.id} className="flex flex-col gap-0.5 rounded-xl bg-white/70 p-3 text-sm sm:flex-row sm:gap-2">
                  <span className="font-semibold text-ink-900">{f.label}:</span>
                  <span className="text-ink-700">{f.advice}</span>
                </li>
              ))}
            </ul>
          )}

          {isEmergency && (
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
              <a href="tel:112" className="btn bg-clay-600 text-white hover:bg-clay-700">
                <Phone className="h-4 w-4" /> Call emergency services
              </a>
              <span className="text-xs text-ink-500">
                Dial your local emergency number (e.g. 112 in the EU/India, 911 in the US, 999 in the UK).
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
