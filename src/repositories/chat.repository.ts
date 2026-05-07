import { createClient } from '@/lib/supabase';
import { DatabaseError, UnauthorizedError } from '@/lib/errors';

export interface ChatRoom {
  id: string;
  room_name: string;
  room_type: string;
  school_id: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  message_text: string;
  created_at: string;
}

export interface ChatMessageWithProfile extends ChatMessage {
  profiles: {
    full_name?: string;
    role?: string;
    user_code?: string;
  } | null;
}

const supabase = createClient();

export class ChatRepository {
  async getMyRooms(): Promise<ChatRoom[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('chat_participants')
      .select(`
        room_id,
        chat_rooms (
          id,
          room_name,
          room_type,
          school_id,
          created_at
        )
      `)
      .eq('profile_id', user.id);

    if (error) {
      throw new DatabaseError(`Failed to fetch chat rooms: ${error.message}`);
    }

    return (data || [])
      .map((d: any) => d.chat_rooms as ChatRoom)
      .filter(Boolean);
  }

  async getMessagesByRoomId(roomId: string, limit = 50): Promise<ChatMessageWithProfile[]> {
    const { data, error } = await supabase
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
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) {
      throw new DatabaseError(`Failed to fetch messages: ${error.message}`);
    }

    return (data || []) as ChatMessageWithProfile[];
  }

  async sendMessage(roomId: string, content: string): Promise<ChatMessage> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new UnauthorizedError("Not authenticated");
    }

    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        room_id: roomId,
        sender_id: user.id,
        message_text: content
      })
      .select()
      .single();

    if (error) {
      throw new DatabaseError(`Failed to insert message: ${error.message}`);
    }

    return data as ChatMessage;
  }
}

export const chatRepository = new ChatRepository();
