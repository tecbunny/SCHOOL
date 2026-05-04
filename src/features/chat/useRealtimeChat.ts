import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';

export function useRealtimeChat(roomId: string | null) {
  const [messages, setMessages] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    if (!roomId) {
      setMessages([]);
      return;
    }

    // 1. Initial Load
    const fetchHistory = async () => {
      const { data } = await supabase
        .from('chat_messages')
        .select(`
          *,
          profiles (
            full_name,
            role,
            user_code
          )
        `)
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });
      
      if (data) setMessages(data);
    };

    fetchHistory();

    // 2. Realtime Subscription
    const channel = supabase.channel(`chat_${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`
        },
        async (payload: any) => {
          // Fetch the full message with profile data
          const { data } = await supabase
            .from('chat_messages')
            .select(`
              *,
              profiles (
                full_name,
                role,
                user_code
              )
            `)
            .eq('id', payload.new.id)
            .single();

          if (data) {
            setMessages(prev => [...prev, data]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, supabase]);

  return { messages, setMessages };
}
