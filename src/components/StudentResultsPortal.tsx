import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { FileText, Download, Award, ShieldAlert, CheckCircle, GraduationCap } from 'lucide-react';

interface StudentResultsPortalProps {
  token: string;
  user: any;
  appendLog?: (msg: string) => void;
  isPhoneFrame?: boolean;
}

export default function StudentResultsPortal({ token, user, appendLog, isPhoneFrame = false }: StudentResultsPortalProps) {
  const [activeTab, setActiveTab] = useState<'gradebook' | 'transcripts' | 'graduation'>('gradebook');
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRequests = async () => {
     try {
        const res = await fetch('/api/transcripts/requests', { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) {
           setRequests(await res.json());
        }
     } catch(e) {
        console.error(e);
     }
  };

  useEffect(() => {
     if (activeTab === 'transcripts') fetchRequests();
  }, [activeTab, token]);

  const requestTranscript = async (type: string) => {
      try {
         setLoading(true);
         const res = await fetch('/api/transcripts/request', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ requestType: type })
         });
         const data = await res.json();
         if (res.ok) {
             appendLog?.('Transcript request submitted successfully.');
             fetchRequests();
         } else {
             alert(data.error || 'Failed to request transcript');
         }
      } catch (e) {
         console.error(e);
      } finally {
         setLoading(false);
      }
  };

  return (
             <div className="h-full flex flex-col space-y-6 animate-fade">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                 <div>
                   <h2 className="text-xl font-bold text-slate-800 font-mono tracking-tight flex items-center gap-2">
                     <GraduationCap className="h-6 w-6 text-indigo-500" />
                     Academic Results & Records
                   </h2>
                   <p className="text-xs text-slate-500 mt-1">Official grades, transcripts, and graduation clearance.</p>
                 </div>
                 <div className="flex flex-wrap gap-2">
                    <button onClick={() => setActiveTab('gradebook')} className={`px-4 py-2 rounded text-xs font-bold transition-all ${activeTab === 'gradebook' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Cumulative Gradebook</button>
                    <button onClick={() => setActiveTab('transcripts')} className={`px-4 py-2 rounded text-xs font-bold transition-all ${activeTab === 'transcripts' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Official Transcripts</button>
                    <button onClick={() => setActiveTab('graduation')} className={`px-4 py-2 rounded text-xs font-bold transition-all ${activeTab === 'graduation' ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}>Graduation & Alumni</button>
                 </div>
               </div>

               <div className="flex-1 overflow-y-auto">
                 {activeTab === 'gradebook' && (
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                       <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />
                       <div className="flex justify-between items-start mb-6">
                           <div>
                               <h3 className="text-lg font-bold text-slate-900">Academic Standing: <span className="text-emerald-600">GOOD STANDING</span></h3>
                               <p className="text-sm text-slate-500 font-mono mt-1">CGPA: 3.8 / 4.0 (Dean's List Eligible)</p>
                           </div>
                           <Award className="h-10 w-10 text-emerald-100" />
                       </div>

                       <h4 className="text-xs font-bold text-slate-900 font-mono uppercase tracking-wider mb-3">Year 1 - Semester 1</h4>
                       <table className="w-full text-left border-collapse mb-8">
                          <thead>
                             <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase font-mono tracking-wider">
                                <th className="p-3 border-b border-slate-200">Unit Code</th>
                                <th className="p-3 border-b border-slate-200">Unit Name</th>
                                <th className="p-3 border-b border-slate-200">Credits</th>
                                <th className="p-3 border-b border-slate-200">Score</th>
                                <th className="p-3 border-b border-slate-200">Grade</th>
                             </tr>
                          </thead>
                          <tbody className="text-xs">
                             <tr className="border-b border-slate-100">
                                 <td className="p-3 font-mono text-slate-600">CS101</td>
                                 <td className="p-3 font-bold text-slate-800">Intro to Programming</td>
                                 <td className="p-3 text-slate-600">3.0</td>
                                 <td className="p-3 font-bold text-indigo-600">88%</td>
                                 <td className="p-3 font-bold text-emerald-600">A</td>
                             </tr>
                             <tr className="border-b border-slate-100">
                                 <td className="p-3 font-mono text-slate-600">MATH101</td>
                                 <td className="p-3 font-bold text-slate-800">Calculus I</td>
                                 <td className="p-3 text-slate-600">4.0</td>
                                 <td className="p-3 font-bold text-indigo-600">76%</td>
                                 <td className="p-3 font-bold text-emerald-600">B+</td>
                             </tr>
                          </tbody>
                       </table>
                       
                       <p className="text-[10px] text-slate-400 italic text-center">Results for current semester are pending Senate approval.</p>
                    </div>
                 )}

                 {activeTab === 'transcripts' && (
                    <div className="space-y-6">
                        <div className="bg-slate-800 rounded-xl p-6 shadow-sm text-white flex items-center justify-between">
                            <div>
                               <h3 className="font-bold text-lg">Request Official Transcripts</h3>
                               <p className="text-sm text-slate-300 mt-1 max-w-lg">Certified electronic transcripts securely delivered to you or your designated institution. Requires zero outstanding fee balance.</p>
                            </div>
                            <button disabled={loading} onClick={() => requestTranscript('Official Transcript')} className="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded shadow transition flex items-center gap-2">
                               {loading ? <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FileText className="h-4 w-4" />}
                               Submit Request
                            </button>
                        </div>
                        
                        <h4 className="text-xs font-bold text-slate-900 font-mono uppercase tracking-wider">Request History</h4>
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                           <table className="w-full text-left border-collapse">
                              <thead>
                                 <tr className="bg-slate-50 text-slate-600 text-[10px] uppercase font-mono tracking-wider">
                                    <th className="p-4 border-b border-slate-200">Date Requested</th>
                                    <th className="p-4 border-b border-slate-200">Type</th>
                                    <th className="p-4 border-b border-slate-200">Status</th>
                                    <th className="p-4 border-b border-slate-200">Document</th>
                                 </tr>
                              </thead>
                              <tbody className="text-xs">
                                 {requests.length === 0 ? (
                                     <tr><td colSpan={4} className="text-center p-6 text-slate-400 italic">No transcript requests found.</td></tr>
                                 ) : requests.map((r, i) => (
                                     <tr key={i} className="border-b border-slate-100">
                                         <td className="p-4 text-slate-600 font-mono">{new Date(r.requestDate).toLocaleDateString()}</td>
                                         <td className="p-4 font-bold text-slate-800">{r.requestType}</td>
                                         <td className="p-4">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${r.status === 'Pending' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>{r.status}</span>
                                         </td>
                                         <td className="p-4">
                                            {r.status === 'Approved' ? <button className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-bold text-[10px] uppercase"><Download className="h-3 w-3"/> Download</button> : <span className="text-slate-300 text-[10px]">Processing</span>}
                                         </td>
                                     </tr>
                                 ))}
                              </tbody>
                           </table>
                        </div>
                    </div>
                 )}

                 {activeTab === 'graduation' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm text-center">
                           <div className="mx-auto h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                              <ShieldAlert className="h-8 w-8 text-slate-400" />
                           </div>
                           <h3 className="text-xl font-bold text-slate-900">Graduation Clearance</h3>
                           <p className="text-sm text-slate-500 mt-2 max-w-lg mx-auto">You are not yet eligible for graduation. You must complete your final year of study and clear all institutional obligations.</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div className="bg-white border border-slate-200 p-6 rounded-xl flex items-center gap-4">
                               <div className="h-10 w-10 flex-shrink-0 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center">
                                  <ShieldAlert className="h-5 w-5" />
                               </div>
                               <div>
                                  <h4 className="font-bold text-slate-900">Academic Clearance</h4>
                                  <p className="text-[10px] text-slate-500 mt-0.5">Pending final Senate approval of Year 4 results.</p>
                               </div>
                           </div>
                           <div className="bg-white border border-emerald-200 p-6 rounded-xl flex items-center gap-4">
                               <div className="h-10 w-10 flex-shrink-0 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                                  <CheckCircle className="h-5 w-5" />
                               </div>
                               <div>
                                  <h4 className="font-bold text-emerald-900">Financial Clearance</h4>
                                  <p className="text-[10px] text-emerald-600 mt-0.5">Zero outstanding balance. Cleared.</p>
                               </div>
                           </div>
                           <div className="bg-white border border-emerald-200 p-6 rounded-xl flex items-center gap-4">
                               <div className="h-10 w-10 flex-shrink-0 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                                  <CheckCircle className="h-5 w-5" />
                               </div>
                               <div>
                                  <h4 className="font-bold text-emerald-900">Library Clearance</h4>
                                  <p className="text-[10px] text-emerald-600 mt-0.5">No overdue books. Cleared.</p>
                               </div>
                           </div>
                           <div className="bg-white border border-emerald-200 p-6 rounded-xl flex items-center gap-4">
                               <div className="h-10 w-10 flex-shrink-0 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                                  <CheckCircle className="h-5 w-5" />
                               </div>
                               <div>
                                  <h4 className="font-bold text-emerald-900">Disciplinary Clearance</h4>
                                  <p className="text-[10px] text-emerald-600 mt-0.5">Good record. Cleared.</p>
                               </div>
                           </div>
                        </div>
                    </div>
                 )}
               </div>
             </div>
  );
}
