import { GraduationCap, ArrowRight, Sparkles, PlayCircle, BarChart3, Bot, Globe, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--bg-dark)] selection:bg-primary/30 flex flex-col">
      <header className="header-glass py-5 px-8">
        <div className="max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="bg-primary/20 p-2 rounded-lg border border-primary/30 group-hover:scale-110 transition-transform">
              <GraduationCap className="text-primary w-6 h-6" />
            </div>
            <h1 className="font-bold text-xl tracking-tight">EduPortal</h1>
          </div>
          <nav className="hidden md:block">
            <ul className="flex items-center gap-10 text-[13px] font-bold text-muted uppercase tracking-widest">
              <li><Link href="#" className="hover:text-white transition-colors">Features</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">NEP 2020</Link></li>
              <li><Link href="/admin" className="hover:text-white transition-colors">Admin</Link></li>
              <li><Link href="/auditor" className="hover:text-white transition-colors">Auditor</Link></li>
            </ul>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/school" className="btn btn-primary px-6 py-2.5 rounded-full text-sm font-bold shadow-lg">
              Launch Portal <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <section className="relative py-24 px-8 overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 blur-[120px] rounded-full" />
          
          <div className="max-w-4xl mx-auto flex flex-col items-center justify-center text-center gap-10 animate-in fade-in slide-in-from-bottom-8">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-primary tracking-[0.2em] uppercase shadow-2xl backdrop-blur-md">
              <Sparkles className="w-4 h-4" /> 100% NEP 2020 Compliant Ecosystem
            </div>
            
            <h2 className="text-5xl md:text-7xl font-extrabold leading-[1.1] tracking-tight">
              The Intelligent OS for <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto] animate-gradient">Modern Schools</span>
            </h2>
            
            <p className="text-xl text-muted max-w-2xl leading-relaxed">
              A unified platform to empower teachers, track holistic progress, and integrate AI-driven academics across every NEP stage.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 mt-4">
              <Link href="/school" className="btn btn-primary px-10 py-4 text-md font-bold rounded-2xl shadow-premium">
                Get Started Now
              </Link>
              <Link href="#demo" className="btn btn-outline px-10 py-4 text-md font-bold rounded-2xl border-white/10">
                <PlayCircle className="mr-2 w-5 h-5" /> Watch Demo
              </Link>
            </div>
          </div>
        </section>

        <section className="py-24 px-8 border-y border-white/5 bg-black/20">
          <div className="max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="group p-10 border border-white/5 rounded-3xl bg-white/[0.02] hover:bg-white/[0.04] transition-all hover:-translate-y-2 flex flex-col gap-6">
              <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center border border-primary/20 shadow-inner group-hover:bg-primary/20 transition-colors">
                <BarChart3 className="text-primary w-8 h-8" />
              </div>
              <div>
                <h3 className="font-bold text-2xl mb-4">Holistic Progress</h3>
                <p className="text-muted leading-relaxed text-sm">Full 360-degree assessment tracking including formative, summative, and socio-emotional metrics.</p>
              </div>
            </div>

            <div className="group p-10 border border-white/5 rounded-3xl bg-white/[0.02] hover:bg-white/[0.04] transition-all hover:-translate-y-2 flex flex-col gap-6">
              <div className="bg-secondary/10 w-16 h-16 rounded-2xl flex items-center justify-center border border-secondary/20 shadow-inner group-hover:bg-secondary/20 transition-colors">
                <Bot className="text-secondary w-8 h-8" />
              </div>
              <div>
                <h3 className="font-bold text-2xl mb-4">AI-Driven Engine</h3>
                <p className="text-muted leading-relaxed text-sm">Automatically generate tests, quizzes, and explanations tied directly to your custom syllabus content.</p>
              </div>
            </div>

            <div className="group p-10 border border-white/5 rounded-3xl bg-white/[0.02] hover:bg-white/[0.04] transition-all hover:-translate-y-2 flex flex-col gap-6">
              <div className="bg-success/10 w-16 h-16 rounded-2xl flex items-center justify-center border border-success/20 shadow-inner group-hover:bg-success/20 transition-colors">
                <ShieldCheck className="text-success w-8 h-8" />
              </div>
              <div>
                <h3 className="font-bold text-2xl mb-4">Secure Gateway</h3>
                <p className="text-muted leading-relaxed text-sm">Role-based access control with biometric handshake simulation for maximum platform integrity.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-20 px-8 bg-black/40">
        <div className="max-w-7xl flex flex-col md:flex-row items-center justify-between gap-10 border-t border-white/5 pt-12">
          <div className="flex items-center gap-4">
            <div className="bg-white/5 p-2 rounded-lg">
              <GraduationCap className="text-muted w-6 h-6" />
            </div>
            <span className="text-muted font-bold tracking-tight text-sm">EduPortal &copy; 2026. Next-Gen Education.</span>
          </div>
          <div className="flex gap-12 text-[11px] font-bold text-muted uppercase tracking-widest">
            <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms</Link>
            <Link href="#" className="hover:text-white transition-colors">Support</Link>
          </div>
          <div className="flex items-center gap-3 text-muted">
            <Globe className="w-5 h-5" />
            <span className="text-[11px] font-bold tracking-widest uppercase">Global Presence</span>
          </div>
        </div>
      </footer>
    </div>
  );
}


