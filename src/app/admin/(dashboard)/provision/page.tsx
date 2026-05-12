"use client";

import { useState } from 'react';
import { Building2, Loader2, ArrowRight, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';
import Link from 'next/link';

export default function ProvisionPage() {
  const [udiseCode, setUdiseCode] = useState('');
  const [adminName, setAdminName] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [principalCode, setPrincipalCode] = useState('');
  const [adminAuthorizationCode, setAdminAuthorizationCode] = useState('');
  const [generatedAuthorizationCode, setGeneratedAuthorizationCode] = useState<any>(null);
  const [authorizationLoading, setAuthorizationLoading] = useState(false);
  const [authorizationError, setAuthorizationError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetResult, setResetResult] = useState<any>(null);
  const [resetError, setResetError] = useState('');

  const handleProvision = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setError('');

    try {
      const res = await fetch('/api/school/provision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ udiseCode, adminName })
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

  const handleResetPrincipalPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError('');
    setResetResult(null);

    try {
      const res = await fetch('/api/admin/principal/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ principalCode, adminAuthorizationCode })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Password reset failed');
      setResetResult(data);
    } catch (err: any) {
      setResetError(err.message);
    } finally {
      setResetLoading(false);
    }
  };

  const handleGenerateAuthorizationCode = async () => {
    setAuthorizationLoading(true);
    setAuthorizationError('');
    setGeneratedAuthorizationCode(null);

    try {
      const res = await fetch('/api/admin/authorization-code', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authorization code generation failed');
      setGeneratedAuthorizationCode(data);
      setAdminAuthorizationCode(data.authorizationCode);
    } catch (err: any) {
      setAuthorizationError(err.message);
    } finally {
      setAuthorizationLoading(false);
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
              <p className="text-[10px] text-muted uppercase tracking-widest mt-5 mb-1">Credential Delivery</p>
              <p className="text-sm text-secondary font-bold">{result.credentialDelivery || 'pending'}</p>
              <p className="text-[10px] text-muted mt-4">Principal credentials are queued for the configured secure delivery channel.</p>
            </div>

            <Link href="/admin/dashboard" className="btn btn-primary w-full py-4 justify-center">
              Back to Dashboard
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
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

              {status === 'error' && (
                <div className="bg-danger/10 border border-danger text-danger text-xs p-3 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> {error}
                </div>
              )}

              <button type="submit" className="btn btn-primary w-full py-4 mt-4 justify-center text-lg disabled:opacity-50" disabled={status === 'loading'}>
                {status === 'loading' ? <Loader2 className="animate-spin" /> : <>Provision School <ArrowRight /></>}
              </button>
            </form>

            <form onSubmit={handleResetPrincipalPassword} className="border-t border-white/10 pt-6 flex flex-col gap-4">
              <div className="flex items-center gap-2 text-sm font-bold text-secondary">
                <KeyRound className="w-4 h-4" /> Existing Principal First Login
              </div>
              <button
                type="button"
                onClick={handleGenerateAuthorizationCode}
                className="btn btn-secondary w-full justify-center"
                disabled={authorizationLoading}
              >
                {authorizationLoading ? <Loader2 className="animate-spin" /> : <>Generate Admin Authorization Code</>}
              </button>
              {authorizationError && (
                <div className="bg-danger/10 border border-danger text-danger text-xs p-3 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> {authorizationError}
                </div>
              )}
              {generatedAuthorizationCode && (
                <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl">
                  <p className="text-[10px] text-muted uppercase tracking-widest">Authorization Code</p>
                  <p className="text-primary font-mono text-2xl font-black tracking-[0.2em] mt-1">{generatedAuthorizationCode.authorizationCode}</p>
                  <p className="text-[10px] text-muted mt-2">Valid for {generatedAuthorizationCode.expiresInMinutes} minutes and usable once.</p>
                </div>
              )}
              <input
                type="text"
                placeholder="Enter PR code, e.g. PR620101"
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-secondary transition-colors font-mono"
                value={principalCode}
                onChange={(e) => setPrincipalCode(e.target.value.toUpperCase())}
                required
              />
              <input
                type="password"
                placeholder="Generated admin authorization code"
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-secondary transition-colors"
                value={adminAuthorizationCode}
                onChange={(e) => setAdminAuthorizationCode(e.target.value)}
                required
              />
              {resetError && (
                <div className="bg-danger/10 border border-danger text-danger text-xs p-3 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> {resetError}
                </div>
              )}
              {resetResult && (
                <div className="bg-secondary/10 border border-secondary/20 p-4 rounded-xl">
                  <p className="text-[10px] text-muted uppercase tracking-widest">Reset Queued</p>
                  <p className="text-secondary font-bold mt-1">{resetResult.credentialDelivery || 'secure_delivery_pending'}</p>
                  <p className="text-[10px] text-muted mt-2">Temporary credentials are not shown in the browser. Use the configured secure delivery channel.</p>
                </div>
              )}
              <button type="submit" className="btn btn-outline w-full justify-center" disabled={resetLoading}>
                {resetLoading ? <Loader2 className="animate-spin" /> : <>Generate Temporary Password</>}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
