/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  User, Calendar, BookOpen, Clock, Award, LogOut, Check, ChevronRight, CheckSquare, Square, 
  UserCheck, MapPin, Sparkles, RefreshCw, AlertCircle, MessageSquare, Wallet, Compass, Building2
} from 'lucide-react';
import CommunicationsHub from './CommunicationsHub';
import StudentFinancePortal from './StudentFinancePortal';
import StudentResultsPortal from './StudentResultsPortal';
import StudentLibraryPortal from './StudentLibraryPortal';
import StudentLifeArea from './StudentLifeArea';
import ProfilePage from './ProfilePage';

interface StudentDashboardProps {
  token: string;
  user: any;
  onLogout: () => void;
  appendLog?: (msg: string) => void;
  isPhoneFrame?: boolean;
}

export default function StudentDashboard({ 
  token, 
  user, 
  onLogout, 
  appendLog, 
  isPhoneFrame = false 
}: StudentDashboardProps) {
  
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'profile' | 'registration' | 'timetable' | 'results' | 'communications' | 'finance' | 'library' | 'student_life'>('dashboard');
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [chatInitialThreadId, setChatInitialThreadId] = useState<string | undefined>(undefined);
  const [chatInitialTargetUserId, setChatInitialTargetUserId] = useState<string | undefined>(undefined);

  // Edit Profile State
  const [avatarIndex, setAvatarIndex] = useState(0);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ phone: '', email: '', dob: '', gender: '' });
  const [savingProfile, setSavingProfile] = useState(false);

  // Registration selection state
  const [availableCurriculum, setAvailableCurriculum] = useState<any[]>([]);
  const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [activeYear, setActiveYear] = useState<any>(null);
  const [activeSem, setActiveSem] = useState<any>(null);
  const [savingReg, setSavingReg] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<boolean>(false);

  // New Course Details & Consultation Request State
  const [selectedRegUnit, setSelectedRegUnit] = useState<any>(null);
  const [appointmentTopic, setAppointmentTopic] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentSuccess, setAppointmentSuccess] = useState(false);
  const [syllabusChecks, setSyllabusChecks] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (selectedRegUnit && dashboardData?.student) {
      const storageKey = `syllabus_${dashboardData.student.id}_${selectedRegUnit.unitCode}`;
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          setSyllabusChecks(JSON.parse(saved));
        } else {
          setSyllabusChecks({});
        }
      } catch (e) {
        setSyllabusChecks({});
      }
      setAppointmentSuccess(false);
      setAppointmentTopic('');
      setAppointmentDate('');
    }
  }, [selectedRegUnit, dashboardData]);

  const handleToggleSyllabusTopic = (topic: string) => {
    if (!selectedRegUnit || !dashboardData?.student) return;
    const storageKey = `syllabus_${dashboardData.student.id}_${selectedRegUnit.unitCode}`;
    const nextChecks = { ...syllabusChecks, [topic]: !syllabusChecks[topic] };
    setSyllabusChecks(nextChecks);
    try {
      localStorage.setItem(storageKey, JSON.stringify(nextChecks));
    } catch(e) {}
    appendLog?.(`[SYLLABUS] Updated self-study progress for ${selectedRegUnit.unitCode}: ${topic}`);
  };

  const handleApptSubmit = (e: React.FormEvent) => {
     e.preventDefault();
     if (!selectedRegUnit || !appointmentTopic || !appointmentDate) return;
     setAppointmentSuccess(true);
     appendLog?.(`[ACADEMIC] Advisory appointment requested with ${selectedRegUnit.lecturer?.name || 'Instructor'} on ${appointmentDate} regarding: "${appointmentTopic}"`);
     setTimeout(() => {
        setAppointmentSuccess(false);
        setAppointmentTopic('');
        setAppointmentDate('');
     }, 3500);
  };

  // Attendance Scanning State
  const [showScanner, setShowScanner] = useState(false);
  const [scanState, setScanState] = useState<'idle'|'scanning'|'success'|'error'>('idle');
  const [qrToken, setQrToken] = useState('');
  const [scanMessage, setScanMessage] = useState('');

  // Profile Form Handling
  const handleEditProfileInit = () => {
    if (!dashboardData?.student) return;
    setProfileForm({
      phone: dashboardData.student.phone || '',
      email: dashboardData.student.email || '',
      dob: dashboardData.student.dob || '',
      gender: dashboardData.student.gender || 'male'
    });
    setIsEditingProfile(true);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const resp = await fetch('/api/student/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(profileForm)
      });
      if (resp.ok) {
        setIsEditingProfile(false);
        setRefreshTrigger(prev => prev + 1);
        appendLog?.(`[PORTAL] Profile updated successfully.`);
      } else {
        alert('Failed to update profile');
      }
    } catch (e) {
      console.error(e);
      alert('Network error updating profile');
    } finally {
      setSavingProfile(false);
    }
  };

  // Fetch student dashboard details
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const resp = await fetch('/api/student/dashboard', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (resp.ok) {
          const data = await resp.json();
          setDashboardData(data);
          appendLog?.(`[PORTAL] Loaded student portal profile for "${data.student?.name}"`);

          // Preset checked unit selection
          if (data.registrations) {
            setSelectedUnitIds(data.registrations.map((r: any) => r.unitId));
          }

          // Solve active period
          if (data.activeAcademicYear) {
            setActiveYear(data.activeAcademicYear);
          }
        }
      } catch (err) {
        console.error('Error loading student dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [token, refreshTrigger]);

  // Fetch available curriculums for student registration
  useEffect(() => {
    if (!dashboardData?.student) return;

    async function loadRegistrationContext() {
      try {
        // Fetch academic years, semesters, levels and curriculums for lookup
        const ayResp = await fetch('/api/admin/academic-years', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const semResp = await fetch('/api/admin/semesters', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const currResp = await fetch('/api/admin/curriculums', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (ayResp.ok && semResp.ok && currResp.ok) {
          const ays = await ayResp.json();
          const sems = await semResp.json();
          const currs = await currResp.json();

          setAcademicYears(ays);
          setSemesters(sems);

          const activeAY = ays.find((y: any) => y.status === 'active');
          const activeS = sems.find((s: any) => s.status === 'active' || (activeAY && s.academicYearId === activeAY.id));
          
          if (activeAY) setActiveYear(activeAY);
          if (activeS) setActiveSem(activeS);

          // Filter curriculum mapped to this student's program and level
          const studentProgramId = dashboardData.student.programId;
          const studentLevelId = dashboardData.student.levelId;

          const filtered = currs.filter((c: any) => 
            c.programId === studentProgramId && 
            (!studentLevelId || c.levelId === studentLevelId) &&
            (!activeS || c.semesterId === activeS.id)
          );
          setAvailableCurriculum(filtered);
        }
      } catch (e) {
        console.error('Could not construct registration catalog:', e);
      }
    }

    loadRegistrationContext();
  }, [dashboardData?.student, token]);

  const handleToggleUnit = (unitId: string) => {
    if (selectedUnitIds.includes(unitId)) {
      setSelectedUnitIds(prev => prev.filter(id => id !== unitId));
    } else {
      setSelectedUnitIds(prev => [...prev, unitId]);
    }
  };

  const handleRegisterSubmit = async () => {
    if (!activeYear || !activeSem) {
      setRegError('Academic period (Year and Semester) must be active to register course units.');
      return;
    }
    setSavingReg(true);
    setRegError(null);
    setRegSuccess(false);

    try {
      const resp = await fetch('/api/student/register-units', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          academicYearId: activeYear.id,
          semesterId: activeSem.id,
          unitIds: selectedUnitIds
        })
      });

      if (resp.ok) {
        const resJson = await resp.json();
        setRegSuccess(true);
        appendLog?.(`[PORTAL] Self-Registration updated online: checked ${selectedUnitIds.length} course units.`);
        setRefreshTrigger(prev => prev + 1);
      } else {
        const errorData = await resp.json();
        setRegError(errorData.error || 'Server rejected registered enrollment.');
      }
    } catch (e) {
      setRegError('Network timeout submitting registrations.');
    } finally {
      setSavingReg(false);
    }
  };

  const handleScanAttendance = async () => {
    if (!qrToken.trim()) return;
    setScanState('scanning');
    setScanMessage('');
    try {
      const resp = await fetch('/api/student/attendance/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          qrToken: qrToken.trim(), 
          deviceId: 'dev-' + user.id // Mock browser device ID
        })
      });
      const data = await resp.json();
      if (resp.ok) {
        setScanState('success');
        setScanMessage(`Attendance confirmed: ${data.status}`);
        appendLog?.(`[SECURITY] Registered attendance successfully via QR (${qrToken})`);
        setRefreshTrigger(prev => prev + 1);
        setTimeout(() => {
           setShowScanner(false);
           setScanState('idle');
           setQrToken('');
           setScanMessage('');
        }, 3000);
      } else {
        setScanState('error');
        setScanMessage(data.error || 'Check-in failed');
        appendLog?.(`[SECURITY] Attendance check-in rejection: ${data.error}`);
      }
    } catch (e) {
      setScanState('error');
      setScanMessage('Network failure during check-in');
    }
  };

  if (loading && !dashboardData) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-slate-500 font-mono text-[11px] gap-2">
        <RefreshCw className="h-4 w-4 animate-spin text-indigo-600" />
        <span>Synchronizing Academic Profile...</span>
      </div>
    );
  }

  const student = dashboardData?.student || {};
  const schoolName = dashboardData?.school?.name || 'SmartCampus Network';
  const programName = dashboardData?.program?.name || 'General Course';
  const departmentName = dashboardData?.department?.name || 'Academic Dept';
  const levelName = dashboardData?.level?.name || 'Unassigned Level';
  const activeYearName = dashboardData?.activeAcademicYear?.name || 'None Active';
  const myRegistrations = dashboardData?.registrations || [];
  const myTimetable = dashboardData?.timetable || [];

  return (
    <div className={`flex flex-col flex-1 bg-slate-50 ${isPhoneFrame ? 'text-xs' : 'text-sm'}`}>
      {/* Top Banner Cover */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-4 border-b border-indigo-900 text-white flex justify-between items-center shrink-0 shadow-lg">
        <div>
          <span className="text-[8px] font-bold py-0.5 px-2 bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-400/20 uppercase tracking-widest">
            Student Portal
          </span>
          <h2 className="text-sm font-bold truncate tracking-tight text-white mt-1 max-w-[210px]">{student.name}</h2>
          <p className="text-[9px] text-slate-300 font-mono tracking-wider">{student.regNumber || 'ADMISSION KEY'}</p>
        </div>
        <button
          onClick={onLogout}
          className="p-2 text-rose-300 hover:bg-rose-500/10 rounded-full hover:text-rose-200 transition-colors cursor-pointer"
          title="Sign Out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>

      {/* Quick Info Ribbon */}
      <div className="bg-white border-b border-slate-200 px-3 py-1.5 flex justify-between items-center shrink-0">
        <span className="text-[9px] text-slate-500 font-medium truncate max-w-[190px]">{schoolName}</span>
        <span className="text-[9px] px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-150 font-bold uppercase tracking-wider">
          {student.status || 'Active'}
        </span>
      </div>

      {/* Navigation SubTabs */}
      <div className="grid grid-cols-3 sm:grid-cols-9 bg-slate-100 border-b border-slate-200 select-none shrink-0 text-center text-[10px]">
        <button
          onClick={() => setActiveSubTab('dashboard')}
          className={`py-2.5 font-bold transition-all border-b-2 flex flex-col items-center gap-0.5 cursor-pointer ${
            activeSubTab === 'dashboard' 
              ? 'border-indigo-600 text-indigo-600 bg-white font-extrabold' 
              : 'border-transparent text-slate-500 hover:bg-slate-200/50'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5 text-indigo-550" />
          <span>Dashboard</span>
        </button>
        <button
          onClick={() => setActiveSubTab('profile')}
          className={`py-2.5 font-bold transition-all border-b-2 flex flex-col items-center gap-0.5 cursor-pointer ${
            activeSubTab === 'profile' 
              ? 'border-indigo-600 text-indigo-600 bg-white font-extrabold' 
              : 'border-transparent text-slate-500 hover:bg-slate-200/50'
          }`}
        >
          <User className="h-3.5 w-3.5" />
          <span>Profile</span>
        </button>
        <button
          onClick={() => setActiveSubTab('registration')}
          className={`py-2.5 font-bold transition-all border-b-2 flex flex-col items-center gap-0.5 cursor-pointer ${
            activeSubTab === 'registration' 
              ? 'border-indigo-600 text-indigo-600 bg-white font-extrabold' 
              : 'border-transparent text-slate-500 hover:bg-slate-200/50'
          }`}
        >
          <CheckSquare className="h-3.5 w-3.5" />
          <span>Registered Units</span>
        </button>
        <button
          onClick={() => setActiveSubTab('timetable')}
          className={`py-2.5 font-bold transition-all border-b-2 flex flex-col items-center gap-0.5 cursor-pointer ${
            activeSubTab === 'timetable' 
              ? 'border-indigo-600 text-indigo-600 bg-white font-extrabold' 
              : 'border-transparent text-slate-500 hover:bg-slate-200/50'
          }`}
        >
          <Clock className="h-3.5 w-3.5" />
          <span>Timetable</span>
        </button>
        <button
          onClick={() => setActiveSubTab('results')}
          className={`py-2.5 font-bold transition-all border-b-2 flex flex-col items-center gap-0.5 cursor-pointer ${
            activeSubTab === 'results' 
              ? 'border-indigo-600 text-indigo-600 bg-white font-extrabold' 
              : 'border-transparent text-slate-500 hover:bg-slate-200/50'
          }`}
        >
          <Award className="h-3.5 w-3.5" />
          <span>Results</span>
        </button>
        <button
          onClick={() => setActiveSubTab('communications')}
          className={`py-2.5 font-bold transition-all border-b-2 flex flex-col items-center gap-0.5 cursor-pointer ${
            activeSubTab === 'communications' 
              ? 'border-indigo-600 text-indigo-600 bg-white font-extrabold' 
              : 'border-transparent text-slate-500 hover:bg-slate-200/50'
          }`}
        >
          <MessageSquare className="h-3.5 w-3.5 text-[#4f46e5]" />
          <span>Chat & Live</span>
        </button>
        <button
          onClick={() => setActiveSubTab('finance')}
          className={`py-2.5 font-bold transition-all border-b-2 flex flex-col items-center gap-0.5 cursor-pointer ${
            activeSubTab === 'finance' 
              ? 'border-indigo-600 text-emerald-600 bg-white font-extrabold' 
              : 'border-transparent text-slate-500 hover:bg-slate-200/50'
          }`}
        >
          <Wallet className="h-3.5 w-3.5 text-emerald-500" />
          <span>Finance</span>
        </button>
        <button
          onClick={() => setActiveSubTab('library')}
          className={`py-2.5 font-bold transition-all border-b-2 flex flex-col items-center gap-0.5 cursor-pointer ${
            activeSubTab === 'library' 
              ? 'border-indigo-600 text-indigo-600 bg-white font-extrabold' 
              : 'border-transparent text-slate-500 hover:bg-slate-200/50'
          }`}
        >
          <BookOpen className="h-3.5 w-3.5" />
          <span>Library & Research</span>
        </button>
        <button
          onClick={() => setActiveSubTab('student_life')}
          className={`py-2.5 font-bold transition-all border-b-2 flex flex-col items-center gap-0.5 cursor-pointer ${
            activeSubTab === 'student_life' 
              ? 'border-indigo-600 text-indigo-600 bg-white font-extrabold' 
              : 'border-transparent text-slate-500 hover:bg-slate-200/50'
          }`}
        >
          <Compass className="h-3.5 w-3.5 text-[#3b82f6]" />
          <span>Campus Life</span>
        </button>
        <button
          onClick={onLogout}
          className="py-2.5 font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-all border-b-2 border-transparent flex flex-col items-center gap-0.5 cursor-pointer font-sans"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Logout</span>
        </button>
      </div>

      {/* Main Tab Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* Dashboard Placeholder Tab */}
        {activeSubTab === 'dashboard' && (
          <div className="space-y-4 animate-fade-in text-[11px]">
            {/* Header Greeting Banner */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-5 rounded-2xl border border-indigo-950 text-white shadow-md relative overflow-hidden">
              <div className="absolute right-[-10px] top-[-10px] text-indigo-500/10 pointer-events-none">
                <Sparkles className="h-28 w-28" />
              </div>
              <h3 className="text-sm font-black tracking-tight flex items-center gap-2 mb-1.5">
                <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
                Welcome, {student.name}!
              </h3>
              <p className="text-[10px] text-slate-300 font-mono">Phase 11.5 Student Super App Experience</p>
              
              <div className="grid grid-cols-2 mt-4 gap-2 text-[10px] font-mono border-t border-indigo-800/50 pt-3">
                 <div>Reg: <span className="text-emerald-300 font-bold">{student.regNumber || 'Pending'}</span></div>
                 <div>Clearance: <span className="bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold uppercase">CLEARED</span></div>
              </div>
            </div>

            {/* PHASE 11.5 LIVE WIDGETS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* Widget: Fee Balance */}
              <div onClick={() => setActiveSubTab('finance')} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-all cursor-pointer">
                <div className="flex justify-between items-start mb-2">
                   <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg"><Wallet className="h-3.5 w-3.5" /></div>
                </div>
                <div className="text-[9px] font-bold text-slate-500 uppercase font-mono">Fee Balance</div>
                <div className="text-sm font-black text-slate-800 mt-1">KES 45,500</div>
              </div>

              {/* Widget: Current GPA */}
              <div onClick={() => setActiveSubTab('results')} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-all cursor-pointer">
                <div className="flex justify-between items-start mb-2">
                   <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg"><Award className="h-3.5 w-3.5" /></div>
                </div>
                <div className="text-[9px] font-bold text-slate-500 uppercase font-mono">Current GPA</div>
                <div className="text-sm font-black text-indigo-600 mt-1">3.8 / 4.0</div>
              </div>

              {/* Widget: Attendance */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between group relative overflow-hidden">
                <div>
                  <div className="flex justify-between items-start mb-2">
                     <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg"><UserCheck className="h-3.5 w-3.5" /></div>
                  </div>
                  <div className="text-[9px] font-bold text-slate-500 uppercase font-mono">Attendance</div>
                  <div className="text-sm font-black text-emerald-600 mt-1">{dashboardData?.student?.overallAttendancePct ?? 94}%</div>
                </div>
                <button 
                  onClick={() => setShowScanner(true)}
                  className="mt-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[9px] font-bold uppercase transition-all shadow-sm"
                >
                  Log Attendance
                </button>
                
                {/* Scanner Modal overlay confined to widget area for smooth UX */}
                {showScanner && (
                  <div className="absolute inset-0 bg-slate-900 z-10 flex flex-col items-center justify-center p-3 animate-fade-in text-center">
                    <h5 className="text-white text-[10px] font-bold mb-2">Log Attendance</h5>
                    <input 
                       type="text"
                       placeholder="Enter Live QR Token"
                       className="w-full text-[10px] p-2 rounded bg-slate-800 text-white border border-slate-700 outline-none focus:border-indigo-500 text-center uppercase mb-2"
                       value={qrToken}
                       onChange={e => setQrToken(e.target.value.toUpperCase())}
                       onKeyDown={e => e.key === 'Enter' && handleScanAttendance()}
                    />
                    {scanMessage && (
                       <div className={`text-[8px] font-bold mb-2 ${scanState === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                         {scanMessage}
                       </div>
                    )}
                    <div className="flex gap-2 w-full">
                       <button 
                         onClick={() => {
                           setShowScanner(false);
                           setScanState('idle');
                           setScanMessage('');
                           setQrToken('');
                         }}
                         className="flex-1 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded text-[9px] font-bold uppercase"
                       >
                         Cancel
                       </button>
                       <button
                         onClick={handleScanAttendance}
                         disabled={scanState === 'scanning' || !qrToken}
                         className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded text-[9px] font-bold uppercase"
                       >
                         {scanState === 'scanning' ? 'Verifying...' : 'Submit'}
                       </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Widget: Hostel Status */}
              <div onClick={() => setActiveSubTab('student_life')} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-all cursor-pointer">
                <div className="flex justify-between items-start mb-2">
                   <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><Compass className="h-3.5 w-3.5" /></div>
                </div>
                <div className="text-[9px] font-bold text-slate-500 uppercase font-mono">Hostel Status</div>
                <div className="text-xs font-black text-slate-800 mt-1">Block A - 402</div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
               {/* Today's Classes */}
               <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                  <div className="flex justify-between items-center mb-3">
                     <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-indigo-500" /> Today's Classes</h4>
                     <button onClick={() => setActiveSubTab('timetable')} className="text-[9px] font-bold text-indigo-600 hover:underline">View Timetable</button>
                  </div>
                  <div className="space-y-2">
                     {(() => {
                        const code = 'NET401';
                        const reg = myRegistrations.find((r: any) => r.unitCode === code || r.unitCode.toLowerCase().includes('net'));
                        return (
                           <div 
                              onClick={() => reg && setSelectedRegUnit(reg)}
                              className={`flex gap-3 bg-slate-50 p-2 rounded-lg border border-slate-100 transition-colors ${reg ? 'hover:bg-indigo-50/40 hover:border-indigo-300 cursor-pointer' : ''}`}
                              title={reg ? "Click to view Syllabus & Attendance" : ""}
                           >
                              <div className="bg-indigo-100 text-indigo-700 font-bold font-mono text-[9px] px-2 py-1 flex items-center justify-center rounded">10:00 AM</div>
                              <div className="flex-1 min-w-0">
                                 <div className="text-[10px] font-bold text-slate-800 flex justify-between items-center">
                                   <span>Advanced Networking (NET401)</span>
                                   {reg && <span className="text-[8px] font-mono text-indigo-650 bg-indigo-50 border border-indigo-100 px-1 rounded">Outline</span>}
                                 </div>
                                 <div className="text-[9px] text-slate-500">Hall 3 • Prof. Omondi</div>
                              </div>
                           </div>
                        );
                     })()}

                     {(() => {
                        const code = 'SET405';
                        const reg = myRegistrations.find((r: any) => r.unitCode === code || r.unitCode.toLowerCase().includes('set') || r.unitCode.toLowerCase().includes('cs') || r.unitCode.toLowerCase().includes('comp'));
                        return (
                           <div 
                              onClick={() => reg && setSelectedRegUnit(reg)}
                              className={`flex gap-3 bg-slate-50 p-2 rounded-lg border border-slate-100 transition-colors ${reg ? 'hover:bg-indigo-50/40 hover:border-indigo-300 cursor-pointer' : ''}`}
                              title={reg ? "Click to view Syllabus & Attendance" : ""}
                           >
                              <div className="bg-indigo-100 text-indigo-700 font-bold font-mono text-[9px] px-2 py-1 flex items-center justify-center rounded">02:00 PM</div>
                              <div className="flex-1 min-w-0">
                                 <div className="text-[10px] font-bold text-slate-800 flex justify-between items-center">
                                   <span>Software Architecture (SET405)</span>
                                   {reg && <span className="text-[8px] font-mono text-indigo-650 bg-indigo-50 border border-indigo-100 px-1 rounded">Outline</span>}
                                 </div>
                                 <div className="text-[9px] text-slate-500">Lab B • Dr. Kamau</div>
                              </div>
                           </div>
                        );
                     })()}
                  </div>
               </div>

               {/* Notifications & Library */}
               <div className="space-y-3">
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                     <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5 mb-2"><AlertCircle className="h-3.5 w-3.5 text-amber-500" /> Recent Notifications</h4>
                     <ul className="space-y-1.5 text-[10px] text-slate-600">
                        <li className="flex items-start gap-1.5"><span className="text-amber-500">•</span> Default notice: Course registration closes this Friday.</li>
                        <li className="flex items-start gap-1.5"><span className="text-indigo-500">•</span> Mid-term exam timetable published.</li>
                     </ul>
                  </div>
                  
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                     <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5 mb-2"><BookOpen className="h-3.5 w-3.5 text-emerald-500" /> Library Loans</h4>
                     <div className="flex justify-between items-center text-[10px]">
                        <span className="font-medium text-slate-600">"Data Structures and Algorithms"</span>
                        <span className="text-rose-500 font-bold">Due Tomorrow</span>
                     </div>
                  </div>
               </div>
            </div>

            {/* My Course Lecturers and Instructors */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mt-1">
               <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5"><User className="h-3.5 w-3.5 text-indigo-500" /> My Course Lecturers & Instructors</h4>
                  <span className="text-[9px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-bold uppercase">Active Contacts</span>
               </div>
               
               {myRegistrations.length === 0 ? (
                  <div className="text-[10px] text-slate-500 text-center py-5 bg-slate-50 rounded-lg italic">
                     No course registrations active. Register units to see assigned lecturers.
                  </div>
               ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                     {myRegistrations.map((reg: any, idx: number) => {
                        const lecturer = reg.lecturer;
                        return (
                           <div key={reg.id || idx} className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 flex flex-col justify-between hover:border-indigo-300 transition-all shadow-sm">
                              <div>
                                 <div className="flex justify-between items-start mb-1.5">
                                    <div className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded font-mono text-[8px] font-bold uppercase tracking-wider">
                                       {reg.unitCode}
                                    </div>
                                    <span className="text-[8px] text-slate-400 font-mono">{reg.semesterName || 'Semester Unit'}</span>
                                 </div>
                                 <h5 className="font-bold text-slate-800 text-[10px] line-clamp-1 mb-2">{reg.unitName}</h5>
                                 
                                 {lecturer ? (
                                    <div className="flex items-center gap-2 pt-2 border-t border-slate-200/50">
                                       <div className="h-7 w-7 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-[9px] shrink-0 font-mono border border-indigo-100 uppercase">
                                          {lecturer.name ? lecturer.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2) : 'L'}
                                       </div>
                                       <div className="min-w-0 flex-1">
                                          <div className="text-[9px] font-bold text-slate-800 truncate">{lecturer.name}</div>
                                          <div className="text-[8px] font-medium text-slate-450 truncate">{lecturer.role}</div>
                                          <div className="text-[8px] font-mono text-indigo-600 truncate mt-0.5 flex items-center gap-1">
                                             <Building2 className="h-2 w-2 text-indigo-500 shrink-0" /> {lecturer.departmentName}
                                          </div>
                                       </div>
                                    </div>
                                 ) : (
                                    <div className="text-[8px] text-slate-400 italic py-1 flex items-center gap-1.5 pt-2 border-t border-slate-200/50">
                                       <span className="animate-pulse text-amber-500">●</span> Lecturer mapping synced to Department Chair...
                                    </div>
                                 )}
                              </div>
                              
                              {lecturer && (
                                 <div className="mt-3 pt-2 border-t border-slate-200/50 flex gap-1.5">
                                    <button
                                       onClick={() => setSelectedRegUnit(reg)}
                                       className="flex-1 py-1 px-1.5 bg-indigo-50 hover:bg-indigo-150 border border-indigo-200 text-indigo-700 rounded text-[8px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-[0.98]"
                                       title="View Course Outline & Syllabus"
                                    >
                                       <BookOpen className="h-2.5 w-2.5 text-indigo-500" /> Outline
                                    </button>
                                    <button
                                       onClick={() => {
                                          if (lecturer.userId) {
                                             setChatInitialTargetUserId(lecturer.userId);
                                             setChatInitialThreadId(undefined);
                                             setActiveSubTab('communications');
                                             appendLog?.(`[PORTAL] Initiating secure direct communication channel with course lecturer "${lecturer.name}"`);
                                          } else {
                                             alert('This lecturer does not have an active chat profile yet.');
                                          }
                                       }}
                                       className="flex-1 py-1 px-1.5 bg-indigo-600 hover:bg-slate-900 text-white rounded text-[8px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-[0.98]"
                                    >
                                       <MessageSquare className="h-2.5 w-2.5" /> Start Chat
                                    </button>
                                    <a
                                       href={`mailto:${lecturer.email}`}
                                       className="py-1 px-2 bg-slate-205 hover:bg-slate-200 text-slate-600 rounded text-[8px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 shrink-0 transition-all border border-slate-200"
                                       title={`Email ${lecturer.name}`}
                                    >
                                       ✉ Email
                                    </a>
                                 </div>
                              )}
                           </div>
                        );
                     })}
                  </div>
               )}
            </div>
          </div>
        )}
        
        {/* Profile Details Tab */}
        {activeSubTab === 'profile' && (
          <div className="space-y-4">
            <ProfilePage token={token} user={user} appendLog={appendLog} />
          </div>
        )}

        {/* Course Unit Registration Tab */}
        {activeSubTab === 'registration' && (
          <div className="space-y-4 animate-fade-in">
            {myRegistrations.length > 0 && (
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <div>
                    <h3 className="font-bold text-slate-800 text-xs">Active Course Enrollments</h3>
                    <p className="text-[9px] text-slate-400 font-mono mt-0.5">Your currently registered units and assigned lecturers</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {myRegistrations.map((reg: any, idx: number) => {
                    const lecturer = reg.lecturer;
                    const pct = reg.totalClasses > 0 ? Math.round((reg.attendanceCount / reg.totalClasses) * 100) : 100;
                    const isAtRisk = reg.totalClasses > 0 && pct < 75;
                    
                    return (
                      <div 
                        key={reg.id || idx} 
                        onClick={() => setSelectedRegUnit(reg)}
                        className={`bg-slate-50 p-3.5 flex flex-col justify-between rounded-xl border transition-all relative overflow-hidden group cursor-pointer hover:border-indigo-500 hover:shadow-md ${isAtRisk ? 'border-amber-300 ring-1 ring-amber-100' : 'border-slate-200'}`}
                        title="Click to view full syllabus & sessions attendance history"
                      >
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                          <BookOpen className="h-10 w-10 text-indigo-500" />
                        </div>
                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-2">
                             <div className="flex items-center gap-1.5">
                               <span className="font-mono text-[9px] font-bold text-white bg-indigo-600 px-1.5 py-0.5 rounded shadow-sm">{reg.unitCode}</span>
                               <span className="text-[9px] font-bold text-indigo-600 font-mono">
                                 {(reg.totalClasses || 0) > 0 ? `${reg.attendanceCount || 0}/${reg.totalClasses} Attended (${pct}%)` : 'No classes yet'}
                               </span>
                             </div>
                             <div className="flex items-center gap-1">
                               {isAtRisk && (
                                 <span className="text-[8px] font-bold bg-amber-500 text-white px-1.5 py-0.5 rounded flex items-center gap-0.5 animate-pulse">
                                   ⚠️ At-Risk
                                 </span>
                               )}
                               {reg.grade && reg.grade !== '-' && (
                                 <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                                   Grade: {reg.grade}
                                 </span>
                               )}
                             </div>
                          </div>
                          <h4 className="font-bold text-slate-800 text-[11px] mb-3 pr-6 group-hover:text-indigo-600 transition-colors">{reg.unitName}</h4>
                          
                          {lecturer ? (
                             <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60">
                                <div className="h-6 w-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-[8px] shrink-0 font-mono uppercase">
                                   {lecturer.name ? lecturer.name.substring(0, 2) : 'L'}
                                </div>
                                <div className="min-w-0 flex-1">
                                   <div className="text-[9px] font-bold text-slate-700 truncate block">{lecturer.name}</div>
                                   <div className="text-[8px] font-medium text-slate-500 truncate mt-0.5">{lecturer.email}</div>
                                </div>
                                <span className="text-[8.5px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded-md">View Syllabus</span>
                             </div>
                          ) : (
                             <div className="text-[8px] text-slate-400 italic py-1 flex items-center gap-1 pt-2 border-t border-slate-200/60">
                                <span className="animate-pulse text-amber-500">●</span> Lecturer mapping pending
                             </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-800 text-xs">Self Enrollment</h3>
                  <p className="text-[9px] text-slate-400 font-mono mt-0.5">
                    {activeYear ? activeYear.name : 'Unknown Year'} • {activeSem ? activeSem.name : 'Unknown Semester'}
                  </p>
                </div>
                <button
                  onClick={handleRegisterSubmit}
                  disabled={savingReg || availableCurriculum.length === 0}
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold cursor-pointer disabled:opacity-50 transition-all flex items-center gap-1 shadow-sm"
                >
                  {savingReg ? (
                    <>
                      <RefreshCw className="h-3 w-3 animate-spin" /> saving...
                    </>
                  ) : (
                    <>
                      <Check className="h-3 w-3" /> Save Changes
                    </>
                  )}
                </button>
              </div>

              {regSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-[10px] font-bold flex items-center gap-2">
                  <CheckSquare className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>Your student registrations has been synchronized successfully.</span>
                </div>
              )}

              {regError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-[10px] font-bold flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                  <span>{regError}</span>
                </div>
              )}

              {availableCurriculum.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-[10px] font-mono">
                  No active program-level syllabus mappings found for your current semester curriculum.
                </div>
              ) : (
                <div className="space-y-2 pt-1">
                  <p className="text-[9px] text-slate-400 font-semibold mb-2 font-mono uppercase tracking-widest">
                    Checkbox Selection List:
                  </p>
                  
                  {availableCurriculum.map((item: any) => {
                    const isChecked = selectedUnitIds.includes(item.unitId);
                    return (
                      <div 
                        key={item.id} 
                        onClick={() => handleToggleUnit(item.unitId)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex justify-between items-center ${
                          isChecked 
                            ? 'bg-indigo-50/50 border-indigo-200 shadow-xs' 
                            : 'bg-white border-slate-200 hover:bg-slate-55'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[9px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-1 py-0.2 rounded">
                              {item.unitCode}
                            </span>
                            <span className={`text-[8px] font-bold px-1 py-0.2 rounded uppercase ${
                              item.unitType === 'Core' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'
                            }`}>
                              {item.unitType}
                            </span>
                          </div>
                          <h4 className="font-bold text-slate-800 text-[11px] mt-1">{item.unitName}</h4>
                        </div>
                        
                        <div>
                          {isChecked ? (
                            <CheckSquare className="h-4 w-4 text-indigo-600" />
                          ) : (
                            <Square className="h-4 w-4 text-slate-350" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Timetable Engine Tab */}
        {activeSubTab === 'timetable' && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
              <h3 className="font-bold text-slate-800 text-xs pb-2 border-b border-slate-100 mb-3"> Weekly Lecture Schedule</h3>
              
              {myTimetable.length === 0 ? (
                <div className="p-8 text-center text-slate-450 text-[10px] font-mono">
                  No scheduled timetable slots found matching your Program + Level class group registry.
                </div>
              ) : (
                <div className="space-y-4 pt-1">
                  {/* Sort timetable day order */}
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => {
                    const sessions = myTimetable.filter(t => t.day === day);
                    if (sessions.length === 0) return null;

                    return (
                      <div key={day} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold tracking-widest text-indigo-600 uppercase font-mono pl-1">
                            {day}
                          </span>
                          <div className="h-px bg-slate-100 flex-1"></div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {sessions.map((slot: any) => {
                            const isHappeningNow = slot.activeSessionId ? true : false;
                            const correspondingReg = myRegistrations.find((r: any) => r.unitId === slot.unitId || r.unitCode === slot.unitCode);
                            
                            return (
                              <div 
                                key={slot.id} 
                                onClick={() => correspondingReg && setSelectedRegUnit(correspondingReg)}
                                className={`p-3 border rounded-xl flex items-start gap-3 relative overflow-hidden transition-all shadow-sm group ${
                                  correspondingReg ? 'cursor-pointer hover:shadow-md' : ''
                                } ${
                                  isHappeningNow 
                                    ? 'bg-indigo-50/50 border-indigo-200 hover:border-indigo-400' 
                                    : 'bg-slate-50 border-slate-200 hover:border-indigo-300'
                                }`}
                                title={correspondingReg ? "Click to view full syllabus outline & request consultation" : "Scheduled timetable slot details"}
                              >
                                {isHappeningNow && (
                                  <div className="absolute top-0 right-0 p-1.5 flex items-center justify-center pointer-events-none">
                                    <span className="flex h-2.5 w-2.5 relative">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                                    </span>
                                  </div>
                                )}
                                
                                <div className={`p-2 border rounded-lg flex flex-col items-center justify-center shrink-0 w-12 ${isHappeningNow ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-white text-slate-600 border-slate-200'}`}>
                                  <Clock className={`h-4 w-4 mb-1 ${isHappeningNow ? 'text-white' : 'text-indigo-500'}`} />
                                  <span className="font-mono text-[8px] font-black">{slot.timeSlot?.split('-')[0] || '?'}</span>
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 justify-between">
                                    <div className="flex items-center gap-1">
                                      <span className="font-mono text-[10px] font-bold text-indigo-600 px-1 py-0.5 bg-indigo-50 rounded border border-indigo-100">{slot.unitCode}</span>
                                      {correspondingReg && (
                                        <span className="text-[8px] bg-indigo-105 text-indigo-700 px-1 rounded font-bold font-mono border border-indigo-200">Outline</span>
                                      )}
                                    </div>
                                    <span className="font-mono font-medium text-[9px] text-slate-400">{slot.timeSlot}</span>
                                  </div>
                                  <h4 className="font-bold text-slate-800 text-[11px] truncate mt-1.5 pr-4 group-hover:text-indigo-700 transition-colors">{slot.unitName}</h4>
                                  
                                  <div className="mt-2 flex flex-col gap-1.5 border-t border-slate-200/50 pt-2">
                                    <div className="flex justify-between items-center text-[9px] text-slate-500">
                                      <span className="flex items-center gap-1 font-semibold truncate max-w-[140px] text-slate-700">
                                        <User className="h-3 w-3 text-slate-400" /> {slot.lecturerName || 'Assigned Instructor'}
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center text-[9px]">
                                      <span className="flex items-center gap-1 font-mono uppercase bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">
                                        <MapPin className="h-3 w-3" /> {isHappeningNow ? slot.activeSessionVenue : slot.venue}
                                      </span>
                                      
                                      {isHappeningNow && (
                                        <button 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setShowScanner(true);
                                          }}
                                          className="text-[9px] bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1 transition-colors"
                                        >
                                          Log Attendance
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Results / Academic Transcript Tab */}
        {activeSubTab === 'results' && (
           <StudentResultsPortal 
              token={token}
              user={user}
              appendLog={appendLog}
              isPhoneFrame={isPhoneFrame}
           />
        )}

        {/* Communications Hub Tab */}
        {activeSubTab === 'communications' && (
          <div className="h-[620px] animate-fade-in flex flex-col shrink-0">
            <CommunicationsHub 
              user={user} 
              initialThreadId={chatInitialThreadId}
              initialTargetUserId={chatInitialTargetUserId}
            />
          </div>
        )}

        {/* Finance Portal Tab */}
        {activeSubTab === 'finance' && (
          <div className="animate-fade-in shrink-0">
            <StudentFinancePortal token={token} user={user} appendLog={appendLog} isPhoneFrame={isPhoneFrame} />
          </div>
        )}

        {/* Library Portal Tab */}
        {activeSubTab === 'library' && (
          <div className="animate-fade-in shrink-0">
            <StudentLibraryPortal />
          </div>
        )}

        {/* Student Life Portal Tab */}
        {activeSubTab === 'student_life' && (
          <div className="animate-fade-in shrink-0 bg-white p-6 rounded-xl border border-slate-200">
            <StudentLifeArea token={token} student={student} appendLog={appendLog} />
          </div>
        )}
      </div>

      {/* NEW Course Syllabus & Attendance Details Modal */}
      {selectedRegUnit && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in my-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-800 to-indigo-900 text-white p-4 flex justify-between items-center">
              <div>
                <span className="text-[9px] uppercase font-mono font-bold tracking-widest bg-indigo-700 px-2 py-0.5 rounded shadow-xs mb-1 inline-block">
                  {selectedRegUnit.unitCode} Course Outline
                </span>
                <h3 className="font-bold text-sm tracking-tight">{selectedRegUnit.unitName}</h3>
              </div>
              <button 
                onClick={() => setSelectedRegUnit(null)}
                className="h-8 w-8 rounded-full bg-indigo-600/55 hover:bg-slate-800 text-white font-extrabold flex items-center justify-center font-mono cursor-pointer transition-all"
              >
                ✕
              </button>
            </div>

            {/* Main Content Area */}
            <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto text-slate-705">
              
              {/* Visual Attendance Progress Tracking */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-150 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <h4 className="font-bold text-[11px] uppercase tracking-wider text-slate-500 font-mono flex items-center gap-1.5">
                    <UserCheck className="h-3.5 w-3.5 text-indigo-500" /> Attendance Compliance
                  </h4>
                  <div className="flex gap-2 items-end mt-2">
                     <span className="text-xl font-black text-indigo-900">{selectedRegUnit.attendanceCount || 0} / {selectedRegUnit.totalClasses || 0}</span>
                     <span className="text-[10px] text-slate-400 font-mono mb-1">lectures attended</span>
                  </div>
                  {/* Progress Bar with warning limits */}
                  <div className="w-full bg-slate-250 h-1.5 rounded-full mt-2 overflow-hidden">
                     <div 
                       className={`h-full rounded-full transition-all duration-500 ${(selectedRegUnit.totalClasses > 0 && (selectedRegUnit.attendanceCount/selectedRegUnit.totalClasses) < 0.75) ? 'bg-amber-500' : 'bg-emerald-500'}`}
                       style={{ width: `${selectedRegUnit.totalClasses > 0 ? Math.round((selectedRegUnit.attendanceCount/selectedRegUnit.totalClasses)*100) : 100}%` }}
                     ></div>
                  </div>
                  {selectedRegUnit.totalClasses > 0 && (selectedRegUnit.attendanceCount / selectedRegUnit.totalClasses) < 0.75 ? (
                    <div className="text-[9px] text-amber-600 font-semibold mt-1.5 flex items-center gap-1 bg-amber-50 p-2 rounded">
                       ⚠️ Critical Warning: Your attendance ({Math.round((selectedRegUnit.attendanceCount/selectedRegUnit.totalClasses)*100)}%) is currently below the regulatory 75% threshold. Please maintain regular attendance to remain eligible for examinations.
                    </div>
                  ) : (
                    <p className="text-[9px] text-emerald-600 font-mono mt-1.5 font-bold flex items-center gap-1">
                       ✓ Good Academic Status: Satisfies standard 75% attendance criteria.
                    </p>
                  )}
                </div>
                
                {/* Grading Assessment weights */}
                <div className="border-t sm:border-t-0 sm:border-l border-slate-200/80 pt-3 sm:pt-0 sm:pl-4">
                   <h4 className="font-bold text-[11px] uppercase tracking-wider text-slate-500 font-mono mb-2 flex items-center gap-1">
                      <Award className="h-3.5 w-3.5 text-indigo-500" /> Assessment Weight
                   </h4>
                   <ul className="text-[10px] space-y-1 font-mono text-slate-600">
                      <li className="flex justify-between">
                         <span>CAT Exams:</span> <span className="font-bold text-slate-855">{selectedRegUnit.assessmentScheme?.cat ?? 15}%</span>
                      </li>
                      <li className="flex justify-between">
                         <span>Assignments:</span> <span className="font-bold text-slate-855">{selectedRegUnit.assessmentScheme?.assignment ?? 15}%</span>
                      </li>
                      <li className="flex justify-between">
                         <span>Final Paper:</span> <span className="font-bold text-slate-855">{selectedRegUnit.assessmentScheme?.exam ?? 70}%</span>
                      </li>
                   </ul>
                </div>
              </div>

              {/* Grid for Topics Roadmap and Reference books */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Topics roadmap with interactive study checkboxes */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-150 space-y-2">
                  <h4 className="font-bold text-[11px] uppercase tracking-wider text-indigo-800 font-mono border-b border-indigo-100 pb-1.5 flex items-center gap-1.5">
                     <Sparkles className="h-3.5 w-3.5 text-indigo-505" /> Study Roadmap Progress
                  </h4>
                  <p className="text-[9px] text-slate-400 font-medium">Verify your progress by checklisting study topics:</p>
                  <div className="space-y-1.5">
                    {(selectedRegUnit.syllabusTopics || []).map((topic: string) => {
                      const checked = syllabusChecks[topic] || false;
                      return (
                        <div 
                          key={topic} 
                          onClick={() => handleToggleSyllabusTopic(topic)}
                          className="flex items-start gap-2 p-1.5 hover:bg-slate-150/70 rounded cursor-pointer transition-colors text-[10px]"
                        >
                           <div className="pt-0.5">
                              {checked ? (
                                 <CheckSquare className="h-3.5 w-3.5 text-indigo-600" />
                              ) : (
                                 <Square className="h-3.5 w-3.5 text-slate-400" />
                              )}
                           </div>
                           <span className={checked ? 'line-through text-slate-400 font-medium' : 'font-semibold text-slate-700'}>
                             {topic}
                           </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Reference Books & Reading list */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-150 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h4 className="font-bold text-[11px] uppercase tracking-wider text-indigo-800 font-mono border-b border-indigo-100 pb-1.5 flex items-center gap-1.5">
                       <BookOpen className="h-3.5 w-3.5 text-indigo-505" /> Recommended Reference Literature
                    </h4>
                    <ul className="space-y-1.5">
                      {(selectedRegUnit.textbooks || []).map((book: string, i: number) => (
                        <li key={i} className="text-[10px] text-slate-650 flex items-start gap-1.5">
                           <span className="text-indigo-505 font-bold font-mono">[{i+1}]</span>
                           <span className="font-semibold leading-snug">{book}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Quick Appointment / Consultation request */}
                  <div className="border-t border-slate-205 pt-3 mt-1">
                    <h4 className="font-bold text-[11px] uppercase tracking-wider text-slate-600 font-mono flex items-center gap-1.5 mb-1.5">
                      <Calendar className="h-3.5 w-3.5 text-orange-500" /> Request Office Hours Revision Slot
                    </h4>
                    
                    {appointmentSuccess ? (
                      <div className="p-2 bg-emerald-50 border border-emerald-250 rounded text-emerald-800 text-[10px] font-bold">
                         ✓ Advisory session request queued! The instructor will respond shortly.
                      </div>
                    ) : (
                      <form onSubmit={handleApptSubmit} className="space-y-2">
                         <input 
                           type="text" 
                           placeholder="Revision query? (e.g. Need help with subnets)"
                           value={appointmentTopic}
                           onChange={e => setAppointmentTopic(e.target.value)}
                           required
                           className="w-full text-[10px] p-2 rounded border border-slate-300 outline-none focus:border-indigo-500 bg-white"
                         />
                         <div className="flex gap-1.5">
                            <input 
                              type="date"
                              value={appointmentDate}
                              onChange={e => setAppointmentDate(e.target.value)}
                              required
                              className="flex-1 text-[10px] p-1.5 rounded border border-slate-300 outline-none bg-white font-semibold text-slate-750"
                            />
                            <button 
                              type="submit"
                              className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded text-[9px] font-bold uppercase transition-transform active:scale-[0.98] cursor-pointer"
                            >
                              Request
                            </button>
                         </div>
                      </form>
                    )}
                  </div>
                </div>
              </div>

              {/* Dynamic Session History Attendance List */}
              <div className="space-y-2 bg-slate-50 rounded-xl p-4 border border-slate-150">
                 <h4 className="font-bold text-[11px] uppercase tracking-wider text-slate-700 font-mono border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-slate-500" /> Completed session logs & status checklist
                 </h4>
                 
                 {(selectedRegUnit.sessionHistory || []).length === 0 ? (
                    <p className="text-[10px] text-slate-450 italic py-2 bg-slate-100 rounded text-center font-mono">
                       No completed class sessions have been logged/recorded yet.
                    </p>
                 ) : (
                    <div className="space-y-1 max-h-[140px] overflow-y-auto pr-1">
                       {(selectedRegUnit.sessionHistory || []).map((sh: any) => {
                          const dateStr = new Date(sh.sessionStart).toLocaleDateString('en-US', {
                             month: 'short',
                             day: 'numeric',
                             hour: '2-digit',
                             minute: '2-digit'
                          });
                          
                          let pillStyle = "bg-rose-50 text-rose-700 border-rose-200";
                          let statusText = "Absent";
                          if (sh.status === 'present') {
                             pillStyle = "bg-emerald-50 text-emerald-700 border-emerald-200";
                             statusText = "Present";
                          } else if (sh.status === 'late') {
                             pillStyle = "bg-amber-50 text-amber-700 border-amber-200";
                             statusText = "Late";
                          }
                          
                          return (
                             <div key={sh.id} className="p-2 border border-slate-100 bg-white rounded-lg flex justify-between items-center text-[10px] shadow-2xs">
                                <div className="flex items-center gap-2">
                                   <span className="font-semibold text-slate-700">{dateStr}</span>
                                   <span className="text-slate-400 font-mono text-[9px]">• {sh.venue}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                   {sh.markedAt && (
                                      <span className="text-[8px] font-mono text-slate-400">Marked at {new Date(sh.markedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                   )}
                                   <span className={`px-2 py-0.5 rounded font-bold border text-[8px] uppercase font-mono ${pillStyle}`}>
                                      {statusText}
                                   </span>
                                </div>
                             </div>
                          );
                       })}
                    </div>
                 )}
              </div>

              {/* Lecturer context and contact panel */}
              {selectedRegUnit.lecturer && (
                <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 flex items-center justify-between">
                   <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs uppercase border border-indigo-200 shadow-sm">
                         {selectedRegUnit.lecturer.name ? selectedRegUnit.lecturer.name.substring(0, 2) : 'L'}
                      </div>
                      <div>
                         <div className="text-[10px] font-bold text-slate-800">{selectedRegUnit.lecturer.name}</div>
                         <div className="text-[9px] text-slate-500 font-semibold">{selectedRegUnit.lecturer.role} — {selectedRegUnit.lecturer.departmentName}</div>
                      </div>
                   </div>
                   <div className="flex gap-1.5">
                      {selectedRegUnit.lecturer.userId && (
                        <button 
                          onClick={() => {
                            setChatInitialTargetUserId(selectedRegUnit.lecturer.userId);
                            setChatInitialThreadId(undefined);
                            setActiveSubTab('communications');
                            setSelectedRegUnit(null);
                            appendLog?.(`[PORTAL] Opening chat line with Lecturer ${selectedRegUnit.lecturer.name}`);
                          }}
                          className="bg-indigo-600 hover:bg-slate-900 text-white font-bold text-[9px] px-2.5 py-1.5 rounded uppercase tracking-wider transition-all cursor-pointer shadow-xs active:scale-[0.98]"
                        >
                           Start Chat
                        </button>
                      )}
                      <a 
                        href={`mailto:${selectedRegUnit.lecturer.email}`}
                        className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-[9px] px-2.5 py-1.5 rounded uppercase tracking-wider transition-all border border-slate-200"
                      >
                         Send Email
                      </a>
                   </div>
                </div>
              )}

            </div>
            
            {/* Footer */}
            <div className="bg-slate-50 p-3 border-t border-slate-200/80 flex justify-end">
              <button 
                onClick={() => setSelectedRegUnit(null)}
                className="bg-slate-800 hover:bg-slate-900 text-white text-[10px] font-extrabold uppercase py-2 px-4 rounded-xl shadow-md cursor-pointer transition-transform active:scale-[0.98]"
              >
                Close Course Outline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
