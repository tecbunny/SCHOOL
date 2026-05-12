import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { logger } from '../logger.service';
import { loggerRepository } from '../../repositories/logger.repository';

describe('LoggerService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('log', () => {
    it('should successfully call insertLog on the repository', async () => {
      const mockInsertLog = jest.spyOn(loggerRepository, 'insertLog').mockResolvedValue(undefined);

      await logger.log({
        eventType: 'SYSTEM',
        severity: 'info',
        message: 'System test message',
        tenantId: 'tenant-1',
        userId: 'user-1',
        metadata: { some: 'data' }
      });

      expect(mockInsertLog).toHaveBeenCalledTimes(1);
      expect(mockInsertLog).toHaveBeenCalledWith({
        event_type: 'SYSTEM',
        severity: 'info',
        message: 'System test message',
        tenant_id: 'tenant-1',
        user_id: 'user-1',
        metadata: { some: 'data' },
        created_at: '2024-01-01T00:00:00.000Z'
      });
      
      mockInsertLog.mockRestore();
    });

    it('should catch and suppress errors to prevent crashing', async () => {
      const mockInsertLog = jest.spyOn(loggerRepository, 'insertLog').mockRejectedValue(new Error('DB Error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(logger.log({
        eventType: 'SYSTEM',
        severity: 'info',
        message: 'test'
      })).resolves.not.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith("Logger exception:", expect.any(Error));
      
      consoleSpy.mockRestore();
      mockInsertLog.mockRestore();
    });
  });
});
