"use client";

import { ArrowLeft, ArrowRight, Briefcase, GraduationCap, LayoutGrid, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import BrandIcon from '@/components/BrandIcon';

export default function SchoolAppSelector() {
  const [isEduOS, setIsEduOS] = useState(false);

  useEffect(() => {
    const isSim = window.location.search.includes('sim=true') || document.cookie.includes('is-eduos=true');
    setIsEduOS(isSim);
    if (isSim) window.location.href = '/school/student?sim=true';
  }, []);

  if (isEduOS) {
    return (
      <div className="min-h-screen flex items-center justify-center text-primary font-bold uppercase tracking-widest">
        Starting Student Hub...
      </div>
    );
  }

  return (
    <main className="min-h-screen app-shell flex items-center justify-center p-6">
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <section className="flex flex-col gap-6">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-muted hover:text-primary">
            <ArrowLeft className="w-4 h-4" /> Main gateway
          </Link>
          <div className="flex items-center gap-4">
            <BrandIcon className="w-12 h-12" />
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-secondary">Choose workspace</p>
              <h1 className="font-display text-5xl font-bold text-primary">EduPortal Gateway</h1>
            </div>
          </div>
          <p className="text-lg text-muted max-w-sm">
            Pick the right surface for the session. Staff get operational tools;
            students get a focused learning desk.
          </p>
          <div className="inline-flex items-center gap-2 text-sm font-bold text-success bg-success/10 border border-success/20 rounded-full px-4 py-2 w-fit">
            <ShieldCheck className="w-4 h-4" /> Secure school endpoint
          </div>
        </section>

        <section className="grid grid-cols-1 gap-5">
          <Link href="/school/staff" className="portal-card group">
            <div className="flex items-start justify-between gap-6">
              <div className="bg-secondary/10 border border-secondary/20 rounded-xl p-4">
                <Briefcase className="w-9 h-9 text-secondary" />
              </div>
              <ArrowRight className="w-6 h-6 text-muted group-hover:text-primary transition-colors" />
            </div>
            <h2 className="font-display text-3xl font-bold mt-8 mb-3 text-primary">Staff Station</h2>
            <p className="text-muted">Teachers, HODs, moderators, and administrators manage academics and school operations here.</p>
          </Link>

          <Link href="/school/student" className="portal-card group">
            <div className="flex items-start justify-between gap-6">
              <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
                <GraduationCap className="w-9 h-9 text-primary" />
              </div>
              <ArrowRight className="w-6 h-6 text-muted group-hover:text-primary transition-colors" />
            </div>
            <h2 className="font-display text-3xl font-bold mt-8 mb-3 text-primary">Student Hub</h2>
            <p className="text-muted">A clean learner workspace for study material, assignments, tests, and progress cards.</p>
          </Link>

          <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-muted">
            <LayoutGrid className="w-4 h-4 text-primary" /> Region: India South
          </div>
        </section>
      </div>
    </main>
  );
}
