import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BookOpen, UserCheck, Search, Download, GraduationCap, CheckCircle, FileText, Check, X } from 'lucide-react';

interface AdminExaminationEngineProps {
  token: string;
  appendLog?: (msg: string) => void;
  isPhoneFrame?: boolean;
}

export default function AdminExaminationEngine({ token, appendLog, isPhoneFrame = false }: AdminExaminationEngineProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'approvals' | 'transcripts' | 'graduation'>('overview');
  
  const [sessions, setSessions] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [clearanceData, setClearanceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [showSessionModal, setShowSessionModal] = useState(false);
  const [newSessionData, setNewSessionData] = useState({ name: '', academicYearId: '', semesterId: '', startDate: '', endDate: '' });

  const fetchExamData = async () => {
    try {
      setLoading(true);
      const [sessRes, reqsRes, clearRes] = await Promise.all([
        fetch('/api/exams/sessions', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/transcripts/requests', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/graduation/clearance', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      if (sessRes.ok) setSessions(await sessRes.json());
      if (reqsRes.ok) setRequests(await reqsRes.json());
      if (clearRes.ok) setClearanceData(await clearRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExamData();
  }, [token]);

  const handleCreateSession = async () => {
     try {
        const res = await fetch('/api/exams/sessions', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
           body: JSON.stringify(newSessionData)
        });
        if (res.ok) {
           appendLog?.('Exam session created');
           setShowSessionModal(false);
           fetchExamData();
        }
     } catch (e) {
       console.error(e);
     }
  };

  return (
             <div className="h-full flex flex-col space-y-6 animate-fade">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                 <div>
                   <h2 className="text-xl font-bold text-slate-800 font-mono tracking-tight flex items-center gap-2">
                     <GraduationCap className="h-6 w-6 text-indigo-500" />
                     Examination & Certification Suite
                   </h2>
                   <p className="text-xs text-slate-500 mt-1">Manage exam sessions, grading workflows, and academic records.</p>
                 </div>
                 <div className="flex flex-wrap gap-2">
                    <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 rounded text-xs font-bold transition-all ${activeTab === 'overview' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Overview</button>
                    <button onClick={() => setActiveTab('sessions')} className={`px-4 py-2 rounded text-xs font-bold transition-all ${activeTab === 'sessions' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Exam Sessions</button>
                    <button onClick={() => setActiveTab('approvals')} className={`px-4 py-2 rounded text-xs font-bold transition-all ${activeTab === 'approvals' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Results Approval</button>
                    <button onClick={() => setActiveTab('transcripts')} className={`px-4 py-2 rounded text-xs font-bold transition-all ${activeTab === 'transcripts' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Transcripts</button>
                    <button onClick={() => setActiveTab('graduation')} className={`px-4 py-2 rounded text-xs font-bold transition-all ${activeTab === 'graduation' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Graduation</button>
                 </div>
               </div>

               <div className="flex-1 overflow-y-auto">
                 {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="p-6 bg-white border border-slate-200 shadow-sm rounded-xl flex flex-col justify-center">
                         <p className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-widest pl-1 mb-1">Active Exam Sessions</p>
                         <h3 className="text-3xl font-bold text-slate-800">{sessions.length}</h3>
                      </div>
                      <div className="p-6 bg-white border border-slate-200 shadow-sm rounded-xl flex flex-col justify-center">
                         <p className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-widest pl-1 mb-1">Pending Approvals</p>
                         <h3 className="text-3xl font-bold text-indigo-600">0</h3>
                      </div>
                      <div className="p-6 bg-white border border-slate-200 shadow-sm rounded-xl flex flex-col justify-center">
                         <p className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-widest pl-1 mb-1">Transcript Requests</p>
                         <h3 className="text-3xl font-bold text-rose-600">{requests.filter(r => r.status === 'Pending').length}</h3>
                      </div>
                      <div className="p-6 bg-white border border-slate-200 shadow-sm rounded-xl flex flex-col justify-center">
                         <p className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-widest pl-1 mb-1">Graduation Pending</p>
                         <h3 className="text-3xl font-bold text-emerald-600">{clearanceData.length}</h3>
                      </div>
                    </div>
                 )}
                 {activeTab === 'sessions' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6 flex items-center justify-between">
                            <div>
                               <h3 className="text-lg font-bold text-slate-800">Exam Sessions & Scheduling</h3>
                               <p className="text-sm text-slate-500 mt-1 max-w-lg">Create exam timetables, allocate invigilators to rooms, and generate student exam cards.</p>
                            </div>
                            <button onClick={() => setShowSessionModal(true)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-bold transition shrink-0">Create Exam Session</button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {sessions.length === 0 ? (
                              <div className="md:col-span-2 text-center p-8 text-slate-400 italic text-sm">No exam sessions created.</div>
                           ) : sessions.map((sess:any) => (
                              <div key={sess.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                  <div className="flex justify-between items-start mb-3">
                                     <h4 className="font-bold text-slate-900">{sess.name}</h4>
                                     <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">{sess.status}</span>
                                  </div>
                                  <div className="flex font-mono text-xs text-slate-500 gap-4">
                                     <span>Start: {sess.startDate}</span>
                                     <span>End: {sess.endDate}</span>
                                  </div>
                                  <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                                     <button className="text-xs font-bold text-indigo-600 hover:text-indigo-800">Timetable</button>
                                     <button className="text-xs font-bold text-indigo-600 hover:text-indigo-800">Invigilators</button>
                                     <button className="text-xs font-bold text-indigo-600 hover:text-indigo-800">Rooms</button>
                                  </div>
                              </div>
                           ))}
                        </div>
                    </div>
                 )}
                 {activeTab === 'approvals' && (
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                       <h3 className="text-sm font-bold text-slate-800 font-mono uppercase tracking-widest mb-4">Senatorial Results Workflow</h3>
                       <div className="relative border-l-2 border-slate-100 ml-4 pl-6 space-y-6">
                           <div>
                              <div className="absolute -left-[9px] w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" />
                              <h4 className="text-xs font-bold text-slate-900">Lecturer Submission</h4>
                              <p className="text-[10px] text-slate-500">Marks entered and submitted.</p>
                           </div>
                           <div>
                              <div className="absolute -left-[9px] w-4 h-4 rounded-full bg-indigo-500 border-2 border-white" />
                              <h4 className="text-xs font-bold text-slate-900">HOD Approval</h4>
                              <p className="text-[10px] text-slate-500">Departmental review pending for 8 units.</p>
                           </div>
                           <div>
                              <div className="absolute -left-[9px] w-4 h-4 rounded-full bg-slate-300 border-2 border-white" />
                              <h4 className="text-xs font-bold text-slate-900">Dean / Senate Review</h4>
                              <p className="text-[10px] text-slate-500">Awaiting faculty-level confirmation.</p>
                           </div>
                           <div>
                              <div className="absolute -left-[9px] w-4 h-4 rounded-full bg-slate-200 border-2 border-white" />
                              <h4 className="text-xs font-bold text-slate-900">Publication</h4>
                              <p className="text-[10px] text-slate-500">Results released to student portals.</p>
                           </div>
                       </div>
                    </div>
                 )}
                 {activeTab === 'transcripts' && (
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                       <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                          <h3 className="font-bold text-slate-900 text-sm">Transcript Requests</h3>
                          <button className="px-3 py-1.5 bg-indigo-600 text-white font-bold text-[10px] uppercase tracking-wider rounded shadow transition hover:bg-indigo-700">Generate Transcripts</button>
                       </div>
                       <table className="w-full text-left border-collapse">
                          <thead>
                             <tr className="bg-slate-100 text-slate-600 text-[10px] uppercase font-mono tracking-wider">
                                <th className="p-4">Date</th>
                                <th className="p-4">Student ID</th>
                                <th className="p-4">Request Type</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Action</th>
                             </tr>
                          </thead>
                          <tbody className="text-xs">
                             {requests.length === 0 ? (
                                <tr><td colSpan={5} className="text-center p-6 text-slate-400 italic">No recent requests.</td></tr>
                             ) : requests.map((req:any, i:number) => (
                                <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                                   <td className="p-4 font-mono text-slate-500 text-[10px]">{new Date(req.requestDate).toLocaleDateString()}</td>
                                   <td className="p-4 font-bold text-slate-800">{req.studentId}</td>
                                   <td className="p-4 text-slate-700">{req.requestType}</td>
                                   <td className="p-4">
                                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${req.status === 'Pending' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>{req.status}</span>
                                   </td>
                                   <td className="p-4">
                                      <button className="text-indigo-600 hover:text-indigo-800 font-bold text-[10px] uppercase">Process</button>
                                   </td>
                                </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                 )}
                 {activeTab === 'graduation' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm flex items-center justify-between gap-6">
                           <div>
                              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2"><CheckCircle className="h-6 w-6 text-emerald-600" /> Graduation Clearance Engine</h3>
                              <p className="text-sm text-slate-500 mt-2 max-w-lg">Verify Finance, Library, and Academic clearance statuses before classifying alumni and distributing certificates.</p>
                           </div>
                           <button className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-sm font-bold shadow transition shrink-0">Initiate Batch Clearances</button>
                        </div>
                        
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                           <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                              <h3 className="font-bold text-slate-900 text-sm">Potential Graduands (Final Year Students)</h3>
                           </div>
                           <div className="overflow-x-auto">
                           <table className="w-full text-left border-collapse">
                              <thead>
                                 <tr className="bg-slate-100 text-slate-600 text-[10px] uppercase font-mono tracking-wider">
                                    <th className="p-4 border-b border-slate-200">Student Name</th>
                                    <th className="p-4 border-b border-slate-200">Reg No</th>
                                    <th className="p-4 border-b border-slate-200">Status</th>
                                    <th className="p-4 border-b border-slate-200">Finance</th>
                                    <th className="p-4 border-b border-slate-200">Academic</th>
                                    <th className="p-4 border-b border-slate-200">Library</th>
                                 </tr>
                              </thead>
                              <tbody className="text-xs">
                                 {clearanceData.length === 0 ? (
                                    <tr><td colSpan={6} className="text-center p-6 text-slate-400 italic">No students currently in final year.</td></tr>
                                 ) : clearanceData.map((cd:any, i:number) => (
                                    <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                                       <td className="p-4 font-bold text-slate-900">{cd.name}</td>
                                       <td className="p-4 font-mono text-slate-500">{cd.regNumber}</td>
                                       <td className="p-4">
                                          <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${cd.clearanceStatus.overall === 'Eligible' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                                             {cd.clearanceStatus.overall}
                                          </span>
                                       </td>
                                       <td className="p-4">
                                          {cd.clearanceStatus.finance === 'Cleared' ? <span className="text-emerald-500 flex items-center gap-1"><Check className="h-3 w-3"/> Cleared</span> : <span className="text-rose-500 flex items-center gap-1"><X className="h-3 w-3"/> Pending</span>}
                                       </td>
                                       <td className="p-4">
                                          {cd.clearanceStatus.academic === 'Cleared' ? <span className="text-emerald-500 flex items-center gap-1"><Check className="h-3 w-3"/> Cleared</span> : <span className="text-rose-500 flex items-center gap-1"><X className="h-3 w-3"/> Pending</span>}
                                       </td>
                                       <td className="p-4">
                                          {cd.clearanceStatus.library === 'Cleared' ? <span className="text-emerald-500 flex items-center gap-1"><Check className="h-3 w-3"/> Cleared</span> : <span className="text-rose-500 flex items-center gap-1"><X className="h-3 w-3"/> Pending</span>}
                                       </td>
                                    </tr>
                                 ))}
                              </tbody>
                           </table>
                           </div>
                        </div>
                    </div>
                 )}
               </div>
               
               {/* Create Session Modal */}
               {showSessionModal && (
                  <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                     <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-fade-in">
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                           <h3 className="font-bold text-slate-800">Create Exam Session</h3>
                           <button onClick={() => setShowSessionModal(false)} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5"/></button>
                        </div>
                        <div className="p-5 space-y-4">
                           <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Session Name</label>
                              <input type="text" placeholder="e.g. End of Semester 1 Exams 2026" className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500" value={newSessionData.name} onChange={(e) => setNewSessionData({...newSessionData, name: e.target.value})} />
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                              <div>
                                 <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Academic Year</label>
                                 <input type="text" placeholder="AY2025/2026" className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none" value={newSessionData.academicYearId} onChange={(e) => setNewSessionData({...newSessionData, academicYearId: e.target.value})} />
                              </div>
                              <div>
                                 <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Semester</label>
                                 <input type="text" placeholder="Semester 1" className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none" value={newSessionData.semesterId} onChange={(e) => setNewSessionData({...newSessionData, semesterId: e.target.value})} />
                              </div>
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                              <div>
                                 <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Start Date</label>
                                 <input type="date" className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none" value={newSessionData.startDate} onChange={(e) => setNewSessionData({...newSessionData, startDate: e.target.value})} />
                              </div>
                              <div>
                                 <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">End Date</label>
                                 <input type="date" className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none" value={newSessionData.endDate} onChange={(e) => setNewSessionData({...newSessionData, endDate: e.target.value})} />
                              </div>
                           </div>
                        </div>
                        <div className="p-5 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                           <button onClick={() => setShowSessionModal(false)} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition border border-slate-200 bg-white">Cancel</button>
                           <button onClick={handleCreateSession} className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-sm">Save Session</button>
                        </div>
                     </div>
                  </div>
               )}
             </div>
  );
}
