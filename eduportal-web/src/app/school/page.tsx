"use client";

import { GraduationCap, Briefcase, Users, ArrowRight, ShieldCheck, Globe, ArrowLeft, LayoutGrid } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function SchoolAppSelector() {
  const [isEduOS, setIsEduOS] = useState(false);

  useEffect(() => {
    const isSim = window.location.search.includes('sim=true') || document.cookie.includes('is-eduos=true');
    setIsEduOS(isSim);
    
    // In EduOS mode (kiosk), we automatically redirect to the Student Hub app
    if (isSim) {
      window.location.href = '/school/student?sim=true';
    }
  }, []);

  if (isEduOS) return (
    <div className="min-h-screen bg-[#000] flex items-center justify-center text-white font-mono text-xs tracking-widest animate-pulse">
      BOOTING STUDENT HUB SURFACE...
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--bg-dark)] flex items-center justify-center p-6 selection:bg-primary/30 overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/5 blur-[120px] rounded-full" />

      <div className="max-w-4xl w-full flex flex-col items-center gap-12 relative z-10">
        
        <div className="flex flex-col items-center gap-4 text-center animate-in fade-in slide-in-from-top-8 duration-700">
          <div className="bg-primary/10 p-3.5 rounded-2xl border border-primary/20 shadow-xl mb-2">
            <LayoutGrid className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-2">EduPortal Gateway</h1>
            <p className="text-muted text-sm max-w-sm mx-auto">Select the specialized application environment to begin your session.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full animate-in fade-in zoom-in duration-1000 delay-200">
          
          {/* Staff Hub Card */}
          <Link href="/school/staff" className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-secondary/50 to-secondary/30 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
            <div className="relative bg-card border border-white/5 p-8 rounded-3xl flex flex-col gap-6 hover:translate-y-[-8px] transition-all duration-300">
              <div className="bg-secondary/10 w-16 h-16 rounded-2xl flex items-center justify-center border border-secondary/20 shadow-inner group-hover:bg-secondary/20 transition-colors">
                <Briefcase className="text-secondary w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2 flex items-center gap-3">
                  Staff Station <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </h3>
                <p className="text-sm text-muted leading-relaxed">Dedicated workspace for Teachers, HODs, and Administrators to manage academics and operations.</p>
              </div>
              <div className="flex items-center gap-2 mt-auto">
                <span className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] bg-secondary/10 px-3 py-1 rounded-full border border-secondary/20">Workforce App</span>
              </div>
            </div>
          </Link>

          {/* Student Hub Card */}
          <Link href="/school/student" className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-primary/30 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
            <div className="relative bg-card border border-white/5 p-8 rounded-3xl flex flex-col gap-6 hover:translate-y-[-8px] transition-all duration-300">
              <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center border border-primary/20 shadow-inner group-hover:bg-primary/20 transition-colors">
                <GraduationCap className="text-primary w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2 flex items-center gap-3">
                  Student Hub <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </h3>
                <p className="text-sm text-muted leading-relaxed">Interactive surface for students to access study materials, assignments, and holistic progress cards.</p>
              </div>
              <div className="flex items-center gap-2 mt-auto">
                <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] bg-primary/10 px-3 py-1 rounded-full border border-primary/20">Learner App</span>
              </div>
            </div>
          </Link>

        </div>

        <div className="flex flex-col items-center gap-8 mt-4 animate-in fade-in duration-1000 delay-500">
          <div className="flex gap-12 text-[11px] font-bold text-muted uppercase tracking-[0.2em]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-success" /> Encrypted Endpoint
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" /> Region: India South
            </div>
          </div>
          
          <Link href="/" className="text-xs text-muted hover:text-white inline-flex items-center gap-2 transition-colors font-bold uppercase tracking-widest border-b border-white/5 pb-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Main Gateway
          </Link>
        </div>

      </div>
    </div>
  );
}


