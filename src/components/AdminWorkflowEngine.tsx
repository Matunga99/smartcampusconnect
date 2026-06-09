import React, { useState, useEffect } from 'react';
import { Plus, Play, AlertCircle, CheckCircle2, RotateCcw } from 'lucide-react';

export default function AdminWorkflowEngine({ token }: { token: string }) {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [eventQueue, setEventQueue] = useState<any[]>([]);
  const [newWorkflow, setNewWorkflow] = useState({ name: '', trigger: { type: 'STUDENT_CREATED' }, actions: [{ type: 'SEND_NOTIFICATION', params: { message: 'New Student!' } }] });

  useEffect(() => {
    fetch('/api/admin/workflows', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()).then(setWorkflows);
    // Assuming backend exposes this
    fetch('/api/admin/event_queue', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()).then(setEventQueue);
  }, [token]);

  const addWorkflow = async () => { /* ... */ };

  return (
    <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-6">
      <h2 className="text-xl font-bold">Automation & Event Reliability Engine</h2>
      
      {/* Event Observability Section */}
      <div>
        <h3 className="font-bold mb-4">Event Reliability Dashboard</h3>
        <div className="space-y-2">
            {eventQueue.map(evt => (
                <div key={evt.id} className="p-3 border rounded-lg flex items-center gap-4 text-xs">
                    {evt.status === 'failed' ? <AlertCircle className="text-red-500 w-4 h-4"/> : <CheckCircle2 className="text-green-500 w-4 h-4"/>}
                    <div className="flex-1">
                        <span className="font-bold">{evt.type}</span> - {evt.status} (Retries: {evt.retries})
                    </div>
                    {evt.status === 'failed' && <RotateCcw className="w-4 h-4 text-indigo-500 cursor-pointer"/>}
                </div>
            ))}
        </div>
      </div>
      
      {/* Workflow Section */}
      {/* ... */}
      <div className="space-y-4">
        {workflows.map(wf => (
          <div key={wf.id} className="p-4 border rounded-xl flex justify-between items-center">
            <div>
              <h4 className="font-bold">{wf.name}</h4>
              <p className="text-xs text-slate-500">Trigger: {wf.trigger.type}</p>
            </div>
            <span className={`px-2 py-1 rounded text-xs ${wf.enabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{wf.enabled ? 'Enabled' : 'Disabled'}</span>
          </div>
        ))}
      </div>
      <div className="pt-6 border-t space-y-4">
        <input placeholder="Workflow Name" value={newWorkflow.name} onChange={e => setNewWorkflow({...newWorkflow, name: e.target.value})} className="p-2 border rounded w-full" />
        <button onClick={addWorkflow} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg"><Plus/> Create Workflow</button>
      </div>
    </div>
  );
}
