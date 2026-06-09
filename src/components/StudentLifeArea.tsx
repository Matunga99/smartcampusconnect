import React, { useState, useEffect } from 'react';
import { 
  Home, Bus, Heart, Shield, Scale, AlertTriangle, User, Calendar, Clock, 
  Plus, Check, ChevronRight, AlertCircle, PlusCircle, Bookmark, Compass, MapPin, 
  ShieldAlert, Send, Info, Star, DollarSign, RefreshCw 
} from 'lucide-react';

interface StudentLifeAreaProps {
  token: string;
  student: any;
  appendLog?: (msg: string) => void;
}

export default function StudentLifeArea({ token, student, appendLog }: StudentLifeAreaProps) {
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [features, setFeatures] = useState({
    enable_hostel_module: false,
    enable_transport_module: false,
    enable_welfare_module: true
  });

  // UI active sub-view
  const [activeLifeTab, setActiveLifeTab] = useState<'dashboard' | 'hostel' | 'transport' | 'welfare' | 'disciplinary' | 'security' | 'clearance'>('dashboard');

  // Load message signals
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // --- HOSTEL PANEL STATE ---
  const [hostels, setHostels] = useState<any[]>([]);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [beds, setBeds] = useState<any[]>([]);
  const [allocations, setAllocations] = useState<any[]>([]);
  const [hostelSelectedHostel, setHostelSelectedHostel] = useState('');
  const [hostelSelectedBlock, setHostelSelectedBlock] = useState('');
  const [hostelSelectedRoom, setHostelSelectedRoom] = useState('');
  const [hostelFines, setHostelFines] = useState<any[]>([]);
  const [hostelIncidents, setHostelIncidents] = useState<any[]>([]);
  // Hostel Incident Report form
  const [hIncTitle, setHIncTitle] = useState('');
  const [hIncDesc, setHIncDesc] = useState('');
  const [hIncSeverity, setHIncSeverity] = useState('LOW');

  // --- TRANSPORT PANEL STATE ---
  const [routes, setRoutes] = useState<any[]>([]);
  const [stops, setStops] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [selectedRoute, setSelectedRoute] = useState('');
  const [selectedStop, setSelectedStop] = useState('');

  // --- WELFARE PANEL STATE ---
  const [welfareCases, setWelfareCases] = useState<any[]>([]);
  const [counselling, setCounselling] = useState<any[]>([]);
  // Support Request form
  const [welfareTitle, setWelfareTitle] = useState('');
  const [welfareCategory, setWelfareCategory] = useState('Counselling Assistance');
  const [welfareDesc, setWelfareDesc] = useState('');
  // Schedule Session form
  const [schedCaseId, setSchedCaseId] = useState('');
  const [schedDate, setSchedDate] = useState('');
  const [schedSlot, setSchedSlot] = useState('10:00 AM - 11:00 AM');
  const [schedMode, setSchedMode] = useState('Online Video call');

  // --- DISCIPLINARY STATE ---
  const [disciplinaryCases, setDisciplinaryCases] = useState<any[]>([]);
  const [disciplinaryHearings, setDisciplinaryHearings] = useState<any[]>([]);
  const [disciplinaryDecisions, setDisciplinaryDecisions] = useState<any[]>([]);

  // --- SECURITY STATE ---
  const [securityIncidents, setSecurityIncidents] = useState<any[]>([]);
  // Security report form
  const [secTitle, setSecTitle] = useState('');
  const [secCategory, setSecCategory] = useState('Lost Property');
  const [secLocation, setSecLocation] = useState('');
  const [secDesc, setSecDesc] = useState('');

  // --- GRADUATION STATUS STATE ---
  const [clearanceStatus, setClearanceStatus] = useState<any>(null);

  const fetchConfigAndFlags = async () => {
    try {
      const h = { 'Authorization': `Bearer ${token}` };
      const r = await fetch('/api/admin/config', { headers: h });
      if (r.ok) {
        const json = await r.json();
        const fFlags = json.features || [];
        const mapped = {
          enable_hostel_module: fFlags.find((f: any) => f.key === 'enable_hostel_module')?.value ?? false,
          enable_transport_module: fFlags.find((f: any) => f.key === 'enable_transport_module')?.value ?? false,
          enable_welfare_module: fFlags.find((f: any) => f.key === 'enable_welfare_module')?.value ?? true
        };
        setFeatures(mapped);
      }
    } catch (e) {
      console.error("Failed to load SaaS active feature matrix", e);
    } finally {
      setLoadingConfig(false);
    }
  };

  const loadStudentLifeData = async () => {
    const h = { 'Authorization': `Bearer ${token}` };
    try {
      // 1. Hostel Data
      if (features.enable_hostel_module) {
        const [hRes, bRes, rRes, bedsRes, allocRes, incRes] = await Promise.all([
          fetch('/api/hostels', { headers: h }),
          fetch('/api/hostels/blocks', { headers: h }),
          fetch('/api/hostels/rooms', { headers: h }),
          fetch('/api/hostels/beds', { headers: h }),
          fetch('/api/hostels/allocations', { headers: h }),
          fetch('/api/hostels/incidents', { headers: h })
        ]);
        if (hRes.ok) setHostels(await hRes.json());
        if (bRes.ok) setBlocks(await bRes.json());
        if (rRes.ok) setRooms(await rRes.json());
        if (bedsRes.ok) setBeds(await bedsRes.json());
        if (allocRes.ok) setAllocations(await allocRes.json());
        if (incRes.ok) setHostelIncidents(await incRes.json());
      }

      // 2. Transport Data
      if (features.enable_transport_module) {
        const [rtRes, stpRes, assignRes] = await Promise.all([
          fetch('/api/transport/routes', { headers: h }),
          fetch('/api/transport/stops', { headers: h }),
          fetch('/api/transport/assignments', { headers: h })
        ]);
        if (rtRes.ok) setRoutes(await rtRes.json());
        if (stpRes.ok) setStops(await stpRes.json());
        if (assignRes.ok) setAssignments(await assignRes.json());
      }

      // 3. Welfare Data
      if (features.enable_welfare_module) {
        const [wRes, cRes] = await Promise.all([
          fetch('/api/welfare/cases', { headers: h }),
          fetch('/api/welfare/counselling', { headers: h })
        ]);
        if (wRes.ok) setWelfareCases(await wRes.json());
        if (cRes.ok) setCounselling(await cRes.json());
      }

      // 4. Disciplinary Data
      const [dispRes, hearRes] = await Promise.all([
        fetch('/api/disciplinary/cases', { headers: h }),
        fetch('/api/disciplinary/hearings', { headers: h })
      ]);
      if (dispRes.ok) setDisciplinaryCases(await dispRes.json());
      if (hearRes.ok) setDisciplinaryHearings(await hearRes.json());

      // 5. Security incident Data
      const secRes = await fetch('/api/security/incidents', { headers: h });
      if (secRes.ok) setSecurityIncidents(await secRes.json());

      // 6. Pull Clearance Data if final year or for preview
      const gradRes = await fetch('/api/graduation/clearance', { headers: h });
      if (gradRes.ok) {
        const list = await gradRes.json();
        const mine = list.find((s: any) => s.id === student?.id);
        if (mine) setClearanceStatus(mine.clearanceStatus);
      }
    } catch (e) {
      console.error("Unable to load Phase 8 datasets", e);
    }
  };

  useEffect(() => {
    fetchConfigAndFlags();
  }, [token]);

  useEffect(() => {
    if (!loadingConfig) {
      loadStudentLifeData();
    }
  }, [loadingConfig, features.enable_hostel_module, features.enable_transport_module, features.enable_welfare_module]);

  const flashSuccess = (m: string) => {
    setSuccessMsg(m);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const flashError = (m: string) => {
    setErrorMsg(m);
    setTimeout(() => setErrorMsg(null), 4000);
  };

  // --- SUMMITS ---
  const handleHostelApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hostelSelectedHostel || !hostelSelectedBlock || !hostelSelectedRoom) {
      return flashError('Please choose a Hostel, associated Block, and Room to apply!');
    }
    try {
      const r = await fetch('/api/hostels/allocations/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          hostelId: hostelSelectedHostel,
          blockId: hostelSelectedBlock,
          roomId: hostelSelectedRoom
        })
      });
      if (r.ok) {
        flashSuccess('Accomodation application submitted successfully! Directing to Dean of Student Life approval pipeline.');
        loadStudentLifeData();
        setHostelSelectedHostel('');
        setHostelSelectedBlock('');
        setHostelSelectedRoom('');
      } else {
        const err = await r.json();
        flashError(err.error || 'Accommodation request failure');
      }
    } catch (ex) {
      flashError('Could not process transaction');
    }
  };

  const handleHostelIncidentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hIncTitle || !hIncDesc) return flashError('Please fill in title and description');
    try {
      const r = await fetch('/api/hostels/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          studentId: student?.id,
          title: hIncTitle,
          description: hIncDesc,
          severity: hIncSeverity
        })
      });
      if (r.ok) {
        flashSuccess('Incident report submitted to hostel sub-warden office.');
        setHIncTitle('');
        setHIncDesc('');
        loadStudentLifeData();
      }
    } catch (ex) {
      flashError('Failed to record incident');
    }
  };

  const handleTransportApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoute || !selectedStop) {
      return flashError('Please select both a Route and a specific pickup stop!');
    }
    try {
      const r = await fetch('/api/transport/assignments/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          routeId: selectedRoute,
          stopId: selectedStop
        })
      });
      if (r.ok) {
        flashSuccess('Transport routing request successfully sent. Directing to registry approval with automatic billing.');
        loadStudentLifeData();
        setSelectedRoute('');
        setSelectedStop('');
      } else {
        const err = await r.json();
        flashError(err.error || 'Failed to apply transport routing');
      }
    } catch (ex) {
      flashError('Transport apply failure');
    }
  };

  const handleWelfareSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!welfareTitle || !welfareDesc) {
      return flashError('Please specify title and description');
    }
    try {
      const r = await fetch('/api/welfare/support-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          title: welfareTitle,
          category: welfareCategory,
          description: welfareDesc
        })
      });
      if (r.ok) {
        flashSuccess('Welfare Case created successfully! A professional university counselor has been assigned.');
        setWelfareTitle('');
        setWelfareDesc('');
        loadStudentLifeData();
      } else {
        const err = await r.json();
        flashError(err.error || 'Request failure');
      }
    } catch (ex) {
      flashError('Could not send request');
    }
  };

  const handleCounsellingScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedCaseId || !schedDate || !schedSlot) {
      return flashError('Please select a case ticket, choose a date and slot!');
    }
    try {
      const r = await fetch('/api/welfare/counselling/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          caseId: schedCaseId,
          date: schedDate,
          timeSlot: schedSlot,
          mode: schedMode
        })
      });
      if (r.ok) {
        flashSuccess('Counselling session successfully scheduled. Confirmation notification broadcasted.');
        setSchedCaseId('');
        setSchedDate('');
        loadStudentLifeData();
      } else {
        const err = await r.json();
        flashError(err.error || 'Fail scheduling slot');
      }
    } catch (ex) {
      flashError('Counselling scheduling failed');
    }
  };

  const handleSecurityIncidentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secTitle || !secDesc) return flashError('Title and description are required!');
    try {
      const r = await fetch('/api/security/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          title: secTitle,
          category: secCategory,
          location: secLocation,
          description: secDesc
        })
      });
      if (r.ok) {
        flashSuccess('Security Incident reported to Campus Security Command Office successfully.');
        setSecTitle('');
        setSecLocation('');
        setSecDesc('');
        loadStudentLifeData();
      }
    } catch (ex) {
      flashError('Security report failed');
    }
  };

  if (loadingConfig) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <RefreshCw className="h-6 w-6 animate-spin text-indigo-650 mx-auto mb-2" />
        <span className="text-xs font-medium font-mono text-slate-500">Connecting Student Life Matrix...</span>
      </div>
    );
  }

  // Filter lists based on selections
  const availableBlocks = blocks.filter((b: any) => b.hostelId === hostelSelectedHostel);
  const availableRooms = rooms.filter((r: any) => r.blockId === hostelSelectedBlock && (r.gender === 'mixed' || r.gender === student?.gender || 'male'));
  const availableStops = stops.filter((s: any) => s.routeId === selectedRoute).sort((a,b) => a.sequence - b.sequence);

  // Active allocations and approved assignment route info
  const myApprovedHostel = allocations.find((a: any) => a.status === 'approved');
  const myPendingHostel = allocations.find((a: any) => a.status === 'pending');
  const myRejectedHostel = allocations.find((a: any) => a.status === 'rejected');

  const myApprovedTransport = assignments.find((a: any) => a.status === 'approved');
  const myPendingTransport = assignments.find((a: any) => a.status === 'pending');

  return (
    <div className="space-y-6 text-[11px] animate-fade">
      {/* Dynamic Error / Success Banners */}
      {successMsg && (
        <div className="bg-emerald-50 text-emerald-800 border-l-4 border-emerald-500 p-4 rounded-md shadow-sm transition-all text-xs font-medium">
          ✅ {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="bg-rose-50 text-rose-800 border-l-4 border-rose-500 p-4 rounded-md shadow-sm transition-all text-xs font-medium">
          ❌ {errorMsg}
        </div>
      )}

      {/* SUB PANELS CONTAINER */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-wrap gap-2 mb-2">
        <button 
          onClick={() => setActiveLifeTab('dashboard')} 
          className={`px-3 py-1.5 rounded-lg font-bold font-mono tracking-tight transition-all cursor-pointer ${activeLifeTab === 'dashboard' ? 'bg-indigo-600 text-white' : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'}`}
        >
          🎛️ Student Life Overview
        </button>

        {features.enable_hostel_module && (
          <button 
            onClick={() => setActiveLifeTab('hostel')} 
            className={`px-3 py-1.5 rounded-lg font-bold font-mono tracking-tight transition-all cursor-pointer ${activeLifeTab === 'hostel' ? 'bg-indigo-605 text-white' : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'}`}
          >
            🏠 Accommodation / Hostels
          </button>
        )}

        {features.enable_transport_module && (
          <button 
            onClick={() => setActiveLifeTab('transport')} 
            className={`px-3 py-1.5 rounded-lg font-bold font-mono tracking-tight transition-all cursor-pointer ${activeLifeTab === 'transport' ? 'bg-indigo-605 text-white' : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'}`}
          >
            🚌 Shuttles & Transport
          </button>
        )}

        {features.enable_welfare_module && (
          <button 
            onClick={() => setActiveLifeTab('welfare')} 
            className={`px-3 py-1.5 rounded-lg font-bold font-mono tracking-tight transition-all cursor-pointer ${activeLifeTab === 'welfare' ? 'bg-indigo-605 text-white' : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'}`}
          >
            ❤️ Welfare & Counselling
          </button>
        )}

        <button 
          onClick={() => setActiveLifeTab('disciplinary')} 
          className={`px-3 py-1.5 rounded-lg font-bold font-mono tracking-tight transition-all cursor-pointer ${activeLifeTab === 'disciplinary' ? 'bg-indigo-605 text-white' : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'}`}
        >
          ⚖️ Disciplinary Register
        </button>

        <button 
          onClick={() => setActiveLifeTab('security')} 
          className={`px-3 py-1.5 rounded-lg font-bold font-mono tracking-tight transition-all cursor-pointer ${activeLifeTab === 'security' ? 'bg-indigo-605 text-white' : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'}`}
        >
          🛡️ Security & Incidents
        </button>

        <button 
          onClick={() => setActiveLifeTab('clearance')} 
          className={`px-3 py-1.5 rounded-lg font-bold font-mono tracking-tight transition-all cursor-pointer ${activeLifeTab === 'clearance' ? 'bg-emerald-600 text-white' : 'bg-white hover:bg-slate-100 text-emerald-600 border border-slate-200'}`}
        >
          🎓 Graduation Clearance check
        </button>
      </div>

      {/* TAB VIEW 1: STUDENT LIFE OVERVIEW BENTO GRID */}
      {activeLifeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-indigo-700 to-indigo-950 p-5 rounded-xl border border-indigo-900 text-white flex justify-between items-center relative overflow-hidden">
            <div>
              <h3 className="text-sm font-black tracking-tight uppercase">Campus Life & Student Support Center</h3>
              <p className="text-[10px] text-slate-300 mt-1">Easily book hostels, signup for routes, connect with dedicated counselors, check security and standing rules.</p>
            </div>
            <Bookmark className="h-10 w-10 text-white/10 hidden md:block" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* CARD 1: HOSTEL STATE */}
            {features.enable_hostel_module && (
              <div className="bg-white p-5 rounded-xl border border-slate-200 hover:border-indigo-300 shadow-xs space-y-3">
                <div className="flex justify-between items-center">
                  <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Home className="h-4 w-4" /></span>
                  <span className="text-[9px] font-mono text-indigo-600 uppercase font-black">Accommodation</span>
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-800">Room Status</h4>
                  {myApprovedHostel ? (
                    <p className="bg-emerald-50 text-emerald-700 border border-emerald-150 px-2 py-1 rounded mt-1.5 font-bold font-sans">
                      Assigned Room: {myApprovedHostel.roomNo} ({myApprovedHostel.bedNo || 'Bed #'})
                    </p>
                  ) : myPendingHostel ? (
                    <p className="bg-amber-50 text-amber-700 border border-amber-150 px-2 py-1 rounded mt-1.5 font-mono">
                      ⏱️ Pending Approval for Room: {myPendingHostel.roomNo}
                    </p>
                  ) : (
                    <p className="text-slate-400 mt-1 font-mono">No campus room allocated.</p>
                  )}
                </div>
                <button onClick={() => setActiveLifeTab('hostel')} className="w-full text-center py-1.5 text-xs text-indigo-650 bg-indigo-50 hover:bg-indigo-100 font-bold rounded-lg transition-colors cursor-pointer">
                  Manage Accommodation →
                </button>
              </div>
            )}

            {/* CARD 2: TRANSPORT STATUS */}
            {features.enable_transport_module && (
              <div className="bg-white p-5 rounded-xl border border-slate-200 hover:border-indigo-300 shadow-xs space-y-3">
                <div className="flex justify-between items-center">
                  <span className="p-2 bg-sky-50 text-sky-650 rounded-lg"><Bus className="h-4 w-4" /></span>
                  <span className="text-[9px] font-mono text-sky-650 uppercase font-black font-bold">Transport Route</span>
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-800">Shuttle Assignment</h4>
                  {myApprovedTransport ? (
                    <p className="bg-emerald-50 text-emerald-700 border border-emerald-150 px-2 py-1 rounded mt-1.5 font-bold">
                      Route: {myApprovedTransport.routeName} ({myApprovedTransport.stopName})
                    </p>
                  ) : myPendingTransport ? (
                    <p className="bg-amber-50 text-amber-700 border border-amber-150 px-2 py-1 rounded mt-1.5 font-mono">
                      ⏱️ Pending Approval: {myPendingTransport.routeName}
                    </p>
                  ) : (
                    <p className="text-slate-400 mt-1 font-mono">Not registered on any university route.</p>
                  )}
                </div>
                <button onClick={() => setActiveLifeTab('transport')} className="w-full text-center py-1.5 text-xs text-indigo-650 bg-indigo-50 hover:bg-indigo-100 font-bold rounded-lg transition-colors cursor-pointer">
                  Manage Transport →
                </button>
              </div>
            )}

            {/* CARD 3: WELFARE STANDING */}
            {features.enable_welfare_module && (
              <div className="bg-white p-5 rounded-xl border border-slate-200 hover:border-indigo-300 shadow-xs space-y-3">
                <div className="flex justify-between items-center">
                  <span className="p-2 bg-rose-50 text-rose-600 rounded-lg"><Heart className="h-4 w-4" /></span>
                  <span className="text-[9px] font-mono text-rose-600 uppercase font-black text-xs">Welfare & Support</span>
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-800">Welfare & Intake Tickets</h4>
                  <p className="text-slate-500 mt-1 font-mono font-bold">
                    Active Cases: {welfareCases.filter(c => c.status === 'pending').length} | Counselling Sessions: {counselling.length}
                  </p>
                </div>
                <button onClick={() => setActiveLifeTab('welfare')} className="w-full text-center py-1.5 text-xs text-indigo-650 bg-indigo-50 hover:bg-indigo-100 font-bold rounded-lg transition-colors cursor-pointer">
                  Seek Counselling / Support →
                </button>
              </div>
            )}

            {/* CARD 4: DISCIPLINARY */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 hover:border-indigo-300 shadow-xs space-y-3">
              <div className="flex justify-between items-center">
                <span className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Scale className="h-4 w-4" /></span>
                <span className="text-[9px] font-mono text-amber-600 uppercase font-black uppercase">Disciplinary Stand</span>
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-slate-800">Student Conduct</h4>
                {disciplinaryCases.length > 0 ? (
                  <p className="bg-rose-50 text-rose-700 border border-rose-150 px-2 py-1 rounded mt-1.5 font-bold">
                    ⚠️ {disciplinaryCases.length} records detected on file. Review standing closely!
                  </p>
                ) : (
                  <p className="bg-emerald-50 text-emerald-700 border border-emerald-150 px-2 py-1 rounded mt-1.5 font-bold font-mono">
                    ✅ Exemplary Conduct Standing
                  </p>
                )}
              </div>
              <button onClick={() => setActiveLifeTab('disciplinary')} className="w-full text-center py-1.5 text-xs text-indigo-650 bg-indigo-50 hover:bg-indigo-100 font-bold rounded-lg transition-colors cursor-pointer">
                View Reports & Hearings →
              </button>
            </div>

            {/* CARD 5: GRADUATION OVERVIEW */}
            <div className="bg-white p-5 rounded-xl border border-slate-105 hover:border-emerald-300 shadow-xs space-y-3 md:col-span-2">
              <div className="flex justify-between items-center">
                <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Check className="h-4 w-4" /></span>
                <span className="text-[9px] font-mono text-emerald-600 uppercase font-black tracking-widest">General Clearance Status</span>
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-slate-800">Dean of Students clearance standing:</h4>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="bg-slate-50 p-2 rounded">
                    <span className="text-[9px] text-slate-450 block font-mono">Academic Clearance</span>
                    <span className={`text-xs font-black ${clearanceStatus?.academic === 'Cleared' ? 'text-emerald-600' : 'text-slate-700'}`}>
                      {clearanceStatus?.academic || 'Cleared'}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded">
                    <span className="text-[9px] text-slate-450 block font-mono">Disciplinary Standing</span>
                    <span className={`text-xs font-black ${clearanceStatus?.disciplinary === 'Cleared' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {clearanceStatus?.disciplinary || 'Cleared'}
                    </span>
                  </div>
                  {features.enable_hostel_module && (
                    <div className="bg-slate-50 p-2 rounded">
                      <span className="text-[9px] text-slate-450 block font-mono">Hostel Clearance</span>
                      <span className={`text-xs font-black ${clearanceStatus?.hostel === 'Cleared' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {clearanceStatus?.hostel || 'Cleared'}
                      </span>
                    </div>
                  )}
                  {features.enable_transport_module && (
                    <div className="bg-slate-50 p-2 rounded">
                      <span className="text-[9px] text-slate-450 block font-mono">Transport Clearance</span>
                      <span className={`text-xs font-black ${clearanceStatus?.transport === 'Cleared' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {clearanceStatus?.transport || 'Cleared'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <button onClick={() => setActiveLifeTab('clearance')} className="w-full text-center py-1.5 text-xs text-emerald-650 bg-emerald-50 hover:bg-emerald-100 font-bold rounded-lg transition-colors cursor-pointer">
                Detailed Graduation Matrix →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB VIEW 2: HOSTEL / ACCOMMODATION MANAGEMENT */}
      {activeLifeTab === 'hostel' && features.enable_hostel_module && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Applying Form Column */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4 shadow-sm h-fit">
              <h3 className="text-xs font-bold font-mono tracking-wider text-slate-900 border-b pb-2 uppercase">Hostel Booking Intake</h3>
              <form onSubmit={handleHostelApplySubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 font-mono">Select Hostel Branch</label>
                  <select 
                    value={hostelSelectedHostel} 
                    onChange={(e) => { setHostelSelectedHostel(e.target.value); setHostelSelectedBlock(''); setHostelSelectedRoom(''); }}
                    className="w-full text-xs py-1.5 px-2.5 border border-slate-200 rounded BG bg-slate-50 font-sans cursor-pointer focus:border-indigo-600"
                  >
                    <option value="">-- Choose Hostel --</option>
                    {hostels.map(h => (
                      <option key={h.id} value={h.id}>{h.name} ({h.type})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 font-mono font-sans">Associated Block</label>
                  <select 
                    disabled={!hostelSelectedHostel}
                    value={hostelSelectedBlock} 
                    onChange={(e) => { setHostelSelectedBlock(e.target.value); setHostelSelectedRoom(''); }}
                    className="w-full text-xs py-1.5 px-2.5 border border-slate-205 rounded bg-slate-50 font-sans cursor-pointer focus:border-indigo-600 disabled:opacity-50"
                  >
                    <option value="">-- Select Block --</option>
                    {availableBlocks.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 font-mono">Select Room No (Capacity details)</label>
                  <select 
                    disabled={!hostelSelectedBlock}
                    value={hostelSelectedRoom} 
                    onChange={(e) => setHostelSelectedRoom(e.target.value)}
                    className="w-full text-xs py-1.5 px-2.5 border border-slate-205 rounded bg-slate-50 font-sans cursor-pointer focus:border-indigo-600 disabled:opacity-50"
                  >
                    <option value="">-- Select Room --</option>
                    {availableRooms.map(r => (
                      <option key={r.id} value={r.id}>{r.roomNo} ({r.available_beds} beds free, max {r.room_capacity})</option>
                    ))}
                  </select>
                </div>

                <button 
                  type="submit" 
                  className="w-full text-center py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg cursor-pointer shadow-xs transition-all font-mono"
                >
                  🚀 Submit Allotment Application
                </button>
              </form>
            </div>

            {/* Current Allocations Details Column */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-slate-900 border-b pb-2 font-mono uppercase">Your Hostel Residency Records</h3>
                
                {allocations.length === 0 ? (
                  <p className="text-slate-400 font-mono p-4 text-center">No current hostel bookings logged on registry files.</p>
                ) : (
                  <div className="space-y-3.5">
                    {allocations.map((a: any) => (
                      <div key={a.id} className="p-4 rounded-xl border border-slate-150 flex flex-col justify-between sm:flex-row gap-4 bg-slate-50">
                        <div className="space-y-1.5">
                          <span className="text-[9px] font-bold py-0.5 px-2 bg-indigo-50 border border-indigo-150 text-indigo-600 rounded-full font-mono uppercase">
                            Room Charge Term: KES 15,000 / Sem Code
                          </span>
                          <h4 className="text-xs font-extrabold text-slate-800">{a.hostelName} — {a.blockName}</h4>
                          <p className="text-slate-500 text-[10px] font-mono">
                            🛏️ Assigned Bed: <span className="text-indigo-650 font-bold">{a.bedNo || 'Pending Warden selection'}</span> | Room: {a.roomNo}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            Applied: {new Date(a.appliedAt).toLocaleDateString()} {a.approvedAt && `| Approved: ${new Date(a.approvedAt).toLocaleDateString()}`}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase border tracking-wider ${
                            a.status === 'approved' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-150'
                              : a.status === 'pending'
                              ? 'bg-amber-50 text-amber-600 border-amber-150 animate-pulse'
                              : 'bg-rose-50 text-rose-600 border-rose-150'
                          }`}>
                            {a.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Damaged Property Reports and hostel incidents reporting */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Submit hostel incident */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <h4 className="text-xs font-bold text-slate-850 font-mono border-b pb-2 uppercase">Report Room/Amenity Incident</h4>
                  <form onSubmit={handleHostelIncidentSubmit} className="space-y-3">
                    <input 
                      type="text" 
                      placeholder="Title of report / room issue" 
                      value={hIncTitle} 
                      onChange={(e) => setHIncTitle(e.target.value)}
                      className="w-full text-xs font-sans p-2 border border-slate-200 rounded focus:border-indigo-600"
                    />
                    <select 
                      value={hIncSeverity} 
                      onChange={(e) => setHIncSeverity(e.target.value)}
                      className="w-full text-xs font-mono p-2 border border-slate-200 bg-slate-50 rounded"
                    >
                      <option value="LOW">Low Severity</option>
                      <option value="MEDIUM">Medium Issue</option>
                      <option value="HIGH">High Urgency</option>
                    </select>
                    <textarea 
                      placeholder="Explain details of water blockage, lost keys, damaged socket etc." 
                      rows={3} 
                      value={hIncDesc} 
                      onChange={(e) => setHIncDesc(e.target.value)}
                      className="w-full text-xs p-2 border border-slate-200 rounded"
                    />
                    <button type="submit" className="w-full py-1.5 bg-indigo-505 text-white bg-indigo-650 hover:bg-slate-850 font-bold font-mono rounded cursor-pointer">
                      Log Room Issue Ticket
                    </button>
                  </form>
                </div>

                {/* Incidents and issues on file */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 overflow-y-auto max-h-[300px]">
                  <h4 className="text-xs font-bold text-slate-850 font-mono border-b pb-2 uppercase">Log of Hostel Tickets</h4>
                  {hostelIncidents.length === 0 ? (
                    <p className="text-slate-400 text-center font-mono py-8">No incident reports recorded at warden office.</p>
                  ) : (
                    <div className="space-y-2">
                      {hostelIncidents.map((inc: any) => (
                        <div key={inc.id} className="p-2.5 rounded bg-slate-50 border border-slate-150">
                          <div className="flex justify-between">
                            <span className="font-extrabold text-slate-800">{inc.title}</span>
                            <span className={`text-[8px] font-extrabold rounded px-1.5 ${
                              inc.severity === 'HIGH' ? 'bg-rose-50 text-rose-600' : 'bg-slate-200 text-slate-600'
                            }`}>{inc.severity}</span>
                          </div>
                          <p className="text-slate-500 text-[10px] py-1">{inc.description}</p>
                          <div className="flex justify-between items-center text-[9px] text-slate-400 font-mono pt-1">
                            <span>Status: {inc.status}</span>
                            <span>{new Date(inc.recordedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB VIEW 3: TRANSPORT & SHUTTLES */}
      {activeLifeTab === 'transport' && features.enable_transport_module && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Direct signup form */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4 shadow-sm h-fit">
              <h3 className="text-xs font-bold font-mono tracking-wider text-slate-900 border-b pb-2 uppercase">Transport Route Sign-Up</h3>
              <form onSubmit={handleTransportApplySubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 font-mono">Select Route Area</label>
                  <select 
                    value={selectedRoute} 
                    onChange={(e) => { setSelectedRoute(e.target.value); setSelectedStop(''); }}
                    className="w-full text-xs py-1.5 px-2.5 border border-slate-200 rounded bg-slate-50 font-sans cursor-pointer focus:border-indigo-600"
                  >
                    <option value="">-- Choose Route --</option>
                    {routes.map(r => (
                      <option key={r.id} value={r.id}>{r.name} (KES {r.fareAmount} / Sem)</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 font-mono">Select Specific Stop</label>
                  <select 
                    disabled={!selectedRoute}
                    value={selectedStop} 
                    onChange={(e) => setSelectedStop(e.target.value)}
                    className="w-full text-xs py-1.5 px-2.5 border border-slate-205 rounded bg-slate-50 font-sans cursor-pointer focus:border-indigo-600 disabled:opacity-50"
                  >
                    <option value="">-- Choose Stop --</option>
                    {availableStops.map(s => (
                      <option key={s.id} value={s.id}>Stop #{s.sequence}: {s.stopName}</option>
                    ))}
                  </select>
                </div>

                <button 
                  type="submit" 
                  className="w-full text-center py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg cursor-pointer shadow-xs transition-all font-mono"
                >
                  🚌 Register for Commuter Pass
                </button>
              </form>
            </div>

            {/* Assignments list */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-slate-900 border-b pb-2 font-mono uppercase">Your Registered Commuter Passes</h3>
                
                {assignments.length === 0 ? (
                  <p className="text-slate-400 font-mono p-4 text-center">No active transport routes assigned to your student identity record.</p>
                ) : (
                  <div className="space-y-3.5">
                    {assignments.map((a: any) => (
                      <div key={a.id} className="p-4 rounded-xl border border-slate-150 flex flex-col justify-between sm:flex-row gap-4 bg-slate-50">
                        <div className="space-y-1.5">
                          <span className="text-[9px] font-bold py-0.5 px-2 bg-indigo-50 border border-indigo-150 text-indigo-600 rounded-full font-mono uppercase">
                            Semester Routing Record
                          </span>
                          <h4 className="text-xs font-extrabold text-slate-800">{a.routeName}</h4>
                          <p className="text-slate-550 text-[10px] font-mono">
                            📍 Selected Stop: <span className="font-extrabold text-indigo-600">{a.stopName}</span>
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            Applied: {new Date(a.appliedAt).toLocaleDateString()} {a.approvedAt && `| Access Approved: ${new Date(a.approvedAt).toLocaleDateString()}`}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase border tracking-wider ${
                            a.status === 'approved' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-150'
                              : a.status === 'pending'
                              ? 'bg-amber-50 text-amber-600 border-amber-150 animate-pulse'
                              : 'bg-rose-50 text-rose-600 border-rose-150'
                          }`}>
                            {a.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Shuttles info panel */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-slate-900 border-b pb-2 font-mono uppercase">Coordinated Shuttles Timetable & Safety Rules</h3>
                <p className="text-slate-500 leading-relaxed">
                  The campus runs executive Isuzu buses and high-roof executive commuter vans. Registered students must present their commuter pass barcode at boarding. Buses leave Campus Square Terminal every 30 minutes on active routes. Let's practice discipline.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB VIEW 4: STUDENT WELFARE & COUNSELLING INTUITION */}
      {activeLifeTab === 'welfare' && features.enable_welfare_module && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Create Case Request Form */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4 shadow-sm h-fit">
              <h3 className="text-xs font-bold font-mono tracking-wider text-[#4338ca] border-b pb-2 uppercase">Create Welfare Case Request</h3>
              <form onSubmit={handleWelfareSubmit} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-450 uppercase font-mono">Subject / Support Area</label>
                  <input 
                    type="text" 
                    placeholder="Brief summary sentence (e.g. academic accommodation, stress)" 
                    value={welfareTitle} 
                    onChange={(e) => setWelfareTitle(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-200 rounded focus:border-indigo-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-450 uppercase font-mono">Select Category</label>
                  <select 
                    value={welfareCategory} 
                    onChange={(e) => setWelfareCategory(e.target.value)}
                    className="w-full text-xs font-mono p-2 border border-slate-200 bg-slate-55 rounded focus:border-indigo-600"
                  >
                    <option value="Counselling Assistance">Professional Counselling intake</option>
                    <option value="Harassment Reporting">Report Harassment incident</option>
                    <option value="Academic Welfare Special Accommodation">Special Exam Accomodations</option>
                    <option value="Student Support Query">Financial Welfare distress alert</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-450 uppercase font-mono">Detailed Case Description</label>
                  <textarea 
                    placeholder="Describe context deeply so our counselor staff reviews properly." 
                    rows={4} 
                    value={welfareDesc} 
                    onChange={(e) => setWelfareDesc(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-200 rounded focus:border-indigo-600"
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full py-2 bg-indigo-600 hover:bg-slate-900 text-white font-bold font-mono rounded cursor-pointer"
                >
                  ❤️ Log Official Case ticket
                </button>
              </form>
            </div>

            {/* Welfare active cases & scheduling */}
            <div className="md:col-span-2 space-y-6">
              {/* Cases List */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-slate-900 border-b pb-2 font-mono uppercase">Logged Support Case Tickets</h3>
                
                {welfareCases.length === 0 ? (
                  <p className="text-slate-400 font-mono text-center py-6">You have no active welfare or assistance requests registered.</p>
                ) : (
                  <div className="space-y-3">
                    {welfareCases.map((c: any) => (
                      <div key={c.id} className="p-4 rounded-lg bg-slate-50 border border-slate-200 divide-y divide-slate-150">
                        <div className="pb-2.5 flex justify-between items-start gap-4">
                          <div>
                            <span className="text-[9px] font-bold font-mono text-[#4338ca] block uppercase mb-1">{c.category}</span>
                            <h4 className="text-xs font-extrabold text-slate-805">{c.title}</h4>
                            <p className="text-slate-500 text-[10px] mt-1">{c.description}</p>
                          </div>
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider border ${
                            c.status === 'resolved' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-150' 
                              : 'bg-amber-50 text-amber-700 border-amber-150 animate-pulse'
                          }`}>
                            {c.status}
                          </span>
                        </div>
                        {c.notes && (
                          <div className="pt-2.5 text-[10px] text-slate-500 space-y-1">
                            <p className="font-bold text-slate-600 font-mono">Counselor Clinical Notes:</p>
                            <p className="italic bg-white p-2 rounded border">{c.notes}</p>
                            {c.result && <p className="text-emerald-650 font-bold">Outcome Result: {c.result}</p>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Counselling Sessions Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Book slot form */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 h-fit">
                  <h4 className="text-xs font-bold text-slate-850 font-mono border-b pb-2 uppercase text-indigo-650">Schedule Intake session</h4>
                  <form onSubmit={handleCounsellingScheduleSubmit} className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 font-mono">Select case ticket</label>
                      <select 
                        value={schedCaseId} 
                        onChange={(e) => setSchedCaseId(e.target.value)}
                        className="w-full text-xs p-1.5 border border-slate-200 bg-slate-50 rounded"
                      >
                        <option value="">-- Choose Ticket --</option>
                        {welfareCases.map(c => (
                          <option key={c.id} value={c.id}>{c.title} (Status: {c.status})</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 font-mono">Date</label>
                      <input 
                        type="date" 
                        value={schedDate} 
                        onChange={(e) => setSchedDate(e.target.value)}
                        className="w-full text-xs p-1.5 border border-slate-200 rounded"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 font-mono font-sans">Available Slot</label>
                      <select 
                        value={schedSlot} 
                        onChange={(e) => setSchedSlot(e.target.value)}
                        className="w-full text-xs p-1.5 border border-slate-200 bg-slate-50 rounded"
                      >
                        <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM Slot</option>
                        <option value="11:30 AM - 12:30 PM">11:30 AM - 12:30 PM Slot</option>
                        <option value="02:00 PM - 03:00 PM">02:00 PM - 03:00 PM Slot</option>
                        <option value="03:30 PM - 04:30 PM">03:30 PM - 04:30 PM Slot</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 font-mono">Mode of Intake</label>
                      <select 
                        value={schedMode} 
                        onChange={(e) => setSchedMode(e.target.value)}
                        className="w-full text-xs p-1.5 border border-slate-200 bg-slate-50 rounded"
                      >
                        <option value="Online Video call">Online Video call</option>
                        <option value="Physical Meeting Room 102">Physical Meeting - Counseling Suite 102</option>
                      </select>
                    </div>

                    <button type="submit" className="w-full py-1.5 bg-indigo-600 hover:bg-slate-900 text-white font-bold font-mono rounded cursor-pointer">
                      Confirm Appointment
                    </button>
                  </form>
                </div>

                {/* Scheduled list */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 overflow-y-auto max-h-[340px]">
                  <h4 className="text-xs font-bold text-slate-850 font-mono border-b pb-2 uppercase text-indigo-650">Counselling Calendar</h4>
                  {counselling.length === 0 ? (
                    <p className="text-slate-400 text-center font-mono py-8">No counseling intake sessions scheduled currently.</p>
                  ) : (
                    <div className="space-y-2">
                      {counselling.map((ses: any) => (
                        <div key={ses.id} className="p-3 bg-indigo-50/50 border border-indigo-100 rounded space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="font-extrabold text-slate-800 font-sans">{ses.timeSlot}</span>
                            <span className="text-[8px] bg-emerald-50 text-emerald-600 px-1.5 font-bold uppercase rounded font-mono">{ses.status}</span>
                          </div>
                          <p className="text-[10px] text-slate-550 font-mono">Staff: {ses.staffName}</p>
                          <p className="text-[10px] text-slate-500 font-mono font-bold">📍 Slot: {ses.date} | Mode: {ses.mode}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB VIEW 5: DISCIPLINARY REGISTER */}
      {activeLifeTab === 'disciplinary' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-900 border-b pb-2 font-mono uppercase text-red-700">Official Disciplinary Stand & Summon Hearings</h3>
            <p className="text-slate-500 leading-relaxed font-sans">
              SmartCampusConnect X adheres strictly to high moral student integration policies. Violations under Academic Misconduct, exams irregularities, damage to property, or harassment are addressed via board disciplinary hearing rules. Outcome penalty costs are posted directly onto student balances.
            </p>

            {disciplinaryCases.length === 0 ? (
              <div className="p-8 text-center bg-emerald-50 border border-emerald-110 rounded-xl space-y-1">
                <Check className="h-6 w-6 text-emerald-600 mx-auto mb-1" />
                <h4 className="text-xs font-extrabold text-emerald-800">Clear Moral Standing on Record</h4>
                <p className="text-[10px] text-emerald-600 font-mono font-semibold">No misconduct infractions logs reported against your admission registration profile.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {disciplinaryCases.map((c: any) => {
                  const myHearing = disciplinaryHearings.find(h => h.caseId === c.id);
                  return (
                    <div key={c.id} className="p-4 rounded-xl border border-rose-200 bg-rose-50/20 shadow-xs space-y-3.5">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <span className="py-0.5 px-2 bg-rose-50 text-rose-700 border border-rose-150 rounded text-[9px] font-bold font-mono uppercase block w-fit mb-1.5">
                            Infraction Level: {c.type}
                          </span>
                          <h4 className="text-xs font-extrabold text-rose-950 font-sans">{c.title}</h4>
                          <p className="text-slate-600 text-[10px] mt-1 pr-6 leading-relaxed">{c.description}</p>
                          <span className="text-[9px] text-slate-400 font-mono block mt-1.5">Record ID: {c.id} | Opened: {new Date(c.reportedAt).toLocaleDateString()}</span>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded uppercase font-black tracking-wider text-[8px] border shrink-0 ${
                          c.status === 'decided' 
                            ? 'bg-rose-50 text-rose-700 border-rose-200' 
                            : 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                        }`}>
                          {c.status}
                        </span>
                      </div>

                      {myHearing && (
                        <div className="p-3 rounded-lg border border-amber-250 bg-amber-50/50 space-y-1">
                          <h5 className="font-extrabold text-[#78350f] flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" /> Direct Disciplinary Board Summon Notice
                          </h5>
                          <p className="text-[#92400e] text-[10px] leading-relaxed">
                            You are summoned to appear in physical standing before the panel board on <span className="font-black text-slate-800">{myHearing.date}</span> at <span className="font-black text-slate-800">{myHearing.time}</span>.
                            <br />Venue Address: <span className="font-semibold text-slate-800">{myHearing.venue}</span>
                          </p>
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

      {/* TAB VIEW 6: SECURITY / INCIDENTS */}
      {activeLifeTab === 'security' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Report Form */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4 shadow-sm h-fit">
              <h3 className="text-xs font-bold font-mono tracking-wider text-slate-900 border-b pb-2 uppercase">Create Security Incident</h3>
              <form onSubmit={handleSecurityIncidentSubmit} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-450 uppercase font-mono">Incident Subject</label>
                  <input 
                    type="text" 
                    placeholder="Briefly name the incident" 
                    value={secTitle} 
                    onChange={(e) => setSecTitle(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-200 rounded focus:border-indigo-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-450 uppercase font-mono">Category</label>
                  <select 
                    value={secCategory} 
                    onChange={(e) => setSecCategory(e.target.value)}
                    className="w-full text-xs font-mono p-2 border border-slate-200 bg-slate-55 rounded focus:border-indigo-600"
                  >
                    <option value="Lost Property">🎒 Lost / Found Property item</option>
                    <option value="Campus Security Alarm">🚨 Urgent Campus Security Threat</option>
                    <option value="Emergency Assist">🩺 Medical or General Emergency</option>
                    <option value="Other Campus Infraction">📦 General incident report</option>
                  </select>
                </div>

                <div className="space-y-1 font-sans">
                  <label className="text-[9px] font-bold text-slate-450 uppercase font-mono">Precise Location</label>
                  <input 
                    type="text" 
                    placeholder="Campus building, Hostel Block, library stop etc." 
                    value={secLocation} 
                    onChange={(e) => setSecLocation(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-200 rounded focus:border-indigo-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-450 uppercase font-mono">Incident Details</label>
                  <textarea 
                    placeholder="Describe fully: item color, key specifics, precise facts." 
                    rows={4} 
                    value={secDesc} 
                    onChange={(e) => setSecDesc(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-200 rounded focus:border-indigo-600"
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full py-2 bg-slate-900 hover:bg-indigo-600 text-white font-bold font-mono rounded cursor-pointer"
                >
                  🛡️ Lodge Security Report
                </button>
              </form>
            </div>

            {/* List reports */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-slate-900 border-b pb-2 font-mono uppercase">Lodge Registry for Security reports</h3>
                {securityIncidents.length === 0 ? (
                  <p className="text-slate-400 font-mono text-center py-8">Logged security incidents map is completely clear.</p>
                ) : (
                  <div className="space-y-3.5">
                    {securityIncidents.map((s: any) => (
                      <div key={s.id} className="p-4 rounded-xl border bg-slate-50 border-slate-150">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <span className="text-[9px] font-mono text-indigo-650 block mb-1 font-bold">{s.category}</span>
                            <h4 className="text-xs font-extrabold text-slate-805">{s.title}</h4>
                            <p className="text-slate-550 text-[10px] mt-1">{s.description}</p>
                            <p className="text-[10px] text-indigo-600 font-mono font-bold mt-1">📍 Location: {s.location}</p>
                          </div>
                          <span className={`inline-block px-2.5 py-0.5 rounded text-[8px] font-black uppercase border shrink-0 tracking-wider ${
                            s.status === 'resolved' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-150' 
                              : 'bg-amber-50 text-amber-700 border-amber-150 animate-pulse'
                          }`}>
                            {s.status}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[9px] text-slate-450 border-t pt-2 mt-2 font-mono">
                          <span>Report ID: {s.id}</span>
                          <span>{new Date(s.reportedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB VIEW 7: CLEARANCE ENGINE */}
      {activeLifeTab === 'clearance' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-900 border-b pb-2 font-mono uppercase text-emerald-600">Official Graduation Academic & Personal Clearance</h3>
            <p className="text-slate-500 leading-relaxed font-sans">
              To be cleared for final year graduation list, you must have completely resolved outstanding ledger balances (KES 0), cleared active library overdue books and fines, resolved administrative warnings, and completed auxiliary hostel or transport clearance dues (if enabled). Disabled modules are automatically bypassed.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl space-y-2 border">
                <span className="text-[10px] uppercase font-mono font-bold text-slate-450 block">Overall clearance standing:</span>
                <span className={`text-base font-black uppercase tracking-tight block ${
                  clearanceStatus?.overall === 'Eligible' ? 'text-emerald-600 animate-pulse' : 'text-rose-600'
                }`}>
                  {clearanceStatus?.overall === 'Eligible' ? '🎓 Eligible for Graduation!' : '⛔ Blocked - Missing Clearance'}
                </span>
                <p className="text-[10px] text-slate-450">Please review each checklist item to resolve blocks.</p>
              </div>

              <div className="bg-white p-4 rounded-xl border space-y-1.5 shadow-xs font-mono">
                <h4 className="text-xs font-extrabold text-slate-800 border-b pb-1 font-mono uppercase">Detailed Matrix Results</h4>
                <div className="space-y-1">
                  <div className="flex justify-between py-1 border-b border-dashed">
                    <span className="text-[10px] text-slate-500 font-medium">1. Finance Clearance</span>
                    <span className={`font-bold ${clearanceStatus?.finance === 'Cleared' ? 'text-emerald-600' : 'text-rose-500'}`}>{clearanceStatus?.finance || 'Pending'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-dashed">
                    <span className="text-[10px] text-slate-500 font-medium">2. Academic Compliance</span>
                    <span className={`font-bold ${clearanceStatus?.academic === 'Cleared' ? 'text-emerald-600' : 'text-rose-500'}`}>{clearanceStatus?.academic || 'Cleared'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-dashed">
                    <span className="text-[10px] text-slate-500 font-medium">3. Library Overdues/Fines</span>
                    <span className={`font-bold ${clearanceStatus?.library === 'Cleared' ? 'text-emerald-600' : 'text-rose-500'}`}>{clearanceStatus?.library || 'Cleared'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-dashed">
                    <span className="text-[10px] text-slate-500 font-medium">4. Disciplinary Clearance</span>
                    <span className={`font-bold ${clearanceStatus?.disciplinary === 'Cleared' ? 'text-emerald-600' : 'text-rose-500'}`}>{clearanceStatus?.disciplinary || 'Cleared'}</span>
                  </div>
                  {features.enable_hostel_module && (
                    <div className="flex justify-between py-1 border-b border-dashed">
                      <span className="text-[10px] text-slate-505 font-bold">5. Hostel Clearance (Active Module)</span>
                      <span className={`font-black ${clearanceStatus?.hostel === 'Cleared' ? 'text-emerald-600' : 'text-rose-500'}`}>{clearanceStatus?.hostel || 'Cleared'}</span>
                    </div>
                  )}
                  {features.enable_transport_module && (
                    <div className="flex justify-between py-1">
                      <span className="text-[10px] text-slate-505 font-bold">6. Transport Clearance (Active Module)</span>
                      <span className={`font-black ${clearanceStatus?.transport === 'Cleared' ? 'text-emerald-600' : 'text-rose-500'}`}>{clearanceStatus?.transport || 'Cleared'}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
