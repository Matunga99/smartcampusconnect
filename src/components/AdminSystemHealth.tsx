import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  HeartPulse, 
  Activity, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Building2, 
  Calendar, 
  GraduationCap, 
  DollarSign, 
  BookOpen, 
  Bed, 
  Bus, 
  Clock,
  ArrowRight,
  Sparkles,
  ServerCrash,
  Server,
  Network,
  Database,
  Sliders,
  ShieldCheck,
  Play,
  Check,
  Layers,
  Search,
  Share2,
  Key,
  Lock,
  BrainCircuit,
  MessageSquare,
  Bot,
  History,
  HardDrive,
  WifiOff,
  GitMerge,
  Save,
  Filter,
  Microscope,
  Cpu,
  CheckSquare,
  MousePointerClick,
  PowerOff,
  LockKeyhole,
  Brain,
  Eye,
  Lightbulb,
  Radar,
  Library
} from 'lucide-react';

interface HealthIssue {
  level: 'CRITICAL' | 'WARNING';
  msg: string;
}

interface HealthCategory {
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  count: number;
  issues: HealthIssue[];
  enabled?: boolean;
}

interface SystemHealthData {
  topology: HealthCategory;
  timetable: HealthCategory;
  exam: HealthCategory;
  academic: HealthCategory;
  finance: HealthCategory;
  library: HealthCategory;
  hostel: HealthCategory;
  transport: HealthCategory;
}

interface SuosRule {
  id: string;
  key: string;
  title: string;
  enabled: boolean;
  severity: string;
  desc: string;
}

interface SuosEvent {
  id: string;
  timestamp: string;
  eventType: string;
  title: string;
  message: string;
  metadata: any;
}

interface GraphNode {
  id: string;
  type: string;
  label: string;
  meta: any;
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  relationship: string;
}

interface EntityGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

interface ObserverStats {
  totalEvents: number;
  activeRulesCount: number;
  totalRules: number;
  graphNodesCount: number;
  graphEdgesCount: number;
  graphDensity: string;
}

interface IntegrityAnomaly {
  type: string;
  severity: 'CRITICAL' | 'WARNING';
  entityId: string;
  message: string;
}

interface AdminSystemHealthProps {
  token: string;
}

interface Phase10Entity {
  global_id: string;
  type: string;
  tenant_id: string;
  created_by: string;
  status: string;
  created_at: string;
  updated_at: string;
  meta: any;
}

interface Phase10Relationship {
  id: string;
  source: string;
  target: string;
  type: string;
}

interface Phase10Audit {
  event_id: string;
  entity_id: string;
  entity_type: string;
  action: string;
  actor: string;
  timestamp: string;
  before_state: any;
  after_state: any;
  module: string;
}

interface Phase10Flag {
  module: string;
  enabled: boolean;
}

interface Phase10FlagsRes {
  feature_flag_runtime: Phase10Flag[];
  system_safe_mode: { global: boolean; frozen_modules: string[] };
}

interface StabilityOverview {
  sync_queue_manager: { pending: number; processing: number; failed: number };
  conflict_resolution_engine: any[];
  system_state_snapshots: any[];
  ai_quality_gate: { anomalyFilterScore: number; completenessValidatorScore: number; status: string };
}

interface CognitiveOverview {
  semantic_state_registry: any[];
  ai_context_builder: { active_bundles: string[] };
  causal_chain_graph: any[];
  decision_simulation_engine: { simulations_run: number; last_simulation: any };
  global_time_sync: { canonical_time_source: string; drift_ms: number; status: string };
  ai_decision_boundary_guard: { hard_limits: string[]; interventions: number };
  system_emergency_governor: { status: string; active_throttles: string[]; anomaly_level: string };
}

interface AISuggestion {
  id: string;
  title: string;
  description: string;
  explanation: { why: string; data_used: string; risk: string; };
  mode: string;
  status: string;
  timestamp: string;
}

interface DecisionHistory {
  id: string;
  suggestion_id: string;
  ai_suggestion: string;
  human_decision: string;
  reason: string;
  outcome: string;
  explanation: { why: string; data_used: string; risk: string; };
  acted_by: string;
  timestamp: string;
}

interface UIStabilizationOverview {
  ui_functionality_audit: any[];
  navigation_consistency_engine: any[];
  system_ui_health_report: {
    score: number;
    broken_buttons: number;
    navigation_issues: number;
    sync_mismatches: number;
    missing_handlers: number;
    status: string;
    timestamp: string;
  };
}

interface AIContainmentOverview {
  ai_execution_boundary: { rules: string[]; blocked_attempts: number };
  ai_suggestion_firewall: any[];
  ai_decision_weight_engine: { thresholds: Record<string, string> };
  human_override_controller: { human_wins: boolean; available_actions: string[] };
  ai_suggestion_throttle: { max_per_min: number; current_rate: number; deduplications: number };
  ai_decision_trace_log: any[];
  ai_global_shutdown_flag: { active: boolean; mode: string };
}

interface Phase11Overview {
  predictive_insight_engine: any[];
  anomaly_detection_engine: any[];
  decision_recommendation_engine: any[];
  impact_simulation_engine: { simulations: number; latest_impact: any };
  institutional_memory_engine: any[];
}

export const AdminSystemHealth: React.FC<AdminSystemHealthProps> = ({ token }) => {
  // SUOS State Modules
  const [activeSegment, setActiveSegment] = useState<'metrics' | 'identity' | 'bus' | 'rules' | 'integrity' | 'hardening' | 'governance' | 'stability' | 'cognitive' | 'ui-stabilization' | 'ai-containment' | 'phase11'>('metrics');
  const [observerStats, setObserverStats] = useState<ObserverStats | null>(null);
  
  // Scanned anomalies and healing state
  const [anomalies, setAnomalies] = useState<IntegrityAnomaly[]>([]);
  const [scanning, setScanning] = useState<boolean>(false);
  const [isHealing, setIsHealing] = useState<boolean>(false);
  const [healReport, setHealReport] = useState<string | null>(null);

  // Identity Graph
  const [graphData, setGraphData] = useState<EntityGraph | null>(null);
  const [graphLoading, setGraphLoading] = useState<boolean>(false);
  const [selectedGraphType, setSelectedGraphType] = useState<string>('ALL');
  const [searchGraphTerm, setSearchGraphTerm] = useState<string>('');

  // Rules Engine
  const [rules, setRules] = useState<SuosRule[]>([]);
  const [rulesLoading, setRulesLoading] = useState<boolean>(false);

  // Event stream and emit panel
  const [events, setEvents] = useState<SuosEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState<boolean>(false);
  const [simulateType, setSimulateType] = useState<string>('student.admitted');
  const [simulateMsg, setSimulateMsg] = useState<string>('Enrolled freshman student Marie Curie into Applied Chemistry Department');
  const [simulateMeta, setSimulateMeta] = useState<string>('{"studentId": "std-002", "amount": 45000}');
  const [emitting, setEmitting] = useState<boolean>(false);
  const [emitSuccess, setEmitSuccess] = useState<string | null>(null);

  // Legacy System health
  const [healthData, setHealthData] = useState<SystemHealthData | null>(null);
  const [healthLoading, setHealthLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedHealthCategory, setSelectedHealthCategory] = useState<string | null>(null);

  // Phase 10.5 Enterprise Data
  const [registryData, setRegistryData] = useState<{registry: Phase10Entity[], relationships: Phase10Relationship[]}>({registry: [], relationships: []});
  const [auditStream, setAuditStream] = useState<Phase10Audit[]>([]);
  const [flagsData, setFlagsData] = useState<Phase10FlagsRes | null>(null);

  // Phase 10.75 Governance Data
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [history, setHistory] = useState<DecisionHistory[]>([]);

  // Phase 10.8 Stability Data
  const [stabilityData, setStabilityData] = useState<StabilityOverview | null>(null);

  const fetchStabilityData = async () => {
    try {
      const res = await fetch('/api/suos/stability/overview', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      setStabilityData(data);
    } catch (e) {
      console.error(e);
    }
  };

  const createSnapshot = async () => {
    const name = prompt('Enter snapshot name:');
    if (!name) return;
    await fetch('/api/suos/stability/snapshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name })
    });
    fetchStabilityData();
  };

  const resolveConflict = async (id: string) => {
    const resolution = prompt('Enter resolution strategy (e.g. MERGED, HUMAN_OVERRIDE):');
    if (!resolution) return;
    await fetch(`/api/suos/stability/resolve-conflict/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ resolution })
    });
    fetchStabilityData();
  };

  // Phase 10.9 Cognitive Data
  const [cognitiveData, setCognitiveData] = useState<CognitiveOverview | null>(null);

  // Phase 10.9.5 UI Stabilization Data
  const [uiStabilizationData, setUiStabilizationData] = useState<UIStabilizationOverview | null>(null);

  const fetchUiStabilizationData = async () => {
    try {
      const res = await fetch('/api/suos/ui-stabilization/overview', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      setUiStabilizationData(data);
    } catch (e) {
      console.error(e);
    }
  };

  const runUiAudit = async () => {
    await fetch('/api/suos/ui-stabilization/run-audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    });
    fetchUiStabilizationData();
  };

  // Phase 10.95 AI Containment Data
  const [aiContainmentData, setAiContainmentData] = useState<AIContainmentOverview | null>(null);

  const fetchAiContainmentData = async () => {
    try {
      const res = await fetch('/api/suos/ai-containment/overview', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      setAiContainmentData(data);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleAIKillSwitch = async () => {
    await fetch('/api/suos/ai-containment/kill-switch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    });
    fetchAiContainmentData();
  };

  const testBoundaryGate = async () => {
    const action = prompt('Enter action type to simulate (e.g., AUTO_EXECUTE or SUGGEST):');
    if (!action) return;
    const res = await fetch('/api/suos/ai-containment/test-boundary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ action })
    });
    const result = await res.json();
    alert(`Allowed: ${result.allowed}\nReason: ${result.reason}`);
    fetchAiContainmentData();
  };

  // Phase 11 Offline AI Governance Data
  const [phase11Data, setPhase11Data] = useState<Phase11Overview | null>(null);

  const fetchPhase11Data = async () => {
    try {
      const res = await fetch('/api/suos/phase11/overview', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      setPhase11Data(data);
    } catch (e) {
      console.error(e);
    }
  };

  const simulatePhase11Impact = async () => {
    const action = prompt('Enter a decision to simulate (e.g., "Suspend student std-001"):');
    if (!action) return;
    await fetch('/api/suos/phase11/simulate-impact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ action })
    });
    fetchPhase11Data();
  };

  const fetchCognitiveData = async () => {
    try {
      const res = await fetch('/api/suos/cognitive/overview', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      setCognitiveData(data);
    } catch (e) {
      console.error(e);
    }
  };

  const simulateCognitiveDecision = async () => {
    const action = prompt('Enter a decision action to simulate (e.g., "Suspend Student std-001"):');
    if (!action) return;
    await fetch('/api/suos/cognitive/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ action })
    });
    fetchCognitiveData();
  };

  const toggleEmergencyThrottle = async () => {
    await fetch('/api/suos/cognitive/governor/throttle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    });
    fetchCognitiveData();
  };

  const fetchGovernanceData = async () => {
    try {
      const p1 = fetch('/api/suos/governance/suggestions', { headers: { 'Authorization': `Bearer ${token}` } }).then(r=>r.json());
      const p2 = fetch('/api/suos/governance/history', { headers: { 'Authorization': `Bearer ${token}` } }).then(r=>r.json());
      const [sug, hist] = await Promise.all([p1, p2]);
      setSuggestions(sug);
      setHistory(hist);
    } catch (e) {
      console.error(e);
    }
  };

  const decideSuggestion = async (id: string, decision: string) => {
    const reason = prompt(`Please provide a reason for deciding to ${decision} this suggestion:`);
    if (reason === null) return;
    
    await fetch(`/api/suos/governance/suggestions/${id}/decide`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ decision, reason })
    });
    fetchGovernanceData();
  };

  const fetchPhase10Data = async () => {
    try {
      const p1 = fetch('/api/suos/phase10-registry', { headers: { 'Authorization': `Bearer ${token}` } }).then(r=>r.json());
      const p2 = fetch('/api/suos/phase10-audit-stream', { headers: { 'Authorization': `Bearer ${token}` } }).then(r=>r.json());
      const p3 = fetch('/api/suos/phase10-flags', { headers: { 'Authorization': `Bearer ${token}` } }).then(r=>r.json());
      const [reg, aud, flg] = await Promise.all([p1, p2, p3]);
      setRegistryData(reg);
      setAuditStream(aud);
      setFlagsData(flg);
    } catch (e) {
      console.error(e);
    }
  };

  const togglePhase10Flag = async (module: string) => {
    const response = await fetch('/api/suos/phase10-flags/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ module })
    });
    if (response.ok) {
      fetchPhase10Data();
    }
  };

  const toggleSafeMode = async (module: string) => {
    const response = await fetch('/api/suos/phase10-safemode/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ module })
    });
    if (response.ok) {
      fetchPhase10Data();
    }
  };

  // Load Observability Stats
  const fetchObservability = async () => {
    try {
      const response = await fetch('/api/suos/observability', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setObserverStats(data);
      }
    } catch (err) {
      console.error("Failed to load SUOS observability metrics: ", err);
    }
  };

  // Load Legacy Health Diagnostics
  const fetchHealthDiagnostics = async () => {
    setError(null);
    try {
      const response = await fetch('/api/admin/system-health', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setHealthData(data);
      }
    } catch (err: any) {
      setError(err?.message || 'Error occurred while contacting central database diagnostics.');
    } finally {
      setHealthLoading(false);
    }
  };

  // Integrity Scanner
  const fetchIntegrityScan = async () => {
    setScanning(true);
    try {
      const response = await fetch('/api/suos/integrity/scan', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setAnomalies(data.anomalies || []);
      }
    } catch (err) {
      console.error("Failed to scan integrity: ", err);
    } finally {
      setScanning(false);
    }
  };

  // Graph sync
  const fetchIdentityGraph = async () => {
    setGraphLoading(true);
    try {
      const response = await fetch('/api/suos/graph', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setGraphData(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGraphLoading(false);
    }
  };

  // Rules List
  const fetchRules = async () => {
    setRulesLoading(true);
    try {
      const response = await fetch('/api/suos/rules', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setRules(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRulesLoading(false);
    }
  };

  // Toggle rule
  const toggleRule = async (ruleKey: string) => {
    try {
      const response = await fetch('/api/suos/rules/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ key: ruleKey })
      });
      if (response.ok) {
        fetchRules();
        fetchObservability();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Events loader
  const fetchEvents = async () => {
    setEventsLoading(true);
    try {
      const response = await fetch('/api/suos/events', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEventsLoading(false);
    }
  };

  // Emit event trigger
  const handleEmitEvent = async () => {
    setEmitting(true);
    setEmitSuccess(null);
    try {
      let parsedMeta = {};
      try {
        parsedMeta = JSON.parse(simulateMeta);
      } catch (e) {
        alert("Metadata JSON syntax has formatting issues. Correct syntax before emitting.");
        setEmitting(false);
        return;
      }

      const response = await fetch('/api/suos/events/emit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          eventType: simulateType,
          title: `Simulator: Emitted ${simulateType}`,
          message: simulateMsg,
          metadata: parsedMeta
        })
      });

      if (response.ok) {
        setEmitSuccess(`Successfully dispatched "${simulateType}" standard schema event onto Central Bus.`);
        fetchEvents();
        fetchObservability();
        setTimeout(() => setEmitSuccess(null), 4000);
      } else {
        const errData = await response.json();
        alert(`Validation Error: ${errData.error}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEmitting(false);
    }
  };

  // Automated self healing trigger
  const runSelfHealing = async () => {
    setIsHealing(true);
    setHealReport(null);
    try {
      const response = await fetch('/api/suos/integrity/heal', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setHealReport(data.message);
        fetchIntegrityScan();
        fetchObservability();
        fetchHealthDiagnostics();
        setTimeout(() => setHealReport(null), 5000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsHealing(false);
    }
  };

  useEffect(() => {
    fetchObservability();
    fetchHealthDiagnostics();
    fetchIntegrityScan();
    fetchIdentityGraph();
    fetchRules();
    fetchEvents();
    fetchPhase10Data();
    fetchGovernanceData();
    fetchStabilityData();
    fetchCognitiveData();
    fetchUiStabilizationData();
    fetchAiContainmentData();
    fetchPhase11Data();
  }, [token]);

  const getPercentageColor = (score: number) => {
    if (score >= 90) return 'text-emerald-500 bg-emerald-50 border-emerald-150';
    if (score >= 70) return 'text-amber-500 bg-amber-50 border-amber-150';
    return 'text-rose-500 bg-rose-50 border-rose-150';
  };

  const getSystemPristineRating = (): { score: number; color: string; label: string } => {
    if (!healthData) return { score: 100, color: 'text-emerald-500', label: 'Optimal' };
    let score = 100;
    let criticals = 0;
    let warnings = 0;

    Object.entries(healthData).forEach(([_, cat]: [string, any]) => {
      criticals += (cat.issues || []).filter((i: any) => i.level === 'CRITICAL').length;
      warnings += (cat.issues || []).filter((i: any) => i.level === 'WARNING').length;
    });

    score = Math.max(20, 100 - (criticals * 15) - (warnings * 5));
    const label = score >= 90 ? 'SYS_HEALTHY' : (score >= 70 ? 'STABILIZATION_REQUIRED' : 'CRITICAL_INTERVENTIONS_REQUIRED');
    return { score, color: getPercentageColor(score), label };
  };

  const pristineRating = getSystemPristineRating();

  const diagnosticsCategories = [
    { key: 'topology', label: 'Campus Topology', icon: Building2, desc: 'Buildings, Rooms dependency constraint mapping' },
    { key: 'timetable', label: 'Timetable Scheduling', icon: Clock, desc: 'Double booking checks and venue state validations' },
    { key: 'exam', label: 'Examination & Sessions', icon: Calendar, desc: 'Evaluations overlap, capacity and rooms checks' },
    { key: 'academic', label: 'Academic Structures', icon: GraduationCap, desc: 'Orphan levels, program nodes, and curriculum' },
    { key: 'finance', label: 'Finance Ledger', icon: DollarSign, desc: 'Invoice checks, entry ledgers, and matching student credit balance' },
    { key: 'library', label: 'Library Registers', icon: BookOpen, desc: 'Fines, borrowing copies check and clearance exceptions' },
    { key: 'hostel', label: 'Hostel Modules', icon: Bed, desc: 'Bed capacity, room allocations and corresponding fee records' },
    { key: 'transport', label: 'Transit Routing', icon: Bus, desc: 'Driver assignments, route lines and transport fee invoices' },
  ];

  // Filtering Identity Graph
  const filteredNodes = graphData ? graphData.nodes.filter(node => {
    const matchesType = selectedGraphType === 'ALL' || node.type === selectedGraphType;
    const matchesSearch = node.label.toLowerCase().includes(searchGraphTerm.toLowerCase()) || 
                          node.id.toLowerCase().includes(searchGraphTerm.toLowerCase()) ||
                          JSON.stringify(node.meta).toLowerCase().includes(searchGraphTerm.toLowerCase());
    return matchesType && matchesSearch;
  }) : [];

  return (
    <div id="suos-executive-dashboard" className="space-y-6">
      {/* Dynamic Brand Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 border border-slate-800 relative overflow-hidden shadow-xl">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
          <Server size={320} className="text-white animate-pulse" />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="max-w-xl">
            <div className="flex items-center gap-2.5 mb-2.5">
              <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-indigo-500/25 text-indigo-300 border border-indigo-500/30">
                <Sparkles size={11} /> Enterprise Operating Kernel
              </span>
              <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded-full font-mono border border-emerald-900 font-extrabold uppercase">
                SUOS v1.0.8 Active
              </span>
            </div>

            <h2 className="text-3xl font-extrabold tracking-tight mb-2.5 font-sans leading-none text-white/90">
              Smart University Operating System
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed max-w-lg">
              Dynamic orchestration architecture running a synchronized Global Entity Graph, Canonical Identity registries, a reactive event-driven system brain, and fully customizable rules engine layers.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-2xl border text-center ${pristineRating.color} min-w-[150px] shadow-sm`}>
              <div className="text-2xl font-black font-mono tracking-tight">{pristineRating.score}%</div>
              <div className="text-[9px] font-bold uppercase tracking-wider mt-0.5 text-slate-500 block">Pristine Health Index</div>
              <div className="text-[10px] text-slate-600 mt-1 font-mono">{pristineRating.label}</div>
            </div>

            <button
              id="suos-global-refresh-btn"
              onClick={() => {
                fetchObservability();
                fetchHealthDiagnostics();
                fetchIntegrityScan();
                fetchIdentityGraph();
                fetchRules();
                fetchEvents();
              }}
              className="flex items-center gap-2 py-3 px-5 rounded-2xl text-xs font-extrabold text-white bg-indigo-650 hover:bg-indigo-750 transition-all shadow-md transform active:scale-95 border-none cursor-pointer"
            >
              <RefreshCw size={14} className="animate-spin-slow" />
              Pulse Scan Sync
            </button>
          </div>
        </div>
      </div>

      {/* Main Orchestrator Segment Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSegment('metrics')}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
            activeSegment === 'metrics'
              ? 'bg-indigo-50 text-indigo-700 font-extrabold shadow-sm'
              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
          }`}
        >
          <Activity size={15} />
          Observability metrics
        </button>

        <button
          onClick={() => setActiveSegment('identity')}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
            activeSegment === 'identity'
              ? 'bg-indigo-50 text-indigo-700 font-extrabold shadow-sm'
              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
          }`}
        >
          <Network size={15} />
          Canonical Entity Graph
        </button>

        <button
          onClick={() => setActiveSegment('bus')}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
            activeSegment === 'bus'
              ? 'bg-indigo-50 text-indigo-700 font-extrabold shadow-sm'
              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
          }`}
        >
          <Server size={15} />
          Reactive Event Bus
        </button>

        <button
          onClick={() => setActiveSegment('rules')}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
            activeSegment === 'rules'
              ? 'bg-indigo-50 text-indigo-700 font-extrabold shadow-sm'
              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
          }`}
        >
          <Sliders size={15} />
          Governance Rules Engine
        </button>

        <button
          onClick={() => setActiveSegment('integrity')}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
            activeSegment === 'integrity'
              ? 'bg-rose-50 text-rose-700 font-extrabold shadow-sm'
              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
          }`}
        >
          <ShieldAlert size={15} className={anomalies.length > 0 ? "text-rose-500 animate-bounce" : ""} />
          Integrity & Self Healing
          {anomalies.length > 0 && (
            <span className="bg-rose-600 text-white font-mono text-[9px] px-1.5 py-0.2 rounded-full font-bold ml-1">
              {anomalies.length}
            </span>
          )}
        </button>

        <button
          onClick={() => { setActiveSegment('hardening'); fetchPhase10Data(); }}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
            activeSegment === 'hardening'
              ? 'bg-indigo-50 text-indigo-700 font-extrabold shadow-sm'
              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
          }`}
        >
          <Key size={15} />
          Phase 10.5 Hardening
        </button>

        <button
          onClick={() => { setActiveSegment('governance'); fetchGovernanceData(); }}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
            activeSegment === 'governance'
              ? 'bg-indigo-50 text-indigo-700 font-extrabold shadow-sm'
              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
          }`}
        >
          <BrainCircuit size={15} />
          Phase 10.75 Governance
        </button>

        <button
          onClick={() => { setActiveSegment('stability'); fetchStabilityData(); }}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
            activeSegment === 'stability'
              ? 'bg-indigo-50 text-indigo-700 font-extrabold shadow-sm'
              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
          }`}
        >
          <HardDrive size={15} />
          Pre-Phase 11 Stability
        </button>

        <button
          onClick={() => { setActiveSegment('cognitive'); fetchCognitiveData(); }}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
            activeSegment === 'cognitive'
              ? 'bg-indigo-50 text-indigo-700 font-extrabold shadow-sm'
              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
          }`}
        >
          <Microscope size={15} />
          Phase 10.9 Cognitive Model
        </button>

        <button
          onClick={() => { setActiveSegment('ui-stabilization'); fetchUiStabilizationData(); }}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
            activeSegment === 'ui-stabilization'
              ? 'bg-indigo-50 text-indigo-700 font-extrabold shadow-sm'
              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
          }`}
        >
          <CheckSquare size={15} />
          Phase 10.9.5 Final UI Checks
        </button>

        <button
          onClick={() => { setActiveSegment('ai-containment'); fetchAiContainmentData(); }}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
            activeSegment === 'ai-containment'
              ? 'bg-indigo-50 text-indigo-700 font-extrabold shadow-sm'
              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
          }`}
        >
          <ShieldAlert size={15} />
          Phase 10.95 AI Containment
        </button>

        <button
          onClick={() => { setActiveSegment('phase11'); fetchPhase11Data(); }}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
            activeSegment === 'phase11'
              ? 'bg-amber-50 text-amber-900 font-extrabold shadow-sm ring-1 ring-amber-500/20'
              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
          }`}
        >
          <Brain size={15} className="text-amber-600" />
          Phase 11 Offline AI Governance
        </button>
      </div>

      {/* SEGMENT 1: METRICS & OBSERVABILITY */}
      {activeSegment === 'metrics' && (
        <div className="space-y-6">
          {/* Executive KPI Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block font-semibold">Connective Density</span>
              <span className="text-2xl font-black text-slate-900 tracking-tight block mt-1 font-mono">
                {observerStats?.graphDensity || '0.00'}
              </span>
              <span className="text-[10px] text-slate-450 block mt-1">Relations / Entity node</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block font-semibold">Active Event Stream</span>
              <span className="text-2xl font-black text-slate-900 tracking-tight block mt-1 font-mono">
                {observerStats?.totalEvents || 0}
              </span>
              <span className="text-[10px] text-emerald-600 block mt-1">✓ System Bus Online</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block font-semibold">Configured Active Rules</span>
              <span className="text-2xl font-black text-slate-900 tracking-tight block mt-1 font-mono">
                {observerStats?.activeRulesCount || 0} / {observerStats?.totalRules || 0}
              </span>
              <span className="text-[10px] text-slate-450 block mt-1">Dynamic rule engine active</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block font-semibold">Entity Graph Size</span>
              <span className="text-2xl font-black text-slate-900 tracking-tight block mt-1 font-mono">
                {observerStats?.graphNodesCount || 0} Nodes
              </span>
              <span className="text-[10px] text-slate-450 block mt-1">
                {observerStats?.graphEdgesCount || 0} Relation Edges Linked
              </span>
            </div>
          </div>

          {/* Sub-modules Health Diagnostics Ticker */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-4">
              <h3 className="text-xs font-bold text-slate-505 uppercase tracking-wider font-mono">
                Cross-Module Relational Health Units
              </h3>

              <div id="sub-modules-grid" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {diagnosticsCategories.map((cat) => {
                  const data = healthData ? (healthData as any)[cat.key] as HealthCategory : null;
                  const active = data?.enabled !== false;
                  const status = data ? data.status : 'HEALTHY';
                  
                  let bgCol = "bg-emerald-50/25 hover:bg-emerald-50/55 border-emerald-100";
                  let indCol = "bg-emerald-500";
                  let badgCol = "bg-emerald-100 text-emerald-800 border-emerald-200";

                  if (status === 'CRITICAL') {
                    bgCol = "bg-rose-50/45 hover:bg-rose-50/75 border-rose-100";
                    indCol = "bg-rose-500";
                    badgCol = "bg-rose-100 text-rose-800 border-rose-200";
                  } else if (status === 'WARNING') {
                    bgCol = "bg-amber-50/45 hover:bg-amber-50/75 border-amber-100";
                    indCol = "bg-amber-500";
                    badgCol = "bg-amber-100 text-amber-800 border-amber-200";
                  }

                  const Icon = cat.icon;
                  return (
                    <div
                      key={cat.key}
                      onClick={() => setSelectedHealthCategory(selectedHealthCategory === cat.key ? null : cat.key)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${bgCol} ${
                        selectedHealthCategory === cat.key ? 'ring-2 ring-indigo-500 border-transparent bg-white shadow-md' : 'shadow-none'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="p-2 bg-white border border-slate-150 rounded-xl shadow-xs group-hover:scale-105 transition-transform">
                          <Icon size={16} className="text-slate-700" />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[8.5px] font-bold uppercase tracking-wider py-0.5 px-2 rounded-full border ${badgCol}`}>
                            {status}
                          </span>
                          <span className={`w-2 h-2 rounded-full ${indCol}`} />
                        </div>
                      </div>

                      <h4 className="text-xs font-extrabold text-slate-900">{cat.label}</h4>
                      <p className="text-[10.5px] text-slate-500 leading-relaxed mt-0.5">{cat.desc}</p>
                      
                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2.5 mt-2 border-t border-slate-200/50">
                        <span className="font-mono">
                          {data?.count === 0 ? '✓ Relational Strict' : `⚠️ ${data?.count} Exception logs`}
                        </span>
                        <span className="text-indigo-600 font-bold inline-flex items-center gap-1">
                          Inspect <ArrowRight size={10} />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 sticky top-6 shadow-sm min-h-[400px] flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
                    <HeartPulse size={15} className="text-slate-800" />
                    <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-wider font-mono">
                      Module Incident Inspector
                    </h3>
                  </div>

                  {!selectedHealthCategory ? (
                    <div className="py-16 text-center">
                      <ShieldAlert size={32} className="text-slate-350 mx-auto mb-3" />
                      <h4 className="text-xs font-bold text-slate-800 mb-1">Click a category card</h4>
                      <p className="text-[10px] text-slate-500 max-w-[200px] mx-auto leading-relaxed">
                        Select any cross-module relational checkpoint card to query individual row constraints and exceptions.
                      </p>
                    </div>
                  ) : (
                    <AnimatePresence mode="wait">
                      {(() => {
                        const catKey = selectedHealthCategory;
                        const catMeta = diagnosticsCategories.find(c => c.key === catKey);
                        const catData = healthData ? (healthData as any)[catKey] as HealthCategory : null;

                        if (!catMeta || !catData) return null;

                        return (
                          <motion.div
                            key={catKey}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="space-y-3"
                          >
                            <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl">
                              <h4 className="text-xs font-extrabold text-slate-900">{catMeta.label}</h4>
                              <span className="text-[9px] font-mono text-slate-400">Total reported discrepancies: {catData.count}</span>
                            </div>

                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                              {catData.issues.length === 0 ? (
                                <div className="text-center p-6 border border-dashed border-emerald-150 rounded-xl bg-emerald-50/10">
                                  <CheckCircle2 size={24} className="text-emerald-500 mx-auto mb-2" />
                                  <h5 className="text-[10.5px] font-bold text-emerald-800">State Is Strict</h5>
                                  <p className="text-[9.5px] text-emerald-600 leading-relaxed mt-1">
                                    No orphan configurations or anomalies were registered. Perfect integrity mapping.
                                  </p>
                                </div>
                              ) : (
                                catData.issues.map((iss, iIdx) => (
                                  <div
                                    key={iIdx}
                                    className={`p-2.5 rounded-xl border text-left text-[11px] leading-relaxed ${
                                      iss.level === 'CRITICAL'
                                        ? 'bg-rose-50 border-rose-100 text-rose-900'
                                        : 'bg-amber-50 border-amber-100 text-amber-900'
                                    }`}
                                  >
                                    <div className="font-extrabold text-[9px] uppercase tracking-wider mb-0.5 flex items-center gap-1">
                                      <span className={`w-1.5 h-1.5 rounded-full ${iss.level === 'CRITICAL' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                                      {iss.level} Exception
                                    </div>
                                    <p className="text-slate-700 leading-normal">{iss.msg}</p>
                                  </div>
                                ))
                              )}
                            </div>
                          </motion.div>
                        );
                      })()}
                    </AnimatePresence>
                  )}
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mt-4">
                  <div className="text-[9.5px] font-bold text-slate-900 uppercase tracking-wider mb-0.5 font-mono">
                    System Control Guidance
                  </div>
                  <p className="text-[9.5px] text-slate-505 leading-relaxed">
                    Module integrity violations indicate broken relational mappings. Trigger automated healing under the **Integrity & Self Healing** tab to instantly align database tables.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SEGMENT 2: CANONICAL GLOBAL ENTITY GRAPH */}
      {activeSegment === 'identity' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-205 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">
                Unified Connected Entity Graph
              </h4>
              <p className="text-[10px] text-slate-450 mt-1">
                Visualizing physical and digital resource maps. In SUOS, all databases are mapped as nodes of a single canonical graph linked by bidirectional relationship keys.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-slate-400 h-3.5 w-3.5" />
                <input
                  type="text"
                  placeholder="Query Graph Nodes..."
                  value={searchGraphTerm}
                  onChange={(e) => setSearchGraphTerm(e.target.value)}
                  className="pl-9 pr-4 py-1.5 w-48 text-[11px] bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <select
                value={selectedGraphType}
                onChange={(e) => setSelectedGraphType(e.target.value)}
                className="bg-white border border-slate-200 text-[11px] p-1.5 rounded-xl text-slate-700 font-semibold focus:outline-none"
              >
                <option value="ALL">ALL NODES</option>
                <option value="STUDENT">STUDENTS</option>
                <option value="STAFF">STAFF & FACULTY</option>
                <option value="ROOM">FACILITY ROOMS</option>
                <option value="ASSET">PROCURED ASSETS</option>
                <option value="INVOICE">FEE INVOICES</option>
                <option value="DEPARTMENT">DEPARTMENTS</option>
                <option value="PROGRAM">SYLLABUS PROGRAMS</option>
              </select>
            </div>
          </div>

          {graphLoading ? (
            <div className="py-24 text-center">
              <Network className="h-10 w-10 text-indigo-600 animate-pulse mx-auto mb-4" />
              <p className="text-xs text-slate-500 font-medium">Re-indexing entity relationships map...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Nodes list */}
              <div className="lg:col-span-7 space-y-3">
                <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                  Indexed Graph Nodes ({filteredNodes.length})
                </h5>

                <div className="space-y-2 max-h-[480px] overflow-y-auto pr-2">
                  {filteredNodes.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-xl text-xs text-slate-500">
                      No matching registered SUOS graph nodes found.
                    </div>
                  ) : (
                    filteredNodes.map((node) => (
                      <div
                        key={node.id}
                        className="bg-slate-50/50 hover:bg-slate-50 border border-slate-150 rounded-xl p-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-white border border-slate-200 text-indigo-700 font-mono text-xs flex items-center justify-center font-black">
                            {node.type.substring(0,2)}
                          </div>
                          <div>
                            <span className="font-extrabold text-xs text-slate-900 block">{node.label}</span>
                            <span className="text-[9px] text-slate-400 font-mono block">Node ID: {node.id}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1.5 items-center">
                          <span className="text-[8.5px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-150 py-0.5 px-2 rounded-full font-mono uppercase">
                            {node.type}
                          </span>
                          {Object.entries(node.meta || {}).map(([mK, mV]: [string, any]) => (
                            <span key={mK} className="text-[8.5px] text-slate-505 font-mono py-0.5 px-1.5 bg-white border border-slate-200 rounded">
                              {mK}: {String(mV)}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Connected edges relation ledger */}
              <div className="lg:col-span-5 space-y-3">
                <h5 className="text-[10px] font-bold text-slate-505 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Share2 size={12} className="text-slate-500" />
                  Graph Edges Relations ({graphData?.edges?.length || 0})
                </h5>

                <div className="bg-slate-900 rounded-2xl p-4 text-sky-400 font-mono text-[10.5px] max-h-[480px] overflow-y-auto space-y-2">
                  <div className="border-b border-slate-800 pb-2 mb-2 flex justify-between items-center">
                    <span className="text-xs text-slate-200 uppercase tracking-wider font-bold">Relational Bindings Stream</span>
                    <span className="text-[9px] bg-slate-800 text-sky-300 font-mono px-2 py-0.5 rounded border border-slate-750">UOS_EDGES_ACTIVE</span>
                  </div>

                  {!graphData?.edges || graphData.edges.length === 0 ? (
                    <div className="text-slate-505 italic text-center py-16">
                      No connectivity edges resolved. Run pulse scan sync to associate entities graph.
                    </div>
                  ) : (
                    graphData.edges.map((edge) => {
                      // Lookup node details
                      const srcNode = graphData.nodes.find(n => n.id === edge.source);
                      const tgtNode = graphData.nodes.find(n => n.id === edge.target);

                      return (
                        <div key={edge.id} className="p-2 bg-slate-850 rounded border border-slate-800 leading-normal hover:border-slate-700 transition-colors">
                          <div className="text-sky-350 text-[10px] flex items-center justify-between">
                            <span>Relationship Type:</span>
                            <span className="text-emerald-400 font-bold text-[9px] uppercase">{edge.relationship}</span>
                          </div>
                          <div className="mt-1 leading-snug">
                            <span className="text-white hover:underline cursor-pointer">{srcNode?.label || edge.source}</span>
                            <span className="text-slate-450 text-[10px] mx-1">➜</span>
                            <span className="text-indigo-300 hover:underline cursor-pointer">{tgtNode?.label || edge.target}</span>
                          </div>
                          <div className="text-[8px] text-slate-500 mt-0.5 select-all">
                            ID: {edge.id}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>
          )}
        </div>
      )}

      {/* SEGMENT 3: SYSTEM EVENT BUS LOG */}
      {activeSegment === 'bus' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Manual Schema Event Dispatch Deck */}
          <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-205 shadow-sm space-y-4 h-fit">
            <div>
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">
                System Event Dispatches
              </h4>
              <p className="text-[10px] text-slate-450 mt-1">
                Dispatch verified operations to the system bus and evaluate how reactive rules handle transitions automatically.
              </p>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-[9px] text-slate-500 font-mono block font-bold">EVENT SCHEMA TYPE (STRICT)</label>
                <select
                  value={simulateType}
                  onChange={(e) => {
                    setSimulateType(e.target.value);
                    if (e.target.value === 'student.admitted') {
                      setSimulateMsg('Enrolled freshman student Alan Turing under School of Artificial Intelligence');
                      setSimulateMeta('{"studentId": "std-004", "amount": 0}');
                    } else if (e.target.value === 'payment.received') {
                      setSimulateMsg('Cleared $50,000 ledger balance for student ID std-001 (Newton) via online banking gateway');
                      setSimulateMeta('{"studentId": "std-001", "amount": 50000}');
                    } else if (e.target.value === 'invoice.created') {
                      setSimulateMsg('Dispatched statutory tuition fee invoice of $75,000 to student block std-001');
                      setSimulateMeta('{"studentId": "std-001", "invoiceId": "inv-903", "amount": 75000}');
                    } else {
                      setSimulateMsg(`Triggering business transaction log for ${e.target.value}`);
                      setSimulateMeta('{"id": "entity-03", "schoolId": "sch-01"}');
                    }
                  }}
                  className="bg-white border text-[11px] border-slate-250 roundedblock w-full p-2 font-semibold text-slate-800"
                >
                  <option value="student.admitted">student.admitted (Enrolment Gate)</option>
                  <option value="invoice.created">invoice.created (Bill Ledger)</option>
                  <option value="payment.received">payment.received (Cleared Credit)</option>
                  <option value="asset.assigned">asset.assigned (Audit Inventory)</option>
                  <option value="room.booked">room.booked (Facilities Lock)</option>
                  <option value="exam.scheduled">exam.scheduled (Examination Matrix)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-slate-500 font-mono block font-bold">MESSAGE PAYLOAD</label>
                <textarea
                  rows={2}
                  value={simulateMsg}
                  onChange={(e) => setSimulateMsg(e.target.value)}
                  className="w-full text-[11px] p-2 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-slate-500 font-mono block font-bold">SCHEMA METADATA (JSON COMPLIANT)</label>
                <textarea
                  rows={3}
                  value={simulateMeta}
                  onChange={(e) => setSimulateMeta(e.target.value)}
                  className="w-full font-mono text-[10px] text-sky-400 bg-slate-900 p-2 border border-slate-950 rounded focus:outline-none"
                />
              </div>

              {emitSuccess && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-150 rounded text-emerald-800 text-[10px] font-medium leading-relaxed">
                  ✓ {emitSuccess}
                </div>
              )}

              <button
                onClick={handleEmitEvent}
                disabled={emitting || !simulateMsg}
                className={`w-full py-2.5 text-xs text-center font-bold text-white rounded cursor-pointer select-none border-none transition-all ${
                  emitting ? 'bg-slate-350 cursor-not-allowed' : 'bg-indigo-650 hover:bg-indigo-750 shadow-md'
                }`}
              >
                {emitting ? 'Broadcasting stream...' : 'Emit System Bus Event'}
              </button>
            </div>
          </div>

          {/* Connected live events bus stream */}
          <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-205 shadow-sm space-y-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Activity size={16} className="text-red-500 animate-pulse" />
                Live Event Streams Ticker
              </h4>
              <p className="text-[10px] text-slate-450 mt-1">
                Central system operations log stream. Emitted events are caught by listening modules in real-time, executing database state alignments and state machines instantly.
              </p>
            </div>

            {eventsLoading ? (
              <div className="py-24 text-center">
                <Server size={32} className="h-10 w-10 text-indigo-600 animate-pulse mx-auto mb-4" />
                <p className="text-xs text-slate-500 font-medium">Connecting to system-event bus sockets...</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-2">
                {events.length === 0 ? (
                  <div className="p-12 text-center text-slate-455 text-xs font-medium">
                    Central Event Bus is silent. Emit a simulated event on the left side to register operations!
                  </div>
                ) : (
                  events.map((evt) => (
                    <div key={evt.id} className="border border-slate-150 rounded-xl p-3.5 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col justify-between gap-3 font-sans">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[11px] font-extrabold text-slate-900">{evt.title}</span>
                            <span className="bg-slate-200 text-slate-700 text-[8.5px] font-bold py-0.5 px-2 rounded-full font-mono uppercase tracking-wider">
                              {evt.eventType}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-550 leading-relaxed mt-1 text-slate-700">{evt.message}</p>
                        </div>
                        <span className="text-[9px] text-slate-400 font-mono">{new Date(evt.timestamp).toLocaleTimeString()}</span>
                      </div>

                      {evt.metadata && Object.keys(evt.metadata).length > 0 && (
                        <div className="p-2.5 bg-slate-900 rounded font-mono text-[9.5px] text-sky-400 select-all max-h-[80px] overflow-hidden">
                          {JSON.stringify(evt.metadata)}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

        </div>
      )}

      {/* SEGMENT 4: PROCESS RULES ENGINE CONTEXT */}
      {activeSegment === 'rules' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-205 shadow-sm space-y-6">
          <div>
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">
              SUOS Configurable Governance Rules Engine
            </h4>
            <p className="text-[10px] text-slate-450 mt-1">
              Configure system constraints dynamically. System validators reference these parameters across modules rather than executing compiled, hardcoded checks.
            </p>
          </div>

          {rulesLoading ? (
            <div className="py-24 text-center">
              <Sliders className="h-10 w-10 text-indigo-600 animate-pulse mx-auto mb-4" />
              <p className="text-xs text-slate-500 font-medium">Querying configurable operating rules...</p>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs divide-y divide-slate-150">
                <thead className="bg-slate-50 text-slate-500 font-mono uppercase tracking-wider text-[9px] font-bold">
                  <tr>
                    <th className="p-4">Governance Rule Key / Description</th>
                    <th className="p-4">Evaluation Severity</th>
                    <th className="p-4">Automation State</th>
                    <th className="p-4 text-right">Integrity Override Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {rules.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-500">
                        No configurable operating system rules found.
                      </td>
                    </tr>
                  ) : (
                    rules.map((rule) => (
                      <tr key={rule.key} className="hover:bg-slate-50/55 transition-colors">
                        <td className="p-4 max-w-sm space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-950 block text-[11.5px]">{rule.title}</span>
                            <span className="font-mono text-[9px] text-slate-400 bg-slate-100 px-1 py-0.2 rounded">
                              {rule.key}
                            </span>
                          </div>
                          <span className="text-[10.5px] text-slate-500 leading-relaxed block">
                            {rule.desc}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 py-0.5 px-2 rounded-full text-[9px] font-extrabold uppercase font-mono border ${
                            rule.severity === 'CRITICAL' 
                              ? 'bg-rose-50 text-rose-700 border-rose-150' 
                              : rule.severity === 'WARNING' 
                              ? 'bg-amber-50 text-amber-700 border-amber-150' 
                              : 'bg-indigo-50 text-indigo-750 border-indigo-150'
                          }`}>
                            {rule.severity}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5 font-mono text-[10.5px] font-black">
                            <span className={`h-2.5 w-2.5 rounded-full ${rule.enabled ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                            {rule.enabled ? 'ACTIVE_MONITORING_ON' : 'BYPASSED'}
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => toggleRule(rule.key)}
                            className={`py-1.5 px-3 rounded-xl text-[10.5px] font-bold border-none transition-all cursor-pointer ${
                              rule.enabled
                                ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                            }`}
                          >
                            {rule.enabled ? 'Bypass rule constraint' : 'Enforce safety rule'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SEGMENT 5: COMPREHENSIVE INTEGRITY & SELF-HEALING */}
      {activeSegment === 'integrity' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-205 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">
                  SUOS Transaction Consistency Engine
                </h4>
                <p className="text-[10px] text-slate-450 mt-1">
                  Continuously scans table states for orphan relational rows, out-of-order state transitions, duplicate bookings, and financial mismatch logs.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={fetchIntegrityScan}
                  disabled={scanning}
                  className={`py-2 px-4 rounded-xl text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 transition-all border border-slate-200 cursor-pointer select-none ${
                    scanning ? 'opacity-70' : ''
                  }`}
                >
                  {scanning ? 'Running query scan...' : 'Run Diagnostics Audit Scan'}
                </button>

                <button
                  onClick={runSelfHealing}
                  disabled={isHealing}
                  className="py-2.5 px-5 rounded-2xl text-xs font-extrabold text-white bg-indigo-650 hover:bg-indigo-750 transition-all shadow-md transform active:scale-95 border-none cursor-pointer flex items-center gap-2"
                >
                  <RefreshCw size={12} className={isHealed => isHealing ? "animate-spin" : ""} />
                  {isHealing ? 'Aligning Grid Ledgers...' : 'Run Automated Self-Healing & Purge'}
                </button>
              </div>
            </div>

            {/* Micro Alerts */}
            {healReport && (
              <div className="p-4 bg-emerald-50 border border-emerald-150 rounded-xl text-emerald-800 text-xs flex items-start gap-2 font-mono">
                <ShieldCheck size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-extrabold uppercase">Consistency Realignment Success</h5>
                  <p className="text-emerald-700 text-[11px] mt-0.5 leading-relaxed">{healReport}</p>
                </div>
              </div>
            )}

            {/* List of anomalies */}
            <div className="space-y-3.5 pt-2">
              {anomalies.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-emerald-150 rounded-2xl bg-emerald-50/10">
                  <CheckCircle2 size={32} className="text-emerald-500 mx-auto mb-2" />
                  <h4 className="text-xs font-bold text-emerald-800">STATE SYNCHRONIZATION PERFECT</h4>
                  <p className="text-[10.5px] text-emerald-600 mt-1 max-w-md mx-auto leading-relaxed">
                    SUOS checks returned clean. Zero ledger misalignments, orphan program nodes, or timetable structural double-booking crashes were found in current database directories.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <h5 className="text-[10px] font-bold text-rose-500 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    Anomalies Spotted ({anomalies.length})
                  </h5>

                  <div className="space-y-2.5">
                    {anomalies.map((anom, aIdx) => (
                      <div key={aIdx} className="p-4 bg-rose-50/45 border border-rose-150 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3 transition-colors font-mono text-[11px]">
                        <div className="space-y-1 leading-normal pr-4">
                          <div className="flex items-center gap-2">
                            <span className="bg-rose-220 text-rose-800 text-[9px] font-extrabold px-2 py-0.2 rounded uppercase">
                              {anom.type}
                            </span>
                            <span className="bg-rose-120 text-rose-700 text-[9px] font-extrabold px-2 py-0.2 rounded uppercase border border-rose-200">
                              SEVERITY: {anom.severity}
                            </span>
                          </div>
                          <p className="text-slate-800 text-[11px] leading-relaxed mt-1">{anom.message}</p>
                        </div>

                        <span className="text-[10px] text-slate-400 font-mono bg-white border border-slate-200 py-1 px-2 rounded-xl shrink-0">
                          entity_id: {anom.entityId}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    {/* SEGMENT 6: PHASE 10.5 HARDENING */}
      {activeSegment === 'hardening' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-205 shadow-sm space-y-6">
            <div>
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">
                System Hardening & Enterprise Consolidation Core
              </h4>
              <p className="text-[10px] text-slate-500 mt-1">
                Unified Global Entity Registry, Automated Safe Mode Controls, and Centralized Feature Flag Enforcements.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs h-96 flex flex-col">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                  <h5 className="text-[10px] font-bold uppercase font-mono text-slate-700">Global Entity Registry</h5>
                  <p className="text-[9px] text-slate-500">Universal Source of Truth for Identities</p>
                </div>
                <div className="p-0 overflow-y-auto flex-1 bg-white">
                  <table className="w-full text-left text-xs divide-y divide-slate-150">
                    <thead className="bg-slate-50 text-slate-500 font-mono text-[8px] uppercase tracking-wider sticky top-0 z-10">
                      <tr>
                        <th className="px-3 py-2">GLOBAL ID</th>
                        <th className="px-3 py-2">TYPE</th>
                        <th className="px-3 py-2">STATUS</th>
                        <th className="px-3 py-2">MODIFIED</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-sans">
                      {registryData.registry.map(ent => (
                        <tr key={ent.global_id} className="hover:bg-slate-50">
                          <td className="px-3 py-2 font-mono text-[9px] text-slate-600">{ent.global_id}</td>
                          <td className="px-3 py-2 font-bold text-[10px] text-indigo-700">{ent.type}</td>
                          <td className="px-3 py-2 text-[9px]">
                             <span className={`px-2 py-0.5 rounded-full border ${ent.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                               {ent.status}
                             </span>
                          </td>
                          <td className="px-3 py-2 font-mono text-[8px] text-slate-400">{new Date(ent.updated_at).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs h-96 flex flex-col">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                  <h5 className="text-[10px] font-bold uppercase font-mono text-slate-700">Audit Event Stream</h5>
                  <p className="text-[9px] text-slate-500">Immutable Universal Event Logging</p>
                </div>
                <div className="p-0 overflow-y-auto flex-1 bg-slate-900 text-sky-300">
                  <ul className="divide-y divide-slate-800">
                    {auditStream.length === 0 ? (
                      <li className="p-4 text-center text-xs text-slate-600 font-mono italic">No immutable audit logs recorded yet.</li>
                    ) : (
                      auditStream.map(aud => (
                        <li key={aud.event_id} className="p-3 text-[9.5px] font-mono leading-relaxed hover:bg-slate-800 transition-colors">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-bold text-emerald-400">{aud.action}</span>
                            <span className="text-[8px] text-slate-500">{new Date(aud.timestamp).toLocaleString()}</span>
                          </div>
                          <div><span className="text-slate-400">Target Type:</span> <span className="text-white">{aud.entity_type}</span></div>
                          <div><span className="text-slate-400">Actor:</span> <span className="text-indigo-300">{aud.actor}</span></div>
                          <div className="text-[8px] text-slate-500 mt-1 select-all">EVT: {aud.event_id} ({aud.module})</div>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs flex flex-col">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                  <h5 className="text-[10px] font-bold uppercase font-mono text-slate-700 flex items-center gap-2"><Lock size={12} className="text-rose-500" /> Feature Flag Runtime Engine</h5>
                  <p className="text-[9px] text-slate-500">Enable/Disable System Segments Formally</p>
                </div>
                <div className="p-4 space-y-3 bg-white">
                  {flagsData?.feature_flag_runtime?.map(flag => (
                    <div key={flag.module} className="flex justify-between items-center p-3 border border-slate-150 rounded-xl hover:bg-slate-50">
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-800">{flag.module.toUpperCase()} MODULE</div>
                        <div className="text-[9px] text-slate-500">Security enforcement layer hook</div>
                      </div>
                      <button
                        onClick={() => togglePhase10Flag(flag.module)}
                        className={`text-[9px] font-bold font-mono px-3 py-1.5 rounded-full cursor-pointer transition-all border ${flag.enabled ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-100 border-slate-200 text-slate-500'}`}
                      >
                        {flag.enabled ? 'ACTIVE' : 'DISABLED'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-rose-200 rounded-2xl overflow-hidden shadow-xs flex flex-col bg-rose-50">
                <div className="bg-rose-100 px-4 py-3 border-b border-rose-200">
                  <h5 className="text-[10px] font-bold uppercase font-mono text-rose-800 flex items-center gap-2"><ShieldAlert size={12} /> System Safe Mode Recovery</h5>
                  <p className="text-[9px] text-rose-600">Halt operations if corruption is detected</p>
                </div>
                <div className="p-6 flex flex-col items-center justify-center text-center space-y-4">
                  <ServerCrash size={48} className={`text-rose-400 ${flagsData?.system_safe_mode?.global ? 'animate-pulse' : ''}`} />
                  <div>
                    <div className="text-sm font-black text-rose-900 uppercase">Emergency Freeze Protocol</div>
                    <p className="text-xs text-rose-700 mt-1 max-w-sm">
                      Toggle Global Safe Mode to immediately lock the Central Database against writes, reverting the entire structure to Read-Only configurations to prevent cascading failure.
                    </p>
                  </div>
                  <button
                    onClick={() => toggleSafeMode('GLOBAL')}
                    className={`mt-4 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all border-none cursor-pointer shadow-sm ${flagsData?.system_safe_mode?.global ? 'bg-rose-600 text-white' : 'bg-rose-200 text-rose-800 hover:bg-rose-300'}`}
                  >
                    {flagsData?.system_safe_mode?.global ? 'DISABLE SAFE MODE' : 'ENGAGE GLOBAL SAFE MODE'}
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* SEGMENT 7: PHASE 10.75 GOVERNANCE */}
      {activeSegment === 'governance' && (
        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
            <div className="absolute right-0 bottom-0 opacity-[0.05] pointer-events-none">
              <BrainCircuit size={280} className="text-white" />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
              <div className="max-w-xl space-y-2">
                <div className="flex items-center gap-2">
                  <Bot size={18} className="text-indigo-400" />
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                    Hybrid Governance System
                  </h4>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed font-sans mt-2">
                  The system does not manage itself autonomously. The <strong>AI Suggestion Engine</strong> generates operational advisories based on module health metrics, but humans hold ultimate control via the Governance approval layer. All enacted decisions are persisted securely in the <strong>Institutional Memory Ledger</strong> for future auditing and AI pattern refinement.
                </p>
              </div>
              <div className="flex flex-col gap-2 bg-slate-800/80 border border-slate-700/60 rounded-xl p-3">
                 <div className="text-[9px] font-bold text-indigo-300 uppercase tracking-wider font-mono">Ledger Metrics</div>
                 <div className="text-xl font-black font-mono text-white leading-none">{history.length}</div>
                 <div className="text-[9px] text-slate-400 font-sans leading-tight">Decisions finalized and<br/>recorded by humans</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* AI Suggestion Inbox */}
            <div className="lg:col-span-5 flex flex-col gap-4 border border-slate-200 rounded-2xl p-5 bg-white shadow-sm h-[600px]">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <h5 className="text-[10px] font-bold uppercase font-mono text-slate-700 flex items-center gap-1.5">
                  <MessageSquare size={13} className="text-indigo-500" /> Executive AI Inbox
                </h5>
                <span className="bg-amber-100 text-amber-800 text-[9px] px-2 py-0.5 rounded-full font-bold">{suggestions.length} Pending</span>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {suggestions.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-3 p-8 border-2 border-dashed border-slate-150 rounded-xl text-slate-400">
                     <CheckCircle2 size={32} className="text-slate-300" />
                     <div className="text-[11px] font-bold">Inbox is Clear</div>
                     <div className="text-[9.5px]">No pending system issues requiring hybrid governance intervention.</div>
                  </div>
                ) : (
                  suggestions.map(sug => (
                    <div key={sug.id} className="border border-slate-200 rounded-xl overflow-hidden shadow-xs hover:border-indigo-300 transition-colors">
                      <div className="bg-slate-50 p-3 border-b border-slate-100 flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="text-[11px] font-black text-slate-900">{sug.title}</div>
                          <div className="text-[9px] font-mono text-slate-500 bg-slate-200 inline-block px-1.5 py-0.5 rounded">{sug.mode}</div>
                        </div>
                        <div className="text-[8px] text-slate-400 whitespace-nowrap">{new Date(sug.timestamp).toLocaleTimeString()}</div>
                      </div>
                      
                      <div className="p-3 space-y-3">
                        <div className="text-[10.5px] text-slate-700 leading-relaxed font-medium">"{sug.description}"</div>

                        {/* Explanation Engine Layer */}
                        <div className="bg-indigo-50/50 p-2.5 rounded-lg border border-indigo-100 space-y-2">
                          <div className="text-[9.5px] text-indigo-900 font-semibold mb-1 flex items-center gap-1.5 border-b border-indigo-100/50 pb-1.5">
                            <BrainCircuit size={10} className="text-indigo-600" />
                            Explanation Engine Insights
                          </div>
                          <div className="text-[9.5px]">
                            <span className="font-bold text-slate-700">Why: </span>
                            <span className="text-slate-600">{sug.explanation.why}</span>
                          </div>
                          <div className="text-[9.5px]">
                            <span className="font-bold text-slate-700">Data Used: </span>
                            <span className="text-slate-600 font-mono text-[8.5px] bg-white px-1 py-[1px] rounded border border-slate-200">{sug.explanation.data_used}</span>
                          </div>
                          <div className="text-[9.5px]">
                            <span className="font-bold text-rose-700">Risk Severity: </span>
                            <span className="text-rose-600">{sug.explanation.risk}</span>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-1 border-t border-slate-100">
                          <button 
                            onClick={() => decideSuggestion(sug.id, 'APPROVE')}
                            className="flex-1 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-[9px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1">
                            <Check size={11} /> APPROVE
                          </button>
                          <button 
                             onClick={() => decideSuggestion(sug.id, 'MODIFY')}
                             className="flex-1 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-[9px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1">
                            <Bot size={11} /> MODIFY
                          </button>
                          <button 
                             onClick={() => decideSuggestion(sug.id, 'REJECT')}
                             className="flex-1 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 text-[9px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1">
                            <ServerCrash size={11} /> REJECT
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Institutional Memory Ledger */}
            <div className="lg:col-span-7 flex flex-col gap-4 border border-slate-200 rounded-2xl p-5 bg-white shadow-sm h-[600px]">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <h5 className="text-[10px] font-bold uppercase font-mono text-slate-700 flex items-center gap-1.5">
                  <Database size={13} className="text-indigo-500" /> Institutional Memory Ledger
                </h5>
                <span className="bg-slate-100 text-slate-600 text-[9px] px-2 py-0.5 rounded-full font-mono font-medium">Traceability Node: ACTIVE</span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                {history.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-400 text-xs italic">
                     No decision traces found in memory.
                  </div>
                ) : (
                  history.slice().reverse().map(h => {
                    const statusColor = h.human_decision === 'APPROVE' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 
                                        h.human_decision === 'REJECT' || h.human_decision === 'REJECTED' ? 'bg-rose-100 text-rose-800 border-rose-200' : 
                                        'bg-amber-100 text-amber-800 border-amber-200';
                                        
                    return (
                      <div key={h.id} className="flex gap-4 group">
                        <div className="flex flex-col items-center">
                           <div className={`w-6 h-6 rounded-full flex items-center justify-center border shadow-sm ${statusColor.split(' ')[0]}`}>
                              <History size={11} className={`${statusColor.split(' ')[1]}`} />
                           </div>
                           <div className="w-[1px] h-full bg-slate-200 mt-1 mb-1 group-last:hidden"></div>
                        </div>
                        <div className="flex-1 border border-slate-200 rounded-xl p-3.5 bg-slate-50/40 hover:bg-slate-50/80 transition-colors">
                           <div className="flex justify-between items-start mb-2">
                             <div className="flex items-center gap-2">
                               <span className={`px-2 py-0.5 rounded text-[8.5px] font-black uppercase font-mono border ${statusColor}`}>
                                 {h.human_decision}
                               </span>
                               <span className="text-[10px] text-slate-500 font-mono">{h.acted_by}</span>
                             </div>
                             <span className="text-[8px] text-slate-400">{new Date(h.timestamp).toLocaleString()}</span>
                           </div>
                           <div className="space-y-2">
                             <div>
                               <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest bg-slate-200/50 inline-block px-1.5 py-0.5 mb-0.5">Original AI Logic</div>
                               <div className="text-[10.5px] text-slate-700 italic border-l-2 border-indigo-200 pl-2 ml-1">{h.ai_suggestion}</div>
                             </div>
                             <div>
                               <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest bg-slate-200/50 inline-block px-1.5 py-0.5 mb-0.5">Human Rationale</div>
                               <div className="text-[10.5px] text-slate-900 font-medium pl-1.5">{h.reason}</div>
                             </div>
                             <div className="pt-2 mt-2 border-t border-slate-100">
                               <div className="text-[9px] text-slate-400 flex items-center gap-1"><Sparkles size={9} /> <strong>Trace Outcome:</strong> {h.outcome}</div>
                             </div>
                           </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* SEGMENT 8: PHASE 10.8 STABILITY */}
      {activeSegment === 'stability' && stabilityData && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-205 shadow-sm space-y-6">
            <div>
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">
                System Stability & State Resilience
              </h4>
              <p className="text-[10px] text-slate-500 mt-1">
                Offline + Sync Engine, Persistent Event Logs, Conflict Resolution, Snapshot Recovery, Data Versioning, and AI Data Quality Gates.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 flex flex-col justify-between">
                 <div>
                    <h5 className="text-[10px] font-bold uppercase font-mono text-slate-700 flex items-center gap-1.5"><WifiOff size={13} className="text-indigo-500" /> Offline Sync Engine</h5>
                    <div className="mt-3 space-y-2">
                       <div className="flex justify-between items-center text-[11px]"><span className="text-slate-500">Pending Queue:</span><span className="font-mono font-bold text-slate-800">{stabilityData.sync_queue_manager.pending}</span></div>
                       <div className="flex justify-between items-center text-[11px]"><span className="text-slate-500">Processing:</span><span className="font-mono font-bold text-indigo-600">{stabilityData.sync_queue_manager.processing}</span></div>
                       <div className="flex justify-between items-center text-[11px]"><span className="text-slate-500">Failed:</span><span className="font-mono font-bold text-rose-600">{stabilityData.sync_queue_manager.failed}</span></div>
                    </div>
                 </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 flex flex-col justify-between">
                 <div>
                    <h5 className="text-[10px] font-bold uppercase font-mono text-slate-700 flex items-center gap-1.5"><Filter size={13} className="text-emerald-500" /> AI Data Quality Gate</h5>
                    <div className="mt-3 space-y-2">
                       <div className="flex justify-between items-center text-[11px]"><span className="text-slate-500">Anomaly Filter:</span><span className="font-mono font-bold text-emerald-600">{stabilityData.ai_quality_gate.anomalyFilterScore}%</span></div>
                       <div className="flex justify-between items-center text-[11px]"><span className="text-slate-500">Completeness:</span><span className="font-mono font-bold text-emerald-600">{stabilityData.ai_quality_gate.completenessValidatorScore}%</span></div>
                       <div className="flex justify-between items-center text-[11px]"><span className="text-slate-500">Gate Status:</span><span className="font-mono font-bold text-slate-800 bg-slate-200 px-1.5 py-0.5 rounded">{stabilityData.ai_quality_gate.status}</span></div>
                    </div>
                 </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 flex flex-col justify-between">
                 <div>
                    <h5 className="text-[10px] font-bold uppercase font-mono text-slate-700 flex items-center gap-1.5"><GitMerge size={13} className="text-amber-500" /> Conflict Resolution</h5>
                    <div className="mt-3 text-[11px] text-slate-600">
                      Unresolved edge-case conflicts require manual merge or human overrides before applying to the main entity ledger.
                    </div>
                 </div>
                 <div className="text-[10px] font-bold mt-2 text-indigo-700">{stabilityData.conflict_resolution_engine.filter(c => c.status === 'PENDING').length} Pending Conflicts</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs h-80 flex flex-col">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                  <div>
                    <h5 className="text-[10px] font-bold uppercase font-mono text-slate-700 flex items-center gap-1.5"><Save size={12} className="text-indigo-500" /> System Snapshots</h5>
                    <p className="text-[9px] text-slate-500">Point-in-time recovery saves</p>
                  </div>
                  <button onClick={createSnapshot} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[9px] font-bold font-mono text-indigo-700 hover:bg-slate-50">TAKE SNAPSHOT</button>
                </div>
                <div className="p-0 overflow-y-auto flex-1 bg-white">
                  <ul className="divide-y divide-slate-150">
                    {stabilityData.system_state_snapshots.map(snap => (
                      <li key={snap.id} className="p-3 hover:bg-slate-50 text-[10px] font-sans">
                         <div className="flex justify-between items-start mb-1">
                           <span className="font-bold text-slate-900">{snap.name}</span>
                           <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-1.5 py-0.5 rounded font-mono text-[8px] uppercase">{snap.status}</span>
                         </div>
                         <div className="text-[9px] text-slate-500 font-mono">Type: {snap.type}</div>
                         <div className="text-[8px] text-slate-400 font-mono mt-1">{new Date(snap.timestamp).toLocaleString()}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs h-80 flex flex-col">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                  <h5 className="text-[10px] font-bold uppercase font-mono text-slate-700 flex items-center gap-1.5"><GitMerge size={12} className="text-amber-500" /> Pending Conflicts</h5>
                  <p className="text-[9px] text-slate-500">Requires manual resolution</p>
                </div>
                <div className="p-0 overflow-y-auto flex-1 bg-white">
                  <ul className="divide-y divide-slate-150">
                    {stabilityData.conflict_resolution_engine.length === 0 ? (
                      <li className="p-4 text-center text-xs text-slate-500">No conflicts detected.</li>
                    ) : (
                      stabilityData.conflict_resolution_engine.map(conflict => (
                        <li key={conflict.id} className="p-3 hover:bg-slate-50 text-[10px] font-sans">
                           <div className="flex justify-between items-start mb-1">
                             <div className="font-bold text-slate-900">Entity: <span className="font-mono text-indigo-700">{conflict.entity}</span></div>
                             <span className={`px-1.5 py-0.5 rounded font-mono text-[8px] uppercase border ${conflict.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>{conflict.status}</span>
                           </div>
                           <div className="text-[9.5px] text-slate-600 mb-2">{conflict.description}</div>
                           {conflict.status === 'PENDING' && (
                             <button onClick={() => resolveConflict(conflict.id)} className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-[9px]">RESOLVE / MERGE</button>
                           )}
                           {conflict.status === 'RESOLVED' && (
                             <div className="text-[8.5px] italic text-slate-500 mt-1">Resolution: {conflict.resolution}</div>
                           )}
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* SEGMENT 9: PHASE 10.9 COGNITIVE MODEL */}
      {activeSegment === 'cognitive' && cognitiveData && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl text-white">
            <div className="p-6 relative">
               <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                  <Cpu size={250} />
               </div>
               <div className="relative z-10 flex justify-between items-start">
                  <div>
                    <h4 className="flex items-center gap-2 text-sm font-bold text-slate-100 uppercase tracking-widest font-mono">
                      <Microscope className="text-indigo-400" /> University Cognitive Model Layer
                    </h4>
                    <p className="text-xs text-slate-400 mt-2 max-w-2xl leading-relaxed">
                      This layer provides semantic translation, causal logic reasoning, and deterministic decision simulations required for Phase 11 Autonomous AI operations. It ensures all AI suggestions are grounded in a unified meaning-space.
                    </p>
                  </div>
                  <div className="flex gap-3">
                     <button onClick={simulateCognitiveDecision} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold font-mono text-[10px] px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                        <Cpu size={12} /> RUN SIMULATION
                     </button>
                     <button onClick={toggleEmergencyThrottle} className={`font-bold font-mono text-[10px] px-4 py-2 rounded-lg transition-colors flex items-center gap-2 border ${cognitiveData.system_emergency_governor.status === 'NORMAL' ? 'border-rose-500 text-rose-400 hover:bg-rose-500/10' : 'bg-rose-600 text-white hover:bg-rose-500'}`}>
                        {cognitiveData.system_emergency_governor.status === 'NORMAL' ? 'ENGAGE GOVERNOR' : 'DISABLE GOVERNOR'}
                     </button>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 border-t border-slate-800">
               {/* Context Pack Builder */}
               <div className="p-5 border-r border-slate-800 flex flex-col">
                  <div className="mb-4 flex items-center justify-between">
                     <h6 className="text-[10px] uppercase font-mono text-indigo-300 font-bold tracking-widest">AI Context Builder</h6>
                     <span className="text-[8px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">{cognitiveData.ai_context_builder.active_bundles.length} BUNDLES</span>
                  </div>
                  <div className="space-y-2 flex-1">
                     {cognitiveData.ai_context_builder.active_bundles.map(bundle => (
                        <div key={bundle} className="bg-slate-800/50 p-2 rounded-lg border border-slate-700/50">
                           <div className="text-[10px] font-mono text-slate-300">{bundle}</div>
                        </div>
                     ))}
                  </div>
               </div>

               {/* Semantic Registry */}
               <div className="p-5 border-r border-slate-800 flex flex-col">
                  <div className="mb-4 flex items-center justify-between">
                     <h6 className="text-[10px] uppercase font-mono text-indigo-300 font-bold tracking-widest">Semantic State Reqistry</h6>
                     <span className="text-[8px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">UNIFIED LOGIC</span>
                  </div>
                  <div className="space-y-3 flex-1 overflow-y-auto">
                     {cognitiveData.semantic_state_registry.map(sem => (
                        <div key={sem.id} className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                           <div className="text-xs font-black text-amber-400 font-mono mb-1">{sem.code}</div>
                           <div className="text-[9.5px] text-slate-400 font-medium leading-relaxed italic mb-2">"{sem.unified_meaning}"</div>
                           <div className="grid grid-cols-2 gap-2 mt-2">
                              {Object.entries(sem.contexts).map(([ctx, val]) => (
                                 <div key={ctx} className="bg-slate-900 rounded p-1.5">
                                    <div className="text-[8px] uppercase text-slate-500 tracking-wider mb-0.5">{ctx}</div>
                                    <div className="text-[9px] text-slate-300 font-medium">{val as string}</div>
                                 </div>
                              ))}
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               {/* Time Sync & Emergency Governor */}
               <div className="p-5 flex flex-col gap-4">
                  <div>
                     <h6 className="text-[10px] uppercase font-mono text-indigo-300 font-bold tracking-widest mb-3">Time & Causality Sync</h6>
                     <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50 space-y-2">
                        <div className="flex justify-between items-center text-[10px]"><span className="text-slate-400">Canonical Source:</span><span className="font-mono text-slate-200">{cognitiveData.global_time_sync.canonical_time_source}</span></div>
                        <div className="flex justify-between items-center text-[10px]"><span className="text-slate-400">Drift Offset:</span><span className="font-mono text-emerald-400">{cognitiveData.global_time_sync.drift_ms}ms</span></div>
                        <div className="flex justify-between items-center text-[10px]"><span className="text-slate-400">Sync Status:</span><span className="font-mono text-emerald-400">{cognitiveData.global_time_sync.status}</span></div>
                     </div>
                  </div>

                  <div>
                     <h6 className="text-[10px] uppercase font-mono text-indigo-300 font-bold tracking-widest mb-3">AI Boundary Guard</h6>
                     <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50 space-y-2">
                        {cognitiveData.ai_decision_boundary_guard.hard_limits.map(limit => (
                           <div key={limit} className="flex items-center gap-1.5 border-b border-slate-700/50 pb-1.5 last:border-0 last:pb-0">
                              <span className="w-1 h-3 bg-rose-500 rounded-full"></span>
                              <span className="text-[9px] font-mono text-slate-300">{limit.replace(/_/g, ' ')}</span>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>

            <div className="border-t border-slate-800 p-6 flex flex-col md:flex-row gap-6 bg-slate-950">
               {/* Simulation Area */}
               <div className="flex-1">
                  <h6 className="text-[10px] uppercase font-mono text-indigo-300 font-bold tracking-widest mb-4">Decision Simulation Graph</h6>
                  {cognitiveData.decision_simulation_engine.last_simulation ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border border-slate-700 rounded-xl p-4 bg-slate-900 border-l-4 border-l-amber-500">
                           <div className="text-[8px] uppercase font-bold text-slate-500 tracking-wider mb-1">Simulated Action Input</div>
                           <div className="text-xs font-mono text-slate-200">{cognitiveData.decision_simulation_engine.last_simulation.action}</div>
                        </div>
                        <div className="border border-slate-700 rounded-xl p-4 bg-slate-900 border-l-4 border-l-indigo-500">
                           <div className="text-[8px] uppercase font-bold text-slate-500 tracking-wider mb-1">Predicted Multi-Module Impacts</div>
                           <ul className="space-y-1.5 mt-2 text-[10px] font-mono text-slate-300">
                              {cognitiveData.decision_simulation_engine.last_simulation.downstream_effects.map((eff: string, i: number) => (
                                 <li key={i} className="flex items-start gap-1.5">
                                    <span className="text-indigo-500 mt-0.5">↳</span>
                                    <span>{eff}</span>
                                 </li>
                              ))}
                           </ul>
                        </div>
                     </div>
                  ) : (
                     <div className="border border-slate-800 border-dashed rounded-xl p-6 flex justify-center items-center text-slate-500 text-xs italic">
                        No simulations run yet. Click "Run Simulation" above.
                     </div>
                  )}
               </div>
            </div>
          </div>
        </div>
      )}

      {/* SEGMENT 10: PHASE 10.9.5 UI STABILIZATION */}
      {activeSegment === 'ui-stabilization' && uiStabilizationData && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-205 shadow-sm space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800 uppercase tracking-widest font-mono">
                  <CheckSquare className="text-emerald-500 hover:scale-105 transition-transform" /> System Final Stabilization
                </h4>
                <p className="text-xs text-slate-500 mt-2 max-w-2xl leading-relaxed">
                  The pre-Phase 11 hard freeze layer. Runs a sweeping UI functionality audit to verify buttons, routing consistency, state sync, component mapping, and event hand-offs before AI autonomy is engaged.
                </p>
              </div>
              <div>
                 <button onClick={runUiAudit} className="bg-slate-900 hover:bg-slate-800 text-white font-bold font-mono text-[10px] px-5 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2">
                    <HeartPulse size={13} className="text-rose-400" /> RUN FULL UI AUDIT
                 </button>
              </div>
            </div>

            <div className={`border-2 rounded-xl p-6 flex flex-col md:flex-row gap-6 items-center justify-between transition-colors ${uiStabilizationData.system_ui_health_report.status === 'READY_FOR_AUTONOMOUS_AI' ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
               <div className="flex flex-col items-center justify-center p-4">
                  <div className={`text-4xl font-black font-mono tracking-tighter ${uiStabilizationData.system_ui_health_report.score >= 95 ? 'text-emerald-600' : 'text-slate-700'}`}>{uiStabilizationData.system_ui_health_report.score}<span className="text-lg text-slate-400 opacity-50">/100</span></div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">UI Health Score</div>
               </div>
               
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1 w-full">
                  <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-xs flex flex-col items-center">
                     <div className="text-lg font-black text-rose-500">{uiStabilizationData.system_ui_health_report.broken_buttons}</div>
                     <div className="text-[9px] uppercase font-bold text-slate-400 mt-1 flex gap-1 items-center"><MousePointerClick size={10} /> Buttons</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-xs flex flex-col items-center">
                     <div className="text-lg font-black text-amber-500">{uiStabilizationData.system_ui_health_report.navigation_issues}</div>
                     <div className="text-[9px] uppercase font-bold text-slate-400 mt-1 flex gap-1 items-center"><Share2 size={10} /> Routing</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-xs flex flex-col items-center">
                     <div className="text-lg font-black text-indigo-500">{uiStabilizationData.system_ui_health_report.sync_mismatches}</div>
                     <div className="text-[9px] uppercase font-bold text-slate-400 mt-1 flex gap-1 items-center"><Layers size={10} /> Mismatches</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-xs flex flex-col items-center">
                     <div className="text-lg font-black text-slate-600">{uiStabilizationData.system_ui_health_report.missing_handlers}</div>
                     <div className="text-[9px] uppercase font-bold text-slate-400 mt-1 flex gap-1 items-center"><Cpu size={10} /> Handlers</div>
                  </div>
               </div>
               
               <div className="flex flex-col items-end justify-center">
                  <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">Gate Status</div>
                  <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase font-mono shadow-sm border ${uiStabilizationData.system_ui_health_report.status === 'READY_FOR_AUTONOMOUS_AI' ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-slate-200 text-slate-700 border-slate-300'}`}>
                     {uiStabilizationData.system_ui_health_report.status.replace(/_/g, ' ')}
                  </span>
                  <div className="text-[8px] text-slate-400 font-mono mt-2">{new Date(uiStabilizationData.system_ui_health_report.timestamp).toLocaleString()}</div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs h-80 flex flex-col">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-100">
                  <h5 className="text-[10px] font-bold uppercase font-mono text-slate-700">UI Functionality Log</h5>
                  <p className="text-[9px] text-slate-500 mt-0.5">Button & Event Verifications</p>
                </div>
                <div className="p-0 overflow-y-auto flex-1 bg-white divide-y divide-slate-100">
                   {uiStabilizationData.ui_functionality_audit.map(aud => (
                      <div key={aud.id} className="p-3 hover:bg-slate-50 flex justify-between items-start">
                         <div>
                            <div className="text-xs font-bold text-slate-800">{aud.target}</div>
                            <div className="text-[9.5px] text-slate-500 mt-0.5">{aud.details}</div>
                         </div>
                         <span className={`px-2 py-0.5 rounded text-[8px] uppercase font-bold font-mono border ${aud.status === 'VERIFIED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>{aud.status}</span>
                      </div>
                   ))}
                </div>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs h-80 flex flex-col">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-100">
                  <h5 className="text-[10px] font-bold uppercase font-mono text-slate-700">Navigation Consistency Engine</h5>
                  <p className="text-[9px] text-slate-500 mt-0.5">Orphan Paths & Flag Synchronicity</p>
                </div>
                <div className="p-0 overflow-y-auto flex-1 bg-white divide-y divide-slate-100">
                   {uiStabilizationData.navigation_consistency_engine.map(nav => (
                      <div key={nav.id} className="p-3 hover:bg-slate-50 flex justify-between items-start">
                         <div>
                            <div className="text-xs font-mono text-indigo-700 bg-indigo-50/50 inline-block px-1 rounded">{nav.route}</div>
                            <div className="text-[9.5px] text-slate-500 mt-1">{nav.flag_sync}</div>
                         </div>
                         <span className={`px-2 py-0.5 rounded text-[8px] uppercase font-bold font-mono border ${nav.status === 'VERIFIED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : nav.status === 'CLEANED' ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>{nav.status}</span>
                      </div>
                   ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SEGMENT 11: PHASE 10.95 AI CONTAINMENT */}
      {activeSegment === 'ai-containment' && aiContainmentData && (
        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
             <div className="absolute top-[-20%] right-[-5%] opacity-[0.03] pointer-events-none">
                <ShieldAlert size={400} />
             </div>
             
             <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                   <h4 className="flex items-center gap-2 text-sm font-bold text-slate-100 uppercase tracking-widest font-mono">
                     <ShieldAlert className="text-rose-500" /> AI Containment & Governance Lock
                   </h4>
                   <p className="text-xs text-slate-400 mt-2 max-w-2xl leading-relaxed">
                     The final safety layer before Phase 11. AI is strictly constrained as a governed advisor. It can suggest, simulate, and warn, but cannot execute, mutate, or bypass human authority.
                   </p>
                </div>
                <div className="flex flex-col gap-3">
                   <button onClick={toggleAIKillSwitch} className={`px-4 py-2.5 rounded-xl font-bold font-mono text-[10px] uppercase shadow-sm transition-all flex items-center gap-2 border ${aiContainmentData.ai_global_shutdown_flag.active ? 'bg-rose-600 text-white border-rose-700 hover:bg-rose-700' : 'bg-transparent border-rose-500 text-rose-400 hover:bg-rose-500/10'}`}>
                      <PowerOff size={13} /> {aiContainmentData.ai_global_shutdown_flag.active ? 'RESTORE AI ADVISORY' : 'ENGAGE AI KILL SWITCH'}
                   </button>
                   <button onClick={testBoundaryGate} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl font-bold font-mono text-[10px] shadow border border-indigo-700 flex justify-center">
                      TEST BOUNDARY GATE
                   </button>
                </div>
             </div>
             
             {aiContainmentData.ai_global_shutdown_flag.active && (
                <div className="mt-4 bg-rose-500/10 border border-rose-500/30 rounded-lg p-3 text-rose-300 text-xs flex items-center gap-2">
                   <LockKeyhole size={14} /> AI is currently LOCKED. System is operating in {aiContainmentData.ai_global_shutdown_flag.mode}.
                </div>
             )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <h5 className="text-[10px] font-bold uppercase font-mono text-slate-700 flex items-center gap-1.5 mb-4"><LockKeyhole size={12} className="text-indigo-500" /> Boundary Gate Rules</h5>
                <ul className="space-y-2">
                   {aiContainmentData.ai_execution_boundary.rules.map(rule => {
                      const [action, status] = rule.split(':');
                      return (
                         <li key={rule} className="flex justify-between items-center text-[10px] font-mono">
                            <span className="text-slate-600">{action}</span>
                            <span className={`px-1.5 py-0.5 rounded font-black ${status === 'ALLOW' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>{status}</span>
                         </li>
                      );
                   })}
                </ul>
                <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-500 flex justify-between">
                   <span>Blocked Executes:</span>
                   <span className="font-bold text-rose-600">{aiContainmentData.ai_execution_boundary.blocked_attempts}</span>
                </div>
             </div>

             <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <h5 className="text-[10px] font-bold uppercase font-mono text-slate-700 flex items-center gap-1.5 mb-4"><ShieldAlert size={12} className="text-amber-500" /> Human Override Controller</h5>
                <div className="text-[10px] text-slate-600 space-y-3">
                   <div className="flex justify-between items-center bg-slate-50 p-2 rounded border border-slate-100">
                      <span>Status</span>
                      <span className="font-bold text-emerald-600 font-mono tracking-wider">{aiContainmentData.human_override_controller.human_wins ? 'ACTIVE (HUMAN_WINS)' : 'INACTIVE'}</span>
                   </div>
                   <div className="font-bold mt-2 text-slate-700">Available Interventions:</div>
                   <div className="flex gap-2">
                      {aiContainmentData.human_override_controller.available_actions.map(act => (
                         <span key={act} className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-[8px] font-mono font-bold border border-slate-200">{act}</span>
                      ))}
                   </div>
                </div>
             </div>

             <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <h5 className="text-[10px] font-bold uppercase font-mono text-slate-700 flex items-center gap-1.5 mb-4"><Cpu size={12} className="text-emerald-500" /> Suggestion Throttle</h5>
                <div className="text-[10px] text-slate-600 space-y-2">
                   <div className="flex justify-between"><span className="text-slate-500">Max / Minute:</span> <span className="font-mono font-bold">{aiContainmentData.ai_suggestion_throttle.max_per_min}</span></div>
                   <div className="flex justify-between"><span className="text-slate-500">Current Rate:</span> <span className="font-mono font-bold text-indigo-600">{aiContainmentData.ai_suggestion_throttle.current_rate} / min</span></div>
                   <div className="flex justify-between"><span className="text-slate-500">Deduplicated:</span> <span className="font-mono font-bold">{aiContainmentData.ai_suggestion_throttle.deduplications}</span></div>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs h-64 flex flex-col bg-white">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-100">
                   <h5 className="text-[10px] font-bold uppercase font-mono text-slate-700">Suggestion Firewall (Rewrites)</h5>
                   <p className="text-[9px] text-slate-500">Dangerous AI outputs intercepted and made safe.</p>
                </div>
                <div className="overflow-y-auto flex-1 divide-y divide-slate-100">
                   {aiContainmentData.ai_suggestion_firewall.map(fw => (
                      <div key={fw.id} className="p-4 text-[10px]">
                         <div className="text-[8px] uppercase font-bold text-rose-500 tracking-wider mb-1">Original Unsafe Payload</div>
                         <div className="text-slate-900 font-mono italic bg-rose-50 p-2 rounded text-xs">"{fw.original}"</div>
                         <div className="text-[8px] uppercase font-bold text-emerald-600 tracking-wider mt-3 mb-1">Rewritten Safe Advisory</div>
                         <div className="text-slate-700 font-mono font-medium bg-emerald-50 p-2 rounded">"{fw.rewritten}"</div>
                      </div>
                   ))}
                </div>
             </div>

             <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs h-64 flex flex-col bg-white">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                   <div>
                      <h5 className="text-[10px] font-bold uppercase font-mono text-slate-700">Decision Trace Log</h5>
                      <p className="text-[9px] text-slate-500">The "Black Box" transparency layer.</p>
                   </div>
                   <span className="text-[8px] font-mono font-bold rounded-full border border-slate-200 bg-slate-100 text-slate-500 px-2 py-0.5">IMMUTABLE</span>
                </div>
                <div className="overflow-y-auto flex-1 divide-y divide-slate-100 p-2">
                   {aiContainmentData.ai_decision_trace_log.map(trace => (
                      <div key={trace.id} className="p-2 border border-slate-200 bg-slate-50 rounded-lg">
                         <div className="flex justify-between items-center mb-2">
                            <span className="font-mono font-bold text-[9px] text-indigo-700">{trace.input}</span>
                            <span className="text-[8px] text-slate-400">{new Date(trace.timestamp).toLocaleTimeString()}</span>
                         </div>
                         <div className="text-[9.5px] text-slate-600 ml-2 border-l-2 border-indigo-200 pl-2">
                            <span className="font-bold text-slate-500 text-[8px] uppercase tracking-wider block mb-0.5">Reasoning Chain</span>
                            {trace.reasoning}
                         </div>
                         <div className="mt-2 pt-2 border-t border-slate-200 text-[10px] font-medium text-slate-800">
                            <strong>Output:</strong> {trace.output}
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      )}

      {/* SEGMENT 12: PHASE 11 OFFLINE AI GOVERNANCE */}
      {activeSegment === 'phase11' && phase11Data && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl text-white">
             <div className="p-6 relative bg-gradient-to-br from-slate-900 to-slate-950">
               <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                  <Brain size={250} />
               </div>
               <div className="relative z-10 flex justify-between items-start">
                  <div>
                    <h4 className="flex items-center gap-2 text-sm font-bold text-amber-500 uppercase tracking-widest font-mono">
                      <Brain className="text-amber-500" /> SUOS Cognitive Advisory Engine (CAE)
                    </h4>
                    <p className="text-xs text-slate-300 mt-2 max-w-2xl leading-relaxed">
                      A fully offline, rule-bound, explainable university intelligence layer. It forecasts, detects, recommends, and simulates, but depends on human governance to execute.
                    </p>
                  </div>
                  <div>
                    <span className="px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-mono font-bold">
                       PHASE 11 LIVE
                    </span>
                  </div>
               </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-800 border-t border-slate-800">
               {/* Predictive Insight */}
               <div className="p-5 flex flex-col h-72">
                  <div className="mb-4 flex items-center justify-between">
                     <h6 className="text-[10px] uppercase font-mono text-amber-400 font-bold flex items-center gap-1.5"><Eye size={12} /> Predictive Engine</h6>
                  </div>
                  <div className="space-y-3 overflow-y-auto flex-1 pr-1">
                     {phase11Data.predictive_insight_engine.map(pred => (
                        <div key={pred.id} className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                           <div className="flex justify-between items-center mb-1">
                              <span className="text-[9px] font-mono text-indigo-300">Target: {pred.target}</span>
                              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${pred.status === 'HIGH_RISK' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'}`}>{pred.score}% RISK</span>
                           </div>
                           <div className="text-[11px] font-bold text-slate-200 mb-1">{pred.category}</div>
                           <div className="text-[9px] text-slate-400">Drivers: {pred.drivers.join(', ')}</div>
                        </div>
                     ))}
                  </div>
               </div>

               {/* Anomaly Detection */}
               <div className="p-5 flex flex-col h-72">
                  <div className="mb-4 flex items-center justify-between">
                     <h6 className="text-[10px] uppercase font-mono text-amber-400 font-bold flex items-center gap-1.5"><Radar size={12} /> Anomaly Engine</h6>
                  </div>
                  <div className="space-y-3 overflow-y-auto flex-1 pr-1">
                     {phase11Data.anomaly_detection_engine.map(anm => (
                        <div key={anm.id} className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50 border-l-2 border-l-rose-500">
                           <div className="text-[9px] font-mono text-rose-300 mb-1">Severity: {anm.severity}</div>
                           <div className="text-[11px] font-bold text-slate-200 mb-1">{anm.type}</div>
                           <div className="text-[9px] text-slate-400 mb-2">{anm.description}</div>
                           <div className="text-[9px] font-mono bg-slate-900 rounded p-1 text-slate-500 inline-block">Entity: {anm.entity}</div>
                        </div>
                     ))}
                  </div>
               </div>

               {/* Recommendation Engine */}
               <div className="p-5 flex flex-col h-72">
                  <div className="mb-4 flex items-center justify-between">
                     <h6 className="text-[10px] uppercase font-mono text-amber-400 font-bold flex items-center gap-1.5"><Lightbulb size={12} /> Recommendation Engine</h6>
                  </div>
                  <div className="space-y-3 overflow-y-auto flex-1 pr-1">
                     {phase11Data.decision_recommendation_engine.map(rec => (
                        <div key={rec.id} className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50 relative">
                           <div className="absolute top-2 right-2 text-[8px] font-bold bg-indigo-500 text-white w-4 h-4 flex items-center justify-center rounded-full">#{rec.rank}</div>
                           <div className="text-[9px] text-slate-400 mb-1.5">Context: {rec.context}</div>
                           <div className="text-[11px] font-bold text-emerald-400 mb-2">"{rec.recommendation}"</div>
                           <div className="flex bg-slate-900 rounded overflow-hidden">
                              <div className="bg-rose-500/80 h-1" style={{ width: `${rec.risk_score}%` }}></div>
                              <div className="bg-slate-700 flex-1"></div>
                           </div>
                           <div className="text-[8px] text-right mt-1 text-slate-500">Risk Score: {rec.risk_score}</div>
                        </div>
                     ))}
                  </div>
               </div>
             </div>

             {/* Lower section: Simulation and Memory */}
             <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800 border-t border-slate-800 bg-slate-950">
               {/* Impact Sim */}
               <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                     <h6 className="text-[10px] uppercase font-mono text-amber-400 font-bold flex items-center gap-1.5">Impact Simulation Engine</h6>
                     <button onClick={simulatePhase11Impact} className="bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-[9px] px-3 py-1.5 rounded flex items-center gap-1 transition-colors">
                        RUN SIMULATION
                     </button>
                  </div>
                  {phase11Data.impact_simulation_engine.latest_impact ? (
                     <div className="border border-slate-700 bg-slate-900 rounded-lg p-4">
                        <div className="text-[9px] uppercase text-slate-500 mb-1">Simulated Action</div>
                        <div className="text-xs font-mono font-bold text-slate-200 mb-4 bg-slate-800 p-2 rounded">{phase11Data.impact_simulation_engine.latest_impact.action}</div>
                        <div className="space-y-2">
                           <div className="text-[9px] uppercase text-slate-500 mb-1">Predicted Multi-Domain Impact</div>
                           {phase11Data.impact_simulation_engine.latest_impact.impacts.map((imp: any, i: number) => (
                              <div key={i} className="flex justify-between items-center border-b border-slate-800 pb-2 last:border-0">
                                 <div>
                                    <span className="text-[10px] font-bold text-slate-300 mr-2">{imp.domain}</span>
                                    <span className="text-[10px] text-slate-400">{imp.detail}</span>
                                 </div>
                                 <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded ${imp.severity === 'HIGH' ? 'bg-rose-500/20 text-rose-300' : imp.severity === 'MODERATE' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'}`}>{imp.severity}</span>
                              </div>
                           ))}
                        </div>
                     </div>
                  ) : (
                     <div className="border border-slate-800 border-dashed rounded-lg p-6 flex items-center justify-center text-slate-500 text-xs italic">
                        No simulations run.
                     </div>
                  )}
               </div>

               {/* Memory Engine */}
               <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                     <h6 className="text-[10px] uppercase font-mono text-amber-400 font-bold flex items-center gap-1.5"><Library size={12} /> Institutional Memory Engine</h6>
                  </div>
                  <div className="space-y-3">
                     {phase11Data.institutional_memory_engine.map(mem => (
                        <div key={mem.id} className="border border-slate-700 bg-slate-900 rounded-lg p-4 relative overflow-hidden">
                           <div className="absolute top-0 right-0 p-2">
                              <span className="bg-emerald-500/20 text-emerald-400 text-[8px] font-mono px-2 py-0.5 rounded uppercase font-bold">{mem.effectiveness.replace('_', ' ')}</span>
                           </div>
                           <div className="grid grid-cols-2 gap-4 mb-3 text-[10px]">
                              <div>
                                 <div className="text-slate-500 mb-1 uppercase font-bold text-[8px] tracking-wider">AI Suggestion</div>
                                 <div className="text-rose-300 font-mono italic">"{mem.original_suggestion}"</div>
                              </div>
                              <div>
                                 <div className="text-slate-500 mb-1 uppercase font-bold text-[8px] tracking-wider">Human Decision</div>
                                 <div className="text-emerald-300 font-mono font-bold">"{mem.human_decision}"</div>
                              </div>
                           </div>
                           <div className="border-t border-slate-800 pt-3">
                              <div className="text-[10px]">
                                 <span className="text-slate-500 mr-2 uppercase font-bold text-[8px] tracking-wider">True Outcome:</span>
                                 <span className="text-slate-300">{mem.true_outcome}</span>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
             </div>
          </div>
        </div>
      )}

    </div>
  );
};
