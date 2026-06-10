/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BarChart3, Wallet, GraduationCap, ShieldCheck, LogOut, RefreshCw, Download, User, TrendingUp } from 'lucide-react';
import ProfilePage from './ProfilePage';

interface Props { token: string; user: any; onLogout: () => void; appendLog?: (msg: string) => void; }

export default function BoardMemberDashboard({ token, user, onLogout, appendLog }: Props) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'finance' | 'enrollment' | 'academic' | 'compliance' | 'profile'>('dashboard');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [stuRes, finRes] = await Promise.all([
          fetch('/api/students', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/finance/summary', { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const students = stuRes.ok ? (await stuRes.json()).students || await stuRes.json() : [];
        const finance = finRes.ok ? await finRes.json() : {};
        setData({ students, finance });
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    load();
  }, [token, refreshTrigger]);

  const students = data?.students || [];
  const finance = data?.finance || {};
  const collectionRate = finance.totalCollected && finance.totalOutstanding
    ? ((finance.totalCollected / (finance.totalCollected + finance.totalOutstanding)) * 100).toFixed(1)
    : '—';

  const metrics = [
    { label: 'Total Enrollment', value: students.length, sub: `${students.filter((s: any) => s.status === 'active' || s.status === 'Active').length} active` },
    { label: 'Fee Collection Rate', value: `${collectionRate}%`, sub: `KES ${(finance.totalCollected || 0).toLocaleString()} collected` },
    { label: 'Outstanding Balance', value: `KES ${(finance.totalOutstanding || 0).toLocaleString()}`, sub: 'Pending from students' },
    { label: 'Graduated Students', value: students.filter((s: any) => s.academicState === 'GRADUATED').length, sub: 'All time' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      <div className="w-56 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center text-white text-xs font-bold">B</div>
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">Board Member</p>
              <p className="text-[10px] text-slate-500 truncate">{user?.name}</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-2 space-y-0.5">
          {[
            { id: 'dashboard', label: 'Executive Summary', icon: TrendingUp },
            { id: 'finance', label: 'Finance', icon: Wallet },
            { id: 'enrollment', label: 'Enrollment', icon: GraduationCap },
            { id: 'academic', label: 'Academic', icon: BarChart3 },
            { id: 'compliance', label: 'Compliance', icon: ShieldCheck },
            { id: 'profile', label: 'Profile', icon: User },
          ].map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id as any)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${activeTab === id ? 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-100' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700'}`}>
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
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                {activeTab === 'dashboard' ? 'Executive Summary' :
                 activeTab === 'finance' ? 'Financial Overview' :
                 activeTab === 'enrollment' ? 'Enrollment Overview' :
                 activeTab === 'academic' ? 'Academic Performance' : 'Compliance Status'}
              </h1>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1"><ShieldCheck className="w-3 h-3" />Read-only board view — no edits permitted</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setRefreshTrigger(r => r + 1)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"><RefreshCw className="w-4 h-4" /></button>
              <button className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 dark:bg-slate-600 text-white text-xs font-medium rounded-lg hover:bg-slate-700">
                <Download className="w-3.5 h-3.5" />Export PDF
              </button>
            </div>
          </div>

          {/* KPI cards — always visible */}
          <div className="grid grid-cols-4 gap-4">
            {metrics.map(({ label, value, sub }) => (
              <div key={label} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                <p className="text-xs text-slate-500 mb-1">{label}</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{loading ? '—' : value}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{loading ? '' : sub}</p>
              </div>
            ))}
          </div>

          {activeTab === 'finance' && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-4">Financial Summary</h2>
              <div className="space-y-3">
                {[
                  { label: 'Revenue Collected', value: `KES ${(finance.totalCollected || 0).toLocaleString()}` },
                  { label: 'Outstanding Receivables', value: `KES ${(finance.totalOutstanding || 0).toLocaleString()}` },
                  { label: 'Collection Rate', value: `${collectionRate}%` },
                  { label: 'Active Payment Plans', value: finance.activePaymentPlans || 0 },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
                    <span className="text-sm text-slate-600 dark:text-slate-400">{label}</span>
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'enrollment' && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-4">Enrollment Breakdown</h2>
              <div className="space-y-3">
                {[
                  { label: 'Total Students', value: students.length },
                  { label: 'Active', value: students.filter((s: any) => s.status === 'active' || s.status === 'Active').length },
                  { label: 'Suspended', value: students.filter((s: any) => s.status === 'Suspended' || s.status === 'suspended').length },
                  { label: 'Graduated', value: students.filter((s: any) => s.academicState === 'GRADUATED').length },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
                    <span className="text-sm text-slate-600 dark:text-slate-400">{label}</span>
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'academic' && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-4">Academic Performance</h2>
              <div className="p-8 text-center text-slate-400 text-sm">
                <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p>GPA distribution, pass rates, and academic trend data</p>
                <p className="text-xs mt-1">Data is populated from examination results and course registrations</p>
              </div>
            </div>
          )}

          {activeTab === 'compliance' && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-4">Compliance Status</h2>
              <div className="space-y-3">
                {[
                  { item: 'Data Protection Policy', status: 'Compliant' },
                  { item: 'Academic Calendar Filed', status: 'Compliant' },
                  { item: 'Regulatory Returns', status: 'Pending' },
                  { item: 'Audit Reports', status: 'Compliant' },
                ].map(({ item, status }) => (
                  <div key={item} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
                    <span className="text-sm text-slate-600 dark:text-slate-400">{item}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status === 'Compliant' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {activeTab === 'profile' && (
          <div className="p-6"><ProfilePage token={token} user={user} onBack={() => setActiveTab('dashboard')} /></div>
        )}
      </div>
    </div>
  );
}
