/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { FileText, Users, BookOpen, LogOut, RefreshCw, AlertCircle, CheckCircle, Clock, ChevronRight, MessageSquare, Search, Download, User } from 'lucide-react';
import CommunicationsHub from './CommunicationsHub';
import ProfilePage from './ProfilePage';

interface Props { token: string; user: any; onLogout: () => void; appendLog?: (msg: string) => void; }

export default function RegistrarDashboard({ token, user, onLogout, appendLog }: Props) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'admissions' | 'enrollments' | 'records' | 'communications' | 'profile'>('dashboard');
  const [applications, setApplications] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [appRes, stuRes] = await Promise.all([
          fetch('/api/admissions', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/students', { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        if (appRes.ok) setApplications(await appRes.json());
        if (stuRes.ok) { const d = await stuRes.json(); setStudents(d.students || d); }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    load();
  }, [token, refreshTrigger]);

  const pending = applications.filter(a => ['submitted','under_review','shortlisted','interview_scheduled'].includes(a.status));
  const admitted = applications.filter(a => a.status === 'admitted');
  const activeStudents = students.filter(s => s.status === 'active' || s.status === 'Active');

  const statusColor: Record<string, string> = {
    submitted: 'bg-blue-100 text-blue-700', under_review: 'bg-yellow-100 text-yellow-700',
    shortlisted: 'bg-purple-100 text-purple-700', interview_scheduled: 'bg-indigo-100 text-indigo-700',
    admitted: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700', waitlisted: 'bg-orange-100 text-orange-700'
  };

  const filteredStudents = students.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) || s.regNumber?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      {/* Sidebar */}
      <div className="w-56 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">R</div>
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">Registrar</p>
              <p className="text-[10px] text-slate-500 truncate">{user?.name}</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-2 space-y-0.5">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BookOpen },
            { id: 'admissions', label: 'Admissions', icon: FileText },
            { id: 'enrollments', label: 'Enrollments', icon: Users },
            { id: 'records', label: 'Academic Records', icon: BookOpen },
            { id: 'communications', label: 'Messages', icon: MessageSquare },
            { id: 'profile', label: 'Profile', icon: User },
          ].map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id as any)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${activeTab === id ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700'}`}>
              <Icon className="w-4 h-4" />{label}
            </button>
          ))}
        </nav>
        <div className="p-2 border-t border-slate-200 dark:border-slate-700">
          <button onClick={onLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'dashboard' && (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Registrar Dashboard</h1>
              <button onClick={() => setRefreshTrigger(r => r + 1)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"><RefreshCw className="w-4 h-4" /></button>
            </div>
            {/* KPI Cards */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Pending Applications', value: pending.length, color: 'bg-yellow-50 border-yellow-200 text-yellow-700', icon: Clock },
                { label: 'Admitted (Pending Enrollment)', value: admitted.length, color: 'bg-green-50 border-green-200 text-green-700', icon: CheckCircle },
                { label: 'Active Students', value: activeStudents.length, color: 'bg-indigo-50 border-indigo-200 text-indigo-700', icon: Users },
              ].map(({ label, value, color, icon: Icon }) => (
                <div key={label} className={`p-4 rounded-xl border ${color} dark:bg-slate-800 dark:border-slate-700`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-4 h-4" />
                    <span className="text-xs font-medium">{label}</span>
                  </div>
                  <p className="text-2xl font-bold">{loading ? '—' : value}</p>
                </div>
              ))}
            </div>

            {/* Admissions Queue */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Admissions Queue</h2>
                <button onClick={() => setActiveTab('admissions')} className="text-xs text-indigo-600 hover:underline flex items-center gap-1">View all <ChevronRight className="w-3 h-3" /></button>
              </div>
              {loading ? (
                <div className="p-4 text-center text-slate-400 text-xs">Loading...</div>
              ) : pending.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs">No pending applications</div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                  {pending.slice(0, 5).map(app => (
                    <div key={app.id} className="flex items-center justify-between px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{app.applicantName}</p>
                        <p className="text-xs text-slate-500">{app.refNumber}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[app.status]}`}>{app.status.replace('_', ' ')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'admissions' && (
          <div className="p-6 space-y-4">
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Applications</h1>
            {loading ? <div className="text-center text-slate-400 py-8">Loading...</div> : (
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                  {applications.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-sm">No applications yet</div>
                  ) : applications.map(app => (
                    <div key={app.id} className="flex items-center justify-between px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{app.applicantName}</p>
                        <p className="text-xs text-slate-500">{app.refNumber} · {app.applicantEmail}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[app.status] || 'bg-slate-100 text-slate-600'}`}>{app.status.replace(/_/g,' ')}</span>
                        <p className="text-xs text-slate-400">{new Date(app.submittedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'enrollments' && (
          <div className="p-6 space-y-4">
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Student Enrollment Records</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or reg number..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {filteredStudents.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-sm">No students found</div>
                ) : filteredStudents.slice(0, 20).map(s => (
                  <div key={s.id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{s.name}</p>
                      <p className="text-xs text-slate-500">{s.regNumber} · {s.programName || 'No program'}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.academicState === 'GRADUATED' ? 'bg-purple-100 text-purple-700' : s.status === 'active' || s.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {s.academicState || s.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'records' && (
          <div className="p-6 space-y-4">
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Academic Records</h1>
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 text-center text-slate-400 text-sm">
              <Download className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>Transcript generation and academic record management</p>
              <p className="text-xs mt-1">Use the Document Engine in the School Admin panel for bulk transcript generation</p>
            </div>
          </div>
        )}

        {activeTab === 'communications' && (
          <CommunicationsHub token={token} user={user} isPhoneFrame={false} />
        )}

        {activeTab === 'profile' && (
          <ProfilePage token={token} user={user} onBack={() => setActiveTab('dashboard')} />
        )}
      </div>
    </div>
  );
}
