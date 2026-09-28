'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { checkAuth } from '@/lib/auth';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    checkAuth().then((user) => {
      if (user) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    });
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 text-sm font-medium">Loading Task Manager...</p>
      </div>
    </div>
  );
}
