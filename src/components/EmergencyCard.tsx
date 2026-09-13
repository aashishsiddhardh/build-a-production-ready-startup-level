import { AlertTriangle, Phone, HeartPulse } from 'lucide-react';
import type { TriageResult } from '@/lib/types';

export function EmergencyCard({ triage }: { triage: TriageResult }) {
  const isEmergency = triage.level === 'emergency';
  return (
    <div
      className={
        isEmergency
          ? 'rounded-2xl border-2 border-clay-400 bg-clay-50 p-6 shadow-card'
          : 'rounded-2xl border-2 border-turmeric-300 bg-turmeric-50 p-6 shadow-card'
      }
      role="alert"
    >
      <div className="flex items-start gap-4">
        <div
          className={
            isEmergency
              ? 'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-clay-600 text-white'
              : 'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-turmeric-500 text-white'
          }
        >
          {isEmergency ? <HeartPulse className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
        </div>
        <div className="flex-1">
          <h3 className={isEmergency ? 'text-xl font-semibold text-clay-900' : 'text-xl font-semibold text-turmeric-900'}>
            {triage.headline}
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-700">{triage.guidance}</p>

          {triage.matchedFlags.length > 0 && (
            <ul className="mt-4 space-y-2">
              {triage.matchedFlags.map((f) => (
                <li key={f.id} className="flex gap-2 rounded-xl bg-white/70 p-3 text-sm">
                  <span className="mt-0.5 font-semibold text-ink-900">{f.label}:</span>
                  <span className="text-ink-700">{f.advice}</span>
                </li>
              ))}
            </ul>
          )}

          {isEmergency && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
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
