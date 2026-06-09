import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronRight, Zap, CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function EventVisualizer({ token }: { token: string }) {
  const [chains, setChains] = useState<Record<string, any[]>>({});

  useEffect(() => {
    fetch('/api/admin/event_queue', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json())
      .then(events => {
        const grouped = (events as any[]).reduce((acc: any, event: any) => {
          if (!acc[event.correlationId]) acc[event.correlationId] = [];
          acc[event.correlationId].push(event);
          return acc;
        }, {});
        setChains(grouped);
      });
  }, [token]);

  return (
    <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-6">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <Zap className="text-indigo-600" />
        System Event Traceability
      </h2>
      
      <div className="space-y-4">
        {Object.entries(chains).map(([corrId, events]) => (
          <div key={corrId} className="p-4 border rounded-xl bg-slate-50">
            <h4 className="text-xs font-bold text-slate-500 mb-3 font-mono">Chain: {corrId}</h4>
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {(events as any[]).sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()).map((evt, i) => (
                <React.Fragment key={evt.id}>
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-3 rounded-lg border text-[10px] min-w-[120px] ${
                        evt.status === 'completed' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="font-bold">{evt.type}</div>
                    <div className="flex items-center gap-1 opacity-70">
                      {evt.status === 'completed' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3"/>}
                      {evt.status}
                    </div>
                  </motion.div>
                  {i < (events as any[]).length - 1 && <ChevronRight className="text-slate-300 w-4 h-4" />}
                </React.Fragment>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
