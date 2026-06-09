/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Plus, Trash2, Filter, Sparkles, RefreshCw, AlertCircle, Hash, HelpCircle
} from 'lucide-react';
import { ProgramCurriculum } from '../types';

interface AdminCurriculumMappingProps {
  token: string;
  appendLog?: (msg: string) => void;
  isPhoneFrame?: boolean;
}

export default function AdminCurriculumMapping({ token, appendLog, isPhoneFrame = false }: AdminCurriculumMappingProps) {
  const [curriculums, setCurriculums] = useState<ProgramCurriculum[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filter
  const [selectedProgramFilter, setSelectedProgramFilter] = useState('');

  // Form states
  const [form, setForm] = useState({
    programId: '',
    levelId: '',
    semesterId: '',
    unitId: '',
    unitType: 'Core' as 'Core' | 'Elective'
  });

  // Bulk builder form states
  const [bulkForm, setBulkForm] = useState({
    programId: '',
    levelId: '',
    semesterId: '',
    unitType: 'Core' as 'Core' | 'Elective'
  });
  const [bulkSelectedUnitIds, setBulkSelectedUnitIds] = useState<string[]>([]);
  const [bulkSearchQuery, setBulkSearchQuery] = useState('');
  const [bulkSubmitting, setBulkSubmitting] = useState(false);
  const [filterUnitsByProgram, setFilterUnitsByProgram] = useState(true);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const h = { 'Authorization': `Bearer ${token}` };
      const [currResp, progResp, levResp, semResp, unitResp] = await Promise.all([
        fetch('/api/admin/curriculums', { headers: h }),
        fetch('/api/admin/programs', { headers: h }),
        fetch('/api/admin/levels', { headers: h }),
        fetch('/api/admin/semesters', { headers: h }),
        fetch('/api/admin/units', { headers: h })
      ]);

      if (currResp.ok) setCurriculums(await currResp.json());
      if (progResp.ok) {
        const progs = await progResp.json();
        setPrograms(progs);
        if (progs.length > 0) {
          setForm(prev => ({ ...prev, programId: prev.programId || progs[0].id }));
          setBulkForm(prev => ({ ...prev, programId: prev.programId || progs[0].id }));
        }
      }
      if (levResp.ok) {
        const levs = await levResp.json();
        setLevels(levs);
        if (levs.length > 0) {
          setForm(prev => ({ ...prev, levelId: prev.levelId || levs[0].id }));
          setBulkForm(prev => ({ ...prev, levelId: prev.levelId || levs[0].id }));
        }
      }
      if (semResp.ok) {
        const sems = await semResp.json();
        setSemesters(sems);
        if (sems.length > 0) {
          setForm(prev => ({ ...prev, semesterId: prev.semesterId || sems[0].id }));
          setBulkForm(prev => ({ ...prev, semesterId: prev.semesterId || sems[0].id }));
        }
      }
      if (unitResp.ok) {
        const u = await unitResp.json();
        setUnits(u);
        if (u.length > 0 && !form.unitId) {
          setForm(prev => ({ ...prev, unitId: u[0].id }));
        }
      }
    } catch (e) {
      setError('Could not query curriculum maps from the central cluster.');
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

  const handleCreateCurriculum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.programId || !form.levelId || !form.semesterId || !form.unitId) return;
    setError(null);

    // Double check existence of record to prevent exact duplication
    const duplicate = curriculums.find(c => 
      c.programId === form.programId &&
      c.levelId === form.levelId &&
      c.semesterId === form.semesterId &&
      c.unitId === form.unitId
    );

    if (duplicate) {
      setError('This mapped curriculum connection node already exists in database.');
      return;
    }

    try {
      const resp = await fetch('/api/admin/curriculums', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(form)
      });

      const resJson = await resp.json();
      if (!resp.ok) throw new Error(resJson.error || 'Server rejected request');

      appendLog?.(`[CURRICULUM MAPPING] Set map: Unit ID "${form.unitId}" linked to program "${form.programId}" (Weight "${form.unitType}")`);
      triggerFeedback('Curriculum relationship registered successfully.');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteCurriculum = async (id: string) => {
    if (!window.confirm('Delete this curricular node connection?')) return;
    try {
      const resp = await fetch(`/api/admin/curriculums?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resp.ok) {
        appendLog?.(`[CURRICULUM MAPPING] Pruned relationship ID "${id}"`);
        triggerFeedback('Mapping node deleted.');
      } else {
        const d = await resp.json();
        setError(d.error);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Submit Bulk Student curriculum mapping
  const handleBulkMapSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkForm.programId || !bulkForm.levelId || !bulkForm.semesterId || bulkSelectedUnitIds.length === 0) {
      setError('Please select a Program, Level, Semester, and check at least one unit.');
      return;
    }
    setError(null);
    setBulkSubmitting(true);
    try {
      const resp = await fetch('/api/admin/curriculums/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          programId: bulkForm.programId,
          levelId: bulkForm.levelId,
          semesterId: bulkForm.semesterId,
          unitType: bulkForm.unitType,
          unitIds: bulkSelectedUnitIds
        })
      });

      const resJson = await resp.json();
      if (!resp.ok) throw new Error(resJson.error || 'Server rejected bulk request');

      appendLog?.(`[CURRICULUM MAPPING] Bulk-assigned ${bulkSelectedUnitIds.length} units to program "${bulkForm.programId}" (${bulkForm.unitType})`);
      triggerFeedback(resJson.message || 'Bulk curriculum mappings registered.');
      setBulkSelectedUnitIds([]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBulkSubmitting(false);
    }
  };

  const filteredUnitsForBulk = units.filter(u => {
    if (filterUnitsByProgram && bulkForm.programId && u.programId !== bulkForm.programId) {
      return false;
    }
    if (bulkSearchQuery) {
      const q = bulkSearchQuery.toLowerCase();
      return u.name.toLowerCase().includes(q) || u.code.toLowerCase().includes(q);
    }
    return true;
  });

  const handleSelectAllBulkUnits = () => {
    const list = filteredUnitsForBulk.map(u => u.id);
    setBulkSelectedUnitIds(prev => Array.from(new Set([...prev, ...list])));
  };

  const handleDeselectAllBulkUnits = () => {
    const list = filteredUnitsForBulk.map(u => u.id);
    setBulkSelectedUnitIds(prev => prev.filter(id => !list.includes(id)));
  };

  const handleToggleBulkUnit = (id: string) => {
    setBulkSelectedUnitIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(x => x !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Filter logic
  const filteredCurriculums = curriculums.filter(c => {
    if (selectedProgramFilter && c.programId !== selectedProgramFilter) return false;
    return true;
  });

  return (
    <div className={`space-y-5 ${isPhoneFrame ? 'text-xs' : 'text-sm'}`}>
      
      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-250 text-emerald-800 rounded-xl text-xs font-bold font-mono">
          {success}
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-50 border border-red-250 text-red-850 rounded-xl text-xs font-bold font-mono flex items-center gap-1.5 leading-snug">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-650" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Creation card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs h-fit space-y-4">
          <h3 className="font-extrabold text-slate-800 text-xs flex items-center gap-2 pb-2 border-b border-slate-100">
            <BookOpen className="h-4 w-4 text-indigo-600" /> Module 4: Curriculum Mapping Form
          </h3>

          <form onSubmit={handleCreateCurriculum} className="space-y-4 text-[10px]">
            <div>
              <label className="text-[9px] text-slate-400 font-bold block mb-1">Target Academic Program</label>
              <select 
                value={form.programId} 
                onChange={(e) => setForm({ ...form, programId: e.target.value })} 
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none font-bold"
                required
              >
                <option value="">-- Change Program --</option>
                {programs.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[9px] text-slate-400 font-bold block mb-1 font-sans">Syllabus Year Level</label>
              <select 
                value={form.levelId} 
                onChange={(e) => setForm({ ...form, levelId: e.target.value })} 
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none font-bold"
                required
              >
                <option value="">-- Change Year Level --</option>
                {levels.map(l => (
                  <option key={l.id} value={l.id}>{l.name} (Priority {l.order})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[9px] text-slate-400 font-bold block mb-1">Target Semester Period</label>
              <select 
                value={form.semesterId} 
                onChange={(e) => setForm({ ...form, semesterId: e.target.value })} 
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none font-bold"
                required
              >
                <option value="">-- Change Term Semester --</option>
                {semesters.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.academicYearName})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[9px] text-slate-400 font-bold block mb-1">Choose Course Unit</label>
              <select 
                value={form.unitId} 
                onChange={(e) => setForm({ ...form, unitId: e.target.value })} 
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none font-bold"
                required
              >
                <option value="">-- Choose Unit --</option>
                {units.map(u => (
                  <option key={u.id} value={u.id}>[{u.code.toUpperCase()}] {u.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[9px] text-slate-400 font-bold block mb-1">Subject Unit Type (Mandatory weight)</label>
              <select 
                value={form.unitType} 
                onChange={(e: any) => setForm({ ...form, unitType: e.target.value })} 
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none font-bold"
              >
                <option value="Core">Core (Compulsory)</option>
                <option value="Elective">Elective (Optional Choice)</option>
              </select>
            </div>

            <button 
              type="submit" 
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer font-mono"
            >
              + Create Syllabus Mapped Entry
            </button>
          </form>
        </div>

        {/* Bulk Curriculum Builder Card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs h-fit space-y-4">
          <h3 className="font-extrabold text-slate-800 text-xs flex items-center gap-2 pb-2 border-b border-slate-100">
            <Sparkles className="h-4 w-4 text-emerald-600" /> Safe Auto Curriculum Builder
          </h3>
          <p className="text-[10px] text-slate-500 leading-normal">
            Select an academic program, level, and term to bulk-assign multiple course units in a single operation.
          </p>

          <form onSubmit={handleBulkMapSubmit} className="space-y-3 text-[10px]">
            <div>
              <label className="text-[9px] text-slate-400 font-bold block mb-1">Target Academic Program</label>
              <select 
                value={bulkForm.programId} 
                onChange={(e) => {
                  setBulkForm({ ...bulkForm, programId: e.target.value });
                  setBulkSelectedUnitIds([]); // reset selection when program changes
                }} 
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none font-bold"
                required
              >
                <option value="">-- Choose Program --</option>
                {programs.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[9px] text-slate-400 font-bold block mb-1">Syllabus Level</label>
                <select 
                  value={bulkForm.levelId} 
                  onChange={(e) => setBulkForm({ ...bulkForm, levelId: e.target.value })} 
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none font-bold"
                  required
                >
                  <option value="">-- Level --</option>
                  {levels.map(l => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[9px] text-slate-400 font-bold block mb-1">Semester Period</label>
                <select 
                  value={bulkForm.semesterId} 
                  onChange={(e) => setBulkForm({ ...bulkForm, semesterId: e.target.value })} 
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none font-bold"
                  required
                >
                  <option value="">-- Term --</option>
                  {semesters.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[9px] text-slate-400 font-bold block mb-1">Assigned Unit Type</label>
              <select 
                value={bulkForm.unitType} 
                onChange={(e: any) => setBulkForm({ ...bulkForm, unitType: e.target.value })} 
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none font-bold"
              >
                <option value="Core">Core (Compulsory)</option>
                <option value="Elective">Elective (Optional)</option>
              </select>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[9px] text-slate-400 font-bold uppercase font-mono tracking-wider">Select Course Units ({bulkSelectedUnitIds.length})</span>
                <button
                  type="button"
                  onClick={() => setFilterUnitsByProgram(!filterUnitsByProgram)}
                  className={`px-1.5 py-0.5 rounded text-[8px] font-bold border transition-colors ${
                    filterUnitsByProgram 
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                      : 'bg-white border-slate-200 text-slate-500'
                  }`}
                >
                  {filterUnitsByProgram ? 'Filtered to Program' : 'Show All Units'}
                </button>
              </div>

              {/* Search Course Units */}
              <input
                type="text"
                placeholder="Search unit by code or name..."
                value={bulkSearchQuery}
                onChange={(e) => setBulkSearchQuery(e.target.value)}
                className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[9px] font-bold text-slate-700 mb-2"
              />

              {/* Select All / Deselect All Controls */}
              <div className="flex items-center gap-2 mb-2">
                <button
                  type="button"
                  onClick={handleSelectAllBulkUnits}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded text-[8px] font-bold text-slate-600 transition-colors"
                >
                  Select All Visible
                </button>
                <button
                  type="button"
                  onClick={handleDeselectAllBulkUnits}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded text-[8px] font-bold text-slate-600 transition-colors"
                >
                  Clear All Visible
                </button>
              </div>

              {/* Units List Container */}
              <div className="max-h-[160px] overflow-y-auto border border-slate-150 rounded-xl p-2 space-y-1.5 bg-slate-50">
                {filteredUnitsForBulk.length === 0 ? (
                  <p className="text-center text-slate-400 py-4 font-mono text-[9px]">No units match your selection filter.</p>
                ) : (
                  filteredUnitsForBulk.map(u => {
                    const isChecked = bulkSelectedUnitIds.includes(u.id);
                    return (
                      <div 
                        key={u.id}
                        onClick={() => handleToggleBulkUnit(u.id)}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer flex gap-1.5 items-center ${
                          isChecked 
                            ? 'bg-emerald-50 border-emerald-250 text-emerald-950 font-bold' 
                            : 'bg-white border-slate-150 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // handled by click container
                          className="h-3 w-3 accent-emerald-600 rounded cursor-pointer animate-none"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-[9px] truncate tracking-tight">
                            <span className="font-mono text-[8px] font-extrabold bg-slate-200 text-slate-700 px-1 py-0.2 rounded mr-1">
                              {u.code.toUpperCase()}
                            </span>
                            {u.name}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <button 
              type="submit" 
              disabled={bulkSubmitting}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer font-mono flex items-center justify-center gap-1 shadow-xs"
            >
              {bulkSubmitting ? 'Generating...' : <><Sparkles className="h-3.5 w-3.5" /> Bulk-Map Syllabus Units</>}
            </button>
          </form>
        </div>

        {/* Dynamic Matrix List */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs xl:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-slate-800 text-xs">Active Curriculum Layout</h3>
              <p className="text-[9px] text-slate-450 font-mono mt-0.5">Academic course blueprint hierarchy</p>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <Filter className="h-3 w-3 text-slate-400" />
              <select 
                value={selectedProgramFilter} 
                onChange={(e) => setSelectedProgramFilter(e.target.value)}
                className="text-[10px] font-bold p-1 px-2 border border-slate-250 bg-slate-50 rounded-lg text-slate-700"
              >
                <option value="">Show All Programs</option>
                {programs.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          {filteredCurriculums.length === 0 ? (
            <div className="p-8 text-center text-slate-400 font-mono text-[10px] bg-slate-50 rounded-2xl border border-slate-150">
              No matching program curriculum configurations located in database.
            </div>
          ) : (
            <div className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1">
              {filteredCurriculums.map((curr) => (
                <div key={curr.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-150 hover:border-slate-300 transition-all text-[11px] flex justify-between items-center">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-mono text-[9px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-150 px-1 py-0.2 rounded">
                        {curr.unitCode}
                      </span>
                      <span className={`text-[8px] px-1.5 rounded font-black uppercase text-center ${
                        curr.unitType === 'Core' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {curr.unitType}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono">{curr.semesterName}</span>
                    </div>

                    <h4 className="font-extrabold text-slate-850 text-xs">{curr.unitName}</h4>
                    
                    <div className="text-[9px] text-slate-400 space-y-0.5 pt-1 border-t border-slate-150/50 mt-1 font-mono">
                      <p><strong className="text-slate-500 font-sans">Program:</strong> {curr.programName}</p>
                      <p><strong className="text-slate-500 font-sans">Level Year:</strong> {curr.levelName}</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleDeleteCurriculum(curr.id)}
                    className="p-1 px-1.5 text-rose-650 bg-rose-50 border border-rose-100 rounded-lg hover:bg-rose-150 transition-colors shadow-xs shrink-0 cursor-pointer"
                    title="Delete record"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
