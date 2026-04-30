"use client";

import { GraduationCap, Hash, Lock, Loader2, ArrowRight, Camera, Fingerprint, Info, ShieldCheck, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, FormEvent, useEffect } from 'react';
import { signInWithCode } from '@/lib/auth.client';
import { navigateByRole } from '@/lib/constants';
import { QRScannerModal, QRLoginModal } from '@/components/school/AuthModals';

export default function StudentAppLogin() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userCode, setUserCode] = useState('');
  const [password, setPassword] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [deviceId, setDeviceId] = useState('FETCHING...');
  const [isEduOS, setIsEduOS] = useState(false);

  useEffect(() => {
    const isSim = window.location.search.includes('sim=true') || document.cookie.includes('is-eduos=true');
    setIsEduOS(isSim);
    setDeviceId(window.navigator.userAgent.split(' ').pop() || 'SSPH-01-STUDENT');
    const savedId = localStorage.getItem('remembered_student_id');
    if (savedId) setUserCode(savedId);
  }, []);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const { profile } = await signInWithCode(userCode, password);
      localStorage.setItem('remembered_student_id', userCode);
      router.push(navigateByRole('student'));
    } catch (err: any) {
      setError(err.message || 'Identity verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${isEduOS ? 'bg-[#000]' : 'bg-[var(--bg-dark)]'}`}>
      <div className={`${isEduOS ? 'border-none shadow-none' : 'bg-card border rounded-xl shadow-premium p-8'} w-full max-w-[420px] animate-in fade-in zoom-in duration-700`}>
        
        <div className="flex flex-col items-center gap-4 mb-10">
          <div className="bg-primary/20 p-4 rounded-2xl border border-primary/30 shadow-lg shadow-primary/10">
            <GraduationCap className="w-10 h-10 text-primary" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-extrabold tracking-tight">Student Hub</h1>
            <p className="text-[10px] text-primary font-bold uppercase tracking-[0.2em] mt-1.5 opacity-80">EduOS Native Surface</p>
          </div>
        </div>

        {error && (
          <div className="bg-danger/10 border border-danger/30 text-danger text-[11px] p-4 rounded-xl mb-6 flex items-center gap-3">
            <Info className="w-5 h-5 flex-shrink-0" /> {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div className="input-group">
            <label className="text-[11px] font-bold text-muted uppercase tracking-wider ml-1">Identity Hub ID</label>
            <div className="input-field py-4">
              <Hash className="w-5 h-5 text-muted mr-3" />
              <input 
                type="text" 
                placeholder="11-Digit Student ID" 
                pattern="[0-9]{11}" 
                className="w-full tracking-[0.2em] font-mono text-lg"
                value={userCode}
                onChange={(e) => setUserCode(e.target.value)}
                required 
              />
            </div>
          </div>

          <div className="input-group">
            <label className="text-[11px] font-bold text-muted uppercase tracking-wider ml-1">Access Token</label>
            <div className="input-field py-4">
              <Lock className="w-5 h-5 text-muted mr-3" />
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-full py-4 text-md font-bold rounded-xl mt-2" disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin" /> : <>Launch Dashboard <ArrowRight className="ml-2 w-5 h-5" /></>}
          </button>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/5" /></div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-[0.3em] font-bold text-muted"><span className="bg-card px-4">Secure Handshake</span></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button type="button" onClick={() => setShowQR(true)} className="btn btn-outline py-4 rounded-xl flex flex-col gap-2 h-auto">
              <Fingerprint className="w-6 h-6 text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Biometric</span>
            </button>
            <button type="button" onClick={() => setShowScanner(true)} className="btn btn-outline py-4 rounded-xl flex flex-col gap-2 h-auto">
              <Camera className="w-6 h-6 text-secondary" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Gate Scan</span>
            </button>
          </div>
        </form>

        {!isEduOS && (
          <div className="mt-10 text-center">
            <Link href="/school" className="text-xs text-muted hover:text-white inline-flex items-center gap-2 transition-colors font-semibold">
              <ArrowLeft className="w-4 h-4" /> Switch to Staff Portal
            </Link>
          </div>
        )}
      </div>

      {showQR && <QRLoginModal deviceId={deviceId} onClose={() => setShowQR(false)} />}
      {showScanner && <QRScannerModal deviceId={deviceId} onLoginSuccess={(code) => { setUserCode(code); setPassword('SSPH01_HANDSHAKE_SECURE'); setShowScanner(false); }} onClose={() => setShowScanner(false)} />}
    </div>
  );
}
