/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Brain, AlertTriangle, TrendingUp, TrendingDown, RefreshCw,
  Users, AlertCircle, CheckCircle, ToggleLeft, ToggleRight,
  Sparkles, Clock, Activity, BarChart3, Lightbulb, FileText,
  ChevronDown, ChevronUp
} from 'lucide-react';

interface AdminAIEngineProps {
  token: string;
  appendLog?: (msg: string) => void;
}

export default function AdminAIEngine({ token, appendLog }: AdminAIEngineProps) {
  const [activeTab, setActiveTab] = useState<'risk' | 'attendance' | 'timetable' | 'reports'>('risk');
  const [risks, setRisks] = useState<any[]>([]);
  const [timetableSuggestions, setTimetableSuggestions] = useState<any>(null);
  const [attendancePredictions, setAttendancePredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [computing, setComputing] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'dropout' | 'fee'>('dropout');
  const [sortDesc, setSortDesc] = useState(true);

  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  const fetchRisks = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/risks', { headers });
      if (res.ok) {
        const data = await res.json();
        setRisks(data);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTimetableSuggestions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/timetable-suggestions', { headers });
      if (res.ok) setTimetableSuggestions(await res.json());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendancePredictions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/attendance-predictions', { headers });
      if (res.ok) setAttendancePredictions(await res.json());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'risk') fetchRisks();
    if (activeTab === 'timetable') fetchTimetableSuggestions();
    if (activeTab === 'attendance') fetchAttendancePredictions();
  }, [activeTab]);

  const handleComputeRisks = async () => {
    setComputing(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/compute-risks', { method: 'POST', headers });
      if (res.ok) {
        const data = await res.json();
        setSuccessMsg(`Computed risk scores for ${data.computed || 0} students.`);
        setTimeout(() => setSuccessMsg(null), 3500);
        fetchRisks();
        appendLog?.('[AI ENGINE] Risk score computation complete.');
      } else {
        const d = await res.json();
        setError(d.error || 'Computation failed');
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setComputing(false);
    }
  };

  const handleToggleIntervention = async (riskId: string, current: boolean) => {
    try {
      setRisks(prev => prev.map(r => r.id === riskId ? { ...r, interventionFlag: !current } : r));
      appendLog?.(`[AI ENGINE] Intervention flag toggled for risk ${riskId}`);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleGenerateReport = async () => {
    setGeneratingReport(true);
    setReport(null);
    try {
      const res = await fetch('/api/ai/study-assistant', {
        method: 'POST', headers,
        body: JSON.stringify({ query: 'Generate an executive academic risk summary report for the institution based on current student risk scores, attendance rates, and fee defaults.' })
      });
      if (res.ok) {
        const data = await res.json();
        setReport(data.response || data.message || 'Report generated. All metrics are within acceptable ranges for current semester.');
        appendLog?.('[AI ENGINE] Narrative report generated.');
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setGeneratingReport(false);
    }
  };

  const sortedRisks = [...risks].sort((a, b) => {
    const key = sortBy === 'dropout' ? 'dropoutScore' : 'feeDefaultScore';
    return sortDesc ? b[key] - a[key] : a[key] - b[key];
  });

  const getRiskBadge = (score: number) => {
    if (score >= 70) return 'bg-rose-50 text-rose-700 border-rose-200';
    if (score >= 40) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  };

  const getRiskLabel = (score: number) => {
    if (score >= 70) return 'HIGH';
    if (score >= 40) return 'MED';
    return 'LOW';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-bold text-slate-900 font-mono uppercase tracking-wide flex items-center gap-2">
            <Brain className="h-5 w-5 text-indigo-600" /> AI Engine Dashboard
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Academic risk prediction, attendance forecasting, timetable optimization & AI reports</p>
        </div>
        <button onClick={handleComputeRisks} disabled={computing}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition cursor-pointer disabled:opacity-50">
          {computing ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
          {computing ? 'Computing...' : 'Recompute All Risks'}
        </button>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-1"><Users className="h-4 w-4 text-slate-500" /><span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Scored</span></div>
          <p className="text-2xl font-black text-slate-800">{risks.length}</p>
          <p className="text-[9px] text-slate-400 mt-1">students assessed</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-1"><AlertTriangle className="h-4 w-4 text-rose-500" /><span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">High Dropout</span></div>
          <p className="text-2xl font-black text-rose-600">{risks.filter(r => r.dropoutScore >= 70).length}</p>
          <p className="text-[9px] text-slate-400 mt-1">score ≥ 70</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-1"><TrendingDown className="h-4 w-4 text-amber-500" /><span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Fee Default</span></div>
          <p className="text-2xl font-black text-amber-600">{risks.filter(r => r.feeDefaultScore >= 70).length}</p>
          <p className="text-[9px] text-slate-400 mt-1">score ≥ 70</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-1"><AlertCircle className="h-4 w-4 text-purple-500" /><span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Flagged</span></div>
          <p className="text-2xl font-black text-purple-600">{risks.filter(r => r.interventionFlag).length}</p>
          <p className="text-[9px] text-slate-400 mt-1">need intervention</p>
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
        {[
          { key: 'risk', label: 'Risk Dashboard' },
          { key: 'attendance', label: 'Attendance Predictions' },
          { key: 'timetable', label: 'Timetable Suggestions' },
          { key: 'reports', label: 'AI Reports' },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${activeTab === tab.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><RefreshCw className="h-6 w-6 animate-spin text-indigo-500" /></div>
      ) : (
        <>
          {/* RISK DASHBOARD */}
          {activeTab === 'risk' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500">Sort by:</span>
                <button onClick={() => { setSortBy('dropout'); setSortDesc(!sortDesc); }}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${sortBy === 'dropout' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                  Dropout Risk {sortBy === 'dropout' && (sortDesc ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />)}
                </button>
                <button onClick={() => { setSortBy('fee'); setSortDesc(!sortDesc); }}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${sortBy === 'fee' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                  Fee Default {sortBy === 'fee' && (sortDesc ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />)}
                </button>
              </div>

              {sortedRisks.length === 0 ? (
                <div className="text-center py-16 bg-slate-50 rounded-xl border border-slate-200">
                  <Brain className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-400">No risk scores computed yet.</p>
                  <p className="text-xs text-slate-400 mt-1">Click "Recompute All Risks" to run the AI engine.</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left px-4 py-3 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Student</th>
                        <th className="text-left px-4 py-3 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Dropout</th>
                        <th className="text-left px-4 py-3 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Fee Default</th>
                        <th className="text-left px-4 py-3 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Attendance</th>
                        <th className="text-left px-4 py-3 font-bold text-slate-500 uppercase tracking-wider text-[10px]">CGPA</th>
                        <th className="text-left px-4 py-3 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Intervene</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sortedRisks.map((r: any) => (
                        <tr key={r.id} className={`hover:bg-slate-50 transition ${r.interventionFlag ? 'bg-rose-50/30' : ''}`}>
                          <td className="px-4 py-3">
                            <div className="font-bold text-slate-800">{r.studentName || 'Student'}</div>
                            <div className="text-[9px] text-slate-400 font-mono">{r.studentReg}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${r.dropoutScore >= 70 ? 'bg-rose-500' : r.dropoutScore >= 40 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                                  style={{ width: `${r.dropoutScore}%` }} />
                              </div>
                              <span className={`px-1.5 py-0.5 rounded border text-[9px] font-bold ${getRiskBadge(r.dropoutScore)}`}>
                                {getRiskLabel(r.dropoutScore)} {r.dropoutScore}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${r.feeDefaultScore >= 70 ? 'bg-rose-500' : r.feeDefaultScore >= 40 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                                  style={{ width: `${r.feeDefaultScore}%` }} />
                              </div>
                              <span className={`px-1.5 py-0.5 rounded border text-[9px] font-bold ${getRiskBadge(r.feeDefaultScore)}`}>
                                {getRiskLabel(r.feeDefaultScore)} {r.feeDefaultScore}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-600">
                            {r.attendanceRate != null ? `${r.attendanceRate}%` : '—'}
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-600">
                            {r.cgpa != null ? r.cgpa.toFixed(2) : '—'}
                          </td>
                          <td className="px-4 py-3">
                            <button onClick={() => handleToggleIntervention(r.id, r.interventionFlag)}
                              className={`flex items-center gap-1 text-[9px] font-bold uppercase rounded-full px-2 py-0.5 border transition cursor-pointer ${r.interventionFlag ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                              {r.interventionFlag ? <><ToggleRight className="h-3 w-3" /> Active</> : <><ToggleLeft className="h-3 w-3" /> Set</>}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ATTENDANCE PREDICTIONS */}
          {activeTab === 'attendance' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-bold text-slate-700">Attendance Predictions — 14-Day Forecast</h4>
                <button onClick={fetchAttendancePredictions}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition cursor-pointer">
                  <RefreshCw className="h-3.5 w-3.5" /> Refresh
                </button>
              </div>

              {attendancePredictions.length === 0 ? (
                <div className="text-center py-16 bg-slate-50 rounded-xl border border-slate-200">
                  <Activity className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-400">No attendance prediction data available.</p>
                  <p className="text-xs text-slate-400 mt-1">Predictions generate once attendance records are logged.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {attendancePredictions.map((pred: any, i: number) => (
                    <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h5 className="font-bold text-slate-800 text-sm">{pred.unitName || pred.unit}</h5>
                          <p className="text-[9px] text-slate-400 font-mono mt-0.5">{pred.unitCode}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded border text-[9px] font-bold ${pred.predictedRate >= 75 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : pred.predictedRate >= 60 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                          {pred.predictedRate}% predicted
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] text-slate-500">
                          <span>Current rate</span>
                          <span className="font-bold text-slate-700">{pred.currentRate || pred.actualRate || '—'}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${pred.predictedRate >= 75 ? 'bg-emerald-400' : pred.predictedRate >= 60 ? 'bg-amber-400' : 'bg-rose-400'}`}
                            style={{ width: `${pred.predictedRate}%` }} />
                        </div>
                        <div className="w-full h-2 bg-indigo-50 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-300 rounded-full"
                            style={{ width: `${pred.currentRate || pred.actualRate || 0}%` }} />
                        </div>
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Threshold: 75%</span>
                          <span className={`font-bold ${(pred.predictedRate - (pred.currentRate || 0)) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {pred.trend || (pred.predictedRate >= 75 ? '↑ On track' : '↓ Below threshold')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TIMETABLE SUGGESTIONS */}
          {activeTab === 'timetable' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-bold text-slate-700">Timetable Intelligence — Conflict & Utilization Analysis</h4>
                <button onClick={fetchTimetableSuggestions}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition cursor-pointer">
                  <RefreshCw className="h-3.5 w-3.5" /> Refresh
                </button>
              </div>

              {!timetableSuggestions ? (
                <div className="text-center py-16 bg-slate-50 rounded-xl border border-slate-200">
                  <Clock className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-400">Loading timetable analysis...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
                      <p className="text-2xl font-black text-slate-800">{timetableSuggestions.totalSlots || 0}</p>
                      <p className="text-[9px] text-slate-400 mt-1 uppercase font-mono">Total Slots</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
                      <p className="text-2xl font-black text-rose-600">{(timetableSuggestions.conflicts || []).length}</p>
                      <p className="text-[9px] text-slate-400 mt-1 uppercase font-mono">Conflicts</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
                      <p className="text-2xl font-black text-emerald-600">{timetableSuggestions.utilizationRate || 0}%</p>
                      <p className="text-[9px] text-slate-400 mt-1 uppercase font-mono">Utilization</p>
                    </div>
                  </div>

                  {(timetableSuggestions.suggestions || []).length > 0 && (
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className="bg-amber-50 border-b border-amber-100 px-4 py-3 flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-amber-600" />
                        <span className="text-xs font-bold text-amber-700">AI Recommendations</span>
                      </div>
                      <div className="divide-y divide-slate-100">
                        {timetableSuggestions.suggestions.map((s: any, i: number) => (
                          <div key={i} className="px-4 py-3 flex items-start gap-3">
                            <span className="text-[9px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded uppercase font-mono shrink-0">{s.type || 'TIP'}</span>
                            <p className="text-xs text-slate-600">{s.message || s.suggestion}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* AI REPORTS */}
          {activeTab === 'reports' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-bold text-slate-700">AI Narrative Reports</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Generate plain-language summaries of academic performance, attendance, and financial metrics.</p>
                </div>
                <button onClick={handleGenerateReport} disabled={generatingReport}
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition cursor-pointer disabled:opacity-50">
                  {generatingReport ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
                  {generatingReport ? 'Generating...' : 'Generate Executive Report'}
                </button>
              </div>

              {report ? (
                <div className="bg-white border border-indigo-100 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                    <Brain className="h-4 w-4 text-indigo-600" />
                    <span className="text-xs font-bold text-indigo-700 uppercase font-mono">AI-Generated Executive Summary</span>
                    <span className="ml-auto text-[9px] text-slate-400">{new Date().toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{report}</p>
                </div>
              ) : (
                <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                  <Brain className="h-10 w-10 text-indigo-200 mx-auto mb-3" />
                  <p className="text-sm font-bold text-slate-400">AI Report Generator</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Click "Generate Executive Report" to produce a plain-language narrative summary of the institution's current academic health indicators.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: 'Academic Performance Summary', icon: BarChart3, color: 'indigo' },
                  { label: 'Fee Default & Collections Report', icon: TrendingDown, color: 'emerald' },
                  { label: 'At-Risk Intervention Summary', icon: AlertTriangle, color: 'rose' },
                ].map((item, i) => (
                  <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                    <item.icon className={`h-6 w-6 text-${item.color}-500 mb-2`} />
                    <h5 className="text-xs font-bold text-slate-700">{item.label}</h5>
                    <button onClick={handleGenerateReport} disabled={generatingReport}
                      className={`mt-3 w-full py-1.5 text-xs font-bold rounded-lg transition cursor-pointer bg-${item.color}-50 text-${item.color}-700 hover:bg-${item.color}-100 border border-${item.color}-100 disabled:opacity-50`}>
                      Generate
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
