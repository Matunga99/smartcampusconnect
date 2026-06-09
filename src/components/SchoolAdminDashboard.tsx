/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Play } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Layers, 
  GraduationCap, 
  BookOpen, 
  Users, 
  User,
  UserSquare2, 
  Settings, 
  LogOut,
  Compass, 
  Plus, 
  Trash2, 
  Edit3, 
  FileCheck2, 
  Sliders,
  CheckCircle,
  AlertCircle,
  Hash,
  Contact,
  X,
  Sparkles,
  ToggleLeft,
  Mail,
  Smartphone,
  Check,
  Search,
  Calendar,
  Lock,
  Database,
  Activity,
  FileText,
  RefreshCw,
  TrendingUp,
  LineChart,
  ExternalLink,
  Eye,
  Copy,
  Cpu,
  Download,
  MessageSquare,
  Wallet,
  Boxes,
  HeartPulse
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AdminAcademicConfig from './AdminAcademicConfig';
import AdminCurriculumMapping from './AdminCurriculumMapping';
import AdminTeachingAllocation from './AdminTeachingAllocation';
import AdminTimetableEngine from './AdminTimetableEngine';
import ProfilePage from './ProfilePage';
import CommunicationsHub from './CommunicationsHub';
import DocumentEnginePortal from './DocumentEnginePortal';
import AdminFinanceEngine from './AdminFinanceEngine';
import AdminExaminationEngine from './AdminExaminationEngine';
import LibrarianManagerDashboard from './LibrarianManagerDashboard';
import AdminCampusLifeTab from './AdminCampusLifeTab';
import AdminHrManagement from './AdminHrManagement';
import AdminProcurementAssets from './AdminProcurementAssets';
import { AdminSystemHealth } from './AdminSystemHealth';
import AdminParentManagement from './AdminParentManagement';
import AdminModuleManagement from './AdminModuleManagement';
import AdminTemplateLibrary from './AdminTemplateLibrary';
import AdminDynamicEntities from './AdminDynamicEntities';
import AdminWorkflowEngine from './AdminWorkflowEngine';
import AdminMarketplace from './AdminMarketplace';

interface SchoolAdminDashboardProps {
  token: string;
  user: any;
  onLogout: () => void;
  appendLog?: (msg: string) => void;
  isPhoneFrame?: boolean;
  onTabChange?: (tab: 'dashboard' | 'departments' | 'programs' | 'units' | 'staff' | 'students' | 'settings' | 'timeline' | 'curriculum' | 'allocation' | 'timetable' | 'module_manager' | 'template_library' | 'dynamic_entities' | 'marketplace' | 'workflow_engine') => void;
}

export default function SchoolAdminDashboard({ 
  token, 
  user, 
  onLogout,
  appendLog,
  isPhoneFrame,
  onTabChange
}: SchoolAdminDashboardProps) {
  const getTerm = (key: string, defaultVal: string) => {
    return user?.school?.templateConfig?.terminology?.[key] || defaultVal;
  };

  const isModuleActive = (key: string, defaultVal = true) => {
    if (user?.school?.enabledModules) {
      return user.school.enabledModules[key] !== false;
    }
    if (user?.school?.templateConfig?.modules) {
      return user.school.templateConfig.modules[key] !== false;
    }
    return defaultVal;
  };

  const [activeTab, setActiveTab] = useState<'dashboard' | 'departments' | 'programs' | 'units' | 'staff' | 'students' | 'parents' | 'settings' | 'timeline' | 'curriculum' | 'allocation' | 'timetable' | 'state_machine' | 'system_control' | 'communications' | 'finance' | 'library' | 'campus_life' | 'hr_management' | 'procurement_assets' | 'system_health' | 'module_manager' | 'template_library' | 'dynamic_entities' | 'workflow_engine' | 'marketplace' | 'profile'>('dashboard');
  const [enrolledStudentCredentials, setEnrolledStudentCredentials] = useState<any | null>(null);
  const [schoolData, setSchoolData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Lists state
  const [departments, setDepartments] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);

  // 4 Pillars state parameters
  const [identities, setIdentities] = useState<any[]>([]);
  const [configs, setConfigs] = useState<any[]>([]);
  const [features, setFeatures] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [selectedStudentForLSM, setSelectedStudentForLSM] = useState<any | null>(null);
  const [lsmTransitionHistory, setLsmTransitionHistory] = useState<any[]>([]);
  const [lsmTargetState, setLsmTargetState] = useState('ACTIVE');
  const [lsmReason, setLsmReason] = useState('');
  
  // Three Global Systems state parameters
  const [activeSubTab, setActiveSubTab] = useState<'core' | 'consistency' | 'intelligence' | 'interop'>('core');
  const [consistencyStatus, setConsistencyStatus] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [isSyncingLMS, setIsSyncingLMS] = useState(false);
  const [isSelfHealing, setIsSelfHealing] = useState(false);
  
  const [concurrencyLogs, setConcurrencyLogs] = useState<string[]>([]);
  const [concurrencyLoading, setConcurrencyLoading] = useState(false);
  const [concurrencyResult, setConcurrencyResult] = useState<any>(null);
  const [viewedSchema, setViewedSchema] = useState<'none' | 'emis' | 'sis' | 'transcript'>('none');
  const [schemaData, setSchemaData] = useState<any>(null);
  
  // Payment Simulator values
  const [simStudentId, setSimStudentId] = useState('');
  const [simAmount, setSimAmount] = useState('450');

  const triggerSelfHealing = async () => {
    setIsSelfHealing(true);
    try {
      const r = await fetch('/api/admin/consistency/clear', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (r.ok) {
        const result = await r.json();
        setSuccessMsg(`Database Consistency state auto-repaired successfully! Cleared active locks & purged duplicates.`);
        setTimeout(() => setSuccessMsg(null), 4000);
        await loadOperationalData();
        await loadSchoolRecords();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSelfHealing(false);
    }
  };

  const runConcurrencyStressTest = async (stdId: string) => {
    if (!stdId) return;
    setConcurrencyLoading(true);
    setConcurrencyResult(null);
    setConcurrencyLogs([]);
    try {
      const r = await fetch('/api/admin/consistency/test-concurrency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ studentId: stdId })
      });
      if (r.ok) {
        const body = await r.json();
        setConcurrencyResult(body);
        setConcurrencyLogs(body.serializationLogs || []);
        await loadOperationalData();
      }
    } catch (ex) {
      console.error(ex);
    } finally {
      setConcurrencyLoading(false);
    }
  };

  const triggerSISSync = async (serviceName: string) => {
    setIsSyncingLMS(true);
    try {
      const r = await fetch('/api/admin/interop/trigger-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ targetService: serviceName })
      });
      if (r.ok) {
        const resObj = await r.json();
        setSuccessMsg(`Regulatory Integration push success: ${resObj.message}`);
        setTimeout(() => setSuccessMsg(null), 4000);
        await loadOperationalData();
        await loadStabilizationData();
      }
    } catch (ex) {
      console.error(ex);
    } finally {
      setIsSyncingLMS(false);
    }
  };

  const fetchAndShowSchema = async (formatType: 'ministry' | 'sis-json' | 'pdf') => {
    try {
      const r = await fetch(`/api/admin/interop/export/${formatType}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (r.ok) {
        const resJSON = await r.json();
        setSchemaData(resJSON);
        setViewedSchema(formatType === 'ministry' ? 'emis' : formatType === 'sis-json' ? 'sis' : 'transcript');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const safeJsonParse = async (response: Response) => {
    if (!response.ok) return null;
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) return null;
    try {
      return await response.json();
    } catch (e) {
      return null;
    }
  };

  const loadOperationalData = async () => {
    if (!token) return;
    try {
      const h = { 'Authorization': `Bearer ${token}` };
      const [consistencyR, analyticsR, webhookR] = await Promise.all([
        fetch('/api/admin/consistency/status', { headers: h }),
        fetch('/api/admin/analytics/decision-intel', { headers: h }),
        fetch('/api/admin/interop/webhooks', { headers: h })
      ]);
      
      const consistencyData = await safeJsonParse(consistencyR);
      if (consistencyData) {
        setConsistencyStatus(consistencyData);
      }
      const analyticsData = await safeJsonParse(analyticsR);
      if (analyticsData) {
        setAnalyticsData(analyticsData);
      }
      const webhookData = await safeJsonParse(webhookR);
      if (webhookData) {
        setWebhooks(webhookData);
      }
    } catch (e) {
      console.error('Error fetching operational engines records', e);
    }
  };

  const loadStabilizationData = async () => {
    if (!token) return;
    try {
      const h = { 'Authorization': `Bearer ${token}` };
      const [configR, eventsR, identitiesR] = await Promise.all([
        fetch('/api/admin/config', { headers: h }),
        fetch('/api/global/events', { headers: h }),
        fetch('/api/global/identities', { headers: h })
      ]);
      
      const configData = await safeJsonParse(configR);
      if (configData) {
        setConfigs(configData.configs || []);
        setFeatures(configData.features || []);
      }
      const eventsData = await safeJsonParse(eventsR);
      if (eventsData) {
        setEvents(eventsData);
      }
      const identitiesData = await safeJsonParse(identitiesR);
      if (identitiesData) {
        setIdentities(identitiesData);
      }
      
      // Hydrate Consistency, Analytics and Webhooks records as well
      await loadOperationalData();
    } catch (err) {
      console.error('Error fetching synchronization payloads', err);
    }
  };

  useEffect(() => {
    loadStabilizationData();
    const ticker = setInterval(loadStabilizationData, 4500);
    return () => clearInterval(ticker);
  }, [token, activeTab]);

  // Search & Filters
  const [studentSearch, setStudentSearch] = useState('');

  // Form states
  const [deptForm, setDeptForm] = useState({ name: '' });
  const [progForm, setProgForm] = useState({ name: '', departmentId: '', code: '', capacity: '' });
  const [unitForm, setUnitForm] = useState({ code: '', name: '', programId: '' });
  const [staffForm, setStaffForm] = useState({ name: '', email: '', phone: '', role: 'Lecturer', departmentId: '' });
  const [studentForm, setStudentForm] = useState({
    name: '',
    email: '',
    phone: '',
    regNumber: 'AUTO_GENERATED',
    programId: '',
    yearOfStudy: '1',
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    parentRelationship: 'Parent'
  });

  // Edit states for students
  const [editingStudent, setEditingStudent] = useState<any | null>(null);

  // Modals visibility toggles
  const [showAddDeptModal, setShowAddDeptModal] = useState(false);
  const [showAddProgModal, setShowAddProgModal] = useState(false);
  const [showAddUnitModal, setShowAddUnitModal] = useState(false);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);

  // Load all school-level records
  const loadSchoolRecords = async () => {
    setLoading(true);
    setError(null);
    try {
      const h = { 'Authorization': `Bearer ${token}` };
      
      const [dashR, deptsR, progsR, unitsR, staffR, studentsR] = await Promise.all([
        fetch('/api/admin/dashboard', { headers: h }),
        fetch('/api/admin/departments', { headers: h }),
        fetch('/api/admin/programs', { headers: h }),
        fetch('/api/admin/units', { headers: h }),
        fetch('/api/admin/staff', { headers: h }),
        fetch('/api/admin/students', { headers: h })
      ]);

      if (!dashR.ok) throw new Error('Could not fetch active school console parameters.');

      const dashData = await dashR.json();
      setSchoolData(dashData);
      setDepartments(await deptsR.json());
      setPrograms(await progsR.json());
      setUnits(await unitsR.json());
      setStaff(await staffR.json());
      setStudents(await studentsR.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchoolRecords();
  }, [token]);

  // Handle generic error response analyzer
  const handleActionResponse = async (resp: Response, successText: string) => {
    const data = await resp.json();
    if (!resp.ok) {
      throw new Error(data.error || 'Request processing failed inside database handler.');
    }
    setSuccessMsg(successText);
    setTimeout(() => setSuccessMsg(null), 4000);
    await loadSchoolRecords();
  };

  // Submit Department
  const handleAddDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptForm.name) return;
    setError(null);
    try {
      const resp = await fetch('/api/admin/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(deptForm)
      });
      await handleActionResponse(resp, `Department "${deptForm.name}" successfully created!`);
      setDeptForm({ name: '' });
      setShowAddDeptModal(false);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Submit Program
  const handleAddProg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!progForm.name) return;
    setError(null);
    try {
      const resp = await fetch('/api/admin/programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(progForm)
      });
      await handleActionResponse(resp, `Program "${progForm.name}" successfully built!`);
      setProgForm({ name: '', departmentId: '', code: '', capacity: '' });
      setShowAddProgModal(false);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Submit Course Unit
  const handleAddUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitForm.code || !unitForm.name) return;
    setError(null);
    try {
      const resp = await fetch('/api/admin/units', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(unitForm)
      });
      await handleActionResponse(resp, `Academic Unit ${unitForm.code.toUpperCase()} successfully registered!`);
      setUnitForm({ code: '', name: '', programId: '' });
      setShowAddUnitModal(false);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Submit Faculty Staff
  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffForm.name || !staffForm.email) return;
    setError(null);
    try {
      const resp = await fetch('/api/admin/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(staffForm)
      });
      await handleActionResponse(resp, `Academic staff member "${staffForm.name}" registered successfully.`);
      setStaffForm({ name: '', email: '', phone: '', role: 'Lecturer', departmentId: '' });
      setShowAddStaffModal(false);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Submit Student Manually
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentForm.name || !studentForm.email || !studentForm.regNumber) return;
    setError(null);
    try {
      const resp = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          ...studentForm,
          yearOfStudy: parseInt(studentForm.yearOfStudy, 10)
        })
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || 'Request processing failed inside database handler.');
      }
      setSuccessMsg(`Student "${studentForm.name}" registered in current registry.`);
      setTimeout(() => setSuccessMsg(null), 4000);

      if (data.parentCreated && data.parentCredentials) {
        setEnrolledStudentCredentials({
          studentName: studentForm.name,
          parentName: data.parentCredentials.name,
          parentEmail: data.parentCredentials.email,
          parentPhone: data.parentCredentials.phone,
          parentUsername: data.parentCredentials.username,
          parentPassword: data.parentCredentials.password
        });
      }

      setStudentForm({ name: '', email: '', phone: '', regNumber: 'AUTO_GENERATED', programId: '', yearOfStudy: '1', parentName:'', parentEmail:'', parentPhone:'', parentRelationship:'Parent' });
      setShowAddStudentModal(false);
      await loadSchoolRecords();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Set / Save edited student properties
  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    setError(null);
    try {
      const resp = await fetch(`/api/admin/students/${editingStudent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(editingStudent)
      });
      await handleActionResponse(resp, `Student profile "${editingStudent.name}" updated successfully.`);
      setEditingStudent(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Delete Student
  const handleDeleteStudent = async (studentId: string, name: string) => {
    if (!confirm(`Are you absolutely sure you want to permanently delete user record "${name}" from your school registers?`)) {
      return;
    }
    setError(null);
    try {
      const resp = await fetch(`/api/admin/students/${studentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      await handleActionResponse(resp, `Student record "${name}" removed from school directory.`);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Fast quick toggle Suspended / Active status
  const toggleStudentStatus = async (student: any) => {
    setError(null);
    const updatedStatus = student.status === 'active' ? 'suspended' : 'active';
    try {
      const resp = await fetch(`/api/admin/students/${student.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: updatedStatus })
      });
      await handleActionResponse(resp, `Student status successfully changed to "${updatedStatus}"`);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Filter students array based on search input
  const filteredStudents = students.filter(st => {
    const q = studentSearch.toLowerCase();
    return (
      st.name.toLowerCase().includes(q) ||
      st.email.toLowerCase().includes(q) ||
      st.regNumber.toLowerCase().includes(q)
    );
  });

  // Mobile/Phone Viewport Render Mode
  if (isPhoneFrame) {
    return (
      <div className="flex-1 bg-slate-50 flex flex-col h-full overflow-hidden relative text-slate-800 font-sans">
        {/* AppBar */}
        <div className="h-14 bg-indigo-600 text-white flex items-center justify-between px-4 shadow sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-full bg-indigo-750 font-mono text-xs font-bold flex items-center justify-center border border-indigo-500 text-white uppercase shrink-0">
              {schoolData?.school?.code || 'SC'}
            </div>
            <div className="min-w-0">
              <h1 className="text-xs font-bold tracking-tight truncate">{schoolData?.school?.name || 'School Admin'}</h1>
              <p className="text-[9px] text-indigo-200">Terminal Server</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button 
              onClick={() => {
                loadSchoolRecords();
                appendLog?.('[SYSTEM] Rebuilt system cache & database records.');
              }}
              className="p-1.5 hover:bg-indigo-700/60 rounded-full transition-all cursor-pointer"
            >
              <FileCheck2 className="h-3.5 w-3.5" />
            </button>
            <button 
              onClick={onLogout}
              className="p-1.5 hover:bg-indigo-700/60 rounded-full transition-all cursor-pointer text-red-105 btn shadow-none"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Scrollable Viewport Body */}
        <div className="flex-grow overflow-y-auto p-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-[10px] text-red-650 font-semibold flex items-center gap-1.5 leading-relaxed">
              <span>⚠️ {error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-[10px] text-emerald-650 font-semibold flex items-center gap-1.5 leading-relaxed">
              <span>✓ {successMsg}</span>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-400">
              <span className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-[9px] font-mono font-bold uppercase tracking-wider">Loading Datasets...</p>
            </div>
          ) : (
            <>
              {/* SUBTAB VIEW 1: DASHBOARD STATS */}
              {activeTab === 'dashboard' && (
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-indigo-650 to-indigo-805 rounded-2xl text-white shadow-xs relative overflow-hidden animate-fade">
                    <p className="text-[9px] font-mono text-indigo-200 uppercase tracking-wider font-bold">Operational Status</p>
                    <h3 className="text-sm font-bold font-sans mt-0.5">Faculty Active ({schoolData?.school?.code})</h3>
                    <p className="text-[10px] text-indigo-100 mt-1">Multi-tenant directories are synchronized with school databases.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-white border border-slate-205 rounded-xl shadow-xs">
                      <p className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-bold">Depts</p>
                      <h4 className="text-lg font-extrabold text-slate-800 mt-0.5">{departments.length}</h4>
                    </div>
                    <div className="p-3 bg-white border border-slate-205 rounded-xl shadow-xs">
                      <p className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-bold">Programs</p>
                      <h4 className="text-lg font-extrabold text-slate-800 mt-0.5">{programs.length}</h4>
                    </div>
                    <div className="p-3 bg-white border border-slate-205 rounded-xl shadow-xs">
                      <p className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-bold">Faculty Staff</p>
                      <h4 className="text-lg font-extrabold text-slate-800 mt-0.5">{staff.length}</h4>
                    </div>
                    <div className="p-3 bg-white border border-slate-205 rounded-xl shadow-xs">
                      <p className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-bold">Students</p>
                      <h4 className="text-lg font-extrabold text-slate-800 mt-0.5">{students.length}</h4>
                    </div>
                  </div>

                  <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2.5 shadow-xs">
                    <h4 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wide">Campus Overview</h4>
                    <div className="space-y-1 text-[11px] text-slate-600">
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span>Official Registrar:</span>
                        <span className="font-semibold text-slate-805 truncate ml-2 max-w-[150px]">{schoolData?.school?.email}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100 font-sans">
                        <span>Hotline:</span>
                        <span className="font-mono text-slate-800 font-bold">{schoolData?.school?.phone}</span>
                      </div>
                      <div className="flex justify-between py-1 font-sans">
                        <span>Local Time:</span>
                        <span className="font-mono text-indigo-600 font-bold">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SUBTAB VIEW 2: ACADEMICS VIEW */}
              {(activeTab === 'departments' || activeTab === 'programs' || activeTab === 'units') && (
                <div className="space-y-4 animate-fade">
                  {/* Internal top chip switch */}
                  <div className="flex gap-1.5 p-1 bg-slate-100 border border-slate-200 rounded-xl">
                    <button
                      onClick={() => {
                        setActiveTab('departments');
                        onTabChange?.('departments');
                      }}
                      className={`flex-1 py-1 text-[9px] font-mono font-bold tracking-wider rounded-lg transition-all cursor-pointer ${
                        activeTab === 'departments' ? 'bg-white text-indigo-755 shadow-xs font-extrabold' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      DEPTS
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('programs');
                        onTabChange?.('programs');
                      }}
                      className={`flex-1 py-1 text-[9px] font-mono font-bold tracking-wider rounded-lg transition-all cursor-pointer ${
                        activeTab === 'programs' ? 'bg-white text-indigo-755 shadow-xs font-extrabold' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      PROGRAMS
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('units');
                        onTabChange?.('units');
                      }}
                      className={`flex-1 py-1 text-[9px] font-mono font-bold tracking-wider rounded-lg transition-all cursor-pointer ${
                        activeTab === 'units' ? 'bg-white text-indigo-755 shadow-xs font-extrabold' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      UNITS
                    </button>
                  </div>

                  {/* DISPLAY DEPTS */}
                  {activeTab === 'departments' && (
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-500 uppercase tracking-widest font-mono text-[9px]">Departmental Units</span>
                        <button
                          onClick={() => {
                            setShowAddDeptModal(true);
                            appendLog?.('[DEBUG] BottomSheet request: register_dept_widget');
                          }}
                          className="text-[10px] font-bold text-indigo-650 hover:text-indigo-700 cursor-pointer flex items-center gap-1"
                        >
                          <Plus className="h-3 w-3" /> Add Dept
                        </button>
                      </div>
                      <div className="space-y-2">
                        {departments.map(dept => (
                          <div key={dept.id} className="p-3 bg-white border border-slate-205 rounded-xl shadow-xs flex justify-between items-center">
                            <div>
                              <h4 className="text-xs font-bold text-slate-800">{dept.name}</h4>
                            </div>
                            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                              Active
                            </span>
                          </div>
                        ))}
                        {departments.length === 0 && (
                          <p className="text-[10px] text-slate-400 text-center py-6">No primary departments register inside active indices.</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* DISPLAY PROGRAMS */}
                  {activeTab === 'programs' && (
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-500 uppercase tracking-widest font-mono text-[9px]">Degree Syllabuses</span>
                        <button
                          onClick={() => {
                            setShowAddProgModal(true);
                            appendLog?.('[DEBUG] BottomSheet request: register_prog_widget');
                          }}
                          className="text-[10px] font-bold text-indigo-650 hover:text-indigo-700 cursor-pointer flex items-center gap-1"
                        >
                          <Plus className="h-3 w-3" /> Add Program
                        </button>
                      </div>
                      <div className="space-y-2">
                        {programs.map(prog => (
                          <div key={prog.id} className="p-3 bg-white border border-slate-205 rounded-xl shadow-xs flex justify-between items-center">
                            <div>
                              <h4 className="text-xs font-bold text-slate-800 truncate max-w-[210px]">{prog.name}</h4>
                              <p className="text-[9px] font-mono text-slate-400 mt-0.5">Dept ID: {prog.departmentId || 'Unlinked'}</p>
                            </div>
                            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                              Active
                            </span>
                          </div>
                        ))}
                        {programs.length === 0 && (
                          <p className="text-[10px] text-slate-400 text-center py-6">No programs registered inside database.</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* DISPLAY UNITS */}
                  {activeTab === 'units' && (
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-500 uppercase tracking-widest font-mono text-[9px]">Lecture Subject Units</span>
                        <button
                          onClick={() => {
                            setShowAddUnitModal(true);
                            appendLog?.('[DEBUG] BottomSheet request: register_unit_widget');
                          }}
                          className="text-[10px] font-bold text-indigo-650 hover:text-indigo-700 cursor-pointer flex items-center gap-1"
                        >
                          <Plus className="h-3 w-3" /> Add Unit
                        </button>
                      </div>
                      <div className="space-y-2">
                        {units.map(unit => (
                          <div key={unit.id} className="p-3 bg-white border border-slate-205 rounded-xl shadow-xs flex justify-between items-center">
                            <div>
                              <span className="text-[8px] font-mono font-bold bg-indigo-50 border border-indigo-100 text-indigo-700 px-1 py-0.5 rounded uppercase">
                                {unit.code}
                              </span>
                              <h4 className="text-xs font-bold text-slate-800 mt-1 truncate max-w-[210px]">{unit.name}</h4>
                            </div>
                            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                              Active
                            </span>
                          </div>
                        ))}
                        {units.length === 0 && (
                          <p className="text-[10px] text-slate-400 text-center py-6">No subject course units registered inside campus database.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SUBTAB VIEW 3: STAFF ENROLMENT */}
              {activeTab === 'staff' && (
                <div className="space-y-3 animate-fade">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-500 uppercase tracking-widest font-mono text-[9px]">Registered Faculty Staff</span>
                    <button
                      onClick={() => {
                        setShowAddStaffModal(true);
                        appendLog?.('[DEBUG] BottomSheet request: register_staff_widget');
                      }}
                      className="text-[10px] font-bold text-indigo-650 hover:text-indigo-700 cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" /> Enrol Lecturer
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {staff.map(member => (
                      <div key={member.id} className="p-3 bg-white border border-slate-205 rounded-xl shadow-xs space-y-1.5">
                        <div className="flex justify-between items-center">
                          <h4 className="text-xs font-extrabold text-slate-800">{member.name}</h4>
                          <span className="text-[8px] font-mono font-bold bg-slate-100 border border-slate-220 text-slate-650 px-1.5 rounded uppercase">
                            {member.registrationNumber || 'Staff ID'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-450 font-mono truncate">{member.email}</p>
                        <div className="flex justify-between items-center pt-1.5 border-t border-slate-100 text-[9px] text-slate-500">
                          <span>Role: {member.role || 'Lecturer'}</span>
                          <span className="text-[9px] font-mono font-bold text-slate-400 uppercase bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                            Active Scoped
                          </span>
                        </div>
                      </div>
                    ))}
                    {staff.length === 0 && (
                      <p className="text-[10px] text-slate-400 text-center py-6">No faculty staff registers found.</p>
                    )}
                  </div>
                </div>
              )}

              {/* SUBTAB VIEW 4: STUDENT ROSTER */}
              {activeTab === 'students' && (
                <div className="space-y-3 animate-fade">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-500 uppercase tracking-widest font-mono text-[9px]">Active Student Directory</span>
                    <button
                      onClick={() => {
                        setShowAddStudentModal(true);
                        appendLog?.('[DEBUG] BottomSheet request: register_student_widget');
                      }}
                      className="text-[10px] font-bold text-indigo-650 hover:text-indigo-700 cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" /> Register Student
                    </button>
                  </div>

                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      className="block w-full py-1.5 pl-9 pr-3 bg-white border border-slate-205 text-[11px] rounded-lg outline-none font-sans"
                      placeholder="Search name, code, email..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2.5">
                    {filteredStudents.map(student => (
                      <div key={student.id} className="p-3 bg-white border border-slate-205 rounded-xl shadow-xs space-y-1.5">
                        <div className="flex justify-between items-center">
                          <h4 className="text-xs font-extrabold text-slate-800">{student.name}</h4>
                          <span className="text-[8px] font-mono font-bold bg-indigo-50 border border-indigo-100 text-indigo-700 px-1.5 rounded uppercase">
                            {student.regNumber}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-450 font-mono truncate">{student.email}</p>
                        <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-[10px]">
                          <button
                            onClick={() => {
                              toggleStudentStatus(student);
                              appendLog?.(`[DEBUG] Toggle profile lock state for registration: ${student.regNumber}`);
                            }}
                            className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                              student.status === 'active'
                                ? 'bg-emerald-50 text-emerald-650 border border-emerald-150'
                                : 'bg-red-50 text-red-650 border border-red-155'
                            }`}
                          >
                            {student.status || 'Active'}
                          </button>
                          <button
                            onClick={() => {
                              handleDeleteStudent(student.id, student.name);
                              appendLog?.(`[DEBUG] Delete user key profile: student ID "${student.id}"`);
                            }}
                            className="text-red-500 hover:text-red-750 transition-all cursor-pointer font-bold text-[9px]"
                          >
                            Unregister
                          </button>
                        </div>
                      </div>
                    ))}
                    {filteredStudents.length === 0 && (
                      <p className="text-[10px] text-slate-405 text-center py-6">No student profiles match query filter.</p>
                    )}
                  </div>
                </div>
              )}

              {/* SUBTAB VIEW 5: CONFIG SETTINGS */}
              {activeTab === 'settings' && (
                <div className="space-y-4 animate-fade">
                  <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-500">School Level Configs</h3>
                  <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3.5 shadow-xs text-xs">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-slate-800">Enrollment Gate status</h4>
                        <p className="text-[9px] text-slate-450">Toggles student profile registration permission.</p>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded text-indigo-655 focus:ring-indigo-500/20" />
                    </div>
                    <div className="flex justify-between items-center pt-3.5 border-t border-slate-100">
                      <div>
                        <h4 className="font-bold text-slate-800">SmartCampus X VM Linkage</h4>
                        <p className="text-[9px] text-slate-450">Links campus databases with top-tier multi-clusters.</p>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded text-indigo-655 focus:ring-indigo-500/20" />
                    </div>
                  </div>
                </div>
              )}

              {/* SUBTAB VIEW: TEMPLATE LIBRARY */}
              {activeTab === 'template_library' && (
                <div className="space-y-4 animate-fade">
                  <AdminTemplateLibrary token={token} appendLog={appendLog} />
                </div>
              )}

              {/* SUBTAB VIEW: DYNAMIC ENTITIES */}
              {activeTab === 'dynamic_entities' && (
                <div className="space-y-4 animate-fade">
                  <AdminDynamicEntities 
                      token={token} 
                      hierarchy={user?.school?.hierarchy || []} 
                      appendLog={appendLog} 
                  />
                </div>
              )}

              {/* SUBTAB VIEW: MARKETPLACE */}
              {activeTab === 'workflow_engine' && (
                <div className="space-y-4 animate-fade">
                  <AdminWorkflowEngine token={token} />
                </div>
              )}
            </>
          )}
        </div>

        {/* Dynamic Contextual Floating Action Button (FAB) */}
        {activeTab === 'departments' && !loading && (
          <button
            onClick={() => {
              setShowAddDeptModal(true);
              appendLog?.('[DEBUG] Pressed FAB -> Open Add Department Modal');
            }}
            className="absolute bottom-16 right-5 w-12 h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-lg shadow-indigo-500/30 flex items-center justify-center transition-all cursor-pointer z-25"
          >
            <Plus className="h-6 w-6" />
          </button>
        )}

        {/* Bottom Bar */}
        <div className="h-[52px] bg-slate-900 border-t border-slate-800 flex items-center justify-around px-2 z-30 shrink-0 select-none">
          <button
            onClick={() => {
              setActiveTab('dashboard');
              onTabChange?.('dashboard');
            }}
            className={`flex flex-col items-center gap-0.5 transition-all text-[9.5px] cursor-pointer font-bold uppercase tracking-wider ${
              activeTab === 'dashboard' ? 'text-indigo-400 shadow-xs scale-105' : 'text-slate-500 hover:text-slate-350'
            }`}
          >
            <span>•</span><span>Main</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('departments');
              onTabChange?.('departments');
            }}
            className={`flex flex-col items-center gap-0.5 transition-all text-[9.5px] cursor-pointer font-bold uppercase tracking-wider ${
              (activeTab === 'departments' || activeTab === 'programs' || activeTab === 'units') ? 'text-indigo-400 shadow-xs scale-105' : 'text-slate-500 hover:text-slate-355'
            }`}
          >
            <span>•</span><span>Academics</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('staff');
              onTabChange?.('staff');
            }}
            className={`flex flex-col items-center gap-0.5 transition-all text-[9.5px] cursor-pointer font-bold uppercase tracking-wider ${
              activeTab === 'staff' ? 'text-indigo-400 shadow-xs scale-105' : 'text-slate-500 hover:text-slate-355'
            }`}
          >
            <span>•</span><span>Staff</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('students');
              onTabChange?.('students');
            }}
            className={`flex flex-col items-center gap-0.5 transition-all text-[9.5px] cursor-pointer font-bold uppercase tracking-wider ${
              activeTab === 'students' ? 'text-indigo-400 shadow-xs scale-105' : 'text-slate-500 hover:text-slate-355'
            }`}
          >
            <span>•</span><span>Students</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('settings');
              onTabChange?.('settings');
            }}
            className={`flex flex-col items-center gap-0.5 transition-all text-[9.5px] cursor-pointer font-bold uppercase tracking-wider ${
              activeTab === 'settings' ? 'text-indigo-400 shadow-xs scale-105' : 'text-slate-500 hover:text-slate-355'
            }`}
          >
            <span>•</span><span>Panel</span>
          </button>
        </div>

        {/* MODAL BOTTOMSHEET FORM OVERLAYS FOR MOBILE */}
        <AnimatePresence>
          {showAddDeptModal && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex md:items-end justify-center z-45 p-4">
              <motion.div 
                initial={{ y: 150, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 150, opacity: 0 }}
                className="bg-white rounded-2xl w-full max-w-sm border border-slate-200 shadow-2xl p-5 mt-auto flex flex-col gap-4 text-left font-sans"
              >
                <div className="flex justify-between items-center text-sans">
                  <h4 className="text-xs font-bold uppercase font-mono tracking-widest text-slate-800">Add Faculty Dept</h4>
                  <button onClick={() => setShowAddDeptModal(false)} className="text-slate-400 hover:text-slate-655 text-xs font-mono font-bold">CLOSE</button>
                </div>
                <form onSubmit={handleAddDept} className="space-y-3.5">
                  <div>
                    <label className="block text-[8px] font-bold text-slate-450 uppercase tracking-widest font-mono mb-1">Department Name</label>
                    <input 
                      required
                      type="text"
                      className="block w-full py-1.5 px-2 bg-slate-100 border border-slate-200 text-xs rounded outline-none" 
                      placeholder="e.g. Department of Mechanical Engineering"
                      value={deptForm.name}
                      onChange={(e) => setDeptForm({ name: e.target.value })}
                    />
                  </div>
                  <button type="submit" className="w-full py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded text-xs font-bold shadow-md shadow-indigo-100 cursor-pointer">
                    Provision Department
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showAddProgModal && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex md:items-end justify-center z-45 p-4 animate-fade">
              <motion.div 
                initial={{ y: 150, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 150, opacity: 0 }}
                className="bg-white rounded-2xl w-full max-w-sm border border-slate-200 shadow-2xl p-5 mt-auto flex flex-col gap-4 text-left font-sans"
              >
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold uppercase font-mono tracking-widest text-slate-800">Create Academic Program</h4>
                  <button onClick={() => setShowAddProgModal(false)} className="text-slate-400 hover:text-slate-655 text-xs font-mono font-bold">CLOSE</button>
                </div>
                <form onSubmit={handleAddProg} className="space-y-3.5">
                  <div>
                    <label className="block text-[8px] font-bold text-slate-450 uppercase tracking-widest font-mono mb-1">Program Label Name</label>
                    <input 
                      required
                      type="text"
                      className="block w-full py-1.5 px-2 bg-slate-100 border border-slate-200 text-xs rounded outline-none" 
                      placeholder="e.g. Bachelor of Science in Civil Engineering"
                      value={progForm.name}
                      onChange={(e) => setProgForm({ ...progForm, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-bold text-slate-455 uppercase tracking-widest font-mono mb-1">Target Department</label>
                    <select 
                      required
                      className="block w-full py-1.5 px-2 bg-slate-100 border border-slate-200 text-xs rounded outline-none bg-white font-semibold" 
                      value={progForm.departmentId}
                      onChange={(e) => setProgForm({ ...progForm, departmentId: e.target.value })}
                    >
                      <option value="">-- Choose target department --</option>
                      {departments.map(dt => (
                        <option key={dt.id} value={dt.id}>{dt.name}</option>
                      ))}
                    </select>
                  </div>
                  <button type="submit" className="w-full py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded text-xs font-bold shadow-md shadow-indigo-105 cursor-pointer">
                    Install Syllabus Key
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showAddUnitModal && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex md:items-end justify-center z-45 p-4">
              <motion.div 
                initial={{ y: 150, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 150, opacity: 0 }}
                className="bg-white rounded-2xl w-full max-w-sm border border-slate-205 shadow-2xl p-5 mt-auto flex flex-col gap-4 text-left font-sans"
              >
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold uppercase font-mono tracking-widest text-slate-800">Add Subjects Lecture Unit</h4>
                  <button onClick={() => setShowAddUnitModal(false)} className="text-slate-400 hover:text-slate-655 text-xs font-mono font-bold">CLOSE</button>
                </div>
                <form onSubmit={handleAddUnit} className="space-y-3.5">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1">
                      <label className="block text-[8px] font-bold text-slate-450 uppercase tracking-widest font-mono mb-1">Unit Code</label>
                      <input 
                        required
                        type="text"
                        className="block w-full py-1.5 px-2 bg-slate-100 border border-slate-200 text-xs rounded outline-none font-mono font-bold uppercase placeholder:lowercase" 
                        placeholder="cs-301"
                        value={unitForm.code}
                        onChange={(e) => setUnitForm({ ...unitForm, code: e.target.value })}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[8px] font-bold text-slate-450 uppercase tracking-widest font-mono mb-1">Unit Legal Title</label>
                      <input 
                        required
                        type="text"
                        className="block w-full py-1.5 px-2 bg-slate-100 border border-slate-200 text-xs rounded outline-none" 
                        placeholder="e.g. Artificial Intelligence basics"
                        value={unitForm.name}
                        onChange={(e) => setUnitForm({ ...unitForm, name: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[8px] font-bold text-slate-455 uppercase tracking-widest font-mono mb-1">Target Syllabus Program</label>
                    <select 
                      required
                      className="block w-full py-1.5 px-2 bg-slate-100 border border-slate-200 text-xs rounded outline-none bg-white font-semibold" 
                      value={unitForm.programId}
                      onChange={(e) => setUnitForm({ ...unitForm, programId: e.target.value })}
                    >
                      <option value="">-- Choose Syllabus Program --</option>
                      {programs.map(pr => (
                        <option key={pr.id} value={pr.id}>{pr.name}</option>
                      ))}
                    </select>
                  </div>
                  <button type="submit" className="w-full py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded text-xs font-bold shadow-md shadow-indigo-100 cursor-pointer">
                    Install Lecture Unit
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showAddStaffModal && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex md:items-end justify-center z-45 p-4">
              <motion.div 
                initial={{ y: 150, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 150, opacity: 0 }}
                className="bg-white rounded-2xl w-full max-w-sm border border-slate-200 shadow-2xl p-5 mt-auto flex flex-col gap-4 text-left font-sans"
              >
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold uppercase font-mono tracking-widest text-slate-800">Enroll Faculty Lecturer</h4>
                  <button onClick={() => setShowAddStaffModal(false)} className="text-slate-400 hover:text-slate-655 text-xs font-mono font-bold">CLOSE</button>
                </div>
                <form onSubmit={handleAddStaff} className="space-y-3.5">
                  <div>
                    <label className="block text-[8px] font-bold text-slate-450 uppercase tracking-widest font-mono mb-1">Full Name</label>
                    <input 
                      required
                      type="text"
                      className="block w-full py-1.5 px-2 bg-slate-100 border border-slate-200 text-xs rounded outline-none" 
                      placeholder="e.g. Professor Richard Feynman"
                      value={staffForm.name}
                      onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-bold text-slate-450 uppercase tracking-widest font-mono mb-1">Enrolment ID</label>
                    <input 
                      required
                      type="text"
                      className="block w-full py-1.5 px-2 bg-slate-100 border border-slate-200 text-xs rounded outline-none font-mono font-bold" 
                      placeholder="e.g. STAFF-503"
                      value={staffForm.registrationNumber}
                      onChange={(e) => setStaffForm({ ...staffForm, registrationNumber: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[8px] font-bold text-slate-450 uppercase tracking-widest font-mono mb-1">Lecturer Email</label>
                      <input 
                        required
                        type="email"
                        className="block w-full py-1.5 px-2 bg-slate-100 border border-slate-200 text-xs rounded outline-none" 
                        placeholder="lecturer@campus"
                        value={staffForm.email}
                        onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-bold text-slate-450 uppercase tracking-widest font-mono mb-1">Staff Phone</label>
                      <input 
                        type="text"
                        className="block w-full py-1.5 px-2 bg-slate-100 border border-slate-200 text-xs rounded outline-none font-mono" 
                        placeholder="+1"
                        value={staffForm.phone}
                        onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                      />
                    </div>
                  </div>
                  <button type="submit" className="w-full py-2 bg-indigo-650 hover:bg-indigo-705 text-white rounded text-xs font-bold shadow-md shadow-indigo-100 cursor-pointer">
                    Install Lecturer Credentials
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showAddStudentModal && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex md:items-end justify-center z-45 p-4">
              <motion.div 
                initial={{ y: 150, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 150, opacity: 0 }}
                className="bg-white rounded-2xl w-full max-w-sm border border-slate-200 shadow-2xl p-5 mt-auto flex flex-col gap-4 text-left font-sans"
              >
                <div className="flex justify-between items-center animate-fade">
                  <h4 className="text-xs font-bold uppercase font-mono tracking-widest text-slate-800">Register Campus Student</h4>
                  <button onClick={() => setShowAddStudentModal(false)} className="text-slate-400 hover:text-slate-655 text-xs font-mono font-bold">CLOSE</button>
                </div>
                <form onSubmit={handleAddStudent} className="space-y-3.5">
                  <div>
                    <label className="block text-[8px] font-bold text-slate-450 uppercase tracking-widest font-mono mb-1">Full Legal Name</label>
                    <input 
                      required
                      type="text"
                      className="block w-full py-1.5 px-2 bg-slate-100 border border-slate-200 text-xs rounded outline-none" 
                      placeholder="e.g. John Doe Junior"
                      value={studentForm.name}
                      onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-bold text-slate-450 uppercase tracking-widest font-mono mb-1">Registration Index Number</label>
                    <input 
                      disabled
                      type="text"
                      className="block w-full py-1.5 px-2 bg-slate-105 border border-slate-200 text-[11px] rounded outline-none font-mono font-bold text-slate-400 cursor-not-allowed select-none" 
                      value="[AUTO-GENERATED ON SAVE]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 animate-fade">
                    <div>
                      <label className="block text-[8px] font-bold text-slate-450 uppercase tracking-widest font-mono mb-1">Student Email Address</label>
                      <input 
                        required
                        type="email"
                        className="block w-full py-1.5 px-2 bg-slate-100 border border-slate-200 text-xs rounded outline-none" 
                        placeholder="student@campus"
                        value={studentForm.email}
                        onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-bold text-slate-450 uppercase tracking-widest font-mono mb-1">Emergency Phone</label>
                      <input 
                        type="text"
                        className="block w-full py-1.5 px-2 bg-slate-100 border border-slate-200 text-xs rounded outline-none font-mono" 
                        placeholder="+1"
                        value={studentForm.phone}
                        onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                      />
                    </div>
                  </div>
                  <button type="submit" className="w-full py-2 bg-indigo-650 hover:bg-indigo-705 text-white rounded text-xs font-bold shadow-md shadow-indigo-100 cursor-pointer">
                    Install Student Credentials
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      
      {/* School Administrator Sidebar elements */}
      <aside className="w-64 bg-slate-900 flex flex-col justify-between border-r border-slate-800 flex-shrink-0">
        <div>
          <div className="h-20 flex items-center px-6 border-b border-slate-800">
            <div className="w-8 h-8 bg-indigo-500 rounded flex items-center justify-center mr-3 shadow-sm shadow-indigo-500/40">
              <div className="w-4 h-4 border-2 border-white transform rotate-45"></div>
            </div>
            <div className="overflow-hidden min-w-0">
              <span className="text-white font-bold tracking-tight text-sm block truncate">
                {schoolData?.school?.name || 'SmartCampus'}
              </span>
              <span className="text-[9px] text-indigo-400 font-mono block tracking-widest uppercase font-bold">
                {schoolData?.school?.code || 'NHS001'}
              </span>
            </div>
          </div>

          <div className="py-6">
            <div className="px-6 mb-4">
              <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest font-mono">Main Menu</p>
            </div>
            <nav className="space-y-1 px-3">
              <button
                onClick={() => { setActiveTab('dashboard'); setError(null); }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded transition-colors text-xs font-semibold cursor-pointer ${
                  activeTab === 'dashboard' 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <Layers className="h-4.5 w-4.5 opacity-90" />
                <span>School Overview</span>
              </button>
              <button
                onClick={() => { setActiveTab('departments'); setError(null); }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded transition-colors text-xs font-semibold cursor-pointer ${
                  activeTab === 'departments' 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <Sliders className="h-4.5 w-4.5 opacity-90" />
                <span>{getTerm('department', 'Department')}s</span>
              </button>
              <button
                onClick={() => { setActiveTab('template_library'); setError(null); }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded transition-colors text-xs font-semibold cursor-pointer ${
                  activeTab === 'template_library' 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <BookOpen className="h-4.5 w-4.5 opacity-90 text-green-400" />
                <span>Template Library</span>
              </button>
              <button
                onClick={() => { setActiveTab('dynamic_entities'); setError(null); }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded transition-colors text-xs font-semibold cursor-pointer ${
                  activeTab === 'dynamic_entities' 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <Database className="h-4.5 w-4.5 opacity-90 text-sky-400" />
                <span>Entity Manager</span>
              </button>
              <button
                onClick={() => { setActiveTab('workflow_engine'); setError(null); }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded transition-colors text-xs font-semibold cursor-pointer ${
                  activeTab === 'workflow_engine' 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <Play className="h-4.5 w-4.5 opacity-90 text-purple-400" />
                <span>Workflow Engine</span>
              </button>

              <div className="px-3 pt-6 pb-2">
                <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest font-mono">Registry Directories</p>
              </div>

              <button
                onClick={() => { setActiveTab('staff'); setError(null); }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded transition-colors text-xs font-semibold cursor-pointer ${
                  activeTab === 'staff' 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <UserSquare2 className="h-4.5 w-4.5 opacity-90" />
                <span>{getTerm('lecturer', 'Lecturer')} Directory</span>
              </button>

              <button
                id="school-students-tab"
                onClick={() => { setActiveTab('students'); setError(null); }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded transition-colors text-xs font-semibold cursor-pointer ${
                  activeTab === 'students' 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <Users className="h-4.5 w-4.5 opacity-90" />
                <span>{getTerm('student', 'Student')} Registry</span>
              </button>

              <button
                id="school-parents-tab"
                onClick={() => { setActiveTab('parents'); setError(null); }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded transition-colors text-xs font-semibold cursor-pointer ${
                  activeTab === 'parents' 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <Users className="h-4.5 w-4.5 opacity-90 text-rose-450" />
                <span>Parent Management</span>
              </button>

              <div className="px-3 pt-6 pb-2">
                <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest font-mono">Academic Management</p>
              </div>

              <button
                id="school-programs-tab"
                onClick={() => { setActiveTab('programs'); setError(null); }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded transition-colors text-xs font-semibold cursor-pointer ${
                  activeTab === 'programs' 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <GraduationCap className="h-4.5 w-4.5 opacity-90" />
                <span>{getTerm('program', 'Program')}s</span>
              </button>

              <button
                id="school-units-tab"
                onClick={() => { setActiveTab('units'); setError(null); }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded transition-colors text-xs font-semibold cursor-pointer ${
                  activeTab === 'units' 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <BookOpen className="h-4.5 w-4.5 opacity-90" />
                <span>{getTerm('unit', 'Unit')}s</span>
              </button>

              {isModuleActive('lecturerAllocation') && (
                <button
                  id="school-allocation-tab"
                  onClick={() => { setActiveTab('allocation'); setError(null); }}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded transition-colors text-xs font-semibold cursor-pointer ${
                    activeTab === 'allocation' 
                      ? 'bg-indigo-600 text-white shadow-sm' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <UserSquare2 className="h-4.5 w-4.5 opacity-90" />
                  <span>Teaching Assignments</span>
                </button>
              )}

              {isModuleActive('timetableEngine') && (
                <button
                  id="school-timetable-tab"
                  onClick={() => { setActiveTab('timetable'); setError(null); }}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded transition-colors text-xs font-semibold cursor-pointer ${
                    activeTab === 'timetable' 
                      ? 'bg-indigo-600 text-white shadow-sm' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <Hash className="h-4.5 w-4.5 opacity-90" />
                  <span>Timetables</span>
                </button>
              )}

              <button
                id="school-exams-tab"
                onClick={() => { setActiveTab('exams' as any); setError(null); }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded transition-colors text-xs font-semibold cursor-pointer ${
                  activeTab === 'exams' as any
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <GraduationCap className="h-4.5 w-4.5 opacity-90" />
                <span>Examinations</span>
              </button>

              <button
                id="school-results-tab"
                onClick={() => { setActiveTab('exams' as any); setError(null); }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded transition-colors text-xs font-semibold cursor-pointer ${
                  activeTab === 'exams' as any
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <FileCheck2 className="h-4.5 w-4.5 opacity-90" />
                <span>Results & Transcripts</span>
              </button>

              {isModuleActive('academicPeriods') && (
                <button
                  id="school-timeline-tab"
                  onClick={() => { setActiveTab('timeline'); setError(null); }}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded transition-colors text-xs font-semibold cursor-pointer ${
                    activeTab === 'timeline' 
                      ? 'bg-indigo-600 text-white shadow-sm' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <Calendar className="h-4.5 w-4.5 opacity-90" />
                  <span>{getTerm('semester', 'Semester')} Setup</span>
                </button>
              )}

              {isModuleActive('curriculumMapping') && (
                <button
                  id="school-curriculum-tab"
                  onClick={() => { setActiveTab('curriculum'); setError(null); }}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded transition-colors text-xs font-semibold cursor-pointer ${
                    activeTab === 'curriculum' 
                      ? 'bg-indigo-600 text-white shadow-sm' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <BookOpen className="h-4.5 w-4.5 opacity-90" />
                  <span>Syllabus Mapping</span>
                </button>
              )}

              <button
                id="school-finance-tab"
                onClick={() => { setActiveTab('finance'); setError(null); }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded transition-colors text-xs font-semibold cursor-pointer border border-emerald-500/20 mt-1 ${
                  activeTab === 'finance' 
                    ? 'bg-emerald-600 text-white shadow-sm' 
                    : 'bg-emerald-900/20 text-emerald-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <Wallet className="h-4.5 w-4.5 opacity-90" />
                <span className="truncate">Phase 4: Finance</span>
              </button>

              {isModuleActive('libraries') && (
                <button
                  id="school-library-tab"
                  onClick={() => { setActiveTab('library' as any); setError(null); }}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded transition-colors text-xs font-semibold cursor-pointer border border-indigo-500/20 mt-1 ${
                    activeTab === 'library' as any
                      ? 'bg-indigo-600 text-white shadow-sm' 
                      : 'bg-indigo-900/20 text-indigo-400 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <BookOpen className="h-4.5 w-4.5 opacity-90" />
                  <span className="truncate">Phase 7: Library Manager</span>
                </button>
              )}

              {(isModuleActive('hostels') || isModuleActive('transport') || isModuleActive('welfareSupport')) && (
                <button
                  id="school-campus-life-tab"
                  onClick={() => { setActiveTab('campus_life' as any); setError(null); }}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded transition-colors text-xs font-semibold cursor-pointer border border-indigo-500/20 mt-1 ${
                    activeTab === 'campus_life' as any
                      ? 'bg-indigo-600 text-white shadow-sm' 
                      : 'bg-indigo-900/20 text-indigo-400 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <Compass className="h-4.5 w-4.5 opacity-90" />
                  <span className="truncate">Phase 8: Campus Life</span>
                </button>
              )}

              {isModuleActive('hrPayroll') && (
                <button
                  id="school-hr-management-tab"
                  onClick={() => { setActiveTab('hr_management'); setError(null); }}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded transition-colors text-xs font-semibold cursor-pointer border border-indigo-500/30 mt-1 ${
                    activeTab === 'hr_management' 
                      ? 'bg-indigo-600 text-white shadow-sm' 
                      : 'bg-indigo-900/20 text-indigo-400 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <Users className="h-4.5 w-4.5 opacity-90" />
                  <span className="truncate">Phase 9: HR & Workforce</span>
                </button>
              )}

              {isModuleActive('procurementInventory') && (
                <button
                  id="school-procurement-assets-tab"
                  onClick={() => { setActiveTab('procurement_assets'); setError(null); }}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded transition-colors text-xs font-semibold cursor-pointer border border-indigo-500/30 mt-1 ${
                    activeTab === 'procurement_assets' 
                      ? 'bg-indigo-600 text-white shadow-sm' 
                      : 'bg-indigo-900/20 text-indigo-400 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <Boxes className="h-4.5 w-4.5 opacity-90" />
                  <span className="truncate">Phase 10: Procurement & ERP</span>
                </button>
              )}

              <button
                id="school-documents-tab"
                onClick={() => { setActiveTab('documents' as any); setError(null); }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded transition-colors text-xs font-semibold cursor-pointer border border-indigo-500/30 mt-1 ${
                  activeTab === 'documents' 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'bg-indigo-900/20 text-indigo-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <FileCheck2 className="h-4.5 w-4.5 opacity-90" />
                <span className="truncate">Phase 11.7: Real Document Engine</span>
              </button>

              <div className="px-3 pt-6 pb-2">
                <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest font-mono font-bold">System Config</p>
              </div>

              <button
                id="school-state-machine-tab"
                onClick={() => { setActiveTab('state_machine'); setError(null); }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded transition-colors text-xs font-semibold cursor-pointer mb-1 ${
                  activeTab === 'state_machine' 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <GraduationCap className="h-4 w-4 opacity-90" />
                <span>Lifecycle State Machine</span>
              </button>

              <button
                id="school-system-control-tab"
                onClick={() => { setActiveTab('system_control'); setError(null); }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded transition-colors text-xs font-semibold cursor-pointer mb-1 ${
                  activeTab === 'system_control' 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <Sliders className="h-4 w-4 opacity-90" />
                <span>UOS Control Panel & Bus</span>
              </button>

              <button
                id="school-communications-tab"
                onClick={() => { setActiveTab('communications'); setError(null); }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded transition-colors text-xs font-semibold cursor-pointer mb-1 ${
                  activeTab === 'communications' 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <MessageSquare className="h-4 w-4 opacity-90 text-emerald-400" />
                <span>Comms & Broadcasts</span>
              </button>

              <button
                id="school-system-health-tab"
                onClick={() => { setActiveTab('system_health'); setError(null); }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded transition-colors text-xs font-semibold cursor-pointer mb-1 ${
                  activeTab === 'system_health' 
                    ? 'bg-rose-600/90 text-white shadow-sm font-extrabold' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <HeartPulse className="h-4 w-4 opacity-90 text-rose-400" />
                <span>System Integrity Scan</span>
              </button>

              <button
                onClick={() => { setActiveTab('settings'); setError(null); }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded transition-colors text-xs font-semibold cursor-pointer mb-1 ${
                  activeTab === 'settings' 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <Settings className="h-4.5 w-4.5 opacity-90" />
                <span>Console Preferences</span>
              </button>

              <button
                id="school-admin-profile-tab"
                onClick={() => { setActiveTab('profile'); setError(null); }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded transition-colors text-xs font-semibold cursor-pointer ${
                  activeTab === 'profile' 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <User className="h-4 w-4 opacity-100 text-[#a855f7]" />
                <span>My Profile</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Operating Tenant profile details */}
        <div className="p-6 border-t border-slate-800">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center border border-slate-600 text-xs font-bold text-indigo-400 font-mono">
              OP
            </div>
            <div className="overflow-hidden min-w-0">
              <span className="text-sm text-white font-medium block truncate">{user.name}</span>
              <span className="text-[10px] text-slate-500 block truncate">{user.email}</span>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center space-x-2 py-2 text-xs font-semibold text-slate-400 hover:text-rose-400 border border-slate-700 rounded transition-colors cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Terminate Session</span>
          </button>
        </div>
      </aside>

      {/* Main Container Viewport */}
      <main className="flex-grow flex flex-col overflow-y-auto">
        
        {/* Dynamic Context Header */}
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex justify-between items-center flex-shrink-0">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">
              {schoolData?.school?.name || 'Multi-Tenant Portal'}
            </span>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 capitalize mt-0.5">{activeTab} Workspace</h1>
          </div>
          
          <div className="flex items-center space-x-3">
            {activeTab === 'departments' && (
              <button onClick={() => setShowAddDeptModal(true)} className="px-4 py-2 bg-indigo-600 text-white rounded text-xs font-semibold shadow-md shadow-indigo-100 hover:bg-indigo-700 transition-all cursor-pointer flex items-center gap-1.5 font-sans">
                <Plus className="h-3.5 w-3.5" /> <span>Add Department</span>
              </button>
            )}
            {activeTab === 'programs' && (
              <button onClick={() => setShowAddProgModal(true)} className="px-4 py-2 bg-indigo-600 text-white rounded text-xs font-semibold shadow-md shadow-indigo-100 hover:bg-indigo-700 transition-all cursor-pointer flex items-center gap-1.5 font-sans">
                <Plus className="h-3.5 w-3.5" /> <span>Add Program</span>
              </button>
            )}
            {activeTab === 'units' && (
              <button id="add-unit-button-trigger" onClick={() => setShowAddUnitModal(true)} className="px-4 py-2 bg-indigo-600 text-white rounded text-xs font-semibold shadow-md shadow-indigo-100 hover:bg-indigo-700 transition-all cursor-pointer flex items-center gap-1.5 font-sans">
                <Plus className="h-3.5 w-3.5" /> <span>Add Unit</span>
              </button>
            )}
            {activeTab === 'staff' && (
              <button onClick={() => setShowAddStaffModal(true)} className="px-4 py-2 bg-indigo-600 text-white rounded text-xs font-semibold shadow-md shadow-indigo-100 hover:bg-indigo-700 transition-all cursor-pointer flex items-center gap-1.5 font-sans">
                <Plus className="h-3.5 w-3.5" /> <span>Register Staff</span>
              </button>
            )}
            {activeTab === 'students' && (
              <button id="add-student-btn-trigger" onClick={() => setShowAddStudentModal(true)} className="px-4 py-2 bg-indigo-600 text-white rounded text-xs font-semibold shadow-md shadow-indigo-100 hover:bg-indigo-700 transition-all cursor-pointer flex items-center gap-1.5 font-sans">
                <Plus className="h-3.5 w-3.5" /> <span>Enroll Student Manually</span>
              </button>
            )}
          </div>
        </header>

        {/* Global Notifications system */}
        <div className="max-w-7xl w-full mx-auto px-8 mt-6">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="bg-red-50 border border-red-100 rounded-2xl p-4 text-xs text-red-600 flex items-start gap-3"
              >
                <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-bold">System Warning Alert</span>
                  <p className="mt-0.5">{error}</p>
                </div>
              </motion.div>
            )}

            {successMsg && (
              <motion.div 
                id="success-toast-notification"
                initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="bg-emerald-55/65 border border-emerald-150 rounded-2xl p-4 text-xs text-emerald-800 flex items-start gap-3"
              >
                <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0 text-emerald-600" />
                <div>
                  <span className="font-bold">Database Persistence synchronized</span>
                  <p className="mt-0.5">{successMsg}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tab workspace implementations */}
        <div className="p-8 max-w-7xl w-full mx-auto flex-1">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-4 border-slate-350 border-t-slate-900 rounded-full animate-spin" />
              <p className="text-xs text-slate-550 font-mono">Synchronizing state tables from {schoolData?.school?.code} partition...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: DASHBOARD LANDING */}
              {activeTab === 'dashboard' && schoolData && (
                <div className="space-y-8">
                  {/* Beautiful campus greeting */}
                  <div className="bg-slate-900 text-white rounded-xl p-8 relative overflow-hidden shadow-lg shadow-slate-200">
                    <span className="px-3 py-1 bg-slate-800 rounded-full text-[10px] font-mono tracking-widest text-indigo-400 border border-slate-700">
                      CAMPUS OPERATION CONSOLE
                    </span>
                    <h2 className="text-3xl font-light tracking-tight mt-4">
                      Welcome Back, Academic Administrator
                    </h2>
                    <h3 className="text-xl font-bold font-sans text-indigo-450 mt-1">
                      {schoolData?.school?.name}
                    </h3>
                    <p className="text-slate-400 text-xs max-w-xl mt-2 leading-relaxed">
                      You are in control of your campus's isolations. Easily build academic departments, programs, course rosters, generate teacher profiles, and process student enrollment records.
                    </p>
                  </div>

                  {/* Phase 11.5 Executive Command Center widgets */}
                  <div className="space-y-6">
                     <h4 className="text-xs font-bold text-slate-400 font-mono tracking-wider text-center uppercase divider">Phase 11.5 Executive Command Center</h4>
                     
                     <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Live Revenue Widget */}
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-indigo-300 transition-colors">
                           <div className="flex items-center gap-2 mb-2">
                              <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg"><Wallet className="h-4 w-4" /></div>
                              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Revenue</span>
                           </div>
                           <p className="text-2xl font-black text-emerald-600 mt-1">KES 14.5M</p>
                           <p className="text-[9px] text-slate-400 mt-1">+12% from last quarter</p>
                        </div>
                        
                        {/* Enrollment Widget */}
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-indigo-300 transition-colors">
                           <div className="flex items-center gap-2 mb-2">
                              <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><Users className="h-4 w-4" /></div>
                              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Enrollment</span>
                           </div>
                           <p className="text-2xl font-black text-blue-600 mt-1">{schoolData.stats.students || 0}</p>
                           <p className="text-[9px] text-slate-400 mt-1">Active registered scholars</p>
                        </div>

                        {/* Campus Attendance Widget */}
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-indigo-300 transition-colors">
                           <div className="flex items-center gap-2 mb-2">
                              <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg"><Activity className="h-4 w-4" /></div>
                              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Attendance</span>
                           </div>
                           <p className="text-2xl font-black text-slate-800 mt-1">87%</p>
                           <p className="text-[9px] text-slate-400 mt-1">Campus-wide today</p>
                        </div>

                        {/* Academic Risk Widget */}
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-indigo-300 transition-colors">
                           <div className="flex items-center gap-2 mb-2">
                              <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg"><AlertCircle className="h-4 w-4" /></div>
                              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Academic Risk</span>
                           </div>
                           <p className="text-2xl font-black text-rose-600 mt-1">14</p>
                           <p className="text-[9px] text-slate-400 mt-1">Students facing probation</p>
                        </div>
                        
                        {/* Hostel Occupancy Widget */}
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-indigo-300 transition-colors">
                           <div className="flex items-center gap-2 mb-2">
                              <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg"><Building2 className="h-4 w-4" /></div>
                              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Hostel Occupancy</span>
                           </div>
                           <p className="text-2xl font-black text-purple-600 mt-1">92%</p>
                           <p className="text-[9px] text-slate-400 mt-1">45 beds available</p>
                        </div>

                        {/* Staff Performance Widget */}
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-indigo-300 transition-colors">
                           <div className="flex items-center gap-2 mb-2">
                              <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg"><UserSquare2 className="h-4 w-4" /></div>
                              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Staff Performance</span>
                           </div>
                           <p className="text-2xl font-black text-slate-800 mt-1">4.2<span className="text-sm">/5</span></p>
                           <p className="text-[9px] text-slate-400 mt-1">Based on student QA surveys</p>
                        </div>
                        
                        {/* Procurement Status Widget */}
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-indigo-300 transition-colors lg:col-span-2">
                           <div className="flex items-center gap-2 mb-2">
                              <div className="p-1.5 bg-slate-100 text-slate-600 rounded-lg"><FileCheck2 className="h-4 w-4" /></div>
                              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Procurement Status</span>
                           </div>
                           <div className="flex justify-between items-end mt-1">
                              <div>
                                 <p className="text-2xl font-black text-slate-800">12</p>
                                 <p className="text-[9px] text-slate-400 mt-1">Pending LPOs Awaiting VC Approval</p>
                              </div>
                              <div className="text-right">
                                 <span className="bg-indigo-50 text-indigo-700 text-[10px] px-2 py-1 rounded font-bold uppercase cursor-pointer hover:bg-indigo-100">Review Inbox</span>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Quick shortcuts and resources */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
                      <h4 className="text-xs font-bold text-slate-400 font-mono tracking-wider uppercase">Administrative Shortcuts</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button onClick={() => { setActiveTab('students'); setShowAddStudentModal(true); }} className="p-4 text-left border border-slate-200 hover:bg-slate-50 rounded font-sans transition-all cursor-pointer">
                          <h5 className="text-xs font-bold text-slate-900">Enroll Students Manually</h5>
                          <p className="text-[11px] text-slate-500 mt-1">Add immediate students, generate IDs, and assign specific degree linkages.</p>
                        </button>
                        <button onClick={() => { setActiveTab('departments'); setShowAddDeptModal(true); }} className="p-4 text-left border border-slate-200 hover:bg-slate-50 rounded font-sans transition-all cursor-pointer">
                          <h5 className="text-xs font-bold text-slate-900">Add Academic Faculty</h5>
                          <p className="text-[11px] text-slate-500 mt-1">Establish computer science, engineering, or business division workspaces.</p>
                        </button>
                        <button onClick={() => { setActiveTab('units'); setShowAddUnitModal(true); }} className="p-4 text-left border border-slate-200 hover:bg-slate-50 rounded font-sans transition-all cursor-pointer">
                          <h5 className="text-xs font-bold text-slate-900">Configure Unit Catalogs</h5>
                          <p className="text-[11px] text-slate-500 mt-1">Register courses like CSC101, CSC102 algorithms and databases.</p>
                        </button>
                        <button onClick={() => { setActiveTab('staff'); setShowAddStaffModal(true); }} className="p-4 text-left border border-slate-200 hover:bg-slate-50 rounded font-sans transition-all cursor-pointer">
                          <h5 className="text-xs font-bold text-slate-900">Register Campus Operators</h5>
                          <p className="text-[11px] text-slate-500 mt-1">Authorize Dean, Registrars, HOD, and Lecturers profiles.</p>
                        </button>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                      <h4 className="text-xs font-bold text-slate-400 font-mono tracking-wider uppercase mb-4">Enterprise Tenancy Specs</h4>
                      <div className="space-y-3.5 text-xs">
                        <div className="flex justify-between border-b border-slate-150 pb-2">
                          <span className="text-slate-400">Campus Code</span>
                          <span className="font-mono font-bold text-slate-950">{schoolData.school.code}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-150 pb-2">
                          <span className="text-slate-400">Registry Email</span>
                          <span className="font-mono text-slate-850">{schoolData.school.email}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-150 pb-2">
                          <span className="text-slate-400">Helpdesk Line</span>
                          <span className="font-mono text-slate-850">{schoolData.school.phone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Subscription Status</span>
                          <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                            Enterprise Tier
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: DEPARTMENTS */}
              {activeTab === 'departments' && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden max-w-4xl">
                  <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 font-mono uppercase tracking-wider">Departments Directory</h3>
                      <p className="text-xs text-slate-450 mt-0.5">Divisional workspaces available in your school partition.</p>
                    </div>
                    <button onClick={() => setShowAddDeptModal(true)} className="px-3 py-1.5 bg-indigo-600 text-white rounded text-xs font-semibold shadow hover:bg-indigo-700 cursor-pointer flex items-center gap-1.5">
                      <Plus className="h-3.5 w-3.5" /> <span>Add Department</span>
                    </button>
                  </div>

                  <div className="divide-y divide-slate-200">
                    {departments.length === 0 ? (
                      <div className="py-12 text-center text-slate-400 font-mono text-xs">
                        No departments registered. Press "Add Department" to begin.
                      </div>
                    ) : (
                      departments.map((dept) => (
                        <div key={dept.id} className="p-5 flex items-center justify-between hover:bg-slate-50/40 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold font-mono text-xs">
                              D
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-slate-950 font-sans">{dept.name}</h4>
                              <p className="text-[10px] text-slate-400 font-mono font-bold">Partition ID: {dept.id.substring(0, 8)}...</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-150">
                            Active Scoped
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: PROGRAMS */}
              {activeTab === 'programs' && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden max-w-4xl">
                  <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 font-mono uppercase tracking-wider">Academic Degrees & Programs</h3>
                      <p className="text-xs text-slate-450 mt-0.5">Standard registered profiles used for student enrollment taxonomies.</p>
                    </div>
                    <button onClick={() => setShowAddProgModal(true)} className="px-3 py-1.5 bg-indigo-600 text-white rounded text-xs font-semibold shadow hover:bg-indigo-700 cursor-pointer flex items-center gap-1.5">
                      <Plus className="h-3.5 w-3.5" /> <span>Add Program</span>
                    </button>
                  </div>

                  <table className="w-full text-left font-sans text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                        <th className="py-4 px-6">Program Name</th>
                        <th className="py-4 px-6">Parent Department</th>
                        <th className="py-4 px-6">Code</th>
                        <th className="py-4 px-6 text-center">Enrolled / Capacity</th>
                        <th className="py-4 px-6">Database Scoping ID</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {programs.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-slate-400 font-mono">
                            No programs created yet. Open "Add Program" to begin.
                          </td>
                        </tr>
                      ) : (
                        programs.map((prog) => {
                          const enrolledCount = students.filter((s: any) => s.programId === prog.id).length;
                          return (
                            <tr key={prog.id} className="hover:bg-slate-50/20">
                              <td className="py-5 px-6 font-bold text-slate-905">{prog.name}</td>
                              <td className="py-5 px-6 font-medium text-slate-650">
                                <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-150 rounded text-indigo-700 text-[10px] font-mono uppercase font-bold">
                                  {prog.departmentName || 'Unassigned'}
                                </span>
                              </td>
                              <td className="py-5 px-6 font-mono font-bold text-indigo-650">{prog.code || '—'}</td>
                              <td className="py-5 px-6 text-center font-mono font-semibold text-slate-705">
                                <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-700 rounded text-[11px] font-bold">
                                  {enrolledCount} / {prog.capacity || '—'}
                                </span>
                              </td>
                              <td className="py-5 px-6 font-mono text-slate-400 text-[10px] font-bold">{prog.id.substring(0, 8)}...</td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* TAB 4: COURSE UNITS */}
              {activeTab === 'units' && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden max-w-4xl">
                  <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 font-mono uppercase tracking-wider">Academic Units Catalog</h3>
                      <p className="text-xs text-slate-450 mt-0.5">Syllabus rosters that teachers can lecture and score.</p>
                    </div>
                    <button onClick={() => setShowAddUnitModal(true)} className="px-3 py-1.5 bg-indigo-600 text-white rounded text-xs font-semibold shadow hover:bg-indigo-700 cursor-pointer flex items-center gap-1.5">
                      <Plus className="h-3.5 w-3.5" /> <span>Add Course Unit</span>
                    </button>
                  </div>

                  <table className="w-full text-left font-sans text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                        <th className="py-4 px-6">Unit Code</th>
                        <th className="py-4 px-6">Unit Title</th>
                        <th className="py-4 px-6">Parent Program / Category</th>
                        <th className="py-4 px-6">Database Key</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {units.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-12 text-center text-slate-400 font-mono">
                            No course units generated. Open "Add Unit" to set up codes.
                          </td>
                        </tr>
                      ) : (
                        units.map((unit) => (
                          <tr key={unit.id} className="hover:bg-slate-50/20">
                            <td className="py-5 px-6 text-xs font-mono font-bold text-indigo-600">{unit.code}</td>
                            <td className="py-5 px-6 font-semibold text-slate-800">{unit.name}</td>
                            <td className="py-5 px-6 text-slate-500 font-medium">{unit.programName}</td>
                            <td className="py-5 px-6 font-mono text-slate-405 text-[10px] font-bold">{unit.id.substring(0, 8)}...</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* TAB 5: STAFF */}
              {activeTab === 'staff' && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden max-w-5xl">
                  <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 font-mono uppercase tracking-wider">Staff Directories</h3>
                      <p className="text-xs text-slate-450 mt-0.5 font-sans">Academic and management credentials generated for Nairobi High operators.</p>
                    </div>
                    <button onClick={() => setShowAddStaffModal(true)} className="px-3.5 py-1.5 bg-indigo-600 text-white rounded text-xs font-semibold shadow hover:bg-indigo-700 cursor-pointer flex items-center gap-1.5">
                      <Plus className="h-3.5 w-3.5" /> <span>Add Faculty Member</span>
                    </button>
                  </div>

                  <table className="w-full text-left font-sans text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                        <th className="py-4 px-6">Faculty Member</th>
                        <th className="py-4 px-6">Assigned Role</th>
                        <th className="py-4 px-6">Parent Division</th>
                        <th className="py-4 px-6">Portal Username ID</th>
                        <th className="py-4 px-6">Default Password</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {staff.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-slate-400 font-mono">
                            No faculty registered. Click "Add Faculty Member" to generate accounts.
                          </td>
                        </tr>
                      ) : (
                        staff.map((st) => (
                          <tr key={st.id} className="hover:bg-slate-50/20">
                            <td className="py-5 px-6">
                              <div className="font-bold text-slate-900">{st.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{st.phone || 'No phone'}</div>
                            </td>
                            <td className="py-5 px-6">
                              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-50 text-slate-700 border border-slate-200">
                                {st.role}
                              </span>
                            </td>
                            <td className="py-5 px-6 text-slate-600 font-medium">{st.departmentName}</td>
                            <td className="py-5 px-6 font-mono font-medium text-slate-600">{st.email}</td>
                            <td className="py-5 px-6">
                              <span className="font-mono bg-slate-50 border border-slate-150 py-0.5 px-1.5 rounded text-[10px] text-slate-500 font-bold">
                                12345678
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* TAB 6: STUDENTS MANAGMENT */}
              {activeTab === 'students' && (
                <div className="space-y-6">
                  {/* Internal actions strip */}
                  <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full sm:max-w-md">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Search className="h-4 w-4" />
                      </div>
                      <input
                        id="student-search-bar"
                        type="text"
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        className="block w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 text-xs rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white transition-all font-sans"
                        placeholder="Search student directories..."
                      />
                    </div>

                    <button 
                      id="school-open-student-maker"
                      onClick={() => setShowAddStudentModal(true)} 
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-semibold shadow-md shadow-indigo-100 transition-all flex items-center gap-1.5 cursor-pointer w-full sm:w-auto justify-center"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Manually Add Student</span>
                    </button>
                  </div>

                  {/* Primary Student Database table */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left font-sans text-xs" id="students-table-display">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                            <th className="py-4 px-6">Student details / Email</th>
                            <th className="py-4 px-6" id="student-code-header">Reg Number</th>
                            <th className="py-4 px-6">Enrolled Program</th>
                            <th className="py-4 px-6">Year</th>
                            <th className="py-4 px-6">Current Status</th>
                            <th className="py-4 px-6 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredStudents.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="py-12 text-center text-slate-400 font-mono">
                                {students.length === 0 
                                  ? 'No student profiles created yet. Initiate registration using adding options.' 
                                  : 'No students matching that search filter query.'}
                              </td>
                            </tr>
                          ) : (
                            filteredStudents.map((st) => (
                              <tr key={st.id} className="hover:bg-slate-50/20 transition-all" id={`student-row-${st.id}`}>
                                <td className="py-4 px-6">
                                  <div className="font-bold text-slate-900 text-xs">{st.name}</div>
                                  <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono mt-0.5">
                                    <span>{st.email}</span>
                                    {st.phone && <span>• {st.phone}</span>}
                                  </div>
                                </td>
                                <td className="py-4 px-6 font-mono text-xs tracking-tight text-slate-900 font-bold" id={`student-code-${st.id}`}>
                                  {st.regNumber}
                                </td>
                                <td className="py-4 px-6 font-semibold text-slate-700">
                                  {st.programName}
                                </td>
                                <td className="py-4 px-6 text-slate-605">
                                  <div className="font-semibold text-slate-705">{st.currentLevel || `Year ${st.yearOfStudy}`}</div>
                                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">{st.currentSemester || 'Semester 1'}</div>
                                </td>
                                <td className="py-4 px-6" id={`student-status-badge-${st.id}`}>
                                  <div className="flex flex-col items-start gap-1 pb-1">
                                    <button
                                      onClick={() => toggleStudentStatus(st)}
                                      title="Click to quickly switch student status setting"
                                      className={`px-3 py-1 pb-1 px-2 py-0.5 rounded text-[9px] font-mono tracking-wider font-bold capitalize transition-all border cursor-pointer ${
                                        st.status === 'active' || st.status === 'Active'
                                          ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-100'
                                          : 'bg-amber-50 hover:bg-amber-100 text-amber-850 border-amber-150'
                                      }`}
                                    >
                                      {st.status}
                                    </button>
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-wide border uppercase ${
                                      st.academicState === 'ADMITTED' ? 'bg-slate-50 text-slate-500 border-slate-200' :
                                      st.academicState === 'ACTIVE' ? 'bg-indigo-55/90 text-indigo-850 border-indigo-150' :
                                      st.academicState === 'EXAM_READY' ? 'bg-emerald-55/95 text-emerald-900 border-emerald-150' :
                                      st.academicState === 'GRADUATING' ? 'bg-purple-55 text-purple-800 border-purple-150' :
                                      'bg-amber-55 text-amber-850 border-amber-150'
                                    }`} title="UOS Academic Lifecycle State Machine status state">
                                      {st.academicState || 'ACTIVE'}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-4 px-6 text-right">
                                  <div className="inline-flex gap-2">
                                    <button
                                      id={`edit-student-btn-${st.id}`}
                                      onClick={() => setEditingStudent(st)}
                                      className="p-1.5 hover:bg-indigo-50 border border-slate-150 text-indigo-650 hover:text-indigo-800 transition-all rounded-lg cursor-pointer"
                                      title="Edit details"
                                    >
                                      <Edit3 className="h-4 w-4" />
                                    </button>
                                    <button
                                      id={`delete-student-btn-${st.id}`}
                                      onClick={() => handleDeleteStudent(st.id, st.name)}
                                      className="p-1.5 hover:bg-rose-50 border border-slate-150 text-rose-600 hover:text-rose-800 transition-all rounded-lg cursor-pointer"
                                      title="Remove profile permanently"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6.5: GENERAL PARENTS / GUARDIANS WORLD */}
              {activeTab === 'parents' && (
                <AdminParentManagement token={token} appendLog={appendLog} />
              )}

              {/* TAB 7: SETTINGS / PREFERENCES */}
              {activeTab === 'settings' && schoolData && (
                <div className="max-w-3xl bg-white rounded-xl p-8 border border-slate-200 shadow-sm space-y-8 animate-fade">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 font-mono uppercase tracking-wider">School Profile Configuration</h3>
                    <p className="text-xs text-slate-450 mt-1">Configure workspace parameters and examine structural limitations.</p>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <span className="text-[10px] font-mono text-slate-400 block uppercase tracking-widest font-bold mb-1.5">School Official Identity</span>
                        <input
                          disabled
                          type="text"
                          className="block w-full bg-slate-55 border border-slate-200 py-2 px-3 rounded text-xs font-semibold text-slate-500 font-sans cursor-not-allowed"
                          value={schoolData.school.name}
                        />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-slate-400 block uppercase tracking-widest font-bold mb-1.5">Acronym Prefix Code</span>
                        <input
                          disabled
                          type="text"
                          className="block w-full bg-slate-55 border border-slate-200 py-2 px-3 rounded text-xs font-mono text-slate-500 text-center cursor-not-allowed font-bold"
                          value={schoolData.school.code}
                        />
                      </div>
                    </div>

                    {/* School Branding Section */}
                    <div className="pt-6 border-t border-slate-100">
                      <h4 className="text-xs font-bold text-slate-900 mb-4 font-mono uppercase tracking-wider">Visual Branding Identity</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                         <div>
                            <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-1">Primary Color (Hex)</label>
                            <div className="flex gap-2">
                               <input type="color" defaultValue="#4f46e5" className="h-8 w-12 rounded cursor-pointer" />
                               <input type="text" defaultValue="#4f46e5" className="flex-1 text-xs px-2 border border-slate-200 rounded font-mono uppercase" />
                            </div>
                         </div>
                         <div>
                            <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-1">Secondary Color (Hex)</label>
                            <div className="flex gap-2">
                               <input type="color" defaultValue="#slate" className="h-8 w-12 rounded cursor-pointer" />
                               <input type="text" defaultValue="#0f172a" className="flex-1 text-xs px-2 border border-slate-200 rounded font-mono uppercase" />
                            </div>
                         </div>
                         <div className="sm:col-span-2">
                            <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-1">School Logo URL</label>
                            <div className="flex gap-2">
                               <input type="text" placeholder="https://" defaultValue="https://university.edu/logo.png" className="flex-1 text-xs px-3 py-2 border border-slate-200 rounded text-slate-600" />
                               <div className="h-8 w-8 bg-slate-100 rounded border border-slate-200 flex items-center justify-center overflow-hidden">
                                  <img src="https://via.placeholder.com/32" alt="Logo preview" className="object-cover" />
                               </div>
                            </div>
                            <p className="text-[9px] text-slate-400 mt-1">Appears on Admission Letters, Fee Statements, Transcripts.</p>
                         </div>
                      </div>
                      <div className="mt-4 flex justify-end">
                         <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-xs font-bold shadow-sm transition">
                            Save Branding Parameters
                         </button>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50/55 border border-slate-200 rounded">
                      <div className="flex items-center gap-3">
                        <FileCheck2 className="h-5 w-5 text-indigo-650 flex-shrink-0" />
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">Consolidated Academic Database Scoping</h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">Your console is restricted to Nairobi High School's active logical ID partition. Cross-tenant queries are blocked securely by server operators.</p>
                        </div>
                      </div>
                    </div>

                    {/* Multi-Campus Topology Section */}
                    <div className="pt-6 border-t border-slate-100">
                      <div className="flex items-center justify-between mb-4">
                         <div>
                            <h4 className="text-xs font-bold text-slate-900 font-mono uppercase tracking-wider">Multi-Campus Physical Topology</h4>
                            <p className="text-[10px] text-slate-400 mt-0.5 max-w-sm">Define Campuses, Buildings, and Rooms for real-world timetabling and space utility scaling.</p>
                         </div>
                         <button className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded text-[10px] font-bold shadow-sm transition">
                            + Add Campus Location
                         </button>
                      </div>
                      
                      <div className="space-y-4">
                         <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                            <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between">
                               <div className="flex gap-2 items-center">
                                  <div className="h-6 w-6 rounded bg-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-xs">M</div>
                                  <h5 className="font-bold text-slate-800 text-xs tracking-tight">Main Campus</h5>
                               </div>
                               <button className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-800">Add Building</button>
                            </div>
                            <div className="p-4 space-y-3">
                               <div className="border border-slate-100 bg-slate-50/30 rounded p-3">
                                  <div className="flex items-center justify-between">
                                     <h6 className="text-[11px] font-bold text-slate-700">Administration Block A</h6>
                                     <button className="text-[9px] font-semibold text-emerald-600 hover:text-emerald-800">+ Room</button>
                                  </div>
                                  <div className="flex flex-wrap gap-2 mt-2">
                                     <span className="bg-white border border-slate-200 px-2 py-0.5 rounded text-[10px] font-mono text-slate-500 shadow-sm cursor-pointer hover:border-indigo-300 hover:text-indigo-600 transition">Room 101</span>
                                     <span className="bg-white border border-slate-200 px-2 py-0.5 rounded text-[10px] font-mono text-slate-500 shadow-sm cursor-pointer hover:border-indigo-300 hover:text-indigo-600 transition">Room 102</span>
                                     <span className="bg-white border border-slate-200 px-2 py-0.5 rounded text-[10px] font-mono text-slate-500 shadow-sm cursor-pointer hover:border-indigo-300 hover:text-indigo-600 transition">Lab Alpha</span>
                                  </div>
                               </div>
                               <div className="border border-slate-100 bg-slate-50/30 rounded p-3">
                                 <div className="flex items-center justify-between">
                                     <h6 className="text-[11px] font-bold text-slate-700">Engineering Block C</h6>
                                     <button className="text-[9px] font-semibold text-emerald-600 hover:text-emerald-800">+ Room</button>
                                  </div>
                                  <div className="flex flex-wrap gap-2 mt-2">
                                     <span className="text-[10px] text-slate-400 italic">No rooms allocated yet</span>
                                  </div>
                               </div>
                            </div>
                         </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: LIFECYCLE STATE MACHINE */}
              {activeTab === 'state_machine' && (
                <div className="space-y-8 animate-fade">
                  <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 font-mono uppercase tracking-wider">UOS Academic Lifecycle Control Desk</h3>
                      <p className="text-xs text-slate-450 mt-1">Sustain and transition students dynamically across pre-defined state checkpoints (ADMITTED → ACTIVE → EXAM_READY → GRADUATING → GRADUATED).</p>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
                      {/* Left: Students directory */}
                      <div className="lg:col-span-5 border-r border-slate-105 pr-0 lg:pr-8">
                        <span className="text-[10px] uppercase font-mono text-slate-400 font-bold block mb-3">Student Directory Lookup</span>
                        <div className="relative mb-4">
                          <input
                            type="text"
                            placeholder="Filter by name or reg..."
                            className="text-xs w-full py-2 pl-8 pr-3 border border-slate-200 rounded font-mono"
                            value={studentSearch}
                            onChange={(e) => setStudentSearch(e.target.value)}
                          />
                          <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-3" />
                        </div>
                        <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                          {filteredStudents.map((st) => (
                            <button
                              key={st.id}
                              onClick={async () => {
                                setSelectedStudentForLSM(st);
                                setLsmTargetState(st.academicState === 'ADMITTED' ? 'ACTIVE' : st.academicState === 'ACTIVE' ? 'EXAM_READY' : st.academicState === 'EXAM_READY' ? 'GRADUATING' : 'GRADUATED');
                                setLsmReason('');
                                try {
                                  const r = await fetch(`/api/admin/students/${st.id}/transitions`, {
                                    headers: { 'Authorization': `Bearer ${token}` }
                                  });
                                  if (r.ok) {
                                    setLsmTransitionHistory(await r.json());
                                  }
                                } catch (e) {
                                  console.error(e);
                                }
                              }}
                              className={`w-full text-left p-3 rounded-lg border transition-all flex justify-between items-center cursor-pointer ${
                                selectedStudentForLSM?.id === st.id
                                  ? 'bg-indigo-50/50 border-indigo-200 shadow-xs'
                                  : 'hover:bg-slate-50/60 border-slate-150'
                              }`}
                            >
                              <div>
                                <div className="text-xs font-bold text-slate-900">{st.name}</div>
                                <div className="text-[10px] text-slate-400 font-mono mt-0.5">{st.regNumber}</div>
                              </div>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-tight uppercase border ${
                                st.academicState === 'ADMITTED' ? 'bg-slate-100 text-slate-500 border-slate-200' :
                                st.academicState === 'ACTIVE' ? 'bg-indigo-50 text-indigo-700 border-indigo-150' :
                                st.academicState === 'EXAM_READY' ? 'bg-emerald-50 text-emerald-700 border-emerald-150' :
                                st.academicState === 'GRADUATING' ? 'bg-purple-50 text-purple-700 border-purple-150' :
                                'bg-amber-50 text-amber-700 border-amber-150'
                              }`}>
                                {st.academicState || 'ACTIVE'}
                              </span>
                            </button>
                          ))}
                          {filteredStudents.length === 0 && (
                            <p className="text-xs text-slate-400 font-mono text-center py-6">No matching students found.</p>
                          )}
                        </div>
                      </div>

                      {/* Right: State Transition Control & Timeline logs */}
                      <div className="lg:col-span-7 space-y-6">
                        {selectedStudentForLSM ? (
                          <>
                            <div className="p-4 bg-slate-50/50 border border-slate-200 rounded-xl">
                              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold block mb-1">SELECTED STUDENT PROFILE</span>
                              <h4 className="text-sm font-bold text-slate-900">{selectedStudentForLSM.name}</h4>
                              <p className="text-[11px] text-slate-500 font-mono mt-0.5">Registration: {selectedStudentForLSM.regNumber} | Core Cohort Key: {selectedStudentForLSM.cohortId || 'N/A'}</p>
                              
                              <div className="flex gap-4 mt-3">
                                <div>
                                  <span className="text-[9px] text-slate-400 font-mono block">CURRENT LIFECYCLE</span>
                                  <span className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                                    selectedStudentForLSM.academicState === 'ADMITTED' ? 'bg-slate-55 text-slate-500 border-slate-200' :
                                    selectedStudentForLSM.academicState === 'ACTIVE' ? 'bg-indigo-50 text-indigo-700 border-indigo-150' :
                                    selectedStudentForLSM.academicState === 'EXAM_READY' ? 'bg-emerald-50 text-emerald-705 border-emerald-150' :
                                    selectedStudentForLSM.academicState === 'GRADUATING' ? 'bg-purple-50 text-purple-700 border-purple-150' :
                                    'bg-amber-55 text-amber-800 border-amber-150'
                                  }`}>
                                    {selectedStudentForLSM.academicState || 'ACTIVE'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-[9px] text-slate-400 font-mono block">DIRECTORY STATUS</span>
                                  <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-705 text-white border border-slate-800 capitalize">
                                    {selectedStudentForLSM.status}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Transition Form */}
                            <div className="border border-slate-150 rounded-xl p-4 space-y-4">
                              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold block">TRIGGER STATE MACHINE TRANSITION</span>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <label className="text-[10px] font-bold text-slate-500 font-mono block mb-1.5">MUTATE TO NEW STATE</label>
                                  <select
                                    className="block w-full text-xs font-mono border border-slate-250 rounded p-2 bg-white"
                                    value={lsmTargetState}
                                    onChange={(e) => setLsmTargetState(e.target.value)}
                                  >
                                    <option value="ADMITTED">ADMITTED (Fee Pending Check)</option>
                                    <option value="ACTIVE">ACTIVE (Full Class Status)</option>
                                    <option value="EXAM_READY">EXAM_READY (Attendance Cleared)</option>
                                    <option value="GRADUATING">GRADUATING (Finalist Audit)</option>
                                    <option value="GRADUATED">GRADUATED (Transcript Certified)</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="text-[10px] font-bold text-slate-500 font-mono block mb-1.5">OFFICIAL TRANSITION REASON/RESOURCES</label>
                                  <input
                                    type="text"
                                    placeholder="e.g. Tuition fee cleared / Registrar override"
                                    className="block w-full text-xs border border-slate-250 rounded p-2"
                                    value={lsmReason}
                                    onChange={(e) => setLsmReason(e.target.value)}
                                  />
                                </div>
                              </div>

                              <button
                                onClick={async () => {
                                  if (!lsmReason) {
                                    setError('Please specify an official reason or approval resource check before mutating lifecycle state.');
                                    return;
                                  }
                                  setError(null);
                                  try {
                                    const r = await fetch(`/api/admin/students/${selectedStudentForLSM.id}/transition-state`, {
                                      method: 'POST',
                                      headers: { 
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${token}`
                                      },
                                      body: JSON.stringify({ toState: lsmTargetState, reason: lsmReason })
                                    });
                                    const data = await r.json();
                                    if (!r.ok) {
                                      setError(data.error || 'State machine transition validation rule failed.');
                                    } else {
                                      setSuccessMsg(`Lifecycle State successfully mutated to ${lsmTargetState}!`);
                                      setSelectedStudentForLSM(prev => ({ ...prev, academicState: lsmTargetState }));
                                      setTimeout(() => setSuccessMsg(null), 3000);
                                      await loadSchoolRecords();
                                      // refresh transition history
                                      const trR = await fetch(`/api/admin/students/${selectedStudentForLSM.id}/transitions`, {
                                        headers: { 'Authorization': `Bearer ${token}` }
                                      });
                                      if (trR.ok) {
                                        setLsmTransitionHistory(await trR.json());
                                      }
                                    }
                                  } catch (err: any) {
                                    setError(err.message);
                                  }
                                }}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-semibold cursor-pointer select-none"
                              >
                                Mutate State and Clear
                              </button>
                            </div>

                            {/* Transition Timeline logs */}
                            <div className="space-y-3">
                              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold block">STATE MACHINE TRANSITION TRAIL LOGS</span>
                              <div className="space-y-4 pl-3 border-l-2 border-indigo-150">
                                {lsmTransitionHistory.length === 0 ? (
                                  <p className="text-[11px] text-slate-400 font-mono py-2">No historical transitions recorded. Student operates under bootstrap parameters.</p>
                                ) : (
                                  lsmTransitionHistory.map((tr) => (
                                    <div key={tr.id} className="relative pl-4 space-y-1">
                                      <div className="absolute -left-[19px] top-1.5 w-2 h-2 rounded-full bg-indigo-650 border border-white" />
                                      <div className="flex items-center gap-2 text-xs">
                                        <span className="font-mono text-[10px] px-1.5 py-0.2 bg-slate-100 text-slate-600 border border-slate-200 rounded">
                                          {tr.fromState}
                                        </span>
                                        <span className="text-slate-400 font-bold">→</span>
                                        <span className="font-mono text-[10px] px-1.5 py-0.2 bg-indigo-50 text-indigo-705 border border-indigo-150 rounded font-bold">
                                          {tr.toState}
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-mono ml-auto">
                                          {new Date(tr.timestamp).toLocaleString()}
                                        </span>
                                      </div>
                                      <p className="text-[11px] text-slate-600 italic mt-0.5">"{tr.reason}"</p>
                                      <span className="text-[9px] text-slate-400 font-mono block">Cleared by Operator ID: {tr.triggeredBy}</span>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="h-full flex flex-col justify-center items-center py-20 text-center border-2 border-dashed border-slate-105 rounded-2xl">
                            <GraduationCap className="h-12 w-12 text-slate-300" />
                            <h4 className="text-xs font-bold text-slate-900 mt-3">No Student Selected</h4>
                            <p className="text-xs text-slate-400 font-mono mt-1 max-w-xs">Select any student profile from the ledger stream directory to view active academic state checkpoints and execute operations.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: SYSTEM CONTROL PANEL & LIVE EVENT BUS */}
              {activeTab === 'system_control' && (
                <div className="space-y-8 animate-fade">
                  {/* DYNAMIC SYSTEM GATEWAY NAVIGATION HEADER */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-150 pb-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 font-mono uppercase tracking-wider">UOS Operations Central Gateway</h3>
                      <p className="text-[10px] text-slate-450 mt-1">Cross-operating administrative station running consistency audits, decision analytics, and external synchronization gateways.</p>
                    </div>

                    <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-205 select-none">
                      <button
                        onClick={() => { setActiveSubTab('core'); setSchemaData(null); setViewedSchema('none'); }}
                        className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold font-mono uppercase transition-all cursor-pointer ${
                          activeSubTab === 'core'
                            ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        ⚙️ Parameters & Bus
                      </button>
                      <button
                        onClick={() => { setActiveSubTab('consistency'); setSchemaData(null); setViewedSchema('none'); loadOperationalData(); }}
                        className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold font-mono uppercase transition-all cursor-pointer ${
                          activeSubTab === 'consistency'
                            ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        🛡️ Transaction consistency
                      </button>
                      <button
                        onClick={() => { setActiveSubTab('intelligence'); setSchemaData(null); setViewedSchema('none'); loadOperationalData(); }}
                        className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold font-mono uppercase transition-all cursor-pointer ${
                          activeSubTab === 'intelligence'
                            ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        📊 Decision Intelligence
                      </button>
                      <button
                        onClick={() => { setActiveSubTab('interop'); setSchemaData(null); setViewedSchema('none'); loadOperationalData(); }}
                        className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold font-mono uppercase transition-all cursor-pointer ${
                          activeSubTab === 'interop'
                            ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        🌐 Interoperability & SIS
                      </button>
                    </div>
                  </div>

                  {/* SUB-VIEW 1: CORE DYNAMIC SETTINGS & EVENT TICKER */}
                  {activeSubTab === 'core' && (
                    <div className="space-y-8 animate-fade">
                      {/* Part A: Dynamic Parameters & Toggles */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Settings Toggles */}
                        <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm space-y-4">
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 font-mono uppercase tracking-wider">SaaS Active Feature Matrix</h4>
                            <p className="text-[10px] text-slate-450 mt-1">Surgical toggles instantly affecting business constraints on student modules.</p>
                          </div>

                          <div className="space-y-3.5 divide-y divide-slate-100">
                            {features.map((feat) => (
                              <div key={feat.key} className="flex justify-between items-center pt-3.5 select-none">
                                <div className="pr-4">
                                  <span className="text-xs font-bold text-slate-850 block">{feat.title}</span>
                                  <span className="text-[9px] text-slate-400 font-mono block">System Key: {feat.key}</span>
                                </div>
                                <button
                                  onClick={async () => {
                                    try {
                                      const newVal = !feat.value;
                                      const r = await fetch('/api/admin/feature-flags', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                        body: JSON.stringify({ key: feat.key, value: newVal })
                                      });
                                      if (r.ok) {
                                        setSuccessMsg(`Feature Matrix toggle "${feat.key}" updated successfully!`);
                                        setTimeout(() => setSuccessMsg(null), 3000);
                                        loadStabilizationData();
                                      }
                                    } catch (e) {
                                      console.error(e);
                                    }
                                  }}
                                  className={`w-11 h-6 rounded-full p-0.5 transition-all duration-300 cursor-pointer ${
                                    feat.value ? 'bg-indigo-600 text-right' : 'bg-slate-300 text-left'
                                  }`}
                                >
                                  <div className={`w-5 h-5 bg-white rounded-full shadow-xs transition-all transform ${feat.value ? 'translate-x-5' : ''}`} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Central Parameters */}
                        <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm space-y-4">
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 font-mono uppercase tracking-wider">Dynamic Central Config Overrides</h4>
                            <p className="text-[10px] text-slate-450 mt-1">Calibrate runtime parameters dynamically without full system rebuild procedures.</p>
                          </div>

                          <div className="space-y-4">
                            {configs.map((cfg) => (
                              <div key={cfg.key} className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-xs font-bold text-slate-700">{cfg.title}</span>
                                  <span className="text-xs font-mono font-bold text-indigo-705 bg-indigo-50 border border-indigo-100 rounded px-1.5">{String(cfg.value)}</span>
                                </div>
                                {cfg.key === 'qrDurationSeconds' ? (
                                  <input
                                    type="range"
                                    min="10"
                                    max="300"
                                    step="10"
                                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none accent-indigo-650 cursor-pointer"
                                    value={cfg.value}
                                    onChange={async (e) => {
                                      const targetVal = Number(e.target.value);
                                      setConfigs(prev => prev.map(c => c.key === cfg.key ? { ...c, value: targetVal } : c));
                                      try {
                                        await fetch('/api/admin/config', {
                                          method: 'POST',
                                          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                          body: JSON.stringify({ key: cfg.key, value: targetVal })
                                        });
                                      } catch (ex) {
                                        console.error(ex);
                                      }
                                    }}
                                  />
                                ) : cfg.key === 'attendanceExamThreshold' ? (
                                  <input
                                    type="range"
                                    min="50"
                                    max="100"
                                    step="5"
                                    className="w-full h-1.5 bg-slate-105 rounded-lg appearance-none accent-indigo-650 cursor-pointer"
                                    value={cfg.value}
                                    onChange={async (e) => {
                                      const targetVal = Number(e.target.value);
                                      setConfigs(prev => prev.map(c => c.key === cfg.key ? { ...c, value: targetVal } : c));
                                      try {
                                        await fetch('/api/admin/config', {
                                          method: 'POST',
                                          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                          body: JSON.stringify({ key: cfg.key, value: targetVal })
                                        });
                                      } catch (ex) {
                                        console.error(ex);
                                      }
                                    }}
                                  />
                                ) : (
                                  <input
                                    type="text"
                                    className="w-full text-xs font-mono py-1 px-2 border border-slate-250 rounded bg-slate-55"
                                    value={cfg.value}
                                    onChange={async (e) => {
                                      const targetVal = e.target.value;
                                      setConfigs(prev => prev.map(c => c.key === cfg.key ? { ...c, value: targetVal } : c));
                                      try {
                                        await fetch('/api/admin/config', {
                                          method: 'POST',
                                          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                          body: JSON.stringify({ key: cfg.key, value: targetVal })
                                        });
                                      } catch (ex) {
                                        console.error(ex);
                                      }
                                    }}
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Part B: Realtime Event Bus Console & Payment Reaction simulator */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Event Bus Ticker */}
                        <div className="lg:col-span-8 bg-slate-950 text-emerald-450 rounded-xl p-6 border border-slate-900 shadow-lg font-mono space-y-4">
                          <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                            <div>
                              <span className="text-xs font-bold text-white uppercase tracking-wider block">UOS Live Operations Real-Time Event Bus</span>
                              <span className="text-[10px] text-slate-500 block font-normal normal-case">Streaming operational signals (auto-updating via SSE simulated ticker).</span>
                            </div>
                            <span className="animate-pulse flex items-center gap-1.5 text-[9px] font-bold text-emerald-500 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-900">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> LIVE MATRIX
                            </span>
                          </div>

                          <div className="space-y-4 max-h-[380px] overflow-y-auto scoller-dark pr-2 text-xs">
                            {events.length === 0 ? (
                              <div className="text-center py-12 text-slate-600 italic font-mono text-xs">No active events broadcasted. Trigger scans or simulated integrations to populate signals.</div>
                            ) : (
                              events.map((evt) => (
                                <div key={evt.id} className="p-3 bg-slate-900/60 border border-slate-900/50 rounded-lg space-y-1">
                                  <div className="flex justify-between items-center text-[10px]">
                                    <span className="font-bold text-sky-400 bg-sky-950 px-1.5 py-0.2 rounded uppercase border border-sky-900/30">
                                      {evt.eventType}
                                    </span>
                                    <span className="text-slate-500">
                                      {new Date(evt.timestamp).toLocaleString()}
                                    </span>
                                  </div>
                                  <h5 className="font-bold text-slate-250 mt-1">{evt.title}</h5>
                                  <p className="text-slate-400 text-[11px] leading-relaxed">
                                    {evt.message}
                                  </p>
                                  
                                  {evt.eventType === 'ATTENDANCE_SCANNED' && (
                                    <div className="mt-2 text-[10px] text-amber-400 flex items-center gap-1.5 bg-amber-950/25 p-2 rounded border border-amber-900/25 font-sans">
                                      <span>💡</span>
                                      <span><strong>REAL-TIME REACTION:</strong> UOS verified primary device bind, locking student scan, and logging active event streams.</span>
                                    </div>
                                  )}
                                  {evt.eventType === 'PAYMENT_RECEIVED' && (
                                    <div className="mt-2 text-[10px] text-emerald-400 flex items-center gap-1.5 bg-emerald-950/30 p-2 rounded border border-emerald-900/25 animate-pulse font-sans">
                                      <span>🔥</span>
                                      <span><strong>FINANCIAL AUTO-REACTION:</strong> Suspension lifted. Academic status promoted from FINANCIAL_HOLD to ACTIVE.</span>
                                    </div>
                                  )}
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        {/* Simulation Controller */}
                        <div className="lg:col-span-4 bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 font-mono uppercase tracking-wider">State Reaction Simulator</h4>
                            <p className="text-[10px] text-slate-450 mt-1">Inject real bank or finance payment messages to test automated lifecycle state reactions in real time.</p>
                          </div>

                          <div className="space-y-4 text-xs">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-slate-500 font-mono block">SELECT TARGET STUDENT</label>
                              <select
                                className="bg-white border text-xs border-slate-250 rounded block w-full p-2 font-sans text-slate-750 font-medium"
                                value={simStudentId}
                                onChange={(e) => setSimStudentId(e.target.value)}
                              >
                                <option value="">-- Choose student --</option>
                                {students.map(s => (
                                  <option key={s.id} value={s.id}>{s.name} ({s.academicState || 'ACTIVE'})</option>
                                ))}
                              </select>
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-slate-500 font-mono block">TUITION PAYMENT AMOUNT</label>
                              <div className="relative">
                                <span className="absolute left-2.5 top-2 ml-0.5 text-slate-400 font-bold">$</span>
                                <input
                                  type="number"
                                  className="border block w-full text-xs rounded p-2 pl-7 font-mono font-bold text-indigo-750"
                                  value={simAmount}
                                  onChange={(e) => setSimAmount(e.target.value)}
                                />
                              </div>
                            </div>

                            <button
                              disabled={!simStudentId}
                              onClick={async () => {
                                if (!simStudentId) return;
                                setError(null);
                                try {
                                  const r = await fetch('/api/global/events/simulate-payment', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                    body: JSON.stringify({ studentId: simStudentId, amount: simAmount })
                                  });
                                  if (!r.ok) {
                                    const data = await r.json();
                                    throw new Error(data.error || 'Failed simulation trigger.');
                                  }
                                  setSuccessMsg(`Simulated tuition payment received! Watch Event Stream reactions.`);
                                  setTimeout(() => setSuccessMsg(null), 3000);
                                  await loadSchoolRecords();
                                  await loadStabilizationData();
                                } catch (ex: any) {
                                  setError(ex.message);
                                }
                              }}
                              className={`w-full text-center py-2 text-xs font-semibold rounded text-white select-none ${
                                !simStudentId ? 'bg-slate-300 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 cursor-pointer shadow-md shadow-emerald-50'
                              }`}
                            >
                              Discharge Simulated Payment
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Part C: Global Identities & Devices Bounding Matrix */}
                      <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm space-y-4">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 font-mono uppercase tracking-wider">Global Identities & Device Binding Matrix</h4>
                          <p className="text-[10px] text-slate-450 mt-1">Core mapping of unique individuals to cross-role identities and dynamic device pairings registered across schools.</p>
                        </div>

                        <div className="overflow-x-auto text-xs animate-fade">
                          <table className="w-full text-left font-sans border-collapse">
                            <thead>
                              <tr className="bg-slate-50 text-slate-400 font-mono text-[9px] tracking-widest font-bold uppercase border-b border-slate-100">
                                <th className="py-3 px-4">Global Identifier</th>
                                <th className="py-3 px-4">Subject Name</th>
                                <th className="py-3 px-4">Contact Gateway</th>
                                <th className="py-3 px-4">Registered Bound Device Handlers</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {identities.length === 0 ? (
                                <tr>
                                  <td colSpan={4} className="py-8 text-center text-slate-405 font-mono text-[11px]">No active human identity profiles indexed in registry. Log in as student to generate bindings.</td>
                                </tr>
                              ) : (
                                identities.map((idx) => {
                                  return (
                                    <tr key={idx.id} className="hover:bg-slate-55/30 transition-colors">
                                      <td className="py-4 px-4 font-mono font-bold text-[10px] text-indigo-700">{idx.id}</td>
                                      <td className="py-4 px-4 font-bold text-slate-800">{idx.fullName}</td>
                                      <td className="py-4 px-4">
                                        <div className="text-[11px] font-semibold text-slate-700">{idx.primaryEmail}</div>
                                        <div className="text-[10px] text-slate-404 font-mono">{idx.phone || 'No Phone Link'}</div>
                                      </td>
                                      <td className="py-4 px-4">
                                        <div className="space-y-1.5">
                                          {(() => {
                                            const stdMatch = students.find(s => s.identityId === idx.id || s.email.toLowerCase().trim() === idx.primaryEmail.toLowerCase().trim());
                                            const idxDevices = schoolData?.devices?.filter((d: any) => d.studentId === idx.id || (stdMatch && d.studentId === stdMatch.id)) || [];
                                            
                                            if (idxDevices.length === 0) {
                                              return (
                                                <span className="text-[11px] text-slate-400 font-mono leading-none flex items-center gap-1 font-normal">
                                                  <AlertCircle className="h-3 w-3 inline text-slate-300" /> No physical device limits bound.
                                                </span>
                                              );
                                            }

                                            return idxDevices.map((dev: any) => (
                                              <div key={dev.id} className="flex justify-between items-center bg-slate-50 border border-slate-150 p-2 rounded-lg text-[11px] gap-4">
                                                <div>
                                                  <span className="font-bold text-slate-700 block text-[10px] font-mono">📟 Device identifier: {dev.deviceId}</span>
                                                  <span className="text-[9px] text-slate-400 font-mono block font-normal">Bound: {new Date(dev.registeredAt || dev.bondedAt || Date.now()).toLocaleString()}</span>
                                                </div>
                                                <button
                                                  onClick={async () => {
                                                    try {
                                                      const r = await fetch(`/api/global/identity/device-unbind/${dev.id}`, {
                                                        method: 'POST',
                                                        headers: { 'Authorization': `Bearer ${token}` }
                                                      });
                                                      if (r.ok) {
                                                        setSuccessMsg(`Device authorization successfully revoked for ${idx.fullName}!`);
                                                        setTimeout(() => setSuccessMsg(null), 3000);
                                                        await loadSchoolRecords();
                                                        await loadStabilizationData();
                                                      }
                                                    } catch (ex) {
                                                      console.error(ex);
                                                    }
                                                  }}
                                                  className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded text-[9px] font-bold uppercase transition-all cursor-pointer select-none border-none"
                                                >
                                                  Reset Handshake
                                                </button>
                                              </div>
                                            ));
                                          })()}
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUB-VIEW 2: DATA CONSISTENCY ENGINE (TRANSACTION BLOCKING & AUDITING) */}
                  {activeSubTab === 'consistency' && (
                    <div className="space-y-8 animate-fade">
                      {/* Consistency Health Indicators */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex items-center gap-4">
                          <div className="h-12 w-12 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                            <Lock className="h-6 w-6" />
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">Write lock isolation</span>
                            <span className="text-sm font-bold text-slate-850 block mt-1">MUTEX DISTRIBUTED</span>
                            <span className="text-[9px] text-emerald-600 font-mono block">Serialization active</span>
                          </div>
                        </div>

                        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex items-center gap-4">
                          <div className="h-12 w-12 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                            <CheckCircle className="h-6 w-6" />
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">Idempotent Keys Registry</span>
                            <span className="text-sm font-bold text-slate-850 block mt-1">
                              {consistencyStatus?.idempotencyKeyCount || 0} Registered Checksums
                            </span>
                            <span className="text-[9px] text-slate-400 font-mono block">Suppresses duplicate posts</span>
                          </div>
                        </div>

                        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex items-center gap-4">
                          <div className={`h-12 w-12 rounded-lg flex items-center justify-center font-bold ${
                            (consistencyStatus?.conflictsDetected || []).length > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                          }`}>
                            <AlertCircle className="h-6 w-6" />
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">Real-time DB integrity</span>
                            <span className="text-sm font-bold text-slate-850 block mt-1">
                              {consistencyStatus?.conflictsDetected?.length === 0 ? 'STATE EXCELLENT' : `${consistencyStatus?.conflictsDetected?.length} WARNINGS`}
                            </span>
                            <span className="text-[9px] font-mono block">
                              {consistencyStatus?.conflictsDetected?.length === 0 ? '✓ No double-entries found' : '⚠️ Anomalies resolved via self-heal'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Integrity Audit & Self-Healing Action Module */}
                      <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 font-mono uppercase tracking-wider flex items-center gap-2">
                              <span>⚠️ Database static integrity analyzer</span>
                            </h4>
                            <p className="text-[10px] text-slate-450 mt-1">Scanning transactional tables for out-of-order state transitions, double-writings, and duplicate course registrations.</p>
                          </div>
                          <button
                            onClick={triggerSelfHealing}
                            disabled={isSelfHealing}
                            className={`px-4 py-2 text-xs font-semibold rounded text-white flex items-center gap-1.5 transition-all select-none border-none cursor-pointer ${
                              isSelfHealing ? 'bg-slate-350 cursor-not-allowed' : 'bg-indigo-650 hover:bg-indigo-750'
                            }`}
                          >
                            <RefreshCw className={`h-3 w-3 ${isSelfHealing ? 'animate-spin' : ''}`} />
                            {isSelfHealing ? 'Aligning Grid...' : 'Run Automated Self-Healing & Purge'}
                          </button>
                        </div>

                        <div className="space-y-3.5 pt-2">
                          {(!consistencyStatus?.conflictsDetected || consistencyStatus.conflictsDetected.length === 0) ? (
                            <div className="p-4 bg-emerald-50/50 border border-emerald-150 rounded-lg text-emerald-800 text-xs flex items-center gap-2 font-mono">
                              <span>✓</span>
                              <span><strong>STATE SYNCHRONIZATION PERFECT:</strong> Standard isolation constraints have precluded double writes. Zero anomalies found in enrollees or lesson scan directories.</span>
                            </div>
                          ) : (
                            consistencyStatus.conflictsDetected.map((err: any, idx: number) => (
                              <div key={idx} className="p-4 bg-rose-50 border border-rose-150 rounded-lg flex justify-between items-start text-xs font-mono">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="bg-rose-200 text-rose-800 text-[9px] font-bold px-1.5 py-0.2 rounded uppercase">{err.type}</span>
                                    <span className="bg-rose-100 text-rose-700 text-[9px] font-bold px-1.5 py-0.2 rounded uppercase">severity: {err.severity}</span>
                                  </div>
                                  <p className="text-slate-700 text-[11px] leading-relaxed mt-1">{err.message}</p>
                                </div>
                                <span className="text-[10px] text-slate-400">entity_id: {err.entityId}</span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Concurrency Simulator Terminal Block */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Interactive testing simulator */}
                        <div className="lg:col-span-4 bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 font-mono uppercase tracking-wider">Race-Condition Simulator</h4>
                            <p className="text-[10px] text-slate-450 mt-1">Simulate multiple parallel write operations landing simultaneously (e.g. concurrent scanned attendance clocks) and watch standard serial mutex-blocking mechanisms in action.</p>
                          </div>

                          <div className="space-y-4 text-xs">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-slate-500 font-mono block">SELECT TARGET USER</label>
                              <select
                                className="bg-white border text-xs border-slate-250 rounded block w-full p-2 font-sans font-medium text-slate-800"
                                value={simStudentId}
                                onChange={(e) => setSimStudentId(e.target.value)}
                              >
                                <option value="">-- Choose student --</option>
                                {students.map(s => (
                                  <option key={s.id} value={s.id}>{s.name} ({s.regNumber})</option>
                                ))}
                              </select>
                            </div>

                            <button
                              disabled={!simStudentId || concurrencyLoading}
                              onClick={() => {
                                if (simStudentId) {
                                  runConcurrencyStressTest(simStudentId);
                                }
                              }}
                              className={`w-full py-2.5 text-xs text-center font-bold text-white rounded select-none border-none cursor-pointer ${
                                !simStudentId || concurrencyLoading ? 'bg-slate-300 cursor-not-allowed' : 'bg-rose-600 hover:bg-rose-700 shadow-md'
                              }`}
                            >
                              {concurrencyLoading ? 'Synthesizing threads...' : 'Trigger Simulated Concurrency Bomb'}
                            </button>
                          </div>
                        </div>

                        {/* Terminal Logs representing serial mutex locks */}
                        <div className="lg:col-span-8 bg-slate-900 text-sky-400 rounded-xl p-6 border border-slate-950 font-mono shadow-md space-y-3.5">
                          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                            <span className="text-xs text-white uppercase tracking-wider font-bold">Locks serialization console</span>
                            <span className="text-[10px] text-emerald-500 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-900 font-bold uppercase select-none">
                              Transaction safe
                            </span>
                          </div>

                          <div className="space-y-2 text-[11px] max-h-[300px] overflow-y-auto pr-2">
                            {concurrencyLogs.length === 0 ? (
                              <div className="text-slate-500 italic py-12 text-center">
                                No active locks serialization log streams running. Trigger concurrency test on the left card to dispatch simulation outputs.
                              </div>
                            ) : (
                              concurrencyLogs.map((log: string, lIdx: number) => {
                                let logColor = 'text-sky-350';
                                if (log.includes('successfully locks')) logColor = 'text-emerald-400';
                                if (log.includes('conflict detected')) logColor = 'text-rose-400 font-bold animate-pulse';
                                if (log.includes('safely rejected')) logColor = 'text-rose-400';
                                return (
                                  <div key={lIdx} className={`p-1 leading-relaxed ${logColor}`}>
                                    {log}
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Active DB Locks & Idempotent Grid tables */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Active Lease-Mutex Locks */}
                        <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm space-y-4">
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 font-mono uppercase tracking-wider">Active locks directory</h4>
                            <p className="text-[10px] text-slate-450 mt-1 font-sans">Distributed locks active in the operational database. (Short lease locks are autocleaned below expiration thresholds).</p>
                          </div>

                          <div className="divide-y divide-slate-150 space-y-3 text-xs max-h-[250px] overflow-y-auto pr-2 font-mono">
                            {(!consistencyStatus?.activeLocks || consistencyStatus.activeLocks.length === 0) ? (
                              <div className="text-center py-10 text-slate-400 italic">No locks active right now. Database registers locks on active student scans.</div>
                            ) : (
                              consistencyStatus.activeLocks.map((lock: any, lidx: number) => (
                                <div key={lidx} className="flex justify-between items-center pt-3">
                                  <div>
                                    <span className="font-bold text-slate-800 text-[11px]">{lock.lockKey}</span>
                                    <span className="text-[9px] text-slate-400 block mt-0.5">Acquired at: {new Date(lock.acquiredAt).toLocaleTimeString()}</span>
                                  </div>
                                  <div className="text-right">
                                    <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">
                                      Lease: {lock.remainingMs}ms
                                    </span>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        {/* Idempotence Registries */}
                        <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm space-y-4">
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 font-mono uppercase tracking-wider">Idempotency signatures repository</h4>
                            <p className="text-[10px] text-slate-450 mt-1 font-sans">Recently processed request keys to preclude duplicate submissions on rapid clicks.</p>
                          </div>

                          <div className="divide-y divide-slate-150 space-y-3 text-xs max-h-[250px] overflow-y-auto pr-2 font-mono">
                            {(!consistencyStatus?.registeredIdempotentActions || consistencyStatus.registeredIdempotentActions.length === 0) ? (
                              <div className="text-center py-10 text-slate-400 italic">Registry cache is currently clear. Scan attendance to register signatures.</div>
                            ) : (
                              consistencyStatus.registeredIdempotentActions.map((item: any, ididx: number) => (
                                <div key={ididx} className="flex justify-between items-center pt-3">
                                  <div>
                                    <span className="font-bold text-slate-700 text-[11px] block truncate max-w-[220px]">{item.key}</span>
                                    <span className="text-[10px] text-slate-500 block">{item.action}</span>
                                  </div>
                                  <span className="text-[9px] text-slate-400">{new Date(item.timestamp).toLocaleTimeString()}</span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUB-VIEW 3: DECISION INTELLIGENCE & ANALYTICS INTERFACES */}
                  {activeSubTab === 'intelligence' && (
                    <div className="space-y-8 animate-fade">
                      {/* Interactive Decision KPIs */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs">
                          <span className="text-[9px] text-slate-400 font-mono uppercase tracking-wider block font-bold leading-normal">Campus Average GPA</span>
                          <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-3xl font-extrabold text-slate-850 font-sans tracking-tight">
                              {analyticsData?.metrics?.campusAverageGpa || '3.12'}
                            </span>
                            <span className="text-[10px] text-emerald-650 font-bold">/ 4.0</span>
                          </div>
                          <p className="text-[10px] text-slate-450 mt-1">Satisfactory educational grade average</p>
                        </div>

                        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs">
                          <span className="text-[9px] text-slate-400 font-mono uppercase tracking-wider block font-bold leading-normal">Present attendance rate</span>
                          <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-3xl font-extrabold text-slate-850 font-sans tracking-tight">
                              {analyticsData?.metrics?.presentAttendancePct || '84'}%
                            </span>
                            <span className="text-[10px] text-[10px] text-indigo-705 font-bold font-mono">Present</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1 mt-2.5">
                            <div className="bg-indigo-600 h-1 rounded-full" style={{ width: `${analyticsData?.metrics?.presentAttendancePct || 84}%` }} />
                          </div>
                        </div>

                        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs">
                          <span className="text-[9px] text-slate-400 font-mono uppercase tracking-wider block font-bold leading-normal">Operational Late Ratio</span>
                          <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-3xl font-extrabold text-slate-850 font-sans tracking-tight">
                              {analyticsData?.metrics?.lateAttendancePct || '10'}%
                            </span>
                            <span className="text-[10px] text-amber-600 font-mono font-bold leading-normal">Lateness</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1 mt-2.5">
                            <div className="bg-amber-500 h-1 rounded-full" style={{ width: `${analyticsData?.metrics?.lateAttendancePct || 10}%` }} />
                          </div>
                        </div>

                        <div className="bg-white rounded-xl p-6 border border-rose-100 bg-rose-50/10 shadow-xs">
                          <span className="text-[9px] text-rose-500 font-mono uppercase tracking-wider block font-bold leading-normal">At-Risk intervention cases</span>
                          <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-3xl font-extrabold text-rose-600 font-sans tracking-tight">
                              {analyticsData?.metrics?.studentsAtRiskCount || 0} Students
                            </span>
                          </div>
                          <p className="text-[10px] text-rose-500 mt-1 font-mono">Attendance below 75% or GPA &lt; 2.0</p>
                        </div>
                      </div>

                      {/* Visual Curves Block: Attendance Trends & Grade Curves */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* 7-Day Attendance Compliance Line Area Chart (Visual SVG) */}
                        <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm space-y-4">
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 font-mono uppercase tracking-wider flex items-center gap-2">
                              <LineChart className="h-4 w-4 text-slate-500" />
                              <span>7-Day aggregate attendance compliance trend</span>
                            </h4>
                            <p className="text-[10px] text-slate-450 mt-1">Aggregate present percentage of logged enrollees against standard university expectations.</p>
                          </div>

                          {/* Graphical representation */}
                          <div className="relative pt-6">
                            <div className="h-[180px] w-full flex items-end justify-between gap-2 border-b border-slate-200 relative pb-1">
                              {/* Horizontal Grid lines */}
                              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[8px] font-mono text-slate-350 select-none pb-2">
                                <div className="border-b border-dashed border-slate-150 w-full text-right pr-1">100% Expectation</div>
                                <div className="border-b border-dashed border-slate-150 w-full text-right pr-1">75% Warning Line</div>
                                <div className="border-b border-dashed border-slate-150 w-full text-right pr-1">50% Threshold</div>
                                <div className="w-full text-right pr-1">0% Absent Base</div>
                              </div>

                              {/* Loops trends metrics to render bars/lines */}
                              {(!analyticsData?.attendanceTrend || analyticsData.attendanceTrend.length === 0) ? (
                                <div className="absolute inset-0 flex items-center justify-center text-slate-400 italic text-xs">Waiting for attendance records simulation loops.</div>
                              ) : (
                                analyticsData.attendanceTrend.map((pt: any, pIdx: number) => {
                                  const compRate = pt.complianceRate || 80;
                                  return (
                                    <div key={pIdx} className="flex-1 flex flex-col items-center group relative z-10">
                                      {/* Float metric tooltip */}
                                      <div className="absolute bottom-full mb-1 bg-slate-900 text-white rounded text-[9px] font-bold px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none font-mono">
                                        {compRate}% (n={pt.volume})
                                      </div>
                                      
                                      {/* Chart Bar standard */}
                                      <div 
                                        className="w-7 rounded-t-sm transition-all shadow-xs duration-500 bg-linear-to-t hover:from-indigo-600 hover:to-indigo-500"
                                        style={{ 
                                          height: `${Math.max(10, compRate * 1.5)}px`,
                                          background: compRate >= 75 ? 'linear-gradient(to top, #4f46e5, #818cf8)' : 'linear-gradient(to top, #e11d48, #fb7185)'
                                        }} 
                                      />
                                      
                                      {/* Date string label */}
                                      <span className="text-[8px] font-mono text-slate-400 mt-2 rotate-12 select-none">
                                        {String(pt.date).slice(5)}
                                      </span>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Educational grading distribution curving (SVG representation) */}
                        <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm space-y-4">
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 font-mono uppercase tracking-wider flex items-center gap-2">
                              <TrendingUp className="h-4 w-4 text-slate-500" />
                              <span>Student performance bell curve (Grading scale distribution)</span>
                            </h4>
                            <p className="text-[10px] text-slate-450 mt-1">Tracks instructional rigor & stringency across courses to avoid grade inflation or educational anomalies.</p>
                          </div>

                          <div className="pt-6 relative">
                            <div className="h-[180px] w-full flex items-end justify-around border-b border-slate-200 pb-1 relative">
                              {(!analyticsData?.gpaCurve || analyticsData.gpaCurve.length === 0) ? (
                                <div className="text-xs text-slate-405 italic py-12 text-center w-full">Waiting for grading metrics.</div>
                              ) : (
                                analyticsData.gpaCurve.map((gc: any, gcidx: number) => {
                                  const distributionCount = gc.count || 2;
                                  const scaleFactor = Math.min(130, distributionCount * 14);
                                  return (
                                    <div key={gcidx} className="flex flex-col items-center group relative z-10 w-12">
                                      <div className="absolute bottom-full mb-1 bg-slate-800 text-white rounded text-[8px] px-1 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                                        {distributionCount} students
                                      </div>
                                      
                                      {/* Bell Curve Bar representation */}
                                      <div 
                                        className="w-6 rounded-t-lg bg-linear-to-t from-sky-500 to-sky-400 hover:from-sky-600 transition-all duration-400"
                                        style={{ height: `${Math.max(15, scaleFactor)}px` }}
                                      />
                                      
                                      <span className="text-xs font-bold font-mono text-slate-700 mt-2">{gc.grade}</span>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Cohort average GPAs performance comparative ledger */}
                      <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm space-y-4">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 font-mono uppercase tracking-wider">Cohort Comparative Intelligence ledger</h4>
                          <p className="text-[10px] text-slate-450 mt-1">GPA averages, enrollees counts, and attendance benchmarks grouped dynamically by academic cohorts.</p>
                        </div>

                        <div className="overflow-x-auto text-xs animate-fade">
                          <table className="w-full text-left font-sans border-collapse">
                            <thead>
                              <tr className="bg-slate-50 text-slate-400 font-mono text-[9px] tracking-widest font-bold uppercase border-b border-slate-100">
                                <th className="py-2.5 px-4 font-mono">Cohort Descriptor</th>
                                <th className="py-2.5 px-4 font-mono">Total Registrees</th>
                                <th className="py-2.5 px-4 font-mono">Cohort Average GPA</th>
                                <th className="py-2.5 px-4 font-mono">Attendance Compliance Benchmark</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {(!analyticsData?.cohortMetrics || analyticsData.cohortMetrics.length === 0) ? (
                                <tr>
                                  <td colSpan={4} className="py-6 text-center text-slate-400 italic font-mono text-[11px]">No cohort data populated. Configure standard enrollees within directory classes.</td>
                                </tr>
                              ) : (
                                analyticsData.cohortMetrics.map((coh: any, i: number) => (
                                  <tr key={i} className="hover:bg-slate-55/30 transition-colors">
                                    <td className="py-3 px-4 font-bold text-slate-800">{coh.cohortName}</td>
                                    <td className="py-3 px-4 text-slate-600 font-mono">{coh.studentCount} students</td>
                                    <td className="py-3 px-4 font-mono">
                                      <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                                        coh.averageGpa >= 3.0 ? 'bg-emerald-50 text-emerald-800 border border-emerald-150' : 'bg-amber-50 text-amber-850'
                                      }`}>
                                        {coh.averageGpa || '3.2'} / 4.0
                                      </span>
                                    </td>
                                    <td className="py-3 px-4">
                                      <div className="flex items-center gap-2">
                                        <div className="w-24 bg-slate-100 rounded-full h-1.5">
                                          <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${coh.attendanceCompliance || 80}%` }} />
                                        </div>
                                        <span className="font-mono text-[10px] text-slate-600 font-bold">{coh.attendanceCompliance || 80}% Present</span>
                                      </div>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Instructor efficiency index ratings mapping */}
                      <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm space-y-4">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 font-mono uppercase tracking-wider">Dean Office Lecturer Efficiency Indexes</h4>
                          <p className="text-[10px] text-slate-450 mt-1">Quantifying active instructional assignments against timetable compliance, student logins, and grading turnaround efficiency.</p>
                        </div>

                        <div className="overflow-x-auto text-xs animate-fade">
                          <table className="w-full text-left font-sans border-collapse">
                            <thead>
                              <tr className="bg-slate-50 text-slate-400 font-mono text-[9px] tracking-widest font-bold uppercase border-b border-slate-100">
                                <th className="py-2.5 px-4 font-mono">Staff Instructor Name</th>
                                <th className="py-2.5 px-4 font-mono">Linked syllabus codes</th>
                                <th className="py-2.5 px-4 font-mono">Grading responsiveness</th>
                                <th className="py-2.5 px-4 font-mono">Calculated efficiency Index</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {(!analyticsData?.lecturerEfficiency || analyticsData.lecturerEfficiency.length === 0) ? (
                                <tr>
                                  <td colSpan={4} className="py-6 text-center text-slate-400 italic font-mono text-[11px]">No active instructional records located in directory.</td>
                                </tr>
                              ) : (
                                analyticsData.lecturerEfficiency.map((lec: any, i: number) => (
                                  <tr key={i} className="hover:bg-slate-55/30 transition-colors">
                                    <td className="py-3 px-4 font-bold text-slate-800 flex items-center gap-2">
                                      <span className="h-2 w-2 rounded-full bg-indigo-500" />
                                      {lec.name}
                                    </td>
                                    <td className="py-3 px-4 text-slate-550 font-mono">{lec.unitsTaught || 0} Units Taught</td>
                                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600">{lec.gradingResponseRate || 85}% Turnaround</td>
                                    <td className="py-3 px-4">
                                      <div className="flex items-center gap-2">
                                        <span className="font-bold text-indigo-705 px-2 py-0.5 bg-indigo-50 border border-indigo-150 rounded text-[10px] font-mono">
                                          idx: {lec.efficiencyIndex || 90}
                                        </span>
                                      </div>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Predictive Diagnostic academic risk system for student enrollees */}
                      <div className="bg-white rounded-xl p-8 border border-rose-100 bg-rose-50/5 shadow-sm space-y-4">
                        <div>
                          <h4 className="text-xs font-bold text-rose-800 font-mono uppercase tracking-wider">Predictive student monitoring & interventions</h4>
                          <p className="text-[10px] text-rose-600/70 mt-1">Cross-correlating lecture scans and raw cumulative GPAs to trigger early regulatory warnings before exam gating closures.</p>
                        </div>

                        <div className="overflow-x-auto text-xs animate-fade">
                          <table className="w-full text-left font-sans border-collapse">
                            <thead>
                              <tr className="bg-rose-50 text-rose-700 font-mono text-[8.5px] tracking-widest font-bold uppercase border-b border-rose-100">
                                <th className="py-2 px-3 font-mono">Alert target student</th>
                                <th className="py-2 px-3 font-mono">Adherence percentage</th>
                                <th className="py-2 px-3 font-mono">Raw GPA projection</th>
                                <th className="py-2 px-3 font-mono">State indicators</th>
                                <th className="py-2 px-3 font-mono text-right">Emergency alert actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-rose-100">
                              {(!analyticsData?.riskInterventions || analyticsData.riskInterventions.length === 0) ? (
                                <tr>
                                  <td colSpan={5} className="py-8 text-center text-emerald-700 italic font-mono text-[11px]">✓ No student profiles currently categorized under Academic Risk status. Adherence is green.</td>
                                </tr>
                              ) : (
                                analyticsData.riskInterventions.map((st: any, i: number) => {
                                  return (
                                    <tr key={i} className="hover:bg-rose-100/20 transition-colors">
                                      <td className="py-3.5 px-3 font-bold text-slate-800">
                                        <div>{st.name}</div>
                                        <div className="text-[9px] text-slate-400 font-mono mt-0.5">{st.regNumber}</div>
                                      </td>
                                      <td className="py-3.5 px-3 font-mono">
                                        <span className={`font-bold font-mono ${st.attendanceCompliance < 75 ? 'text-rose-600' : 'text-amber-600'}`}>
                                          {st.attendanceCompliance}% Compliance
                                        </span>
                                      </td>
                                      <td className="py-3.5 px-3 font-mono font-bold text-slate-700">{st.currentGPA} GPA</td>
                                      <td className="py-3.5 px-3">
                                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                                          {st.riskIndicators?.map((ind: string, idx: number) => (
                                            <span key={idx} className="bg-rose-100/80 text-rose-700 text-[8.5px] rounded px-1.5 py-0.2 font-mono leading-relaxed border border-rose-200">{ind}</span>
                                          ))}
                                        </div>
                                      </td>
                                      <td className="py-3.5 px-3 text-right">
                                        <button
                                          onClick={async () => {
                                            try {
                                              const h = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
                                              const r = await fetch('/api/admin/announcements', {
                                                method: 'POST',
                                                headers: h,
                                                body: JSON.stringify({
                                                  title: `Academic Performance Alert: ${st.name}`,
                                                  message: `URGENT NOTICE TO DEAN: Student ${st.name} is classified with high risk. Indicators: ${st.riskIndicators?.join(', ')}. Action: Arrange counselling session.`,
                                                  targetAudience: 'students',
                                                  schoolId: st.schoolId || 'sch-1'
                                                })
                                              });
                                              if (r.ok) {
                                                setSuccessMsg(`Emergency Academic Warning successfully enqueued to announcements board for ${st.name}!`);
                                                setTimeout(() => setSuccessMsg(null), 3500);
                                              }
                                            } catch (err) {
                                              console.error(err);
                                            }
                                          }}
                                          className="px-2.5 py-1 text-[9.5px] font-bold uppercase rounded bg-rose-600 hover:bg-rose-700 text-white select-none border-none cursor-pointer"
                                        >
                                          Send Warning Alert
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUB-VIEW 4: EXPORT / SYSTEM INTEROPERABILITY GATEWAY */}
                  {activeSubTab === 'interop' && (
                    <div className="space-y-8 animate-fade">
                      {/* Operational Syncing Matrix cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Outbound LMS Integration syncer */}
                        <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm space-y-4">
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 font-mono uppercase tracking-wider flex items-center gap-2">
                              <Cpu className="h-4 w-4 text-indigo-600" />
                              <span>Outbound LMS Sync Gateway</span>
                            </h4>
                            <p className="text-[10px] text-slate-450 mt-1">Publish student academic directory registries and roster courses directly to external Learning Management Platforms.</p>
                          </div>

                          <div className="space-y-4 font-mono text-xs">
                            {webhooks.map((wh: any) => (
                              <div key={wh.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                                <div className="flex justify-between items-center text-[10px]">
                                  <span className="font-bold text-slate-800">{wh.type} Sync API</span>
                                  <span className={`font-bold px-2 py-0.3 rounded capitalize ${
                                    wh.active ? 'bg-emerald-100 text-emerald-800 font-mono' : 'bg-slate-200 text-slate-600'
                                  }`}>
                                    {wh.active ? 'Active Handshake' : 'Disabled'}
                                  </span>
                                </div>
                                <div className="text-[10px] text-slate-500 truncate mt-0.5 select-all">Gateway URI: {wh.url}</div>
                                <div className="flex justify-between items-center text-[9px] text-slate-400">
                                  <span>Last Handshake payload: {wh.lastStatus === 'success' ? '✓ Dispatched success response (200 OK)' : 'Pending initial push'}</span>
                                  {wh.active && (
                                    <button
                                      disabled={isSyncingLMS}
                                      onClick={() => triggerSISSync(wh.type)}
                                      className={`px-2 py-1 select-none font-bold uppercase rounded border-none cursor-pointer ${
                                        isSyncingLMS ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-indigo-650 hover:bg-indigo-750 text-white'
                                      }`}
                                    >
                                      {isSyncingLMS ? 'Syncing...' : 'Force Sync'}
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Universal Format Export Operations */}
                        <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm space-y-4">
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 font-mono uppercase tracking-wider flex items-center gap-2">
                              <FileText className="h-4 w-4 text-slate-500" />
                              <span>Regulatory & System Interoperability Exporter</span>
                            </h4>
                            <p className="text-[10px] text-slate-450 mt-1">Output fully serialized datasets conforming to standard student information schemas (SIS), state Ministry formats, or printable PDF transcript frames.</p>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                            <a
                              href="/api/admin/interop/export/csv"
                              target="_blank"
                              className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl block text-center space-y-1.5 transition-all text-slate-800 no-underline cursor-pointer group"
                            >
                              <Download className="h-5 w-5 mx-auto text-slate-500 group-hover:scale-110 transition-transform" />
                              <span className="font-bold text-[11px] block">Students List CSV</span>
                              <span className="text-[9px] text-slate-400 block font-normal leading-normal">Download standard tabular student registry logs.</span>
                            </a>

                            <button
                              onClick={() => fetchAndShowSchema('sis-json')}
                              className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-center space-y-1.5 transition-all text-slate-850 select-none cursor-pointer group"
                            >
                              <Activity className="h-5 w-5 mx-auto text-indigo-500 group-hover:scale-110 transition-transform" />
                              <span className="font-bold text-[11px] block">Higher Ed SIS Schema</span>
                              <span className="text-[9px] text-slate-400 block font-normal leading-normal">Generate standard XML/JSON enrollees handshake files.</span>
                            </button>

                            <button
                              onClick={() => fetchAndShowSchema('ministry')}
                              className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-center space-y-1.5 transition-all text-slate-850 select-none cursor-pointer group"
                            >
                              <Building2 className="h-5 w-5 mx-auto text-sky-500 group-hover:scale-110 transition-transform" />
                              <span className="font-bold text-[11px] block">EMIS Regulatory</span>
                              <span className="text-[9px] text-slate-400 block font-normal leading-normal">Generate National Minister of Higher Education payload files.</span>
                            </button>

                            <button
                              onClick={() => fetchAndShowSchema('pdf')}
                              className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-center space-y-1.5 transition-all text-slate-850 select-none cursor-pointer group"
                            >
                              <GraduationCap className="h-5 w-5 mx-auto text-yellow-600 group-hover:scale-110 transition-transform" />
                              <span className="font-bold text-[11px] block">Official Transcript</span>
                              <span className="text-[9px] text-slate-400 block font-normal leading-normal">Review printable academic certification transcripts frame.</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Live payload code viewer block */}
                      {viewedSchema !== 'none' && (
                        <div className="bg-slate-900 rounded-xl border border-slate-950 p-6 space-y-4 animate-fade">
                          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                            <div>
                              <span className="text-[10px] text-indigo-400 font-mono uppercase tracking-widest block font-bold">Dynamic Gateway Payload Sandbox</span>
                              <span className="text-xs font-bold text-white mt-1 block">
                                {viewedSchema === 'emis' ? 'Ministry EMIS Compliance JSON payload' : viewedSchema === 'sis' ? 'SaaS Integrated SIS payload body' : 'Official Academic Transcript Ledger Record'}
                              </span>
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  if (schemaData) {
                                    navigator.clipboard.writeText(JSON.stringify(schemaData, null, 2));
                                    setSuccessMsg("Integration payload copied to clipboard!");
                                    setTimeout(() => setSuccessMsg(null), 3000);
                                  }
                                }}
                                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold uppercase rounded text-[10px] font-mono flex items-center gap-1 cursor-pointer border-none"
                              >
                                <Copy className="h-3 w-3" /> Copy JSON
                              </button>
                              <button
                                onClick={() => { setViewedSchema('none'); setSchemaData(null); }}
                                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-350 font-bold uppercase rounded text-[10px] font-mono cursor-pointer border-none"
                              >
                                Close Code Sandbox
                              </button>
                            </div>
                          </div>

                          {viewedSchema === 'transcript' ? (
                            /* Beautiful readable transcript certification frame */
                            <div className="bg-white text-slate-900 p-8 rounded-lg shadow-inner max-w-2xl mx-auto border-4 border-double border-slate-300 font-serif space-y-6">
                              <div className="text-center border-b pb-4">
                                <h2 className="text-lg font-bold uppercase tracking-wider">{schemaData?.title || 'OFFICIAL TRANSCRIPT'}</h2>
                                <p className="text-[10px] uppercase font-mono tracking-widest text-slate-500 mt-1">{schemaData?.certificationAuthority}</p>
                                <p className="text-[9px] font-mono text-slate-400 mt-0.5">SHA Fingerprint verification index: {schemaData?.academicRegistrarSignature}</p>
                              </div>

                              <div className="space-y-4 font-sans text-xs">
                                <div className="grid grid-cols-2 gap-4 text-[11px] font-mono text-slate-600 italic">
                                  <span>Issued: {new Date(schemaData?.issuedAt).toLocaleString()}</span>
                                  <span className="text-right">Term Validation Code: YEAR-2026-TERM-1</span>
                                </div>

                                <div className="space-y-3 pt-2">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-widest block">Academic Directory Certified Excerpts</span>
                                  <div className="border border-slate-200 rounded-lg overflow-hidden font-sans">
                                    <div className="grid grid-cols-4 bg-slate-100 p-2 font-bold text-[10px] border-b uppercase font-mono text-slate-600">
                                      <span>Enrollee Name</span>
                                      <span>Index Code</span>
                                      <span>Enrollment status</span>
                                      <span className="text-right">Grade Project Average</span>
                                    </div>
                                    <div className="divide-y divide-slate-100 bg-white">
                                      {schemaData?.studentsSummary?.map((std: any, sIdx: number) => (
                                        <div key={sIdx} className="grid grid-cols-4 p-2 text-[11px]">
                                          <span className="font-semibold text-slate-800">{std.name}</span>
                                          <span className="text-slate-500 font-mono">{std.reg}</span>
                                          <span className="text-slate-500 uppercase">{std.academicState}</span>
                                          <span className="text-right font-mono font-bold text-indigo-700">{std.gpa?.toFixed(2)}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="text-center text-[10px] text-slate-350 border-t pt-4 font-mono select-none">
                                --- END OF REGISTRY EXCERPT DIRECTORY ---
                              </div>
                            </div>
                          ) : (
                            /* JSON Schema raw display */
                            <pre className="text-emerald-400 text-xs font-mono p-4 bg-slate-950 rounded-lg overflow-x-auto select-all max-h-[350px] leading-relaxed">
                              {JSON.stringify(schemaData, null, 2)}
                            </pre>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* TAB: DOCUMENTS (Phase 11.7) */}
              {activeTab === 'documents' && (
                <div className="animate-fade-in h-full">
                  <DocumentEnginePortal />
                </div>
              )}

              {/* TAB: COMMUNICATIONS & BROADCASTS */}
              {activeTab === 'communications' && (
                <div className="space-y-4 animate-fade h-[750px] flex flex-col shrink-0">
                  <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col h-full shrink-0">
                    <div className="flex items-center justify-between border-b border-slate-150 pb-4 mb-4">
                      <div>
                        <h3 className="text-sm font-bold text-slate-100 mb-1 font-mono uppercase tracking-wider text-slate-800">Campus Communications & Network</h3>
                        <p className="text-[10px] text-slate-400 font-sans">Broadcast announcements, oversee real-time academic channels, or initiate direct live video panels.</p>
                      </div>
                      <span className="px-2.5 py-1 text-[9px] font-extrabold text-indigo-600 bg-indigo-50 border border-indigo-150 rounded-full font-mono uppercase">
                        Admin Active Comms
                      </span>
                    </div>

                    <div className="flex-1 min-h-0">
                      <CommunicationsHub user={user} />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'timeline' && (
                <AdminAcademicConfig 
                  token={token} 
                  appendLog={appendLog} 
                  isPhoneFrame={isPhoneFrame} 
                />
              )}

              {/* TAB 9: SYLLABUS MAPPING */}
              {activeTab === 'curriculum' && (
                <AdminCurriculumMapping 
                  token={token} 
                  appendLog={appendLog} 
                  isPhoneFrame={isPhoneFrame} 
                />
              )}

              {/* TAB 10: ALLOCATIONS */}
              {activeTab === 'allocation' && (
                <AdminTeachingAllocation 
                  token={token} 
                  appendLog={appendLog} 
                  isPhoneFrame={isPhoneFrame} 
                />
              )}

              {/* TAB 11: TIMETABLE ENGINE */}
              {activeTab === 'timetable' && (
                <AdminTimetableEngine 
                  token={token} 
                  appendLog={appendLog} 
                  isPhoneFrame={isPhoneFrame} 
                />
              )}

              {/* TAB 12: FINANCE ENGINE */}
              {activeTab === 'finance' && (
                <AdminFinanceEngine 
                  token={token}
                  appendLog={appendLog}
                  isPhoneFrame={isPhoneFrame}
                />
              )}

              {/* TAB 13: EXAM & CERTIFICATION ENGINE */}
              {activeTab === 'exams' as any && (
                <AdminExaminationEngine 
                  token={token}
                  appendLog={appendLog}
                  isPhoneFrame={isPhoneFrame}
                />
              )}

              {/* TAB 14: LIBRARIAN MANAGER DASHBOARD */}
              {activeTab === 'library' as any && (
                <LibrarianManagerDashboard />
              )}

              {/* TAB 15: CAMPUS & STUDENT LIFE OPTIONAL MANAGEMENT */}
              {activeTab === 'campus_life' as any && (
                <AdminCampusLifeTab 
                  token={token}
                  appendLog={appendLog}
                />
              )}

              {/* TAB 16: HR, PAYROLL & WORKFORCE MANAGEMENT SYSTEM */}
              {activeTab === 'hr_management' && (
                <AdminHrManagement 
                  token={token}
                  appendLog={appendLog || (() => {})}
                  isPhoneFrame={isPhoneFrame}
                />
              )}

              {/* TAB 17: PROCUREMENT, INVENTORY, ASSET & FACILITIES MANAGEMENT */}
              {activeTab === 'procurement_assets' && (
                <AdminProcurementAssets token={token} appendLog={appendLog} />
              )}

              {/* TAB 18: SYSTEM INTEGRITY WATCHCOMPANION */}
              {activeTab === 'system_health' && (
                <AdminSystemHealth token={token} />
              )}

              {/* TAB 19: UNIFIED PROFILE */}
              {activeTab === 'profile' && (
                <div className="max-w-4xl bg-white rounded-2xl p-6 border border-slate-200">
                  <ProfilePage token={token} user={user} appendLog={appendLog} />
                </div>
              )}
            </>
          )}
        </div>

        {/* =========================================================
            MODALS SECTION 
           ========================================================= */}

        {/* MODAL: ADD DEPARTMENT */}
        <AnimatePresence>
          {showAddDeptModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setShowAddDeptModal(false)} />
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl p-8 max-w-sm w-full border border-slate-150 shadow-2xl relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-slate-900 text-white rounded-xl">
                    <Sliders className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-md font-bold text-slate-900">Add Academic Faculty Division</h3>
                    <p className="text-xs text-slate-400">Map a new department in this school partition.</p>
                  </div>
                </div>

                <form onSubmit={handleAddDept} className="space-y-4" id="dept-form">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono mb-1.5">Department Name</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g., Computer Science, Mechanical Engineering"
                      className="block w-full py-2.5 px-3 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                      value={deptForm.name}
                      onChange={(e) => setDeptForm({ name: e.target.value })}
                    />
                  </div>

                  <div className="flex justify-end gap-2.5 pt-4 text-xs font-semibold">
                    <button type="button" onClick={() => setShowAddDeptModal(false)} className="px-4 py-2 bg-slate-50 rounded-xl hover:bg-slate-100 border border-slate-200 cursor-pointer">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl cursor-pointer shadow">Save Department</button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL: ADD PROGRAM */}
        <AnimatePresence>
          {showAddProgModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setShowAddProgModal(false)} />
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl p-8 max-w-sm w-full border border-slate-150 shadow-2xl relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-slate-900 text-white rounded-xl">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-md font-bold text-slate-900">Add Academic Program</h3>
                    <p className="text-xs text-slate-400">Add degree scopes (BSc Computer Science, etc.).</p>
                  </div>
                </div>

                <form onSubmit={handleAddProg} className="space-y-4" id="prog-form">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono mb-1.5">Program Name / Title</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g., BSc Computer Science"
                      className="block w-full py-2.5 px-3 bg-slate-100/50 border border-slate-200 text-xs rounded-xl focus:outline-none"
                      value={progForm.name}
                      onChange={(e) => setProgForm({...progForm, name: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono mb-1.5">Program Code (e.g., DCS, BIT)</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g., DCS"
                      className="block w-full py-2.5 px-3 bg-slate-100/50 border border-slate-200 text-xs rounded-xl focus:outline-none uppercase font-bold"
                      value={progForm.code}
                      onChange={(e) => setProgForm({...progForm, code: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono mb-1.5">Program Capacity (Optional)</label>
                    <input
                      type="number"
                      placeholder="e.g., 200"
                      className="block w-full py-2.5 px-3 bg-slate-100/50 border border-slate-200 text-xs rounded-xl focus:outline-none font-bold"
                      value={progForm.capacity}
                      onChange={(e) => setProgForm({...progForm, capacity: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono mb-1.5">Parent Department Mapping</label>
                    <select
                      className="block w-full py-2.5 px-3 bg-slate-100/50 border border-slate-200 text-xs rounded-xl focus:outline-none font-bold"
                      value={progForm.departmentId}
                      onChange={(e) => setProgForm({...progForm, departmentId: e.target.value})}
                    >
                      <option value="">Select Department (Optional)</option>
                      {departments.map((d: any) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex justify-end gap-2.5 pt-4 text-xs font-semibold">
                    <button type="button" onClick={() => setShowAddProgModal(false)} className="px-4 py-2 bg-slate-50 rounded-xl hover:bg-slate-100 border border-slate-200 cursor-pointer">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl cursor-pointer shadow">Save Program</button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL: ADD COURSE UNIT */}
        <AnimatePresence>
          {showAddUnitModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setShowAddUnitModal(false)} />
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl p-8 max-w-sm w-full border border-slate-150 shadow-2xl relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-slate-900 text-white rounded-xl">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-md font-bold text-slate-900">Add Academic Unit</h3>
                    <p className="text-xs text-slate-400">Declare curriculum courses like CSC101, etc.</p>
                  </div>
                </div>

                <form onSubmit={handleAddUnit} className="space-y-4" id="unit-form-maker">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono mb-1.5">Acronym</label>
                      <input
                        required
                        maxLength={8}
                        type="text"
                        placeholder="CSC101"
                        className="block w-full py-2.5 px-3 bg-slate-50 border border-slate-200 text-xs rounded-xl font-mono text-center focus:outline-none"
                        value={unitForm.code}
                        onChange={(e) => setUnitForm({...unitForm, code: e.target.value})}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono mb-1.5">Unit Name</label>
                      <input
                        required
                        type="text"
                        placeholder="Programming Fundamentals"
                        className="block w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:outline-none"
                        value={unitForm.name}
                        onChange={(e) => setUnitForm({...unitForm, name: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono mb-1.5 font-mono">Linked Degree Syllabus</label>
                    <select
                      className="block w-full py-2.5 px-3 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:outline-none"
                      value={unitForm.programId}
                      onChange={(e) => setUnitForm({...unitForm, programId: e.target.value})}
                    >
                      <option value="">General Enrollment Core</option>
                      {programs.map((p: any) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex justify-end gap-2.5 pt-4 text-xs font-semibold">
                    <button type="button" onClick={() => setShowAddUnitModal(false)} className="px-4 py-2 bg-slate-50 rounded-xl hover:bg-slate-100 border border-slate-200 cursor-pointer">Cancel</button>
                    <button type="submit" id="unit-submit-btn" className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl cursor-pointer shadow">Save Unit</button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL: ADD ACADEMIC STAFF MEMEBER */}
        <AnimatePresence>
          {showAddStaffModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setShowAddStaffModal(false)} />
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl p-8 max-w-sm w-full border border-slate-150 shadow-2xl relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-slate-900 text-white rounded-xl">
                    <UserSquare2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-md font-bold text-slate-900">Add Faculty Member</h3>
                    <p className="text-xs text-slate-400">Generates login access for lecturing faculty.</p>
                  </div>
                </div>

                <form onSubmit={handleAddStaff} className="space-y-4" id="staff-form-maker">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono mb-1.5">Staff Member Full Name</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g., Dr. Mary Wangari"
                      className="block w-full py-2.5 px-3 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:outline-none"
                      value={staffForm.name}
                      onChange={(e) => setStaffForm({...staffForm, name: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono mb-1.5">Emergency Contact</label>
                      <input
                        type="text"
                        placeholder="0700000000"
                        className="block w-full py-2.5 px-3 bg-slate-50 border border-slate-200 text-xs rounded-xl font-mono focus:outline-none"
                        value={staffForm.phone}
                        onChange={(e) => setStaffForm({...staffForm, phone: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono mb-1.5">Official Role</label>
                      <select
                        className="block w-full py-2.5 px-3 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:outline-none font-sans"
                        value={staffForm.role}
                        onChange={(e) => setStaffForm({...staffForm, role: e.target.value as any})}
                      >
                        <option value="Lecturer">Lecturer</option>
                        <option value="HOD">HOD (Head of Dept)</option>
                        <option value="Dean">Dean of Faculty</option>
                        <option value="Registrar">Registrar</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono mb-1.5 font-mono">Assigned Department</label>
                    <select
                      className="block w-full py-2.5 px-3 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:outline-none"
                      value={staffForm.departmentId}
                      onChange={(e) => setStaffForm({...staffForm, departmentId: e.target.value})}
                    >
                      <option value="">Select Division Workspace (Optional)</option>
                      {departments.map((d: any) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono mb-1.5 font-mono">Operations Email (Will act as Login ID)</label>
                    <input
                      required
                      type="email"
                      placeholder="teacher@nairobihigh.ac.ke"
                      className="block w-full py-2.5 px-3 bg-slate-50 border border-slate-200 text-xs rounded-xl font-mono focus:outline-none"
                      value={staffForm.email}
                      onChange={(e) => setStaffForm({...staffForm, email: e.target.value})}
                    />
                  </div>

                  <div className="flex justify-end gap-2.5 pt-4 text-xs font-semibold">
                    <button type="button" onClick={() => setShowAddStaffModal(false)} className="px-4 py-2 bg-slate-50 rounded-xl hover:bg-slate-100 border border-slate-200 cursor-pointer">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl cursor-pointer shadow">Save Staff</button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL: REGISTER STUDENT MANUALLY */}
        <AnimatePresence>
          {showAddStudentModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setShowAddStudentModal(false)} />
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl p-8 max-w-sm w-full border border-slate-150 shadow-2xl relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-slate-900 text-white rounded-xl">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-md font-bold text-slate-900" id="student-modal-title">Manual Student Registration</h3>
                    <p className="text-xs text-slate-400">Enroll new student into your school rosters.</p>
                  </div>
                </div>

                <form onSubmit={handleAddStudent} className="space-y-4" id="student-creation-form-main">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono mb-1.5">Student Full Name</label>
                    <input
                      required
                      id="student-name-input"
                      type="text"
                      placeholder="e.g., Jane Wanjiku"
                      className="block w-full py-2.5 px-3 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                      value={studentForm.name}
                      onChange={(e) => setStudentForm({...studentForm, name: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono mb-1.5" title="School-wide unique registration identifier">Admission No (Optional)</label>
                      <input
                        id="student-reg-input"
                        type="text"
                        placeholder="Auto-generate"
                        className="block w-full py-2.5 px-3 bg-slate-50 border border-slate-200 text-xs rounded-xl font-mono text-center focus:outline-none focus:ring-2 focus:ring-slate-900"
                        value={studentForm.regNumber === 'AUTO_GENERATED' ? '' : studentForm.regNumber}
                        onChange={(e) => setStudentForm({...studentForm, regNumber: e.target.value || 'AUTO_GENERATED'})}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono mb-1.5">Year of Study</label>
                      <select
                        id="student-year-input"
                        className="block w-full py-2.5 px-3 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:outline-none font-sans"
                        value={studentForm.yearOfStudy}
                        onChange={(e) => setStudentForm({...studentForm, yearOfStudy: e.target.value})}
                      >
                        <option value="1">Year 1</option>
                        <option value="2">Year 2</option>
                        <option value="3">Year 3</option>
                        <option value="4">Year 4</option>
                        <option value="5">Year 5</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono mb-1.5 font-mono">Assigned Study Program</label>
                    <select
                      id="student-program-input"
                      className="block w-full py-2.5 px-3 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:outline-none"
                      value={studentForm.programId}
                      onChange={(e) => setStudentForm({...studentForm, programId: e.target.value})}
                    >
                      <option value="">General Unregistered Enrollment</option>
                      {programs.map((p: any) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono mb-1.5 font-mono">Operational Email Address</label>
                      <input
                        required
                        id="student-email-input"
                        type="email"
                        placeholder="jane.wanjiku@nairobihigh.ac.ke"
                        className="block w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200 text-xs rounded-xl font-mono focus:outline-none"
                        value={studentForm.email}
                        onChange={(e) => setStudentForm({...studentForm, email: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono mb-1.5 font-mono">Contact Phone (Optional)</label>
                    <input
                      type="text"
                      id="student-phone-input"
                      placeholder="0712345678"
                      className="block w-full py-2.5 px-4 bg-slate-50 border border-slate-200 text-xs rounded-xl font-mono focus:outline-none"
                      value={studentForm.phone}
                      onChange={(e) => setStudentForm({...studentForm, phone: e.target.value})}
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <h5 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest mb-3">Parent/Guardian Info</h5>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                       <div className="col-span-2">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono mb-1.5 mt-1">Full Name</label>
                          <input type="text" className="block w-full py-2.5 px-3 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:outline-none" placeholder="e.g. Mary Wanjiku" value={studentForm.parentName} onChange={(e) => setStudentForm({ ...studentForm, parentName: e.target.value })} />
                       </div>
                       <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono mb-1.5">Phone</label>
                          <input type="text" className="block w-full py-2.5 px-3 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:outline-none" placeholder="07XXXXXXXX" value={studentForm.parentPhone} onChange={(e) => setStudentForm({ ...studentForm, parentPhone: e.target.value })} />
                       </div>
                       <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono mb-1.5">Email</label>
                          <input type="email" className="block w-full py-2.5 px-3 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:outline-none" placeholder="parent@mail.com" value={studentForm.parentEmail} onChange={(e) => setStudentForm({ ...studentForm, parentEmail: e.target.value })} />
                       </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2.5 pt-4 text-xs font-semibold">
                    <button type="button" onClick={() => setShowAddStudentModal(false)} className="px-4 py-2 bg-slate-50 rounded-xl hover:bg-slate-100 border border-slate-200 cursor-pointer">Cancel</button>
                    <button type="submit" id="student-submit-btn" className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow cursor-pointer">Enroll Student</button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL: PARENT CREDENTIALS DISPLAY */}
        <AnimatePresence>
          {enrolledStudentCredentials && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setEnrolledStudentCredentials(null)} />
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl p-8 max-w-sm w-full border border-slate-150 shadow-2xl relative z-10">
                <div className="flex items-center gap-3 mb-5 text-emerald-600">
                  <div className="p-2.5 bg-emerald-50 text-emerald-650 rounded-xl">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-950 font-mono uppercase tracking-wider">Parent Account Created</h3>
                    <p className="text-[10px] text-slate-500">Auto-generated login parameters synchronized.</p>
                  </div>
                </div>

                <div className="space-y-4 pt-1">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <div className="flex justify-between items-center text-xs border-b border-slate-100 pb-2">
                      <span className="text-slate-400 font-mono uppercase text-[9px] font-bold">Student Ward:</span>
                      <span className="font-bold text-slate-800">{enrolledStudentCredentials.studentName}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-mono uppercase text-[9px] font-bold">Guardian:</span>
                      <span className="font-semibold text-slate-850">{enrolledStudentCredentials.parentName}</span>
                    </div>
                    {enrolledStudentCredentials.parentEmail && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-450 font-mono uppercase text-[9px] font-bold">Email:</span>
                        <span className="font-mono text-slate-600 text-[10.5px]">{enrolledStudentCredentials.parentEmail}</span>
                      </div>
                    )}
                    {enrolledStudentCredentials.parentPhone && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-450 font-mono uppercase text-[9px] font-bold">Phone:</span>
                        <span className="font-mono text-slate-600 text-[10.5px]">{enrolledStudentCredentials.parentPhone}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-xs bg-indigo-50/50 p-2 rounded-lg border border-indigo-100 mt-2">
                      <span className="text-indigo-600 font-mono uppercase text-[9px] font-bold">Password:</span>
                      <span className="font-mono text-indigo-700 font-bold bg-white px-2 py-0.5 rounded border border-indigo-150 text-[11px]">
                        {enrolledStudentCredentials.parentPassword}
                      </span>
                    </div>
                  </div>

                  <p className="text-[10px] text-amber-600 italic">
                    Note: The parent can use their email or phone number as username and their phone to log in. They will be prompted to change it on their first login session.
                  </p>

                  <div className="pt-2">
                    <button 
                      type="button" 
                      onClick={() => setEnrolledStudentCredentials(null)} 
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition uppercase tracking-wider font-sans cursor-pointer text-center"
                    >
                      Acknowledge & Close
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL: INLINE EDIT STUDENT */}
        <AnimatePresence>
          {editingStudent && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setEditingStudent(null)} />
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl p-8 max-w-sm w-full border border-slate-150 shadow-2xl relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-slate-900 text-white rounded-xl">
                    <Edit3 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-md font-bold text-slate-950">Modify Student Profile</h3>
                    <p className="text-xs text-slate-400">Update current core metrics manually.</p>
                  </div>
                </div>

                <form onSubmit={handleUpdateStudent} className="space-y-4" id="student-edit-form-inner">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono mb-1.5">Full Name</label>
                    <input
                      required
                      id="edit-student-name"
                      type="text"
                      className="block w-full py-2.5 px-3 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:outline-none"
                      value={editingStudent.name}
                      onChange={(e) => setEditingStudent({...editingStudent, name: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono mb-1.5 font-mono">Reg Number</label>
                      <input
                        required
                        id="edit-student-reg"
                        type="text"
                        className="block w-full py-2.5 px-3 bg-slate-100 border border-slate-205 text-xs rounded-xl font-mono text-center focus:outline-none uppercase"
                        value={editingStudent.regNumber}
                        onChange={(e) => setEditingStudent({...editingStudent, regNumber: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono mb-1.5">Year of Study</label>
                      <select
                        id="edit-student-year"
                        className="block w-full py-2.5 px-3 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:outline-none font-sans"
                        value={editingStudent.yearOfStudy}
                        onChange={(e) => setEditingStudent({...editingStudent, yearOfStudy: parseInt(e.target.value, 10)})}
                      >
                        <option value="1">Year 1</option>
                        <option value="2">Year 2</option>
                        <option value="3">Year 3</option>
                        <option value="4">Year 4</option>
                        <option value="5">Year 5</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono mb-1.5 font-mono">Assigned Program</label>
                    <select
                      id="edit-student-program"
                      className="block w-full py-2.5 px-3 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:outline-none"
                      value={editingStudent.programId}
                      onChange={(e) => setEditingStudent({...editingStudent, programId: e.target.value})}
                    >
                      <option value="">General Unregistered Enrollment</option>
                      {programs.map((p: any) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono mb-1.5 font-mono font-bold">Registry Email Address</label>
                    <input
                      required
                      id="edit-student-email"
                      type="email"
                      className="block w-full py-2.5 px-3 bg-slate-50 border border-slate-200 text-xs rounded-xl font-mono focus:outline-none"
                      value={editingStudent.email}
                      onChange={(e) => setEditingStudent({...editingStudent, email: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-35">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono mb-1.5 font-mono">Contact Phone</label>
                      <input
                        type="text"
                        id="edit-student-phone"
                        className="block w-full py-2.5 px-3 bg-slate-50 border border-slate-200 text-xs rounded-xl font-mono focus:outline-none"
                        value={editingStudent.phone || ''}
                        onChange={(e) => setEditingStudent({...editingStudent, phone: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono mb-1.5 font-bold">Active Status</label>
                      <select
                        id="edit-student-status"
                        className="block w-full py-2.5 px-3 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:outline-none font-sans font-bold text-slate-900"
                        value={editingStudent.status || 'Active'}
                        onChange={(e) => setEditingStudent({...editingStudent, status: e.target.value as any})}
                      >
                        <option value="Active">Active</option>
                        <option value="Deferred">Deferred</option>
                        <option value="Suspended">Suspended</option>
                        <option value="Graduated">Graduated</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-35">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono mb-1.5">Current Level</label>
                      <select
                        id="edit-student-current-level"
                        className="block w-full py-2.5 px-3 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:outline-none text-slate-900 font-medium"
                        value={editingStudent.currentLevel || 'Year 1'}
                        onChange={(e) => setEditingStudent({...editingStudent, currentLevel: e.target.value})}
                      >
                        <option value="Year 1">Year 1</option>
                        <option value="Year 2">Year 2</option>
                        <option value="Year 3">Year 3</option>
                        <option value="Year 4">Year 4</option>
                        <option value="Year 5">Year 5</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono mb-1.5">Current Semester</label>
                      <select
                        id="edit-student-current-semester"
                        className="block w-full py-2.5 px-3 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:outline-none text-slate-900 font-medium"
                        value={editingStudent.currentSemester || 'Semester 1'}
                        onChange={(e) => setEditingStudent({...editingStudent, currentSemester: e.target.value})}
                      >
                        <option value="Semester 1">Semester 1</option>
                        <option value="Semester 2">Semester 2</option>
                        <option value="Semester 3">Semester 3</option>
                        <option value="Semester 4">Semester 4</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2.5 pt-4 text-xs font-semibold">
                    <button type="button" onClick={() => setEditingStudent(null)} className="px-4 py-2 bg-slate-50 rounded-xl hover:bg-slate-100 border border-slate-200 cursor-pointer">Cancel</button>
                    <button type="submit" id="edit-student-submit-save" className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow cursor-pointer">Save Changes</button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}
