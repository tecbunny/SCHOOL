"use client";

import SchoolSidebar from '@/components/school/SchoolSidebar';
import { usePathname } from 'next/navigation';
import { signOut } from '@/lib/auth';
import { ReactNode, useEffect, useState } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isEmbedded, setIsEmbedded] = useState(false);
  
  useEffect(() => {
    setIsEmbedded(document.cookie.includes('is-eduos=true') || window.innerWidth < 500);
  }, []);
  
  // Extract role from pathname (e.g., /school/dashboard/student -> student)
  const roleMatch = pathname.match(/\/school\/dashboard\/(student|teacher|hod|moderator)/);
  const role = (roleMatch ? roleMatch[1] : 'student') as 'student' | 'teacher' | 'hod' | 'moderator';

  return (
    <div className={`flex h-screen overflow-hidden bg-[var(--bg-dark)] text-[var(--text-main)] ${isEmbedded ? 'flex-col' : ''}`}>
      {!isEmbedded && <SchoolSidebar role={role} />}
      <main className="flex-1 flex flex-col overflow-y-auto relative">
        {children}
      </main>
      {isEmbedded && (
        <nav className="h-16 border-t border-[var(--border)] bg-[var(--bg-card)] flex items-center justify-around px-4">
          <div className="text-[10px] text-primary font-bold flex flex-col items-center">
            <span className="text-lg">🏠</span>
            DASHBOARD
          </div>
          <div className="text-[10px] text-muted flex flex-col items-center">
            <span className="text-lg">📚</span>
            CLASSES
          </div>
          <div className="text-[10px] text-muted flex flex-col items-center">
            <span className="text-lg">📝</span>
            QUIZZES
          </div>
          <button 
            onClick={() => signOut()}
            className="text-[10px] text-danger font-bold flex flex-col items-center bg-transparent border-none p-0"
          >
            <span className="text-lg">🚪</span>
            LOGOUT
          </button>
        </nav>
      )}
    </div>
  );
}
