"use client";

import SchoolSidebar from '@/components/school/SchoolSidebar';
import { ReactNode } from 'react';

export default function AuditorLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-dark)] text-[var(--text-main)]" data-theme="auditor">
      <SchoolSidebar role="auditor" />
      <main className="flex-1 flex flex-col overflow-y-auto relative">
        {children}
      </main>
    </div>
  );
}
