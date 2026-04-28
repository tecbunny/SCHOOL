"use client";

import { GraduationCap, Building, Users, Badge as BadgeIcon, Lock, Info, Hash, ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, FormEvent } from 'react';
import { signInWithCode, navigateByRole, UserRole } from '@/lib/auth-utils';
import { Loader2 } from 'lucide-react';

export default function SchoolLogin() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'staff' | 'student'>('staff');
  const [staffRole, setStaffRole] = useState('teacher');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userCode, setUserCode] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: FormEvent, code: string) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { profile } = await signInWithCode(code, password);
      router.push(navigateByRole(profile.role as UserRole));
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-card border rounded-lg p-8 shadow-lg max-w-7xl" style={{ width: '100%', maxWidth: '450px' }}>
        <div className="flex flex-col items-center gap-4 mb-6">
          <div className="bg-[var(--bg-dark)] p-4 rounded-full border">
            <GraduationCap className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-center">School Portal</h1>
          <p className="text-sm text-muted text-center">Select your role to securely access your dashboard.</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[var(--border)] mb-6">
          <button 
            className={`flex-1 py-3 text-sm tab-btn ${activeTab === 'staff' ? 'active border-b-2 border-primary text-white font-semibold' : 'text-muted'}`}
            onClick={() => setActiveTab('staff')}
          >
            Staff Login
          </button>
          <button 
            className={`flex-1 py-3 text-sm tab-btn ${activeTab === 'student' ? 'active border-b-2 border-primary text-white font-semibold' : 'text-muted'}`}
            onClick={() => setActiveTab('student')}
          >
            Student Login
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-[rgba(239,68,68,0.1)] border border-danger text-danger text-xs p-3 rounded-md mb-6 flex items-center gap-2">
            <Info className="w-4 h-4" /> {error}
          </div>
        )}

        {/* Forms */}
        {activeTab === 'staff' && (
          <form onSubmit={(e) => handleLogin(e, userCode)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-muted">School Code</label>
              <div className="flex items-center bg-[var(--bg-dark)] border rounded-md px-3 py-2">
                <Building className="w-4 h-4 text-muted mr-2" />
                <input type="text" placeholder="SCHXXXX" className="w-full bg-transparent border-none text-white outline-none" required />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-muted">Role</label>
              <div className="flex items-center bg-[var(--bg-dark)] border rounded-md px-3 py-2">
                <Users className="w-4 h-4 text-muted mr-2" />
                <select 
                  className="w-full bg-transparent border-none text-white outline-none appearance-none" 
                  value={staffRole}
                  onChange={(e) => setStaffRole(e.target.value)}
                  required
                >
                  <option value="teacher" className="bg-[var(--bg-dark)]">Teacher</option>
                  <option value="hod" className="bg-[var(--bg-dark)]">HOD / Principal</option>
                  <option value="moderator" className="bg-[var(--bg-dark)]">Moderator</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-muted">Staff ID</label>
              <div className="flex items-center bg-[var(--bg-dark)] border rounded-md px-3 py-2">
                <BadgeIcon className="w-4 h-4 text-muted mr-2" />
                <input 
                  type="text" 
                  placeholder="TXXXXXX / PRXXXXX" 
                  className="w-full bg-transparent border-none text-white outline-none" 
                  value={userCode}
                  onChange={(e) => setUserCode(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-muted">Password</label>
              <div className="flex items-center bg-[var(--bg-dark)] border rounded-md px-3 py-2">
                <Lock className="w-4 h-4 text-muted mr-2" />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  className="w-full bg-transparent border-none text-white outline-none" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full mt-4 py-3 justify-center text-lg disabled:opacity-50" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : <>Enter Portal <ArrowRight /></>}
            </button>
          </form>
        )}

        {activeTab === 'student' && (
          <form onSubmit={(e) => handleLogin(e, userCode)} className="flex flex-col gap-4">
            <div className="bg-[var(--bg-dark)] border border-[var(--border)] p-4 rounded-md mb-2 flex items-start gap-3">
              <Info className="w-5 h-5 text-primary mt-0.5" />
              <p className="text-xs text-muted leading-relaxed">Students do not need a School Code. Use your unique 11-digit Student ID provided by your administration.</p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-muted">11-Digit Student Code</label>
              <div className="flex items-center bg-[var(--bg-dark)] border rounded-md px-3 py-2">
                <Hash className="w-4 h-4 text-muted mr-2" />
                <input 
                  type="text" 
                  placeholder="e.g. 78782609341" 
                  pattern="[0-9]{11}" 
                  title="Must be exactly 11 digits" 
                  className="w-full bg-transparent border-none text-white outline-none" 
                  value={userCode}
                  onChange={(e) => setUserCode(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-muted">Password</label>
              <div className="flex items-center bg-[var(--bg-dark)] border rounded-md px-3 py-2">
                <Lock className="w-4 h-4 text-muted mr-2" />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  className="w-full bg-transparent border-none text-white outline-none" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full mt-4 py-3 justify-center text-lg disabled:opacity-50" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : <>Access Dashboard <ArrowRight /></>}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-muted hover:text-white inline-flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Back to EduPortal Home
          </Link>
        </div>
      </div>
    </div>
  );
}
