import React, { useState, useEffect } from 'react';
import { ChevronRight, Save, Check } from 'lucide-react';

export default function InstitutionWizard({ token, appendLog, onComplete }: { token: string, appendLog?: (msg: string) => void, onComplete: () => void }) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({ name: '', institutionType: '', modules: {} as Record<string, boolean>, hierarchy: [] as string[], branding: { primaryColor: '#4f46e5' } });
  const [templates, setTemplates] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/admin/templates', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json())
      .then(setTemplates);
  }, [token]);

  const createInstitution = async () => {
    await fetch('/api/superadmin/institutions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data)
    });
    appendLog?.(`[SYSTEM] Institution created: ${data.name}`);
    onComplete();
  };

  return (
    <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-6">
      <h2 className="text-xl font-bold text-slate-800">Institution Creation Wizard - Step {step}/6</h2>
      
      {step === 1 && (
        <div className="space-y-4">
          <label className="block text-sm font-medium">Institution Name</label>
          <input className="w-full p-2 border rounded" value={data.name} onChange={e => setData({...data, name: e.target.value})} />
        </div>
      )}
      {step === 2 && (
        <div className="grid grid-cols-2 gap-4">
          {templates.map(t => <button key={t.institutionType} onClick={() => setData({...data, institutionType: t.institutionType, modules: t.modules, hierarchy: t.hierarchy})} className={`p-4 border rounded ${data.institutionType === t.institutionType ? 'bg-indigo-100 border-indigo-500' : ''}`}>{t.name}</button>)}
        </div>
      )}
      {step === 3 && (
        <div className="grid grid-cols-2 gap-2">
           {Object.keys(data.modules).map(m => (
             <label key={m} className="flex items-center gap-2 p-2 border rounded">
              <input type="checkbox" checked={data.modules[m]} onChange={e => setData({...data, modules: {...data.modules, [m]: e.target.checked}})} />
              {m}
             </label>
           ))}
        </div>
      )}
      {step === 4 && (
        <div className="space-y-4">
          <label className="block text-sm font-medium">Primary Theme Color</label>
          <input type="color" value={data.branding.primaryColor} onChange={e => setData({...data, branding: {...data.branding, primaryColor: e.target.value}})} />
        </div>
      )}
      {step === 5 && (
        <div className="space-y-4">
          <label className="block text-sm font-medium">Academic Hierarchy (comma separated)</label>
          <textarea className="w-full p-2 border rounded" value={data.hierarchy.join(', ')} onChange={e => setData({...data, hierarchy: e.target.value.split(',').map(s => s.trim())})} />
        </div>
      )}
      {step === 6 && (
        <div className="p-4 bg-slate-50 border rounded-lg">
          <h3 className="font-bold">Review Creation</h3>
          <pre className="text-xs">{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
      
      <div className="flex justify-between pt-6 border-t">
        <button disabled={step === 1} onClick={() => setStep(step - 1)} className="px-4 py-2 bg-slate-200 rounded">Back</button>
        {step < 6 ? 
            <button onClick={() => setStep(step + 1)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded">Next <ChevronRight /></button> :
            <button onClick={createInstitution} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded">Create <Check /></button> 
        }
      </div>
    </div>
  );
}
