"use client";

import { Eye, UserCheck, Lock, ArrowRight, ArrowLeft, ShieldCheck, Search } from 'lucide-react';
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
    <div className="min-h-screen bg-[var(--bg-dark)] flex items-center justify-center p-6 selection:bg-primary/30 overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-success/5 blur-[120px] rounded-full" />

      <div className="w-full max-w-[420px] relative z-10 animate-in fade-in zoom-in duration-700">
        
        <div className="flex flex-col items-center gap-4 mb-10 text-center">
          <div className="bg-success/10 p-4 rounded-2xl border border-success/20 shadow-lg shadow-success/5">
            <Eye className="w-10 h-10 text-success" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Auditor Portal</h1>
            <p className="text-[10px] text-success font-bold uppercase tracking-[0.2em] mt-1.5 opacity-80">Institutional Oversight & Compliance</p>
          </div>
        </div>

        <div className="glass-card p-10 rounded-[2.5rem] border-white/5 relative overflow-hidden shadow-premium">
          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            
            <div className="input-group">
              <label className="text-[11px] font-bold text-muted uppercase tracking-wider ml-1">Auditor Identifier</label>
              <div className="input-field">
                <UserCheck className="w-5 h-5 text-muted mr-3" />
                <input 
                  type="text" 
                  placeholder="AUXXXXX" 
                  className="w-full font-mono text-lg tracking-widest"
                  required 
                />
              </div>
            </div>

            <div className="input-group">
              <label className="text-[11px] font-bold text-muted uppercase tracking-wider ml-1">Access Credentials</label>
              <div className="input-field">
                <Lock className="w-5 h-5 text-muted mr-3" />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  className="w-full"
                  required 
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full py-4 text-md font-bold rounded-xl mt-4 bg-success shadow-success/20 hover:shadow-success/40">
              Enter Observation Hub <ArrowRight className="ml-2 w-5 h-5" />
            </button>

            <div className="flex items-center justify-between mt-2">
              <label className="flex items-center gap-2 text-[11px] font-bold text-muted uppercase cursor-pointer">
                <input type="checkbox" className="rounded border-white/10 bg-black/40" /> Remember Session
              </label>
            </div>
          </form>
        </div>

        <div className="mt-10 text-center flex flex-col gap-6">
          <div className="flex items-center justify-center gap-6 opacity-40">
             <div className="flex items-center gap-2 text-[10px] font-bold text-muted uppercase tracking-widest">
                <ShieldCheck className="w-4 h-4" /> SECURE AUDIT
             </div>
             <div className="flex items-center gap-2 text-[10px] font-bold text-muted uppercase tracking-widest">
                <Search className="w-4 h-4" /> READ-ONLY
             </div>
          </div>
          
          <Link href="/school" className="text-xs text-muted hover:text-white inline-flex items-center justify-center gap-2 transition-colors font-bold uppercase tracking-widest">
            <ArrowLeft className="w-4 h-4" /> Return to Gateway
          </Link>
        </div>

      </div>
    </div>
  );
}
