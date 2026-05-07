import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { timetableService } from '../timetable.service';
import { TimetableRepository } from '../../repositories/timetable.repository';
import { ValidationError } from '../../lib/errors';
import { TimetableSlot } from '../../types';

jest.mock('../../repositories/timetable.repository');

describe('TimetableService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkConflicts', () => {
    it('should return no conflict when repository returns empty arrays', async () => {
      jest.spyOn(TimetableRepository.prototype, 'findTeacherConflicts').mockResolvedValue([]);
      jest.spyOn(TimetableRepository.prototype, 'findRoomConflicts').mockResolvedValue([]);

      const result = await timetableService.checkConflicts({
        teacherId: 'teacher1',
        dayOfWeek: 'Monday',
        startTime: '09:00',
        endTime: '10:00',
        room: 'Room A'
      });

      expect(result).toEqual({ conflict: false });
    });

    it('should return teacher conflict when teacher has overlapping schedule', async () => {
      const mockSlot: TimetableSlot = {
        teacher_id: 'teacher1',
        day_of_week: 'Monday',
        start_time: '09:00',
        end_time: '10:00',
        room: 'Room A'
      };
      jest.spyOn(TimetableRepository.prototype, 'findTeacherConflicts').mockResolvedValue([mockSlot]);
      
      const result = await timetableService.checkConflicts({
        teacherId: 'teacher1',
        dayOfWeek: 'Monday',
        startTime: '09:00',
        endTime: '10:00'
      });

      expect(result.conflict).toBe(true);
      expect(result.type).toBe('teacher');
    });

    it('should return room conflict when room is occupied', async () => {
      const mockSlot: TimetableSlot = {
        teacher_id: 'teacher2',
        day_of_week: 'Monday',
        start_time: '09:00',
        end_time: '10:00',
        room: 'Room A'
      };
      jest.spyOn(TimetableRepository.prototype, 'findTeacherConflicts').mockResolvedValue([]);
      jest.spyOn(TimetableRepository.prototype, 'findRoomConflicts').mockResolvedValue([mockSlot]);

      const result = await timetableService.checkConflicts({
        teacherId: 'teacher1',
        dayOfWeek: 'Monday',
        startTime: '09:00',
        endTime: '10:00',
        room: 'Room A'
      });

      expect(result.conflict).toBe(true);
      expect(result.type).toBe('room');
    });
  });

  describe('addSchedule', () => {
    it('should throw ValidationError if conflict exists', async () => {
      const mockSlot: TimetableSlot = {
        teacher_id: 'teacher1',
        day_of_week: 'Monday',
        start_time: '09:00',
        end_time: '10:00',
        room: 'Room A'
      };
      jest.spyOn(TimetableRepository.prototype, 'findTeacherConflicts').mockResolvedValue([mockSlot]);

      await expect(timetableService.addSchedule(mockSlot)).rejects.toThrow(ValidationError);
    });

    it('should create schedule when no conflict exists', async () => {
      const mockSlot: TimetableSlot = {
        teacher_id: 'teacher1',
        day_of_week: 'Monday',
        start_time: '09:00',
        end_time: '10:00',
        room: 'Room A'
      };
      
      jest.spyOn(TimetableRepository.prototype, 'findTeacherConflicts').mockResolvedValue([]);
      jest.spyOn(TimetableRepository.prototype, 'findRoomConflicts').mockResolvedValue([]);
      jest.spyOn(TimetableRepository.prototype, 'createSchedule').mockResolvedValue({ ...mockSlot, id: '1' });

      const result = await timetableService.addSchedule(mockSlot);

      expect(result).toHaveProperty('id', '1');
      expect(TimetableRepository.prototype.createSchedule).toHaveBeenCalledWith(mockSlot);
    });
  });
});
