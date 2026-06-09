import React, { useState, useEffect } from 'react';
import { BookOpen, CheckCircle } from 'lucide-react';

export default function AdminTemplateLibrary({ token, appendLog }: { token: string, appendLog?: (msg: string) => void }) {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/templates', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { setTemplates(data); setLoading(false); });
  }, [token]);

  const applyTemplate = async (institutionType: string) => {
    await fetch('/api/admin/templates/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ institutionType })
    });
    appendLog?.(`[SYSTEM] Template applied: ${institutionType}`);
    window.location.reload();
  };

  if (loading) return <div>Loading templates...</div>;

  return (
    <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs">
      <h2 className="text-xl font-bold mb-6 text-slate-800">Template Library</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {templates.map(t => (
          <div key={t.institutionType} className="p-5 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
            <h3 className="font-bold text-slate-800">{t.name}</h3>
            <p className="text-sm text-slate-600">Hierarchy: {t.hierarchy.join(' > ')}</p>
            <button
              onClick={() => applyTemplate(t.institutionType)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700"
            >
              <CheckCircle className="w-4 h-4" /> Apply Template
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
