/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, Calendar, Briefcase, Users, LogOut, RefreshCw, MessageSquare, Edit3, Check, X } from 'lucide-react';
import CommunicationsHub from './CommunicationsHub';
import ProfilePage from './ProfilePage';

interface Props { token: string; user: any; onLogout: () => void; appendLog?: (msg: string) => void; }

export default function AlumniDashboard({ token, user, onLogout, appendLog }: Props) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'profile' | 'events' | 'jobs' | 'network' | 'communications'>('dashboard');
  const [alumniProfile, setAlumniProfile] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [network, setNetwork] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Profile edit
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ currentEmployer: '', location: '', linkedinUrl: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [profileRes, eventsRes, jobsRes, networkRes] = await Promise.all([
          fetch('/api/alumni/me', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/alumni/events', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/alumni/jobs', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/alumni/network', { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        if (profileRes.ok) {
          const p = await profileRes.json();
          setAlumniProfile(p);
          setEditForm({ currentEmployer: p.currentEmployer || '', location: p.location || '', linkedinUrl: p.linkedinUrl || '' });
        }
        if (eventsRes.ok) { const d = await eventsRes.json(); setEvents(Array.isArray(d) ? d : d.events || []); }
        if (jobsRes.ok) { const d = await jobsRes.json(); setJobs(Array.isArray(d) ? d : d.jobs || []); }
        if (networkRes.ok) { const d = await networkRes.json(); setNetwork(Array.isArray(d) ? d : d.connections || []); }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    load();
  }, [token, refreshTrigger]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/alumni/me', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        const updated = await res.json();
        setAlumniProfile(updated);
        setEditing(false);
        appendLog?.('[Alumni] Profile updated');
      }
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleRSVP = async (eventId: string, status: 'attending' | 'declined') => {
    await fetch(`/api/alumni/events/${eventId}/rsvp`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    setRefreshTrigger(r => r + 1);
  };

  const upcomingEvents = events.filter(e => new Date(e.date) >= new Date());

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      <div className="w-56 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">Alumni</p>
              <p className="text-[10px] text-slate-500 truncate">{user?.name}</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-2 space-y-0.5">
          {[
            { id: 'dashboard', label: 'Home', icon: User },
            { id: 'profile', label: 'My Profile', icon: Edit3 },
            { id: 'events', label: 'Events', icon: Calendar },
            { id: 'jobs', label: 'Job Board', icon: Briefcase },
            { id: 'network', label: 'Network', icon: Users },
            { id: 'communications', label: 'Messages', icon: MessageSquare },
          ].map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id as any)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${activeTab === id ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700'}`}>
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
              <div>
                <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Welcome back, {user?.name?.split(' ')[0]}!</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  {alumniProfile ? `Class of ${alumniProfile.graduationYear} · ${alumniProfile.programName}` : 'Alumni Portal'}
                </p>
              </div>
              <button onClick={() => setRefreshTrigger(r => r + 1)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"><RefreshCw className="w-4 h-4" /></button>
            </div>

            {/* Alumni profile card */}
            {alumniProfile && (
              <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl p-5 text-white">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold">
                    {alumniProfile.currentEmployer?.charAt(0) || user?.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold">{user?.name}</p>
                    <p className="text-sm text-purple-200">{alumniProfile.currentEmployer || 'Not specified'}</p>
                    <p className="text-xs text-purple-300 mt-0.5">{alumniProfile.location || 'Location not set'}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                <p className="text-xs text-slate-500 mb-1">Upcoming Events</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{loading ? '—' : upcomingEvents.length}</p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                <p className="text-xs text-slate-500 mb-1">Open Jobs</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{loading ? '—' : jobs.length}</p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                <p className="text-xs text-slate-500 mb-1">Connections</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{loading ? '—' : network.length}</p>
              </div>
            </div>

            {/* Upcoming events preview */}
            {upcomingEvents.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                  <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Upcoming Events</h2>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                  {upcomingEvents.slice(0, 3).map(e => {
                    const myRsvp = e.rsvps?.find((r: any) => r.userId === user?.id);
                    return (
                      <div key={e.id} className="flex items-center justify-between px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{e.title}</p>
                          <p className="text-xs text-slate-500">{new Date(e.date).toLocaleDateString()} · {e.location}</p>
                        </div>
                        {myRsvp ? (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${myRsvp.status === 'attending' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{myRsvp.status}</span>
                        ) : (
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleRSVP(e.id, 'attending')} className="text-xs px-2 py-1 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100">Attend</button>
                            <button onClick={() => handleRSVP(e.id, 'declined')} className="text-xs px-2 py-1 bg-slate-50 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-100">Decline</button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">My Alumni Profile</h1>
              {!editing && (
                <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                  <Edit3 className="w-3.5 h-3.5" />Edit
                </button>
              )}
            </div>
            {alumniProfile ? (
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><p className="text-xs text-slate-500 mb-0.5">Graduation Year</p><p className="font-medium text-slate-800 dark:text-slate-100">{alumniProfile.graduationYear}</p></div>
                  <div><p className="text-xs text-slate-500 mb-0.5">Program</p><p className="font-medium text-slate-800 dark:text-slate-100">{alumniProfile.programName}</p></div>
                  <div><p className="text-xs text-slate-500 mb-0.5">Email</p><p className="font-medium text-slate-800 dark:text-slate-100">{alumniProfile.email}</p></div>
                </div>

                {editing ? (
                  <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                    <input value={editForm.currentEmployer} onChange={e => setEditForm(f => ({ ...f, currentEmployer: e.target.value }))}
                      placeholder="Current employer" className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                    <input value={editForm.location} onChange={e => setEditForm(f => ({ ...f, location: e.target.value }))}
                      placeholder="City, Country" className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                    <input value={editForm.linkedinUrl} onChange={e => setEditForm(f => ({ ...f, linkedinUrl: e.target.value }))}
                      placeholder="LinkedIn URL" className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                    <div className="flex gap-2">
                      <button onClick={handleSaveProfile} disabled={saving}
                        className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white text-xs font-semibold rounded-lg hover:bg-purple-700 disabled:opacity-50">
                        <Check className="w-3.5 h-3.5" />{saving ? 'Saving...' : 'Save'}
                      </button>
                      <button onClick={() => setEditing(false)} className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200">
                        <X className="w-3.5 h-3.5" />Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 text-sm pt-3 border-t border-slate-200 dark:border-slate-700">
                    <div><p className="text-xs text-slate-500 mb-0.5">Current Employer</p><p className="font-medium text-slate-800 dark:text-slate-100">{alumniProfile.currentEmployer || 'Not set'}</p></div>
                    <div><p className="text-xs text-slate-500 mb-0.5">Location</p><p className="font-medium text-slate-800 dark:text-slate-100">{alumniProfile.location || 'Not set'}</p></div>
                    <div><p className="text-xs text-slate-500 mb-0.5">LinkedIn</p>
                      {alumniProfile.linkedinUrl ? <a href={alumniProfile.linkedinUrl} target="_blank" rel="noreferrer" className="text-purple-600 text-sm hover:underline">View Profile</a> : <p className="text-slate-400 text-sm">Not set</p>}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-xl border p-8 text-center text-slate-400 text-sm">Loading profile...</div>
            )}
          </div>
        )}

        {activeTab === 'events' && (
          <div className="p-6 space-y-4">
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Alumni Events</h1>
            <div className="space-y-3">
              {events.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-xl border p-8 text-center text-slate-400 text-sm">No events scheduled</div>
              ) : events.map(e => {
                const myRsvp = e.rsvps?.find((r: any) => r.userId === user?.id);
                const attendingCount = e.rsvps?.filter((r: any) => r.status === 'attending').length || 0;
                return (
                  <div key={e.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{e.title}</h3>
                        <p className="text-xs text-slate-500 mt-1">{new Date(e.date).toLocaleDateString()} · {e.location}</p>
                        {e.description && <p className="text-xs text-slate-400 mt-1">{e.description}</p>}
                        <p className="text-xs text-slate-400 mt-1">{attendingCount} attending · Capacity: {e.capacity}</p>
                      </div>
                      <div>
                        {myRsvp ? (
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${myRsvp.status === 'attending' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{myRsvp.status}</span>
                        ) : (
                          <div className="flex flex-col gap-1">
                            <button onClick={() => handleRSVP(e.id, 'attending')} className="text-xs px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700">Attend</button>
                            <button onClick={() => handleRSVP(e.id, 'declined')} className="text-xs px-3 py-1 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200">Decline</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'jobs' && (
          <div className="p-6 space-y-4">
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Job Board</h1>
            <div className="space-y-3">
              {jobs.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-xl border p-8 text-center text-slate-400 text-sm">No job postings yet</div>
              ) : jobs.map(j => (
                <div key={j.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{j.title}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{j.company} · {j.location}</p>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{j.description}</p>
                      <p className="text-xs text-slate-400 mt-1">Deadline: {j.deadline ? new Date(j.deadline).toLocaleDateString() : '—'}</p>
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Open</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'network' && (
          <div className="p-6 space-y-4">
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">My Network</h1>
            {network.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-xl border p-8 text-center text-slate-400 text-sm">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p>Your cohort connections will appear here</p>
                <p className="text-xs mt-1">Alumni from your graduation year and program</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {network.map((n: any) => (
                  <div key={n.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-purple-600 text-xs font-bold">{n.name?.charAt(0)}</div>
                      <div>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{n.name}</p>
                        <p className="text-xs text-slate-500">{n.currentEmployer || 'No employer'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'communications' && <CommunicationsHub user={user} />}
      </div>
    </div>
  );
}
