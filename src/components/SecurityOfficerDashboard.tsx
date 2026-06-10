/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Shield, Users, AlertTriangle, Home, LogOut, RefreshCw, MessageSquare, User, Plus, CheckCircle } from 'lucide-react';
import CommunicationsHub from './CommunicationsHub';
import ProfilePage from './ProfilePage';

interface Props { token: string; user: any; onLogout: () => void; appendLog?: (msg: string) => void; }

export default function SecurityOfficerDashboard({ token, user, onLogout, appendLog }: Props) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'visitors' | 'hostel' | 'incidents' | 'communications' | 'profile'>('dashboard');
  const [visitors, setVisitors] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Visitor form
  const [visitorForm, setVisitorForm] = useState({ visitorName: '', visitorPhone: '', hostStudentName: '', purpose: '' });
  const [savingVisitor, setSavingVisitor] = useState(false);
  const [visitorSuccess, setVisitorSuccess] = useState(false);

  // Incident form
  const [incidentForm, setIncidentForm] = useState({ incidentType: '', description: '', location: '' });
  const [savingIncident, setSavingIncident] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [visRes, incRes] = await Promise.all([
          fetch('/api/security/visitors', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/security/incidents', { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        if (visRes.ok) { const d = await visRes.json(); setVisitors(Array.isArray(d) ? d : d.visitors || []); }
        if (incRes.ok) { const d = await incRes.json(); setIncidents(Array.isArray(d) ? d : d.incidents || []); }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    load();
  }, [token, refreshTrigger]);

  const todayVisitors = visitors.filter(v => v.checkInTime?.startsWith(new Date().toISOString().split('T')[0]));
  const openIncidents = incidents.filter(i => i.status === 'open' || i.status === 'investigating');

  const handleLogVisitor = async () => {
    if (!visitorForm.visitorName || !visitorForm.purpose) return;
    setSavingVisitor(true);
    try {
      const res = await fetch('/api/security/visitors', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...visitorForm, checkInTime: new Date().toISOString() })
      });
      if (res.ok) {
        setVisitorForm({ visitorName: '', visitorPhone: '', hostStudentName: '', purpose: '' });
        setVisitorSuccess(true);
        setTimeout(() => setVisitorSuccess(false), 3000);
        setRefreshTrigger(r => r + 1);
      }
    } catch (e) { console.error(e); }
    finally { setSavingVisitor(false); }
  };

  const handleCheckOut = async (id: string) => {
    await fetch(`/api/security/visitors/${id}/checkout`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ checkOutTime: new Date().toISOString() })
    });
    setRefreshTrigger(r => r + 1);
  };

  const handleLogIncident = async () => {
    if (!incidentForm.incidentType || !incidentForm.description) return;
    setSavingIncident(true);
    try {
      await fetch('/api/security/incidents', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...incidentForm, incidentDate: new Date().toISOString(), status: 'open', reportedBy: user?.name })
      });
      setIncidentForm({ incidentType: '', description: '', location: '' });
      setRefreshTrigger(r => r + 1);
    } catch (e) { console.error(e); }
    finally { setSavingIncident(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      <div className="w-56 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-800 dark:bg-slate-600 flex items-center justify-center text-white text-xs font-bold">S</div>
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">Security Officer</p>
              <p className="text-[10px] text-slate-500 truncate">{user?.name}</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-2 space-y-0.5">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Shield },
            { id: 'visitors', label: 'Visitor Log', icon: Users },
            { id: 'hostel', label: 'Hostel Access', icon: Home },
            { id: 'incidents', label: 'Incidents', icon: AlertTriangle },
            { id: 'communications', label: 'Messages', icon: MessageSquare },
            { id: 'profile', label: 'Profile', icon: User },
          ].map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id as any)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${activeTab === id ? 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-100' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700'}`}>
              <Icon className="w-4 h-4" />{label}
            </button>
          ))}
        </nav>
        <div className="p-2 border-t border-slate-200 dark:border-slate-700">
          <button onClick={onLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'dashboard' && (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Security Dashboard</h1>
              <button onClick={() => setRefreshTrigger(r => r + 1)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"><RefreshCw className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Visitors Today", value: todayVisitors.length, color: 'bg-blue-50 border-blue-200 text-blue-700' },
                { label: "Open Incidents", value: openIncidents.length, color: 'bg-red-50 border-red-200 text-red-700' },
                { label: "Total Visitors (All)", value: visitors.length, color: 'bg-slate-50 border-slate-200 text-slate-700' },
              ].map(({ label, value, color }) => (
                <div key={label} className={`p-4 rounded-xl border ${color} dark:bg-slate-800 dark:border-slate-700`}>
                  <p className="text-xs font-medium mb-1">{label}</p>
                  <p className="text-2xl font-bold">{loading ? '—' : value}</p>
                </div>
              ))}
            </div>

            {/* Quick log visitor */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2"><Plus className="w-4 h-4" />Log Visitor</h2>
              {visitorSuccess && <div className="flex items-center gap-2 text-green-600 text-xs"><CheckCircle className="w-4 h-4" />Visitor logged successfully</div>}
              <div className="grid grid-cols-2 gap-3">
                <input value={visitorForm.visitorName} onChange={e => setVisitorForm(f => ({ ...f, visitorName: e.target.value }))}
                  placeholder="Visitor name *" className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500" />
                <input value={visitorForm.visitorPhone} onChange={e => setVisitorForm(f => ({ ...f, visitorPhone: e.target.value }))}
                  placeholder="Phone number" className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500" />
                <input value={visitorForm.hostStudentName} onChange={e => setVisitorForm(f => ({ ...f, hostStudentName: e.target.value }))}
                  placeholder="Host student name" className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500" />
                <input value={visitorForm.purpose} onChange={e => setVisitorForm(f => ({ ...f, purpose: e.target.value }))}
                  placeholder="Purpose of visit *" className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500" />
              </div>
              <button onClick={handleLogVisitor} disabled={savingVisitor || !visitorForm.visitorName || !visitorForm.purpose}
                className="px-4 py-2 bg-slate-800 dark:bg-slate-600 text-white text-xs font-semibold rounded-lg hover:bg-slate-700 disabled:opacity-50">
                {savingVisitor ? 'Logging...' : 'Check In Visitor'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'visitors' && (
          <div className="p-6 space-y-4">
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Visitor Log</h1>
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-700">
                  <tr>{['Visitor', 'Host', 'Purpose', 'Check In', 'Check Out'].map(h => <th key={h} className="text-left px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {visitors.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400 text-sm">No visitors logged</td></tr>
                  ) : visitors.map(v => (
                    <tr key={v.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <td className="px-4 py-2.5 font-medium text-slate-800 dark:text-slate-100">{v.visitorName}<br/><span className="text-[10px] text-slate-500">{v.visitorPhone}</span></td>
                      <td className="px-4 py-2.5 text-slate-500">{v.hostStudentName || '—'}</td>
                      <td className="px-4 py-2.5 text-slate-500">{v.purpose}</td>
                      <td className="px-4 py-2.5 text-slate-500 text-xs">{v.checkInTime ? new Date(v.checkInTime).toLocaleTimeString() : '—'}</td>
                      <td className="px-4 py-2.5">
                        {v.checkOutTime ? (
                          <span className="text-xs text-slate-500">{new Date(v.checkOutTime).toLocaleTimeString()}</span>
                        ) : (
                          <button onClick={() => handleCheckOut(v.id)} className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 border border-green-200">Check Out</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'incidents' && (
          <div className="p-6 space-y-4">
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Incident Reports</h1>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Report New Incident</h3>
              <div className="grid grid-cols-2 gap-3">
                <input value={incidentForm.incidentType} onChange={e => setIncidentForm(f => ({ ...f, incidentType: e.target.value }))}
                  placeholder="Incident type *" className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500" />
                <input value={incidentForm.location} onChange={e => setIncidentForm(f => ({ ...f, location: e.target.value }))}
                  placeholder="Location" className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500" />
              </div>
              <textarea value={incidentForm.description} onChange={e => setIncidentForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Description *" rows={2}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 resize-none" />
              <button onClick={handleLogIncident} disabled={savingIncident || !incidentForm.incidentType || !incidentForm.description}
                className="px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50">
                {savingIncident ? 'Reporting...' : 'Report Incident'}
              </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {incidents.length === 0 ? <div className="p-8 text-center text-slate-400 text-sm">No incidents reported</div>
                  : incidents.map(i => (
                    <div key={i.id} className="px-4 py-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{i.incidentType}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{i.location} · {i.incidentDate ? new Date(i.incidentDate).toLocaleDateString() : '—'}</p>
                          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{i.description}</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${i.status === 'resolved' ? 'bg-green-100 text-green-700' : i.status === 'investigating' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{i.status}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'hostel' && (
          <div className="p-6 space-y-4">
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Hostel Access</h1>
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 text-center text-slate-400 text-sm">
              <Home className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>Hostel occupancy and bed allocation data</p>
              <p className="text-xs mt-1">Full hostel management is in School Admin → Campus Life</p>
            </div>
          </div>
        )}

        {activeTab === 'communications' && <CommunicationsHub token={token} user={user} isPhoneFrame={false} />}
        {activeTab === 'profile' && <ProfilePage token={token} user={user} onBack={() => setActiveTab('dashboard')} />}
      </div>
    </div>
  );
}
