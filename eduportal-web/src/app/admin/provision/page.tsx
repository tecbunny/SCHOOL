"use client";

import { useState } from 'react';
import { Building2, ShieldCheck, Loader2, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function ProvisionPage() {
  const [udiseCode, setUdiseCode] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleProvision = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setError('');

    try {
      const res = await fetch('/api/school/provision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ udiseCode, adminName, adminPassword })
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Provisioning failed");
      
      setResult(data);
      setStatus('success');
    } catch (err: any) {
      setError(err.message);
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-dark)] flex items-center justify-center p-6">
      <div className="glass-panel w-full max-w-md p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-primary/20 p-3 rounded-xl">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">U-DISE Provisioning</h1>
            <p className="text-xs text-muted">Onboard new schools to SSPH-01 Hub</p>
          </div>
        </div>

        {status === 'success' ? (
          <div className="text-center py-8">
            <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-2">School Onboarded!</h2>
            <p className="text-sm text-muted mb-8">{result.schoolName}</p>
            
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl text-left mb-8">
              <p className="text-[10px] text-muted uppercase tracking-widest mb-1">Principal Login Code</p>
              <p className="text-xl font-mono text-primary font-bold">{result.principalCode}</p>
              <p className="text-[10px] text-muted mt-4">Provide this code and the password you set to the school administration.</p>
            </div>

            <Link href="/admin/dashboard" className="btn btn-primary w-full py-4 justify-center">
              Back to Dashboard
            </Link>
          </div>
        ) : (
          <form onSubmit={handleProvision} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-muted">11-Digit U-DISE Code</label>
              <input 
                type="text" 
                placeholder="e.g. 27240816201" 
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors"
                value={udiseCode}
                onChange={(e) => setUdiseCode(e.target.value)}
                pattern="[0-9]{11}"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-muted">Admin Full Name</label>
              <input 
                type="text" 
                placeholder="Full Name of Principal/HOD" 
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-muted">Initial Admin Password</label>
              <input 
                type="password" 
                placeholder="Set a secure password" 
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                required
              />
            </div>

            {status === 'error' && (
              <div className="bg-danger/10 border border-danger text-danger text-xs p-3 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary w-full py-4 mt-4 justify-center text-lg disabled:opacity-50" disabled={status === 'loading'}>
              {status === 'loading' ? <Loader2 className="animate-spin" /> : <>Provision School <ArrowRight /></>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
