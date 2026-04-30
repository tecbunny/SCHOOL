"use client";

import { 
  Calendar, 
  Megaphone, 
  Clock, 
  BookOpen, 
  ChevronRight,
  Sparkles
} from 'lucide-react';

export default function StudentDesk() {
  const announcements = [
    { id: 1, title: 'Annual Science Fair', date: 'Today', priority: 'high' },
    { id: 2, title: 'Holiday on Friday', date: 'Yesterday', priority: 'medium' },
  ];

  const timetable = [
    { time: '09:00 AM', subject: 'Mathematics', room: 'Lab 1', active: true },
    { time: '10:00 AM', subject: 'Physics', room: 'Room 204', active: false },
    { time: '11:00 AM', subject: 'Library Hour', room: 'Main Hall', active: false },
  ];

  return (
    <div className="grid grid-cols-12 gap-6 h-full p-2">
      
      {/* Current Session Widget */}
      <div className="col-span-8 bg-gradient-to-br from-primary/20 to-secondary/10 border border-white/10 rounded-[2rem] p-8 relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-all duration-700 rotate-12">
            <Sparkles className="w-48 h-48" />
         </div>
         
         <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
               <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md">
                  <Clock className="w-6 h-6 text-primary" />
               </div>
               <span className="text-sm font-bold uppercase tracking-widest text-primary/80">Ongoing Session</span>
            </div>
            
            <h2 className="text-4xl font-black text-white mb-2">Introduction to Calculus</h2>
            <p className="text-lg text-muted mb-8">Professor James Wilson • Room 402B</p>
            
            <div className="flex gap-4">
               <button className="bg-white text-black px-8 py-4 rounded-2xl font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-xl">
                  Open Session Notes
               </button>
               <button className="bg-white/5 border border-white/10 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white/10 transition-all">
                  Join Chat
               </button>
            </div>
         </div>
      </div>

      {/* Announcements Widget */}
      <div className="col-span-4 bg-card border border-white/5 rounded-[2rem] p-6 flex flex-col">
         <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
               <Megaphone className="w-5 h-5 text-secondary" />
               <h3 className="font-bold text-lg">Announcements</h3>
            </div>
            <span className="text-xs text-muted">View All</span>
         </div>
         
         <div className="flex flex-col gap-4 overflow-y-auto custom-scrollbar">
            {announcements.map((item) => (
               <div key={item.id} className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-secondary/30 transition-all cursor-pointer group">
                  <div className="flex justify-between items-start mb-1">
                     <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${item.priority === 'high' ? 'bg-danger/20 text-danger' : 'bg-secondary/20 text-secondary'}`}>
                        {item.priority}
                     </span>
                     <span className="text-[10px] text-muted">{item.date}</span>
                  </div>
                  <div className="font-bold text-white group-hover:text-secondary transition-colors">{item.title}</div>
               </div>
            ))}
         </div>
      </div>

      {/* Timetable Horizontal List */}
      <div className="col-span-12 bg-white/[0.02] border border-white/5 rounded-[2rem] p-6">
         <div className="flex items-center gap-3 mb-6 px-2">
            <Calendar className="w-5 h-5 text-muted" />
            <h3 className="font-bold">Today's Schedule</h3>
         </div>
         
         <div className="grid grid-cols-4 gap-4">
            {timetable.map((slot, i) => (
               <div key={i} className={`p-6 rounded-3xl border transition-all ${slot.active ? 'bg-primary/10 border-primary shadow-lg scale-105' : 'bg-white/5 border-white/5'}`}>
                  <div className="text-xs font-bold text-muted mb-1">{slot.time}</div>
                  <div className={`text-lg font-bold ${slot.active ? 'text-primary' : 'text-white'}`}>{slot.subject}</div>
                  <div className="text-xs text-muted mt-2 flex items-center gap-1">
                     <BookOpen className="w-3 h-3" /> {slot.room}
                  </div>
               </div>
            ))}
            <div className="p-6 rounded-3xl border border-dashed border-white/10 flex items-center justify-center text-muted text-sm italic">
               End of Day
            </div>
         </div>
      </div>

    </div>
  );
}
