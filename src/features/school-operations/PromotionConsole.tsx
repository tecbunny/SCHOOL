"use client";

import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Lock, 
  Unlock, 
  Users, 
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { promotionService } from '@/services/promotion.service';

export default function PromotionConsole() {
  const [isOpen, setIsOpen] = useState<boolean | null>(null);
  const [isPromoting, setIsPromoting] = useState<string | null>(null);
  const [classes, setClasses] = useState<any[]>([]);

  useEffect(() => {
    const init = async () => {
      const [status, classData] = await Promise.all([
        promotionService.getPromotionStatus(),
        promotionService.getClasses()
      ]);
      setIsOpen(status);
      setClasses(classData);
    };
    init();
  }, []);

  const handlePromote = async (classId: string, currentGrade: string) => {
    setIsPromoting(classId);
    try {
      const nextGrade = (parseInt(currentGrade) + 1).toString();
      await promotionService.promoteClass(classId, nextGrade);
      setClasses(prev => prev.filter(c => c.id !== classId));
    } catch (err) {
      console.error("Promotion failed:", err);
    } finally {
      setIsPromoting(null);
    }
  };

  if (isOpen === null) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="bg-card border border-white/5 rounded-[2.5rem] p-8 flex flex-col gap-8 shadow-2xl overflow-hidden relative">
      
      {/* Promotion Status Banner */}
      <div className={`flex items-center gap-4 p-6 rounded-3xl border ${
        isOpen 
          ? 'bg-success/10 border-success/20 text-success' 
          : 'bg-danger/10 border-danger/20 text-danger'
      }`}>
        <div className={`p-3 rounded-2xl ${isOpen ? 'bg-success/20' : 'bg-danger/20'}`}>
          {isOpen ? <Unlock className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
        </div>
        <div>
          <h3 className="text-lg font-black">{isOpen ? 'Academic Window Open' : 'Promotion Window Closed'}</h3>
          <p className="text-sm opacity-70">
            {isOpen 
              ? 'Super Admin has authorized class-wide student promotions.' 
              : 'The platform administrator has restricted academic rollovers.'}
          </p>
        </div>
      </div>

      {!isOpen ? (
        <div className="flex flex-col items-center justify-center py-12 text-center gap-4 opacity-50">
           <AlertTriangle className="w-16 h-16 text-muted" />
           <div className="max-w-xs">
              <h4 className="text-xl font-bold text-white">Promotion Restricted</h4>
              <p className="text-sm text-muted mt-2">Accidental promotion is prevented during the term. Please contact the platform admin to open the window.</p>
           </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
           <div className="flex items-center justify-between px-2">
              <h4 className="text-xs font-bold text-muted uppercase tracking-widest">Available for Promotion</h4>
              <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold">AY {new Date().getFullYear()}-{ (new Date().getFullYear() + 1).toString().slice(-2) }</span>
           </div>
           
           <div className="flex flex-col gap-3">
              {classes.map((cls) => (
                <div key={cls.id} className="p-6 bg-white/5 border border-white/5 rounded-3xl hover:border-primary/20 transition-all flex items-center justify-between group">
                   <div className="flex items-center gap-6">
                      <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center font-black text-xl">
                         {cls.grade}
                      </div>
                      <div>
                         <div className="text-lg font-bold text-white group-hover:text-primary transition-colors">{cls.name}</div>
                         <div className="flex items-center gap-3 text-xs text-muted mt-1">
                            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {cls.students} Students</span>
                            <span className="w-1 h-1 bg-white/20 rounded-full"></span>
                            <span className="text-success font-bold">HPC Verified</span>
                         </div>
                      </div>
                   </div>
                   <button 
                      onClick={() => handlePromote(cls.id, cls.grade)}
                      disabled={isPromoting === cls.id}
                      className="btn btn-primary btn-sm px-6 gap-2"
                   >
                      {isPromoting === cls.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
                      Promote to Grade {parseInt(cls.grade) + 1}
                   </button>
                </div>
              ))}
           </div>
        </div>
      )}

      {/* Audit Footnote */}
      <div className="text-[10px] text-muted text-center italic mt-4">
         All promotions are cryptographically logged for institutional audit trails.
      </div>

    </div>
  );
}
