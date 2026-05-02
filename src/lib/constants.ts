import { JwtPayload } from "jsonwebtoken";

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
  ALUMNI: '/school/dashboard/alumni',
  LOGIN: '/school',
};

// --- TYPES ---
export type UserRole = 'admin' | 'auditor' | 'principal' | 'teacher' | 'moderator' | 'student' | 'alumni';

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  is_teaching_staff: boolean;
  school_id: string;
  global_student_id?: string | null;
}

export interface GateJwtPayload extends JwtPayload {
  sub: string;
}

export const navigateByRole = (role: UserRole) => {
  switch (role) {
    case 'admin': return ROUTES.ADMIN;
    case 'auditor': return ROUTES.AUDITOR;
    case 'principal': return ROUTES.PRINCIPAL;
    case 'teacher': return ROUTES.TEACHER;
    case 'moderator': return ROUTES.MODERATOR;
    case 'student': return ROUTES.STUDENT;
    case 'alumni': return ROUTES.ALUMNI;
    default: return ROUTES.LOGIN;
  }
};
