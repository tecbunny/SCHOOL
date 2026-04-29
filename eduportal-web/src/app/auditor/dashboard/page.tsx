"use client";

import { Printer, Bell, ShieldAlert, Building, CalendarCheck, Award, AlertTriangle, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { ChatDrawer } from '@/components/school/ClassroomTools';

export default function AuditorDashboard() {
  const chartRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: ['Attendance', 'Grades', 'CPD', 'Materials', 'SMC'],
        datasets: [
          {
            label: 'St. Mary\'s',
            data: [92, 78, 85, 90, 80],
            backgroundColor: 'rgba(15, 118, 110, 0.2)', // Teal
            borderColor: '#0F766E',
            pointBackgroundColor: '#0F766E'
          },
          {
            label: 'Sunrise',
            data: [71, 61, 40, 55, 60],
            backgroundColor: 'rgba(239, 68, 68, 0.2)', // Red
            borderColor: '#EF4444',
            pointBackgroundColor: '#EF4444'
          }
        ]
      },
      options: {
        scales: {
          r: {
            min: 0,
            max: 100,
            angleLines: { color: '#334155' },
            grid: { color: '#334155' },
            pointLabels: { color: '#94a3b8', font: { family: 'Inter', size: 10 } },
            ticks: { display: false }
          }
        },
        plugins: {
          legend: { position: 'bottom', labels: { color: '#94a3b8', font: { family: 'Inter', size: 11 } } }
        }
      }
    });

    return () => chart.destroy();
  }, []);

  return (
    <>
      {/* Top Header */}
      <header className="header-glass py-4 px-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Auditor Overview</h1>
        <div className="flex items-center gap-4">
          <button className="btn btn-primary"><Printer className="w-4 h-4" /> Generate PDF Report</button>
          <div className="border-l border-[var(--border)] h-8 mx-2"></div>
          <button className="text-muted hover:text-white">
            <Bell className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="p-8 flex flex-col gap-8 flex-1">
        
        {/* Strict Read-Only Banner */}
        <div className="bg-[rgba(245,158,11,0.1)] border border-[var(--secondary)] rounded-lg p-3 flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-secondary" />
          <p className="text-sm text-muted">You are in <strong className="text-secondary">Strict Read-Only Mode</strong>. No data can be altered. Student names are hidden by default.</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-6">
          <div className="stat-card">
            <div className="flex justify-between items-center text-muted text-sm font-semibold">
              SCHOOLS ASSIGNED <Building className="w-4 h-4 text-primary" />
            </div>
            <div className="stat-value">5</div>
            <div className="text-xs text-muted">Active monitoring</div>
          </div>
          <div className="stat-card">
            <div className="flex justify-between items-center text-muted text-sm font-semibold">
              AVG ATTENDANCE <CalendarCheck className="w-4 h-4 text-success" />
            </div>
            <div className="stat-value">88.4%</div>
            <div className="text-xs text-success flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Across 5 schools</div>
          </div>
          <div className="stat-card">
            <div className="flex justify-between items-center text-muted text-sm font-semibold">
              NEP COMPLIANCE <Award className="w-4 h-4 text-primary" />
            </div>
            <div className="stat-value">92%</div>
            <div className="text-xs text-muted flex items-center gap-1">HPC & CPD tracking</div>
          </div>
          <div className="stat-card">
            <div className="flex justify-between items-center text-muted text-sm font-semibold">
              AT-RISK FLAGS <AlertTriangle className="w-4 h-4 text-danger" />
            </div>
            <div className="stat-value text-danger">2</div>
            <div className="text-xs text-danger flex items-center gap-1">Thresholds breached</div>
          </div>
        </div>

        {/* Charts & Lists Layout */}
        <div className="grid grid-cols-3 gap-8">
          
          {/* Main Table (Spans 2 cols) */}
          <div className="col-span-2 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg">Performance Health Map</h3>
              <Link href="#" className="text-sm text-primary hover:underline">View Detailed Comparison</Link>
            </div>
            
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>School Name</th>
                    <th>Attendance</th>
                    <th>Academic (CGPA)</th>
                    <th>Teacher CPD</th>
                    <th>Overall Health</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div className="font-semibold text-white">St. Mary's Convent</div>
                      <div className="text-xs text-muted font-mono mt-1">SCH7878</div>
                    </td>
                    <td>92% <span className="text-success text-xs ml-1">🟢</span></td>
                    <td>7.8 <span className="text-success text-xs ml-1">🟢</span></td>
                    <td>High <span className="text-success text-xs ml-1">🟢</span></td>
                    <td><span className="badge badge-success">Good</span></td>
                  </tr>
                  <tr>
                    <td>
                      <div className="font-semibold text-white">Sunrise Academy</div>
                      <div className="text-xs text-muted font-mono mt-1">SCH9044</div>
                    </td>
                    <td>71% <span className="text-danger text-xs ml-1">🔴</span></td>
                    <td>6.1 <span className="text-secondary text-xs ml-1">🟠</span></td>
                    <td>Low <span className="text-danger text-xs ml-1">🔴</span></td>
                    <td><span className="badge badge-danger">At Risk</span></td>
                  </tr>
                  <tr>
                    <td>
                      <div className="font-semibold text-white">Delhi Public School</div>
                      <div className="text-xs text-muted font-mono mt-1">SCH8921</div>
                    </td>
                    <td>85% <span className="text-success text-xs ml-1">🟢</span></td>
                    <td>7.0 <span className="text-secondary text-xs ml-1">🟠</span></td>
                    <td>Medium <span className="text-secondary text-xs ml-1">🟡</span></td>
                    <td><span className="badge badge-warning">Fair</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Sidebar inside Dashboard */}
          <div className="flex flex-col gap-6">
            <div className="bg-card border rounded-lg p-6">
              <h3 className="font-bold text-lg mb-4">Radar Analysis</h3>
              <canvas ref={chartRef} height="250"></canvas>
            </div>

            <div className="bg-card border rounded-lg p-6">
              <h3 className="font-bold text-lg mb-4">Threshold Alerts</h3>
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-3 p-3 bg-[var(--bg-dark)] rounded-md border border-[var(--danger)] bg-opacity-10">
                  <AlertTriangle className="w-5 h-5 text-danger mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-danger">CBSE Attendance Rule</p>
                    <p className="text-xs text-muted mt-1">Sunrise Academy is at 71%, which is below the mandatory 75% threshold.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-[var(--bg-dark)] rounded-md border border-[var(--secondary)] bg-opacity-10">
                  <AlertTriangle className="w-5 h-5 text-secondary mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-secondary">CPD Hours Pace</p>
                    <p className="text-xs text-muted mt-1">Teachers at Sunrise Academy are averaging only 10 hours of CPD (50 hours required).</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <ChatDrawer title="Dept Chat: Sunrise Audit" />
    </>
  );
}
