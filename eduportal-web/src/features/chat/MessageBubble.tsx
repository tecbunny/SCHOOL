"use client";

export default function MessageBubble({ message, isOwn }: { message: any; isOwn: boolean }) {
  const profile = message.profiles;
  const role = profile?.role || 'user';
  
  const getRoleColor = (r: string) => {
    switch (r) {
      case 'admin': return 'text-primary';
      case 'principal': return 'text-secondary';
      case 'auditor': return 'text-success';
      case 'teacher': return 'text-warning';
      default: return 'text-muted';
    }
  };

  return (
    <div className={`flex flex-col gap-1 mb-4 ${isOwn ? 'items-end' : 'items-start'}`}>
      {!isOwn && (
        <div className="flex items-center gap-2 px-1">
          <span className={`text-[10px] font-bold uppercase tracking-tighter ${getRoleColor(role)}`}>
            {role}
          </span>
          <span className="text-[10px] font-bold text-white/50">{profile?.full_name}</span>
        </div>
      )}
      <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
        isOwn 
          ? 'bg-primary text-white rounded-tr-none' 
          : 'bg-white/10 text-white rounded-tl-none border border-white/5'
      }`}>
        {message.message_text}
      </div>
      <span className="text-[9px] text-muted px-1">
        {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>
  );
}
