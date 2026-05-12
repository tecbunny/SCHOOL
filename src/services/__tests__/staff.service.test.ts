import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { staffService } from '../staff.service';
import { staffRepository } from '../../repositories/staff.repository';
import { DatabaseError } from '../../lib/errors';

describe('staffService', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  describe('getSyllabus', () => {
    it('should return syllabus when successful', async () => {
      const mockSyllabus = [{ id: '1', subject: 'Math', content: 'Algebra', school_id: 'school-1' }];
      jest.spyOn(staffRepository, 'fetchSyllabus').mockResolvedValue(mockSyllabus as any);

      const result = await staffService.getSyllabus();

      expect(result).toEqual(mockSyllabus);
      expect(staffRepository.fetchSyllabus).toHaveBeenCalled();
    });

    it('should throw DatabaseError if repository throws DatabaseError', async () => {
      const dbError = new DatabaseError('DB Error');
      jest.spyOn(staffRepository, 'fetchSyllabus').mockRejectedValue(dbError);

      await expect(staffService.getSyllabus()).rejects.toThrow(DatabaseError);
    });
    
    it('should wrap other errors in DatabaseError', async () => {
      jest.spyOn(staffRepository, 'fetchSyllabus').mockRejectedValue(new Error('Unknown Error'));

      await expect(staffService.getSyllabus()).rejects.toThrow(DatabaseError);
      await expect(staffService.getSyllabus()).rejects.toThrow(/Unexpected error fetching syllabus/);
    });
  });

  describe('getTeachers', () => {
    it('should return teachers when successful', async () => {
      const mockTeachers = [{ id: '1', user_id: 'u1', school_id: 's1', role: 'teacher' }];
      jest.spyOn(staffRepository, 'fetchTeachers').mockResolvedValue(mockTeachers as any);

      const result = await staffService.getTeachers();

      expect(result).toEqual(mockTeachers);
      expect(staffRepository.fetchTeachers).toHaveBeenCalled();
    });

    it('should throw DatabaseError on generic error', async () => {
       jest.spyOn(staffRepository, 'fetchTeachers').mockRejectedValue(new Error('Connection failed'));
       await expect(staffService.getTeachers()).rejects.toThrow(DatabaseError);
    });
  });
  
  describe('getAttendanceMode', () => {
    it('should return morning if no profile', async () => {
      jest.spyOn(staffRepository, 'getOptionalUserProfile').mockResolvedValue(null);
      
      const result = await staffService.getAttendanceMode();
      expect(result).toBe('morning');
    });

    it('should return mode from repository', async () => {
      jest.spyOn(staffRepository, 'getOptionalUserProfile').mockResolvedValue({ profile: { school_id: 's1' } } as any);
      jest.spyOn(staffRepository, 'getSchoolAttendanceMode').mockResolvedValue('subject');
      
      const result = await staffService.getAttendanceMode();
      expect(result).toBe('subject');
      expect(staffRepository.getSchoolAttendanceMode).toHaveBeenCalledWith('s1');
    });
  });
});
