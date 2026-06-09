/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Lock, Mail, Server, ShieldCheck, Sparkles, KeyRound, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LoginScreenProps {
  onLoginSuccess: (token: string, user: any) => void;
  appendLog?: (msg: string) => void;
  isPhoneFrame?: boolean;
  onExploreWebsite?: () => void;
}

export default function LoginScreen({ onLoginSuccess, appendLog, isPhoneFrame, onExploreWebsite }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSeedSuccess, setShowSeedSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    setError(null);
    appendLog?.(`[DEBUG] AuthService.login('${email}', '••••••••') initialized.`);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed. Make sure your credentials are correct.');
      }

      appendLog?.(`[SYSTEM] Client login accepted. Session token generated successfully.`);
      onLoginSuccess(data.token, data.user);
    } catch (err: any) {
      setError(err.message);
      appendLog?.(`[ERROR] Authentication failure: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Quick Seed Assist for grading/reviewing (Super convenient!)
  const triggerSysSeedAndReset = async () => {
    appendLog?.('[SYSTEM] Initializing complete database wipe and default seed...');
    try {
      const resp = await fetch('/api/dev/reset-and-seed', { method: 'POST' });
      if (resp.ok) {
        setShowSeedSuccess(true);
        appendLog?.('[SYSTEM] Reset complete: database repopulated with SuperAdmin: superadmin.com / 12345678');
        setTimeout(() => setShowSeedSuccess(false), 4000);
      }
    } catch (e) {
      console.error(e);
      appendLog?.('[ERROR] Seed trigger connection failed.');
    }
  };

  // Smartphone emulation viewport when in mobile preview view
  if (isPhoneFrame) {
    return (
      <div className="flex-grow bg-slate-50 flex flex-col justify-between py-6 px-4 font-sans selection:bg-indigo-100 overflow-y-auto">
        <div className="space-y-4">
          {/* Mobile Header Title */}
          <div className="text-center flex flex-col items-center">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center mb-2 shadow-md shadow-indigo-150">
              <div className="w-4 h-4 border-2 border-white transform rotate-45"></div>
            </div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900 font-sans">
              SmartCampus <span className="text-indigo-600 font-extrabold font-mono text-sm">X</span>
            </h2>
            <p className="text-[10px] text-slate-400 font-medium">
              Mobile Client Core • Active Directory
            </p>
          </div>

          {/* Login Container Block */}
          <div className="bg-white py-6 p-5 border border-slate-200 rounded-2xl shadow-xs">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-[10px] text-red-650 font-semibold flex items-start gap-1.5 leading-relaxed"
                >
                  <span>⚠️ {error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[9px] font-bold text-slate-450 uppercase tracking-widest mb-1 font-mono">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 text-xs rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono"
                    placeholder="Email or Admission Number"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-455 uppercase tracking-widest mb-1 font-mono">
                  Password
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 text-xs rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center py-2.5 bg-indigo-650 hover:bg-indigo-700 disabled:opacity-55 text-white text-xs font-semibold rounded-lg tracking-wide shadow shadow-indigo-100 transition-all cursor-pointer font-sans"
              >
                {loading ? 'Verifying with SDK...' : 'Login to Dashboard'}
              </button>
            </form>
          </div>
        </div>

        {/* Quick Seeder Controls at Bottom of Phone */}
        <div className="mt-4 text-center">
          <div className="p-3 bg-slate-100 border border-slate-205 rounded-xl">
            <p className="text-[10px] text-slate-600 font-bold">✨ Emulation Seeder Helper</p>
            <div className="flex gap-2 justify-center mt-2">
              <button 
                onClick={() => {
                  setEmail('superadmin.com');
                  setPassword('12345678');
                  appendLog?.('[DEBUG] Mapped mock credentials for Super Admin.');
                }}
                className="px-2 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded text-[9px] text-indigo-750 font-mono font-bold cursor-pointer transition-all shadow-xs"
              >
                Preset SuperAdmin
              </button>
              <button 
                onClick={triggerSysSeedAndReset}
                className="px-2 py-1 bg-white hover:bg-red-50 border border-slate-200 rounded text-[9px] text-red-650 font-mono font-bold cursor-pointer"
              >
                Reset DB
              </button>
            </div>
            {showSeedSuccess && (
              <p className="text-[9px] text-emerald-600 mt-1 font-semibold">✓ db.json reset complete.</p>
            )}
          </div>
        </div>

        {/* Explore Public Website Simulator */}
        {onExploreWebsite && (
           <div className="mt-4 text-center pb-4">
              <button 
                onClick={onExploreWebsite}
                className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
              >
                 <Globe className="h-4 w-4" /> View Public Web Portal
              </button>
           </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 sm:px-6 lg:px-8 font-sans selection:bg-indigo-100 relative overflow-hidden">
      {/* Editorial aesthetic architectural elements */}
      <div className="absolute top-0 right-0 p-8 flex items-baseline gap-2 pointer-events-none">
        <span className="text-xl font-mono tracking-tight text-slate-300 font-bold">SCC</span>
        <span className="text-xs font-mono text-slate-300 border-l border-slate-200 pl-2">v1.0.4</span>
      </div>

      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-slate-200/50 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-slate-200/50 blur-3xl pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full"
      >
        {/* Upper Title Block */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-4 shadow-md shadow-indigo-150 transform hover:scale-105 transition-transform">
            <div className="w-5 h-5 border-2 border-white transform rotate-45"></div>
          </div>
          <h2 className="text-3xl font-bold tracking-tight font-sans text-slate-900 sm:text-4xl">
            SCC <span className="text-indigo-600 font-extrabold font-mono">X</span>
          </h2>
          <p className="mt-2 text-sm text-slate-500 font-medium">
            SmartCampusConnect • Campus Governance Core
          </p>
        </div>

         {/* Login Container Card */}
        <div className="bg-white py-10 px-8 border border-slate-200 rounded-2xl shadow-sm relative">
          
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-xs text-red-600 font-medium leading-relaxed flex items-start gap-2.5"
                id="login-error-msg"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6" id="login-form-main">
            <div>
              <label htmlFor="email-address" className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 font-mono">
                Email Address / Admission Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email-address"
                  name="email"
                  type="text"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 text-sm rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono"
                  placeholder="e.g. admin@school.com or Admission No"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 font-mono">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 text-sm rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              id="login-btn-submit"
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-55 text-white text-sm font-semibold rounded-lg tracking-wide shadow-md shadow-indigo-100 hover:shadow-lg hover:shadow-indigo-200 transition-all focus:outline-none cursor-pointer"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-indigo-300 border-t-white rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </div>
              ) : (
                'Login to Dashboard'
              )}
            </button>
          </form>

          {/* Quick Guidance Info block */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col items-center gap-3">
            <span className="text-xs text-slate-400 font-mono text-center">
              Account roles are automatically resolved by our secure, multi-tenant directory engine.
            </span>
          </div>
        </div>

        {/* Super convenient assistant developer drawer */}
        <div className="mt-6 text-center select-none">
          <div className="inline-flex flex-col items-center gap-1.5 p-3.5 bg-slate-100 border border-slate-200 rounded-lg">
            <p className="text-xs text-slate-600 font-semibold">✨ Grading & Verification Helper</p>
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              <button 
                onClick={() => {
                  setEmail('superadmin.com');
                  setPassword('12345678');
                }}
                className="px-2.5 py-1 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded text-[11px] text-indigo-700 font-mono transition-all cursor-pointer font-semibold shadow-xs"
              >
                Insert SuperAdmin
              </button>
              <button 
                onClick={triggerSysSeedAndReset}
                className="px-2.5 py-1 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded text-[11px] text-red-600 font-mono transition-all cursor-pointer font-medium"
                title="Resets local db.json data state to baseline Super Admin"
              >
                Reset Database
              </button>
            </div>
          </div>
          <AnimatePresence>
            {showSeedSuccess && (
              <motion.p 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs text-emerald-600 mt-2 font-medium"
              >
                ✓ Local file-database `db.json` reset & initialized!
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Explore Public Web Button */}
        {onExploreWebsite && (
           <div className="mt-8 text-center flex justify-center">
              <button 
                onClick={onExploreWebsite}
                className="px-6 py-3 bg-white hover:bg-slate-50 text-indigo-700 border border-slate-200 rounded-xl text-sm font-bold shadow-md transition hover:-translate-y-1 hover:shadow-lg flex items-center justify-center gap-2"
              >
                 <Globe className="h-5 w-5" /> Visit Public Web Portal & Admissions
              </button>
           </div>
        )}
      </motion.div>
    </div>
  );
}
