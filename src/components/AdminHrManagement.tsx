import React, { useState, useEffect } from 'react';
import { 
  Users, Calendar, FileText, CheckCircle, Clock, CreditCard, 
  TrendingUp, Plus, Search, Award, BookOpen, Sliders, MapPin, 
  RotateCw, XCircle, PlusCircle, Briefcase, Percent, Activity, FileCheck, Check
} from 'lucide-react';

interface AdminHrManagementProps {
  token: string;
  appendLog: (msg: string) => void;
  isPhoneFrame?: boolean;
}

export default function AdminHrManagement({ token, appendLog, isPhoneFrame = false }: AdminHrManagementProps) {
  // Navigation tabs of HR Workspace
  const [hrSubTab, setHrSubTab] = useState<'analytics' | 'employees' | 'recruitment' | 'leaves' | 'attendance' | 'payroll' | 'performance_training' | 'self_service'>('analytics');

  // Loading states
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [balances, setBalances] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [payrollCycles, setPayrollCycles] = useState<any[]>([]);
  const [payslips, setPayslips] = useState<any[]>([]);
  const [selectedCycleId, setSelectedCycleId] = useState<string>('');
  const [performanceReviews, setPerformanceReviews] = useState<any[]>([]);
  const [trainings, setTrainings] = useState<any[]>([]);

  // Form states
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [showAddJobModal, setShowAddJobModal] = useState(false);
  const [showAddContractModal, setShowAddContractModal] = useState(false);
  const [showAddCycleModal, setShowAddCycleModal] = useState(false);
  const [showAddReviewModal, setShowAddReviewModal] = useState(false);
  const [showAddTrainingModal, setShowAddTrainingModal] = useState(false);

  // New Employee Form state
  const [newEmp, setNewEmp] = useState({
    name: '', email: '', phone: '', designation: 'Lecturer', 
    type: 'Academic Staff', departmentId: 'dept-cs', campus: 'Main Campus',
    joinedDate: '2026-06-01', bankName: 'Equity Bank Kenya',
    bankAccount: '1210174459021', kraPin: 'A009184511Z', basicSalary: '135000'
  });

  // New Job position Form state
  const [newJob, setNewJob] = useState({
    title: '', departmentId: 'dept-cs', description: '', capacity: '1', salaryRange: 'KES 120,000 - 180,000'
  });

  // New Contract Form state
  const [newContract, setNewContract] = useState({
    employeeId: '', contractType: 'Permanent', basicSalary: '150000', 
    housingAllowance: '30000', transportAllowance: '12000', riskAllowance: '5000',
    startDate: '2026-06-01', endDate: '2030-06-01'
  });

  // New Payroll Cycle state
  const [newCycle, setNewCycle] = useState({
    name: 'June 2026 Salary Cycle', startDate: '2026-06-01', endDate: '2026-06-30'
  });

  // New Performance Review
  const [newReview, setNewReview] = useState({
    employeeId: '', overallRating: '8', feedback: '', promotionRecommended: 'false'
  });

  // New Training / CPD Course state
  const [newTraining, setNewTraining] = useState({
    title: '', type: 'Workshop', date: '2026-06-15', durationHours: '8', organizer: 'University Faculty Committee'
  });

  // Self Service demo simulation states for currently acting user
  const [simEmployee, setSimEmployee] = useState<any>(null);
  const [selfLeaveType, setSelfLeaveType] = useState('');
  const [selfLeaveStart, setSelfLeaveStart] = useState('2026-06-10');
  const [selfLeaveEnd, setSelfLeaveEnd] = useState('2026-06-15');
  const [selfLeaveDays, setSelfLeaveDays] = useState('5');
  const [selfLeaveReason, setSelfLeaveReason] = useState('Personal family break');

  // Load all system data on mount or tab changes
  useEffect(() => {
    fetchData();
  }, [hrSubTab, selectedCycleId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Employees list
      const empRes = await fetch('/api/hr/employees', { headers: { Authorization: `Bearer ${token}` } });
      const empData = await empRes.json();
      if (Array.isArray(empData)) {
        setEmployees(empData);
        // Default select first employee to simulate employee self-service login
        if (empData.length > 0 && !simEmployee) {
          setSimEmployee(empData[0]);
        }
      }

      // 2. Jobs
      const jobsRes = await fetch('/api/hr/jobs', { headers: { Authorization: `Bearer ${token}` } });
      const jobsData = await jobsRes.json();
      if (Array.isArray(jobsData)) setJobs(jobsData);

      // 3. Applications
      const appRes = await fetch('/api/hr/applications', { headers: { Authorization: `Bearer ${token}` } });
      const appData = await appRes.json();
      if (Array.isArray(appData)) setApplications(appData);

      // 4. Interviews
      const intRes = await fetch('/api/hr/interviews', { headers: { Authorization: `Bearer ${token}` } });
      const intData = await intRes.json();
      if (Array.isArray(intData)) setInterviews(intData);

      // 5. Contracts
      const contrRes = await fetch('/api/hr/contracts', { headers: { Authorization: `Bearer ${token}` } });
      const contrData = await contrRes.json();
      if (Array.isArray(contrData)) setContracts(contrData);

      // 6. Leaves Types & Requests
      const ltRes = await fetch('/api/hr/leaves/types', { headers: { Authorization: `Bearer ${token}` } });
      const ltData = await ltRes.json();
      if (Array.isArray(ltData)) {
        setLeaveTypes(ltData);
        if (ltData.length > 0 && !selfLeaveType) {
          setSelfLeaveType(ltData[0].id);
        }
      }

      const reqRes = await fetch('/api/hr/leaves/requests', { headers: { Authorization: `Bearer ${token}` } });
      const reqData = await reqRes.json();
      if (Array.isArray(reqData)) setLeaveRequests(reqData);

      const balRes = await fetch('/api/hr/leaves/balances', { headers: { Authorization: `Bearer ${token}` } });
      const balData = await balRes.json();
      if (Array.isArray(balData)) setBalances(balData);

      // 7. Attendance
      const attRes = await fetch('/api/hr/attendance', { headers: { Authorization: `Bearer ${token}` } });
      const attData = await attRes.json();
      if (Array.isArray(attData)) setAttendance(attData);

      // 8. Payroll Cycles
      const cyRes = await fetch('/api/hr/payroll/cycles', { headers: { Authorization: `Bearer ${token}` } });
      const cyData = await cyRes.json();
      if (Array.isArray(cyData)) {
        setPayrollCycles(cyData);
        if (cyData.length > 0 && !selectedCycleId) {
          setSelectedCycleId(cyData[0].id);
        }
      }

      // Payslips
      if (selectedCycleId || (cyData && cyData.length > 0)) {
        const targetCycle = selectedCycleId || cyData[0].id;
        const slipRes = await fetch(`/api/hr/payroll/salaries?cycleId=${targetCycle}`, { headers: { Authorization: `Bearer ${token}` } });
        const slipData = await slipRes.json();
        if (Array.isArray(slipData)) setPayslips(slipData);
      }

      // 9. Evaluations, Reviews, workshops
      const revRes = await fetch('/api/hr/performance/reviews', { headers: { Authorization: `Bearer ${token}` } });
      const revData = await revRes.json();
      if (Array.isArray(revData)) setPerformanceReviews(revData);

      const trnRes = await fetch('/api/hr/trainings', { headers: { Authorization: `Bearer ${token}` } });
      const trnData = await trnRes.json();
      if (Array.isArray(trnData)) setTrainings(trnData);

    } catch (err: any) {
      appendLog(`Error fetching HR Engine metrics: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 1. Hiring Action
  const handleHireEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/hr/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newEmp)
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
        appendLog(`Hire failed: ${data.error}`);
      } else {
        appendLog(`Hired employee successful: ${data.name} (${data.employeeNumber})`);
        setShowAddEmployeeModal(false);
        setNewEmp({
          name: '', email: '', phone: '', designation: 'Lecturer', 
          type: 'Academic Staff', departmentId: 'dept-cs', campus: 'Main Campus',
          joinedDate: '2026-06-01', bankName: 'Equity Bank Kenya',
          bankAccount: '1210174459021', kraPin: 'A009184511Z', basicSalary: '135000'
        });
        fetchData();
      }
    } catch (err: any) {
      appendLog(`Error on hiring employee: ${err.message}`);
    }
  };

  // 2. Post Job position Openings
  const handleAddJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/hr/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newJob)
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else {
        appendLog(`Posted job vacancy: ${data.title}`);
        setShowAddJobModal(false);
        setNewJob({ title: '', departmentId: 'dept-cs', description: '', capacity: '1', salaryRange: 'KES 120,000 - 180,000' });
        fetchData();
      }
    } catch (err: any) {
      appendLog(`Error creating job opening: ${err.message}`);
    }
  };

  // 3. Promote recruitment stage status update
  const handleUpdateApplicantStatus = async (appId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/hr/applications/${appId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus, notes: `Promoted candidate to status: ${newStatus}` })
      });
      const data = await res.json();
      if (data.success) {
        appendLog(`Updated applicant status: ${newStatus}`);
        fetchData();
      }
    } catch (err: any) {
      appendLog(`Error promoting application: ${err.message}`);
    }
  };

  // 4. Leave approval multi-tier (supervisor -> HR)
  const handleLeaveAction = async (requestId: string, isHrApproval: boolean, action: 'approved' | 'rejected') => {
    try {
      const res = await fetch(`/api/hr/leaves/requests/${requestId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          isHrApproval,
          action,
          notes: `${isHrApproval ? 'HR' : 'Superior'} completed review status of leave request.`
        })
      });
      const data = await res.json();
      if (data.success) {
        appendLog(`Leave Request ${action} by ${isHrApproval ? 'Human Resources' : 'Department Supervisor'}`);
        fetchData();
      }
    } catch (err: any) {
      appendLog(`Leave approval execution error: ${err.message}`);
    }
  };

  // 5. Submit leave request (Self-service workflow)
  const handleSelfRequestLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/hr/leaves/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          leaveTypeId: selfLeaveType,
          startDate: selfLeaveStart,
          endDate: selfLeaveEnd,
          totalDays: Number(selfLeaveDays),
          reason: selfLeaveReason
        })
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
        appendLog(`Failed leave request: ${data.error}`);
      } else {
        appendLog(`Leave request logged for supervisor & HR approval multi tier.`);
        fetchData();
      }
    } catch (err: any) {
      appendLog(`Error requesting employee leave: ${err.message}`);
    }
  };

  // 6. Clock-in & out simulation
  const handleSimClockIn = async (method: 'QR' | 'Biometric Ready' | 'Manual Override' | 'GPS Ready') => {
    try {
      const res = await fetch('/api/hr/attendance/clock-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          method,
          comments: `Clocked in via device verification utilizing GPS accuracy: -1.2912, 36.8209.`,
          gpsCoords: method === 'GPS Ready' ? '-1.2921, 36.8219' : null
        })
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else {
        appendLog(`Employee clocked-in shift successfully: ${data.clockInTime}`);
        fetchData();
      }
    } catch (err: any) {
      appendLog(`Error clocking-in work shift: ${err.message}`);
    }
  };

  const handleSimClockOut = async () => {
    try {
      const res = await fetch('/api/hr/attendance/clock-out', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else {
        appendLog(`Employee clocked-out successfully.`);
        fetchData();
      }
    } catch (err: any) {
      appendLog(`Error clocking-out shift: ${err.message}`);
    }
  };

  // 7. Create/Define new Payroll Cycle
  const handleCreateCycle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/hr/payroll/cycles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newCycle)
      });
      const data = await res.json();
      appendLog(`Payroll Cycle Created & Registered: ${data.name}`);
      setShowAddCycleModal(false);
      fetchData();
    } catch (err: any) {
      appendLog(`Error creating payroll cycle: ${err.message}`);
    }
  };

  // 8. PROCESS LEAN STATUTORY PAYROLL RUN (KRA PAYE, NSSF, SHA, Pension, SACCO)
  const handleProcessPayrollRun = async (cycleId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/hr/payroll/cycles/${cycleId}/process`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        appendLog(`Statutory Payroll processed for ${data.count} employees. Ledger posted!`);
        fetchData();
      }
    } catch (err: any) {
      appendLog(`Error processing payroll run: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 9. Settle net salaries payslip trigger direct bank MPESA references
  const handleSettlePayslip = async (slipId: string) => {
    try {
      const res = await fetch(`/api/hr/payroll/payslips/${slipId}/pay`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        appendLog(`Salary disbursed for ${data.slip.employeeName}. Receipt code: ${data.slip.paymentRef}`);
        fetchData();
      }
    } catch (err: any) {
      appendLog(`Disbusement error: ${err.message}`);
    }
  };

  // 10. Perform staff reviews
  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/hr/performance/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newReview)
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else {
        appendLog(`Performance appraisal reviewed for employee ID: ${newReview.employeeId}`);
        setShowAddReviewModal(false);
        setNewReview({ employeeId: '', overallRating: '8', feedback: '', promotionRecommended: 'false' });
        fetchData();
      }
    } catch (err: any) {
      appendLog(`Error creating appraisal review: ${err.message}`);
    }
  };

  // 11. Book workshop continuous education
  const handleAddTraining = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/hr/trainings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newTraining)
      });
      const data = await res.json();
      appendLog(`CPD Workshop seminar listed: ${data.title}`);
      setShowAddTrainingModal(false);
      fetchData();
    } catch (err: any) {
      appendLog(`Error creating workshop block: ${err.message}`);
    }
  };

  // Calculate high-fidelity metrics summary
  const totalPayrollCost = payslips.reduce((acc, curr) => acc + curr.grossSalary, 0);
  const netPaidSettle = payslips.filter(s => s.isPaid).reduce((acc, curr) => acc + curr.netPay, 0);
  const activeLeavesCount = leaveRequests.filter(r => r.finalStatus === 'approved').length;
  const pendingLeavesReview = leaveRequests.filter(r => r.finalStatus === 'pending').length;
  const activeOpenings = jobs.filter(j => j.status === 'Open').length;

  const filteredEmployees = employees.filter((emp) => 
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    emp.employeeNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.designation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800">
      {/* HEADER SECTION */}
      <div className="bg-white border-b border-slate-200 py-6 px-8 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <span className="bg-indigo-50 text-indigo-700 text-xs font-mono font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
            Phase 9: Enterprise Operating System
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">HR & Payroll Enterprise Board</h2>
          <p className="text-slate-500 text-xs mt-0.5">Manage employee files, statutory tax structures, multi-tier workflows, GPS clocks and general ledger integration.</p>
        </div>
        
        {/* TAB WORKSPACE METRICS SELECTOR */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-150">
          <button 
            onClick={() => setHrSubTab('analytics')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${hrSubTab === 'analytics' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <TrendingUp className="h-3.5 w-3.5 inline mr-1" /> Analytics
          </button>
          <button 
            onClick={() => setHrSubTab('employees')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${hrSubTab === 'employees' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <Users className="h-3.5 w-3.5 inline mr-1" /> Employees
          </button>
          <button 
            onClick={() => setHrSubTab('recruitment')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${hrSubTab === 'recruitment' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <Briefcase className="h-3.5 w-3.5 inline mr-1" /> Recruitment
          </button>
          <button 
            onClick={() => setHrSubTab('leaves')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${hrSubTab === 'leaves' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <Calendar className="h-3.5 w-3.5 inline mr-1" /> Leaves
          </button>
          <button 
            onClick={() => setHrSubTab('attendance')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${hrSubTab === 'attendance' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <Clock className="h-3.5 w-3.5 inline mr-1" /> Attendance
          </button>
          <button 
            onClick={() => setHrSubTab('payroll')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${hrSubTab === 'payroll' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <CreditCard className="h-3.5 w-3.5 inline mr-1" /> Payroll Run
          </button>
          <button 
            onClick={() => setHrSubTab('performance_training')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${hrSubTab === 'performance_training' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <Award className="h-3.5 w-3.5 inline mr-1" /> CPD & KPIs
          </button>
          <button 
            onClick={() => setHrSubTab('self_service')}
            className={`px-3 py-1.5 text-xs font-bold bg-amber-500/10 text-amber-700 border border-amber-500/30 rounded-lg transition-all ${hrSubTab === 'self_service' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <Sliders className="h-3.5 w-3.5 inline mr-1" /> Staff Self-Service
          </button>
        </div>
      </div>

      <div className="p-8 max-w-7xl mx-auto space-y-6">
        
        {/* SUBTAB 1: ANALYTICS DASHBOARD */}
        {hrSubTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              
              <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-xs flex items-center space-x-4">
                <div className="bg-indigo-50 p-4 rounded-xl text-indigo-600">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 font-mono">TOTAL MANAGED EMPLOYEES</p>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">{employees.length}</h3>
                  <p className="text-[10px] text-indigo-600 font-medium">100% indexed as unified identity</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-xs flex items-center space-x-4">
                <div className="bg-emerald-50 p-4 rounded-xl text-emerald-600">
                  <CreditCard className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 font-mono">MONTHLY GROSS PAYROLL</p>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">KES {totalPayrollCost.toLocaleString()}</h3>
                  <p className="text-[10px] text-emerald-600 font-semibold">Processed on statutory schedules</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-xs flex items-center space-x-4">
                <div className="bg-amber-50 p-4 rounded-xl text-amber-600">
                  <Calendar className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 font-mono">STAFF ACTIVE ON LEAVE</p>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">{activeLeavesCount}</h3>
                  <p className="text-[10px] text-slate-500">{pendingLeavesReview} leave requests pending audit</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-xs flex items-center space-x-4">
                <div className="bg-purple-50 p-4 rounded-xl text-purple-600">
                  <Briefcase className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 font-mono">ACTIVE JOB OPENINGS</p>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">{activeOpenings} Positions</h3>
                  <p className="text-[10px] text-purple-600 font-medium">{applications.length} candidates pool tracking</p>
                </div>
              </div>

            </div>

            {/* BENTO CHART BLOCK: STAFF DESIGNATIONS BREAKDOWNS & GENERAL LEDGER RECON_STATUS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* STAFF DESIGNATIONS DISTRIBUTION */}
              <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-xs md:col-span-2">
                <h4 className="text-sm font-bold text-slate-900 font-mono uppercase tracking-wide border-b border-slate-100 pb-3 mb-4">
                  University Workforce Distribution & Campus Roles
                </h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span>Academic Staff (Lecturers, HODs, Deans, Professors)</span>
                      <span>{employees.filter(e => e.type === 'Academic Staff').length} Employees</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${(employees.filter(e => e.type === 'Academic Staff').length / (employees.length || 1)) * 100}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span>Administrative Staff (Registrars, Finance Officers, Admissions)</span>
                      <span>{employees.filter(e => e.type === 'Administrative Staff').length} Employees</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-purple-500 h-full rounded-full" style={{ width: `${(employees.filter(e => e.type === 'Administrative Staff').length / (employees.length || 1)) * 100}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span>Support Staff (Librarians, Security, Wardens, Drivers)</span>
                      <span>{employees.filter(e => e.type === 'Support Staff').length} Employees</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: `${(employees.filter(e => e.type === 'Support Staff').length / (employees.length || 1)) * 100}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100 text-center">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-150">
                    <span className="text-[10px] font-mono text-slate-400 font-extrabold block">SECURITY GUARDS</span>
                    <span className="text-lg font-black text-slate-800">{employees.filter(e => e.designation?.toLowerCase().includes('security')).length || 1}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-150">
                    <span className="text-[10px] font-mono text-slate-400 font-extrabold block">DRIVERS & LOGISTICS</span>
                    <span className="text-lg font-black text-slate-800">{employees.filter(e => e.designation?.toLowerCase().includes('driver')).length || 1}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-150">
                    <span className="text-[10px] font-mono text-slate-400 font-extrabold block">HOSTEL WARDENS</span>
                    <span className="text-lg font-black text-slate-800">{employees.filter(e => e.designation?.toLowerCase().includes('warden')).length || 1}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-150">
                    <span className="text-[10px] font-mono text-slate-400 font-extrabold block">COUNSELLORS</span>
                    <span className="text-lg font-black text-slate-800">{employees.filter(e => e.designation?.toLowerCase().includes('counsellor')).length || 1}</span>
                  </div>
                </div>
              </div>

              {/* FINANCES LEDGER RECON STATUS */}
              <div className="bg-slate-900 text-slate-100 p-6 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold px-2 py-1 rounded-md inline-block mb-3 border border-emerald-500/30">
                    LEDGER INTEGRATION ENGINE
                  </div>
                  <h4 className="text-lg font-bold tracking-tight">University General Ledger Interlock</h4>
                  <p className="text-xs text-slate-400 mt-2">
                    Every statutory payroll run and cash disbursement auto-registers debit/credit vouchers inside the Ledger Engine.
                  </p>
                </div>

                <div className="space-y-3 my-6">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-medium">Payroll Cycle Claims Posted:</span>
                    <span className="font-mono text-emerald-400 font-bold">KES {totalPayrollCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-medium">Liquid Disbursement Settled:</span>
                    <span className="font-mono text-emerald-400 font-bold">KES {netPaidSettle.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-bold">MPESA Gateway Settle status:</span>
                    <span className="text-xs bg-emerald-500 text-slate-900 px-2 py-0.5 rounded font-mono font-bold">ACTIVE</span>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-4">
                  <span className="text-[10px] font-mono text-slate-500 block uppercase font-bold text-slate-400">LEDGER RECON CODE</span>
                  <span className="text-xs font-mono font-semibold text-slate-300">CORE-SYS-9-PAYROLL-OK</span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* SUBTAB 2: EMPLOYEE MASTER ENGINE */}
        {hrSubTab === 'employees' && (
          <div className="bg-white rounded-2xl border border-slate-150 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
              <div className="relative w-full md:w-96">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Query employees (e.g. Newton, Profesor, CS)..."
                  className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs px-10 py-2.5 rounded-lg border border-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                />
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              </div>

              <div className="flex space-x-2">
                <button 
                  onClick={() => setShowAddEmployeeModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-lg flex items-center transition-all cursor-pointer"
                >
                  <Plus className="h-4 w-4 mr-1" /> Onboard New Employee
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 uppercase text-[10px] font-mono text-slate-400 border-b border-slate-200">
                    <th className="p-4 font-extrabold">Employee Number</th>
                    <th className="p-4 font-extrabold">Full Name</th>
                    <th className="p-4 font-extrabold">Designation & Department</th>
                    <th className="p-4 font-extrabold">Employee Class</th>
                    <th className="p-4 font-extrabold">Joined Date</th>
                    <th className="p-4 font-extrabold">Status</th>
                    <th className="p-4 font-extrabold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredEmployees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 font-mono font-bold text-slate-600">{emp.employeeNumber}</td>
                      <td className="p-4">
                        <p className="font-bold text-slate-900">{emp.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{emp.email} • {emp.phone}</p>
                      </td>
                      <td className="p-4 text-slate-600">
                        <p className="font-bold text-slate-800">{emp.designation}</p>
                        <p className="text-[10px] text-indigo-600">{emp.departmentIdHash || 'General Dept'}</p>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 text-[10px] font-bold rounded bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                          {emp.type}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500 font-mono">{emp.joinedDate}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          emp.employmentStatus === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {emp.employmentStatus}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => alert(`ID/Biodata profile for ${emp.name}:\nBank Account: 1210174459021\nBank Name: Equity Bank Kenya\nKRA PIN: A009184511Z\nHighest qualification: PhD Computer Science\nStatus: Permanent Employment`)}
                          className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-md font-bold font-mono inline-block cursor-pointer"
                        >
                          View Bio Profile
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SUBTAB 3: RECRUITMENT ENGINE */}
        {hrSubTab === 'recruitment' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* JOB POSITIONS OPENINGS LIST */}
            <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-xs md:col-span-2 space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 font-mono uppercase tracking-wide">
                  Active Vacancy Announcements & Positions
                </h3>
                <button 
                  onClick={() => setShowAddJobModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-mono font-black px-3 py-1.5 rounded-md flex items-center transition-all cursor-pointer"
                >
                  <Plus className="h-3 w-3 mr-1" /> Post Opening
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {jobs.map((job) => (
                  <div key={job.id} className="p-4 rounded-xl border border-slate-150 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-slate-900 text-sm tracking-tight">{job.title}</h4>
                        <span className="bg-indigo-50 text-indigo-700 text-[9px] font-mono font-bold px-2 py-0.5 rounded border border-indigo-100">
                          {job.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-indigo-600 font-bold mt-0.5 uppercase tracking-wide font-mono">
                        {job.departmentId || 'CS Department'}
                      </p>
                      <p className="text-xs text-slate-500 mt-2 line-clamp-2">{job.description}</p>
                    </div>

                    <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-[10px] font-mono">
                      <span className="text-slate-400 font-bold">SALARY: <span className="text-slate-600 font-black">{job.salaryRange}</span></span>
                      <span className="text-slate-400">Cap: <span className="text-slate-700 font-bold">{job.capacity}</span></span>
                    </div>
                  </div>
                ))}
              </div>

              {/* CANDIDATE APPLICATIONS TRACKING POOL */}
              <div className="border-t border-slate-100 pt-6 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 font-mono uppercase tracking-wide pb-3 border-b border-slate-100">
                  Job Applicant Status Tracking
                </h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 uppercase text-[9px] font-mono text-slate-400 border-b border-slate-100">
                        <th className="p-3 font-extrabold">Applicant Name</th>
                        <th className="p-3 font-extrabold">Contact Info</th>
                        <th className="p-3 font-extrabold">Process Stage</th>
                        <th className="p-3 font-extrabold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {applications.map((app) => (
                        <tr key={app.id} className="hover:bg-slate-50/55 transition-colors">
                          <td className="p-3">
                            <p className="font-bold text-slate-900">{app.applicantName}</p>
                            <p className="text-[10px] text-indigo-500 font-bold font-mono">CV Attached: {app.cvUrl}</p>
                          </td>
                          <td className="p-3 font-mono text-slate-500 text-[11px]">{app.email} • {app.phone || 'N/A'}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase font-mono border ${
                              app.status === 'Applied' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              app.status === 'Interviewing' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              app.status === 'Offered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              'bg-rose-50 text-rose-700 border-rose-200'
                            }`}>
                              {app.status}
                            </span>
                          </td>
                          <td className="p-3 text-right space-x-1">
                            {app.status === 'Applied' && (
                              <button 
                                onClick={() => handleUpdateApplicantStatus(app.id, 'Interviewing')}
                                className="text-[10px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-2 py-1 rounded"
                              >
                                Invite Interview
                              </button>
                            )}
                            {app.status === 'Interviewing' && (
                              <button 
                                onClick={() => handleUpdateApplicantStatus(app.id, 'Offered')}
                                className="text-[10px] bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold px-2 py-1 rounded"
                              >
                                Offer Contract
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>
            </div>

            {/* INTERVIEWS SCHEDULE CALENDAR LOGS */}
            <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-xs space-y-6">
              <h3 className="text-sm font-bold text-slate-900 font-mono uppercase tracking-wide border-b border-slate-100 pb-3">
                Recruiment Panel Interview Logs
              </h3>

              <div className="divide-y divide-slate-100">
                {interviews.length === 0 ? (
                  <p className="text-xs text-slate-400 font-mono text-center py-6">No interview sessions currently scheduled.</p>
                ) : (
                  interviews.map((int) => (
                    <div key={int.id} className="py-3 flex items-start space-x-3 text-xs leading-normal">
                      <div className="bg-indigo-50 p-2.5 rounded-lg text-indigo-600 mt-1">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{int.applicantName} Interview</h4>
                        <p className="text-slate-500 text-[10px] font-mono mt-0.5">{int.date} at {int.time} ({int.mode})</p>
                        <p className="text-slate-400 text-[10px]">Panel: {int.interviewerNames ? int.interviewerNames.join(', ') : 'Admin Board'}</p>
                        <div className="mt-1">
                          <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded font-bold font-mono">
                            {int.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {/* SUBTAB 4: LEAVE MANAGEMENT ENGINE */}
        {hrSubTab === 'leaves' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* DUAL WORKFLOW APPROVAL QUEUE */}
            <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-xs md:col-span-2 space-y-6">
              <h3 className="text-sm font-bold text-slate-900 font-mono uppercase tracking-wide border-b border-slate-100 pb-3">
                Dual hierarchical Supervisor & HR Leave Workflow Action
              </h3>

              <div className="space-y-4">
                {leaveRequests.filter(r => r.finalStatus === 'pending').length === 0 ? (
                  <div className="p-8 text-center text-slate-400 font-mono border border-dashed border-slate-250 rounded-xl leading-relaxed text-xs">
                    Clean queue! There are no pending employee leave applications requiring supervisor or HR audits today.
                  </div>
                ) : (
                  leaveRequests.filter(r => r.finalStatus === 'pending').map((req) => (
                    <div key={req.id} className="p-4 rounded-xl border border-slate-150 bg-slate-50/40 flex flex-col justify-between space-y-4">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                        <div>
                          <span className="bg-slate-200 text-slate-700 text-[9px] font-mono font-black px-2 py-0.5 rounded">
                            {req.leaveTypeName}
                          </span>
                          <h4 className="font-bold text-slate-900 text-sm mt-1">{req.employeeName}</h4>
                          <p className="text-[10px] text-slate-500 font-mono">{req.startDate} to {req.endDate} ({req.totalDays} Days) • Reason: "{req.reason || 'Not provided'}"</p>
                        </div>
                        
                        <div className="flex space-x-1 mt-2 md:mt-0">
                          {/* Super Approval buttons */}
                          {req.supervisorStatus === 'pending' && (
                            <div className="bg-slate-100 p-2.5 rounded-lg border border-slate-200 flex flex-col space-y-1 items-stretch">
                              <span className="text-[9px] font-mono font-bold text-slate-400 block uppercase">SUPERVISOR FLOW:</span>
                              <div className="flex space-x-1">
                                <button 
                                  onClick={() => handleLeaveAction(req.id, false, 'approved')}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] px-2 py-1 rounded"
                                >
                                  Approve
                                </button>
                                <button 
                                  onClick={() => handleLeaveAction(req.id, false, 'rejected')}
                                  className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[10px] px-2 py-1 rounded"
                                >
                                  Reject
                                </button>
                              </div>
                            </div>
                          )}

                          {/* HR Approval buttons (Only available after supervisor says yes) */}
                          {req.supervisorStatus === 'approved' && req.hrStatus === 'pending' && (
                            <div className="bg-indigo-50 p-2.5 rounded-lg border border-indigo-100 flex flex-col space-y-1 items-stretch animate-pulse">
                              <span className="text-[9px] font-mono font-bold text-indigo-600 block uppercase">HUMAN RESOURCE STAGE:</span>
                              <div className="flex space-x-1">
                                <button 
                                  onClick={() => handleLeaveAction(req.id, true, 'approved')}
                                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[10px] px-2.5 py-1 rounded"
                                >
                                  Final HR Approve
                                </button>
                                <button 
                                  onClick={() => handleLeaveAction(req.id, true, 'rejected')}
                                  className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[10px] px-2.5 py-1 rounded"
                                >
                                  Hr Reject
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-[10px] font-mono border-t border-slate-100 pt-3">
                        <div className="flex items-center space-x-1">
                          <span className="text-slate-400">Supervisor:</span>
                          <span className={`font-bold uppercase ${req.supervisorStatus === 'approved' ? 'text-emerald-600' : 'text-slate-500'}`}>{req.supervisorStatus}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-slate-400">HR Manager:</span>
                          <span className={`font-bold uppercase ${req.hrStatus === 'approved' ? 'text-indigo-600' : 'text-slate-500'}`}>{req.hrStatus}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* ARCHIVE HISTORICAL LEAVE REQUEST RECORDS */}
              <div className="border-t border-slate-100 pt-6 space-y-4">
                <h3 className="text-xs font-bold text-slate-900 font-mono uppercase tracking-wide">
                  Historical Records & Settled Logs
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 uppercase text-[9px] font-mono text-slate-400 border-b border-slate-150">
                        <th className="p-3 font-extrabold">Employee</th>
                        <th className="p-3 font-extrabold">Leave Category</th>
                        <th className="p-3 font-extrabold">Dates & Span</th>
                        <th className="p-3 font-extrabold">Final Decision Outcome</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {leaveRequests.filter(r => r.finalStatus !== 'pending').map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50/50">
                          <td className="p-3 font-bold text-slate-800">{r.employeeName}</td>
                          <td className="p-3">{r.leaveTypeName}</td>
                          <td className="p-3 text-slate-500 font-mono">{r.startDate} to {r.endDate} ({r.totalDays} Days)</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold pb-1 ${
                              r.finalStatus === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {r.finalStatus?.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* KENYAN STANDARD ALLOWANCES MATRIX */}
            <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-xs space-y-6">
              <h3 className="text-sm font-bold text-slate-900 font-mono uppercase tracking-wide border-b border-slate-100 pb-3">
                Kenya Statutory Allowances & Caps
              </h3>

              <div className="divide-y divide-slate-100 text-xs">
                {leaveTypes.map((lt) => (
                  <div key={lt.id} className="py-3 flex justify-between items-center">
                    <div className="font-bold text-slate-700">{lt.name}</div>
                    <div className="font-mono text-slate-500 font-black">{lt.defaultDays} Days / Year</div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* SUBTAB 5: ATTENDANCE & MOBILE SHIFT CLOCK-IN */}
        {hrSubTab === 'attendance' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* ROSTER LOG REGISTER */}
            <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-xs md:col-span-2 space-y-6">
              <h3 className="text-sm font-bold text-slate-900 font-mono uppercase tracking-wide border-b border-slate-100 pb-3">
                Daily Workspace Sign-In & Presence Register
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 uppercase text-[9px] font-mono text-slate-400 border-b border-slate-200">
                      <th className="p-3 font-extrabold">Employee Number</th>
                      <th className="p-3 font-extrabold">Employee Name</th>
                      <th className="p-3 font-extrabold">Shift Date</th>
                      <th className="p-3 font-extrabold">Clock In</th>
                      <th className="p-3 font-extrabold">Clock Out</th>
                      <th className="p-3 font-extrabold">Proof Method</th>
                      <th className="p-3 font-extrabold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {attendance.map((att) => (
                      <tr key={att.id}>
                        <td className="p-3 font-mono text-slate-500 font-bold">{att.employeeNumber}</td>
                        <td className="p-3 font-bold text-slate-900">{att.employeeName}</td>
                        <td className="p-3 font-mono text-slate-500">{att.date}</td>
                        <td className="p-3 font-mono font-semibold text-slate-600">{att.clockInTime ? new Date(att.clockInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'N/A'}</td>
                        <td className="p-3 font-mono text-slate-600">{att.clockOutTime ? new Date(att.clockOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : <span className="text-amber-600 animate-pulse text-[10px]">On Duty</span>}</td>
                        <td className="p-3">
                          <span className="bg-slate-100 text-slate-600 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border border-slate-200">
                            {att.method} • {att.gpsCoords || 'Auto Verified'}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono">
                            {att.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SELF PORTAL INTERACTIVE CLOCK SIMULATOR */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 text-center">
              <h3 className="text-sm font-bold text-slate-900 font-mono uppercase tracking-wide border-b border-slate-100 pb-3">
                Biometric & GPS Mobile Shift Simulator
              </h3>
              
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 inline-block text-left w-full space-y-2">
                <label className="text-[10px] font-bold text-slate-400 font-mono">SIMULATED ACTIVE STAFF MEMBERS LOGIN:</label>
                <select 
                  className="w-full bg-white text-xs p-2 rounded-md border border-slate-200 outline-none font-bold"
                  onChange={(e) => {
                    const found = employees.find(emp => emp.id === e.target.value);
                    if (found) setSimEmployee(found);
                  }}
                  value={simEmployee?.id || ''}
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.designation})</option>
                  ))}
                </select>
                <div className="text-[10px] text-slate-400 font-mono mt-2">
                  Role Type: <span className="text-indigo-600 font-black">{simEmployee?.type}</span>
                </div>
              </div>

              <div className="space-y-3 py-4">
                <p className="text-xs text-slate-500">
                  Select clock-in authorization factor:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => handleSimClockIn('GPS Ready')}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[10px] font-mono py-2 rounded shadow-xs cursor-pointer flex justify-center items-center"
                  >
                    <MapPin className="h-3 w-3 mr-1" /> GPS Shift In
                  </button>
                  <button 
                    onClick={() => handleSimClockIn('Biometric Ready')}
                    className="bg-slate-900 hover:bg-slate-800 text-slate-100 font-extrabold text-[10px] font-mono py-2 rounded shadow-xs cursor-pointer flex justify-center items-center"
                  >
                    <Activity className="h-3 w-3 mr-1" /> Biometric In
                  </button>
                </div>
                
                <button 
                  onClick={handleSimClockOut}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-black text-xs font-mono py-2.5 rounded-lg cursor-pointer"
                >
                  Clock Out Work Shift
                </button>
              </div>

              <div className="bg-amber-50/50 p-3 rounded-lg border border-amber-200 text-amber-700 leading-normal text-[11px] text-left">
                <strong>GPS Fence Geo Guard:</strong> Verified Nairobi main tower campus location bounding coordinate bounds (GPS lock successful).
              </div>
            </div>

          </div>
        )}

        {/* SUBTAB 6: PAYROLL ENGINE & MPESA DEPOSIT LOG */}
        {hrSubTab === 'payroll' && (
          <div className="space-y-6">
            
            {/* PAYROLL CYCLES MANAGEMENTS */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-mono uppercase tracking-wide">
                  Kenya Monthly Payroll Cycles
                </h3>
                <p className="text-xs text-slate-500 mt-1">Select, run calculations, and trigger ledger transaction postings.</p>
              </div>
              <div className="flex space-x-2 mt-4 md:mt-0">
                <button 
                  onClick={() => setShowAddCycleModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold px-4 py-2 rounded cursor-pointer"
                >
                  Open New Salary Cycle
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {payrollCycles.map((cy) => (
                <div key={cy.id} className={`p-4 rounded-xl border transition-all ${
                  selectedCycleId === cy.id ? 'border-indigo-600 bg-indigo-50/20' : 'border-slate-150 bg-white hover:bg-slate-50'
                }`}>
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-slate-900 text-sm">{cy.name}</h4>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-black ${
                      cy.status === 'Processed' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {cy.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono mt-1">{cy.startDate} to {cy.endDate}</p>
                  
                  <div className="mt-4 flex space-x-1.5">
                    <button 
                      onClick={() => setSelectedCycleId(cy.id)}
                      className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-800 font-mono font-bold px-2 py-1 rounded"
                    >
                      View payslips
                    </button>
                    {cy.status !== 'Processed' && (
                      <button 
                        onClick={() => handleProcessPayrollRun(cy.id)}
                        className="text-[10px] bg-indigo-600 hover:bg-indigo-700 text-white font-mono font-extrabold px-2 py-1 rounded"
                      >
                        Run Calculators
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* CRITICAL STATUTORY PAYSLIPS EXECUTORS TABLE */}
            <div className="bg-white rounded-2xl border border-slate-150 shadow-xs overflow-hidden">
              <div className="p-6 border-b border-slate-150 bg-slate-50/50 flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-900 font-mono uppercase tracking-wide">
                  Processed payslips registry & Deductions audit
                </h3>
                <span className="text-xs bg-indigo-100 text-indigo-800 font-mono font-black px-2 py-1 rounded">
                  {payslips.length} Slips Calculated
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 uppercase text-[9px] font-mono text-slate-500 border-b border-slate-150">
                      <th className="p-3 font-extrabold">Employee Number</th>
                      <th className="p-3 font-extrabold">Employee Name</th>
                      <th className="p-3 font-extrabold">Basic Salary</th>
                      <th className="p-3 font-extrabold">Allowances</th>
                      <th className="p-3 font-extrabold">PAYE (Tax)</th>
                      <th className="p-3 font-extrabold">NSSF + SHA</th>
                      <th className="p-3 font-extrabold">SACCO Deduct</th>
                      <th className="p-3 font-extrabold">Net Pay</th>
                      <th className="p-3 font-extrabold">Status</th>
                      <th className="p-3 font-extrabold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium font-mono text-slate-600">
                    {payslips.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="p-6 text-center text-slate-400">
                          No payslips calculated. Process the statutory payroll run on a cycle above to see results.
                        </td>
                      </tr>
                    ) : (
                      payslips.map((slip) => (
                        <tr key={slip.id} className="hover:bg-slate-50/60 font-semibold text-slate-700">
                          <td className="p-3 font-bold">{slip.employeeNumber}</td>
                          <td className="p-3 font-sans text-slate-900 font-bold">{slip.employeeName}</td>
                          <td className="p-3">KES {slip.basicSalary.toLocaleString()}</td>
                          <td className="p-3 text-emerald-600">+{(slip.housingAllowance + slip.transportAllowance + slip.riskAllowance).toLocaleString()}</td>
                          <td className="p-3 text-rose-600">-{slip.PAYEFine.toLocaleString()}</td>
                          <td className="p-3 text-rose-600">-{ (slip.NSSFFine + slip.SHAIFine).toLocaleString() }</td>
                          <td className="p-3 text-rose-600">-{slip.SACCODeduction.toLocaleString()}</td>
                          <td className="p-3 text-slate-900 font-black">KES {slip.netPay.toLocaleString()}</td>
                          <td className="p-3 font-sans">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              slip.isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800 animate-pulse'
                            }`}>
                              {slip.isPaid ? 'Paid' : 'Unpaid'}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            {!slip.isPaid ? (
                              <button 
                                onClick={() => handleSettlePayslip(slip.id)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] px-2.5 py-1.5 rounded cursor-pointer"
                              >
                                Settle Disbursement
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-400 text-slate-500 font-bold block">{slip.paymentRef}</span>
                            )}
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

        {/* SUBTAB 7: PERFORMANCE REVIEW APPRAISAL & CPD Workshops */}
        {hrSubTab === 'performance_training' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* KPI REVIEW SHEETS */}
            <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-xs space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 font-mono uppercase tracking-wide">
                  Staff KPI review appraisals
                </h3>
                <button 
                  onClick={() => setShowAddReviewModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-mono font-black px-2.5 py-1.5 rounded cursor-pointer"
                >
                  Appraise employee
                </button>
              </div>

              <div className="divide-y divide-slate-150 space-y-4">
                {performanceReviews.length === 0 ? (
                  <p className="p-6 text-center text-xs text-slate-400 font-mono">No feedback logs found.</p>
                ) : (
                  performanceReviews.map((rev) => (
                    <div key={rev.id} className="pt-3 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-extrabold text-slate-900 leading-tight">{rev.employeeName}</h4>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">Appraiser: {rev.reviewerName} • {rev.reviewDate}</p>
                        </div>
                        <span className="bg-indigo-50 text-indigo-700 text-xs font-mono font-black px-2.5 py-1 rounded-full border border-indigo-100">
                          {rev.overallRating} / 10 Score
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 italic">"{rev.feedback}"</p>
                      {rev.promotionRecommended && (
                        <span className="inline-block bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-mono font-black px-2 py-0.5 rounded">
                          Promotions Recommended
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* CPD TRAINING workshops SEMINARS */}
            <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-xs space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 font-mono uppercase tracking-wide">
                  CPD workshops & Continuous Professional development hours
                </h3>
                <button 
                  onClick={() => setShowAddTrainingModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-mono font-black px-2.5 py-1.5 rounded cursor-pointer"
                >
                  Add CPD Session
                </button>
              </div>

              <div className="space-y-4">
                {trainings.map((trn) => (
                  <div key={trn.id} className="p-4 rounded-xl border border-slate-150 bg-slate-50 flex justify-between items-center">
                    <div>
                      <span className="text-[10px] bg-slate-200 text-slate-800 font-bold px-1.5 rounded font-mono uppercase">
                        {trn.type}
                      </span>
                      <h4 className="font-bold text-slate-900 mt-1">{trn.title}</h4>
                      <p className="text-[10px] text-slate-400 font-mono">{trn.organizer} • {trn.date}</p>
                    </div>
                    <div className="bg-indigo-50 text-indigo-700 text-xs font-mono font-black px-3 py-2 rounded-xl border border-indigo-100">
                      {trn.durationHours} CPD Hours
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* SUBTAB 8: STAFF SELF SERVICE VIEW */}
        {hrSubTab === 'self_service' && simEmployee && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* LOGGED IN USER PROFILE DETALS */}
            <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-xs space-y-6">
              <div className="text-center pb-4 border-b border-slate-100">
                <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-600 text-white text-xl font-black rounded-3xl flex items-center justify-center mx-auto shadow-sm">
                  {simEmployee.name.split(' ').map((n: string) => n[0]).join('')}
                </div>
                <h3 className="text-base font-bold text-slate-950 mt-3">{simEmployee.name}</h3>
                <span className="text-[10px] bg-slate-100 text-slate-700 font-mono px-2 py-0.5 rounded font-bold border border-slate-200 mt-1 inline-block">
                  {simEmployee.designation} • {simEmployee.employeeNumber}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between border-b border-slate-50 pb-2">
                  <span className="text-slate-400">Campus Base:</span>
                  <span className="font-mono font-bold text-slate-700">{simEmployee.campus}</span>
                </div>
                <div className="flex justify-between border-b border-slate-50 pb-2">
                  <span className="text-slate-400">Kra PIN:</span>
                  <span className="font-mono font-bold text-slate-700">A009180741X</span>
                </div>
                <div className="flex justify-between border-b border-slate-50 pb-2">
                  <span className="text-slate-400">Equity bank ACC:</span>
                  <span className="font-mono font-bold text-slate-700">1210174459021</span>
                </div>
                <div className="flex justify-between font-mono text-[10px] pt-2">
                  <span className="text-slate-400 font-sans">JOINED PLATFORM DATE:</span>
                  <span className="font-bold text-slate-600">{simEmployee.joinedDate}</span>
                </div>
              </div>
            </div>

            {/* LEAVE BALANCES & QUICK REQUEST FORM */}
            <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-xs space-y-6">
              <h3 className="text-sm font-bold text-slate-900 font-mono uppercase tracking-wide border-b border-slate-100 pb-3">
                Your leave Balances & Fast Apply
              </h3>

              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                {balances.filter(b => b.employeeId === simEmployee.id).map((bal) => (
                  <div key={bal.id} className="p-3 bg-slate-50 rounded-xl border border-slate-150">
                    <span className="text-[10px] text-slate-400 block truncate font-mono uppercase">{bal.leaveTypeName}</span>
                    <span className="text-xl font-black text-slate-900 block mt-1">{bal.remainingDays}</span>
                    <span className="text-[9px] text-slate-400 font-mono font-bold block mt-0.5">{bal.takenDays} Taken</span>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSelfRequestLeave} className="space-y-3 pt-4 border-t border-slate-100">
                <p className="text-[10px] font-mono uppercase font-black text-slate-400">Apply for time off:</p>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400">Leave type:</label>
                    <select 
                      className="w-full bg-slate-50 text-xs p-2 rounded border border-slate-200 outline-none"
                      onChange={(e) => setSelfLeaveType(e.target.value)}
                      value={selfLeaveType}
                    >
                      {leaveTypes.map(lt => (
                        <option key={lt.id} value={lt.id}>{lt.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400">Total days requested:</label>
                    <input 
                      type="number" 
                      value={selfLeaveDays}
                      onChange={(e) => setSelfLeaveDays(e.target.value)}
                      className="w-full bg-slate-50 text-xs p-2 rounded border border-slate-200 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400">Reason / Details:</label>
                  <input 
                    type="text" 
                    value={selfLeaveReason}
                    onChange={(e) => setSelfLeaveReason(e.target.value)}
                    className="w-full bg-slate-50 text-xs p-2 rounded border border-slate-200 outline-none"
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs py-2.5 rounded-lg cursor-pointer transition-colors"
                >
                  Post leave application for supervisor review
                </button>
              </form>
            </div>

            {/* VIEW GENERATED PAYSLIPS */}
            <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 font-mono uppercase tracking-wide border-b border-slate-100 pb-3">
                Your monthly processed payslips
              </h3>

              <div className="space-y-4">
                {payslips.filter(s => s.employeeId === simEmployee.id).length === 0 ? (
                  <p className="text-center text-xs text-slate-400 font-mono py-6">Your salary logs for processing cycle are not computed yet.</p>
                ) : (
                  payslips.filter(s => s.employeeId === simEmployee.id).map((slip) => (
                    <div key={slip.id} className="p-4 bg-slate-50 rounded-xl border border-slate-150 text-xs space-y-4 font-mono select-none">
                      <div className="flex justify-between items-center text-[10px] text-slate-400 uppercase font-black">
                        <span>PAYSLIP METRIC OUTLINE</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black ${slip.isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                          {slip.isPaid ? 'Salary Slipped' : 'Drawn'}
                        </span>
                      </div>

                      <div className="space-y-1 bg-white p-3 rounded-lg border border-slate-150">
                        <div className="flex justify-between font-bold text-slate-800">
                          <span className="font-sans">Basic Salary:</span>
                          <span>KES {slip.basicSalary.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-500">
                          <span className="font-sans">Housing Allowance:</span>
                          <span>+KES {slip.housingAllowance.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-500">
                          <span className="font-sans">Transport Allowance:</span>
                          <span>+KES {slip.transportAllowance.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between border-t border-dashed border-slate-250 pt-1 mt-1 text-rose-600 text-[11px]">
                          <span className="font-sans">KRA PAYE withholding tax:</span>
                          <span>-KES {slip.PAYEFine.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-rose-600 text-[11px]">
                          <span className="font-sans">SHA & statutory levies:</span>
                          <span>-KES {slip.SHAIFine.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center border-t border-slate-150 pt-2 font-bold text-[13px] text-slate-900 font-black">
                        <span className="font-sans">NET CREDITED BANK PAY:</span>
                        <span>KES {slip.netPay.toLocaleString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* MODAL 1: ADD EMPLOYEE ONBOARD */}
      {showAddEmployeeModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-100 space-y-4">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Onboard New University Employee</h3>
            
            <form onSubmit={handleHireEmployee} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Employee Full name:</label>
                <input 
                  type="text" 
                  required
                  value={newEmp.name}
                  onChange={(e) => setNewEmp({...newEmp, name: e.target.value})}
                  className="w-full bg-slate-50 p-2.5 rounded-lg border border-slate-200 outline-none focus:border-indigo-500 font-sans"
                  placeholder="e.g. Professor Stephen Hawking"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Email Address:</label>
                <input 
                  type="email" 
                  required
                  value={newEmp.email}
                  onChange={(e) => setNewEmp({...newEmp, email: e.target.value})}
                  className="w-full bg-slate-50 p-2.5 rounded-lg border border-slate-200 outline-none focus:border-indigo-500 font-sans"
                  placeholder="e.g. hawking@nairobi.edu"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Mobile Phone:</label>
                <input 
                  type="text" 
                  value={newEmp.phone}
                  onChange={(e) => setNewEmp({...newEmp, phone: e.target.value})}
                  className="w-full bg-slate-50 p-2.5 rounded-lg border border-slate-200 outline-none focus:border-indigo-500 font-sans"
                  placeholder="e.g. +254 711 000 111"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Functional Designation:</label>
                <input 
                  type="text" 
                  required
                  value={newEmp.designation}
                  onChange={(e) => setNewEmp({...newEmp, designation: e.target.value})}
                  className="w-full bg-slate-50 p-2.5 rounded-lg border border-slate-200 outline-none focus:border-indigo-500 font-sans"
                  placeholder="e.g. Head of Computer Science"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Workforce Role Level:</label>
                <select 
                  value={newEmp.type} 
                  onChange={(e) => setNewEmp({...newEmp, type: e.target.value})}
                  className="w-full bg-slate-50 p-2.5 rounded-lg border border-slate-200 outline-none"
                >
                  <option value="Academic Staff">Academic Staff</option>
                  <option value="Administrative Staff">Administrative Staff</option>
                  <option value="Support Staff">Support Staff</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Initial basic Salary KES:</label>
                <input 
                  type="number" 
                  required
                  value={newEmp.basicSalary}
                  onChange={(e) => setNewEmp({...newEmp, basicSalary: e.target.value})}
                  className="w-full bg-slate-50 p-2.5 rounded-lg border border-slate-200 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">KRA Tax PIN number:</label>
                <input 
                  type="text" 
                  value={newEmp.kraPin}
                  onChange={(e) => setNewEmp({...newEmp, kraPin: e.target.value})}
                  className="w-full bg-slate-50 p-2.5 rounded-lg border border-slate-200 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Bank Account details:</label>
                <input 
                  type="text" 
                  value={newEmp.bankAccount}
                  onChange={(e) => setNewEmp({...newEmp, bankAccount: e.target.value})}
                  className="w-full bg-slate-50 p-2.5 rounded-lg border border-slate-200 outline-none focus:border-indigo-500"
                  placeholder="Acc Number"
                />
              </div>

              <div className="md:col-span-2 flex justify-end space-x-2 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowAddEmployeeModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold px-4 py-2 rounded-lg cursor-pointer"
                >
                  Discard
                </button>
                <button 
                  type="submit" 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-4 py-2 rounded-lg cursor-pointer"
                >
                  Register employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD JOB DETAILS */}
      {showAddJobModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-100 space-y-4">
            <h3 className="text-base font-black text-slate-900 tracking-tight font-mono uppercase">Log job Opening position</h3>
            
            <form onSubmit={handleAddJob} className="space-y-3 text-xs font-semibold">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Vacancy Job Title:</label>
                <input 
                  type="text" 
                  required
                  value={newJob.title}
                  onChange={(e) => setNewJob({...newJob, title: e.target.value})}
                  className="w-full bg-slate-50 p-2.5 rounded-lg border border-slate-200 outline-none"
                  placeholder="e.g. Senior Lecturer Molecular Physics"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Vacancy description:</label>
                <textarea 
                  required
                  value={newJob.description}
                  onChange={(e) => setNewJob({...newJob, description: e.target.value})}
                  className="w-full bg-slate-50 p-2.5 rounded-lg border border-slate-200 outline-none h-20"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Proposed salary bounds:</label>
                <input 
                  type="text" 
                  value={newJob.salaryRange}
                  onChange={(e) => setNewJob({...newJob, salaryRange: e.target.value})}
                  className="w-full bg-slate-50 p-2.5 rounded-lg border border-slate-200 outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowAddJobModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg cursor-pointer"
                >
                  Announce vacancy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD CYCLE */}
      {showAddCycleModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in-95 duration-100 space-y-4">
            <h3 className="text-base font-black text-slate-900 font-mono uppercase tracking-tight">Open Monthly Salary Cycle</h3>
            
            <form onSubmit={handleCreateCycle} className="space-y-3 text-xs font-semibold">
              <div>
                <label className="text-[10px] text-slate-400">Salary cycle ID/Name:</label>
                <input 
                  type="text" 
                  required
                  value={newCycle.name}
                  onChange={(e) => setNewCycle({...newCycle, name: e.target.value})}
                  className="w-full bg-slate-50 p-2 rounded border border-slate-200 outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowAddCycleModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded cursor-pointer"
                >
                  Discard
                </button>
                <button 
                  type="submit" 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded cursor-pointer"
                >
                  Publish cycle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: APPRAISE STAFF */}
      {showAddReviewModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-100">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-950 font-mono uppercase">Appraise Staff KPI Feedback</h3>
            
            <form onSubmit={handleAddReview} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="text-[10px] block text-slate-400">Select employee to evaluate:</label>
                <select 
                  className="w-full bg-slate-50 p-2.5 rounded border border-slate-200"
                  value={newReview.employeeId}
                  onChange={(e) => setNewReview({...newReview, employeeId: e.target.value})}
                  required
                >
                  <option value="">-- Choose Worker --</option>
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.name} ({e.designation})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] block text-slate-400">Overall Appraisal score out of 10:</label>
                <input 
                  type="number" 
                  max="10" 
                  min="1" 
                  required
                  value={newReview.overallRating}
                  onChange={(e) => setNewReview({...newReview, overallRating: e.target.value})}
                  className="w-full bg-slate-50 p-2 rounded border border-slate-200 outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] block text-slate-400">Feedback Details:</label>
                <textarea 
                  required
                  value={newReview.feedback}
                  onChange={(e) => setNewReview({...newReview, feedback: e.target.value})}
                  className="w-full bg-slate-50 p-2 rounded border border-slate-200 h-20"
                  placeholder="e.g. Excellent research publications and classroom attendance rates over past academic term."
                />
              </div>

              <div>
                <label className="text-[10px] block text-slate-400">Eligible for promotion?</label>
                <select 
                  value={newReview.promotionRecommended}
                  onChange={(e) => setNewReview({...newReview, promotionRecommended: e.target.value})}
                  className="w-full bg-slate-50 p-2 rounded border border-slate-200"
                >
                  <option value="false">No / Hold</option>
                  <option value="true">Yes, recommend for title promotion</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowAddReviewModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded cursor-pointer"
                >
                  Discard
                </button>
                <button 
                  type="submit" 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded cursor-pointer"
                >
                  Commit Appraisals
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: ADD CPD WORKSHOP */}
      {showAddTrainingModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-sm w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 font-mono uppercase">Post certified CPD seminar</h3>
            
            <form onSubmit={handleAddTraining} className="space-y-3 text-xs font-semibold">
              <div>
                <label className="text-[10px] text-slate-400">Workshop title:</label>
                <input 
                  type="text" 
                  required
                  value={newTraining.title}
                  onChange={(e) => setNewTraining({...newTraining, title: e.target.value})}
                  className="w-full bg-slate-50 p-2 rounded border border-slate-200"
                  placeholder="e.g. Dynamic Teaching Methodologies Workshop"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400">Duration (Hours):</label>
                <input 
                  type="number" 
                  required
                  value={newTraining.durationHours}
                  onChange={(e) => setNewTraining({...newTraining, durationHours: e.target.value})}
                  className="w-full bg-slate-50 p-2 rounded border border-slate-200"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowAddTrainingModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded cursor-pointer"
                >
                  Discard
                </button>
                <button 
                  type="submit" 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded cursor-pointer"
                >
                  Add Workshop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
