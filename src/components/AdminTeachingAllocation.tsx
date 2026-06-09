/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from 'react';
import { 
  Users, UserCheck, BookOpen, Plus, Trash2, Search, RefreshCw, AlertCircle, FileText, Check, Layers, Sparkles
} from 'lucide-react';
import { TeachingAssignment, CourseRegistration } from '../types';

interface AdminTeachingAllocationProps {
  token: string;
  appendLog?: (msg: string) => void;
  isPhoneFrame?: boolean;
}

export default function AdminTeachingAllocation({ token, appendLog, isPhoneFrame = false }: AdminTeachingAllocationProps) {
  const [teachingAssignments, setTeachingAssignments] = useState<TeachingAssignment[]>([]);
  const [courseRegistrations, setCourseRegistrations] = useState<CourseRegistration[]>([]);
  
  const [staff, setStaff] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [curriculums, setCurriculums] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Teaching Assignment form
  const [assignForm, setAssignForm] = useState({
    staffId: '',
    academicYearId: '',
    semesterId: '',
    unitId: ''
  });

  // Admin Enrollment form states 
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [studentAvailableUnits, setStudentAvailableUnits] = useState<any[]>([]);
  const [studentCheckedUnitIds, setStudentCheckedUnitIds] = useState<string[]>([]);
  const [enrollingStatus, setEnrollingStatus] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const h = { 'Authorization': `Bearer ${token}` };
      const [assResp, crResp, staffResp, ayResp, semResp, unitResp, studResp, currResp] = await Promise.all([
        fetch('/api/admin/teaching-assignments', { headers: h }),
        fetch('/api/admin/registrations', { headers: h }),
        fetch('/api/admin/staff', { headers: h }),
        fetch('/api/admin/academic-years', { headers: h }),
        fetch('/api/admin/semesters', { headers: h }),
        fetch('/api/admin/units', { headers: h }),
        fetch('/api/admin/students', { headers: h }),
        fetch('/api/admin/curriculums', { headers: h })
      ]);

      if (assResp.ok) setTeachingAssignments(await assResp.json());
      if (crResp.ok) setCourseRegistrations(await crResp.json());
      if (staffResp.ok) {
        const staffList = await staffResp.json();
        setStaff(staffList);
        if (staffList.length > 0 && !assignForm.staffId) {
          setAssignForm(prev => ({ ...prev, staffId: staffList[0].id }));
        }
      }
      if (ayResp.ok) {
        const ays = await ayResp.json();
        setAcademicYears(ays);
        const activeAY = ays.find((y: any) => y.status === 'active') || ays[0];
        if (activeAY && !assignForm.academicYearId) {
          setAssignForm(prev => ({ ...prev, academicYearId: activeAY.id }));
        }
      }
      if (semResp.ok) {
        const sems = await semResp.json();
        setSemesters(sems);
        const activeSem = sems.find((s: any) => s.status === 'active') || sems[0];
        if (activeSem && !assignForm.semesterId) {
          setAssignForm(prev => ({ ...prev, semesterId: activeSem.id }));
        }
      }
      if (unitResp.ok) {
        const u = await unitResp.json();
        setUnits(u);
        if (u.length > 0 && !assignForm.unitId) {
          setAssignForm(prev => ({ ...prev, unitId: u[0].id }));
        }
      }
      if (studResp.ok) setStudents(await studResp.json());
      if (currResp.ok) setCurriculums(await currResp.json());

    } catch (e) {
      setError('Could not query relationship engines from server database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const triggerFeedback = (text: string) => {
    setSuccess(text);
    setTimeout(() => setSuccess(null), 3000);
    loadData();
  };

  // Create Assignment
  const handleCreateAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignForm.staffId || !assignForm.academicYearId || !assignForm.semesterId || !assignForm.unitId) return;
    setError(null);

    try {
      const resp = await fetch('/api/admin/teaching-assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(assignForm)
      });
      let resJson: any = {};
      try {
        const text = await resp.text();
        resJson = text ? JSON.parse(text) : {};
      } catch (err) {}
      if (!resp.ok) throw new Error(resJson.error || 'Server error allocating assignment');

      appendLog?.(`[TEACHING ALLOCATION] Staff ID "${assignForm.staffId}" allocated unit "${assignForm.unitId}" for semester ID "${assignForm.semesterId}"`);
      triggerFeedback('Teaching allocation mapped successfully.');
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Delete Assignment
  const handleDeleteAssign = async (id: string) => {
    if (!window.confirm('Delete this allocated assignment?')) return;
    try {
      const resp = await fetch(`/api/admin/teaching-assignments/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resp.ok) {
        triggerFeedback('Allocation purged.');
      } else {
        let errorData: any = {};
        try {
          const text = await resp.text();
          errorData = text ? JSON.parse(text) : {};
        } catch (e) {}
        setError(errorData.error || 'Deletion failed');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Search/Select student load for course registrations
  useEffect(() => {
    if (!selectedStudentId) {
      setStudentAvailableUnits([]);
      setStudentCheckedUnitIds([]);
      return;
    }

    const stud = students.find(s => s.id === selectedStudentId);
    if (!stud) return;

    // Load registered lists for this student
    const preRegIds = courseRegistrations
      .filter(cr => cr.studentId === selectedStudentId)
      .map(cr => cr.unitId);
    setStudentCheckedUnitIds(preRegIds);

    // Load available curriculum for student's program and current semester
    const activeAY = academicYears.find(y => y.status === 'active');
    const activeSem = semesters.find(s => s.status === 'active' || (activeAY && s.academicYearId === activeAY.id));

    const programCurrics = curriculums.filter(c => 
      c.programId === stud.programId && 
      (!stud.levelId || c.levelId === stud.levelId) &&
      (!activeSem || c.semesterId === activeSem.id)
    );

    setStudentAvailableUnits(programCurrics);
  }, [selectedStudentId, courseRegistrations, curriculums, students]);

  const handleToggleStudentUnit = (unitId: string) => {
    setStudentCheckedUnitIds(prev => {
      if (prev.includes(unitId)) {
        return prev.filter(id => id !== unitId);
      } else {
        return [...prev, unitId];
      }
    });
  };

  // Submit Bulk Student enrollment
  const handleSaveStudentEnrollment = async () => {
    if (!selectedStudentId) return;
    
    const activeAY = academicYears.find(y => y.status === 'active');
    const activeSem = semesters.find(s => s.status === 'active' || (activeAY && s.academicYearId === activeAY.id));
    
    if (!activeAY || !activeSem) {
      setError('Active Year & Semester parameters must be online to enroll students.');
      return;
    }

    setEnrollingStatus(true);
    setError(null);

    try {
      const resp = await fetch('/api/admin/registrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          studentId: selectedStudentId,
          academicYearId: activeAY.id,
          semesterId: activeSem.id,
          unitIds: studentCheckedUnitIds
        })
      });

      if (resp.ok) {
        appendLog?.(`[COURSE REGISTRATION] Admin manually updated registrations for Student ID "${selectedStudentId}": ${studentCheckedUnitIds.length} course units.`);
        triggerFeedback('Student enrollment registration updated. Student holds active records now.');
        setSelectedStudentId('');
      } else {
        let errorData: any = {};
        try {
          const text = await resp.text();
          errorData = text ? JSON.parse(text) : {};
        } catch (e) {}
        throw new Error(errorData.error || 'Server registration failure');
      }
    } catch (e: any) {
      setError(e.message || 'Database registration fault.');
    } finally {
      setEnrollingStatus(false);
    }
  };

  // Filter students
  const filteredStudents = students.filter(s => {
    if (!studentSearch) return true;
    return s.name.toLowerCase().includes(studentSearch.toLowerCase()) || 
           s.regNumber.toLowerCase().includes(studentSearch.toLowerCase());
  });

  return (
    <div className={`space-y-6 ${isPhoneFrame ? 'text-xs' : 'text-sm'}`}>
      
      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-250 text-emerald-800 rounded-xl text-xs font-bold leading-none">
          {success}
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-50 border border-red-250 text-red-800 rounded-xl text-xs font-bold flex items-center gap-1.5 leading-snug">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-650" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Module 7: Staff Assignments */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-extrabold text-slate-800 text-xs flex items-center gap-2 pb-2 border-b border-slate-100">
            <UserCheck className="h-4 w-4 text-indigo-600" /> Module 7: Teaching Allocation Board
          </h3>

          <form onSubmit={handleCreateAssign} className="bg-slate-50 p-3.5 rounded-xl border border-slate-150 space-y-3.5 text-[10px]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[9px] text-slate-400 font-bold block mb-1">Select Lecturer / Faculty</label>
                <select 
                  value={assignForm.staffId} 
                  onChange={(e) => setAssignForm({ ...assignForm, staffId: e.target.value })} 
                  className="w-full p-2 bg-white rounded-lg border border-slate-200 text-slate-700 font-bold outline-none"
                  required
                >
                  <option value="">-- Choose Faculty --</option>
                  {staff.map(st => (
                    <option key={st.id} value={st.id}>{st.name} ({st.role})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[9px] text-slate-400 font-bold block mb-1">Target Course Unit</label>
                <select 
                  value={assignForm.unitId} 
                  onChange={(e) => setAssignForm({ ...assignForm, unitId: e.target.value })} 
                  className="w-full p-2 bg-white rounded-lg border border-slate-200 text-slate-700 font-bold outline-none"
                  required
                >
                  <option value="">-- Choose Unit --</option>
                  {units.map(u => (
                    <option key={u.id} value={u.id}>[{u.code.toUpperCase()}] {u.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[9px] text-slate-400 font-bold block mb-1">Academic Year</label>
                <select 
                  value={assignForm.academicYearId} 
                  onChange={(e) => setAssignForm({ ...assignForm, academicYearId: e.target.value })} 
                  className="w-full p-2 bg-white rounded-lg border border-slate-200 text-slate-700 font-bold outline-none"
                  required
                >
                  <option value="">-- Target Year --</option>
                  {academicYears.map(y => (
                    <option key={y.id} value={y.id}>{y.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[9px] text-slate-400 font-bold block mb-1">Target Semester</label>
                <select 
                  value={assignForm.semesterId} 
                  onChange={(e) => setAssignForm({ ...assignForm, semesterId: e.target.value })} 
                  className="w-full p-2 bg-white rounded-lg border border-slate-200 text-slate-700 font-bold outline-none"
                  required
                >
                  <option value="">-- Target Semester --</option>
                  {semesters.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.academicYearName})</option>
                  ))}
                </select>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer font-mono shadow-xs"
            >
              + Create Teaching Assignment
            </button>
          </form>

          {/* List assignments */}
          <div className="space-y-2">
            <h4 className="text-[9px] text-slate-400 uppercase font-extrabold font-mono tracking-widest pl-1">Allocated Allocations Matrix:</h4>
            {teachingAssignments.length === 0 ? (
              <p className="text-center text-slate-400 font-mono text-[10px] py-4 bg-slate-50 border border-slate-150 rounded-xl">No course allocations currently established.</p>
            ) : (
              <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1">
                {Array.from(new Map<string, TeachingAssignment>(teachingAssignments.map(ta => [ta.id, ta])).values()).map((ta) => (
                  <div key={ta.id} className="p-2 bg-white border border-slate-150 hover:border-slate-300 rounded-xl flex items-center justify-between transition-all">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[8px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-1 py-0.2 rounded shrink-0">
                          {ta.unitCode}
                        </span>
                        <h5 className="font-extrabold text-slate-800 text-[10px] truncate max-w-[150px]">{ta.staffName}</h5>
                      </div>
                      <p className="text-[9px] text-slate-400 truncate max-w-[200px] mt-0.5">{ta.unitName}</p>
                      <span className="text-[8px] text-slate-400 font-mono font-medium block">Term: {ta.semesterName} ({ta.academicYearName})</span>
                    </div>

                    <button 
                      onClick={() => handleDeleteAssign(ta.id)} 
                      className="p-1 px-1.5 text-rose-600 hover:bg-rose-50 border border-rose-100 rounded-lg cursor-pointer shrink-0 transition-colors"
                      title="Deallocate Unit"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Module 6: Course Registrations */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-extrabold text-slate-800 text-xs flex items-center gap-2 pb-2 border-b border-slate-100 font-sans">
            <Users className="h-4 w-4 text-indigo-600" /> Module 6: Manual Course Enrollments
          </h3>

          {!selectedStudentId ? (
            // Select active student loop
            <div className="space-y-3.5">
              <p className="text-[9px] text-slate-400 font-extrabold uppercase font-mono tracking-widest pl-1">Stage 1: Choose Student and Registry</p>
              
              <div className="relative">
                <input 
                  type="text" 
                  value={studentSearch} 
                  onChange={(e) => setStudentSearch(e.target.value)} 
                  placeholder="Search students by full name or Reg Number..." 
                  className="w-full py-2 pl-8 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
                <Search className="absolute left-2.5 top-2.5 text-slate-400 h-3.5 w-3.5" />
              </div>

              {filteredStudents.length === 0 ? (
                <div className="text-center text-slate-400 font-mono text-[10px] py-6">No matching academic students in record database.</div>
              ) : (
                <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
                  {filteredStudents.map(stud => {
                    const regCount = courseRegistrations.filter(cr => cr.studentId === stud.id).length;
                    return (
                      <div 
                        key={stud.id} 
                        onClick={() => setSelectedStudentId(stud.id)}
                        className="p-2.5 bg-white border border-slate-150 hover:bg-indigo-50/20 hover:border-indigo-200 rounded-xl flex items-center justify-between cursor-pointer transition-all"
                      >
                        <div>
                          <h4 className="font-bold text-slate-800 text-[11px]">{stud.name}</h4>
                          <p className="font-mono text-[9px] text-slate-400 mt-0.5">Reg Key: {stud.regNumber || 'N/A'}</p>
                        </div>
                        
                        <div className="text-right">
                          <span className="text-[8px] font-black uppercase text-indigo-600 bg-indigo-50 border border-indigo-100 rounded px-1.5 py-0.5 font-mono">
                            {regCount} units enrolled
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            // Form to manage checklist
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-indigo-50 border border-indigo-200 p-2.5 rounded-xl">
                <div>
                  <h4 className="font-bold text-slate-800 text-[11px]">
                    {students.find(s => s.id === selectedStudentId)?.name}
                  </h4>
                  <p className="text-[9px] text-slate-550 font-mono">
                    Reg No: {students.find(s => s.id === selectedStudentId)?.regNumber}
                  </p>
                </div>

                <div className="flex gap-1">
                  <button 
                    onClick={handleSaveStudentEnrollment} 
                    disabled={enrollingStatus}
                    className="p-1 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-black cursor-pointer font-sans transition-all flex items-center gap-1"
                  >
                    {enrollingStatus ? 'Saving...' : <><Check className="h-3 w-3" /> Save</>}
                  </button>
                  <button 
                    onClick={() => setSelectedStudentId('')} 
                    className="p-1 px-2.5 bg-white border border-slate-250 text-slate-600 rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>

              <div>
                <p className="text-[9px] text-slate-400 uppercase font-extrabold font-mono tracking-widest pl-1 mb-2">Stage 2: Check Course Units To Enroll</p>
                
                {studentAvailableUnits.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 font-mono text-[10px] bg-slate-50 border border-slate-150 rounded-xl leading-snug">
                    No matching program curriculum mapped for this student's level this semester. Build curriculum mapping first.
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-[230px] overflow-y-auto">
                    {studentAvailableUnits.map(unit => {
                      const isChecked = studentCheckedUnitIds.includes(unit.unitId);
                      return (
                        <div 
                          key={unit.id}
                          onClick={() => handleToggleStudentUnit(unit.unitId)}
                          className={`p-2 rounded-xl border transition-all cursor-pointer flex justify-between items-center ${
                            isChecked 
                              ? 'bg-emerald-50/20 border-emerald-250' 
                              : 'bg-white border-slate-150 hover:bg-slate-50'
                          }`}
                        >
                          <div>
                            <span className="font-mono text-[8px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-1 py-0.2 rounded">
                              {unit.unitCode}
                            </span>
                            <span className="text-[9px] text-slate-400 font-bold ml-1">{unit.unitType}</span>
                            <h5 className="font-bold text-slate-800 text-[10px] mt-1">{unit.unitName}</h5>
                          </div>

                          <div>
                            {isChecked ? (
                              <span className="text-[9px] font-extrabold text-emerald-600 font-mono uppercase bg-emerald-50 px-1 py-0.5 rounded border border-emerald-100">Enrolled ✔</span>
                            ) : (
                              <span className="text-[9px] font-semibold text-slate-400 font-mono uppercase bg-slate-50 px-1 py-0.5 rounded border border-slate-200">De-enrolled</span>
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
        </div>

      </div>
    </div>
  );
}
