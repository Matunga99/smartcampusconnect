/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, Plus, Trash2, ShieldAlert, Sparkles, RefreshCw, AlertCircle, MapPin, Layers, Users,
  TrendingUp, Gauge, Award, Activity, CheckCircle2, ChevronRight, Shuffle, Building2, X
} from 'lucide-react';
import { ClassGroup, Timetable } from '../types';

interface AdminTimetableEngineProps {
  token: string;
  appendLog?: (msg: string) => void;
  isPhoneFrame?: boolean;
}

export default function AdminTimetableEngine({ token, appendLog, isPhoneFrame = false }: AdminTimetableEngineProps) {
  const [classGroups, setClassGroups] = useState<ClassGroup[]>([]);
  const [timetables, setTimetables] = useState<Timetable[]>([]);

  const [programs, setPrograms] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [campuses, setCampuses] = useState<any[]>([]);
  const [showManageRooms, setShowManageRooms] = useState(false);
  const [activeVenueSubTab, setActiveVenueSubTab] = useState<'rooms' | 'buildings'>('rooms');

  const [newBldForm, setNewBldForm] = useState({
    name: '',
    code: '',
    floorsCount: 1,
    description: '',
    campusId: ''
  });

  const [newRoomForm, setNewRoomForm] = useState({
    buildingId: '',
    roomNumber: '',
    name: '',
    capacity: 40,
    room_type: 'CLASSROOM'
  });

  const [venueError, setVenueError] = useState<string | null>(null);
  const [venueSuccess, setVenueSuccess] = useState<string | null>(null);
  const [creatingVenue, setCreatingVenue] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Auto/Assisted engine states
  const [schedulingMode, setSchedulingMode] = useState<'manual' | 'auto' | 'intelligence'>('manual');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [autoConfig, setAutoConfig] = useState({
    labsFirst: true,
    seniorPriority: true,
    avoidOverload: true
  });
  const [draftTimetables, setDraftTimetables] = useState<any[]>([]);
  const [autoReport, setAutoReport] = useState<any | null>(null);
  const [generatingAuto, setGeneratingAuto] = useState(false);
  const [draftSuccess, setDraftSuccess] = useState<string | null>(null);

  // Intelligence Dashboard & Predictions States
  const [intelligenceReport, setIntelligenceReport] = useState<any | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [analysisMode, setAnalysisMode] = useState<'live' | 'draft'>('live');
  const [prediction, setPrediction] = useState<any | null>(null);
  const [loadingPrediction, setLoadingPrediction] = useState(false);
  const [rebalancing, setRebalancing] = useState(false);

  // Governance Layer 2.0 States
  const [govMemory, setGovMemory] = useState<any | null>(null);
  const [loadingGovMemory, setLoadingGovMemory] = useState(false);
  const [simulationParams, setSimulationParams] = useState({
    additionalStudentsCount: 0,
    removedStaffIds: [] as string[],
    addedCampusesCount: 1
  });
  const [simulationResult, setSimulationResult] = useState<any | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [selectedStaffToSimulateRemove, setSelectedStaffToSimulateRemove] = useState<string>('');

  // Classgroup Form
  const [cgForm, setCgForm] = useState({
    programId: '',
    levelId: '',
    groupName: '',
    capacity: 40
  });

  // Timetable Form
  const [ttForm, setTtForm] = useState({
    academicYearId: '',
    semesterId: '',
    classGroupId: '',
    unitId: '',
    staffId: '',
    venue: '',
    day: 'Monday',
    timeSlot: '08:00 AM - 10:00 AM'
  });

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const h = { 'Authorization': `Bearer ${token}` };
      const [cgResp, ttResp, progResp, levResp, unitResp, staffResp, ayResp, semResp, roomsResp] = await Promise.all([
        fetch('/api/admin/class-groups', { headers: h }),
        fetch('/api/admin/timetables', { headers: h }),
        fetch('/api/admin/programs', { headers: h }),
        fetch('/api/admin/levels', { headers: h }),
        fetch('/api/admin/units', { headers: h }),
        fetch('/api/admin/staff', { headers: h }),
        fetch('/api/admin/academic-years', { headers: h }),
        fetch('/api/admin/semesters', { headers: h }),
        fetch('/api/facilities/rooms', { headers: h })
      ]);

      // Fetch buildings and campuses safely
      try {
        const bldResp = await fetch('/api/facilities/buildings', { headers: h });
        if (bldResp.ok) {
          const blds = await bldResp.json();
          setBuildings(blds);
          if (blds.length > 0 && !newRoomForm.buildingId) {
            setNewRoomForm(prev => ({ ...prev, buildingId: blds[0].id }));
          }
        }
      } catch (e) {}

      try {
        const cpResp = await fetch('/api/facilities/campuses', { headers: h });
        if (cpResp.ok) {
          const camps = await cpResp.json();
          setCampuses(camps);
          if (camps.length > 0 && !newBldForm.campusId) {
            setNewBldForm(prev => ({ ...prev, campusId: camps[0].id }));
          }
        }
      } catch (e) {}

      if (cgResp.ok) {
        const cgs = await cgResp.json();
        setClassGroups(cgs);
        if (cgs.length > 0 && !ttForm.classGroupId) {
          setTtForm(prev => ({ ...prev, classGroupId: cgs[0].id }));
        }
      }
      if (ttResp.ok) setTimetables(await ttResp.json());
      if (progResp.ok) {
        const progs = await progResp.json();
        setPrograms(progs);
        if (progs.length > 0 && !cgForm.programId) {
          setCgForm(prev => ({ ...prev, programId: progs[0].id }));
        }
      }
      if (levResp.ok) {
        const levs = await levResp.json();
        setLevels(levs);
        if (levs.length > 0 && !cgForm.levelId) {
          setCgForm(prev => ({ ...prev, levelId: levs[0].id }));
        }
      }
      if (unitResp.ok) {
        const u = await unitResp.json();
        setUnits(u);
        if (u.length > 0 && !ttForm.unitId) {
          setTtForm(prev => ({ ...prev, unitId: u[0].id }));
        }
      }
      if (staffResp.ok) {
        const s = await staffResp.json();
        setStaff(s);
        if (s.length > 0 && !ttForm.staffId) {
          setTtForm(prev => ({ ...prev, staffId: s[0].id }));
        }
      }
      if (ayResp.ok) {
        const ays = await ayResp.json();
        setAcademicYears(ays);
        const activeAY = ays.find((y: any) => y.status === 'active') || ays[0];
        if (activeAY && !ttForm.academicYearId) {
          setTtForm(prev => ({ ...prev, academicYearId: activeAY.id }));
        }
      }
      if (semResp.ok) {
        const sems = await semResp.json();
        setSemesters(sems);
        const activeSem = sems.find((s: any) => s.status === 'active') || sems[0];
        if (activeSem && !ttForm.semesterId) {
          setTtForm(prev => ({ ...prev, semesterId: activeSem.id }));
        }
      }
      if (roomsResp && roomsResp.ok) {
        const rms = await roomsResp.json();
        setRooms(rms);
        if (rms.length > 0 && !ttForm.venue) {
          setTtForm(prev => ({ ...prev, venue: rms[0].roomNumber }));
        }
      }

    } catch (e) {
      setError('Could not establish synchronization pipeline with timetable databases.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    loadDraftTimetables();
  }, [token]);

  const loadDraftTimetables = async () => {
    try {
      const resp = await fetch('/api/admin/timetables/draft', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resp.ok) {
        setDraftTimetables(await resp.json());
      }
    } catch (e) {}
  };

  const fetchSlotSuggestions = async () => {
    if (!ttForm.academicYearId || !ttForm.semesterId || !ttForm.classGroupId || !ttForm.unitId) {
      setError('Select Year, Semester, class cohort, and unit subject first to run assistant.');
      return;
    }
    setLoadingSuggestions(true);
    setError(null);
    try {
      const resp = await fetch('/api/admin/timetables/suggest-slot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          academicYearId: ttForm.academicYearId,
          semesterId: ttForm.semesterId,
          classGroupId: ttForm.classGroupId,
          unitId: ttForm.unitId,
          staffId: ttForm.staffId
        })
      });
      if (resp.ok) {
        const list = await resp.json();
        setSuggestions(list);
        setShowSuggestions(true);
        if (list.length === 0) {
          setError('No eligible rooms matching the seat capacity with zero clashes detected.');
        }
      } else {
        const data = await resp.json();
        setError(data.error || 'Suggestions failed');
      }
    } catch (e) {
      setError('Communication loss with Assisted engine.');
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const applySuggestion = (sug: any) => {
    setTtForm(prev => ({
      ...prev,
      venue: sug.venue,
      day: sug.day,
      timeSlot: sug.timeSlot
    }));
    setShowSuggestions(false);
    triggerFeedback(`Assisted Slot applied: ${sug.day} @ ${sug.timeSlot} inside ${sug.venue} (Suitability Index: ${sug.score}%)`);
  };

  const runAutoGeneration = async () => {
    if (!ttForm.academicYearId || !ttForm.semesterId) {
      setError('Specify targets for Academic Year and Semester to host automated draft compile.');
      return;
    }
    setGeneratingAuto(true);
    setError(null);
    setDraftSuccess(null);
    try {
      const resp = await fetch('/api/admin/timetables/auto-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          academicYearId: ttForm.academicYearId,
          semesterId: ttForm.semesterId,
          labsFirst: autoConfig.labsFirst,
          seniorPriority: autoConfig.seniorPriority,
          avoidOverload: autoConfig.avoidOverload
        })
      });
      const resJson = await resp.json();
      if (resp.ok) {
        setAutoReport(resJson);
        setDraftSuccess(resJson.message);
        loadDraftTimetables();
        loadData();
      } else {
        throw new Error(resJson.error || 'Autopilot generation compile failed');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGeneratingAuto(false);
    }
  };

  // Real-time Conflict Predictor Effect (Step 2)
  useEffect(() => {
    if (!ttForm.academicYearId || !ttForm.semesterId || !ttForm.classGroupId || !ttForm.venue || !ttForm.day || !ttForm.timeSlot) {
      setPrediction(null);
      return;
    }

    const controller = new AbortController();
    const fetchPrediction = async () => {
      setLoadingPrediction(true);
      try {
        const res = await fetch('/api/admin/timetables/intelligence/predict-conflict', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            academicYearId: ttForm.academicYearId,
            semesterId: ttForm.semesterId,
            classGroupId: ttForm.classGroupId,
            staffId: ttForm.staffId,
            venue: ttForm.venue,
            day: ttForm.day,
            timeSlot: ttForm.timeSlot
          }),
          signal: controller.signal
        });
        if (res.ok) {
          const data = await res.json();
          setPrediction(data);
        }
      } catch (e: any) {
        if (e.name !== 'AbortError') {
          console.error(e);
        }
      } finally {
        setLoadingPrediction(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchPrediction();
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(delayDebounceFn);
    };
  }, [ttForm.academicYearId, ttForm.semesterId, ttForm.classGroupId, ttForm.staffId, ttForm.venue, ttForm.day, ttForm.timeSlot, token]);

  // Fetch full School Optimization Health Report (Step 1 & Step 3)
  const fetchIntelligenceReport = async () => {
    if (!ttForm.academicYearId || !ttForm.semesterId) return;
    setLoadingReport(true);
    try {
      const res = await fetch(`/api/admin/timetables/intelligence/report?academicYearId=${ttForm.academicYearId}&semesterId=${ttForm.semesterId}&mode=${analysisMode}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setIntelligenceReport(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingReport(false);
    }
  };

  useEffect(() => {
    fetchIntelligenceReport();
  }, [ttForm.academicYearId, ttForm.semesterId, analysisMode, token, timetables, draftTimetables]);

  const fetchGovMemory = async () => {
    setLoadingGovMemory(true);
    try {
      const res = await fetch('/api/admin/timetables/intelligence/governance-memory', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setGovMemory(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingGovMemory(false);
    }
  };

  useEffect(() => {
    if (schedulingMode === 'intelligence') {
      fetchGovMemory();
    }
  }, [schedulingMode, timetables, draftTimetables, token]);

  const handleRunSimulation = async () => {
    if (!ttForm.academicYearId || !ttForm.semesterId) {
      setError('Please specify standard Academic Year and Semester targets first to construct a simulation baseline.');
      return;
    }
    setSimulating(true);
    try {
      const res = await fetch('/api/admin/timetables/intelligence/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          academicYearId: ttForm.academicYearId,
          semesterId: ttForm.semesterId,
          additionalStudentsCount: Number(simulationParams.additionalStudentsCount),
          removedStaffIds: simulationParams.removedStaffIds,
          addedCampusesCount: Number(simulationParams.addedCampusesCount)
        })
      });
      if (res.ok) {
        setSimulationResult(await res.json());
      } else {
        const d = await res.json();
        setError(d.error || 'Simulations context load failed.');
      }
    } catch (e) {
      setError('Connection with baseline simulator lost.');
    } finally {
      setSimulating(false);
    }
  };

  // Run full simulated annealing rebalancing heuristic (Step 4)
  const handleOptimizeSemester = async () => {
    if (!ttForm.academicYearId || !ttForm.semesterId) {
      setError('Please specify standard Academic Year and Semester targets first.');
      return;
    }
    setRebalancing(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('/api/admin/timetables/intelligence/rebalance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          academicYearId: ttForm.academicYearId,
          semesterId: ttForm.semesterId
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSuccess(data.message || 'Optimization finished! Review generated schedules below.');
        setAnalysisMode('draft');
        setSchedulingMode('intelligence');
        loadDraftTimetables();
        loadData();
      } else {
        const err = await res.json();
        setError(err.error || 'Advanced layout rebalancing collapsed.');
      }
    } catch (e) {
      setError('Connection to university optimization engine lost.');
    } finally {
      setRebalancing(false);
    }
  };

  const approveDraft = async () => {
    if (!window.confirm('Commit draft schedule? This makes all generated slots viewable in current semester live timetables.')) return;
    setError(null);
    try {
      const resp = await fetch('/api/admin/timetables/draft/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          academicYearId: ttForm.academicYearId,
          semesterId: ttForm.semesterId
        })
      });
      const data = await resp.json();
      if (resp.ok) {
        triggerFeedback(data.message || 'Draft approved and classes booked.');
        setDraftTimetables([]);
        setAutoReport(null);
        setDraftSuccess(null);
      } else {
        setError(data.error);
      }
    } catch (e) {
      setError('Confirming generated timetable failed.');
    }
  };

  const clearDraft = async () => {
    if (!window.confirm('Wipe current generated draft classes?')) return;
    setError(null);
    try {
      const resp = await fetch('/api/admin/timetables/draft/clear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          academicYearId: ttForm.academicYearId,
          semesterId: ttForm.semesterId
        })
      });
      if (resp.ok) {
        triggerFeedback('Draft discarded safely.');
        setDraftTimetables([]);
        setAutoReport(null);
        setDraftSuccess(null);
      } else {
        const d = await resp.json();
        setError(d.error);
      }
    } catch (e) {
      setError('Discarding draft failed.');
    }
  };

  const triggerFeedback = (text: string) => {
    setSuccess(text);
    setTimeout(() => setSuccess(null), 3500);
    loadData();
    loadDraftTimetables();
  };

  // Submit new Building
  const handleCreateBuilding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBldForm.name || !newBldForm.code || !newBldForm.campusId) {
      setVenueError('Please fill in Name, Code and select a Campus.');
      return;
    }
    setVenueError(null);
    setVenueSuccess(null);
    setCreatingVenue(true);

    try {
      const resp = await fetch('/api/facilities/buildings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newBldForm)
      });
      const resJson = await resp.json();
      if (!resp.ok) throw new Error(resJson.error || 'Could not register building');

      setVenueSuccess(`Successfully built complex: "${newBldForm.name}"!`);
      setNewBldForm({
        name: '',
        code: '',
        floorsCount: 1,
        description: '',
        campusId: campuses[0]?.id || ''
      });
      
      // Update local choices
      const bldResp = await fetch('/api/facilities/buildings', { headers: { 'Authorization': `Bearer ${token}` } });
      if (bldResp.ok) {
        const blds = await bldResp.json();
        setBuildings(blds);
        // Default the room form buildingId selection
        if (blds.length > 0) {
          setNewRoomForm(prev => ({ ...prev, buildingId: blds[blds.length - 1].id }));
        }
      }
    } catch (err: any) {
      setVenueError(err.message || 'Network error building site');
    } finally {
      setCreatingVenue(false);
    }
  };

  // Submit new Room
  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomForm.buildingId || !newRoomForm.roomNumber) {
      setVenueError('Please select a Building and specify Room number.');
      return;
    }
    setVenueError(null);
    setVenueSuccess(null);
    setCreatingVenue(true);

    try {
      const resp = await fetch('/api/facilities/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newRoomForm)
      });
      const resJson = await resp.json();
      if (!resp.ok) throw new Error(resJson.error || 'Could not add classroom room');

      setVenueSuccess(`Pragmatic venue room "${newRoomForm.roomNumber}" registered successfully!`);
      // Update form fields
      setNewRoomForm(prev => ({
        ...prev,
        roomNumber: '',
        name: '',
        capacity: 40
      }));

      // Refetch rooms to update list
      const roomsResp = await fetch('/api/facilities/rooms', { headers: { 'Authorization': `Bearer ${token}` } });
      if (roomsResp.ok) {
        const rms = await roomsResp.json();
        setRooms(rms);
      }
    } catch (err: any) {
      setVenueError(err.message || 'Network error registering classroom');
    } finally {
      setCreatingVenue(false);
    }
  };

  // Delete Room
  const handleDeleteRoom = async (roomId: string) => {
    if (!window.confirm('Are you sure you want to decommission this room? This removes it from future scheduler availability.')) return;
    setVenueError(null);
    setVenueSuccess(null);

    try {
      const resp = await fetch(`/api/facilities/rooms/${roomId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resJson = await resp.json();
      if (!resp.ok) throw new Error(resJson.error || 'Failed to remove room');

      setVenueSuccess('Room decommissioned/deleted successfully!');
      
      // Update list
      const roomsResp = await fetch('/api/facilities/rooms', { headers: { 'Authorization': `Bearer ${token}` } });
      if (roomsResp.ok) {
        setRooms(await roomsResp.json());
      }
    } catch (err: any) {
      setVenueError(err.message);
    }
  };

  // Delete Building
  const handleDeleteBuilding = async (bldId: string) => {
    if (!window.confirm('Are you sure you want to tear down this building? (Only possible if zero rooms are connected)')) return;
    setVenueError(null);
    setVenueSuccess(null);

    try {
      const resp = await fetch(`/api/facilities/buildings/${bldId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resJson = await resp.json();
      if (!resp.ok) throw new Error(resJson.error || 'Failed to delete building');

      setVenueSuccess('Academic complex removed successfully!');
      
      const bldResp = await fetch('/api/facilities/buildings', { headers: { 'Authorization': `Bearer ${token}` } });
      if (bldResp.ok) {
        setBuildings(await bldResp.json());
      }
    } catch (err: any) {
      setVenueError(err.message);
    }
  };

  // Submit Class Group
  const handleCreateClassGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cgForm.programId || !cgForm.levelId || !cgForm.groupName) return;
    setError(null);

    try {
      const resp = await fetch('/api/admin/class-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(cgForm)
      });
      const resJson = await resp.json();
      if (!resp.ok) throw new Error(resJson.error || 'Server error creating cohort');

      appendLog?.(`[TIMETABLE ENGINE] Created Class Group: "${cgForm.groupName}" for program "${cgForm.programId}"`);
      triggerFeedback(`Class Group "${cgForm.groupName}" recorded successfully.`);
      setCgForm(prev => ({ ...prev, groupName: '', capacity: 40 }));
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Delete Class Group
  const handleDeleteClassGroup = async (id: string) => {
    if (!window.confirm('Delete this class group cohort? Scheduled timetables will remain unaffected.')) return;
    try {
      const resp = await fetch(`/api/admin/class-groups/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resp.ok) {
        triggerFeedback('Class group cohort deleted.');
      } else {
        const d = await resp.json();
        setError(d.error);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Submit Timetable
  const handleCreateTimetable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ttForm.academicYearId || !ttForm.semesterId || !ttForm.classGroupId || !ttForm.unitId || !ttForm.staffId || !ttForm.venue) return;
    setError(null);

    // Conflict assertion checker 
    const conflict = timetables.find(t => 
      t.day === ttForm.day &&
      t.timeSlot === ttForm.timeSlot &&
      (t.venue === ttForm.venue || t.staffId === ttForm.staffId || t.classGroupId === ttForm.classGroupId)
    );

    if (conflict) {
      if (conflict.venue === ttForm.venue) {
        setError(`Conflict Warning: Venue "${ttForm.venue}" is already booked on ${ttForm.day} at ${ttForm.timeSlot}.`);
        return;
      }
      if (conflict.staffId === ttForm.staffId) {
        setError(`Conflict Warning: Lecturer is already engaged elsewhere on ${ttForm.day} at ${ttForm.timeSlot}.`);
        return;
      }
      if (conflict.classGroupId === ttForm.classGroupId) {
        setError(`Conflict Warning: Class Group is already scheduled for another class on ${ttForm.day} at ${ttForm.timeSlot}.`);
        return;
      }
    }

    try {
      const resp = await fetch('/api/admin/timetables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(ttForm)
      });
      const resJson = await resp.json();
      if (!resp.ok) throw new Error(resJson.error || 'Server error creating timetable slot');

      appendLog?.(`[TIMETABLE ENGINE] Booked Lecture slot: Unit ID "${ttForm.unitId}" on "${ttForm.day}" inside Hall "${ttForm.venue}"`);
      triggerFeedback('Lecture session slot booked successfully.');
      setTtForm(prev => ({ ...prev, venue: '' }));
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Delete Timetable
  const handleDeleteTimetable = async (id: string) => {
    if (!window.confirm('Delete this scheduled lecture slot?')) return;
    try {
      const resp = await fetch(`/api/admin/timetables/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resp.ok) {
        triggerFeedback('Scheduled slot canceled.');
      } else {
        const d = await resp.json();
        setError(d.error);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className={`space-y-6 ${isPhoneFrame ? 'text-xs' : 'text-sm'}`}>
      
      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-250 text-emerald-850 rounded-xl text-xs font-bold leading-none animate-pulse">
          {success}
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-50 border border-red-250 text-red-800 rounded-xl text-xs font-bold flex items-center gap-1.5 leading-snug">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-650" />
          <span>{error}</span>
        </div>
      )}

      {/* Module 8: Class Groups Section */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-extrabold text-slate-800 text-xs flex items-center gap-2 pb-2 border-b border-slate-100">
          <Users className="h-4 w-4 text-indigo-600" /> Module 8: Cohort Class Groups
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Form */}
          <form onSubmit={handleCreateClassGroup} className="bg-slate-50 p-3.5 rounded-xl border border-slate-150 space-y-3 text-[10px] h-fit">
            <div>
              <label className="text-[9px] text-slate-400 font-bold block mb-1">Target Program</label>
              <select 
                value={cgForm.programId} 
                onChange={(e) => setCgForm({ ...cgForm, programId: e.target.value })} 
                className="w-full p-2 bg-white rounded-lg border border-slate-200 text-slate-700 font-bold outline-none"
                required
              >
                <option value="">-- Choose Program --</option>
                {programs.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[9px] text-slate-400 font-bold block mb-1">Target Year Level</label>
              <select 
                value={cgForm.levelId} 
                onChange={(e) => setCgForm({ ...cgForm, levelId: e.target.value })} 
                className="w-full p-2 bg-white rounded-lg border border-slate-200 text-slate-700 font-bold outline-none"
                required
              >
                <option value="">-- Choose Level --</option>
                {levels.map(l => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[9px] text-slate-400 font-bold block mb-1">Cohort Code Name (e.g. Group A)</label>
              <input 
                type="text" 
                value={cgForm.groupName} 
                onChange={(e) => setCgForm({ ...cgForm, groupName: e.target.value })} 
                placeholder="Group Alpha"
                className="w-full p-2 bg-white rounded-lg border border-slate-200 font-bold text-slate-850 outline-none text-[11px]" 
                required 
              />
            </div>

            <div>
              <label className="text-[9px] text-slate-400 font-bold block mb-1">Student Seat Capacity Limit</label>
              <input 
                type="number" 
                value={cgForm.capacity} 
                onChange={(e) => setCgForm({ ...cgForm, capacity: parseInt(e.target.value, 10) || 40 })} 
                className="w-full p-2 bg-white rounded-lg border border-slate-200 font-bold text-slate-750 outline-none font-mono text-[11px]" 
                required 
              />
            </div>

            <button 
              type="submit" 
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer font-mono shadow-xs"
            >
              + Create Cohort Gate
            </button>
          </form>

          {/* List Classgroups */}
          <div className="md:col-span-2 space-y-2">
            <h4 className="text-[9px] text-slate-400 uppercase font-extrabold font-mono tracking-widest pl-1">Configured Cohorts:</h4>
            {classGroups.length === 0 ? (
              <p className="text-center text-slate-400 font-mono text-[10px] py-6 bg-slate-50 border border-slate-150 rounded-xl">No class student cohorts formulated.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
                {classGroups.map(cg => (
                  <div key={cg.id} className="p-3 bg-white border border-slate-150 hover:border-slate-300 rounded-xl transition-all shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-extrabold text-slate-800 text-[11px]">{cg.groupName}</h4>
                        <span className="text-[8px] font-mono bg-indigo-50 border border-indigo-100 rounded text-indigo-700 px-1 py-0.2">
                          Cap: {cg.capacity} seats
                        </span>
                      </div>
                      <p className="text-[9px] text-slate-450 mt-1 truncate"><strong className="text-slate-500 font-sans">Program:</strong> {cg.programName}</p>
                      <p className="text-[9px] text-slate-450 truncate"><strong className="text-slate-500 font-sans">Level:</strong> {cg.levelName}</p>
                    </div>

                    <button 
                      onClick={() => handleDeleteClassGroup(cg.id)}
                      className="mt-3.5 pt-2 border-t border-slate-100 w-full flex items-center justify-center gap-1.5 text-rose-650 hover:bg-rose-50 text-[10px] font-extrabold py-1.5 rounded-lg border border-rose-100/50 cursor-pointer"
                    >
                      <Trash2 className="h-3 w-3" /> Dismiss Cohort
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Module 9: Central Timetabler scheduling */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-extrabold text-slate-800 text-xs flex items-center gap-2 pb-1 border-b border-slate-100">
          <Clock className="h-4 w-4 text-indigo-600 animate-pulse" /> Module 9: Central Timetabler Planner
        </h3>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-150">
          <div className="space-y-0.5">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Timetabling Mode Select</span>
            <p className="text-[9px] text-slate-500">Choose between manual calendar scheduling, assisted slot recommendation, or AI-based batch scheduler.</p>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-200/60 p-1 rounded-lg w-fit shrink-0 self-end">
            <button
              onClick={() => setSchedulingMode('manual')}
              className={`px-3 py-1.5 rounded-md text-[10px] font-black tracking-wide uppercase transition-all duration-155 cursor-pointer ${schedulingMode === 'manual' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-550 hover:text-slate-850 bg-transparent'}`}
            >
              ✍️ Manual / Guided
            </button>
            <button
              onClick={() => setSchedulingMode('auto')}
              className={`px-3 py-1.5 rounded-md text-[10px] font-black tracking-wide uppercase transition-all duration-155 cursor-pointer flex items-center gap-1 ${schedulingMode === 'auto' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-550 hover:text-slate-850 bg-transparent'}`}
            >
              <Sparkles className="h-3 w-3 text-indigo-600 animate-pulse" /> Auto-Scheduler (AI)
            </button>
            <button
              onClick={() => setSchedulingMode('intelligence')}
              className={`px-3 py-1.5 rounded-md text-[10px] font-black tracking-wide uppercase transition-all duration-155 cursor-pointer flex items-center gap-1 ${schedulingMode === 'intelligence' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-550 hover:text-slate-850 bg-transparent'}`}
            >
              <Activity className="h-3 w-3 text-indigo-600 animate-pulse" /> Intelligence & Rebalance
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Schedulers Left Column */}
          {schedulingMode === 'auto' ? (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-4 text-[10px] h-fit">
              <div className="flex items-center gap-1.5 pb-2 border-b border-slate-200">
                <Sparkles className="h-4 w-4 text-indigo-600 animate-pulse shrink-0" />
                <span className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">AI Auto-Scheduler Control</span>
              </div>

              <p className="text-slate-500 text-[9px] leading-relaxed">
                Automatically books all allocated teaching assignments into available classrooms. Configured to resolve student, teacher, and venue collisions concurrently using suitability scoring matrices.
              </p>

              {/* Optimization Parameters */}
              <div className="bg-white p-3 rounded-xl border border-slate-150 space-y-2.5">
                <span className="font-black text-slate-700 block text-[9px] uppercase tracking-wider">Algorithmic Policies</span>

                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={autoConfig.labsFirst}
                    onChange={(e) => setAutoConfig({ ...autoConfig, labsFirst: e.target.checked })}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                  />
                  <div>
                    <span className="font-bold text-slate-800 block text-[9px]">Prioritize Technical Labs & Practicals</span>
                    <span className="text-[8px] text-slate-400 block -mt-0.5">Locks lab equipment and specialized rooms first to eliminate venue contention.</span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={autoConfig.seniorPriority}
                    onChange={(e) => setAutoConfig({ ...autoConfig, seniorPriority: e.target.checked })}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                  />
                  <div>
                    <span className="font-bold text-slate-800 block text-[9px]">Senior level Morning Preference</span>
                    <span className="text-[8px] text-slate-400 block -mt-0.5">Prioritizes Year 3 & 4 cohorts for morning lecture timespans.</span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={autoConfig.avoidOverload}
                    onChange={(e) => setAutoConfig({ ...autoConfig, avoidOverload: e.target.checked })}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                  />
                  <div>
                    <span className="font-bold text-slate-800 block text-[9px]">Lecturer Workload Cap Balancing</span>
                    <span className="text-[8px] text-slate-400 block -mt-0.5">Enforces a strict 12-hour per week cap on any single lecturer.</span>
                  </div>
                </label>
              </div>

              {/* Scope Filters */}
              <div className="grid grid-cols-2 gap-2.5 bg-white p-2.5 rounded-xl border border-slate-150">
                <div>
                  <label className="text-[9px] text-slate-400 font-bold block mb-1 uppercase tracking-wider">Academic Year</label>
                  <select
                    value={ttForm.academicYearId}
                    onChange={(e) => setTtForm({ ...ttForm, academicYearId: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-none text-[9px] font-black" required
                  >
                    <option value="">-- Year --</option>
                    {academicYears.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-[9px] text-slate-400 font-bold block mb-1 uppercase tracking-wider">Semester Term</label>
                  <select
                    value={ttForm.semesterId}
                    onChange={(e) => setTtForm({ ...ttForm, semesterId: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-none text-[9px] font-black" required
                  >
                    <option value="">-- Semester --</option>
                    {semesters.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={runAutoGeneration}
                disabled={generatingAuto || !ttForm.academicYearId || !ttForm.semesterId}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-[10px] font-black tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                {generatingAuto ? (
                  <>
                    <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Crunching Constraints...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5 text-white animate-bounce" />
                    <span>⚡ Generate Automated Timetable</span>
                  </>
                )}
              </button>

              {/* Success report */}
              {draftSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-250 rounded-xl space-y-2 text-[10px] leading-relaxed">
                  <p className="font-extrabold text-emerald-800">{draftSuccess}</p>
                </div>
              )}

              {/* Draft Report Outcomes */}
              {autoReport && (
                <div className="bg-indigo-50/50 border border-indigo-200 p-3 rounded-xl space-y-3 leading-snug">
                  <div className="flex items-center gap-1 text-indigo-900 font-extrabold text-[10px] uppercase tracking-wider">
                    <span className="h-2 w-2 rounded-full bg-indigo-500 animate-ping" />
                    <span>Batch Planner Performance Metrics</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[8px] text-center font-bold text-slate-500">
                    <div className="bg-white p-2 rounded-lg border border-slate-150">
                      <span className="text-indigo-600 block text-[11px] font-black">{autoReport.draftCount}</span>
                      <span>Scheduled Slots</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-150">
                      <span className="text-indigo-600 block text-[11px] font-black">{autoReport.stats.averageSuitability}%</span>
                      <span>Avg Suitability</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-150">
                      <span className="text-emerald-600 block text-[11px] font-black">{autoReport.stats.roomEfficiencyScore}</span>
                      <span>Room efficiency</span>
                    </div>
                  </div>

                  {autoReport.unassignedCount > 0 && (
                    <div className="text-[8px] text-amber-800 bg-amber-50 rounded-lg p-2 border border-amber-200">
                      <b className="font-extrabold">{autoReport.unassignedCount} constraint conflicts/unassigned allocations:</b>
                      <ul className="list-disc pl-3 mt-1 space-y-0.5 max-h-[80px] overflow-y-auto">
                        {autoReport.unassignedDetails.map((detailsStr: string, idx: number) => (
                          <li key={idx}>{detailsStr}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex gap-2 pt-1 border-t border-indigo-150">
                    <button
                      type="button"
                      onClick={approveDraft}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-lg text-[9px] uppercase tracking-wider shadow-sm cursor-pointer transition-all text-center"
                    >
                      Publish Draft
                    </button>
                    <button
                      type="button"
                      onClick={clearDraft}
                      className="flex-1 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg text-[9px] uppercase tracking-wider cursor-pointer border border-slate-350 text-center transition-all"
                    >
                      Discard Draft
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : schedulingMode === 'intelligence' ? (
            /* Global Intelligence & Heuristics Optimization Dashboard (Step 1, 3 & 4) */
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-4 text-[10px] h-fit col-span-1 xl:col-span-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-indigo-600 animate-pulse shrink-0" />
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">Institution-Wide Scheduling Optimizer</h4>
                    <span className="text-[8px] text-slate-400 block -mt-0.5">Real-time conflict predictions, fatigue audits, workload balance indices</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setAnalysisMode('live')}
                      className={`px-2.5 py-1 rounded-md text-[8px] font-extrabold uppercase transition-all duration-120 cursor-pointer ${analysisMode === 'live' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      📊 Live Publisher
                    </button>
                    <button
                      type="button"
                      onClick={() => setAnalysisMode('draft')}
                      className={`px-2.5 py-1 rounded-md text-[8px] font-extrabold uppercase transition-all duration-120 cursor-pointer ${analysisMode === 'draft' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      🧪 Sandbox Drafts
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleOptimizeSemester}
                    disabled={rebalancing || !ttForm.academicYearId || !ttForm.semesterId}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black text-[9px] uppercase tracking-wider rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs transition-all duration-150"
                  >
                    {rebalancing ? (
                      <>
                        <div className="h-2.5 w-2.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Re-Allocating Full Semester...</span>
                      </>
                    ) : (
                      <>
                        <Shuffle className="h-3 w-3 animate-spin" />
                        <span>⚡ Re-Balance Full Semester</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {loadingReport && (
                <div className="p-8 text-center bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col items-center gap-2">
                  <div className="h-6 w-6 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  <span className="font-extrabold text-indigo-700 text-[10px] tracking-wider uppercase animate-pulse">Running global audit heuristics...</span>
                </div>
              )}

              {!loadingReport && intelligenceReport ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col items-center justify-center text-center col-span-1 md:col-span-1 border-t-4 border-t-indigo-600">
                      <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-widest block mb-1">Optimized Health</span>
                      <div className="relative flex items-center justify-center p-1">
                        <div className="h-16 w-16 rounded-full border-4 border-indigo-50 flex items-center justify-center">
                          <span className="text-[14px] font-black font-mono text-indigo-600">{intelligenceReport.globalScore}%</span>
                        </div>
                      </div>
                      <span className="text-[8px] font-black text-indigo-700 uppercase tracking-wide mt-2 block bg-indigo-50 px-2 py-0.5 rounded-full">
                        {intelligenceReport.globalScore >= 85 ? '👑 Highly Stable' : intelligenceReport.globalScore >= 70 ? '⚖️ Balanced' : '⚠️ Suboptimal'}
                      </span>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2 col-span-1 md:col-span-1 border-t-4 border-t-blue-500">
                      <div className="flex items-center justify-between">
                        <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-widest">Faculty Fairness</span>
                        <Award className="h-3.5 w-3.5 text-blue-500" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-sm font-black font-mono text-slate-800 block">{intelligenceReport.metrics.fairnessScore}%</span>
                        <span className="text-[8px] text-slate-500 block">SD workload: <b>{intelligenceReport.analytics.stdevWorkload} hrs</b></span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1">
                        <div className="bg-blue-500 h-1 rounded-full transition-all duration-300" style={{ width: `${intelligenceReport.metrics.fairnessScore}%` }} />
                      </div>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2 col-span-1 md:col-span-1 border-t-4 border-t-emerald-500">
                      <div className="flex items-center justify-between">
                        <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-widest">Student Fatigue</span>
                        <Activity className="h-3.5 w-3.5 text-emerald-500" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-sm font-black font-mono text-slate-800 block">{intelligenceReport.metrics.studentFatigueScore}%</span>
                        <span className="text-[8px] text-slate-500 block">Low daily overloaded cohorts</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1">
                        <div className="bg-emerald-500 h-1 rounded-full transition-all duration-300" style={{ width: `${intelligenceReport.metrics.studentFatigueScore}%` }} />
                      </div>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2 col-span-1 md:col-span-1 border-t-4 border-t-orange-500">
                      <div className="flex items-center justify-between">
                        <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-widest">Room Utilization</span>
                        <Gauge className="h-3.5 w-3.5 text-orange-500" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-sm font-black font-mono text-slate-800 block">{intelligenceReport.metrics.roomUtilScore}%</span>
                        <span className="text-[8px] text-slate-500 block">Space fit & usage efficiencies</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1">
                        <div className="bg-orange-500 h-1 rounded-full transition-all duration-300" style={{ width: `${intelligenceReport.metrics.roomUtilScore}%` }} />
                      </div>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2 col-span-1 md:col-span-1 border-t-4 border-t-purple-500">
                      <div className="flex items-center justify-between">
                        <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-widest">Academic Spread</span>
                        <TrendingUp className="h-3.5 w-3.5 text-purple-500" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-sm font-black font-mono text-slate-800 block">{intelligenceReport.metrics.academicBalanceScore}%</span>
                        <span className="text-[8px] text-slate-500 block">Class spread distribution index</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1">
                        <div className="bg-purple-500 h-1 rounded-full transition-all duration-300" style={{ width: `${intelligenceReport.metrics.academicBalanceScore}%` }} />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-4 gap-3">
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                        <span className="font-extrabold text-slate-800 block text-[9px] uppercase tracking-wider">🔴 Faculty Load Warnings</span>
                        <span className="text-[8px] font-bold text-red-650 bg-red-50 px-1.5 py-0.5 rounded-full">{intelligenceReport.analytics.overloadedLecturers.length} Alerts</span>
                      </div>
                      <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                        {intelligenceReport.analytics.overloadedLecturers.length === 0 ? (
                          <div className="text-slate-400 text-[8px] py-4 text-center font-bold">🏆 No overloaded faculty. Load is fully balanced within budgeting constraints.</div>
                        ) : (
                          intelligenceReport.analytics.overloadedLecturers.map((st: any) => (
                            <div key={st.id} className="p-1.5 rounded bg-red-50/50 border border-red-150 text-[8px] space-y-0.5 leading-tight">
                              <p className="font-extrabold text-slate-850 flex justify-between">
                                <span>{st.name}</span>
                                <span className="text-red-700 font-black">{st.hours} hrs/wk</span>
                              </p>
                              <p className="text-[7px] text-slate-400 font-bold">{st.department}</p>
                              <p className="text-[7px] text-red-650 font-extrabold">⚠️ {st.reason}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                        <span className="font-extrabold text-slate-800 block text-[9px] uppercase tracking-wider">🟡 Fatigue Hotspots</span>
                        <span className="text-[8px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">{intelligenceReport.analytics.fatiguedCohorts.length} Alarms</span>
                      </div>
                      <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                        {intelligenceReport.analytics.fatiguedCohorts.length === 0 ? (
                          <div className="text-slate-400 text-[8px] py-4 text-center font-bold">🏆 Zero daily lecture load spikes. Balanced student routine structure.</div>
                        ) : (
                          intelligenceReport.analytics.fatiguedCohorts.map((coh: any, cIdx: number) => (
                            <div key={cIdx} className="p-1.5 rounded bg-amber-50/50 border border-amber-150 text-[8px] space-y-0.5 leading-tight">
                              <p className="font-extrabold text-slate-850 flex justify-between">
                                <span>{coh.cohortName}</span>
                                <span className="text-amber-700 font-black">{coh.hours} hrs</span>
                              </p>
                              <p className="text-[7px] text-slate-400 font-bold">Concentrated day: {coh.day}</p>
                              <p className="text-[7px] text-amber-600 font-extrabold">💥 {coh.severity} (&gt;6 hrs daily classes)</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                        <span className="font-extrabold text-slate-800 block text-[9px] uppercase tracking-wider">🟢 Classroom Wastage</span>
                        <span className="text-[8px] font-bold text-indigo-650 bg-indigo-50 px-1.5 py-0.5 rounded-full">{intelligenceReport.analytics.underutilizedRooms.length} Empty</span>
                      </div>
                      <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                        {intelligenceReport.analytics.underutilizedRooms.length === 0 ? (
                          <div className="text-slate-400 text-[8px] py-4 text-center font-bold">🏆 All classrooms efficiently utilizes. Good space headroom balance.</div>
                        ) : (
                          intelligenceReport.analytics.underutilizedRooms.map((rm: any) => (
                            <div key={rm.id} className="p-1.5 rounded bg-slate-50 border border-slate-200 text-[8px] space-y-0.5 leading-tight">
                              <p className="font-extrabold text-slate-850 flex justify-between">
                                <span>RM {rm.roomNumber} - {rm.name}</span>
                                <span className="text-slate-500">Cap: {rm.capacity} seats</span>
                              </p>
                              <p className="text-[7px] text-amber-700 font-bold">📉 {rm.issue}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                        <span className="font-extrabold text-slate-800 block text-[9px] uppercase tracking-wider">🟠 Congested Rooms</span>
                        <span className="text-[8px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded-full">{intelligenceReport.analytics.overutilizedRooms.length} Overload</span>
                      </div>
                      <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                        {intelligenceReport.analytics.overutilizedRooms.length === 0 ? (
                          <div className="text-slate-400 text-[8px] py-4 text-center font-bold">🏆 Space remains uniformly dispersed. Zero overcrowding indicators.</div>
                        ) : (
                          intelligenceReport.analytics.overutilizedRooms.map((rm: any) => (
                            <div key={rm.id} className="p-1.5 rounded bg-orange-50/50 border border-orange-150 text-[8px] space-y-0.5 leading-tight">
                              <p className="font-extrabold text-slate-850 flex justify-between">
                                <span>RM {rm.roomNumber}</span>
                                <span className="text-orange-700 font-black">{rm.bookingPercentage}% full</span>
                              </p>
                              <p className="text-[7px] text-slate-450 font-bold">{rm.name} (Cap: {rm.capacity})</p>
                              <p className="text-[7px] text-orange-600 font-extrabold">🚨 {rm.issue}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                    <span className="font-extrabold text-slate-800 block text-[9px] uppercase tracking-wider">📈 Semester Day-Of-The-Week Load Distribution Profile</span>
                    <div className="grid grid-cols-5 gap-3.5 pt-1.5">
                      {Object.entries(intelligenceReport.analytics.dailyTotalClasses).map(([day, count]: any) => {
                        const maxCount = Math.max(...(Object.values(intelligenceReport.analytics.dailyTotalClasses) as any[]), 1);
                        const progressPct = Math.round((count / maxCount) * 100);
                        return (
                          <div key={day} className="space-y-1">
                            <div className="flex justify-between items-center text-[8px]">
                              <span className="font-bold text-slate-600 uppercase tracking-widest">{day}</span>
                              <span className="font-mono text-indigo-650 font-extrabold">({count} slot{count !== 1 ? 's' : ''})</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5">
                              <div className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300" style={{ width: `${progressPct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* SCHEDULING GOVERNANCE CONFLICT HISTORY & MEMORY */}
                  {loadingGovMemory ? (
                    <div className="p-6 bg-white border border-slate-200 rounded-xl flex items-center justify-center gap-2">
                      <div className="h-4 w-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                      <span className="font-bold text-slate-400 text-[9px] uppercase tracking-wider animate-pulse">Syncing scheduling governance memory...</span>
                    </div>
                  ) : govMemory ? (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                      {/* Left: Conflict Memory Trends */}
                      <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-950 space-y-4 shadow-xl">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-emerald-400" />
                            <h5 className="font-extrabold text-[10px] uppercase tracking-wider text-slate-100">📈 Conflict History Memory Engine</h5>
                          </div>
                          <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                            <span className="text-[7.5px] text-slate-300 font-bold font-mono tracking-wider uppercase">
                              Efficiency Index: {govMemory.institutionalEfficiencyIndex}%
                            </span>
                          </div>
                        </div>

                        <div className="space-y-4 text-[9px]">
                          {/* Score trend - Trajectory Graph */}
                          {govMemory.scoreTrend && govMemory.scoreTrend.length > 0 && (
                            <div className="space-y-3 bg-slate-850 p-3.5 rounded-xl border border-slate-800">
                              <span className="text-slate-400 font-extrabold uppercase text-[7px] tracking-widest block font-mono">
                                Trajectory: Multi-Semester Quality score Trend
                              </span>
                              
                              {/* Dynamic SVG Line Graph */}
                              <div className="h-18 w-full bg-slate-900/40 rounded-xl border border-slate-800/80 p-1.5 relative flex flex-col justify-between">
                                <svg className="w-full h-full text-indigo-400 overflow-visible" viewBox="0 0 300 50" preserveAspectRatio="none">
                                  {/* Grid Lines */}
                                  <line x1="0" y1="12.5" x2="300" y2="12.5" stroke="#1e293b" strokeOpacity="0.4" strokeDasharray="2,2" />
                                  <line x1="0" y1="25" x2="300" y2="25" stroke="#1e293b" strokeOpacity="0.4" strokeDasharray="2,2" />
                                  <line x1="0" y1="37.5" x2="300" y2="37.5" stroke="#1e293b" strokeOpacity="0.4" strokeDasharray="2,2" />
                                  
                                  {(() => {
                                    const points = govMemory.scoreTrend;
                                    const coords = points.map((p: any, i: number) => {
                                      const x = points.length > 1 ? (i / (points.length - 1)) * 300 : 150;
                                      const y = 45 - ((p.score - 20) / 80) * 40; // map 20-100 to y
                                      return { x, y, score: p.score, label: p.label };
                                    });

                                    let pathD = "";
                                    if (coords.length > 0) {
                                      pathD = `M ${coords[0].x} ${coords[0].y}`;
                                      for (let i = 1; i < coords.length; i++) {
                                        pathD += ` L ${coords[i].x} ${coords[i].y}`;
                                      }
                                    }

                                    return (
                                      <>
                                        {/* Polyline */}
                                        {pathD && <path d={pathD} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}
                                        {/* Area filler with gradient */}
                                        {pathD && (
                                          <path 
                                            d={`${pathD} L ${coords[coords.length - 1].x} 48 L ${coords[0].x} 48 Z`} 
                                            fill="url(#indigo-grad)" 
                                            opacity="0.15" 
                                          />
                                        )}
                                        <defs>
                                          <linearGradient id="indigo-grad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#818cf8" />
                                            <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
                                          </linearGradient>
                                        </defs>
                                        {/* Points bubble */}
                                        {coords.map((c: any, idx: number) => (
                                          <g key={idx} className="group">
                                            <circle cx={c.x} cy={c.y} r="3" fill="#4f46e5" stroke="#818cf8" strokeWidth="1.5" />
                                            <text x={c.x} y={c.y - 6} fill="#a5b4fc" fontSize="5.5" fontWeight="900" textAnchor="middle">{c.score}%</text>
                                          </g>
                                        ))}
                                      </>
                                    );
                                  })()}
                                </svg>
                                <div className="flex justify-between w-full px-1 text-[6px] font-mono text-slate-500">
                                  <span>{govMemory.scoreTrend[0]?.label || 'Past Semester'}</span>
                                  <span className="text-[6.5px] text-indigo-400 font-extrabold tracking-wider uppercase">Institutional Efficiency tracking</span>
                                  <span>{govMemory.scoreTrend[govMemory.scoreTrend.length - 1]?.label || 'Active Semester'}</span>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                            {/* Hotspots */}
                            <div className="space-y-2 bg-slate-850 p-3 rounded-xl border border-slate-800">
                              <span className="text-amber-400 font-extrabold uppercase text-[7px] tracking-widest block font-mono">🔥 Semester Conflict Hotspots</span>
                              <div className="space-y-1.5">
                                {govMemory.conflictHotspots && govMemory.conflictHotspots.length === 0 ? (
                                  <div className="text-slate-500 text-[8px] italic py-2">No recurrent hotspots detected.</div>
                                ) : (
                                  govMemory.conflictHotspots?.slice(0, 3).map((hs: any, idx: number) => (
                                    <div key={idx} className="bg-slate-900 border border-slate-800/80 p-2 rounded-lg text-[8px] flex justify-between items-center text-slate-300 font-bold leading-none hover:border-slate-700 transition">
                                      <span className="truncate">{hs.slot}</span>
                                      <span className="bg-amber-950 text-amber-305 font-mono font-black text-[7.5px] px-1.5 py-0.5 rounded shrink-0 ml-1 border border-amber-900/50">
                                        {hs.bookings} slots
                                      </span>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>

                            {/* Congested rooms */}
                            <div className="space-y-2 bg-slate-850 p-3 rounded-xl border border-slate-800">
                              <span className="text-orange-400 font-extrabold uppercase text-[7px] tracking-widest block font-mono font-sans">🏫 Recurring Congestion Zones</span>
                              <div className="space-y-1.5">
                                {govMemory.recurringRoomCongestion && govMemory.recurringRoomCongestion.length === 0 ? (
                                  <div className="text-slate-500 text-[8px] italic py-2">No heavily congested spaces logged.</div>
                                ) : (
                                  govMemory.recurringRoomCongestion?.slice(0, 3).map((rc: any) => (
                                    <div key={rc.id} className="bg-slate-900 border border-slate-800/80 p-2 rounded-lg text-[8px] leading-tight text-slate-300 space-y-1 hover:border-slate-700 transition">
                                      <div className="font-extrabold text-slate-100 flex justify-between">
                                        <span>RM {rc.roomNumber}</span>
                                        <span className="text-orange-400 shrink-0 font-mono">{rc.congestionCount}x Congested</span>
                                      </div>
                                      <div className="w-full bg-slate-800 rounded-full h-1 overflow-hidden">
                                        <div 
                                          className="bg-orange-500 h-1 rounded-full transition-all" 
                                          style={{ width: `${Math.min(100, (rc.maxWeeklyBookings / 20) * 100)}%` }} 
                                        />
                                      </div>
                                      <p className="text-[6.5px] text-slate-500 font-semibold font-mono">
                                        Peak utilization: {rc.maxWeeklyBookings}/20 weekly bookings ({Math.round((rc.maxWeeklyBookings / 20) * 100)}%)
                                      </p>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Overloaded educators */}
                          {govMemory.repeatedOverloadPatterns && govMemory.repeatedOverloadPatterns.length > 0 && (
                            <div className="p-3 bg-slate-850 rounded-xl space-y-2 border border-slate-800">
                              <span className="text-red-400 font-black uppercase text-[7px] tracking-widest block font-mono">⚠️ Repeated Lecturer Overload Patterns (Evolving audit)</span>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {govMemory.repeatedOverloadPatterns.slice(0, 4).map((pattern: any) => (
                                  <div key={pattern.id} className="bg-slate-900 p-2 rounded-lg border border-slate-800 text-[8px] space-y-1 hover:border-slate-700 transition">
                                    <div className="font-bold text-slate-200 flex justify-between items-center">
                                      <span className="truncate text-slate-100 max-w-[120px] font-sans text-xs">{pattern.name}</span>
                                      <span className="text-red-400 font-mono font-black border border-red-900 bg-red-950/40 px-1 py-0.2 rounded text-[7.5px]">{pattern.maxHours} hrs</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[7.5px] text-slate-450 mt-1">
                                      <span className="truncate">{pattern.department}</span>
                                      <span className="text-amber-400 font-extrabold font-mono shrink-0">⚠️ Breach in {pattern.overloadCount} terms</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Pure What-If Simulation Sandbox */}
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-xl flex flex-col justify-between">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                            <div className="flex items-center gap-2">
                              <Sparkles className="h-4 w-4 text-indigo-600 animate-pulse" />
                              <h5 className="font-extrabold text-[10px] uppercase tracking-wider text-slate-850">🧪 WHAT-IF Stress Simulator (Pure Sandbox Mode)</h5>
                            </div>
                            <span className="text-[7.5px] bg-indigo-50 text-indigo-700 font-mono font-black px-2 py-0.5 rounded-full border border-indigo-100 uppercase tracking-wide">
                              SAFE HYPOTHETICALS
                            </span>
                          </div>

                          {/* Controls */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-150">
                            <div className="space-y-1.5">
                              <span className="text-[8px] text-slate-450 font-bold uppercase tracking-wider block font-mono">Extra Cohort Students</span>
                              <input 
                                type="range"
                                min="0"
                                max="150"
                                step="5"
                                value={simulationParams.additionalStudentsCount}
                                onChange={(e) => setSimulationParams(prev => ({ ...prev, additionalStudentsCount: parseInt(e.target.value, 10) || 0 }))}
                                className="w-full accent-indigo-600 h-1 bg-slate-200 rounded-lg cursor-pointer animate-pulse"
                              />
                              <div className="flex justify-between items-center font-bold">
                                <span className="text-[10px] text-indigo-650 font-mono font-black">+{simulationParams.additionalStudentsCount} students</span>
                                <span className="text-[7px] text-slate-400 font-semibold">Seat headroom</span>
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <span className="text-[8px] text-slate-455 font-bold uppercase tracking-wider block font-mono">Withdraw Lecturer</span>
                              <select
                                value={selectedStaffToSimulateRemove}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setSelectedStaffToSimulateRemove(val);
                                  if (val && !simulationParams.removedStaffIds.includes(val)) {
                                    setSimulationParams(prev => ({ ...prev, removedStaffIds: [...prev.removedStaffIds, val] }));
                                  }
                                }}
                                className="w-full p-2 bg-white border border-slate-250 rounded-lg text-slate-750 outline-none font-bold text-[10px] shrink-0 font-mono"
                              >
                                <option value="">-- Choose Staff to Pull --</option>
                                {staff.map((st: any) => (
                                  <option key={st.id} value={st.id} disabled={simulationParams.removedStaffIds.includes(st.id)}>
                                    {st.name}
                                  </option>
                                ))}
                              </select>
                              <div className="flex flex-wrap gap-1 max-h-[44px] overflow-y-auto pt-0.5">
                                {simulationParams.removedStaffIds.length === 0 ? (
                                  <span className="text-[7px] text-slate-400 italic">No staff pulled offline</span>
                                ) : (
                                  simulationParams.removedStaffIds.map(stId => {
                                    const stf = staff.find(s => s.id === stId);
                                    return (
                                      <span key={stId} className="inline-flex items-center gap-1 text-[7px] bg-red-50 text-red-700 px-1.5 py-0.5 rounded border border-red-100 font-extrabold leading-none">
                                        {stf ? stf.name : stId}
                                        <button 
                                          type="button" 
                                          className="text-red-500 hover:text-red-800 font-bold cursor-pointer ml-0.5"
                                          onClick={() => setSimulationParams(p => ({ ...p, removedStaffIds: p.removedStaffIds.filter(id => id !== stId) }))}
                                        >
                                          ×
                                        </button>
                                      </span>
                                    );
                                  })
                                )}
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <span className="text-[8px] text-slate-450 font-bold uppercase tracking-wider block font-mono font-sans font-black">Multi-Campus decentralization</span>
                              <select
                                value={simulationParams.addedCampusesCount}
                                onChange={(e) => setSimulationParams(prev => ({ ...prev, addedCampusesCount: parseInt(e.target.value, 10) || 1 }))}
                                className="w-full p-2 bg-white border border-slate-250 rounded-lg text-slate-755 outline-none font-bold text-[10px]"
                              >
                                <option value="1">1 Unified Campus Grid</option>
                                <option value="2">2 Dispersed Regional Campuses</option>
                              </select>
                              <span className="text-[6.5px] text-slate-400 block font-medium">Computes inter-campus travel conflicts</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-150 gap-3">
                            <div className="space-y-0.5">
                              <span className="text-[8px] font-black text-slate-700 uppercase tracking-wide">Stress Validation Sandbox Engine</span>
                              <p className="text-[7.5px] text-slate-505 max-w-[240px] leading-snug">
                                Calculate immediate student congestion and orphan risks under hypothetical emergencies. Database remains unaltered.
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={handleRunSimulation}
                              disabled={simulating}
                              className="px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white font-black rounded-lg text-[9px] uppercase tracking-wider transition-all shadow-sm cursor-pointer shrink-0 disabled:opacity-50 flex items-center gap-1.5"
                            >
                              {simulating ? (
                                <>
                                  <div className="h-2.5 w-2.5 border-1.5 border-white border-t-transparent rounded-full animate-spin" />
                                  <span>Simulating...</span>
                                </>
                              ) : (
                                <>
                                  <Sparkles className="h-3 w-3 text-white" />
                                  <span>🚀 Simulate Stress</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Outcomes Displaying */}
                        {simulationResult ? (
                          <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-xl text-[9px] space-y-3.5 shadow-inner mt-2">
                            <div className="flex items-center justify-between border-b pb-2 border-slate-200/80">
                              <div className="space-y-0.5">
                                <p className="font-extrabold text-slate-800 uppercase text-[8.5px] tracking-wide font-mono">Simulated Institutional Verdict</p>
                                <p className="text-[7px] text-slate-500 uppercase font-mono tracking-wider font-bold">Safety index: <span className="text-slate-850 font-black">{simulationResult.safetyRating}</span></p>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="text-right">
                                  <span className="text-[7px] text-slate-400 font-bold block">SIMULATED SCORE</span>
                                  <span className={`text-[12px] font-black font-mono ${
                                    simulationResult.simulatedScore >= 80 ? 'text-emerald-700' :
                                    simulationResult.simulatedScore >= 60 ? 'text-amber-700' : 'text-red-700 animate-pulse'
                                  }`}>
                                    {simulationResult.simulatedScore}% Quality Range
                                  </span>
                                </div>
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-[10px] font-black font-mono ${
                                  simulationResult.simulatedScore >= 80 ? 'bg-emerald-600' :
                                  simulationResult.simulatedScore >= 60 ? 'bg-amber-500' : 'bg-red-600 animate-bounce'
                                }`}>
                                  {simulationResult.simulatedScore}
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              {/* Seating Failures */}
                              <div className="space-y-1.5 bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                                <span className="text-[7.5px] text-slate-400 font-extrabold block uppercase tracking-wider">Seat Capacities Gaps</span>
                                <p className="font-mono text-slate-750 text-[11px] font-black">
                                  {simulationResult.capacityFailuresCount} shortfall{simulationResult.capacityFailuresCount !== 1 ? 's' : ''}
                                </p>
                                <div className="max-h-[70px] overflow-y-auto space-y-1 pr-0.5">
                                  {simulationResult.capacityFailuresCount === 0 ? (
                                    <span className="text-[7px] text-slate-450 block font-medium">No seating capacity overloads predicted.</span>
                                  ) : (
                                    simulationResult.capacityFailureRisks?.map((risk: any, rIdx: number) => (
                                      <div key={rIdx} className="text-[7px] bg-red-55/70 text-red-800 p-1 rounded font-medium leading-tight">
                                        <b>{risk.cohortName}</b>: RM {risk.roomNumber} lacks <b>{risk.deficit}</b> seats (needs {risk.neededCapacity}, max {risk.currentCapacity}).
                                      </div>
                                    ))
                                  )}
                                </div>
                              </div>

                              {/* Orphan risk */}
                              <div className="space-y-1.5 bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                                <span className="text-[7.5px] text-slate-400 font-extrabold block uppercase tracking-wider font-mono">Unstaffed Orphan Classes</span>
                                <p className="font-mono text-slate-750 text-[11px] font-black">
                                  {simulationResult.unstaffedClassesCount} lecture slots
                                </p>
                                <div className="max-h-[70px] overflow-y-auto space-y-1 pr-0.5">
                                  {simulationResult.unstaffedClassesCount === 0 ? (
                                    <span className="text-[7px] text-slate-450 block font-medium">All sessions fully assigned.</span>
                                  ) : (
                                    simulationResult.unstaffedClassesDetails?.map((detail: any, dIdx: number) => (
                                      <div key={dIdx} className="text-[7px] bg-amber-55/80 text-amber-800 p-1 rounded font-medium leading-tight">
                                        <b>{detail.unitName}</b>: unstaffed slot ({detail.day} @ {detail.timeSlot}).
                                      </div>
                                    ))
                                  )}
                                </div>
                              </div>

                              {/* Transit Risks */}
                              <div className="space-y-1.5 bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                                <span className="text-[7.5px] text-slate-400 font-extrabold block uppercase tracking-wider">Cross-Campus Commutes</span>
                                <p className="font-mono text-slate-750 text-[11px] font-black">
                                  {simulationResult.crossCampusTransitRiskCount} travel frictions
                                </p>
                                <div className="max-h-[70px] overflow-y-auto space-y-1 pr-0.5">
                                  {simulationResult.crossCampusTransitRiskCount === 0 ? (
                                    <span className="text-[7px] text-slate-450 block font-medium">No rapid travel frictions predicted.</span>
                                  ) : (
                                    simulationResult.crossCampusRisks?.map((cc: any, ccIdx: number) => (
                                      <div key={ccIdx} className="text-[7px] bg-indigo-55/70 text-indigo-800 p-1 rounded font-medium leading-tight">
                                        <b>{cc.lecturerName}</b> travel stress ({cc.campusA} ➔ {cc.campusB}) on {cc.day}.
                                      </div>
                                    ))
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Suggestions */}
                            {simulationResult.suggestions && simulationResult.suggestions.length > 0 && (
                              <div className="border-t border-slate-200 pt-2 text-[7.5px] text-slate-500 space-y-1 leading-snug">
                                <span className="font-bold text-[8px] uppercase tracking-wider block text-slate-700 mb-0.5">🧠 AI Stress Remediation Advisory:</span>
                                {simulationResult.suggestions.map((suggestion: string, idx: number) => (
                                  <p key={idx} className="font-medium flex items-start gap-1">
                                    <span>•</span>
                                    <span>{suggestion}</span>
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center p-8 bg-slate-50 border border-dashed border-slate-200 text-slate-400 rounded-xl space-y-1 mt-2">
                            <Activity className="h-6 w-6 text-slate-350 animate-pulse" />
                            <span className="text-[7.5px] uppercase font-mono font-black tracking-widest text-slate-400">Baseline simulated state is inactive</span>
                            <span className="text-[7px] select-none text-slate-400">Trigger sandbox stress testing to calculate risk headroom indices.</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white p-6 rounded-xl border border-slate-200 text-center text-slate-400 text-[9px] uppercase tracking-wider">
                      Syncing institutional records...
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-400 font-bold text-[9px] uppercase tracking-wide">
                  Specify valid Academic Year and Semester targets above to generate automated optimization diagnostics.
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleCreateTimetable} className="bg-slate-50 p-3.5 rounded-xl border border-slate-150 space-y-3.5 text-[10px] h-fit">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[9px] text-slate-400 font-bold block mb-1">Target Year</label>
                  <select 
                    value={ttForm.academicYearId} 
                    onChange={(e) => setTtForm({ ...ttForm, academicYearId: e.target.value })} 
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-700 outline-none" required
                  >
                    <option value="">-- Select Year --</option>
                    {academicYears.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-[9px] text-slate-400 font-bold block mb-1">Target Semester</label>
                  <select 
                    value={ttForm.semesterId} 
                    onChange={(e) => setTtForm({ ...ttForm, semesterId: e.target.value })} 
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-700 outline-none" required
                  >
                    <option value="">-- Select Semester --</option>
                    {semesters.map(s => <option key={s.id} value={s.id}>{s.name} ({s.academicYearName})</option>)}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="text-[9px] text-slate-400 font-bold block mb-1">Target Class cohort Cohort Group</label>
                  <select 
                    value={ttForm.classGroupId} 
                    onChange={(e) => setTtForm({ ...ttForm, classGroupId: e.target.value })} 
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-700 outline-none font-bold" required
                  >
                    <option value="">-- Select Class Group --</option>
                    {classGroups.map(cg => <option key={cg.id} value={cg.id}>{cg.groupName} ({cg.levelName})</option>)}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="text-[9px] text-slate-400 font-bold block mb-1">Target course Subject Unit</label>
                  <select 
                    value={ttForm.unitId} 
                    onChange={(e) => setTtForm({ ...ttForm, unitId: e.target.value })} 
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-700 outline-none font-bold" required
                  >
                    <option value="">-- Select Course Unit --</option>
                    {units.map(u => <option key={u.id} value={u.id}>[{u.code.toUpperCase()}] {u.name}</option>)}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="text-[9px] text-slate-400 font-bold block mb-1">Academic Assigned Lecturer</label>
                  <select 
                    value={ttForm.staffId} 
                    onChange={(e) => setTtForm({ ...ttForm, staffId: e.target.value })} 
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-700 outline-none font-bold" required
                  >
                    <option value="">-- Select Lecturer --</option>
                    {staff.map(st => <option key={st.id} value={st.id}>{st.name} ({st.role})</option>)}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[9px] text-slate-400 font-bold block font-sans">Physical Venue / Room</label>
                    <button 
                      type="button"
                      onClick={() => {
                        setVenueError(null);
                        setVenueSuccess(null);
                        setShowManageRooms(true);
                      }}
                      className="text-[9px] font-black text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 cursor-pointer bg-transparent border-none outline-none"
                    >
                      <Plus className="h-2.5 w-2.5" /> Manage Spaces
                    </button>
                  </div>
                  {rooms.length === 0 ? (
                    <div className="space-y-1">
                      <input 
                        type="text" 
                        value={ttForm.venue} 
                        onChange={(e) => setTtForm({ ...ttForm, venue: e.target.value })} 
                        placeholder="Lecture Hall 3" 
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-800 outline-none font-bold text-[10px]" required 
                      />
                      <p className="text-[8px] text-amber-600 font-medium">Direct text mode active. Use "Manage Spaces" to configure reusable rooms.</p>
                    </div>
                  ) : (
                    <select
                      value={ttForm.venue}
                      onChange={(e) => setTtForm({ ...ttForm, venue: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-800 outline-none font-bold text-[10px]"
                      required
                    >
                      <option value="">-- Select Room --</option>
                      {rooms.map(rm => (
                        <option key={rm.id} value={rm.roomNumber}>
                          {rm.roomNumber} - {rm.name} (Cap: {rm.capacity || 'N/A'})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="text-[9px] text-slate-400 font-bold block mb-1">Day of the Week</label>
                  <select 
                    value={ttForm.day} 
                    onChange={(e) => setTtForm({ ...ttForm, day: e.target.value })} 
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-700 outline-none" required
                  >
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday font-mono">Thursday</option>
                    <option value="Friday">Friday</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="text-[9px] text-slate-400 font-bold block mb-1">Timeslot Hour Range</label>
                  <select 
                    value={ttForm.timeSlot} 
                    onChange={(e) => setTtForm({ ...ttForm, timeSlot: e.target.value })} 
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-700 outline-none font-bold" required
                  >
                    <option value="08:00 AM - 10:00 AM font-mono">08:00 AM - 10:00 AM</option>
                    <option value="10:00 AM - 12:00 PM font-mono">10:00 AM - 12:00 PM</option>
                    <option value="01:00 PM - 03:00 PM font-mono">01:00 PM - 03:00 PM</option>
                    <option value="03:00 PM - 05:00 PM font-mono">03:00 PM - 05:00 PM</option>
                  </select>
                </div>
              </div>

              {/* Real-time Conflict & Optimization Predictor (Step 2) */}
              {(ttForm.academicYearId && ttForm.semesterId && ttForm.classGroupId && ttForm.venue && ttForm.day && ttForm.timeSlot) && (
                <div className="bg-white p-3 rounded-xl border border-slate-250 space-y-2 text-[9px] mt-1 shadow-2xs">
                  <div className="flex items-center gap-1.5 pb-1.5 border-b border-slate-100 font-extrabold text-slate-800 uppercase tracking-wider">
                    <Sparkles className="h-3 w-3 text-indigo-600 animate-pulse" />
                    <span>🔮 AI Allocation Prediction Assistant</span>
                  </div>

                  {loadingPrediction ? (
                    <div className="flex items-center gap-1.5 py-1.5 text-slate-400 font-bold justify-center font-mono">
                      <div className="h-2.5 w-2.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                      <span className="animate-pulse">Analyzing schedule density & constraints...</span>
                    </div>
                  ) : prediction ? (
                    <div className="space-y-2">
                      {/* Hard clash warning */}
                      {prediction.clashProbability === 100 ? (
                        <div className="p-2 bg-red-50 border border-red-200 text-red-800 rounded-lg space-y-1">
                          <p className="font-extrabold text-[10px] flex items-center gap-1">
                            <ShieldAlert className="h-3.5 w-3.5 text-red-650 animate-bounce" />
                            <span>🚨 CRITICAL DOUBLE BOOKING DETECTED</span>
                          </p>
                          <ul className="list-disc pl-3 text-[8.5px] font-medium space-y-0.5">
                            {prediction.clashDetails.venueClash && (
                              <li><b>Classroom clash:</b> Venue is booked by <b>{prediction.clashDetails.venueClash.isDraft ? '[Draft]' : '[Live]'}</b> {prediction.clashDetails.venueClash.unitName || 'Another unit'} ({prediction.clashDetails.venueClash.classGroupName || 'Another cohort'}).</li>
                            )}
                            {prediction.clashDetails.lecturerClash && (
                              <li><b>Lecturer clash:</b> Assigned Faculty is teaching <b>{prediction.clashDetails.lecturerClash.isDraft ? '[Draft]' : '[Live]'}</b> {prediction.clashDetails.lecturerClash.unitName || 'Another unit'}.</li>
                            )}
                            {prediction.clashDetails.cohortClash && (
                              <li><b>Cohort group clash:</b> Class cohort is attending <b>{prediction.clashDetails.cohortClash.isDraft ? '[Draft]' : '[Live]'}</b> {prediction.clashDetails.cohortClash.unitName || 'Another unit'}.</li>
                            )}
                          </ul>
                        </div>
                      ) : (
                        /* Soft alerts / Optimum */
                        <div className="space-y-1.5">
                          {/* Perfect optimality message */}
                          {!prediction.predictions.lecturerOverload.isOverloaded &&
                           prediction.predictions.cohortFatigue.severity !== 'CRITICAL' &&
                           !prediction.predictions.capacityMismatch && (
                            <div className="p-1.5 bg-emerald-50 border border-emerald-150 text-emerald-800 rounded-md font-extrabold flex items-center gap-1.5">
                              <CheckCircle2 className="h-3 w-3.5 text-emerald-600 shrink-0" />
                              <span>🏆 PERFECT OPTIMALITY: No clashes, balanced educator load, and stable student Routine.</span>
                            </div>
                          )}

                          {/* Individual soft triggers */}
                          {prediction.predictions.lecturerOverload.isOverloaded && (
                            <div className="p-1.5 bg-red-50/50 border border-red-100 text-red-700 rounded-md leading-tight">
                              <b>⚠️ Lecturer workload Alert:</b> Selected timespan forces instructor past standard weekly budget limits (predicted: <b>{prediction.predictions.lecturerOverload.predictedHours} hrs</b>, target cap: 12 hrs).
                            </div>
                          )}

                          {prediction.predictions.cohortFatigue.severity === 'CRITICAL' && (
                            <div className="p-1.5 bg-amber-50/50 border border-amber-100 text-amber-700 rounded-md leading-tight">
                              <b>💥 Daily Fatigue warning:</b> Student Class Cohort Daily density will exceed 6 hours of lectures on {ttForm.day}. Low attention span predicted.
                            </div>
                          )}

                          {prediction.predictions.capacityMismatch && (
                            <div className="p-1.5 bg-rose-50/50 border border-rose-100 text-rose-700 rounded-md leading-tight">
                              <b>⚠️ Seating Cap shortfall:</b> Cohort contains <b>{prediction.predictions.capacityMismatch.cohortSize} students</b>, but the selected room has only <b>{prediction.predictions.capacityMismatch.roomSize} seats</b> (deficit of {prediction.predictions.capacityMismatch.deficit} chairs).
                            </div>
                          )}

                          {prediction.predictions.venueCongestion.likelihood > 50 && (
                            <div className="p-1.5 bg-indigo-50/50 border border-indigo-100 text-indigo-700 rounded-md leading-tight">
                              <b>📉 High venue congestion:</b> selected classroom is booked heavily across the week ({prediction.predictions.venueCongestion.slotsBooked} timeslots booked).
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              )}

              <button 
                type="submit" 
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer font-mono shadow-xs mt-2"
              >
                + Publish Lecture Slot
              </button>

              <div className="pt-2 border-t border-slate-200 mt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={fetchSlotSuggestions}
                  disabled={loadingSuggestions}
                  className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  {loadingSuggestions ? (
                    <div className="h-3 w-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5 text-indigo-600 animate-pulse" />
                  )}
                  🤖 Suggest Best Venue & Slot (Assisted)
                </button>
              </div>

              {/* Manual Suggestions Populated list */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="mt-3 bg-indigo-50/50 p-3 rounded-xl border border-indigo-200 space-y-2 leading-tight">
                  <div className="flex items-center justify-between border-b border-indigo-150 pb-1.5 mb-1.5">
                    <span className="text-[10px] text-indigo-900 font-extrabold flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-indigo-600 animate-pulse" /> Recommended Allocations
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowSuggestions(false)}
                      className="text-indigo-600 hover:text-indigo-805 font-bold text-[9px] cursor-pointer bg-transparent border-none outline-none"
                    >
                      Close
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                    {suggestions.map((sug, index) => (
                      <div key={index} className="p-2 bg-white border border-indigo-100 rounded-lg hover:border-indigo-350 transition-all flex items-center justify-between gap-2.5 text-[9px] text-slate-700">
                        <div className="min-w-0 flex-1">
                          <p className="font-extrabold text-slate-800">{sug.day} @ {sug.timeSlot}</p>
                          <p className="text-[8px] text-slate-500 font-bold">Room: {sug.venue} (Suitability Index: {sug.score}%)</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {sug.reasons.map((r: string, rIdx: number) => (
                              <span key={rIdx} className="text-[7px] bg-slate-50 border border-slate-100 text-slate-500 px-1 py-0.5 rounded leading-none">{r}</span>
                            ))}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => applySuggestion(sug)}
                          className="py-1 px-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-md cursor-pointer text-[9px] transition-all"
                        >
                          Select
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </form>
          )}

          {/* Calender timetable visualizer Right Column */}
          <div className="xl:col-span-2 space-y-4">
            <div className="flex items-center justify-between pl-1">
              <h4 className="text-[9px] text-slate-400 uppercase font-extrabold font-mono tracking-widest">
                {schedulingMode === 'auto' ? 'AI generated draft timetable timeline:' : 'Active schedule timeline:'}
              </h4>
              {schedulingMode === 'auto' && draftTimetables.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={clearDraft}
                    className="text-[8px] uppercase tracking-wider font-extrabold bg-slate-100 hover:bg-slate-205 py-1 px-2 border border-slate-250 text-slate-700 rounded-md cursor-pointer"
                  >
                    Clear Drafts
                  </button>
                  <button
                    onClick={approveDraft}
                    className="text-[8px] uppercase tracking-wider font-extrabold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 py-1 px-2 border border-emerald-200 rounded-md cursor-pointer flex items-center gap-1"
                  >
                    Publish Draft ({draftTimetables.length})
                  </button>
                </div>
              )}
            </div>
            
            {(schedulingMode === 'auto' ? draftTimetables : timetables).length === 0 ? (
              <p className="p-8 bg-slate-50 border border-slate-150 rounded-2xl text-center text-slate-400 font-mono text-[10px]">
                {schedulingMode === 'auto' 
                  ? 'No draft timetables active. Click "Generate Automated Timetable" to start.'
                  : 'No active classes scheduled in timetable database.'}
              </p>
            ) : (
              <div className="space-y-4 max-h-[440px] overflow-y-auto pr-1">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => {
                  const daySlots = (schedulingMode === 'auto' ? draftTimetables : timetables).filter(t => t.day === day);
                  if (daySlots.length === 0) return null;

                  return (
                    <div key={day} className="space-y-2">
                      <span className="text-[10px] font-black tracking-widest text-indigo-600 font-mono uppercase bg-indigo-50 px-2 py-0.5 rounded border border-indigo-150">
                        {day}
                      </span>

                      <div className="space-y-1.5">
                        {daySlots.map(slot => (
                          <div
                            key={slot.id}
                            className={`p-3 border rounded-xl hover:shadow-xs transition-all text-[11px] flex items-center justify-between ${
                              schedulingMode === 'auto' 
                                ? 'bg-amber-50/20 border-amber-300' 
                                : 'bg-white border-slate-150 rounded-xl hover:border-slate-350'
                            }`}
                          >
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className={`font-mono text-[9px] font-bold border px-1 py-0.2 rounded ${
                                  schedulingMode === 'auto' 
                                    ? 'bg-amber-100 border-amber-200 text-amber-800' 
                                    : 'bg-indigo-50 border-indigo-100 text-indigo-600'
                                }`}>
                                  {slot.unitCode || 'UNIT'}
                                </span>
                                <span className="text-[10px] font-bold text-slate-800">{slot.unitName}</span>
                                {schedulingMode === 'auto' && slot.suitabilityScore && (
                                  <span className="text-[7.5px] font-black text-amber-700 bg-amber-100/50 border border-amber-200 px-1 rounded">
                                    Optimized Suitability: {slot.suitabilityScore}%
                                  </span>
                                )}
                              </div>
                              
                              <p className="text-[9px] text-slate-500 font-medium mt-1">
                                Cohort: <strong className="text-slate-705 font-bold">{slot.classGroupName}</strong> • Prof: {slot.staffName || 'HOD'}
                              </p>
                              
                              <div className="flex gap-2.5 mt-1.5 pt-1.5 border-t border-slate-100/50 text-[8px] text-slate-400 font-mono uppercase">
                                <span className="flex items-center gap-0.5"><Clock className="h-2.5 w-2.5 text-indigo-500" /> {slot.timeSlot}</span>
                                <span className="flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5 text-emerald-500" /> {slot.venue}</span>
                              </div>
                            </div>

                            {schedulingMode !== 'auto' && (
                              <button 
                                onClick={() => handleDeleteTimetable(slot.id)}
                                className="p-1 px-1.5 text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-lg cursor-pointer shrink-0"
                                title="Cancel class"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>

      {showManageRooms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden text-slate-800 leading-tight">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 bg-slate-50 border-b border-slate-150">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-indigo-600 animate-pulse" />
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Manage Physical Campus Topology</h3>
                  <p className="text-[10px] text-slate-500">Configure buildings, learning theatre complexes, and classroom venues.</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowManageRooms(false);
                  setVenueError(null);
                  setVenueSuccess(null);
                }}
                className="p-1 hover:bg-slate-200 rounded-lg cursor-pointer text-slate-400 hover:text-slate-700 bg-transparent border-none outline-none"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Sub-tabs */}
            <div className="flex items-center border-b border-slate-155 bg-slate-50/50 px-4 text-xs font-black">
              <button
                onClick={() => {
                  setActiveVenueSubTab('rooms');
                  setVenueError(null);
                  setVenueSuccess(null);
                }}
                className={`py-2.5 px-4 border-b-2 transition-all cursor-pointer ${activeVenueSubTab === 'rooms' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
              >
                🏫 Rooms & Venues ({rooms.length})
              </button>
              <button
                onClick={() => {
                  setActiveVenueSubTab('buildings');
                  setVenueError(null);
                  setVenueSuccess(null);
                }}
                className={`py-2.5 px-4 border-b-2 transition-all cursor-pointer ${activeVenueSubTab === 'buildings' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
              >
                🏢 Academic Buildings ({buildings.length})
              </button>
            </div>

            {/* Errors/Success */}
            <div className="p-4 pb-0">
              {venueSuccess && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-250 text-emerald-850 rounded-xl text-[10.5px] font-bold leading-none">
                  ✅ {venueSuccess}
                </div>
              )}
              {venueError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-[10.5px] font-bold flex items-center gap-1.5 leading-snug">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 text-rose-650" />
                  <span>{venueError}</span>
                </div>
              )}
            </div>

            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[420px] overflow-y-auto">
              {/* LEFT Column - Create Form */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 shadow-xs h-fit text-[10px]">
                {activeVenueSubTab === 'rooms' ? (
                  <form onSubmit={handleCreateRoom} className="space-y-3">
                    <span className="font-extrabold text-slate-800 uppercase block tracking-wider text-[9px] border-b border-slate-200 pb-1">Register Classroom Room</span>
                    
                    <div>
                      <label className="text-[9px] text-slate-500 font-bold block mb-1">Parent Building</label>
                      {buildings.length === 0 ? (
                        <div className="p-2 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-[9px] font-medium font-sans">
                          ⚠️ No Buildings registered. Create a campus building first.
                        </div>
                      ) : (
                        <select
                          value={newRoomForm.buildingId}
                          onChange={(e) => setNewRoomForm({ ...newRoomForm, buildingId: e.target.value })}
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none font-bold"
                          required
                        >
                          <option value="">-- Choose Building --</option>
                          {buildings.map(b => (
                            <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                          ))}
                        </select>
                      )}
                    </div>

                    <div>
                      <label className="text-[9px] text-slate-500 font-bold block mb-1">Room Code / Number (e.g. CS-101)</label>
                      <input 
                        type="text"
                        value={newRoomForm.roomNumber}
                        onChange={(e) => setNewRoomForm({ ...newRoomForm, roomNumber: e.target.value })}
                        placeholder="CS-101"
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none font-bold placeholder-slate-400"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[9px] text-slate-500 font-bold block mb-1">Verbose Room Name (e.g. Software Lab A)</label>
                      <input 
                        type="text"
                        value={newRoomForm.name}
                        onChange={(e) => setNewRoomForm({ ...newRoomForm, name: e.target.value })}
                        placeholder="Software Engineering Lab A"
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none font-bold placeholder-slate-400"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] text-slate-500 font-bold block mb-1">Capacity (Seats count)</label>
                        <input 
                          type="number"
                          min="1"
                          value={newRoomForm.capacity}
                          onChange={(e) => setNewRoomForm({ ...newRoomForm, capacity: Number(e.target.value) || 40 })}
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none font-bold animate-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-[9px] text-slate-500 font-bold block mb-1">Room Category Type</label>
                        <select
                          value={newRoomForm.room_type}
                          onChange={(e) => setNewRoomForm({ ...newRoomForm, room_type: e.target.value })}
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none font-bold animate-none"
                          required
                        >
                          <option value="CLASSROOM">CLASSROOM</option>
                          <option value="LABORATORY">LABORATORY</option>
                          <option value="LECTURE_HALL">LECTURE_HALL</option>
                          <option value="OFFICE">OFFICE</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={creatingVenue || buildings.length === 0}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      {creatingVenue ? 'Saving...' : 'Add Classroom Room'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleCreateBuilding} className="space-y-3">
                    <span className="font-extrabold text-slate-800 uppercase block tracking-wider text-[9px] border-b border-slate-200 pb-1">Register Academic Building</span>

                    <div>
                      <label className="text-[9px] text-slate-500 font-bold block mb-1">Parent Campus</label>
                      {campuses.length === 0 ? (
                        <div className="p-2 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-[9px] font-medium font-sans">
                          ⚠️ No Campuses configured in the system.
                        </div>
                      ) : (
                        <select
                          value={newBldForm.campusId}
                          onChange={(e) => setNewBldForm({ ...newBldForm, campusId: e.target.value })}
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none font-bold"
                          required
                        >
                          <option value="">-- Choose Campus --</option>
                          {campuses.map(c => (
                            <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                          ))}
                        </select>
                      )}
                    </div>

                    <div>
                      <label className="text-[9px] text-slate-500 font-bold block mb-1">Building name (e.g. Science Complex)</label>
                      <input 
                        type="text"
                        value={newBldForm.name}
                        onChange={(e) => setNewBldForm({ ...newBldForm, name: e.target.value })}
                        placeholder="Science complex"
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none font-bold placeholder-slate-400"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] text-slate-500 font-bold block mb-1">Code letters (e.g. SCI)</label>
                        <input 
                          type="text"
                          value={newBldForm.code}
                          onChange={(e) => setNewBldForm({ ...newBldForm, code: e.target.value.toUpperCase() })}
                          placeholder="SCI"
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none font-bold placeholder-slate-400"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-[9px] text-slate-500 font-bold block mb-1">Floors count</label>
                        <input 
                          type="number"
                          min="1"
                          value={newBldForm.floorsCount}
                          onChange={(e) => setNewBldForm({ ...newBldForm, floorsCount: Number(e.target.value) || 1 })}
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none font-bold"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[9px] text-slate-500 font-bold block mb-1">Brief Description</label>
                      <textarea
                        value={newBldForm.description}
                        onChange={(e) => setNewBldForm({ ...newBldForm, description: e.target.value })}
                        placeholder="Registrar departments, chemical libraries..."
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none font-bold placeholder-slate-400 h-14 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={creatingVenue || campuses.length === 0}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      {creatingVenue ? 'Constructing...' : 'Add Academic Complex'}
                    </button>
                  </form>
                )}
              </div>

              {/* RIGHT Column - Current List */}
              <div className="space-y-2 text-[10px] h-fit">
                <span className="font-extrabold text-slate-500 uppercase block tracking-wider text-[9px] border-b border-slate-200 pb-1">Current Topology Registry</span>
                
                <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1">
                  {activeVenueSubTab === 'rooms' ? (
                    rooms.length === 0 ? (
                      <p className="text-slate-400 font-medium italic p-4 text-center">No classroom venues found. Create one to use in schedule planners.</p>
                    ) : (
                      rooms.map(rm => {
                        const parentBld = buildings.find(b => b.id === rm.buildingId);
                        return (
                          <div key={rm.id} className="p-2 border border-slate-200 rounded-xl bg-white flex items-center justify-between gap-1.5 hover:border-slate-350 transition-all">
                            <div className="min-w-0 flex-1">
                              <p className="text-slate-800 font-black text-[11px] leading-tight flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-indigo-500" />
                                {rm.roomNumber}
                              </p>
                              <p className="text-[9px] text-slate-500 font-semibold">{rm.name}</p>
                              <div className="flex gap-1.5 mt-1">
                                <span className="px-1 py-0.5 bg-slate-100 border border-slate-200 text-slate-500 rounded text-[7.5px] font-mono leading-none">{rm.room_type || 'CLASSROOM'}</span>
                                <span className="px-1 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 font-black rounded text-[7.5px] leading-none font-sans">Cap: {rm.capacity || 40} seats</span>
                                {parentBld && <span className="px-1 py-0.5 bg-slate-50 border border-slate-200 text-slate-500 rounded text-[7.5px] leading-none font-bold shrink-0 truncate max-w-[100px]">Complex: {parentBld.name}</span>}
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteRoom(rm.id)}
                              className="p-1 px-1.5 text-rose-500 hover:bg-rose-50 border border-slate-150 rounded-lg cursor-pointer bg-white"
                              title="Delete classroom"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        );
                      })
                    )
                  ) : (
                    buildings.length === 0 ? (
                      <p className="text-slate-400 font-medium italic p-4 text-center">No complexes found. Add an academic building first.</p>
                    ) : (
                      buildings.map(b => {
                        const childRoomsCount = rooms.filter(r => r.buildingId === b.id).length;
                        return (
                          <div key={b.id} className="p-2 border border-slate-200 rounded-xl bg-white flex items-center justify-between gap-1.5 hover:border-slate-350 transition-all">
                            <div className="min-w-0 flex-1">
                              <p className="text-slate-800 font-black text-[11px] leading-tight flex items-center gap-1">
                                <Building2 className="h-3 w-3 text-indigo-500" />
                                {b.name} ({b.code})
                              </p>
                              <p className="text-[8.5px] text-slate-550 italic leading-none truncate max-w-[200px]">{b.description || 'No description'}</p>
                              <div className="flex gap-1.5 mt-1 text-[7.5px] font-bold">
                                <span className="px-1 py-0.5 bg-slate-100 border border-slate-200 text-slate-500 rounded leading-none">{b.floorsCount} Storey</span>
                                <span className="px-1 py-0.5 bg-indigo-50 border border-indigo-150 text-indigo-700 rounded leading-none">{childRoomsCount} active rooms inside</span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteBuilding(b.id)}
                              className="p-1 px-1.5 text-rose-500 hover:bg-rose-50 border border-slate-150 rounded-lg cursor-pointer bg-white"
                              title="Delete building"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        );
                      })
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-150 flex justify-end gap-1.5">
              <button
                onClick={() => {
                  setShowManageRooms(false);
                  setVenueError(null);
                  setVenueSuccess(null);
                }}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 hover:text-slate-900 text-[10px] font-extrabold rounded-lg transition-all cursor-pointer border border-slate-300"
              >
                Close Panel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
