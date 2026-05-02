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
import { useState, useEffect } from 'react';
import { analyticsService } from '@/services/analytics.service';
import { createClient } from '@/lib/supabase';

const MATERIALS_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'school-files';

export default function StudyHub() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from('profiles')
          .select('school_id')
          .eq('id', user.id)
          .single();

        if (profile) {
          const data = await analyticsService.getMaterials(profile.school_id, selectedSubject);
          setMaterials(data);
        }
      } catch (err) {
        console.error("Fetch Materials Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMaterials();
  }, [selectedSubject]);

  const filteredMaterials = materials.filter(m => 
    m.file_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getMaterialUrl = (fileUrl: string) => {
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
      return fileUrl;
    }

    return supabase.storage.from(MATERIALS_BUCKET).getPublicUrl(fileUrl).data.publicUrl;
  };

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
               <div className="text-sm font-bold text-white">{materials.filter(m => m.is_ai_indexed).length} Files Ready</div>
            </div>
         </div>
      </div>

      {/* Categories Horizontal */}
      <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar no-scrollbar">
         {['All', 'Math', 'Physics', 'Chemistry', 'Biology', 'English', 'History'].map((cat) => (
            <button 
               key={cat} 
               onClick={() => setSelectedSubject(cat)}
               className={`px-8 py-3 rounded-2xl font-bold text-sm whitespace-nowrap border transition-all ${selectedSubject === cat ? 'bg-primary border-primary text-white shadow-lg' : 'bg-white/5 border-white/5 text-muted hover:bg-white/10'}`}
            >
               {cat}
            </button>
         ))}
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-2 gap-6 overflow-y-auto custom-scrollbar p-2">
         {filteredMaterials.length > 0 ? filteredMaterials.map((m) => (
            <div key={m.id} className="bg-card border border-white/10 rounded-[2.5rem] p-6 flex items-center gap-6 group hover:border-primary/30 transition-all cursor-pointer shadow-xl relative overflow-hidden">
               
               {/* Decorative Background */}
               <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-all">
                  {m.material_type === 'pdf' ? <FileText className="w-24 h-24" /> : <Video className="w-24 h-24" />}
               </div>

               <div className={`p-5 rounded-3xl ${m.material_type === 'pdf' ? 'bg-danger/10 text-danger' : 'bg-secondary/10 text-secondary'}`}>
                  {m.material_type === 'pdf' ? <FileText className="w-8 h-8" /> : <Video className="w-8 h-8" />}
               </div>

               <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-xl text-white truncate mb-1">{m.file_name}</h4>
                  <div className="flex items-center gap-3 text-xs text-muted font-bold uppercase tracking-widest">
                     <span>{m.subject}</span>
                     <span>•</span>
                     <span>{m.material_type}</span>
                  </div>
               </div>

               <div className="flex items-center gap-3">
                  {m.is_ai_indexed ? (
                     <div className="flex items-center gap-1.5 text-success font-bold text-xs bg-success/10 px-4 py-2 rounded-xl">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Cached
                     </div>
                  ) : (
                     <button
                        type="button"
                        onClick={() => window.open(getMaterialUrl(m.file_url), '_blank', 'noopener,noreferrer')}
                        className="p-3 bg-white/5 hover:bg-primary/20 hover:text-primary rounded-2xl transition-all"
                     >
                        <Download className="w-6 h-6" />
                     </button>
                  )}
               </div>
            </div>
         )) : (
            <div className="col-span-2 flex flex-col items-center justify-center text-muted py-20 gap-4">
               <BookOpen className="w-16 h-16 opacity-10" />
               <p className="font-bold uppercase tracking-[0.2em]">No Materials Found</p>
            </div>
         )}
      </div>

    </div>
  );
}
