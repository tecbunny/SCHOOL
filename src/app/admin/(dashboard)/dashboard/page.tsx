"use client";

import { 
  Plus, 
  Bell, 
  MessageSquare, 
  Building, 
  Users, 
  Bot, 
  Inbox, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  CreditCard, 
  BarChart2, 
  FolderUp, 
  Settings, 
  ShieldCheck, 
  Megaphone,
  ArrowRight,
  Cpu,
  Globe
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';

export default function AdminDashboard() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const [stats, setStats] = useState<any>({ totalSchools: 12, totalStudents: 4500, totalPapers: 120 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!chartRef.current || loading) return;

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['High Engagement', 'Medium', 'Inactive'],
        datasets: [{
          data: [65, 25, 10],
          backgroundColor: ['#8B5CF6', '#F472B6', '#1F2937'],
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
  }, [loading]);

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
          <div className="bg-danger/10 border border-danger/20 p-5 rounded-[2rem] flex items-center gap-5 animate-fade-in-up">
            <div className="bg-danger/20 p-3 rounded-2xl">
              <AlertCircle className="w-6 h-6 text-danger" />
            </div>
            <div>
              <h4 className="text-sm font-black text-white uppercase tracking-wider">Infrastructure Alert</h4>
              <p className="text-xs text-muted font-bold">Node Mumbai-B is experiencing high synchronization latency (120ms+).</p>
            </div>
            <button className="btn btn-outline text-[10px] ml-auto border-danger/30 hover:bg-danger/10">Optimize Now</button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-8">
            {[
              { label: 'Managed Schools', value: stats.totalSchools, icon: Building, color: 'text-primary' },
              { label: 'Active Students', value: stats.totalStudents, icon: Users, color: 'text-secondary' },
              { label: 'AI Operations', value: stats.totalPapers, icon: Bot, color: 'text-success' },
              { label: 'Requests', value: '3', icon: Inbox, color: 'text-warning' },
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
                    { label: 'Cloud Provision', icon: Globe, desc: 'Setup new institution' },
                    { label: 'MDM Fleet', icon: Monitor, desc: 'Manage hardware kiosk' },
                    { label: 'Edge Nodes', icon: Cpu, desc: 'Orchestrate compute' },
                    { label: 'Vault Backups', icon: ShieldCheck, desc: 'Postgres maintenance' },
                    { label: 'Billing', icon: CreditCard, desc: 'Stripe integration' },
                    { label: 'Announce', icon: Megaphone, desc: 'Platform broadcast' },
                  ].map((cmd, i) => (
                    <button key={i} className="glass-card p-8 rounded-[2rem] text-left hover:scale-[1.02] transition-all hover:bg-primary/5 group">
                       <cmd.icon className="w-8 h-8 text-muted group-hover:text-primary transition-colors mb-4" />
                       <h4 className="font-bold text-white mb-1">{cmd.label}</h4>
                       <p className="text-[10px] text-muted font-bold uppercase tracking-widest">{cmd.desc}</p>
                    </button>
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
                       <span className="text-3xl font-black text-white leading-none">82%</span>
                       <span className="text-[8px] text-muted font-bold uppercase tracking-widest">Active</span>
                    </div>
                  </div>
                  <div className="mt-8 flex flex-col gap-3">
                     <div className="flex items-center justify-between text-[10px] font-bold">
                        <span className="text-muted">NEP COMPLIANCE</span>
                        <span className="text-success">HIGH</span>
                     </div>
                     <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="w-[82%] h-full bg-success"></div>
                     </div>
                  </div>
               </div>

               <Link href="/admin/schools" className="glass-card p-8 rounded-[3rem] flex items-center justify-between group hover:bg-primary/10 transition-all">
                  <div>
                    <h3 className="font-black text-white mb-1">Institution Ledger</h3>
                    <p className="text-[10px] text-muted font-bold uppercase tracking-widest">Manage 1,200+ schools</p>
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
