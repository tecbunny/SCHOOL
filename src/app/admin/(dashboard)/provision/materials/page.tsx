"use client";

import { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Search, 
  Globe, 
  FileText, 
  Video, 
  Trash2, 
  CheckCircle2,
  RefreshCw,
  Plus
} from 'lucide-react';
import { createClient } from '@/lib/supabase';

export default function GlobalMaterialsPage() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchMaterials = async () => {
      const { data, error } = await supabase
        .from('global_materials')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error) setMaterials(data);
      setLoading(false);
    };
    fetchMaterials();
  }, [supabase]);

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a]">
      {/* Header */}
      <header className="header-glass py-6 px-8 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-lg">
            <Globe className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Global Material Library</h1>
            <p className="text-sm text-muted">Manage NCERT & Institutional core syllabus modules globally.</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input 
                type="text" 
                placeholder="Search resources..."
                className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:border-primary transition-all w-64"
              />
           </div>
           <button className="btn btn-primary gap-2">
              <Plus className="w-4 h-4" /> Provision New Content
           </button>
        </div>
      </header>

      {/* Grid */}
      <div className="p-8 grid grid-cols-12 gap-8 overflow-y-auto custom-scrollbar">
         
         {/* Categories Sidebar */}
         <div className="col-span-3 flex flex-col gap-2">
            {['All Resources', 'NCERT Textbooks', 'AI Worksheets', 'Reference Videos', 'Syllabus Guides'].map((cat, i) => (
              <button key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${i === 0 ? 'bg-primary/10 text-primary border border-primary/20 shadow-lg' : 'text-muted hover:bg-white/5'}`}>
                 <BookOpen className="w-4 h-4" />
                 {cat}
              </button>
            ))}
         </div>

         {/* Content Area */}
         <div className="col-span-9 flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-6">
               {materials.map((mat) => (
                 <div key={mat.id} className="bg-card border border-white/5 p-6 rounded-3xl hover:border-primary/20 transition-all group relative overflow-hidden">
                    <div className="flex items-center gap-6">
                       <div className="w-20 h-24 bg-white/5 rounded-xl border border-white/5 flex items-center justify-center">
                          {mat.category === 'video' ? <Video className="w-8 h-8 text-secondary" /> : <FileText className="w-8 h-8 text-primary" />}
                       </div>
                       <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                             <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold uppercase">Grade {mat.grade_level}</span>
                             <span className="text-[10px] text-muted font-mono">v{mat.version_code}</span>
                          </div>
                          <h3 className="font-bold text-lg text-white group-hover:text-primary transition-colors">{mat.title}</h3>
                          <p className="text-xs text-muted mt-1">{mat.subject}</p>
                       </div>
                    </div>
                    <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                       <div className="flex items-center gap-2 text-[10px] text-muted font-bold uppercase tracking-widest">
                          <CheckCircle2 className="w-3.5 h-3.5 text-success" /> Provisioned to 42 Schools
                       </div>
                       <button className="text-muted hover:text-danger p-2 transition-colors">
                          <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                 </div>
               ))}
               
               {materials.length === 0 && !loading && (
                 <div className="col-span-2 flex flex-col items-center justify-center p-20 opacity-20 italic">
                    <RefreshCw className="w-12 h-12 mb-4 animate-spin-slow" />
                    <p>No global materials provisioned yet.</p>
                 </div>
               )}
            </div>
         </div>

      </div>
    </div>
  );
}
