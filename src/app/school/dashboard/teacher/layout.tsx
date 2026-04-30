"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/school');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role, is_teaching_staff')
        .eq('id', user.id)
        .single();

      if (profile?.role === 'teacher' || (profile?.role === 'principal' && profile?.is_teaching_staff)) {
        setAuthorized(true);
      } else {
        router.push('/school/dashboard/hod');
      }
    };
    checkAuth();
  }, [router, supabase]);

  if (!authorized) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a0a0a]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
