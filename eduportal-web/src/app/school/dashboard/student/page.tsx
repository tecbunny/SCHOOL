"use client";

import { BellRing, Award, CalendarCheck, ClipboardList, Building, Download } from 'lucide-react';
import ChatDrawer from '@/components/school/ChatDrawer';

export default function StudentDashboard() {
  return (
    <>
      <header className="header-glass py-4 px-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Welcome back, Arjun! 👋</h1>
        <div className="flex items-center gap-4">
          <div className="bg-[var(--bg-dark)] px-3 py-1 rounded-full border text-sm text-muted flex items-center gap-2">
            <Building className="w-4 h-4" /> St. Mary's Convent
          </div>
        </div>
      </header>

      <div className="p-8 flex flex-col gap-8 flex-1">
        
        <div className="bg-[rgba(99,102,241,0.1)] border border-primary rounded-lg p-4 flex items-start gap-4">
          <BellRing className="w-6 h-6 text-primary mt-1" />
          <div>
            <h3 className="font-bold text-primary">New AI Quiz Available!</h3>
            <p className="text-sm text-muted mt-1">Your Math teacher has generated an AI Rapid Test for "Quadratic Equations".</p>
          </div>
          <button className="btn btn-primary ml-auto">Take Quiz Now</button>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="stat-card">
            <div className="flex justify-between items-center text-muted text-sm font-semibold">
              CURRENT CGPA <Award className="w-4 h-4 text-secondary" />
            </div>
            <div className="stat-value">8.2</div>
            <div className="text-xs text-success flex items-center gap-1">Top 15% of class</div>
          </div>
          <div className="stat-card">
            <div className="flex justify-between items-center text-muted text-sm font-semibold">
              ATTENDANCE <CalendarCheck className="w-4 h-4 text-success" />
            </div>
            <div className="stat-value text-success">94%</div>
            <div className="text-xs text-muted flex items-center gap-1">Safe from 75% CBSE rule</div>
          </div>
          <div className="stat-card">
            <div className="flex justify-between items-center text-muted text-sm font-semibold">
              PENDING TASKS <ClipboardList className="w-4 h-4 text-danger" />
            </div>
            <div className="stat-value">1</div>
            <div className="text-xs text-danger flex items-center gap-1">Science lab report due tomorrow</div>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">Holistic Progress Card (Snapshot)</h3>
            <button className="btn btn-outline text-xs"><Download className="w-4 h-4" /> Download Full HPC</button>
          </div>
          
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left pb-2 text-muted text-sm">Domain</th>
                <th className="text-left pb-2 text-muted text-sm">Subject / Skill</th>
                <th className="text-left pb-2 text-muted text-sm">Formative</th>
                <th className="text-left pb-2 text-muted text-sm">Summative</th>
                <th className="text-left pb-2 text-muted text-sm">CBSE Grade</th>
              </tr>
            </thead>
            <tbody className="border-t border-[var(--border)]">
              <tr>
                <td className="py-3 font-semibold text-primary">Academic</td>
                <td className="py-3 text-white">Mathematics</td>
                <td className="py-3 text-muted">18/20</td>
                <td className="py-3 text-muted">74/80</td>
                <td className="py-3"><span className="badge badge-success">A1</span></td>
              </tr>
              <tr className="border-t border-[var(--border)]">
                <td className="py-3 font-semibold text-primary">Academic</td>
                <td className="py-3 text-white">Science</td>
                <td className="py-3 text-muted">15/20</td>
                <td className="py-3 text-muted">65/80</td>
                <td className="py-3"><span className="badge badge-warning">B1</span></td>
              </tr>
              <tr className="border-t border-[var(--border)]">
                <td className="py-3 font-semibold text-secondary">Co-Scholastic</td>
                <td className="py-3 text-white">Physical Education</td>
                <td className="py-3 text-muted">--</td>
                <td className="py-3 text-muted">--</td>
                <td className="py-3"><span className="badge badge-success">A2</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <ChatDrawer title="10-A Math Class" />
    </>
  );
}
