"use client";

import { Hash, Users, Shield, BookOpen } from 'lucide-react';

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
    <div className="flex flex-col gap-1 py-2">
      <div className="px-4 py-2 text-[10px] font-bold text-muted uppercase tracking-widest">
        Active Channels
      </div>
      {rooms.map((room: any) => {
        const Icon = getIcon(room.room_type);
        return (
          <button
            key={room.id}
            onClick={() => onSelectRoom(room)}
            className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-xl transition-all active:scale-95 ${
              activeRoomId === room.id 
                ? 'bg-primary/20 text-primary border border-primary/20' 
                : 'text-muted hover:bg-white/5 hover:text-white'
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <div className="flex flex-col items-start overflow-hidden">
               <span className="text-sm font-bold truncate w-full">{room.room_name}</span>
               <span className="text-[10px] opacity-50 uppercase font-bold tracking-tighter">{room.room_type}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
