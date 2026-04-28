import { ReactNode } from 'react';
import AuditorSidebar from '@/components/auditor/AuditorSidebar';

export default function AuditorDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-layout">
      <AuditorSidebar />
      <main className="flex flex-col h-screen overflow-y-auto relative">
        {children}
      </main>
    </div>
  );
}
