import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { store } from '@/lib/storage';
import { logAudit } from '@/lib/audit';
import { Disclaimer } from '@/components/Disclaimer';
import { DISCLAIMER_VERSION } from '@/lib/constants';
import {
  ShieldCheck,
  Download,
  Trash2,
  FileClock,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Database,
} from 'lucide-react';
import type { AuditEntry } from '@/lib/types';

export default function PrivacyPage() {
  const { user, logout, acceptConsent } = useAuth();
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState<'data' | 'account' | null>(null);
  const [version, setVersion] = useState(0);

  const myAssessments = useMemo(() => (user ? store.getAssessmentsForUser(user.id) : []), [user, version]);
  const myAudit = useMemo<AuditEntry[]>(
    () => (user ? store.getAudit().filter((e) => e.userId === user.id).slice(0, 25) : []),
    [user, version],
  );
  const myChats = useMemo(() => (user ? store.getChats(user.id) : []), [user, version]);

  if (!user) return null;

  const exportData = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      account: { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt },
      consent: user.consent,
      assessments: myAssessments,
      chatHistory: myChats,
      auditTrail: store.getAudit().filter((e) => e.userId === user.id),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ayursage-data-${user.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
    logAudit('privacy.export', user, { assessments: myAssessments.length });
  };

  const deleteData = () => {
    store.saveAssessments(store.getAssessments().filter((a) => a.userId !== user.id));
    store.saveChats(user.id, []);
    logAudit('privacy.delete', user, { scope: 'health-data' });
    setConfirming(null);
    setVersion((v) => v + 1);
  };

  const deleteAccount = () => {
    logAudit('privacy.delete', user, { scope: 'account' });
    store.deleteUser(user.id);
    logout();
    navigate('/');
  };

  const consented = !!user.consent.disclaimerAcceptedAt;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <header className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sage-100 text-sage-700">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <h1 className="section-title">Privacy &amp; data controls</h1>
          <p className="text-sm text-ink-500">You own your data. Export it or delete it at any time.</p>
        </div>
      </header>

      {/* Consent status */}
      <section className="card mt-8 p-6">
        <h2 className="flex items-center gap-2 font-semibold text-ink-900">
          <CheckCircle2 className="h-5 w-5 text-sage-600" /> Consent status
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <InfoTile label="Disclaimer accepted" value={consented ? new Date(user.consent.disclaimerAcceptedAt!).toLocaleString() : 'Not yet accepted'} ok={consented} />
          <InfoTile label="Policy version" value={user.consent.version || DISCLAIMER_VERSION} ok />
        </div>
        {!consented && (
          <button onClick={acceptConsent} className="btn-primary mt-4 text-sm">
            Accept disclaimer &amp; data processing
          </button>
        )}
      </section>

      {/* Data summary */}
      <section className="card mt-6 p-6">
        <h2 className="flex items-center gap-2 font-semibold text-ink-900">
          <Database className="h-5 w-5 text-sage-600" /> What we store
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <StatTile label="Assessments" value={myAssessments.length} />
          <StatTile label="Chat messages" value={myChats.length} />
          <StatTile label="Audit events" value={store.getAudit().filter((e) => e.userId === user.id).length} />
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <button onClick={exportData} className="btn-outline">
            <Download className="h-4 w-4" /> Export my data (JSON)
          </button>
          <button onClick={() => setConfirming('data')} className="btn bg-turmeric-500 text-white hover:bg-turmeric-600">
            <Trash2 className="h-4 w-4" /> Delete my health data
          </button>
          <button onClick={() => setConfirming('account')} className="btn bg-clay-600 text-white hover:bg-clay-700">
            <Trash2 className="h-4 w-4" /> Delete my account
          </button>
        </div>
      </section>

      {/* Security note */}
      <section className="card mt-6 p-6">
        <h2 className="flex items-center gap-2 font-semibold text-ink-900">
          <Lock className="h-5 w-5 text-sage-600" /> Security controls
        </h2>
        <ul className="mt-3 space-y-2 text-sm text-ink-600">
          <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sage-600" /> Passwords are salted and hashed with PBKDF2 — never stored in plain text.</li>
          <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sage-600" /> Health data is scoped to your account and never shared.</li>
          <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sage-600" /> Every privacy and safety action is written to an append-only audit trail.</li>
          <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sage-600" /> In production, data is encrypted at rest and access-controlled with row-level security.</li>
        </ul>
      </section>

      {/* Personal audit log */}
      <section className="card mt-6 p-6">
        <h2 className="flex items-center gap-2 font-semibold text-ink-900">
          <FileClock className="h-5 w-5 text-sage-600" /> Your recent activity log
        </h2>
        {myAudit.length === 0 ? (
          <p className="mt-3 text-sm text-ink-500">No activity recorded yet.</p>
        ) : (
          <div className="mt-3 overflow-hidden rounded-xl border border-sage-100">
            <table className="w-full text-left text-sm">
              <thead className="bg-sage-50 text-xs uppercase tracking-wide text-ink-500">
                <tr>
                  <th className="px-4 py-2 font-semibold">When</th>
                  <th className="px-4 py-2 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sage-50">
                {myAudit.map((e) => (
                  <tr key={e.id}>
                    <td className="px-4 py-2 text-ink-500">{new Date(e.ts).toLocaleString()}</td>
                    <td className="px-4 py-2 font-medium text-ink-800">{e.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="mt-8">
        <Disclaimer />
      </div>

      {/* Confirm modal */}
      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/40 p-4" onClick={() => setConfirming(null)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-card animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 text-clay-700">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="font-serif text-xl font-semibold">
                {confirming === 'account' ? 'Delete your account?' : 'Delete your health data?'}
              </h3>
            </div>
            <p className="mt-3 text-sm text-ink-600">
              {confirming === 'account'
                ? 'This permanently removes your account, all assessments, chats and history. This cannot be undone.'
                : 'This permanently deletes all your assessments and chat history but keeps your account. This cannot be undone.'}
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setConfirming(null)} className="btn-ghost">Cancel</button>
              <button
                onClick={confirming === 'account' ? deleteAccount : deleteData}
                className="btn bg-clay-600 text-white hover:bg-clay-700"
              >
                <Trash2 className="h-4 w-4" /> Delete permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoTile({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <div className="rounded-xl border border-sage-100 bg-sage-50/40 p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-ink-400">{label}</div>
      <div className={`mt-1 text-sm font-medium ${ok ? 'text-ink-800' : 'text-turmeric-700'}`}>{value}</div>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-sage-100 bg-white p-4 text-center">
      <div className="font-serif text-3xl font-semibold text-sage-700">{value}</div>
      <div className="mt-1 text-xs font-medium uppercase tracking-wide text-ink-400">{label}</div>
    </div>
  );
}
