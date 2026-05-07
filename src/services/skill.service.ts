import { skillRepository } from '@/repositories/skill.repository';

export interface LogInternshipHoursParams {
  studentId: string;
  skillName: string;
  hours: number;
  description: string;
}

export const skillService = {
  async logInternshipHours(params: LogInternshipHoursParams) {
    if (!params.studentId || !params.skillName || params.hours <= 0) {
      throw new Error("Invalid parameters for internship hours.");
    }
    return await skillRepository.insertSkillLog({
      student_id: params.studentId,
      incident_type: 'skill_internship',
      severity: 'low',
      description: `Vocational Training: ${params.skillName} - ${params.hours} hours. ${params.description}`,
      metadata: {
        skill: params.skillName,
        hours: params.hours
      }
    });
  },

  async getSkillMetrics(studentId: string) {
    if (!studentId) throw new Error("Student ID is required.");
    return await skillRepository.getSkillMetrics(studentId);
  }
};
