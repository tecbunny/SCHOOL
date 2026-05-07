import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { promotionService } from '../promotion.service';
import { promotionRepository } from '../../repositories/promotion.repository';
import { UnauthorizedError, DatabaseError } from '../../lib/errors';

// jest.mock('../../repositories/promotion.repository');

describe('PromotionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPromotionStatus', () => {
    it('should return true if promotion is open', async () => {
      jest.spyOn(promotionRepository, 'getPromotionStatus').mockResolvedValue(true);
      const status = await promotionService.getPromotionStatus();
      expect(status).toBe(true);
      expect(promotionRepository.getPromotionStatus).toHaveBeenCalled();
    });

    it('should throw DatabaseError if repository throws', async () => {
      const error = new DatabaseError('DB Error', 'DB_ERROR');
      jest.spyOn(promotionRepository, 'getPromotionStatus').mockRejectedValue(error);
      
      await expect(promotionService.getPromotionStatus()).rejects.toThrow(DatabaseError);
    });
  });

  describe('getClasses', () => {
    it('should aggregate class data correctly', async () => {
      const mockData = [
        { class_id: 'C1', current_grade: '9' },
        { class_id: 'C1', current_grade: '9' },
        { class_id: 'C2', current_grade: '10' }
      ];
      
      jest.spyOn(promotionRepository, 'getClassesData').mockResolvedValue(mockData);

      const result = await promotionService.getClasses();
      expect(result).toEqual([
        { id: 'C1', name: 'Class C1', grade: '9', students: 2 },
        { id: 'C2', name: 'Class C2', grade: '10', students: 1 }
      ]);
    });
  });

  describe('promoteClass', () => {
    it('should throw UnauthorizedError if not authenticated', async () => {
      jest.spyOn(promotionRepository, 'getCurrentUser').mockResolvedValue(null);
      await expect(promotionService.promoteClass('C1', '10')).rejects.toThrow(UnauthorizedError);
    });

    it('should promote students and log history successfully', async () => {
      jest.spyOn(promotionRepository, 'getCurrentUser').mockResolvedValue({ id: 'user123' });
      jest.spyOn(promotionRepository, 'getStudentsByClass').mockResolvedValue([
        { id: 's1', full_name: 'Student 1', current_grade: '9' },
        { id: 's2', full_name: 'Student 2', current_grade: '9' }
      ]);
      jest.spyOn(promotionRepository, 'executeBatchPromotion').mockResolvedValue(undefined);
      jest.spyOn(promotionRepository, 'logPromotionHistory').mockResolvedValue(undefined);

      const result = await promotionService.promoteClass('C1', '10');

      expect(result).toEqual({ success: true, count: 2 });
      expect(promotionRepository.executeBatchPromotion).toHaveBeenCalledWith('C1', '10', expect.any(String));
      expect(promotionRepository.logPromotionHistory).toHaveBeenCalledWith('C1', 'user123', 2, '9', '10');
    });

    it('should return 0 count if no students found', async () => {
      jest.spyOn(promotionRepository, 'getCurrentUser').mockResolvedValue({ id: 'user123' });
      jest.spyOn(promotionRepository, 'getStudentsByClass').mockResolvedValue([]);

      const result = await promotionService.promoteClass('C1', '10');

      expect(result).toEqual({ success: true, count: 0 });
      expect(promotionRepository.executeBatchPromotion).not.toHaveBeenCalled();
    });
  });
});
