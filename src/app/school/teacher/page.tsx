"use client";

import { ArrowRight, Badge as BadgeIcon, Building, Info, Loader2, Lock, MonitorCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { signInWithCode } from '@/lib/auth.client';
import { navigateByRole } from '@/lib/constants';

export default function TeacherStationLogin() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [schoolCode, setSchoolCode] = useState('SCH7878');
  const [userCode, setUserCode] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    document.cookie = 'is-class-station=true;path=/;max-age=31536000;samesite=lax';
  }, []);

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await signInWithCode(userCode, password, {
        allowedRoles: ['teacher'],
        schoolCode,
      });
      router.push(navigateByRole('teacher'));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Teacher authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#05070d]">
      <div className="auth-card w-full max-w-[430px] animate-in fade-in zoom-in duration-700">
        <div className="flex flex-col items-center gap-4 mb-10">
          <div className="bg-secondary/10 p-4 rounded-2xl border border-secondary/20 shadow-lg shadow-secondary/5">
            <MonitorCheck className="w-10 h-10 text-secondary" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-extrabold tracking-tight">Class Station</h1>
            <p className="text-[10px] text-secondary font-bold uppercase tracking-widest mt-1 opacity-80">Teacher login only</p>
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
                onChange={(event) => setSchoolCode(event.target.value.toUpperCase())}
                required
                className="w-full font-mono"
              />
            </div>
          </div>

          <div className="input-group">
            <label className="text-[11px] font-bold text-muted uppercase tracking-wider ml-1">Teacher Identifier</label>
            <div className="input-field">
              <BadgeIcon className="w-5 h-5 text-muted mr-3" />
              <input
                type="text"
                placeholder="TXXXXXX"
                value={userCode}
                onChange={(event) => setUserCode(event.target.value)}
                className="w-full font-mono"
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="text-[11px] font-bold text-muted uppercase tracking-wider ml-1">Security Key</label>
            <div className="input-field">
              <Lock className="w-5 h-5 text-muted mr-3" />
              <input
                type="password"
                placeholder="Password"
                className="w-full"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-full py-4 text-md font-bold rounded-xl mt-4" disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin" /> : <>Open Teacher Console <ArrowRight className="ml-2 w-5 h-5" /></>}
          </button>
        </form>
      </div>
    </div>
  );
}
