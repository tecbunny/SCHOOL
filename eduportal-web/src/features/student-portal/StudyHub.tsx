"use client";

import { 
  BookOpen, 
  Download, 
  CheckCircle, 
  FileText, 
  Video, 
  Search,
  CloudOff,
  ExternalLink
} from 'lucide-react';
import { useState } from 'react';

export default function StudyHub() {
  const [searchTerm, setSearchTerm] = useState('');

  const materials = [
    { id: 1, title: 'Calculus Basics', type: 'pdf', subject: 'Math', cached: true, size: '2.4 MB' },
    { id: 2, title: 'Introduction to Mechanics', type: 'video', subject: 'Physics', cached: false, size: '45 MB' },
    { id: 3, title: 'Organic Chemistry Vol 1', type: 'pdf', subject: 'Chemistry', cached: true, size: '12 MB' },
    { id: 4, title: 'Cell Theory Presentation', type: 'pdf', subject: 'Biology', cached: false, size: '5.1 MB' },
  ];

  return (
    <div className="flex flex-col gap-8 h-full">
      
      {/* Search and Offline Status */}
      <div className="flex items-center gap-6">
         <div className="relative flex-1">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-muted" />
            <input 
               type="text" 
               placeholder="Search materials, books, or notes..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full bg-card border border-white/10 rounded-[2rem] pl-16 pr-8 py-5 text-lg outline-none focus:border-primary transition-all shadow-xl"
            />
         </div>
         <div className="flex items-center gap-3 bg-white/5 border border-white/5 px-6 py-5 rounded-[2rem]">
            <CloudOff className="w-5 h-5 text-warning" />
            <div>
               <div className="text-[10px] font-bold text-muted uppercase">Offline Mode</div>
               <div className="text-sm font-bold text-white">12 Files Ready</div>
            </div>
         </div>
      </div>

      {/* Categories Horizontal */}
      <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar no-scrollbar">
         {['All', 'Math', 'Physics', 'Chemistry', 'Biology', 'English', 'History'].map((cat) => (
            <button 
               key={cat} 
               className={`px-8 py-3 rounded-2xl font-bold text-sm whitespace-nowrap border transition-all ${cat === 'All' ? 'bg-primary border-primary text-white shadow-lg' : 'bg-white/5 border-white/5 text-muted hover:bg-white/10'}`}
            >
               {cat}
            </button>
         ))}
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-2 gap-6 overflow-y-auto custom-scrollbar p-2">
         {materials.map((m) => (
            <div key={m.id} className="bg-card border border-white/10 rounded-[2.5rem] p-6 flex items-center gap-6 group hover:border-primary/30 transition-all cursor-pointer shadow-xl relative overflow-hidden">
               
               {/* Decorative Background */}
               <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-all">
                  {m.type === 'pdf' ? <FileText className="w-24 h-24" /> : <Video className="w-24 h-24" />}
               </div>

               <div className={`p-5 rounded-3xl ${m.type === 'pdf' ? 'bg-danger/10 text-danger' : 'bg-secondary/10 text-secondary'}`}>
                  {m.type === 'pdf' ? <FileText className="w-8 h-8" /> : <Video className="w-8 h-8" />}
               </div>

               <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-xl text-white truncate mb-1">{m.title}</h4>
                  <div className="flex items-center gap-3 text-xs text-muted font-bold uppercase tracking-widest">
                     <span>{m.subject}</span>
                     <span>•</span>
                     <span>{m.size}</span>
                  </div>
               </div>

               <div className="flex items-center gap-3">
                  {m.cached ? (
                     <div className="flex items-center gap-1.5 text-success font-bold text-xs bg-success/10 px-4 py-2 rounded-xl">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Downloaded
                     </div>
                  ) : (
                     <button className="p-3 bg-white/5 hover:bg-primary/20 hover:text-primary rounded-2xl transition-all">
                        <Download className="w-6 h-6" />
                     </button>
                  )}
                  <button className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all">
                     <ExternalLink className="w-6 h-6 text-muted" />
                  </button>
               </div>
            </div>
         ))}
      </div>

    </div>
  );
}
