import { createClient } from "@/lib/supabase";

const supabase = createClient();

export const skillService = {
  async logInternshipHours(params: {
    studentId: string;
    skillName: string;
    hours: number;
    description: string;
  }) {
    const { data, error } = await supabase
      .from('behavioral_logs')
      .insert({
        student_id: params.studentId,
        incident_type: 'skill_internship',
        severity: 'low',
        description: `Vocational Training: ${params.skillName} - ${params.hours} hours. ${params.description}`,
        metadata: {
          skill: params.skillName,
          hours: params.hours
        }
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getSkillMetrics(studentId: string) {
    const { data, error } = await supabase
      .from('behavioral_logs')
      .select('*')
      .eq('student_id', studentId)
      .eq('incident_type', 'skill_internship');

    if (error) throw error;
    return data;
  }
};
