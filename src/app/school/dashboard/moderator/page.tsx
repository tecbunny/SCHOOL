"use client";

import MaterialUploader from '@/features/content-management/MaterialUploader';
import SyllabusManager from '@/features/content-management/SyllabusManager';
import AnnouncementComposer from '@/features/announcements/AnnouncementComposer';
import { BookOpen, Database, Layout } from 'lucide-react';

export default function ModeratorDashboard() {
  return (
    <div className="flex flex-col h-full bg-[#0a0a0a]">
      {/* Header */}
      <header className="header-glass py-6 px-8 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="bg-secondary/20 p-2 rounded-lg">
            <Database className="w-6 h-6 text-secondary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Content Engine</h1>
            <p className="text-sm text-muted">Manage syllabus, study materials, and curriculum data.</p>
          </div>
        </div>
      </header>

      {/* Grid Layout */}
      <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="grid grid-cols-12 gap-8 max-w-[1600px] mx-auto">
          
          {/* Left Column: Syllabus Management */}
          <div className="col-span-8 flex flex-col gap-8 h-[calc(100vh-250px)]">
            <div className="flex-1 min-h-0">
              <SyllabusManager />
            </div>
          </div>

          {/* Right Column: Tools & Broadcast */}
          <div className="col-span-4 flex flex-col gap-8">
            <MaterialUploader />
            <AnnouncementComposer />
          </div>

        </div>
      </main>
    </div>
  );
}
