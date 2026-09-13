import type { TriageResult } from '@/types'
import { AlertTriangle, Phone, ShieldCheck, Info } from 'lucide-react'

export function MedicalDisclaimerBar() {
  return (
    <div className="border-b border-turmeric-200 bg-turmeric-50 px-4 py-2 text-center text-xs text-turmeric-900">
      <Info className="mr-1.5 -mt-0.5 inline h-3.5 w-3.5" />
      Educational Ayurvedic wellness information — <strong className="font-semibold">not medical advice</strong>. AyurSage
      does not diagnose, prescribe, or treat. In an emergency, call your local emergency number.
    </div>
  )
}

export function EmergencyBanner({ triage }: { triage: TriageResult }) {
  const isEmergency = triage.level === 'emergency' || triage.blockRecommendations
  return (
    <div
      className={`rounded-2xl border p-5 ${
        isEmergency ? 'border-red-300 bg-red-50' : 'border-turmeric-300 bg-turmeric-50'
      }`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${
            isEmergency ? 'bg-red-100 text-red-600' : 'bg-turmeric-100 text-turmeric-700'
          }`}
        >
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h3 className={`text-lg font-semibold ${isEmergency ? 'text-red-800' : 'text-turmeric-900'}`}>
            {isEmergency ? 'Please seek medical care now' : 'A clinician should review this soon'}
          </h3>
          <p className={`mt-1 text-sm ${isEmergency ? 'text-red-700' : 'text-turmeric-900'}`}>{triage.message}</p>

          {triage.matched.length > 0 && (
            <ul className="mt-3 space-y-2">
              {triage.matched.map((m) => (
                <li key={m.id} className="rounded-xl border border-red-200 bg-white/70 p-3 text-sm">
                  <p className="font-semibold text-red-800">{m.title}</p>
                  <p className="mt-0.5 text-sage-700">{m.guidance}</p>
                </li>
              ))}
            </ul>
          )}

          {isEmergency && (
            <div className="mt-4 flex flex-wrap gap-2">
              <a href="tel:911" className="btn-danger">
                <Phone className="h-4 w-4" /> Call emergency services
              </a>
              <a href="tel:988" className="btn-secondary">
                <Phone className="h-4 w-4" /> Crisis line (988 · US/Canada)
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function DisclaimerCard({ items }: { items: string[] }) {
  return (
    <div className="rounded-2xl border border-sage-200 bg-sage-50/60 p-5">
      <div className="mb-2 flex items-center gap-2 text-sage-800">
        <ShieldCheck className="h-5 w-5" />
        <h3 className="font-semibold">Important — please read</h3>
      </div>
      <ul className="space-y-2 text-sm text-sage-700">
        {items.map((d, i) => (
          <li key={i} className="flex gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sage-400" />
            <span>{d}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
