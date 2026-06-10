/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Users, BookOpen, BarChart3, Calendar, LogOut, RefreshCw, MessageSquare, User, ChevronRight } from 'lucide-react';
import CommunicationsHub from './CommunicationsHub';
import ProfilePage from './ProfilePage';

interface Props { token: string; user: any; onLogout: () => void; appendLog?: (msg: string) => void; }

export default function HODDashboard({ token, user, onLogout, appendLog }: Props) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'staff' | 'timetable' | 'performance' | 'communications' | 'profile'>('dashboard');
  const [deptData, setDeptData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const departmentId = user?.departmentId || user?.staff?.departmentId;

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/hod/dashboard${departmentId ? `?departmentId=${departmentId}` : ''}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) setDeptData(await res.json());
        else {
          // Fallback: load staff and units independently
          const [staffRes] = await Promise.all([
            fetch('/api/staff', { headers: { Authorization: `Bearer ${token}` } }),
          ]);
          if (staffRes.ok) {
            const staffAll = await staffRes.json();
            setDeptData({ staff: staffAll, units: [], students: [] });
          }
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    load();
  }, [token, refreshTrigger]);

  const staff = deptData?.staff || [];
  const units = deptData?.units || [];
  const avgGpa = deptData?.avgGpa ?? '—';
  const attendanceRate = deptData?.attendanceRate ?? '—';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      <div className="w-56 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center text-white text-xs font-bold">H</div>
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">Head of Department</p>
              <p className="text-[10px] text-slate-500 truncate">{user?.name}</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-2 space-y-0.5">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'staff', label: 'Dept Staff', icon: Users },
            { id: 'timetable', label: 'Timetable', icon: Calendar },
            { id: 'performance', label: 'Performance', icon: BookOpen },
            { id: 'communications', label: 'Messages', icon: MessageSquare },
            { id: 'profile', label: 'Profile', icon: User },
          ].map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id as any)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${activeTab === id ? 'bg-violet-50 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700'}`}>
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
              <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">HOD Dashboard</h1>
              <button onClick={() => setRefreshTrigger(r => r + 1)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"><RefreshCw className="w-4 h-4" /></button>
            </div>

            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Dept Staff', value: staff.length, color: 'bg-violet-50 border-violet-200 text-violet-700' },
                { label: 'Units This Semester', value: units.length, color: 'bg-blue-50 border-blue-200 text-blue-700' },
                { label: 'Avg Dept GPA', value: avgGpa, color: 'bg-green-50 border-green-200 text-green-700' },
                { label: 'Attendance Rate', value: typeof attendanceRate === 'number' ? `${attendanceRate}%` : attendanceRate, color: 'bg-orange-50 border-orange-200 text-orange-700' },
              ].map(({ label, value, color }) => (
                <div key={label} className={`p-4 rounded-xl border ${color} dark:bg-slate-800 dark:border-slate-700`}>
                  <p className="text-xs font-medium mb-1">{label}</p>
                  <p className="text-2xl font-bold">{loading ? '—' : value}</p>
                </div>
              ))}
            </div>

            {/* Staff list */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Department Staff</h2>
                <button onClick={() => setActiveTab('staff')} className="text-xs text-violet-600 hover:underline flex items-center gap-1">View all <ChevronRight className="w-3 h-3" /></button>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {loading ? <div className="p-4 text-center text-slate-400 text-xs">Loading...</div>
                  : staff.length === 0 ? <div className="p-6 text-center text-slate-400 text-xs">No staff in this department</div>
                  : staff.slice(0, 5).map((s: any) => (
                    <div key={s.id} className="flex items-center justify-between px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{s.name}</p>
                        <p className="text-xs text-slate-500">{s.email}</p>
                      </div>
                      <span className="text-xs text-slate-500">{s.role}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'staff' && (
          <div className="p-6 space-y-4">
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Department Staff</h1>
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {staff.length === 0 ? <div className="p-8 text-center text-slate-400 text-sm">No staff members found</div>
                  : staff.map((s: any) => (
                    <div key={s.id} className="flex items-center justify-between px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{s.name}</p>
                        <p className="text-xs text-slate-500">{s.email} · {s.role}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'timetable' && (
          <div className="p-6 space-y-4">
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Department Timetable</h1>
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 text-center text-slate-400 text-sm">
              <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>Department timetable view filtered to your units</p>
              <p className="text-xs mt-1">Full timetable management is in School Admin → Timetable Engine</p>
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="p-6 space-y-4">
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Student Performance</h1>
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 text-center text-slate-400 text-sm">
              <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>GPA distribution and pass rate analytics for your department</p>
            </div>
          </div>
        )}

        {activeTab === 'communications' && <CommunicationsHub user={user} />}
        {activeTab === 'profile' && <ProfilePage token={token} user={user} onLogout={onLogout} />}
      </div>
    </div>
  );
}
