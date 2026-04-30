"use client";

import { createClient } from './supabase';
import { useEffect } from 'react';
import { APP_CONFIG, ROUTES, type UserRole } from './constants';

export { createClient };

type SignInOptions = {
  allowedRoles?: UserRole[];
  schoolCode?: string;
};

const normalizeCode = (code: string) => code.trim().toUpperCase();

export const signInWithCode = async (code: string, password: string, options: SignInOptions = {}) => {
  const supabase = createClient();
  if (!supabase) throw new Error('Supabase initialization failed.');

  const normalizedCode = normalizeCode(code);
  const email = `${normalizedCode.toLowerCase()}@${APP_CONFIG.AUTH_DOMAIN}`;
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
  if (authError) throw new Error('Invalid User Code or Password.');

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, role, school_id, schools(school_code)')
    .eq('id', authData.user.id)
    .eq('user_code', normalizedCode)
    .single();

  if (profileError || !profile) {
    await supabase.auth.signOut();
    throw new Error('Account setup incomplete. Profile not found.');
  }

  if (options.allowedRoles && !options.allowedRoles.includes(profile.role as UserRole)) {
    await supabase.auth.signOut();
    throw new Error('Access denied for this login portal.');
  }

  const schoolCode = options.schoolCode?.trim().toUpperCase();
  const profileSchool = Array.isArray(profile.schools) ? profile.schools[0] : profile.schools;
  if (schoolCode && profile.role !== 'admin' && profileSchool?.school_code !== schoolCode) {
    await supabase.auth.signOut();
    throw new Error('This account does not belong to the selected school.');
  }

  return { profile, authData };
};


export const signOut = async () => {
  const supabase = createClient();
  if (supabase) await supabase.auth.signOut();
  if (typeof window !== 'undefined') {
    localStorage.clear();
    sessionStorage.clear();
    document.cookie.split(";").forEach(c => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    window.location.href = ROUTES.LOGIN;
  }
};

// --- HOOKS ---
export function useDeviceMonitoring(studentId: string, currentActivity: string) {
  const supabase = createClient();
  
  useEffect(() => {
    if (!studentId || !supabase) return;
    
    const ping = async () => {
      await supabase.from('student_sessions').upsert({ 
        student_id: studentId, current_activity: currentActivity, last_ping: new Date().toISOString(), status: 'active'
      });
    };
    
    const interval = setInterval(ping, 30000);
    ping(); // initial ping
    
    const channel = supabase.channel(`device_commands_${studentId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'device_commands', filter: `target_student_id=eq.${studentId}` }, 
      (p: { new: DeviceCommand }) => handleCommand(p.new, supabase)).subscribe();
      
    return () => { 
      clearInterval(interval); 
      supabase.removeChannel(channel); 
    };
  }, [studentId, currentActivity, supabase]);
}

type DeviceCommand = {
  id: string;
  command_type: 'PUSH_URL' | 'LOCK_SCREEN' | 'RESET';
  payload?: { url?: string };
};

type SupabaseCommandClient = {
  from: (table: string) => {
    update: (values: Record<string, unknown>) => {
      eq: (column: string, value: string) => Promise<unknown>;
    };
  };
};

const handleCommand = async (command: DeviceCommand, supabase: SupabaseCommandClient) => {
  switch (command.command_type) {
    case 'PUSH_URL': if (command.payload?.url) window.location.href = command.payload.url; break;
    case 'LOCK_SCREEN': alert("🔒 Locked by Teacher."); break;
    case 'RESET': window.location.reload(); break;
  }
  await supabase.from('device_commands').update({ is_executed: true }).eq('id', command.id);
};
