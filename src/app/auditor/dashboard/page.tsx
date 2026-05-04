"use client";

import ComplianceHealthMap from '@/features/auditor/ComplianceHealthMap';
import ReportGenerator from '@/features/auditor/ReportGenerator';
import { ShieldCheck, Search, Filter, Calendar, Activity, FileText, Award, ArrowRight } from 'lucide-react';

export default function AuditorDashboard() {
  return (
    <div className="flex-1 flex flex-col h-full bg-[#070B19] relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-success/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <header className="header-glass py-6 px-10 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <div className="bg-success/10 p-3 rounded-2xl border border-success/20">
            <ShieldCheck className="w-8 h-8 text-success" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-white">Auditor Control Panel</h1>
            <p className="text-xs text-muted font-bold uppercase tracking-[0.3em] mt-1.5 opacity-60">Board Compliance Monitoring Surface</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           <button className="btn btn-outline py-3 px-6 gap-3 rounded-2xl text-xs">
              <Calendar className="w-4 h-4 text-success" /> AY 2026-27
           </button>
           <button className="btn btn-primary py-3 px-8 rounded-2xl shadow-premium bg-success border-success hover:shadow-success/20">
              Sign Audit Log
           </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-10 custom-scrollbar relative z-10">
        <div className="max-w-[1600px] mx-auto flex flex-col gap-10">
          
          {/* Action Row */}
          <div className="flex gap-6">
             <div className="relative flex-1 group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted group-focus-within:text-success transition-colors" />
                <input 
                  type="text" 
                  placeholder="Query global departments, staff credentials, or NEP health scores..." 
                  className="w-full bg-white/5 border border-white/10 rounded-3xl pl-14 pr-6 py-4 outline-none focus:border-success/50 focus:bg-white/[0.08] transition-all text-sm font-bold text-white shadow-inner"
                />
             </div>
             <button className="btn btn-outline py-4 px-8 rounded-3xl gap-3 border-white/10 hover:border-success/30">
                <Filter className="w-5 h-5 text-muted" /> <span className="text-xs uppercase tracking-widest">Advanced Filters</span>
             </button>
          </div>

          <div className="grid grid-cols-12 gap-10">
             
             {/* Main Analytics Hub */}
             <div className="col-span-12 lg:col-span-9 flex flex-col gap-8">
                <div className="glass-card rounded-[3rem] p-10 overflow-hidden relative group">
                   <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Activity className="w-64 h-64 text-success" />
                   </div>
                   <div className="relative z-10">
                      <div className="flex justify-between items-center mb-8">
                         <h3 className="text-xl font-black text-white uppercase tracking-widest">Compliance Health Map</h3>
                         <div className="flex gap-4">
                            <div className="px-4 py-2 rounded-full bg-success/10 border border-success/20 text-[10px] font-black text-success">REAL-TIME SYNC</div>
                         </div>
                      </div>
                      <ComplianceHealthMap />
                   </div>
                </div>

                <div className="grid grid-cols-3 gap-8">
                   {[
                     { label: 'Annual Reviews', count: '12', icon: FileText, color: 'text-primary' },
                     { label: 'Active Alerts', count: '02', icon: Activity, color: 'text-danger' },
                     { label: 'Certifications', count: '08', icon: Award, color: 'text-success' },
                   ].map((card, i) => (
                     <div key={i} className="glass-card p-8 rounded-[2.5rem] hover:bg-white/5 transition-all">
                        <div className={`p-3 rounded-2xl bg-white/5 border border-white/10 w-fit mb-6 ${card.color}`}>
                           <card.icon className="w-6 h-6" />
                        </div>
                        <div className="text-3xl font-black text-white mb-1 tracking-tighter">{card.count}</div>
                        <div className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">{card.label}</div>
                     </div>
                   ))}
                </div>
             </div>

             {/* Sidebar Actions */}
             <div className="col-span-12 lg:col-span-3 flex flex-col gap-8">
                <div className="animate-fade-in-up">
                   <ReportGenerator />
                </div>
                
                <div className="glass-card rounded-[3rem] p-8 border-white/5">
                   <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white">Inspection Ledger</h3>
                      <ArrowRight className="w-4 h-4 text-muted" />
                   </div>
                   <div className="flex flex-col gap-6">
                      {[
                        { date: 'Apr 12, 2026', type: 'Surprise Audit', result: 'Pass', score: '98' },
                        { date: 'Mar 02, 2026', type: 'Annual Review', result: 'Pass', score: '94' },
                        { date: 'Feb 15, 2026', type: 'Health & Safety', result: 'Caution', score: '72' },
                      ].map((log, i) => (
                        <div key={i} className="flex flex-col gap-3 group">
                           <div className="flex justify-between items-start">
                              <div>
                                 <span className="text-[13px] font-black text-white group-hover:text-success transition-colors">{log.type}</span>
                                 <p className="text-[10px] text-muted font-bold uppercase tracking-widest mt-1">{log.date}</p>
                              </div>
                              <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${log.result === 'Pass' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                                 {log.result}
                              </span>
                           </div>
                           <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                              <div className={`h-full ${log.result === 'Pass' ? 'bg-success' : 'bg-warning'}`} style={{ width: `${log.score}%` }}></div>
                           </div>
                        </div>
                      ))}
                   </div>
                   <button className="w-full btn btn-outline mt-8 py-3 rounded-2xl text-[10px] font-black tracking-widest border-white/5">
                      VIEW FULL HISTORY
                   </button>
                </div>
             </div>

          </div>

        </div>
      </main>

    </div>
  );
}
