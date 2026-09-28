'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { checkAuth } from '@/lib/auth';
import { getGoogleLoginUrl } from '@/lib/api';
import { CheckSquare, AlertCircle, Sparkles, Loader2 } from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [devEmail, setDevEmail] = useState('demo@taskmanager.com');
  const [devName, setDevName] = useState('Demo User');
  const [loggingInDev, setLoggingInDev] = useState(false);

  useEffect(() => {
    const error = searchParams.get('error');
    if (error === 'OAUTH_CANCELLED') {
      setErrorMsg('Google login was cancelled.');
    } else if (error === 'OAUTH_FAILED') {
      setErrorMsg('Failed to complete Google login. Please try again.');
    } else if (error === 'OAUTH_NOT_CONFIGURED') {
      setErrorMsg('Google Client ID not configured in environment variables yet. Use Dev Quick Login below!');
    }

    checkAuth().then((user) => {
      if (user) {
        router.replace('/dashboard');
      } else {
        setCheckingAuth(false);
      }
    });
  }, [router, searchParams]);

  const handleGoogleLogin = () => {
    window.location.href = getGoogleLoginUrl();
  };

  const handleDevLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingInDev(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/dev-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: devEmail, name: devName }),
      });
      const data = await res.json();
      if (data.success) {
        router.replace('/dashboard');
      } else {
        setErrorMsg('Dev login failed');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to connect to backend server');
    } finally {
      setLoggingInDev(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="flex flex-col items-center gap-3 py-12">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-slate-500 text-sm font-medium">Checking authentication status...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Logo & Title */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/25">
          <CheckSquare className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Task Manager</h1>
        <p className="text-slate-500 text-sm">Manage tasks. Assign work. Stay updated.</p>
      </div>

      {errorMsg && (
        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Google Login Button */}
      <button
        onClick={handleGoogleLogin}
        className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-700 font-semibold py-3.5 px-4 rounded-xl border border-slate-300 shadow-sm transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>Continue with Google</span>
      </button>

      {/* Divider */}
      <div className="relative flex py-2 items-center">
        <div className="flex-grow border-t border-slate-200"></div>
        <span className="flex-shrink mx-4 text-xs font-semibold text-slate-400 uppercase">Or Dev Quick Login</span>
        <div className="flex-grow border-t border-slate-200"></div>
      </div>

      {/* Quick Dev Login Form */}
      <form onSubmit={handleDevLogin} className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Name</label>
          <input
            type="text"
            value={devName}
            onChange={(e) => setDevName(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
          <input
            type="email"
            value={devEmail}
            onChange={(e) => setDevEmail(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loggingInDev}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Instant Local Login</span>
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
        <Suspense
          fallback={
            <div className="flex flex-col items-center gap-3 py-12">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-slate-500 text-sm font-medium">Loading login...</p>
            </div>
          }
        >
          <LoginContent />
        </Suspense>
      </div>
    </div>
  );
}
