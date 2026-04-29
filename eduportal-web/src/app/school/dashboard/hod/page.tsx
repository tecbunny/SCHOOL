"use client";

import { Megaphone, Users2, CalendarCheck, Award, BookOpen, CheckCircle, AlertCircle } from 'lucide-react';
import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { ChatDrawer } from '@/components/school/ClassroomTools';

export default function HODDashboard() {
  const chartRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Foundational', 'Preparatory', 'Middle', 'Secondary'],
        datasets: [{
          data: [300, 250, 340, 350],
          backgroundColor: ['#f59e0b', '#10b981', '#0ea5e9', '#6366f1'],
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
      <header className="header-glass py-4 px-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">School Overview</h1>
        <div className="flex items-center gap-4">
          <button className="btn btn-primary"><Megaphone className="w-4 h-4" /> Post Announcement</button>
          <div className="border-l border-[var(--border)] h-8 mx-2"></div>
          <button className="text-muted hover:text-white">
            <i className="lucide-bell w-6 h-6"></i>
          </button>
        </div>
      </header>

      <div className="p-8 flex flex-col gap-8 flex-1">
        <div className="grid grid-cols-4 gap-6">
          <div className="stat-card">
            <div className="flex justify-between items-center text-muted text-sm font-semibold">
              TOTAL STUDENTS <Users2 className="w-4 h-4 text-primary" />
            </div>
            <div className="stat-value">1,240</div>
            <div className="text-xs text-muted">Across 4 stages</div>
          </div>
          <div className="stat-card">
            <div className="flex justify-between items-center text-muted text-sm font-semibold">
              AVG ATTENDANCE <CalendarCheck className="w-4 h-4 text-secondary" />
            </div>
            <div className="stat-value text-success">88.4%</div>
            <div className="text-xs text-success flex items-center gap-1">Above CBSE 75% rule</div>
          </div>
          <div className="stat-card">
            <div className="flex justify-between items-center text-muted text-sm font-semibold">
              HPC COMPLETION <Award className="w-4 h-4 text-success" />
            </div>
            <div className="stat-value">92%</div>
            <div className="text-xs text-danger flex items-center gap-1">8% pending by teachers</div>
          </div>
          <div className="stat-card">
            <div className="flex justify-between items-center text-muted text-sm font-semibold">
              SMC MEETINGS <BookOpen className="w-4 h-4 text-muted" />
            </div>
            <div className="stat-value">2</div>
            <div className="text-xs text-muted flex items-center gap-1">Conducted this term</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg">Teacher Performance & CPD Tracking</h3>
            </div>
            
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Teacher Name</th>
                    <th>Subject</th>
                    <th>HPC Status</th>
                    <th>CPD Hours</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div className="font-semibold text-white">Mrs. Priya Nair</div>
                      <div className="text-xs text-muted">T000001</div>
                    </td>
                    <td>Mathematics</td>
                    <td><span className="badge badge-success">Completed</span></td>
                    <td>42 / 50 hrs</td>
                    <td><span className="text-success flex items-center gap-1"><CheckCircle className="w-4 h-4" /> On Track</span></td>
                  </tr>
                  <tr>
                    <td>
                      <div className="font-semibold text-white">Mr. Rahul Kumar</div>
                      <div className="text-xs text-muted">T000002</div>
                    </td>
                    <td>Science</td>
                    <td><span className="badge badge-warning">Pending (3)</span></td>
                    <td>15 / 50 hrs</td>
                    <td><span className="text-danger flex items-center gap-1"><AlertCircle className="w-4 h-4" /> Falling Behind</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="bg-card border rounded-lg p-6">
              <h3 className="font-bold text-lg mb-4">NEP Stage Distribution</h3>
              <canvas ref={chartRef} height="200"></canvas>
            </div>
          </div>
        </div>
      </div>

      <ChatDrawer title="School Chat (Management)" />
    </>
  );
}
