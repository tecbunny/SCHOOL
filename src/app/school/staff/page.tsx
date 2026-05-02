"use client";

import { Building, Users, Badge as BadgeIcon, Lock, Loader2, ArrowRight, Info, ArrowLeft, Briefcase, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, FormEvent } from 'react';
import { signInWithCode } from '@/lib/auth.client';
import { navigateByRole, UserRole } from '@/lib/constants';

const STAFF_ROLE_OPTIONS: Record<string, UserRole[]> = {
  teacher: ['teacher'],
  hod: ['principal'],
  moderator: ['moderator'],
};

export default function StaffAppLogin() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [staffRole, setStaffRole] = useState('teacher');
  const [schoolCode, setSchoolCode] = useState('SCH7878');
  const [userCode, setUserCode] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const { profile } = await signInWithCode(userCode, password, {
        allowedRoles: STAFF_ROLE_OPTIONS[staffRole],
        schoolCode,
      });
      router.push(navigateByRole(profile.role as UserRole));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Staff authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 app-shell">
      <div className="auth-card w-full max-w-[460px] animate-in fade-in zoom-in duration-700">
        
        <div className="flex flex-col items-center gap-4 mb-10">
          <div className="bg-secondary/10 p-4 rounded-2xl border border-secondary/20 shadow-lg shadow-secondary/5">
            <Briefcase className="w-10 h-10 text-secondary" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-extrabold tracking-tight">Staff Station</h1>
            <p className="text-[10px] text-secondary font-bold uppercase tracking-widest mt-1 opacity-80">Workforce management</p>
          </div>
        </div>

        {error && (
          <div className="bg-danger/10 border border-danger/30 text-danger text-[11px] p-4 rounded-xl mb-6 flex items-center gap-3">
            <Info className="w-5 h-5 flex-shrink-0" /> {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          <div className="input-group">
            <label className="text-[11px] font-bold text-muted uppercase tracking-wider ml-1">Institutional Code</label>
            <div className="input-field">
              <Building className="w-5 h-5 text-muted mr-3" />
              <input
                type="text"
                placeholder="SCHXXXX"
                value={schoolCode}
                onChange={(e) => setSchoolCode(e.target.value.toUpperCase())}
                required
                className="w-full font-mono"
              />
            </div>
          </div>

          <div className="input-group">
            <label className="text-[11px] font-bold text-muted uppercase tracking-wider ml-1">Administrative Role</label>
            <div className="input-field relative">
              <Users className="w-5 h-5 text-muted mr-3" />
              <select 
                value={staffRole}
                onChange={(e) => setStaffRole(e.target.value)}
                className="w-full font-semibold cursor-pointer pr-10"
                required
              >
                <option value="teacher">Academic Instructor</option>
                <option value="hod">HOD / Administrator</option>
                <option value="moderator">Regional Moderator</option>
              </select>
              <ChevronDown className="w-4 h-4 text-muted absolute right-4 pointer-events-none" />
            </div>
          </div>

          <div className="input-group">
            <label className="text-[11px] font-bold text-muted uppercase tracking-wider ml-1">Staff Identifier</label>
            <div className="input-field">
              <BadgeIcon className="w-5 h-5 text-muted mr-3" />
              <input 
                type="text" 
                placeholder="TXXXXXX / PRXXXXX" 
                value={userCode}
                onChange={(e) => setUserCode(e.target.value)}
                className="w-full font-mono"
                required 
              />
            </div>
          </div>


          <div className="input-group">
            <label className="text-[11px] font-bold text-muted uppercase tracking-wider ml-1">Security Credentials</label>
            <div className="input-field">
              <Lock className="w-5 h-5 text-muted mr-3" />
              <input 
                type="password" 
                placeholder="Password"
                className="w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>
            <button
              type="button"
              onClick={() => setForgotOpen(true)}
              className="text-xs text-secondary hover:text-white font-bold text-right mt-2"
            >
              Forgot password?
            </button>
          </div>

          <button type="submit" className="btn btn-primary w-full py-4 text-md font-bold rounded-xl mt-4" disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin" /> : <>Access Station <ArrowRight className="ml-2 w-5 h-5" /></>}
          </button>
        </form>

        <div className="mt-10 text-center flex flex-col gap-4">
          <Link href="/school/student" className="text-xs text-muted hover:text-white inline-flex items-center justify-center gap-2 transition-colors font-semibold">
            <ArrowLeft className="w-4 h-4" /> Switch to Student Hub
          </Link>
          <Link href="/" className="text-[10px] text-muted hover:text-white transition-colors uppercase tracking-[0.2em]">
            Return to Main Gateway
          </Link>
        </div>
      </div>
      {forgotOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-card border border-[var(--border)] rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h2 className="text-xl font-bold mb-2">Forgot password?</h2>
            <p className="text-sm text-muted leading-relaxed">
              Ask your EduPortal admin to open Accounts, select your staff card, generate an authorization code, and issue a temporary password.
            </p>
            <button type="button" onClick={() => setForgotOpen(false)} className="btn btn-primary w-full mt-6 justify-center">
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
