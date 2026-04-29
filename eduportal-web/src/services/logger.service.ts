import { createClient } from "@/lib/supabase";

const supabase = createClient();

export type LogSeverity = 'info' | 'warning' | 'error' | 'critical';
export type LogEventType = 'AUTH' | 'HARDWARE' | 'AI_GRADING' | 'PROMOTION' | 'SYSTEM' | 'COMPLIANCE';

export const logger = {
  async log(params: {
    eventType: LogEventType;
    severity: LogSeverity;
    message: string;
    tenantId?: string;
    userId?: string;
    metadata?: any;
  }) {
    try {
      const { error } = await supabase
        .from('system_logs')
        .insert({
          event_type: params.eventType,
          severity: params.severity,
          message: params.message,
          tenant_id: params.tenantId,
          user_id: params.userId,
          metadata: params.metadata,
          created_at: new Date().toISOString()
        });

      if (error) console.error("Logging failed:", error);
    } catch (err) {
      console.error("Logger exception:", err);
    }
  }
};
