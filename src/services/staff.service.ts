import { createClient } from "@/lib/supabase";

const supabase = createClient();

export const staffService = {
  // Content Management
  async uploadMaterial(file: File, metadata: { title: string; subject: string; class: string; type: string }) {
    const fileName = `${Date.now()}_${file.name}`;
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from('profiles')
      .select('school_id')
      .eq('id', user?.id)
      .single();

    if (!profile?.school_id) throw new Error('School context not found.');

    const { data, error } = await supabase.storage
      .from('study_materials')
      .upload(fileName, file);

    if (error) throw error;

    const { error: dbError } = await supabase
      .from('materials')
      .insert({
        file_url: data.path,
        file_name: metadata.title,
        subject: metadata.subject,
        material_type: metadata.type,
        school_id: profile.school_id
      });

    if (dbError) throw dbError;
    return data;
  },

  async getSyllabus() {
    const { data, error } = await supabase
      .from('syllabus')
      .select('*')
      .order('class_name', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // School Settings (HOD)
  async getAttendanceMode() {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from('profiles')
      .select('school_id')
      .eq('id', user?.id)
      .single();

    if (!profile?.school_id) return 'morning';

    const { data, error } = await supabase
      .from('schools')
      .select('attendance_mode')
      .eq('id', profile.school_id)
      .single();
    
    if (error) throw error;
    return data?.attendance_mode || 'morning';
  },

  async updateAttendanceMode(mode: 'morning' | 'subject') {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from('profiles')
      .select('school_id')
      .eq('id', user?.id)
      .single();

    if (!profile?.school_id) throw new Error('School context not found.');

    const { error } = await supabase
      .from('schools')
      .update({ attendance_mode: mode })
      .eq('id', profile.school_id);
    
    if (error) throw error;
  },

  // Staff Management
  async getTeachers() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, teacher_details(*)')
      .eq('role', 'teacher');
    
    if (error) throw error;
    return data;
  },

  // Announcements
  async getAnnouncements() {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async postAnnouncement(announcement: { title: string; content: string; priority: string; audience: string }) {
    const { data: profile } = await supabase.from('profiles').select('school_id').single();
    const { data, error } = await supabase
      .from('announcements')
      .insert({ ...announcement, school_id: profile?.school_id })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Phase 7: Biometric Hardware Sync
  async syncBiometricAttendance(logs: { student_id: string; timestamp: string; device_id: string }[]) {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from('profiles')
      .select('school_id')
      .eq('id', user?.id)
      .single();

    if (!profile?.school_id) throw new Error('School context not found.');

    const { data, error } = await supabase
      .from('attendance')
      .upsert(logs.map(log => ({
        student_id: log.student_id,
        date: log.timestamp.split('T')[0],
        status: 'present',
        school_id: profile.school_id
      })));
    
    if (error) throw error;
    return data;
  },

  // Phase 8: AI Grading Bridge
  async getAiGradingSuggestion(worksheetImage: string, rubric: any) {
    const res = await fetch('/api/ai/vision-grade', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-class-station': 'true'
      },
      body: JSON.stringify({ image: worksheetImage, rubric })
    });
    return res.json();
  }
};
