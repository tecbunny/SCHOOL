"use client";

import { Hash, Users, Shield, BookOpen, ChevronRight } from 'lucide-react';

export default function ChatSidebar({ rooms, activeRoomId, onSelectRoom }: any) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'classroom': return BookOpen;
      case 'school': return Users;
      case 'departmental': return Shield;
      default: return Hash;
    }
  };

  return (
    <div className="flex flex-col gap-1.5 py-4">
      <div className="px-6 py-2 text-[10px] font-black text-muted uppercase tracking-[0.2em] mb-2 opacity-50">
        Active Channels
      </div>
      {rooms.map((room: any) => {
        const Icon = getIcon(room.room_type);
        const isActive = activeRoomId === room.id;
        
        return (
          <button
            key={room.id}
            onClick={() => onSelectRoom(room)}
            className={`flex items-center gap-4 px-5 py-4 mx-3 rounded-[1.2rem] transition-all relative group overflow-hidden ${
              isActive 
                ? 'bg-primary/10 text-white shadow-[0_4px_20px_rgba(var(--primary-rgb),0.1)]' 
                : 'text-muted hover:bg-white/5 hover:text-white'
            }`}
          >
            {isActive && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
            )}
            
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              isActive ? 'bg-primary text-white scale-110' : 'bg-white/5 text-muted group-hover:bg-white/10'
            }`}>
              <Icon className="w-5 h-5 shrink-0" />
            </div>

            <div className="flex-1 flex flex-col items-start overflow-hidden">
               <span className={`text-[13px] font-bold truncate w-full transition-colors ${
                 isActive ? 'text-white' : 'text-muted group-hover:text-white'
               }`}>
                 {room.room_name}
               </span>
               <span className="text-[9px] opacity-40 uppercase font-black tracking-widest mt-0.5">
                 {room.room_type}
               </span>
            </div>

            {isActive ? (
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            ) : (
              <ChevronRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-muted/30" />
            )}
          </button>
        );
      })}
    </div>
  );
}
