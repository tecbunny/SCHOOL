"use client";

import { ShieldAlert, Lock, Loader2, ArrowRight, ShieldCheck, LayoutDashboard, Fingerprint, ArrowLeft, Eye, EyeOff } from 'lucide-react';
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
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const { profile } = await signInWithCode(userCode, password, { allowedRoles: ['admin'] });
      if (profile.role !== 'admin') {
        throw new Error('Access denied. Administrative level clearance required.');
      }
      router.push(navigateByRole('admin'));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Identity verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen app-shell flex items-center justify-center p-6 selection:bg-primary/30 overflow-hidden relative">
      
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/10 blur-[120px] rounded-full" />

      <div className="w-full max-w-[460px] relative z-10 animate-in fade-in zoom-in duration-1000">
        
        <div className="flex flex-col items-center gap-4 mb-10 text-center">
          <div className="bg-primary/10 p-4 rounded-2xl border border-primary/20 shadow-2xl relative group">
             <div className="absolute inset-0 bg-secondary/20 blur-xl rounded-full opacity-40" />
             <ShieldCheck className="w-12 h-12 text-secondary relative z-10" />
          </div>
          <div>
            <h1 className="font-display text-4xl font-bold text-primary">Central Intelligence</h1>
            <p className="text-[10px] text-secondary font-bold uppercase tracking-widest mt-2 opacity-90">Ecosystem Level Clearance Required</p>
          </div>
        </div>

        <div className="glass-card p-10 rounded-3xl relative overflow-hidden shadow-premium">
          <form onSubmit={handleLogin} className="flex flex-col gap-8">
            
            <div className="input-group">
              <label className="text-[11px] font-bold text-muted uppercase tracking-wider ml-2">System Identifier</label>
              <div className="input-field">
                <LayoutDashboard className="w-5 h-5 text-secondary mr-4" />
                <input 
                  type="text" 
                  placeholder="A00001" 
                  value={userCode}
                  onChange={(e) => setUserCode(e.target.value)}
                  className="w-full font-mono text-lg tracking-widest placeholder:text-muted placeholder:opacity-70"
                  required 
                />
              </div>
            </div>

            <div className="input-group">
              <label className="text-[11px] font-bold text-muted uppercase tracking-wider ml-2">Security Key</label>
              <div className="input-field">
                <Lock className="w-5 h-5 text-secondary mr-4" />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="Enter password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-lg placeholder:text-muted placeholder:opacity-70"
                  required 
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="ml-3 rounded-lg p-2 text-muted hover:bg-primary/5 hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-danger/10 border border-danger/20 text-danger text-[11px] p-4 rounded-2xl flex items-center gap-3">
                <ShieldAlert className="w-5 h-5 flex-shrink-0" /> {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary w-full py-5 text-md font-bold rounded-xl mt-2" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : (
                <>Authorize Access <ArrowRight className="ml-2 w-5 h-5" /></>
              )}
            </button>
          </form>

          <div className="grid grid-cols-2 gap-4 mt-10">
             <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 flex flex-col items-center gap-2 opacity-60 hover:opacity-100 transition-all cursor-not-allowed">
                <Fingerprint className="w-5 h-5 text-secondary" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-muted">Biometric</span>
             </div>
             <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 flex flex-col items-center gap-2 opacity-60 hover:opacity-100 transition-all cursor-not-allowed">
                <ShieldCheck className="w-5 h-5 text-secondary" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-muted">Vault Key</span>
             </div>
          </div>
        </div>

        <div className="mt-12 text-center flex flex-col gap-8">
           <div className="flex justify-center items-center gap-8 text-[10px] font-bold text-muted uppercase tracking-widest opacity-60">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse" />
                Node: South Asia
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                Encrypted
              </div>
           </div>
           
           <Link href="/school" className="text-xs text-muted hover:text-primary inline-flex items-center justify-center gap-2 transition-colors font-bold uppercase tracking-widest">
             <ArrowLeft className="w-4 h-4" /> Back to Gateway
           </Link>
        </div>

      </div>
    </div>
  );
}
