/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from 'react';
import { 
  Calendar, Layers, Plus, Trash2, ShieldAlert, Sparkles, RefreshCw, AlertCircle, ToggleLeft, CheckSquare
} from 'lucide-react';
import { AcademicYear, Semester, Level, Intake } from '../types';

interface AdminAcademicConfigProps {
  token: string;
  appendLog?: (msg: string) => void;
  isPhoneFrame?: boolean;
}

export default function AdminAcademicConfig({ token, appendLog, isPhoneFrame = false }: AdminAcademicConfigProps) {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [intakes, setIntakes] = useState<Intake[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Forms state
  const [ayForm, setAyForm] = useState({ name: '', startDate: '', endDate: '', status: 'upcoming' as AcademicYear['status'] });
  const [semForm, setSemForm] = useState({ academicYearId: '', name: '', startDate: '', endDate: '', status: 'upcoming' as Semester['status'] });
  const [levelForm, setLevelForm] = useState({ name: '', order: 1 });
  const [intakeForm, setIntakeForm] = useState({ name: '', code: '', month: 'January', year: 2026, status: 'active' as 'active' | 'disabled' });
  const [editingIntake, setEditingIntake] = useState<Intake | null>(null);
  const [editingAY, setEditingAY] = useState<AcademicYear | null>(null);
  const [editingSem, setEditingSem] = useState<Semester | null>(null);
  const [editingLevel, setEditingLevel] = useState<Level | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const h = { 'Authorization': `Bearer ${token}` };
      const [ayResp, semResp, levelResp, intakeResp] = await Promise.all([
        fetch('/api/admin/academic-years', { headers: h }),
        fetch('/api/admin/semesters', { headers: h }),
        fetch('/api/admin/levels', { headers: h }),
        fetch('/api/admin/intakes', { headers: h })
      ]);

      if (ayResp.ok && semResp.ok && levelResp.ok) {
        const ays = await ayResp.json();
        setAcademicYears(ays);
        setSemesters(semResp.ok ? await semResp.json() : []);
        setLevels(levelResp.ok ? await levelResp.json() : []);
        setIntakes(intakeResp.ok ? await intakeResp.json() : []);

        if (ays.length > 0 && !semForm.academicYearId) {
          setSemForm(prev => ({ ...prev, academicYearId: ays[0].id }));
        }
      }
    } catch (err) {
      setError('Could not connect to academic structure database.');
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

  // Submit Academic Year
  const handleCreateAY = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ayForm.name || !ayForm.startDate || !ayForm.endDate) return;
    setError(null);
    try {
      const resp = await fetch('/api/admin/academic-years', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(ayForm)
      });
      const resJson = await resp.json();
      if (!resp.ok) throw new Error(resJson.error || 'Duplicate year or database exception');
      
      appendLog?.(`[ACADEMIC CONFIG] New Academic Year built: "${ayForm.name}" with status "${ayForm.status}"`);
      triggerFeedback(`Academic Year "${ayForm.name}" successfully created!`);
      setAyForm({ name: '', startDate: '', endDate: '', status: 'upcoming' });
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Set AY Active
  const handleSetActiveAY = async (id: string) => {
    setError(null);
    try {
      const resp = await fetch('/api/admin/academic-years', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ id, status: 'active' })
      });
      if (!resp.ok) {
        const errorData = await resp.json();
        throw new Error(errorData.error || 'Server error toggle');
      }
      appendLog?.(`[ACADEMIC CONFIG] Academic Year was set active in the system: "${id}"`);
      triggerFeedback('Year status overridden correctly.');
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Delete AY
  const handleDeleteAY = async (id: string) => {
    if (!window.confirm('Erase this Academic Year record?')) return;
    try {
      const resp = await fetch(`/api/admin/academic-years?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resp.ok) {
        appendLog?.(`[ACADEMIC CONFIG] Erased Year ID "${id}"`);
        triggerFeedback('Academic Year purged.');
      } else {
        const data = await resp.json();
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Update AY Details
  const handleUpdateAYSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAY) return;
    setError(null);
    try {
      const resp = await fetch(`/api/admin/academic-years/${editingAY.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(editingAY)
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Failed to update academic year');

      appendLog?.(`[ACADEMIC CONFIG] Modified Year Profile: "${editingAY.name}"`);
      triggerFeedback('Academic Year updated successfully.');
      setEditingAY(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Change AY General Status (Active, Archive/Closed, Upcoming)
  const handleSetAYStatus = async (id: string, status: 'active' | 'closed' | 'upcoming') => {
    setError(null);
    try {
      const resp = await fetch(`/api/admin/academic-years/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Failed to change Year status');

      appendLog?.(`[ACADEMIC CONFIG] Overrode Year "${id}" status to "${status}"`);
      triggerFeedback(`Academic Year status changed to ${status}.`);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Submit Semester
  const handleCreateSemester = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!semForm.academicYearId || !semForm.name || !semForm.startDate || !semForm.endDate) return;
    setError(null);
    try {
      const resp = await fetch('/api/admin/semesters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(semForm)
      });
      const resJson = await resp.json();
      if (!resp.ok) throw new Error(resJson.error || 'Error saving semester');

      appendLog?.(`[ACADEMIC CONFIG] Created semester loop: "${semForm.name}" under Year "${semForm.academicYearId}"`);
      triggerFeedback(`Semester "${semForm.name}" registered.`);
      setSemForm(prev => ({ ...prev, name: '', startDate: '', endDate: '', status: 'upcoming' }));
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Set Semester Active
  const handleSetActiveSem = async (id: string) => {
    setError(null);
    try {
      const resp = await fetch('/api/admin/semesters', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ id, status: 'active' })
      });
      if (!resp.ok) {
        const errorData = await resp.json();
        throw new Error(errorData.error);
      }
      appendLog?.(`[ACADEMIC CONFIG] Enabled Semester "${id}"`);
      triggerFeedback('Semester activated.');
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Delete Semester
  const handleDeleteSem = async (id: string) => {
    if (!window.confirm('Erase semester item?')) return;
    try {
      const resp = await fetch(`/api/admin/semesters?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resp.ok) {
        triggerFeedback('Semester deleted.');
      } else {
        const d = await resp.json();
        setError(d.error);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Update Semester Details
  const handleUpdateSemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSem) return;
    setError(null);
    try {
      const resp = await fetch(`/api/admin/semesters/${editingSem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(editingSem)
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Failed to update semester');

      appendLog?.(`[ACADEMIC CONFIG] Modified Semester Profile: "${editingSem.name}"`);
      triggerFeedback('Semester updated successfully.');
      setEditingSem(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Change Semester Status (Activate, Deactivate/Closed, Upcoming)
  const handleSetSemStatus = async (id: string, status: 'active' | 'closed' | 'upcoming') => {
    setError(null);
    try {
      const resp = await fetch(`/api/admin/semesters/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Failed to change semester status');

      appendLog?.(`[ACADEMIC CONFIG] Overrode Semester status of "${id}" to "${status}"`);
      triggerFeedback(`Semester status changed to ${status}.`);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Create Syllabus Level
  const handleCreateLevel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!levelForm.name) return;
    setError(null);
    try {
      const resp = await fetch('/api/admin/levels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(levelForm)
      });
      const resJson = await resp.json();
      if (!resp.ok) throw new Error(resJson.error);

      appendLog?.(`[ACADEMIC CONFIG] Introduced program level: "${levelForm.name}" (Weight ${levelForm.order})`);
      triggerFeedback(`Level "${levelForm.name}" configured.`);
      setLevelForm({ name: '', order: levels.length + 2 });
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Delete Level
  const handleDeleteLevel = async (id: string) => {
    if (!window.confirm('Delete level order tag?')) return;
    try {
      const resp = await fetch(`/api/admin/levels?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resp.ok) {
        triggerFeedback('Level deleted.');
      } else {
        const data = await resp.json();
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Update Level Details
  const handleUpdateLevelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLevel) return;
    setError(null);
    try {
      const resp = await fetch(`/api/admin/levels/${editingLevel.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(editingLevel)
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Failed to update level');

      appendLog?.(`[ACADEMIC CONFIG] Modified Level Profile: "${editingLevel.name}"`);
      triggerFeedback('Level updated successfully.');
      setEditingLevel(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Submit Intake
  const handleCreateIntake = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!intakeForm.name || !intakeForm.code || !intakeForm.year) return;
    setError(null);
    try {
      const resp = await fetch('/api/admin/intakes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(intakeForm)
      });
      const resJson = await resp.json();
      if (!resp.ok) throw new Error(resJson.error || 'Database exception saving intake');
      
      appendLog?.(`[ACADEMIC CONFIG] New Intake configured: "${intakeForm.name}" (${intakeForm.code})`);
      triggerFeedback(`Intake "${intakeForm.name}" successfully created!`);
      setIntakeForm({ name: '', code: '', month: 'January', year: 2026, status: 'active' });
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Toggle Disable Intake
  const handleToggleDisableIntake = async (intakeItem: Intake) => {
    setError(null);
    const updatedStatus = intakeItem.status === 'active' ? 'disabled' : 'active';
    try {
      const resp = await fetch(`/api/admin/intakes/${intakeItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: updatedStatus })
      });
      if (!resp.ok) {
        const errorData = await resp.json();
        throw new Error(errorData.error || 'Server error toggling status');
      }
      appendLog?.(`[ACADEMIC CONFIG] Intake "${intakeItem.name}" status updated to "${updatedStatus}"`);
      triggerFeedback(`Intake status changed to ${updatedStatus}.`);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Edit fields (or update intake details)
  const handleUpdateIntakeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingIntake) return;
    setError(null);
    try {
      const resp = await fetch(`/api/admin/intakes/${editingIntake.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(editingIntake)
      });
      if (!resp.ok) {
        const errorData = await resp.json();
        throw new Error(errorData.error || 'Server error saving changes');
      }
      appendLog?.(`[ACADEMIC CONFIG] Modified Intake profile for: "${editingIntake.name}"`);
      triggerFeedback('Intake properties saved successfully!');
      setEditingIntake(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Delete Intake
  const handleDeleteIntake = async (id: string) => {
    if (!window.confirm('Delete this Intake log?')) return;
    try {
      const resp = await fetch(`/api/admin/intakes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resp.ok) {
        appendLog?.(`[ACADEMIC CONFIG] Purged Intake entry with ID "${id}"`);
        triggerFeedback('Intake record purged.');
      } else {
        const data = await resp.json();
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className={`space-y-6 ${isPhoneFrame ? 'text-xs' : 'text-sm'}`}>
      
      {/* feedback message states */}
      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-250 text-emerald-800 rounded-xl text-xs font-bold leading-none animate-pulse">
          {success}
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-50 border border-red-250 text-red-800 rounded-xl text-xs font-bold flex items-center gap-1.5 leading-snug">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-650" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Module 1: Academic Years */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-extrabold text-slate-800 text-xs flex items-center gap-2 pb-2 border-b border-slate-100">
            <Calendar className="h-4 w-4 text-indigo-600" /> Module 1: Academic Years
          </h3>

          {/* Form Create */}
          <form onSubmit={handleCreateAY} className="bg-slate-50 p-3 rounded-xl border border-slate-150 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
              <div className="col-span-2">
                <label className="text-[9px] text-slate-400 font-bold block mb-1">Year Code Name (e.g. 2026/2027)</label>
                <input 
                  type="text" 
                  value={ayForm.name} 
                  onChange={(e) => setAyForm({ ...ayForm, name: e.target.value })} 
                  className="w-full p-2 bg-white rounded-lg border border-slate-200 font-bold text-slate-800 outline-none" 
                  placeholder="2026/2027" 
                  required 
                />
              </div>
              <div>
                <label className="text-[9px] text-slate-400 font-bold block mb-1">Start Date</label>
                <input 
                  type="date" 
                  value={ayForm.startDate} 
                  onChange={(e) => setAyForm({ ...ayForm, startDate: e.target.value })} 
                  className="w-full p-2 bg-white rounded-lg border border-slate-200 text-slate-600 font-bold outline-none" 
                  required 
                />
              </div>
              <div>
                <label className="text-[9px] text-slate-400 font-bold block mb-1">End Date</label>
                <input 
                  type="date" 
                  value={ayForm.endDate} 
                  onChange={(e) => setAyForm({ ...ayForm, endDate: e.target.value })} 
                  className="w-full p-2 bg-white rounded-lg border border-slate-200 text-slate-600 font-bold outline-none" 
                  required 
                />
              </div>
              <div className="col-span-2">
                <label className="text-[9px] text-slate-400 font-bold block mb-1">Initial Status</label>
                <select 
                  value={ayForm.status} 
                  onChange={(e: any) => setAyForm({ ...ayForm, status: e.target.value })} 
                  className="w-full p-2 bg-white rounded-lg border border-slate-200 text-slate-700 outline-none font-bold"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="active">Active</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>
            <button 
              type="submit" 
              className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs font-mono"
            >
              + Create Year Block
            </button>
          </form>

          {/* List AY */}
          <div className="space-y-2">
            <h4 className="text-[9px] text-slate-400 uppercase font-extrabold font-mono tracking-wider">Configured Years Registry:</h4>
            {academicYears.length === 0 ? (
              <p className="text-center text-slate-400 font-mono text-[10px] py-3">No academic years exist.</p>
            ) : (
              <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                {academicYears.map((ay) => (
                  <div key={ay.id} className="p-2.5 bg-white border border-slate-150 hover:border-slate-350 rounded-xl flex items-center justify-between transition-all">
                    <div>
                      <h5 className="font-extrabold text-slate-800 text-[11px]">{ay.name}</h5>
                      <p className="text-[9px] text-slate-400 font-semibold font-mono">
                        Span: {ay.startDate} to {ay.endDate}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.55">
                      <select
                        value={ay.status}
                        onChange={(e) => handleSetAYStatus(ay.id, e.target.value as any)}
                        className={`px-1 py-0.5 rounded text-[8px] font-mono font-bold uppercase cursor-pointer border ${
                          ay.status === 'active'
                            ? 'bg-emerald-50 border-emerald-250 text-emerald-800 hover:bg-emerald-100'
                            : ay.status === 'closed'
                            ? 'bg-amber-50 border-amber-250 text-amber-800 hover:bg-amber-100'
                            : 'bg-slate-50 border-slate-250 text-slate-800 hover:bg-slate-105'
                        }`}
                      >
                        <option value="upcoming">Upcoming</option>
                        <option value="active">Active</option>
                        <option value="closed">Closed/Archived</option>
                      </select>

                      <button 
                        onClick={() => setEditingAY(ay)}
                        className="px-1.5 py-0.5 text-slate-650 bg-slate-50 border border-slate-200 rounded text-[9px] font-bold cursor-pointer hover:bg-slate-100 transition-colors"
                      >
                        Edit
                      </button>
                      
                      <button 
                        onClick={() => handleDeleteAY(ay.id)} 
                        className="p-1 px-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-250 text-rose-600 rounded-lg cursor-pointer transition-colors"
                        title="Purge Year"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* EDITING DIALOG INLINE FOR ACADEMIC YEAR */}
          {editingAY && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 mt-4">
              <h4 className="text-xs font-bold text-indigo-950 font-mono">Edit Academic Year Details: {editingAY.name}</h4>
              <form onSubmit={handleUpdateAYSubmit} className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="col-span-2">
                  <label className="text-[9px] text-slate-400 block font-bold mb-1">Year Code/Name</label>
                  <input 
                    type="text" 
                    value={editingAY.name} 
                    onChange={(e) => setEditingAY({ ...editingAY, name: e.target.value })} 
                    className="w-full p-2 bg-white rounded-lg border border-slate-200 font-bold text-slate-800 text-xs" 
                    required 
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-400 block font-bold mb-1">Start Date</label>
                  <input 
                    type="date" 
                    value={editingAY.startDate} 
                    onChange={(e) => setEditingAY({ ...editingAY, startDate: e.target.value })} 
                    className="w-full p-2 bg-white rounded-lg border border-slate-200 font-bold text-slate-800 text-xs" 
                    required 
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-400 block font-bold mb-1">End Date</label>
                  <input 
                    type="date" 
                    value={editingAY.endDate} 
                    onChange={(e) => setEditingAY({ ...editingAY, endDate: e.target.value })} 
                    className="w-full p-2 bg-white rounded-lg border border-slate-200 font-bold text-slate-800 text-xs" 
                    required 
                  />
                </div>
                <div className="col-span-2 font-bold text-slate-700">
                  <label className="text-[9px] text-slate-400 block font-bold mb-1">Status</label>
                  <select 
                    value={editingAY.status} 
                    onChange={(e: any) => setEditingAY({ ...editingAY, status: e.target.value })} 
                    className="w-full p-2 bg-white rounded-lg border border-slate-200 font-bold text-slate-800 text-xs" 
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="active">Active</option>
                    <option value="closed">Closed/Archived</option>
                  </select>
                </div>
                <div className="flex gap-2 pt-2 col-span-2 justify-end text-xs font-bold">
                  <button type="button" onClick={() => setEditingAY(null)} className="px-3 py-1 bg-slate-200 rounded text-slate-700">Cancel</button>
                  <button type="submit" className="px-3 py-1 bg-indigo-650 text-white rounded font-bold cursor-pointer">Save Changes</button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Module 2: Semesters */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-extrabold text-slate-800 text-xs flex items-center gap-2 pb-2 border-b border-slate-100">
            <Layers className="h-4 w-4 text-indigo-600" /> Module 2: Semesters
          </h3>

          {/* Form Create */}
          <form onSubmit={handleCreateSemester} className="bg-slate-50 p-3 rounded-xl border border-slate-150 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
              <div className="col-span-2">
                <label className="text-[9px] text-slate-400 font-bold block mb-1">Parent Academic Year ID</label>
                <select 
                  value={semForm.academicYearId} 
                  onChange={(e) => setSemForm({ ...semForm, academicYearId: e.target.value })} 
                  className="w-full p-2 bg-white rounded-lg border border-slate-200 text-slate-700 outline-none font-bold"
                  required
                >
                  <option value="">-- Choose Target Year --</option>
                  {academicYears.map(y => (
                    <option key={y.id} value={y.id}>{y.name}</option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <label className="text-[9px] text-slate-400 font-bold block mb-1">Semester Designation Name</label>
                <input 
                  type="text" 
                  value={semForm.name} 
                  onChange={(e) => setSemForm({ ...semForm, name: e.target.value })} 
                  className="w-full p-2 bg-white rounded-lg border border-slate-200 font-bold text-slate-800 outline-none" 
                  placeholder="Semester 1 / Term A" 
                  required 
                />
              </div>

              <div>
                <label className="text-[9px] text-slate-400 font-bold block mb-1">Start Date</label>
                <input 
                  type="date" 
                  value={semForm.startDate} 
                  onChange={(e) => setSemForm({ ...semForm, startDate: e.target.value })} 
                  className="w-full p-2 bg-white rounded-lg border border-slate-200 text-slate-600 font-bold outline-none" 
                  required 
                />
              </div>

              <div>
                <label className="text-[9px] text-slate-400 font-bold block mb-1">End Date</label>
                <input 
                  type="date" 
                  value={semForm.endDate} 
                  onChange={(e) => setSemForm({ ...semForm, endDate: e.target.value })} 
                  className="w-full p-2 bg-white rounded-lg border border-slate-200 text-slate-600 font-bold outline-none" 
                  required 
                />
              </div>
            </div>
            <button 
              type="submit" 
              className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs font-mono"
            >
              + Create Semester Item
            </button>
          </form>

          {/* List Semesters */}
          <div className="space-y-2">
            <h4 className="text-[9px] text-slate-400 uppercase font-extrabold font-mono tracking-wider">Linked Semester Registry:</h4>
            {semesters.length === 0 ? (
              <p className="text-center text-slate-400 font-mono text-[10px] py-3">No active semesters defined.</p>
            ) : (
              <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                {semesters.map((s) => (
                  <div key={s.id} className="p-2 bg-white border border-slate-150 hover:border-slate-350 rounded-xl flex items-center justify-between transition-all text-[11px]">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h5 className="font-extrabold text-slate-850 truncate max-w-[170px]">{s.name}</h5>
                        <span className="font-mono text-[8px] px-1 bg-indigo-50 border border-indigo-100 rounded font-semibold text-indigo-700">
                          {s.academicYearName}
                        </span>
                      </div>
                      <p className="text-[9px] text-slate-400 font-mono">Span: {s.startDate} to {s.endDate}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <select
                        value={s.status}
                        onChange={(e) => handleSetSemStatus(s.id, e.target.value as any)}
                        className={`px-1 py-0.5 rounded text-[8px] font-mono font-bold uppercase cursor-pointer border ${
                          s.status === 'active'
                            ? 'bg-emerald-50 border-emerald-250 text-emerald-800 hover:bg-emerald-100'
                            : s.status === 'closed'
                            ? 'bg-amber-50 border-amber-250 text-amber-800 hover:bg-amber-100'
                            : 'bg-slate-50 border-slate-250 text-slate-800 hover:bg-slate-105'
                        }`}
                      >
                        <option value="upcoming">Upcoming</option>
                        <option value="active">Active</option>
                        <option value="closed">Closed/Archived</option>
                      </select>

                      <button 
                        onClick={() => setEditingSem(s)}
                        className="px-1.5 py-0.5 text-slate-650 bg-slate-50 border border-slate-200 rounded text-[9px] font-bold cursor-pointer hover:bg-slate-100 transition-colors"
                      >
                        Edit
                      </button>
                      
                      <button 
                        onClick={() => handleDeleteSem(s.id)} 
                        className="p-1 text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                        title="Delete Semester"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* EDITING DIALOG INLINE FOR SEMESTER */}
          {editingSem && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 mt-4">
              <h4 className="text-xs font-bold text-indigo-950 font-mono">Edit Semester Details: {editingSem.name}</h4>
              <form onSubmit={handleUpdateSemSubmit} className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="col-span-2">
                  <label className="text-[9px] text-slate-400 block font-bold mb-1">Parent Academic Year</label>
                  <select 
                    value={editingSem.academicYearId} 
                    onChange={(e) => setEditingSem({ ...editingSem, academicYearId: e.target.value })} 
                    className="w-full p-2 bg-white rounded-lg border border-slate-200 text-slate-700 outline-none font-bold text-xs"
                    required
                  >
                    <option value="">-- Choose Target Year --</option>
                    {academicYears.map(y => (
                      <option key={y.id} value={y.id}>{y.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-[9px] text-slate-400 block font-bold mb-1">Semester Designation Name</label>
                  <input 
                    type="text" 
                    value={editingSem.name} 
                    onChange={(e) => setEditingSem({ ...editingSem, name: e.target.value })} 
                    className="w-full p-2 bg-white rounded-lg border border-slate-200 font-bold text-slate-800 text-xs" 
                    required 
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-400 block font-bold mb-1">Start Date</label>
                  <input 
                    type="date" 
                    value={editingSem.startDate} 
                    onChange={(e) => setEditingSem({ ...editingSem, startDate: e.target.value })} 
                    className="w-full p-2 bg-white rounded-lg border border-slate-200 font-bold text-slate-800 text-xs" 
                    required 
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-400 block font-bold mb-1">End Date</label>
                  <input 
                    type="date" 
                    value={editingSem.endDate} 
                    onChange={(e) => setEditingSem({ ...editingSem, endDate: e.target.value })} 
                    className="w-full p-2 bg-white rounded-lg border border-slate-200 font-bold text-slate-800 text-xs" 
                    required 
                  />
                </div>
                <div className="col-span-2 font-bold text-slate-705">
                  <label className="text-[9px] text-slate-400 block font-bold mb-1">Status</label>
                  <select 
                    value={editingSem.status} 
                    onChange={(e: any) => setEditingSem({ ...editingSem, status: e.target.value })} 
                    className="w-full p-2 bg-white rounded-lg border border-slate-200 font-bold text-slate-800 text-xs" 
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="active">Active</option>
                    <option value="closed">Closed/Archived</option>
                  </select>
                </div>
                <div className="flex gap-2 pt-2 col-span-2 justify-end text-xs font-bold">
                  <button type="button" onClick={() => setEditingSem(null)} className="px-3 py-1 bg-slate-200 rounded text-slate-700">Cancel</button>
                  <button type="submit" className="px-3 py-1 bg-indigo-650 text-white rounded font-bold cursor-pointer">Save Changes</button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Module 3: Syllabus Levels */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-4 col-span-1 lg:col-span-2">
          <h3 className="font-extrabold text-slate-800 text-xs flex items-center gap-2 pb-2 border-b border-slate-100">
            <Layers className="h-4 w-4 text-indigo-600" /> Module 3: Syllabus Levels (Academic Progression Keys)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Form */}
            <form onSubmit={handleCreateLevel} className="bg-slate-50 p-3.5 rounded-xl border border-slate-150 space-y-3.5 h-fit">
              <div>
                <label className="text-[9px] text-slate-400 font-bold block mb-1">Level Tag Name (e.g. Year 1)</label>
                <input 
                  type="text" 
                  value={levelForm.name} 
                  onChange={(e) => setLevelForm({ ...levelForm, name: e.target.value })} 
                  className="w-full p-2 bg-white rounded-lg border border-slate-200 font-bold text-slate-800 outline-none text-xs" 
                  placeholder="Year 1 / Semester A Group" 
                  required 
                />
              </div>
              <div>
                <label className="text-[9px] text-slate-400 font-bold block mb-1">Sequence Order Number (Determines Progression)</label>
                <input 
                  type="number" 
                  value={levelForm.order} 
                  onChange={(e) => setLevelForm({ ...levelForm, order: parseInt(e.target.value, 15) || 1 })} 
                  className="w-full p-2 bg-white rounded-lg border border-slate-200 font-mono text-xs text-slate-700 outline-none" 
                  required 
                />
              </div>
              <button 
                type="submit" 
                className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer font-mono"
              >
                + Register Syllabus Level
              </button>
            </form>

            {/* List */}
            <div className="space-y-2">
              <h4 className="text-[9px] text-slate-400 uppercase font-extrabold font-mono tracking-widest pl-1">Level Priority Sequence:</h4>
              {levels.length === 0 ? (
                <p className="text-center text-slate-400 font-mono text-[10px] py-4">No levels ordered.</p>
              ) : (
                <div className="space-y-1.5 max-h-[190px] overflow-y-auto">
                  {levels.sort((a,b) => a.order - b.order).map((l) => (
                    <div key={l.id} className="p-2.5 bg-white border border-slate-200 hover:border-slate-350 rounded-xl flex items-center justify-between transition-all">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 bg-indigo-50 border border-indigo-150 rounded text-indigo-700">
                          Priority {l.order}
                        </span>
                        <h5 className="font-extrabold text-slate-800 text-[11px]">{l.name}</h5>
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        <button 
                          onClick={() => setEditingLevel(l)}
                          className="px-1.5 py-0.5 text-slate-650 bg-slate-50 border border-slate-200 rounded text-[9px] font-bold cursor-pointer hover:bg-slate-100 transition-colors"
                        >
                          Edit
                        </button>

                        <button 
                          onClick={() => handleDeleteLevel(l.id)} 
                          className="p-1 px-1.5 text-rose-655 bg-rose-50/50 rounded-lg hover:bg-rose-100 transition-colors cursor-pointer"
                          title="Delete Level"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* EDITING DIALOG INLINE FOR LEVEL */}
          {editingLevel && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 mt-4">
              <h4 className="text-xs font-bold text-indigo-950 font-mono">Edit Syllabus Level: {editingLevel.name}</h4>
              <form onSubmit={handleUpdateLevelSubmit} className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="col-span-2">
                  <label className="text-[9px] text-slate-400 block font-bold mb-1">Level Tag Name</label>
                  <input 
                    type="text" 
                    value={editingLevel.name} 
                    onChange={(e) => setEditingLevel({ ...editingLevel, name: e.target.value })} 
                    className="w-full p-2 bg-white rounded-lg border border-slate-200 font-bold text-slate-800 text-xs" 
                    required 
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[9px] text-slate-400 block font-bold mb-1">Sequence Order Number (Determines Progression)</label>
                  <input 
                    type="number" 
                    value={editingLevel.order} 
                    onChange={(e) => setEditingLevel({ ...editingLevel, order: parseInt(e.target.value, 10) || 1 })} 
                    className="w-full p-2 bg-white rounded-lg border border-slate-200 font-bold text-slate-800 text-xs" 
                    required 
                  />
                </div>
                <div className="flex gap-2 pt-2 col-span-2 justify-end text-xs font-bold">
                  <button type="button" onClick={() => setEditingLevel(null)} className="px-3 py-1 bg-slate-200 rounded text-slate-700">Cancel</button>
                  <button type="submit" className="px-3 py-1 bg-indigo-650 text-white rounded font-bold cursor-pointer">Save Changes</button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Module 4: Intakes Management */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-4 col-span-1 lg:col-span-2">
          <h3 className="font-extrabold text-slate-800 text-xs flex items-center gap-2 pb-2 border-b border-slate-100">
            <Calendar className="h-4 w-4 text-indigo-600" /> Module 4: Intakes Management
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Form */}
            <form onSubmit={handleCreateIntake} className="bg-slate-50 p-3.5 rounded-xl border border-slate-150 space-y-3 h-fit">
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="col-span-2">
                  <label className="text-[9px] text-slate-400 font-bold block mb-1">Intake Name (e.g., January Intake)</label>
                  <input 
                    type="text" 
                    value={intakeForm.name} 
                    onChange={(e) => setIntakeForm({ ...intakeForm, name: e.target.value })} 
                    className="w-full p-2 bg-white rounded-lg border border-slate-200 font-bold text-slate-800 outline-none text-xs" 
                    placeholder="September Intake" 
                    required 
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-400 font-bold block mb-1">Code/Acronym (e.g., J, M, S)</label>
                  <input 
                    type="text" 
                    value={intakeForm.code} 
                    onChange={(e) => setIntakeForm({ ...intakeForm, code: e.target.value })} 
                    className="w-full p-2 bg-white rounded-lg border border-slate-200 font-bold text-slate-800 outline-none text-xs uppercase" 
                    placeholder="S" 
                    maxLength={3}
                    required 
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-400 font-bold block mb-1">Year</label>
                  <input 
                    type="number" 
                    value={intakeForm.year} 
                    onChange={(e) => setIntakeForm({ ...intakeForm, year: parseInt(e.target.value, 10) || 2026 })} 
                    className="w-full p-2 bg-white rounded-lg border border-slate-200 font-bold text-slate-800 outline-none text-xs" 
                    placeholder="2026" 
                    required 
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[9px] text-slate-400 font-bold block mb-1">Start Month</label>
                  <select 
                    value={intakeForm.month} 
                    onChange={(e) => setIntakeForm({ ...intakeForm, month: e.target.value })} 
                    className="w-full p-2 bg-white rounded-lg border border-slate-200 text-slate-700 outline-none font-bold text-xs"
                    required
                  >
                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button 
                type="submit" 
                className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer font-mono"
              >
                + Register Intake Module
              </button>
            </form>

            {/* List */}
            <div className="space-y-2">
              <h4 className="text-[9px] text-slate-400 uppercase font-extrabold font-mono tracking-widest pl-1 font-bold">Configured Intakes:</h4>
              {intakes.length === 0 ? (
                <p className="text-center text-slate-400 font-mono text-[10px] py-4">No academic intakes defined yet.</p>
              ) : (
                <div className="space-y-1.5 max-h-[250px] overflow-y-auto">
                  {intakes.map((it) => (
                    <div key={it.id} className="p-2.5 bg-white border border-slate-200 hover:border-slate-350 rounded-xl flex items-center justify-between transition-all">
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-extrabold text-slate-800 text-[11px] font-sans">{it.name}</h5>
                          <span className="font-mono text-[9px] font-bold px-1.5 py-0.2 bg-indigo-50 border border-indigo-150 rounded text-indigo-700">
                            Code: {it.code}
                          </span>
                        </div>
                        <p className="text-[9px] text-slate-405 mt-0.5 font-bold font-mono">
                          Date: {it.month} • Year {it.year}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button 
                          onClick={() => handleToggleDisableIntake(it)}
                          className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase transition-colors border cursor-pointer ${
                            it.status === 'active' 
                              ? 'bg-emerald-50 border-emerald-250 text-emerald-800 hover:bg-emerald-100' 
                              : 'bg-rose-50 border-rose-250 text-rose-800 hover:bg-rose-100'
                          }`}
                        >
                          {it.status === 'active' ? 'Active' : 'Disabled'}
                        </button>
                        
                        <button 
                          onClick={() => setEditingIntake(it)} 
                          className="px-1.5 py-0.5 text-slate-600 bg-slate-50 border border-slate-200 rounded text-[9px] font-bold cursor-pointer hover:bg-slate-100"
                        >
                          Edit
                        </button>

                        <button 
                          onClick={() => handleDeleteIntake(it.id)} 
                          className="p-1 px-1.5 text-rose-655 bg-rose-50/50 rounded-lg hover:bg-rose-100 transition-colors cursor-pointer"
                          title="Purge Intake"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* EDITING DIALOG INLINE */}
          {editingIntake && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 mt-4">
              <h4 className="text-xs font-bold text-indigo-950 font-mono">Edit Intake Details: {editingIntake.name}</h4>
              <form onSubmit={handleUpdateIntakeSubmit} className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="col-span-2">
                  <label className="text-[9px] text-slate-400 block font-bold mb-1">Name</label>
                  <input 
                    type="text" 
                    value={editingIntake.name} 
                    onChange={(e) => setEditingIntake({ ...editingIntake, name: e.target.value })} 
                    className="w-full p-2 bg-white rounded-lg border border-slate-200 font-bold text-slate-800 text-xs" 
                    required 
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-400 block font-bold mb-1">Code/Acronym</label>
                  <input 
                    type="text" 
                    value={editingIntake.code} 
                    onChange={(e) => setEditingIntake({ ...editingIntake, code: e.target.value })} 
                    className="w-full p-2 bg-white rounded-lg border border-slate-200 font-bold text-slate-800 uppercase text-xs" 
                    required 
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-400 block font-bold mb-1">Year</label>
                  <input 
                    type="number" 
                    value={editingIntake.year} 
                    onChange={(e) => setEditingIntake({ ...editingIntake, year: parseInt(e.target.value, 10) || 2026 })} 
                    className="w-full p-2 bg-white rounded-lg border border-slate-200 font-bold text-slate-800 text-xs" 
                    required 
                  />
                </div>
                <div className="flex gap-2 pt-2 col-span-2 justify-end text-xs font-bold">
                  <button type="button" onClick={() => setEditingIntake(null)} className="px-3 py-1 bg-slate-200 rounded text-slate-700">Cancel</button>
                  <button type="submit" className="px-3 py-1 bg-indigo-650 rounded text-white font-bold cursor-pointer">Save Changes</button>
                </div>
              </form>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
