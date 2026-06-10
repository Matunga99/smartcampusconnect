/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GraduationCap, BookOpen, FlaskConical, BarChart3, LogOut, RefreshCw, MessageSquare, User, ChevronRight } from 'lucide-react';
import CommunicationsHub from './CommunicationsHub';
import ProfilePage from './ProfilePage';

interface Props { token: string; user: any; onLogout: () => void; appendLog?: (msg: string) => void; }

export default function DeanDashboard({ token, user, onLogout, appendLog }: Props) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'programs' | 'research' | 'analytics' | 'communications' | 'profile'>('dashboard');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [progRes, researchRes] = await Promise.all([
          fetch('/api/programs', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/research', { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const programs = progRes.ok ? await progRes.json() : [];
        const research = researchRes.ok ? await researchRes.json() : [];
        setData({ programs, research });
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    load();
  }, [token, refreshTrigger]);

  const programs = data?.programs || [];
  const research = data?.research || [];
  const activeProjects = research.filter((r: any) => r.status === 'active' || r.status === 'ongoing');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      <div className="w-56 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center text-white text-xs font-bold">D</div>
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">Dean</p>
              <p className="text-[10px] text-slate-500 truncate">{user?.name}</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-2 space-y-0.5">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'programs', label: 'Faculty Programs', icon: GraduationCap },
            { id: 'research', label: 'Research', icon: FlaskConical },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'communications', label: 'Messages', icon: MessageSquare },
            { id: 'profile', label: 'Profile', icon: User },
          ].map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id as any)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${activeTab === id ? 'bg-cyan-50 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700'}`}>
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
              <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Dean Dashboard</h1>
              <button onClick={() => setRefreshTrigger(r => r + 1)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"><RefreshCw className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Faculty Programs', value: programs.length, color: 'bg-cyan-50 border-cyan-200 text-cyan-700' },
                { label: 'Active Research Projects', value: activeProjects.length, color: 'bg-purple-50 border-purple-200 text-purple-700' },
                { label: 'Total Research Projects', value: research.length, color: 'bg-blue-50 border-blue-200 text-blue-700' },
              ].map(({ label, value, color }) => (
                <div key={label} className={`p-4 rounded-xl border ${color} dark:bg-slate-800 dark:border-slate-700`}>
                  <p className="text-xs font-medium mb-1">{label}</p>
                  <p className="text-2xl font-bold">{loading ? '—' : value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                  <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Programs</h2>
                  <button onClick={() => setActiveTab('programs')} className="text-xs text-cyan-600 hover:underline flex items-center gap-1">All <ChevronRight className="w-3 h-3" /></button>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                  {programs.slice(0, 4).map((p: any) => (
                    <div key={p.id} className="px-4 py-2.5">
                      <p className="text-xs font-medium text-slate-800 dark:text-slate-100">{p.name}</p>
                      <p className="text-[10px] text-slate-500">{p.code}</p>
                    </div>
                  ))}
                  {programs.length === 0 && <div className="px-4 py-4 text-center text-slate-400 text-xs">No programs</div>}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                  <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Research Projects</h2>
                  <button onClick={() => setActiveTab('research')} className="text-xs text-cyan-600 hover:underline flex items-center gap-1">All <ChevronRight className="w-3 h-3" /></button>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                  {activeProjects.slice(0, 4).map((r: any) => (
                    <div key={r.id} className="px-4 py-2.5">
                      <p className="text-xs font-medium text-slate-800 dark:text-slate-100">{r.title}</p>
                      <p className="text-[10px] text-slate-500">{r.piName || 'PI not assigned'}</p>
                    </div>
                  ))}
                  {activeProjects.length === 0 && <div className="px-4 py-4 text-center text-slate-400 text-xs">No active projects</div>}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'programs' && (
          <div className="p-6 space-y-4">
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Faculty Programs</h1>
            <div className="grid grid-cols-2 gap-3">
              {programs.map((p: any) => (
                <div key={p.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{p.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{p.code} · Capacity: {p.capacity || '—'}</p>
                </div>
              ))}
              {programs.length === 0 && <div className="col-span-2 text-center text-slate-400 py-8 text-sm">No programs found</div>}
            </div>
          </div>
        )}

        {activeTab === 'research' && (
          <div className="p-6 space-y-4">
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Research Projects</h1>
            <div className="space-y-3">
              {research.map((r: any) => (
                <div key={r.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{r.title}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{r.piName || 'PI not assigned'} · {r.fundingSource || 'Unfunded'}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${r.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>{r.status || 'draft'}</span>
                  </div>
                </div>
              ))}
              {research.length === 0 && <div className="text-center text-slate-400 py-8 text-sm">No research projects found</div>}
            </div>
          </div>
        )}

        {activeTab === 'communications' && <CommunicationsHub token={token} user={user} isPhoneFrame={false} />}
        {activeTab === 'profile' && <ProfilePage token={token} user={user} onBack={() => setActiveTab('dashboard')} />}
      </div>
    </div>
  );
}
