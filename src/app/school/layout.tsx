"use client";

import { ReactNode, useState, useEffect } from 'react';
import BootSplash from '@/components/school/BootSplash';

export default function SchoolLayout({ children }: { children: ReactNode }) {
  const [isBooting, setIsBooting] = useState(false);
  const [showContent, setShowContent] = useState(true);

  useEffect(() => {
    // Check if we are in simulated EduOS mode
    const isSimulated = typeof window !== 'undefined' && 
                       (window.location.search.includes('sim=true') || 
                        document.cookie.includes('is-eduos=true'));
    
    // Only show boot splash once per session
    const hasBooted = sessionStorage.getItem('eduos_booted');

    if (isSimulated && !hasBooted) {
      setIsBooting(true);
      setShowContent(false);
    }
  }, []);

  const handleBootComplete = () => {
    setIsBooting(false);
    setShowContent(true);
    sessionStorage.setItem('eduos_booted', 'true');
    // Add class to body for global CSS targeting
    document.body.classList.add('is-eduos');
  };

  return (
    <div data-theme="school">
      {isBooting && <BootSplash onComplete={handleBootComplete} />}
      {showContent && (
        <div className="animate-in fade-in duration-1000">
          {children}
        </div>
      )}
    </div>
  );
}

