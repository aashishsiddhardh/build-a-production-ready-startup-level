import { useEffect, useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { useAuth } from '@/context/AuthContext';
import { store } from '@/lib/storage';
import { logAudit } from '@/lib/audit';
import { HERBS } from '@/data/herbs';
import { CONCERN_MAP, CONCERNS } from '@/data/conditions';
import { EVIDENCE_META, type EvidenceLevel, type AuditEntry } from '@/lib/types';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  HeartPulse,
  ShieldX,
  Activity,
  Leaf,
  FileClock,
} from 'lucide-react';

const CHART_COLORS = ['#4c683c', '#d9861f', '#a85e4d', '#82a06d', '#e2a238', '#63834e', '#c48d6f'];

export default function AdminPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<'overview' | 'knowledge' | 'audit' | 'users'>('overview');

  useEffect(() => {
    if (user) logAudit('admin.view', user, { tab });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const users = store.getUsers();
  const assessments = store.getAssessments();
  const audit = store.getAudit();

  const stats = useMemo(() => {
    const emergencies = assessments.filter((a) => a.triage.level === 'emergency').length;
    const urgent = assessments.filter((a) => a.triage.level === 'urgent').length;
    const totalRecs = assessments.reduce((s, a) => s + a.recommendations.length, 0);
    const withheld = assessments.reduce((s, a) => s + a.withheldForSafety.length, 0);
    const avgRecs = assessments.length ? (totalRecs / assessments.length).toFixed(1) : '0';
    return { emergencies, urgent, totalRecs, withheld, avgRecs };
  }, [assessments]);

  const concernData = useMemo(() => {
    const counts = new Map<string, number>();
    for (const a of assessments) for (const c of a.concerns) counts.set(c, (counts.get(c) ?? 0) + 1);
    return CONCERNS.map((c) => ({ name: c.label, value: counts.get(c.id) ?? 0 }))
      .filter((d) => d.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [assessments]);

  const triageData = useMemo(() => {
    const levels = ['self-care', 'urgent', 'emergency'] as const;
    return levels
      .map((l) => ({ name: l, value: assessments.filter((a) => a.triage.level === l).length }))
      .filter((d) => d.value > 0);
  }, [assessments]);

  const evidenceData = useMemo(() => {
    const order: EvidenceLevel[] = ['traditional', 'preclinical', 'preliminary-clinical', 'moderate-clinical'];
    return order.map((e) => ({ name: EVIDENCE_META[e].label, value: HERBS.filter((h) => h.evidence === e).length }));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sage-700 text-white">
          <LayoutDashboard className="h-5 w-5" />
        </div>
        <div>
          <h1 className="section-title">Admin dashboard</h1>
          <p className="text-sm text-ink-500">Operational overview · knowledge base · audit trail</p>
        </div>
      </header>

      {/* Tabs */}
      <div className="mt-6 flex flex-wrap gap-1 border-b border-sage-100">
        {([
          ['overview', 'Overview', Activity],
          ['knowledge', 'Knowledge base', Leaf],
          ['audit', 'Audit log', FileClock],
          ['users', 'Users', Users],
        ] as const).map(([id, label, Icon]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={
              tab === id
                ? 'flex items-center gap-1.5 border-b-2 border-sage-600 px-4 py-2.5 text-sm font-semibold text-sage-700'
                : 'flex items-center gap-1.5 border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-ink-500 hover:text-ink-800'
            }
          >
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="mt-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Metric icon={Users} label="Users" value={users.length} tone="sage" />
            <Metric icon={ClipboardList} label="Assessments" value={assessments.length} tone="sage" />
            <Metric icon={Activity} label="Avg suggestions" value={stats.avgRecs} tone="sage" />
            <Metric icon={ShieldX} label="Herbs withheld" value={stats.withheld} tone="turmeric" />
            <Metric icon={HeartPulse} label="Emergency triages" value={stats.emergencies} tone="clay" />
            <Metric icon={HeartPulse} label="Urgent triages" value={stats.urgent} tone="turmeric" />
            <Metric icon={Leaf} label="KB entries" value={HERBS.length} tone="sage" />
            <Metric icon={FileClock} label="Audit events" value={audit.length} tone="sage" />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <ChartCard title="Top concerns" subtitle="Across all assessments">
              {concernData.length ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={concernData} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5ecdf" horizontal={false} />
                    <XAxis type="number" stroke="#88897c" fontSize={12} allowDecimals={false} />
                    <YAxis type="category" dataKey="name" width={120} stroke="#88897c" fontSize={11} />
                    <Tooltip cursor={{ fill: '#f4f7f2' }} />
                    <Bar dataKey="value" fill="#4c683c" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart />
              )}
            </ChartCard>

            <ChartCard title="Triage distribution" subtitle="Safety routing outcomes">
              {triageData.length ? (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={triageData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                      {triageData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart />
              )}
            </ChartCard>
          </div>

          <ChartCard title="Knowledge base evidence distribution" subtitle="How many entries at each evidence tier">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={evidenceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5ecdf" vertical={false} />
                <XAxis dataKey="name" stroke="#88897c" fontSize={12} />
                <YAxis stroke="#88897c" fontSize={12} allowDecimals={false} />
                <Tooltip cursor={{ fill: '#f4f7f2' }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {evidenceData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}

      {tab === 'knowledge' && <KnowledgeTable />}
      {tab === 'audit' && <AuditTable audit={audit} />}
      {tab === 'users' && <UsersTable />}
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Users;
  label: string;
  value: number | string;
  tone: 'sage' | 'turmeric' | 'clay';
}) {
  const toneClass =
    tone === 'clay' ? 'bg-clay-100 text-clay-700' : tone === 'turmeric' ? 'bg-turmeric-100 text-turmeric-700' : 'bg-sage-100 text-sage-700';
  return (
    <div className="card p-5">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${toneClass}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="mt-3 font-serif text-3xl font-semibold text-ink-900">{value}</div>
      <div className="text-xs font-medium uppercase tracking-wide text-ink-400">{label}</div>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card p-6">
      <h3 className="font-semibold text-ink-900">{title}</h3>
      <p className="text-xs text-ink-400">{subtitle}</p>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-[280px] items-center justify-center text-sm text-ink-400">
      No data yet — take an assessment to populate analytics.
    </div>
  );
}

function KnowledgeTable() {
  return (
    <div className="mt-6 card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-sage-50 text-xs uppercase tracking-wide text-ink-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Type</th>
              <th className="px-4 py-3 font-semibold">Evidence</th>
              <th className="px-4 py-3 font-semibold">Targets</th>
              <th className="px-4 py-3 font-semibold">Contra.</th>
              <th className="px-4 py-3 font-semibold">Interactions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sage-50">
            {HERBS.map((h) => (
              <tr key={h.id} className="hover:bg-sage-50/40">
                <td className="px-4 py-3">
                  <div className="font-medium text-ink-900">{h.commonName}</div>
                  <div className="text-xs italic text-ink-400">{h.latinName}</div>
                </td>
                <td className="px-4 py-3 capitalize text-ink-600">{h.category}</td>
                <td className="px-4 py-3">
                  <span className="rounded-md bg-sage-50 px-2 py-0.5 text-xs font-medium text-sage-700">
                    {EVIDENCE_META[h.evidence].label}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-ink-600">
                  {h.targets.map((t) => CONCERN_MAP[t]?.label ?? t).join(', ')}
                </td>
                <td className="px-4 py-3 text-center tabular-nums text-ink-600">{h.contraindications.length}</td>
                <td className="px-4 py-3 text-center tabular-nums text-ink-600">{h.interactions.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AuditTable({ audit }: { audit: AuditEntry[] }) {
  const [filter, setFilter] = useState('');
  const filtered = audit.filter(
    (e) => !filter || e.action.includes(filter) || (e.actorEmail ?? '').includes(filter),
  );
  return (
    <div className="mt-6">
      <input
        className="input mb-4 max-w-xs"
        placeholder="Filter by action or email…"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      <div className="card overflow-hidden">
        <div className="max-h-[520px] overflow-y-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-sage-50 text-xs uppercase tracking-wide text-ink-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Timestamp</th>
                <th className="px-4 py-3 font-semibold">Actor</th>
                <th className="px-4 py-3 font-semibold">Action</th>
                <th className="px-4 py-3 font-semibold">Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sage-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-ink-400">No audit events.</td>
                </tr>
              ) : (
                filtered.map((e) => (
                  <tr key={e.id} className="hover:bg-sage-50/40">
                    <td className="whitespace-nowrap px-4 py-2.5 text-ink-500">{new Date(e.ts).toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-ink-700">{e.actorEmail ?? '—'}</td>
                    <td className="px-4 py-2.5">
                      <span className="rounded-md bg-ink-50 px-2 py-0.5 text-xs font-medium text-ink-700">{e.action}</span>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-ink-500">
                      {Object.entries(e.meta).length
                        ? Object.entries(e.meta).map(([k, v]) => `${k}=${v}`).join(', ')
                        : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function UsersTable() {
  const users = store.getUsers();
  const assessments = store.getAssessments();
  return (
    <div className="mt-6 card overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead className="bg-sage-50 text-xs uppercase tracking-wide text-ink-500">
          <tr>
            <th className="px-4 py-3 font-semibold">Name</th>
            <th className="px-4 py-3 font-semibold">Email</th>
            <th className="px-4 py-3 font-semibold">Role</th>
            <th className="px-4 py-3 font-semibold">Joined</th>
            <th className="px-4 py-3 font-semibold">Assessments</th>
            <th className="px-4 py-3 font-semibold">Consent</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-sage-50">
          {users.map((u) => (
            <tr key={u.id} className="hover:bg-sage-50/40">
              <td className="px-4 py-3 font-medium text-ink-900">{u.name}</td>
              <td className="px-4 py-3 text-ink-600">{u.email}</td>
              <td className="px-4 py-3">
                <span
                  className={
                    u.role === 'admin'
                      ? 'rounded-md bg-turmeric-50 px-2 py-0.5 text-xs font-semibold text-turmeric-700'
                      : 'rounded-md bg-sage-50 px-2 py-0.5 text-xs font-semibold text-sage-700'
                  }
                >
                  {u.role}
                </span>
              </td>
              <td className="px-4 py-3 text-ink-500">{new Date(u.createdAt).toLocaleDateString()}</td>
              <td className="px-4 py-3 text-center tabular-nums text-ink-600">
                {assessments.filter((a) => a.userId === u.id).length}
              </td>
              <td className="px-4 py-3">
                {u.consent.disclaimerAcceptedAt ? (
                  <span className="text-xs font-medium text-sage-700">Accepted</span>
                ) : (
                  <span className="text-xs font-medium text-turmeric-700">Pending</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
