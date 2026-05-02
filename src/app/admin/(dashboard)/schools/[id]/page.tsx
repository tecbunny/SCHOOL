"use client";

import { 
  Building, 
  Settings, 
  CreditCard, 
  BarChart2, 
  History, 
  FileText, 
  ChevronLeft,
  Save,
  Zap,
  Shield,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

type TabType = 'overview' | 'features' | 'subscription' | 'usage' | 'activity' | 'notes';

export default function SchoolDetailPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [school, setSchool] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchool = async () => {
      try {
        const res = await fetch(`/api/admin/schools/${id}`);
        const data = await res.json();
        if (res.ok) setSchool(data);
      } catch (err) {
        console.error("Failed to fetch school detail:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSchool();
  }, [id]);

  const metrics = school?.metrics || {
    students: 0,
    staff: 0,
    materials: 0,
    examPapers: 0,
    hardwareNodes: 0
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  if (!school) return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold mb-4">School Not Found</h1>
      <Link href="/admin/schools" className="text-primary hover:underline flex items-center justify-center gap-2">
        <ChevronLeft className="w-4 h-4" /> Back to Directory
      </Link>
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Building },
    { id: 'features', label: 'Features', icon: Zap },
    { id: 'subscription', label: 'Subscription', icon: CreditCard },
    { id: 'usage', label: 'Usage', icon: BarChart2 },
    { id: 'activity', label: 'Activity Log', icon: History },
    { id: 'notes', label: 'Notes', icon: FileText },
  ];

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a]">
      {/* Header */}
      <header className="header-glass py-6 px-8 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-6">
          <Link href="/admin/schools" className="p-2 hover:bg-white/5 rounded-full transition-colors text-muted">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{school.school_name}</h1>
              <span className={`badge ${school.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                {school.status.toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-muted font-mono uppercase tracking-tighter mt-1">Tenant ID: {school.school_code}</p>
          </div>
        </div>
        <button className="btn btn-primary gap-2">
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </header>

      {/* Tab Navigation */}
      <nav className="flex px-8 bg-white/[0.02] border-b border-white/5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all relative ${
              activeTab === tab.id ? 'text-primary' : 'text-muted hover:text-white'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" />
            )}
          </button>
        ))}
      </nav>

      {/* Tab Content */}
      <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {activeTab === 'overview' && (
            <div className="grid grid-cols-2 gap-8">
              <section className="bg-card border border-white/5 rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><Shield className="w-5 h-5 text-primary" /> Core Identity</h3>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-muted uppercase">Full School Name</label>
                    <input type="text" defaultValue={school.school_name} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors text-white" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-muted uppercase">Principal / Head of Institution</label>
                    <input type="text" disabled defaultValue={school.principal?.full_name || 'No principal account linked'} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-muted" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-muted uppercase">UDISE Code</label>
                      <input type="text" defaultValue={school.udise_code || ''} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors text-white" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-muted uppercase">Registration Date</label>
                      <input type="text" disabled defaultValue={new Date(school.created_at).toLocaleDateString()} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-muted" />
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-card border border-white/5 rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><Settings className="w-5 h-5 text-secondary" /> NEP 2020 Stages</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { stage: 'Foundational', enabled: metrics.students > 0 },
                    { stage: 'Preparatory', enabled: metrics.students > 0 },
                    { stage: 'Middle', enabled: metrics.staff > 0 },
                    { stage: 'Secondary', enabled: metrics.examPapers > 0 }
                  ].map(({ stage, enabled }) => (
                    <label key={stage} className="flex items-center justify-between p-4 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors border border-transparent hover:border-secondary/20">
                      <span className="text-sm">{stage}</span>
                      <input type="checkbox" checked={enabled} readOnly className="w-5 h-5 accent-secondary" />
                    </label>
                  ))}
                </div>
                <p className="text-[10px] text-muted mt-4 leading-relaxed">
                  Note: Enabling "Foundational" will activate Competency-based Assessment UI for teachers in this tenant.
                </p>
              </section>
            </div>
          )}

          {activeTab === 'features' && (
            <div className="grid grid-cols-3 gap-6">
              {[
                { id: 'ai', name: 'AI Question Generator', desc: 'Allows teachers to generate automated exam papers.', icon: Zap, color: 'text-warning' },
                { id: 'attendance', name: 'Subject Attendance', desc: 'Enable subject-wise tracking instead of daily roll call.', icon: BarChart2, color: 'text-primary' },
                { id: 'sms', name: 'SMS Notifications', desc: 'Send automated alerts for attendance and grades.', icon: FileText, color: 'text-success' },
                { id: 'kiosk', name: 'Hardware Integration', desc: 'Sync with Luckfox Edge nodes for local execution.', icon: Settings, color: 'text-secondary' },
              ].map((feat) => (
                <div key={feat.id} className="bg-card border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors">
                  <div className={`p-2 rounded-lg bg-white/5 w-fit mb-4 ${feat.color}`}>
                    <feat.icon className="w-6 h-6" />
                  </div>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold">{feat.name}</h4>
                    <input type="checkbox" defaultChecked className="w-5 h-5 accent-primary" />
                  </div>
                  <p className="text-xs text-muted leading-relaxed">{feat.desc}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'subscription' && (
            <div className="bg-card border border-white/5 rounded-2xl p-8 flex flex-col gap-8">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold">{(school.plan_type || 'standard').toUpperCase()} LICENSE</h3>
                  <p className="text-sm text-muted mt-1">Status: {school.status === 'active' ? 'Active & Verified' : 'Action Required'}</p>
                </div>
                <div className={`px-4 py-2 rounded-xl border ${school.status === 'active' ? 'bg-success/10 border-success/20 text-success' : 'bg-warning/10 border-warning/20 text-warning'}`}>
                   <span className="text-sm font-bold uppercase tracking-widest">{school.status === 'active' ? 'Full Access' : 'Trial / Suspended'}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                  <div className="text-[10px] font-bold text-muted uppercase mb-1 tracking-widest">Student Capacity</div>
                  <div className="text-3xl font-black text-white">{metrics.students.toLocaleString()} <span className="text-sm text-muted font-normal">students enrolled</span></div>
                </div>
                <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                  <div className="text-[10px] font-bold text-muted uppercase mb-1 tracking-widest">License Verification</div>
                  <div className="text-3xl font-black text-success">Verified</div>
                </div>
              </div>
              <p className="text-xs text-muted leading-relaxed italic">
                 Note: Subscription tiers are managed at the infrastructure level. No financial transactions are processed through this administrative portal.
              </p>
            </div>
          )}

          {activeTab === 'usage' && (
            <div className="grid grid-cols-5 gap-4">
              {[
                ['Students', metrics.students],
                ['Staff', metrics.staff],
                ['Materials', metrics.materials],
                ['AI Papers', metrics.examPapers],
                ['Edge Nodes', metrics.hardwareNodes]
              ].map(([label, value]) => (
                <div key={label} className="bg-card border border-white/5 rounded-2xl p-6">
                  <p className="text-[10px] text-muted font-bold uppercase tracking-widest mb-2">{label}</p>
                  <p className="text-3xl font-black text-white">{Number(value).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="bg-card border border-white/5 rounded-2xl overflow-hidden">
              {(school.activity || []).map((event: any) => (
                <div key={event.id} className="p-5 border-b border-white/5 flex items-start justify-between gap-6">
                  <div>
                    <p className="text-sm font-bold text-white">{event.message}</p>
                    <p className="text-[10px] text-muted font-bold uppercase tracking-widest mt-1">{event.event_type} / {event.severity}</p>
                  </div>
                  <p className="text-xs text-muted whitespace-nowrap">{new Date(event.created_at).toLocaleString()}</p>
                </div>
              ))}
              {(school.activity || []).length === 0 && (
                <div className="p-16 text-center text-muted font-bold">
                  No tenant activity has been logged yet.
                </div>
              )}
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="bg-card border border-white/5 rounded-2xl p-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                  <div className="text-[10px] font-bold text-muted uppercase mb-1 tracking-widest">School Code</div>
                  <div className="text-xl font-black text-white">{school.school_code}</div>
                </div>
                <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                  <div className="text-[10px] font-bold text-muted uppercase mb-1 tracking-widest">Attendance Mode</div>
                  <div className="text-xl font-black text-white">{school.attendance_mode || 'morning'}</div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
