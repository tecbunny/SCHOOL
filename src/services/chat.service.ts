import { createClient } from "@/lib/supabase";

const supabase = createClient();

export const chatService = {
  async getMyRooms() {
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
          school_id
        )
      `)
      .eq('profile_id', user.id);

    if (error) throw error;
    return data.map((d: any) => d.chat_rooms);
  },

  async getMessages(roomId: string, limit = 50) {
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

    if (error) throw error;
    return data;
  },

  async sendMessage(roomId: string, content: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        room_id: roomId,
        sender_id: user.id,
        message_text: content
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
