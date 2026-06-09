import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Building2, Wallet, Users, Receipt, ShieldCheck, LogOut, Download } from 'lucide-react';
import CommunicationsHub from './CommunicationsHub';

interface SponsorDashboardProps {
  token: string;
  user: any;
  onLogout: () => void;
  appendLog?: (msg: string) => void;
  isPhoneFrame?: boolean;
}

export default function SponsorDashboard({ token, user, onLogout, appendLog, isPhoneFrame = false }: SponsorDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'reports'>('overview');
  const [studentsData, setStudentsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/sponsor/students', { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        setStudentsData(await res.json());
      }
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [token]);

  let totalCommitted = 0;
  let totalPaid = 0;
  studentsData.forEach(s => {
     totalCommitted += s.amount_committed || 0;
     totalPaid += s.amount_paid || 0;
  });

  return (
    <div className="h-full flex flex-col bg-slate-50">
      <div className="bg-[#0f172a] text-white px-6 py-4 flex items-center justify-between shrink-0 shadow-lg border-b-4 border-indigo-500">
        <div>
          <h2 className="text-xl font-bold font-mono tracking-tight flex items-center gap-2">
            <Building2 className="h-6 w-6 text-indigo-400" />
            Corporate Sponsor Portal
          </h2>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">{user.name} ({user.sponsorType})</p>
        </div>
        <button onClick={onLogout} className="flex items-center gap-1.5 bg-slate-800 text-slate-300 hover:text-white px-3 py-1.5 rounded text-xs font-bold transition">
          <LogOut className="h-3.5 w-3.5" /> Close Session
        </button>
      </div>

      <div className="bg-white border-b border-slate-200 px-6 py-2 flex gap-4 shrink-0 shadow-sm">
        <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === 'overview' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}>Sponsorship Portfolio</button>
        <button onClick={() => setActiveTab('reports')} className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === 'reports' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50'}`}>Financial Reports</button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {loading ? (
             <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full"/></div>
        ) : (
             <div className="max-w-5xl mx-auto space-y-6">
                {activeTab === 'overview' && (
                   <div className="space-y-6">
                      {/* Top KPIs */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                         <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col justify-center">
                            <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase mb-1">Total Sponsored Students</p>
                            <h3 className="text-4xl font-bold text-slate-900 flex items-center gap-2">
                               <Users className="h-8 w-8 text-indigo-500 opacity-50" /> {studentsData.length}
                            </h3>
                         </div>
                         <div className="bg-white rounded-xl p-6 border border-indigo-200 shadow-sm flex flex-col justify-center relative overflow-hidden">
                            <Wallet className="absolute -right-4 -bottom-4 h-24 w-24 text-indigo-100 opacity-50" />
                            <p className="text-[10px] text-indigo-500 font-mono tracking-widest uppercase mb-1 relative z-10">Total Committed Funds</p>
                            <h3 className="text-3xl font-bold text-indigo-900 relative z-10">Ksh {totalCommitted.toLocaleString()}</h3>
                         </div>
                         <div className="bg-white rounded-xl p-6 border border-emerald-200 shadow-sm flex flex-col justify-center relative overflow-hidden">
                            <ShieldCheck className="absolute -right-4 -bottom-4 h-24 w-24 text-emerald-100 opacity-50" />
                            <p className="text-[10px] text-emerald-500 font-mono tracking-widest uppercase mb-1 relative z-10">Disbursed Funds</p>
                            <h3 className="text-3xl font-bold text-emerald-900 relative z-10">Ksh {totalPaid.toLocaleString()}</h3>
                         </div>
                      </div>

                      {/* Sponsor Table */}
                      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                         <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                            <h3 className="font-bold text-slate-900 flex items-center gap-2"><Receipt className="h-5 w-5 text-slate-500" /> Beneficiary Tracker</h3>
                         </div>
                         <div className="p-0 overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                               <thead>
                                  <tr className="bg-slate-100 text-slate-600 text-[10px] uppercase font-mono tracking-wider">
                                     <th className="p-4 border-b border-slate-200">Student Scholar</th>
                                     <th className="p-4 border-b border-slate-200">Program Tier</th>
                                     <th className="p-4 border-b border-slate-200">Committed Amount</th>
                                     <th className="p-4 border-b border-slate-200">School Balance (Total)</th>
                                     <th className="p-4 border-b border-slate-200">Status</th>
                                  </tr>
                               </thead>
                               <tbody className="text-xs">
                                  {studentsData.length === 0 ? (
                                     <tr>
                                        <td colSpan={5} className="text-center p-8 text-slate-400 italic">No beneficiaries assigned to your portfolio yet.</td>
                                     </tr>
                                  ) : studentsData.map((d, i) => (
                                     <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition">
                                        <td className="p-4">
                                           <p className="font-bold text-slate-900">{d.student?.name}</p>
                                           <p className="text-[10px] text-slate-500 font-mono">{d.student?.regNumber}</p>
                                        </td>
                                        <td className="p-4 text-slate-600">{d.student?.currentLevel}</td>
                                        <td className="p-4 font-bold text-indigo-600">Ksh {d.amount_committed?.toLocaleString() || 0}</td>
                                        <td className="p-4 font-bold text-rose-500">Ksh {d.balance?.outstandingBalance?.toLocaleString() || 0}</td>
                                        <td className="p-4">
                                           <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded text-[10px] font-bold border border-emerald-200">{d.status}</span>
                                        </td>
                                     </tr>
                                  ))}
                               </tbody>
                            </table>
                         </div>
                      </div>
                   </div>
                )}
                {activeTab === 'reports' && (
                   <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center flex flex-col items-center">
                      <div className="bg-slate-100 h-20 w-20 rounded-full flex items-center justify-center text-slate-400 mb-6 font-bold text-2xl">
                         <Download className="h-8 w-8" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">Download Financial Acquittal Reports</h3>
                      <p className="text-sm text-slate-500 mt-2 max-w-md">
                         Sponsor statement reports for auditing are generated at the end of the semester. You can request a mid-term batch statement from the University Finance Office.
                      </p>
                      <button className="mt-8 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded shadow transition">
                         Request Batch Statement
                      </button>
                   </div>
                )}
             </div>
        )}
      </div>
    </div>
  );
}
