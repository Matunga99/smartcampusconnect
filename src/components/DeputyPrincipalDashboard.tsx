/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Users, AlertTriangle, Calendar, LogOut, RefreshCw, MessageSquare, User, Shield, CheckCircle } from 'lucide-react';
import CommunicationsHub from './CommunicationsHub';
import ProfilePage from './ProfilePage';

interface Props { token: string; user: any; onLogout: () => void; appendLog?: (msg: string) => void; }

export default function DeputyPrincipalDashboard({ token, user, onLogout, appendLog }: Props) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'staff_attendance' | 'discipline' | 'academic_ops' | 'communications' | 'profile'>('dashboard');
  const [staff, setStaff] = useState<any[]>([]);
  const [discipline, setDiscipline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // New discipline record form
  const [newIncident, setNewIncident] = useState({ studentId: '', type: '', description: '', actionTaken: '' });
  const [savingIncident, setSavingIncident] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [staffRes, discRes] = await Promise.all([
          fetch('/api/staff', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/sis/discipline', { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        if (staffRes.ok) setStaff(await staffRes.json());
        if (discRes.ok) {
          const d = await discRes.json();
          setDiscipline(Array.isArray(d) ? d : d.records || []);
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    load();
  }, [token, refreshTrigger]);

  const openCases = discipline.filter(d => !d.resolvedAt);

  const handleSaveIncident = async () => {
    if (!newIncident.studentId || !newIncident.type || !newIncident.description) return;
    setSavingIncident(true);
    try {
      const res = await fetch(`/api/sis/${newIncident.studentId}/discipline`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newIncident, incidentDate: new Date().toISOString().split('T')[0] })
      });
      if (res.ok) {
        setNewIncident({ studentId: '', type: '', description: '', actionTaken: '' });
        setRefreshTrigger(r => r + 1);
      }
    } catch (e) { console.error(e); }
    finally { setSavingIncident(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      <div className="w-56 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center text-white text-xs font-bold">D</div>
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">Deputy Principal</p>
              <p className="text-[10px] text-slate-500 truncate">{user?.name}</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-2 space-y-0.5">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Shield },
            { id: 'staff_attendance', label: 'Staff Attendance', icon: Users },
            { id: 'discipline', label: 'Discipline Records', icon: AlertTriangle },
            { id: 'academic_ops', label: 'Academic Ops', icon: Calendar },
            { id: 'communications', label: 'Messages', icon: MessageSquare },
            { id: 'profile', label: 'Profile', icon: User },
          ].map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id as any)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${activeTab === id ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700'}`}>
              <Icon className="w-4 h-4" />{label}
            </button>
          ))}
        </nav>
        <div className="p-2 border-t border-slate-200 dark:border-slate-700">
          <button onClick={onLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'dashboard' && (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Deputy Principal Dashboard</h1>
              <button onClick={() => setRefreshTrigger(r => r + 1)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"><RefreshCw className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Total Staff', value: staff.length, color: 'bg-blue-50 border-blue-200 text-blue-700' },
                { label: 'Open Discipline Cases', value: openCases.length, color: 'bg-red-50 border-red-200 text-red-700' },
                { label: 'Total Discipline Records', value: discipline.length, color: 'bg-amber-50 border-amber-200 text-amber-700' },
              ].map(({ label, value, color }) => (
                <div key={label} className={`p-4 rounded-xl border ${color} dark:bg-slate-800 dark:border-slate-700`}>
                  <p className="text-xs font-medium mb-1">{label}</p>
                  <p className="text-2xl font-bold">{loading ? '—' : value}</p>
                </div>
              ))}
            </div>

            {/* Open discipline cases */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Open Discipline Cases</h2>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {openCases.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                    <span>No open discipline cases</span>
                  </div>
                ) : openCases.slice(0, 5).map(d => (
                  <div key={d.id} className="px-4 py-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{d.studentName || `Student ${d.studentId}`}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{d.type} · {d.incidentDate}</p>
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{d.description}</p>
                      </div>
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Open</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'discipline' && (
          <div className="p-6 space-y-4">
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Discipline Records</h1>

            {/* Add new record */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Record New Incident</h3>
              <div className="grid grid-cols-2 gap-3">
                <input value={newIncident.studentId} onChange={e => setNewIncident(n => ({ ...n, studentId: e.target.value }))}
                  placeholder="Student ID" className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                <input value={newIncident.type} onChange={e => setNewIncident(n => ({ ...n, type: e.target.value }))}
                  placeholder="Incident type (e.g. Misconduct)" className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500" />
              </div>
              <textarea value={newIncident.description} onChange={e => setNewIncident(n => ({ ...n, description: e.target.value }))}
                placeholder="Description of incident..." rows={2}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none" />
              <input value={newIncident.actionTaken} onChange={e => setNewIncident(n => ({ ...n, actionTaken: e.target.value }))}
                placeholder="Action taken" className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500" />
              <button onClick={handleSaveIncident} disabled={savingIncident || !newIncident.studentId || !newIncident.type}
                className="px-4 py-2 bg-amber-600 text-white text-xs font-semibold rounded-lg hover:bg-amber-700 disabled:opacity-50">
                {savingIncident ? 'Saving...' : 'Record Incident'}
              </button>
            </div>

            {/* All records */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {discipline.length === 0 ? <div className="p-8 text-center text-slate-400 text-sm">No discipline records</div>
                  : discipline.map(d => (
                    <div key={d.id} className="px-4 py-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{d.studentName || `Student ${d.studentId}`}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{d.type} · {d.incidentDate}</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${d.resolvedAt ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{d.resolvedAt ? 'Resolved' : 'Open'}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'staff_attendance' && (
          <div className="p-6 space-y-4">
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Staff Attendance</h1>
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {staff.length === 0 ? <div className="p-8 text-center text-slate-400 text-sm">No staff records</div>
                  : staff.map((s: any) => (
                    <div key={s.id} className="flex items-center justify-between px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{s.name}</p>
                        <p className="text-xs text-slate-500">{s.role}</p>
                      </div>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Active</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'academic_ops' && (
          <div className="p-6 space-y-4">
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Academic Operations</h1>
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 text-center text-slate-400 text-sm">
              <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>Academic calendar, term progress, and upcoming exam schedule</p>
              <p className="text-xs mt-1">Manage academic periods in School Admin → Academic Configuration</p>
            </div>
          </div>
        )}

        {activeTab === 'communications' && <CommunicationsHub token={token} user={user} isPhoneFrame={false} />}
        {activeTab === 'profile' && <ProfilePage token={token} user={user} onBack={() => setActiveTab('dashboard')} />}
      </div>
    </div>
  );
}
