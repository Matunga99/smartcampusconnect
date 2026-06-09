import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Users, BookOpen, User, GraduationCap, Shield, HelpCircle, 
  MessageSquare, Layers, Sparkles, Network, Search, Mail
} from 'lucide-react';

interface NetworkGraphProps {
  user: {
    id: string;
    name: string;
    role: string;
    email: string;
  };
  onStartChat: (targetUserId: string) => void;
}

export default function NetworkGraph({ user, onStartChat }: NetworkGraphProps) {
  const [graphData, setGraphData] = useState<{
    lecturers: any[];
    classmates: any[];
    parents: any[];
    admins: any[];
    cohorts: any[];
    units: any[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<'all' | 'lecturers' | 'classmates' | 'parents' | 'admins' | 'academic'>('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedNode, setSelectedNode] = useState<any | null>(null);

  const token = localStorage.getItem('scc_token') || localStorage.getItem('token');

  useEffect(() => {
    fetchGraph();
  }, []);

  const fetchGraph = async () => {
    setLoading(true);
    try {
      const resp = await fetch('/api/communications/contact-graph', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resp.ok) {
        const data = await resp.json();
        setGraphData(data);
        // Default select 'You' as initial node
        setSelectedNode({
          id: user.id,
          name: user.name,
          role: user.role,
          email: user.email,
          isSelf: true,
          label: 'Local Account Node'
        });
      }
    } catch (e) {
      console.error("Failed to load relationship graph:", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-3 p-12">
        <Network className="h-10 w-10 text-indigo-500 animate-spin" />
        <span className="text-[11px] font-black tracking-wider uppercase text-indigo-600">Resolving multi-tenant relationship graph...</span>
      </div>
    );
  }

  // Flattened contacts for list search
  const lecturers = graphData?.lecturers || [];
  const classmates = graphData?.classmates || [];
  const parents = graphData?.parents || [];
  const admins = graphData?.admins || [];
  const cohorts = graphData?.cohorts || [];
  const units = graphData?.units || [];

  const allPeople = [
    ...lecturers.map(l => ({ ...l, category: 'lecturers', icon: GraduationCap, color: 'emerald' })),
    ...classmates.map(c => ({ ...c, category: 'classmates', icon: User, color: 'indigo' })),
    ...parents.map(p => ({ ...p, category: 'parents', icon: Users, color: 'teal' })),
    ...admins.map(a => ({ ...a, category: 'admins', icon: Shield, color: 'amber' }))
  ];

  const filteredPeople = allPeople.filter(p => {
    const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchFilter.toLowerCase()) || 
                          p.email.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-50">
      
      {/* LEFT PANE: Visual Network Orbit Diagram */}
      <div className="flex-1 flex flex-col p-4 border-r border-slate-250 bg-white relative overflow-hidden select-none min-h-[300px]">
        <div className="flex items-center justify-between mb-4 z-10">
          <div>
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Network className="h-4 w-4 text-indigo-600" />
              <span>Institutional Graph Platform</span>
            </h3>
            <p className="text-[9px] text-slate-400">Interactive live rendering of active academic directory edges</p>
          </div>
          <button 
            onClick={fetchGraph}
            className="px-2.5 py-1 text-[9px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-150 rounded hover:bg-indigo-100 transition"
          >
            Refresh Nodes
          </button>
        </div>

        {/* Orbit Diagram Canvas Rendering area */}
        <div className="flex-1 relative flex items-center justify-center">
          
          {/* Connecting Edge lines layer */}
          <div className="absolute inset-0 flex items-center justify-center opacity-40">
            <div className="w-[180px] h-[180px] rounded-full border border-dashed border-indigo-200 animate-spin-slow absolute" />
            <div className="w-[280px] h-[280px] rounded-full border border-dashed border-emerald-100 animate-spin-reverse absolute" />
          </div>

          {/* Central Root Node ("You") */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            onClick={() => setSelectedNode({
              id: user.id,
              name: user.name,
              role: user.role,
              email: user.email,
              isSelf: true,
              label: 'Host Account Central'
            })}
            className="absolute z-20 cursor-pointer text-center"
          >
            <div className="h-14 w-14 rounded-full bg-indigo-600 border-4 border-indigo-100 flex items-center justify-center text-white ring-8 ring-indigo-50 shadow-md">
              <Network className="h-6 w-6" />
            </div>
            <span className="block mt-2.5 font-black text-[10px] text-slate-800 tracking-tight">{user.name}</span>
            <span className="px-1.5 py-0.2 bg-indigo-100 text-indigo-800 font-bold uppercase rounded-full text-[7px] tracking-widest">{user.role}</span>
          </motion.div>

          {/* Orbiting Children Categories */}
          {[
            { angle: 0, label: 'Lecturers', count: lecturers.length, color: 'bg-emerald-500 ring-emerald-100 border-emerald-300', icon: GraduationCap, type: 'lecturers' },
            { angle: 72, label: 'Classmates', count: classmates.length, color: 'bg-indigo-500 ring-indigo-100 border-indigo-300', icon: User, type: 'classmates' },
            { angle: 144, label: 'Admins', count: admins.length, color: 'bg-amber-500 ring-amber-100 border-amber-300', icon: Shield, type: 'admins' },
            { angle: 216, label: 'Academic Cohorts', count: cohorts.length, color: 'bg-rose-500 ring-rose-100 border-rose-300', icon: Layers, type: 'cohorts' },
            { angle: 288, label: 'Course Units', count: units.length, color: 'bg-teal-500 ring-teal-100 border-teal-300', icon: BookOpen, type: 'units' }
          ].map((orb, index) => {
            const rad = (orb.angle * Math.PI) / 180;
            const radius = 105; // Distance from center
            const x = Math.cos(rad) * radius;
            const y = Math.sin(rad) * radius;

            return (
              <motion.div
                key={index}
                style={{ x, y }}
                whileHover={{ scale: 1.1 }}
                onClick={() => {
                  setActiveCategory(orb.type as any);
                  setSelectedNode({
                    name: orb.label,
                    count: orb.count,
                    type: orb.type,
                    isCategory: true
                  });
                }}
                className={`absolute h-9 w-9 rounded-full ${orb.color} ring-4 border flex flex-col items-center justify-center text-white cursor-pointer shadow-xs z-10`}
              >
                <orb.icon className="h-4.5 w-4.5" />
                <span className="absolute -bottom-5 text-[8px] font-black text-slate-500 uppercase tracking-tight whitespace-nowrap">
                  {orb.label} ({orb.count})
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Selected Hub Card Detail */}
        {selectedNode && (
          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 mt-4 flex items-center justify-between shadow-2xs z-10">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                {selectedNode.isCategory ? <Layers className="h-4 w-4" /> : <User className="h-4 w-4" />}
              </div>
              <div className="min-w-0">
                <span className="block font-black text-slate-800 text-[11px] truncate">{selectedNode.name}</span>
                <span className="text-[9px] text-slate-400 block truncate">
                  {selectedNode.isCategory 
                    ? `Group node with ${selectedNode.count} direct active associations` 
                    : selectedNode.email || 'System identity profile node'}
                </span>
              </div>
            </div>

            {!selectedNode.isSelf && !selectedNode.isCategory && (
              <button 
                onClick={() => onStartChat(selectedNode.id)}
                className="px-3 py-1.5 bg-indigo-600 text-white rounded font-bold text-[9px] hover:bg-indigo-700 transition flex items-center gap-1 cursor-pointer"
              >
                <MessageSquare className="h-3 w-3" />
                <span>Message Node</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* RIGHT PANE: Clean Interactive Search / Directory List */}
      <div className="w-full md:w-80 flex flex-col overflow-hidden bg-slate-50">
        
        {/* Category Selector Tabs */}
        <div className="grid grid-cols-3 gap-0.5 bg-slate-200 p-0.5 shrink-0 select-none text-[8px] font-black uppercase tracking-wider text-slate-600">
          {[
            { id: 'all', label: 'All Contacts' },
            { id: 'lecturers', label: 'Lecturers' },
            { id: 'classmates', label: 'Peers' },
            { id: 'parents', label: 'Parents' },
            { id: 'admins', label: 'Admins' },
            { id: 'academic', label: 'Academic' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'academic') {
                  setActiveCategory('all');
                  setSelectedNode({
                    name: 'Academic Units and Cohorts',
                    isCategory: true,
                    count: cohorts.length + units.length
                  });
                } else {
                  setActiveCategory(tab.id as any);
                }
              }}
              className={`p-1.5 text-center transition-all cursor-pointer ${
                (tab.id === 'academic' && (selectedNode?.type === 'cohorts' || selectedNode?.type === 'units')) ||
                activeCategory === tab.id
                  ? 'bg-white text-indigo-600 font-bold'
                  : 'hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Directory Search box */}
        <div className="p-3 bg-white border-b border-slate-200 shrink-0">
          <div className="relative">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Filter identity ledger..." 
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-250 rounded-lg pl-8 p-1.5 text-[10px]"
            />
          </div>
        </div>

        {/* Dynamic Directory Scroll area */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {activeCategory === 'all' && (
            <>
              {/* Cohort list */}
              {cohorts.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest pl-1 block mb-0.5">My Registered Cohorts</span>
                  {cohorts.map(c => (
                    <div key={c.id} className="p-2 bg-white rounded-lg border border-slate-200/60 flex items-center gap-2 text-[10px]">
                      <div className="p-1.5 bg-rose-50 text-rose-600 rounded">
                        <Layers className="h-3 w-3" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-extrabold text-slate-800 block truncate">{c.name}</span>
                        <span className="text-[8px] text-slate-400 block font-mono">ID: {c.id}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Units list */}
              {units.length > 0 && (
                <div className="space-y-1 pt-2">
                  <span className="text-[8px] font-black text-teal-500 uppercase tracking-widest pl-1 block mb-0.5">My Registered Course Units</span>
                  {units.map(u => (
                    <div key={u.id} className="p-2 bg-white rounded-lg border border-slate-200/60 flex items-center gap-2 text-[10px]">
                      <div className="p-1.5 bg-teal-50 text-teal-600 rounded">
                        <BookOpen className="h-3 w-3" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-extrabold text-slate-800 block truncate">{u.name}</span>
                        <span className="text-[8px] text-slate-400 block font-mono">Code: {u.code}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Render filtered list of people */}
          {filteredPeople.length === 0 ? (
            <div className="p-6 text-center text-slate-400 italic text-[10px]">
              No network nodes found matching constraints.
            </div>
          ) : (
            filteredPeople.map(person => {
              const Icon = person.icon;
              return (
                <button
                  key={person.id}
                  onClick={() => setSelectedNode(person)}
                  className="w-full text-left p-2.5 bg-white hover:bg-indigo-50/40 border border-slate-200/70 hover:border-indigo-150 rounded-lg flex items-center justify-between transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`p-1.5 bg-${person.color}-50 text-${person.color}-600 rounded`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-black text-slate-800 block truncate text-[10px] group-hover:text-indigo-600">{person.name}</span>
                      <span className="text-[8px] text-slate-400 block truncate flex items-center gap-1.5">
                        <Mail className="h-2.5 w-2.5" />
                        <span>{person.email}</span>
                      </span>
                    </div>
                  </div>
                  <span className={`px-1 rounded font-bold uppercase text-[7px] shrink-0 border bg-${person.color}-50 text-${person.color}-700 border-${person.color}-200`}>
                    {person.role}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
