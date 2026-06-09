import React, { useState, useEffect, useRef } from 'react';
import { 
  User, Mail, Phone, Calendar, MapPin, AlignLeft, 
  Upload, CheckCircle, AlertTriangle, RefreshCw, LogIn,
  Camera, ShieldAlert, Heart
} from 'lucide-react';

interface ProfilePageProps {
  token: string;
  user: any; // Fallback or current user
  onLogout?: () => void;
  appendLog?: (msg: string) => void;
}

export default function ProfilePage({ token, user: initialUser, onLogout, appendLog }: ProfilePageProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>({
    id: '',
    name: '',
    email: '',
    role: '',
    schoolId: '',
    profile: {
      avatarUrl: '',
      coverUrl: '',
      bio: '',
      phone: '',
      dob: '',
      gender: '',
      address: ''
    }
  });

  const [formFields, setFormFields] = useState({
    email: '',
    phone: '',
    bio: '',
    dob: '',
    gender: '',
    address: ''
  });

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch Consolidated Profile on mount
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/profile/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setFormFields({
          email: data.email || '',
          phone: data.profile?.phone || '',
          bio: data.profile?.bio || '',
          dob: data.profile?.dob || '',
          gender: data.profile?.gender || '',
          address: data.profile?.address || ''
        });
        if (appendLog) appendLog(`[DEBUG] Loaded integrated profile for user "${data.email}"`);
      } else {
        const errorData = await res.json();
        setMessage({ type: 'error', text: errorData.error || 'Failed to fetch profile' });
      }
    } catch (e) {
      console.error(e);
      setMessage({ type: 'error', text: 'Network error fetching unified profile' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [token]);

  // Handle Input Changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormFields(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Convert and Upload base64 Avatar Image
  const handleAvatarFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select or drop a valid image file.' });
      return;
    }
    
    // Check file size (limit to ~4MB to stay within safe network and string sizes)
    if (file.size > 4 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image file must be under 4MB.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      if (!base64) return;

      setSaving(true);
      try {
        const res = await fetch('/api/profile/avatar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ avatar: base64 })
        });

        if (res.ok) {
          const data = await res.json();
          // Update local profile state
          setProfile(prev => ({
            ...prev,
            profile: {
              ...(prev.profile || {}),
              avatarUrl: base64
            }
          }));
          setMessage({ type: 'success', text: 'Profile picture updated successfully!' });
          if (appendLog) appendLog(`[DEBUG] Profile picture successfully updated to new base64 representation.`);
        } else {
          const err = await res.json();
          setMessage({ type: 'error', text: err.error || 'Failed to update profile picture' });
        }
      } catch (err) {
        setMessage({ type: 'error', text: 'Error uploading profile avatar.' });
      } finally {
        setSaving(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Drag and Drop files handling
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleAvatarFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleAvatarFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Submit profile alterations
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSaving(true);

    // E.164 & Kenya Phone Format validations
    const cleanPhone = formFields.phone.trim().replace(/\s+/g, '');
    const isKenyaFormat = /^(?:\+254[17]\d{8}|0[17]\d{8})$/.test(cleanPhone);
    const isGeneralE164 = /^\+[1-9]\d{1,14}$/.test(cleanPhone);

    if (formFields.phone && !isKenyaFormat && !isGeneralE164) {
      setMessage({ 
        type: 'error', 
        text: 'Phone number format invalid! Must be +2547XXXXXXXX, 07XXXXXXXX, or E.164 (+CountryCode...)' 
      });
      setSaving(false);
      return;
    }

    if (!formFields.email.includes('@')) {
      setMessage({ type: 'error', text: 'Email must contain a valid "@" character.' });
      setSaving(false);
      return;
    }

    try {
      const res = await fetch('/api/profile/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: formFields.email,
          profile: {
            phone: formFields.phone,
            bio: formFields.bio,
            dob: formFields.dob,
            gender: formFields.gender,
            address: formFields.address
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        setProfile(data.user);
        setMessage({ type: 'success', text: 'Unified profile updated successfully!' });
        if (appendLog) appendLog(`[DEBUG] Profile saved. Email and profile fields successfully consolidated.`);
      } else {
        const errorData = await res.json();
        setMessage({ type: 'error', text: errorData.error || 'Failed to update profile' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error updating your profile.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-2xl border border-slate-100">
        <RefreshCw className="h-8 w-8 text-indigo-600 animate-spin mb-3" />
        <p className="text-slate-500 text-sm font-medium">Resolving Consolidated Identity Data Engine...</p>
      </div>
    );
  }

  // Generate Initials
  const nameInitials = profile.name
    ? profile.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* Header Profile Title banner */}
      <div className="bg-gradient-to-r from-indigo-800 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden mb-8">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full translate-x-12 -translate-y-12"></div>
        <div className="absolute left-1/3 bottom-0 w-48 h-48 bg-indigo-500/10 rounded-full translate-y-12"></div>
        
        <div className="relative flex flex-col md:flex-row items-center gap-6">
          {/* Main Drag & Drop / Click Avatar Image Container */}
          <div 
            className={`group relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-indigo-950 overflow-hidden bg-slate-900 flex items-center justify-center cursor-pointer transition-all duration-350 shadow-lg shrink-0 ${dragActive ? 'scale-105 border-emerald-400 rotate-1' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={onButtonClick}
            title="Drag & Drop or click to upload new profile avatar picture"
          >
            {profile.profile?.avatarUrl ? (
              <img 
                src={profile.profile.avatarUrl} 
                alt={profile.name} 
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="text-white text-3xl font-bold tracking-tight font-sans">
                {nameInitials}
              </div>
            )}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white text-[10px] font-medium font-sans p-1 text-center">
              <Camera className="w-4 h-4 mb-1" />
              <span>DRAG IMAGE HERE OR CLICK</span>
            </div>
          </div>

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileInput} 
            className="hidden" 
            accept="image/*" 
          />

          <div className="text-center md:text-left flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center md:justify-start">
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">{profile.name}</h1>
              <span className="self-center bg-indigo-550/50 backdrop-blur-md px-3 py-0.5 rounded-full text-xs font-mono uppercase bg-black/35 border border-white/10 tracking-widest leading-none">
                {profile.role}
              </span>
            </div>
            
            <p className="text-indigo-200 text-sm mt-1 mb-3 bg-indigo-900/40 inline-flex items-center px-3 py-1 rounded-lg gap-2 text-xs border border-indigo-500/10">
              <span className="font-mono">{profile.email}</span>
            </p>

            {profile.profile?.bio ? (
              <p className="text-indigo-100 text-sm italic max-w-xl line-clamp-2">
                "{profile.profile.bio}"
              </p>
            ) : (
              <p className="text-indigo-300/80 text-sm italic">
                No bio description added yet. Express yourself in your biography section.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Profile messages state notifications */}
      {message && (
        <div className={`p-4 mb-6 rounded-2xl flex items-start gap-3 border ${
          message.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-100' 
            : 'bg-rose-50 text-rose-800 border-rose-100'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      {/* Main Forms Cards */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-semibold text-slate-800 tracking-tight flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-600 animate-pulse" />
              <span>Consolidated Identity & Bio Fields</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Securely synchronized across legacy multi-tenant modules. Only profile elements are mutable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* NAME FIELD — READONLY */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                Full Legal Name
              </label>
              <div className="flex rounded-xl bg-slate-50 border border-slate-150 px-3/5 py-2.5 text-sm text-slate-650 items-center justify-between pointer-events-none mb-1 shadow-inner">
                <span className="font-semibold text-slate-700">{profile.name}</span>
                <span className="text-[10px] bg-slate-200/60 font-mono text-slate-500 px-2 py-0.5 rounded uppercase font-bold tracking-wider mb-0.5">READONLY</span>
              </div>
              <p className="text-[10px] text-slate-400 font-sans pl-1">
                Name adjustments must be routed through the Registrar's or HR Office.
              </p>
            </div>

            {/* EMAIL FIELD — READONLY/OPTIONAL EDIT */}
            <div>
              <label htmlFor="p_email" className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                Primary Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  id="p_email"
                  type="email"
                  name="email"
                  value={formFields.email}
                  onChange={handleInputChange}
                  required
                  placeholder="name@nairobi.edu"
                  className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors shadow-sm text-slate-800"
                />
              </div>
              <p className="text-[10px] text-slate-400 font-sans pl-1 mt-1">
                Used for platform login and official notification streams.
              </p>
            </div>

            {/* PHONE FIELD — CANYON PHONE NUMBER FORMATS */}
            <div>
              <label htmlFor="p_phone" className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                Mobile Number (Consolidated)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <Phone className="h-4 w-4" />
                </span>
                <input
                  id="p_phone"
                  type="text"
                  name="phone"
                  value={formFields.phone}
                  onChange={handleInputChange}
                  placeholder="+2547XXXXXXXX or 07XXXXXXXX"
                  className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors shadow-sm text-slate-800"
                />
              </div>
              <p className="text-[10px] text-slate-400 font-sans pl-1 mt-1">
                Must match Kenyan formats (e.g. +254712345678 or 0712345678) or international E.164 syntax.
              </p>
            </div>

            {/* GENDER CONFIGS */}
            <div>
              <label htmlFor="p_gender" className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                Biological Gender
              </label>
              <select
                id="p_gender"
                name="gender"
                value={formFields.gender}
                onChange={handleInputChange}
                className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors shadow-sm text-slate-800"
              >
                <option value="">Unspecified</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* DATE OF BIRTH */}
            <div>
              <label htmlFor="p_dob" className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                Date of Birth
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <Calendar className="h-4 w-4" />
                </span>
                <input
                  id="p_dob"
                  type="date"
                  name="dob"
                  value={formFields.dob}
                  onChange={handleInputChange}
                  className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors shadow-sm text-slate-800"
                />
              </div>
            </div>

            {/* RESIDENTIAL LOCATION ADDRESS */}
            <div>
              <label htmlFor="p_address" className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                Current Residential Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <MapPin className="h-4 w-4" />
                </span>
                <input
                  id="p_address"
                  type="text"
                  name="address"
                  value={formFields.address}
                  onChange={handleInputChange}
                  placeholder="Kenyatta Ave, Nairobi, Kenya"
                  className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors shadow-sm text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* BIO SECTION */}
          <div>
            <label htmlFor="p_bio" className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
              Brief Biography & Research Interest
            </label>
            <div className="relative">
              <span className="absolute top-3 left-3.5 pointer-events-none text-slate-400">
                <AlignLeft className="h-4 w-4" />
              </span>
              <textarea
                id="p_bio"
                name="bio"
                rows={4}
                value={formFields.bio}
                onChange={handleInputChange}
                placeholder="Share professional summaries, academic projects, or research focus..."
                className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors shadow-sm text-slate-800"
              />
            </div>
            <p className="text-[10px] text-slate-400 font-sans pl-1 mt-1">
              Supports plain text. Appears on your profiles, department pages, and libraries.
            </p>
          </div>

          {/* SAVE BUTTONS FOOTER */}
          <div className="flex items-center justify-end border-t border-slate-100 pt-5 gap-3">
            <button
              type="button"
              onClick={fetchProfile}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all duration-150 disabled:opacity-50"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-indigo-600 text-white font-medium text-sm rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-500/10 transition-all duration-150 flex items-center gap-2 disabled:bg-indigo-400"
              id="save_profile_button"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Save Account Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-100/60 flex items-start gap-4">
        <div className="bg-indigo-50 p-2 text-indigo-700 rounded-xl shrink-0">
          <Heart className="w-4 h-4" />
        </div>
        <div className="max-w-xl font-sans text-xs text-slate-500 leading-relaxed">
          <strong>Identity Graph Security Compliance</strong>. This profile screen utilizes read-time state synchronization, linking legacy rosters and systems into a single universal entry.
        </div>
      </div>
    </div>
  );
}
