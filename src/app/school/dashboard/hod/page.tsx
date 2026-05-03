"use client";

import AttendanceConfig from '@/features/school-settings/AttendanceConfig';
import TeacherList from '@/features/staff-management/TeacherList';
import AnnouncementComposer from '@/features/announcements/AnnouncementComposer';
import ComplianceReportGenerator from '@/features/compliance/ComplianceReportGenerator';
import SupportTicketSystem from '@/features/support/SupportTicketSystem';
import OfflineHealthDashboard from '@/features/support/OfflineHealthDashboard';
import PromotionConsole from '@/features/school-operations/PromotionConsole';
import TimetableManager from '@/features/school-operations/TimetableManager';
import EngagementHeatmap from '@/features/compliance/EngagementHeatmap';
import HpcAnalytics from '@/features/compliance/HpcAnalytics';
import { Shield } from 'lucide-react';
import { useEffect, useState } from 'react';
import { analyticsService } from '@/services/analytics.service';
import { createClient } from '@/lib/supabase';

export default function HODDashboard() {
  const [stats, setStats] = useState<any>({ avgAttendance: '0', avgCpd: '0' });
  const supabase = createClient();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from('profiles')
          .select('school_id')
          .eq('id', user.id)
          .single();

        if (profile) {
          const data = await analyticsService.getSchoolStats(profile.school_id);
          setStats(data);
        }
      } catch (err) {
        console.error("Fetch HOD Stats Error:", err);
      }
    };
    fetchStats();
  }, [supabase]);
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
              <div className="text-lg font-bold text-success">{stats.avgAttendance}%</div>
           </div>
           <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/5 text-center">
              <div className="text-[10px] text-muted uppercase font-bold">Staff CPD Avg</div>
              <div className="text-lg font-bold text-primary">{stats.avgCpd}h</div>
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
            <TimetableManager />
          </div>

          {/* Right Column: Settings, Compliance & Support */}
          <div className="col-span-4 flex flex-col gap-8">
            <OfflineHealthDashboard />
            <ComplianceReportGenerator />
            <HpcAnalytics />
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
