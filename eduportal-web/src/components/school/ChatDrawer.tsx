"use client";

import { MessageSquare, X, Send, Loader2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase';

interface Message {
  id: string;
  sender_id: string;
  message_text: string;
  created_at: string;
  profiles?: {
    full_name: string;
    user_code: string;
  };
}

interface ChatDrawerProps {
  title: string;
  roomId?: string; // Room ID will be passed once DB is connected
}

export default function ChatDrawer({ title, roomId }: ChatDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();
  const scrollRef = useRef<HTMLDivElement>(null);

  const toggleChat = () => setIsOpen(!isOpen);

  // Load Messages & Subscribe to Realtime
  useEffect(() => {
    if (!isOpen || !roomId || !supabase) return;

    const fetchMessages = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*, profiles(full_name, user_code)')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });
      
      if (data) setMessages(data);
      setIsLoading(false);
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`room-${roomId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'chat_messages',
        filter: `room_id=eq.${roomId}`
      }, (payload: any) => {
        const newMessage = payload.new as Message;
        setMessages((prev) => [...prev, newMessage]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOpen, roomId]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !roomId || !supabase) return;

    const { error } = await supabase
      .from('chat_messages')
      .insert([
        { room_id: roomId, message_text: message }
      ]);

    if (!error) setMessage('');
  };


  return (
    <>
      <button 
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform z-50"
        onClick={toggleChat}
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      <div 
        className="fixed top-0 bottom-0 w-[400px] bg-card border-l border-[var(--border)] shadow-2xl transition-all duration-300 z-[100] flex flex-col"
        style={{ right: isOpen ? '0' : '-400px' }}
      >
        <div className="p-4 border-b border-[var(--border)] flex justify-between items-center bg-[var(--bg-dark)]">
          <h3 className="font-bold flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" /> {title}
          </h3>
          <button className="text-muted hover:text-white" onClick={toggleChat}>
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4" ref={scrollRef}>
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-muted text-sm mt-10">No messages yet. Start the conversation!</div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="flex flex-col gap-1">
                <span className="text-[10px] text-muted font-bold uppercase tracking-wider">
                  {msg.profiles?.full_name || 'User'} ({msg.profiles?.user_code || '...'})
                </span>
                <div className="bg-[var(--bg-dark)] border border-[var(--border)] p-3 rounded-md text-sm">
                  {msg.message_text}
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="p-4 border-t border-[var(--border)]">
          <form onSubmit={sendMessage} className="flex items-center bg-[var(--bg-dark)] border border-[var(--border)] rounded-md px-3 py-2">
            <input 
              type="text" 
              placeholder="Type a message..." 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-transparent border-none text-white outline-none text-sm" 
            />
            <button type="submit" className="text-primary hover:text-primary-hover disabled:opacity-50" disabled={!message.trim()}>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
