import { createClient } from '@/lib/supabase';
import { DatabaseError } from '@/lib/errors';

export const skillRepository = {
  async insertSkillLog(data: any): Promise<any> {
    const supabase = createClient();
    const { data: result, error } = await supabase
      .from('behavioral_logs')
      .insert(data)
      .select()
      .single();

    if (error) {
      throw new DatabaseError(`Failed to insert skill log: ${error.message}`);
    }
    return result;
  },

  async getSkillMetrics(studentId: string): Promise<any[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('behavioral_logs')
      .select('*')
      .eq('student_id', studentId)
      .eq('incident_type', 'skill_internship');

    if (error) {
      throw new DatabaseError(`Failed to get skill metrics: ${error.message}`);
    }
    return data || [];
  }
};
