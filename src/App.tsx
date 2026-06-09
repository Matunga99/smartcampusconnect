/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import SchoolAdminDashboard from './components/SchoolAdminDashboard';
import StudentDashboard from './components/StudentDashboard';
import LecturerDashboard from './components/LecturerDashboard';
import ParentDashboard from './components/ParentDashboard';
import SponsorDashboard from './components/SponsorDashboard';
import PublicWebsiteEngine from './components/PublicWebsiteEngine';
import SchoolPublicWebsite from './components/SchoolPublicWebsite';
import ThemeToggle from './components/ThemeToggle';
import { ShieldCheck, Cpu } from 'lucide-react';

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('scc_token'));
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPublicWebsite, setShowPublicWebsite] = useState(false);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handleLocationChange);
    const handleHashChange = () => {
      setCurrentPath(window.location.hash.replace('#', ''));
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('theme') as 'light' | 'dark') || 'light');

  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const appendLog = (msg: string) => {
    console.log(`[SUOS LOG] ${msg}`);
  };

  // Verify token on application boot
  const verifyToken = async (existingToken: string) => {
    setLoading(true);
    try {
      const resp = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${existingToken}`
        }
      });

      if (resp.ok) {
        const data = await resp.json();
        setUser(data.user);
        appendLog(`[SYSTEM] Authenticated user session retrieved for "${data.user.email}" (${data.user.role}).`);
      } else {
        // Stale or expired token
        localStorage.removeItem('scc_token');
        setToken(null);
        setUser(null);
        appendLog('[WARNING] Stale or invalid session token cleared on app boot.');
      }
    } catch (e) {
      console.error("Token verification failed:", e);
      localStorage.removeItem('scc_token');
      setToken(null);
      setUser(null);
      appendLog('[ERROR] Session synchronization failed. Reverted to offline auth.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      verifyToken(token);
    } else {
      setLoading(false);
    }
  }, [token]);

  // Handle successful login
  const handleLoginSuccess = (newToken: string, userData: any) => {
    localStorage.setItem('scc_token', newToken);
    setToken(newToken);
    setUser(userData);
    appendLog(`[SYSTEM] User login success -> token saved, roles resolved to "${userData.role}".`);
  };

  // Handle clean logout
  const handleLogout = async () => {
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } catch (e) {
        console.error("Logout request failed:", e);
      }
    }
    localStorage.removeItem('scc_token');
    setToken(null);
    setUser(null);
    appendLog('[SYSTEM] Logged out. Session tokens and credentials purged.');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-center gap-3.5 font-sans">
        <ThemeToggle theme={theme} setTheme={setTheme} />
        <div className="p-3 bg-indigo-600 text-white rounded-2xl animate-pulse shadow-lg shadow-indigo-500/20">
          <Cpu className="h-6 w-6" />
        </div>
        <p className="text-xs text-slate-400 font-mono tracking-wide">Syncing Multi-Tenant Directories...</p>
      </div>
    );
  }

  // Resolve Active Content Components Scopes
  const normalizedUser = user ? { ...user, role: user.role === 'staff' ? 'lecturer' : user.role } : null;
  const normalizedRole = normalizedUser ? normalizedUser.role : null;

  // Segment 1: SCHOOL PUBLIC ROUTES
  let parsedSchoolCode: string | null = null;
  if (currentPath.startsWith('/school/')) {
    parsedSchoolCode = currentPath.split('/school/')[1]?.split('/')[0]?.toUpperCase() || null;
  } else if (window.location.search.includes('school=')) {
    const params = new URLSearchParams(window.location.search);
    parsedSchoolCode = params.get('school')?.toUpperCase() || null;
  } else if (window.location.hash.startsWith('#/school/')) {
    parsedSchoolCode = window.location.hash.split('#/school/')[1]?.split('/')[0]?.toUpperCase() || null;
  } else if (window.location.hash.startsWith('#school/')) {
    parsedSchoolCode = window.location.hash.split('#school/')[1]?.split('/')[0]?.toUpperCase() || null;
  }

  if (parsedSchoolCode) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 relative">
        <ThemeToggle theme={theme} setTheme={setTheme} />
        <SchoolPublicWebsite 
          schoolCode={parsedSchoolCode!} 
          onBack={() => {
            if (window.location.hash) {
              window.location.hash = '';
            } else {
              window.history.pushState({}, '', '/');
              setCurrentPath('/');
            }
          }} 
        />
      </div>
    );
  }

  // Segment 2: PLATFORM ROUTES
  const isPlatformRoute = 
    currentPath.startsWith('/admin') ||
    currentPath.startsWith('/superadmin') ||
    currentPath.startsWith('/platform') ||
    currentPath.startsWith('/system');

  if (isPlatformRoute) {
    if (!token || !normalizedUser) {
      return (
        <div className="min-h-screen bg-slate-50 relative">
          <LoginScreen 
            onLoginSuccess={(newToken, userData) => {
              handleLoginSuccess(newToken, userData);
              // Maintain platform route after login, let the re-render handle access check
            }}
            appendLog={appendLog}
            isPhoneFrame={false}
            onExploreWebsite={() => setShowPublicWebsite(true)}
          />
        </div>
      );
    }

    if (normalizedRole === 'superadmin') {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 relative">
          <ThemeToggle theme={theme} setTheme={setTheme} />
          <SuperAdminDashboard 
            token={token} 
            user={normalizedUser} 
            onLogout={handleLogout} 
            appendLog={appendLog}
            isPhoneFrame={false}
            onTabChange={(tab) => {
              setActiveTab(tab);
              appendLog(`[DEBUG] setState() -> Current Tab index updated to: "${tab}"`);
            }}
          />
        </div>
      );
    } else if (normalizedRole === 'admin') {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 relative">
          <ThemeToggle theme={theme} setTheme={setTheme} />
          <SchoolAdminDashboard 
            token={token} 
            user={normalizedUser} 
            onLogout={handleLogout} 
            appendLog={appendLog}
            isPhoneFrame={false}
            onTabChange={(tab) => {
              setActiveTab(tab);
              appendLog(`[DEBUG] setState() -> Current Tab index updated to: "${tab}"`);
            }}
          />
        </div>
      );
    }
 else {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
          <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-full mb-3">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h4 className="font-bold text-slate-900">Platform Access Denied</h4>
          <p className="text-sm text-slate-500 mt-2 max-w-sm">
            Current user ({normalizedUser.email}) does not map to a platform-level role. SuperAdmin or SchoolAdmin required.
          </p>
          <button
            onClick={() => {
              window.history.pushState({}, '', '/');
              setCurrentPath('/');
            }}
            className="mt-6 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer"
          >
            Return to Standard Portal
          </button>
        </div>
      );
    }
  }

  // Segment 3: NORMAL APP ROUTES
  let mainContent: React.ReactNode = null;

  if (showPublicWebsite) {
    mainContent = <PublicWebsiteEngine onBackToDirectory={() => setShowPublicWebsite(false)} />;
  } else if (!token || !normalizedUser) {
    mainContent = (
      <LoginScreen 
        onLoginSuccess={handleLoginSuccess}
        appendLog={appendLog}
        isPhoneFrame={false}
        onExploreWebsite={() => setShowPublicWebsite(true)}
      />
    );
  } else if (normalizedRole === 'superadmin' || normalizedRole === 'admin') {
    // If they logged in to the normal portal but are admin/superadmin, redirect to platform
    window.history.pushState({}, '', normalizedRole === 'superadmin' ? '/superadmin' : '/admin');
    setCurrentPath(normalizedRole === 'superadmin' ? '/superadmin' : '/admin');
    return null; // Will re-render with platform route
  } else if (normalizedRole === 'student') {
    mainContent = (
      <StudentDashboard 
        token={token} 
        user={normalizedUser} 
        onLogout={handleLogout} 
        appendLog={appendLog}
        isPhoneFrame={false}
      />
    );
  } else if (normalizedRole === 'lecturer' || normalizedRole === 'staff') {
    mainContent = (
      <LecturerDashboard 
        token={token} 
        user={normalizedUser} 
        onLogout={handleLogout} 
        appendLog={appendLog}
        isPhoneFrame={false}
      />
    );
  } else if (normalizedRole === 'parent') {
    mainContent = (
      <ParentDashboard 
        token={token} 
        user={normalizedUser} 
        onLogout={handleLogout} 
        appendLog={appendLog}
        isPhoneFrame={false}
      />
    );
  } else if (normalizedRole === 'sponsor') {
    mainContent = (
      <SponsorDashboard 
        token={token} 
        user={normalizedUser} 
        onLogout={handleLogout} 
        appendLog={appendLog}
        isPhoneFrame={false}
      />
    );
  } else {
    mainContent = (
      <div className="flex flex-col items-center justify-center p-6 text-center h-full">
        <div className="p-3 bg-indigo-50 border border-indigo-150 text-indigo-600 rounded-full mb-3">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <h4 className="font-bold text-slate-900 text-sm">Custom Portal</h4>
        <p className="text-[10px] text-slate-500 mt-1 max-w-[240px]">
          Logged in as {user.email}. Portals will be unlocked shortly.
        </p>
        <button
          onClick={handleLogout}
          className="mt-4 px-3.5 py-1.5 bg-slate-900 text-white rounded text-xs font-semibold cursor-pointer"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 relative">
      <ThemeToggle theme={theme} setTheme={setTheme} />
      {mainContent}
    </div>
  );
}
