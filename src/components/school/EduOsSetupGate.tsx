"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EduOsSetupGate({
  role,
  next,
}: {
  role: "student-hub" | "class-station";
  next: string;
}) {
  const router = useRouter();

  useEffect(() => {
    const checkSetup = async () => {
      try {
        const response = await fetch("/api/eduos/station-config", { cache: "no-store" });
        const data = await response.json();
        if (data.setupRequired) {
          router.replace(`/eduos/setup?role=${role}&next=${encodeURIComponent(next)}`);
        }
      } catch (error) {
        console.error("EduOS setup check failed:", error);
      }
    };

    void checkSetup();
  }, [next, role, router]);

  return null;
}
