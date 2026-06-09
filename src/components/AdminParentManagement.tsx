import React, { useState, useEffect } from 'react';
import { Search, Edit, UserCheck, UserX, Key, Users, Check, X, ShieldAlert, BadgeInfo } from 'lucide-react';

interface ParentUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  username: string;
  nationalId?: string;
  disabled: boolean;
  linkedStudents: Array<{ id: string; name: string; regNumber: string }>;
}

interface AdminParentManagementProps {
  token: string;
  appendLog?: (msg: string) => void;
}

export default function AdminParentManagement({ token, appendLog }: AdminParentManagementProps) {
  const [parents, setParents] = useState<ParentUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Edit Modal State
  const [editingParent, setEditingParent] = useState<ParentUser | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    nationalId: '',
    disabled: false
  });

  // Password Reset Modal State
  const [resettingParent, setResettingParent] = useState<ParentUser | null>(null);
  const [customPassword, setCustomPassword] = useState('');

  const fetchParents = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/admin/parents', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        throw new Error('Failed to retrieve parent records.');
      }
      const data = await res.json();
      setParents(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred fetching parent profiles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParents();
  }, [token]);

  const handleOpenEdit = (parent: ParentUser) => {
    setEditingParent(parent);
    setEditForm({
      name: parent.name,
      email: parent.email,
      phone: parent.phone,
      nationalId: parent.nationalId || '',
      disabled: parent.disabled
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingParent) return;
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/admin/parents/${editingParent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'Failed to update parent details.');
      }

      setSuccess(`Parent account for "${editForm.name}" updated successfully.`);
      if (appendLog) appendLog(`[ADMIN] Profile for guardian ${editForm.name} updated.`);
      setEditingParent(null);
      fetchParents();
    } catch (err: any) {
      setError(err.message || 'Error saving changes.');
    }
  };

  const handleToggleStatus = async (parent: ParentUser) => {
    setError(null);
    setSuccess(null);
    const newDisabled = !parent.disabled;

    try {
      const res = await fetch(`/api/admin/parents/${parent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ disabled: newDisabled })
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'Failed to toggle status.');
      }

      const statusStr = newDisabled ? 'deactivated' : 'activated';
      setSuccess(`Parent workspace account successfully ${statusStr}.`);
      if (appendLog) appendLog(`[ADMIN] Parent user ${parent.name} was ${statusStr}.`);
      fetchParents();
    } catch (err: any) {
      setError(err.message || 'Error changing status.');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resettingParent) return;
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/admin/parents/${resettingParent.id}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newPassword: customPassword })
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'Failed to reset password.');
      }

      setSuccess(`Password for ${resettingParent.name} has been reset to: ${resData.password}`);
      if (appendLog) appendLog(`[ADMIN] Reset custom password for parent ${resettingParent.name}`);
      setResettingParent(null);
      setCustomPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to apply login credential modifications.');
    }
  };

  const filteredParents = parents.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.phone.includes(searchQuery) ||
    p.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search Header Banner */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900 font-mono uppercase tracking-wider flex items-center gap-2">
            <Users className="h-4.5 w-4.5 text-rose-500" />
            Parent Portal Accounts Directory
          </h2>
          <p className="text-xs text-slate-500 mt-1">Audit, activate, reset login parameters, or manage linked students profiles.</p>
        </div>
        <div className="relative w-full md:max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search parents by name, email, or telephone..."
            className="block w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-150 text-rose-700 text-xs rounded-xl font-medium flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-150 text-emerald-700 text-xs rounded-xl font-semibold">
          {success}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-rose-500 border-t-transparent rounded-full" />
        </div>
      ) : filteredParents.length === 0 ? (
        <div className="p-12 text-center text-slate-400 text-xs bg-white rounded-xl border border-slate-200 shadow-sm italic font-medium">
          No parent accounts discovered matching standard query filters.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 font-mono uppercase text-[9px] tracking-wider">
                <tr>
                  <th className="px-6 py-4">Parent / Guardian Information</th>
                  <th className="px-6 py-4">Credential Details</th>
                  <th className="px-6 py-4">Linked Student Dependents</th>
                  <th className="px-6 py-4">Security Status</th>
                  <th className="px-6 py-4 text-right">Administrative Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredParents.map((parent) => (
                  <tr key={parent.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 text-sm">{parent.name}</div>
                      {parent.nationalId && (
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">ID: {parent.nationalId}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-400 font-mono font-bold uppercase min-w-[50px]">Username:</span>
                        <span className="font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">{parent.username}</span>
                      </div>
                      {parent.email && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-400 font-mono font-bold uppercase min-w-[50px]">Email:</span>
                          <span className="text-slate-600 font-mono text-[10px] truncate max-w-[150px]">{parent.email}</span>
                        </div>
                      )}
                      {parent.phone && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-400 font-mono font-bold uppercase min-w-[50px]">Phone:</span>
                          <span className="text-slate-600 font-mono text-[10px]">{parent.phone}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {parent.linkedStudents.length === 0 ? (
                        <span className="text-slate-400 italic text-[10px]">No wards linked</span>
                      ) : (
                        <div className="space-y-1.5 max-w-[200px]">
                          {parent.linkedStudents.map((st) => (
                            <div key={st.id} className="text-[10px] bg-indigo-50 text-indigo-805 px-2 py-0.5 rounded border border-indigo-100 font-medium">
                              <span className="font-bold block text-slate-800">{st.name}</span>
                              <span className="text-[8.5px] text-indigo-600 font-mono">{st.regNumber}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {parent.disabled ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 border border-rose-100 text-rose-700 uppercase tracking-wider">
                          Deactivated
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 border border-emerald-100 text-emerald-700 uppercase tracking-wider animate-pulse">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(parent)}
                          className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-indigo-600 border border-slate-200 hover:border-indigo-150 transition-all rounded-lg cursor-pointer flex items-center gap-1"
                          title="Edit Profile"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setResettingParent(parent)}
                          className="p-1.5 hover:bg-amber-50 text-amber-600 hover:text-amber-800 border border-slate-200 hover:border-amber-100 transition-all rounded-lg cursor-pointer flex items-center gap-1"
                          title="Reset Password"
                        >
                          <Key className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(parent)}
                          className={`p-1.5 border transition-all rounded-lg cursor-pointer ${
                            parent.disabled 
                              ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-100' 
                              : 'bg-rose-50 text-rose-600 hover:bg-rose-100 border-rose-100'
                          }`}
                          title={parent.disabled ? 'Activate Account' : 'Deactivate Account'}
                        >
                          {parent.disabled ? <UserCheck className="h-3.5 w-3.5" /> : <UserX className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Parent Modal overlay */}
      {editingParent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-150 max-w-sm w-full overflow-hidden">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase tracking-wider font-mono">Modify Guardian Information</h3>
              <button onClick={() => setEditingParent(null)} className="text-slate-400 hover:text-white cursor-pointer transition">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-mono">Full Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-indigo-500 transition"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-mono">Email Address</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-indigo-500 transition"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-mono">Phone Number</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-indigo-500 transition"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-mono">National ID Number</label>
                <input
                  type="text"
                  value={editForm.nationalId}
                  onChange={(e) => setEditForm({ ...editForm, nationalId: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-indigo-500 transition"
                />
              </div>
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingParent(null)}
                  className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition uppercase font-sans cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition uppercase font-sans cursor-pointer shadow-sm"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Modal overlay */}
      {resettingParent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-150 max-w-sm w-full overflow-hidden">
            <div className="bg-amber-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="h-4.5 w-4.5" />
                <h3 className="font-bold text-xs uppercase tracking-wider font-mono">Reset Login Password</h3>
              </div>
              <button onClick={() => setResettingParent(null)} className="text-amber-200 hover:text-white cursor-pointer transition">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
            <form onSubmit={handleResetPassword} className="p-5 space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-150 rounded-xl space-y-1">
                <div className="text-[10.5px] font-bold text-amber-800 font-sans flex items-center gap-1.5">
                  <BadgeInfo className="h-3.5 w-3.5" /> Password Standard Note
                </div>
                <p className="text-[9.5px] text-amber-700 leading-relaxed font-sans">
                  Leave the field below blank to reset this parent user's portal access password to their registered telephone number. Otherwise, provide a custom key string.
                </p>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-mono">Specify Custom Password</label>
                <input
                  type="text"
                  placeholder="Leave empty for default phone reset"
                  value={customPassword}
                  onChange={(e) => setCustomPassword(e.target.value)}
                  className="w-full text-xs font-mono p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-indigo-500 transition"
                />
              </div>
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setResettingParent(null)}
                  className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition uppercase font-sans cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition uppercase font-sans cursor-pointer shadow-sm"
                >
                  Reset Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
