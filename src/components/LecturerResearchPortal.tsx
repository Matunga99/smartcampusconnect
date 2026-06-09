import React, { useState, useEffect } from "react";
import { 
  FileText, Award, DollarSign, Calendar, Users, CheckCircle, XCircle, 
  Plus, Check, Send, AlertTriangle, BookOpen, ChevronRight, TrendingUp, RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Publication {
  id: string;
  title: string;
  journalName: string;
  volume: string;
  pages: string;
  publishedDate: string;
  citationCount: number;
  doi: string;
  authorName: string;
}

interface ResearchProject {
  id: string;
  title: string;
  description: string;
  fundingAgency: string;
  grantAmount: number;
  startDate: string;
  endDate: string;
  status: "active" | "completed";
}

interface StudentThesis {
  id: string;
  title: string;
  authorName: string;
  studentId: string;
  supervisorName: string;
  submissionDate: string;
  status: "pending" | "approved" | "rejected";
}

export default function LecturerResearchPortal({ token, user }: { token?: string; user?: any }) {
  const [activeTab, setActiveTab] = useState<"projects" | "theses" | "publications">("projects");
  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [theses, setTheses] = useState<StudentThesis[]>([]);
  const [publications, setPublications] = useState<Publication[]>([]);

  // Modal / Input States
  const [showAddPub, setShowAddPub] = useState(false);
  const [pubTitle, setPubTitle] = useState("");
  const [pubJournal, setPubJournal] = useState("");
  const [pubVolume, setPubVolume] = useState("");
  const [pubPages, setPubPages] = useState("");
  const [pubDoi, setPubDoi] = useState("");

  const [showAddProj, setShowAddProj] = useState(false);
  const [projTitle, setProjTitle] = useState("");
  const [projDesc, setProjDesc] = useState("");
  const [projAgency, setProjAgency] = useState("");
  const [projAmount, setProjAmount] = useState("");
  const [projEnd, setProjEnd] = useState("");

  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetchProjects();
    fetchTheses();
    fetchPublications();
  }, [activeTab, token]);

  const fetchProjects = async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/library/research-projects", {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      setProjects(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTheses = async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/library/research/theses", {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      setTheses(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchPublications = async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/library/publications", {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      setPublications(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreatePub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pubTitle || !token) return;
    try {
      const res = await fetch("/api/library/publications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          title: pubTitle,
          journalName: pubJournal,
          volume: pubVolume,
          pages: pubPages,
          doi: pubDoi
        })
      });

      if (res.ok) {
        setMessage({ text: "Scholarly publication posted to faculty registry successfully!", type: "success" });
        setPubTitle("");
        setPubJournal("");
        setPubVolume("");
        setPubPages("");
        setPubDoi("");
        setShowAddPub(false);
        fetchPublications();
      } else {
        setMessage({ text: "Failed to log publication data", type: "error" });
      }
    } catch (err) {
      console.error(err);
    }
    setTimeout(() => setMessage(null), 4000);
  };

  const handleCreateProj = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projTitle || !token) return;
    try {
       const res = await fetch("/api/library/research-projects", {
          method: "POST",
          headers: {
             "Content-Type": "application/json",
             "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
             title: projTitle,
             description: projDesc,
             fundingAgency: projAgency,
             grantAmount: Number(projAmount),
             endDate: projEnd
          })
       });

       if (res.ok) {
          setMessage({ text: "Grant/Project record finalized with yourself set as Supervisor", type: "success" });
          setProjTitle("");
          setProjDesc("");
          setProjAgency("");
          setProjAmount("");
          setProjEnd("");
          setShowAddProj(false);
          fetchProjects();
       } else {
          setMessage({ text: "Failed to finalize research project tracking", type: "error" });
       }
    } catch (err) {
       console.error(err);
    }
    setTimeout(() => setMessage(null), 4000);
  };

  const handleThesisAction = async (thesisId: string, action: "approve" | "reject") => {
    if (!token) return;
    try {
       const res = await fetch("/api/library/research/theses/approve", {
          method: "POST",
          headers: {
             "Content-Type": "application/json",
             "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ thesisId, action })
       });
       if (res.ok) {
          setMessage({ text: `Undergrad thesis successfully marked ${action === "approve" ? "APPROVED": "REJECTED"}`, type: "success" });
          fetchTheses();
       } else {
          setMessage({ text: "Filing action update call failed", type: "error" });
       }
    } catch (err) {
       console.error(err);
    }
    setTimeout(() => setMessage(null), 4000);
  };

  const totalGrantsValue = Array.isArray(projects) ? projects.reduce((total, p) => total + (p.grantAmount || 0), 0) : 0;
  const totalCitations = Array.isArray(publications) ? publications.reduce((total, p) => total + (p.citationCount || 0), 0) : 0;

  return (
    <div className="bg-slate-50 min-h-screen p-6 rounded-xl">
      {/* Visual Analytics Grid widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <span className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </span>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Scholar citation Score</p>
            <h3 className="text-xl font-bold text-slate-800">{totalCitations} Citations</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <span className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </span>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Total Research Funding</p>
            <h3 className="text-xl font-bold text-slate-800">KES {totalGrantsValue.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <span className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Users className="w-6 h-6" />
          </span>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Undergrad Theses Drafts</p>
            <h3 className="text-xl font-bold text-slate-800">
              {theses.filter(t => t.status === "pending").length} Pending Review
            </h3>
          </div>
        </div>
      </div>

      {/* Header notification triggers */}
      <AnimatePresence>
        {message && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-xl mb-6 flex items-center gap-3 border ${
              message.type === "success" 
                ? "bg-emerald-50 border-emerald-150 text-emerald-800" 
                : "bg-rose-50 border-rose-150 text-rose-800"
            }`}
          >
            <CheckCircle className="w-5 h-5 shrink-0" />
            <span className="text-xs font-medium">{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex border-b border-slate-200 mb-6 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab("projects")}
          className={`pb-3 px-4 font-semibold text-sm border-b-2 transition whitespace-nowrap ${
            activeTab === "projects" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Research Groups & Grants
        </button>
        <button
          onClick={() => setActiveTab("theses")}
          className={`pb-3 px-4 font-semibold text-sm border-b-2 transition whitespace-nowrap relative ${
            activeTab === "theses" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Theses Advising Checkpoints
          {theses.filter(t => t.status === "pending").length > 0 && (
            <span className="ml-1.5 px-2 py-0.5 bg-indigo-600 text-white text-[9px] font-bold rounded">
              {theses.filter(t => t.status === "pending").length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("publications")}
          className={`pb-3 px-4 font-semibold text-sm border-b-2 transition whitespace-nowrap ${
            activeTab === "publications" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Bibliography Publications
        </button>
      </div>

      <div className="min-h-[400px]">
        
        {/* GRANTS TAB */}
        {activeTab === "projects" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Active Group Projects</p>
              <button 
                onClick={() => setShowAddProj(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" /> Log Active Grant
              </button>
            </div>

            {showAddProj && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-5 rounded-2xl border border-indigo-100 shadow-sm"
              >
                <h3 className="text-sm font-bold text-indigo-900 mb-3 block">New Institutional Research Setup</h3>
                <form onSubmit={handleCreateProj} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Investigation / Project Theme</label>
                    <input 
                      type="text" required value={projTitle} onChange={(e) => setProjTitle(e.target.value)}
                      placeholder="e.g., Evaluation of IoT wireless structures over dense mesh fields"
                      className="text-xs p-2.5 bg-slate-50 border rounded-xl w-full outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Funding source / Council Agency</label>
                    <input 
                      type="text" required value={projAgency} onChange={(e) => setProjAgency(e.target.value)}
                      placeholder="e.g., National Science Foundation"
                      className="text-xs p-2.5 bg-slate-50 border rounded-xl w-full outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Grant Allocation Amount (KES)</label>
                    <input 
                      type="number" required value={projAmount} onChange={(e) => setProjAmount(e.target.value)}
                      placeholder="e.g., 500000"
                      className="text-xs p-2.5 bg-slate-50 border rounded-xl w-full outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="md:col-span-2 flex justify-end gap-1.5">
                     <button type="button" onClick={() => setShowAddProj(false)} className="text-xs text-slate-500 px-3 py-2">Close</button>
                     <button type="submit" className="bg-indigo-600 text-white text-xs px-4 py-2 rounded-xl font-bold font-semibold">Post project</button>
                  </div>
                </form>
              </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.length > 0 ? (
                projects.map((proj) => (
                  <div key={proj.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative">
                     <span className="absolute top-5 right-5 text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 font-bold rounded-full uppercase">
                       {proj.status || "active"}
                     </span>
                     <h3 className="font-bold text-slate-800 text-sm mb-1.5 pr-12">{proj.title}</h3>
                     <p className="text-xs text-slate-500 line-clamp-2 mb-4">{proj.description || "Experimental analysis of next-generation infrastructure paradigms, investigating signal throughput and routing optimizations."}</p>

                     <div className="border-t border-slate-50 pt-3 grid grid-cols-2 gap-2 text-[10px] text-slate-400">
                       <div>
                         <span className="block text-[9px] text-slate-300 uppercase shrink-0 font-semibold mb-0.5">Sponsor agency</span>
                         <span className="text-slate-700 font-bold">{proj.fundingAgency}</span>
                       </div>
                       <div className="text-right">
                         <span className="block text-[9px] text-slate-300 uppercase shrink-0 font-semibold mb-0.5">Assigned fund</span>
                         <span className="text-emerald-700 font-black">KES {proj.grantAmount?.toLocaleString()}</span>
                       </div>
                     </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 bg-white text-center py-12 rounded-xl border border-dashed text-slate-400">
                  <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs">No active study funding records listed.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* THESES PORTAL */}
        {activeTab === "theses" && (
          <div className="space-y-4">
             <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">My Supervised Student Submissions</p>
             
             {theses.length > 0 ? (
               theses.map((the) => (
                  <div key={the.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition duration-150">
                     <span className="p-3 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                       <FileText className="w-5 h-5 text-indigo-600" />
                     </span>

                     <div className="flex-1 min-w-0">
                        <div className="flex gap-2 items-center mb-1">
                          <span className="text-xs font-bold text-slate-800">{the.authorName}</span>
                          <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">Student Registry: {the.studentId}</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-800 truncate">{the.title}</h4>
                        <span className="text-[10px] text-slate-400 block mt-1">Submitted on {the.submissionDate}</span>
                     </div>

                     <div className="flex items-center gap-2 shrink-0 self-stretch md:self-auto justify-end pt-3 md:pt-0 border-t md:border-t-0 border-slate-50">
                        {the.status === "pending" ? (
                           <>
                              <button 
                                onClick={() => handleThesisAction(the.id, "reject")}
                                className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs px-3 py-1.5 rounded-xl transition flex items-center gap-1"
                              >
                                 <XCircle className="w-3.5 h-3.5" /> Reject Title
                              </button>
                              <button 
                                onClick={() => handleThesisAction(the.id, "approve")}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition flex items-center gap-1"
                              >
                                 <CheckCircle className="w-3.5 h-3.5" /> Approve draft
                              </button>
                           </>
                        ) : (
                           <span className={`text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider ${
                             the.status === "approved" 
                               ? "bg-emerald-50 text-emerald-800 border" 
                               : "bg-rose-50 text-rose-800 border"
                           }`}>
                             Checked: {the.status}
                           </span>
                        )}
                     </div>
                  </div>
               ))
             ) : (
                <div className="bg-white text-center py-12 rounded-xl border border-dashed text-slate-400">
                  <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs">No students have filed dissertation paperwork with you yet.</p>
                </div>
             )}
          </div>
        )}

        {/* PUBLICATIONS TAB */}
        {activeTab === "publications" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider text-slate-500">Academic Bibliography</p>
              <button 
                onClick={() => setShowAddPub(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" /> File New Paper
              </button>
            </div>

            {showAddPub && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-5 rounded-2xl border border-indigo-100 shadow-sm"
              >
                <h3 className="text-sm font-bold text-indigo-900 mb-3 block">Record Scholarly Bibliography Entry</h3>
                <form onSubmit={handleCreatePub} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Publication/Article Title</label>
                    <input 
                      type="text" required value={pubTitle} onChange={(e) => setPubTitle(e.target.value)}
                      placeholder="e.g., Energy balancing protocols on ad-hoc structures"
                      className="text-xs p-2.5 bg-slate-50 border rounded-xl w-full outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Journal name or Conference proceedings</label>
                    <input 
                      type="text" value={pubJournal} onChange={(e) => setPubJournal(e.target.value)}
                      placeholder="e.g., IEEE Transactions on Computer Systems"
                      className="text-xs p-2.5 bg-slate-50 border rounded-xl w-full outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">DOI identifier (Digital Object Identifier)</label>
                    <input 
                      type="text" value={pubDoi} onChange={(e) => setPubDoi(e.target.value)}
                      placeholder="e.g., 10.1145/239.10238"
                      className="text-xs p-2.5 bg-slate-50 border rounded-xl w-full outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="md:col-span-2 flex justify-end gap-1.5">
                     <button type="button" onClick={() => setShowAddPub(false)} className="text-xs text-slate-500 px-3 py-2">Close</button>
                     <button type="submit" className="bg-indigo-600 text-white text-xs px-4 py-2 rounded-xl font-bold font-semibold">Log Bibliography</button>
                  </div>
                </form>
              </motion.div>
            )}

            <div className="space-y-4">
               {publications.length > 0 ? (
                 publications.map((pub) => (
                    <div key={pub.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center">
                       <div>
                          <h4 className="font-bold text-slate-800 text-sm mb-1">{pub.title}</h4>
                          <span className="text-[11px] text-slate-500 font-medium block">
                            Published in <span className="italic font-bold">{pub.journalName}</span> ({pub.volume || "Vol 1"})
                          </span>
                          <span className="text-[10px] text-slate-400 block font-mono mt-1">DOI: {pub.doi || "10.1009/manual.9213"}</span>
                       </div>

                       <div className="bg-slate-50 border px-3 py-2 rounded-xl text-center shrink-0">
                          <span className="text-[10px] text-slate-400 block uppercase font-medium">Citations</span>
                          <span className="text-lg font-black text-indigo-600">{pub.citationCount || 0}</span>
                       </div>
                    </div>
                 ))
               ) : (
                  <div className="bg-white p-8 text-center rounded-2xl border border-dashed text-slate-400">
                     <Award className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                     <p className="text-xs">No publication bibliographies registered under your record.</p>
                  </div>
               )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
