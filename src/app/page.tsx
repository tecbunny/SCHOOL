import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  Building2,
  CheckCircle2,
  GraduationCap,
  LineChart,
  Mail,
  Phone,
  Sparkles,
  Users,
} from 'lucide-react';
import BrandIcon from '@/components/BrandIcon';
import ThemeToggle from '@/components/ThemeToggle';

const stats = [
  { label: 'Open gateway', value: 'School', href: '/school', icon: GraduationCap },
  { label: 'Teacher tools', value: 'Teach', href: '/school/dashboard/teacher', icon: BookOpen },
  { label: 'Open AI tools', value: 'AI', href: '/school/dashboard/teacher', icon: Sparkles },
  { label: 'Student desk', value: 'Learn', href: '/school/dashboard/student', icon: Users },
];

const workflows = [
  { title: 'School gateway', body: 'Attendance, staff, academics, and daily operations in one operating view.', href: '/school', icon: GraduationCap },
  { title: 'Student desk', body: 'Assignments, study material, live tests, and holistic progress cards for learners.', href: '/school/dashboard/student', icon: GraduationCap },
  { title: 'Teacher tools', body: 'AI paper generation, worksheet grading, class analytics, and content publishing.', href: '/school/dashboard/teacher', icon: BookOpen },
  { title: 'AI workspace', body: 'Paper drafts, grading assistance, and classroom insights designed for teachers.', href: '/school/dashboard/teacher', icon: Sparkles },
];

const overviewLinks = [
  { label: 'Attendance', href: '/school/dashboard/hod' },
  { label: 'Assignments', href: '/school/dashboard/teacher' },
  { label: 'Progress', href: '/school/dashboard/student' },
];

const navLinks = [
  { label: 'Workflows', href: '#workflows' },
  { label: 'School', href: '/school' },
];

const teacherWorkspaceLinks = [
  { label: 'AI paper draft', href: '/school/dashboard/teacher' },
  { label: 'HPC progress', href: '/school/dashboard/student' },
  { label: 'Live test', href: '/school/dashboard/student' },
  { label: 'Assignments', href: '/school/dashboard/teacher' },
];

const footerLinks = [
  { label: 'School gateway', href: '/school' },
  { label: 'Teacher tools', href: '/school/dashboard/teacher' },
  { label: 'Student desk', href: '/school/dashboard/student' },
  { label: 'Assignments', href: '/school/dashboard/teacher' },
];

export default function LandingPage() {
  return (
    <main className="landing-shell">
      <header className="landing-header">
        <Link href="/" className="landing-brand">
          <BrandIcon className="w-9 h-9" animated={false} />
          <span className="font-display font-bold text-primary">EduPortal</span>
        </Link>

        <nav className="landing-nav" aria-label="Primary navigation">
          {navLinks.map((item) => (
            <Link key={item.label} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="landing-actions">
          <ThemeToggle />
          <Link href="/school" className="btn btn-primary">
            Open Gateway <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      <section className="landing-hero">
        <div>
          <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary border border-secondary/20 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest mb-8">
            <CheckCircle2 className="w-4 h-4" />
            NEP-ready academic operations
          </div>
          <h1 className="hero-title font-bold">
            One calm control room for modern schools.
          </h1>
          <p className="hero-copy">
            EduPortal brings school operations, classroom work, compliance, AI grading,
            and student self-service into a single responsive web app built for daily use.
          </p>
          <div className="flex flex-col md:flex-row gap-4 mt-8">
            <Link href="/school" className="btn btn-primary px-8 py-4">
              Open school gateway <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/school/dashboard/teacher" className="btn btn-outline px-8 py-4">
              Open teacher tools
            </Link>
          </div>
        </div>

        <div className="hero-visual" aria-label="EduPortal product preview">
          <div className="absolute top-8 left-8 right-8 glass-card p-5 rounded-3xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted">Today</p>
                <h2 className="font-display text-3xl font-bold text-white">Campus Overview</h2>
              </div>
              <LineChart className="w-10 h-10 text-white" />
            </div>
            <div className="grid grid-cols-3 gap-4 mt-6">
              {overviewLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="bg-white/10 border border-white/10 rounded-xl p-4 text-white font-semibold hover:bg-white/20 transition-all"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="product-panel">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted">Class 10-A</p>
                <h3 className="font-display text-2xl font-bold">Teacher Workspace</h3>
              </div>
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {teacherWorkspaceLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-sm font-semibold hover:bg-primary/20 transition-all"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="metric-strip">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="metric-card p-6">
            <stat.icon className="w-7 h-7 text-primary mb-4" />
            <div className="font-display text-3xl font-bold text-primary">{stat.value}</div>
            <div className="text-sm font-semibold text-muted">{stat.label}</div>
          </Link>
        ))}
      </section>

      <section id="workflows" className="max-w-7xl mx-auto px-8 py-20">
        <div className="flex flex-col gap-4 mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-secondary">Built around real school days</p>
          <h2 className="font-display text-4xl font-bold text-primary">Everything has a place, nothing fights for attention.</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {workflows.map((item) => (
            <Link key={item.title} href={item.href} className="portal-card">
              <item.icon className="w-8 h-8 text-primary mb-6" />
              <h3 className="font-display text-xl font-bold mb-3 text-primary">{item.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{item.body}</p>
            </Link>
          ))}
        </div>
      </section>

      <footer className="landing-footer">
        <div className="footer-brand">
          <Link href="/" className="landing-brand">
            <BrandIcon className="w-10 h-10" animated={false} />
            <span className="font-display font-bold text-primary">EduPortal</span>
          </Link>
          <p>
            A responsive academic operations platform for schools, staff, students,
            and connected campus devices.
          </p>
        </div>

        <div className="footer-links">
          <p className="footer-heading">Explore</p>
          <div>
            {footerLinks.map((item) => (
              <Link key={item.label} href={item.href}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="footer-contact">
          <p className="footer-heading">Contact</p>
          <div className="footer-contact-row">
            <Building2 className="w-4 h-4" />
            <span>Managed by Tecbunny Solutions Pvt Ltd.</span>
          </div>
          <div className="footer-contact-row">
            <Mail className="w-4 h-4" />
            <span>support@tecbunny.com</span>
          </div>
          <div className="footer-contact-row">
            <Phone className="w-4 h-4" />
            <span>9604136010</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
