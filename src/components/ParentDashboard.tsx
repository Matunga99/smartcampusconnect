import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, BookOpen, Clock, Activity, Wallet, Receipt, CreditCard, CheckCircle, XCircle, LogOut, User, Lock, Key, ShieldAlert } from 'lucide-react';
import CommunicationsHub from './CommunicationsHub';
import ProfilePage from './ProfilePage';

interface ParentDashboardProps {
  token: string;
  user: any;
  onLogout: () => void;
  appendLog?: (msg: string) => void;
  isPhoneFrame?: boolean;
}

export default function ParentDashboard({ token, user, onLogout, appendLog, isPhoneFrame = false }: ParentDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'finance' | 'communications' | 'profile'>('overview');
  const [studentsData, setStudentsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // States for interactive financial payments simulation
  const [wardBalances, setWardBalances] = useState<Record<string, number>>({});
  const [payingWard, setPayingWard] = useState<any | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>(user?.phone || '254700000000');
  const [paymentStep, setPaymentStep] = useState<'idle' | 'pushing' | 'prompted' | 'success'>('idle');
  const [countdown, setCountdown] = useState(5);

  // First security challenge password check
  const [forcePasswordChange, setForcePasswordChange] = useState(
    !user?.passwordChanged && (user?.username === user?.passwordHash || user?.phone === user?.passwordHash || user?.passwordHash === '12345678')
  );
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdSuccess, setPwdSuccess] = useState<string | null>(null);
  const [pwdSubmitting, setPwdSubmitting] = useState(false);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/parent/students', { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setStudentsData(data);
        // Pre-initialize balances maps if empty
        const initialBalances: Record<string, number> = {};
        data.forEach((st: any) => {
          initialBalances[st.regNumber] = st.feeBalance || 12400; // default to 12400 KES if unspecified
        });
        setWardBalances(initialBalances);
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

  const handlePasswordChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError(null);
    setPwdSuccess(null);

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPwdError('Please complete all security update fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwdError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 5) {
      setPwdError('Password must be at least 5 characters for campus safety compliance.');
      return;
    }

    try {
      setPwdSubmitting(true);
      const rep = await fetch('/api/parent/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: oldPassword, newPassword: newPassword })
      });

      const resJson = await rep.json();
      if (!rep.ok) {
        setPwdError(resJson.error || 'Password update failed. Please verify your current password.');
      } else {
        setPwdSuccess('Your login password has been updated! Securing session...');
        if (appendLog) appendLog('[PORTAL] Updated parent password on first login.');
        setTimeout(() => {
          setForcePasswordChange(false);
          fetchStudents();
        }, 1500);
      }
    } catch (err: any) {
      setPwdError(err.message || 'An unexpected connection error occurred.');
    } finally {
      setPwdSubmitting(false);
    }
  };

  if (forcePasswordChange) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="bg-indigo-900 text-white p-6 text-center">
            <div className="inline-flex p-3 bg-indigo-850 rounded-full border border-indigo-700 text-indigo-300 mb-2">
              <ShieldAlert className="h-6 w-6 animate-pulse" />
            </div>
            <h3 className="text-lg font-bold uppercase tracking-wider font-mono">Security Checkpoint</h3>
            <p className="text-xs text-indigo-200 mt-1">Please update your temporary password to secure your ward's student records.</p>
          </div>
          <form onSubmit={handlePasswordChangeSubmit} className="p-6 space-y-4">
            {pwdError && (
              <div className="p-3 bg-red-50 border border-red-150 text-red-700 text-xs rounded-xl font-medium">
                {pwdError}
              </div>
            )}
            {pwdSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-150 text-emerald-700 text-xs rounded-xl font-medium">
                {pwdSuccess}
              </div>
            )}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-mono">Current Temporary Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Key className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  placeholder="Enter current password (usually your phone)"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full text-xs font-mono py-2.5 pl-10 pr-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-indigo-500 transition"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-mono">New Secure Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  placeholder="Min 5 characters recommended"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full text-xs font-mono py-2.5 pl-10 pr-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-indigo-500 transition"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-mono">Confirm New Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full text-xs font-mono py-2.5 pl-10 pr-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-indigo-500 transition"
                />
              </div>
            </div>
            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={onLogout}
                className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition uppercase tracking-wider font-sans cursor-pointer"
              >
                Sign Out
              </button>
              <button
                type="submit"
                disabled={pwdSubmitting}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition uppercase tracking-wider font-sans cursor-pointer disabled:opacity-50"
              >
                {pwdSubmitting ? 'Updating...' : 'Secure Account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-50">
      <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0 shadow-lg">
        <div>
          <h2 className="text-lg font-bold font-mono uppercase tracking-widest flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-400" />
            Parent & Guardian Portal
          </h2>
          <p className="text-xs text-slate-400 mt-1">Logged in as: {user.name} ({user.phone})</p>
        </div>
        <button onClick={onLogout} className="flex items-center gap-2 bg-slate-800 text-slate-300 hover:text-white px-3 py-1.5 rounded text-xs font-bold transition">
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </div>

      <div className="bg-white border-b border-slate-200 px-6 py-2 flex gap-4 shrink-0 shadow-sm col-span-1 border-slate-100 flex-wrap">
        <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === 'overview' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}>My Wards</button>
        <button onClick={() => setActiveTab('finance')} className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === 'finance' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:bg-slate-50'}`}>Financials</button>
        <button onClick={() => setActiveTab('communications')} className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === 'communications' ? 'bg-amber-50 text-amber-700' : 'text-slate-500 hover:bg-slate-50'}`}>Messages & Directives</button>
        <button onClick={() => setActiveTab('profile')} className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === 'profile' ? 'bg-purple-50 text-purple-700' : 'text-slate-500 hover:bg-slate-55'}`}>My Profile</button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {loading ? (
           <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full"/></div>
        ) : (
           <div className="max-w-4xl mx-auto space-y-6">
              {activeTab === 'overview' && (
                 <div className="space-y-4">
                    <p className="text-xs font-bold text-slate-500 font-mono tracking-wider uppercase mb-2">Linked Dependents</p>
                    {studentsData.length === 0 ? (
                       <div className="p-8 text-center text-slate-400 text-sm bg-white rounded-xl border border-slate-200 shadow-sm italic">No students linked to your account yet. Contact school administration.</div>
                    ) : (
                       studentsData.map((st, i) => (
                          <div key={i} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col gap-5">
                             <div className="flex items-center justify-between">
                                <div className="flex gap-4 items-center">
                                   <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-lg border-2 border-indigo-200 shadow-sm">
                                      {st.name?.charAt(0) || 'S'}
                                   </div>
                                   <div>
                                      <h3 className="font-bold text-lg text-slate-900">{st.name}</h3>
                                      <div className="flex gap-2 items-center mt-1">
                                         <span className="text-slate-500 text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{st.regNumber}</span>
                                         <span className="text-indigo-600 text-[10px] font-mono bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">{st.programName || 'Enrolled Student'}</span>
                                      </div>
                                   </div>
                                </div>
                                <div className="flex gap-2">
                                   <button className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition uppercase tracking-wider font-mono">
                                      <BookOpen className="h-3.5 w-3.5" /> Report Card
                                   </button>
                                   <button className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition uppercase tracking-wider font-mono shadow-sm" onClick={() => { setActiveTab('finance'); appendLog?.('[PORTAL] Opened fee payments terminal'); }}>
                                      <Wallet className="h-3.5 w-3.5" /> Pay Fees
                                   </button>
                                </div>
                             </div>

                             {/* Parent Portal Live Widgets Phase 11.5 */}
                             <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-3 border-t border-slate-100">
                                {/* Attendance */}
                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 shadow-sm">
                                   <div className="text-[9px] uppercase font-bold text-slate-500 mb-1 flex items-center gap-1"><Clock className="h-3 w-3" /> Attendance</div>
                                   <div className="text-sm font-black text-emerald-600">89%</div>
                                   <div className="text-[8px] text-slate-400 mt-1">Last seen today</div>
                                </div>
                                
                                {/* Current GPA */}
                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 shadow-sm">
                                   <div className="text-[9px] uppercase font-bold text-slate-500 mb-1 flex items-center gap-1"><Activity className="h-3 w-3" /> Academics</div>
                                   <div className="text-sm font-black text-indigo-600">GPA 3.4</div>
                                   <div className="text-[8px] text-slate-400 mt-1">On Track</div>
                                </div>

                                {/* Fees */}
                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 shadow-sm">
                                   <div className="text-[9px] uppercase font-bold text-slate-500 mb-1 flex items-center gap-1"><Wallet className="h-3 w-3" /> Fees Due</div>
                                   <div className="text-sm font-black text-rose-600 font-mono">KES {(wardBalances[st.regNumber] || 12400).toLocaleString()}</div>
                                   <div className="text-[8px] text-slate-400 mt-1">Due next week</div>
                                </div>

                                {/* Discipline */}
                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 shadow-sm">
                                   <div className="text-[9px] uppercase font-bold text-slate-500 mb-1 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Discipline</div>
                                   <div className="text-sm font-black text-emerald-600">CLEARED</div>
                                   <div className="text-[8px] text-slate-400 mt-1">No infractions</div>
                                </div>

                                {/* Hostel Status */}
                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 shadow-sm">
                                   <div className="text-[9px] uppercase font-bold text-slate-500 mb-1 flex items-center gap-1"><CreditCard className="h-3 w-3" /> Housing</div>
                                   <div className="text-sm font-black text-slate-800">Block B, 204</div>
                                   <div className="text-[8px] text-slate-400 mt-1">Checked In</div>
                                </div>
                             </div>
                          </div>
                       ))
                    )}
                 </div>
              )}
              {activeTab === 'finance' && (
                 <div className="space-y-6">
                    {/* Placeholder for Parent Finance Subsystem */}
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6 shadow-sm">
                       <h3 className="text-emerald-900 font-bold flex items-center gap-2 font-mono uppercase tracking-tight"><Wallet className="h-5 w-5" /> Guardian Financial Access</h3>
                       <p className="text-emerald-700 text-sm mt-2 max-w-2xl">
                          Pay tuition fees directly here via M-PESA STK Push. School receipts are auto-generated.
                       </p>
                    </div>

                    {studentsData.map((st, i) => (
                       <div key={i} className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                          <div className="bg-slate-50 px-6 py-4 flex justify-between items-center border-b border-slate-200">
                             <h4 className="font-bold text-slate-900">{st.name}</h4>
                             <span className="text-xs text-slate-500 font-mono">{st.regNumber}</span>
                          </div>
                          <div className="p-6">
                             <p className="text-center text-slate-500 text-xs italic">To see detailed invoices and pay, enter the specific student's payment portal.</p>
                             <div className="flex justify-center mt-4">
                                <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-bold flex items-center gap-2 shadow-sm transition">
                                   Open Student Payment Portal <CreditCard className="h-4 w-4" />
                                </button>
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
              )}
              {activeTab === 'communications' && (
                 <div className="h-[600px] border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm flex flex-col">
                    <CommunicationsHub user={user} />
                 </div>
              )}
              {activeTab === 'profile' && (
                 <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                    <ProfilePage token={token} user={user} appendLog={appendLog} />
                 </div>
              )}
           </div>
        )}
      </div>
    </div>
  );
}
