import { GraduationCap, ArrowRight, Sparkles, PlayCircle, BarChart3, Bot, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <header className="header-glass py-4 px-6">
        <div className="max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="text-primary w-6 h-6" />
            <h1 className="font-bold text-xl">EduPortal</h1>
          </div>
          <nav>
            <ul className="flex items-center gap-6 text-sm font-medium">
              <li><Link href="#" className="text-muted hover:text-white transition">Features</Link></li>
              <li><Link href="#" className="text-muted hover:text-white transition">NEP 2020</Link></li>
              <li><Link href="/admin" className="text-muted hover:text-white transition">Admin Portal</Link></li>
              <li><Link href="/auditor" className="text-muted hover:text-white transition">Auditor Login</Link></li>
            </ul>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/school" className="btn btn-primary">
              School Login <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="py-12 px-6 mt-4">
          <div className="max-w-7xl flex flex-col items-center justify-center text-center py-12 gap-6">
            <div className="bg-card border rounded-full px-4 py-1 text-sm text-primary font-semibold flex items-center gap-2 shadow-lg mb-4">
              <Sparkles className="w-4 h-4" /> 100% NEP 2020 Compliant
            </div>
            <h2 className="text-5xl font-bold max-w-3xl leading-tight">
              The Modern Operating System for <span className="text-primary">Next-Gen Schools</span>
            </h2>
            <p className="text-lg text-muted max-w-2xl mb-4">
              Empower teachers, track holistic progress, and seamlessly integrate AI-driven academics across all NEP stages with a single, unified platform.
            </p>
            <div className="flex gap-4">
              <Link href="/school" className="btn btn-primary p-4 text-lg">
                Get Started
              </Link>
              <Link href="#demo" className="btn btn-outline p-4 text-lg">
                <PlayCircle className="mr-2" /> View Demo
              </Link>
            </div>
          </div>
        </section>

        <section className="py-12 px-6 bg-card border-t border-b border-[var(--border)]">
          <div className="max-w-7xl grid grid-cols-3 gap-6">
            <div className="p-6 border rounded-lg bg-[var(--bg-dark)] flex flex-col gap-4">
              <div className="text-primary"><BarChart3 className="w-8 h-8" /></div>
              <h3 className="font-bold text-xl">Holistic Progress Cards</h3>
              <p className="text-muted text-sm">Full 360-degree assessment tracking including formative, summative, and socio-emotional metrics.</p>
            </div>
            <div className="p-6 border rounded-lg bg-[var(--bg-dark)] flex flex-col gap-4">
              <div className="text-secondary"><Bot className="w-8 h-8" /></div>
              <h3 className="font-bold text-xl">AI-Powered Academics</h3>
              <p className="text-muted text-sm">Automatically generate tests, quizzes, and study explanations tied directly to uploaded syllabus content.</p>
            </div>
            <div className="p-6 border rounded-lg bg-[var(--bg-dark)] flex flex-col gap-4">
              <div className="text-success"><MessageSquare className="w-8 h-8" /></div>
              <h3 className="font-bold text-xl">Real-time Unified Chat</h3>
              <p className="text-muted text-sm">Connect students, teachers, principals, and auditors through strict, role-based real-time communication.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 px-6">
        <div className="max-w-7xl flex items-center justify-between border-t pt-6 border-[var(--border)]">
          <div className="flex items-center gap-2">
            <GraduationCap className="text-muted w-5 h-5" />
            <span className="text-muted font-semibold">EduPortal &copy; 2026</span>
          </div>
          <div className="text-muted text-sm flex gap-6">
            <Link href="#" className="hover:text-white transition">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition">Terms of Service</Link>
            <Link href="#" className="hover:text-white transition">Support</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
