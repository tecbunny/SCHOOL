import { ReactNode } from 'react';
import SchoolSidebar from '@/components/school/SchoolSidebar';

export default function AdminDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-layout">
      <SchoolSidebar role="admin" />
      <main className="flex flex-col h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
