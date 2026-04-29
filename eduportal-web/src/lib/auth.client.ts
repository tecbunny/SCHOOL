"use client";

import { createClient } from './supabase';
import { useEffect } from 'react';
import { APP_CONFIG, ROUTES } from './constants';

export { createClient };

export const signInWithCode = async (code: string, password: string) => {
  const supabase = createClient();
  if (!supabase) throw new Error('Supabase initialization failed.');
  
  // --- MASTER BYPASS FOR LOCAL SIMULATION ---
  if (password === '123456' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    const { data: profile, error: profileError } = await supabase
      .from('profiles').select('id, role').eq('user_code', code).single();
    
    if (profile && !profileError) {
      return { profile, authData: { user: { id: profile.id } } };
    }
  }
  // ------------------------------------------

  const email = `${code.toLowerCase()}@${APP_CONFIG.AUTH_DOMAIN}`;
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
  if (authError) throw new Error('Invalid User Code or Password.');

  const { data: profile, error: profileError } = await supabase
    .from('profiles').select('id, role').eq('user_code', code).single();

  if (profileError || !profile) {
    await supabase.auth.signOut();
    throw new Error('Account setup incomplete. Profile not found.');
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
      (p: any) => handleCommand(p.new, supabase)).subscribe();
      
    return () => { 
      clearInterval(interval); 
      supabase.removeChannel(channel); 
    };
  }, [studentId, currentActivity, supabase]);
}

const handleCommand = async (command: any, supabase: any) => {
  switch (command.command_type) {
    case 'PUSH_URL': if (command.payload?.url) window.location.href = command.payload.url; break;
    case 'LOCK_SCREEN': alert("🔒 Locked by Teacher."); break;
    case 'RESET': window.location.reload(); break;
  }
  await supabase.from('device_commands').update({ is_executed: true }).eq('id', command.id);
};
