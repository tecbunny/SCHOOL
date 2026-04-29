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
  
  // 1. Sign in with Supabase Auth FIRST. 
  // This circumvents RLS issues because the user is authenticated before querying the profile.
  const email = `${code.toLowerCase()}@auth.ssph01.eduportal.internal`;
  
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    // Obfuscate the error message slightly so we don't reveal the internal email structure
    throw new Error('Invalid User Code or Password. Please check your credentials.');
  }

  // 2. Now that we have a secure session, fetch the profile data.
  // RLS policies will now correctly allow the user to read their own row.
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('user_code', code)
    .single();

  if (profileError || !profile) {
    // Edge case: User is authenticated but profile is missing
    await supabase.auth.signOut();
    throw new Error('Account setup incomplete. Profile not found.');
  }
 
  return { profile, authData };
};

export const signOut = async () => {
  const supabase = createClient();
  
  // Supabase handles HttpOnly cookie invalidation if set up correctly
  if (supabase) {
    await supabase.auth.signOut();
  }
  
  // Clear all local data for a clean slate (EduOS requirement)
  if (typeof window !== 'undefined') {
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear standard document cookies (replaces deprecated substr with substring)
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
      document.cookie = `${name.trim()}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    }
    
    window.location.href = '/school';
  }
};
