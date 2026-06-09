/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  Settings, 
  CreditCard, 
  Plus, 
  Power, 
  PowerOff, 
  UserPlus, 
  LogOut, 
  LayoutDashboard, 
  Check, 
  AlertCircle,
  Hash,
  Mail,
  Phone,
  ArrowRight,
  Sparkles,
  ShieldAlert,
  Database,
  Wallet,
  Activity,
  ShieldCheck,
  MessageSquare,
  Globe,
  GraduationCap,
  Heart,
  BookOpen,
  Briefcase,
  Layers,
  Book,
  Home,
  Bus,
  PlayCircle,
  BarChart3,
  Smartphone,
  Laptop,
  ExternalLink,
  Cpu,
  Network,
  FolderTree,
  Workflow,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import CommunicationsHub from './CommunicationsHub';
import { INSTITUTION_TEMPLATES } from '../institutionTemplates';
import { ModalWrapper } from './ModalWrapper';

interface SuperAdminDashboardProps {
  token: string;
  user: any;
  onLogout: () => void;
  appendLog?: (msg: string) => void;
  isPhoneFrame?: boolean;
  onTabChange?: (tab: 'dashboard' | 'schools' | 'admins' | 'subscriptions' | 'settings') => void;
}

export default function SuperAdminDashboard({ 
  token, 
  user, 
  onLogout,
  appendLog,
  isPhoneFrame,
  onTabChange
}: SuperAdminDashboardProps) {
   const [activeTab, setActiveTab] = useState<'dashboard' | 'schools' | 'admins' | 'subscriptions' | 'settings' | 'templates' | 'communications' | 'architecture' | 'wizard'>('dashboard');
  const [schools, setSchools] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Forms states
  const [schoolForm, setSchoolForm] = useState({ name: '', code: '', email: '', phone: '', academicSetup: 'import', institutionType: 'University' });
  const [adminForm, setAdminForm] = useState({ name: '', email: '', phone: '', password: '12345678', schoolId: '' });
  const [templateConfig, setTemplateConfig] = useState<any>(JSON.parse(JSON.stringify(INSTITUTION_TEMPLATES['University'])));
  const [submitLoading, setSubmitLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  // Modal flow states
  const [showCreateSchoolModal, setShowCreateSchoolModal] = useState(false);
  const [showCreateAdminModal, setShowCreateAdminModal] = useState(false);
  
  // Custom interactive multi-tenancy states
  const [selectedSector, setSelectedSector] = useState<string>('University');
  const [activeAuditModule, setActiveAuditModule] = useState<any | null>(null);

  // SaaS Multi-Tenant Controller Dimension states
  const [architectureSubTab, setArchitectureSubTab] = useState<'topology' | 'blueprint' | 'marketplace' | 'branding' | 'health' | 'billing' | 'country' | 'lifecycle'>('topology');

  // Simulated live SaaS states
  const [suspendedTenantIds, setSuspendedTenantIds] = useState<string[]>([]);
  const [archivedTenantIds, setArchivedTenantIds] = useState<string[]>([]);
  const [tenantPlans, setTenantPlans] = useState<Record<string, string>>({
    'sch-nairobi': 'Enterprise',
    'sch-primary': 'Starter',
    'sch-secondary': 'Professional',
    'sch-tvet': 'Professional',
    'sch-college': 'Professional',
    'sch-training': 'Starter'
  });

  // 1. Blueprint state
  const [selectedBlueprintType, setSelectedBlueprintType] = useState<string>('University');

  // 2. Module Marketplace state
  const [selectedMarketplaceSchool, setSelectedMarketplaceSchool] = useState<string>('');
  const [activeOptionalModules, setActiveOptionalModules] = useState<Record<string, string[]>>({
    'sch-nairobi': ['Hostel', 'Transport', 'Library', 'LMS', 'AI', 'Reports'],
    'sch-primary': ['Library', 'Communication'],
    'sch-secondary': ['Library', 'Transport', 'LMS'],
    'sch-tvet': ['ERP', 'LMS', 'AI'],
    'sch-college': ['Library', 'Hostel', 'LMS'],
    'sch-training': ['ERP', 'AI']
  });

  // 3. Branding state
  const [selectedBrandingSchool, setSelectedBrandingSchool] = useState<string>('');
  const [schoolBrands, setSchoolBrands] = useState<Record<string, {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    smsSender: string;
    mobileTheme: string;
    homepageTitle: string;
  }>>({
    'sch-nairobi': {
      primaryColor: '#4f46e5',
      secondaryColor: '#10b981',
      fontFamily: 'Space Grotesk',
      smsSender: 'NUST_TECH',
      mobileTheme: 'Cosmic Slate',
      homepageTitle: 'Nairobi University of Science & Technology Portal'
    },
    'sch-primary': {
      primaryColor: '#0ea5e9',
      secondaryColor: '#f43f5e',
      fontFamily: 'Inter',
      smsSender: 'KID_SCH',
      mobileTheme: 'Bright Play',
      homepageTitle: 'Lower Primary Learning Sanctuary'
    }
  });

  // Branding active input form
  const [brandForm, setBrandForm] = useState({
    primaryColor: '#4f46e5',
    secondaryColor: '#10b981',
    fontFamily: 'Space Grotesk',
    smsSender: 'CAMPUS_SaaS',
    mobileTheme: 'Cosmic Slate',
    homepageTitle: 'SaaS Partner Portal'
  });

  // 4/5. Country & Grading Frame state
  const [selectedCountry, setSelectedCountry] = useState<string>('Kenya');

  // Country framework specifications database
  const countrySpecs: Record<string, {
    currency: string;
    calendar: string;
    grading: string;
    taxRules: string;
    examBody: string;
    phoneFormat: string;
  }> = {
    'Kenya': { currency: 'KES (Shilling)', calendar: 'Term 1-3 (Jan - Nov)', grading: 'A, B, C, D, E (KCSE Standards)', taxRules: 'PAYE (Tier 3.0), NHIF, NSSF Deductions Enforced', examBody: 'KNEC / KICD Guidelines', phoneFormat: '+254 7XX XXX XXX / +254 1XX XXX XXX' },
    'Uganda': { currency: 'UGX (Shilling)', calendar: 'Term 1-3 (Feb - Dec)', grading: 'D1, D2, C3, C4, P7, F9 (UNEB Standards)', taxRules: 'PAYE (Ugandan URA Standard Scale)', examBody: 'UNEB Core curriculum guides', phoneFormat: '+256 7XX XXX XXX' },
    'Tanzania': { currency: 'TZS (Shilling)', calendar: 'Semester 1-2 (Jan - Dec)', grading: 'A, B, C, D, F (NECTA High Distinction)', taxRules: 'TRA Payroll deduction matrices', examBody: 'NECTA Core Academic Council', phoneFormat: '+255 6XX XXX XXX / +255 7XX XXX XXX' },
    'Rwanda': { currency: 'RWF (Franc)', calendar: 'Term 1-3 (Sep - Jul)', grading: 'High Distinction, Merit, Pass (NESA standards)', taxRules: 'RRA PAYE scales & Maternity fund', examBody: 'NESA Rwanda National Assessment', phoneFormat: '+250 78X XXX XXX / +250 79X XXX XXX' },
    'Nigeria': { currency: 'NGN (Naira)', calendar: 'Terms 1-3 (Sep - Jul)', grading: 'A1, B2, C4, C5, C6, D7, E8, F9 (WAEC Standards)', taxRules: 'LIRS / FIRS personal income taxes', examBody: 'WAEC / JAMB unified curriculum matrices', phoneFormat: '+234 80X XXX XXX / +234 90X XXX XXX' },
    'South Africa': { currency: 'ZAR (Rand)', calendar: 'Term 1-4 (Jan - Dec)', grading: 'Level 1-7 (CAPS Matric Performance)', taxRules: 'SARS PAYE scales & UIF integrations', examBody: 'UMALUSI Council / CAPS Policy', phoneFormat: '+27 6X XXX XXXX / +27 7X XXX XXXX' }
  };

  // 6. Global dispatcher network communication state
  const [dispatchType, setDispatchType] = useState<string>('Emergency Alert');
  const [dispatchText, setDispatchText] = useState<string>('Emergency Drills commencing campus wide. Proceed to active safety sector points.');
  const [dispatchAudience, setDispatchAudience] = useState<string>('All Students & Staff');

  // 7. Simulated Lifecycle logs
  const [saasAuditLogs, setSaasAuditLogs] = useState<Array<{ id: string; timestamp: string; action: string; tenant: string; details: string; severity: 'info' | 'success' | 'warn' | 'error' }>>([
    { id: '1', timestamp: '16:04:38', action: 'GATEWAY_BOOT', tenant: 'SmartCampus Cloud', details: 'SaaS Tenancy row-level isolation engines online.', severity: 'success' },
    { id: '2', timestamp: '16:11:15', action: 'BLUEPRINT_GEN', tenant: 'Nairobi Academy Primary', details: 'Structured database parameters parsed for schoolId: sch-primary.', severity: 'info' },
    { id: '3', timestamp: '16:18:52', action: 'TENANT_ONLINE', tenant: 'University of Nairobi', details: 'Sub-domain registry active on *.smartcampusconnect.com.', severity: 'success' }
  ]);

  // Global templates state
  const [templateData, setTemplateData] = useState<{
    faculties: any[];
    departments: any[];
    programs: any[];
    units: any[];
    programUnits: any[];
  }>({ faculties: [], departments: [], programs: [], units: [], programUnits: [] });
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [selectedTemplateTab, setSelectedTemplateTab] = useState<'faculties' | 'departments' | 'programs' | 'units' | 'mappings'>('faculties');
  const [templateSearch, setTemplateSearch] = useState('');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any | null>(null);

  // Template sub-forms
  const [tmpFacultyForm, setTmpFacultyForm] = useState({ name: '', code: '' });
  const [tmpDepartmentForm, setTmpDepartmentForm] = useState({ facultyId: '', name: '' });
  const [tmpProgramForm, setTmpProgramForm] = useState({ departmentId: '', name: '', code: '', capacity: 150 });
  const [tmpUnitForm, setTmpUnitForm] = useState({ departmentId: '', name: '', code: '' });
  const [tmpMappingForm, setTmpMappingForm] = useState({ programId: '', unitId: '' });

  // Load backend data helper
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const h = { 'Authorization': `Bearer ${token}` };
      const [sResp, statsResp] = await Promise.all([
        fetch('/api/super/schools', { headers: h }),
        fetch('/api/super/stats', { headers: h })
      ]);

      if (!sResp.ok || !statsResp.ok) {
        throw new Error('Failed to synchronize server data. Try logging in again.');
      }

      const sData = await sResp.json();
      const statsData = await statsResp.json();

      setSchools(sData);
      setStats(statsData);

      // Pre-select first school in school admin form if available
      if (sData.length > 0 && !adminForm.schoolId) {
        setAdminForm(prev => ({ ...prev, schoolId: sData[0].id }));
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    setTemplatesLoading(true);
    try {
      const resp = await fetch('/api/super/templates', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resp.ok) {
        const data = await resp.json();
        setTemplateData(data);
      }
    } catch (err) {
      console.error("Could not fetch templates", err);
    } finally {
      setTemplatesLoading(false);
    }
  };

  const handleSeedTemplates = async () => {
    if (!confirm('Are you sure you want to restore the global academic templates to factory defaults? This will overwrite existing template codes but will not touch already provisioned schools.')) return;
    setTemplatesLoading(true);
    try {
      const resp = await fetch('/api/super/templates/seed', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resp.ok) {
        setSuccessMsg('Academic Template Library successfully seeded to enterprise defaults!');
        await fetchTemplates();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setTemplatesLoading(false);
    }
  };

  const handleCreateOrUpdateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    setTemplatesLoading(true);
    setError(null);
    try {
      const isEdit = !!editingTemplate;
      const type = selectedTemplateTab; // 'faculties' | 'departments' | 'programs' | 'units' | 'mappings'
      const apiType = type === 'mappings' ? 'programUnits' : type;

      let payload: any = {};
      if (type === 'faculties') payload = tmpFacultyForm;
      else if (type === 'departments') payload = tmpDepartmentForm;
      else if (type === 'programs') payload = tmpProgramForm;
      else if (type === 'units') payload = tmpUnitForm;
      else if (type === 'mappings') payload = tmpMappingForm;

      const url = isEdit 
        ? `/api/super/templates/${apiType}/${editingTemplate.id}`
        : `/api/super/templates/${apiType}`;

      const resp = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!resp.ok) {
        const data = await resp.json();
        throw new Error(data.error || 'Failed to save academic template');
      }

      setSuccessMsg(`Academic template item successfully ${isEdit ? 'updated' : 'created'}!`);
      setShowTemplateModal(false);
      setEditingTemplate(null);
      await fetchTemplates();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setTemplatesLoading(false);
    }
  };

  const handleToggleTemplateStatus = async (item: any, type: string) => {
    setTemplatesLoading(true);
    try {
      const apiType = type === 'mappings' ? 'programUnits' : type;
      const resp = await fetch(`/api/super/templates/${apiType}/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ disabled: !item.disabled })
      });
      if (!resp.ok) throw new Error('Could not toggle template status');
      setSuccessMsg(`Template item successfully ${!item.disabled ? 'disabled' : 'enabled'}.`);
      await fetchTemplates();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setTemplatesLoading(false);
    }
  };

  const handleDeleteTemplate = async (id: string, type: string) => {
    if (!confirm('Are you sure you want to permanently delete this academic template item?')) return;
    setTemplatesLoading(true);
    try {
      const apiType = type === 'mappings' ? 'programUnits' : type;
      const resp = await fetch(`/api/super/templates/${apiType}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!resp.ok) throw new Error('Could not delete template item');
      setSuccessMsg('Academic template item successfully deleted.');
      await fetchTemplates();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setTemplatesLoading(false);
    }
  };

  const openTemplateAddModal = () => {
    setEditingTemplate(null);
    if (selectedTemplateTab === 'faculties') {
      setTmpFacultyForm({ name: '', code: '' });
    } else if (selectedTemplateTab === 'departments') {
      const facId = templateData.faculties[0]?.id || '';
      setTmpDepartmentForm({ facultyId: facId, name: '' });
    } else if (selectedTemplateTab === 'programs') {
      const deptId = templateData.departments[0]?.id || '';
      setTmpProgramForm({ departmentId: deptId, name: '', code: '', capacity: 150 });
    } else if (selectedTemplateTab === 'units') {
      const deptId = templateData.departments[0]?.id || '';
      setTmpUnitForm({ departmentId: deptId, name: '', code: '' });
    } else if (selectedTemplateTab === 'mappings') {
      const progId = templateData.programs[0]?.id || '';
      const unitId = templateData.units[0]?.id || '';
      setTmpMappingForm({ programId: progId, unitId: unitId });
    }
    setShowTemplateModal(true);
  };

  const openTemplateEditModal = (item: any) => {
    setEditingTemplate(item);
    if (selectedTemplateTab === 'faculties') {
      setTmpFacultyForm({ name: item.name, code: item.code });
    } else if (selectedTemplateTab === 'departments') {
      setTmpDepartmentForm({ facultyId: item.facultyId, name: item.name });
    } else if (selectedTemplateTab === 'programs') {
      setTmpProgramForm({ departmentId: item.departmentId, name: item.name, code: item.code, capacity: item.capacity || 150 });
    } else if (selectedTemplateTab === 'units') {
      setTmpUnitForm({ departmentId: item.departmentId, name: item.name, code: item.code });
    } else if (selectedTemplateTab === 'mappings') {
      setTmpMappingForm({ programId: item.programId, unitId: item.unitId });
    }
    setShowTemplateModal(true);
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  useEffect(() => {
    if (activeTab === 'templates') {
      fetchTemplates();
    }
  }, [activeTab, token]);

  // Handle Create School submits
  const handleCreateSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolForm.name || !schoolForm.code || !schoolForm.email || !schoolForm.phone) {
      setError('Please fill in all school metadata fields.');
      return;
    }

    setSubmitLoading(true);
    setSuccessMsg(null);
    try {
      const resp = await fetch('/api/super/schools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...schoolForm,
          templateConfig
        })
      });

      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Failed to create school');

      setSuccessMsg(`School "${data.name}" (ID: ${data.id}) successfully provisioned with ${data.institutionType} template!`);
      setSchoolForm({ name: '', code: '', email: '', phone: '', academicSetup: 'import', institutionType: 'University' });
      setTemplateConfig(JSON.parse(JSON.stringify(INSTITUTION_TEMPLATES['University'])));
      setShowCreateSchoolModal(false);
      
      // Auto-populate newly created school ID inside Admin Form to streamline creation
      setAdminForm(prev => ({ ...prev, schoolId: data.id }));
      
      // Refresh Lists
      await fetchData();
      
      // Prompt user to immediately bind an administrator
      setShowCreateAdminModal(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handle Create School Admin submits
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminForm.name || !adminForm.email || !adminForm.password || !adminForm.schoolId) {
      setError('Please provide Name, Email, Password, and select a Target School.');
      return;
    }

    setSubmitLoading(true);
    setSuccessMsg(null);
    try {
      const resp = await fetch('/api/super/admins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(adminForm)
      });

      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Failed to create School Administrator account');

      setSuccessMsg(`Administrator "${data.admin.name}" successfully created and linked to ${data.schoolName}!`);
      // Reset Admin Form to standard default
      setAdminForm({ name: '', email: '', phone: '', password: '12345678', schoolId: schools[0]?.id || '' });
      setShowCreateAdminModal(false);
      await fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handle toggle school (active/inactive state)
  const handleToggleSchool = async (schoolId: string) => {
    setError(null);
    try {
      const resp = await fetch(`/api/super/schools/${schoolId}/toggle`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Failed to toggle school state');

      await fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Mobile/Phone Viewport Render Mode
  if (isPhoneFrame) {
    return (
      <div className="flex-1 bg-slate-50 flex flex-col h-full overflow-hidden relative text-slate-850 font-sans">
        {/* Material 3 AppBar */}
        <div className="h-14 bg-indigo-600 text-white flex items-center justify-between px-4 shadow sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-700 font-mono text-xs font-bold flex items-center justify-center border border-indigo-500 text-white uppercase">
              {user.name ? user.name.substring(0, 2) : 'SA'}
            </div>
            <div>
              <h1 className="text-xs font-bold tracking-tight">Super Admin</h1>
              <p className="text-[9px] text-indigo-200">Tenant Control Platform</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => {
                fetchData();
                appendLog?.('[SYSTEM] Loaded school list & directory stats from Cloud SQL.');
              }}
              className="p-1.5 hover:bg-indigo-700/60 rounded-full transition-all cursor-pointer"
            >
              <Database className="h-3.5 w-3.5" />
            </button>
            <button 
              onClick={onLogout}
              className="p-1.5 hover:bg-indigo-700/60 rounded-full transition-all cursor-pointer text-red-100"
              title="Sign Out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Scrollable Viewport Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-[10px] text-red-650 font-semibold flex items-center gap-1.5">
              <span>⚠️ {error}</span>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-450">
              <span className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-[9px] font-mono font-bold uppercase tracking-wider">Syncing Workspace VM...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: HOMESTATS MODULE */}
              {activeTab === 'dashboard' && (
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl text-white shadow-md shadow-indigo-100 relative overflow-hidden">
                    <p className="text-[9px] font-mono text-indigo-200 uppercase tracking-wider font-bold">Workspace Status</p>
                    <h3 className="text-base font-bold font-sans mt-0.5">System Online</h3>
                    <p className="text-[10px] text-indigo-100 mt-1">Multi-tenant directories are synchronized with C-Ring databases.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
                      <p className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-bold">Total Tenants</p>
                      <h4 className="text-lg font-extrabold text-slate-850 mt-0.5">{stats?.totalSchools || 0}</h4>
                    </div>
                    <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
                      <p className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-bold">Operators</p>
                      <h4 className="text-lg font-extrabold text-slate-850 mt-0.5">{stats?.totalAdmins || 0}</h4>
                    </div>
                  </div>

                  <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2.5 shadow-xs">
                    <h4 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wide">Registry Partition Directory</h4>
                    <div className="space-y-1.5">
                      {schools.slice(0, 3).map(s => (
                        <div key={s.id} className="flex justify-between items-center py-1.5 border-b border-slate-100 text-[11px]">
                          <span className="font-semibold text-slate-750">{s.name}</span>
                          <span className="text-[9px] font-mono text-indigo-650 bg-indigo-50 border border-indigo-100 font-bold px-1.5 py-0.5 rounded">
                            {s.code}
                          </span>
                        </div>
                      ))}
                      {schools.length === 0 && (
                        <p className="text-[10px] text-slate-400">No schools registered inside database.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: TENANTS LIST */}
              {activeTab === 'schools' && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-500">Active College Partitions</h3>
                    <button
                      onClick={() => {
                        setShowCreateSchoolModal(true);
                        appendLog?.('[DEBUG] BottomSheet open request: create_school_form');
                      }}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" /> Add Tenant
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {schools.map(school => (
                      <div key={school.id} className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-150 text-indigo-700 font-mono text-xs font-extrabold flex flex-col items-center justify-center uppercase shrink-0 leading-none">
                            <span className="text-[10px] font-extrabold">{school.code.substring(0, 3)}</span>
                            <span className="text-[6.5px] text-indigo-500 font-bold tracking-tighter mt-0.5">{school.institutionType ? school.institutionType.split(' ')[0] : 'Univ'}</span>
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="text-xs font-bold text-slate-850 truncate">{school.name}</h4>
                              <span className="text-[7.5px] font-mono font-bold px-1.5 py-0.2 bg-indigo-50/70 text-indigo-650 border border-indigo-100 rounded">
                                {school.institutionType || 'University'}
                              </span>
                            </div>
                            <p className="text-[9px] text-indigo-500 font-mono font-medium truncate mt-0.5">{school.code.toLowerCase()}.smartcampusconnect.com</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            handleToggleSchool(school.id);
                            appendLog?.(`[DEBUG] Toggle school operational status. ID: ${school.id}`);
                          }}
                          className={`p-1.5 rounded-lg transition-all cursor-pointer border shrink-0 ${
                            school.disabled
                              ? 'bg-red-50 border-red-200 text-red-650'
                              : 'bg-emerald-50 border-emerald-200 text-emerald-650'
                          }`}
                        >
                          {school.disabled ? <PowerOff className="h-3.5 w-3.5" /> : <Power className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    ))}
                    {schools.length === 0 && (
                      <p className="text-[10px] text-slate-400 text-center py-6">No school partitions have been created yet.</p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: ADMINS / OPERATORS */}
              {activeTab === 'admins' && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-500">Provisioned Admin Keys</h3>
                    <button
                      onClick={() => {
                        setShowCreateAdminModal(true);
                        appendLog?.('[DEBUG] BottomSheet open request: create_admin_form');
                      }}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" /> Bind Admin
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {schools.filter(sc => sc.administrators && sc.administrators.length > 0).flatMap(sc => (
                      sc.administrators.map((ad: any, keyIdx: number) => (
                        <div key={`${sc.id}-ad-${keyIdx}`} className="p-3 bg-white border border-slate-205 rounded-xl shadow-xs space-y-1.5">
                          <div className="flex justify-between items-center">
                            <h4 className="text-xs font-extrabold text-slate-800">{ad.name}</h4>
                            <span className="text-[8px] font-mono font-bold bg-indigo-50 border border-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded uppercase">
                              {sc.code}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-450 font-mono">{ad.email}</p>
                          <div className="flex justify-between items-center pt-1.5 border-t border-slate-100 text-[10px] text-slate-500">
                            <span>Phone: {ad.phone || 'N/A'}</span>
                            <span className="font-mono text-slate-400 font-bold">Key: 12345678</span>
                          </div>
                        </div>
                      ))
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: SUBSCRIPTIONS */}
              {activeTab === 'subscriptions' && (
                <div className="space-y-4 animate-fade">
                  <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-500">Tenant Subscription Matrix</h3>
                  <div className="space-y-2.5">
                    {schools.map(sc => (
                      <div key={sc.id} className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs flex justify-between items-center gap-2">
                        <div>
                          <h4 className="text-xs font-extrabold text-slate-800">{sc.name}</h4>
                          <span className="text-[8px] font-mono text-emerald-600 font-bold bg-emerald-50 px-1 rounded block mt-0.5 w-max border border-emerald-100">
                            Enterprise Tier
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-slate-900">Ksh 30,000/mo</p>
                          <p className="text-[8px] font-mono text-slate-400 mt-0.5">Renewal: 2026-12-31</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: GLOBAL CONFIG */}
              {activeTab === 'settings' && (
                <div className="space-y-4 animate-fade">
                  <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-500">Diagnostic Controls</h3>
                  <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-xs">
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <div>
                        <h4 className="font-bold text-slate-800">System Trace Log Debugger</h4>
                        <p className="text-[9px] text-slate-400">Outputs file reads dynamically inside the console terminal.</p>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded text-indigo-600 focus:ring-indigo-500/20" />
                    </div>
                    <div className="flex items-center justify-between gap-3 text-xs pt-3 border-t border-slate-100">
                      <div>
                        <h4 className="font-bold text-slate-800">Offline Fallback Engine</h4>
                        <p className="text-[9px] text-slate-400">Stores mock tokens in memory if server socket closes.</p>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded text-indigo-600 focus:ring-indigo-500/20" />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Floating Action Button (FAB) relative to active screen content */}
        {activeTab === 'schools' && !loading && (
          <button
            onClick={() => {
              setShowCreateSchoolModal(true);
              appendLog?.('[DEBUG] Pressed Floating Action Button (FAB) -> Open Add School BottomSheet');
            }}
            className="absolute bottom-16 right-5 w-12 h-12 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-2xl shadow-lg shadow-indigo-500/30 font-bold flex items-center justify-center transition-all cursor-pointer z-25"
          >
            <Plus className="h-6 w-6" />
          </button>
        )}

        {activeTab === 'admins' && !loading && (
          <button
            onClick={() => {
              setShowCreateAdminModal(true);
              appendLog?.('[DEBUG] Pressed Floating Action Button (FAB) -> Open Bind Operator BottomSheet');
            }}
            className="absolute bottom-16 right-5 w-12 h-12 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-2xl shadow-lg shadow-indigo-500/30 font-bold flex items-center justify-center transition-all cursor-pointer z-25"
          >
            <UserPlus className="h-6 w-6" />
          </button>
        )}

        {/* Material 3 Bottom Navigation Bar */}
        <div className="h-[52px] bg-slate-900 border-t border-slate-800 flex items-center justify-around px-2 z-30 shrink-0 select-none">
          <button
            onClick={() => {
              setActiveTab('dashboard');
              onTabChange?.('dashboard');
            }}
            className={`flex flex-col items-center gap-0.5 transition-all text-[9px] cursor-pointer font-bold uppercase tracking-wider ${
              activeTab === 'dashboard' ? 'text-indigo-400 shadow-xs scale-105' : 'text-slate-500 hover:text-slate-350'
            }`}
          >
            <span>•</span><span>Home</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('schools');
              onTabChange?.('schools');
            }}
            className={`flex flex-col items-center gap-0.5 transition-all text-[9px] cursor-pointer font-bold uppercase tracking-wider ${
              activeTab === 'schools' ? 'text-indigo-400 shadow-xs scale-105' : 'text-slate-500 hover:text-slate-350'
            }`}
          >
            <span>•</span><span>Tenants</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('admins');
              onTabChange?.('admins');
            }}
            className={`flex flex-col items-center gap-0.5 transition-all text-[9px] cursor-pointer font-bold uppercase tracking-wider ${
              activeTab === 'admins' ? 'text-indigo-400 shadow-xs scale-105' : 'text-slate-500 hover:text-slate-350'
            }`}
          >
            <span>•</span><span>Operators</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('subscriptions');
              onTabChange?.('subscriptions');
            }}
            className={`flex flex-col items-center gap-0.5 transition-all text-[9px] cursor-pointer font-bold uppercase tracking-wider ${
              activeTab === 'subscriptions' ? 'text-indigo-400 shadow-xs scale-105' : 'text-slate-500 hover:text-slate-350'
            }`}
          >
            <span>•</span><span>Bills</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('settings');
              onTabChange?.('settings');
            }}
            className={`flex flex-col items-center gap-0.5 transition-all text-[9px] cursor-pointer font-bold uppercase tracking-wider ${
              activeTab === 'settings' ? 'text-indigo-400 shadow-xs scale-105' : 'text-slate-500 hover:text-slate-350'
            }`}
          >
            <span>•</span><span>Configs</span>
          </button>
        </div>

        {/* MODAL BOTTOMSHEET OVERLAYS (Integrated with native modal form handlers!) */}
        <AnimatePresence>
          {showCreateSchoolModal && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-45 p-4">
              <ModalWrapper title="Add Campus Tenant" onClose={() => { setShowCreateSchoolModal(false); appendLog?.('[DEBUG] Dismissed Add Campus BottomSheet.'); }}>
                <form onSubmit={handleCreateSchool} className="space-y-3.5">
                  <div>
                    <label className="block text-[8px] font-bold text-slate-450 uppercase tracking-widest font-mono mb-1">Campus Legal Name</label>
                    <input 
                      required
                      type="text"
                      className="block w-full py-1.5 px-2 bg-slate-100 border border-slate-200 text-xs rounded outline-none" 
                      placeholder="e.g. Harvard University"
                      value={schoolForm.name}
                      onChange={(e) => setSchoolForm({...schoolForm, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-bold text-slate-450 uppercase tracking-widest font-mono mb-1">Unique Prefix Code</label>
                    <input 
                      required
                      type="text"
                      maxLength={6}
                      className="block w-full py-1.5 px-2 bg-slate-100 border border-slate-200 text-xs rounded outline-none font-mono font-bold uppercase" 
                      placeholder="e.g. HU"
                      value={schoolForm.code}
                      onChange={(e) => setSchoolForm({...schoolForm, code: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[8px] font-bold text-slate-450 uppercase tracking-widest font-mono mb-1">Registrar Email</label>
                      <input 
                        required
                        type="email"
                        className="block w-full py-1.5 px-2 bg-slate-100 border border-slate-200 text-xs rounded outline-none" 
                        placeholder="registrar@"
                        value={schoolForm.email}
                        onChange={(e) => setSchoolForm({...schoolForm, email: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-bold text-slate-450 uppercase tracking-widest font-mono mb-1">HQ Phone</label>
                      <input 
                        required
                        type="text"
                        className="block w-full py-1.5 px-2 bg-slate-100 border border-slate-200 text-xs rounded outline-none font-mono" 
                        placeholder="+1"
                        value={schoolForm.phone}
                        onChange={(e) => setSchoolForm({...schoolForm, phone: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[8px] font-bold text-slate-450 uppercase tracking-widest font-mono mb-1">Academic Setup Option</label>
                    <select
                      className="block w-full py-1.5 px-2 bg-slate-100 border border-slate-200 text-xs rounded outline-none font-medium"
                      value={schoolForm.academicSetup || 'import'}
                      onChange={(e) => setSchoolForm({...schoolForm, academicSetup: e.target.value})}
                    >
                      <option value="import">Import Corporate Templates</option>
                      <option value="empty">Start Empty Sandbox</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-bold shadow-md shadow-indigo-100 cursor-pointer transition-all"
                  >
                    {submitLoading ? 'Provisioning Tenant...' : 'Provision Campus Tenant'}
                  </button>
                </form>
              </ModalWrapper>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showCreateAdminModal && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-45 p-4">
              <ModalWrapper title="Assign Campus Operator" onClose={() => { setShowCreateAdminModal(false); appendLog?.('[DEBUG] Dismissed Add Admin BottomSheet.'); }}>
                <form onSubmit={handleCreateAdmin} className="space-y-3.5">
                  <div>
                    <label className="block text-[8px] font-bold text-slate-450 uppercase tracking-widest font-mono mb-1">Full Legal Name</label>
                    <input 
                      required
                      type="text"
                      className="block w-full py-1.5 px-2 bg-slate-100 border border-slate-200 text-xs rounded outline-none" 
                      placeholder="e.g. Dr. Jane Smith"
                      value={adminForm.name}
                      onChange={(e) => setAdminForm({...adminForm, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-bold text-slate-455 uppercase tracking-widest font-mono mb-1">Target Campus Partition</label>
                    <select 
                      required
                      className="block w-full py-1.5 px-2 bg-slate-100 border border-slate-200 text-xs rounded outline-none bg-white" 
                      value={adminForm.schoolId}
                      onChange={(e) => setAdminForm({...adminForm, schoolId: e.target.value})}
                    >
                      {schools.map(sc => (
                        <option key={sc.id} value={sc.id}>{sc.name} ({sc.code})</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[8px] font-bold text-slate-450 uppercase tracking-widest font-mono mb-1">Operator Email</label>
                      <input 
                        required
                        type="email"
                        className="block w-full py-1.5 px-2 bg-slate-100 border border-slate-200 text-xs rounded outline-none" 
                        placeholder="operator@campus"
                        value={adminForm.email}
                        onChange={(e) => setAdminForm({...adminForm, email: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-bold text-slate-450 uppercase tracking-widest font-mono mb-1">HQ Phone</label>
                      <input 
                        type="text"
                        className="block w-full py-1.5 px-2 bg-slate-100 border border-slate-200 text-xs rounded outline-none font-mono" 
                        placeholder="+1"
                        value={adminForm.phone}
                        onChange={(e) => setAdminForm({...adminForm, phone: e.target.value})}
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-bold shadow-md shadow-indigo-100 cursor-pointer transition-all"
                  >
                    {submitLoading ? 'Link account keys...' : 'Link Campus Operator Keys'}
                  </button>
                </form>
              </ModalWrapper>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden font-sans">
      
      {/* Side visual navigation drawer containing Super Admin panel options */}
      <aside className="w-64 bg-slate-900 flex flex-col justify-between border-r border-slate-800 flex-shrink-0">
        <div>
          <div className="h-20 flex items-center px-6 border-b border-slate-800">
            <div className="w-8 h-8 bg-indigo-500 rounded flex items-center justify-center mr-3 shadow-sm shadow-indigo-500/20">
              <div className="w-4 h-4 border-2 border-white transform rotate-45"></div>
            </div>
            <span className="text-white font-bold tracking-tight text-lg">SCC <span className="text-indigo-400 font-normal">X</span></span>
          </div>

          <div className="py-6">
            <div className="px-6 mb-4">
              <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest font-mono">Main Menu</p>
            </div>
            <nav className="space-y-1 px-3">
              <button
                onClick={() => { setActiveTab('dashboard'); setError(null); }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded transition-colors text-xs font-medium cursor-pointer ${
                  activeTab === 'dashboard' 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <LayoutDashboard className="h-4.5 w-4.5 opacity-90" />
                <span>Dashboard overview</span>
              </button>

              <button
                onClick={() => { setActiveTab('schools'); setError(null); }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded transition-colors text-xs font-medium cursor-pointer ${
                  activeTab === 'schools' 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <Building2 className="h-4.5 w-4.5 opacity-90" />
                <span>Manage Schools</span>
              </button>

              <button
                onClick={() => { setActiveTab('admins'); setError(null); }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded transition-colors text-xs font-medium cursor-pointer ${
                  activeTab === 'admins' 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <Users className="h-4.5 w-4.5 opacity-90" />
                <span>School Admins</span>
              </button>

              <div className="px-3 pt-6 pb-2">
                <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest font-mono">Global Platform</p>
              </div>

              <button
                onClick={() => { setActiveTab('subscriptions'); setError(null); }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded transition-colors text-xs font-medium cursor-pointer ${
                  activeTab === 'subscriptions' 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <CreditCard className="h-4.5 w-4.5 opacity-90" />
                <span>Tenant Subscriptions</span>
              </button>

              <button
                onClick={() => { setActiveTab('templates'); setError(null); }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded transition-colors text-xs font-medium cursor-pointer ${
                  activeTab === 'templates' 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <Database className="h-4.5 w-4.5 opacity-90" />
                <span>Academic Templates</span>
              </button>

              <button
                onClick={() => { setActiveTab('communications'); setError(null); }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded transition-colors text-xs font-medium cursor-pointer ${
                  activeTab === 'communications' 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <MessageSquare className="h-4.5 w-4.5 opacity-90 text-indigo-400" />
                <span className="truncate">Phase 5: Comms & Media</span>
              </button>

              <button
                onClick={() => { setActiveTab('settings'); setError(null); }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded transition-colors text-xs font-medium cursor-pointer ${
                  activeTab === 'settings' 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <Settings className="h-4.5 w-4.5 opacity-90" />
                <span>System Settings</span>
              </button>

              <button
                onClick={() => { setActiveTab('architecture'); setError(null); }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded transition-colors text-xs font-medium cursor-pointer mt-4 border border-indigo-500/30 ${
                  activeTab === 'architecture' 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'bg-indigo-900/20 text-indigo-300 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <Database className="h-4.5 w-4.5 opacity-90 text-indigo-400" />
                <span className="truncate">Phase 4 Architecture</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Current Logger User & Action */}
        <div className="p-6 border-t border-slate-800">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center border border-slate-600 text-xs font-bold text-indigo-400 font-mono">
              SA
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
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Primary Dashboard Content Area */}
      <main className="flex-grow flex flex-col overflow-y-auto">
        
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between flex-shrink-0">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">SmartCampusConnect X</span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight capitalize mt-0.5">{activeTab} Overview</h1>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowCreateSchoolModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded shadow-md shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create New School</span>
            </button>
            <button
              onClick={() => setShowCreateAdminModal(true)}
              disabled={schools.length === 0}
              className="px-4 py-2 bg-slate-100 text-slate-700 border border-slate-200 rounded text-xs font-semibold hover:bg-slate-200 disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Create School Admin</span>
            </button>
          </div>
        </header>

        {/* System Messages Alerts */}
        <div className="max-w-7xl w-full mx-auto px-8 mt-6">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="bg-red-50 border border-red-100 rounded-2xl p-4 text-xs text-red-600 flex items-start gap-3"
              >
                <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-bold">System Status Warning</span>
                  <p className="mt-0.5">{error}</p>
                </div>
              </motion.div>
            )}

            {successMsg && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="bg-emerald-50 border border-emerald-150 rounded-2xl p-4 text-xs text-emerald-700 flex items-start gap-3"
              >
                <Check className="h-5 w-5 mt-0.5 flex-shrink-0" id="success-done-icon" />
                <div>
                  <span className="font-bold">Database Synchronized</span>
                  <p className="mt-0.5">{successMsg}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

          {/* Tab switcher render engine */}
        <div className="p-8 max-w-7xl w-full mx-auto h-full flex flex-col">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-4 border-slate-350 border-t-slate-900 rounded-full animate-spin" />
              <p className="text-xs text-slate-550 font-mono">Synchronizing state tables from persistence...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: OVERVIEW METRIC TILES */}
              {activeTab === 'dashboard' && stats && (
                <div className="space-y-8">
                  {/* Big visual banner and date */}
                  <div className="bg-slate-900 rounded-xl p-8 text-white relative overflow-hidden shadow-lg shadow-slate-200 animate-fade">
                    <div className="absolute right-0 bottom-0 pointer-events-none opacity-5">
                      <ShieldAlert className="w-72 h-72 translate-x-12 translate-y-12" />
                    </div>
                    <span className="px-2 py-0.5 bg-slate-800 rounded text-[10px] font-mono tracking-widest text-emerald-400 border border-slate-700 font-bold uppercase">
                      Super Administrator Power Panel
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-light tracking-tight mt-4 font-sans font-medium">
                      Campus Network Directory Dashboard
                    </h2>
                    <p className="text-slate-400 text-xs max-w-xl mt-2 leading-relaxed font-sans">
                      Provision multi-tenant academic database configurations, disable/enable schools immediately, and designate secure school operator privileges at Nairobi High School and others.
                    </p>
                  </div>

                  {/* Operational stats grids */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm col-span-1">
                      <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1">Total Schools</p>
                      <p className="text-3xl font-bold text-slate-900">{stats.totalSchools}</p>
                      <div className="mt-2 text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 inline-block font-mono">Registered</div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm col-span-1">
                      <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1">Active Campuses</p>
                      <p className="text-3xl font-bold text-slate-900">{stats.activeSchools}</p>
                      <div className="mt-2 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 inline-block font-mono">Live Access</div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm col-span-1">
                      <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1">Administrators</p>
                      <p className="text-3xl font-bold text-slate-900">{stats.totalAdmins}</p>
                      <div className="mt-2 text-[10px] text-indigo-650 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 inline-block font-mono">Avg 2 per school</div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm col-span-1">
                      <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1">Global Students</p>
                      <p className="text-3xl font-bold text-slate-900">{stats.totalStudents}</p>
                      <div className="mt-2 text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 inline-block font-mono">Total Enrolled</div>
                    </div>
                  </div>

                  {/* Simple operational directions and logs */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                      <h3 className="text-sm font-semibold tracking-tight uppercase tracking-wider text-slate-400 mb-4 font-mono font-bold">
                        Active Tenancy Directory
                      </h3>
                      <div className="divide-y divide-slate-100">
                        {schools.length === 0 ? (
                          <div className="py-8 text-center text-xs text-slate-400 font-mono">
                            No schools registered. Click "Create New School" above to begin.
                          </div>
                        ) : (
                          schools.map((school, i) => (
                            <div key={school.id} className="py-4 flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <span className="text-xs font-mono bg-slate-100 text-slate-700 py-1 px-2 rounded font-bold">
                                  {school.code}
                                </span>
                                <div>
                                  <h4 className="text-xs font-bold text-slate-900">{school.name}</h4>
                                  <p className="text-[10px] text-slate-400">{school.email}</p>
                                </div>
                              </div>
                              <span className={`px-2.5 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider font-bold ${
                                school.disabled 
                                  ? 'bg-red-50 text-red-700 border border-red-100' 
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              }`}>
                                {school.disabled ? 'Disabled' : 'Operational'}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                      <h3 className="text-sm font-semibold tracking-tight uppercase tracking-wider text-slate-400 mb-4 font-mono font-bold">
                        Database Engine Logs
                      </h3>
                      <div className="space-y-4">
                        <div className="p-3 bg-slate-50 rounded border border-slate-200">
                          <span className="text-[9px] font-mono text-slate-400 block font-bold">2026-06-01 // UTILITY SEED</span>
                          <p className="text-xs text-slate-705 mt-1 font-mono font-medium">Auto-scanned local user registry in db.json.</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded border border-slate-200">
                          <span className="text-[9px] font-mono text-slate-400 block font-bold">2026-06-01 // DIR SYNC</span>
                          <p className="text-xs text-slate-705 mt-1 font-mono font-medium">Session token authenticated successfully.</p>
                        </div>
                        <p className="text-[10px] font-mono text-slate-400 italic text-center leading-relaxed">
                          Diagnostic tracking logs online. Check System Settings to toggle levels.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: DETAILED SCHOOLS PANEL */}
              {activeTab === 'schools' && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 font-mono uppercase tracking-wider">Provisioned Schools Directory</h3>
                      <p className="text-xs text-slate-450 mt-1">Select and toggle status structures to synchronize multi-tenant database partitions.</p>
                    </div>
                    <button
                      onClick={() => setShowCreateSchoolModal(true)}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-semibold shadow-md shadow-indigo-100 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Create School</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/60 border-b border-slate-150 text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                          <th className="py-4 px-6">School Info</th>
                          <th className="py-4 px-6">System ID</th>
                          <th className="py-4 px-6">Assigned Admins</th>
                          <th className="py-4 px-6">Faculty Metrics</th>
                          <th className="py-4 px-6">Platform Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {schools.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-12 text-center text-slate-450 font-mono">
                              No schools created yet. Initiate setup using "Create New School".
                            </td>
                          </tr>
                        ) : (
                          schools.map((school) => (
                            <tr key={school.id} className="hover:bg-slate-50/40 transition-colors">
                              <td className="py-5 px-6">
                                <div className="font-bold text-slate-900 mb-0.5">{school.name}</div>
                                <div className="text-[10px] text-slate-400 font-mono mb-1">Code: {school.code}</div>
                                <div className="flex flex-col gap-0.5 text-[11px] text-slate-500">
                                  <span className="flex items-center gap-1">
                                    <Mail className="h-3 w-3 text-slate-400" /> {school.email}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Phone className="h-3 w-3 text-slate-400" /> {school.phone}
                                  </span>
                                </div>
                              </td>
                              <td className="py-5 px-6 font-mono text-slate-600">
                                {school.id}
                              </td>
                              <td className="py-5 px-6">
                                {school.administrators && school.administrators.length > 0 ? (
                                  <div className="space-y-1.5">
                                    {school.administrators.map((ad: any, i: number) => (
                                      <div key={i} className="text-xs bg-slate-50 border border-slate-150 rounded-lg p-1.5 font-sans leading-tight">
                                        <div className="font-semibold text-slate-800">{ad.name}</div>
                                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">{ad.email}</div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="flex flex-col gap-1.5">
                                    <span className="text-amber-600 font-medium italic text-[11px]">No Admin Bindings</span>
                                    <button
                                      onClick={() => {
                                        setAdminForm(prev => ({ ...prev, schoolId: school.id }));
                                        setShowCreateAdminModal(true);
                                      }}
                                      className="text-[10px] font-mono text-indigo-600 font-bold hover:underline transition-all cursor-pointer flex items-center gap-0.5"
                                    >
                                      Bind Owner <ArrowRight className="h-2.5 w-2.5" />
                                    </button>
                                  </div>
                                )}
                              </td>
                              <td className="py-5 px-6 font-mono font-medium text-slate-700">
                                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
                                  <span>Depts: {school.stats.departments}</span>
                                  <span>Units: {school.stats.units}</span>
                                  <span>Staff: {school.stats.staff}</span>
                                  <span>Sts: {school.stats.students}</span>
                                </div>
                              </td>
                              <td className="py-5 px-6">
                                <div className="flex flex-col gap-1.5">
                                  <button
                                    onClick={() => handleToggleSchool(school.id)}
                                    className={`w-full px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold transition-all border cursor-pointer flex items-center justify-center gap-1.5 ${
                                      school.disabled 
                                        ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200' 
                                        : 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200'
                                    }`}
                                  >
                                    {school.disabled ? (
                                      <>
                                        <Power className="h-3 w-3" />
                                        <span>Enable Access</span>
                                      </>
                                    ) : (
                                      <>
                                        <PowerOff className="h-3 w-3" />
                                        <span>Disable Access</span>
                                      </>
                                    )}
                                  </button>
                                  <a
                                    href={`/school/${school.code}`}
                                    className="w-full px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold transition-all border bg-slate-50 hover:bg-slate-100 text-slate-755 border-slate-200 cursor-pointer flex items-center justify-center gap-1.5 text-center text-slate-700"
                                  >
                                    <Globe className="h-3 w-3 text-indigo-500 animate-pulse" />
                                    <span>View Website</span>
                                  </a>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: ADMIN bindings LIST */}
              {activeTab === 'admins' && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 font-mono uppercase tracking-wider">Registered School Operators</h3>
                      <p className="text-xs text-slate-450 mt-1">Users permitted to manage individual schools, departments, and curricula partitions.</p>
                    </div>
                    <button
                      onClick={() => setShowCreateAdminModal(true)}
                      disabled={schools.length === 0}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-semibold shadow disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer shadow-indigo-100"
                    >
                      <UserPlus className="h-4 w-4" />
                      <span>Bind New Administrator</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                          <th className="py-4 px-6">Administrator details</th>
                          <th className="py-4 px-6">Associated Campus</th>
                          <th className="py-4 px-6">Directory Account Type</th>
                          <th className="py-4 px-6">Emergency Phone</th>
                          <th className="py-4 px-6">Baseline Dev Password</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {schools.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-12 text-center text-slate-450 font-mono">
                              No schools available. Bindings can only be provisioned for registered schools.
                            </td>
                          </tr>
                        ) : (
                          schools.filter(s => s.administrators && s.administrators.length > 0).map((school) => (
                            school.administrators.map((ad: any, keyIdx: number) => (
                              <tr key={`${school.id}-admin-${keyIdx}`} className="hover:bg-slate-50/20 transition-all">
                                <td className="py-5 px-6">
                                  <div className="font-bold text-slate-900">{ad.name}</div>
                                  <div className="text-[10px] text-slate-400 font-mono font-bold mt-0.5">{ad.email}</div>
                                </td>
                                <td className="py-5 px-6">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 py-0.5 px-2 rounded border border-indigo-150 font-bold">
                                      {school.code}
                                    </span>
                                    <span className="font-semibold text-slate-800">{school.name}</span>
                                  </div>
                                </td>
                                <td className="py-5 px-6 font-mono text-slate-500 uppercase tracking-widest text-[9px] font-bold">
                                  School Admin (Role = Admin)
                                </td>
                                <td className="py-5 px-6 font-mono text-slate-600">
                                  {ad.phone || 'Not Specified'}
                                </td>
                                <td className="py-5 px-6">
                                  <span className="font-mono bg-slate-50 border border-slate-200 text-slate-600 py-1 px-2 rounded font-bold text-[11px]">
                                    12345678
                                  </span>
                                </td>
                              </tr>
                            ))
                          ))
                        )}
                        {schools.length > 0 && schools.every(s => !s.administrators || s.administrators.length === 0) && (
                          <tr>
                            <td colSpan={5} className="py-12 text-center text-slate-400 font-mono">
                              No Administrators registered. Click "Bind New Administrator" above.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 4: TENANT SUBSCRIPTIONS */}
              {activeTab === 'subscriptions' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade">
                  {/* Left stats info / model settings */}
                  <div className="md:col-span-2 bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-900 font-mono uppercase tracking-wider mb-2">Platform Subscription Allocations</h3>
                    <p className="text-xs text-slate-450 mb-6">Track pricing tiers, renewal cycles, and storage quotients for multi-tenant colleges.</p>

                    <div className="space-y-4">
                      {schools.length === 0 ? (
                        <div className="py-12 text-center text-slate-400 font-mono text-xs">
                          No tenant schools active. Build one first.
                        </div>
                      ) : (
                        schools.map((sc, i) => (
                          <div key={sc.id} className="p-4 bg-slate-50 rounded border border-slate-200 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3.5">
                              <div className="w-10 h-10 rounded bg-indigo-55 border border-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs uppercase font-mono">
                                {sc.code.substring(0, 3)}
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-slate-900">{sc.name}</h4>
                                <span className="text-[10px] font-mono text-slate-400 font-bold">Database partition ID: {sc.id.substring(0, 8)}...</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <span className="text-[10px] font-mono text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                  Enterprise Tier
                                </span>
                                <span className="block text-[10px] text-slate-400 font-mono mt-1 font-bold">Renewal: 2026-12-31</span>
                              </div>
                              <span className="font-bold text-xs font-mono text-slate-900">Ksh 30,000/mo</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Right general packages pricing guidelines */}
                  <div className="space-y-6">
                    <div className="bg-slate-900 text-white rounded-xl p-6 relative overflow-hidden shadow-lg shadow-slate-100">
                      <h4 className="font-bold tracking-widest text-[9px] font-mono text-emerald-400 uppercase">ACTIVE SCHEMAS</h4>
                      <h3 className="text-lg font-bold font-sans mt-1">Tier Packages Matrix</h3>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                        Prices are dynamically scaled depending on the quantity of students enrolled.
                      </p>
                      
                      <div className="mt-8 space-y-4 text-xs font-mono">
                        <div className="flex justify-between pb-2 border-b border-slate-800">
                          <span>Standard Tier</span>
                          <span className="font-bold text-emerald-400">Ksh 15,000 / month</span>
                        </div>
                        <div className="flex justify-between pb-2 border-b border-slate-800">
                          <span>Enterprise Tier</span>
                          <span className="font-bold text-emerald-400">Ksh 30,000 / month</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Elite Tech Tier</span>
                          <span className="font-bold text-emerald-400">Ksh 50,000 / month</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'communications' && (
                <div className="flex-1 min-h-[600px] border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white animate-fade flex flex-col">
                  <div className="bg-slate-900 border-b border-slate-800 p-4 shrink-0 shadow flex items-center justify-between">
                    <div>
                      <h3 className="text-white text-sm font-bold font-mono tracking-widest uppercase flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-emerald-400" />
                        Admin Active Communications
                      </h3>
                      <p className="text-[10px] text-slate-400 font-mono tracking-wider">Super Administrator Top Level Network Protocol / Phase 5</p>
                    </div>
                  </div>
                  <div className="flex-1 min-h-0">
                    <CommunicationsHub user={user} />
                  </div>
                </div>
              )}

              {activeTab === 'architecture' && (
                <div className="space-y-6 animate-fade text-slate-800">
                  {/* SAAS HUB HEADER CONTROLS */}
                  <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute left-1/3 bottom-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-[9px] font-mono text-indigo-300 font-bold uppercase tracking-wider">
                            Multi-Tenancy SaaS Core
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-[9px] font-mono text-emerald-300 font-bold uppercase tracking-wider">
                            Control Plane Active
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2 font-sans">
                          <Network className="h-5.5 w-5.5 text-indigo-400" />
                          SmartCampusConnect X Cloud Controller
                        </h3>
                        <p className="text-xs text-slate-400 mt-1.5 max-w-xl">
                          Integrated multi-tenant partition gate managing dynamic module matrices, dynamic country parameters, dynamic blueprint structures, branding studios, and instant tenant lifecycle actions.
                        </p>
                      </div>
                      <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl px-4 py-2 text-center md:text-right shrink-0">
                        <span className="block text-[8px] text-slate-400 font-bold uppercase tracking-wider">Gateway URL</span>
                        <span className="text-xs font-bold text-indigo-300 font-mono">*.smartcampusconnect.com</span>
                      </div>
                    </div>

                    {/* TOPLEVEL SECTION MENU */}
                    <div className="flex flex-wrap gap-1.5 mt-6 pt-5 border-t border-slate-800">
                      {[
                        { id: 'topology', label: '1. Tenancy Topology Map', color: 'text-indigo-400 border-indigo-500/30' },
                        { id: 'blueprint', label: '2. Blueprint & Schema Architect', color: 'text-rose-400 border-rose-500/30' },
                        { id: 'marketplace', label: '3. Module Marketplace', color: 'text-emerald-400 border-emerald-500/30' },
                        { id: 'branding', label: '4. Tenant Branding Studio', color: 'text-amber-400 border-amber-500/30' },
                        { id: 'country', label: '5. Country Framework Studio', color: 'text-cyan-400 border-cyan-500/30' },
                        { id: 'lifecycle', label: '6. Subscription & Lifecycle Hub', color: 'text-violet-400 border-violet-500/30' }
                      ].map(subTab => (
                        <button
                          key={subTab.id}
                          onClick={() => setArchitectureSubTab(subTab.id as any)}
                          className={`px-3.5 py-2 rounded-xl text-[11px] font-bold font-mono transition-all cursor-pointer border ${
                            architectureSubTab === subTab.id
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg'
                              : 'bg-slate-800/50 text-slate-300 border-slate-800 hover:bg-slate-800'
                          }`}
                        >
                          {subTab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* SUB-TAB 1: TENANCY TOPOLOGY MAP */}
                  {architectureSubTab === 'topology' && (
                    <div className="space-y-6 animate-fade">
                      {/* PLATFORM SECTOR GRAPH */}
                      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs relative">
                        <div className="mb-6 border-b border-slate-100 pb-4">
                          <h4 className="text-[10px] font-bold text-slate-600 uppercase tracking-widest font-mono">Platform Row Tenancy Graph</h4>
                          <p className="text-xs text-slate-400">Select any sector level below to filter sandbox directories and audit active row-level isolation modules.</p>
                        </div>

                        <div className="flex flex-col items-center gap-6 relative">
                          {/* LEVEL 1: SUPER ADMIN */}
                          <div className="relative z-10 w-full max-w-sm">
                            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center shadow-lg relative overflow-hidden">
                              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-sky-500 to-rose-500" />
                              <div className="p-2 bg-slate-800 rounded-xl inline-block mb-2 border border-slate-700">
                                <Cpu className="h-5 w-5 text-indigo-400 animate-spin-slow" />
                              </div>
                              <h5 className="text-xs font-mono font-bold text-white tracking-wider uppercase">SuperAdmin Control Plane</h5>
                              <span className="text-[10px] text-slate-400 font-mono">Dynamic Tenant Router & Security Authorization Node</span>
                            </div>
                          </div>

                          {/* BRANCH LINES */}
                          <div className="hidden md:block absolute top-[90px] bottom-[220px] w-0.5 bg-dashed bg-slate-200 z-0 left-1/2 -translate-x-1/2" />

                          {/* LEVEL 2: 6 ENTERPRISE SECTOR CHANNELS */}
                          <div className="w-full relative z-10">
                            <div className="grid grid-cols-2 lg:grid-cols-6 gap-3.5 pt-4">
                              {[
                                { id: 'Primary School', label: 'Primary Schools', desc: 'Kindergarten & Lower Pri', color: 'bg-sky-50 hover:bg-sky-100 text-sky-700 border-sky-150', activeColor: 'bg-sky-600 border-sky-600 text-white shadow-md', icon: Heart },
                                { id: 'Secondary School', label: 'Secondary Schools', desc: 'General & Academics', color: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-150', activeColor: 'bg-emerald-600 border-emerald-600 text-white shadow-md', icon: BookOpen },
                                { id: 'TVET', label: 'TVETs', desc: 'Technical & Trade', color: 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-150', activeColor: 'bg-indigo-600 border-indigo-600 text-white shadow-md', icon: Briefcase },
                                { id: 'College', label: 'Colleges', desc: 'Teachers, Nurses & Tech', color: 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-150', activeColor: 'bg-amber-600 border-amber-600 text-white shadow-md', icon: Layers },
                                { id: 'University', label: 'Universities', desc: 'Higher Academic Varsity', color: 'bg-violet-50 hover:bg-violet-100 text-violet-700 border-violet-150', activeColor: 'bg-violet-600 border-violet-600 text-white shadow-md', icon: Building2 },
                                { id: 'Training Center', label: 'Training Centers', desc: 'Professional & Business', color: 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-150', activeColor: 'bg-rose-600 border-rose-600 text-white shadow-md', icon: Workflow }
                              ].map(sector => {
                                const IconCmp = sector.icon;
                                const isSelected = selectedSector === sector.id;
                                const sectorCount = schools.filter(s => s.institutionType === sector.id).length;
                                
                                return (
                                  <button
                                    key={sector.id}
                                    type="button"
                                    onClick={() => setSelectedSector(sector.id)}
                                    className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 h-full relative ${
                                      isSelected ? sector.activeColor : sector.color
                                    }`}
                                  >
                                    <div className={`p-1.5 rounded-xl ${isSelected ? 'bg-white/20' : 'bg-white'} border border-transparent shadow-xs`}>
                                      <IconCmp className="h-4.5 w-4.5 shrink-0" />
                                    </div>
                                    <div className="text-[10px] font-extrabold tracking-tight leading-tight mt-1">{sector.label}</div>
                                    <div className={`text-[8px] font-medium leading-normal block ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>{sector.desc}</div>
                                    
                                    <span className={`absolute top-2.5 right-2.5 px-1.5 py-0.5 rounded-full text-[8px] font-mono font-bold border ${
                                      isSelected 
                                        ? 'bg-white text-indigo-700 border-white/20' 
                                        : 'bg-slate-100 text-slate-600 border-slate-200'
                                    }`}>
                                      {sectorCount}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* FILTERED ACTIVE SECTOR DIRECTORY */}
                      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6">
                        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                          <div>
                            <h4 className="text-[10.5px] font-bold text-slate-600 uppercase tracking-widest font-mono">
                              Tenant Database Register • {selectedSector}
                            </h4>
                            <p className="text-xs text-slate-400 font-sans mt-0.5">Click any SaaS component in the matrix below to audit live execution queries.</p>
                          </div>
                          <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[9px] font-mono font-bold text-indigo-600 shadow-2xs">
                            {schools.filter(s => s.institutionType === selectedSector && !archivedTenantIds.includes(s.id)).length} Active Row Partitions
                          </span>
                        </div>

                        <div className="space-y-4">
                          {schools.filter(school => school.institutionType === selectedSector).map(school => {
                            const isSuspended = suspendedTenantIds.includes(school.id);
                            const isArchived = archivedTenantIds.includes(school.id);
                            const activeTier = tenantPlans[school.id] || 'Starter';
                            const optionals = activeOptionalModules[school.id] || [];

                            return (
                              <div 
                                key={school.id} 
                                className={`bg-white border rounded-2.5xl p-5 shadow-xs transition-all ${
                                  isSuspended ? 'border-red-200 opacity-90 grayscale' : isArchived ? 'border-slate-300 opacity-60 bg-slate-100' : 'border-slate-200 hover:border-indigo-300'
                                }`}
                              >
                                {/* header info for tenant */}
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                                  <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 bg-slate-900 text-white rounded-2xl flex flex-col items-center justify-center font-mono font-bold border border-slate-850">
                                      <span className="text-xs uppercase">{school.code.substring(0, 3)}</span>
                                    </div>
                                    <div>
                                      <div className="flex flex-wrap items-center gap-2">
                                        <h4 className="text-xs font-extrabold text-slate-900">{school.name}</h4>
                                        <span className="text-[8px] font-mono bg-indigo-50 text-indigo-600 border border-indigo-100 px-1.5 py-0.2 rounded-md">
                                          db-id: {school.id}
                                        </span>
                                        {isSuspended && (
                                          <span className="text-[8px] font-mono bg-red-100 text-red-600 border border-red-200 px-1.5 py-0.2 rounded-md font-bold uppercase animate-pulse">
                                            ⚠️ SUSPENDED
                                          </span>
                                        )}
                                        {isArchived && (
                                          <span className="text-[8px] font-mono bg-slate-200 text-slate-600 border border-slate-300 px-1.5 py-0.2 rounded-md font-bold uppercase">
                                            📁 ARCHIVED
                                          </span>
                                        )}
                                        <span className="text-[8px] font-mono bg-violet-50 text-violet-600 border border-violet-100 px-1.5 py-0.2 rounded-md font-bold">
                                          Tier: {activeTier}
                                        </span>
                                      </div>
                                      <p className="text-[10.5px] text-indigo-600 font-mono mt-1">
                                        👉 {school.code.toLowerCase()}.smartcampusconnect.com
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      disabled={isSuspended || isArchived}
                                      onClick={() => {
                                        window.location.hash = `#school/${school.code.toLowerCase()}`;
                                      }}
                                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white rounded-xl text-[10px] font-bold cursor-pointer inline-flex items-center gap-1.5 transition-all shadow-xs"
                                    >
                                      <ExternalLink className="h-3 w-3" />
                                      <span>Launch Portal</span>
                                    </button>
                                  </div>
                                </div>

                                {/* row level saas matrix */}
                                <div className="mt-4">
                                  <div className="flex items-center justify-between mb-2.5">
                                    <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-widest font-mono">SaaS Engine Modules (Isolated by rowId)</span>
                                    <span className="text-[8px] text-slate-405 font-mono">Green border signifies active modules in tenant sub-slice.</span>
                                  </div>

                                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
                                    {[
                                      { id: 'Website', label: 'Website', icon: Globe, path: 'src/components/SchoolPublicWebsite.tsx', query: `SELECT * FROM school_websites WHERE schoolId = "${school.id}"`, desc: 'Custom themed public portal.' },
                                      { id: 'Admissions', label: 'Admissions', icon: FileText, path: 'src/types.ts', query: `SELECT * FROM academic_cohorts WHERE schoolId = "${school.id}"`, desc: 'Self-serve admission pipelines.' },
                                      { id: 'Students', label: 'Students', icon: GraduationCap, path: 'src/components/StudentDashboard.tsx', query: `SELECT * FROM students WHERE schoolId = "${school.id}"`, desc: 'Schedules, transcripts & grades.' },
                                      { id: 'Parents', label: 'Parents', icon: Heart, path: 'src/components/AdminParentManagement.tsx', query: `SELECT * FROM student_guardians WHERE schoolId = "${school.id}"`, desc: 'Financial sponsors & guardian keys.' },
                                      { id: 'Teachers', label: 'Teachers', icon: BookOpen, path: 'src/components/LecturerDashboard.tsx', query: `SELECT * FROM staff WHERE schoolId = "${school.id}" AND role = "staff"`, desc: 'Lecturer files & grading grids.' },
                                      { id: 'Finance', label: 'Finance', icon: CreditCard, path: 'src/components/AdminFinanceEngine.tsx', query: `SELECT * FROM financial_ledgers WHERE schoolId = "${school.id}"`, desc: 'Tuition collection double-entry ledgers.' },
                                      { id: 'HR', label: 'HR', icon: Briefcase, path: 'src/components/AdminHrManagement.tsx', query: `SELECT * FROM staff_profiles WHERE schoolId = "${school.id}"`, desc: 'Payroll, scaling, and timesheets.' },
                                      { id: 'ERP', label: 'ERP', icon: Layers, path: 'src/components/AdminProcurementAssets.tsx', query: `SELECT * FROM procurement_assets WHERE schoolId = "${school.id}"`, desc: 'Procurement trackers & logistics.' },
                                      { id: 'Library', label: 'Library', icon: Book, path: 'src/components/LibrarianManagerDashboard.tsx', query: `SELECT * FROM library_books WHERE schoolId = "${school.id}"`, desc: 'Library barcode catalogs.' },
                                      { id: 'Hostel', label: 'Hostel', icon: Home, path: 'server.ts', query: `SELECT * FROM hostels WHERE schoolId = "${school.id}"`, desc: 'Room quotas & listings.' },
                                      { id: 'Transport', label: 'Transport', icon: Bus, path: 'server.ts', query: `SELECT * FROM transport_vehicles WHERE schoolId = "${school.id}"`, desc: 'Bus route optimization.' },
                                      { id: 'Communication', label: 'Communication', icon: MessageSquare, path: 'src/components/CommunicationsHub.tsx', query: `SELECT * FROM comms_messages WHERE schoolId = "${school.id}"`, desc: 'SMS broadcast & circular triggers.' },
                                      { id: 'LMS', label: 'LMS', icon: PlayCircle, path: 'src/components/AdminCurriculumMapping.tsx', query: `SELECT * FROM course_syllabus WHERE schoolId = "${school.id}"`, desc: 'Lesson slideshows & scores.' },
                                      { id: 'AI', label: 'AI Intel', icon: Sparkles, path: 'server.ts', query: `SELECT * FROM ai_copilot_runs WHERE schoolId = "${school.id}"`, desc: 'Gemini automatic syllabus generator.' },
                                      { id: 'Reports', label: 'Reports', icon: BarChart3, path: 'src/components/AdminSystemHealth.tsx', query: `SELECT * FROM analytical_reports WHERE schoolId = "${school.id}"`, desc: 'Dynamic campus KPI summaries.' },
                                      { id: 'Mobile App', label: 'Mobile App', icon: Smartphone, path: 'src/components/StudentLifeArea.tsx', query: `SELECT * FROM mobile_tokens WHERE schoolId = "${school.id}"`, desc: 'Mobile push notification engines.' }
                                    ].map(mod => {
                                      const ModIcon = mod.icon;
                                      const isOptional = ['ERP', 'Library', 'Hostel', 'Transport', 'LMS', 'AI', 'Reports', 'Mobile App'].includes(mod.id);
                                      const isEnabled = !isOptional || optionals.includes(mod.id);

                                      return (
                                        <button
                                          key={mod.id}
                                          type="button"
                                          disabled={isSuspended || isArchived}
                                          onClick={() => {
                                            setActiveAuditModule({ ...mod, school });
                                          }}
                                          className={`p-2 rounded-xl text-center flex flex-col items-center justify-center gap-1 cursor-pointer transition-all h-[76px] border ${
                                            isEnabled
                                              ? 'bg-emerald-50/50 border-emerald-200 hover:border-emerald-400 text-slate-800'
                                              : 'bg-slate-50 border-slate-200 text-slate-400 opacity-50 hover:bg-slate-100'
                                          }`}
                                        >
                                          <div className={`p-1 text-slate-600 rounded-lg shrink-0 ${isEnabled ? 'bg-white border border-emerald-200' : 'bg-slate-100'}`}>
                                            <ModIcon className="h-3.5 w-3.5" />
                                          </div>
                                          <span className="text-[8.5px] font-bold tracking-tight leading-none text-center block max-w-full truncate px-0.5 mt-0.5">
                                            {mod.label}
                                          </span>
                                          <span className="text-[7px] font-mono block tracking-tighter uppercase font-semibold">
                                            {isEnabled ? 'ACTIVE' : 'OFFLINE'}
                                          </span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            );
                          })}

                          {schools.filter(s => s.institutionType === selectedSector).length === 0 && (
                            <div className="bg-white border border-slate-200 rounded-2.5xl p-8 py-12 text-center">
                              <Building2 className="h-10 w-10 text-slate-300 mx-auto mb-3 animate-pulse" />
                              <h5 className="text-xs font-bold text-slate-800">No Active tenants under [{selectedSector}]</h5>
                              <p className="text-[11px] text-slate-450 mt-1 max-w-xs mx-auto">
                                Navigate to the <strong className="text-slate-700">Schools</strong> tab above to provision a new isolated tenant structure. This updates the live configuration map instantly.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUB-TAB 2: BLUEPRINT ARCHITECT */}
                  {architectureSubTab === 'blueprint' && (
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs animate-fade space-y-6">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-4 flex-wrap gap-2">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 font-mono uppercase tracking-wider">Tenant Blueprint & Structural Builder Engine</h4>
                          <p className="text-xs text-slate-550 mt-1">Configure automated relational hierarchy generation layouts based on chosen institution categories.</p>
                        </div>
                        <span className="px-2.5 py-1 bg-rose-50 border border-rose-100 rounded text-[9px] font-mono text-rose-600 font-bold">
                          8 Core Spec Blueprint Presets
                        </span>
                      </div>

                      {/* BLUEPRINT SELECTOR ROW */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          { id: 'Lower Primary', label: 'Lower Primary', desc: 'Simple classroom model', levels: ['School', 'Grade'] },
                          { id: 'Primary School', label: 'Primary', desc: 'Standard structured grading', levels: ['School', 'Grade', 'Division'] },
                          { id: 'Secondary School', label: 'Secondary', desc: 'Syllabus STREAM separation', levels: ['School', 'Class', 'Stream'] },
                          { id: 'TVET', label: 'TVET', desc: 'Trade & Skill modules', levels: ['School', 'Department', 'Course', 'Module'] },
                          { id: 'College', label: 'College', desc: 'Professional teaching sem', levels: ['College', 'Department', 'Academic Program'] },
                          { id: 'University', label: 'University', desc: 'Varsity course mapping', levels: ['University', 'Faculty', 'Department', 'Program', 'Cohort', 'Unit'] },
                          { id: 'Training Center', label: 'Training Center', desc: 'Short certifications', levels: ['Center', 'Training Course', 'Batch'] },
                          { id: 'Corporate Academy', label: 'Corporate Academy', desc: 'Business learning paths', levels: ['Academy', 'Business Unit', 'Learning Path'] }
                        ].map(bp => {
                          const isSelected = selectedBlueprintType === bp.id;
                          return (
                            <button
                              key={bp.id}
                              type="button"
                              onClick={() => setSelectedBlueprintType(bp.id)}
                              className={`p-4 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between h-32 ${
                                isSelected ? 'bg-rose-50/50 border-rose-400 ring-1 ring-rose-400' : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
                              }`}
                            >
                              <div>
                                <h5 className={`text-xs font-bold ${isSelected ? 'text-rose-700' : 'text-slate-800'}`}>{bp.label} Blueprint</h5>
                                <p className="text-[10px] text-slate-450 mt-0.5 leading-tight">{bp.desc}</p>
                              </div>

                              <div className="pt-2 border-t border-slate-200/50 w-full">
                                <span className="text-[8px] font-mono font-bold text-slate-500 block uppercase tracking-widest mb-1">DATA NODES:</span>
                                <div className="flex flex-wrap gap-1">
                                  {bp.levels.map((lvl, index) => (
                                    <span key={lvl} className="text-[7.5px] px-1 bg-white border border-slate-200 rounded text-slate-600 font-mono">
                                      {lvl}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* VISUAL COMPONENT HIERARCHY MAP */}
                      <div className="bg-slate-950 text-slate-300 rounded-2xl p-6 border border-slate-850 relative overflow-hidden">
                        <div className="absolute right-0 top-0 text-[100px] font-bold text-slate-900/10 pointer-events-none font-sans select-none">
                          DATA MODEL
                        </div>

                        <span className="block text-[9.5px] font-mono font-bold text-rose-400 uppercase tracking-widest mb-3">
                          ❯ Row Sandbox Dynamic ERD Hierarchy Graph:
                        </span>

                        <div className="bg-black/40 rounded-xl p-5 border border-slate-900 font-mono text-xs flex flex-wrap items-center justify-center gap-3">
                          {[
                            { id: 'Lower Primary', levels: ['SCHOOL PARTITION', 'GRADE SECTOR'] },
                            { id: 'Primary School', levels: ['SCHOOL PARTITION', 'GRADE', 'DIVISION CORE'] },
                            { id: 'Secondary School', levels: ['SCHOOL PARTITION', 'ACADEMIC CLASS', 'STUDY STREAM REGISTRY'] },
                            { id: 'TVET', levels: ['CAMPUS TENANT', 'VOCATIONAL DEPARTMENT', 'TRADE COURSE', 'SKILL MODULE ENGINE'] },
                            { id: 'College', levels: ['COLLEGE BASEPART', 'ACADEMIC DEPARTMENT', 'PRO-TRAINING PROGRAM'] },
                            { id: 'University', levels: ['VIRTUAL UNIVERSITY', 'ACADEMIC FACULTY', 'DEPARTMENT SECTOR', 'STUDY PROGRAM', 'ENROLLMENT COHORT', 'ACADEMIC STUDY UNIT'] },
                            { id: 'Training Center', levels: ['TRAINING CORE CENTER', 'CERTIFIED STREAM COURSE', 'TUTORIAL BATCH'] },
                            { id: 'Corporate Academy', levels: ['ACADEMY SPACE', 'BUSINESS BRAND DIVISION', 'LEARNING SYLLABUS PATH'] }
                          ].find(o => o.id === selectedBlueprintType)?.levels.map((lvl, index, arr) => (
                            <React.Fragment key={lvl}>
                              <div className="bg-slate-900/90 border border-rose-500/30 text-white rounded-lg px-4 py-2.5 text-center shadow-md shadow-rose-950/20 max-w-[170px] select-all">
                                <span className="block text-[8px] text-rose-450 font-bold uppercase tracking-wider">Level {index + 1} Node</span>
                                <span className="text-[10.5px] font-bold block mt-0.5 tracking-tight">{lvl}</span>
                                <span className="text-[7.5px] text-slate-450 block font-mono mt-0.5">ROWID separation</span>
                              </div>
                              {index < arr.length - 1 && (
                                <ArrowRight className="h-4 w-4 text-rose-400 shrink-0" />
                              )}
                            </React.Fragment>
                          ))}
                        </div>

                        {/* AUTOMATIC PROVISIONED OBJECTS FOR THIS SELECTOR */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-5 border-t border-slate-850">
                          <div>
                            <span className="block text-[8px] text-slate-400 font-bold uppercase tracking-wider mb-2">Automated Custom Roles</span>
                            <div className="space-y-1">
                              {selectedBlueprintType === 'University' && ['Dean of Faculty', 'Department Coordinator', 'Unit Lecturer', 'Varsity Registrar'].map(r => (
                                <span key={r} className="block text-[9.5px] text-slate-300">✓ {r}</span>
                              ))}
                              {selectedBlueprintType !== 'University' && ['Principal Director', 'Class Tutor', 'Finance Warden', 'Parent Liaison'].map(r => (
                                <span key={r} className="block text-[9.5px] text-slate-300">✓ {r}</span>
                              ))}
                            </div>
                          </div>

                          <div>
                            <span className="block text-[8px] text-slate-400 font-bold uppercase tracking-wider mb-2">Default Comms Channels</span>
                            <div className="space-y-1">
                              <span className="block text-[9.5px] text-slate-300">🎨 #announcements-circular</span>
                              <span className="block text-[9.5px] text-slate-300">🔔 #admin-emergency-dispatch</span>
                              <span className="block text-[9.5px] text-slate-300">💌 #staff-coordination</span>
                            </div>
                          </div>

                          <div>
                            <span className="block text-[8px] text-slate-400 font-bold uppercase tracking-wider mb-2">Primary Pre-made Reports</span>
                            <div className="space-y-1">
                              <span className="block text-[9.5px] text-slate-300">📊 Annual Enrollment Metrics</span>
                              <span className="block text-[9.5px] text-slate-300">💸 Tuition Collection Balance</span>
                              <span className="block text-[9.5px] text-slate-300">📝 Grade Book Sheet</span>
                            </div>
                          </div>

                          <div className="flex flex-col justify-end">
                            <button
                              type="button"
                              onClick={() => {
                                const logMsg = `BLUEPRINT_ROLLOUT: Provisioned default ${selectedBlueprintType} schemas to sandbox database registers successfully.`;
                                setSaasAuditLogs(prev => [
                                  { id: Date.now().toString(), timestamp: new Date().toLocaleTimeString(), action: 'BLUEPRINT_GEN', tenant: 'SaaS Engine', details: logMsg, severity: 'success' },
                                  ...prev
                                ]);
                                alert(`Succesfully provisioned default schemas, reporting structures, timetables, and role gates for: ${selectedBlueprintType} blueprint!`);
                              }}
                              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-[10px] cursor-pointer text-center select-none shadow transition-all duration-150"
                            >
                              Rollout Sandbox Blueprint
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUB-TAB 3: MODULE MARKETPLACE */}
                  {architectureSubTab === 'marketplace' && (
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs animate-fade space-y-6">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-4 flex-wrap gap-4">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 font-mono uppercase tracking-wider">Dynamic Module Selector Matrix</h4>
                          <p className="text-xs text-slate-550 mt-1">Activate optional modules or restrict access per specific tenant slice to optimize platform usage.</p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <label className="text-[10px] font-bold text-slate-500 font-mono uppercase">TARGET TENANT:</label>
                          <select
                            value={selectedMarketplaceSchool || (schools[0]?.id || '')}
                            onChange={(e) => setSelectedMarketplaceSchool(e.target.value)}
                            className="bg-slate-100 border border-slate-200 text-xs font-bold rounded-lg px-3 py-1.5 focus:outline-none"
                          >
                            <option value="">-- Choose Tenant School --</option>
                            {schools.map(school => (
                              <option key={school.id} value={school.id}>{school.name} ({school.code})</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {(() => {
                        const activeSchoolId = selectedMarketplaceSchool || (schools[0]?.id || 'sch-nairobi');
                        const activeSchool = schools.find(s => s.id === activeSchoolId) || { id: 'sch-nairobi', name: 'Nairobi Science Academy', code: 'NUST' };
                        const enabledOptionals = activeOptionalModules[activeSchool.id] || [];

                        const toggleOptionalModule = (moduleId: string) => {
                          const updated = enabledOptionals.includes(moduleId)
                            ? enabledOptionals.filter(id => id !== moduleId)
                            : [...enabledOptionals, moduleId];
                          
                          setActiveOptionalModules(prev => ({
                            ...prev,
                            [activeSchool.id]: updated
                          }));

                          const actionStr = enabledOptionals.includes(moduleId) ? 'MODULE_DEACTIVATE' : 'MODULE_ACTIVATE';
                          const detailsStr = `${actionStr}: ${moduleId} module toggled ${enabledOptionals.includes(moduleId) ? 'OFF' : 'ON'} for partition: ${activeSchool.name}.`;
                          setSaasAuditLogs(prev => [
                            { id: Date.now().toString(), timestamp: new Date().toLocaleTimeString(), action: actionStr, tenant: activeSchool.name, details: detailsStr, severity: 'info' },
                            ...prev
                          ]);
                        };

                        return (
                          <div className="space-y-6">
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-150">
                              <h5 className="text-[10px] font-bold text-indigo-700 font-mono uppercase tracking-widest mb-1">CURRENT TENANT ACTIVE STATUS:</h5>
                              <p className="text-xs font-bold text-slate-800">{activeSchool.name} • <span className="font-mono text-[10.5px] text-slate-500">[{activeSchool.id}]</span></p>
                            </div>

                            {/* CORE MODULES SEATOR (STRICT PASSIVE) */}
                            <div>
                              <h5 className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-3">1. Non-restrictive Tenancy Base Core Modules (Always Enabled):</h5>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {[
                                  { label: 'Admissions', desc: 'Syllabus enrollment triggers' },
                                  { label: 'Students', desc: 'Secure profile trackers' },
                                  { label: 'Finance Engine', desc: 'Ledger system balance' },
                                  { label: 'Comms Network', desc: 'SMS dispatch endpoints' }
                                ].map(coreMod => (
                                  <div key={coreMod.label} className="p-3 bg-indigo-50/40 border border-indigo-150 rounded-xl flex items-start gap-2.5">
                                    <div className="p-1 bg-white border border-indigo-200 text-indigo-600 rounded">
                                      <Check className="h-3 w-3" />
                                    </div>
                                    <div>
                                      <h6 className="text-[10.5px] font-extrabold text-slate-900 leading-tight">{coreMod.label}</h6>
                                      <p className="text-[8.5px] text-slate-450 leading-tight mt-0.5">{coreMod.desc}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* OPTIONAL EXTRAS */}
                            <div>
                              <h5 className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-3">2. Optional Module Marketplace Integrations (Toggle To Register):</h5>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {[
                                  { id: 'Hostel', label: 'Hostel & Bed Allocator', desc: 'Assign rooms, log rates.' },
                                  { id: 'Transport', label: 'Transport Fleet manager', desc: 'Optimize bus routes.' },
                                  { id: 'Library', label: 'Library Barcode Catalog', desc: 'Track borrowings & fines.' },
                                  { id: 'ERP', label: 'ERP Procurement Suite', desc: 'Assess asset logistics.' },
                                  { id: 'LMS', label: 'LMS Lesson Vault', desc: 'Organize class lesson boards.' },
                                  { id: 'AI', label: 'AI SuperIntel Assistant', desc: 'Gemini automatic graders.' },
                                  { id: 'Research', label: 'Research Projects Desk', desc: 'Supervise scientific proposals.' },
                                  { id: 'Alumni', label: 'Alumni Core Directory', desc: 'Engage graduated networks.' }
                                ].map(optMod => {
                                  const isActive = enabledOptionals.includes(optMod.id);
                                  return (
                                    <button
                                      key={optMod.id}
                                      type="button"
                                      onClick={() => toggleOptionalModule(optMod.id)}
                                      className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-3 h-24 ${
                                        isActive
                                          ? 'bg-emerald-50/50 border-emerald-400 ring-1 ring-emerald-400'
                                          : 'bg-slate-50 border-slate-205 hover:bg-slate-100/70'
                                      }`}
                                    >
                                      <div className={`mt-0.5 p-1 rounded border-2 ${
                                        isActive
                                          ? 'border-emerald-500 bg-emerald-500 text-white'
                                          : 'border-slate-300 bg-white'
                                      }`}>
                                        {isActive && <Check className="h-2 w-2" />}
                                      </div>
                                      <div>
                                        <h6 className="text-[10.5px] font-extrabold text-slate-900 leading-tight">{optMod.label}</h6>
                                        <p className="text-[8.5px] text-slate-450 leading-tight mt-0.5">{optMod.desc}</p>
                                        <span className={`inline-block text-[7.5px] font-mono px-1 py-0.2 rounded font-extrabold uppercase mt-1 ${
                                          isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'
                                        }`}>
                                          {isActive ? 'ENABLED' : 'DISABLED'}
                                        </span>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* SUB-TAB 4: BRANDING STUDIO */}
                  {architectureSubTab === 'branding' && (
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs animate-fade space-y-6">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-4 flex-wrap gap-4">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 font-mono uppercase tracking-wider">Tenant Branding Studio</h4>
                          <p className="text-xs text-slate-550 mt-1">Configure independent UI theme palettes, font pairings, text banners, and custom SMS keys for any tenant slice.</p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <label className="text-[10px] font-bold text-slate-500 font-mono uppercase">CHOOSE SCHOOL:</label>
                          <select
                            value={selectedBrandingSchool || (schools[0]?.id || '')}
                            onChange={(e) => {
                              const sId = e.target.value;
                              setSelectedBrandingSchool(sId);
                              const existingBrand = schoolBrands[sId] || {
                                primaryColor: '#4f46e5',
                                secondaryColor: '#10b981',
                                fontFamily: 'Inter',
                                smsSender: 'CAMPUS_SaaS',
                                mobileTheme: 'Cosmic Slate',
                                homepageTitle: 'SaaS Partner Portal'
                              };
                              setBrandForm({
                                primaryColor: existingBrand.primaryColor,
                                secondaryColor: existingBrand.secondaryColor,
                                fontFamily: existingBrand.fontFamily,
                                smsSender: existingBrand.smsSender || 'S_CAMPUS',
                                mobileTheme: existingBrand.mobileTheme || 'Cosmic Slate',
                                homepageTitle: existingBrand.homepageTitle || 'Campus Portal'
                              });
                            }}
                            className="bg-slate-100 border border-slate-200 text-xs font-bold rounded-lg px-3 py-1.5 focus:outline-none"
                          >
                            {schools.map(school => (
                              <option key={school.id} value={school.id}>{school.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                        {/* INPUT PANEL COL */}
                        <div className="lg:col-span-5 space-y-4">
                          <h5 className="text-[9.5px] font-mono font-bold text-slate-550 uppercase tracking-widest">Brand Parameters Customizer:</h5>

                          <div>
                            <label className="block text-[8px] font-bold text-slate-600 uppercase tracking-widest mb-1.5 font-mono">Custom Portal Web Header Title</label>
                            <input
                              type="text"
                              className="block w-full py-2 px-3 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:outline-none"
                              placeholder="e.g. Kenya International School Portal"
                              value={brandForm.homepageTitle}
                              onChange={(e) => setBrandForm({...brandForm, homepageTitle: e.target.value})}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[8px] font-bold text-slate-600 uppercase tracking-widest mb-1.5 font-mono">Primary Color</label>
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="color"
                                  className="w-10 h-8 rounded border border-slate-200 cursor-pointer p-0.5"
                                  value={brandForm.primaryColor}
                                  onChange={(e) => setBrandForm({...brandForm, primaryColor: e.target.value})}
                                />
                                <input
                                  type="text"
                                  className="w-full py-1.5 px-2 bg-slate-50 border border-slate-200 text-[10px] font-mono rounded"
                                  value={brandForm.primaryColor}
                                  onChange={(e) => setBrandForm({...brandForm, primaryColor: e.target.value})}
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[8px] font-bold text-slate-600 uppercase tracking-widest mb-1.5 font-mono">Secondary Color</label>
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="color"
                                  className="w-10 h-8 rounded border border-slate-200 cursor-pointer p-0.5"
                                  value={brandForm.secondaryColor}
                                  onChange={(e) => setBrandForm({...brandForm, secondaryColor: e.target.value})}
                                />
                                <input
                                  type="text"
                                  className="w-full py-1.5 px-2 bg-slate-50 border border-slate-200 text-[10px] font-mono rounded"
                                  value={brandForm.secondaryColor}
                                  onChange={(e) => setBrandForm({...brandForm, secondaryColor: e.target.value})}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[8px] font-bold text-slate-600 uppercase tracking-widest mb-1.5 font-mono">Typography Family</label>
                              <select
                                className="block w-full py-2 px-3 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:outline-none"
                                value={brandForm.fontFamily}
                                onChange={(e) => setBrandForm({...brandForm, fontFamily: e.target.value})}
                              >
                                <option value="Inter">Inter (Sans-serif)</option>
                                <option value="Space Grotesk">Space Grotesk (Tech)</option>
                                <option value="Fira Code">Fira Code (Developer)</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[8px] font-bold text-slate-600 uppercase tracking-widest mb-1.5 font-mono" title="Max 11 chars alpha-numeric eg NHS_ALERTS">SMS Sender Name</label>
                              <input
                                type="text"
                                maxLength={11}
                                className="block w-full py-2 px-3 bg-slate-50 border border-slate-200 text-xs rounded-xl font-mono focus:outline-none"
                                value={brandForm.smsSender}
                                onChange={(e) => setBrandForm({...brandForm, smsSender: e.target.value.toUpperCase()})}
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[8px] font-bold text-slate-600 uppercase tracking-widest mb-1.5 font-mono">Mobile App Layout Skin</label>
                            <select
                              className="block w-full py-2 px-3 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:outline-none"
                              value={brandForm.mobileTheme}
                              onChange={(e) => setBrandForm({...brandForm, mobileTheme: e.target.value})}
                            >
                              <option value="Cosmic Slate">Cosmic Slate (EyeCare Dark)</option>
                              <option value="Bright Play">Bright Playful (Minimalist White)</option>
                              <option value="Classic Professional">Classic Academic Professional</option>
                            </select>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              const sId = selectedBrandingSchool || (schools[0]?.id || '');
                              setSchoolBrands(prev => ({
                                ...prev,
                                [sId]: {
                                  primaryColor: brandForm.primaryColor,
                                  secondaryColor: brandForm.secondaryColor,
                                  fontFamily: brandForm.fontFamily,
                                  smsSender: brandForm.smsSender,
                                  mobileTheme: brandForm.mobileTheme,
                                  homepageTitle: brandForm.homepageTitle
                                }
                              }));
                              const logStr = `BRAND_UPDATE: Re-skinned domain UI variables for schoolId: ${sId}. SMS Sender: ${brandForm.smsSender}.`;
                              setSaasAuditLogs(prev => [
                                { id: Date.now().toString(), timestamp: new Date().toLocaleTimeString(), action: 'BRAND_UPDATE', tenant: 'SaaS Router', details: logStr, severity: 'success' },
                                ...prev
                              ]);
                              alert("Theme override files written to partition config folder successfully.");
                            }}
                            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs cursor-pointer select-none"
                          >
                            Save Tenant Branding Spec
                          </button>
                        </div>

                        {/* HIGH FIDELITY PREVIEW CARD */}
                        <div className="lg:col-span-7 bg-slate-100 rounded-2xl p-5 border border-slate-200 flex flex-col justify-between overflow-hidden">
                          <div>
                            <span className="block text-[8px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-3">
                              ❯ Interactive Mobile / Email Theme Overrides Showcase:
                            </span>

                            {/* MOBILE HEADER PREVIEW MOCKUP */}
                            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm relative space-y-4" style={{ fontFamily: brandForm.fontFamily === 'Space Grotesk' ? 'Space Grotesk' : brandForm.fontFamily === 'Fira Code' ? 'Fira Code' : 'sans-serif' }}>
                              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                <div className="flex items-center gap-1.5">
                                  <div className="w-5 h-5 rounded flex items-center justify-center text-white text-[9px] font-bold" style={{ backgroundColor: brandForm.primaryColor }}>
                                    🎓
                                  </div>
                                  <span className="text-[10px] font-extrabold" style={{ color: brandForm.primaryColor }}>
                                    {brandForm.homepageTitle.substring(0, 30)}
                                  </span>
                                </div>
                                <span className="text-[8px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-mono">
                                  *.smartcampusconnect.com
                                </span>
                              </div>

                              <div className="p-3.5 rounded-xl text-white relative overflow-hidden" style={{ backgroundColor: brandForm.primaryColor }}>
                                <div className="absolute right-0 bottom-0 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
                                <div className="relative z-10">
                                  <span className="block text-[7px] font-mono font-bold text-white/80 uppercase">SMART STUDENT ENGAGEMENT AREA</span>
                                  <h4 className="text-xs font-bold mt-1">Hello, Academic Scholar!</h4>
                                  <p className="text-[9px] text-white/95 mt-1">Your term timetables, grading profiles, and tuition invoice lists are synchronized dynamically with active row isolation parameters.</p>
                                </div>
                              </div>

                              {/* SMS TELECO TEXT SENDER PREVIEW */}
                              <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-1.5 font-mono">
                                <div className="flex items-center justify-between text-[7.5px] text-slate-400">
                                  <span className="flex items-center gap-1">✉️ SENDER: <strong className="text-slate-700 select-all">{brandForm.smsSender || 'CAMPUS_SaaS'}</strong></span>
                                  <span>16:24:15 SENT</span>
                                </div>
                                <p className="text-[9.5px] text-slate-700 leading-tight">
                                  Dear Guardian, student term balances for account sub-ledger are now processed. Outbox dispatch routed via {brandForm.smsSender}.
                                </p>
                              </div>

                              {/* DYNAMIC METRIC ACCENT */}
                              <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                                {[
                                  { label: 'Campus Attendance', value: '94.2%', col: brandForm.secondaryColor },
                                  { label: 'GPA Mean Level', value: '3.65', col: brandForm.primaryColor },
                                  { label: 'Fee Overdues', value: '$0.00', col: brandForm.secondaryColor }
                                ].map(card => (
                                  <div key={card.label} className="p-2 border border-slate-100 rounded-xl">
                                    <span className="block text-[8px] text-slate-400 font-sans">{card.label}</span>
                                    <span className="font-extrabold text-[12px] block mt-0.5" style={{ color: card.col }}>{card.value}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between text-[8.5px] text-slate-400 uppercase font-mono">
                            <span>Mobile App Skin: {brandForm.mobileTheme}</span>
                            <span>Engine Override Active</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUB-TAB 5: COUNTRY FRAMEWORK STUDIO */}
                  {architectureSubTab === 'country' && (
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs animate-fade space-y-6">
                      <div className="border-b border-slate-100 pb-4">
                        <h4 className="text-xs font-bold text-slate-900 font-mono uppercase tracking-wider">Global Country Framework Studio</h4>
                        <p className="text-xs text-slate-550 mt-1">Simulate instant country presets for localized academic calendar terms, national examination structures, official currencies, phone trunks, and payroll taxation.</p>
                      </div>

                      {/* FLAG BUTTON ROW */}
                      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                        {[
                          { id: 'Kenya', label: '🇳🇪 Kenya', code: 'KE' },
                          { id: 'Uganda', label: '🇸🇳 Uganda', code: 'UG' },
                          { id: 'Tanzania', label: '🇹🇿 Tanzania', code: 'TZ' },
                          { id: 'Rwanda', label: '🇷🇼 Rwanda', code: 'RW' },
                          { id: 'Nigeria', label: '🇳🇬 Nigeria', code: 'NG' },
                          { id: 'South Africa', label: '🇿🇦 South Africa', code: 'ZA' }
                        ].map(c => {
                          const isSelected = selectedCountry === c.id;
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => setSelectedCountry(c.id)}
                              className={`p-3 rounded-xl border font-bold text-[11px] font-mono text-center cursor-pointer transition-all ${
                                isSelected ? 'bg-cyan-50 border-cyan-400 text-cyan-800' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {c.label}
                            </button>
                          );
                        })}
                      </div>

                      {/* COUNTRY SPEC SHEET */}
                      {(() => {
                        const specs = countrySpecs[selectedCountry] || countrySpecs['Kenya'];
                        return (
                          <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 text-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6 relative overflow-hidden">
                            <div className="absolute right-0 bottom-0 text-[110px] font-bold text-slate-800/10 font-mono pointer-events-none select-none select-all">{selectedCountry.substring(0, 3).toUpperCase()}</div>

                            <div className="space-y-4">
                              <h5 className="text-[10px] font-mono font-bold text-cyan-450 uppercase tracking-widest border-b border-slate-800 pb-2">
                                ❯ Dynamic Regional Policy Guidelines:
                              </h5>

                              <div className="grid grid-cols-1 gap-3.5 text-xs font-mono">
                                <div>
                                  <span className="text-[8px] text-slate-500 block uppercase font-bold tracking-wider">OFFICIAL CURRENCY SPECIFIER:</span>
                                  <span className="text-white block mt-0.5 font-bold select-all">{specs.currency}</span>
                                </div>

                                <div>
                                  <span className="text-[8px] text-slate-500 block uppercase font-bold tracking-wider">LOCALIZED ACADEMIC CALENDAR:</span>
                                  <span className="text-white block mt-0.5 font-sans font-semibold">{specs.calendar}</span>
                                </div>

                                <div>
                                  <span className="text-[8px] text-slate-500 block uppercase font-bold tracking-wider">REGIONAL EXAMINING CORE REGISTER:</span>
                                  <span className="text-white block mt-0.5 justify-between font-bold flex">{specs.examBody} <span className="text-[9px] bg-cyan-500/10 px-1 py-0.2 rounded text-cyan-400">ENFORCED</span></span>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <h5 className="text-[10px] font-mono font-bold text-cyan-450 uppercase tracking-widest border-b border-slate-800 pb-2">
                                ❯ Tenant Localized Compliance Regulators:
                              </h5>

                              <div className="grid grid-cols-1 gap-3.5 text-xs font-mono">
                                <div>
                                  <span className="text-[8px] text-slate-500 block uppercase font-bold tracking-wider">GRADING SCALE MATRIX ENGINE:</span>
                                  <span className="text-white block mt-0.5 select-all">{specs.grading}</span>
                                </div>

                                <div>
                                  <span className="text-[8px] text-slate-500 block uppercase font-bold tracking-wider">PAYROLL COMPLIANCE TAX SCALE:</span>
                                  <span className="text-white block mt-0.5 font-sans text-xs">{specs.taxRules}</span>
                                </div>

                                <div>
                                  <span className="text-[8px] text-slate-500 block uppercase font-bold tracking-wider">TELCO CUSTOM SMS PHONE VALIDATION PREFIX:</span>
                                  <span className="text-cyan-400 block mt-0.5 font-bold select-all">{specs.phoneFormat}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* SUB-TAB 6: SUBSCRIPTION LIFECYCLE AUDITOR HUB */}
                  {architectureSubTab === 'lifecycle' && (
                    <div className="space-y-6 animate-fade">
                      {/* STATS HEADER */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                          { label: 'Total Registered Tenants', value: schools.length, color: 'text-indigo-600', sub: 'Isolated dynamically' },
                          { label: 'Average Client SLA Rate', value: '99.98%', color: 'text-emerald-600', sub: 'Real-time monitoring' },
                          { label: 'AI SuperIntel Conversions', value: '18,482 Runs', color: 'text-rose-600', sub: 'Gemini server logs' },
                          { label: 'Global Active Channels', value: schools.length * 4, color: 'text-amber-600', sub: 'Twilio + SMS trunks active' }
                        ].map(st => (
                          <div key={st.label} className="bg-white border border-slate-201 p-5 rounded-2.5xl shadow-sm">
                            <span className="block text-[8px] font-mono font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">{st.label}</span>
                            <span className={`text-xl font-extrabold ${st.color} leading-none font-mono block`}>{st.value}</span>
                            <span className="text-[9px] text-slate-450 block mt-1">{st.sub}</span>
                          </div>
                        ))}
                      </div>

                      {/* LIVEYCYCLE ACTIONS */}
                      <div className="bg-white border border-slate-202 rounded-3xl p-6 shadow-xs space-y-4">
                        <div className="border-b border-slate-100 pb-3 flex items-center justify-between flex-wrap gap-2">
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 font-mono uppercase tracking-wider">Direct Tenant Lifecycle Operator Desk</h4>
                            <p className="text-xs text-slate-500 mt-1">Upgrade tiers, archive databases, clone virtual clusters, suspend domains or restore access instantly with row verification security.</p>
                          </div>
                        </div>

                        {/* TABLE/GRID COMPONENT FOR OPERATIONS */}
                        <div className="overflow-x-auto text-xs">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-mono font-bold text-slate-500">
                                <th className="p-3">Tenant Details</th>
                                <th className="p-3">Sub Tier</th>
                                <th className="p-3">SaaS Status</th>
                                <th className="p-3 text-right">Instant Command Triggers</th>
                              </tr>
                            </thead>
                            <tbody>
                              {schools.map(school => {
                                const isSuspended = suspendedTenantIds.includes(school.id);
                                const isArchived = archivedTenantIds.includes(school.id);
                                const currentPlan = tenantPlans[school.id] || 'Starter';

                                return (
                                  <tr key={school.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                                    <td className="p-3">
                                      <div className="font-bold text-slate-850">{school.name}</div>
                                      <div className="text-[9px] font-mono text-indigo-600">{school.code.toLowerCase()}.smartcampusconnect.com</div>
                                    </td>
                                    <td className="p-3 font-mono">
                                      <select
                                        value={currentPlan}
                                        onChange={(e) => {
                                          const nextPlan = e.target.value;
                                          setTenantPlans(prev => ({ ...prev, [school.id]: nextPlan }));
                                          const detailsStr = `UPGRADE_PLAN: Plan tier modified to ${nextPlan} for tenant: ${school.name}.`;
                                          setSaasAuditLogs(prev => [
                                            { id: Date.now().toString(), timestamp: new Date().toLocaleTimeString(), action: 'UPGRADE_PLAN', tenant: school.name, details: detailsStr, severity: 'success' },
                                            ...prev
                                          ]);
                                        }}
                                        className="bg-slate-150 border border-slate-200 text-[10px] font-bold rounded px-2 py-0.5 focus:outline-none"
                                      >
                                        <option value="Starter">Starter ($199/mo)</option>
                                        <option value="Professional">Professional ($499/mo)</option>
                                        <option value="Enterprise">Enterprise ($1299/mo)</option>
                                        <option value="Government">Government (Agreed)</option>
                                      </select>
                                    </td>
                                    <td className="p-3">
                                      <span className={`inline-block px-2 py-0.5 rounded text-[8.5px] font-mono font-bold ${
                                        isSuspended ? 'bg-red-100 text-red-650' : isArchived ? 'bg-slate-200 text-slate-650' : 'bg-emerald-100 text-emerald-650'
                                      }`}>
                                        {isSuspended ? '⚠️ SUSPENDED' : isArchived ? '📁 ARCHIVED' : '● ACTIVE ONLINE'}
                                      </span>
                                    </td>
                                    <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                                      {/* SUSPEND BUTTON */}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (isSuspended) {
                                            setSuspendedTenantIds(prev => prev.filter(id => id !== school.id));
                                            const detailsStr = `RESTORE_TENANT: Security suspension lifted for tenant: ${school.name}.`;
                                            setSaasAuditLogs(prev => [
                                              { id: Date.now().toString(), timestamp: new Date().toLocaleTimeString(), action: 'RESTORE_TENANT', tenant: school.name, details: detailsStr, severity: 'success' },
                                              ...prev
                                            ]);
                                          } else {
                                            setSuspendedTenantIds(prev => [...prev, school.id]);
                                            const detailsStr = `SUSPEND_TENANT: API keys and domain gateway access suspended for tenant: ${school.name} due to billing cycle audit.`;
                                            setSaasAuditLogs(prev => [
                                              { id: Date.now().toString(), timestamp: new Date().toLocaleTimeString(), action: 'SUSPEND_TENANT', tenant: school.name, details: detailsStr, severity: 'error' },
                                              ...prev
                                            ]);
                                          }
                                        }}
                                        className={`px-2 py-1 rounded text-[9.5px] font-bold cursor-pointer font-mono ${
                                          isSuspended ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700' : 'bg-red-50 hover:bg-red-100 text-red-750'
                                        }`}
                                      >
                                        {isSuspended ? 'Restore Active' : 'Suspend Keys'}
                                      </button>

                                      {/* ARCHIVE BUTTON */}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (isArchived) {
                                            setArchivedTenantIds(prev => prev.filter(id => id !== school.id));
                                            const detailsStr = `RESTORE_TENANT: Unarchived database partition block for tenant: ${school.name}.`;
                                            setSaasAuditLogs(prev => [
                                              { id: Date.now().toString(), timestamp: new Date().toLocaleTimeString(), action: 'RESTORE_TENANT', tenant: school.name, details: detailsStr, severity: 'success' },
                                              ...prev
                                            ]);
                                          } else {
                                            setArchivedTenantIds(prev => [...prev, school.id]);
                                            const detailsStr = `ARCHIVE_TENANT: Moved schoolId database values to deep glacier archival storage files for tenant: ${school.name}.`;
                                            setSaasAuditLogs(prev => [
                                              { id: Date.now().toString(), timestamp: new Date().toLocaleTimeString(), action: 'ARCHIVE_TENANT', tenant: school.name, details: detailsStr, severity: 'warn' },
                                              ...prev
                                            ]);
                                          }
                                        }}
                                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[9.5px] font-bold cursor-pointer font-mono"
                                      >
                                        {isArchived ? 'Activate Row' : 'Archive Cold'}
                                      </button>

                                      {/* CLONE CLUSTER SLICE */}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const logMsg = `CLONE_TENANT: Spawned shadow testing sandbox virtual replica for schoolId: ${school.id}-CLONED-SLICE. Active row matrix replicated.`;
                                          setSaasAuditLogs(prev => [
                                            { id: Date.now().toString(), timestamp: new Date().toLocaleTimeString(), action: 'CLONE_TENANT', tenant: school.name, details: logMsg, severity: 'info' },
                                            ...prev
                                          ]);
                                          alert(`Initiated database cloning sequence for: ${school.name}. Spec file: shadow-${school.code.toLowerCase()}.db.json created for sandbox auditing.`);
                                        }}
                                        className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded text-[9.5px] font-bold cursor-pointer font-mono"
                                      >
                                        Clone Sandbox Slice
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* GLOBAL AUDIT LOGGER CONSOLE */}
                  <div className="bg-slate-950 text-slate-200 rounded-3xl p-5 border border-slate-900 shadow-2xl relative">
                    <div className="absolute right-4 top-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded text-[8.5px] font-mono font-bold uppercase animate-pulse">
                      ❯ System Auditor Stream: Active
                    </div>

                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono mb-3.5 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                      Cross-Region Live Tenant Event Ledger (SuperAdmin Auth Required)
                    </h4>

                    {/* TERMINAL PANEL SCREEN */}
                    <div className="bg-black/80 border border-slate-900 rounded-2xl p-4 font-mono text-[10px] max-h-56 overflow-y-auto space-y-2.5 shadow-inner">
                      {saasAuditLogs.map(log => {
                        const styleClass = log.severity === 'success' ? 'text-emerald-400' : log.severity === 'error' ? 'text-red-400 font-bold' : log.severity === 'warn' ? 'text-amber-400' : 'text-slate-300';
                        return (
                          <div key={log.id} className="flex gap-2 flex-wrap sm:flex-nowrap leading-relaxed hover:bg-white/5 p-1 rounded transition-colors select-text">
                            <span className="text-slate-500 shrink-0 select-none">[{log.timestamp}]</span>
                            <span className="text-indigo-400 font-bold shrink-0 select-all select-none">[{log.action}]</span>
                            <span className="text-cyan-400 shrink-0 font-semibold select-all">[{log.tenant}]:</span>
                            <span className={`${styleClass} select-all`}>{log.details}</span>
                          </div>
                        );
                      })}
                      <div className="flex gap-1.5 items-center text-slate-500 select-none">
                        <span>❯</span>
                        <div className="h-4 w-1.5 bg-emerald-400 animate-pulse blink-cursor" />
                        <span className="text-[9.5px]">Waiting for multi-tenant gateway logs...</span>
                      </div>
                    </div>
                  </div>

                  {/* ACTIVE AUDIT DIALOG */}
                  <AnimatePresence>
                    {activeAuditModule && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" 
                          onClick={() => setActiveAuditModule(null)}
                        />
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }}
                          className="bg-slate-950 text-slate-100 rounded-3xl p-6 max-w-lg w-full border border-slate-800 shadow-2xl relative z-10 font-mono"
                        >
                          <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-4">
                            <div className="p-2.5 bg-slate-900 text-emerald-400 rounded-xl border border-slate-800 shrink-0">
                              <Database className="h-5 w-5 animate-pulse" />
                            </div>
                            <div>
                              <div className="text-[9px] font-bold text-slate-400 flex items-center gap-2">
                                <span>Multi-Tenant Log Audit</span>
                                <span className="h-1 w-1 rounded-full bg-emerald-500" />
                                <span className="text-emerald-400 font-semibold">{activeAuditModule.school.code}</span>
                              </div>
                              <h4 className="text-xs font-bold text-white uppercase tracking-wider">{activeAuditModule.label} Tenancy State</h4>
                            </div>
                          </div>

                          <div className="space-y-4 text-[11px] leading-relaxed">
                            <div>
                              <p className="text-slate-400 text-[10.5px] font-sans leading-relaxed mb-3">
                                {activeAuditModule.desc}
                              </p>
                              
                              <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl space-y-2.5 text-[10px]">
                                <div className="space-y-1">
                                  <span className="text-slate-500 font-bold text-[9px] block uppercase tracking-wider">TENANT ACCOUNT DETAILS:</span>
                                  <div className="text-slate-300 font-sans font-medium flex justify-between">
                                    <span>Institution Name:</span>
                                    <span className="text-white font-bold">{activeAuditModule.school.name}</span>
                                  </div>
                                  <div className="text-slate-300 font-sans font-medium flex justify-between mt-1">
                                    <span>Logical Row Divider:</span>
                                    <span className="bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-mono font-bold px-1.5 py-0.5 rounded text-[8.5px]">
                                      schoolId = "{activeAuditModule.school.id}"
                                    </span>
                                  </div>
                                </div>
                                
                                <div className="border-t border-slate-800/80 pt-2.5 space-y-1">
                                  <span className="text-slate-500 font-bold text-[9px] block uppercase tracking-wider">TENANT CODEBASE DIRECT INTEGRATION:</span>
                                  <div className="text-slate-300 flex justify-between">
                                    <span>Engine File Path:</span>
                                    <span className="text-cyan-400 select-all font-mono">{activeAuditModule.path}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div>
                              <span className="block text-[9.5px] font-bold text-emerald-400 uppercase tracking-widest font-mono mb-2">
                                ❯ Active Sandbox Isolation Query:
                              </span>
                              <div className="bg-black/80 rounded-xl p-3 border border-slate-800 font-mono text-emerald-400 overflow-x-auto text-[9.5px]">
                                <code className="block select-all whitespace-pre">{activeAuditModule.query}</code>
                              </div>
                            </div>

                            <div>
                              <span className="block text-[9.5px] font-bold text-slate-400 uppercase tracking-widest font-mono mb-2">
                                ❯ Sandbox Active Row Simulation:
                              </span>
                              <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800 font-mono text-slate-300 overflow-x-auto text-[9.5px] max-h-40 overflow-y-auto">
                                <pre className="whitespace-pre">{JSON.stringify({
                                  status: "CONNECTION_SECURED",
                                  timestamp: "2026-06-06T16:24:15Z",
                                  tenant_namespace: `${activeAuditModule.school.code.toLowerCase()}.smartcampusconnect.com`,
                                  row_level_filters: {
                                    enforced: true,
                                    target_key: "schoolId",
                                    target_value: activeAuditModule.school.id,
                                    execution_hash: "sha256-uos_isolated_db"
                                  },
                                  sandbox_record_set: [
                                    {
                                      id: `rec-${activeAuditModule.id.toLowerCase()}-01`,
                                      schoolId: activeAuditModule.school.id,
                                      title: `Isolated ${activeAuditModule.label} Record Entry`,
                                      verified: true,
                                      created_at: "2026-03-12T08:00:00Z"
                                    }
                                  ]
                                }, null, 2)}</pre>
                              </div>
                            </div>
                          </div>

                          <div className="pt-4 mt-4 border-t border-slate-800 flex justify-end">
                            <button
                              type="button"
                              onClick={() => setActiveAuditModule(null)}
                              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:text-white rounded-xl text-[10px] font-bold cursor-pointer transition-colors"
                            >
                              Close Audit Shell
                            </button>
                          </div>
                        </motion.div>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* TAB 5: SYSTEM OPERATOR SETTINGS */}
              {activeTab === 'settings' && (
                <div className="max-w-3xl bg-white rounded-xl p-8 border border-slate-200 shadow-sm space-y-8 animate-fade">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 font-mono uppercase tracking-wider">Global Configuration Variables</h3>
                    <p className="text-xs text-slate-450 mt-1">Diagnostic toggles, administrative settings, and database triggers.</p>
                  </div>

                  <div className="space-y-6">
                    <div className="p-4 bg-slate-50 rounded border border-slate-200 flex items-center justify-between">
                      <div className="max-w-md">
                        <h4 className="text-xs font-bold text-slate-900">System Developer Mode Diagnostics</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">Prints real-time file read/write database synchronization processes inside server console logs for easier debugging.</p>
                      </div>
                      <div className="w-12 h-6 bg-emerald-500 rounded-full flex items-center justify-end p-1 cursor-pointer">
                        <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-150 flex items-center justify-between">
                      <div className="max-w-md">
                        <h4 className="text-xs font-bold text-slate-900">Custom Admission Portals API</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">Permits external integrations (e.g., bulk XLS enrollment) to interface directly with student table payloads.</p>
                      </div>
                      <div className="w-12 h-6 bg-slate-300 rounded-full flex items-center justify-start p-1 cursor-pointer">
                        <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                      </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex flex-col gap-4">
                      <h4 className="text-xs font-bold text-slate-900">System Reset Options</h4>
                      <p className="text-xs text-slate-500">
                        In case of manual testing corruptive states, you are able to wipe out added records and restore database settings to the initial pristine baseline configurations.
                      </p>
                      <div>
                        <button
                          onClick={async () => {
                            if (confirm("Reset persistence files back to initial Super Admin? All newly created schools, departments, and students will be permanently removed.")) {
                              setLoading(true);
                              try {
                                const resp = await fetch('/api/dev/reset-and-seed', { method: 'POST' });
                                if (resp.ok) {
                                  setSuccessMsg("System Database back to initial default Super Admin successfully!");
                                  await fetchData();
                                }
                              } catch (e: any) {
                                setError(e.message);
                              } finally {
                                setLoading(false);
                              }
                            }
                          }}
                          className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-semibold font-mono transition-all cursor-pointer"
                        >
                          Reset Database To Super Admin Default
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: ACADEMIC TEMPLATES LIBRARY */}
              {activeTab === 'templates' && (
                <div className="space-y-6 animate-fade text-slate-800">
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 font-mono uppercase tracking-wider">Global Academic Templates Library</h3>
                      <p className="text-xs text-slate-500 mt-1">Configure unified starter entities for newly provisioned campus tenants.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={handleSeedTemplates}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all animate-none"
                      >
                        <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                        <span>Seed Default Templates</span>
                      </button>
                      <button
                        onClick={openTemplateAddModal}
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add Template {selectedTemplateTab.charAt(0).toUpperCase() + selectedTemplateTab.slice(1, -1)}</span>
                      </button>
                    </div>
                  </div>

                  {/* Sub tabs filtering */}
                  <div className="border-b border-slate-200 flex flex-wrap gap-2 text-xs">
                    {(['faculties', 'departments', 'programs', 'units', 'mappings'] as const).map(tab => (
                      <button
                        key={tab}
                        onClick={() => { setSelectedTemplateTab(tab); setTemplateSearch(''); }}
                        className={`pb-2.5 px-4 font-bold border-b-2 transition-all cursor-pointer ${
                          selectedTemplateTab === tab
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)} ({
                          tab === 'faculties' ? (templateData.faculties || []).length :
                          tab === 'departments' ? (templateData.departments || []).length :
                          tab === 'programs' ? (templateData.programs || []).length :
                          tab === 'units' ? (templateData.units || []).length :
                          (templateData.programUnits || []).length
                        })
                      </button>
                    ))}
                  </div>

                  {/* Search and results list */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-200 bg-slate-50/60">
                      <input
                        type="text"
                        placeholder={`Search ${selectedTemplateTab}...`}
                        value={templateSearch}
                        onChange={(e) => setTemplateSearch(e.target.value)}
                        className="w-full max-w-sm py-1.5 px-3 bg-white border border-slate-200 rounded text-xs outline-none"
                      />
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50/60 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                            <th className="py-3 px-6">ID</th>
                            {selectedTemplateTab === 'faculties' && (
                              <>
                                <th className="py-3 px-6">Name</th>
                                <th className="py-3 px-6">Code</th>
                              </>
                            )}
                            {selectedTemplateTab === 'departments' && (
                              <>
                                <th className="py-3 px-6">Department Name</th>
                                <th className="py-3 px-6">Belongs To School/Faculty</th>
                              </>
                            )}
                            {selectedTemplateTab === 'programs' && (
                              <>
                                <th className="py-3 px-6">Program Name</th>
                                <th className="py-3 px-6">Code</th>
                                <th className="py-3 px-6">Belongs To Department</th>
                                <th className="py-3 px-6">Base Capacity</th>
                              </>
                            )}
                            {selectedTemplateTab === 'units' && (
                              <>
                                <th className="py-3 px-6">Unit Name</th>
                                <th className="py-3 px-6">Code</th>
                                <th className="py-3 px-6">Home Department</th>
                              </>
                            )}
                            {selectedTemplateTab === 'mappings' && (
                              <>
                                <th className="py-3 px-6">Program Title</th>
                                <th className="py-3 px-6">Mapped Academic Unit</th>
                              </>
                            )}
                            <th className="py-3 px-6 text-center">Status</th>
                            <th className="py-3 px-6 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 flex-none">
                          {templatesLoading ? (
                            <tr>
                              <td colSpan={8} className="py-12 text-center text-slate-400 font-mono text-xs">
                                Synchronizing templates database partition...
                              </td>
                            </tr>
                          ) : (
                            (() => {
                              let list: any[] = [];
                              if (selectedTemplateTab === 'faculties') list = templateData.faculties || [];
                              else if (selectedTemplateTab === 'departments') list = templateData.departments || [];
                              else if (selectedTemplateTab === 'programs') list = templateData.programs || [];
                              else if (selectedTemplateTab === 'units') list = templateData.units || [];
                              else if (selectedTemplateTab === 'mappings') list = templateData.programUnits || [];

                              // Filter by search
                              const filtered = list.filter(item => {
                                const q = templateSearch.toLowerCase();
                                if (!q) return true;
                                if (selectedTemplateTab === 'faculties') {
                                  return item.name?.toLowerCase().includes(q) || item.code?.toLowerCase().includes(q) || item.id?.toString().toLowerCase().includes(q);
                                } else if (selectedTemplateTab === 'departments') {
                                  const facultyName = templateData.faculties.find(f => f.id === item.facultyId)?.name || '';
                                  return item.name?.toLowerCase().includes(q) || facultyName.toLowerCase().includes(q) || item.id?.toString().toLowerCase().includes(q);
                                } else if (selectedTemplateTab === 'programs') {
                                  const deptName = templateData.departments.find(d => d.id === item.departmentId)?.name || '';
                                  return item.name?.toLowerCase().includes(q) || item.code?.toLowerCase().includes(q) || deptName.toLowerCase().includes(q);
                                } else if (selectedTemplateTab === 'units') {
                                  const deptName = templateData.departments.find(d => d.id === item.departmentId)?.name || '';
                                  return item.name?.toLowerCase().includes(q) || item.code?.toLowerCase().includes(q) || deptName.toLowerCase().includes(q);
                                } else if (selectedTemplateTab === 'mappings') {
                                  const progName = templateData.programs.find(p => p.id === item.programId)?.name || '';
                                  const unitName = templateData.units.find(u => u.id === item.unitId)?.name || '';
                                  return progName.toLowerCase().includes(q) || unitName.toLowerCase().includes(q);
                                }
                                return false;
                              });

                              if (filtered.length === 0) {
                                return (
                                  <tr>
                                    <td colSpan={8} className="py-12 text-center text-slate-400 font-mono">
                                      No template entities encountered matching search term.
                                    </td>
                                  </tr>
                                );
                              }

                              return filtered.map(item => (
                                <tr key={item.id} className="hover:bg-slate-50/50">
                                  <td className="py-3 px-6 font-mono text-slate-400 font-bold tracking-tight">{item.id}</td>
                                  {selectedTemplateTab === 'faculties' && (
                                    <>
                                      <td className="py-3 px-6 font-semibold text-slate-900">{item.name}</td>
                                      <td className="py-3 px-6 font-mono text-slate-600 font-bold">{item.code}</td>
                                    </>
                                  )}
                                  {selectedTemplateTab === 'departments' && (
                                    <>
                                      <td className="py-3 px-6 font-semibold text-slate-900">{item.name}</td>
                                      <td className="py-3 px-6 text-slate-500 font-mono">
                                        {templateData.faculties.find(f => f.id === item.facultyId)?.name || 'Unknown Faculty'}
                                      </td>
                                    </>
                                  )}
                                  {selectedTemplateTab === 'programs' && (
                                    <>
                                      <td className="py-3 px-6 font-semibold text-slate-900">{item.name}</td>
                                      <td className="py-3 px-6 font-mono text-slate-600 font-bold">{item.code}</td>
                                      <td className="py-3 px-6 text-slate-500 font-mono">
                                        {templateData.departments.find(d => d.id === item.departmentId)?.name || 'Unknown Dept'}
                                      </td>
                                      <td className="py-3 px-6 font-mono font-bold text-slate-700">{item.capacity || 150}</td>
                                    </>
                                  )}
                                  {selectedTemplateTab === 'units' && (
                                    <>
                                      <td className="py-3 px-6 font-semibold text-slate-900">{item.name}</td>
                                      <td className="py-3 px-6 font-mono text-slate-600 font-bold">{item.code}</td>
                                      <td className="py-3 px-6 text-slate-500 font-mono">
                                        {templateData.departments.find(d => d.id === item.departmentId)?.name || 'General Core'}
                                      </td>
                                    </>
                                  )}
                                  {selectedTemplateTab === 'mappings' && (
                                    <>
                                      <td className="py-3 px-6 font-semibold text-slate-800">
                                        {templateData.programs.find(p => p.id === item.programId)?.name || 'Unknown Program'}
                                        <span className="block text-[9px] font-mono text-slate-400 font-bold mt-0.5">
                                          ({templateData.programs.find(p => p.id === item.programId)?.code || ''})
                                        </span>
                                      </td>
                                      <td className="py-3 px-6 text-slate-600 font-mono">
                                        {templateData.units.find(u => u.id === item.unitId)?.name || 'Unknown Unit'}
                                        <span className="block text-[9px] font-mono text-slate-400 font-bold mt-0.5">
                                          ({templateData.units.find(u => u.id === item.unitId)?.code || ''})
                                        </span>
                                      </td>
                                    </>
                                  )}
                                  <td className="py-3 px-6 text-center">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                                      item.disabled 
                                        ? 'bg-rose-50 text-rose-600 border-rose-150' 
                                        : 'bg-emerald-50 text-emerald-600 border-emerald-150'
                                    }`}>
                                      {item.disabled ? 'Disabled' : 'Enabled'}
                                    </span>
                                  </td>
                                  <td className="py-3 px-6 text-right space-x-1 whitespace-nowrap">
                                    <button
                                      onClick={() => handleToggleTemplateStatus(item, selectedTemplateTab)}
                                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                                        item.disabled 
                                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200' 
                                          : 'bg-red-50 text-red-700 hover:bg-red-100 border-red-200'
                                      }`}
                                    >
                                      {item.disabled ? 'Enable' : 'Disable'}
                                    </button>
                                    <button
                                      onClick={() => openTemplateEditModal(item)}
                                      className="px-1.5 py-0.5 bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded text-[10px] font-bold cursor-pointer"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeleteTemplate(item.id, selectedTemplateTab)}
                                      className="px-1.5 py-0.5 bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 rounded text-[10px] font-bold cursor-pointer"
                                    >
                                      Delete
                                    </button>
                                  </td>
                                </tr>
                              ));
                            })()
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* MODAL 1: CREATE NEW SCHOOL */}
        <AnimatePresence>
          {showCreateSchoolModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" 
                onClick={() => setShowCreateSchoolModal(false)}
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="bg-white rounded-3xl max-w-md w-full border border-slate-150 shadow-2xl relative z-10 flex flex-col max-h-[90vh] overflow-hidden"
              >
                <div className="flex items-center gap-3 p-8 pb-6 shrink-0 border-b border-slate-100">
                  <div className="p-2.5 bg-slate-900 text-emerald-400 rounded-2xl">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-950">Create New School Tenant</h3>
                    <p className="text-xs text-slate-400">Provision unique sandbox directory values.</p>
                  </div>
                </div>

                <form onSubmit={handleCreateSchool} className="flex flex-col min-h-0 flex-1" id="school-create-form-modal">
                  <div className="p-8 py-6 space-y-4 overflow-y-auto min-h-0 flex-1">
                    <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1.5 font-mono">School Name</label>
                    <input
                      required
                      type="text"
                      className="block w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-850"
                      placeholder="Nairobi High School"
                      value={schoolForm.name}
                      onChange={(e) => setSchoolForm({...schoolForm, name: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-1">
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1.5 font-mono" title="A unique 3-6 char prefix eg NHS001">Code</label>
                      <input
                        required
                        type="text"
                        maxLength={8}
                        className="block w-full py-2.5 px-3 bg-slate-50 border border-slate-200 text-xs rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-850 text-center"
                        placeholder="NHS001"
                        value={schoolForm.code}
                        onChange={(e) => setSchoolForm({...schoolForm, code: e.target.value})}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1.5 font-mono">Operations Phone</label>
                      <input
                        required
                        type="text"
                        className="block w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200 text-xs rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
                        placeholder="0700000000"
                        value={schoolForm.phone}
                        onChange={(e) => setSchoolForm({...schoolForm, phone: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1.5 font-mono">Registrar Email</label>
                    <input
                      required
                      type="email"
                      className="block w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200 text-xs rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
                      placeholder="info@nairobihigh.ac.ke"
                      value={schoolForm.email}
                      onChange={(e) => setSchoolForm({...schoolForm, email: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1.5 font-mono">Institution Category</label>
                    <select
                      className="block w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:font-medium font-sans"
                      value={schoolForm.institutionType || 'University'}
                      onChange={(e) => {
                        const newType = e.target.value;
                        setSchoolForm({...schoolForm, institutionType: newType});
                        const defaultTemp = INSTITUTION_TEMPLATES[newType] || INSTITUTION_TEMPLATES['University'];
                        setTemplateConfig(JSON.parse(JSON.stringify(defaultTemp)));
                      }}
                    >
                      <option value="Lower Primary School">Lower Primary School</option>
                      <option value="Primary School">Primary School</option>
                      <option value="Secondary School">Secondary School</option>
                      <option value="TVET Institution">TVET Institution</option>
                      <option value="College">College</option>
                      <option value="University">University</option>
                      <option value="Training Center">Training Center (Professional)</option>
                      <option value="Corporate Academy">Corporate Academy</option>
                    </select>
                  </div>

                  {/* Template Engine Customizer */}
                  <div className="bg-slate-100 border border-slate-200 rounded-2xl p-4.5 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                      <div>
                        <h4 className="text-[11px] font-bold text-slate-900 font-sans">Template Customization</h4>
                        <p className="text-[9px] text-slate-500 font-sans">Override template characteristics and terminologies for this school</p>
                      </div>
                      <span className="text-[9px] bg-slate-900 text-white font-bold font-mono px-2 py-0.5 rounded-full">
                        ACTIVE
                      </span>
                    </div>

                    {/* Modules Activation Matrix */}
                    <div className="space-y-2">
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider font-mono">Module Activations</label>
                      <div className="grid grid-cols-2 gap-1.5 text-xs">
                        {Object.keys(templateConfig.modules).map((modKey) => (
                          <label key={modKey} className="flex items-center gap-2 bg-white border border-slate-200 p-2 rounded-xl cursor-pointer hover:border-slate-350 transition-all select-none">
                            <input
                              type="checkbox"
                              checked={templateConfig.modules[modKey as keyof typeof templateConfig.modules]}
                              onChange={(e) => {
                                setTemplateConfig({
                                  ...templateConfig,
                                  modules: {
                                    ...templateConfig.modules,
                                    [modKey]: e.target.checked
                                  }
                                });
                              }}
                              className="accent-slate-900"
                            />
                            <span className="capitalize text-[10px] font-medium text-slate-700 font-sans">
                              {modKey.replace(/([A-Z])/g, ' $1')}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Terminology Overrides */}
                    <div className="space-y-2">
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider font-mono">Terminology Labels</label>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.keys(templateConfig.terminology).map((termKey) => (
                          <div key={termKey} className="space-y-1">
                            <label className="block text-[8px] font-bold text-slate-600 uppercase font-mono">{termKey}</label>
                            <input
                              type="text"
                              required
                              value={templateConfig.terminology[termKey as keyof typeof templateConfig.terminology]}
                              onChange={(e) => {
                                setTemplateConfig({
                                  ...templateConfig,
                                  terminology: {
                                    ...templateConfig.terminology,
                                    [termKey]: e.target.value
                                  }
                                });
                              }}
                              className="block w-full py-1 px-2.5 bg-white border border-slate-200 text-[10px] rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 font-sans font-medium"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1.5 font-mono">Academic Setup Option</label>
                    <select
                      className="block w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:font-medium"
                      value={schoolForm.academicSetup || 'import'}
                      onChange={(e) => setSchoolForm({...schoolForm, academicSetup: e.target.value})}
                    >
                      <option value="import">Import Corporate Templates (Recommended)</option>
                      <option value="empty">Start Empty Sandbox</option>
                    </select>
                  </div>

                  </div>

                  <div className="p-8 pt-4 border-t border-slate-100 flex justify-end gap-3.5 text-xs font-semibold shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowCreateSchoolModal(false)}
                      className="px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl hover:bg-slate-100 transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitLoading}
                      className="px-4 py-2.5 bg-slate-900 hover:bg-slate-850 text-white rounded-xl shadow transition-all cursor-pointer"
                    >
                      {submitLoading ? 'Creating School...' : 'Provision School'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL 2: CREATE SCHOOL ADMINISTRATOR BINDING */}
        <AnimatePresence>
          {showCreateAdminModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" 
                onClick={() => setShowCreateAdminModal(false)}
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="bg-white rounded-3xl max-w-md w-full border border-slate-150 shadow-2xl relative z-10 flex flex-col max-h-[90vh] overflow-hidden"
              >
                <div className="flex items-center gap-3 p-8 pb-6 shrink-0 border-b border-slate-100">
                  <div className="p-2.5 bg-slate-900 text-emerald-400 rounded-2xl">
                    <UserPlus className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-950">Add Administrator Binding</h3>
                    <p className="text-xs text-slate-400">Map an operator control account to a school.</p>
                  </div>
                </div>

                <form onSubmit={handleCreateAdmin} className="flex flex-col min-h-0 flex-1" id="admin-create-form-modal">
                  <div className="p-8 py-6 space-y-4 overflow-y-auto min-h-0 flex-1">
                    <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1.5 font-mono">Select Campus Target</label>
                    <select
                      required
                      value={adminForm.schoolId}
                      onChange={(e) => setAdminForm({...adminForm, schoolId: e.target.value})}
                      className="block w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                    >
                      {schools.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1.5 font-mono">Administrator Full Name</label>
                    <input
                      required
                      type="text"
                      className="block w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:outline-none"
                      placeholder="John Doe"
                      value={adminForm.name}
                      onChange={(e) => setAdminForm({...adminForm, name: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1.5 font-mono">Contact Phone</label>
                      <input
                        type="text"
                        className="block w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200 text-xs rounded-xl font-mono focus:outline-none"
                        placeholder="0700000000"
                        value={adminForm.phone}
                        onChange={(e) => setAdminForm({...adminForm, phone: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1.5 font-mono">Dev Password</label>
                      <input
                        required
                        type="text"
                        className="block w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200 text-xs rounded-xl font-mono focus:outline-none"
                        placeholder="12345678"
                        value={adminForm.password}
                        onChange={(e) => setAdminForm({...adminForm, password: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1.5 font-mono">Operator Email (Will act as login ID)</label>
                    <input
                      required
                      type="email"
                      className="block w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200 text-xs rounded-xl font-mono focus:outline-none"
                      placeholder="admin@nairobihigh.ac.ke"
                      value={adminForm.email}
                      onChange={(e) => setAdminForm({...adminForm, email: e.target.value})}
                    />
                  </div>

                  </div>

                  <div className="p-8 pt-4 border-t border-slate-100 flex justify-end gap-3 text-xs font-semibold shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowCreateAdminModal(false)}
                      className="px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl hover:bg-slate-100 transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitLoading}
                      className="px-4 py-2.5 bg-slate-900 hover:bg-slate-850 text-white rounded-xl shadow transition-all cursor-pointer"
                    >
                      {submitLoading ? 'Registering...' : 'Register Operator'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL 3: ACADEMIC TEMPLATE POPUP */}
        <AnimatePresence>
          {showTemplateModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs animate-fade-in" 
                onClick={() => setShowTemplateModal(false)}
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="bg-white rounded-3xl p-8 max-w-md w-full border border-slate-150 shadow-2xl relative z-10 text-slate-850"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-slate-900 text-emerald-400 rounded-2xl">
                    <Database className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-950">
                      {editingTemplate ? 'Edit' : 'Add'} Global {selectedTemplateTab.charAt(0).toUpperCase() + selectedTemplateTab.slice(1, -1)}
                    </h3>
                    <p className="text-xs text-slate-400">Configure corporate system academic template settings.</p>
                  </div>
                </div>

                <form onSubmit={handleCreateOrUpdateTemplate} className="space-y-4">
                  {selectedTemplateTab === 'faculties' && (
                    <>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1.5 font-mono">Faculty/School Name</label>
                        <input
                          required
                          type="text"
                          className="block w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                          placeholder="e.g. School of Business"
                          value={tmpFacultyForm.name}
                          onChange={(e) => setTmpFacultyForm({ ...tmpFacultyForm, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1.5 font-mono">Faculty Prefix Code (Acro)</label>
                        <input
                          required
                          type="text"
                          className="block w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 uppercase font-mono"
                          placeholder="e.g. School"
                          value={tmpFacultyForm.code}
                          onChange={(e) => setTmpFacultyForm({ ...tmpFacultyForm, code: e.target.value })}
                        />
                      </div>
                    </>
                  )}

                  {selectedTemplateTab === 'departments' && (
                    <>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1.5 font-mono">Belongs Under Faculty/School</label>
                        <select
                          className="block w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                          value={tmpDepartmentForm.facultyId}
                          onChange={(e) => setTmpDepartmentForm({ ...tmpDepartmentForm, facultyId: e.target.value })}
                        >
                          {templateData.faculties.map(f => (
                            <option key={f.id} value={f.id}>{f.name} ({f.code})</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1.5 font-mono">Department Name</label>
                        <input
                          required
                          type="text"
                          className="block w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                          placeholder="e.g. Finance & Actuarial"
                          value={tmpDepartmentForm.name}
                          onChange={(e) => setTmpDepartmentForm({ ...tmpDepartmentForm, name: e.target.value })}
                        />
                      </div>
                    </>
                  )}

                  {selectedTemplateTab === 'programs' && (
                    <>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1.5 font-mono">Belongs Under Department</label>
                        <select
                          className="block w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                          value={tmpProgramForm.departmentId}
                          onChange={(e) => setTmpProgramForm({ ...tmpProgramForm, departmentId: e.target.value })}
                        >
                          {templateData.departments.map(d => {
                            const fac = templateData.faculties.find(f => f.id === d.facultyId);
                            return <option key={d.id} value={d.id}>{d.name} [{fac?.code || ''}]</option>;
                          })}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1.5 font-mono">Program Title Name</label>
                        <input
                          required
                          type="text"
                          className="block w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                          placeholder="e.g. Bachelor of Actuarial Science"
                          value={tmpProgramForm.name}
                          onChange={(e) => setTmpProgramForm({ ...tmpProgramForm, name: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1.5 font-mono">Acro Code</label>
                          <input
                            required
                            type="text"
                            className="block w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 uppercase font-mono"
                            placeholder="e.g. BACT"
                            value={tmpProgramForm.code}
                            onChange={(e) => setTmpProgramForm({ ...tmpProgramForm, code: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1.5 font-mono">Base Capacity</label>
                          <input
                            required
                            type="number"
                            className="block w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                            placeholder="e.g. 150"
                            value={tmpProgramForm.capacity}
                            onChange={(e) => setTmpProgramForm({ ...tmpProgramForm, capacity: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {selectedTemplateTab === 'units' && (
                    <>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1.5 font-mono">Belongs Under Department</label>
                        <select
                          className="block w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                          value={tmpUnitForm.departmentId}
                          onChange={(e) => setTmpUnitForm({ ...tmpUnitForm, departmentId: e.target.value })}
                        >
                          {templateData.departments.map(d => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1.5 font-mono">Unit Title Name</label>
                        <input
                          required
                          type="text"
                          className="block w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                          placeholder="e.g. Real-Time Distributed Architectures"
                          value={tmpUnitForm.name}
                          onChange={(e) => setTmpUnitForm({ ...tmpUnitForm, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1.5 font-mono">Unit Academic Code</label>
                        <input
                          required
                          type="text"
                          className="block w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 uppercase font-mono"
                          placeholder="e.g. CSC403"
                          value={tmpUnitForm.code}
                          onChange={(e) => setTmpUnitForm({ ...tmpUnitForm, code: e.target.value })}
                        />
                      </div>
                    </>
                  )}

                  {selectedTemplateTab === 'mappings' && (
                    <>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1.5 font-mono">Select Program</label>
                        <select
                          className="block w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                          value={tmpMappingForm.programId}
                          onChange={(e) => setTmpMappingForm({ ...tmpMappingForm, programId: e.target.value })}
                        >
                          {templateData.programs.map(p => (
                            <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1.5 font-mono">Select Unit Mapped</label>
                        <select
                          className="block w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                          value={tmpMappingForm.unitId}
                          onChange={(e) => setTmpMappingForm({ ...tmpMappingForm, unitId: e.target.value })}
                        >
                          {templateData.units.map(u => (
                            <option key={u.id} value={u.id}>{u.name} ({u.code})</option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                  <div className="pt-4 flex justify-end gap-3.5 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setShowTemplateModal(false)}
                      className="px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl hover:bg-slate-100 transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow transition-all cursor-pointer"
                    >
                      {editingTemplate ? 'Update Master' : 'Create Template'}
                    </button>
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
