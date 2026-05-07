import { createClient as createServerClient } from '@/lib/supabase-server';
import { createClient as createBrowserClient } from '@/lib/supabase';
import { DatabaseError } from '@/lib/errors';

async function getLogClient() {
  if (typeof window === 'undefined') {
    return await createServerClient();
  }
  return createBrowserClient();
}

export const loggerRepository = {
  async insertLog(data: any): Promise<void> {
    try {
      const supabase = await getLogClient();
      const { error } = await supabase.from('system_logs').insert(data);
      if (error) {
        throw new DatabaseError(`Failed to insert log: ${error.message}`);
      }
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError(`Unexpected error during insertLog: ${error}`);
    }
  }
};
