"use client";

import { 
  LifeBuoy, 
  MessageSquare, 
  Send, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Plus
} from 'lucide-react';
import { useState } from 'react';

export default function SupportTicketSystem() {
  const [isCreating, setIsCreating] = useState(false);

  const tickets = [
    { id: 'TKT-7878-1', subject: 'Kiosk Sync Error', status: 'resolved', priority: 'high', date: '2 days ago' },
    { id: 'TKT-7878-2', subject: 'Feature Request: Bulk Student Import', status: 'pending', priority: 'medium', date: '5 hours ago' },
  ];

  return (
    <div className="bg-card border border-white/5 rounded-[2.5rem] p-8 flex flex-col gap-6 shadow-2xl">
      
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-2 rounded-xl">
               <LifeBuoy className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-bold text-lg text-white">Platform Support</h3>
         </div>
         <button 
            onClick={() => setIsCreating(true)}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
         >
            <Plus className="w-5 h-5 text-muted" />
         </button>
      </div>

      <div className="flex flex-col gap-3">
         {tickets.map((ticket) => (
            <div key={ticket.id} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-primary/20 transition-all cursor-pointer group">
               <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-mono text-muted">{ticket.id}</span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                     ticket.status === 'resolved' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'
                  }`}>
                     {ticket.status}
                  </span>
               </div>
               <div className="font-bold text-sm text-white group-hover:text-primary transition-colors">{ticket.subject}</div>
               <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2 text-[10px] text-muted">
                     <Clock className="w-3 h-3" />
                     {ticket.date}
                  </div>
                  <div className={`w-2 h-2 rounded-full ${
                     ticket.priority === 'high' ? 'bg-danger shadow-[0_0_8px_rgba(var(--danger-rgb),0.5)]' : 'bg-secondary'
                  }`}></div>
               </div>
            </div>
         ))}
      </div>

      <div className="bg-primary/5 rounded-2xl p-4 flex items-center gap-4 border border-primary/10">
         <div className="bg-primary p-2 rounded-lg">
            <MessageSquare className="w-4 h-4 text-white" />
         </div>
         <div className="flex-1">
            <div className="text-xs font-bold text-white leading-tight">Live Concierge</div>
            <div className="text-[10px] text-muted leading-tight">Admin is currently online</div>
         </div>
         <button className="text-xs font-black text-primary hover:underline">Chat Now</button>
      </div>

    </div>
  );
}
