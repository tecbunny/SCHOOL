"use client";

import ComplianceHealthMap from '@/features/auditor/ComplianceHealthMap';
import ReportGenerator from '@/features/auditor/ReportGenerator';
import { ShieldCheck, Search, Filter, Calendar } from 'lucide-react';

export default function AuditorDashboard() {
  return (
    <div className="flex flex-col h-full bg-[#0a0a0a]">
      {/* Header */}
      <header className="header-glass py-6 px-8 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-lg">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Auditor Control Panel</h1>
            <p className="text-sm text-muted">Government & Board Compliance Monitoring Portal.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <button className="btn btn-outline btn-sm gap-2"><Calendar className="w-4 h-4" /> Academic Year 2026-27</button>
           <button className="btn btn-primary btn-sm">Sign Audit Log</button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-[1600px] mx-auto flex flex-col gap-8">
          
          {/* Top Actions Bar */}
          <div className="flex gap-4">
             <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input 
                  type="text" 
                  placeholder="Search across school departments, staff, or grade levels..." 
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-primary transition-colors text-sm"
                />
             </div>
             <button className="btn btn-outline gap-2"><Filter className="w-4 h-4" /> Advanced Filters</button>
          </div>

          <div className="grid grid-cols-12 gap-8">
             {/* Left Column: Health Map */}
             <div className="col-span-9">
                <ComplianceHealthMap />
             </div>

             {/* Right Column: Reporting & Actions */}
             <div className="col-span-3 flex flex-col gap-6">
                <ReportGenerator />
                
                <div className="bg-card border border-white/5 rounded-2xl p-6">
                   <h3 className="text-sm font-bold uppercase tracking-widest text-muted mb-4">Inspection History</h3>
                   <div className="flex flex-col gap-4">
                      {[
                        { date: 'Apr 12, 2026', type: 'Surprise Audit', result: 'Pass' },
                        { date: 'Mar 02, 2026', type: 'Annual Review', result: 'Pass' },
                        { date: 'Feb 15, 2026', type: 'Health & Safety', result: 'Caution' },
                      ].map((log, i) => (
                        <div key={i} className="flex justify-between items-center text-xs">
                           <div className="flex flex-col">
                              <span className="font-bold text-white">{log.type}</span>
                              <span className="text-muted text-[10px]">{log.date}</span>
                           </div>
                           <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${log.result === 'Pass' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`}>
                              {log.result}
                           </span>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>

        </div>
      </main>
    </div>
  );
}
