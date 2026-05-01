export type LogSeverity = 'info' | 'warning' | 'error' | 'critical';
export type LogEventType = 'AUTH' | 'HARDWARE' | 'AI_GRADING' | 'PROMOTION' | 'SYSTEM' | 'COMPLIANCE';

type LogClient = {
  from: (table: string) => {
    insert: (value: Record<string, unknown>) => PromiseLike<{ error: unknown }>;
  };
};

async function getLogClient(): Promise<LogClient> {
  if (typeof window === 'undefined') {
    const { createClient } = await import('@/lib/supabase-server');
    return await createClient() as unknown as LogClient;
  }

  const { createClient } = await import('@/lib/supabase');
  return createClient() as unknown as LogClient;
}

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
      const supabase = await getLogClient();
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
