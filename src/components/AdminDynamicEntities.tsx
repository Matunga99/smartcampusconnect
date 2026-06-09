import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useTerminology } from '../hooks/useTerminology';

export default function AdminDynamicEntities({ token, hierarchy, appendLog }: { token: string, hierarchy: string[], appendLog?: (msg: string) => void }) {
  const { getTerm, loading } = useTerminology(token);
  const [entities, setEntities] = useState<Record<string, any[]>>({});
  const [newEntity, setNewEntity] = useState({ type: '', name: '' });

  useEffect(() => {
    hierarchy.forEach(h => {
      fetch(`/api/admin/custom-entities/${h}`, { headers: { 'Authorization': `Bearer ${token}` } })
        .then(r => r.json())
        .then(data => setEntities(prev => ({ ...prev, [h]: data })));
    });
  }, [hierarchy, token]);

  const addEntity = async () => {
    await fetch('/api/admin/custom-entities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(newEntity)
    });
    setNewEntity({ type: '', name: '' });
    appendLog?.(`[SYSTEM] Entity created: ${newEntity.name}`);
    window.location.reload();
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-6">
      <h2 className="text-xl font-bold text-slate-800">Academic Structure Manager</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {hierarchy.map(h => (
          <div key={h} className="p-4 border rounded-xl bg-slate-50">
            <h3 className="font-bold text-slate-700 mb-2">{getTerm(h)}s</h3>
            <div className="space-y-2">
                {(entities[h] || []).map(e => <div key={e.id} className="p-2 bg-white border rounded text-xs">{e.name}</div>)}
            </div>
          </div>
        ))}
      </div>
      <div className="pt-6 border-t flex gap-4">
        <select value={newEntity.type} onChange={e => setNewEntity({...newEntity, type: e.target.value})} className="p-2 border rounded">
            <option value="">Select Level</option>
            {hierarchy.map(h => <option key={h} value={h}>{getTerm(h)}</option>)}
        </select>
        <input placeholder="Name" value={newEntity.name} onChange={e => setNewEntity({...newEntity, name: e.target.value})} className="p-2 border rounded" />
        <button onClick={addEntity} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg"><Plus/> Add</button>
      </div>
    </div>
  );
}
