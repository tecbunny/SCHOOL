"use client";

import AttendanceConfig from '@/features/school-settings/AttendanceConfig';
import TeacherList from '@/features/staff-management/TeacherList';
import AnnouncementComposer from '@/features/announcements/AnnouncementComposer';
import ComplianceReportGenerator from '@/features/compliance/ComplianceReportGenerator';
import SupportTicketSystem from '@/features/support/SupportTicketSystem';
import PromotionConsole from '@/features/school-operations/PromotionConsole';
import EngagementHeatmap from '@/features/compliance/EngagementHeatmap';
import { Shield, Settings, Users, BarChart } from 'lucide-react';

export default function HODDashboard() {
  return (
    <div className="flex flex-col h-full bg-[#0a0a0a]">
      {/* Header */}
      <header className="header-glass py-6 px-8 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-lg">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Operations Hub</h1>
            <p className="text-sm text-muted">HOD/Principal Oversight & NEP Compliance Dashboard.</p>
          </div>
        </div>
        <div className="flex gap-4">
           <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/5 text-center">
              <div className="text-[10px] text-muted uppercase font-bold">Avg Attendance</div>
              <div className="text-lg font-bold text-success">92.4%</div>
           </div>
           <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/5 text-center">
              <div className="text-[10px] text-muted uppercase font-bold">Staff CPD Avg</div>
              <div className="text-lg font-bold text-primary">34.2h</div>
           </div>
        </div>
      </header>

      {/* Grid Layout */}
      <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="grid grid-cols-12 gap-8 max-w-[1600px] mx-auto">
          
          {/* Left Column: Staff Management & Promotion */}
          <div className="col-span-8 flex flex-col gap-8">
            <div className="h-[600px]">
              <TeacherList />
            </div>
            
            <PromotionConsole />
          </div>

          {/* Right Column: Settings, Compliance & Support */}
          <div className="col-span-4 flex flex-col gap-8">
            <ComplianceReportGenerator />
            <EngagementHeatmap />
            <SupportTicketSystem />
            <AttendanceConfig />
            <AnnouncementComposer />
          </div>

        </div>
      </main>
    </div>
  );
}
