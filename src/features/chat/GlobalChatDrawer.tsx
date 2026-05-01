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
  ChevronLeft,
  Sparkles
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
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || !activeRoom) return;

    const content = inputText.trim();
    setInputText('');
    
    try {
      await chatService.sendMessage(activeRoom.id, content);
    } catch (err) {
      console.error("Send Error:", err);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-primary text-white rounded-full shadow-[0_8px_32px_rgba(var(--primary-rgb),0.4)] hover:scale-110 active:scale-95 transition-all z-50 flex items-center justify-center group overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-primary via-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
        <MessageCircle className="w-7 h-7 relative z-10 group-hover:rotate-12 transition-transform" />
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-danger border-4 border-white dark:border-bg-dark rounded-full animate-pulse shadow-lg"></div>
      </button>
    );
  }

  return (
    <div className={`fixed bottom-8 right-8 bg-card-premium border border-white/10 rounded-[2.5rem] shadow-premium z-50 flex overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] backdrop-blur-xl animate-in slide-in-from-bottom-12 ${
      isExpanded ? 'w-[850px] h-[650px]' : 'w-[420px] h-[550px]'
    }`}>
      
      {/* Sidebar */}
      {isExpanded && (
        <div className="w-72 bg-bg-soft/40 border-r border-white/5 flex flex-col h-full backdrop-blur-md">
           <div className="p-8 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/20">
                    <Sparkles className="w-5 h-5 text-primary" />
                 </div>
                 <h3 className="font-black text-xl text-white tracking-tight">EduChat</h3>
              </div>
           </div>
           <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
              <ChatSidebar 
                rooms={rooms} 
                activeRoomId={activeRoom?.id} 
                onSelectRoom={setActiveRoom} 
              />
           </div>
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 flex flex-col h-full relative bg-gradient-to-br from-white/[0.02] to-transparent">
        
        {/* Chat Header */}
        <header className="h-20 px-8 border-b border-white/5 flex items-center justify-between bg-white/[0.03] backdrop-blur-xl">
           <div className="flex items-center gap-4">
              {!isExpanded && rooms.length > 1 && (
                <button 
                  className="p-2.5 hover:bg-white/5 rounded-xl text-muted transition-all active:scale-90"
                  onClick={() => setIsExpanded(true)}
                >
                   <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              <div className="flex flex-col">
                 <div className="flex items-center gap-2.5">
                    <span className="text-base font-black text-white tracking-tight">{activeRoom?.room_name || 'Select Room'}</span>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                    </span>
                 </div>
                 <span className="text-[10px] text-primary font-black uppercase tracking-[0.2em]">{activeRoom?.room_type}</span>
              </div>
           </div>
           <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-3 hover:bg-white/10 rounded-2xl transition-all text-muted hover:text-white group"
                title={isExpanded ? "Collapse" : "Expand"}
              >
                {isExpanded ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5 group-hover:scale-110 transition-transform" />}
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-3 hover:bg-danger/20 hover:text-danger rounded-2xl transition-all text-muted"
              >
                <X className="w-5 h-5" />
              </button>
           </div>
        </header>

        {/* Messages Viewport */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-8 custom-scrollbar flex flex-col gap-4 bg-transparent"
        >
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
               <div className="relative">
                  <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                  <Loader2 className="w-6 h-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary animate-pulse" />
               </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
               <div className="w-20 h-20 rounded-[2rem] bg-white/5 flex items-center justify-center mb-6 animate-bounce duration-[3000ms]">
                  <Hash className="w-10 h-10 text-muted/30" />
               </div>
               <h4 className="text-white font-bold mb-2">Welcome to {activeRoom?.room_name}</h4>
               <p className="text-sm text-muted max-w-[200px]">Start the conversation and connect with your team.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {messages.map((msg, idx) => (
                <MessageBubble 
                  key={msg.id} 
                  message={msg} 
                  isOwn={msg.sender_id === currentUser?.id}
                  showAvatar={idx === 0 || messages[idx-1].sender_id !== msg.sender_id}
                />
              ))}
            </div>
          )}
        </div>

        {/* Input Area */}
        <form 
          onSubmit={handleSend}
          className="p-6 border-t border-white/5 bg-white/[0.01] backdrop-blur-md"
        >
           <div className="relative group">
              <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your message..."
                className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] pl-6 pr-16 py-4 text-sm outline-none focus:border-primary focus:bg-white/[0.08] focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-muted/50 text-white"
              />
              <button 
                type="submit"
                disabled={!inputText.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-primary text-white rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 flex items-center justify-center disabled:opacity-50 disabled:hover:scale-100 group-focus-within:bg-gradient-to-tr from-primary to-secondary"
              >
                <Send className="w-5 h-5" />
              </button>
           </div>
        </form>

      </div>
    </div>
  );
}
