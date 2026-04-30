"use client";

import { ShieldAlert, Lock, Loader2, ArrowRight, ShieldCheck, Globe, LayoutDashboard, Fingerprint } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, FormEvent } from 'react';
import { signInWithCode } from '@/lib/auth.client';
import { navigateByRole } from '@/lib/constants';

export default function AdminLogin() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userCode, setUserCode] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const { profile } = await signInWithCode(userCode, password);
      if (profile.role !== 'admin') {
        throw new Error('Access denied. Administrative level clearance required.');
      }
      router.push(navigateByRole('admin'));
    } catch (err: any) {
      setError(err.message || 'Identity verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-[#020617] relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(14,165,233,0.15),transparent_70%)]" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none" />

      <div className="w-full max-w-[520px] mx-auto relative z-10 animate-in fade-in zoom-in duration-1000 flex flex-col">
        
        <div className="text-center mb-10 flex flex-col items-center">
          <div className="inline-flex p-4 rounded-[2rem] bg-sky-500/10 border border-sky-500/20 shadow-2xl mb-6 relative">
             <div className="absolute inset-0 bg-sky-500/30 blur-2xl rounded-full animate-pulse" />
             <ShieldCheck className="w-12 h-12 text-sky-500 relative z-10" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">Central Intelligence</h1>
          <p className="text-[10px] text-sky-500/60 font-bold uppercase tracking-[0.4em] text-center">Ecosystem Level Clearance Required</p>
        </div>

        <div className="glass-panel p-10 rounded-[3rem] border-white/5 relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          {/* Top scanning line effect */}
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-sky-500/40 to-transparent animate-pulse" />

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] p-4 rounded-2xl mb-8 flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 flex-shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-8">
            <div className="input-group">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-2 mb-2 block">System Identifier</label>
              <div className="input-field bg-black/40 border-white/5 hover:border-sky-500/30 py-4.5 transition-all">
                <LayoutDashboard className="w-5 h-5 text-slate-500 mr-4" />
                <input 
                  type="text" 
                  placeholder="ADXXXXX" 
                  value={userCode}
                  onChange={(e) => setUserCode(e.target.value)}
                  className="font-mono text-white text-lg tracking-widest placeholder:tracking-normal placeholder:opacity-20"
                  required 
                />
              </div>
            </div>

            <div className="input-group">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-2 mb-2 block">Access Key</label>
              <div className="input-field bg-black/40 border-white/5 hover:border-sky-500/30 py-4.5 transition-all">
                <Lock className="w-5 h-5 text-slate-500 mr-4" />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="text-white text-lg tracking-widest"
                  required 
                />
              </div>
            </div>

            <button type="submit" className="group relative overflow-hidden bg-sky-600 hover:bg-sky-500 text-white w-full py-5 text-md font-bold rounded-2xl transition-all shadow-2xl shadow-sky-600/20 mt-2" disabled={isLoading}>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              {isLoading ? <Loader2 className="animate-spin" /> : (
                <span className="flex items-center justify-center gap-3">
                  Authorize Access <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </button>
          </form>

          <div className="grid grid-cols-2 gap-4 mt-10">
             <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center gap-2 opacity-40 hover:opacity-100 transition-all cursor-not-allowed group">
                <Fingerprint className="w-5 h-5 text-sky-400 group-hover:scale-110 transition-transform" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Biometric</span>
             </div>
             <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center gap-2 opacity-40 hover:opacity-100 transition-all cursor-not-allowed group">
                <ShieldCheck className="w-5 h-5 text-sky-400 group-hover:scale-110 transition-transform" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Vault Key</span>
             </div>
          </div>
        </div>

        <div className="mt-12 text-center flex flex-col gap-10">
          <div className="flex flex-col md:flex-row justify-center items-center gap-8 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
            <div className="flex items-center gap-2.5">
              <div className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-pulse" />
              Node: South Asia (Primary)
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-500/40" />
              Status: Encrypted
            </div>
          </div>
          
          <Link href="/" className="text-[11px] text-slate-500 hover:text-sky-400 transition-colors font-bold uppercase tracking-[0.3em] inline-flex items-center justify-center gap-3">
            <ArrowRight className="w-4 h-4 rotate-180" /> Back to Gateway
          </Link>
        </div>

      </div>
    </div>
  );

}

