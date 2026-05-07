import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { skillService } from '../skill.service';
import { skillRepository } from '../../repositories/skill.repository';

describe('SkillService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('logInternshipHours', () => {
    it('should correctly log internship hours', async () => {
      const mockResult = { id: 'log-1' };
      const mockInsertSkillLog = jest.spyOn(skillRepository, 'insertSkillLog').mockResolvedValue(mockResult);

      const params = {
        studentId: 'student-1',
        skillName: 'Plumbing',
        hours: 10,
        description: 'Fixed pipes'
      };

      const result = await skillService.logInternshipHours(params);

      expect(mockInsertSkillLog).toHaveBeenCalledTimes(1);
      expect(mockInsertSkillLog).toHaveBeenCalledWith({
        student_id: 'student-1',
        incident_type: 'skill_internship',
        severity: 'low',
        description: 'Vocational Training: Plumbing - 10 hours. Fixed pipes',
        metadata: {
          skill: 'Plumbing',
          hours: 10
        }
      });
      expect(result).toEqual(mockResult);
      mockInsertSkillLog.mockRestore();
    });

    it('should throw an error if parameters are invalid', async () => {
      await expect(skillService.logInternshipHours({
        studentId: '',
        skillName: 'Welding',
        hours: 5,
        description: 'test'
      })).rejects.toThrow("Invalid parameters for internship hours.");
    });
  });

  describe('getSkillMetrics', () => {
    it('should return metrics for a student', async () => {
      const mockMetrics = [{ id: 'metric-1' }];
      const mockGetSkillMetrics = jest.spyOn(skillRepository, 'getSkillMetrics').mockResolvedValue(mockMetrics);

      const result = await skillService.getSkillMetrics('student-1');

      expect(mockGetSkillMetrics).toHaveBeenCalledWith('student-1');
      expect(result).toEqual(mockMetrics);
      mockGetSkillMetrics.mockRestore();
    });

    it('should throw error if studentId is missing', async () => {
      await expect(skillService.getSkillMetrics('')).rejects.toThrow("Student ID is required.");
    });
  });
});
