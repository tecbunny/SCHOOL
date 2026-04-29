import { useEffect } from 'react';
import { createClient } from '@/lib/supabase';

export function useDeviceMonitoring(studentId: string, currentActivity: string) {
  const supabase = createClient();

  useEffect(() => {
    if (!studentId) return;

    // 1. Heartbeat Interval
    const ping = async () => {
      await supabase
        .from('student_sessions')
        .upsert({ 
          student_id: studentId, 
          current_activity: currentActivity,
          last_ping: new Date().toISOString(),
          status: 'active'
        });
    };

    const interval = setInterval(ping, 30000); // Ping every 30s
    ping();

    // 2. Listen for Remote Commands
    const channel = supabase
      .channel(`device_commands_${studentId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'device_commands',
        filter: `target_student_id=eq.${studentId}` 
      }, (payload: any) => {
        handleCommand(payload.new);
      })
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [studentId, currentActivity]);

  const handleCommand = (command: any) => {

    
    switch (command.command_type) {
      case 'PUSH_URL':
        if (command.payload?.url) {
          window.location.href = command.payload.url;
        }
        break;
      case 'LOCK_SCREEN':
        // Implement a full-screen overlay that prevents interaction
        alert("🔒 This device has been remotely locked by your teacher.");
        break;
      case 'SHOW_HINT':
        if (command.payload?.text) {
          // You could use a toast or a modal here
          alert(`💡 TEACHER HINT: ${command.payload.text}`);
        }
        break;
      case 'RESET':
        window.location.reload();
        break;
    }

    // Mark as executed
    supabase
      .from('device_commands')
      .update({ is_executed: true })
      .eq('id', command.id);
  };
}
