"use client";

import SchoolSidebar from '@/components/school/SchoolSidebar';
import { usePathname } from 'next/navigation';
import { signOut } from '@/lib/auth.client';
import { ReactNode, useEffect, useState } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isEmbedded, setIsEmbedded] = useState(false);

  useEffect(() => {
    setIsEmbedded(document.cookie.includes('is-eduos=true') || window.innerWidth < 500);
  }, []);

  const roleMatch = pathname.match(/\/school\/dashboard\/(student|teacher|hod|moderator)/);
  const role = (roleMatch ? roleMatch[1] : 'student') as 'student' | 'teacher' | 'hod' | 'moderator';

  return (
    <div className={isEmbedded ? 'flex flex-col min-h-screen' : 'app-layout'}>
      {!isEmbedded && <SchoolSidebar role={role} />}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto relative custom-scrollbar">
        {children}
      </main>
      {isEmbedded && (
        <nav className="h-16 border-t border-[var(--border)] bg-[var(--bg-card)] flex items-center justify-around px-4">
          {['Dashboard', 'Classes', 'Quizzes'].map((item) => (
            <div key={item} className="text-[10px] text-muted font-bold flex flex-col items-center">
              {item}
            </div>
          ))}
          <button
            onClick={() => signOut()}
            className="text-[10px] text-danger font-bold flex flex-col items-center bg-transparent border-none p-0"
          >
            Logout
          </button>
        </nav>
      )}
    </div>
  );
}
