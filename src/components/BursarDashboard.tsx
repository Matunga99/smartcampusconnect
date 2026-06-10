/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Wallet, Users, TrendingUp, LogOut, RefreshCw, ChevronRight, MessageSquare, CreditCard, AlertCircle, User, Search } from 'lucide-react';
import CommunicationsHub from './CommunicationsHub';
import ProfilePage from './ProfilePage';

interface Props { token: string; user: any; onLogout: () => void; appendLog?: (msg: string) => void; }

export default function BursarDashboard({ token, user, onLogout, appendLog }: Props) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'receipts' | 'outstanding' | 'plans' | 'communications' | 'profile'>('dashboard');
  const [financeData, setFinanceData] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [finRes, stuRes] = await Promise.all([
          fetch('/api/finance/summary', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/students', { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        if (finRes.ok) setFinanceData(await finRes.json());
        if (stuRes.ok) { const d = await stuRes.json(); setStudents(d.students || d); }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    load();
  }, [token, refreshTrigger]);

  const totalCollected = financeData?.totalCollected ?? 0;
  const totalOutstanding = financeData?.totalOutstanding ?? 0;
  const activePaymentPlans = financeData?.activePaymentPlans ?? 0;

  const fmt = (n: number) => new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(n);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      {/* Sidebar */}
      <div className="w-56 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white text-xs font-bold">B</div>
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">Bursar</p>
              <p className="text-[10px] text-slate-500 truncate">{user?.name}</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-2 space-y-0.5">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
            { id: 'receipts', label: 'Daily Receipts', icon: CreditCard },
            { id: 'outstanding', label: 'Outstanding', icon: AlertCircle },
            { id: 'plans', label: 'Payment Plans', icon: Wallet },
            { id: 'communications', label: 'Messages', icon: MessageSquare },
            { id: 'profile', label: 'Profile', icon: User },
          ].map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id as any)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${activeTab === id ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700'}`}>
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
              <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Bursar Dashboard</h1>
              <button onClick={() => setRefreshTrigger(r => r + 1)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"><RefreshCw className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Total Collected (All Time)", value: fmt(totalCollected), color: 'bg-emerald-50 border-emerald-200 text-emerald-700', icon: TrendingUp },
                { label: "Total Outstanding", value: fmt(totalOutstanding), color: 'bg-red-50 border-red-200 text-red-700', icon: AlertCircle },
                { label: "Active Payment Plans", value: activePaymentPlans, color: 'bg-blue-50 border-blue-200 text-blue-700', icon: Wallet },
              ].map(({ label, value, color, icon: Icon }) => (
                <div key={label} className={`p-4 rounded-xl border ${color} dark:bg-slate-800 dark:border-slate-700`}>
                  <div className="flex items-center gap-2 mb-1"><Icon className="w-4 h-4" /><span className="text-xs font-medium">{label}</span></div>
                  <p className="text-xl font-bold">{loading ? '—' : value}</p>
                </div>
              ))}
            </div>

            {/* Students with outstanding balances */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Students with Outstanding Balances</h2>
                <button onClick={() => setActiveTab('outstanding')} className="text-xs text-emerald-600 hover:underline flex items-center gap-1">View all <ChevronRight className="w-3 h-3" /></button>
              </div>
              {loading ? <div className="p-4 text-center text-slate-400 text-xs">Loading...</div> : (
                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                  {students.slice(0, 5).map(s => (
                    <div key={s.id} className="flex items-center justify-between px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{s.name}</p>
                        <p className="text-xs text-slate-500">{s.regNumber}</p>
                      </div>
                      <span className="text-xs font-medium text-red-600">Balance pending</span>
                    </div>
                  ))}
                  {students.length === 0 && <div className="p-4 text-center text-slate-400 text-xs">No students found</div>}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'outstanding' && (
          <div className="p-6 space-y-4">
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Outstanding Balances</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search student..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-700">
                  <tr>{['Student', 'Reg Number', 'Program', 'Status'].map(h => <th key={h} className="text-left px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {students.filter(s => s.name?.toLowerCase().includes(search.toLowerCase()) || s.regNumber?.includes(search)).slice(0, 15).map(s => (
                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <td className="px-4 py-2.5 font-medium text-slate-800 dark:text-slate-100">{s.name}</td>
                      <td className="px-4 py-2.5 text-slate-500 font-mono text-xs">{s.regNumber}</td>
                      <td className="px-4 py-2.5 text-slate-500">{s.programName || '—'}</td>
                      <td className="px-4 py-2.5"><span className={`text-xs px-2 py-0.5 rounded-full ${s.status === 'active' || s.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{s.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {students.length === 0 && <div className="p-8 text-center text-slate-400 text-sm">No students found</div>}
            </div>
          </div>
        )}

        {activeTab === 'receipts' && (
          <div className="p-6 space-y-4">
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Daily Receipts</h1>
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 text-center text-slate-400 text-sm">
              <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>Payment receipts are managed in the Finance Engine</p>
              <p className="text-xs mt-1">Access via School Admin → Finance for full transaction logs</p>
            </div>
          </div>
        )}

        {activeTab === 'plans' && (
          <div className="p-6 space-y-4">
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Payment Plans</h1>
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 text-center text-slate-400 text-sm">
              <Wallet className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>Active installment plans for students</p>
              <p className="text-xs mt-1">Configure payment plans in the Finance Engine under School Admin</p>
            </div>
          </div>
        )}

        {activeTab === 'communications' && <CommunicationsHub token={token} user={user} isPhoneFrame={false} />}
        {activeTab === 'profile' && <ProfilePage token={token} user={user} onBack={() => setActiveTab('dashboard')} />}
      </div>
    </div>
  );
}
