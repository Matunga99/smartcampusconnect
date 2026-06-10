/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Users, Calendar, Clock, BookOpen, LogOut, Check, ChevronRight, Clipboard, Award, 
  MapPin, CheckSquare, RefreshCw, AlertCircle, Sparkles, AlertTriangle, Play, MessageSquare, User
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import CommunicationsHub from './CommunicationsHub';
import LecturerResearchPortal from './LecturerResearchPortal';
import ProfilePage from './ProfilePage';

interface LecturerDashboardProps {
  token: string;
  user: any;
  onLogout: () => void;
  appendLog?: (msg: string) => void;
  isPhoneFrame?: boolean;
}

export default function LecturerDashboard({ 
  token, 
  user, 
  onLogout, 
  appendLog, 
  isPhoneFrame = false 
}: LecturerDashboardProps) {

  const [activeSubTab, setActiveSubTab] = useState<'workspace' | 'units' | 'classes' | 'attendance' | 'results' | 'communications' | 'research' | 'profile'>('workspace');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Selector choices for attendance & results
  const [avatarIndex, setAvatarIndex] = useState(0);
  const [showQRBroadcast, setShowQRBroadcast] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string|null>(null);
  const [activeQrToken, setActiveQrToken] = useState<string>('');
  const [qrExpiresAt, setQrExpiresAt] = useState<number>(0);
  const [qrSecondsLeft, setQrSecondsLeft] = useState<number>(60);
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');
  const [sessionPresentIds, setSessionPresentIds] = useState<Record<string, boolean>>({});
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [submittingGradeForRegId, setSubmittingGradeForRegId] = useState<string>('');
  const [gradeStatusMap, setGradeStatusMap] = useState<Record<string, string>>({});

  // ── QR auto-rotate countdown ──────────────────────────────────────────────
  useEffect(() => {
    if (!showQRBroadcast || !activeSessionId) return;

    const tick = setInterval(async () => {
      const now = Date.now();
      const left = Math.max(0, Math.ceil((qrExpiresAt - now) / 1000));
      setQrSecondsLeft(left);

      // Auto-rotate when token is about to expire
      if (left <= 3 && activeSessionId) {
        try {
          const res = await fetch(`/api/lecturer/attendance/sessions/${activeSessionId}/rotate-qr`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setActiveQrToken(data.qrToken || data.newQrToken);
            setQrExpiresAt(Date.now() + (data.durationSeconds || 60) * 1000);
            setQrSecondsLeft(data.durationSeconds || 60);
            appendLog?.('[QR] Token rotated — new beacon active.');
          }
        } catch { /* silently continue */ }
      }
    }, 1000);

    return () => clearInterval(tick);
  }, [showQRBroadcast, activeSessionId, qrExpiresAt, token, appendLog]);

  // Load lecturer context & classes
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const resp = await fetch('/api/lecturer/dashboard', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (resp.ok) {
          const resJson = await resp.json();
          setData(resJson);
          appendLog?.(`[PORTAL] Loaded faculty portal for "${resJson.staff?.name}"`);

          if (resJson.assignments && resJson.assignments.length > 0) {
            setSelectedUnitId(resJson.assignments[0].unitId);
          }
        }
      } catch (err) {
        console.error('Error fetching lecturer portal data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [token, refreshTrigger]);

  const handleLogAttendanceSession = async () => {
    const activeAssign = data?.assignments?.find((a: any) => a.unitId === selectedUnitId);
    if (!activeAssign || !activeAssign.enrollments) return;

    setSavingAttendance(true);
    let successCount = 0;

    try {
      // Loop students and save attendance log one by one to support precise database schema state
      for (const student of activeAssign.enrollments) {
        const attended = !!sessionPresentIds[student.registrationId];
        await fetch('/api/lecturer/log-attendance', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            courseRegistrationId: student.registrationId,
            attended
          })
        });
        successCount++;
      }
      
      appendLog?.(`[PORTAL] Session attendance roll call completed: Logged entry for ${successCount} student seats.`);
      setSessionPresentIds({});
      // Trigger update state
      setRefreshTrigger(prev => prev + 1);
    } catch (e) {
      console.error('Error logging attendance session:', e);
    } finally {
      setSavingAttendance(false);
    }
  };

  const handleUpdateGrade = async (registrationId: string, grade: string) => {
    setSubmittingGradeForRegId(registrationId);
    try {
      const resp = await fetch('/api/lecturer/grade-student', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          courseRegistrationId: registrationId,
          grade
        })
      });

      if (resp.ok) {
        setGradeStatusMap(prev => ({ ...prev, [registrationId]: 'Saved ✔' }));
        appendLog?.(`[PORTAL] Synchronized academic record: Student grade set to "${grade}" on slot "${registrationId}".`);
        setTimeout(() => {
          setGradeStatusMap(prev => {
            const next = { ...prev };
            delete next[registrationId];
            return next;
          });
        }, 2000);
      }
    } catch (e) {
      console.error('Error grading student:', e);
    } finally {
      setSubmittingGradeForRegId('');
    }
  };

  const handleStartSession = async () => {
    if (!activeAssignment) return;
    try {
      const resp = await fetch('/api/lecturer/attendance/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          cohortId: activeAssignment.cohortId || 'comp-sci-2026',
          unitId: selectedUnitId || activeAssignment.unitId,
          venue: 'Main Hall',
        })
      });
      if (resp.ok) {
        const { session, qrToken } = await resp.json();
        setActiveSessionId(session.id);
        setActiveQrToken(qrToken);
        setQrExpiresAt(Date.now() + (session.qrDurationSeconds || 60) * 1000);
        setQrSecondsLeft(session.qrDurationSeconds || 60);
        setShowQRBroadcast(true);
        appendLog?.(`[PORTAL] Attendance session started. Beacon token generated.`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleStopSession = async () => {
    if (!activeSessionId) {
      setShowQRBroadcast(false);
      return;
    }
    try {
      await fetch(`/api/lecturer/attendance/sessions/${activeSessionId}/end`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setShowQRBroadcast(false);
      setActiveSessionId(null);
      setActiveQrToken('');
      appendLog?.(`[PORTAL] Attendance session ended securely.`);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-slate-500 font-mono text-[11px] gap-2">
        <RefreshCw className="h-4 w-4 animate-spin text-indigo-600" />
        <span>Synchronizing Faculty Workspace...</span>
      </div>
    );
  }

  const staff = data?.staff || {};
  const assignments = data?.assignments || [];
  const classes = data?.classes || [];

  // Active unit selection context
  const activeAssignment = assignments.find((a: any) => a.unitId === selectedUnitId);
  const activeEnrollments = activeAssignment?.enrollments || [];

  return (
    <div className={`min-h-screen bg-slate-50 flex ${isPhoneFrame ? 'flex-col text-xs' : 'flex-col md:flex-row text-sm'} font-sans`}>
      
      {/* ----------------- DESKTOP SIDEBAR ----------------- */}
      <aside className={`bg-slate-900 border-r border-slate-800 flex-shrink-0 text-white justify-between ${isPhoneFrame ? 'hidden' : 'hidden md:flex md:flex-col md:w-64'}`}>
        <div>
          <div className="h-20 flex items-center px-6 border-b border-slate-800">
            <div className="w-8 h-8 bg-indigo-500 rounded flex items-center justify-center mr-3 shadow-sm shadow-indigo-500/40 animate-pulse">
              <Sparkles className="h-4.5 w-4.5 text-white" />
            </div>
            <div className="overflow-hidden min-w-0">
              <span className="text-white font-bold tracking-tight text-sm block truncate">
                {staff.name || 'Lecturer'}
              </span>
              <span className="text-[9px] text-indigo-400 font-mono block tracking-widest uppercase font-bold">
                {staff.role === 'staff' ? 'Lecturer' : staff.role || 'Lecturer'}
              </span>
            </div>
          </div>

          <div className="py-6 flex-1 overflow-y-auto space-y-1 px-3">
            <div className="px-3 mb-3">
              <p className="text-slate-550 text-[10px] uppercase font-bold tracking-widest font-mono">Faculty Workspace</p>
            </div>
            
            <button
              onClick={() => setActiveSubTab('workspace')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded transition-colors text-xs font-semibold cursor-pointer ${
                activeSubTab === 'workspace' 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveSubTab('units')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded transition-colors text-xs font-semibold cursor-pointer ${
                activeSubTab === 'units' 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>My Units</span>
            </button>

            <button
              onClick={() => setActiveSubTab('classes')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded transition-colors text-xs font-semibold cursor-pointer ${
                activeSubTab === 'classes' 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <Calendar className="h-4 w-4" />
              <span>Timetable</span>
            </button>

            <button
              onClick={() => setActiveSubTab('attendance')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded transition-colors text-xs font-semibold cursor-pointer ${
                activeSubTab === 'attendance' 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <Clipboard className="h-4 w-4" />
              <span>Attendance</span>
            </button>

            <button
              onClick={() => setActiveSubTab('results')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded transition-colors text-xs font-semibold cursor-pointer ${
                activeSubTab === 'results' 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <Award className="h-4 w-4" />
              <span>Gradebook</span>
            </button>

            <button
              onClick={() => setActiveSubTab('communications')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded transition-colors text-xs font-semibold cursor-pointer ${
                activeSubTab === 'communications' 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <MessageSquare className="h-4 w-4 text-[#3b82f6]" />
              <span>Comms & Live</span>
            </button>

            <button
              onClick={() => setActiveSubTab('research')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded transition-colors text-xs font-semibold cursor-pointer ${
                activeSubTab === 'research' 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <BookOpen className="h-4 w-4 text-amber-500" />
              <span>Research & Grants</span>
            </button>

            <button
              onClick={() => setActiveSubTab('profile')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded transition-colors text-xs font-semibold cursor-pointer ${
                activeSubTab === 'profile' 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <User className="h-4 w-4 text-[#a855f7]" />
              <span>My Profile</span>
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center justify-between mb-3 px-2">
            <span className="text-[10px] text-slate-500 font-mono truncate max-w-[140px]">{staff.email}</span>
            <span className="text-[8px] px-1.5 py-0.5 bg-indigo-500/10 text-indigo-400 rounded border border-indigo-500/20 font-bold uppercase font-mono tracking-wider">
              Online
            </span>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-rose-950/40 hover:bg-rose-900/40 border border-rose-900/30 text-rose-300 hover:text-rose-200 rounded-xl transition-all cursor-pointer text-xs font-bold"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ----------------- MOBILE HEADER & BAR ----------------- */}
      <header className={`bg-slate-900 text-white flex-shrink-0 border-b border-indigo-950 shadow-lg ${isPhoneFrame ? 'flex flex-col' : 'flex flex-col md:hidden'}`}>
        <div className="p-4 flex justify-between items-center bg-gradient-to-r from-indigo-950 to-slate-900 border-b border-indigo-900">
          <div>
            <span className="text-[8px] font-bold py-0.5 px-2 bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-400/20 uppercase tracking-widest">
              Faculty Portal
            </span>
            <h2 className="text-sm font-bold truncate tracking-tight text-white mt-1 max-w-[210px]">{staff.name}</h2>
            <p className="text-[9px] text-indigo-200/80 font-mono tracking-wider">ROLE: {staff.role || 'Lecturer'}</p>
          </div>
          <button
            onClick={onLogout}
            className="p-2 text-rose-300 hover:bg-rose-500/10 rounded-full hover:text-rose-200 transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>

        <div className="flex bg-slate-800 border-b border-slate-700 overflow-x-auto scrollbar-none select-none text-[10px]">
          <button
            onClick={() => setActiveSubTab('workspace')}
            className={`px-4 py-3 font-bold transition-all border-b-2 flex items-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer ${
              activeSubTab === 'workspace' 
                ? 'border-indigo-400 text-indigo-300 bg-slate-900 font-extrabold' 
                : 'border-transparent text-slate-400 hover:bg-slate-705/55'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
            <span>Workspace</span>
          </button>
          <button
            onClick={() => setActiveSubTab('units')}
            className={`px-4 py-3 font-bold transition-all border-b-2 flex items-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer ${
              activeSubTab === 'units' 
                ? 'border-indigo-600 text-indigo-300 bg-slate-900 font-extrabold' 
                : 'border-transparent text-slate-450 hover:bg-slate-705/55'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>My Units</span>
          </button>
          <button
            onClick={() => setActiveSubTab('classes')}
            className={`px-4 py-3 font-bold transition-all border-b-2 flex items-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer ${
              activeSubTab === 'classes' 
                ? 'border-indigo-600 text-indigo-300 bg-slate-900 font-extrabold' 
                : 'border-transparent text-slate-450 hover:bg-slate-705/55'
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Timetable</span>
          </button>
          <button
            onClick={() => setActiveSubTab('attendance')}
            className={`px-4 py-3 font-bold transition-all border-b-2 flex items-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer ${
              activeSubTab === 'attendance' 
                ? 'border-indigo-600 text-indigo-305 bg-slate-900 font-extrabold' 
                : 'border-transparent text-slate-450 hover:bg-slate-705/55'
            }`}
          >
            <Clipboard className="h-3.5 w-3.5" />
            <span>Attendance</span>
          </button>
          <button
            onClick={() => setActiveSubTab('results')}
            className={`px-4 py-3 font-bold transition-all border-b-2 flex items-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer ${
              activeSubTab === 'results' 
                ? 'border-indigo-600 text-indigo-305 bg-slate-900 font-extrabold' 
                : 'border-transparent text-slate-450 hover:bg-slate-705/55'
            }`}
          >
            <Award className="h-3.5 w-3.5" />
            <span>Gradebook</span>
          </button>
          <button
            onClick={() => setActiveSubTab('communications')}
            className={`px-4 py-3 font-bold transition-all border-b-2 flex items-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer ${
              activeSubTab === 'communications' 
                ? 'border-indigo-600 text-indigo-305 bg-slate-900 font-extrabold' 
                : 'border-transparent text-slate-450 hover:bg-slate-705/55'
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5 text-[#3b82f6]" />
            <span>Comms & Live</span>
          </button>
          <button
            onClick={() => setActiveSubTab('research')}
            className={`px-4 py-3 font-bold transition-all border-b-2 flex items-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer ${
              activeSubTab === 'research' 
                ? 'border-indigo-600 text-indigo-305 bg-slate-900 font-extrabold' 
                : 'border-transparent text-slate-450 hover:bg-slate-705/55'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Research & Grants</span>
          </button>
          
          <button
            onClick={() => setActiveSubTab('profile')}
            className={`px-4 py-3 font-bold transition-all border-b-2 flex items-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer ${
              activeSubTab === 'profile' 
                ? 'border-indigo-600 text-indigo-305 bg-slate-900 font-extrabold' 
                : 'border-transparent text-slate-450 hover:bg-slate-705/55'
            }`}
          >
            <User className="h-3.5 w-3.5 text-[#a855f7]" />
            <span>My Profile</span>
          </button>
        </div>
      </header>

      {/* ----------------- MAIN VIEW CONTENT CONTAINER ----------------- */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Quick Info Ribbon */}
        <div className={`bg-white border-b border-slate-250 px-6 py-2 flex justify-between items-center shrink-0 ${isPhoneFrame ? 'hidden' : 'hidden md:flex'}`}>
          <span className="text-[10px] text-slate-500 font-mono truncate">{staff.email}</span>
          <span className="text-[10px] px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-150 font-extrabold uppercase tracking-wide font-mono">
            Active session
          </span>
        </div>

        {/* Main Tab Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {activeSubTab === 'workspace' && (
          <div className="space-y-4 animate-fade-in text-[11px]">
            {/* Header Greeting */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-5 rounded-2xl border border-indigo-950 text-white shadow-md relative overflow-hidden">
              <div className="absolute right-[-10px] top-[-10px] text-indigo-500/10 pointer-events-none">
                <Sparkles className="h-28 w-28" />
              </div>
              <h3 className="text-sm font-black tracking-tight flex items-center gap-2 mb-1.5">
                <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
                Welcome, {staff.name}!
              </h3>
              <p className="text-[10px] text-slate-300 font-mono">Phase 11.5 Single Lecturer Workspace</p>
            </div>

            {/* Interactive Digital Staff / Employee Card */}
            <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-750 shadow-xl relative overflow-hidden">
               {/* Decorative watermark mesh */}
               <div className="absolute right-[-15px] top-[-10px] text-white/[0.02] pointer-events-none transform -rotate-12 select-none">
                 <BookOpen className="h-44 w-44" />
               </div>

               <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                 <div>
                   <h4 className="text-xs font-serif font-black tracking-widest uppercase text-teal-400">SmartCampus X Faculty</h4>
                   <p className="text-[7.5px] font-mono tracking-widest text-slate-400 uppercase">OFFICIAL RECIPIENT ACADEMIC ID CARD</p>
                 </div>
                 <span className="text-[8px] bg-teal-500/10 text-teal-300 font-bold px-2 py-0.5 border border-teal-500/25 rounded-md uppercase tracking-wider">
                   Active Staff
                 </span>
               </div>

               <div className="mt-4 flex gap-4 items-center">
                 {/* Professor Swappable Avatar Section */}
                 <div className="relative shrink-0">
                   <div className="w-16 h-16 rounded-2xl bg-teal-950 border-2 border-teal-500/45 overflow-hidden flex items-center justify-center p-1 shadow-inner relative">
                     {avatarIndex === 0 && <span className="text-2xl">👨‍🏫</span>}
                     {avatarIndex === 1 && <span className="text-2xl">👩‍🏫</span>}
                     {avatarIndex === 2 && <span className="text-2xl">🎓</span>}
                     
                     <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[7px] text-white text-center pb-0.5 select-none font-bold">
                       STAFF PHOTO
                     </div>
                   </div>
                   
                   {/* Avatar switcher buttons */}
                   <div className="flex gap-1 justify-center mt-1.5">
                     {[0, 1, 2].map(idx => (
                       <button
                         key={idx}
                         onClick={() => {
                           setAvatarIndex(idx);
                           appendLog?.(`[PORTAL] Staff Photo changed to avatar #${idx + 1}`);
                         }}
                         className={`w-2.5 h-2.5 rounded-full transition-all border ${
                           avatarIndex === idx ? 'bg-teal-400 border-white' : 'bg-slate-700 border-transparent'
                         }`}
                       ></button>
                     ))}
                   </div>
                 </div>

                 {/* Lecturer details */}
                 <div className="flex-1 space-y-1 text-[10px]">
                   <p className="text-slate-400 font-mono text-[8px] uppercase tracking-wider leading-none">Employee Holder</p>
                   <p className="font-extrabold text-white text-xs truncate">{staff.name || 'Prof. Kamau'}</p>
                   
                   <p className="text-slate-400 font-mono text-[8px] uppercase tracking-wider leading-none pt-1">Academic Department</p>
                   <p className="font-bold text-slate-205 truncate">Department of Computer Science</p>

                   <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[9px]">
                     <div>
                       <span className="text-slate-500 block text-[7px] uppercase">Employee Number</span>
                       <span className="font-bold text-slate-300">EMP-2026-402</span>
                     </div>
                     <div>
                       <span className="text-slate-500 block text-[7px] uppercase">Employment Status</span>
                       <span className="font-bold text-teal-400">Tenured Senior</span>
                     </div>
                   </div>
                 </div>
               </div>

               {/* QR Broadcast Trigger and NFC gate access scan */}
               <div className="border-t border-slate-800 pt-3 mt-3 flex justify-between items-center bg-slate-950/40 p-2.5 rounded-2xl gap-2">
                 <button
                   onClick={() => {
                     appendLog?.(`[SECURE-GATE] Faculty Staff Card scanned at Main Security Gate access point.`);
                     alert(`🔊 Beep! RFID Credentials checked.\nStaff: ${staff.name}\nStatus: ACCESS GRANTED at Faculty Senate & Executive Offices`);
                   }}
                   className="py-1.5 px-2 bg-slate-800 hover:bg-slate-750 rounded-xl text-[8.5px] font-mono font-bold text-slate-300 transition-all cursor-pointer flex-1 text-center"
                 >
                   Tap Gate Access
                 </button>

                 <button
                   onClick={() => {
                     if (showQRBroadcast) {
                       handleStopSession();
                     } else {
                       handleStartSession();
                     }
                   }}
                   className="py-1.5 px-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-[8.5px] font-mono font-bold transition-all flex items-center justify-center gap-1 cursor-pointer flex-1 text-center"
                 >
                   {showQRBroadcast ? 'Stop QR Broadcast' : 'Launch Session QR'}
                 </button>
               </div>
            </div>

            {/* Live QR Attendance Broadcast Panel */}
            {showQRBroadcast && (
               <div className="bg-gradient-to-br from-teal-950 to-slate-900 border border-teal-500/30 rounded-3xl p-5 text-center space-y-3 animate-fade-in text-white shadow-xl max-w-sm mx-auto">
                 {/* Header */}
                 <div className="flex items-center justify-between">
                   <span className="text-[8px] uppercase font-mono tracking-widest text-teal-400 font-black">⬤ LIVE — QR Beacon Active</span>
                   <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${qrSecondsLeft <= 10 ? 'bg-red-900/60 text-red-300 animate-pulse' : 'bg-teal-900/60 text-teal-300'}`}>
                     {qrSecondsLeft}s
                   </span>
                 </div>

                 <h4 className="text-[11px] font-bold">
                   {data?.assignments?.find((a: any) => a.unitId === selectedUnitId)?.unitCode || 'Session'} — Attendance QR
                 </h4>

                 {/* QR Code — full scannable image */}
                 <div className="w-52 h-52 bg-white p-3 rounded-2xl mx-auto flex items-center justify-center border-4 border-teal-500 shadow-md relative">
                   {activeQrToken ? (
                     <QRCodeSVG
                       value={JSON.stringify({ sessionId: activeSessionId, qrToken: activeQrToken })}
                       size={172}
                       level="H"
                       includeMargin={false}
                     />
                   ) : (
                     <div className="flex flex-col items-center gap-2 text-slate-400">
                       <RefreshCw className="h-8 w-8 animate-spin text-teal-400" />
                       <span className="text-xs font-mono">Generating...</span>
                     </div>
                   )}
                   {/* Expiry overlay when about to rotate */}
                   {qrSecondsLeft <= 5 && (
                     <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center">
                       <span className="text-red-400 font-mono font-black text-2xl animate-pulse">{qrSecondsLeft}</span>
                     </div>
                   )}
                 </div>

                 {/* Token display */}
                 <div className="text-[8px] bg-teal-900/30 font-mono py-1.5 rounded-lg border border-teal-800/50 px-3 break-all max-w-[260px] mx-auto">
                   Token: <span className="text-teal-300 font-bold">{activeQrToken || '—'}</span>
                 </div>

                 <p className="text-[9px] text-slate-400 max-w-xs mx-auto leading-relaxed">
                   Students scan this QR or enter the token in the student portal. Auto-rotates every 60s for security.
                 </p>

                 {/* Session ID */}
                 <div className="text-[8px] text-slate-500 font-mono">
                   Session: {activeSessionId || 'Initialising...'}
                 </div>

                 {/* Action buttons */}
                 <div className="flex gap-2 justify-center pt-1">
                   <button
                     onClick={async () => {
                       if (!activeSessionId) return;
                       try {
                         const res = await fetch(`/api/lecturer/attendance/sessions/${activeSessionId}/rotate-qr`, {
                           method: 'POST',
                           headers: { 'Authorization': `Bearer ${token}` }
                         });
                         if (res.ok) {
                           const d = await res.json();
                           setActiveQrToken(d.qrToken || d.newQrToken);
                           setQrExpiresAt(Date.now() + (d.durationSeconds || 60) * 1000);
                           setQrSecondsLeft(d.durationSeconds || 60);
                           appendLog?.('[QR] Manual rotation triggered.');
                         }
                       } catch { /* silent */ }
                     }}
                     className="py-1.5 px-3 bg-teal-700 hover:bg-teal-600 text-white rounded-xl text-[9px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-all"
                   >
                     <RefreshCw className="h-3 w-3" /> Rotate Now
                   </button>
                   <button
                     onClick={handleStopSession}
                     className="py-1.5 px-3 bg-red-700 hover:bg-red-600 text-white rounded-xl text-[9px] font-mono font-bold cursor-pointer transition-all"
                   >
                     End Session
                   </button>
                 </div>
               </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
               {/* Today's Classes & Quick Attendance */}
               <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 hover:border-indigo-300 transition-colors">
                  <div className="flex justify-between items-center mb-3">
                     <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-indigo-500" /> Today's Timetable</h4>
                     <button onClick={() => setActiveSubTab('attendance')} className="text-[9px] bg-indigo-50 text-indigo-700 px-2 py-1 rounded font-bold hover:bg-indigo-100">Take Attendance</button>
                  </div>
                  {classes.length > 0 ? (
                     <div className="space-y-2">
                        {classes.slice(0, 2).map((cls: any) => (
                           <div key={cls.id} className="flex gap-3 bg-slate-50 p-2 rounded-lg border border-slate-100">
                              <div className="bg-indigo-100 text-indigo-700 font-bold font-mono text-[9px] px-2 py-1 flex items-center justify-center rounded">
                                 {cls.timeSlot.split(' ')[0]}
                              </div>
                              <div className="flex-1">
                                 <div className="text-[10px] font-bold text-slate-800">{cls.unitCode} - {cls.unitName}</div>
                                 <div className="text-[9px] text-slate-500 flex justify-between">
                                    <span>{cls.venue}</span>
                                    <span className="font-bold text-indigo-600">{cls.classGroupName}</span>
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  ) : (
                     <div className="text-[10px] text-slate-500 italic p-2 bg-slate-50 rounded">No classes scheduled for today.</div>
                  )}
               </div>

               {/* Quick Grading Status */}
               <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 hover:border-indigo-300 transition-colors">
                  <div className="flex justify-between items-center mb-3">
                     <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5"><Award className="h-3.5 w-3.5 text-emerald-500" /> Grading Status</h4>
                     <button onClick={() => setActiveSubTab('results')} className="text-[9px] bg-emerald-50 text-emerald-700 px-2 py-1 rounded font-bold hover:bg-emerald-100">Gradebook</button>
                  </div>
                  <div className="space-y-2">
                     {assignments.slice(0, 2).map((assign: any, idx: number) => (
                        <div key={assign.id || idx} className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-100">
                           <div className="text-[10px] font-bold text-slate-700">{assign.unitCode}</div>
                           <div className="flex items-center gap-2 text-[9px]">
                              <span className="text-slate-500">Graded:</span>
                              <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                 <div className="h-full bg-emerald-500" style={{width: `${Math.floor(Math.random()*40 + 30)}%`}}></div>
                              </div>
                           </div>
                        </div>
                     ))}
                     {assignments.length === 0 && <div className="text-[10px] text-slate-500 italic">No assigned units.</div>}
                  </div>
               </div>

               {/* Unit Chats & Announcements */}
               <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 hover:border-indigo-300 transition-colors">
                  <div className="flex justify-between items-center mb-3">
                     <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5"><MessageSquare className="h-3.5 w-3.5 text-[#3b82f6]" /> Unit Chats & Announcements</h4>
                     <button onClick={() => setActiveSubTab('communications')} className="text-[9px] bg-blue-50 text-blue-700 px-2 py-1 rounded font-bold hover:bg-blue-100">Open Hub</button>
                  </div>
                  <div className="space-y-2">
                     <div className="bg-slate-50 p-2 rounded border border-slate-100">
                        <div className="text-[9px] font-bold text-slate-700 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block"></span> NET401 Group</div>
                        <div className="text-[9px] text-slate-500 mt-1 truncate">Student: "Sir, what time is the CAT on Friday?"</div>
                     </div>
                     <div className="bg-slate-50 p-2 rounded border border-slate-100">
                        <div className="text-[9px] font-bold text-slate-700 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-slate-300 inline-block"></span> Faculty Announce</div>
                        <div className="text-[9px] text-slate-500 mt-1 truncate">Dean: "Please submit mid-term grades by 12th."</div>
                     </div>
                  </div>
               </div>
               
               {/* Research Supervision */}
               <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 hover:border-indigo-300 transition-colors">
                  <div className="flex justify-between items-center mb-3">
                     <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5 text-amber-500" /> Research Supervision</h4>
                     <button onClick={() => setActiveSubTab('research')} className="text-[9px] bg-amber-50 text-amber-700 px-2 py-1 rounded font-bold hover:bg-amber-100">Grants</button>
                  </div>
                  <div className="space-y-2">
                     <div className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-100">
                        <div>
                           <div className="text-[10px] font-bold text-slate-700">MSc Thesis Review</div>
                           <div className="text-[9px] text-slate-500">Student: J. Doe</div>
                        </div>
                        <span className="text-[8px] bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded font-bold uppercase">Overdue</span>
                     </div>
                     <div className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-100">
                        <div>
                           <div className="text-[10px] font-bold text-slate-700">Project Proposal</div>
                           <div className="text-[9px] text-slate-500">Student: A. Smith</div>
                        </div>
                        <span className="text-[8px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded font-bold uppercase">Pending</span>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* Allocated teaching units */}
        {activeSubTab === 'units' && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="font-bold text-slate-800 text-xs flex items-center gap-1">My Allocated Teaching Units</h3>
            
            {assignments.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 text-center text-slate-400 font-mono text-[10px]">
                You are currently not assigned to lead any course units for the active academic timeline.
              </div>
            ) : (
              <div className="space-y-3">
                {assignments.map((assignment: any) => (
                  <div key={assignment.id} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs relative overflow-hidden">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-mono text-[9px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-150 px-1.5 py-0.2 rounded">
                          {assignment.unitCode}
                        </span>
                        <h4 className="font-extrabold text-slate-800 text-xs mt-1.5 max-w-[240px]">{assignment.unitName}</h4>
                        <p className="text-[9px] text-slate-400 font-mono mt-1">
                          Period: {assignment.academicYearName} • {assignment.semesterName}
                        </p>
                      </div>
                      
                      <div className="p-2 bg-indigo-50/50 rounded-xl border border-indigo-100 flex flex-col items-center justify-center shrink-0">
                        <Users className="h-3.5 w-3.5 text-indigo-600" />
                        <span className="font-bold font-mono text-[10px] text-indigo-700 mt-1">{assignment.enrolledTotal}</span>
                        <span className="text-[7px] text-indigo-400 uppercase font-bold tracking-widest mt-0.5">Enrolled</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Timetable schedule led by this lecturer */}
        {activeSubTab === 'classes' && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="font-bold text-slate-800 text-xs flex items-center gap-1">My Scheduled Lecture Timetable</h3>
            
            {classes.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 text-center text-slate-400 font-mono text-[10px]">
                No lectures found in the central calendar assigned specifically to your lead profile ID.
              </div>
            ) : (
              <div className="space-y-3">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => {
                  const daySchedules = classes.filter((c: any) => c.day === day);
                  if (daySchedules.length === 0) return null;

                  return (
                    <div key={day} className="space-y-1.5">
                      <span className="text-[9px] font-bold tracking-widest text-indigo-600 uppercase font-mono pl-1">
                        {day}
                      </span>
                      
                      <div className="space-y-2">
                        {daySchedules.map((cls: any) => (
                          <div key={cls.id} className="bg-white p-3 border border-slate-200 rounded-2xl flex items-start gap-3">
                            <div className="p-1.5 bg-slate-50 border border-slate-200 text-slate-550 rounded-lg flex items-center justify-center shrink-0">
                              <MapPin className="h-3.5 w-3.5 text-indigo-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 justify-between">
                                <span className="font-mono text-[10px] font-bold text-indigo-600">{cls.unitCode}</span>
                                <span className="font-mono font-medium text-[9px] text-slate-400">{cls.timeSlot}</span>
                              </div>
                              <h4 className="font-bold text-slate-800 text-[11px] truncate mt-0.5">{cls.unitName}</h4>
                              <div className="mt-1.5 flex items-center justify-between text-[9px] text-slate-500 pt-1.5 border-t border-slate-100">
                                <span className="flex items-center gap-1 font-semibold text-slate-600">
                                  <Users className="h-2.5 w-2.5" /> Group: {cls.classGroupName}
                                </span>
                                <span className="font-mono uppercase bg-indigo-50 text-indigo-600 px-1 py-0.2 rounded border border-indigo-100 font-bold">
                                  {cls.venue}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Attendance roll logging */}
        {activeSubTab === 'attendance' && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
              <h3 className="font-bold text-slate-800 text-xs">Unit Register Roll Call</h3>
              
              <div>
                <label className="text-[9px] text-slate-400 uppercase font-extrabold block mb-1">Select Active Unit Subject</label>
                <select
                  value={selectedUnitId}
                  onChange={(e) => {
                    setSelectedUnitId(e.target.value);
                    setSessionPresentIds({});
                  }}
                  className="w-full text-xs font-semibold p-2 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 outline-none"
                >
                  {assignments.map((assignment: any) => (
                    <option key={assignment.unitId} value={assignment.unitId}>
                      {assignment.unitCode} - {assignment.unitName}
                    </option>
                  ))}
                </select>
              </div>

              {activeAssignment ? (
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-2">
                    <div>
                      <span className="text-[9px] text-slate-400 font-semibold block uppercase">Roll Call Actions</span>
                      <span className="text-[10px] font-bold text-indigo-600 font-mono">
                        {activeEnrollments.length} Students Assigned
                      </span>
                    </div>

                    <button
                      onClick={handleLogAttendanceSession}
                      disabled={savingAttendance || activeEnrollments.length === 0}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 font-bold text-[10px] text-white rounded-lg cursor-pointer flex items-center gap-1.5 disabled:opacity-40 transition-all shadow-xs"
                    >
                      {savingAttendance ? (
                        <>
                          <RefreshCw className="h-3 w-3 animate-spin" /> Saving...
                        </>
                      ) : (
                        <>
                          <Check className="h-3 w-3" /> Log Present Attendees
                        </>
                      )}
                    </button>
                  </div>
                  
                  {/* Session Analytics List */}
                  {activeAssignment.recentSessions && activeAssignment.recentSessions.length > 0 && (
                    <div className="mb-4">
                       <h4 className="font-bold text-slate-700 text-[10px] uppercase mb-2">Lecturer Attendance Board</h4>
                       <div className="overflow-x-auto rounded-lg border border-slate-200">
                         <table className="w-full text-left border-collapse min-w-[300px]">
                           <thead className="bg-slate-50">
                             <tr className="border-b border-slate-200 text-slate-500">
                               <th className="py-2 text-[9px] uppercase font-bold px-2">Date (Start)</th>
                               <th className="py-2 text-[9px] uppercase font-bold px-2">Present</th>
                               <th className="py-2 text-[9px] uppercase font-bold px-2">Late</th>
                               <th className="py-2 text-[9px] uppercase font-bold px-2">Absent</th>
                               <th className="py-2 text-[9px] uppercase font-bold px-2">%</th>
                             </tr>
                           </thead>
                           <tbody className="bg-white">
                             {activeAssignment.recentSessions.map((sess: any) => (
                               <tr key={sess.id} className="border-b border-slate-100 text-[10px] font-medium text-slate-800">
                                 <td className="py-1.5 px-2 font-mono text-[9px]">{new Date(sess.sessionStart).toLocaleDateString()} {new Date(sess.sessionStart).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                                 <td className="py-1.5 px-2 text-emerald-600">{sess.presentCount}</td>
                                 <td className="py-1.5 px-2 text-amber-600">{sess.lateCount}</td>
                                 <td className="py-1.5 px-2 text-rose-600">{sess.absentCount}</td>
                                 <td className="py-1.5 px-2 font-bold">{sess.attendancePct}%</td>
                               </tr>
                             ))}
                           </tbody>
                         </table>
                       </div>
                    </div>
                  )}

                  {activeEnrollments.length === 0 ? (
                    <div className="text-center p-6 text-slate-400 text-[10px] font-mono">
                      No active students are currently registered for this curriculum unit this semester.
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <p className="text-[8px] uppercase tracking-wider text-slate-400 font-extrabold mb-1">Mark students present:</p>
                      {activeEnrollments.map((enrollment: any) => {
                        const isPresent = !!sessionPresentIds[enrollment.registrationId];
                        return (
                          <div 
                            key={enrollment.registrationId} 
                            onClick={() => {
                              setSessionPresentIds(prev => ({
                                ...prev,
                                [enrollment.registrationId]: !prev[enrollment.registrationId]
                              }));
                            }}
                            className={`p-2.5 border rounded-xl cursor-pointer flex items-center justify-between transition-all ${
                              isPresent 
                                ? 'bg-indigo-50/50 border-indigo-200' 
                                : 'bg-white border-slate-150 hover:bg-slate-50'
                            }`}
                          >
                            <div>
                              <h4 className="font-bold text-slate-800 text-[10px]">{enrollment.studentName}</h4>
                              <p className="font-mono text-[8px] text-slate-400 mt-0.5 mt-0.5">
                                Reg No: {enrollment.studentReg} • Attended: {enrollment.attendanceCount}/{enrollment.totalClasses} classes
                              </p>
                            </div>
                            <div>
                              {isPresent ? (
                                <CheckSquare className="h-4 w-4 text-indigo-600" />
                              ) : (
                                <div className="h-4 w-4 rounded-md border border-slate-300"></div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 text-center text-slate-400 text-[10px] font-mono">
                  No core allocated teaching units configured.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Grade results transcript */}
        {activeSubTab === 'results' && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
              <h3 className="font-bold text-slate-800 text-xs">Exams & Academic Grading</h3>
              
              <div>
                <label className="text-[9px] text-slate-400 uppercase font-extrabold block mb-1">Select Unit Subject</label>
                <select
                  value={selectedUnitId}
                  onChange={(e) => setSelectedUnitId(e.target.value)}
                  className="w-full text-xs font-semibold p-2 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 outline-none"
                >
                  {assignments.map((assignment: any) => (
                    <option key={assignment.unitId} value={assignment.unitId}>
                      {assignment.unitCode} - {assignment.unitName}
                    </option>
                  ))}
                </select>
              </div>

              {activeAssignment ? (
                <div className="space-y-2.5 pt-3 border-t border-slate-100">
                  <p className="text-[8px] uppercase tracking-wider text-slate-400 font-extrabold">Student Enrollment List Grading Matrix:</p>

                  {activeEnrollments.length === 0 ? (
                    <div className="text-center p-6 text-slate-400 text-slate-400 text-[10px] font-mono">
                      No active students registered for this teaching allocation unit.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {activeEnrollments.map((enrollment: any) => {
                        const statusMsg = gradeStatusMap[enrollment.registrationId];
                        return (
                          <div key={enrollment.registrationId} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                            <div className="min-w-0 pr-2">
                              <h4 className="font-bold text-slate-800 text-[11px] truncate">{enrollment.studentName}</h4>
                              <p className="font-mono text-[9px] text-slate-400 mt-0.5">Reg: {enrollment.studentReg}</p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {statusMsg && (
                                <span className="text-[9px] font-bold text-emerald-600 font-mono animate-pulse">
                                  {statusMsg}
                                </span>
                              )}
                              
                              <select
                                defaultValue={enrollment.grade || '-'}
                                onChange={(e) => handleUpdateGrade(enrollment.registrationId, e.target.value)}
                                disabled={submittingGradeForRegId === enrollment.registrationId}
                                className="text-[10px] font-black tracking-tight bg-white border border-slate-250 p-1.5 rounded-lg text-slate-800 focus:border-indigo-500 outline-none w-[64px]"
                              >
                                <option value="-">-</option>
                                <option value="A">A</option>
                                <option value="B">B</option>
                                <option value="C">C</option>
                                <option value="D">D</option>
                                <option value="E">E</option>
                                <option value="F">F</option>
                              </select>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 text-center text-slate-400 text-[10px] font-mono">
                  No assignments loaded.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Communications Hub Tab */}
        {activeSubTab === 'communications' && (
          <div className="h-[620px] animate-fade-in flex flex-col shrink-0">
            <CommunicationsHub user={user} />
          </div>
        )}

        {/* Research Portal Tab */}
        {activeSubTab === 'research' && (
          <div className="animate-fade-in shrink-0">
            <LecturerResearchPortal token={token} user={user} />
          </div>
        )}

        {/* Unified Profile Tab */}
        {activeSubTab === 'profile' && (
          <div className="animate-fade-in">
            <ProfilePage token={token} user={user} appendLog={appendLog} />
          </div>
        )}
      </div>
    </div>
  </div>
  );
}
