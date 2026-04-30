"use client";

import SchoolSidebar from '@/components/school/SchoolSidebar';
import { ReactNode } from 'react';

export default function AdminDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-layout">
      <SchoolSidebar role="admin" />
      <main className="flex-1 flex flex-col h-screen overflow-y-auto relative custom-scrollbar">
        {children}
      </main>
    </div>
  );
}
