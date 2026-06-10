/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { FileText, Users, BarChart3, Settings, RefreshCw, ChevronRight, Search, CheckCircle, Clock, AlertCircle, XCircle, Plus } from 'lucide-react';
import type { ApplicationStatus } from '../types';

interface Props { token: string; appendLog?: (msg: string) => void; }

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  submitted: 'Submitted', under_review: 'Under Review', shortlisted: 'Shortlisted',
  interview_scheduled: 'Interview', admitted: 'Admitted', rejected: 'Rejected', waitlisted: 'Waitlisted'
};

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  submitted: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  under_review: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  shortlisted: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  interview_scheduled: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  admitted: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  waitlisted: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
};

const VALID_NEXT: Record<ApplicationStatus, ApplicationStatus[]> = {
  submitted: ['under_review', 'rejected'],
  under_review: ['shortlisted', 'rejected'],
  shortlisted: ['interview_scheduled', 'admitted', 'waitlisted', 'rejected'],
  interview_scheduled: ['admitted', 'waitlisted', 'rejected'],
  admitted: ['waitlisted'],
  waitlisted: ['admitted', 'rejected'],
  rejected: [],
};

export default function AdminAdmissionsEngine({ token, appendLog }: Props) {
  const [activeTab, setActiveTab] = useState<'applications' | 'stats' | 'enrollment' | 'config'>('applications');
  const [applications, setApplications] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<ApplicationStatus | 'all'>('all');
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [advancingId, setAdvancingId] = useState<string | null>(null);
  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [appRes, statsRes, progRes] = await Promise.all([
          fetch('/api/admissions', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/admissions/stats', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/programs', { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        if (appRes.ok) setApplications(await appRes.json());
        if (statsRes.ok) setStats(await statsRes.json());
        if (progRes.ok) setPrograms(await progRes.json());
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    load();
  }, [token, refreshTrigger]);

  const handleAdvance = async (id: string, toStatus: ApplicationStatus) => {
    setAdvancingId(id);
    try {
      const res = await fetch(`/api/admissions/${id}/advance`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: toStatus })
      });
      if (res.ok) {
        appendLog?.(`[Admissions] Application ${id} → ${toStatus}`);
        setRefreshTrigger(r => r + 1);
        setSelectedApp(null);
      }
    } catch (e) { console.error(e); }
    finally { setAdvancingId(null); }
  };

  const handleEnroll = async (id: string) => {
    setEnrollingId(id);
    try {
      const res = await fetch(`/api/admissions/${id}/enroll`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        appendLog?.(`[Admissions] Enrolled: ${data.student?.regNumber}`);
        alert(`Student enrolled! Registration number: ${data.student?.regNumber}`);
        setRefreshTrigger(r => r + 1);
      }
    } catch (e) { console.error(e); }
    finally { setEnrollingId(null); }
  };

  const filtered = applications.filter(a => {
    const matchSearch = !search || a.applicantName?.toLowerCase().includes(search.toLowerCase()) || a.refNumber?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || a.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const getProgramName = (id: string) => programs.find(p => p.id === id)?.name || id;

  return (
    <div className="h-full flex flex-col">
      {/* Tabs */}
      <div className="flex items-center gap-1 px-4 pt-4 border-b border-slate-200 dark:border-slate-700">
        {[
          { id: 'applications', label: 'Applications', icon: FileText },
          { id: 'stats', label: 'Funnel Analytics', icon: BarChart3 },
          { id: 'enrollment', label: 'Ready to Enroll', icon: Users },
          { id: 'config', label: 'Configuration', icon: Settings },
        ].map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id as any)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors ${activeTab === id ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}>
            <Icon className="w-3.5 h-3.5" />{label}
          </button>
        ))}
        <div className="ml-auto">
          <button onClick={() => setRefreshTrigger(r => r + 1)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400"><RefreshCw className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* ── Applications Tab ── */}
        {activeTab === 'applications' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search applicant or ref number..."
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 focus:outline-none">
                <option value="all">All Statuses</option>
                {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>

            {loading ? (
              <div className="py-8 text-center text-slate-400 text-sm">Loading applications...</div>
            ) : filtered.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-sm">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p>No applications found</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                  {filtered.map(app => (
                    <div key={app.id} className={`px-4 py-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${selectedApp?.id === app.id ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}
                      onClick={() => setSelectedApp(selectedApp?.id === app.id ? null : app)}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{app.applicantName}</p>
                          <p className="text-xs text-slate-500">{app.refNumber} · {getProgramName(app.programId)}</p>
                          <p className="text-xs text-slate-400">{app.applicantEmail}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[app.status as ApplicationStatus]}`}>{STATUS_LABELS[app.status as ApplicationStatus]}</span>
                          <span className="text-xs text-slate-400">{new Date(app.submittedAt).toLocaleDateString()}</span>
                          <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${selectedApp?.id === app.id ? 'rotate-90' : ''}`} />
                        </div>
                      </div>

                      {/* Expanded detail */}
                      {selectedApp?.id === app.id && (
                        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-3">
                          <div className="grid grid-cols-3 gap-3 text-xs">
                            <div><span className="text-slate-500">Phone:</span> <span className="text-slate-700 dark:text-slate-300">{app.applicantPhone || '—'}</span></div>
                            <div><span className="text-slate-500">Entrance Score:</span> <span className="text-slate-700 dark:text-slate-300">{app.entranceScore ?? '—'}</span></div>
                            <div><span className="text-slate-500">Documents:</span> <span className="text-slate-700 dark:text-slate-300">{app.documents?.length || 0} uploaded</span></div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {VALID_NEXT[app.status as ApplicationStatus]?.map(next => (
                              <button key={next} onClick={e => { e.stopPropagation(); handleAdvance(app.id, next); }}
                                disabled={advancingId === app.id}
                                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 ${next === 'admitted' ? 'bg-green-600 text-white hover:bg-green-700' : next === 'rejected' ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
                                {advancingId === app.id ? 'Moving...' : `→ ${STATUS_LABELS[next]}`}
                              </button>
                            ))}
                            {app.status === 'admitted' && (
                              <button onClick={e => { e.stopPropagation(); handleEnroll(app.id); }}
                                disabled={enrollingId === app.id}
                                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-1">
                                <Users className="w-3.5 h-3.5" />{enrollingId === app.id ? 'Enrolling...' : 'Enroll as Student'}
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Stats Tab ── */}
        {activeTab === 'stats' && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Application Funnel</h2>
            {!stats ? (
              <div className="py-8 text-center text-slate-400 text-sm">Loading stats...</div>
            ) : (
              <>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: 'Total Applications', value: stats.total, color: 'bg-slate-50 border-slate-200 text-slate-700' },
                    { label: 'Admitted', value: stats.admitted, color: 'bg-green-50 border-green-200 text-green-700' },
                    { label: 'Pending Review', value: stats.submitted + stats.under_review, color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
                    { label: 'Conversion Rate', value: `${stats.conversionRate}%`, color: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className={`p-4 rounded-xl border ${color} dark:bg-slate-800 dark:border-slate-700`}>
                      <p className="text-xs font-medium mb-1">{label}</p>
                      <p className="text-2xl font-bold">{value}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
                  <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Status Breakdown</h3>
                  {Object.entries(STATUS_LABELS).map(([status, label]) => {
                    const count = stats[status] || 0;
                    const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
                    return (
                      <div key={status} className="flex items-center gap-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium w-28 text-center ${STATUS_COLORS[status as ApplicationStatus]}`}>{label}</span>
                        <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300 w-8 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Enrollment Tab ── */}
        {activeTab === 'enrollment' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-500">Admitted applicants whose fee payment and document verification are complete are ready to be enrolled as students.</p>
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {applications.filter(a => a.status === 'admitted').length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-sm">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p>No admitted applicants pending enrollment</p>
                  </div>
                ) : applications.filter(a => a.status === 'admitted').map(app => (
                  <div key={app.id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{app.applicantName}</p>
                      <p className="text-xs text-slate-500">{app.refNumber} · {getProgramName(app.programId)}</p>
                    </div>
                    <button onClick={() => handleEnroll(app.id)} disabled={enrollingId === app.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50">
                      <Users className="w-3.5 h-3.5" />{enrollingId === app.id ? 'Enrolling...' : 'Enroll'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Config Tab ── */}
        {activeTab === 'config' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 text-center text-slate-400 text-sm">
              <Settings className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>Admissions configuration</p>
              <p className="text-xs mt-1">Configure intake capacity, application open/close dates, and required documents per program in the Academic Configuration module</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
