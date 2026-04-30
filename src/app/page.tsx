import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  GraduationCap,
  LineChart,
  MonitorSmartphone,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import BrandIcon from '@/components/BrandIcon';
import ThemeToggle from '@/components/ThemeToggle';

const stats = [
  { label: 'Schools managed', value: '1,200+', icon: Building2 },
  { label: 'Learner profiles', value: '450k', icon: Users },
  { label: 'AI reviews', value: '18k', icon: Sparkles },
  { label: 'Uptime target', value: '99.9%', icon: ShieldCheck },
];

const workflows = [
  { title: 'School command', body: 'Attendance, staff, academics, billing, and compliance in one operating view.', icon: ClipboardCheck },
  { title: 'Student desk', body: 'Assignments, study material, live tests, and holistic progress cards for learners.', icon: GraduationCap },
  { title: 'Teacher tools', body: 'AI paper generation, worksheet grading, class analytics, and content publishing.', icon: BookOpen },
  { title: 'Edge ready', body: 'Kiosk-friendly student surfaces and device health visibility for connected campuses.', icon: MonitorSmartphone },
];

export default function LandingPage() {
  return (
    <main className="landing-shell">
      <header className="landing-header">
        <Link href="/" className="flex items-center gap-3">
          <BrandIcon className="w-9 h-9" animated={false} />
          <span className="text-xl font-black">EduPortal</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-muted">
          <Link href="#workflows" className="hover:text-primary">Workflows</Link>
          <Link href="/school" className="hover:text-primary">School</Link>
          <Link href="/admin" className="hover:text-primary">Admin</Link>
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/school" className="btn btn-outline">Sign in</Link>
          <Link href="/school" className="btn btn-primary">
            Launch <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      <section className="landing-hero">
        <div>
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 rounded-full px-4 py-2 text-xs font-black uppercase tracking-widest mb-8">
            <CheckCircle2 className="w-4 h-4" />
            NEP-ready academic operations
          </div>
          <h1 className="hero-title font-black">
            One calm control room for modern schools.
          </h1>
          <p className="hero-copy">
            EduPortal brings school administration, classroom work, compliance, AI grading,
            and student self-service into a single responsive web app built for daily use.
          </p>
          <div className="flex flex-col md:flex-row gap-4 mt-8">
            <Link href="/school" className="btn btn-primary px-8 py-4">
              Open school gateway <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/admin/dashboard" className="btn btn-outline px-8 py-4">
              View admin console
            </Link>
          </div>
        </div>

        <div className="hero-visual" aria-label="EduPortal product preview">
          <div className="absolute top-8 left-8 right-8 glass-card p-5 rounded-3xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-muted">Today</p>
                <h2 className="text-3xl font-black text-white">Campus Overview</h2>
              </div>
              <LineChart className="w-10 h-10 text-white" />
            </div>
            <div className="grid grid-cols-3 gap-4 mt-6">
              {['Attendance 94%', 'Assignments 128', 'Alerts 02'].map((item) => (
                <div key={item} className="bg-white/10 border border-white/10 rounded-2xl p-4 text-white font-bold">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="product-panel">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-muted">Class 10-A</p>
                <h3 className="text-2xl font-black">Teacher Workspace</h3>
              </div>
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {['AI paper draft', 'HPC progress', 'Live test', 'Edge sync'].map((item) => (
                <div key={item} className="bg-primary/10 border border-primary/20 rounded-xl p-3 text-sm font-bold">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="metric-strip">
        {stats.map((stat) => (
          <div key={stat.label} className="metric-card p-6">
            <stat.icon className="w-7 h-7 text-primary mb-4" />
            <div className="text-3xl font-black">{stat.value}</div>
            <div className="text-sm font-bold text-muted">{stat.label}</div>
          </div>
        ))}
      </section>

      <section id="workflows" className="max-w-7xl mx-auto px-8 py-20">
        <div className="flex flex-col gap-4 mb-12">
          <p className="text-xs font-black uppercase tracking-widest text-primary">Built around real school days</p>
          <h2 className="text-4xl font-black">Everything has a place, nothing fights for attention.</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {workflows.map((item) => (
            <div key={item.title} className="portal-card">
              <item.icon className="w-8 h-8 text-primary mb-6" />
              <h3 className="text-xl font-black mb-3">{item.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
