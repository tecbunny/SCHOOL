"use client";

import { Eye, UserCheck, Lock, ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent } from 'react';

export default function AuditorLogin() {
  const router = useRouter();

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    router.push('/auditor/dashboard');
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-card border rounded-lg p-8 shadow-lg max-w-7xl" style={{ width: '100%', maxWidth: '400px' }}>
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="bg-[var(--bg-dark)] p-4 rounded-full border">
            <Eye className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-center">Auditor Portal</h1>
          <p className="text-sm text-muted text-center">Enter your AUXXXXX code and password for read-only monitoring access.</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="auditorId" className="text-sm font-medium text-muted">Auditor ID</label>
            <div className="flex items-center bg-[var(--bg-dark)] border rounded-md px-3 py-2">
              <UserCheck className="w-4 h-4 text-muted mr-2" />
              <input type="text" id="auditorId" placeholder="e.g. AU00001" className="w-full bg-transparent border-none text-white outline-none" required />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm font-medium text-muted">Password</label>
            <div className="flex items-center bg-[var(--bg-dark)] border rounded-md px-3 py-2">
              <Lock className="w-4 h-4 text-muted mr-2" />
              <input type="password" id="password" placeholder="••••••••" className="w-full bg-transparent border-none text-white outline-none" required />
            </div>
          </div>

          <div className="flex items-center justify-between mt-2">
            <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
              <input type="checkbox" className="rounded border-[var(--border)] bg-[var(--bg-dark)]" /> Remember me
            </label>
            <Link href="#" className="text-sm text-primary hover:underline">Forgot password?</Link>
          </div>

          <button type="submit" className="btn btn-primary w-full mt-4 py-3 justify-center text-lg">
            Access Records <ArrowRight />
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-muted hover:text-white inline-flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Back to EduPortal Home
          </Link>
        </div>
      </div>
    </div>
  );
}
