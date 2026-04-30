import Link from 'next/link';
import { 
  GraduationCap, 
  ArrowRight, 
  Sparkles, 
  Activity, 
  ShieldCheck, 
  Globe, 
  Zap,
  Cpu,
  Layers,
  Users
} from 'lucide-react';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#070B19] overflow-hidden">
      
      {/* Background Decor */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-float"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px] animate-float" style={{ animationDelay: '-3s' }}></div>
      </div>

      {/* Header */}
      <header className="header-glass py-4 px-8 flex items-center justify-between relative z-50">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-2 rounded-xl shadow-premium">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-black tracking-tighter text-white">EduPortal<span className="text-primary">.</span></span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-muted">
          <Link href="#features" className="hover:text-white transition-colors">Features</Link>
          <Link href="#ecosystem" className="hover:text-white transition-colors">Ecosystem</Link>
          <Link href="#eduos" className="hover:text-white transition-colors">EduOS</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/school" className="text-sm font-bold text-white hover:text-primary transition-colors">Sign In</Link>
          <Link href="/school" className="btn btn-primary">Launch App</Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-20 px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 animate-fade-in-up">
          <Sparkles className="w-4 h-4 text-secondary" />
          <span className="text-xs font-bold uppercase tracking-widest text-secondary">The Future of Education is Here</span>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-8 leading-[0.9] animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          Next-Gen <br /> 
          <span className="text-gradient animate-gradient">Academic OS.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto mb-12 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          EduPortal is an AI-first, edge-capable ecosystem designed to orchestrate entire school infrastructures with zero latency and absolute security.
        </p>

        <div className="flex flex-col md:flex-row items-center justify-center gap-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <Link href="/school" className="btn btn-primary py-4 px-10 text-lg w-full md:w-auto shadow-premium">
            Get Started Free <ArrowRight className="w-5 h-5" />
          </Link>
          <Link href="#eduos" className="btn btn-outline py-4 px-10 text-lg w-full md:w-auto">
             Explore EduOS
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-20 px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: 'Active Tenants', value: '1,200+', icon: Globe },
            { label: 'Real-time Sync', value: '0.4ms', icon: Zap },
            { label: 'Student Users', value: '450k', icon: Users },
            { label: 'Security Score', value: '99.9%', icon: ShieldCheck },
          ].map((stat, i) => (
            <div key={i} className="glass-card p-8 rounded-3xl text-center hover:scale-105 transition-transform duration-500">
              <stat.icon className="w-8 h-8 text-primary mx-auto mb-4" />
              <div className="text-3xl font-black text-white mb-1">{stat.value}</div>
              <div className="text-xs font-bold uppercase tracking-widest text-muted">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Bento Grid Features */}
      <section id="features" className="relative z-10 py-32 px-8 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Engineered for Excellence.</h2>
          <p className="text-muted">A modular architecture that grows with your institution.</p>
        </div>

        <div className="grid grid-cols-12 gap-6 h-[800px]">
          {/* Main Feature */}
          <div className="col-span-12 md:col-span-8 glass-card rounded-[3rem] p-12 flex flex-col justify-between group overflow-hidden relative">
            <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:opacity-30 transition-opacity duration-700">
               <Cpu className="w-64 h-64 text-primary" />
            </div>
            <div>
              <div className="bg-primary/20 p-4 rounded-2xl w-fit mb-8">
                <Activity className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-4xl font-black text-white mb-4">Edge Telemetry & Monitoring</h3>
              <p className="text-lg text-muted max-w-md">Monitor thousands of hardware kiosks in real-time with zero overhead. Full remote orchestration at your fingertips.</p>
            </div>
            <div className="flex gap-4">
              <div className="px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary">LIVE STATUS</div>
              <div className="px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 text-xs font-bold text-secondary">AUTO-RECOVERY</div>
            </div>
          </div>

          {/* Small Feature 1 */}
          <div className="col-span-12 md:col-span-4 glass-card rounded-[3rem] p-12 hover:bg-primary/5 transition-all duration-500">
            <Layers className="w-12 h-12 text-secondary mb-8" />
            <h3 className="text-2xl font-bold text-white mb-4">Multi-Tenant Isolation</h3>
            <p className="text-muted">Strict RLS policies ensure total data sovereignty for every school on the platform.</p>
          </div>

          {/* Small Feature 2 */}
          <div className="col-span-12 md:col-span-4 glass-card rounded-[3rem] p-12 hover:bg-secondary/5 transition-all duration-500">
            <ShieldCheck className="w-12 h-12 text-success mb-8" />
            <h3 className="text-2xl font-bold text-white mb-4">NEP 2020 Compliant</h3>
            <p className="text-muted">Built-in frameworks for 360-degree holistic assessment and competency mapping.</p>
          </div>

          {/* Side Feature */}
          <div className="col-span-12 md:col-span-8 glass-card rounded-[3rem] p-12 flex items-center justify-between group">
            <div className="max-w-md">
              <h3 className="text-3xl font-black text-white mb-4">AI Grading Engine</h3>
              <p className="text-muted">Harness the power of Gemini Vision to grade subjective worksheets in seconds with rubrics-based accuracy.</p>
            </div>
            <div className="bg-white/5 p-8 rounded-3xl border border-white/10 group-hover:scale-110 transition-transform duration-700">
               <Sparkles className="w-16 h-16 text-primary animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-32 px-8">
        <div className="max-w-5xl mx-auto glass-card rounded-[4rem] p-20 text-center relative overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10"></div>
           <div className="relative z-10">
              <h2 className="text-5xl font-black text-white mb-8">Ready to evolve your school?</h2>
              <Link href="/school" className="btn btn-primary py-6 px-12 text-xl rounded-full">
                Get Started Now
              </Link>
           </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-8 border-t border-white/5 text-center">
        <p className="text-muted text-sm font-bold tracking-widest uppercase">© 2026 EduPortal Ecosystem. Built for the next decade.</p>
      </footer>

    </main>
  );
}
