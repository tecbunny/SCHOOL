import { createClient } from './supabase';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/request';
import { JwtPayload } from "jsonwebtoken";
import { useEffect } from 'react';

// --- CONSTANTS ---
export const APP_CONFIG = {
  NAME: 'EduPortal',
  VERSION: '1.0.0-SSPH01',
  AUTH_DOMAIN: 'auth.ssph01.eduportal.internal',
};

export const ROUTES = {
  ADMIN: '/admin/dashboard',
  AUDITOR: '/auditor/dashboard',
  PRINCIPAL: '/school/dashboard/hod',
  TEACHER: '/school/dashboard/teacher',
  MODERATOR: '/school/dashboard/moderator',
  STUDENT: '/school/dashboard/student',
  LOGIN: '/school',
};

export const HARDWARE_DEFAULTS = {
  TARGET_RAM: '512MB',
  OS_VERSION: 'EduOS v1.0',
  CHIP: 'Rockchip RV1106',
};

// --- TYPES ---
export type UserRole = 'admin' | 'auditor' | 'principal' | 'teacher' | 'moderator' | 'student';

export interface GateJwtPayload extends JwtPayload {
  sub: string;
}

export interface StudentSession {
  id: string;
  student_id: string;
  status: 'online' | 'offline' | 'away';
  last_heartbeat: string;
  current_app: string;
  device_id: string;
}

// --- AUTH LOGIC ---
export const navigateByRole = (role: UserRole) => {
  switch (role) {
    case 'admin': return ROUTES.ADMIN;
    case 'auditor': return ROUTES.AUDITOR;
    case 'principal': return ROUTES.PRINCIPAL;
    case 'teacher': return ROUTES.TEACHER;
    case 'moderator': return ROUTES.MODERATOR;
    case 'student': return ROUTES.STUDENT;
    default: return ROUTES.LOGIN;
  }
};

export const signInWithCode = async (code: string, password: string) => {
  const supabase = createClient();
  if (!supabase) throw new Error('Supabase initialization failed.');
  
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
    if (!studentId) return;
    const ping = async () => {
      await supabase.from('student_sessions').upsert({ 
        student_id: studentId, current_activity: currentActivity, last_ping: new Date().toISOString(), status: 'active'
      });
    };
    const interval = setInterval(ping, 30000);
    ping();
    const channel = supabase.channel(`device_commands_${studentId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'device_commands', filter: `target_student_id=eq.${studentId}` }, 
      (p: any) => handleCommand(p.new, supabase)).subscribe();
    return () => { clearInterval(interval); supabase.removeChannel(channel); };
  }, [studentId, currentActivity]);
}

const handleCommand = async (command: any, supabase: any) => {
  switch (command.command_type) {
    case 'PUSH_URL': if (command.payload?.url) window.location.href = command.payload.url; break;
    case 'LOCK_SCREEN': alert("🔒 Locked by Teacher."); break;
    case 'RESET': window.location.reload(); break;
  }
  await supabase.from('device_commands').update({ is_executed: true }).eq('id', command.id);
};

// --- PROXY (MIDDLEWARE) ---
export async function proxy(request: any) {
  let response = NextResponse.next({ request: { headers: request.headers } });
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) { return request.cookies.get(name)?.value },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({ name, value, ...options });
        response = NextResponse.next({ request: { headers: request.headers } });
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({ name, value: '', ...options });
        response = NextResponse.next({ request: { headers: request.headers } });
        response.cookies.set({ name, value: '', ...options });
      },
    },
  });
  const { data: { user } } = await supabase.auth.getUser();
  if (request.headers.get('x-eduos') === 'true') response.cookies.set('is-eduos', 'true');
  const url = new URL(request.url);
  if (!user && (url.pathname.includes('/dashboard') || url.pathname.startsWith('/admin') || url.pathname.startsWith('/auditor'))) {
    return NextResponse.redirect(new URL(url.pathname.startsWith('/admin') ? '/admin' : (url.pathname.startsWith('/auditor') ? '/auditor' : '/school'), request.url));
  }
  return response;
}
