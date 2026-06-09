import React, { useState, useEffect, useRef } from 'react';
import { 
  Globe, Users, BookOpen, Calendar, MapPin, Search, ChevronRight, X, Phone, Mail, 
  CheckCircle, ArrowRight, FileText, Upload, CreditCard, ShieldCheck, BadgeCheck, AlertCircle, Building2, Landmark,
  RefreshCw, Home, Compass, GraduationCap, Megaphone, ArrowLeft, Activity, Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SchoolPublicWebsiteProps {
  schoolCode: string;
  onBack: () => void;
}

export default function SchoolPublicWebsite({ schoolCode, onBack }: SchoolPublicWebsiteProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'programs' | 'admissions' | 'news'>('home');

  // Application process state
  const [applyStep, setApplyStep] = useState(1);
  const [appBioName, setAppBioName] = useState('');
  const [appBioEmail, setAppBioEmail] = useState('');
  const [appBioPhone, setAppBioPhone] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('');
  const [mockFiles, setMockFiles] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [paying, setPaying] = useState(false);
  const [generatedRefCode, setGeneratedRefCode] = useState('');

  // Real-time synchronization state
  const [showSyncIndicator, setShowSyncIndicator] = useState(false);
  const lastSystemVersionRef = useRef<any>(null);

  // Fetch Public School Data
  const fetchSchoolData = async (silent = false) => {
    if (!silent) {
      setLoading(true);
    }
    setError(null);
    try {
      const res = await fetch(`/api/public/schools/${schoolCode}`);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to resolve school public records');
      }
      const responseData = await res.json();
      
      if (lastSystemVersionRef.current && responseData.systemVersion) {
        const oldVer = lastSystemVersionRef.current.globalThemeVersion;
        const newVer = responseData.systemVersion.globalThemeVersion;
        if (newVer > oldVer) {
          setShowSyncIndicator(true);
          setTimeout(() => setShowSyncIndicator(false), 4000);
        }
      }
      
      if (responseData.systemVersion) {
        lastSystemVersionRef.current = responseData.systemVersion;
      }

      setData(responseData);
      const programs = responseData.live?.programs || [];
      if (programs.length > 0 && !selectedProgram) {
        setSelectedProgram(programs[0].name);
      }
    } catch (e: any) {
      console.error(e);
      if (!silent) {
        setError(e.message || 'Network error resolving school web engine');
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchSchoolData(false);

    // Dynamic Interval Hook for Tasks 5 & 6
    const interval = setInterval(() => {
      fetchSchoolData(true);
    }, 5000);

    return () => clearInterval(interval);
  }, [schoolCode]);

  const handleMockFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const name = e.target.files[0].name;
      setUploading(true);
      setTimeout(() => {
        setMockFiles(prev => [...prev, name]);
        setUploading(false);
      }, 700);
    }
  };

  const handleSimulatePayment = () => {
    setPaying(true);
    setTimeout(() => {
      setPaying(false);
      const ref = `APP-${schoolCode}-${Math.floor(1000 + Math.random() * 9000)}`;
      setGeneratedRefCode(ref);
      setApplyStep(4); // Success step
    }, 1200);
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-between p-6 sm:p-12 font-sans overflow-hidden">
        {/* Header Skeleton */}
        <div className="max-w-6xl w-full mx-auto flex items-center justify-between border-b border-white/10 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-800 rounded-xl animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-4 w-32 bg-slate-800 rounded animate-pulse"></div>
              <div className="h-2.5 w-48 bg-slate-800 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="h-8 w-16 bg-slate-800 rounded-lg animate-pulse"></div>
            <div className="h-8 w-16 bg-slate-800 rounded-lg animate-pulse"></div>
          </div>
        </div>

        {/* Hero Skeleton */}
        <div className="max-w-2xl w-full mx-auto my-auto space-y-6 py-12 text-center">
          <div className="h-3 w-28 bg-slate-800 rounded mx-auto animate-pulse"></div>
          <div className="h-10 w-96 bg-slate-800 rounded mx-auto animate-pulse"></div>
          <div className="h-10 w-80 bg-slate-800 rounded mx-auto animate-pulse"></div>
          <div className="h-4 w-11/12 bg-slate-800 rounded mx-auto animate-pulse"></div>
          <div className="flex justify-center gap-3 pt-4">
            <div className="h-10 w-28 bg-slate-800 rounded-xl animate-pulse"></div>
            <div className="h-10 w-28 bg-slate-800 rounded-xl animate-pulse"></div>
          </div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="max-w-4xl w-full mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-slate-950/40 p-6 rounded-2xl border border-slate-800 space-y-3 text-center">
              <div className="h-6 w-6 bg-slate-800 rounded mx-auto animate-pulse"></div>
              <div className="h-5 w-12 bg-slate-800 rounded mx-auto animate-pulse"></div>
              <div className="h-2.5 w-20 bg-slate-800 rounded mx-auto animate-pulse"></div>
            </div>
          ))}
        </div>

        {/* Footer Skeleton */}
        <div className="max-w-6xl w-full mx-auto border-t border-white/5 pt-6 text-center">
          <div className="h-3 w-48 bg-slate-800 rounded mx-auto animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center p-6 font-sans">
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full mb-4">
          <AlertCircle className="h-8 w-8 text-rose-500" />
        </div>
        <h3 className="text-white font-serif font-extrabold text-xl">Tenant Landing Resolved with Errors</h3>
        <p className="text-slate-400 text-xs mt-2 max-w-md font-mono">{error || 'Unable to load school configuration records.'}</p>
        <button 
          onClick={onBack}
          className="mt-6 px-5 py-2.5 bg-slate-900 border border-slate-800 text-slate-300 rounded-xl text-xs font-bold uppercase hover:bg-slate-800 transition flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Campus Directory
        </button>
      </div>
    );
  }

  const school = data?.school || {};
  const website = data?.website || {};
  const live = data?.live || { programs: [], staff: [], studentsCount: 0, announcements: [], events: [] };
  const computed = data?.computed || { rankingScore: 0, activityLevel: 0, academicStrengthIndex: 0, studentsCount: 0, staffCount: 0, programsCount: 0 };

  const courses = live.programs || [];
  const announcements = live.announcements || [];
  const staffCount = live.staff?.length || computed.staffCount || 0;
  const accentColor = website?.appearance?.accentColor || '#4f46e5';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-indigo-500 selection:text-white" style={{ '--school-accent': accentColor } as any}>
      {/* Dynamic Top Bar Notification */}
      <div className="bg-slate-900 text-white py-2 px-4 shadow-sm z-50 text-center select-none text-[11px] font-mono border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-1.5 mx-auto">
          <BadgeCheck className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
          <span>MULTI-TENANT SAAS ISOLATION ROUTE &nbsp;|&nbsp; CONNECTED TO HOSTER DEPLOYMENT DIRECTIVES ({schoolCode})</span>
        </div>
        <button 
          onClick={onBack}
          className="text-slate-400 hover:text-white flex items-center gap-1 hover:underline transition shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>
      </div>

      {/* Main Header navigation */}
      <header className="bg-white border-b border-slate-100 shadow-sm z-40 sticky top-0 shrink-0">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-slate-900 rounded-xl flex flex-col items-center justify-center p-1 text-white font-black leading-none shadow-md" style={{ backgroundColor: accentColor }}>
              <span className="text-[13px]">{schoolCode.substring(0, 2)}</span>
              <span className="text-[8px] tracking-widest">{schoolCode.substring(2, 4) || 'S'}</span>
            </div>
            <div>
              <h1 className="font-serif text-lg font-black text-slate-900 tracking-tight">{school.name}</h1>
              <p className="text-[9.5px] text-slate-400 font-mono tracking-widest uppercase mb-0.5">ACCREDITED SMART CAMPUS MEMBER</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {[
              { id: 'home', label: 'Home', icon: Home },
              { id: 'programs', label: 'Programs', icon: Compass },
              { id: 'admissions', label: 'Admissions', icon: GraduationCap },
              { id: 'news', label: 'News & Announcements', icon: Megaphone }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold uppercase transition-all rounded-lg select-none cursor-pointer ${
                  activeTab === tab.id 
                    ? 'bg-slate-50 shadow-inner' 
                    : 'text-slate-550 hover:bg-slate-50'
                }`}
                style={activeTab === tab.id ? { color: accentColor, borderLeft: `3px solid ${accentColor}` } : {}}
              >
                <tab.icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Website Body Scroll */}
      <main className="flex-1 pb-16">
        
        {/* HOME TAB */}
        {activeTab === 'home' && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5 }}
            className="animate-fade-in"
          >
            {/* Custom school banner */}
            <div className="relative bg-slate-900 text-white py-16 sm:py-20 px-4 text-center overflow-hidden border-b border-slate-950">
              <div className="absolute inset-0 opacity-[0.2]" style={{ background: `radial-gradient(circle at center, ${accentColor} 0%, transparent 70%)` }}></div>
              <div className="relative z-10 max-w-2xl mx-auto space-y-4">
                <span className="font-mono text-[9px] uppercase tracking-widest px-3 py-1 bg-white/10 rounded-full inline-block backdrop-blur-md mb-2">
                  Welcome to our digital campus
                </span>
                <h2 className="text-3xl sm:text-4xl font-serif font-extrabold tracking-tight leading-tight">
                  {website?.appearance?.heroTitle || `Shape Your Future at ${school.name}`}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
                  {website?.appearance?.heroSubtitle || 'Empowering next-generation leaders with globally recognized higher education, high-performance resources and rich technologies.'}
                </p>
                <div className="flex justify-center gap-3 pt-4">
                  <button 
                    onClick={() => setActiveTab('programs')} 
                    className="px-5 py-2.5 text-[10px] font-bold uppercase tracking-wider rounded-xl text-white shadow-lg shadow-indigo-500/10 hover:brightness-110 active:scale-95 transition cursor-pointer"
                    style={{ backgroundColor: accentColor }}
                  >
                    Browse Catalog
                  </button>
                  <button 
                    onClick={() => setActiveTab('admissions')} 
                    className="px-5 py-2.5 text-[10px] font-bold uppercase tracking-wider rounded-xl bg-white text-slate-900 hover:bg-slate-100 shadow-xl border border-slate-200 transition cursor-pointer"
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            </div>

            {/* Live Institutional Ticker (Tasks 3, 4 & 7) */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white py-3 border-y border-slate-800 overflow-hidden relative select-none">
              <div className="max-w-6xl mx-auto px-4 flex items-center justify-between gap-4 font-mono text-[11px]">
                <div className="flex items-center gap-2 shrink-0 bg-indigo-500/15 border border-indigo-500/30 px-2.5 py-1 rounded text-indigo-400 font-bold uppercase animate-pulse">
                  <Activity className="h-3 w-3" />
                  <span>Real-time Sync</span>
                </div>
                
                <div className="flex-1 overflow-hidden relative whitespace-nowrap h-5 flex items-center">
                  <div className="inline-block animate-marquee whitespace-nowrap space-x-12 pl-4">
                    <span className="inline-flex items-center gap-1.5 text-slate-300">
                      <Users className="h-3.5 w-3.5 text-indigo-400" />
                      Roster: <strong className="text-white">{computed.studentsCount || 0}</strong> Active Students
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-slate-300 font-bold">
                      <Award className="h-3.5 w-3.5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
                      Academic Strength Index: <strong className="text-indigo-300">{computed.academicStrengthIndex || '0.00'}</strong>
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-slate-300">
                      <BookOpen className="h-3.5 w-3.5 text-emerald-400" />
                      Programs Catalogued: <strong className="text-white">{courses?.length || 0}</strong> Verified Offerings
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-slate-300">
                      <Globe className="h-3.5 w-3.5 text-cyan-400" />
                      Super-Sync Version: <strong className="text-white">v{data.systemVersion?.globalThemeVersion || 1}</strong>
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-slate-300">
                      <Megaphone className="h-3.5 w-3.5 text-rose-400" />
                      Announcements: <strong className="text-white">{announcements?.length || 0}</strong> Live Public Postings
                    </span>
                    {/* Repeat for seamless loop */}
                    <span className="inline-flex items-center gap-1.5 text-slate-300">
                      <Users className="h-3.5 w-3.5 text-indigo-400" />
                      Roster: <strong className="text-white">{computed.studentsCount || 0}</strong> Active Students
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-slate-300 font-bold">
                      <Award className="h-3.5 w-3.5 text-amber-400" />
                      Academic Strength Index: <strong className="text-indigo-300">{computed.academicStrengthIndex || '0.00'}</strong>
                    </span>
                  </div>
                </div>

                <div className="hidden md:flex items-center gap-1.5 text-[10px] text-indigo-300 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  <span>Sync Interval: 5s</span>
                </div>
              </div>
            </div>

            {/* School Quick statistics strip (Task 3 & 7) */}
            <div className="max-w-4xl mx-auto px-4 mt-8">
              <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm grid grid-cols-2 lg:grid-cols-4 gap-6 text-center select-none">
                <div className="space-y-1.5 p-4 rounded-2xl hover:bg-slate-50/50 transition-colors">
                  <BookOpen className="h-7 w-7 mx-auto" style={{ color: accentColor }} />
                  <span className="font-serif font-black text-slate-900 text-2xl block">{courses?.length || 0}</span>
                  <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest font-bold">Programs Mapped</span>
                </div>
                <div className="space-y-1.5 p-4 rounded-2xl hover:bg-slate-50/50 transition-colors border-l border-slate-100">
                  <Users className="h-7 w-7 mx-auto" style={{ color: accentColor }} />
                  <span className="font-serif font-black text-slate-900 text-2xl block">{staffCount || 0}</span>
                  <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest font-bold">Academic Staff</span>
                </div>
                <div className="space-y-1.5 p-4 rounded-2xl hover:bg-slate-50/50 transition-colors border-l border-slate-100">
                  <Award className="h-7 w-7 mx-auto text-amber-500" />
                  <span className="font-serif font-black text-slate-900 text-2xl block">{computed.rankingScore || '8.2'}</span>
                  <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest font-bold">SaaS Roster Rank</span>
                </div>
                <div className="space-y-1.5 p-4 rounded-2xl hover:bg-slate-50/50 transition-colors border-l border-slate-100">
                  <Activity className="h-7 w-7 mx-auto text-emerald-500" />
                  <span className="font-serif font-black text-emerald-600 text-2xl block">{(computed.academicStrengthIndex || 0).toFixed(1)}</span>
                  <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest font-bold">Strength Index</span>
                </div>
              </div>
            </div>

            {/* Main Welcome statement */}
            <div className="max-w-4xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-7 space-y-4">
                <h3 className="text-xl font-bold text-slate-800 font-serif">Academic Integrity & Governance Excellence</h3>
                <p className="text-xs text-slate-550 leading-relaxed">
                  {school.name} represents a leading institution built on transparency, technical proficiency, and high-performance instruction. Through our integrated digital multi-tenant system, we securely coordinate student roster matrices, course schedules, ledger balances and official announcements real-time.
                </p>
                <div className="pt-2 flex flex-col gap-2.5 text-[11px] font-mono text-slate-500">
                  <div className="flex items-center gap-2"><Mail className="w-4 h-4 shrink-0 text-slate-400" /> <span>{school.email}</span></div>
                  <div className="flex items-center gap-2"><Phone className="w-4 h-4 shrink-0 text-slate-400" /> <span>{school.phone}</span></div>
                </div>
              </div>
              <div className="md:col-span-5 bg-white p-6 rounded-3xl border border-slate-100/60 shadow-sm text-center">
                <Globe className="h-10 w-10 mx-auto mb-3 animate-spin text-indigo-400" style={{ animationDuration: '40s' }} />
                <h4 className="font-black text-slate-800 text-xs uppercase tracking-wider mb-1">Instant Website Provisioning</h4>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Powered dynamically by SmartCampus SUOS Engine, sync files, courses and admissions directly from tenant directories seamlessly.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* COURES / PROGRAMS CATALOG TAB */}
        {activeTab === 'programs' && (
          <div className="max-w-4xl mx-auto px-4 py-10 space-y-6 animate-fade-in">
            <div className="border-b pb-4 border-slate-200">
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-slate-800">Dynamic Academic Program Catalog</h3>
              <p className="text-xs text-slate-400 font-mono mt-1">REAL-TIME ACADEMIC ROSTER OF ACTIVE OFFERINGS</p>
            </div>

            {courses && courses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courses.map((course: any) => (
                  <div key={course.id} className="bg-white p-5 border border-slate-150 rounded-2xl shadow-sm hover:border-slate-350 transition relative flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 bg-slate-100 rounded text-slate-500 font-bold">
                          {course.code || 'DEG'}
                        </span>
                        <span className="text-[10.5px] font-bold" style={{ color: accentColor }}>
                          {course.capacity ? `${course.capacity} Capacity` : 'Standard Entry'}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">{course.name}</h4>
                    </div>
                    <div className="border-t border-slate-50 mt-4 pt-3 flex justify-between items-center text-[10.5px] text-slate-500 font-mono">
                      <span>4-Year Program</span>
                      <button 
                        onClick={() => {
                          setSelectedProgram(course.name);
                          setActiveTab('admissions');
                          setApplyStep(1);
                        }}
                        className="font-bold hover:underline cursor-pointer flex items-center gap-1"
                        style={{ color: accentColor }}
                      >
                        Apply <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center bg-white border p-12 rounded-3xl">
                <Compass className="w-10 h-10 text-slate-300 mx-auto mb-2.5 animate-bounce" />
                <h4 className="font-serif text-slate-700 text-sm font-bold">Catalog Not Configured</h4>
                <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                  Registrar office is currently finalizing program mappings and TVETA standards checklists for this school. Check back shortly.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ONLINE ADMISSIONS APPLICATION TAB */}
        {activeTab === 'admissions' && (
          <div className="max-w-4xl mx-auto px-4 py-10 animate-fade-in grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-8 bg-white p-6 border border-slate-200 rounded-3xl shadow-sm flex flex-col justify-start">
              <h3 className="text-sm font-black text-slate-900 border-b pb-2 mb-4 uppercase tracking-wide">
                Secure Admissions Mappings Portal
              </h3>

              {applyStep === 1 && (
                <div className="space-y-4">
                  <div className="flex gap-2 mb-1">
                    <div className="h-5 w-5 rounded-full text-white font-mono flex items-center justify-center text-[9px] font-bold" style={{ backgroundColor: accentColor }}>1</div>
                    <h4 className="font-bold text-xs text-slate-800">Biographical Registration Details</h4>
                  </div>
                  
                  <div className="space-y-3.5 text-[10.5px]">
                    <div>
                      <label className="block text-slate-500 mb-1 font-mono uppercase tracking-wider text-[9px]">Legal Full Name</label>
                      <input 
                        type="text" 
                        placeholder="John Doe"
                        value={appBioName}
                        onChange={e => setAppBioName(e.target.value)}
                        className="w-full bg-white border border-slate-200 px-3 py-2 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/15"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-500 mb-1 font-mono uppercase tracking-wider text-[9px]">Primary Email</label>
                        <input 
                          type="email" 
                          placeholder="john@me.com"
                          value={appBioEmail}
                          onChange={e => setAppBioEmail(e.target.value)}
                          className="w-full bg-white border border-slate-200 px-3 py-2 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/15"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 mb-1 font-mono uppercase tracking-wider text-[9px]">Phone Number</label>
                        <input 
                          type="text" 
                          placeholder="+2547XXXXXXXX"
                          value={appBioPhone}
                          onChange={e => setAppBioPhone(e.target.value)}
                          className="w-full bg-white border border-slate-200 px-3 py-2 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/15"
                        />
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => setApplyStep(2)}
                    disabled={!appBioName || !appBioEmail}
                    className="w-full mt-4 text-white py-2.5 rounded-xl text-xs font-bold hover:brightness-110 active:scale-[0.98] transition flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    style={{ backgroundColor: accentColor }}
                  >
                    Continue to Roster Mappings <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              {applyStep === 2 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex gap-2 mb-1">
                    <div className="h-5 w-5 rounded-full text-white font-mono flex items-center justify-center text-[9px] font-bold" style={{ backgroundColor: accentColor }}>2</div>
                    <h4 className="font-bold text-xs text-slate-800 font-serif">Select Target Program Offering</h4>
                  </div>

                  {courses && courses.length > 0 ? (
                    <div className="space-y-2 text-xs">
                      {courses.map((course: any) => (
                        <label key={course.id} className={`flex items-center justify-between p-3.5 border rounded-2xl cursor-pointer transition ${selectedProgram === course.name ? 'border-2 bg-indigo-50/10 font-bold' : 'border-slate-150'}`} style={selectedProgram === course.name ? { borderColor: accentColor } : {}}>
                          <div className="flex items-center gap-2">
                            <input 
                              type="radio" 
                              checked={selectedProgram === course.name} 
                              onChange={() => setSelectedProgram(course.name)} 
                              style={{ accentColor: accentColor }}
                            />
                            <span>{course.name}</span>
                          </div>
                          <span className="text-[9.5px] text-slate-400 font-mono tracking-wide">{course.code || 'DEG'}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 text-xs italic">No programs currently configured for direct admissions yet.</p>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setApplyStep(1)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer">Back</button>
                    <button onClick={() => setApplyStep(3)} className="bg-indigo-600 border border-transparent text-white flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer" style={{ backgroundColor: accentColor }}>Attach Transcripts <ArrowRight className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              )}

              {applyStep === 3 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex gap-2 mb-1">
                    <div className="h-5 w-5 rounded-full text-white font-mono flex items-center justify-center text-[9px] font-bold" style={{ backgroundColor: accentColor }}>3</div>
                    <h4 className="font-bold text-xs text-slate-800">Support Documents and Receipt Mappings</h4>
                  </div>

                  <p className="text-[10.5px] text-slate-400 leading-relaxed">
                    Attach copies of national ID/Passport and high school academic qualification letters to initiate screening processing.
                  </p>

                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center cursor-pointer hover:border-slate-350 transition relative">
                    <input 
                      type="file" 
                      onChange={handleMockFileUpload} 
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2 animate-bounce" />
                    <span className="text-xs font-bold text-slate-700 block">Click or Drop High School Certificates Here</span>
                    <span className="text-[8px] text-slate-400 font-mono block mt-1">STANDARD PDF OR JPEG FORMAT (MOCK FILE SIMULATOR)</span>
                  </div>

                  {uploading && <div className="text-[9px] text-slate-500 font-mono text-center animate-pulse">Syncing sandbox uploads folder...</div>}

                  {mockFiles.length > 0 && (
                    <div className="space-y-1 bg-slate-50 p-3 rounded-2xl border">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block mb-1 font-mono">Mapped Attachments List</span>
                      {mockFiles.map((f, i) => (
                        <div key={i} className="flex justify-between items-center text-[10px] font-mono py-1">
                          <span className="text-slate-700">{f}</span>
                          <span className="text-emerald-600 font-bold">Uploaded</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setApplyStep(2)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer">Back</button>
                    <button 
                      onClick={handleSimulatePayment}
                      disabled={paying}
                      className="bg-emerald-600 text-white flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer hover:bg-emerald-700 disabled:opacity-50"
                    >
                      <CreditCard className="w-4 h-4" /> 
                      {paying ? 'DEMO CHECKOUT PAYING...' : 'FINALIZE DEMO FORM TRANSACTION'}
                    </button>
                  </div>
                </div>
              )}

              {applyStep === 4 && (
                <div className="space-y-4 text-center py-6 animate-fade-in max-w-sm mx-auto">
                  <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto animate-bounce" />
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">Admissions Portfolio Active!</h4>
                    <p className="text-slate-500 text-[10.5px] mt-1 leading-relaxed">
                      We have compiled your submission under the registrar database directory. Use the credentials tracking code to retrieve updates shortly.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 border rounded-2xl space-y-1 font-mono">
                    <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest block">FORM MATRIX REFERENCE KEY</span>
                    <span className="text-sm font-black block" style={{ color: accentColor }}>{generatedRefCode}</span>
                    <span className="text-[8px] text-amber-600 italic block mt-1.5">MOCK SAAS PORTFOLIO REFERENCE SUITE DEMO</span>
                  </div>

                  <button 
                    onClick={() => {
                      setApplyStep(1);
                      setAppBioName('');
                      setAppBioEmail('');
                      setAppBioPhone('');
                      setMockFiles([]);
                    }}
                    className="mt-2 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition cursor-pointer"
                  >
                    Submit Another Form
                  </button>
                </div>
              )}
            </div>

            <div className="md:col-span-4 bg-white p-5 border border-slate-200 rounded-3xl shadow-sm text-center">
              <Compass className="w-8 h-8 mx-auto mb-2 text-slate-400" />
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2">Admissions Screening Queue</h4>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                Applying to {schoolCode} immediately creates a target admissions folder tracked real-time across the parent registers platform.
              </p>
              <div className="border-t border-slate-100 my-4 pt-3 text-[10px] text-left text-slate-550 space-y-1 leading-normal font-mono text-slate-400">
                <span className="block font-bold">ROUTING MATRIX:</span>
                <span>Tenant: {school.id}</span>
                <span className="block">Catalog Scope: {courses?.length || 'Undefined'}</span>
              </div>
            </div>
          </div>
        )}

        {/* NEWS & COMMUNIQUE EVENTS TAB */}
        {activeTab === 'news' && (
          <div className="max-w-4xl mx-auto px-4 py-10 space-y-6 animate-fade-in">
            <div className="border-b pb-4 border-slate-200">
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-slate-800">Campus Communique & Notices</h3>
              <p className="text-xs text-slate-400 font-mono mt-1">OFFICIAL BOARD POSTINGS DIRECT FROM CAMPUS LECTURERS</p>
            </div>

            {announcements && announcements.length > 0 ? (
              <div className="space-y-4">
                {announcements.map((ann: any) => (
                  <div key={ann.id} className="bg-white p-6 border border-slate-150 rounded-2xl shadow-sm hover:border-slate-350 transition relative flex flex-col sm:flex-row gap-4">
                    <div className="h-12 w-12 rounded-xl bg-slate-100 flex flex-col items-center justify-center text-slate-600 shrink-0 capitalize text-xs font-bold">
                      <Megaphone className="w-5 h-5" style={{ color: accentColor }} />
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[9px] text-slate-405 font-medium">
                          {ann.createdAt ? new Date(ann.createdAt).toLocaleDateString() : 'Active Notice'}
                        </span>
                        <span className="text-[8.5px] px-2 py-0.2 bg-slate-100 font-mono uppercase rounded font-bold text-slate-500">
                          {ann.audience || 'All Audience'}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">{ann.title}</h4>
                      <p className="text-xs text-slate-500 leading-normal max-w-xl">{ann.content || ann.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center bg-white border p-12 rounded-3xl">
                <Megaphone className="w-10 h-10 text-slate-300 mx-auto mb-2.5 animate-pulse" />
                <h4 className="font-serif text-slate-705 text-sm font-bold">No Announcements Published</h4>
                <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                  Campus administrators or department registrars haven't posted any public notifications on the multi-tenant boards for '{school.name}' yet.
                </p>
              </div>
            )}
          </div>
        )}

      </main>

      {/* Footer footer */}
      <footer className="bg-slate-900 text-white py-10 border-t border-slate-950 mt-auto shrink-0 text-center">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6 text-[11px] font-sans text-slate-400">
          <div className="text-left space-y-2">
            <h5 className="font-serif font-black text-white text-xs uppercase tracking-widest">{school.name}</h5>
            <p className="leading-relaxed">Accredited higher learning department integrated into the SmartCampus Connect Multi-Tenant Network.</p>
          </div>
          <div className="text-left space-y-2 md:border-l md:border-white/5 md:pl-6">
            <h5 className="font-mono font-bold text-white text-[10px] uppercase tracking-wider">Campus Coordinates</h5>
            <div className="space-y-1 font-mono">
              <p>Email: {school.email}</p>
              <p>Phone: {school.phone}</p>
              <p>School ID: {school.id}</p>
            </div>
          </div>
          <div className="text-left space-y-2 md:border-l md:border-white/5 md:pl-6">
            <h5 className="font-mono font-bold text-indigo-400 text-[10px] uppercase tracking-wider">Multi-Tenant Platform</h5>
            <p className="leading-normal">SmartCampus Connect provides fully isolated data vaults, unified profiles, instant portal interfaces and automated DNS school portfolios.</p>
          </div>
        </div>
        <div className="border-t border-white/5 mt-8 pt-4 text-[10px] text-slate-500 font-mono">
          &copy; {new Date().getFullYear()} SCX / SUOS Framework. All Rights Reserved. Instant Web Engine Build Partitions.
        </div>
      </footer>

      {/* Real-time sync feedback notification (Task 5 & 7) */}
      <AnimatePresence>
        {showSyncIndicator && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-6 right-6 bg-slate-900 border border-slate-800 text-white px-4 py-3 rounded-2xl shadow-2xl z-50 flex items-center gap-3 text-xs font-mono select-none"
          >
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <div className="flex flex-col">
              <span className="font-bold text-slate-100">Live Synchronized</span>
              <span className="text-[9.5px] text-slate-400">Database Engine version v{data?.systemVersion?.globalThemeVersion || 1}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
