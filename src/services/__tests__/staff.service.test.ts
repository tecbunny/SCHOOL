import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { staffService } from '../staff.service';
import { staffRepository } from '../../repositories/staff.repository';
import { DatabaseError } from '../../lib/errors';

// Mock the repository
jest.mock('@/repositories/staff.repository', () => ({
  staffRepository: {
    getUserProfile: jest.fn(),
    getOptionalUserProfile: jest.fn(),
    uploadMaterialFile: jest.fn(),
    getMaterialPublicUrl: jest.fn(),
    insertMaterial: jest.fn(),
    fetchSyllabus: jest.fn(),
    getSchoolAttendanceMode: jest.fn(),
    updateSchoolAttendanceMode: jest.fn(),
    fetchTeachers: jest.fn(),
    fetchAnnouncements: jest.fn(),
    insertAnnouncement: jest.fn(),
    getFirstProfile: jest.fn(),
    upsertAttendance: jest.fn(),
  }
}));

describe('staffService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSyllabus', () => {
    it('should return syllabus when successful', async () => {
      const mockSyllabus = [{ id: '1', subject: 'Math', content: 'Algebra', school_id: 'school-1' }];
      (staffRepository.fetchSyllabus as jest.Mock<any>).mockResolvedValue(mockSyllabus);

      const result = await staffService.getSyllabus();

      expect(result).toEqual(mockSyllabus);
      expect(staffRepository.fetchSyllabus).toHaveBeenCalled();
    });

    it('should throw DatabaseError if repository throws DatabaseError', async () => {
      const dbError = new DatabaseError('DB Error');
      (staffRepository.fetchSyllabus as jest.Mock<any>).mockRejectedValue(dbError);

      await expect(staffService.getSyllabus()).rejects.toThrow(DatabaseError);
    });
    
    it('should wrap other errors in DatabaseError', async () => {
      (staffRepository.fetchSyllabus as jest.Mock<any>).mockRejectedValue(new Error('Unknown Error'));

      await expect(staffService.getSyllabus()).rejects.toThrow(DatabaseError);
      await expect(staffService.getSyllabus()).rejects.toThrow(/Unexpected error fetching syllabus/);
    });
  });

  describe('getTeachers', () => {
    it('should return teachers when successful', async () => {
      const mockTeachers = [{ id: '1', user_id: 'u1', school_id: 's1', role: 'teacher' }];
      (staffRepository.fetchTeachers as jest.Mock<any>).mockResolvedValue(mockTeachers);

      const result = await staffService.getTeachers();

      expect(result).toEqual(mockTeachers);
      expect(staffRepository.fetchTeachers).toHaveBeenCalled();
    });

    it('should throw DatabaseError on generic error', async () => {
       (staffRepository.fetchTeachers as jest.Mock<any>).mockRejectedValue(new Error('Connection failed'));
       await expect(staffService.getTeachers()).rejects.toThrow(DatabaseError);
    });
  });
  
  describe('getAttendanceMode', () => {
    it('should return morning if no profile', async () => {
      (staffRepository.getOptionalUserProfile as jest.Mock<any>).mockResolvedValue(null);
      
      const result = await staffService.getAttendanceMode();
      expect(result).toBe('morning');
    });

    it('should return mode from repository', async () => {
      (staffRepository.getOptionalUserProfile as jest.Mock<any>).mockResolvedValue({ profile: { school_id: 's1' } });
      (staffRepository.getSchoolAttendanceMode as jest.Mock<any>).mockResolvedValue('subject');
      
      const result = await staffService.getAttendanceMode();
      expect(result).toBe('subject');
      expect(staffRepository.getSchoolAttendanceMode).toHaveBeenCalledWith('s1');
    });
  });
});
