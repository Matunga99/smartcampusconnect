import React, { useState, useEffect } from 'react';
import { 
  Building, Bus, Heart, Scale, Shield, Users, Calendar, Clock, Lock, 
  MapPin, PlusCircle, Check, X, AlertTriangle, UserPlus, DollarSign, RefreshCw, Send 
} from 'lucide-react';

interface AdminCampusLifeTabProps {
  token: string;
  appendLog?: (msg: string) => void;
}

export default function AdminCampusLifeTab({ token, appendLog }: AdminCampusLifeTabProps) {
  const [activeSubView, setActiveSubView] = useState<'settings' | 'hostels' | 'transport' | 'welfare' | 'disciplinary' | 'security'>('settings');
  const [students, setStudents] = useState<any[]>([]);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // --- Feature Matrix Config and Flags ---
  const [features, setFeatures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- HOSTELS STATE ---
  const [hostels, setHostels] = useState<any[]>([]);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [allocations, setAllocations] = useState<any[]>([]);
  const [hostelIncidents, setHostelIncidents] = useState<any[]>([]);
  // Hostel Forms
  const [newHostel, setNewHostel] = useState({ name: '', type: 'Mixed Only' });
  const [newBlock, setNewBlock] = useState({ hostelId: '', name: '' });
  const [newRoom, setNewRoom] = useState({ hostelId: '', blockId: '', floor: 'Ground Floor', roomNo: '', room_capacity: '4', gender: 'mixed' });
  const [assessDamage, setAssessDamage] = useState({ studentId: '', amount: '', reason: '' });

  // --- TRANSPORT STATE ---
  const [routes, setRoutes] = useState<any[]>([]);
  const [stops, setStops] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  // Transport Forms
  const [newRoute, setNewRoute] = useState({ name: '', fareAmount: '' });
  const [newStop, setNewStop] = useState({ routeId: '', stopName: '', sequence: '' });
  const [newVehicle, setNewVehicle] = useState({ plateNumber: '', model: '', type: 'University Bus', capacity: '62' });
  const [newDriver, setNewDriver] = useState({ name: '', licenseNumber: '', phone: '' });

  // --- SUPPORT & WELFARE STATE ---
  const [welfareCases, setWelfareCases] = useState<any[]>([]);
  const [counselling, setCounselling] = useState<any[]>([]);
  // Welfare Resolve form
  const [resolveCase, setResolveCase] = useState({ caseId: '', notes: '', result: 'Assisted/Resolved' });

  // --- DISCIPLINARY STATE ---
  const [disciplinaryCases, setDisciplinaryCases] = useState<any[]>([]);
  // Disciplinary Forms
  const [newDiscCase, setNewDiscCase] = useState({ studentId: '', title: '', description: '', type: 'Misconduct' });
  const [newHearing, setNewHearing] = useState({ caseId: '', date: '', time: '', venue: '', panelMembers: '' });
  const [newDecision, setNewDecision] = useState({ caseId: '', decisionType: 'Warning', description: '', penaltyAmount: '0' });

  // --- SECURITY STATE ---
  const [securityIncidents, setSecurityIncidents] = useState<any[]>([]);
  const [visitorLogs, setVisitorLogs] = useState<any[]>([]);
  // Security Forms
  const [newVisitor, setNewVisitor] = useState({ visitorName: '', phone: '', purpose: '', vehiclePlate: '', hostStaffName: '' });

  const flashSuccess = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 4050);
  };

  const flashError = (msg: string) => {
    setError(msg);
    setTimeout(() => setError(null), 4050);
  };

  const loadAllData = async () => {
    setLoading(true);
    const h = { 'Authorization': `Bearer ${token}` };
    try {
      // Load configuration toggles and active list of students for forms dropdown
      const [configRes, studentsRes] = await Promise.all([
        fetch('/api/admin/config', { headers: h }),
        fetch('/api/admin/students', { headers: h })
      ]);

      if (configRes.ok) {
        const json = await configRes.json();
        setFeatures(json.features || []);
      }
      if (studentsRes.ok) {
        setStudents(await studentsRes.json());
      }

      // Load Hostels Datasets
      const [hostelRes, blockRes, roomRes, allocRes, hIncRes] = await Promise.all([
        fetch('/api/hostels', { headers: h }),
        fetch('/api/hostels/blocks', { headers: h }),
        fetch('/api/hostels/rooms', { headers: h }),
        fetch('/api/hostels/allocations', { headers: h }),
        fetch('/api/hostels/incidents', { headers: h })
      ]);
      if (hostelRes.ok) setHostels(await hostelRes.json());
      if (blockRes.ok) setBlocks(await blockRes.json());
      if (roomRes.ok) setRooms(await roomRes.json());
      if (allocRes.ok) setAllocations(await allocRes.json());
      if (hIncRes.ok) setHostelIncidents(await hIncRes.json());

      // Load Transport Datasets
      const [routeRes, stopRes, vehRes, drvRes, assignRes] = await Promise.all([
        fetch('/api/transport/routes', { headers: h }),
        fetch('/api/transport/stops', { headers: h }),
        fetch('/api/transport/vehicles', { headers: h }),
        fetch('/api/transport/drivers', { headers: h }),
        fetch('/api/transport/assignments', { headers: h })
      ]);
      if (routeRes.ok) setRoutes(await routeRes.json());
      if (stopRes.ok) setStops(await stopRes.json());
      if (vehRes.ok) setVehicles(await vehRes.json());
      if (drvRes.ok) setDrivers(await drvRes.json());
      if (assignRes.ok) setAssignments(await assignRes.json());

      // Load Welfare & Counselling
      const [welfRes, counselRes] = await Promise.all([
        fetch('/api/welfare/cases', { headers: h }),
        fetch('/api/welfare/counselling', { headers: h })
      ]);
      if (welfRes.ok) setWelfareCases(await welfRes.json());
      if (counselRes.ok) setCounselling(await counselRes.json());

      // Load Disciplinary
      const discRes = await fetch('/api/disciplinary/cases', { headers: h });
      if (discRes.ok) setDisciplinaryCases(await discRes.json());

      // Load Security & Visitors
      const [secRes, visRes] = await Promise.all([
        fetch('/api/security/incidents', { headers: h }),
        fetch('/api/security/visitors', { headers: h })
      ]);
      if (secRes.ok) setSecurityIncidents(await secRes.json());
      if (visRes.ok) setVisitorLogs(await visRes.json());

    } catch (e) {
      console.error("Administrative datasets fetch failed", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [token]);

  // --- ACTIONS: FEATURE FLAGS TOGGLING ---
  const handleFeatureToggle = async (key: string, currentValue: boolean) => {
    try {
      const r = await fetch('/api/admin/feature-flags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ key, value: !currentValue })
      });
      if (r.ok) {
        flashSuccess(`Optional module key configuration "${key}" updated successfully!`);
        loadAllData();
      }
    } catch (ex) {
      flashError('Failed to dispatch module config edit request.');
    }
  };

  // --- ACTIONS: HOSTEL CREATIONS ---
  const handleHostelCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHostel.name) return flashError('Name is required');
    try {
      const r = await fetch('/api/hostels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newHostel)
      });
      if (r.ok) {
        flashSuccess('Hostel Branch added successfully.');
        setNewHostel({ name: '', type: 'Mixed Only' });
        loadAllData();
      }
    } catch (ex) { flashError('Error processing request'); }
  };

  const handleBlockCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlock.hostelId || !newBlock.name) return flashError('Select hostel and enter name');
    try {
      const r = await fetch('/api/hostels/blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newBlock)
      });
      if (r.ok) {
        flashSuccess('Hostel Block added.');
        setNewBlock({ hostelId: '', name: '' });
        loadAllData();
      }
    } catch (ex) {}
  };

  const handleRoomCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const { hostelId, blockId, roomNo, room_capacity, floor, gender } = newRoom;
    if (!hostelId || !blockId || !roomNo || !room_capacity) return flashError('Select and fill all room fields.');
    try {
      const r = await fetch('/api/hostels/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          hostelId, blockId, floor, roomNo, room_capacity: Number(room_capacity), gender
        })
      });
      if (r.ok) {
        flashSuccess('Room generated successfully along with physical bunk beds.');
        setNewRoom({ hostelId: '', blockId: '', floor: 'Ground Floor', roomNo: '', room_capacity: '4', gender: 'mixed' });
        loadAllData();
      }
    } catch (ex) {}
  };

  const handleApproveAllocation = async (allocationId: string) => {
    try {
      const r = await fetch('/api/hostels/allocations/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ allocationId })
      });
      if (r.ok) {
        flashSuccess('Allocation approved. Bed assigned & double-entry fee (KES 15K) posted to student ledger.');
        loadAllData();
      } else {
        const err = await r.json();
        flashError(err.error || 'Approval failure');
      }
    } catch (ex) {}
  };

  const handleRejectAllocation = async (allocationId: string) => {
    try {
      const r = await fetch('/api/hostels/allocations/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ allocationId })
      });
      if (r.ok) {
        flashSuccess('Residency request declined.');
        loadAllData();
      }
    } catch (ex) {}
  };

  const handleAssessDamageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { studentId, amount, reason } = assessDamage;
    if (!studentId || !amount || !reason) return flashError('Select student, specify amount and damaged property reasons.');
    try {
      const r = await fetch('/api/hostels/damage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ studentId, amount: Number(amount), reason })
      });
      if (r.ok) {
        flashSuccess('Hostel Damage assessed & fine billed to ledger account successfully.');
        setAssessDamage({ studentId: '', amount: '', reason: '' });
        loadAllData();
      }
    } catch (ex) {}
  };

  const handleHostelIncidentResolve = async (incidentId: string) => {
    try {
      const r = await fetch('/api/hostels/incidents/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ incidentId })
      });
      if (r.ok) {
        flashSuccess('Incident ticket archived & marked as resolved.');
        loadAllData();
      }
    } catch (ex) {}
  };

  // --- ACTIONS: TRANSPORT CREATIONS ---
  const handleRouteCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoute.name || !newRoute.fareAmount) return flashError('Name and pricing KES are required');
    try {
      const r = await fetch('/api/transport/routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newRoute)
      });
      if (r.ok) {
        flashSuccess('Transport Route entered successfully.');
        setNewRoute({ name: '', fareAmount: '' });
        loadAllData();
      }
    } catch (ex) {}
  };

  const handleStopCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const { routeId, stopName, sequence } = newStop;
    if (!routeId || !stopName || !sequence) return flashError('Select route, stop name and sequence order');
    try {
      const r = await fetch('/api/transport/stops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ routeId, stopName, sequence: Number(sequence) })
      });
      if (r.ok) {
        flashSuccess('Route Stop added.');
        setNewStop({ routeId: '', stopName: '', sequence: '' });
        loadAllData();
      }
    } catch (ex) {}
  };

  const handleVehicleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const { plateNumber, model, type, capacity } = newVehicle;
    if (!plateNumber || !model || !type || !capacity) return flashError('Fill all vehicle specs');
    try {
      const r = await fetch('/api/transport/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ plateNumber, model, type, capacity: Number(capacity) })
      });
      if (r.ok) {
        flashSuccess('Bus schedule fleet registered.');
        setNewVehicle({ plateNumber: '', model: '', type: 'University Bus', capacity: '62' });
        loadAllData();
      }
    } catch (ex) {}
  };

  const handleDriverCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDriver.name || !newDriver.licenseNumber) return flashError('Driver name and DL are required');
    try {
      const r = await fetch('/api/transport/drivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newDriver)
      });
      if (r.ok) {
        flashSuccess('Executive driver cataloged on roster.');
        setNewDriver({ name: '', licenseNumber: '', phone: '' });
        loadAllData();
      }
    } catch (ex) {}
  };

  const handleApproveTransport = async (assignmentId: string) => {
    try {
      const r = await fetch('/api/transport/assignments/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ assignmentId })
      });
      if (r.ok) {
        flashSuccess('Routing approved & commuter pass issued to student with ledger routing fare posted.');
        loadAllData();
      }
    } catch (ex) {}
  };

  // --- ACTIONS: WELFARE INTENT ---
  const handleResolveWelfareSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { caseId, notes, result } = resolveCase;
    if (!caseId || !notes) return flashError('Select case ticket and record final intake resolved notes.');
    try {
      const r = await fetch('/api/welfare/cases/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ caseId, notes, result })
      });
      if (r.ok) {
        flashSuccess('Support ticket case closed & outcome notes broadcasted.');
        setResolveCase({ caseId: '', notes: '', result: 'Assisted/Resolved' });
        loadAllData();
      }
    } catch (ex) {}
  };

  // --- ACTIONS: DISCIPLINARY ---
  const handleDisciplinaryCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const { studentId, title, description, type } = newDiscCase;
    if (!studentId || !title || !description || !type) return flashError('Fill all case fields');
    try {
      const r = await fetch('/api/disciplinary/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newDiscCase)
      });
      if (r.ok) {
        flashSuccess('Misconduct case ticket logged. Review panel summoned.');
        setNewDiscCase({ studentId: '', title: '', description: '', type: 'Misconduct' });
        loadAllData();
      }
    } catch (ex) {}
  };

  const handleScheduleHearing = async (e: React.FormEvent) => {
    e.preventDefault();
    const { caseId, date, time, venue, panelMembers } = newHearing;
    if (!caseId || !date || !time || !venue) return flashError('Fill hearing schedule specs');
    try {
      const r = await fetch('/api/disciplinary/hearings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          caseId, date, time, venue, panelMembers: panelMembers.split(',').map(m => m.trim())
        })
      });
      if (r.ok) {
        flashSuccess('Physical Board Summon notice generated. Alerts dispatched onto student portal.');
        setNewHearing({ caseId: '', date: '', time: '', venue: '', panelMembers: '' });
        loadAllData();
      }
    } catch (ex) {}
  };

  const handleLogDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    const { caseId, decisionType, description, penaltyAmount } = newDecision;
    if (!caseId || !decisionType || !description) return flashError('Fill decision type & description');
    try {
      const r = await fetch('/api/disciplinary/decisions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          caseId, decisionType, description, penaltyAmount: Number(penaltyAmount)
        })
      });
      if (r.ok) {
        flashSuccess('Outcome decision registered! Compliance status adjusted & ledger fines posted.');
        setNewDecision({ caseId: '', decisionType: 'Warning', description: '', penaltyAmount: '0' });
        loadAllData();
      }
    } catch (ex) {}
  };

  // --- ACTIONS: SECURITY & VISITOR ---
  const handleSecurityAction = async (incidentId: string, status: string) => {
    try {
      const r = await fetch('/api/security/incidents/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ incidentId, status })
      });
      if (r.ok) {
        flashSuccess(`Incident updated to [${status}] successfully.`);
        loadAllData();
      }
    } catch (ex) {}
  };

  const handleVisitorCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { visitorName, phone, purpose, vehiclePlate, hostStaffName } = newVisitor;
    if (!visitorName || !phone || !purpose) return flashError('Visitor name, phone, and purpose are required.');
    try {
      const r = await fetch('/api/security/visitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newVisitor)
      });
      if (r.ok) {
        flashSuccess('Visitor checked-in successfully inside security logs.');
        setNewVisitor({ visitorName: '', phone: '', purpose: '', vehiclePlate: '', hostStaffName: '' });
        loadAllData();
      }
    } catch (ex) {}
  };

  const handleVisitorCheckout = async (visitorId: string) => {
    try {
      const r = await fetch('/api/security/visitors/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ visitorId })
      });
      if (r.ok) {
        flashSuccess('Visitor checked-out.');
        loadAllData();
      }
    } catch (ex) {}
  };

  if (loading) {
    return (
      <div className="p-8 text-center bg-slate-900 rounded-xl">
        <RefreshCw className="h-6 w-6 animate-spin text-white mx-auto mb-2" />
        <span className="text-xs font-mono text-slate-400">Deploying Campus Life datasets...</span>
      </div>
    );
  }

  // Derived arrays
  const isHostelEnabled = (features || []).find(f => f.key === 'enable_hostel_module')?.value ?? false;
  const isTransportEnabled = (features || []).find(f => f.key === 'enable_transport_module')?.value ?? false;
  const isWelfareEnabled = (features || []).find(f => f.key === 'enable_welfare_module')?.value ?? true;

  return (
    <div className="space-y-6 text-[11px] animate-fade">
      {/* SUCCESS & ERROR MARGIN FEEDBACK */}
      {success && (
        <div className="bg-emerald-950 text-emerald-400 p-4 rounded-xl border border-emerald-900 shadow font-mono text-xs font-bold animate-pulse">
          🎯 [POSTING] {success}
        </div>
      )}
      {error && (
        <div className="bg-rose-950 text-rose-400 p-4 rounded-xl border border-rose-900 shadow font-mono text-xs font-bold">
          ⚠️ [HALT] {error}
        </div>
      )}

      {/* HORIZONTAL CONTROLLER MENU BAR */}
      <div className="bg-slate-900 rounded-xl p-3 border border-slate-800 flex flex-wrap gap-2">
        <button 
          onClick={() => setActiveSubView('settings')}
          className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer font-mono ${activeSubView === 'settings' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
        >
          ⚙️ Optional Modules SaaS Setup
        </button>
        {isHostelEnabled && (
          <button 
            onClick={() => setActiveSubView('hostels')}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer font-mono ${activeSubView === 'hostels' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            🏠 Hostel Accommodation Portal
          </button>
        )}
        {isTransportEnabled && (
          <button 
            onClick={() => setActiveSubView('transport')}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer font-mono ${activeSubView === 'transport' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            🚌 Commuter Routing & Fleet
          </button>
        )}
        {isWelfareEnabled && (
          <button 
            onClick={() => setActiveSubView('welfare')}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer font-mono ${activeSubView === 'welfare' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            ❤️ Support Cases & Counselling
          </button>
        )}
        <button 
          onClick={() => setActiveSubView('disciplinary')}
          className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer font-mono ${activeSubView === 'disciplinary' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
        >
          ⚖️ Disciplinary Board Panel
        </button>
        <button 
          onClick={() => setActiveSubView('security')}
          className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer font-mono ${activeSubView === 'security' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
        >
          🛡️ Guard Command & Visitors
        </button>
      </div>

      {/* VIEW A: SETTINGS OVERWRITE PANEL */}
      {activeSubView === 'settings' && (
        <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-900 font-mono uppercase tracking-wider">Campus Life Optional Module Grid</h3>
            <p className="text-[10px] text-slate-450 mt-1">Activate optional core modules according to school specifications. Deactivated modules hide menus and skip clearances auto.</p>
          </div>

          <div className="space-y-4 max-w-lg divide-y divide-slate-150">
            {features.map((feat: any) => (
              <div key={feat.key} className="flex justify-between items-center pt-4">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">{feat.title}</span>
                  <span className="text-[9px] font-mono text-slate-400 block font-bold">System flag parameter: {feat.key}</span>
                </div>
                <button 
                  onClick={() => handleFeatureToggle(feat.key, feat.value)}
                  className={`w-11 h-6 rounded-full p-0.5 transition-all duration-300 cursor-pointer ${
                    feat.value ? 'bg-indigo-600 text-right' : 'bg-slate-300 text-left'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-all transform ${feat.value ? 'translate-x-5' : ''}`} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW B: HOSTEL RESIDENCE REGISTER */}
      {activeSubView === 'hostels' && isHostelEnabled && (
        <div className="space-y-6">
          {/* Hostel booking approval queue */}
          <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-900 font-mono border-b pb-2 uppercase tracking-wide">Intake Bed-Allotment Requests</h3>
            {allocations.filter(a => a.status === 'pending').length === 0 ? (
              <p className="text-slate-400 font-mono p-4 text-center">All pending accommodation requests are empty.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono">
                  <thead>
                    <tr className="border-b text-[9px] text-slate-400 uppercase">
                      <th className="py-2">Reg ID</th>
                      <th>Student Name</th>
                      <th>Selected Venue</th>
                      <th>Room</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allocations.filter(a => a.status === 'pending').map((a: any) => (
                      <tr key={a.id} className="border-b text-slate-700 hover:bg-slate-50">
                        <td className="py-2.5 font-bold">{a.regNumber}</td>
                        <td className="font-sans font-bold">{a.studentName}</td>
                        <td>{a.hostelName} ({a.blockName})</td>
                        <td className="font-bold">{a.roomNo}</td>
                        <td className="text-right space-x-1">
                          <button onClick={() => handleApproveAllocation(a.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded px-2.5 py-1 text-[9px] font-bold cursor-pointer transition-colors">
                            Approve Bed & Bill
                          </button>
                          <button onClick={() => handleRejectAllocation(a.id)} className="bg-rose-600 hover:bg-rose-700 text-white rounded px-2.5 py-1 text-[9px] font-bold cursor-pointer transition-colors">
                            Decline
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Create lists columns & damage assessments */}
            <div className="space-y-6">
              {/* Damage assesses form */}
              <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
                <h4 className="text-xs font-bold text-slate-900 border-b pb-2 font-mono uppercase">Assess Damage Penalties</h4>
                <form onSubmit={handleAssessDamageSubmit} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-slate-400 block h-fit">Select student</label>
                    <select 
                      value={assessDamage.studentId} 
                      onChange={(e) => setAssessDamage(prev => ({ ...prev, studentId: e.target.value }))}
                      className="w-full text-xs p-1.5 border rounded bg-slate-50 cursor-pointer"
                    >
                      <option value="">-- Choose student --</option>
                      {students.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.regNumber})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-slate-400 block h-fit">Fine Amount (KES)</label>
                    <input 
                      type="number" 
                      placeholder="KES e.g. 3500" 
                      value={assessDamage.amount} 
                      onChange={(e) => setAssessDamage(prev => ({ ...prev, amount: e.target.value }))}
                      className="w-full text-xs p-1.5 border rounded"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-slate-400 block h-fit">Reason / Property Loss</label>
                    <textarea 
                      placeholder="Lost room keys, shattered block window, damaged bed-frame..." 
                      rows={2} 
                      value={assessDamage.reason} 
                      onChange={(e) => setAssessDamage(prev => ({ ...prev, reason: e.target.value }))}
                      className="w-full text-xs p-1.5 border rounded"
                    />
                  </div>

                  <button type="submit" className="w-full py-2 bg-indigo-600 text-white font-bold font-mono rounded cursor-pointer">
                    💸 Assess Penalty Fine
                  </button>
                </form>
              </div>

              {/* Add Hostel branch */}
              <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
                <h4 className="text-xs font-bold text-slate-900 border-b pb-2 font-mono uppercase">Add Hostel branch</h4>
                <form onSubmit={handleHostelCreate} className="space-y-3">
                  <input 
                    type="text" 
                    placeholder="Hostel Name e.g. Mens Hall A" 
                    value={newHostel.name} 
                    onChange={(e) => setNewHostel(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full text-xs p-1.5 border rounded"
                  />
                  <select 
                    value={newHostel.type} 
                    onChange={(e) => setNewHostel(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full text-xs p-1.5 border rounded bg-slate-50"
                  >
                    <option value="Male Only">Male Only</option>
                    <option value="Female Only">Female Only</option>
                    <option value="Mixed Only">Mixed / All</option>
                  </select>
                  <button type="submit" className="w-full py-1.5 bg-slate-900 text-white font-mono rounded font-bold cursor-pointer">
                    Create Hostel Branch
                  </button>
                </form>
              </div>
            </div>

            {/* Create blocks and room capacities columns */}
            <div className="space-y-6">
              {/* Create new blocks inside hostels */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h4 className="text-xs font-bold text-slate-900 border-b pb-2 font-mono uppercase">Deploy Blocks</h4>
                <form onSubmit={handleBlockCreate} className="space-y-3">
                  <select 
                    value={newBlock.hostelId} 
                    onChange={(e) => setNewBlock(prev => ({ ...prev, hostelId: e.target.value }))}
                    className="w-full text-xs p-1.5 border rounded bg-slate-100"
                  >
                    <option value="">-- Choose Hostel Residence --</option>
                    {hostels.map(h => (
                      <option key={h.id} value={h.id}>{h.name}</option>
                    ))}
                  </select>
                  <input 
                    type="text" 
                    placeholder="Block Name e.g. Block C" 
                    value={newBlock.name}
                    onChange={(e) => setNewBlock(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full text-xs p-1.5 border rounded"
                  />
                  <button type="submit" className="w-full py-1.5 bg-slate-900 text-white font-mono rounded font-bold cursor-pointer">
                    Apply Block Deployment
                  </button>
                </form>
              </div>

              {/* Create rooms inside block */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h4 className="text-xs font-bold text-slate-900 border-b pb-2 font-mono uppercase">Setup Room & Auto-Bed generation</h4>
                <form onSubmit={handleRoomCreate} className="space-y-3">
                  <select 
                    value={newRoom.hostelId} 
                    onChange={(e) => setNewRoom(prev => ({ ...prev, hostelId: e.target.value }))}
                    className="w-full text-xs p-1.5 border rounded bg-slate-100"
                  >
                    <option value="">-- Choose Hostel --</option>
                    {hostels.map(h => (
                      <option key={h.id} value={h.id}>{h.name}</option>
                    ))}
                  </select>
                  <select 
                    value={newRoom.blockId} 
                    onChange={(e) => setNewRoom(prev => ({ ...prev, blockId: e.target.value }))}
                    className="w-full text-xs p-1.5 border rounded bg-slate-100"
                  >
                    <option value="">-- Choose Block --</option>
                    {blocks.filter(b => b.hostelId === newRoom.hostelId).map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                  <input 
                    type="text" 
                    placeholder="Room No e.g. Room A-202" 
                    value={newRoom.roomNo} 
                    onChange={(e) => setNewRoom(prev => ({ ...prev, roomNo: e.target.value }))}
                    className="w-full text-xs p-1.5 border rounded"
                  />
                  <input 
                    type="number" 
                    placeholder="Bunk Capacity e.g. 4 beds" 
                    value={newRoom.room_capacity} 
                    onChange={(e) => setNewRoom(prev => ({ ...prev, room_capacity: e.target.value }))}
                    className="w-full text-xs p-1.5 border rounded"
                  />
                  <select 
                    value={newRoom.gender} 
                    onChange={(e) => setNewRoom(prev => ({ ...prev, gender: e.target.value }))}
                    className="w-full text-xs p-1.5 border rounded bg-slate-50"
                  >
                    <option value="male">Male Only</option>
                    <option value="female">Female Only</option>
                    <option value="mixed">Mixed Open Room</option>
                  </select>
                  <button type="submit" className="w-full py-1.5 bg-indigo-600 text-white font-mono rounded font-bold cursor-pointer">
                    Deploy Room & Beds
                  </button>
                </form>
              </div>
            </div>

            {/* Hostel incidents log and active room capacity roster list */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 max-h-[300px] overflow-y-auto">
                <h4 className="text-xs font-bold text-slate-900 border-b pb-2 font-mono uppercase">Room Capacity status roster</h4>
                <div className="space-y-2">
                  {rooms.map(r => (
                    <div key={r.id} className="p-2.5 rounded bg-slate-50 border text-[10px]">
                      <div className="flex justify-between">
                        <span className="font-extrabold text-slate-800">{r.roomNo} ({r.floor})</span>
                        <span className={`px-1.5 rounded text-[8px] font-bold ${r.status === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>{r.status}</span>
                      </div>
                      <p className="text-slate-450 mt-1 font-mono">Capacity: {r.room_capacity} Bed bunks | Free: {r.available_beds} beds</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 max-h-[300px] overflow-y-auto">
                <h4 className="text-xs font-bold text-slate-900 border-b pb-2 font-mono uppercase">Hostel Maintenance & Damage Incidents</h4>
                <div className="space-y-2">
                  {hostelIncidents.map(inc => (
                    <div key={inc.id} className="p-2.5 rounded bg-slate-50 border text-[10px]">
                      <div className="flex justify-between">
                        <span className="font-extrabold text-slate-805">{inc.title}</span>
                        <span className={`px-1 rounded text-[8px] ${inc.status === 'resolved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600 animate-pulse'}`}>{inc.status}</span>
                      </div>
                      <p className="text-slate-500 mt-1">{inc.description}</p>
                      <p className="text-[9px] text-[#4f46e5] font-mono mt-0.5">Author: {inc.studentName}</p>
                      {inc.status === 'unresolved' && (
                        <button onClick={() => handleHostelIncidentResolve(inc.id)} className="mt-2 text-white bg-slate-900 hover:bg-emerald-600 px-2 py-0.5 font-bold font-mono text-[9px] rounded cursor-pointer">
                          Archive Resolved Ticket
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW C: TRANSPORT COMMUTER MATRIX */}
      {activeSubView === 'transport' && isTransportEnabled && (
        <div className="space-y-6">
          {/* Commuter Pass Signups applications */}
          <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-900 font-mono border-b pb-2 uppercase tracking-wide">Intake transport Signup Requests</h3>
            {assignments.filter(a => a.status === 'pending').length === 0 ? (
              <p className="text-slate-400 font-mono p-4 text-center">Commuter pass queue is currently empty.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono">
                  <thead>
                    <tr className="border-b text-[9px] text-slate-400 uppercase">
                      <th className="py-2">Reg ID</th>
                      <th>Student Name</th>
                      <th>Selected Route</th>
                      <th>Assigned Pickup Stop</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.filter(a => a.status === 'pending').map((a: any) => (
                      <tr key={a.id} className="border-b text-slate-700 hover:bg-slate-50">
                        <td className="py-2.5 font-bold">{a.regNumber}</td>
                        <td className="font-sans font-bold">{a.studentName}</td>
                        <td>{a.routeName}</td>
                        <td className="font-bold">{a.stopName}</td>
                        <td className="text-right">
                          <button onClick={() => handleApproveTransport(a.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded px-2.5 py-1 text-[9px] font-bold cursor-pointer transition-colors">
                            Approve Pass & Bill Fare
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Create Routes Column */}
            <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
              <h4 className="text-xs font-bold text-slate-900 border-b pb-2 font-mono uppercase">Setup Commuter Pass Routes</h4>
              <form onSubmit={handleRouteCreate} className="space-y-3">
                <input 
                  type="text" 
                  placeholder="Route Name e.g. CBD Ring Shuttle" 
                  value={newRoute.name} 
                  onChange={(e) => setNewRoute(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full text-xs p-1.5 border rounded"
                />
                <input 
                  type="number" 
                  placeholder="Semester Price KES e.g. 4500" 
                  value={newRoute.fareAmount} 
                  onChange={(e) => setNewRoute(prev => ({ ...prev, fareAmount: e.target.value }))}
                  className="w-full text-xs p-1.5 border rounded"
                />
                <button type="submit" className="w-full py-1.5 bg-indigo-600 text-white font-mono rounded font-bold cursor-pointer">
                  Create Commuter Route
                </button>
              </form>
            </div>

            {/* Create Sequence Route Stops Column */}
            <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
              <h4 className="text-xs font-bold text-slate-900 border-b pb-2 font-mono uppercase">Setup Route Pickup stations</h4>
              <form onSubmit={handleStopCreate} className="space-y-3">
                <select 
                  value={newStop.routeId} 
                  onChange={(e) => setNewStop(prev => ({ ...prev, routeId: e.target.value }))}
                  className="w-full text-xs p-1.5 border rounded bg-slate-100"
                >
                  <option value="">-- Select Route --</option>
                  {routes.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
                <input 
                  type="text" 
                  placeholder="Stop Station Name e.g. Stage Gate A"
                  value={newStop.stopName} 
                  onChange={(e) => setNewStop(prev => ({ ...prev, stopName: e.target.value }))}
                  className="w-full text-xs p-1.5 border rounded"
                />
                <input 
                  type="number" 
                  placeholder="Route Step Sequence No e.g. 1" 
                  value={newStop.sequence} 
                  onChange={(e) => setNewStop(prev => ({ ...prev, sequence: e.target.value }))}
                  className="w-full text-xs p-1.5 border rounded"
                />
                <button type="submit" className="w-full py-1.5 bg-slate-900 text-white font-mono rounded font-bold cursor-pointer">
                  Deploy Pickup Station
                </button>
              </form>
            </div>

            {/* fleet registration vehicle */}
            <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
              <h4 className="text-xs font-bold text-slate-900 border-b pb-2 font-mono uppercase">Deploy Shuttle Bus Fleet</h4>
              <form onSubmit={handleVehicleCreate} className="space-y-3">
                <input 
                  type="text" 
                  placeholder="License Plate e.g. KBH 102Z" 
                  value={newVehicle.plateNumber} 
                  onChange={(e) => setNewVehicle(prev => ({ ...prev, plateNumber: e.target.value }))}
                  className="w-full text-xs p-1.5 border rounded animate-fade"
                />
                <input 
                  type="text" 
                  placeholder="Model details e.g. Isuzu Bus" 
                  value={newVehicle.model} 
                  onChange={(e) => setNewVehicle(prev => ({ ...prev, model: e.target.value }))}
                  className="w-full text-xs p-1.5 border rounded"
                />
                <select 
                  value={newVehicle.type} 
                  onChange={(e) => setNewVehicle(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full text-xs p-1.5 border rounded bg-slate-105"
                >
                  <option value="University Bus">62-Seater Executive Shuttle Bus</option>
                  <option value="School Van">14-Seater School Van</option>
                </select>
                <input 
                  type="number" 
                  value={newVehicle.capacity} 
                  onChange={(e) => setNewVehicle(prev => ({ ...prev, capacity: e.target.value }))}
                  className="w-full text-xs p-1.5 border rounded"
                />
                <button type="submit" className="w-full py-1.5 bg-slate-900 text-white font-mono rounded font-bold cursor-pointer">
                  Deploy Vehicle
                </button>
              </form>
            </div>

            {/* register driver Column */}
            <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
              <h4 className="text-xs font-bold text-slate-900 border-b pb-2 font-mono uppercase">Drivers Registry Roster</h4>
              <form onSubmit={handleDriverCreate} className="space-y-3">
                <input 
                  type="text" 
                  placeholder="Driver Full Name e.g. Charles" 
                  value={newDriver.name} 
                  onChange={(e) => setNewDriver(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full text-xs p-1.5 border rounded"
                />
                <input 
                  type="text" 
                  placeholder="License DL No e.g. DL-NSTU-4402" 
                  value={newDriver.licenseNumber} 
                  onChange={(e) => setNewDriver(prev => ({ ...prev, licenseNumber: e.target.value }))}
                  className="w-full text-xs p-1.5 border rounded"
                />
                <input 
                  type="text" 
                  placeholder="Driver Phone Mobile No" 
                  value={newDriver.phone} 
                  onChange={(e) => setNewDriver(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full text-xs p-1.5 border rounded"
                />
                <button type="submit" className="w-full py-1.5 bg-indigo-600 text-white font-mono rounded font-bold cursor-pointer">
                  Roster Driver DL
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* VIEW D: SUPPORT & WELFARE COUNSELLING DESK */}
      {activeSubView === 'welfare' && isWelfareEnabled && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* List welfare case support requests */}
            <div className="md:col-span-2 space-y-4">
              <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-slate-900 font-mono border-b pb-2 uppercase tracking-wide">University support Case tickets</h3>
                {welfareCases.length === 0 ? (
                  <p className="text-slate-400 font-mono p-4 text-center">Support queue is completely clear.</p>
                ) : (
                  <div className="space-y-3">
                    {welfareCases.map((c: any) => (
                      <div key={c.id} className="p-4 rounded-lg bg-slate-50 border text-[10px] space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[9px] font-bold text-indigo-650 uppercase block font-mono">{c.category}</span>
                            <h4 className="text-xs font-extrabold text-slate-805 mt-0.5">{c.title}</h4>
                            <p className="text-slate-500 mt-1">{c.description}</p>
                          </div>
                          <span className={`px-2 py-0.5 font-bold uppercase rounded text-[8px] ${c.status === 'resolved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600 animate-pulse'}`}>{c.status}</span>
                        </div>
                        <p className="font-mono text-[9px] text-[#4f46e5] font-bold">Requester Student: {c.studentName} ({c.id})</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Resolve support intake form */}
            <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4 h-fit">
              <h4 className="text-xs font-bold text-[#4338ca] border-b pb-2 font-mono uppercase">Counselor Intake & Resolution Action</h4>
              <form onSubmit={handleResolveWelfareSubmit} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-slate-400">Select active ticket</label>
                  <select 
                    value={resolveCase.caseId} 
                    onChange={(e) => setResolveCase(prev => ({ ...prev, caseId: e.target.value }))}
                    className="w-full text-xs p-1.5 border rounded bg-slate-100"
                  >
                    <option value="">-- Choose student Case --</option>
                    {welfareCases.filter(c => c.status !== 'resolved').map(c => (
                      <option key={c.id} value={c.id}>{c.studentName}: {c.title}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1 font-sans">
                  <label className="text-[9px] font-mono text-slate-400">Resolution Result Category</label>
                  <select 
                    value={resolveCase.result} 
                    onChange={(e) => setResolveCase(prev => ({ ...prev, result: e.target.value }))}
                    className="w-full text-xs p-1.5 border rounded bg-slate-50"
                  >
                    <option value="Assisted/Resolved">Assisted/Resolved</option>
                    <option value="Academic Accommodation Granted">Academic Special Exemption Accommodation Granted</option>
                    <option value="Referred to Clinical Dean">Referred to Outside Clinical Health Dean Office</option>
                    <option value="Harassment warning issued">Harassment citation warning issued to perpetrator student</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-slate-400">Counsel Notes / Action Taken</label>
                  <textarea 
                    placeholder="Enter support intake sessions, recommendations, key action logs..." 
                    rows={4} 
                    value={resolveCase.notes} 
                    onChange={(e) => setResolveCase(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full text-xs p-1.5 border rounded"
                  />
                </div>

                <button type="submit" className="w-full py-2 bg-indigo-600 text-white font-mono rounded font-bold cursor-pointer">
                  ❤️ Record Counselor Resolution
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* VIEW E: DISCIPLINARY BOARD ACTIONS */}
      {activeSubView === 'disciplinary' && (
        <div className="space-y-6 animate-fade">
          {/* Active Disciplinary List */}
          <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-900 font-mono border-b pb-2 uppercase tracking-wide text-red-700">Official conduct infraction Cases</h3>
            {disciplinaryCases.length === 0 ? (
              <p className="text-emerald-600 text-center font-mono py-8 bg-emerald-50 rounded border border-emerald-100 font-bold">
                ✅ exemplary campus disciplinary catalog is clean!
              </p>
            ) : (
              <div className="overflow-x-auto text-[10px]">
                <table className="w-full text-left font-mono">
                  <thead>
                    <tr className="border-b text-[9px] text-slate-400 uppercase">
                      <th className="py-2">Case ID</th>
                      <th>Target Student</th>
                      <th>Infraction Title</th>
                      <th>Misconduct Level</th>
                      <th>Status Standing</th>
                    </tr>
                  </thead>
                  <tbody>
                    {disciplinaryCases.map((c: any) => (
                      <tr key={c.id} className="border-b text-slate-705 hover:bg-slate-50 font-bold">
                        <td className="py-2">{c.id}</td>
                        <td className="font-sans text-rose-950">{c.studentName}</td>
                        <td className="max-w-[150px] truncate">{c.title}</td>
                        <td>{c.type}</td>
                        <td className="uppercase"><span className="text-[9px] rounded px-1.5 bg-rose-50 text-rose-700 border border-rose-110">{c.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Create Infraction Case form */}
            <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4 h-fit">
              <h4 className="text-xs font-bold text-red-700 border-b pb-2 font-mono uppercase">Lodge Misconduct Incident Case</h4>
              <form onSubmit={handleDisciplinaryCreate} className="space-y-3">
                <select 
                  value={newDiscCase.studentId}
                  onChange={(e) => setNewDiscCase(prev => ({ ...prev, studentId: e.target.value }))}
                  className="w-full text-xs p-1.5 border rounded bg-slate-50 cursor-pointer"
                >
                  <option value="">-- Select Violator student --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.regNumber})</option>
                  ))}
                </select>

                <select 
                  value={newDiscCase.type} 
                  onChange={(e) => setNewDiscCase(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full text-xs p-1.5 border rounded bg-slate-100"
                >
                  <option value="Examination Irregularities">Examination Irregularities/Cheating</option>
                  <option value="Academic Misconduct">General Academic Plagiarism</option>
                  <option value="Property Damage">Hostel/Campus Property Damage</option>
                  <option value="Violence">Assault or physical violence</option>
                  <option value="Misconduct">General Misconduct warning</option>
                </select>

                <input 
                  type="text" 
                  placeholder="Case subject Title e.g. Caught cheating on Exam" 
                  value={newDiscCase.title} 
                  onChange={(e) => setNewDiscCase(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full text-xs p-1.5 border rounded"
                />

                <textarea 
                  placeholder="Explain incident facts deeply, including witnesses or confiscated assets." 
                  rows={3} 
                  value={newDiscCase.description} 
                  onChange={(e) => setNewDiscCase(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full text-xs p-1.5 border rounded"
                />

                <button type="submit" className="w-full py-1.5 bg-slate-900 text-white font-mono rounded font-bold cursor-pointer hover:bg-red-800">
                  Lodge Case Docket
                </button>
              </form>
            </div>

            {/* Schedule Disciplinary summoning physical board hearing */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 h-fit">
              <h4 className="text-xs font-bold text-red-700 border-b pb-2 font-mono uppercase">Summon board Panel hearing</h4>
              <form onSubmit={handleScheduleHearing} className="space-y-3">
                <select 
                  value={newHearing.caseId} 
                  onChange={(e) => setNewHearing(prev => ({ ...prev, caseId: e.target.value }))}
                  className="w-full text-xs p-1.5 border rounded bg-slate-50 cursor-pointer"
                >
                  <option value="">-- Choose case ticket --</option>
                  {disciplinaryCases.filter(c => c.status === 'reported').map(c => (
                    <option key={c.id} value={c.id}>{c.studentName}: {c.title}</option>
                  ))}
                </select>

                <input 
                  type="date" 
                  value={newHearing.date} 
                  onChange={(e) => setNewHearing(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full text-xs p-1.5 border rounded"
                />

                <input 
                  type="text" 
                  placeholder="Summon time e.g. 10:30 AM" 
                  value={newHearing.time} 
                  onChange={(e) => setNewHearing(prev => ({ ...prev, time: e.target.value }))}
                  className="w-full text-xs p-1.5 border rounded"
                />

                <input 
                  type="text" 
                  placeholder="Venue e.g. Dean physical boardroom Room 102"
                  value={newHearing.venue} 
                  onChange={(e) => setNewHearing(prev => ({ ...prev, venue: e.target.value }))}
                  className="w-full text-xs p-1.5 border rounded"
                />

                <input 
                  type="text" 
                  placeholder="Panel members (comma separated)" 
                  value={newHearing.panelMembers} 
                  onChange={(e) => setNewHearing(prev => ({ ...prev, panelMembers: e.target.value }))}
                  className="w-full text-xs p-1.5 border rounded"
                />

                <button type="submit" className="w-full py-1.5 bg-indigo-650 text-white font-mono rounded font-bold cursor-pointer hover:bg-slate-900">
                  ⚠️ Send Board Summon Alert
                </button>
              </form>
            </div>

            {/* Lodge final compliance outcome decision Warning, Probation, Suspension, Expulsion form */}
            <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4 h-fit">
              <h4 className="text-xs font-bold text-red-700 border-b pb-2 font-mono uppercase font-sans">Final board panel Decision & Penalties</h4>
              <form onSubmit={handleLogDecision} className="space-y-3">
                <select 
                  value={newDecision.caseId} 
                  onChange={(e) => setNewDecision(prev => ({ ...prev, caseId: e.target.value }))}
                  className="w-full text-xs p-1.5 border rounded bg-slate-50 cursor-pointer"
                >
                  <option value="">-- Choose summoned case --</option>
                  {disciplinaryCases.filter(c => c.status === 'hearing_scheduled').map(c => (
                    <option key={c.id} value={c.id}>{c.studentName}: {c.title}</option>
                  ))}
                </select>

                <select 
                  value={newDecision.decisionType} 
                  onChange={(e) => setNewDecision(prev => ({ ...prev, decisionType: e.target.value }))}
                  className="w-full text-xs p-1.5 border rounded bg-slate-100"
                >
                  <option value="Warning">Official Warning Written Citation</option>
                  <option value="Probation">Strict probation warning rules (2-Semesters)</option>
                  <option value="Suspension">Suspension (Immediate status lock to Suspended)</option>
                  <option value="Expulsion">Expulsion (Deferred profile permanent locked)</option>
                </select>

                <input 
                  type="number" 
                  placeholder="Fine assessment penalty cost (KES) (Double entry ledger auto-bills)" 
                  value={newDecision.penaltyAmount}
                  onChange={(e) => setNewDecision(prev => ({ ...prev, penaltyAmount: e.target.value }))}
                  className="w-full text-xs p-1.5 border rounded font-mono"
                />

                <textarea 
                  placeholder="State decision details: summary arguments & required compliance resolution steps." 
                  rows={2} 
                  value={newDecision.description} 
                  onChange={(e) => setNewDecision(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full text-xs p-1.5 border rounded"
                />

                <button type="submit" className="w-full py-1.5 bg-red-700 hover:bg-red-805 text-white font-mono rounded font-bold cursor-pointer">
                  📢 File Official Panel Decision
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* VIEW F: SECURITY INTENTION & VISITOR ROSTER LOGS */}
      {activeSubView === 'security' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-900 font-mono border-b pb-2 uppercase tracking-wide">Campus Security incident Center</h3>
            {securityIncidents.length === 0 ? (
              <p className="text-slate-400 font-mono text-center py-6">Campus environment is quiet. No security incidents reported.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {securityIncidents.map((s: any) => (
                  <div key={s.id} className="p-4 rounded-xl border border-slate-150 bg-slate-50 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] font-extrabold uppercase text-indigo-650 block font-mono">{s.category}</span>
                        <h4 className="text-xs font-black text-slate-800">{s.title}</h4>
                        <p className="text-slate-500 mt-1">{s.description}</p>
                        <p className="text-[10px] text-slate-650 font-bold block mt-1">📍 Reported venue: {s.location} | Role: {s.reporterRole}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded uppercase font-bold text-[8px] border ${
                        s.status === 'resolved' ? 'bg-emerald-50 border-emerald-150 text-emerald-600' : 'bg-rose-50 border-rose-150 text-rose-600 animate-pulse'
                      }`}>{s.status}</span>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t text-[9px] text-slate-450 font-mono">
                      <span>By: {s.studentName || 'Staff Admin'}</span>
                      <span>{new Date(s.reportedAt).toLocaleDateString()}</span>
                    </div>

                    {s.status === 'reported' && (
                      <div className="flex gap-1.5 pt-2">
                        <button onClick={() => handleSecurityAction(s.id, 'under-investigation')} className="bg-[#4f46e5] hover:bg-slate-900 border text-white font-bold px-2 py-0.5 rounded text-[9px] font-mono cursor-pointer">
                          Investigate
                        </button>
                        <button onClick={() => handleSecurityAction(s.id, 'resolved')} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2 py-0.5 rounded text-[9px] font-mono cursor-pointer">
                          Archive Resolved
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Checked In Visitors log column */}
            <div className="md:col-span-2 bg-white p-6 rounded-xl border shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-900 font-mono border-b pb-2 uppercase tracking-wide">Campus visitor logs check-in</h3>
              
              {visitorLogs.length === 0 ? (
                <p className="text-slate-400 font-mono p-4 text-center">No visitors roster checked-in on campus today.</p>
              ) : (
                <div className="overflow-x-auto text-[10px]">
                  <table className="w-full text-left font-mono">
                    <thead>
                      <tr className="border-b text-[9px] text-slate-450 uppercase">
                        <th className="py-2">Visitor Name</th>
                        <th>Contact No</th>
                        <th>Plate No</th>
                        <th>Visit Purpose</th>
                        <th>Host staff</th>
                        <th className="text-right">Checkout Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visitorLogs.map((v: any) => (
                        <tr key={v.id} className="border-b text-slate-705 hover:bg-slate-50 font-bold">
                          <td className="py-2 text-rose-950 font-sans">{v.visitorName}</td>
                          <td>{v.phone}</td>
                          <td className="font-bold">{v.vehiclePlate}</td>
                          <td>{v.purpose}</td>
                          <td className="font-sans font-medium">{v.hostStaffName}</td>
                          <td className="text-right">
                            {v.checkedOutAt ? (
                              <span className="text-slate-400">Out: {new Date(v.checkedOutAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            ) : (
                              <button onClick={() => handleVisitorCheckout(v.id)} className="bg-rose-600 hover:bg-rose-700 text-white rounded px-2 py-0.5 font-bold font-mono text-[9px] cursor-pointer">
                                Check Out Visitor
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Checkin visitor form column */}
            <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4 h-fit">
              <h4 className="text-xs font-bold text-[#4338ca] border-b pb-2 font-mono uppercase">Register physical visitor check-in</h4>
              <form onSubmit={handleVisitorCheckin} className="space-y-3 font-sans">
                <input 
                  type="text" 
                  placeholder="Visitor name e.g. Mercy Mwende" 
                  value={newVisitor.visitorName} 
                  onChange={(e) => setNewVisitor(prev => ({ ...prev, visitorName: e.target.value }))}
                  className="w-full text-xs p-1.5 border rounded"
                />

                <input 
                  type="text" 
                  placeholder="Visitor Phone Mobile Contact" 
                  value={newVisitor.phone} 
                  onChange={(e) => setNewVisitor(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full text-xs p-1.5 border rounded font-mono"
                />

                <input 
                  type="text" 
                  placeholder="License Vehicle Plate No (Optional)" 
                  value={newVisitor.vehiclePlate} 
                  onChange={(e) => setNewVisitor(prev => ({ ...prev, vehiclePlate: e.target.value }))}
                  className="w-full text-xs p-1.5 border rounded font-mono"
                />

                <input 
                  type="text" 
                  placeholder="Host Staff/Dept Name e.g. Registrar Office" 
                  value={newVisitor.hostStaffName} 
                  onChange={(e) => setNewVisitor(prev => ({ ...prev, hostStaffName: e.target.value }))}
                  className="w-full text-xs p-1.5 border rounded"
                />

                <textarea 
                  placeholder="State purpose of building entrance (e.g. audit billing issue, delivery, guest review)" 
                  rows={2} 
                  value={newVisitor.purpose} 
                  onChange={(e) => setNewVisitor(prev => ({ ...prev, purpose: e.target.value }))}
                  className="w-full text-xs p-1.5 border rounded"
                />

                <button type="submit" className="w-full py-1.5 bg-[#4338ca] hover:bg-slate-900 border text-white font-mono rounded font-bold cursor-pointer">
                  🚪 Register Main-Gate check-in
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
