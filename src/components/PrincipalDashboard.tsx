/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Users, GraduationCap, Wallet, Bell, LogOut, RefreshCw, MessageSquare, User, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
import CommunicationsHub from './CommunicationsHub';
import ProfilePage from './ProfilePage';

interface Props { token: string; user: any; onLogout: () => void; appendLog?: (msg: string) => void; }

export default function PrincipalDashboard({ token, user, onLogout, appendLog }: Props) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'staff' | 'students' | 'finance' | 'announcements' | 'communications' | 'profile'>('dashboard');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [announcement, setAnnouncement] = useState('');
  const [posting, setPosting] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [stuRes, staffRes, finRes] = await Promise.all([
          fetch('/api/students', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/staff', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/finance/summary', { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const stuData = stuRes.ok ? await stuRes.json() : {};
        const staffData = staffRes.ok ? await staffRes.json() : [];
        const finData = finRes.ok ? await finRes.json() : {};
        setData({ students: stuData.students || stuData, staff: staffData, finance: finData });
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    load();
  }, [token, refreshTrigger]);

  const students = data?.students || [];
  const staff = data?.staff || [];
  const finance = data?.finance || {};
  const activeStudents = students.filter((s: any) => s.status === 'active' || s.status === 'Active');

  const handlePostAnnouncement = async () => {
    if (!announcement.trim()) return;
    setPosting(true);
    try {
      await fetch('/api/communications/broadcast', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: announcement, type: 'announcement' })
      });
      setAnnouncement('');
      appendLog?.('[Principal] Announcement posted');
    } catch (e) { console.error(e); }
    finally { setPosting(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      <div className="w-56 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white text-xs font-bold">P</div>
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">Principal</p>
              <p className="text-[10px] text-slate-500 truncate">{user?.name}</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-2 space-y-0.5">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
            { id: 'staff', label: 'Staff Summary', icon: Users },
            { id: 'students', label: 'Students', icon: GraduationCap },
            { id: 'finance', label: 'Finance Summary', icon: Wallet },
            { id: 'announcements', label: 'Announcements', icon: Bell },
            { id: 'communications', label: 'Messages', icon: MessageSquare },
            { id: 'profile', label: 'Profile', icon: User },
          ].map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id as any)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${activeTab === id ? 'bg-rose-50 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700'}`}>
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
              <div>
                <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Principal Dashboard</h1>
                <p className="text-xs text-slate-500 mt-0.5">{user?.school?.name || 'Institution Overview'}</p>
              </div>
              <button onClick={() => setRefreshTrigger(r => r + 1)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"><RefreshCw className="w-4 h-4" /></button>
            </div>

            {/* KPI Banner */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Total Enrolled', value: students.length, color: 'bg-indigo-50 border-indigo-200 text-indigo-700', icon: GraduationCap },
                { label: 'Active Students', value: activeStudents.length, color: 'bg-green-50 border-green-200 text-green-700', icon: CheckCircle },
                { label: 'Total Staff', value: staff.length, color: 'bg-blue-50 border-blue-200 text-blue-700', icon: Users },
                { label: 'Outstanding Fees', value: finance.totalOutstanding ? `KES ${finance.totalOutstanding.toLocaleString()}` : '—', color: 'bg-red-50 border-red-200 text-red-700', icon: AlertCircle },
              ].map(({ label, value, color, icon: Icon }) => (
                <div key={label} className={`p-4 rounded-xl border ${color} dark:bg-slate-800 dark:border-slate-700`}>
                  <div className="flex items-center gap-1.5 mb-1"><Icon className="w-3.5 h-3.5" /><span className="text-xs font-medium">{label}</span></div>
                  <p className="text-2xl font-bold">{loading ? '—' : value}</p>
                </div>
              ))}
            </div>

            {/* Quick announcement */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-3">Post Announcement</h2>
              <div className="flex gap-2">
                <textarea value={announcement} onChange={e => setAnnouncement(e.target.value)} rows={2}
                  placeholder="Type an announcement to broadcast to all students and staff..."
                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none" />
                <button onClick={handlePostAnnouncement} disabled={posting || !announcement.trim()}
                  className="px-4 py-2 bg-rose-600 text-white text-xs font-semibold rounded-lg hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed self-end">
                  {posting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'staff' && (
          <div className="p-6 space-y-4">
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Staff Summary</h1>
            <div className="grid grid-cols-2 gap-3">
              {staff.map((s: any) => (
                <div key={s.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{s.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{s.email} · {s.role}</p>
                </div>
              ))}
              {staff.length === 0 && <div className="col-span-2 text-center text-slate-400 py-8 text-sm">No staff records</div>}
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <div className="p-6 space-y-4">
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Students Overview</h1>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-white dark:bg-slate-800 rounded-xl border p-4"><p className="text-xs text-slate-500">Total Enrolled</p><p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{students.length}</p></div>
              <div className="bg-white dark:bg-slate-800 rounded-xl border p-4"><p className="text-xs text-slate-500">Active</p><p className="text-2xl font-bold text-green-600">{activeStudents.length}</p></div>
              <div className="bg-white dark:bg-slate-800 rounded-xl border p-4"><p className="text-xs text-slate-500">Graduated</p><p className="text-2xl font-bold text-purple-600">{students.filter((s: any) => s.academicState === 'GRADUATED').length}</p></div>
            </div>
          </div>
        )}

        {activeTab === 'finance' && (
          <div className="p-6 space-y-4">
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Finance Summary</h1>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                <p className="text-xs text-slate-500 mb-1">Total Collected</p>
                <p className="text-2xl font-bold text-green-600">KES {(finance.totalCollected || 0).toLocaleString()}</p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                <p className="text-xs text-slate-500 mb-1">Total Outstanding</p>
                <p className="text-2xl font-bold text-red-600">KES {(finance.totalOutstanding || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'communications' && <CommunicationsHub token={token} user={user} isPhoneFrame={false} />}
        {activeTab === 'profile' && <ProfilePage token={token} user={user} onBack={() => setActiveTab('dashboard')} />}
      </div>
    </div>
  );
}
