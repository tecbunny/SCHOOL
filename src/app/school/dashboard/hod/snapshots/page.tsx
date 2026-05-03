"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  FileText, 
  Activity, 
  Users, 
  ChevronRight, 
  Search,
  Zap,
  CheckCircle2,
  PieChart
} from 'lucide-react';
import { analyticsService } from '@/services/analytics.service';
import { promotionService } from '@/services/promotion.service';

export default function AcademicSnapshotsPage() {
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [classes, setClasses] = useState<any[]>([]);

  useEffect(() => {
    const fetchClasses = async () => {
      const data = await promotionService.getClasses();
      setClasses(data);
    };
    fetchClasses();
  }, []);

  const handleGenerate = async (classId: string) => {
    setIsGenerating(classId);
    try {
      const data = await analyticsService.getClassHealthSnapshot(classId);
      console.log("Generated Snapshot:", data);
      // Simulate PDF generation delay
      await new Promise(r => setTimeout(r, 2000));
    } catch (err) {
      console.error("Generation failed:", err);
    } finally {
      setIsGenerating(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a]">
      {/* Header */}
      <header className="header-glass py-6 px-8 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-lg">
            <PieChart className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Academic Snapshots</h1>
            <p className="text-sm text-muted">Aggregated NEP 2020 competency reports for board review.</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input 
                type="text" 
                placeholder="Search classes..."
                className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:border-primary transition-all"
              />
           </div>
        </div>
      </header>

      <div className="p-8 max-w-5xl mx-auto w-full flex flex-col gap-8">
         
         {/* Summary Banner */}
         <div className="bg-primary/5 border border-primary/20 p-8 rounded-[2.5rem] flex items-center justify-between shadow-2xl relative overflow-hidden group">
            <div className="flex flex-col gap-2 relative z-10">
               <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
                  <Zap className="w-4 h-4" /> AI-Aggregated Insights
               </div>
               <h2 className="text-2xl font-black text-white">Generate HPC Master Reports</h2>
               <p className="text-sm text-muted max-w-md leading-relaxed">
                  Consolidate individual student progress into institutional health snapshots. Ready for printing or digital board submission.
               </p>
            </div>
            <div className="absolute right-0 top-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] group-hover:scale-150 transition-transform duration-700"></div>
            <button className="btn btn-primary px-8 relative z-10">Generate All Sheets</button>
         </div>

         {/* Class Grid */}
         <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center justify-between px-4 mb-2">
               <h3 className="text-xs font-bold text-muted uppercase tracking-widest">School Inventory</h3>
               <span className="text-[10px] text-muted font-bold">Showing 3 Active Classes</span>
            </div>
            
            {classes.map((cls) => (
              <div key={cls.id} className="bg-card border border-white/5 p-6 rounded-3xl flex items-center justify-between group hover:border-primary/20 transition-all">
                 <div className="flex items-center gap-8">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center font-black text-2xl group-hover:text-primary transition-colors">
                       {cls.name.split(' ')[1]}
                    </div>
                    <div>
                       <div className="text-lg font-black text-white">{cls.name}</div>
                       <div className="flex items-center gap-4 text-xs text-muted mt-1">
                          <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {cls.students} Students</span>
                          <span className="w-1 h-1 bg-white/20 rounded-full"></span>
                          <span>Last Sync: {cls.lastGenerated}</span>
                       </div>
                    </div>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="flex -space-x-3 mr-4">
                       {[1,2,3,4].map(i => (
                         <Image
                           key={i}
                           src={`https://i.pravatar.cc/100?img=${i+10}`}
                           width={32}
                           height={32}
                           unoptimized
                           className="w-8 h-8 rounded-full border-2 border-[#0a0a0a]"
                           alt="Student avatar"
                         />
                       ))}
                       <div className="w-8 h-8 rounded-full bg-white/5 border-2 border-[#0a0a0a] flex items-center justify-center text-[10px] font-bold">+{cls.students - 4}</div>
                    </div>
                    <button 
                       onClick={() => handleGenerate(cls.id)}
                       disabled={isGenerating === cls.id}
                       className="btn btn-outline btn-sm px-6 gap-2"
                    >
                       {isGenerating === cls.id ? <Activity className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                       {isGenerating === cls.id ? 'Aggregating...' : 'Export Snapshot'}
                    </button>
                    <button className="p-3 hover:bg-white/5 rounded-2xl text-muted group-hover:text-white transition-colors">
                       <ChevronRight className="w-5 h-5" />
                    </button>
                 </div>
              </div>
            ))}
         </div>

         {/* Compliance Footer */}
         <div className="mt-4 flex items-center justify-center gap-3 py-6 border-t border-white/5 text-muted">
            <CheckCircle2 className="w-4 h-4 text-success" />
            <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">
               All generated reports comply with NEP 2020 Institutional Disclosure Standards.
            </p>
         </div>
      </div>
    </div>
  );
}
