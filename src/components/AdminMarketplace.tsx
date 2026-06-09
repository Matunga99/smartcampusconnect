import React, { useState, useEffect } from 'react';
import { Package, Download } from 'lucide-react';

export default function AdminMarketplace({ token }: { token: string }) {
  const [apps, setApps] = useState<any[]>([]);
  const [installed, setInstalled] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/admin/marketplace', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()).then(setApps);
    fetch('/api/admin/installed-apps', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()).then(data => setInstalled(data.map((i: any) => i.appId)));
  }, [token]);

  const installApp = async (appId: string) => {
    await fetch('/api/admin/install-app', { method: 'POST', body: JSON.stringify({ appId }), headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } });
    setInstalled([...installed, appId]);
  };

  return (
    <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-6">
      <h2 className="text-xl font-bold">SmartCampus Marketplace</h2>
      <div className="grid grid-cols-2 gap-4">
        {apps.map(app => (
          <div key={app.id} className="p-4 border rounded-xl flex justify-between items-center">
            <div>
              <h4 className="font-bold">{app.name}</h4>
              <p className="text-xs text-slate-500">{app.description}</p>
            </div>
            {installed.includes(app.id) ? 
              <span className="text-green-600 text-xs font-bold">Installed</span> :
              <button onClick={() => installApp(app.id)} className="p-2 bg-indigo-600 text-white rounded"><Download size={16} /></button>
            }
          </div>
        ))}
      </div>
    </div>
  );
}
