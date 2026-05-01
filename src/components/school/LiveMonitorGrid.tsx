"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Monitor, Lock, ExternalLink, Zap, Users } from 'lucide-react';

interface StudentSession {
  student_id: string;
  current_activity: string;
  status: string;
  last_ping: string;
  profiles: {
    full_name: string;
    user_code: string;
    school_id: string;
  };
}

export default function LiveMonitorGrid({ schoolId }: { schoolId: string }) {
  const [sessions, setSessions] = useState<StudentSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  const fetchSessions = useCallback(async () => {
    const { data } = await supabase
      .from('student_sessions')
      .select('*, profiles!inner(full_name, user_code, school_id)')
      .eq('profiles.school_id', schoolId)
      .order('last_ping', { ascending: false });

    setSessions(data || []);
    setIsLoading(false);
  }, [schoolId, supabase]);

  useEffect(() => {
    void Promise.resolve().then(fetchSessions);

    const channel = supabase
      .channel('live_monitoring')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'student_sessions' 
      }, () => {
        fetchSessions();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchSessions, supabase]);

  const isSafeAppPath = (url: string) => {
    try {
      const parsed = new URL(url, window.location.origin);
      return parsed.origin === window.location.origin && parsed.pathname.startsWith('/school/');
    } catch {
      return false;
    }
  };

  const sendCommand = async (studentId: string, type: string, payload: Record<string, unknown> = {}) => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('device_commands').insert({
      target_student_id: studentId,
      issuer_id: user?.id,
      command_type: type,
      payload
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-lg">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-xl font-bold">Live Classroom Monitor</h2>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted">
          <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
          {sessions.length} Active Hubs Connected
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {sessions.map((session) => (
          <div key={session.student_id} className="glass-panel p-4 flex flex-col gap-4 relative overflow-hidden group">
            {/* Ping Indicator */}
            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
            
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-bold text-white">{session.profiles.full_name}</p>
                <p className="text-[10px] text-muted font-mono">{session.profiles.user_code}</p>
              </div>
              <div className="bg-white/5 p-1.5 rounded-md">
                <Monitor className="w-4 h-4 text-muted" />
              </div>
            </div>

            <div className="bg-[var(--bg-dark)] p-3 rounded-lg border border-white/5">
              <p className="text-[10px] text-muted uppercase tracking-widest mb-1">Current Screen</p>
              <p className="text-xs font-medium text-primary truncate">{session.current_activity || 'Dashboard'}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2">
              <button 
                onClick={() => sendCommand(session.student_id, 'LOCK_SCREEN')}
                className="btn py-2 bg-danger/10 hover:bg-danger/20 text-danger border-danger/20 text-[10px] justify-center gap-1.5"
              >
                <Lock className="w-3 h-3" /> Lock
              </button>
              <button 
                onClick={() => {
                  const url = prompt("Enter URL to push (e.g. /school/dashboard/student/exam):");
                  if (url && isSafeAppPath(url)) sendCommand(session.student_id, 'PUSH_URL', { url });
                }}
                className="btn py-2 bg-primary/10 hover:bg-primary/20 text-primary border-primary/20 text-[10px] justify-center gap-1.5"
              >
                <ExternalLink className="w-3 h-3" /> Push URL
              </button>
            </div>
          </div>
        ))}

        {sessions.length === 0 && !isLoading && (
          <div className="col-span-full py-12 flex flex-col items-center text-center opacity-50">
            <Users className="w-12 h-12 mb-4" />
            <p className="text-sm">No students currently online.</p>
          </div>
        )}
      </div>
    </div>
  );
}
