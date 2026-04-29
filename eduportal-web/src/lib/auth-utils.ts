import { createClient } from './supabase';

export type UserRole = 'admin' | 'auditor' | 'principal' | 'teacher' | 'moderator' | 'student';

export const navigateByRole = (role: UserRole) => {
  switch (role) {
    case 'admin': return '/admin/dashboard';
    case 'auditor': return '/auditor/dashboard';
    case 'principal': return '/school/dashboard/hod';
    case 'teacher': return '/school/dashboard/teacher';
    case 'moderator': return '/school/dashboard/moderator';
    case 'student': return '/school/dashboard/student';
    default: return '/';
  }
};

export const signInWithCode = async (code: string, password: string) => {
  const supabase = createClient();
  
  if (!supabase) {
    throw new Error('Supabase client failed to initialize. Please check your environment variables.');
  }
  
  // 1. In a production app, we would derive the email or use a custom auth provider.
  // For this prototype, we'll look up the profile first.
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('user_code', code)
    .single();

  if (profileError || !profile) {
    throw new Error('Invalid User Code. Please check your credentials.');
  }

  // 2. Sign in with Supabase Auth
  // We assume the email is formatted as code@eduportal.local for the prototype
  const email = `${code.toLowerCase()}@eduportal.local`;
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) throw authError;
 
  return { profile, authData };
};

export const signOut = async () => {
  const supabase = createClient();
  if (supabase) await supabase.auth.signOut();
  
  // Clear all local data for a clean slate (EduOS requirement)
  if (typeof window !== 'undefined') {
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear cookies by setting expiry to past
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    }
    
    window.location.href = '/school';
  }
};
