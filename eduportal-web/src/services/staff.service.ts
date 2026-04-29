import { createClient } from "@/lib/supabase";

const supabase = createClient();

export const staffService = {
  // Content Management
  async uploadMaterial(file: File, metadata: { title: string; subject: string; class: string; type: string }) {
    const fileName = `${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from('study_materials')
      .upload(fileName, file);

    if (error) throw error;

    const { error: dbError } = await supabase
      .from('study_materials')
      .insert({
        file_path: data.path,
        title: metadata.title,
        subject: metadata.subject,
        class_name: metadata.class,
        material_type: metadata.type
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
    const { data, error } = await supabase
      .from('school_profiles')
      .select('attendance_mode')
      .single();
    
    if (error) throw error;
    return data?.attendance_mode || 'morning';
  },

  async updateAttendanceMode(mode: 'morning' | 'subject') {
    const { error } = await supabase
      .from('school_profiles')
      .update({ attendance_mode: mode })
      .eq('id', (await supabase.auth.getUser()).data.user?.id); // Assuming one profile per school user
    
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
    const { data, error } = await supabase
      .from('announcements')
      .insert(announcement)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Phase 7: Biometric Hardware Sync
  async syncBiometricAttendance(logs: { student_id: string; timestamp: string; device_id: string }[]) {
    const { data, error } = await supabase
      .from('attendance')
      .upsert(logs.map(log => ({
        student_id: log.student_id,
        date: log.timestamp.split('T')[0],
        status: 'present',
        school_id: 'pending_context_fetch' // Should be fetched from session
      })));
    
    if (error) throw error;
    return data;
  },

  // Phase 8: AI Grading Bridge
  async getAiGradingSuggestion(worksheetImage: string, rubric: any) {
    // This will call the /api/ai/grade endpoint
    const res = await fetch('/api/ai/grade', {
      method: 'POST',
      body: JSON.stringify({ worksheetImage, rubric })
    });
    return res.json();
  }
};
