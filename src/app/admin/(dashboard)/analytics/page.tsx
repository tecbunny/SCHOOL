"use client";

import { BarChart2, TrendingUp, Users, BookOpen, MapPin, Building } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';

export default function AnalyticsPage() {
  const lineChartRef = useRef<HTMLCanvasElement>(null);
  const barChartRef = useRef<HTMLCanvasElement>(null);
  const [stats, setStats] = useState<any>(null);
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
    if (!lineChartRef.current || !barChartRef.current || loading) return;
    // ... chart logic ...

    const lineCtx = lineChartRef.current.getContext('2d');
    const barCtx = barChartRef.current.getContext('2d');

    if (!lineCtx || !barCtx) return;

    const lineChart = new Chart(lineCtx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Total Students',
          data: [35000, 38000, 41000, 42500, 44200, 45200],
          borderColor: '#0EA5E9',
          backgroundColor: 'rgba(14, 165, 233, 0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        plugins: { legend: { display: false } },
        scales: { y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }, x: { grid: { display: false }, ticks: { color: '#94a3b8' } } }
      }
    });

    const barChart = new Chart(barCtx, {
      type: 'bar',
      data: {
        labels: ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Gujarat'],
        datasets: [{
          label: 'Schools',
          data: [45, 32, 28, 12, 7],
          backgroundColor: '#8B5CF6',
          borderRadius: 6
        }]
      },
      options: {
        plugins: { legend: { display: false } },
        scales: { y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }, x: { grid: { display: false }, ticks: { color: '#94a3b8' } } }
      }
    });

    return () => {
      lineChart.destroy();
      barChart.destroy();
    };
  }, [loading]);

  return (
    <>
      <header className="header-glass py-4 px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-secondary/20 p-2 rounded-lg">
            <BarChart2 className="w-6 h-6 text-secondary" />
          </div>
          <h1 className="text-2xl font-bold">Global Analytics</h1>
        </div>
        <div className="flex gap-2">
          <select className="bg-card border border-[var(--border)] rounded-xl px-4 py-2 outline-none text-sm font-semibold">
            <option>Last 6 Months</option>
            <option>Last Year</option>
            <option>All Time</option>
          </select>
          <button className="btn btn-outline">Export Report</button>
        </div>
      </header>

      <div className="p-8 flex flex-col gap-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-4 gap-6">
          <div className="stat-card">
            <div className="flex justify-between items-center text-muted text-[10px] font-bold uppercase tracking-widest mb-1">
              Active Students <Users className="w-4 h-4 text-primary" />
            </div>
            <div className="text-2xl font-bold">{stats?.totalStudents || 0}</div>
            <div className="text-[10px] text-success flex items-center gap-1 mt-1"><TrendingUp className="w-3 h-3" /> Live from DB</div>
          </div>
          <div className="stat-card">
            <div className="flex justify-between items-center text-muted text-[10px] font-bold uppercase tracking-widest mb-1">
              Total Schools <Building className="w-4 h-4 text-secondary" />
            </div>
            <div className="text-2xl font-bold">{stats?.totalSchools || 0}</div>
            <div className="text-[10px] text-success flex items-center gap-1 mt-1"><TrendingUp className="w-3 h-3" /> Platform growth</div>
          </div>
          <div className="stat-card">
            <div className="flex justify-between items-center text-muted text-[10px] font-bold uppercase tracking-widest mb-1">
              AI Papers <BookOpen className="w-4 h-4 text-success" />
            </div>
            <div className="text-2xl font-bold">{stats?.totalPapers || 0}</div>
            <div className="text-[10px] text-success flex items-center gap-1 mt-1"><TrendingUp className="w-3 h-3" /> Intelligence load</div>
          </div>
          <div className="stat-card">
            <div className="flex justify-between items-center text-muted text-[10px] font-bold uppercase tracking-widest mb-1">
              Geo Presence <MapPin className="w-4 h-4 text-warning" />
            </div>
            <div className="text-2xl font-bold">18 States</div>
            <div className="text-[10px] text-muted flex items-center gap-1 mt-1">Expanding across India</div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-2 gap-8">
          <div className="bg-card border border-[var(--border)] rounded-2xl p-6">
            <h3 className="font-bold text-lg mb-6">Student Growth Trend</h3>
            <canvas ref={lineChartRef} height="200"></canvas>
          </div>
          <div className="bg-card border border-[var(--border)] rounded-2xl p-6">
            <h3 className="font-bold text-lg mb-6">Distribution by Region</h3>
            <canvas ref={barChartRef} height="200"></canvas>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="bg-card border border-[var(--border)] rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg">Top Performing Schools</h3>
            <button className="text-sm text-primary hover:underline">View Detailed Rankings</button>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">1</div>
              <div>
                <h4 className="font-bold text-sm">Delhi Public School</h4>
                <p className="text-xs text-muted">98% Adoption Score</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
              <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary font-bold">2</div>
              <div>
                <h4 className="font-bold text-sm">St. Mary's Convent</h4>
                <p className="text-xs text-muted">94% Adoption Score</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
              <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center text-success font-bold">3</div>
              <div>
                <h4 className="font-bold text-sm">Valley High School</h4>
                <p className="text-xs text-muted">89% Adoption Score</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
