import { loggerRepository } from '@/repositories/logger.repository';

export type LogSeverity = 'info' | 'warning' | 'error' | 'critical';
export type LogEventType = 'AUTH' | 'HARDWARE' | 'AI_GRADING' | 'PROMOTION' | 'SYSTEM' | 'COMPLIANCE';

export interface LogParams {
  eventType: LogEventType;
  severity: LogSeverity;
  message: string;
  tenantId?: string;
  userId?: string;
  metadata?: any;
}

export const loggerService = {
  async log(params: LogParams): Promise<void> {
    try {
      await loggerRepository.insertLog({
        event_type: params.eventType,
        severity: params.severity,
        message: params.message,
        tenant_id: params.tenantId,
        user_id: params.userId,
        metadata: params.metadata,
        created_at: new Date().toISOString()
      });
    } catch (err) {
      console.error("Logger exception:", err);
    }
  }
};

// Export original object to not break existing imports
export const logger = loggerService;
