"use client";

import { 
  Plus, 
  Bell, 
  Building, 
  Users, 
  Bot, 
  Inbox, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Settings, 
  ShieldCheck, 
  Megaphone,
  ArrowRight,
  Cpu,
  Globe,
  Monitor
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Chart from 'chart.js/auto';
import { analyticsService } from '@/services/analytics.service';

export default function AdminDashboard() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const [stats, setStats] = useState<any>({
    totalSchools: 0,
    activeSchools: 0,
    totalStudents: 0,
    totalPapers: 0,
    totalRequests: 0,
    statusDistribution: {}
  });
  const [fleet, setFleet] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsData, fleetData] = await Promise.all([
          analyticsService.getGlobalStats(),
          analyticsService.getHardwareFleetStatus()
        ]);
        setStats(statsData);
        setFleet(fleetData);
      } catch (err) {
        console.error("Fetch Stats Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    if (!chartRef.current || loading) return;

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    const statusDistribution = stats.statusDistribution || {};
    const labels = Object.keys(statusDistribution).length ? Object.keys(statusDistribution) : ['No schools'];
    const values = Object.keys(statusDistribution).length ? Object.values(statusDistribution) : [1];

    const chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels.map((label) => label.replace(/_/g, ' ').toUpperCase()),
        datasets: [{
          data: values as number[],
          backgroundColor: ['#8B5CF6', '#14B8A6', '#F59E0B', '#EF4444', '#64748B'],
          borderWidth: 0,
          hoverOffset: 10
        }]
      },
      options: {
        cutout: '80%',
        plugins: {
          legend: { display: false }
        }
      }
    });

    return () => chart.destroy();
  }, [loading, stats.statusDistribution]);

  const adoptionPercent = stats.totalSchools > 0
    ? Math.round((stats.activeSchools / stats.totalSchools) * 100)
    : 0;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#070B19]">
      
      {/* Dynamic Background Mesh */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/10 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '-3s' }} />
      </div>

      {/* Header */}
      <header className="header-glass py-6 px-10 flex items-center justify-between sticky top-0 z-30">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-white">Platform Intelligence</h1>
          <p className="text-xs text-muted font-bold uppercase tracking-[0.3em] mt-1.5 opacity-60">Global Infrastructure Control</p>
        </div>
        
        <div className="flex items-center gap-6">
          <button className="btn btn-primary px-6 shadow-premium">
            <Plus className="w-5 h-5" /> Provision Node
          </button>
          <div className="w-px h-8 bg-white/10" />
          <div className="flex gap-4">
             <button className="p-3 rounded-2xl bg-white/5 border border-white/5 text-muted hover:text-white transition-all relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-danger rounded-full border-2 border-[#070B19]"></span>
             </button>
             <button className="p-3 rounded-2xl bg-white/5 border border-white/5 text-muted hover:text-white transition-all">
                <Settings className="w-5 h-5" />
             </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-10 overflow-y-auto custom-scrollbar relative z-10">
        <div className="max-w-[1600px] mx-auto flex flex-col gap-10">
          
          {/* Critical Alerts Banner */}
          {fleet.filter(f => f.status === 'offline').length > 0 ? (
            <div className="bg-danger/10 border border-danger/20 p-5 rounded-[2rem] flex items-center gap-5 animate-fade-in-up">
              <div className="bg-danger/20 p-3 rounded-2xl">
                <AlertCircle className="w-6 h-6 text-danger" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white uppercase tracking-wider">Infrastructure Alert</h4>
                <p className="text-xs text-muted font-bold">Node {fleet.find(f => f.status === 'offline')?.node_name} is currently offline.</p>
              </div>
              <button className="btn btn-outline text-[10px] ml-auto border-danger/30 hover:bg-danger/10">Optimize Now</button>
            </div>
          ) : (
            <div className="bg-success/10 border border-success/20 p-5 rounded-[2rem] flex items-center gap-5 animate-fade-in-up">
              <div className="bg-success/20 p-3 rounded-2xl">
                <CheckCircle className="w-6 h-6 text-success" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white uppercase tracking-wider">Systems Nominal</h4>
                <p className="text-xs text-muted font-bold">All {fleet.length} global edge nodes are synchronized and healthy.</p>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-8">
            {[
              { label: 'Managed Schools', value: stats.totalSchools, icon: Building, color: 'text-primary' },
              { label: 'Active Students', value: stats.totalStudents, icon: Users, color: 'text-secondary' },
              { label: 'AI Operations', value: stats.totalPapers, icon: Bot, color: 'text-success' },
              { label: 'Requests', value: stats.totalRequests, icon: Inbox, color: 'text-warning' },
            ].map((stat, i) => (
              <div key={i} className="glass-card p-8 rounded-[2.5rem] relative group hover:bg-white/[0.05] transition-all">
                <div className="flex justify-between items-start mb-6">
                   <div className={`p-3 rounded-2xl bg-white/5 border border-white/10 ${stat.color}`}>
                      <stat.icon className="w-6 h-6" />
                   </div>
                   <TrendingUp className="w-4 h-4 text-success opacity-40 group-hover:opacity-100" />
                </div>
                <div className="text-4xl font-black text-white mb-2 tracking-tighter">{stat.value}</div>
                <div className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Main Layout Grid */}
          <div className="grid grid-cols-12 gap-10">
            
            {/* Quick Command Bento */}
            <div className="col-span-12 md:col-span-8 flex flex-col gap-6">
               <h3 className="text-lg font-black text-white uppercase tracking-[0.3em] opacity-40 ml-4">Rapid Actions</h3>
               <div className="grid grid-cols-3 gap-6">
                  {[
                    { label: 'Cloud Provision', icon: Globe, desc: 'Setup new institution', href: '/admin/provision' },
                    { label: 'MDM Fleet', icon: Monitor, desc: 'Manage hardware kiosk', href: '/admin/fleet' },
                    { label: 'Edge Nodes', icon: Cpu, desc: 'Orchestrate compute', href: '/admin/nodes' },
                    { label: 'Vault Backups', icon: ShieldCheck, desc: 'Postgres maintenance', href: '/admin/snapshots' },
                    { label: 'Announce', icon: Megaphone, desc: 'Platform broadcast', href: '/admin/settings' },
                  ].map((cmd, i) => (
                    <Link key={i} href={cmd.href} className="glass-card p-8 rounded-[2rem] text-left hover:scale-[1.02] transition-all hover:bg-primary/5 group">
                       <cmd.icon className="w-8 h-8 text-muted group-hover:text-primary transition-colors mb-4" />
                       <h4 className="font-bold text-white mb-1">{cmd.label}</h4>
                       <p className="text-[10px] text-muted font-bold uppercase tracking-widest">{cmd.desc}</p>
                    </Link>
                  ))}
               </div>
            </div>

            {/* Sidebar Widgets */}
            <div className="col-span-12 md:col-span-4 flex flex-col gap-8">
               <div className="glass-card p-8 rounded-[3rem] text-center relative overflow-hidden">
                  <h3 className="text-sm font-black text-white uppercase tracking-widest mb-8">Ecosystem Adoption</h3>
                  <div className="relative inline-flex items-center justify-center">
                    <canvas ref={chartRef} className="relative z-10" width="200" height="200"></canvas>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                       <span className="text-3xl font-black text-white leading-none">{adoptionPercent}%</span>
                       <span className="text-[8px] text-muted font-bold uppercase tracking-widest">Active</span>
                    </div>
                  </div>
                  <div className="mt-8 flex flex-col gap-3">
                     <div className="flex items-center justify-between text-[10px] font-bold">
                        <span className="text-muted">NEP COMPLIANCE</span>
                        <span className="text-success">{stats.activeSchools}/{stats.totalSchools}</span>
                     </div>
                     <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-success" style={{ width: `${adoptionPercent}%` }}></div>
                     </div>
                  </div>
               </div>

               <Link href="/admin/schools" className="glass-card p-8 rounded-[3rem] flex items-center justify-between group hover:bg-primary/10 transition-all">
                  <div>
                    <h3 className="font-black text-white mb-1">Institution Ledger</h3>
                    <p className="text-[10px] text-muted font-bold uppercase tracking-widest">Manage {stats.totalSchools} schools</p>
                  </div>
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:translate-x-2 transition-transform">
                     <ArrowRight className="w-6 h-6 text-primary" />
                  </div>
               </Link>
            </div>

          </div>

        </div>
      </main>

    </div>
  );
}
