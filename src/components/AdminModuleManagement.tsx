import React, { useState, useEffect } from 'react';
import { ToggleLeft, Save } from 'lucide-react';

export default function AdminModuleManagement({ token, appendLog }: { token: string, appendLog?: (msg: string) => void }) {
  const [modules, setModules] = useState<Record<string, boolean>>({});
  const [hierarchy, setHierarchy] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const moduleNames: Record<string, string> = {
    academicPeriods: 'Academic Periods',
    curriculumMapping: 'Curriculum Mapping',
    courseRegistration: 'Course Registration',
    lecturerAllocation: 'Lecturer Allocation',
    classGroups: 'Class Groups',
    timetableEngine: 'Timetable Engine',
    libraries: 'Libraries',
    researchPublications: 'Research/Publications',
    hostels: 'Hostel Management',
    transport: 'Transport',
    welfareSupport: 'Welfare Support',
    hrPayroll: 'HR & Payroll',
    procurementInventory: 'Procurement/Inventory'
  };

  useEffect(() => {
    fetch('/api/admin/modules', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { setModules(data.modules); setHierarchy(data.hierarchy); setLoading(false); });
  }, [token]);

  const toggleModule = (key: string) => {
    setModules(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const saveConfiguration = async () => {
    await fetch('/api/admin/modules', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ modules, hierarchy })
    });
    appendLog?.('[SYSTEM] Module and Hierarchy configuration updated.');
  };

  if (loading) return <div>Loading configuration...</div>;

  return (
    <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-8">
      <h2 className="text-xl font-bold text-slate-800">Module Activation Center</h2>
      
      <div>
        <h3 className="text-lg font-semibold mb-4 text-slate-700">Module Activation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.keys(moduleNames).map(key => (
            <div key={key} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
              <span className="font-semibold text-slate-700">{moduleNames[key]}</span>
              <button
                onClick={() => toggleModule(key)}
                className={`p-2 rounded-full ${modules[key] ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-500'}`}
              >
                <ToggleLeft className="w-6 h-6" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4 text-slate-700">Academic Hierarchy</h3>
        <textarea
          value={hierarchy.join(', ')}
          onChange={(e) => setHierarchy(e.target.value.split(',').map(s => s.trim()))}
          className="w-full p-4 border border-slate-200 rounded-xl font-mono text-sm"
          rows={3}
        />
        <p className="text-xs text-slate-500 mt-2">Comma separated hierarchy levels (e.g. University, Faculty, Department, Program, Cohort, Unit)</p>
      </div>

      <button
        onClick={saveConfiguration}
        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold cursor-pointer hover:bg-indigo-700"
      >
        <Save className="w-5 h-5" /> Save Configuration
      </button>
    </div>
  );
}
