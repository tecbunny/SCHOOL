"use client";

import { Plus, Bell, MessageSquare, Building, Users, Bot, Inbox, TrendingUp, AlertCircle, CheckCircle, CreditCard, BarChart2, FolderUp, Settings, ShieldCheck, Megaphone } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';

export default function AdminDashboard() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const [stats, setStats] = useState<any>({ totalSchools: 0, totalStudents: 0, totalPapers: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/analytics');
        const data = await res.json();
        if (res.ok) setStats(data);
      } catch (err) {
        console.error("Stats fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    if (!chartRef.current || loading) return;
    // ... chart logic remains same ...

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['HPC Fully Active', 'AI Generation', 'Subject Attendance', 'Manual Only'],
        datasets: [{
          data: [45, 25, 20, 10],
          backgroundColor: ['#0EA5E9', '#8B5CF6', '#10B981', '#334155'],
          borderWidth: 0,
          hoverOffset: 4
        }]
      },
      options: {
        plugins: {
          legend: { position: 'bottom', labels: { color: '#94a3b8', font: { family: 'Inter', size: 11 } } }
        },
        cutout: '75%'
      }
    });

    return () => chart.destroy();
  }, []);

  return (
    <>
      {/* Top Header */}
      <header className="header-glass py-4 px-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Platform Overview</h1>
        <div className="flex items-center gap-4">
          <button className="btn btn-primary"><Plus className="w-4 h-4" /> Add New School</button>
          <div className="border-l border-[var(--border)] h-8 mx-2"></div>
          <button className="text-muted hover:text-white relative">
            <Bell className="w-6 h-6" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-danger rounded-full"></span>
          </button>
          <button className="text-muted hover:text-primary">
            <MessageSquare className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="p-8 flex flex-col gap-8 flex-1">
        
        {/* Global Announcement Banner */}
        <div className="bg-secondary/10 border border-secondary/20 p-4 rounded-2xl flex items-center gap-4 animate-pulse">
          <div className="bg-secondary/20 p-2 rounded-lg">
            <Megaphone className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <h4 className="text-sm font-bold">Platform Broadcast Active</h4>
            <p className="text-xs text-muted">"Scheduled maintenance on May 15th at 02:00 UTC. Registrations will be temporarily closed."</p>
          </div>
          <button className="btn btn-outline btn-sm ml-auto">Manage</button>
        </div>
        
        {/* Quick Actions */}
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-bold text-muted uppercase tracking-widest">Rapid Commands</h2>
          <div className="grid grid-cols-6 gap-4">
            <Link href="/admin/provision" className="flex flex-col items-center gap-3 p-4 bg-card border border-[var(--border)] rounded-2xl hover:border-primary/50 hover:bg-primary/5 transition-all group">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform"><Plus className="w-5 h-5" /></div>
              <span className="text-xs font-semibold">Provision School</span>
            </Link>
            <Link href="/admin/requests" className="flex flex-col items-center gap-3 p-4 bg-card border border-[var(--border)] rounded-2xl hover:border-warning/50 hover:bg-warning/5 transition-all group">
              <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center text-warning group-hover:scale-110 transition-transform"><Inbox className="w-5 h-5" /></div>
              <span className="text-xs font-semibold">Review Requests</span>
            </Link>
            <Link href="/admin/subscriptions" className="flex flex-col items-center gap-3 p-4 bg-card border border-[var(--border)] rounded-2xl hover:border-success/50 hover:bg-success/5 transition-all group">
              <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-success group-hover:scale-110 transition-transform"><CreditCard className="w-5 h-5" /></div>
              <span className="text-xs font-semibold">Subscriptions</span>
            </Link>
            <Link href="/admin/analytics" className="flex flex-col items-center gap-3 p-4 bg-card border border-[var(--border)] rounded-2xl hover:border-secondary/50 hover:bg-secondary/5 transition-all group">
              <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform"><BarChart2 className="w-5 h-5" /></div>
              <span className="text-xs font-semibold">Global Analytics</span>
            </Link>
            <Link href="/admin/snapshots" className="flex flex-col items-center gap-3 p-4 bg-card border border-[var(--border)] rounded-2xl hover:border-danger/50 hover:bg-danger/5 transition-all group">
              <div className="w-10 h-10 rounded-full bg-danger/10 flex items-center justify-center text-danger group-hover:scale-110 transition-transform"><FolderUp className="w-5 h-5" /></div>
              <span className="text-xs font-semibold">Vault Backups</span>
            </Link>
            <Link href="/admin/settings" className="flex flex-col items-center gap-3 p-4 bg-card border border-[var(--border)] rounded-2xl hover:border-muted/50 hover:bg-white/5 transition-all group">
              <div className="w-10 h-10 rounded-full bg-muted/10 flex items-center justify-center text-muted group-hover:scale-110 transition-transform"><Settings className="w-5 h-5" /></div>
              <span className="text-xs font-semibold">Platform Settings</span>
            </Link>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-6">
          <div className="stat-card">
            <div className="flex justify-between items-center text-muted text-sm font-semibold">
              TOTAL SCHOOLS <Building className="w-4 h-4 text-primary" />
            </div>
            <div className="stat-value">{stats.totalSchools}</div>
            <div className="text-xs text-success flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Real-time</div>
          </div>
          <div className="stat-card">
            <div className="flex justify-between items-center text-muted text-sm font-semibold">
              ACTIVE STUDENTS <Users className="w-4 h-4 text-secondary" />
            </div>
            <div className="stat-value">{stats.totalStudents}</div>
            <div className="text-xs text-primary flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Growth track</div>
          </div>
          <div className="stat-card">
            <div className="flex justify-between items-center text-muted text-sm font-semibold">
              AI PAPERS GENERATED <Bot className="w-4 h-4 text-success" />
            </div>
            <div className="stat-value">{stats.totalPapers}</div>
            <div className="text-xs text-success flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Platform load</div>
          </div>
          <div className="stat-card">
            <div className="flex justify-between items-center text-muted text-sm font-semibold">
              PENDING REQUESTS <Inbox className="w-4 h-4 text-warning" />
            </div>
            <div className="stat-value">0</div>
            <div className="text-xs text-muted">System nominal</div>
          </div>
        </div>

        {/* Charts & Lists Layout */}
        <div className="grid grid-cols-3 gap-8">
          
          {/* Main Table (Spans 2 cols) */}
          <div className="col-span-2 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg">Recently Onboarded Schools</h3>
              <Link href="/admin/schools" className="text-sm text-primary hover:underline">View All Schools</Link>
            </div>
            
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>School Name & Code</th>
                    <th>City</th>
                    <th>Plan</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div className="font-semibold text-white">St. Mary's Convent</div>
                      <div className="text-xs text-muted font-mono mt-1">SCH7878</div>
                    </td>
                    <td>Mumbai</td>
                    <td>Premium</td>
                    <td><span className="badge badge-success">Active</span></td>
                    <td><button className="btn btn-outline text-xs">Manage</button></td>
                  </tr>
                  <tr>
                    <td>
                      <div className="font-semibold text-white">Delhi Public School</div>
                      <div className="text-xs text-muted font-mono mt-1">SCH8921</div>
                    </td>
                    <td>Delhi</td>
                    <td>Standard</td>
                    <td><span className="badge badge-success">Active</span></td>
                    <td><button className="btn btn-outline text-xs">Manage</button></td>
                  </tr>
                  <tr>
                    <td>
                      <div className="font-semibold text-white">Sunrise Academy</div>
                      <div className="text-xs text-muted font-mono mt-1">SCH9044</div>
                    </td>
                    <td>Pune</td>
                    <td>Trial</td>
                    <td><span className="badge badge-warning">Trial Ends 4d</span></td>
                    <td><button className="btn btn-outline text-xs">Manage</button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Sidebar inside Dashboard */}
          <div className="flex flex-col gap-6">
            <div className="bg-card border rounded-lg p-6">
              <h3 className="font-bold text-lg mb-4">NEP Feature Adoption</h3>
              <canvas ref={chartRef} height="200"></canvas>
            </div>

            <div className="bg-card border rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">System Alerts</h3>
                <Link href="/admin/logs" className="text-xs text-muted hover:text-white">Audit Logs</Link>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-3 p-3 bg-[var(--bg-dark)] rounded-md border border-[var(--border)]">
                  <AlertCircle className="w-5 h-5 text-secondary mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold">Supabase Storage limit near</p>
                    <p className="text-xs text-muted mt-1">Platform storage is at 85% capacity. Consider upgrading tier.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-[var(--bg-dark)] rounded-md border border-[var(--border)]">
                  <CheckCircle className="w-5 h-5 text-success mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold">Daily Backup Complete</p>
                    <p className="text-xs text-muted mt-1">PostgreSQL database backed up successfully at 02:00 AM.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
