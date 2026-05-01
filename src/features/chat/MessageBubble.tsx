"use client";

import { User } from 'lucide-react';

export default function MessageBubble({ message, isOwn, showAvatar = true }: { message: any; isOwn: boolean; showAvatar?: boolean }) {
  const profile = message.profiles;
  const role = profile?.role || 'user';
  
  const getRoleColor = (r: string) => {
    switch (r) {
      case 'admin': return 'text-primary bg-primary/10 border-primary/20';
      case 'principal': return 'text-secondary bg-secondary/10 border-secondary/20';
      case 'auditor': return 'text-success bg-success/10 border-success/20';
      case 'teacher': return 'text-warning bg-warning/10 border-warning/20';
      default: return 'text-muted bg-white/5 border-white/10';
    }
  };

  return (
    <div className={`flex flex-col gap-1.5 mb-6 group ${isOwn ? 'items-end' : 'items-start animate-in slide-in-from-left-4 fade-in duration-500'}`}>
      {!isOwn && showAvatar && (
        <div className="flex items-center gap-3 px-2 mb-1">
          <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shadow-inner">
             {profile?.avatar_url ? (
               <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
             ) : (
               <User className="w-4 h-4 text-muted/50" />
             )}
          </div>
          <div className="flex flex-col">
            <span className="text-[12px] font-bold text-white/90 leading-none">{profile?.full_name}</span>
            <span className={`text-[8px] font-black uppercase tracking-widest mt-1 px-1.5 py-0.5 rounded-md border self-start ${getRoleColor(role)}`}>
              {role}
            </span>
          </div>
        </div>
      )}

      <div className={`relative max-w-[85%] group`}>
        <div className={`px-5 py-3.5 rounded-[1.5rem] text-[14px] leading-relaxed transition-all duration-300 ${
          isOwn 
            ? 'bg-gradient-to-tr from-primary to-secondary text-white rounded-tr-[0.5rem] shadow-[0_8px_20px_rgba(var(--primary-rgb),0.2)] hover:shadow-[0_12px_24px_rgba(var(--primary-rgb),0.3)]' 
            : 'bg-white/5 text-white/90 rounded-tl-[0.5rem] border border-white/10 backdrop-blur-sm hover:bg-white/8 hover:border-white/20'
        }`}>
          {message.message_text}
        </div>
        
        <div className={`mt-2 flex items-center gap-2 px-2 transition-opacity duration-300 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          <span className="text-[10px] text-muted/40 font-medium">
            {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {isOwn && (
            <div className="flex gap-0.5">
               <div className="w-1 h-1 rounded-full bg-primary/40" />
               <div className="w-1 h-1 rounded-full bg-primary" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
