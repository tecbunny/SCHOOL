import { ReactNode } from 'react';
import SchoolSidebar from '@/components/school/SchoolSidebar';

export default function ModeratorLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-layout">
      <SchoolSidebar role="moderator" />
      <main className="flex flex-col h-screen overflow-y-auto relative">
        {children}
      </main>
    </div>
  );
}
