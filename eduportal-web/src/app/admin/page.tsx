"use client";

import { Shield, User, Lock, ArrowRight, ArrowLeft, Info, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, FormEvent } from 'react';
import { signInWithCode, navigateByRole } from '@/lib/auth';
import { UserRole } from '@/lib/auth';

export default function AdminLogin() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { profile } = await signInWithCode(adminId, password);
      router.push(navigateByRole(profile.role as UserRole));
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-card border rounded-lg p-8 shadow-lg max-w-7xl" style={{ width: '100%', maxWidth: '400px' }}>
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="bg-[var(--bg-dark)] p-4 rounded-full border">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-center">Super Admin Access</h1>
          <p className="text-sm text-muted text-center">Enter your ADXXXXX code and password to manage EduPortal platform.</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-[rgba(239,68,68,0.1)] border border-danger text-danger text-xs p-3 rounded-md mb-6 flex items-center gap-2">
            <Info className="w-4 h-4" /> {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                <label htmlFor="adminId" className="text-sm font-medium text-muted">Admin ID</label>
                <div className="flex items-center bg-[var(--bg-dark)] border rounded-md px-3 py-2">
                    <User className="w-4 h-4 text-muted mr-2" />
                    <input 
                      type="text" 
                      id="adminId" 
                      placeholder="e.g. AD00001" 
                      className="w-full bg-transparent border-none text-white outline-none" 
                      value={adminId}
                      onChange={(e) => setAdminId(e.target.value)}
                      required 
                    />
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <label htmlFor="password" className="text-sm font-medium text-muted">Password</label>
                <div className="flex items-center bg-[var(--bg-dark)] border rounded-md px-3 py-2">
                    <Lock className="w-4 h-4 text-muted mr-2" />
                    <input 
                      type="password" 
                      id="password" 
                      placeholder="••••••••" 
                      className="w-full bg-transparent border-none text-white outline-none" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required 
                    />
                </div>
            </div>

            <div className="flex items-center justify-between mt-2">
                <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
                    <input type="checkbox" className="rounded border-[var(--border)] bg-[var(--bg-dark)]" /> Remember me
                </label>
                <Link href="#" className="text-sm text-primary hover:underline">Forgot password?</Link>
            </div>

            <button type="submit" className="btn btn-primary w-full mt-4 py-3 justify-center text-lg disabled:opacity-50" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" /> : <>Authenticate Securely <ArrowRight /></>}
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
