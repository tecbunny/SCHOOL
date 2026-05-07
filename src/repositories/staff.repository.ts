import { createClient } from "@/lib/supabase";
import { DatabaseError, UnauthorizedError, NotFoundError } from "@/lib/errors";
import { 
  Syllabus,
  TeacherProfile,
  Announcement
} from "@/types";

const supabase = createClient();
const MATERIALS_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'school-files';

export class StaffRepository {
  async getUserProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new UnauthorizedError('You must be signed in.');

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('school_id')
      .eq('id', user.id)
      .single();

    if (error || !profile?.school_id) throw new NotFoundError('School context not found.');
    
    return { user, profile };
  }

  async getOptionalUserProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('school_id')
      .eq('id', user.id)
      .single();

    return profile?.school_id ? { user, profile } : null;
  }
  
  async getFirstProfile() {
    const { data } = await supabase.from('profiles').select('school_id').single();
    return data;
  }

  async uploadMaterialFile(fileName: string, file: File, contentType?: string) {
    const { data, error } = await supabase.storage
      .from(MATERIALS_BUCKET)
      .upload(fileName, file, {
        contentType,
        upsert: false
      });

    if (error) throw new DatabaseError(`Storage upload failed: ${error.message}`);
    return data;
  }

  getMaterialPublicUrl(path: string): string {
    const { data } = supabase.storage
      .from(MATERIALS_BUCKET)
      .getPublicUrl(path);
    return data.publicUrl;
  }

  async insertMaterial(materialData: any) {
    const { error } = await supabase
      .from('materials')
      .insert(materialData);

    if (error) throw new DatabaseError(`Database insert failed: ${error.message}`);
  }

  async fetchSyllabus(): Promise<Syllabus[]> {
    const { data, error } = await supabase
      .from('syllabus')
      .select('*')
      .order('class_name', { ascending: true });
    
    if (error) throw new DatabaseError(error.message);
    return data as Syllabus[];
  }

  async getSchoolAttendanceMode(schoolId: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('schools')
      .select('attendance_mode')
      .eq('id', schoolId)
      .single();
    
    if (error) throw new DatabaseError(error.message);
    return data?.attendance_mode || null;
  }

  async updateSchoolAttendanceMode(schoolId: string, mode: 'morning' | 'subject'): Promise<void> {
    const { error } = await supabase
      .from('schools')
      .update({ attendance_mode: mode })
      .eq('id', schoolId);
    
    if (error) throw new DatabaseError(error.message);
  }

  async fetchTeachers(): Promise<TeacherProfile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, teacher_details(*)')
      .eq('role', 'teacher');
    
    if (error) throw new DatabaseError(error.message);
    return data as unknown as TeacherProfile[];
  }

  async fetchAnnouncements(): Promise<Announcement[]> {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw new DatabaseError(error.message);
    return data as Announcement[];
  }

  async insertAnnouncement(announcementData: any): Promise<Announcement> {
    const { data, error } = await supabase
      .from('announcements')
      .insert(announcementData)
      .select()
      .single();
    
    if (error) throw new DatabaseError(error.message);
    return data as Announcement;
  }

  async upsertAttendance(attendanceData: any[]) {
    const { data, error } = await supabase
      .from('attendance')
      .upsert(attendanceData);
    
    if (error) throw new DatabaseError(error.message);
    return data;
  }
}

export const staffRepository = new StaffRepository();
