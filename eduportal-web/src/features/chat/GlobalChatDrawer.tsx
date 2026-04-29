"use client";

import { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  X, 
  Send, 
  Maximize2, 
  Minimize2, 
  Hash,
  Loader2,
  ChevronLeft
} from 'lucide-react';
import { chatService } from '@/services/chat.service';
import { useRealtimeChat } from './useRealtimeChat';
import MessageBubble from './MessageBubble';
import ChatSidebar from './ChatSidebar';
import { createClient } from '@/lib/supabase';

export default function GlobalChatDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [rooms, setRooms] = useState<any[]>([]);
  const [activeRoom, setActiveRoom] = useState<any>(null);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const { messages, setMessages } = useRealtimeChat(activeRoom?.id || null);
  const supabase = createClient();

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);
        const myRooms = await chatService.getMyRooms();
        setRooms(myRooms);
        if (myRooms.length > 0) setActiveRoom(myRooms[0]);
      } catch (err) {
        console.error("Chat Init Error:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || !activeRoom) return;

    const content = inputText.trim();
    setInputText('');
    
    try {
      await chatService.sendMessage(activeRoom.id, content);
      // Realtime will pick up the update and add it to state
    } catch (err) {
      console.error("Send Error:", err);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 bg-primary text-white p-4 rounded-full shadow-[0_0_20px_rgba(var(--primary-rgb),0.5)] hover:scale-110 active:scale-95 transition-all z-50 animate-in zoom-in duration-300"
      >
        <MessageCircle className="w-6 h-6" />
        <div className="absolute top-0 right-0 w-3 h-3 bg-danger border-2 border-primary rounded-full animate-pulse"></div>
      </button>
    );
  }

  return (
    <div className={`fixed bottom-8 right-8 bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] shadow-2xl z-50 flex overflow-hidden transition-all duration-500 ease-out animate-in slide-in-from-bottom-12 ${
      isExpanded ? 'w-[800px] h-[600px]' : 'w-[400px] h-[500px]'
    }`}>
      
      {/* Sidebar (Only visible in expanded mode) */}
      {isExpanded && (
        <div className="w-64 bg-black border-r border-white/5 flex flex-col h-full">
           <div className="p-6 border-b border-white/5">
              <h3 className="font-black text-lg text-white">EduChat</h3>
           </div>
           <div className="flex-1 overflow-y-auto custom-scrollbar">
              <ChatSidebar 
                rooms={rooms} 
                activeRoomId={activeRoom?.id} 
                onSelectRoom={setActiveRoom} 
              />
           </div>
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 flex flex-col h-full relative">
        
        {/* Chat Header */}
        <header className="h-16 px-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02] backdrop-blur-md">
           <div className="flex items-center gap-3">
              {!isExpanded && rooms.length > 1 && (
                <button className="p-1 hover:bg-white/5 rounded-lg text-muted">
                   <ChevronLeft className="w-4 h-4" />
                </button>
              )}
              <div className="flex flex-col">
                 <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-white">{activeRoom?.room_name || 'Select Room'}</span>
                    <div className="w-1.5 h-1.5 bg-success rounded-full"></div>
                 </div>
                 <span className="text-[10px] text-muted font-bold uppercase tracking-widest">{activeRoom?.room_type}</span>
              </div>
           </div>
           <div className="flex items-center gap-1">
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors text-muted hover:text-white"
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors text-muted hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
           </div>
        </header>

        {/* Messages Viewport */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 custom-scrollbar flex flex-col gap-2"
        >
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
               <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-20">
               <Hash className="w-12 h-12 mb-4" />
               <p className="text-sm font-bold">Start the conversation in {activeRoom?.room_name}</p>
            </div>
          ) : (
            messages.map((msg) => (
              <MessageBubble 
                key={msg.id} 
                message={msg} 
                isOwn={msg.sender_id === currentUser?.id} 
              />
            ))
          )}
        </div>

        {/* Input Area */}
        <form 
          onSubmit={handleSend}
          className="p-4 border-t border-white/5 bg-black"
        >
           <div className="relative">
              <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type a message..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-4 pr-12 py-3 text-sm outline-none focus:border-primary transition-all placeholder:text-muted/50"
              />
              <button 
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary text-white rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
              >
                <Send className="w-4 h-4" />
              </button>
           </div>
        </form>

      </div>
    </div>
  );
}
