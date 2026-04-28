import { ReactNode } from 'react';
import SchoolSidebar from '@/components/school/SchoolSidebar';

export default function StudentLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-layout">
      <SchoolSidebar role="student" />
      <main className="flex flex-col h-screen overflow-y-auto relative">
        {children}
      </main>
    </div>
  );
}
