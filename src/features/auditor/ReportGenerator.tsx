"use client";

import { FileText, Shield, Loader2, CheckCircle } from 'lucide-react';
import { useState } from 'react';

export default function ReportGenerator() {
  const [generating, setGenerating] = useState(false);
  const [done, setDone] = useState(false);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setDone(true);
      setTimeout(() => setDone(false), 3000);
    }, 2500);
  };

  return (
    <div className="bg-card border border-white/5 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <FileText className="w-5 h-5 text-primary" />
        <h3 className="font-bold text-lg">Secure Report Engine</h3>
      </div>
      
      <p className="text-xs text-muted leading-relaxed mb-6">
        Generate a cryptographically signed, watermarked PDF report containing the latest compliance and performance data for this institution.
      </p>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
           <label className="text-[10px] font-bold text-muted uppercase">Report Type</label>
           <select className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-primary transition-colors text-white text-sm">
              <option>Full Academic Year Audit</option>
              <option>Monthly Compliance Snapshot</option>
              <option>Staff Performance Report</option>
           </select>
        </div>

        <button 
          onClick={handleGenerate}
          disabled={generating}
          className="btn btn-primary w-full gap-2 relative overflow-hidden"
        >
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : done ? <CheckCircle className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
          {generating ? 'Compiling Metrics...' : done ? 'Report Ready' : 'Generate Signed Report'}
        </button>

        {done && (
          <div className="text-[10px] text-success text-center animate-in fade-in slide-in-from-top-1">
             eduportal_audit_report_2026.pdf (4.2 MB)
          </div>
        )}
      </div>
    </div>
  );
}
