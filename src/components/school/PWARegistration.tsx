"use client";

import { useEffect, useState } from "react";

export default function PWARegistration() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Service Worker Registration
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .catch((error) => {
          console.error("Service worker registration failed:", error);
        });
    }

    // Connection Monitoring
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial Check
    if (!navigator.onLine) setIsOffline(true);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-danger text-white text-[10px] py-1 px-4 text-center font-bold animate-pulse">
      📴 OFFLINE MODE: Using cached study materials. Syncing suspended.
    </div>
  );
}
