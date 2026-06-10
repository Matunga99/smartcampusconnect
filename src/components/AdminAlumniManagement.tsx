/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Users, Calendar, Briefcase, Heart, Plus, Search, RefreshCw,
  CheckCircle, XCircle, Clock, ExternalLink, Download, Mail,
  MapPin, Building2, GraduationCap, AlertCircle, Edit3, Eye
} from 'lucide-react';

interface AdminAlumniManagementProps {
  token: string;
  appendLog?: (msg: string) => void;
}

export default function AdminAlumniManagement({ token, appendLog }: AdminAlumniManagementProps) {
  const [activeTab, setActiveTab] = useState<'directory' | 'events' | 'donations' | 'jobs'>('directory');
  const [alumni, setAlumni] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [donations, setDonations] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Create Event form
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventForm, setEventForm] = useState({ title: '', date: '', location: '', description: '', capacity: '100' });
  const [savingEvent, setSavingEvent] = useState(false);

  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [alumniRes, eventsRes, donationsRes, jobsRes] = await Promise.all([
        fetch('/api/alumni', { headers }),
        fetch('/api/alumni/events', { headers }),
        fetch('/api/alumni/donations', { headers }),
        fetch('/api/alumni/jobs', { headers }),
      ]);
      if (alumniRes.ok) setAlumni(await alumniRes.json());
      if (eventsRes.ok) setEvents(await eventsRes.json());
      if (donationsRes.ok) setDonations(await donationsRes.json());
      if (jobsRes.ok) setJobs(await jobsRes.json());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [token]);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingEvent(true);
    setError(null);
    try {
      const res = await fetch('/api/alumni/events', {
        method: 'POST',
        headers,
        body: JSON.stringify({ ...eventForm, capacity: parseInt(eventForm.capacity) }),
      });
      if (res.ok) {
        showSuccess('Alumni event created successfully.');
        setShowEventForm(false);
        setEventForm({ title: '', date: '', location: '', description: '', capacity: '100' });
        fetchAll();
        appendLog?.('[ALUMNI] Created new alumni event.');
      } else {
        const d = await res.json();
        setError(d.error || 'Failed to create event');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSavingEvent(false);
    }
  };

  const handleApproveJob = async (jobId: string) => {
    try {
      const res = await fetch(`/api/alumni/jobs`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ approveJobId: jobId }),
      });
      showSuccess('Job posting approved.');
      fetchAll();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const filteredAlumni = alumni.filter(a =>
    `${a.email} ${a.programName} ${a.currentEmployer || ''} ${a.location || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  const totalDonations = donations.reduce((sum: number, d: any) => sum + (d.paidAmount || d.amount || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-bold text-slate-900 font-mono uppercase tracking-wide">Alumni Management</h3>
          <p className="text-xs text-slate-500 mt-0.5">Directory, events, donations, and job board management</p>
        </div>
        <button onClick={fetchAll} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition cursor-pointer">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-1"><Users className="h-4 w-4 text-indigo-600" /><span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Alumni</span></div>
          <p className="text-2xl font-black text-indigo-600">{alumni.length}</p>
          <p className="text-[9px] text-slate-400 mt-1">{alumni.filter(a => a.isActivated).length} activated</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-1"><Calendar className="h-4 w-4 text-emerald-600" /><span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Events</span></div>
          <p className="text-2xl font-black text-emerald-600">{events.length}</p>
          <p className="text-[9px] text-slate-400 mt-1">Total planned</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-1"><Heart className="h-4 w-4 text-rose-500" /><span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Donations</span></div>
          <p className="text-2xl font-black text-rose-500">KES {(totalDonations).toLocaleString()}</p>
          <p className="text-[9px] text-slate-400 mt-1">{donations.length} pledges total</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-1"><Briefcase className="h-4 w-4 text-amber-600" /><span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Jobs</span></div>
          <p className="text-2xl font-black text-amber-600">{jobs.length}</p>
          <p className="text-[9px] text-slate-400 mt-1">{jobs.filter((j: any) => !j.isApproved).length} pending approval</p>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0" /> {error}
        </div>
      )}
      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-700 flex items-center gap-2">
          <CheckCircle className="h-4 w-4 flex-shrink-0" /> {successMsg}
        </div>
      )}

      {/* Sub Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
        {(['directory', 'events', 'donations', 'jobs'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all capitalize cursor-pointer ${activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><RefreshCw className="h-6 w-6 animate-spin text-indigo-500" /></div>
      ) : (
        <>
          {/* DIRECTORY TAB */}
          {activeTab === 'directory' && (
            <div className="space-y-4">
              <div className="flex gap-3 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input type="text" placeholder="Search alumni by email, program, employer..." value={search} onChange={e => setSearch(e.target.value)}
                    className="w-full py-2 pl-9 pr-3 border border-slate-200 rounded-lg text-xs outline-none bg-white" />
                </div>
                <button className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition cursor-pointer">
                  <Download className="h-3.5 w-3.5" /> Export CSV
                </button>
              </div>

              {filteredAlumni.length === 0 ? (
                <div className="text-center py-16 text-slate-400 text-sm italic">No alumni records found.</div>
              ) : (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left px-4 py-3 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Alumni</th>
                        <th className="text-left px-4 py-3 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Program</th>
                        <th className="text-left px-4 py-3 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Year</th>
                        <th className="text-left px-4 py-3 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Employer</th>
                        <th className="text-left px-4 py-3 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Location</th>
                        <th className="text-left px-4 py-3 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredAlumni.map((a: any) => (
                        <tr key={a.id} className="hover:bg-slate-50 transition">
                          <td className="px-4 py-3">
                            <div className="font-bold text-slate-800">{a.email}</div>
                          </td>
                          <td className="px-4 py-3 text-slate-600">{a.programName || '—'}</td>
                          <td className="px-4 py-3 font-mono text-slate-600">{a.graduationYear || '—'}</td>
                          <td className="px-4 py-3 text-slate-600">{a.currentEmployer || <span className="italic text-slate-400">Not set</span>}</td>
                          <td className="px-4 py-3 text-slate-600">{a.location || <span className="italic text-slate-400">Not set</span>}</td>
                          <td className="px-4 py-3">
                            {a.isActivated
                              ? <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded font-bold text-[9px] uppercase">Active</span>
                              : <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded font-bold text-[9px] uppercase">Pending</span>
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* EVENTS TAB */}
          {activeTab === 'events' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-bold text-slate-700">Alumni Events</h4>
                <button onClick={() => setShowEventForm(true)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition cursor-pointer">
                  <Plus className="h-3.5 w-3.5" /> Create Event
                </button>
              </div>

              {showEventForm && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                  <h5 className="text-xs font-bold text-slate-700 uppercase font-mono mb-4">New Alumni Event</h5>
                  <form onSubmit={handleCreateEvent} className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Event Title</label>
                      <input required type="text" value={eventForm.title} onChange={e => setEventForm({ ...eventForm, title: e.target.value })}
                        className="w-full py-1.5 px-3 border border-slate-200 rounded-lg text-xs outline-none bg-white" placeholder="e.g. Annual Alumni Homecoming 2026" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Date</label>
                      <input required type="date" value={eventForm.date} onChange={e => setEventForm({ ...eventForm, date: e.target.value })}
                        className="w-full py-1.5 px-3 border border-slate-200 rounded-lg text-xs outline-none bg-white" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Venue</label>
                      <input required type="text" value={eventForm.location} onChange={e => setEventForm({ ...eventForm, location: e.target.value })}
                        className="w-full py-1.5 px-3 border border-slate-200 rounded-lg text-xs outline-none bg-white" placeholder="Campus Main Hall" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Capacity</label>
                      <input type="number" value={eventForm.capacity} onChange={e => setEventForm({ ...eventForm, capacity: e.target.value })}
                        className="w-full py-1.5 px-3 border border-slate-200 rounded-lg text-xs outline-none bg-white" min="1" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Description</label>
                      <input type="text" value={eventForm.description} onChange={e => setEventForm({ ...eventForm, description: e.target.value })}
                        className="w-full py-1.5 px-3 border border-slate-200 rounded-lg text-xs outline-none bg-white" placeholder="Optional event description" />
                    </div>
                    <div className="col-span-2 flex gap-2 justify-end pt-1">
                      <button type="button" onClick={() => setShowEventForm(false)}
                        className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer">Cancel</button>
                      <button type="submit" disabled={savingEvent}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition cursor-pointer disabled:opacity-50">
                        {savingEvent ? 'Saving...' : 'Create Event'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {events.length === 0 ? (
                <div className="text-center py-16 text-slate-400 text-sm italic">No events created yet. Create your first alumni event above.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {events.map((ev: any) => (
                    <div key={ev.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-bold text-slate-800 text-sm">{ev.title}</h5>
                        <span className="text-[9px] font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100">
                          {(ev.rsvps || []).filter((r: any) => r.status === 'attending').length} / {ev.capacity} RSVPs
                        </span>
                      </div>
                      <div className="space-y-1 text-xs text-slate-500">
                        <div className="flex items-center gap-1.5"><Calendar className="h-3 w-3" /> {new Date(ev.date).toLocaleDateString()}</div>
                        <div className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /> {ev.location}</div>
                        {ev.description && <p className="text-slate-400 italic mt-1">{ev.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* DONATIONS TAB */}
          {activeTab === 'donations' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-bold text-slate-700">Donation Campaigns</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Total received: <span className="font-bold text-emerald-600">KES {totalDonations.toLocaleString()}</span></p>
                </div>
              </div>

              {donations.length === 0 ? (
                <div className="text-center py-16 text-slate-400 text-sm italic">No donation pledges yet.</div>
              ) : (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left px-4 py-3 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Donor</th>
                        <th className="text-left px-4 py-3 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Campaign</th>
                        <th className="text-left px-4 py-3 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Amount</th>
                        <th className="text-left px-4 py-3 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Paid</th>
                        <th className="text-left px-4 py-3 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {donations.map((d: any) => (
                        <tr key={d.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium text-slate-800">{d.donorName || 'Anonymous'}</td>
                          <td className="px-4 py-3 text-slate-600">{d.campaign}</td>
                          <td className="px-4 py-3 font-mono font-bold text-slate-800">{d.currency} {(d.amount || 0).toLocaleString()}</td>
                          <td className="px-4 py-3 font-mono text-emerald-600">{d.currency} {(d.paidAmount || 0).toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded font-bold text-[9px] uppercase border ${
                              d.status === 'fulfilled' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                              d.status === 'partially_paid' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                              'bg-slate-50 text-slate-600 border-slate-200'
                            }`}>{d.status?.replace('_', ' ')}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* JOBS TAB */}
          {activeTab === 'jobs' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-700">Alumni Job Board — Admin Review</h4>
              {jobs.length === 0 ? (
                <div className="text-center py-16 text-slate-400 text-sm italic">No job postings submitted yet.</div>
              ) : (
                <div className="space-y-3">
                  {jobs.map((job: any) => (
                    <div key={job.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="font-bold text-slate-800 text-sm">{job.title}</h5>
                            {!job.isApproved && (
                              <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded text-[9px] font-bold uppercase">Pending</span>
                            )}
                            {job.isApproved && (
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded text-[9px] font-bold uppercase">Approved</span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1"><Building2 className="h-3 w-3" /> {job.company}</span>
                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {job.location}</span>
                          </div>
                          <p className="text-xs text-slate-600 mt-2 line-clamp-2">{job.description}</p>
                        </div>
                        {!job.isApproved && (
                          <button onClick={() => handleApproveJob(job.id)}
                            className="ml-4 flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition cursor-pointer shrink-0">
                            <CheckCircle className="h-3.5 w-3.5" /> Approve
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
