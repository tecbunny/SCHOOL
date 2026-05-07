import { Database } from './supabase';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Material = Database['public']['Tables']['materials']['Row'];
export type Syllabus = Database['public']['Tables']['syllabus']['Row'];
export type School = Database['public']['Tables']['schools']['Row'];
export type Announcement = Database['public']['Tables']['announcements']['Row'];
export type Attendance = Database['public']['Tables']['attendance']['Row'];

export interface UploadMaterialMetadata {
  title: string;
  subject: string;
  class: string;
  type: string;
}

export interface PostAnnouncementDto {
  title: string;
  content: string;
  priority: string;
  audience: string;
}

export interface BiometricLogDto {
  student_id: string;
  timestamp: string;
  device_id: string;
}

export interface RubricDto {
  criteria: string[];
  maxScore: number;
}

export interface TeacherProfile extends Profile {
  teacher_details: any[]; // Assuming teacher_details table exists, leaving any for now or extending later
}

export interface TimetableSlot {
  id?: string;
  teacher_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  room?: string;
  school_id?: string;
  class_id?: string;
  subject?: string;
  created_at?: string;
  updated_at?: string;
}
